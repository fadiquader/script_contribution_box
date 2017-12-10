import React from 'react';

export default function MentionSpan(props) {
    return (
        <span {...props} className={'mention'}>
          {props.children}
        </span>
    );
}