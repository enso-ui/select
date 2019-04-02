import styled from 'vue-styled-components';

const styleProps = {
    isRTL: Boolean,
};

const SVueSelect = styled('div', styleProps)`
  .dropdown.vue-select .dropdown-trigger .button.input .control-display {
    text-align: ${props => (props.isRTL ? 'right' : 'left')};
  }

  .dropdown.vue-select
    .dropdown-trigger
    .button.input
    .control-display
    .delete {
    ${props => (props.isRTL ? 'left' : 'right')}: 1.5rem;
  }

  .dropdown.vue-select
    .dropdown-trigger
    .button.input
    .control-display
    .is-loading {
    ${props => (props.isRTL ? 'border-left-color' : 'border-right-color')}: transparent;
    ${props => (props.isRTL ? 'left' : 'right')}: 1.7rem;
  }

  .dropdown.vue-select
    .dropdown-menu
    .dropdown-content
    .dropdown-item
    .label.tag {
    ${props => (props.isRTL ? 'left' : 'right')}: 0.6rem;
  }

  .dropdown.vue-select
    .dropdown-menu
    .dropdown-content
    .dropdown-item
    .icon.selected {
    ${props => (props.isRTL ? 'left' : 'right')}: 0.6rem;
  }
`;

export default SVueSelect;
