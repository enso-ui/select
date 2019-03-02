<template>
    <core-select v-bind="$attrs"
        v-on="$listeners">
        <template v-slot:default="{
                multiple, taggable, loading, closedDropdown, disableClear, visibleClearControl,
                hasOptions, query, options, hasSelection, selection, trackBy, position, i18n,
                displayLabel, isSelected, highlight, dropdownBindings, dropdownEvents,
                dropdownTriggerEvents, filterEvents, filterBindings, itemEvents, selectionBindings,
                selectionEvents, clearEvents, taggableEvents,
            }">
            <dropdown class="vue-select"
                width="100%"
                v-bind="dropdownBindings"
                v-on="dropdownEvents">
                <template v-slot:dropdown-trigger>
                    <div class="input dropdown-trigger-input"
                        :class="{ 'is-danger': hasError }"
                        v-on="dropdownTriggerEvents">
                        <div class="select-value">
                            <div class="field is-grouped is-grouped-multiline">
                                <template v-if="hasSelection">
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
                                            <template v-else-if="selection && closedDropdown">
                                                {{ displayLabel(selection) }}
                                            </template>
                                        </slot>
                                    </div>
                                </template>
                                <span v-else-if="!hasOptions && !query">
                                    {{ i18n(labels.noOptions) }}
                                </span>
                                <template v-if="hasOptions || query">
                                    <input class="input select-filter"
                                        type="text"
                                        :placeholder="i18n(placeholder)"
                                        v-bind="filterBindings"
                                        v-on="filterEvents"
                                        v-if="!closedDropdown"
                                        v-focus>
                                    <span v-else-if="!hasSelection">
                                        {{ i18n(placeholder) }}
                                    </span>
                                </template>
                            </div>
                            <span class="is-loading"
                                v-if="loading"/>
                            <a class="delete is-small"
                                v-on="clearEvents"
                                v-if="visibleClearControl"/>
                            <dropdown-indicator class="is-small"
                                :open="!closedDropdown"/>
                        </div>
                    </div>
                </template>
                <template v-slot:dropdown-content>
                    <slot name="options"
                        :options="options"
                        :display-label="displayLabel"
                        :is-selected="isSelected"
                        :highlight="highlight">
                        <a class="dropdown-item"
                            v-for="(option, index) in options"
                            :key="option[trackBy]"
                            :class="{ 'is-active': position === index }"
                            v-on="itemEvents(index)">
                            <span v-html="highlight(displayLabel(option))"/>
                            <span class="label tag"
                                :class="isSelected(option) ? 'is-warning' : 'is-success'"
                                v-if="index === position && !disableClear">
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
        Dropdown, CoreSelect, DropdownIndicator, Tag,
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
            }),
        },
        placeholder: {
            type: String,
            default: 'Choose',
        },
    },
};
</script>

<style lang="scss">
    .dropdown.vue-select {
        width: 100%;
        .dropdown-trigger {
            width: 100%;

            fieldset {
                min-width: 1em;
            }

            .dropdown-trigger-input {
                justify-content: flex-start;
                width: 100%;
                min-height: 2.25em;
                height: auto;
                align-items: baseline;
                padding: calc(.375em - 1px) calc(.625em - 1px);
                padding-top: calc(0.375em - 1px);
                padding-right: calc(0.625em - 1px);
                padding-bottom: calc(0.375em - 1px);
                padding-left: calc(0.625em - 1px);
                cursor: pointer;

                &[disabled] {
                    border-color: inherit;

                    .select-value {
                        cursor: unset;
                    }
                }

                .select-value {
                    max-width: calc(100% - 2.5em);
                    overflow-x: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: left;

                    .field.is-grouped.is-grouped-multiline {
                        .select-filter {
                            border: 0;
                            padding-left: 0;
                            height: 1.4em;
                            margin-top: 0.1em;
                            box-shadow: unset;
                            -webkit-box-shadow: unset;
                            width: fit-content;
                            background-color: inherit;
                        }

                        .control:last-child,
                        .control:not(:last-child) {
                            margin-bottom: 0;
                            display: contents;

                            .tags:not(:last-child) {
                                margin-bottom: 0;
                            }
                        }
                    }

                    .angle {
                        position: absolute;
                        top: 0.55rem;
                        right: 0.4rem;
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
        }

        .control {
            width: 100%;
        }

        .dropdown-menu {
            width: 100%;
            min-width: 1em;

            .dropdown-content::-webkit-scrollbar {
                display: none;
            }

            .dropdown-content {
                max-height: 13rem;
                overflow-y: auto;

                a.dropdown-item {
                    text-overflow: ellipsis;
                    overflow-x: hidden;
                    padding-right: 2rem;

                    .label.tag {
                        position: absolute;
                        padding: 0.3rem;
                        height: 1.3rem;
                        z-index: 1;
                        right: 1rem;
                    }

                    .icon.selected {
                        position: absolute;
                        z-index: 1;
                        right: 1rem;
                    }
                }
            }
        }
    }
</style>
