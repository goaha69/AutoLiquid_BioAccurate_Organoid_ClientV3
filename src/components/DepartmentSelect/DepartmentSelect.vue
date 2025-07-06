 <template>
  <a-tree-select
    :dropdownStyle="{ maxHeight: '300px', overflow: 'auto' }"
    allowClear
    :treeData="orgTree"
    :placeholder="placeholder"
    treeDefaultExpandAll
    @change="onchange"
  >
    <template #title="{ { id } }"><span>{{ id }}</span></template>
  </a-tree-select>
</template>
<script>
import { getOrgTree } from '@/api/modular/system/orgManage'

export default {
  name: 'DepartSelect',
  props: {
    placeholder: {
      type: String
    },
    modelValue: {
      type: String
    }
  },
  data() {
    return {
      orgTree: []
    }
  },
  created() {
    this.getOrgData()
  },
  methods: {
    getOrgData() {
      getOrgTree().then((res) => {
        this.orgTree = res
      })
    },
    /**
     * 选择树机构,初始化机构名称于表单 */
    onchange (value) {
      this.$emit('change', value)
    }
  }
}
</script>
