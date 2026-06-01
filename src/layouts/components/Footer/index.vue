<template>
  <div class="footer flx-center">
    <div class="footer-content">
      <a href="https://szadmin.cn" target="_blank">
        Sz-Admin v{{ version }} | Copyright © 2022-{{ new Date().getFullYear() }} 升职哦（sz）
      </a>
      <span class="separator">|</span>
      <a href="mailto:chris@yonglongbai.com">chris@yonglongbai.com</a>
      <span class="separator">|</span>
      <a href="https://wa.me/8613510335884" target="_blank">WhatsApp: +86 13510335884</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import pkg from 'package.json';
const version: string = pkg.version;
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
