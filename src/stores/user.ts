import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {message} from 'ant-design-vue';
import {getCurrentUserUsingGet, userLogoutUsingPost} from "@/api/dengluguanli";

export interface UserInfo {
    id: string;
    account: string;
    username: string;
    avatar: string;
    role: 'admin' | 'user' | 'superAdmin';
    status: 'active' | 'inactive' | 'banned';
    phone?: string;
    userProfile?: string;
    email?: string;
    lastLoginTime?: string;
    lastLoginIp?: string;
    registerTime?: string;
    createTime?: string;
    updateTime?: string;
    isDeleted?: boolean;
    token?: string; // 存储tokenValue
    tokenName?: string; // 存储tokenName
    tokenTimeout?: number; // 存储tokenTimeout
}

export const useUserStore = defineStore('user', () => {
    // 用户信息状态 - 单层ref
    const userInfo = ref<UserInfo | null>(null);
    const showLoginModal = ref(false);
    const redirectPath = ref('');

    // 从 localStorage 初始化 - 添加修复嵌套的逻辑
    const init = () => {
        const storedUser = localStorage.getItem('cloudgallery_user');
        if (storedUser) {
            try {
                const parsedData = JSON.parse(storedUser);

                // 修复嵌套结构 - 检查是否有嵌套的userInfo
                if (parsedData.userInfo && typeof parsedData.userInfo === 'object') {
                    // 如果发现嵌套的userInfo，解套一层
                    userInfo.value = parsedData.userInfo;
                } else {
                    // 正常赋值
                    userInfo.value = parsedData;
                }

                // 验证token是否有效
                validateToken();
            } catch (e) {
                console.error('Failed to parse user info from localStorage', e);
                localStorage.removeItem('cloudgallery_user');
            }
        }
    };

    // 验证token并获取最新用户信息
    const validateToken = async () => {
        if (!userInfo.value?.token) return;

        try {
            const response = await getCurrentUserUsingGet();
            const result = response.data;

            if (result.code === 200 && result.data) {
                // 确保使用简单对象更新用户信息，避免嵌套
                updateUserInfo({
                    id: result.data.id?.toString() || userInfo.value.id,
                    account: result.data.account || userInfo.value.account,
                    username: result.data.username || result.data.account || userInfo.value.username,
                    userProfile: result.data.userProfile || userInfo.value.userProfile,
                    avatar: result.data.avatar || userInfo.value.avatar,
                    role: result.data.role as 'admin' | 'user' | 'superAdmin' || userInfo.value.role,
                    status: 'active',
                    lastLoginTime: result.data.lastLoginTime,
                    lastLoginIp: result.data.lastLoginIp,
                    token: result.data.tokenValue || userInfo.value.token,
                    tokenName: result.data.tokenName || userInfo.value.tokenName,
                    tokenTimeout: result.data.tokenTimeout || userInfo.value.tokenTimeout
                });
            } else if (result.code === 40100) {
                logout();
            }
        } catch (error) {
            console.error('Error validating token:', error);
        }
    };

    // 初始化调用
    init();

    // 计算属性
    const isLoggedIn = computed(() => !!userInfo.value?.token);
    const isAdmin = computed(() => userInfo.value?.role === 'admin' || userInfo.value?.role === 'superAdmin');
    const isSuperAdmin = computed(() => userInfo.value?.role === 'superAdmin');

    // 登录操作 - 使用简单对象，避免嵌套
    function login(user: UserInfo) {
        userInfo.value = {
            id: user.id,
            account: user.account,
            username: user.username,
            userProfile: user.username,
            avatar: user.username,
            role: user.role,
            status: user.status,
            lastLoginTime: user.lastLoginTime,
            lastLoginIp: user.lastLoginIp,
            token: user.token,
            tokenName: user.tokenName,
            tokenTimeout: user.tokenTimeout,
        };

        // // 直接赋值，不要创建新的包装
        // userInfo.value = {...user};

        // 存储到localStorage，确保扁平化结构
        localStorage.setItem('cloudgallery_user', JSON.stringify(userInfo.value));

        if (user.token && user.tokenName) {
            localStorage.setItem(user.tokenName, user.token);
        }

        if (redirectPath.value) {
            setTimeout(() => {
                window.location.href = redirectPath.value;
                redirectPath.value = '';
            }, 300);
        }
    }

    // 退出登录
    function logout() {
        // 先清除本地状态，确保UI立即响应
        if (userInfo.value?.tokenName) {
            localStorage.removeItem(userInfo.value.tokenName);
        }
        userInfo.value = null;
        localStorage.removeItem('cloudgallery_user');

        // 清除sessionStorage中可能存在的数据
        sessionStorage.removeItem('cloudgallery_user');

        // 触发自定义事件通知组件更新
        window.dispatchEvent(new CustomEvent('user-info-updated'));

        // 延迟调用后端API，确保UI已更新
        setTimeout(() => {
            // 调用后端注销API
            userLogoutUsingPost()
                .then(response => {
                    const result = response.data;
                    if (result.code === 200) {
                        // 提示用户
                        message.success('已成功退出登录');

                        // 重定向到首页，使用硬重定向确保页面完全刷新
                        window.location.href = '/';
                    }
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    // 即使API调用失败，也已经清除了本地状态
                    // 仍然重定向到首页
                    window.location.href = '/';
                });
        }, 100);
    }

    // 确保 updateUserInfo 函数触发视图更新
    function updateUserInfo(newInfo: Partial<UserInfo>) {
        if (userInfo.value) {
            // 使用新对象替换现有对象，以确保触发响应式更新
            userInfo.value = {...userInfo.value, ...newInfo};

            // 保存到本地存储
            localStorage.setItem('cloudgallery_user', JSON.stringify(userInfo.value));

            // 如果包含token信息也更新
            if (newInfo.token && newInfo.tokenName) {
                localStorage.setItem(newInfo.tokenName, newInfo.token);
            }

            // 可以添加一个事件触发，通知系统用户信息已更新
            window.dispatchEvent(new CustomEvent('user-info-updated'));
        }
    }

    // 其他方法
    function getToken() {
        return userInfo.value?.token || '';
    }

    function getTokenName() {
        return userInfo.value?.tokenName || 'Authorization';
    }

    function openLoginModal() {
        showLoginModal.value = true;
    }

    function closeLoginModal() {
        showLoginModal.value = false;
    }

    function setRedirectPath(path: string) {
        redirectPath.value = path;
    }

    return {
        userInfo,
        isLoggedIn,
        isAdmin,
        isSuperAdmin,
        login,
        logout,
        updateUserInfo,
        getToken,
        getTokenName,
        validateToken,
        showLoginModal,
        redirectPath,
        openLoginModal,
        closeLoginModal,
        setRedirectPath
    };
}, {
    // 修改持久化配置，确保正确序列化
    persist: {
        key: 'cloudgallery_user',
        storage: window.localStorage,
        // 添加序列化选项，确保只序列化值而不是整个响应式对象
        serializer: {
            deserialize: JSON.parse,
            serialize: (state) => {
                // 确保只序列化userInfo的值，不包含响应式包装
                const cleanState = {...state};
                if (cleanState.userInfo && cleanState.userInfo.value) {
                    // 如果还有嵌套，解套一层
                    cleanState.userInfo = cleanState.userInfo.value;
                }
                return JSON.stringify(cleanState);
            }
        }
    }
});