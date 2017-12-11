
export function normalizeSelectedIndex(selectedIndex, max) {
    let index = selectedIndex % max;
    if (index < 0) {
        index += max;
    }
    return index;
}


const data = {
    '@': [
        'Justin Vaillancourt',
        'Ellie Pritts',
        'Maxime Santerre',
        'Melody Ma',
        'Kris Hartvigsen'
    ],
    '(': [
        'V.O',
        'V.C',
        'V.S'
    ]
}
export function filterPeople(query, t) {
    // console.log('query ', query)

    return data[t].filter(person => {
        return person.toLowerCase().startsWith(query.toLowerCase());
    });
}
