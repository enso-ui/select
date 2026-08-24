<script>
import {
    computed, defineComponent, onBeforeMount, onBeforeUnmount, ref, watch,
} from 'vue';
import { debounce } from 'lodash-es';
import Modes from '@enso-ui/search-mode/src/modes';

export default defineComponent({
    name: 'CoreSelect',

    inheritAttrs: false,

    props: {
        customParams: { type: Object, default: null },
        debounce: { type: Number, default: 300 },
        disableClear: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        errorHandler: {
            type: Function,
            default: error => {
                throw error;
            },
        },
        http: { type: Function, default: null },
        i18n: { type: Function, default: value => value },
        label: { type: String, default: 'name' },
        multiple: { type: Boolean, default: false },
        objects: { type: Boolean, default: false },
        options: { type: Array, default: () => ([]) },
        paginate: { type: Number, default: 100 },
        params: { type: Object, default: null },
        pivotParams: { type: Object, default: null },
        readonly: { type: Boolean, default: false },
        searchLimit: { type: Number, default: 10 },
        searchMode: {
            type: String,
            default: 'full',
            validator: value => Modes.includes(value),
        },
        searchModes: {
            type: Array,
            default: () => ['full'],
            validator: value => value.every(mode => Modes.includes(mode)),
        },
        source: { type: String, default: null },
        taggable: { type: Boolean, default: false },
        trackBy: { type: String, default: 'id' },
        translated: { type: Boolean, default: false },
        modelValue: { type: null, required: true },
    },

    emits: [
        'add-tag', 'clear', 'deselect', 'fetch', 'input', 'select',
        'selection', 'update', 'update:modelValue',
    ],

    setup(props, { emit, expose, slots }) {
        const allowsSelection = ref(true);
        const loading = ref(false);
        const mode = ref(props.searchMode);
        const optionList = ref(props.options);
        const query = ref('');
        let ongoingRequest = null;

        const serverSide = computed(() => props.source !== null);
        const hasSelection = computed(() => (props.multiple
            ? props.modelValue.length > 0
            : props.modelValue !== null));

        const displayLabel = option => {
            if (!option) {
                return null;
            }

            const value = props.label.split('.')
                .reduce((result, property) => result[property], option);

            return props.translated ? props.i18n(value) : value;
        };

        const valueMatchesOption = (value, option) => (value !== null && props.objects
            ? `${value[props.trackBy]}` === `${option[props.trackBy]}`
            : `${value}` === `${option[props.trackBy]}`);

        const matchesQuery = option => {
            const label = displayLabel(option);

            return query.value.toLowerCase().split(' ')
                .filter(argument => argument !== '')
                .every(argument => `${label}`.toLowerCase().includes(argument));
        };

        const filteredOptions = computed(() => (query.value && !serverSide.value
            ? optionList.value.filter(matchesQuery)
            : optionList.value));
        const hasFilteredOptions = computed(() => filteredOptions.value.length > 0);
        const hasOptions = computed(() => optionList.value.length > 0);
        const selection = computed(() => (props.multiple
            ? optionList.value.filter(option => props.modelValue
                .some(value => valueMatchesOption(value, option)))
            : optionList.value
                .find(option => valueMatchesOption(props.modelValue, option)) || null));
        const queryDoesNotMatch = computed(() => !filteredOptions.value
            .some(option => `${displayLabel(option)}`.toLowerCase()
                === query.value.toLowerCase()));
        const canAddTag = computed(() => props.taggable && allowsSelection.value
            && !!query.value && !loading.value && queryDoesNotMatch.value);
        const clearControl = computed(() => !props.disableClear && !props.readonly
            && !props.disabled && !loading.value && hasSelection.value);
        const modeSelector = computed(() => props.searchModes.length > 1);
        const needsSearch = computed(() => serverSide.value
            || optionList.value.length > props.searchLimit);
        const noResults = computed(() => !!query.value && !loading.value
            && !hasFilteredOptions.value);
        const dropdownDisabled = computed(() => props.readonly || props.disabled
            || !hasOptions.value && !query.value && !props.taggable);

        const update = value => {
            emit('update:modelValue', value);
            emit('update');
        };

        const valuesWithinOptions = () => props.modelValue.filter(value => optionList.value
            .some(option => valueMatchesOption(value, option)));

        const valueWithinOptions = () => (optionList.value
            .some(option => valueMatchesOption(props.modelValue, option))
            ? props.modelValue
            : null);

        const updateSelection = () => {
            const value = props.multiple
                ? valuesWithinOptions()
                : valueWithinOptions();

            if (JSON.stringify(value) !== JSON.stringify(props.modelValue)) {
                update(value);
            }
        };

        const processOptions = options => {
            optionList.value = options;

            if (!query.value && hasSelection.value) {
                updateSelection();
            }
        };

        const requestValue = () => {
            if (!props.objects || props.modelValue === null) {
                return props.modelValue;
            }

            return props.multiple
                ? props.modelValue.map(value => value[props.trackBy])
                : props.modelValue[props.trackBy];
        };

        const requestParams = () => {
            const params = {
                paginate: props.paginate,
                query: query.value,
                searchMode: mode.value,
                trackBy: props.trackBy,
                value: requestValue(),
            };

            ['customParams', 'params', 'pivotParams']
                .filter(key => props[key] && Object.keys(props[key]).length > 0)
                .forEach(key => (params[key] = props[key]));

            return params;
        };

        const fetch = debounce(() => {
            const request = props.http.CancelToken.source();

            ongoingRequest = request;
            loading.value = true;

            props.http.get(props.source, {
                params: requestParams(),
                cancelToken: request.token,
            }).then(({ data }) => {
                if (ongoingRequest === request) {
                    processOptions(data);
                    emit('fetch', optionList.value);
                }
            }).catch(error => {
                if (!props.http.isCancel(error)) {
                    props.errorHandler(error);
                }
            }).finally(() => {
                if (ongoingRequest === request) {
                    ongoingRequest = null;
                    allowsSelection.value = true;
                    loading.value = false;
                }
            });
        }, props.debounce);

        const fetchIfServerSide = () => {
            if (serverSide.value) {
                if (ongoingRequest) {
                    ongoingRequest.cancel();
                    ongoingRequest = null;
                    loading.value = false;
                }

                allowsSelection.value = false;
                fetch();
            }
        };

        const addTag = debounce(() => {
            if (props.taggable) {
                emit('add-tag', query.value);
            }
        }, 1000);

        const bold = (label, argument) => {
            let from;

            try {
                from = new RegExp(`(${argument})`, 'gi');
            } catch {
                from = argument;
            }

            return `${label}`.replace(from, '<b>$1</b>');
        };

        const clear = () => {
            update(props.multiple ? [] : null);
            emit('clear');
        };

        const deselect = deselected => {
            const value = JSON.parse(JSON.stringify(props.modelValue));
            const index = value.findIndex(item => (props.objects
                ? item[props.trackBy] === deselected[props.trackBy]
                : item === deselected[props.trackBy]));

            value.splice(index, 1);
            update(value);
            emit('deselect', deselected);
        };

        const hasResolvedSelection = () => (props.multiple
            ? selection.value.length === props.modelValue.length
            : selection.value !== null);

        const optionValue = option => (props.objects ? option : option[props.trackBy]);

        const updateMultipleSelection = (index, option) => {
            const value = JSON.parse(JSON.stringify(props.modelValue));

            if (index >= 0) {
                value.splice(index, 1);
                emit('deselect', props.objects ? option : option[props.trackBy]);
            } else {
                value.push(optionValue(option));
                emit('select', props.objects ? option : option[props.trackBy]);
            }

            return value;
        };

        const handleMultipleSelection = option => {
            const index = props.modelValue
                .findIndex(value => valueMatchesOption(value, option));

            update(updateMultipleSelection(index, option));
        };

        const reset = () => (query.value = '');

        const handleSingleSelection = option => {
            reset();

            if (!valueMatchesOption(props.modelValue, option)) {
                update(optionValue(option));
                emit('select', props.objects ? option : option[props.trackBy]);
                return;
            }

            if (!props.disableClear) {
                update(null);
                emit('deselect', props.objects ? option : option[props.trackBy]);
            }
        };

        const select = index => {
            if (!allowsSelection.value) {
                return;
            }

            const option = filteredOptions.value[index];

            const handler = props.multiple
                ? handleMultipleSelection
                : handleSingleSelection;

            handler(option);
        };

        const highlight = label => query.value.toLowerCase().split(' ')
            .filter(argument => argument !== '')
            .reduce((result, argument) => bold(result, argument), label);

        const isSelected = option => (props.multiple
            ? props.modelValue.some(value => valueMatchesOption(value, option))
            : valueMatchesOption(props.modelValue, option));

        const reload = () => {
            if (!hasOptions.value && !props.readonly && !props.disabled) {
                fetchIfServerSide();
            }
        };

        watch(() => props.customParams, fetchIfServerSide, { deep: true });
        watch(() => props.params, fetchIfServerSide, { deep: true });
        watch(() => props.pivotParams, fetchIfServerSide, { deep: true });
        watch(query, fetchIfServerSide);
        watch(selection, () => emit('selection', selection.value), { deep: true });
        watch(() => props.options, options => {
            if (!serverSide.value) {
                optionList.value = options;
            }
        }, { deep: true });
        watch(() => props.source, () => {
            optionList.value = props.options;
            fetchIfServerSide();
        });
        watch(() => props.modelValue, () => {
            if (hasSelection.value && !hasResolvedSelection()) {
                fetchIfServerSide();
            } else if (query.value) {
                fetchIfServerSide();
            }
        }, { deep: true });

        if (!props.http && serverSide.value) {
            throw Error('Using the serverside mode requires providing a http client');
        }

        onBeforeMount(fetchIfServerSide);
        onBeforeUnmount(() => {
            fetch.cancel();
            addTag.cancel();

            if (ongoingRequest) {
                ongoingRequest.cancel();
            }
        });

        expose({
            clear, fetch, fetchIfServerSide, selection,
        });

        return () => slots.default?.({
            allowsSelection: allowsSelection.value,
            canAddTag: canAddTag.value,
            clearControl: clearControl.value,
            clearEvents: {
                click: event => {
                    clear();
                    event.stopPropagation();
                },
            },
            disableClear: props.disableClear,
            disabled: props.disabled,
            displayLabel,
            dropdownDisabled: dropdownDisabled.value,
            filterBindings: { modelValue: query.value },
            filterEvents: {
                input: event => (query.value = event.target.value),
                click: event => event.stopPropagation(),
                keydown: event => {
                    if (event.key === 'Enter' && props.taggable
                        && !hasOptions.value && query.value) {
                        addTag();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                },
            },
            hasOptions: hasFilteredOptions.value,
            hasSelection: hasSelection.value,
            highlight,
            i18n: props.i18n,
            isSelected,
            itemEvents: index => ({ select: () => select(index) }),
            loading: loading.value,
            multiple: props.multiple,
            needsSearch: needsSearch.value,
            noResults: noResults.value,
            options: filteredOptions.value,
            query: query.value,
            reload,
            reset,
            modeBindings: {
                modes: props.searchModes,
                query: query.value,
                'update:modelValue': mode.value,
            },
            modeEvents: {
                'update:modelValue': value => (mode.value = value),
                change: fetchIfServerSide,
            },
            modeSelector: modeSelector.value,
            select,
            selection: selection.value,
            selectionBindings: value => ({
                disabled: props.disabled || props.readonly,
                label: displayLabel(value),
            }),
            selectionEvents: value => ({ deselect: () => deselect(value) }),
            taggable: props.taggable,
            taggableBindings: {
                index: 0,
                selected: false,
            },
            taggableEvents: { select: addTag },
            trackBy: props.trackBy,
        });
    },
});
</script>
