import React from 'react';

export default function MentionSpan(props) {
    const {
        decoratedText,
        entityKey,
        offsetKey,
        dir
    } = props;
    return (
        <span entityKey={entityKey}
              offsetKey={offsetKey}
              dir={dir}
              className={'mention'}>
          {decoratedText}
        </span>
    );
}