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
        paginate: {
            type: Number,
            default: 100,
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
            default: () => (this.multiple ? [] : null),
        },
    },

    data: v => ({
        internalValue: null,
        optionList: v.options,
        loading: false,
        query: '',
        currentIndex: 0,
    }),

    computed: {
        serverSide() {
            return this.source !== null;
        },
        hasSelection() {
            return this.multiple
                ? this.value.length > 0
                : this.value !== null;
        },
        hasOptions() {
            return this.optionList.length > 0;
        },
        filteredOptions() {
            return this.query
                ? this.optionList.filter(option => this.matchesQuery(option))
                : this.optionList;
        },
        hasFilteredOptions() {
            return this.filteredOptions.length > 0;
        },
        selection() {
            return this.multiple
                ? this.optionList.filter(option => this.value
                    .some(val => this.valueMatchesOption(val, option)))
                : this.optionList
                    .find(option => this.valueMatchesOption(this.value, option));
        },
        visibleClearControl() {
            return !this.disableClear && !this.readonly && !this.disabled
                && !this.loading && this.hasSelection;
        },
    },

    watch: {
        query: 'fetch',
        options: {
            handler() {
                this.optionList = this.options;
            },
            deep: true,
        },
        params: {
            handler() {
                this.fetch();
            },
            deep: true,
        },
        pivotParams: {
            handler() {
                this.fetch();
            },
            deep: true,
        },
        customParams: {
            handler() {
                this.fetch();
            },
            deep: true,
        },
        value(value) {
            if (JSON.stringify(this.internalValue) !== JSON.stringify(value)) {
                this.$emit('input', value);
            }

            this.internalValue = null;
        },
    },

    created() {
        this.fetch = debounce(this.fetch, this.debounce);
        this.fetch();
    },

    methods: {
        fetch() {
            if (!this.serverSide) {
                return;
            }

            this.loading = true;

            axios.get(this.source, { params: this.requestParams() })
                .then(({ data }) => {
                    this.processOptions(data);
                    this.$emit('fetch', this.optionList);
                    this.loading = false;
                }).catch((error) => {
                    this.loading = false;
                    this.errorHandler(error);
                });
        },
        requestParams() {
            return {
                params: this.params,
                pivotParams: this.pivotParams,
                customParams: this.customParams,
                query: this.query,
                trackBy: this.trackBy,
                value: this.value,
                paginate: this.paginate,
            };
        },
        processOptions(options) {
            this.optionList = options;

            if (!this.query && this.hasSelection) {
                this.updateSelection();
            }
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
        valueMatchesOption(value, option) {
            return value !== null && this.objects
                ? value[this.trackBy] === option[this.trackBy]
                : value === option[this.trackBy];
        },
        matchesQuery(option) {
            const label = this.displayLabel(option).toLowerCase();

            return this.query.split(' ')
                .every(arg => label.indexOf(arg) >= 0);
        },
        reset() {
            this.query = '';
            this.currentIndex = 0;
        },
        select() {
            if (!this.hasFilteredOptions || this.loading) {
                return;
            }

            const option = this.filteredOptions[this.currentIndex];

            if (this.multiple) {
                this.handleMultipleSelection(option);
            } else {
                this.handleSingleSelection(option);
            }
        },
        handleMultipleSelection(option) {
            const index = this.value
                .findIndex(val => this.valueMatchesOption(val, option));

            if (index >= 0) {
                this.value.splice(index, 1);
                this.$emit('deselect', option[this.trackBy]);
            } else {
                this.value.push(this.optionValue(option));
                this.$emit('select', option[this.trackBy]);
            }

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
        optionValue(option) {
            return this.objects
                ? option
                : option[this.trackBy];
        },
        clear() {
            this.update(this.multiple ? [] : null);
            this.$emit('clear');
        },
        highlight(label) {
            return this.query.split(' ')
                .reduce((label, arg) => label.replace(
                    new RegExp(`(${arg})`, 'gi'), '<b>$1</b>',
                ), label);
        },
        deselect(value) {
            const index = this.value
                .findIndex(val => val === value[this.trackBy]);

            this.value.splice(index, 1);
            this.update(this.value);
            this.$emit('deselect', value);
        },
        isSelected(option) {
            return this.multiple
                ? this.value.some(val => this.valueMatchesOption(val, option))
                : this.valueMatchesOption(this.value, option);
        },
        nextIndex() {
            if (this.loading || !this.hasFilteredOptions) {
                return;
            }

            if (++this.currentIndex > this.filteredOptions.length - 1) {
                this.currentIndex = 0;
            }

            this.scrollIntoView();
        },
        previousIndex() {
            if (this.loading || !this.hasFilteredOptions) {
                return;
            }

            if (--this.currentIndex < 0) {
                this.currentIndex = this.filteredOptions.length - 1;
            }

            this.scrollIntoView();
        },
        updateCurrentIndex(index) {
            this.currentIndex = index;
        },
        scrollIntoView() {
            const options = this.$el.querySelectorAll('.dropdown-item:not(.search)');

            options[this.currentIndex]
                .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        addTag() {
            if (this.taggable) {
                this.$emit('add-tag', this.query);
            }
        },
    },

    render() {
        return this.$scopedSlots.default({
            multiple: this.multiple,
            taggable: this.taggable,
            loading: this.loading,
            disabled: this.disabled,
            disableClear: this.disableClear,
            visibleClearControl: this.visibleClearControl,
            hasOptions: this.hasFilteredOptions,
            query: this.query,
            options: this.filteredOptions,
            hasSelection: this.hasSelection,
            selection: this.selection,
            trackBy: this.trackBy,
            currentIndex: this.currentIndex,
            i18n: this.i18n,
            displayLabel: this.displayLabel,
            isSelected: this.isSelected,
            highlight: this.highlight,
            dropdownBindings: {
                disabled: this.readonly || this.disabled
                    || (!this.hasOptions && !this.query),
                manual: this.multiple,
            },
            dropdownEvents: {
                close: this.reset,
            },
            reloadEvents: {
                click: () => {
                    if (!this.hasOptions) {
                        this.fetch();
                    }
                },
            },
            filterBindings: {
                value: this.query,
            },
            filterEvents: {
                input: e => (this.query = e.target.value),
                click: e => e.stopPropagation(),
            },
            keyboardEvents: {
                keydown: (e) => {
                    switch (e.key) {
                    case 'ArrowDown':
                        this.nextIndex();
                        e.preventDefault();
                        break;
                    case 'ArrowUp':
                        this.previousIndex();
                        e.preventDefault();
                        break;
                    case 'Enter':
                        this.select();
                        e.preventDefault();
                        break;
                    default:
                        break;
                    }
                },
            },
            itemEvents: index => ({
                click: this.select,
                mouseenter: () => this.updateCurrentIndex(index),
            }),
            selectionBindings: value => ({
                disabled: this.disabled || this.readonly,
                label: this.displayLabel(value),
            }),
            selectionEvents: value => ({
                deselect: () => this.deselect(value),
            }),
            clearEvents: {
                mousedown: (e) => {
                    this.clear();
                    e.preventDefault();
                },
            },
            taggableEvents: {
                click: this.addTag,
            },
        });
    },
};
</script>
