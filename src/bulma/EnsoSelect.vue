<template>
    <vue-select v-bind="$attrs"
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

<script>
import VueSelect from './VueSelect.vue';

export default {
    name: 'EnsoSelect',

    components: { VueSelect },

    inject: ['errorHandler', 'i18n', 'route'],

    props: {
        source: {
            type: String,
            default: null,
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
            this.$refs.select.hide();
        },
        show() {
            this.$refs.select.show();
        },
    },
};
</script>
