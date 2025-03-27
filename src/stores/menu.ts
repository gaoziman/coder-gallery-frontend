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
    // 导航路径和菜单键的映射
    const pathKeyMap = ref({
        '/': { top: 'home', side: 'public-gallery' },
        '/create-image': { top: 'create-image', side: '' },
        '/space': { top: '', side: 'my-space' },
        '/dashboard': { top: 'content-management', side: '' },
        '/images': { top: 'content-management', side: '' },
        '/spaces': { top: 'content-management', side: '' },
        '/categories': { top: 'content-management', side: '' },
        '/tags': { top: 'content-management', side: '' },
        '/comments': { top: 'content-management', side: '' },
        '/users': { top: 'system-settings', side: '' },
        '/settings': { top: 'system-settings', side: '' },
        '/security': { top: 'system-settings', side: '' },
        '/favorites': { top: '', side: 'favorites' },
        '/saved': { top: '', side: 'saved' },
        '/history': { top: '', side: 'history' },
        '/team': { top: '', side: 'team' },
        '/explore': { top: '', side: 'explore' }
    });

    // 根据路径更新菜单选中状态
    function updateMenuByPath(path: string) {
        // 默认路径处理
        if (!path) path = '/';

        // 查找映射
        let mapping = pathKeyMap.value[path];

        // 如果没有精确匹配，尝试查找前缀匹配
        if (!mapping) {
            // 查找最长前缀匹配
            const matchedPath = Object.keys(pathKeyMap.value)
                .filter(p => p !== '/' && path.startsWith(p))
                .sort((a, b) => b.length - a.length)[0];

            if (matchedPath) {
                mapping = pathKeyMap.value[matchedPath];
            } else {
                mapping = { top: '', side: '' };
            }
        }

        // 更新菜单状态
        if (mapping.top && mapping.side) {
            // 特殊关联: 主页和公共图库
            topSelectedKeys.value = [mapping.top];
            sideSelectedKeys.value = [mapping.side];
            // 此时两侧都有选中项，以侧边栏为主
            activeMenuType.value = 'side';
        } else if (mapping.top) {
            // 只有顶部菜单项
            activeMenuType.value = 'top';
            topSelectedKeys.value = [mapping.top];
            sideSelectedKeys.value = [];
        } else if (mapping.side) {
            // 只有侧边栏菜单项
            activeMenuType.value = 'side';
            sideSelectedKeys.value = [mapping.side];
            topSelectedKeys.value = [];
        } else {
            // 都没有匹配，清除所有选中状态
            activeMenuType.value = 'side'; // 默认侧边栏
            topSelectedKeys.value = [];
            sideSelectedKeys.value = [];
        }
    }

    // 激活顶部菜单
    function activateTopMenu(key: string) {
        activeMenuType.value = 'top';
        topSelectedKeys.value = [key];

        // 清空侧边栏选中状态，但为主页/公共图库建立特殊关联
        if (key === 'home') {
            // 特殊关联：主页和公共图库同时选中
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
            // 特殊关联：公共图库和主页同时选中
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
        pathKeyMap,
        updateMenuByPath,
        activateTopMenu,
        activateSideMenu
    };
});