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
    const initialState = `
    {
 "entityMap": {
  "0": {
   "type": "MENTION",
   "mutability": "IMMUTABLE",
   "data": {
    "name": "Maxime Santerre",
    "description": "A shabby old desert-rat-of-a-man with an ancient leathery face, cracked and weathered by exotic climates, set off by dark, penetrating eyes and a scraggly white beard. Wears flowing brown robes, carries a lightsaber.",
    "gender": "Male",
    "occupation": "Jedi Knight",
    "race": "White/Caucasian",
    "screenplay_display_name": "Ben"
   }
  }
 },
 "blocks": [
  {
   "key": "1g3ru",
   "text": "sdfdsf sdfds Maxime Santerre ",
   "type": "unstyled",
   "depth": 0,
   "inlineStyleRanges": [],
   "entityRanges": [
    {
     "offset": 13,
     "length": 15,
     "key": 0
    }
   ],
   "data": {}
  }
 ]
}`;
    return <ScriptEditor initialState={null}
                         characters={characters}
                         onAddCharacter={character => characters.push({ name: 'sdfsdfd'})}
                         characterItemComponent={null}
                         characterComponent={CharacterDetails}
    />
}
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
