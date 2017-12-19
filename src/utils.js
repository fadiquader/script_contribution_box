
export function normalizeSelectedIndex(selectedIndex, max) {
    let index = selectedIndex % max;
    if (index < 0) {
        index += max;
    }
    return index;
}


// const data = {
//     '@': [],
//     '(': [
//         { name: 'V.O' },
//         { name: 'O.C' },
//         { name: 'O.S' }
//     ]
// }
export function filterPeople(query, t, data) {
    return data[t].filter(person => {
        return person.name.toLowerCase().startsWith(query.toLowerCase());
    });
}
