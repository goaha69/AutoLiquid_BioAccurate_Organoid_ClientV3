import Modal from 'ant-design-vue/es/modal'
import { createApp, h } from 'vue'

export default (app) => {
  function dialog (component, componentProps, modalProps) {
    const _vm = this
    modalProps = modalProps || {}
    if (!_vm || !_vm.$.appContext) {
      return
    }
    let dialogDiv = document.querySelector('body>div[type=dialog]')
    if (!dialogDiv) {
      dialogDiv = document.createElement('div')
      dialogDiv.setAttribute('type', 'dialog')
      document.body.appendChild(dialogDiv)
    }

    const handle = function (checkFunction, afterHandel) {
      if (checkFunction instanceof Function) {
        const res = checkFunction()
        if (res instanceof Promise) {
          res.then(c => {
            c && afterHandel()
          })
        } else {
          res && afterHandel()
        }
      } else {
        // checkFunction && afterHandel()
        checkFunction || afterHandel()
      }
    }

    const dialogInstance = createApp({
      data () {
        return {
          visible: true
        }
      },
      mounted () {
        // Vue 3中事件处理方式不同，这里可以省略
      },
      methods: {
        handleClose () {
          handle(this.$refs._component?.onCancel, () => {
            this.visible = false
            this.$refs._component?.$emit('close')
            this.$refs._component?.$emit('cancel')
            dialogInstance.unmount()
          })
        },
        handleOk () {
          handle(this.$refs._component?.onOK || this.$refs._component?.onOk, () => {
            this.visible = false
            this.$refs._component?.$emit('close')
            this.$refs._component?.$emit('ok')
            dialogInstance.unmount()
          })
        }
      },
      render: function () {
        const that = this
        const modalModel = modalProps && modalProps.model
        if (modalModel) {
          delete modalProps.model
        }
        const ModalProps = Object.assign({}, modalModel && { model: modalModel } || {}, {
          ...(modalProps.attrs || modalProps),
          visible: this.visible,
          onOk: () => {
            that.handleOk()
          },
          onCancel: () => {
            that.handleClose()
          }
        })

        const componentModel = componentProps && componentProps.model
        if (componentModel) {
          delete componentProps.model
        }
        const ComponentProps = Object.assign({}, componentModel && { model: componentModel } || {}, {
          ref: '_component',
          ...((componentProps && componentProps.attrs) || componentProps)
        })

        return h(Modal, ModalProps, [h(component, ComponentProps)])
      }
    })
    
    // 配置全局属性
    if (_vm.$router) {
      dialogInstance.config.globalProperties.$router = _vm.$router
    }
    if (_vm.$store) {
      dialogInstance.config.globalProperties.$store = _vm.$store
    }
    
    dialogInstance.mount(dialogDiv)
  }

  app.config.globalProperties.$dialog = function () {
    dialog.apply(this, arguments)
  }
}
