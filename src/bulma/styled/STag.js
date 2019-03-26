import styled from 'vue-styled-components';

const styleProps = {
    isRTL: Boolean,
    };

const STag = styled('div', styleProps)`
[class*='vue-select tags'] {
    ${props => props.isRTL ? 'margin-left' : 'margin-right'}: 0.3em;
}
`;

export default STag;