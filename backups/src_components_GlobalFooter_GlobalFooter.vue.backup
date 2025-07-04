<template>
  <div class="footer">
    <div class="links">
    </div>
    <div class="copyright">
      Copyright © 2025 <a target="_blank" href="https://www.bio-accurate.com/">创芯国际</a> All rights reserved. 发布版本V.{{currentVersion}}
      <p>完整版本V.{{currentVersion}}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'GlobalFooter',
  props: {
    currentVersion: {
      type: String,
      default: '1.0.0.0'
    },
  },
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
.footer {
  padding: 0 16px;
  margin: 0 0 10px;
  text-align: center;

  .links {
    margin-bottom: 8px;

    a {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }

      &:not(:last-child) {
        margin-right: 40px;
      }
    }
  }
  .copyright {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>
