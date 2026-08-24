<template>
    <div class="vue-select"
        :class="$attrs.class">
        <core-select v-bind="$attrs"
            ref="select">
            <template #default="{
                    allowsSelection, canAddTag, clearControl, clearEvents,
                    dropdownDisabled, disableClear, disabled, displayLabel,
                    filterBindings, filterEvents, hasOptions, hasSelection,
                    highlight, i18n, isSelected, itemEvents, modeSelector,
                    modeBindings, modeEvents, multiple, needsSearch, noResults,
                    reload, loading, options, query, reset,
                    selection: currentSelection,
                    selectionBindings, selectionEvents, taggable,
                    taggableBindings, taggableEvents, trackBy,
                }">
                <dropdown :disabled="dropdownDisabled"
                    :disable-controls="!allowsSelection"
                    :manual="multiple || canAddTag"
                    :opens-up="opensUp"
                    @hide="reset()"
                    ref="dropdown">
                    <template #trigger="{
                            triggerEvents, open, opensUp: dropdownOpensUp,
                        }">
                        <button class="button input"
                            :class="[
                                { 'has-error': hasError },
                                { 'is-open': open },
                                { 'is-multiple': multiple },
                                { 'is-successful': isSuccess },
                                { 'has-warning': hasWarning },
                            ]"
                            type="button"
                            :disabled="disabled"
                            @click="reload"
                            v-on="triggerEvents"
                            ref="trigger">
                            <div class="control-display"
                                :class="{ 'with-clear-button': !disableClear }">
                                <slot name="selection"
                                    :selection="currentSelection"
                                    :selection-bindings="selectionBindings"
                                    :selection-events="selectionEvents">
                                    <div class="field is-grouped is-grouped-multiline"
                                        v-if="hasSelection">
                                        <div class="control">
                                            <template v-if="multiple">
                                                <tag v-bind="selectionBindings(value)"
                                                    v-for="value in currentSelection"
                                                    :key="value[trackBy]"
                                                    v-on="selectionEvents(value)"/>
                                            </template>
                                            <span class="selection-label"
                                                v-else>
                                                {{ displayLabel(currentSelection) }}
                                            </span>
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
                            <dropdown-indicator
                                :open="open"
                                :opens-up="dropdownOpensUp"
                                v-if="!dropdownDisabled"/>
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
                            <template #default>
                                <slot name="option"
                                    :option="option"
                                    :highlight="highlight">
                                    <!-- eslint-disable-next-line vue/no-v-html -->
                                    <span v-html="highlight(displayLabel(option))"/>
                                </slot>
                                <span class="icon is-small selected has-text-dark"
                                    v-if="isSelected(option)">
                                    <fa :icon="faCheck"/>
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

<script setup>
import { computed, useTemplateRef } from 'vue';
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { focus as vFocus } from '@enso-ui/directives';
import { Dropdown, DropdownItem } from '@enso-ui/dropdown/bulma';
import DropdownIndicator from '@enso-ui/dropdown-indicator';
import SearchMode from '@enso-ui/search-mode/bulma';
import CoreSelect from '../renderless/CoreSelect.vue';
import Tag from './Tag.vue';

defineOptions({
    name: 'VueSelect',
    inheritAttrs: false,
});

defineProps({
    hasError: {
        type: Boolean,
        default: false,
    },
    hasWarning: {
        type: Boolean,
        default: false,
    },
    isSuccess: {
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
    opensUp: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: 'Pick an option',
    },
});

const selectRef = useTemplateRef('select');
const dropdownRef = useTemplateRef('dropdown');
const selection = computed(() => (selectRef.value ? selectRef.value.selection : null));

const clear = () => selectRef.value.clear();
const fetch = () => selectRef.value.fetchIfServerSide();
const hide = () => dropdownRef.value.hide();
const show = () => dropdownRef.value.show();

defineExpose({
    clear, fetch, hide, selection, show,
});
</script>

<style lang="scss" src="./styles/vue-select.scss"></style>
