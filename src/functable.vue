<template>
    <div class="newRcTable">
        <div v-if="!tableAttr.hideHead"
             class="rcTable-head">
            <div class="tootip-container">
                <div class="head-r-container">
                    <div class="child-padding-r6">
                        <slot name="tootipR"></slot>
                    </div>
                    <div v-if="tableAttr.searchShow"
                         class="tootip-content search-table-input-div">
                        <div class='search-input'>
                            <Dropdown trigger='click'
                                      :transfer="true"
                                      placement='bottom-start'
                                      @on-visible-change='changeSearchColState'>
                                <div @click='changeSearchColState()'
                                     class='col-search-select'>
                                    <div :title='colSearchChoosed.title'
                                         class='col-type'>
                                        {{colSearchChoosed.title}}
                                    </div>
                                    <Icon :type="colSearchState?'ios-arrow-up':'ios-arrow-down'"></Icon>
                                </div>
                                <DropdownMenu slot='list'>
                                    <DropdownItem v-for='(item,index) in colSearchList'
                                                  :key='index'>
                                        <div class='drop-down-div'
                                             :title='item.title'
                                             @click='chooseColSearch(item)'>{{item.title}}</div>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <div class="search-input-div"
                                 v-if="colSearchChoosed.searchType === 'select'">
                                <span style="margin-right: 0px; margin-top: 7px;"
                                      class="separated-line"></span>
                                <Select :label-in-value='true'
                                        ref="searchSelect"
                                        filterable
                                        size='large'
                                        :placement="'bottom-end'"
                                        :transfer="true"
                                        :multiple="colSearchChoosed.searchMultiple"
                                        :placeholder="colSearchChoosed.placeholder || $t('请选择')"
                                        v-model='searchValue'>
                                    <Option v-for="(item) in colSearchChoosed.searchData"
                                            :value="item.value"
                                            :key="item.value">{{item.name}}</Option>
                                </Select>
                            </div>
                            <div class="search-input-div"
                                 v-else-if="colSearchChoosed.searchType === 'autoc'">
                                <span style="margin-right: 0px; margin-top: 7px;"
                                      class="separated-line"></span>
                                <AutoComplete v-model='searchValue'
                                              :data="colSearchChoosed.searchData"
                                              :placeholder='colSearchChoosed.placeholder || $t("搜索")'>
                                </AutoComplete>
                            </div>
                            <div v-else
                                 class="search-input-div">
                                <span style="margin-right: 0px; margin-top: 7px;"
                                      class="separated-line"></span>
                                <Input size='large'
                                       v-model='searchValue'
                                       :placeholder='colSearchChoosed.placeholder || $t("搜索")'
                                       @on-keyup.enter="search" />
                            </div>
                        </div>
                        <Button type='primary'
                                @click='search()'
                                :loading="searchLoading"
                                class='sc-btn'>
                            <span class="separated-line"></span>
                            <i class="table-search icon-search-o"
                               v-show="!searchLoading"></i>
                        </Button>
                    </div>
                </div>
                <div class="child-padding-r6">
                    <slot name="tootipL"></slot>
                </div>
            </div>
            <!-- 查询标签 -->
            <div v-if="tableAttr.searchShow && searchValueList.length > 0"
                 class="search-tips">
                <Tag v-for='(item,index) in searchValueList'
                     type='border'
                     closable
                     color='blue'
                     :key='index'
                     @on-close='handleCloseTags(index)'>{{item.title+'：'+item.name}}</Tag>
            </div>
        </div>
        <div class="rcTable-content">
            <Table :columns="columns"
                   :data="baseData.dataList"
                   :stripe="tableAttr.stripe"
                   :border="tableAttr.border !== false"
                   :showHeader="tableAttr.showHeader"
                   :width="tableAttr.width"
                   :height="tableAttr.height"
                   :loading="false"
                   :disabledHover="tableAttr.disabledHover"
                   :highlightRow="tableAttr.highlightRow"
                   :rowClassName="tableAttr.rowClassName"
                   size="large"
                   :noDataText="tableAttr.noDataText"
                   :noFilteredDataText="tableAttr.noFilteredDataText"
                   @on-current-change="onCurrentChange"
                   @on-select="onSelect"
                   @on-select-cancel="onSelectCancel"
                   @on-select-all="onSelectAll"
                   @on-selection-change="onSelectionChange"
                   @on-sort-change="onSortChange"
                   @on-row-click="onRowClick"
                   @on-row-dblclick="onRowDblclick"
                   @on-expand="onExpand"></Table>

            <!-- <vTable :columns="columns"
                    ref="vTable"
                    :data="baseData.dataList"
                    :stripe="tableAttr.stripe"
                    :border="tableAttr.border !== false"
                    :showHeader="tableAttr.showHeader"
                    :disabledHover="tableAttr.disabledHover"
                    :highlightRow="tableAttr.highlightRow"
                    :isSingleSelect="tableAttr.isSingleSelect"
                    :noDataText="tableAttr.noDataText"
                    :spanMethod="tableAttr.spanMethod"
                    :rowKey="tableAttr.rowKey"
                    @on-current-change="onCurrentChange"
                    @on-select="onSelect"
                    @on-select-all="onSelectAll"
                    @on-selection-change="onSelectionChange"
                    @on-sort-change="onSortChange"
                    @on-row-click="onRowClick"
                    @on-row-dblclick="onRowDblclick"
                    @on-expand="onExpand" /> -->

            <!-- 替换ivew本身得loading -->
            <Spin v-if="tableAttr.loading"
                  fix>
                <Icon type="ios-loading"
                      :size='18'
                      class="demo-spin-icon-load"></Icon>
                <div>{{$t('加载中')}}</div>
            </Spin>
            <!-- 列选择器 -->
            <div v-if="tableAttr.columnsChooseShow"
                 class="columns-choose-show-container">
                <Dropdown trigger="custom"
                          :visible="columnsvisible"
                          @on-clickoutside="columnsvisible = false"
                          :transfer="true"
                          class="rctable-choose-show-container"
                          placement="bottom-end">
                    <div @click="columnsvisible = !columnsvisible"
                         class="icon-show">
                        <Icon type="md-more"></Icon>
                    </div>
                    <div class="rctable-choose-show-container"
                         slot="list">
                        <div @click.stop="columnsvisible = true"
                             class='columns-choose'>
                            <div class="columns-title">{{$t('列')}}：</div>
                            <Checkbox class='check'
                                      v-for='(item, index) in allColumns'
                                      v-if='item.columnShow'
                                      :key='index'
                                      v-model='columnState[item.key]'
                                      :disabled='item.disabledChoose'
                                      @on-change='changeColumnsChoose'>{{item.title}}</Checkbox>
                        </div>
                    </div>
                </Dropdown>
            </div>
        </div>
        <div v-if="!tableAttr.hideFooter"
             class="rcTable-footer">
            <div class="footer-r-container">
                <slot name="footerR"></slot>
                <Page v-if="pageData.show"
                      :total="baseData.totalRows"
                      :current="pageData.current"
                      :pageSize="pageData.pageSize"
                      :pageSizeOpts="pageData.pageSizeOpts"
                      :placement="pageData.placement"
                      :showTotal="pageData.showTotal"
                      :showElevator="pageData.showElevator"
                      :showSizer="pageData.showSizer"
                      :transfer="pageData.transfer"
                      @on-change="onPageNumChange"
                      @on-page-size-change="onPageSizeChange" />
            </div>
            <slot name="footerL"></slot>
        </div>
    </div>
