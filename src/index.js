import ftablecomp from './functable'

let FtableIviewLw = {}
FtableIviewLw = function(Vue, options) {
  if (typeof window !== 'undefined' && window.Vue) {
    Vue = window.Vue
  }
  Vue.component(ftablecomp.name, ftablecomp)
}
export default FtableIviewLw
