// stores/menu.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {
    // 状态定义
    // 当前活跃的菜单类型: 'top' 或 'side'
    const activeMenuType = ref('side');
    // 顶部菜单选中的键
    const topSelectedKeys = ref(['home']);
    // 侧边栏菜单选中的键
    const sideSelectedKeys = ref(['public-gallery']);

    // 激活顶部菜单
    function activateTopMenu(key: string) {
        activeMenuType.value = 'top';
        topSelectedKeys.value = [key];

        // 清空侧边栏选中状态，但为主页/公共图库建立特殊关联
        if (key === 'home') {
            // 虽然activeMenuType是top，但仍保留侧边栏的公共图库选中状态
            sideSelectedKeys.value = ['public-gallery'];
        } else {
            sideSelectedKeys.value = [];
        }
    }

    // 激活侧边栏菜单
    function activateSideMenu(key: string) {
        activeMenuType.value = 'side';
        sideSelectedKeys.value = [key];

        // 清空顶部菜单选中状态，但为公共图库/主页建立特殊关联
        if (key === 'public-gallery') {
            // 虽然activeMenuType是side，但仍保留顶部的主页选中状态
            topSelectedKeys.value = ['home'];
        } else {
            topSelectedKeys.value = [];
        }
    }

    // 返回状态和方法
    return {
        activeMenuType,
        topSelectedKeys,
        sideSelectedKeys,
        activateTopMenu,
        activateSideMenu
    };
});