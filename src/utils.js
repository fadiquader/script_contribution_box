export const filterArray = (array, text) => {
    var filteredArray = null;
    filteredArray = array.filter(object => {
        const query = text.toLowerCase();
        return object.toLowerCase().startsWith(query);
    });
    return filteredArray;
};


export function normalizeSelectedIndex(selectedIndex, max) {
    let index = selectedIndex % max;
    if (index < 0) {
        index += max;
    }
    return index;
}

export function filterPeople(query) {
    const PEOPLE = [
        'Justin Vaillancourt',
        'Ellie Pritts',
        'Maxime Santerre',
        'Melody Ma',
        'Kris Hartvigsen'
    ];

    return PEOPLE.filter(person => {
        return person.toLowerCase().startsWith(query.toLowerCase());
    });
}