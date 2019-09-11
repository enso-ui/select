<template>
    <vue-select :i18n="i18n"
        :error-handler="errorHandler"
        :source="source ? route(source) : null"
        v-bind="$attrs"
        v-on="$listeners"
        ref="select">
         <template v-slot:option="props">
            <slot name="option"
                v-bind="props"/>
        </template>
    </vue-select>
</template>

<script>
import VueSelect from './VueSelect.vue';

export default {
    name: 'EnsoSelect',

    inject: ['errorHandler', 'i18n', 'route'],

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
        fetch() {
            this.$refs.select.fetch();
        },
    },
};
</script>