</template>

<script>
// import vTable from '@/views/components/basic/vTable'
export default {
  name: 'FtableIviewLw',
  props: ['tableAttr'],
  data () {
    return {
      baseData: {
        totalRows: 0,
        dataList: [], // 当前表格数据
        allTableData: [] // 所有表格数据
      },
      columns: [], // 当前列
      allColumns: [], // 所有列集合
      columnState: {}, // 列选择勾选状态
      pageData: {
        show: true,
        pageWays: 'server', // 前端分页 client, 后端分页 server
        current: 1,
        pageSize: 10,
        pageSizeOpts: [10, 20, 30, 40],
        placement: 'bottom',
        showTotal: true,
        showElevator: true,
        showSizer: true,
        transfer: true
      },
      sort: null,
      colSearchState: false, // 搜索组件下拉选择状态
      colSearchList: [],
      colSearchChoosed: {},
      searchValueList: [],
      searchValue: '',
      searchLoading: false, // 搜索loading
      params: null,
      websoctList: [], // websoct对应key数组
      columnsvisible: false // 自定义列收回展开
    }
  },
  created () {
    this.init()
  },
  watch: {
    'baseData.totalRows' (newVal) {
      this.$emit('totalRowsChange', newVal)
    }
  },
  methods: {
    // 初始化
    init () {
      // 分页状态信息初始化
      if (this.tableAttr.pageData) {
        for (let i in this.tableAttr.pageData) {
          this.pageData[i] = this.tableAttr.pageData[i]
        }
      }
      // 表格列处理
      this.allColumns = this.tableAttr.columns
      if (this.tableAttr.isMultiSelect || this.tableAttr.isSingleSelect) {
        this.allColumns = [{
          type: 'selection',
          width: 42,
          align: 'center'
        }].concat(this.allColumns)
      }
      this.colSearchList = []
      this.allColumns.forEach(item => {
        // 列选择器
        if (item.columnShow) {
          this.columnState[item.key] = !!item.columnsChoosed
        }
        // 搜索组件
        if (!item.disabledSearch && item.key) {
          this.colSearchList.push(item)
        }
      })
      // 不进行展示出现，但是需要加入搜索组件的列集合
      if (this.tableAttr.searchColumns) {
        this.tableAttr.searchColumns.forEach(item => {
          // 搜索组件
          if (!item.disabledSearch && item.key) {
            this.colSearchList.push(item)
          }
        })
      }
      if (this.colSearchList.length > 0) {
        this.colSearchChoosed = this.colSearchList[0]
        // 添加初始化就进行搜索的项
        this.searchValueList = []
        this.colSearchList.forEach(item => {
          if (item.searchDefaultValue) {
            let obj = {
              key: item.key,
              title: item.title,
              value: item.searchDefaultValue
            }
            if (item.searchType === 'select') {
              obj.name = this.getNameByValue(item.searchDefaultValue, item.searchData)
            } else {
              obj.name = item.searchDefaultValue
            }
            // 过滤searchFilterValues的值，比如全部我可以选但是不想加入搜索
            if (item.searchType === 'select' &&
                            item.searchFilterValues &&
                            item.searchFilterValues.length > 0) {
              if (item.searchFilterValues.indexOf(obj.value) !== -1) {
                obj.disabledSearch = true
              } else {
                obj.disabledSearch = false
              }
            }
            this.searchValueList.push(obj)
          }
        })
      }

      // 默认添加初始化搜索的标签（查询保持处理）
      let arr = [].concat(this.tableAttr.searchDefaultValueList)
      this.searchValueList.forEach(item => {
        let res = true
        arr.forEach(a => {
          if (item.key === a.key) {
            res = false
          }
        })
        if (res) {
          arr.push(item)
        }
      })
      this.searchValueList = this.searchValueList.concat(this.tableAttr.searchDefaultValueList || [])

      this.changeColumnsChoose()
      if (this.tableAttr.source.params) {
        this.refreshTable(this.tableAttr.source.params)
      } else {
        this.refreshTable()
      }
    },
    // 刷新表格
    /**
                 * @param {object} params 接受向后台发送请求的外部非组件内参数（如搜索组件，组建内排序的参数不进行传入）
                 * @param {object} isResetPage 是否重置page
                 * @param {object} wsValue 要进行websoct比较验证刷新的值
                 * @param {object} wsFunc websoct比较验证成功后执行的事件
                 */
    refreshTable (params, isResetPage, wsValue, wsFunc) {
      if (wsValue !== undefined && wsValue !== null) {
        if (this.websoctList.indexOf(wsValue) === -1) {
          return
        }
        if (wsFunc) {
          wsFunc()
        }
      }
      if (params) {
        this.params = params
      }
      if (isResetPage) {
        this.pageData.current = this.tableAttr.pageData ? (this.tableAttr.pageData.current || 1) : 1
        this.pageData.pageSize = this.tableAttr.pageData ? (this.tableAttr.pageData.pageSize || 10) : 10
      }
      this.tableAttr.loading = true
      // 静态数据 (静态数据不支持前台自动排序，过滤，请结合change方法调用refreshTable使用)
      if (this.tableAttr.source.type === 'staticData') {
        this.baseData = {
          totalRows: this.tableAttr.source.tableData.totalRows,
          dataList: this.tableAttr.source.tableData.dataList,
          allTableData: this.tableAttr.source.tableData.dataList
        }
        // 过滤
        if (this.tableAttr.isFilter) {
          // that.baseData = this.filterTableData(that.baseData, this.tableStyleClass.filterChoosedArr || [], this.tableStyleClass.filterKey)
          this.filterTableData(this.baseData, this.tableAttr.filterChoosedArr || [], this.tableAttr.filterKey)
        }
        this.tableAttr.loading = false
        // 请求到数据回调
        this.$emit('rt-callback', {
          totalRows: this.baseData.totalRows,
          dataList: this.baseData.dataList
        })
      } else {
        let obj = {}
        if (this.params) {
          obj = JSON.parse(JSON.stringify(this.params))
        }
        this.searchValueList.forEach(item => {
          if (!item.disabledSearch) {
            obj[item.key] = item.value
          }
        })
        // 前端分页不传pagenum，pagesize
        if (this.pageData.show && this.pageData.pageWays !== 'client') {
          obj.pagenum = parseInt(this.pageData.current) - 1
          obj.pagesize = this.pageData.pageSize
        }
        if (this.sort && JSON.stringify(this.sort) !== '{}' && this.sort.order !== 'normal') {
          let key = this.sort.column.sortKey || this.sort.column.key
          obj.sortdatafield = key
          obj.sortorder = this.sort.order
        }
        this.axios.get(this.tableAttr.source.url, { params: obj }).then(res => {
          // 兼容
          res = this.compatibleData(res)
          if (this.tableAttr.isWebsoct) {
            // 获取websoct对应key的数组
            this.getWebsoctList(res.dataList, this.tableAttr.wsKey || 'id')
          }
          // 过滤
          if (this.tableAttr.isFilter) {
            // that.baseData = this.filterTableData(that.baseData, this.tableStyleClass.filterChoosedArr || [], this.tableStyleClass.filterKey)
            this.filterTableData(res, this.tableAttr.filterChoosedArr || [], this.tableAttr.filterKey)
          }
          this.baseData = {
            totalRows: res.totalRows,
            dataList: res.dataList,
            allTableData: res.dataList
          }
          this.tableAttr.loading = false
          this.searchLoading = false

          // 前端分页
          if (this.pageData.show && this.pageData.pageWays === 'client') {
            this.baseData.dataList = this.getTableDataByClient()
          }

          // 防止删除最后一条数据没返回前一页
          this.compatiblePage(params, isResetPage)

          // 请求到数据回调
          this.$emit('rt-callback', res)
        })
      }

      // 前端分页
      if (this.pageData.show && this.pageData.pageWays === 'client') {
        this.baseData.dataList = this.getTableDataByClient()
      }

      // 防止删除最后一条数据没返回前一页
      this.compatiblePage(params, isResetPage)

      // 重置单选，多选
      this.onSelectionChange([])
      this.onCurrentChange({})
    },
    // 获取websoct key数组
    getWebsoctList (data, key) {
      this.websoctList = []
      data.forEach(item => {
        this.websoctList.push(item[key])
      })
    },
    // 对页码进行兼容，如当删除一个数为当前页最后一条数据，自动返回前一页
    compatiblePage (params, isResetPage) {
      if (this.baseData.dataList && this.baseData.dataList.length === 0 && this.pageData.current > 1 && !isResetPage) {
        this.pageData.current = parseInt(this.pageData.current) - 1
        this.refreshTable(params)
      }
    },
    // 表格数据的返回兼容
    compatibleData (data) {
      if (data.code === '200' && data.status && !data.data) {
        data = []
      }
      if (data instanceof Array) {
        this.pageData.pageWays = 'client'
        return {
          totalRows: data.length,
          dataList: data
        }
      } else {
        return data
      }
    },
    // 前端分页获取表格数据
    getTableDataByClient () {
      let c = parseInt(this.pageData.current)
      let p = parseInt(this.pageData.pageSize)
      return this.baseData.allTableData.slice((c - 1) * p, c * p)
    },
    // 获取表格列
    getColumns () {
      let columns = []
      this.allColumns.forEach(item => {
        if (!item.columnShow || this.columnState[item.key]) {
          columns.push(item)
        }
      })
      return columns
    },
    // 列选择器进行勾选变化时
    changeColumnsChoose () {
      this.columns = this.getColumns()
    },
    changeSearchColState (visible) {
      // 改变列搜索选择框的状态
      this.colSearchState = visible
    },
    // 选择搜索值
    chooseColSearch (item) {
      this.colSearchChoosed = item
      this.searchValue = ''
    },
    // 搜索
    search () {
      this.searchLoading = true
      // 遇到的个bug,当重复点击下拉确认时会让searchValue为undfined,暂时先这样解决
      if (this.searchValue === undefined) {
        this.searchValue = ''
      }

      if ((this.searchValue + '').trim() !== '') { // 强转为字符串
        let obj = {
          key: this.colSearchChoosed.key,
          title: this.colSearchChoosed.title,
          value: this.searchValue
        }
        if (this.colSearchChoosed.searchType === 'select') {
          obj.name = this.getNameByValue(this.searchValue, this.colSearchChoosed.searchData)
        } else {
          obj.name = this.searchValue
        }
        let isOld = false
        for (let i in this.searchValueList) {
          let item = this.searchValueList[i]
          if (item.key === obj.key) {
            this.searchValueList[i] = obj
            isOld = true
            break
          }
        }
        if (!isOld) {
          // 过滤searchFilterValues的值，比如全部我可以选但是不想加入搜索
          if (this.colSearchChoosed.searchType === 'select' &&
                        this.colSearchChoosed.searchFilterValues &&
                        this.colSearchChoosed.searchFilterValues.length > 0) {
            if (this.colSearchChoosed.searchFilterValues.indexOf(obj.value) !== -1) {
              obj.disabledSearch = true
            } else {
              obj.disabledSearch = false
            }
          }
          this.searchValueList.push(obj)
        }
        this.pageData.current = 1
        this.searchValue = ''
      }
      this.searchValue = ''
      if (this.colSearchChoosed.searchType === 'select') {
        this.$refs.searchSelect.setQuery(null)
      }

      // 静态数据搜索回调
      if (this.tableAttr.source.type === 'staticData') {
        let obj = {}
        if (this.params) {
          obj = JSON.parse(JSON.stringify(this.params))
        }
        this.searchValueList.forEach(item => {
          if (!item.disabledSearch) {
            obj[item.key] = item.value
          }
        })
        if (this.sort && JSON.stringify(this.sort) !== '{}' && this.sort.order !== 'normal') {
          let key = this.sort.column.sortKey || this.sort.column.key
          obj.sortdatafield = key
          obj.sortorder = this.sort.order
        }
        this.$emit('staticSearch', obj, (data) => {
          this.searchLoading = false
          this.tableAttr.source.tableData = data
          this.refreshTable()
        })
      } else {
        this.refreshTable()
      }
      this.keepSearchList()
    },
    // 搜索组件下拉时，通过value取name
    getNameByValue (value, data) {
      for (let i in data) {
        if (data[i].value === value) {
          return data[i].name
        }
      }
    },
    // 关闭标签
    handleCloseTags (index) {
      this.pageData.current = 1
      this.searchValueList.splice(index, 1)

      // 静态数据搜索回调
      if (this.tableAttr.source.type === 'staticData') {
        let obj = {}
        if (this.params) {
          obj = JSON.parse(JSON.stringify(this.params))
        }
        this.searchValueList.forEach(item => {
          if (!item.disabledSearch) {
            obj[item.key] = item.value
          }
        })
        if (this.sort && JSON.stringify(this.sort) !== '{}' && this.sort.order !== 'normal') {
          let key = this.sort.column.sortKey || this.sort.column.key
          obj.sortdatafield = key
          obj.sortorder = this.sort.order
        }
        this.$emit('staticSearch', obj, (data) => {
          this.searchLoading = false
          this.tableAttr.source.tableData = data
          this.refreshTable()
        })
      } else {
        this.refreshTable()
      }
      this.keepSearchList()
    },
    // 过滤不显示的行
    filterTableData (baseData, choosedArr, key) { // 过滤tableData
      choosedArr.length > 0 && choosedArr.forEach(sl => {
        baseData.dataList.forEach((item) => {
          if (Object.prototype.toString.call(key) === '[object Array]') {
            let s = true
            key.forEach((r, i) => {
              item[r] !== sl[r] && (s = false)
            })
            if (s) {
              baseData.dataList = baseData.dataList.filter(m => m !== item)
            }
          } else {
            if (item[key] === sl[key]) {
              baseData.dataList = baseData.dataList.filter(m => m !== item)
              baseData.totalRows = baseData.totalRows - 1
            }
          }
        })
      })
    },
    // 保持查询，将查询条件放入存储
    keepSearchList () {
      // 判断是否做查询保持
      if (this.tableAttr.tableSearchKey) {
        if (!sessionStorage.ts_list || sessionStorage.ts_list === 'null') {
          sessionStorage.ts_list = '{}'
        }
        let obj = JSON.parse(sessionStorage.ts_list) === '{}' ? {} : JSON.parse(sessionStorage.ts_list)
        obj[this.tableAttr.tableSearchKey] = this.searchValueList
        sessionStorage.ts_list = JSON.stringify(obj)
      }
    },
    // 前端分页时分页改变
    clientPageChangeData () {
      this.tableAttr.loading = false
      this.searchLoading = false

      // 前端分页
      if (this.pageData.show && this.pageData.pageWays === 'client') {
        this.baseData.dataList = this.getTableDataByClient()
      }
    },
    /**
         * 以下是监听表格变化触发事件
         */
    // 页码改变
    onPageNumChange (current) {
      this.pageData.current = current
      // 前端分页
      if (this.pageData.show && this.pageData.pageWays === 'client') {
        this.clientPageChangeData()
      } else {
        this.refreshTable()
      }
      this.$emit('onPageNumChange', current)
    },
    // 每页条数改变
    onPageSizeChange (pageSize) {
      this.pageData.pageSize = pageSize
      // 前端分页
      if (this.pageData.show && this.pageData.pageWays === 'client') {
        this.clientPageChangeData()
      } else {
        this.refreshTable()
      }
      this.$emit('onPageSizeChange', pageSize)
    },
    // 开启 highlight-row 后有效，当表格的当前行发生变化的时候会触发
    onCurrentChange (currentRow, oldCurrentRow) {
      this.$emit('onCurrentChange', currentRow, oldCurrentRow)
    },
    // 多选、单选选中
    onSelect (selection, row) {
      if (this.tableAttr.isSingleSelect) {
        this.$refs.vTable.$refs.elTable.clearSelection()
        if (selection.length === 0) { // 判断
          return
        }
        this.$refs.vTable.$refs.elTable.toggleRowSelection(row, true)
      }
      this.$emit('onSelect', selection, row)
    },
    // 多选取消选中
    onSelectCancel (selection, row) {
      this.$emit('onSelectCancel', selection, row)
    },
    // 全选
    onSelectAll (selection) {
      // 单选模式不让选择全选
      if (this.tableAttr.isSingleSelect && this.baseData.dataList.length === selection.length && this.baseData.dataList.length > 1) {
        this.$refs.vTable && this.$refs.vTable.$refs.elTable.clearSelection()
        return
      }
      this.$emit('onSelectAll', selection)
    },
    // 多选发生变化
    onSelectionChange (selection) {
      // 单选模式不让选择全选
      if (this.tableAttr.isSingleSelect && this.baseData.dataList.length === selection.length && this.baseData.dataList.length > 1) {
        this.$refs.vTable && this.$refs.vTable.$refs.elTable.clearSelection()
        return
      }
      this.$emit('onSelectChange', selection)
    },
    // 排序变化
    onSortChange (params) {
      this.sort = params
      // 静态数据不进行排序
      this.refreshTable()
      this.$emit('onSortChange', params)
      // 静态数据搜索回调
      if (this.tableAttr.source.type === 'staticData') {
        let obj = {}
        if (this.params) {
          obj = JSON.parse(JSON.stringify(this.params))
        }
        this.searchValueList.forEach(item => {
          if (!item.disabledSearch) {
            obj[item.key] = item.value
          }
        })
        if (this.sort && JSON.stringify(this.sort) !== '{}' && this.sort.order !== 'normal') {
          let key = this.sort.column.sortKey || this.sort.column.key
          obj.sortdatafield = key
          obj.sortorder = this.sort.order
        }
        this.$emit('staticSearch', obj, (data) => {
          this.searchLoading = false
          this.tableAttr.source.tableData = data
          this.refreshTable()
        })
      }
    },
    // 行单击事件
    onRowClick (row, index) {
      this.$emit('onRowClick', row, index)
    },
    // 行双击事件
    onRowDblclick (row, index) {
      this.$emit('onRowDblclick', row, index)
    },
    // 展开或收起某一行
    onExpand (row, status) {
      this.$emit('onExpand', row, status)
    },
    // 清空标签
    clearAllTags () {
      this.searchValueList = []
    }
  }
}
</script>

