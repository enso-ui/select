<template>
    <div class="vue-select tags has-addons">
        <span class="tag">
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

    emits: ['deselect'],
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
            display: inline-flex;
            align-items: center;
            [dir='ltr'] & {
                padding: 0.35em 0 0.35em 0.5em;
            }
            [dir='rtl'] & {
                padding: 0.35em 0.5em 0.35em 0;
            }
            min-height: 1.75em;
            margin: 0.075em 0 0.075em;

            .tag-label {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .tag.is-delete {
                flex: none;
            }
        }
    }

</style>
