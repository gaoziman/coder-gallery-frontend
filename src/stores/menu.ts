import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义路径映射的接口类型
interface MenuPathItem {
    top: string | string[] | '';
    side: string | string[] | '';
}

// 定义路径映射字典的类型
interface PathKeyMapType {
    [path: string]: MenuPathItem;
}

export const useMenuStore = defineStore('menu', () => {
    // 状态定义保持不变
    const activeMenuType = ref('side');
    const topSelectedKeys = ref(['home']);
    const sideSelectedKeys = ref(['public-gallery']);

    // 修改路径映射，确保子菜单路径能正确映射到父菜单
    const pathKeyMap = ref<PathKeyMapType>({
        '/': { top: 'home', side: 'public-gallery' },
        '/create-image': { top: 'create-image', side: '' },
        '/space': { top: '', side: 'my-space' },
        // 管理员路径，修改为数组形式，允许同时选中多个菜单项
        '/admin/dashboard': { top: ['content-management', 'dashboard'], side: '' },
        '/admin/users': { top: ['content-management', 'users'], side: '' },
        '/admin/images': { top: ['content-management', 'images'], side: '' },
        '/admin/spaces': { top: ['content-management', 'spaces'], side: '' },
        '/admin/categories': { top: ['content-management', 'categories'], side: '' },
        '/admin/tags': { top: ['content-management', 'tags'], side: '' },
        '/admin/comments': { top: ['content-management', 'comments'], side: '' },
        '/admin/storage': { top: ['system-settings', 'storage'], side: '' },
        '/favorites': { top: '', side: 'favorites' },
        '/saved': { top: '', side: 'saved' },
        '/history': { top: '', side: 'history' },
        '/team': { top: '', side: 'team' },
        '/team/create': { top: '', side: 'team' }, // 添加创建团队路径
        '/explore': { top: '', side: 'explore' }
    });

    // 修改更新菜单函数，支持数组形式的菜单键
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

        // 更新菜单状态，处理数组形式的顶部菜单键
        if (mapping.top && mapping.side) {
            // 特殊关联: 主页和公共图库
            topSelectedKeys.value = Array.isArray(mapping.top) ? mapping.top : [mapping.top];
            sideSelectedKeys.value = Array.isArray(mapping.side) ? mapping.side : [mapping.side];
            // 此时两侧都有选中项，根据当前路径决定以哪边为主
            activeMenuType.value = path.startsWith('/admin') ? 'top' : 'side';
        } else if (mapping.top) {
            // 只有顶部菜单项
            activeMenuType.value = 'top';
            topSelectedKeys.value = Array.isArray(mapping.top) ? mapping.top : [mapping.top];
            sideSelectedKeys.value = [];
        } else if (mapping.side) {
            // 只有侧边栏菜单项
            activeMenuType.value = 'side';
            sideSelectedKeys.value = Array.isArray(mapping.side) ? mapping.side : [mapping.side];
            topSelectedKeys.value = [];
        } else {
            // 都没有匹配，清除所有选中状态
            activeMenuType.value = 'side'; // 默认侧边栏
            topSelectedKeys.value = [];
            sideSelectedKeys.value = [];
        }
    }

    // 激活顶部菜单，需要支持子菜单选中时父菜单也选中
    function activateTopMenu(key: string) {
        activeMenuType.value = 'top';

        // 查找key是否是子菜单项
        const isChildMenu = Object.values(pathKeyMap.value).some(mapping => {
            if (Array.isArray(mapping.top) && mapping.top.length > 1) {
                return mapping.top[1] === key; // 检查是否为子菜单键
            }
            return false;
        });

        if (isChildMenu) {
            // 如果是子菜单，需要找到对应的父菜单
            for (const path in pathKeyMap.value) {
                const mapping = pathKeyMap.value[path];
                if (Array.isArray(mapping.top) && mapping.top.includes(key)) {
                    // 找到了包含此子菜单的路径，设置完整的选中状态
                    topSelectedKeys.value = mapping.top;
                    break;
                }
            }
        } else {
            // 如果是父菜单或独立菜单，直接设置
            topSelectedKeys.value = [key];
        }

        // 清空侧边栏选中状态，但为主页/公共图库建立特殊关联
        if (key === 'home') {
            // 特殊关联：主页和公共图库同时选中
            sideSelectedKeys.value = ['public-gallery'];
        } else {
            sideSelectedKeys.value = [];
        }
    }

    // 激活侧边栏菜单，保持不变
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