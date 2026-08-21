<template>
    <vue-select :http="http"
        :i18n="i18n"
        :error-handler="errorHandler"
        :source="source ? route(source) : null"
        ref="select">
         <template #option="props">
            <slot name="option"
                v-bind="props"/>
        </template>
    </vue-select>
</template>

<script setup>
import { computed, inject, useTemplateRef } from 'vue';
import VueSelect from './VueSelect.vue';

defineOptions({
    name: 'EnsoSelect',
});

const errorHandler = inject('errorHandler');
const http = inject('http');
const i18n = inject('i18n');
const route = inject('route');

defineProps({
    source: {
        type: String,
        default: null,
    },
});

const selectRef = useTemplateRef('select');
const selection = computed(() => (selectRef.value ? selectRef.value.selection : null));

const clear = () => selectRef.value.clear();
const fetch = () => selectRef.value.fetch();
const hide = () => selectRef.value.hide();
const show = () => selectRef.value.show();

defineExpose({
    clear, fetch, hide, selection, show,
});
</script>
