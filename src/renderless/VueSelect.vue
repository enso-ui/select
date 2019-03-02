<script>
import debounce from 'lodash/debounce';

export default {
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
            default: this.multiple ? [] : null,
        },
    },

    data: v => ({
        optionList: v.options,
        loading: false,
        query: '',
        closedDropdown: true,
        position: null,
    }),

    computed: {
        serverSide() {
            return this.source !== null;
        },
        filteredOptions() {
            return this.query
                ? this.optionList.filter(option => this.matchesQuery(option))
                : this.optionList;
        },
        hasSelection() {
            return this.multiple
                ? this.value.length > 0
                : this.value !== null;
        },
        hasOptions() {
            return this.optionList.length > 0;
        },
        hasFilteredOptions() {
            return this.filteredOptions.length > 0;
        },
        selection() {
            if (!this.hasOptions) {
                return null;
            }

            if (this.multiple) {
                return this.optionList.filter(option => this.value
                    .some(val => this.valueMatchesOption(val, option)));
            }

            return this.optionList
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
    },

    created() {
        this.fetch = debounce(this.fetch, this.debounce);
        this.fetch();
    },

    methods: {
        update(value) {
            this.$emit('input', value);
        },
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
        updateSelection() {
            const value = this.multiple
                ? this.valuesWhithinOptions()
                : this.valueWhithinOptions();

            this.update(value);
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
            return this.objects
                ? value[this.trackBy] === option[this.trackBy]
                : value === option[this.trackBy];
        },
        matchesQuery(option) {
            return this.displayLabel(option).toLowerCase()
                .indexOf(this.query.toLowerCase()) >= 0;
        },
        openDropdown() {
            if (this.readonly || this.disabled) {
                return;
            }

            this.closedDropdown = false;
            this.position = 0;
        },
        closeDropdown() {
            this.query = '';
            this.closedDropdown = true;
            this.position = null;
        },
        select() {
            if (!this.hasFilteredOptions) {
                return;
            }

            const option = this.filteredOptions[this.position];

            if (this.multiple) {
                this.handleMultipleSelection(option);
            } else {
                this.handleSingleSelection(option);
            }
        },
        handleMultipleSelection(option) {
            const index = this.value.findIndex(val => this.valueMatchesOption(val, option));

            if (index >= 0) {
                this.value.splice(index, 1);
            } else {
                this.value.push(this.optionValue(option));
            }

            this.update(this.value);
        },
        handleSingleSelection(option) {
            this.closeDropdown();

            const selection = !this.disableClear
                && this.valueMatchesOption(this.value, option);

            this.update(selection ? null : this.optionValue(option));
        },
        optionValue(option) {
            return this.objects
                ? option
                : option[this.trackBy];
        },
        clear() {
            this.update(this.multiple ? [] : null);
        },
        highlight(label) {
            return label.replace(
                new RegExp(`(${this.query})`, 'gi'), '<b>$1</b>',
            );
        },
        deselect(value) {
            const index = this.value
                .findIndex(val => val === value[this.trackBy]);

            this.value.splice(index, 1);
            this.$emit('deselect', value);
            this.update(this.value);
        },
        isSelected(option) {
            return this.multiple
                ? this.value.some(val => this.valueMatchesOption(val, option))
                : this.valueMatchesOption(this.value, option);
        },
        keyDown() {
            if (!this.hasFilteredOptions || this.loading
                || this.position === this.filteredOptions.length - 1) {
                return;
            }

            this.position = this.position !== null
                ? ++this.position
                : 0;

            this.scroll();
        },
        keyUp() {
            if (this.loading || !this.position) {
                return;
            }

            this.position--;
            this.scroll();
        },
        updatePosition(index) {
            this.position = index;
        },
        scroll() {
            const dropdown = this.$el.querySelector('.dropdown-content');
            const option = this.$el.querySelectorAll('.dropdown-item')[this.position];

            if (option.offsetTop < dropdown.scrollTop) {
                dropdown.scrollTop -= (dropdown.scrollTop - option.offsetTop);
                return;
            }

            const dropdownBottom = dropdown.scrollTop + dropdown.clientHeight;
            const optionBottom = option.offsetTop + option.clientHeight;

            if (optionBottom > dropdownBottom) {
                dropdown.scrollTop += (optionBottom - dropdownBottom);
            }
        },
        displayLabel(option) {
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
            closedDropdown: this.closedDropdown,
            disableClear: this.disableClear,
            visibleClearControl: this.visibleClearControl,
            hasOptions: this.hasFilteredOptions,
            options: this.filteredOptions,
            hasSelection: this.hasSelection,
            selection: this.selection,
            trackBy: this.trackBy,
            position: this.position,
            i18n: this.i18n,
            displayLabel: this.displayLabel,
            isSelected: this.isSelected,
            highlight: this.highlight,
            dropdownBindings: {
                disabled: this.readonly || this.disabled || !this.hasOptions,
                manual: this.multiple,
            },
            dropdownEvents: {
                open: this.openDropdown,
                close: this.closeDropdown,
            },
            dropdownTriggerEvents: {
                click: (e) => {
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
                keydown: (e) => {
                    switch (e.key) {
                    case 'ArrowDown':
                        this.keyDown();
                        break;
                    case 'ArrowUp':
                        this.keyUp();
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
                mouseenter: () => this.updatePosition(index),
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
