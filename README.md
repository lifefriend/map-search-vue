# map-search-vue
[![npm](https://img.shields.io/npm/v/map-search-vue.svg)](https://www.npmjs.com/package/map-search-vue)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Maptalks search components for Vue 2.x

## Get Start

## Installation

```
npm install map-search-vue --save
```

```
yarn add map-search-vue
```

### Initialization

```javascript
import Vue from 'vue'
import MapSearchVue from 'map-search-vue'

Vue.use(MapSearchVue)
```


### Usage

```vue
<template>
  <map-search-vue></map-search-vue>
</template>
```


## Quick Examples

### Map with center marker

```html
<map-search-vue :center=[110,32]></map-search-vue>
```

### Auto GeoCode

```html
<map-search-vue appkey="YOUR_APP_KEY" :autoGeoCode="true"></map-search-vue>
```

## Method

```html
<map-search-vue ref="map" @map-info="whenChange" ></map-search-vue>

vm.$refs.map.search("txt");
vm.$refs.map.suggest("txt");
vm.$refs.map.geocode({x:112,y:32});
```

## Events

| Event Name | Description                          | Parameters                            |
| ---------- | ------------------------------------ | ------------------------------------- |
| map-info   | triggers when search,suggest,geocode | one parameters:{type,coordinate,data} |



### props

| Attribute      | Type    | Description               | Default                                 |
| -------------- | ------- | ------------------------- | --------------------------------------- |
| center         | Array   | initial center of the map | [114.316200103,30.5810841269]           |
| searchExtent   | Array   | Search Range              | [110.58838,29.25286,118.09204,31.98012] |
| appkey         | String  | geocode app key           | ""                                      |
| https          | Boolean | http or https             | true                                    |
| markerInCenter | Boolean | auto center map           | true                                    |
| autoGeoCode    | Boolean | geocode when map change   | false                                   |
| timeout        | Number  | http request timeout      | 6000                                    |