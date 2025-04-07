import axios from 'axios'
import { message } from "ant-design-vue";

// 创建axios实例
const myAxios = axios.create({
    baseURL: '',  // 可以设置为您的API基础URL
    timeout: 60000,
    withCredentials: true,
})

// 请求拦截器
myAxios.interceptors.request.use(
    function (config) {
        // 从localStorage获取token信息
        let tokenName = 'Authorization'; // 默认tokenName
        let token = '';

        // 尝试从localStorage获取用户信息
        const userInfo = localStorage.getItem('cloudgallery_user');
        if (userInfo) {
            try {
                const userObj = JSON.parse(userInfo);
                // 确认有无嵌套结构
                const userData = userObj.userInfo ? userObj.userInfo : userObj;

                if (userData.tokenName) {
                    tokenName = userData.tokenName;
                }
                // 注意这里使用token属性，不是tokenValue
                if (userData.token) {
                    token = userData.token;
                }
            } catch (e) {
                console.error('Failed to parse user info', e);
            }
        }

        // 添加token到请求头
        if (token) {
            config.headers[tokenName] = token;
            console.log(`Adding token to request: ${tokenName}=${token.substring(0, 10)}...`);
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
)

// 响应拦截器
myAxios.interceptors.response.use(
    function (response) {
        // 这里直接返回response，让API调用函数处理具体的data部分
        return response;
    },
    function (error) {
        // 处理请求错误
        if (error.response) {
            const { status, data } = error.response;

            // 根据状态码处理错误
            switch (status) {
                case 401:
                    message.error('未授权，请重新登录');
                    // 触发登录模态框
                    window.dispatchEvent(new Event('openLoginModal'));
                    break;
                case 403:
                    message.error('您没有权限访问该资源');
                    break;
                case 404:
                    message.error('请求的资源不存在');
                    break;
                case 500:
                    message.error('服务器内部错误');
                    break;
                default:
                    // 使用后端返回的错误消息
                    if (data && data.message) {
                        message.error(data.message);
                    } else {
                        message.error(`请求失败(${status})`);
                    }
            }
        } else if (error.request) {
            // 请求已发送但没有收到响应
            message.error('网络连接错误，请检查您的网络');
        } else {
            // 请求设置有问题
            message.error('请求配置错误');
        }

        return Promise.reject(error);
    },
)

export default myAxios;