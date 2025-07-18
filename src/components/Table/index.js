import T from 'ant-design-vue/es/table/Table'
import { Object } from 'core-js'
import get from 'lodash.get'
import draggable from 'vuedraggable'
import columnSetting from './columnSetting'
import './index.less'

export default {
  components: {
    draggable, columnSetting
  },
  data () {
    return {
      needTotalList: [],

      selectedRows: [],
      selectedRowKeys: [],

      localLoading: false,
      localDataSource: [],
      localPagination: Object.assign({}, this.pagination),
      isFullscreen: false,
      customSize: this.size,
      columnsSetting: [],
      sorter:null
    }
  },
  props: Object.assign({}, T.props, {
    rowKey: {
      type: [String, Function],
      default: 'key'
    },
    data: {
      type: Function,
      required: true
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'middle'
    },
    scroll:{
      type:Object,
      default:() => ({ y: '50vh'})
    },
    alert: {
      type: [Object, Boolean],
      default: null
    },
    rowSelection: {
      type: Object,
      default: null
    },
    /** @Deprecated */
    showAlertInfo: {
      type: Boolean,
      default: false
    },
    // 分页显示控制：可接收 string 或 boolean
    showPagination: {
      // Vue3 中允许的多类型写法应使用数组，而非按位或运算符
      // 否则在运行时会得到数字 0，导致 instanceof 校验报错
      type: [String, Boolean],
      default: 'auto'
    },
    /**
     * enable page URI mode
     *
     * e.g:
     * /users/1
     * /users/2
     * /users/3?queryParam=test
     * ...
     */
    pageURI: {
      type: Boolean,
      default: false
    },
    extraTool: {
      type: Array,
      default: () => ([])
    }
  }),
  watch: {
    'localPagination.current' (val) {
      this.pageURI && this.$router.push({
        ...this.$route,
        name: this.$route.name,
        params: Object.assign({}, this.$route.params, {
          pageNo: val
        })
      })
    },
    pageNum (val) {
      Object.assign(this.localPagination, {
        current: val
      })
    },
    pageSize (val) {
      Object.assign(this.localPagination, {
        pageSize: val
      })
    },
    showSizeChanger (val) {
      Object.assign(this.localPagination, {
        showSizeChanger: val
      })
    }
  },
  created () {
    const { pageNo } = this.$route.params
    const localPageNum = this.pageURI && (pageNo && parseInt(pageNo)) || this.pageNum
    this.localPagination = ['auto', true].includes(this.showPagination) && Object.assign({}, this.localPagination, {
      current: localPageNum,
      showQuickJumper:true,
      pageSize: this.pageSize,
      showSizeChanger: this.showSizeChanger,
      //pageSizeOptions: ['10', '20', '30', '40', '50'], //分页选项
      showTotal: (total, range) => {
        return range[0] + '-' + range[1] + '共' + total + '条'
      }
    }) || false
    this.needTotalList = this.initTotalList(this.columns)
    this.loadData()
    // this.columnsSetting = this.columns
    //记录选择显示的列，以当前路由为key

    


    this.columnsSetting = []
    let cacheColumns=this.$ls.get(this.$route.path);
    if(cacheColumns && cacheColumns.length>0){
    	this.columnsSetting=cacheColumns;

      this.columns.forEach((item,index,arr)=>{
        let temp=this.columnsSetting.find(m=>m.dataIndex==item.dataIndex);
        //如果存在
        if(temp){
          arr[index].checked=temp.checked;
        }
      })
      
      this.columnsSetting = this.columns
    }
    else{
    	this.columnsSetting = this.columns
    }
  },
  methods: {
    /**
     * 表格重新加载方法
     * 如果参数为 true, 则强制刷新到第一页
     * @param Boolean bool
     */
    refresh (bool = false) {
      bool && (this.localPagination = Object.assign({}, {
        current: 1, pageSize: this.pageSize
      }))
      this.loadData()
    },
    /**
     * 加载数据方法
     * @param {Object} pagination 分页选项器
     * @param {Object} filters 过滤条件
     * @param {Object} sorter 排序条件
     */
    loadData (pagination, filters, sorter) {
      console.log(pagination,filters,sorter)
      if(sorter&&sorter.field){
        this.sorter=sorter;
      }
      else{
        sorter=this.sorter;
      }
      this.localLoading = true
      const parameter = Object.assign({
        pageNo: (pagination && pagination.current) ||
          this.showPagination && this.localPagination.current || this.pageNum,
        pageSize: (pagination && pagination.pageSize) ||
          this.showPagination && this.localPagination.pageSize || this.pageSize
      },
      (sorter && sorter.field && {
        sortField: sorter.field
      }) || {},
      (sorter && sorter.order && {
        sortOrder: sorter.order
      }) || {}, {
        ...filters
      }
      )
      const result = this.data(parameter)
      // 对接自己的通用数据接口需要修改下方代码中的 r.pageNo, r.totalCount, r.data
      // eslint-disable-next-line
      if ((typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {
        result.then(r => {
          if (r == null) {
            this.localLoading = false
            return
          }
          this.localPagination = this.showPagination && Object.assign({}, this.localPagination, {
            current: r.pageNo, // pageNo, // 返回结果中的当前分页数
            total: r.totalRows, // totalCount, // 返回结果中的总记录数
            showSizeChanger: this.showSizeChanger,
            pageSize: (pagination && pagination.pageSize) ||
              this.localPagination.pageSize
          }) || false
          // 后端数据rows为null保存修复
          if (r.rows == null) {
            r.rows = []
          }
          // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
          if (r.rows.length === 0 && this.showPagination && this.localPagination.current > 1) {
            this.localPagination.current--
            this.loadData()
            return
          }

          // 这里用于判断接口是否有返回 r.totalCount 且 this.showPagination = true 且 pageNo 和 pageSize 存在 且 totalCount 小于等于 pageNo * pageSize 的大小
          // 当情况满足时，表示数据不满足分页大小，关闭 table 分页功能
          try {
            if ((['auto', true].includes(this.showPagination) && r.totalCount <= (r.totalPage * this.localPagination.pageSize))) {
              this.localPagination.hideOnSinglePage = true
            }
          } catch (e) {
            this.localPagination = false
          }
          this.localDataSource = this.showPagination? r.rows:r // 返回结果中的数组数据
          this.localLoading = false
        })
      }
    },
    initTotalList (columns) {
      const totalList = []
      columns && columns instanceof Array && columns.forEach(column => {
        if (column.needTotal) {
          totalList.push({
            ...column,
            total: 0
          })
        }
      })
      return totalList
    },
    /**
     * 用于更新已选中的列表数据 total 统计
     * @param selectedRowKeys
     * @param selectedRows
     */
    updateSelect (selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      this.selectedRowKeys = selectedRowKeys
      const list = this.needTotalList
      this.needTotalList = list.map(item => {
        return {
          ...item,
          total: selectedRows.reduce((sum, val) => {
            const total = sum + parseInt(get(val, item.dataIndex))
            return isNaN(total) ? 0 : total
          }, 0)
        }
      })
    },
    /**
     * 清空 table 已选中项
     */
    clearSelected () {
      if (this.rowSelection) {
        this.rowSelection.onChange([], [])
        this.updateSelect([], [])
      }
    },
    /**
     * 处理交给 table 使用者去处理 clear 事件时，内部选中统计同时调用
     * @param callback
     * @returns {*}
     */
    renderClear (callback) {
      if (this.selectedRowKeys.length <= 0) return null
      return (
        <a style="margin-left: 24px" onClick={() => {
          callback()
          this.clearSelected()
        }}>清空</a>
      )
    },
    renderAlert () {
      // 绘制统计列数据
      // eslint-disable-next-line no-unused-vars
      const needTotalItems = this.needTotalList.map((item) => {
        return (<span style="margin-right: 12px">
          {item.title}总计 <a style="font-weight: 600">{!item.customRender ? item.total : item.customRender(item.total)}</a>
        </span>)
      })

      // 绘制 清空 按钮
      // eslint-disable-next-line no-unused-vars
      const clearItem = (typeof this.alert.clear === 'boolean' && this.alert.clear) ? (
        this.renderClear(this.clearSelected)
      ) : (this.alert !== null && typeof this.alert.clear === 'function') ? (
        this.renderClear(this.alert.clear)
      ) : null

      // 绘制 alert 组件
      // 统一先去除alert组件
      return ''
      /* return (
        <a-alert showIcon={true} style="margin-bottom: 16px">
          <template slot="message">
            <span style="margin-right: 12px">已选择: <a style="font-weight: 600">{this.selectedRows.length}</a></span>
            {needTotalItems}
            {clearItem}
          </template>
        </a-alert>
      ) */
    },
    columnChange(val) {
      this.columnsSetting = val
      this.$ls.set(this.$route.path, val)
    },
    renderHeader () {
      let tools = [
        {
          icon: 'ReloadOutlined',
          title: '刷新',
          onClick: () => {
            this.refresh()
          }
        },
        {
          icon: 'ColumnHeightOutlined',
          title: '密度',
          isDropdown: true,
          menu: () => {
            const onClick = ({ key }) => {
              this.customSize = key
            }
            return (
              <a-menu slot="overlay" onClick={onClick} selectable defaultSelectedKeys={[this.customSize]}>
                <a-menu-item key="default">默认</a-menu-item>
                <a-menu-item key="middle">中等</a-menu-item>
                <a-menu-item key="small">紧凑</a-menu-item>
              </a-menu>
            )
          },
          onClick: () => {
          }
        },
        {
          icon: 'setting',
          title: '列设置',
          isDropdown: true,
          menu: () => {
            //return <columnSetting slot="overlay" columns={this.columns} onColumnChange={this.columnChange} />
            return <columnSetting slot="overlay" columns={this.columnsSetting} onColumnChange={this.columnChange} />
          },
          onClick: () => {
          }
        }
      ]
      if (this.extraTool.length) {
        tools = tools.concat(this.extraTool)
      }

      return (
        <div class="s-table-tool">
          <div class="s-table-tool-left">
            {this.$slots.operator && this.$slots.operator()}
          </div>
          <div class="s-table-tool-right">
            {
              tools.map(tool => {
                if (tool.isDropdown) {
                  return (
                    <a-dropdown trigger={['click']}>
                      <a-tooltip title={tool.title} class="s-tool-item" onClick={tool.onClick}>
                        <a-icon type={tool.icon}/>
                      </a-tooltip>
                      { tool.menu() }
                    </a-dropdown>
                  )
                }
                return (
                  <a-tooltip title={tool.title} class="s-tool-item" onClick={tool.onClick}>
                    <a-icon type={tool.icon} />
                  </a-tooltip>
                )
              })
            }
          </div>
        </div>
      )
      /* return (
        <a-alert showIcon={true} style="margin-bottom: 16px">
          <template slot="message">
            <span style="margin-right: 12px">已选择: <a style="font-weight: 600">{this.selectedRows.length}</a></span>
            {needTotalItems}
            {clearItem}
          </template>
        </a-alert>
      ) */
    }
  },

  render () {
    let props = {}
    const localKeys = Object.keys(this.$data)
    const showAlert = (typeof this.alert === 'object' && this.alert !== null && this.alert.show) && typeof this.rowSelection.selectedRowKeys !== 'undefined' || this.alert

    Object.keys(T.props).forEach(k => {
      const localKey = `local${k.substring(0, 1).toUpperCase()}${k.substring(1)}`
      if (localKeys.includes(localKey)) {
        props[k] = this[localKey]
        return props[k]
      }
      if (k === 'rowSelection') {
        if (showAlert && this.rowSelection) {
          // 如果需要使用alert，则重新绑定 rowSelection 事件
          props[k] = {
            ...this.rowSelection,
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.updateSelect(selectedRowKeys, selectedRows)
              typeof this[k].onChange !== 'undefined' && this[k].onChange(selectedRowKeys, selectedRows)
            }
          }
          return props[k]
        } else if (!this.rowSelection) {
          // 如果没打算开启 rowSelection 则清空默认的选择项
          props[k] = null
          return props[k]
        }
      }
      this[k] && (props[k] = this[k])
      // 此处配置表格大小与要显示的列
      props = {
        ...props,
        size: this.customSize,
        columns: this.columnsSetting.filter(value => value.checked === undefined || value.checked)
      }
      return props[k]
    })
    const table = (
      <a-table {...{ props, slots: { ...this.$slots } }} onChange={this.loadData} onExpand={ (expanded, record) => { this.$emit('expand', expanded, record) } }>
        { Object.keys(this.$slots).map(name => (<template slot={name}>{this.$slots[name]}</template>)) }
      </a-table>
    )

    return (
      <div class="table-wrapper">
        { this.renderHeader() }
        { showAlert ? this.renderAlert() : null }
        { table }
      </div>
    )
  }
}
