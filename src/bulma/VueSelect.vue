<template>
    <core-select v-bind="$attrs"
        v-on="$listeners">
        <template v-slot:default="{
                multiple, taggable, loading, disableClear, visibleClearControl, hasOptions,
                hasSelection, searchable, query, options, selection, trackBy, currentIndex,
                i18n, displayLabel, isSelected, highlight, dropdownBindings, dropdownEvents,
                dropdownTriggerEvents, filterEvents, filterBindings, itemEvents, selectionBindings,
                selectionEvents, clearEvents, taggableEvents, keyboardEvents,
            }">
            <dropdown class="vue-select"
                width="100%"
                height="12.3em"
                v-bind="dropdownBindings"
                v-on="dropdownEvents">
                <template v-slot:trigger="{ open, visible }">
                    <button class="button input"
                        type="button"
                        @click="open"
                        v-on="keyboardEvents"
                        @keydown.enter.prevent="open">
                        <div class="selection">
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
                            <template v-else-if="!hasSelection">
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
                <template v-slot:controls
                    v-if="searchable">
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
                            <span v-html="highlight(displayLabel(option))"/>
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
import CoreSelect from '../renderless/VueSelect.vue';
import Tag from './Tag.vue';

library.add(faCheck);

export default {
    name: 'VueSelect',

    directives: { focus, clickOutside },

    components: {
 CoreSelect, Dropdown, DropdownIndicator, Tag 
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
};
</script>

<style lang="scss">
    .dropdown.vue-select {
        .button.input {
            min-height: 2.25em;
            height: unset;

            .selection {
                max-width: calc(100% - 2.5em);
                overflow-x: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: left;

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
                    right: 1.5rem;
                    top: 0.55rem;
                }

                .is-loading {
                    -webkit-animation: spinAround .5s infinite linear;
                    animation: spinAround .5s infinite linear;
                    border: 2px solid #dbdbdb;
                    border-radius: 290486px;
                    border-right-color: transparent;
                    border-top-color: transparent;
                    content: "";
                    display: block;
                    height: 1em;
                    position: relative;
                    width: 1em;
                    position: absolute!important;
                    right: 1.7rem;
                    top: .55em;
                    z-index: 4;
                }
            }
        }

        .dropdown-menu {
            .dropdown-content {
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
                        z-index: 1;
                        right: 0.6rem;
                    }

                    .icon.selected {
                        position: absolute;
                        z-index: 1;
                        right: 0.6rem;
                    }
                }
            }
        }
    }
</style>
