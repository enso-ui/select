<template>
    <vue-select :i18n="i18n"
        :isRTL="isRTL"
        :error-handler="errorHandler"
        :source="source ? route(source) : null"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import VueSelect from './VueSelect.vue';
import { mapGetters } from 'vuex'

export default {
    name: 'EnsoSelect',

    inject: ['errorHandler', 'i18n'],

    computed:{
        ...mapGetters('preferences', ['isRTL']),
    },

    components: { VueSelect },

    props: {
        source: {
            type: String,
            default: null,
        },
    },

    methods: {
        clear() {
            this.$refs.select.clear();
        },
    },
};
</script>
