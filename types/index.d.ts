import { ftablecomp } from '../src/index'

let FtableIviewLw: any = {}
FtableIviewLw = function (Vue, options) {
  if (typeof window !== 'undefined' && window.Vue) {
    Vue = window.Vue
  }
  Vue.component(ftablecomp.name, ftablecomp)
}
export default FtableIviewLw
