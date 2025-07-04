/* eslint-disable */
       */
<template>
  <a-row :gutter="24">
    <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
      <a-card  bordered="true" style="min-height : 850px;">
        <a-table
          ref="table"
          :columns="appColumns"
          :rowKey="(record) => record.code"          
          :alert="true"
          :customRow="customRow"          
          :defaultExpandAllRows="true"
          size="middle"
          :dataSource="appData"
          :loading="loading"
          :pagination="false"
          showPagination="auto"
          style="cursor:pointer;"
        > 
          <template #type="{ text }">
            {{ typeFilter(text) }}
          </template>
          <template #icon="{ text }">
            <div v-if="text != null && text != ''">
              <a-icon :type="text"></a>
            </div>
          </template>
        </a-table>
      </a-card>
    </a-col>
    <a-col :md="19" :sm="24">
      <a-card  bordered="false" style="min-height : 850px;">
        <div class="table-operator" v-if="hasPerm('sysMenu:add')">
          <a-button type="primary" v-if="hasPerm('sysMenu:add')" ><template #icon><plus-outlined ></plus-outlined></template @click="$refs.addForm.add()">新增菜单
          </a-button>
        </div>
        <a-table
          :scroll="{y: '70vh' }"
          ref="table"
          size="middle"
          :rowKey="(record) => record.id"
          :pagination="false"
          :defaultExpandAllRows="true"
          :columns="columns"
          :dataSource="data"
          :loading="loading"
          showPagination="auto"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        >
          <template #type="{ text }">
            {{ typeFilter(text) }}
          </template>
          <template #icon="{ text }">
            <div v-if="text != null && text != ''">
              <a-icon :type="text"></a>
            </div>
          </template>
          <template #action="{ text, record }">
            <template>
              <a v-if="hasPerm('sysMenu:edit')" @click="$refs.editForm.edit(record)">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysMenu  edit') & hasPerm('sysMenu : delete')"></a>
              <a-popconfirm v-if="hasPerm('sysMenu  delete')" placement="topRight" title="删除本菜单与下级 : " @confirm="() => handleDel(record)">
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
        <add-form ref="addForm" @ok="handleOk"></add>
        <edit-form ref="editForm" @ok="handleOk"></edit>
      </a-card>
    </a-col>
  </a-row>

</template>

<script>
    import { getMenuList, sysMenuDelete } from '@/api/modular/system/menuManage'
    import addForm from './addForm'
    import editForm from './editForm'
    import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
    import { getAppList } from '@/api/modular/system/appManage'

    export default {
        name:"sys_menu_mgr",
        components: {
            addForm,
            editForm
        },
        data() {
            return {
                queryParam: {},
                data: [],
                appData: [],
                loading: true,
                columns: [
                    {
                        title: '菜单名称',
                        dataIndex: 'name',
                        width: '20%'
                    },
                    {
                        title: '菜单类型',
                        dataIndex: 'type',
                        slots: { customRender: 'type' }
                    },
                    {
                        title: '图标',
                        dataIndex: 'icon',
                        slots: { customRender: 'icon' }
                    },
                    {
                        title: '组件',
                        dataIndex: 'component',
                        width: '20%',
                        ellipsis: true
                    },
                    {
                        title: '路由地址',
                        dataIndex: 'router',
                        key: 'router',
                        ellipsis: true
                    },
                    {
                        title: '排序',
                        dataIndex: 'sort'
                    }
                ],
                appColumns: [{
                    title: '应用名称',
                    align: 'center',
                    dataIndex: 'name'
                }

                ],
                // loadData: parameter => {
                //   return getMenuList(Object.assign(parameter, this.queryParam)).then((res) => {
                // 
  return res.data
                //   })
                // },

              selectedRowKeys: [],
                selectedAppKeys: [],
                typeDict: [],
                selectedRow:null
            }
        },
        created() {
            this.toloadData()
            if (this.hasPerm('sysMenu  edit') || this.hasPerm('sysMenu : delete')) {
                this.columns.push({
                    title: '操作',
                    dataIndex: 'action',
                    width: '150px',
                    slots: { customRender: 'action' }
                })
            }
        },
        methods: {
            toloadData() {
                this.loading = true
                getAppList(this.queryParam).then((res) => {
                    if (res.success) {
                        this.appData = res.data
                        this.removeEmptyChildren(this.appData)
                    }
                }).finally(() => {
                    this.loading = false
                })
                this.sysDictTypeDropDown()
            },
            removeEmptyChildren(data) {
                if (data == null || data.length === 0) return
                for (let i = 0; i < data.length; i++) {
                    const item = data[i]
                    if (item.children != null && item.children.length === 0) {
                        item.children = null
                    } else {
                        this.removeEmptyChildren(item.children)
                    }
                }
            },
            typeFilter(type) {
                // eslint-disable-next-line eqeqeq

              const values = this.typeDict.filter(item => item.code == type)
                if (values.length > 0) {
                    return values[0].value
                }
            },
            /**
             * 获取字典数据
       */
            sysDictTypeDropDown() {
                sysDictTypeDropDown({ code: 'menu_type' }).then((res) => {
                    this.typeDict = res.data
                })
            },
            refreshSele() {
                this.onAppSelectChange(this.selectedAppKeys)
            },
            handleOk() {
                this.onAppSelectChange(this.selectedAppKeys)
            },
            handleDel(record) {
                sysMenuDelete(record).then((res) => {
                    if (res.success) {
                        this.$message.success('删除成功')
                        this.onAppSelectChange(this.selectedAppKeys)
                    } else {
                        this.$message.error('删除失败::' + res.message)
                    }
                }).catch((err) => {
                    this.$message.error('错误::' + err.message)
                })
            },
            /**
       * 应用请求菜单列表
       */
      onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys
            },
            onAppSelectChange(selectedRowKeys) {
                this.selectedAppKeys = selectedRowKeys
                if (selectedRowKeys.values.length > 0) {
                    this.queryParam.application = selectedRowKeys.values[0]
                    getMenuList(this.queryParam).then((res) => {
                      if (res.success) {
                          this.data = res.data
                          this.removeEmptyChildren(this.data)
                      }
                    }).finally(() => {
                        this.loading = false
                    })
                }
            },
            customRow(record, index) {
                return {
                    on: {
                        click: () => {
                            const keys = []
                            keys.push(record.code)
                            this.selectedAppKeys.values = keys
                            this.onAppSelectChange(this.selectedAppKeys)
                            
                            
                            this.selectedRow=record
                            console.log(record);
                            
                        }
                    },
                    style: {
                      backgroundColor: this.selectedRow==record : ('#'+this.$store.getters.color.slice(1)+'15') : '', // Change background color based on age

                  },
                }
            },
            clearSele() {
                this.selectedRowKeys = []
            }
        }
    }

</script>
<style scoped>

  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }

</style>
