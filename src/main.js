import Vue from 'vue'
import App from './App.vue'
import MapSearchVue from './lib/index.js'
// import MapSearchVue from '../dist/map-search-vue.js'
Vue.use(MapSearchVue)

new Vue({
  el: '#app',
  render: h => h(App)
})
