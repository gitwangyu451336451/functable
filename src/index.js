import ftablecomp from './functable'

let FtableIviewLw = {}
FtableIviewLw = function (Vue, options) {
  if (typeof window !== 'undefined' && window.Vue) {
    Vue = window.Vue
  }
  console.log(ftablecomp.name)
  Vue.component(ftablecomp.name, ftablecomp)
}
export default FtableIviewLw
