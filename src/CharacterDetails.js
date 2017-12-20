import React from 'react';

function CharacterDetails({ character}) {
    const {
        name, screenplay_display_name, gender, description, age, race
    } = character;
    return (
        <div className='character-information'>
            <div className='character-information-title'>Character Information</div>
            <div className="character-information-1">
                <div className="character-img">
                    <img src="http://staging.openscreenplay.com/files/54b30e0b-c7a.png" alt=""/>
                </div>
                <div className="character-data">
                    {name && <p><strong>Name: </strong> { name }</p>}
                    {screenplay_display_name && <p><strong>Screenplay Display Name: </strong> { screenplay_display_name }</p>}
                    {gender && <p><strong>Gender: </strong> { gender }</p>}
                    {age && <p><strong>Age: </strong> { age }</p>}
                    {race && <p><strong>Race: </strong> { race }</p>}
                    {description && <p><strong>Description: </strong> { description }</p>}
                </div>
            </div>
        </div>
    )
}

export default CharacterDetails;