// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'
const he = require('he')

Vue.config.productionTip = false

Vue.filter('unicode', function (glyph) {
  if (glyph.codePoints.length > 0) {
    return he.decode(`&#${glyph.codePoints[0]};`)
  } else {
    return ''
  }
})

Vue.filter('percent', function (decimal) {
  return (decimal * 100) + '%'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
