<template>
    <vue-select :i18n="__"
        :error-handler="handleError"
        :source="source ? route(source) : null"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import VueSelect from './VueSelect.vue';

export default {
    components: { VueSelect },

    props: {
        source: {
            type: String,
            default: null,
        },
    },
};
</script>
