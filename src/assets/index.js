import ftable from './functable'

let test = {}
test.install = function (Vue, options) {
  Vue.component(ftable.name, ftable)
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(test)
}
export default test
