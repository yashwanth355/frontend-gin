import React from 'react';
function Iframe(props) {
    return (<div style={{ height: '100%' }} dangerouslySetInnerHTML={ {__html:  props.iframe}} />);
}

export default Iframe;