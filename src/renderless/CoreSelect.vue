<script>
import debounce from 'lodash/debounce';

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
            default: v => v,
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

    data: () => ({
        allowsSelection: true,
        internalValue: null,
        loading: false,
        ongoingRequest: null,
        optionList: [],
        dropdownDisabled: null,
        query: '',
    }),

    computed: {
        canAddTag() {
            return this.taggable && this.allowsSelection && !!this.query && !this.loading
                && (!this.hasSelection || this.filteredOptionsEqualsSelection);
        },
        clearControl() {
            return !this.disableClear && !this.readonly && !this.disabled
                && !this.loading && this.hasSelection;
        },
        filteredOptionsEqualsSelection() {
            return !this.multiple && this.filteredOptions.length === 1
                || this.multiple && this.value.length === this.filteredOptions.length;
        },
        filteredOptions() {
            return this.query && !this.serverSide
                ? this.optionList.filter(option => this.matchesQuery(option))
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
        needsSearch() {
            return this.serverSide || this.optionList.length > 10;
        },
        noResults() {
            return !!this.query && !this.loading && !this.hasFilteredOptions;
        },
        selection() {
            return this.multiple
                ? this.optionList.filter(option => this.value
                    .some(val => this.valueMatchesOption(val, option)))
                : this.optionList
                    .find(option => this.valueMatchesOption(this.value, option)) || null;
        },
        serverSide() {
            return this.source !== null;
        },
        shouldDisableDropdown() {
            return this.readonly || this.disabled
                || this.options.length === 0 && !this.query;
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
            handler: 'updateOptionList',
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
        source: {
            handler() {
                this.updateOptionList(this.options);
                this.fetchIfServerSide();
            },
        },
        value(value) {
            if (JSON.stringify(this.internalValue) !== JSON.stringify(value)) {
                this.$emit('input', value);
            }

            this.internalValue = null;
            this.$emit('selection', this.selection);

            if (this.query) {
                this.fetchIfServerSide();
            }
        },
    },

    created() {
        this.init();
        this.updateOptionList(this.options);
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
                .findIndex(val => val === value[this.trackBy]);

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

            axios.get(
                this.source, {
                    params: this.requestParams(),
                    cancelToken: this.ongoingRequest.token,
                },
            ).then(({ data }) => {
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
                .findIndex(val => this.valueMatchesOption(val, option));

            this.updateMultipleSelection(index, option);
            this.update(this.value);
        },
        handleSingleSelection(option) {
            this.reset();

            const selection = this.valueMatchesOption(this.value, option);

            if (!selection) {
                this.update(this.optionValue(option));
                this.$emit('select', option[this.trackBy]);
                return;
            }

            if (!this.disableClear) {
                this.update(null);
                this.$emit('deselect', option[this.trackBy]);
            }
        },
        highlight(label) {
            return this.query.toLowerCase().split(' ')
                .filter(arg => arg !== '')
                .reduce((label, arg) => this.bold(label, arg), label);
        },
        init() {
            if (!this.serverSide) {
                this.$emit('selection', this.selection);
                return;
            }

            this.fetch();
            this.fetch = debounce(this.fetch, this.debounce);
        },
        isSelected(option) {
            return this.multiple
                ? this.value.some(val => this.valueMatchesOption(val, option))
                : this.valueMatchesOption(this.value, option);
        },
        matchesQuery(option) {
            const label = this.displayLabel(option);

            return this.query.toLowerCase().split(' ')
                .filter(arg => arg !== '')
                .every(arg => `${label}`.toLowerCase().indexOf(arg) >= 0);
        },
        optionValue(option) {
            return this.objects
                ? option
                : option[this.trackBy];
        },
        processOptions(options) {
            this.updateOptionList(options);

            if (!this.query && this.hasSelection) {
                this.updateSelection();
            }
        },
        requestParams() {
            return {
                params: this.params,
                pivotParams: this.pivotParams,
                customParams: this.customParams,
                query: this.query,
                trackBy: this.trackBy,
                value: this.requestValue(),
                paginate: this.paginate,
            };
        },
        requestValue() {
            if (!this.objects) {
                return this.value;
            }

            return this.multiple
                ? this.value.map(value => value[this.trackBy])
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
                ? value[this.trackBy] === option[this.trackBy]
                : value === option[this.trackBy];
        },
        valuesWhithinOptions() {
            return this.value.filter(val => this.optionList
                .some(option => this.valueMatchesOption(val, option)));
        },
        valueWhithinOptions() {
            return this.optionList
                .some(option => this.valueMatchesOption(this.value, option))
                ? this.value
                : null;
        },
        updateMultipleSelection(index, option) {
            if (index >= 0) {
                this.value.splice(index, 1);
                this.$emit('deselect', option[this.trackBy]);
                return;
            }

            this.value.push(this.optionValue(option));
            this.$emit('select', option[this.trackBy]);
        },
        updateOptionList(options) {
            this.optionList = options;
            this.dropdownDisabled = this.shouldDisableDropdown;
        },
    },

    render() {
        return this.$scopedSlots.default({
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
                input: e => (this.query = e.target.value),
                click: e => e.stopPropagation(),
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
            loading: this.loading,
            multiple: this.multiple,
            needsSearch: this.needsSearch,
            noResults: this.noResults,
            options: this.filteredOptions,
            query: this.query,
            reloadEvents: {
                click: () => {
                    if (!this.hasOptions && !this.readonly && !this.disabled) {
                        this.fetch();
                    }
                },
            },
            reset: this.reset,
            select: this.select,
            selection: this.selection,
            selectionBindings: value => ({
                disabled: this.disabled || this.readonly,
                label: this.displayLabel(value),
            }),
            selectionEvents: value => ({
                deselect: () => this.deselect(value),
            }),
            taggable: this.taggable,
            taggableEvents: { select: this.addTag },
            trackBy: this.trackBy,
            updateCurrent: this.updateCurrent,
        });
    },
};
</script>