<style lang="less">
.newRcTable {
    .has-gutter {
        tr > th.gutter {
            display: table !important;
        }
    }
    .el-table {
        .caret-wrapper {
            height: 18px;
            .ascending {
                top: -3px;
            }
            .descending {
                bottom: -2px;
            }
        }
    }
    .columns-choose-show-container {
        .ivu-select-dropdown {
            background-color: #f3f3f3;
        }
    }
    .rcTable-content {
        .ivu-spin-dot {
            display: none;
        }
        .ivu-spin-text {
            display: block;
        }
        // th.ivu-table-column-center,
        // td.ivu-table-column-center {
        //     text-align: center;
        //     .ivu-table-cell-with-selection {
        //         padding-left: 0px;
        //         padding-right: 0px;
        //     }
        // }

        // table {
        //     width: 100% !important;
        //     th,
        //     td {
        //         height: 42px;
        //     }
        //     th.ivu-table-column-center {
        //         background-color: #f9f9fa;
        //     }
        //     th .ivu-table-cell {
        //         font-size: 14px;
        //         color: #767676;
        //         font-weight: normal;
        //     }
        //     .ivu-table-cell {
        //         width: 100%;
        //         font-family: 'PingFangSC-Light', 'Microsoft YaHei', '宋体',
        //             'Helvetica Neue', Arial, Helvetica, sans-serif;
        //         color: #333;
        //         font-size: 12px;
        //         padding: 0px 9px;
        //         .ivu-checkbox-wrapper {
        //             width: 100%;
        //             text-align: center;
        //             margin: 0px auto;
        //         }
        //     }
        // }
        // .ivu-table-border td,
        // .ivu-table-border th {
        //     border-color: #e9e9e9;
        // }
        // tr {
        //     border-color: #e9e9e9;
        // }
        .ellipsis {
            > div {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
    .rcTable-footer {
        .ivu-page {
            width: max-content;
            li {
                margin-top: -4px;
            }
            .ivu-page-total {
                color: #333;
                font-size: 14px;
            }
            .ivu-page-prev,
            .ivu-page-next {
                min-width: 26px;
                height: 22px;
                text-align: center;
                line-height: 20px;
                border-radius: 0px;
                color: #eee;
                font-size: 14px;
                border-color: #e9e9e9;
            }
            .ivu-page-item,
            .ivu-page-item-jump-next,
            .ivu-page-item-jump-prev {
                min-width: 26px;
                height: 22px;
                text-align: center;
                line-height: 22px;
                border-radius: 0px;
                border-color: #e9e9e9;
            }
            .ivu-select-selection {
                height: 22px;
                text-align: center;
                line-height: 22px;
                border-radius: 0px;
                border-color: #e9e9e9;
                .ivu-select-selected-value {
                    height: 22px;
                    line-height: 22px;
                }
            }
            .ivu-page-options-sizer {
                position: relative;
                top: -2px;
            }
            .ivu-page-options-elevator {
                color: #333;
                font-size: 14px;
                margin-top: -4px;
                input {
                    height: 22px;
                    line-height: 22px;
                    border-radius: 0px;
                    border-color: #e9e9e9;
                    outline: none;
                    box-shadow: none;
                }
            }
        }
    }
    .search-tips {
        .ivu-tag {
            line-height: 24px;
        }
    }
    .search-table-input-div {
        display: flex;
        .search-input {
            width: 250px;
            height: 32px;
            display: flex;
            position: relative;
            .search-input-div {
                position: relative;
                width: auto;
                flex-grow: 1;
                display: flex;
                background-color: white;
                border-top: 1px #e9e9e9 solid;
                border-bottom: 1px #e9e9e9 solid;
                input,
                .ivu-select-multiple .ivu-select-selection {
                    min-height: 30px;
                }
                .ivu-select-selection {
                    border-radius: 0px;
                    .ivu-select-selected-value {
                        font-size: 12px;
                    }
                }
                .ivu-select-selection {
                    height: 30px;
                    box-shadow: none;
                    border: none;
                    font-size: 12px;
                }
                .ivu-select-placeholder {
                    height: 30px;
                    font-size: 12px;
                }
                .ivu-select-dropdown-list .ivu-select-item {
                    font-size: 12px !important;
                }
                .ivu-input {
                    height: 30px;
                    border: none;
                    box-shadow: none;
                    font-size: 12px;
                }
            }
            .search-input-div::before {
                content: "";
                display: block;
                position: absolute;
                top: 50%;
                left: 0;
                width: 1px;
                height: 15px;
                background-color: #e9e9e9;
                -webkit-transform: translateY(-50%);
                transform: translateY(-50%);
                z-index: 899;
            }
            .ivu-dropdown {
                height: 32px;
                .ivu-dropdown-rel {
                    height: 100%;
                }
                .ivu-dropdown-item {
                    padding: 0px;
                    .drop-down-div {
                        width: 100%;
                        height: 100%;
                        padding: 7px 16px;
                    }
                }
                .col-search-select {
                    min-width: 60px;
                    height: 100%;
                    line-height: 28px;
                    text-align: center;
                    background-color: white;
                    border: 1px #e9e9e9 solid;
                    border-right: none;
                    padding: 0px 10px;
                    cursor: pointer;
                    display: flex;
                    .col-type {
                        display: inline-block;
                        font-size: 12px;
                        margin-top: 2px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        color: #333;
                        padding-right: 5px;
                    }
                    i {
                        // margin-right: 5px;
                        margin-top: 10px;
                        color: #ccc;
                    }
                }
            }
        }
        .ivu-select-selection {
            i.ivu-select-arrow {
                display: none;
            }
        }
        .sc-btn {
            position: relative;
            width: 36px;
            height: 32px;
            border-radius: 0px;
            display: inline-block;
            margin-left: -3px;
            font-size: 18px;
            background-color: white;
            border: 1px #e9e9e9 solid;
            border-left: none;
            font-size: 14px;
            color: #666;
            box-shadow: none;
            padding: 5px;
            i {
                vertical-align: top;
            }
        }
        .sc-btn:after {
            content: "";
            display: block;
            position: absolute;
            top: 50%;
            left: 0;
            width: 1px;
            height: 15px;
            background-color: #e9e9e9;
            transform: translateY(-50%);
        }
    }
}
.newRcTable.no-border {
    .rcTable-head {
        margin-bottom: 10px !important;
    }
    .ivu-table-large th {
        border-right: none;
    }
    td {
        border-right: none;
        height: 50px !important;
    }
}

.rctable-choose-show-container .columns-choose {
    min-width: 120px;
    background-color: #f3f3f3;
    display: flex;
    flex-direction: column;
    text-align: left;
    overflow-y: hidden;
    .columns-title {
        width: 100%;
        padding: 10px 15px;
        border-bottom: 1px solid #e9e9e9;
    }
    .ivu-checkbox-wrapper {
        margin-right: 0px;
        padding: 10px 15px;
        border-bottom: 1px solid #e9e9e9;
    }
    .check {
        width: 100%;
        white-space: nowrap;
    }
}
</style>

<style lang="less" scoped>
.newRcTable {
    .rcTable-head {
        margin-bottom: 15px;
        .tootip-container {
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
            .head-r-container {
                display: flex;
            }
        }
        .search-tips {
            display: flex;
            flex-direction: row-reverse;
            margin-top: 5px;
        }
        .child-padding-r6 {
            display: flex;
            * {
                margin-right: 6px;
            }
        }
    }
    .rcTable-content {
        position: relative;
        padding-left: 1px;
        padding-top: 1px;
        .columns-choose-show-container {
            position: absolute;
            top: 0px;
            right: 0px;
            z-index: 2;
            .icon-show {
                width: 36px;
                height: 42px;
                text-align: center;
                font-size: 24px;
                line-height: 40px;
                color: #999;
                cursor: pointer;
                border-left: 1px solid #e9e9e9;
            }
            .columns-choose {
                min-width: 120px;
                background-color: #f3f3f3;
                display: flex;
                flex-direction: column;
                text-align: left;
                overflow-y: auto;
                max-height: 350px;
                .columns-title {
                    width: 100%;
                    padding: 10px 15px;
                    border-bottom: 1px solid #e9e9e9;
                }
                .ivu-checkbox-wrapper {
                    margin-right: 0px;
                    padding: 10px 15px;
                    border-bottom: 1px solid #e9e9e9;
                }
                .check {
                    width: 100%;
                    white-space: nowrap;
                }
            }
        }
        .demo-spin-icon-load {
            animation: ani-demo-spin 1s linear infinite;
        }
        @keyframes ani-demo-spin {
            from {
                transform: rotate(0deg);
            }
            50% {
                transform: rotate(180deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    }
    .rcTable-footer {
        margin-top: 10px;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        .footer-r-container {
            display: flex;
        }
    }
}
</style>
