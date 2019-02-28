<template>
    <core-select v-bind="$attrs"
        v-on="$listeners">
        <template v-slot:default="{
                disableClear, taggable, disabled, readonly, multiple, loading,
                visibleDropdown, visibleClearControl, selection, hasOptions,
                hasSelection, trackBy, position, options, select, deselect,
                i18n, displayLabel, isSelected, highlight, updatePosition,
                hideDropdown, clear, selectBindings, selectEvents, filterBindings,
                filterEvents, taggableEvents
            }">
            <div :class="['dropdown', { 'is-active': visibleDropdown }]"
                v-click-outside="hideDropdown">
                <div class="dropdown-trigger">
                    <fieldset class="control-input input"
                        :class="{ 'is-danger': hasError }"
                        tabindex="0"
                        v-bind="selectBindings"
                        v-on="selectEvents">
                        <div class="select-value">
                            <div class="field is-grouped is-grouped-multiline">
                                <div class="control"
                                    v-if="multiple">
                                    <slot name="selection"
                                        :selection="selection"
                                        :display-label="displayLabel"
                                        :deselect="deselect"
                                        :track-by="trackBy">
                                        <tag v-for="value in selection"
                                            :disabled="readonly || disabled"
                                            :label="displayLabel(value)"
                                            :key="value[trackBy]"
                                            @deselect="deselect(value)"/>
                                    </slot>
                                </div>
                                <input class="input select-input"
                                    type="text"
                                    :placeholder="i18n(placeholder)"
                                    v-bind="filterBindings"
                                    v-on="filterEvents"
                                    v-if="visibleDropdown">
                            </div>
                            <div v-if="!visibleDropdown">
                                <span v-if="!multiple && hasSelection">
                                    <slot name="selection"
                                        :selection="selection"
                                        :display-label="displayLabel"
                                        :deselect="deselect">
                                        {{ displayLabel(selection) }}
                                    </slot>
                                </span>
                                <span v-if="!hasOptions">
                                    {{ i18n(labels.noOptions) }}
                                </span>
                                <span v-else-if="!hasSelection">
                                    {{ i18n(placeholder) }}
                                </span>
                            </div>
                            <span class="is-loading"
                                v-if="loading"/>
                            <a class="delete is-small"
                                v-if="visibleClearControl"
                                @mousedown.prevent.self="clear"/>
                            <span class="icon is-small angle"
                                :aria-hidden="visibleDropdown">
                                <fa icon="angle-up"/>
                            </span>
                        </div>
                    </fieldset>
                </div>
                <div class="dropdown-menu">
                    <div class="dropdown-content">
                        <slot name="options"
                            :options="options"
                            :display-label="displayLabel"
                            :is-selected="isSelected"
                            :highlight="highlight">
                            <a class="dropdown-item"
                                v-for="(option, index) in options"
                                :key="option[trackBy]"
                                :class="{ 'is-active': position === index }"
                                @mouseenter="updatePosition(index)"
                                @click="select()">
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
                    </div>
                </div>
            </div>
        </template>
    </core-select>
</template>

<script>
import vClickOutside from 'v-click-outside';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faAngleUp }
    from '@fortawesome/free-solid-svg-icons';
import CoreSelect from '../renderless/VueSelect.vue';
import Tag from './Tag.vue';

library.add([faCheck, faAngleUp]);

export default {
    directives: {
        clickOutside: vClickOutside.directive,
    },

    components: { CoreSelect, Tag },

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

<style lang="scss" scoped>
    .icon.angle {
        transition: transform .300s ease;

        &[aria-hidden="true"] {
            transform: rotate(180deg);
        }
    }

    .dropdown {
        width: 100%;

        .dropdown-trigger {
            width: 100%;

            fieldset {
                min-width: 1em;
            }

            .control-input {
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
                    cursor: pointer;

                    .field.is-grouped.is-grouped-multiline {
                        .select-input {
                            border: 0;
                            height: 1.4em;
                            margin-top: 0.05em;
                            box-shadow: unset;
                            padding: 0;
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
                        right: 0.6rem;
                    }

                    .delete {
                        position: absolute;
                        right: 1.7rem;
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
