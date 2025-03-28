// src/router/index.ts
import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import HomePage from '@/pages/home/HomePage.vue';
import {message} from "ant-design-vue";
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
            },
            {
                path: '/picture/:id',
                name: 'PictureDetail',
                component: () => import('@/pages/picture/PictureDetail.vue'),
                meta: {
                    title: '图片详情 - 智能云图库',
                    requiresAuth: false
                },
            },
            // 添加图片编辑页路由
            {
                path: '/edit-image/:id',
                name: 'EditImage',
                component: () => import('@/pages/picture/EditPicture.vue'),
                meta: {
                    title: '编辑图片 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/admin',
                meta: {
                    requiresAuth: true,
                    requiresAdmin: true
                },
                children: [
                    {
                        path: 'dashboard',
                        name: 'AdminDashboard',
                        component: () => import('@/pages/admin/DashboardPage.vue'),
                        meta: {
                            title: '管理仪表盘 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    // {
                    //     path: 'images',
                    //     name: 'AdminImages',
                    //     component: () => import('@/pages/admin/images/ImagesManagement.vue'),
                    //     meta: {
                    //         title: '图片管理 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'categories',
                    //     name: 'AdminCategories',
                    //     component: () => import('@/pages/admin/categories/CategoriesManagement.vue'),
                    //     meta: {
                    //         title: '分类管理 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'tags',
                    //     name: 'AdminTags',
                    //     component: () => import('@/pages/admin/tags/TagsManagement.vue'),
                    //     meta: {
                    //         title: '标签管理 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'users',
                    //     name: 'AdminUsers',
                    //     component: () => import('@/pages/admin/users/UsersManagement.vue'),
                    //     meta: {
                    //         title: '用户管理 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'comments',
                    //     name: 'AdminComments',
                    //     component: () => import('@/pages/admin/comments/CommentsManagement.vue'),
                    //     meta: {
                    //         title: '评论管理 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'settings',
                    //     name: 'AdminSettings',
                    //     component: () => import('@/pages/admin/settings/SystemSettings.vue'),
                    //     meta: {
                    //         title: '系统设置 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // },
                    // {
                    //     path: 'security',
                    //     name: 'AdminSecurity',
                    //     component: () => import('@/pages/admin/security/SecurityCenter.vue'),
                    //     meta: {
                    //         title: '安全中心 - 智能云图库',
                    //         requiresAuth: true,
                    //         requiresAdmin: true
                    //     },
                    // }
                ]
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