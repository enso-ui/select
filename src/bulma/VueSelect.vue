<template>
    <div class="vue-select"
        :class="$attrs.class">
        <core-select v-bind="$attrs"
            ref="select">
            <template #default="{
                    allowsSelection, canAddTag, clearControl, clearEvents, dropdownDisabled, disableClear,
                    disabled, displayLabel, filterBindings, filterEvents, hasOptions, hasSelection,
                    highlight, i18n, isSelected, itemEvents, modeSelector, modeBindings, modeEvents,
                    multiple, needsSearch, noResults, reload, loading, options, query, reset,
                    selection, selectionBindings, selectionEvents, taggable, taggableBindings,
                    taggableEvents, trackBy,
                }">
                <dropdown :disabled="dropdownDisabled"
                    :manual="multiple || canAddTag || !allowsSelection"
                    @hide="reset()"
                    ref="dropdown">
                    <template #trigger="{ triggerEvents, open }">
                        <button class="button input"
                            :class="{ 'has-error': hasError }"
                            type="button"
                            :disabled="disabled"
                            @click="reload"
                            v-on="triggerEvents"
                            ref="trigger">
                            <div class="control-display"
                                :class="{ 'with-clear-button': !disableClear }">
                                <slot name="selection"
                                    :selection="selection"
                                    :selection-bindings="selectionBindings"
                                    :selection-events="selectionEvents">
                                    <div class="field is-grouped is-grouped-multiline"
                                        v-if="hasSelection">
                                        <div class="control">
                                            <template v-if="multiple">
                                                <tag v-bind="selectionBindings(value)"
                                                    v-for="value in selection"
                                                    :key="value[trackBy]"
                                                    v-on="selectionEvents(value)"/>
                                            </template>
                                            <template v-else>
                                                {{ displayLabel(selection) }}
                                            </template>
                                        </div>
                                    </div>
                                    <template v-else-if="!hasOptions && !query">
                                        {{ i18n(labels.noOptions) }}
                                    </template>
                                    <template v-else>
                                        {{ i18n(placeholder) }}
                                    </template>
                                    <span class="is-loading"
                                        v-if="loading"/>
                                    <a class="delete is-small"
                                        v-on="clearEvents"
                                        v-if="clearControl"/>
                                </slot>
                            </div>
                            <dropdown-indicator :open="open" v-if="!disabled"/>
                        </button>
                    </template>
                    <template #controls="{ keydown }"
                        v-if="needsSearch">
                        <div class="search">
                            <div class="control has-icons-right">
                                <input class="input"
                                    v-bind="filterBindings"
                                    type="text"
                                    :placeholder="i18n(labels.search)"
                                    v-on="{ ...filterEvents, keydown }"
                                    v-focus>
                                <search-mode class="is-right icon is-small search-mode"
                                    v-bind="modeBindings"
                                    v-on="modeEvents"
                                    v-if="modeSelector"/>
                            </div>
                        </div>
                    </template>
                    <template #items>
                        <dropdown-item v-bind="taggableBindings"
                            key="add-tag"
                            v-on="taggableEvents"
                            v-if="canAddTag">
                            {{ query }}
                            <span class="label tag is-info">
                                {{ i18n(labels.add) }}
                            </span>
                        </dropdown-item>
                        <dropdown-item v-for="(option, index) in options"
                            :key="option[trackBy]"
                            :selected="false"
                            v-on="itemEvents(index)">
                            <template #default="{ current }">
                                <slot name="option"
                                    :option="option"
                                    :highlight="highlight">
                                    <!-- eslint-disable-next-line vue/no-v-html -->
                                    <span v-html="highlight(displayLabel(option))"/>
                                </slot>
                                <span class="label tag"
                                    :class="isSelected(option) ? 'is-warning' : 'is-success'"
                                    v-if="current && !disableClear">
                                    <span v-if="isSelected(option)">
                                        {{ i18n(labels.deselect) }}
                                    </span>
                                    <span v-else>
                                        {{ i18n(labels.select) }}
                                    </span>
                                </span>
                                <span class="icon is-small selected has-text-success"
                                    v-else-if="isSelected(option)">
                                    <fa icon="check"/>
                                </span>
                            </template>
                        </dropdown-item>
                        <dropdown-item key="no-results"
                            v-if="!taggable && noResults">
                            {{ i18n(labels.noResults) }}
                        </dropdown-item>
                    </template>
                </dropdown>
            </template>
        </core-select>
    </div>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck }
    from '@fortawesome/free-solid-svg-icons';
