import React from 'react';
import ReactDOM from 'react-dom';
import ScriptEditor from './ScriptEditor';
import CharacterDetails from './CharacterDetails';

import registerServiceWorker from './registerServiceWorker';

const App = () => {
    const characters = [
        {
            name: 'Fadi Quader',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        },
        {
            name: 'فادي قويدر',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        },
        {
            name: 'Ellie Pritts',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        },
        {
            name: 'Maxime Santerre',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        },
        {
            name: 'Melody Ma',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        },
        {
            name: 'Kris Hartvigsen',
            description: "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
            gender: "Male",
            occupation: "Jedi Knight",
            race: "White/Caucasian",
            screenplay_display_name: "Ben"
        }
    ];
    return <ScriptEditor characters={characters}
                         onAddCharacter={character => characters.push({ name: 'sdfsdfd'})}
                         characterComponent={CharacterDetails}
    />
}
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
