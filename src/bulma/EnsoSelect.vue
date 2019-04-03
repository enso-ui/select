<template>
    <vue-select :i18n="i18n"
        :error-handler="errorHandler"
        :source="source ? route(source) : null"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import VueSelect from './VueSelect.vue';

export default {
    name: 'EnsoSelect',

    inject: ['errorHandler', 'i18n'],

    components: { VueSelect },

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
    },
};
</script>
