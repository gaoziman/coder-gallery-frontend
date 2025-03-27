// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/pages/home/HomePage.vue';
import {message, Modal} from "ant-design-vue";
import {useUserStore} from "@/stores/user";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Home',
                component: HomePage,
                meta: {
                    title: '智能云图库 - 发现精彩图片世界',
                    requiresAuth: false
                },
            },
            {
                path: '/space',
                name: 'MySpacePage',
                component: () => import('@/pages/space/MySpacePage.vue'),
                meta: { title: '智能云图库 - 我的空间' }
            },
            // {
            //     path: '/team',
            //     name: 'Team',
            //     component: () => import('../pages/Team.vue'),
            //     meta: { title: '智能云图库 - 团队协作' }
            // },
            // {
            //     path: '/explore',
            //     name: 'Explore',
            //     component: () => import('../pages/Explore.vue'),
            //     meta: { title: '智能云图库 - 探索发现' }
            // },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由导航守卫，用于设置页面标题
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title as string;
    }
    next();
});


router.beforeEach(async (to, from, next) => {
    // 动态设置页面标题
    document.title = to.meta.title as string || '智能云图库';

    const userStore = useUserStore();

    // 检查是否需要登录权限
    if (to.meta.requiresAuth) {
        // 如果用户未登录
        if (!userStore.isLoggedIn) {
            // 显示提示消息
            message.warning('请先登录后再访问此页面');

            // 创建一个包含登录模态框的临时容器
            const container = document.createElement('div');
            document.body.appendChild(container);

            // 使用 Ant Design Vue 的 Modal 组件
            Modal.confirm({
                title: '需要登录',
                content: '该页面需要登录才能访问，是否立即登录？',
                okText: '登录',
                cancelText: '返回首页',
                onOk: () => {
                    // 通过事件总线或其他方式打开登录弹窗
                    // 这里需要根据实际项目情况调整
                    // 例如，可以触发事件总线上的事件
                    window.dispatchEvent(new CustomEvent('openLoginModal'));
                    next('/');
                },
                onCancel: () => {
                    next('/');
                }
            });

            return;
        }

        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && userStore.userInfo?.role !== 'admin') {
            message.error('无权访问此页面');
            next('/');
            return;
        }
    }

    // 符合权限要求，允许访问
    next();
});

export default router;