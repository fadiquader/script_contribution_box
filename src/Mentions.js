import React, { PureComponent } from 'react';
import { normalizeSelectedIndex } from './utils';
import { filterPeople } from './MentionBox'


function Mentions({ typeaheadState, onMouseOver, onTypeheadClick, focus }) {
    const typeaheadStyle = {
        position: 'absolute',
        left: typeaheadState.left,
        top: typeaheadState.top
    }
    const firstChar = typeaheadState.text[0];
    const filteredPeople = filterPeople(typeaheadState.text.replace(/^(@|\()/, ''), firstChar);
    const normalizedIndex = normalizeSelectedIndex(typeaheadState.selectedIndex, filteredPeople.length);
    if( filteredPeople.length === 0) {
        return null
    }
    return (
        <ul className={'typeahead'} style={typeaheadStyle}>
            {filteredPeople.map((person, index) => {
                const active = index === normalizedIndex ? 'selectedPerson' : 'person';
                return (
                    <li className={active}
                        onMouseOver={() => onMouseOver(index)}
                        onMouseDown={() => {
                            onTypeheadClick(index) ;
                            focus();
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            onTypeheadClick(index) ;
                        }}
                        key={`mention_${index}`}>
                        {person}
                    </li>
                );
            })}
            {firstChar === '@' &&
            <li className="add-character" onMouseDown={() => onTypeheadClick(-1)}>
                <span>Add Character</span>
            </li>}
        </ul>
    );
}

export default Mentions;