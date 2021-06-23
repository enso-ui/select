<template>
    <div class="vue-select tags has-addons">
        <span class="tag is-link">
            <span class="mr-1 tag-label">
                {{ label }}
            </span>
            <a class="tag is-delete"
                @click.stop="$emit('deselect')"
                v-if="!disabled"/>
            </span>
    </div>
</template>

<script>
export default {
    name: 'Tag',

    props: {
        disabled: {
            type: Boolean,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="scss">
    .vue-select.tags {
        max-width: 100%;
        [dir='ltr'] & {
            margin-right: 0.3em;
        }
        [dir='rtl'] & {
            margin-left: 0.3em;
        }

        &:last-child {
            margin-bottom: 0;
        }

        .tag {
            max-width: inherit;
            [dir='ltr'] & {
                padding: 0.5em 0 0.5em 0.5em;
            }
            [dir='rtl'] & {
                padding: 0.5em 0.5em 0.5em 0;
            }
            height: 1.35em;
            font-size: 1em;
            margin: 0.075em 0 0.075em;

            .tag-label {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .tag.is-delete {
                width: 1.4em;
                flex: none;
            }
        }
    }

</style>
