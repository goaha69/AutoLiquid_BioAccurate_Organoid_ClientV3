<template>
  <a-modal
    title="༭Լ"
    :width="1300"
    :open="visible"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <a-row :gutter="8">
          <div>
            <sp-input
              label="Ĳı"
              :labelWidth="150"
              :required="true"
              :isError="errors.code"
              v-model="attributeData.code"
            ></sp>
            <sp-input
              label="Ĳ"
              :required="true"
              :isError="errors.name"
              :inputWidth="300"
              v-model="attributeData.name"
            ></sp>

            <span
              class="span-label"
              style="margin-left: 0px;width : 100px;"
            ></span>
            <a-select
              style="width: 100px"
              v-model="attributeData.liquidRange"
            >
              <a-select-option
                v-for="(item, index) in liquidRanges"
                :key="index"
                :value="item.code"
              >{{ item.value }}</a-select-option>
            </a-select>
            <span class="span-unit">(l)</span>
          </div>

          <div style="margin-top:10px;">
            <sp-input
              label="κţŨȣ"
              :labelWidth="150"
              v-model="attributeData.barcode"
            ></sp>
          </div>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title="Һ"
            :bordered="false"
          >
            <div>
              <sp-input-number
                label="Һƫ"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.absorbOffset"
              ></sp>
              <sp-input
                label="Һٶ"
                :labelWidth="130"
                v-model="attributeData.absorbSpeed"
              ></sp>
              <sp-input-number
                label="Һȴ"
                :labelWidth="110"
                unit="s"
                v-model="attributeData.absorbDelay"
              ></sp>
              <sp-input
                label="Һٶ"
                :labelWidth="120"
                v-model="attributeData.absorbHeight2NormalHeightSpeed"
              ></sp>
            </div>

            <div style="margin-top:10px;">
              <sp-input-number
                label="Һ߶"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.absorbHeight2LiftingHeight"
              ></sp>
              <sp-input-number
                label="Һȴ"
                :labelWidth="130"
                unit="s"
                v-model="attributeData.absorbDelayAfterLift"
              ></sp>
              <sp-input
                label="ǰٶ"
                :labelWidth="170"
                v-model="attributeData.absorbMixingSpeed"
              ></sp>
            </div>

            
          </a-card>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title="Һ"
            :bordered="false"
          >
            <div>
              <sp-input-number
                label="Һƫ"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetOffset"
              ></sp>
              <sp-input
                label="Һٶ"
                :labelWidth="120"
                v-model="attributeData.jetSpeed"
              ></sp>
              <sp-input-number
                label="Һȴ"
                :labelWidth="120"
                unit="s"
                v-model="attributeData.jetDelay"
              ></sp>
              <sp-input
                label="Һٶ"
                :labelWidth="120"
                v-model="attributeData.jetHeight2NormalHeightSpeed"
              ></sp>
            </div>

            <div style="margin-top:10px;">
              <sp-input-number
                label="ڸ߶"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetWallHeight"
              ></sp>
              <sp-input-number
                label="ƫ"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetWallOffset"
              ></sp>
              <sp-input-number
                label="ڴ"
                :labelWidth="180"
                unit="mm"
                v-model="attributeData.jetWallOffset"
              ></sp>

              <span
                class="span-label"
                style="width:130px;"
              >Һ</span>
              <a-radio-group v-model="attributeData.jetWall">
                <a-radio
                  v-for="(item, index) in jetWalls"
                  :key="index"
                  :value="item.code"
                >{{ item.value }}</a-radio>
              </a-radio-group>
            </div>

            <div style="margin-top:10px;">
              <sp-input
                label="ٶ"
                :labelWidth="120"
                v-model="attributeData.jetMixingSpeed"
              ></sp>
            </div>
          </a-card>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title=""
            :bordered="false"
          >
            <div>
              <sp-input-number
                label="Һǰ"
                :labelWidth="110"
                unit="%"
                v-model="attributeData.absorbAirBeforePercent"
              ></sp>
              <sp-input-number
                label="Һ"
                :labelWidth="110"
                unit="%"
                v-model="attributeData.absorbAirAfterPercent"
              ></sp>
              <sp-input-number
                label="һҺ"
                :labelWidth="175"
                unit="%"
                v-model="attributeData.absorbLiquidMoreOne2MorePercent"
              ></sp>
              <sp-input-number
                label="һҺ"
                :labelWidth="205"
                unit="%"
                v-model="attributeData.jetLiquidMoreOne2MoreScale"
              ></sp>
              <div style="margin-top:10px;">
                    <span class="span-label" style="width:100px;">Ƿ</span>
                    <a-checkbox v-model="attributeData.isAmountAir" ></a>
                  </div> 
              </div>
          </a-card>
        </a-row>

        <!-- <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item label="ע" :labelCol="{ span: 2 }" :wrapperCol="{span:22}">
              <a-textarea :rows="2" placeholder="뱸ע" v-decorator="['remark']"></a-textarea>
            </a-form-item>
          </a-col>
        </a-row> -->

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { exp_liquid_edit } from '@/api/modular/experiment/liquidManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
export default {
  components: {
    SpInputNumber,
    SpInput
  },
  data () {
    return {
      statusData: [],
      Data: [],
      visible: false,
      formLoading: false,
      form: this.$form.createForm(this),
      liquidRanges: [],
      jetWalls: [],
      attributeData: {},
      errors: {
        code: false,
        name: false
      },
    }
  },
  methods: {
    /**
     * ȡֵ
       */
    sysDictTypeDropDown (text) {
      sysDictTypeDropDown({ code: 'yes_true_false' }).then((res) => {
        this.jetWalls = res.data
        this.jetWalls.forEach((item) => {
          item.code = item.code === 'true' : true : false
        })
      })

      sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
        this.liquidRanges = res.data
        this.liquidRanges.forEach((item) => {
          item.code = parseInt(item.code)

          if (this.attributeData.liquidRange == 0)
            this.attributeData.liquidRange = parseInt(item.code)
        })
      })
    },
    /**
       * ʼ
       */
      edit (record) {
      this.visible = true
      this.attributeData = { ...record };

      this.sysDictTypeDropDown()
    },
    validateFields () {
      var result = true;
      this.errors.code = !this.attributeData.code;
      this.errors.name = !this.attributeData.name;
      console.log(this.errors)
      for (const key in this.errors) {
        if (this.errors[key]) {
          result = false
          break;
        }
      }
      return result
    },
    handleSubmit () {
      console.log('=================handleSubmit=================')
      if (!this.validateFields())
        return;

      // this.attributeData.remark=this.form.getFieldsValue().remark

    this.attributeData.jetWall = this.attributeData.jetWall === true  1 : 0
      this.formLoading = true

      exp_liquid_edit(this.attributeData).then((res) => {
        if (res.success) {
          this.$message.success('༭ɹ')
          this.$emit('ok', this.attributeData)
          this.handleCancel()
        } else {
          this.$message.error(res.message)
        }
      }).finally((res) => {
        this.formLoading = false
      })
    },
    handleCancel () {
      this.form.resetFields()
      this.visible = false
    }
  }
}
</script>
<style scoped>
.span-unit {
  margin-left: 5px;
}
.span-label {
  width: 130px;
  text-align: right;
  display: inline-block;
  color: black;
}
</style>
