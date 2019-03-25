import styled from 'vue-styled-components';

const styleProps = { 
    isRTL: Boolean,
    };

const SVueSelect = styled('div', styleProps)`

.dropdown.vue-select .dropdown-trigger .button.input .control-display {
  // text-align: right;
  text-align: ${props => props.isRTL ? 'left' : 'right'};
}

.dropdown.vue-select .dropdown-trigger .button.input .control-display .delete {

  // left: 1.5rem;
  ${props => props.isRTL ? 'right' : 'left'}: 1.5rem;

}

.dropdown.vue-select .dropdown-trigger .button.input .control-display .is-loading {

  // border-left-color: transparent;
  border-${props => props.isRTL ? 'right' : 'left'}-color: transparent;

  // left: 1.7rem;
  ${props => props.isRTL ? 'right' : 'left'}: 1.7rem;

}

.dropdown.vue-select .dropdown-menu .dropdown-content .dropdown-item .label.tag {

  // left: 0.6rem;
  ${props => props.isRTL ? 'right' : 'left'}: 0.6rem;
}

.dropdown.vue-select .dropdown-menu .dropdown-content .dropdown-item .icon.selected {

  // left: 0.6rem;
  ${props => props.isRTL ? 'right' : 'left'}: 0.6rem;
}
`;

export default SVueSelect;