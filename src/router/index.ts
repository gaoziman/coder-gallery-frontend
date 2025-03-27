// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/pages/home/HomePage.vue';
import { message } from "ant-design-vue";
import { useUserStore } from "@/stores/user";

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
                meta: {
                    title: '我的空间',
                    requiresAuth: true
                },
            },
            {
                path: '/create-image',
                name: 'CreateImage',
                component: () => import('@/pages/picture/CreatePicture.vue'),
                meta: {
                    title: '创建图片 - 智能云图库',
                    requiresAuth: true
                },
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫导航
router.beforeEach(async (to, from, next) => {
    // 动态设置页面标题
    document.title = to.meta.title as string || '智能云图库';

    const userStore = useUserStore();

    // 检查是否需要登录权限
    if (to.meta.requiresAuth) {
        // 如果用户未登录
        if (!userStore.isLoggedIn) {
            // 保存重定向路径
            userStore.setRedirectPath(to.fullPath);

            // 直接打开登录模态框，无需确认
            userStore.openLoginModal();

            // 重定向到首页
            next('/');
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