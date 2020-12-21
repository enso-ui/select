<script>
import { debounce } from 'lodash';
import Modes from '@enso-ui/search-mode/src/modes';

export default {

    name: 'CoreSelect',

    props: {
        customParams: {
            type: Object,
            default: null,
        },
        debounce: {
            type: Number,
            default: 300,
        },
        disableClear: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        errorHandler: {
            type: Function,
            default: (error) => {
                throw error;
            },
        },
        i18n: {
            type: Function,
            default: (v) => v,
        },
        label: {
            type: String,
            default: 'name',
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        objects: {
            type: Boolean,
            default: false,
        },
        options: {
            type: Array,
            default: () => ([]),
        },
        paginate: {
            type: Number,
            default: 100,
        },
        params: {
            type: Object,
            default: null,
        },
        pivotParams: {
            type: Object,
            default: null,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        searchLimit: {
            type: Number,
            default: 10,
        },
        searchMode: {
            type: String,
            default: 'full',
            validator: (v) => Modes.includes(v),
        },
        searchModes: {
            type: Array,
            default: () => ['full'],
            validator: (v) => v.every((mode) => Modes.includes(mode)),
        },
        source: {
            type: String,
            default: null,
        },
        taggable: {
            type: Boolean,
            default: false,
        },
        trackBy: {
            type: String,
            default: 'id',
        },
        translated: {
            type: Boolean,
            default: false,
        },
        value: {
            type: null,
            required: true,
        },
    },

    data: (v) => ({
        allowsSelection: true,
        internalValue: null,
        loading: false,
        mode: v.searchMode,
        ongoingRequest: null,
        optionList: v.options,
        query: '',
    }),

    computed: {
        canAddTag() {
            return this.taggable && this.allowsSelection
                && !!this.query && !this.loading && this.queryDoesntMatch;
        },
        clearControl() {
            return !this.disableClear && !this.readonly && !this.disabled
                && !this.loading && this.hasSelection;
        },
        filteredOptions() {
            return this.query && !this.serverSide
                ? this.optionList.filter((option) => this.matchesQuery(option))
                : this.optionList;
        },
        hasFilteredOptions() {
            return this.filteredOptions.length > 0;
        },
        hasOptions() {
            return this.optionList.length > 0;
        },
        hasSelection() {
            return this.multiple
                ? this.value.length > 0
                : this.value !== null;
        },
        modeSelector() {
            return this.searchModes.length > 1;
        },
        needsSearch() {
            return this.serverSide || this.optionList.length >= this.searchLimit;
        },
        noResults() {
            return !!this.query && !this.loading && !this.hasFilteredOptions;
        },
        queryDoesntMatch() {
            return !this.filteredOptions
                .some((option) => `${this.displayLabel(option)}`
                    .toLowerCase() === this.query.toLowerCase());
        },
        selection() {
            return this.multiple
                ? this.optionList.filter((option) => this.value
                    .some((val) => this.valueMatchesOption(val, option)))
                : this.optionList
                    .find((option) => this.valueMatchesOption(this.value, option)) || null;
        },
        serverSide() {
            return this.source !== null;
        },
        dropdownDisabled() {
            return this.readonly || this.disabled
                || !this.hasOptions && !this.query && !this.taggable;
        },
    },

    watch: {
        customParams: {
            handler() {
                this.allowsSelection = false;
                this.fetch();
            },
            deep: true,
        },
        options: {
            handler(options) {
                this.optionList = options;
            },
            deep: true,
        },
        params: {
            handler() {
                this.allowsSelection = false;
                this.fetch();
            },
            deep: true,
        },
        pivotParams: {
            handler() {
                this.allowsSelection = false;
                this.fetch();
            },
            deep: true,
        },
        query: 'fetchIfServerSide',
        selection() {
            this.$emit('selection', this.selection);
        },
        source() {
            this.optionList = this.options;
            this.fetchIfServerSide();
        },
        value(value) {
            if (JSON.stringify(this.internalValue) !== JSON.stringify(value)) {
                this.$emit('input', value);
            }
            this.internalValue = null;
            if (this.query) {
                this.fetchIfServerSide();
            }
        },
    },

    created() {
        this.init();
    },

    methods: {
        addTag() {
            if (this.taggable) {
                this.$emit('add-tag', this.query);
            }
        },
        bold(label, arg) {
            let from;

            try {
                from = new RegExp(`(${arg})`, 'gi');
            } catch {
                from = arg;
            }

            return `${label}`.replace(from, '<b>$1</b>');
        },
        clear() {
            this.update(this.multiple ? [] : null);
            this.$emit('clear');
        },
        deselect(value) {
            const index = this.value
                .findIndex((val) => val === value[this.trackBy]);

            this.value.splice(index, 1);
            this.update(this.value);
            this.$emit('deselect', value);
        },
        displayLabel(option) {
            if (!option) {
                return null;
            }

            const displayLabel = this.label.split('.')
                .reduce((result, property) => result[property], option);

            return this.translated
                ? this.i18n(displayLabel)
                : displayLabel;
        },
        fetch() {
            if (this.ongoingRequest) {
                this.ongoingRequest.cancel();
            }

            this.ongoingRequest = axios.CancelToken.source();
            this.loading = true;

            axios.get(this.source, {
                params: this.requestParams(),
                cancelToken: this.ongoingRequest.token,
            }).then(({ data }) => {
                this.processOptions(data);
                this.$emit('fetch', this.optionList);
                this.allowsSelection = true;
                this.loading = false;
            }).catch((error) => {
                this.loading = false;
                if (!axios.isCancel(error)) {
                    this.errorHandler(error);
                }
            });
        },
        fetchIfServerSide() {
            if (this.serverSide) {
                this.allowsSelection = false;
                this.fetch();
            }
        },
        handleMultipleSelection(option) {
            const index = this.value
                .findIndex((val) => this.valueMatchesOption(val, option));

            this.updateMultipleSelection(index, option);
            this.update(this.value);
        },
        handleSingleSelection(option) {
            this.reset();

            const selection = this.valueMatchesOption(this.value, option);

            if (!selection) {
                this.update(this.optionValue(option));
                this.$emit('select', this.objects ? option : option[this.trackBy]);
                return;
            }

            if (!this.disableClear) {
                this.update(null);
                this.$emit('deselect', this.objects ? option : option[this.trackBy]);
            }
        },
        highlight(label) {
            return this.query.toLowerCase().split(' ')
                .filter((arg) => arg !== '')
                .reduce((label, arg) => this.bold(label, arg), label);
        },
        init() {
            this.fetch = debounce(this.fetch, this.debounce);
            this.addTag = debounce(this.addTag, 1000);
            this.fetchIfServerSide();
        },
        isSelected(option) {
            return this.multiple
                ? this.value.some((val) => this.valueMatchesOption(val, option))
                : this.valueMatchesOption(this.value, option);
        },
        matchesQuery(option) {
            const label = this.displayLabel(option);

            return this.query.toLowerCase().split(' ')
                .filter((arg) => arg !== '')
                .every((arg) => `${label}`.toLowerCase().indexOf(arg) >= 0);
        },
        optionValue(option) {
            return this.objects
                ? option
                : option[this.trackBy];
        },
        processOptions(options) {
            this.optionList = options;

            if (!this.query && this.hasSelection) {
                this.updateSelection();
            }
        },
        reload() {
            if (!this.hasOptions && !this.readonly && !this.disabled) {
                this.fetch();
            }
        },
        requestParams() {
            const params = {
                paginate: this.paginate,
                query: this.query,
                searchMode: this.mode,
                trackBy: this.trackBy,
                value: this.requestValue(),
            };

            ['customParams', 'params', 'pivotParams']
                .filter((key) => this[key] && Object.keys(this[key]).length > 0)
                .forEach((key) => (params[key] = this[key]));

            return params;
        },
        requestValue() {
            if (!this.objects) {
                return this.value;
            }

            return this.multiple
                ? this.value.map((value) => value[this.trackBy])
                : this.value[this.trackBy];
        },
        reset() {
            this.query = '';
        },
        select(index) {
            if (!this.allowsSelection) {
                return;
            }

            const option = this.filteredOptions[index];

            if (this.multiple) {
                this.handleMultipleSelection(option);
                return;
            }

            this.handleSingleSelection(option);
        },
        update(value) {
            this.internalValue = value;
            this.$emit('input', value);
            this.$emit('update');
        },
        updateSelection() {
            const value = this.multiple
                ? this.valuesWhithinOptions()
                : this.valueWhithinOptions();

            if (JSON.stringify(value) !== JSON.stringify(this.value)) {
                this.update(value);
            }
        },
        valueMatchesOption(value, option) {
            return value !== null && this.objects
                ? `${value[this.trackBy]}` === `${option[this.trackBy]}`
                : `${value}` === `${option[this.trackBy]}`;
        },
        valuesWhithinOptions() {
            return this.value.filter((val) => this.optionList
                .some((option) => this.valueMatchesOption(val, option)));
        },
        valueWhithinOptions() {
            return this.optionList
                .some((option) => this.valueMatchesOption(this.value, option))
                ? this.value
                : null;
        },
        updateMultipleSelection(index, option) {
            if (index >= 0) {
                this.value.splice(index, 1);
                this.$emit('deselect', this.objects ? option : option[this.trackBy]);
                return;
            }

            this.value.push(this.optionValue(option));
            this.$emit('select', this.objects ? option : option[this.trackBy]);
        },
    },

    render() {
        return this.$scopedSlots.default({
            allowsSelection: this.allowsSelection,
            canAddTag: this.canAddTag,
            clearControl: this.clearControl,
            clearEvents: {
                click: (e) => {
                    this.clear();
                    e.stopPropagation();
                },
            },
            disableClear: this.disableClear,
            disabled: this.disabled,
            displayLabel: this.displayLabel,
            dropdownDisabled: this.dropdownDisabled,
            filterBindings: { value: this.query },
            filterEvents: {
                input: (e) => (this.query = e.target.value),
                click: (e) => e.stopPropagation(),
                keydown: (e) => {
                    if (e.key === 'Enter' && this.taggable && !this.hasOptions && this.query) {
                        this.addTag();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                },
            },
            hasOptions: this.hasFilteredOptions,
            hasSelection: this.hasSelection,
            highlight: this.highlight,
            i18n: this.i18n,
            isSelected: this.isSelected,
            itemEvents: (index) => ({
                select: () => this.select(index),
            }),
            loading: this.loading,
            multiple: this.multiple,
            needsSearch: this.needsSearch,
            noResults: this.noResults,
            options: this.filteredOptions,
            query: this.query,
            reload: this.reload,
            reset: this.reset,
            modeBindings: {
                modes: this.searchModes,
                query: this.query,
                value: this.mode,
            },
            modeEvents: {
                input: (event) => (this.mode = event),
                change: this.fetch,
            },
            modeSelector: this.modeSelector,
            select: this.select,
            selected: this.selected,
            selection: this.selection,
            selectionBindings: (value) => ({
                disabled: this.disabled || this.readonly,
                label: this.displayLabel(value),
            }),
            selectionEvents: (value) => ({
                deselect: () => this.deselect(value),
            }),
            taggable: this.taggable,
            taggableBindings: {
                index: 0,
                selected: false,
            },
            taggableEvents: { select: this.addTag },
            trackBy: this.trackBy,
        });
    },
};
</script>
