import React from 'react';

export default function MentionSpan(props) {
    const {
        dir
    } = props;
    return (
        <span dir={dir}
              className={'parenthes-1'}>
          {props.children}
        </span>
    );
}