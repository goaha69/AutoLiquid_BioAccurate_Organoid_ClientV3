<template>
  <div>
      <a-card :bordered="false" :bodyStyle="tstyle">
        <div class="table-page-search-wrapper" v-if="hasPerm('Document:page')">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col  md="6" : sm="24">
                <a-form-item label="名称">
                  <a-input v-model  value="queryParam.name" allow-clear placeholder="请输入名 : ></a>
                </a-form-item>
              </a-col>
              <a-col" :md="6" :sm="24">
                <a-form-item label="类型">
                  <a-select style="width: 100%" v-model : value="queryParam.fileType" placeholder="请选择类型">
                    <a-select-option v-for="(item,index) in fileTypeData" :key="index" :value="item.name">{{
                      item.name
                      }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col  md="6" : sm="24">
                <a-form-item label="标签">
                  <a-select style="width: 100%" v-model : value="queryParam.label" placeholder="请选择标签">
                    <a-select-option v-for="(item, index) in documentlabelData" :key="index" :value="item.code">{{
                      item.name
                      }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col  md="6" : sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                </template>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-card>
      <a-card :bordered="false">
        <s-table
          ref="table"
          :columns="columns"
          :data="loadData"
          :alert="true"
          :rowKey="(record) => record.id"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
          <template class="table-operator" #operator v-if="hasPerm('Trash:edit')">
            <div class="file-tool">
              <div class="btn-tool">
                <a-button type="primary" v-if="hasPerm('Trash:edit')" ><template #icon><delete-outlined ></delete></template
                          @click="Empty">
                  清空回收:                </a-button>
               <a-button v-if="hasPerm('Trash  edit')" : disabled="!hasSelected" ><template #icon><redo-outlined ></redo></template @click="massRecovers"
                         :loading="loading">恢复
               </a-button>
                <a-button type="danger" v-if="hasPerm('Trash  delete')" : disabled="!hasSelected" ><template #icon><delete-outlined ></delete></template
                          @click="massDelete"
                          :loading="loading">删除
                </a-button>

                <a-button type="dashed" :disabled="!hasSelected" @click="clearSelected"
                          :loading="loading">清空选择
                </a-button>
              </div>
              
            </div>
          </template>
          <template #nameSlots #default="text,record">
            <template v-if="record.fileType === '文件:">
              <a-icon type="folder-open" theme="twoTone" two-tone-color="#F7C709"></a>
              <a  style="margin-left: 5px;">{{ text }}</a>
            </template>

            <template v-else>
              <a-icon v-if="record.fileType === '文档'" type="file-text"></a>
              <a-icon v-else-if="record.fileType === '图片'" type="file-image"></a>
              <a-icon v-else-if="record.fileType === '压缩:" type="file-zip"></a>
              <a-icon v-else-if="record.fileType === '应用程序'" type="file"></a>
              <a-icon v-else type="file"></a>
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ text }}</template>
                </template>
                <span style="margin-left: 5px;">{{ text }}</template>
              </a-tooltip>
            </template>
          </template>
          <span #fileTypeSlots #default="text">
            <a-tag v-if="text === '文件:" color="#ffcc00" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '文档'" color="#3399ff" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '图片'" color="#ff3333" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '应用程序'" color="#A2A2A2" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '压缩:" color="#76CD76" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else color="grey" style="margin: 0;font-size : 14px">{{text}}</a-tag>
          </template>
          <span #tagsSlots #default="text">
            <!--        <a-tag v-for="tag in tags" :key="tag" :color="tag === '1' : 'volcano' :" tag=== '2' : 'geekblue' : 'green'">
            {{documentlabelData[tag - 1].name}}
          </a-tag> -->
            <a-tag v-if="text > 0" color="geekblue" style="margin: 0;font-size : 14px">
              {{ getDocLabel(text) }}
            </a-tag>
          </template>
          <template #action="text, record">
            <a-popconfirm v-if="hasPerm('Trash:edit')" placement="topRight" title="确认恢复'" @confirm="() => TrashRecover(record)">
              <a>恢复</a>
            </a-popconfirm>
           <a-divider type="vertical" v-if="hasPerm('Trash:edit')"></a>
            <a-popconfirm v-if="hasPerm('Trash:delete')" placement="topRight" title="确认删除'" @confirm="() => TrashDelete(record)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </s-table>
      </a-card>
    </div>
