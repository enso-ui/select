<template>
    <core-select v-bind="$attrs"
        v-on="$listeners"
        ref="select">
        <template v-slot:default="{
                multiple, taggable, loading, disableClear, visibleClearControl, hasOptions,
                hasSelection, query, options, selection, trackBy, currentIndex,
                i18n, displayLabel, isSelected, highlight, dropdownBindings, dropdownEvents,
                dropdownTriggerEvents, filterEvents, filterBindings, itemEvents, selectionBindings,
                selectionEvents, clearEvents, taggableEvents, keyboardEvents,
            }">
            <dropdown class="vue-select"
                v-bind="dropdownBindings"
                v-on="dropdownEvents"
                :manual="multiple">
                <template v-slot:trigger="{ open, visible }">
                    <button class="button input"
                        :class="{ 'has-error': hasError }"
                        type="button"
                        @click="open"
                        v-on="dropdownTriggerEvents">
                        <div class="control-display">
                            <div class="field is-grouped is-grouped-multiline"
                                v-if="hasSelection">
                                <div class="control">
                                    <slot name="selection"
                                        :selection="selection"
                                        :selection-bindings="selectionBindings"
                                        :selection-events="selectionEvents"
                                        :track-by="trackBy">
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
                                v-if="visibleClearControl"/>
                        </div>
                        <dropdown-indicator :open="visible"/>
                    </button>
                </template>
                <template v-slot:controls>
                    <div class="dropdown-item search">
                        <input class="input"
                            type="text"
                            :placeholder="i18n(labels.search)"
                            v-bind="filterBindings"
                            v-on="{ ...filterEvents, ...keyboardEvents }"
                            v-focus>
                    </div>
                </template>
                <template v-slot:options>
                    <slot name="options"
                        :options="options"
                        :display-label="displayLabel"
                        :is-selected="isSelected"
                        :highlight="highlight">
                        <a class="dropdown-item"
                            v-for="(option, index) in options"
                            :key="option[trackBy]"
                            :class="{ 'is-active': currentIndex === index }"
                            v-on="itemEvents(index)">
                            <slot name="option"
                                :option="option"
                                :highlight="highlight">
                                <span v-html="highlight(displayLabel(option))"/>
                            </slot>
                            <span class="label tag"
                                :class="isSelected(option) ? 'is-warning' : 'is-success'"
                                v-if="currentIndex === index && !disableClear">
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
                        </a>
                    </slot>
                    <a class="dropdown-item"
                        v-on="taggableEvents"
                        v-if="!hasOptions">
                        {{ i18n(labels.noResults) }}
                        <span class="label tag is-info"
                            v-if="taggable">
                            {{ i18n(labels.addTag) }}
                        </span>
                    </a>
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
import DropdownIndicator from '@enso-ui/dropdown-indicator';
import CoreSelect from '../renderless/CoreSelect.vue';
import Tag from './Tag.vue';

library.add(faCheck);

export default {
    name: 'VueSelect',

    directives: { focus, clickOutside },

    components: {
        CoreSelect, Dropdown, DropdownIndicator, Tag,
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
                addTag: 'Add option',
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
            this.$refs.select.clear();
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
                    text-align: left;
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
                        right: 1.5rem;
                        [dir='rtl'] & {
                            left: 1.5rem;
                            right: unset;
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
                        border-right-color: transparent;
                        right: 1.7rem;
                        [dir='rtl'] & {
                            border-left-color: transparent;
                            border-right-color: inherit;
                            left: 1.7rem;
                            right: unset;
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
                        right: 0.6rem;
                        [dir='rtl'] & {
                            left: 0.6rem;
                            right: unset;
                        }
                    }

                    .icon.selected {
                        position: absolute;
                        z-index: 1;
                        right: 0.6rem;
                        [dir='rtl'] & {
                            left: 0.6rem;
                            right: unset;
                        }
                    }
                }
            }
        }
    }

</style>