import { focus, clickOutside } from '@enso-ui/directives';
import { Dropdown, DropdownItem } from '@enso-ui/dropdown/bulma';
import DropdownIndicator from '@enso-ui/dropdown-indicator';
import SearchMode from '@enso-ui/search-mode/bulma';
import CoreSelect from '../renderless/CoreSelect.vue';
import Tag from './Tag.vue';

library.add(faCheck);

export default {
    name: 'VueSelect',

    directives: { focus, clickOutside },

    inheritAttrs: false,

    components: {
        CoreSelect,
        Dropdown,
        DropdownItem,
        DropdownIndicator,
        Fa,
        Tag,
        SearchMode,
    },

    props: {
        hasError: {
            type: Boolean,
            default: false,
        },
        labels: {
            type: Object,
            default: () => ({
                select: 'select',
                deselect: 'deselect',
                noOptions: 'No options available',
                noResults: 'No search results found',
                add: 'add',
                search: 'Search...',
            }),
        },
        placeholder: {
            type: String,
            default: 'Pick an option',
        },
    },

    computed: {
        selection() {
            return this.$refs.select.selection;
        },
    },

    methods: {
        clear() {
            this.$refs.select.clear();
        },
        fetch() {
            this.$refs.select.fetch();
        },
        hide() {
            this.$refs.dropdown.hide();
        },
        show() {
            this.$refs.dropdown.show();
        },
    },
};
</script>


<style lang="scss">
@import 'bulma/sass/utilities/derived-variables';

.vue-select {
    .dropdown {
        width: 100%;

        .dropdown-trigger {
            width: 100%;

            .button.input {
                width: 100%;
                height: unset;
                min-height: 2.2125em;

                &.has-error {
                    border-color: $danger;
                }

                .control-display {
                    &.with-clear-button {
                        max-width: calc(100% - 2.5em);
                    }

                    overflow-x: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;

                    [dir='ltr'] & {
                        text-align: left;
                    }

                    [dir='rtl'] & {
                        text-align: right;
                    }

                    .field.is-grouped.is-grouped-multiline:last-child {
                        margin-bottom: unset;
                    }

                    .field.is-grouped.is-grouped-multiline {
                        .control:last-child,
                        .control:not(:last-child) {
                            margin-bottom: 0;
                            display: contents;

                            .tags:not(:last-child) {
                                margin-bottom: 0;
                            }
                        }
                    }

                    .delete {
                        position: absolute;
                        top: 0.55rem;

                        [dir='ltr'] & {
                            right: 1.5rem;
                        }

                        [dir='rtl'] & {
                            left: 1.5rem;
                        }
                    }

                    .is-loading {
                        -webkit-animation: spinAround .5s infinite linear;
                        animation: spinAround .5s infinite linear;
                        border: 2px solid #dbdbdb;
                        border-radius: 290486px;
                        border-top-color: transparent;
                        content: "";
                        display: block;
                        height: 1em;
                        width: 1em;
                        position: absolute !important;
                        top: .55em;
                        z-index: 4;

                        [dir='ltr'] & {
                            border-right-color: transparent;
                            right: 1.7rem;
                        }

                        [dir='rtl'] & {
                            border-left-color: transparent;
                            left: 1.7rem;
                        }
                    }
                }
            }
        }

        .dropdown-menu {
            width: 100%;

            .dropdown-content {
                width: 100%;

                .search {
                    padding: 0 0.375rem 0.6rem;

                    .input {
                        height: 2em;
                    }

                    .search-mode {
                        right: 0.3em;
                        pointer-events: all;
                    }
                }

                .dropdown-item {
                    text-overflow: ellipsis;
                    overflow-x: hidden;
                    white-space: nowrap;
                    padding: 0.375rem 2rem 0.375rem 0.6rem;

                    .label.tag {
                        position: absolute;
                        padding: 0.3rem;
                        height: 1.3rem;
                        top: calc(50% - 0.65rem);
                        z-index: 1;

                        [dir='ltr'] & {
                            right: 0.6rem;
                        }

                        [dir='rtl'] & {
                            left: 0.6rem;
                        }
                    }

                    .icon.selected {
                        position: absolute;
                        z-index: 1;

                        [dir='ltr'] & {
                            right: 0.6rem;
                        }

                        [dir='rtl'] & {
                            left: 0.6rem;
                        }
                    }
                }
            }
        }
    }
}
</style>
