// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/pages/home/HomePage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'HomePage',
                component: HomePage,
                meta: { title: '智能云图库 - 公共图库' }
            },
            // {
            //     path: '/my-space',
            //     name: 'MySpace',
            //     component: () => import('../pages/MySpace.vue'),
            //     meta: { title: '智能云图库 - 我的空间' }
            // },
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

export default router;