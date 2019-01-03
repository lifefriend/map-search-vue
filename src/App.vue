<template>
  <div id="app">
    <div id="btn"> 
      <div>
        <input type="text" v-model="searchTxt"/>
        <input type="button" @click="search" value="search">
      </div>
      <div>
        <input type="text" v-model="suggestTxt"/>
        <input type="button" @click="suggest" value="suggest">
      </div>
      <div id="result"></div>
    </div>
    <map-search-vue @map-info="whenChange" ref="map"></map-search-vue>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      searchTxt:'',
      suggestTxt:''
    };
  },
  methods: {
    whenChange(item) {
      console.log("whenChange", item);
      document.getElementById('result').innerHTML = JSON.stringify(item)
      if(item.type==="geocode-success"){
        let data = item.data;
        let address = data.formatted_address;
        if (data.formatted_address) {
          address = data.formatted_address.split(" ")[0];
        }
        let rd = splitAddress(address);
        let opts = {
          name: data.addressComponent.poi,
          address: data.formatted_address,
          distCode: data.cityCode
        };
        opts = Object.assign(opts, rd);
        console.log('opts: ', opts);
      }
    },
    search(){
      this.$refs.map.search(this.searchTxt);
    },
    suggest(){
      this.$refs.map.suggest(this.suggestTxt);
    }
  }
};
function splitAddress(str) {
  let reg = null;
  let result = null;
  try {
    reg = new RegExp(
      "((?<province>[^省]+省|.+自治区)|上海|北京|天津|重庆)(?<city>[^市]+市|.+自治州)(?<county>[^县]+县|.+区|.+镇|.+局)(?<town>[^区]+区|.+镇)(?<village>.*)"
    );
    let rd = reg.exec(str) || {};
    result = rd.groups;
  } catch (error) {
    reg = /([^省]+)(省)([^市]+)(市)([^区]+)(区)(.*)/;
    let rd = reg.exec(str);
    if (rd)
      result = {
        province: str.replace(reg, "$1") + str.replace(reg, "$2"),
        city: str.replace(reg, "$3") + str.replace(reg, "$4"),
        county: str.replace(reg, "$5") + str.replace(reg, "$6"),
        village: str.replace(reg, "$7")
      };
  }

  return result;
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#btn {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 9;
  background: #fff;
}
</style>
