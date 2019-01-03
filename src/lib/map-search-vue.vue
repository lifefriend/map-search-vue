<template>
  <div id="map_container"></div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import Axios from "axios";

export default {
  name: "MapSearchVue",
  props: {
    center: {
      type: Array,
      default() {
        return [114.316200103, 30.5810841269];
      }
    },
    searchExtent: {
      type: Array,
      default() {
        return [110.58838, 29.25286, 118.09204, 31.98012];
      }
    },
    appkey: {
      type: String,
      default: "8a7b9aac0db21f9dd995e61a14685f05"
    },
    https: {
      type: Boolean,
      default: true
    },
    markerInCenter: {
      type: Boolean,
      default: true
    },
    autoGeoCode: {
      type: Boolean,
      default: false
    },
    timeout: {
      type: Number,
      default: 6000
    }
  },
  data() {
    return {
      mapInstance: null,
      baseMapUrl: null,
      suggestUrl: null,
      searchUrl: null,
      isGeoCoding: false
    };
  },
  mounted() {
    Axios.defaults.timeout = this.timeout;
    const protocol = this.https ? "https" : "http";
    this.baseMapUrl = `${protocol}://t{s}.tianditu.gov.cn/DataServer`;
    this.suggestUrl = `${protocol}://map.tianditu.gov.cn/data/suggest`;
    this.searchUrl = `${protocol}://map.tianditu.gov.cn/query.shtml`;
    this.$nextTick(() => {
      initMap.call(this);
    });
  },
  methods: {
    notify(type, coordinate, data) {
      this.$emit("map-info", {
        type,
        coordinate,
        data
      });
    },
    setCenter(x,y){
      this.mapInstance.setCoordinates([x, y])
    },
    geocode(coordinate) {
      // 判断上一次geocode是否完成
      if (this.isGeoCoding) return;
      this.isGeoCoding = true;
      const url = `${this.searchUrl}?postStr={"lon":"${coordinate.x}","lat":"${
        coordinate.y
      }","appkey":"${this.appkey}","ver":"1"}&type=geocode`;
      Axios.get(url)
        .then(response => {
          this.isGeoCoding = false;
          const data = response.data.result || {};
          this.notify(
            "geocode-success",
            { x: data.location.lon, y: data.location.lat },
            response.data.result
          );
        })
        .catch(error => {
          this.isGeoCoding = false;
          consoleError(error);
          this.notify(
            "geocode-error",
            { x: 0, y: 0 },
            error
          );
        });
    },
    suggest(txt) {
      const url = `${
        this.suggestUrl
      }?postStr={"yingjiType":1,"sourceType":0,"keyWord":"${txt}","level":12,"mapBound":"${this.searchExtent.join(
        ","
      )}","queryType":"4","count":"12","start":"0"}`;
      Axios.get(url)
        .then(response => {
          this.notify(
            "suggest-success",
            { x: 0, y: 0 },
            response.data.suggests
          );
        })
        .catch(error => {
          consoleError(error);
          this.notify(
            "suggest-error",
            { x: 0, y: 0 },
            error
          );
        });
    },
    search(txt) {
      const url = `${this.searchUrl}?postStr={"keyWord":"${
        txt
      }","level":"12","mapBound":"${this.searchExtent.join(
        ","
      )}","queryType":"1","count":"12","start":"0"}&type=query`;
      Axios.get(url)
        .then(response => {
          this.notify(
            "suggest-success",
            { x: 0, y: 0 },
            response.data.area || response.data.pois
          );
        })
        .catch(function(error) {
          consoleLog(error);
          this.notify(
            "search-error",
            { x: 0, y: 0 },
            error
          );
        });
    }
  }
};
function consoleLog(param) {
  console.log(param);
}
function consoleError(param) {
  console.error(param);
}
function initMap() {
  const baseUrl = this.baseMapUrl;
  const center = this.center;
  const myMap = new maptalks.Map("map_container", {
    center: center,
    zoom: 12,
    minZoom: 3,
    maxZoom: 18,
    zoomInCenter: true,
    attribution: false,
    touchRotate: false,
    touchPitch: false,
    viewHistory: false,
    spatialReference: {
      projection: "EPSG:4326"
    },
    layers: [
      new maptalks.TileLayer("vec_c", {
        tileSystem: [1, -1, -180, 90],
        urlTemplate: baseUrl + "?T=vec_c&x={x}&y={y}&l={z}",
        subdomains: ["1", "2", "3", "4", "5"],
        crossOrigin: "anonymous"
      }),
      new maptalks.TileLayer("cva_c", {
        tileSystem: [1, -1, -180, 90],
        urlTemplate: baseUrl + "?T=cva_c&x={x}&y={y}&l={z}",
        subdomains: ["1", "2", "3", "4", "5"],
        crossOrigin: "anonymous"
      })
    ]
  });
  const markerLyr = new maptalks.VectorLayer("vector").addTo(myMap);
  const centerMarker = new maptalks.Marker(center, {
    id: "outPositionIco",
    draggable: false,
    symbol: {
      markerFile:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAmCAYAAAClI5npAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAmISURBVHjapFhdiF1XFf7W2vucc+89M3f+OjPJND8Tm5hia6hBkUpLUVHwzZdaUfx98UF8EKlPfVEqQhEE+2BBqIqCFFIRFVtKbdGa/iAtbRLatCVp4iQz+ZlJJvfec8/P3nstH86Zm2mbxClu2JcD9+6zvvWtb/3sS/vuewobi8AACCoexKZ+hrZVfJfI7CXiRRB2ECEBcBlKyyG4NwFdYrZDEDsVD6gHcQyK2sjOHsaZZ3+I6y0L3PC7DxP4BzZpf6GVxGlkLRnL1hoiqAbnQshLh6qqzoYgvwL0twAuA1BscV0PwIRCf9xqt780nnbmJ7sJTaQGScQgAC4IvCi8UzgP5FXo9rPiod4g/3ZZDH9OwKP/D4C9xPaRdCz97LbZLnbMJkgThhfBIPfoDT2KSuGcIigAYkAJ7U7HGhvd3uvRw3le3ArgAQDVBwWwM07iX4+Nde7aNT+GhdkYsQEu9RxW1ioMywBRQFWhAIgICgEpgZkRRRG6ExMdZnt/lg1SAr77QQCkIHqk0+nc9aGbu9g2bSEh4OT5ApcGAc4LVAQEAgEgAGCACFAiBCgYQGwtxsdSiOrXK48VAA+ONH4NbZibPvoNEJEh4vs7afq1xZu70cJMjLwIOHW+wFrPwfsAqIBUQRAoCaANAzUVNaDm9cYaRNbG3rt5Smb/bTvzy9nZ52/IwEKSxN/adtN4Z3YyxiB3OHuxRL/wAARMCg0CQKEEQKjxR2vDog0dCoUCqojjGO22u60o3fe7ez73lXhi5wZv7wYgobJsW/emaTo/MxkjBMHymsMgDyAooAKIQiEISlAPKBSMAGYGGzRBUQACAFAlqKomcULtOD+QV9Ht6fZPHrsmAyohJeCb3fFWGlvGhfUSWV57vmHchYDd820cuGUcH1kcw3Q3xspaiddPDXDkxADn1x0iW2NQNGFSkDGMVqezOCwufzmUVx64JgAyyWQURXNpwhgWAf1cIA21qoCoYPd8C1+8ex6fOTiF2ckYRAQvijtXJ/Dki2v420trWL3iYWwTGgJUVYmhxnDKwN2iASCAjXk3AGazkCSxZQbWM4/gpS7AUAWUJAC37R7HPXdMYW4q2XSQsGuuhU8fnMLxpQznLvVgDUHRsEBMUAITw1ibqmjL9fPiwitv1ZohahggmoosGecB57URMgFQggqCKG7d3cH2meSaKl7c1sLitjb++dqVUbbRhtioNsTMxGzbIC6y5dU6tM1v6u4DQlEpVDbpVGkU04mx6LqFJLKM8batC1RzeCPZtU4csDVUXM7o7OG3ATVUJ18dKwtFX1TEBbl6sPkkKAwBy2slKi+ILb8PQH8YcGHdgYmgqiDaVGsIUAic19CKtfrUwQLTY6qFj3D03CyCMKyoW3HOe5FRWK6eZgax4o1TA7yznGP/rvR9AI4vDXByeajWEoiIAL4aAgBBFOIdFua4+sTHxnFzp8B6YXDu+DTKYGAh4VJZuqGowjJDm1cIMaACw4Rj7/Tx1+cvIi8F+3elaCeMXubx+qkBnnhpDSeWh4hMHbaRE0oqouSd+oSqI5OtUq8MYjNFqsMCMhyCygC1oGgQfDhUleX3TLuVEDFUBczNiEKEy32Pp19ew/GlDDvm2ui2DS73Hc5cLLB0odSsUMQR19aJa1UREIKgqsrTCbtDqckNCOgVYyHmkj++cE6DEGjfvU8CqvviVucf0zPT24010OBBJFDvoaiV5L3CBYUPAhHAMMFaRhRZGGaAGEQb3alOgWHhqcwuPr2nu/LVhW4+GLP9YKAhjXKJbVAAajWUAHCqquyhoqi+k461YzIGGgAlbsqbwhiCMQRoE+PGDm14zRsVCABBvA9cFflySquP7eqezyYSIYPAlp0GYZTeyEZDBUCOQD/NsuGLZVGO+ns9FxoADKJNbRh1C8ZoM0hZAVYlgojysKgyE9b/vKe7+pcO9SOjOYPAAuJRDjbjTF27pFqpit6DvV7vbOkclLjOKW6oVdooGaNHENXASEHcZIEo8iJ4Ldef2905/fuF8XWJyJuqclaCYxAxs3JTg9hM3XpfDUA9IOFkAHsF7oyiuG3qyZhGhbHha8NzglEighITsSFVQVEEVMPLr+5I3nx439SZl5lCZAgKAlS8MhFM3Q8UgPK78r7OoV/kw+J3RVE4EBExQ9mArFEiAyLT8GdAzE2tMAARnFcUw/7SDN7+zWL75L9YfVtFjPO+KX1knHPGOcebhirF5t2w+6PhMP97WVYgMAwxAAMio2AD4qhRvCGQIeJaGUWRZ+1w+vGd6amnWta1ffBGgicR4RCCBcAiwpsAkCW+1mAsa64qH+r3+/sM8y1xFINIR6EAbxrFiKFCyPIKXK08s7N94k/duA/nKSIWbwwpiDSEoCLCqirGmKsiJBNh8wak1oP6Z8uifCQbFuuiCjIMIgNwBJDBhjiJCEUZUPXPHZ3F64/PRucuBC+RqLKqGFUxIvX23puGAajqqBtedxHRz4qi+GNRVg1cbvRXe87GoPTAsL96fjocPTRv33kteNcKIRgRsSEE02zrnDMhBHbOkTGmrh/1UHrjW1QI4SeDfv8Ww3xP3Iqb+2IzMQiQDTK0iuNPbI/fetrAtUWNJ5FQ42WICBFRUFVhZkqSRFut1kh0FmRuRAEAnCyr6peDLNszYe0ua009DRNhkHtQdurwNn7zibbJEII1zAIiYgBBValOJJYoirTdbruxsbFKVUMzwSoTJ7je1sZbED1WFOUzVVWNcAVR5FkvmwjHX5yxZ5aCcktVbQjBhhCM996EEAwzo9PphOnp6SJN0w3jIwCWSbZ0iVT1jw6H2UFr7YEkiZGXDnFx4oUJWnpBwB0JSkQKESFmRpIkodPp+ImJiWEURUMAJQC3yXgNIDFuSwAIeK4ossNlq30gSWIUw6yaDKffmLBrl0TjlqqoiAZjTNXpdIrp6elBp9PJVbUAkDcXVdlsHIBaL7zVmzSC8h+cc3f2h+UdpjrzyhidP0LMsfOBVdW3Wq18ampqbWpq6goRVarqG6/9ew1vTH62m+RbBkDQ5/JAx6706I758J8TYzi3lA0rr6ArMzMz/bm5udVWq9Vr4gy8t8xuMjwa7z+/+8iWAcTG4/DZ/UePXZAThs6fCL63mhW6vnPnzouLi4ul1On33ry+puERgIjDlgEYEky3ssPbk7It6yuvJeOdk3v3783SNA0iQk1123wN1//1d40VpS0DqIKlvZMrr+7p4i3orpxJM2uj+mZeW6dreI4bgfjvAOOpSBSGfhEFAAAAAElFTkSuQmCC",
      markerWidth: 32,
      markerHeight: 38,
      markerDx: 0,
      markerDy: 0,
      markerOpacity: 1
    }
  }).addTo(markerLyr);
  myMap.on("moving moveend zoomend", evt => {
    if (!this.markerInCenter) return;
    const _center = myMap.getCenter();
    if (_center) {
      centerMarker.setCoordinates(_center);
      if (evt.type === "moveend") {
        this.notify("center", _center, {});
        this.autoGeoCode && this.geocode(_center);
      }
    }
  });
  this.mapInstance = myMap;
  this.notify("init", { x: this.center[0], y: this.center[1] }, {});
}
</script>

<style scoped>
#map_container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
