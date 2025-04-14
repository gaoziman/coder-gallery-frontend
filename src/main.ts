import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/assets/styles/base.css';
import IconFont from '@/components/common/IconFont.vue'
import IconSelector from '@/components/common/IconSelector.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { fas } from '@fortawesome/free-solid-svg-icons' // 导入所有实底风格图标
import { far } from '@fortawesome/free-regular-svg-icons' // 导入所有线框风格图标
import { fab } from '@fortawesome/free-brands-svg-icons' // 导入所有品牌图标
import iconService from '@/api/IconService';

// 初始化图标服务
iconService.init();

library.add(fas, far, fab)

const app = createApp(App);

app.component('IconFont', IconFont)
app.component('IconSelector', IconSelector)
app.component('font-awesome-icon', FontAwesomeIcon)


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(router)
    .use(pinia)
    .use(Antd)
    .mount('#app');