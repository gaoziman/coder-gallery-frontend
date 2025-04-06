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
                    title: '发现精彩图片世界 - 智能云图库',
                    requiresAuth: false
                },
            },
            {
                path: '/space',
                name: 'MySpacePage',
                component: () => import('@/pages/space/MySpacePage.vue'),
                meta: {
                    title: '我的空间 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: 'create-space',
                name: 'CreateSpace',
                component: () => import('@/pages/space/CreateSpace.vue'),
                meta: {
                    title: '创建空间 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/favorites',
                name: 'FavoritePage',
                component: () => import('@/pages/other/FavoritePage.vue'),
                meta: {
                    title: '我的收藏 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/explore',
                name: 'ExplorePage',
                component: () => import('@/pages/explore/ExplorePage.vue'),
                meta: {
                    title: '探索发现 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/history',
                name: 'HistoryPage',
                component: () => import('@/pages/other/HistoryPage.vue'),
                meta: {
                    title: '浏览历史 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/create-picture',
                name: 'CreatePicture',
                component: () => import('@/pages/picture/CreatePicture.vue'),
                meta: {
                    title: '创建图片 - 智能云图库',
                    requiresAuth: true
                },
            },
            {
                path: '/create-batch-picture',
                name: 'BatchCreatePicture',
                component: () => import('@/pages/picture/BatchCreatePicture.vue'),
                meta: {
                    title: '批量创建图片 - 智能云图库',
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
            {
                path: '/edit-picture/:id',
                name: 'EditPicture',
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
                        component: () => import('@/pages/admin/content/DashboardPage.vue'),
                        meta: {
                            title: '管理仪表盘 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'users',
                        name: 'UsersManagement',
                        component: () => import('@/pages/admin/content/UsersManagement.vue'),
                        meta: {
                            title: '用户管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'images',
                        name: 'PictureManagement',
                        component: () => import('@/pages/admin/content/PictureManagement.vue'),
                        meta: {
                            title: '图片管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'spaces',
                        name: 'SpaceManagement',
                        component: () => import('@/pages/admin/content/SpaceManagement.vue'),
                        meta: {
                            title: '空间管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'categories',
                        name: 'CategoryManagement',
                        component: () => import('@/pages/admin/content/CategoryManagement.vue'),
                        meta: {
                            title: '分类管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'tags',
                        name: 'TagsManagement',
                        component: () => import('@/pages/admin/content/TagsManagement.vue'),
                        meta: {
                            title: '标签管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'comments',
                        name: 'CommentsManagement',
                        component: () => import('@/pages/admin/content/CommentsManagement.vue'),
                        meta: {
                            title: '评论管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'storage',
                        name: 'StorageManagement',
                        component: () => import('@/pages/admin/storage/StorageManagement.vue'),
                        meta: {
                            title: '存储管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'login_log',
                        name: 'LoginLogManagement',
                        component: () => import('@/pages/admin/log/LoginLogManagement.vue'),
                        meta: {
                            title: '登录日志管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: 'operation_log',
                        name: 'OperationLogManagement',
                        component: () => import('@/pages/admin/log/OperationLogManagement.vue'),
                        meta: {
                            title: '操作日志管理 - 智能云图库',
                            requiresAuth: true,
                            requiresAdmin: true
                        },
                    },
                    {
                        path: '/profile',
                        name: 'UserProfile',
                        component: () => import('@/pages/user/UserProfile.vue'),
                        meta: {
                            title: '个人资料 - 智能云图库',
                            requiresAuth: true
                        },
                    }
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