import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
    addReactionUsingPost,
    getReactionStatusUsingGet,
    batchGetReactionStatusUsingPost,
    getReactionCountsUsingGet,
    batchGetReactionCountsUsingPost,
    likePictureUsingGet,
    unlikePictureUsingGet,
    favoritePictureUsingGet,
    unfavoritePictureUsingGet,
    getUserInteractionStatsUsingGet
} from '@/api/yonghudianzancaishoucangchakandengcaozuoxiangguanjiekou';

// 确保ID格式正确
const ensureIdFormat = (id: number | string): number => {
    if (typeof id === 'string') {
        const numId = parseInt(id, 10);
        return isNaN(numId) ? 0 : numId;
    }
    return (typeof id === 'number') ? id : 0;
};

// 生成反应状态存储的键
const getReactionKey = (targetType: string, targetId: number | string) => `${targetType}_${targetId}`;

export const useUserReactionStore = defineStore('userReaction', () => {
    // 存储用户对图片的反应状态 (是否已点赞、已收藏等)
    const reactionStatusMap = ref<Record<string, API.UserReactionStatusVO>>({});

    // 存储图片的反应计数 (点赞数、收藏数、浏览数)
    const reactionCountsMap = ref<Record<string, API.UserReactionCountVO>>({});

    // 用户交互统计数据 (用户点赞总数、收藏总数等)
    const userStats = ref<Record<string, number>>({});

    // 常用统计数据的计算属性
    const likeCount = computed(() => userStats.value?.likesGiven || 0);
    const favoriteCount = computed(() => userStats.value?.favoritesCreated || 0);
    const viewCount = computed(() => userStats.value?.viewCount || 0);

    // 获取用户交互统计 - 修复这个函数，确保它能正常工作
    const fetchUserStats = async () => {
        try {
            const response = await getUserInteractionStatsUsingGet();

            if (response?.data?.code === 200 && response.data.data) {
                userStats.value = response.data.data;
                return response.data.data;
            }
            return {};
        } catch (error) {
            console.error('获取用户统计失败:', error);
            return {};
        }
    };

    // 获取指定图片的反应状态 - 添加强制刷新选项
    const getStatus = async (targetId: number | string, targetType = 'picture', forceRefresh = false) => {
        const key = getReactionKey(targetType, targetId);

        // 如果已经有缓存的状态且不需要强制刷新，则直接返回
        if (!forceRefresh && reactionStatusMap.value[key]) {
            return reactionStatusMap.value[key];
        }

        try {
            const numericId = ensureIdFormat(targetId);
            const response = await getReactionStatusUsingGet({
                targetId: numericId,
                targetType
            });

            if (response?.data?.code === 200 && response.data.data) {
                // 更新状态映射
                reactionStatusMap.value[key] = {...response.data.data};
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`获取反应状态失败, ID: ${targetId}`, error);
            return null;
        }
    };

    // 批量获取多个图片的反应状态
    const batchGetStatus = async (targetIds: (number | string)[], targetType = 'picture') => {
        if (!targetIds.length) return {};

        try {
            const numericIds = targetIds.map(id => ensureIdFormat(id)).filter(id => id !== 0);

            const response = await batchGetReactionStatusUsingPost(
                { targetType },
                numericIds
            );

            if (response?.data?.code === 200 && response.data.data) {
                const result = response.data.data;
                // 更新本地缓存
                Object.entries(result).forEach(([id, status]) => {
                    const key = getReactionKey(targetType, id);
                    reactionStatusMap.value[key] = {...status};
                });
                return result;
            }
            return {};
        } catch (error) {
            console.error(`批量获取反应状态失败, IDs: ${targetIds.join(',')}`, error);
            return {};
        }
    };

    // 获取指定图片的反应计数
    const getCounts = async (targetId: number | string, targetType = 'picture', forceRefresh = false) => {
        const key = getReactionKey(targetType, targetId);

        // 如果已经有缓存且不需要强制刷新，则直接返回
        if (!forceRefresh && reactionCountsMap.value[key]) {
            return reactionCountsMap.value[key];
        }

        try {
            const numericId = ensureIdFormat(targetId);

            const response = await getReactionCountsUsingGet({
                targetId: numericId,
                targetType
            });

            if (response?.data?.code === 200 && response.data.data) {
                // 更新计数映射
                reactionCountsMap.value[key] = {...response.data.data};
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`获取反应计数失败, ID: ${targetId}`, error);
            return null;
        }
    };

    // 批量获取多个图片的反应计数
    const batchGetCounts = async (targetIds: (number | string)[], targetType = 'picture') => {
        if (!targetIds.length) return {};

        try {
            const numericIds = targetIds.map(id => ensureIdFormat(id)).filter(id => id !== 0);

            const response = await batchGetReactionCountsUsingPost(
                { targetType },
                numericIds
            );

            if (response?.data?.code === 200 && response.data.data) {
                const result = response.data.data;
                Object.entries(result).forEach(([id, counts]) => {
                    const key = getReactionKey(targetType, id);
                    reactionCountsMap.value[key] = {...counts};
                });
                return result;
            }
            return {};
        } catch (error) {
            console.error(`批量获取反应计数失败, IDs: ${targetIds.join(',')}`, error);
            return {};
        }
    };

    // 点赞图片
    const likePicture = async (pictureId: number | string) => {
        try {
            const numericId = ensureIdFormat(pictureId);

            // 调用API - 确保参数是数字类型
            const response = await likePictureUsingGet({ pictureId: numericId });

            if (response?.data?.code === 200 && response.data.data === true) {
                // 强制刷新状态和计数
                const key = getReactionKey('picture', pictureId);

                // 立即更新本地状态，不等待API调用
                if (reactionStatusMap.value[key]) {
                    reactionStatusMap.value[key] = {
                        ...reactionStatusMap.value[key],
                        hasLiked: true
                    };
                }

                // 异步刷新状态和计数
                getStatus(pictureId, 'picture', true).catch(console.error);
                getCounts(pictureId, 'picture', true).catch(console.error);

                return true;
            } else {
                message.error(response?.data?.message || '点赞失败，请稍后重试');
                return false;
            }
        } catch (error) {
            console.error(`点赞失败, ID: ${pictureId}`, error);
            message.error('点赞失败，请稍后重试');
            return false;
        }
    };

    // 取消点赞图片
    const unlikePicture = async (pictureId: number | string) => {
        try {
            const numericId = ensureIdFormat(pictureId);

            // 调用API - 确保参数是数字类型
            const response = await unlikePictureUsingGet({ pictureId: numericId });

            if (response?.data?.code === 200 && response.data.data === true) {
                // 更新本地状态
                const key = getReactionKey('picture', pictureId);

                // 立即更新本地状态，不等待API调用
                if (reactionStatusMap.value[key]) {
                    reactionStatusMap.value[key] = {
                        ...reactionStatusMap.value[key],
                        hasLiked: false
                    };
                }

                // 异步刷新状态和计数
                getStatus(pictureId, 'picture', true).catch(console.error);
                getCounts(pictureId, 'picture', true).catch(console.error);

                return true;
            } else {
                message.error(response?.data?.message || '操作失败，请稍后重试');
                return false;
            }
        } catch (error) {
            console.error(`取消点赞失败, ID: ${pictureId}`, error);
            message.error('操作失败，请稍后重试');
            return false;
        }
    };

    // 收藏图片
    const favoritePicture = async (pictureId: number | string) => {
        try {
            const numericId = ensureIdFormat(pictureId);

            // 调用API - 确保参数是数字类型
            const response = await favoritePictureUsingGet({ pictureId: numericId });

            if (response?.data?.code === 200 && response.data.data === true) {
                // 更新本地状态
                const key = getReactionKey('picture', pictureId);

                // 立即更新本地状态，不等待API调用
                if (reactionStatusMap.value[key]) {
                    reactionStatusMap.value[key] = {
                        ...reactionStatusMap.value[key],
                        hasFavorited: true
                    };
                }

                // 异步刷新状态和计数
                getStatus(pictureId, 'picture', true).catch(console.error);
                getCounts(pictureId, 'picture', true).catch(console.error);

                return true;
            } else {
                message.error(response?.data?.message || '收藏失败，请稍后重试');
                return false;
            }
        } catch (error) {
            console.error(`收藏失败, ID: ${pictureId}`, error);
            message.error('收藏失败，请稍后重试');
            return false;
        }
    };

    // 取消收藏图片
    const unfavoritePicture = async (pictureId: number | string) => {
        try {
            const numericId = ensureIdFormat(pictureId);

            // 调用API - 确保参数是数字类型
            const response = await unfavoritePictureUsingGet({ pictureId: numericId });

            if (response?.data?.code === 200 && response.data.data === true) {
                // 更新本地状态
                const key = getReactionKey('picture', pictureId);

                // 立即更新本地状态，不等待API调用
                if (reactionStatusMap.value[key]) {
                    reactionStatusMap.value[key] = {
                        ...reactionStatusMap.value[key],
                        hasFavorited: false
                    };
                }

                // 异步刷新状态和计数，添加日志帮助调试
                getStatus(pictureId, 'picture', true)
                    .then(() => console.log('状态刷新成功'))
                    .catch((err) => console.error('状态刷新失败', err));

                getCounts(pictureId, 'picture', true)
                    .then(() => console.log('计数刷新成功'))
                    .catch((err) => console.error('计数刷新失败', err));

                return true;
            } else {
                message.error(response?.data?.message || '操作失败，请稍后重试');
                return false;
            }
        } catch (error) {
            message.error('操作失败，请稍后重试');
            return false;
        }
    };

    // 切换图片点赞状态
    const toggleLike = async (pictureId: number | string) => {
        try {
            // 获取当前状态
            let status = reactionStatusMap.value[getReactionKey('picture', pictureId)];

            // 如果没有本地状态，则从服务器获取
            if (!status) {
                status = await getStatus(pictureId, 'picture', true);
            }

            // 根据当前状态执行操作
            const result = status?.hasLiked
                ? await unlikePicture(pictureId)
                : await likePicture(pictureId);

            return result;
        } catch (error) {
            console.error('点赞操作失败', error);
            message.error('操作失败，请稍后重试');
            throw error;
        }
    };

    // 切换图片收藏状态
    const toggleFavorite = async (pictureId: number | string) => {
        try {
            // 获取当前状态
            const key = getReactionKey('picture', pictureId);
            let status = reactionStatusMap.value[key];

            // 如果没有本地状态，则从服务器获取
            if (!status) {
                console.log('本地没有状态，正在从服务器获取');
                status = await getStatus(pictureId, 'picture', true);
                if (!status) {
                    console.error('无法获取收藏状态');
                    message.error('无法获取收藏状态，请稍后重试');
                    return false;
                }
            }

            console.log('当前收藏状态:', status.hasFavorited);

            // 根据当前状态执行操作
            const result = status.hasFavorited
                ? await unfavoritePicture(pictureId)
                : await favoritePicture(pictureId);

            // 强制刷新状态，确保UI更新
            if (result) {
                // 直接更新本地状态
                if (reactionStatusMap.value[key]) {
                    reactionStatusMap.value[key] = {
                        ...reactionStatusMap.value[key],
                        hasFavorited: !status.hasFavorited
                    };
                }
            }

            return result;
        } catch (error) {
            console.error('收藏操作失败', error);
            message.error('操作失败，请稍后重试');
            throw error;
        }
    };

    // 检查指定图片是否已点赞 - 直接使用本地状态
    const isLiked = (pictureId: number | string, targetType = 'picture') => {
        const key = getReactionKey(targetType, pictureId);
        return !!reactionStatusMap.value[key]?.hasLiked;
    };

    // 检查指定图片是否已收藏 - 直接使用本地状态
    const isFavorited = (pictureId: number | string, targetType = 'picture') => {
        const key = getReactionKey(targetType, pictureId);
        return !!reactionStatusMap.value[key]?.hasFavorited;
    };

    // 获取指定图片的点赞数
    const getPictureLikeCount = (pictureId: number | string, targetType = 'picture') => {
        const key = getReactionKey(targetType, pictureId);
        return reactionCountsMap.value[key]?.likeCount || 0;
    };

    // 获取指定图片的收藏数
    const getPictureFavoriteCount = (pictureId: number | string, targetType = 'picture') => {
        const key = getReactionKey(targetType, pictureId);
        return reactionCountsMap.value[key]?.favoriteCount || 0;
    };

    // 获取指定图片的浏览数
    const getPictureViewCount = (pictureId: number | string, targetType = 'picture') => {
        const key = getReactionKey(targetType, pictureId);
        return reactionCountsMap.value[key]?.viewCount || 0;
    };

    // 添加查看记录
    const addViewRecord = async (targetId: number | string, targetType = 'picture') => {
        try {
            const numericId = ensureIdFormat(targetId);

            const response = await addReactionUsingPost({
                targetId: numericId,
                targetType,
                reactionType: 'view'
            });

            if (response?.data?.code === 200 && response.data.data) {
                // 异步刷新计数，不阻塞流程
                getCounts(targetId, targetType, true).catch(console.error);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`添加浏览记录失败, ID: ${targetId}`, error);
            return false;
        }
    };

    // 初始化 - 加载用户统计数据
    const initialize = async () => {
        try {
            await fetchUserStats();
            return true;
        } catch (error) {
            console.error('初始化用户统计数据失败', error);
            return false;
        }
    };

    return {
        // 状态
        reactionStatusMap,
        reactionCountsMap,
        userStats,

        // 计算属性
        likeCount,
        favoriteCount,
        viewCount,

        // 方法
        getStatus,
        batchGetStatus,
        getCounts,
        batchGetCounts,
        likePicture,
        unlikePicture,
        favoritePicture,
        unfavoritePicture,
        toggleLike,
        toggleFavorite,
        isLiked,
        isFavorited,
        getPictureLikeCount,
        getPictureFavoriteCount,
        getPictureViewCount,
        addViewRecord,
        initialize,
        fetchUserStats  // 确保这个方法被导出
    };
});