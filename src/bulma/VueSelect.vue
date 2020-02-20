<template>
    <core-select v-bind="$attrs"
        v-on="$listeners"
        ref="select">
        <template v-slot:default="{
                clearControl, clearEvents, dropdownDisabled, isCurrent, disableClear, disabled,
                displayLabel, filterBindings, filterEvents, hasOptions, hasSelection, highlight,
                i18n, isSelected, multiple, needsSearch, reloadEvents, taggable, loading, options,
                query, reset, selection, selectionBindings, selectionEvents, taggableEvents,
                trackBy, select, updateCurrent,
            }">
            <dropdown class="vue-select"
                :disabled="dropdownDisabled"
                :manual="multiple"
                @update-index="updateCurrent"
                @hide="reset(); $refs.trigger.focus()">
                <template v-slot:trigger="{ triggerEvents, visible }">
                    <button class="button input"
                        :class="{ 'has-error': hasError }"
                        type="button"
                        :disabled="disabled"
                        v-on="triggerEvents"
                        ref="trigger">
                        <div class="control-display"
                            v-on="reloadEvents">
                            <div class="field is-grouped is-grouped-multiline"
                                v-if="hasSelection">
                                <div class="control">
                                    <slot name="selection"
                                        :selection="selection"
                                        :selection-bindings="selectionBindings"
                                        :selection-events="selectionEvents">
                                        <template v-if="multiple">
                                            <tag v-for="value in selection"
                                                :key="value[trackBy]"
                                                v-bind="selectionBindings(value)"
                                                v-on="selectionEvents(value)"/>
                                        </template>
                                        <template v-else>
                                            {{ displayLabel(selection) }}
                                        </template>
                                    </slot>
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
                        </div>
                        <dropdown-indicator :open="visible" v-if="!disabled"/>
                    </button>
                </template>
                <template v-slot:controls
                    v-if="needsSearch">
                    <div class="dropdown-item search">
                        <input class="input"
                            type="text"
                            :placeholder="i18n(labels.search)"
                            v-bind="filterBindings"
                            v-on="filterEvents"
                            v-focus>
                    </div>
                </template>
                <template v-slot:items="{ itemBindings, itemEvents }"
                    v-if="hasOptions">
                    <dropdown-item v-for="(option, index) in options"
                        :key="option[trackBy]"
                        v-bind="itemBindings(false, index)"
                        v-on="itemEvents(index)"
                        @select="select(index)">
                        <slot name="option"
                            :option="option"
                            :highlight="highlight">
                            <span v-html="highlight(displayLabel(option))"/>
                        </slot>
                        <span class="label tag"
                            :class="isSelected(option) ? 'is-warning' : 'is-success'"
                            v-if="isCurrent(index) && !disableClear">
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
                    </dropdown-item>
                </template>
                <template v-slot:items
                    v-else>
                    <dropdown-item v-on="taggableEvents">
                        {{ i18n(labels.noResults) }}
                        <span class="label tag is-info"
                            v-if="taggable">
                            {{ i18n(labels.add) }}
                        </span>
                    </dropdown-item>
                </template>
            </dropdown>
        </template>
    </core-select>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck }
    from '@fortawesome/free-solid-svg-icons';
import { focus, clickOutside } from '@enso-ui/directives';
import Dropdown from '@enso-ui/dropdown/bulma';
import DropdownItem from '@enso-ui/dropdown/src/bulma/DropdownItem.vue';
import DropdownIndicator from '@enso-ui/dropdown-indicator';
import CoreSelect from '../renderless/CoreSelect.vue';
import Tag from './Tag.vue';

library.add(faCheck);

export default {
    name: 'VueSelect',

    directives: { focus, clickOutside },

    components: {
        CoreSelect, Dropdown, DropdownItem, DropdownIndicator, Tag,
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
    },
};
</script>


<style lang="scss">
    .dropdown.vue-select {
        width: 100%;

        .dropdown-trigger {
            width: 100%;

            .button.input {
                min-height: 2.25em;
                height: unset;
                width: 100%;

                .control-display {
                    max-width: calc(100% - 2.5em);
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
                        position: relative;
                        width: 1em;
                        position: absolute!important;
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

                .options {
                    width: 100%;
                    max-height: 12.4em;
                    overflow: auto;
                }

                .dropdown-item {
                    text-overflow: ellipsis;
                    overflow-x: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    padding: 0.375rem 0.6rem;

                    &.search {
                        padding-top: 0;

                        .input {
                            height: 2em;
                        }
                    }

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

</style>
