import { reactive } from 'vue'
// 日期使用字符串格式，避免与 dayjs 对象循环引用

export function useEquipmentForm() {
  const formModal = reactive({
    visible: false,
    loading: false,
    data: {
      id: null,
      code: '',
      name: '',
      // legacy fields
      type: 3,
      communicatioProtocol: 1,
      isThirdParty: false,
      host: '',
      port: 0,
      comPort: '',
      baudRate: 0,
      manufacturer: '',
      manufactureDate: null,
      coordinateType: 0,
      clipEquipmentId: null,
      xOffset: 0,
      yOffset: 0,
      controlClass: '',
      paramsPage: '',
      remark: '',
      // nested pipetteAttribute placeholder
      pipetteAttribute: {
        equipmentId: 0,
        channelRow: 1,
        channelCol: 1,
        headLiquidRange: 0,
        isVariable: false,
        walkingLogic: 0,
        takeTipEachCol: true,
        takeTipLeft2Right: true,
        releaseTipUsePush: true,
        releaseTipUsePushCount: 1,
        releaseTipOffset: 0,
        releaseTipAxis: 4,
        prepareReleaseTipPosX: 0,
        prepareReleaseTipPosY: 0,
        prepareReleaseTipPosZ: 0,
        releaseTipPosX: 0,
        releaseTipPosY: 0,
        releaseTipPosZ: 0,
        prepareReleaseTipAxisXGoFirst: false,
        prepareReleaseTipAxisYGoFirst: false,
        releaseTipBack2TakePos: false,
        releaseTipZa0Before: false,
        releaseTipSpeedCmd: '',
        releaseTipAfterCmd: '',
        a1Pos: 0,
        absorbAirBeforePercent: 0,
        absorbAirAfterPercent: 0,
        absorbLiquidMoreOne2MorePercent: 0,
        jetLiquidMoreOne2MoreScale: 0,
        jetEquipmentId: '',
        pipetteChannels: '',
        baffleItinerary: 0,
        yMoveWithHead: true,
        yAvailable: true
      }
    }
  })

  const resetForm = () => {
    Object.assign(formModal.data, {
      id: null,
      code: '',
      name: '',
      // legacy fields
      type: 3,
      communicatioProtocol: 1,
      isThirdParty: false,
      host: '',
      port: 0,
      comPort: '',
      baudRate: 0,
      manufacturer: '',
      manufactureDate: null,
      coordinateType: 0,
      clipEquipmentId: null,
      xOffset: 0,
      yOffset: 0,
      controlClass: '',
      paramsPage: '',
      remark: '',
      // nested pipetteAttribute placeholder
      pipetteAttribute: {
        equipmentId: 0,
        channelRow: 1,
        channelCol: 1,
        headLiquidRange: 0,
        isVariable: false,
        walkingLogic: 0,
        takeTipEachCol: true,
        takeTipLeft2Right: true,
        releaseTipUsePush: true,
        releaseTipUsePushCount: 1,
        releaseTipOffset: 0,
        releaseTipAxis: 4,
        prepareReleaseTipPosX: 0,
        prepareReleaseTipPosY: 0,
        prepareReleaseTipPosZ: 0,
        releaseTipPosX: 0,
        releaseTipPosY: 0,
        releaseTipPosZ: 0,
        prepareReleaseTipAxisXGoFirst: false,
        prepareReleaseTipAxisYGoFirst: false,
        releaseTipBack2TakePos: false,
        releaseTipZa0Before: false,
        releaseTipSpeedCmd: '',
        releaseTipAfterCmd: '',
        a1Pos: 0,
        absorbAirBeforePercent: 0,
        absorbAirAfterPercent: 0,
        absorbLiquidMoreOne2MorePercent: 0,
        jetLiquidMoreOne2MoreScale: 0,
        jetEquipmentId: '',
        pipetteChannels: '',
        baffleItinerary: 0,
        yMoveWithHead: true,
        yAvailable: true
      }
    })
  }

  const setFormData = (record) => {
    // 简单地复制数据，让日期选择器自己处理日期格式
    Object.assign(formModal.data, {
      ...record,
      manufactureDate: record.manufactureDate || null
    })
  }

  return {
    formModal,
    resetForm,
    setFormData
  }
} 