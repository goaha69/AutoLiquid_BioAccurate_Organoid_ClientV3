<template>
  <div v-if="hasPerm('sysMachine:query')">
    <!-- 系统信息  Java信息-->
    <a-row :gutter="24">
      <a-col md="12" sm="24">
        <a-card :loading="loading" title="系统信息" style="margin-bottom: 20px" :bordered="false">
          <table class="sysInfo_table">
            <tbody>
              <tr>
                <td>服务器名称</td>
                <td>{{ sysInfo.computerName }}</td>
              </tr>
              <tr>
                <td>操作系统</td>
                <td>{{ sysInfo.osName }}</td>
              </tr>
              <tr>
                <td>系统架构</td>
                <td>{{ sysInfo.osArch }}</td>
              </tr>
            </tbody>
          </table>
        </a-card>
      </a-col>
      <a-col md="12" sm="24">
        <a-card :loading="loading" title="网络信息" style="margin-bottom: 20px" :bordered="false">
          <table class="sysInfo_table">
            <tbody>
              <tr>
                <td class="sysInfo_td">外网信息:</td>
                <td class="sysInfo_td">{{ machineBaseInfo.wanIp }}</td>
              </tr>
              <tr>
                <td class="sysInfo_td">IPv4地址:</td>
                <td class="sysInfo_td">{{ machineBaseInfo.lanIp }}</td>
              </tr>
              <tr>
                <td class="sysInfo_td">网卡MAC</td>
                <td class="sysInfo_td">{{ machineBaseInfo.ipMac }}</td>
              </tr>
              <tr>
                <td class="sysInfo_td">流量统计:</td>
                <td class="sysInfo_td">{{ machineNetworkInfo.sendAndReceived }}</td>
              </tr>
              <tr>
                <td class="sysInfo_td">网络速度:</td>
                <td class="sysInfo_td">{{ machineNetworkInfo.networkSpeed }}</td>
              </tr>
            </tbody>
          </table>
        </a-card>
      </a-col>
    </a-row>
    <a-card :loading="loading" title="其他信息" :bordered="false">
      <table class="sysInfo_table">
        <tbody>
          <tr>
            <td class="sysInfo_td">运行时间:</td>
            <td class="sysInfo_td">{{ machineUseInfo.runTime }}</td>
            <td class="sysInfo_td">CPU使用率:</td>
            <td class="sysInfo_td">{{ machineUseInfo.cpuRate }}%</td>
          </tr>
          <tr>
            <td class="sysInfo_td">总内存:</td>
            <td class="sysInfo_td">{{ machineUseInfo.totalRam }}</td>
            <td class="sysInfo_td">内存使用率:</td>
            <td class="sysInfo_td">{{ machineUseInfo.ramRate }}%</td>
          </tr>
        </tbody>
      </table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { sysMachineBase, sysMachineUse, sysMachineNetwork } from '@/api/modular/system/machineManage'
import { hasPerm } from '@/utils/permission/index'

defineOptions({
  name: 'sys_monitor_mgr_machine_monitor'
})

const loading = ref(true)
const machineBaseInfo = reactive({})
const machineUseInfo = reactive({})
const machineNetworkInfo = reactive({})
let timer = null

const loadMachineBaseInfo = () => {
  sysMachineBase().then((res) => {
    loading.value = false
    Object.assign(machineBaseInfo, res.data)
  })
}

const loadMachineUseInfo = () => {
  sysMachineUse().then((res) => {
    loading.value = false
    Object.assign(machineUseInfo, res.data)
  })
}

const loadMachineNetworkInfo = () => {
  sysMachineNetwork().then((res) => {
    loading.value = false
    Object.assign(machineNetworkInfo, res.data)
  })
}

const refreshData = () => {
  loadMachineUseInfo()
  loadMachineNetworkInfo()
}

onMounted(() => {
  loadMachineBaseInfo()
  loadMachineUseInfo()
  timer = setInterval(refreshData, 3000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="less">
.sysInfo_table {
  width: 100%;
  min-height: 45px;
  line-height: 45px;
  text-align: center;
}

.sysInfo_td {
  border-bottom: 1px solid #e8e8e8;
}
</style>