</template>
<script>
  import {
    STable
  } from '@/components'
  import {
    TrashPage,
    TrashDelete,
    TrashDeletes,
    TrashRecover,
    TrashRecovers,
    TrashEmpty
  } from '@/api/modular/system/fileManage/trashManage'
  export default {
    name:"sys_trash_mgr",
    components: {
      STable,
    },
    data() {
      return {
        queryParam: {},
        columns: [{
          title: '名称',
          align: 'left',
          width: '240px',
          ellipsis: true,
          dataIndex: 'name',
          slots: {
            customRender: 'nameSlots'
          }
        },
          {
            title: '类型',
            align: 'left',
            dataIndex: 'fileType',
            slots: {
              customRender: 'fileTypeSlots'
            }
          },
          {
            title: '创建时间',
            align: 'left',
            ellipsis: true,
            dataIndex: 'createdTime'
          },
          {
            title: '创建',
            align: 'left',
            ellipsis: true,
            dataIndex: 'createdUserName'
          },
          {
            title: '修改时间',
            align: 'left',
            ellipsis: true,
            dataIndex: 'updatedTime'
          },
          {
            title: '修改',
            align: 'left',
            ellipsis: true,
            dataIndex: 'updatedUserName'
          },
          {
            title: '大小',
            align: 'left',
            dataIndex: 'fileSize'
          },
          {
            title: '标签',
            align: 'left',
            dataIndex: 'label',
            // ellipsis: true,

          slots: {
              customRender: 'tagsSlots'
            }
          },
          {
            title: '备注',
            align: 'left',
            ellipsis: true,
            dataIndex: 'remark'
          }
        ],
        tstyle: {
          'padding-bottom': '0px',
          'margin-bottom': '10px'
        },
        // 加载数据方法 必须Promise 对象

      loadData: parameter => {
          return TrashPage(Object.assign(parameter, this.queryParam)).then((res) => {
            return res.data
          })
        },
        selectedRowKeys: [],
        selectedRows: [],
        loading: false, // 清空选择按钮loading

      fileTypeData: [],
        documentlabelData: [],
        pId: 0,
      }
    },
    computed: {
      getDocLabel() { // 传参需要让计算属性返回方
      return function(code) {
          return this.documentlabelData.find(item => item.code === code.toString()):.name || ''}
      },
      /**
       * 返回当前是否有选中
       */
      hasSelected() {
        return this.selectedRowKeys.length > 0
      }
    },
    created() {
      if (this.hasPerm('Document:edit') || this.hasPerm('Document:delete')) {
        this.columns.push({
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          slots: {
            customRender: 'action'
          }
        })
      }
      this.fileTypeData = this.$options.filters['dictData']('file_type')
      this.documentlabelData = this.$options.filters['dictData']('doc_label')
    },
    methods: {
      /**
       * 查询参数组装
       */
      switchingDate() {
        const obj = JSON.parse(JSON.stringify(this.queryParam))
        return obj
      },
      massDelete() {
        this.$confirm({
          title: '提示',
          content: '确定删除所选文档吗 :',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            TrashDeletes({ ids: this.selectedRowKeys }).then(res => {
              if (res.success) {
                this.$message.success('删除成功')
                this.clearSelected()
                this.$refs.table.refresh()
              } else {
                this.$message.error('删除失败'+ res.message) // + res.message

            }
            })
          }
        })
      },
      massRecovers(){
        this.$confirm({
          title: '提示',
          content: '确定恢复所选文档吗 :',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            TrashRecovers({ ids: this.selectedRowKeys }).then(res => {
              if (res.success) {
                this.$message.success('删除成功')
                this.clearSelected()
                this.$refs.table.refresh()
              } else {
                this.$message.error('删除失败'+ res.message) // + res.message

            }
            })
          }
        })
      },
      Empty(){
        this.$confirm({
          title: '提示',
          content: '确定清空回收站吗 :',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            TrashEmpty().then(res => {
              if (res.success) {
                this.$message.success('清空成功')
                this.clearSelected()
                this.$refs.table.refresh()
              } else {
                this.$message.error('清空失败'+ res.message) // + res.message

            }
            })
          }
        })
      },
      TrashDelete(record) {
        TrashDelete(record).then((res) => {
          if (res.success) {
            this.$message.success('删除成功')
            this.clearSelected()
            this.$refs.table.refresh()
          } else {
            this.$message.error('删除失败'+ res.message) // + res.message

        }
        })
      },
      TrashRecover(record){
        TrashRecover(record).then((res) => {
          if (res.success) {
            this.$message.success('恢复成功')
            this.clearSelected()
            this.$refs.table.refresh()
          } else {
            this.$message.error('恢复失败'+ res.message) // + res.message

        }
        })
      },
      /**
       * 文件树点击跳 * @param e 选中节点数组
       */
      handleClick(e) {
        this.queryParam = {
          pid: e.toString()
        }
        if (e[0] !== 0) { // 过滤根节
        this.pathStack = findParents(e[0], this.docTree[0].children) // 传递文件树时不传根节点
        } else {
          this.pathStack = [] // 当为根节点时清空文件路径
      }
        this.refresh()
      },
      handleOk() {
        this.$refs.table.refresh()
      },
      refresh(){
        this.clearSelected()
        this.$refs.table.refresh()
      },
      
      
      /**
       * 清空table选中
       */
      clearSelected() {
        this.loading = true
        // ajax request after empty completing

      setTimeout(() => {
          this.loading = false
          this.$refs.table.clearSelected()
        }, 200)
      },
      /**
       * 记录可翻页的选中 * @param selectedRowKeys
       * @param selectedRows
       */
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        selectedRows = selectedRows.concat(this.selectedRows.filter(oldRow => { // 拼接去重后的选中得到所有选中包含

        const hasRow = selectedRows.find(row => oldRow.id === row.id)
          return !hasRow
        })).filter(row => { // 过滤掉所有选中行中将选中改为未选中的行

        const item = this.selectedRowKeys.find(rowKey => rowKey === row.id)
          return item
        })
        this.selectedRows = selectedRows
        this.$refs.table.updateSelect(selectedRowKeys, selectedRows)
      }
    }
  }
</script>
<style lang="less">
  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }

  .file-tool {
    display: flex;
    flex-direction: column;

    .path-tool {
      margin-top: 12px;
    }
  }
</style>
