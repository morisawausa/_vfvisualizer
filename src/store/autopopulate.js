import FuzzySearch from 'fuzzy-search'

const SUBSTITUTION_PATTERN = '.sub_';

function getBaseGlyph(glyphname, glyphs) {
  for (let i = 0; i < glyphs.length; i += 1) {
    if (glyphs[i].name == glyphname) {
      return glyphs[i];
    }
  }

  return -1;
}

export function autopopulate(font) {
  let glyphs = font.characterSet.map(pt => font.glyphForCodePoint(pt));
  let searcher = new FuzzySearch(glyphs, ['name'], {caseSensitive: true})
  let candidates = searcher.search(SUBSTITUTION_PATTERN);
  // NOTE: Probably sort the candidates for reproducability
  let groups = {};

  candidates.forEach(glyph => {
    let parts = glyph.name.split(SUBSTITUTION_PATTERN)
    let base_glyph_name = parts[0];
    /**
     * Getting the naming convention thing right is pretty complex.
     * From any given name, we need to know how to get the base name.
     * So we need some kind of consistent syntax for modifiers.
     */
    let class_name = parts.slice(1).join("");

    if (typeof groups[base_glyph_name] === 'undefined') {
      let base_glyph = getBaseGlyph(base_glyph_name, glyphs);

      if (base_glyph === -1) {
        console.log(`Autopopulator: Couldn't find a baseglyph named "${base_glyph_name}" for substitution named "${glyph.name}"`);

      } else {
        // create a new entry
        let entry = {
          classname: SUBSTITUTION_PATTERN + class_name,
          glyphs: [base_glyph, glyph]
        }

        groups[base_glyph_name] = entry;

      }

    } else {

      groups[base_glyph_name].glyphs.push(glyph);

    }
  });

  let classes = {}

  Object.values(groups).forEach(group => {
    let group_key = group.classname + ':' + group.glyphs.length;

    if (typeof classes[group_key] === 'undefined') {

      classes[group_key] = {
        glyphs: group.glyphs,
        subordinates: []
      };

    } else {

      classes[group_key].subordinates.push(group.glyphs);

    }
  })

  return Object.values(classes);
}
