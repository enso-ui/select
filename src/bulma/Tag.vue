<template>
    <div class="vue-select tags has-addons">
        <span class="tag is-link">
            {{ label }}
        </span>
        <a class="tag is-delete"
            @click="$emit('deselect')"
            v-if="!disabled"/>
    </div>
</template>

<script>
export default {
    name: 'Tag',

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
        margin-right: 0.3em;
        [dir='rtl'] & {
                margin-left: 0.3em;
                margin-right: unset;
            }

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
