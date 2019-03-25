<template>
    <s-tag class="vue-select tags has-addons" :isRTL='isRTL'>
        <span class="tag is-link">
            {{ label }}
        </span>
        <a class="tag is-delete"
            @click="$emit('deselect')"
            v-if="!disabled"/>
    </s-tag>
</template>

<script>
import {directionSwitch} from '../mixins/directionSwitch';
import STag from "./styled/STag";

export default {
    name: 'Tag',

    mixins: [ directionSwitch ],

    components:{
        STag
    },

    props: {
        label: {
            type: String,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: true,
        },
    },
};
</script>

<style lang="scss">
    .vue-select.tags {
        /* margin-right: 0.3em; */

        &:last-child {
            margin-bottom: 0;
        }

        .tag {
            padding: 0.5em;
            height: 1.35em;
            font-size: 1em;
            margin: 0.075em 0 0.075em;

            &:not(body).is-delete {
                width: 1.4em;
            }
        }
    }
</style>
