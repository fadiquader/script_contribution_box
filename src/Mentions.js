import React, { PureComponent } from 'react';
import { normalizeSelectedIndex } from './utils';
import { filterPeople } from './MentionBox'


function Mentions({ typeaheadState, onMouseOver, onTypeheadClick, focus }) {
    const typeaheadStyle = {
        position: 'absolute',
        left: typeaheadState.left,
        top: typeaheadState.top
    }
    const filteredPeople = filterPeople(typeaheadState.text.replace(/^(@|\()/, ''));
    const normalizedIndex = normalizeSelectedIndex(typeaheadState.selectedIndex, filteredPeople.length);
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
                        key={`mention_${index}`}>
                        {person}
                    </li>
                );
            })}
        </ul>
    );
}

export default Mentions;