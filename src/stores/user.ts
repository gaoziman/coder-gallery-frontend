import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface UserInfo {
    id: string;
    username: string;
    avatar: string;
    role: string;
    isAdmin: boolean;
    token?: string;
    // 根据需要添加其他用户信息
}

export const useUserStore = defineStore('user', () => {
    // 用户信息状态
    const userInfo = ref<UserInfo | null>(null);

    // 新增：登录模态框状态
    const showLoginModal = ref(false);

    // 新增：重定向路径
    const redirectPath = ref('');

    // 从 localStorage 初始化
    const init = () => {
        const storedUser = localStorage.getItem('cloudgallery_user');
        if (storedUser) {
            try {
                userInfo.value = JSON.parse(storedUser);
            } catch (e) {
                console.error('Failed to parse user info from localStorage', e);
                localStorage.removeItem('cloudgallery_user');
            }
        }
    };

    // 初始化调用
    init();

    // 计算属性：是否已登录
    const isLoggedIn = computed(() => !!userInfo.value);

    const isAdmin = computed(() => userInfo.value?.role === 'admin');

    // 登录操作
    function login(user: UserInfo) {
        userInfo.value = user;
        // 持久化存储
        localStorage.setItem('cloudgallery_user', JSON.stringify(user));

        // 登录成功后检查是否需要重定向
        if (redirectPath.value) {
            // 使用延时确保状态更新后再跳转
            setTimeout(() => {
                window.location.href = redirectPath.value;
                redirectPath.value = '';
            }, 300);
        }
    }

    // 退出登录
    function logout() {
        userInfo.value = null;
        localStorage.removeItem('cloudgallery_user');
    }

    // 更新用户信息
    function updateUserInfo(newInfo: Partial<UserInfo>) {
        if (userInfo.value) {
            userInfo.value = {...userInfo.value, ...newInfo};
            // 更新本地存储
            localStorage.setItem('cloudgallery_user', JSON.stringify(userInfo.value));
        }
    }

    // 新增：打开登录模态框
    function openLoginModal() {
        showLoginModal.value = true;
    }

    // 新增：关闭登录模态框
    function closeLoginModal() {
        showLoginModal.value = false;
    }

    // 新增：设置重定向路径
    function setRedirectPath(path: string) {
        redirectPath.value = path;
    }

    return {
        userInfo,
        isLoggedIn,
        isAdmin,
        login,
        logout,
        updateUserInfo,
        // 新增返回的属性和方法
        showLoginModal,
        redirectPath,
        openLoginModal,
        closeLoginModal,
        setRedirectPath
    };
}, {
    // 启用持久化支持
    persist: {
        key: 'cloudgallery_user',
        storage: window.localStorage,
    }
});