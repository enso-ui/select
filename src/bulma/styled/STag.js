import styled from 'vue-styled-components';

const styleProps = {
    isRTL: Boolean,
    };

const STag = styled('div', styleProps)`

.vue-select.tags {
    // margin-right: 0.3em;
    // margin-${props => props.isRTL ? 'left' : 'right'}: 0.3em;
  }

`;

export default STag;