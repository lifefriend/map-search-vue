import MapSearchVue from './map-search-vue.vue'
const mapSearch = {
  install (Vue) {
    Vue.component(MapSearchVue.name, MapSearchVue)
  }
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(mapSearch)
}
export default mapSearch
