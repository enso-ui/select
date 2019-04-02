<template>
    <s-tag :isRTL='isRTL'>
        <div class="vue-select tags has-addons">
            <span class="tag is-link">
                {{ label }}
            </span>
            <a class="tag is-delete"
                @click="$emit('deselect')"
                v-if="!disabled"/>
        </div>
    </s-tag>
</template>

<script>
import STag from "./styled/STag";

export default {
    name: 'Tag',

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
        isRTL: {
            type: Boolean,
            default: false,
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
