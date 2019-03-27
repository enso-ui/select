import styled from 'vue-styled-components';

const styleProps = {
    isRTL: Boolean,
};

const SVueSelect = styled('div', styleProps)`
  .dropdown.vue-select .dropdown-trigger .button.input .control-display {
    text-align: ${props => (props.isRTL ? 'left' : 'right')};
  }

  .dropdown.vue-select
    .dropdown-trigger
    .button.input
    .control-display
    .delete {
    ${props => (props.isRTL ? 'right' : 'left')}: 1.5rem;
  }

  .dropdown.vue-select
    .dropdown-trigger
    .button.input
    .control-display
    .is-loading {
    ${props => (props.isRTL ? 'border-right' : 'border-left')}-color: transparent;
    ${props => (props.isRTL ? 'right' : 'left')}: 1.7rem;
  }

  .dropdown.vue-select
    .dropdown-menu
    .dropdown-content
    .dropdown-item
    .label.tag {
    ${props => (props.isRTL ? 'right' : 'left')}: 0.6rem;
  }

  .dropdown.vue-select
    .dropdown-menu
    .dropdown-content
    .dropdown-item
    .icon.selected {
    ${props => (props.isRTL ? 'right' : 'left')}: 0.6rem;
  }
`;

export default SVueSelect;
