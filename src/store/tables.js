const { create } = require('xmlbuilder')
const PRECISION = 4
/**
 * this function generates the
 *
 */
export function designspaceTable (axes, cells) {
  let root = create('rules', {headless: true})

  cells.forEach(group => {
    let substitution = group.substitution
    let cells = group.cells
    let rule = root.ele('rule', {name: substitution.glyphs.map(g => g.name).join('+')})

    cells.forEach(cell => {
      let conditionset = rule.ele('conditionset')

      cell.coordinates.forEach((pair, i) => {
        conditionset = conditionset.ele('condition', {
          name: axes[i].name,
          minimum: pair[0], // TODO: Multiply Through to get User Coordinates.
          maximum: pair[1]  // TODO: Multiply Through to get User Coordinates.
        }).up()
      })

      rule = conditionset.up()
    })

    rule = rule.ele('sub', {'name': substitution.glyphs[0].name, 'with': substitution.glyphs[1].name}).up()

    root = rule.up()
  })

  return [root.end({pretty: true})]
}

/**
 *
 *
 */
export function ttxTable (axes, cells) {
  let script_offset = 0
  let feature_offset = 0
  let lookup_offset = 0


  let GSUB = create('GSUB', {headless: true})
  GSUB.ele('Version', {value: "0x00010001"})

  // STATIC: Generate Scripts List
  GSUB
    .ele('ScriptList')
      .ele('ScriptRecord', {index: script_offset})
        .ele('ScriptTag', {value: "DFLT"}).up()
        .ele('Script')
          .ele('DefaultLangSys')
            .ele('ReqFeatureIndex', {value: '65535'}).up()
            .ele('FeatureIndex', {index: 0, value: 0}).up()
          .up()
        .up()
      .up()
    .up()

  // STATIC: Generate Feature List
  GSUB
    .ele('FeatureList')
      .ele('FeatureRecord', {index: feature_offset})
        .ele('FeatureTag', {value: "rvrn"}).up()
        .ele('Feature')
          .com(`LookupCount=0`)
        .up()
      .up()
    .up()


  // THIS IS FINE: Generate lookup list
  let lookuplist = GSUB.ele('LookupList')

  cells.forEach((group, i) => {
    let substitution = group.substitution
    let lookup = lookuplist.ele('Lookup', {'index': lookup_offset + i})

    lookup.ele('LookupType', {value: 1}).up()
    lookup.ele('LookupFlag', {value: 0}).up()

    let subst = lookup.ele('SingleSubst', {index: 0, Format: 2})

    subst.ele('Substitution', {in: substitution.glyphs[0].name, out: substitution.glyphs[1].name}).up()
  });

  let rects = {}

  let getKey = (cell) => {
    return cell.coordinates.reduce((k, pair) => `${k}:${pair.map(coordinate => coordinate.toFixed(PRECISION)).join(',')}`, '')
  }

  // Unify all of the rectangles across substitutions.
  // Otherwise only the first substitution applies, and the rest are dropped.
  cells.forEach((group, lookup_index) => {
    let substitution = group.substitution;
    let cells = group.cells;

    cells.forEach((cell) => {
      let key = getKey(cell)

      if (typeof rects[key] === 'undefined') {
        // we haven't seen this cell yet! Make a new index.
        rects[key] = {
          coordinates: cell.coordinates,
          lookups: [lookup_index]
        }

      } else {
        // we've already seen it. Add this lookup to the cell.
        rects[key].lookups.push(lookup_index)
      }
    })
  });

  // Write the feature variations table
  let featureVariations = GSUB.ele('FeatureVariations')
  let global_index = 0

  featureVariations.ele('Version', {value: '0x00010000'})

  Object.values(rects).forEach((rect, rect_index) => {
    let record = featureVariations.ele('FeatureVariationRecord', {index: rect_index})
    let conditionset = record.ele('ConditionSet')

    rect.coordinates.forEach((pair, index) => {
      let table = conditionset.ele('ConditionTable', {index: index, Format: 1})

      table.ele('AxisIndex', {value: index}).up()
      table.ele('FilterRangeMinValue', {value: pair[0].toFixed(PRECISION)}).up()
      table.ele('FilterRangeMaxValue', {value: pair[1].toFixed(PRECISION)}).up()
    })

    conditionset.up()

    let featureSubstitution = record.ele('FeatureTableSubstitution')
    featureSubstitution.ele('Version', {value: '0x00010000'}).up()

    let features = featureSubstitution
      .ele('SubstitutionRecord', {index: 0})
      .ele('FeatureIndex', {value: 0}).up()
      .ele('Feature');

    rect.lookups.forEach((index, j) => {
      features.ele('LookupListIndex', {index: j, value: lookup_offset + index}).up()
    });
  })

  return [GSUB.end({pretty:true})]

}