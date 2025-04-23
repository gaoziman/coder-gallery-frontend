import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 定义排序类型
export type SortType = 'latest' | 'popular' | 'mostViewed' | 'mostLiked' | 'mostBookmarked';

export const useFilterStore = defineStore('filter', () => {
    // 筛选状态
    const searchText = ref<string>('');
    const selectedCategory = ref<string | number>('all');
    const selectedTags = ref<Array<string | number>>([]);
    const sortOption = ref<SortType>('latest');

    // 用于跟踪筛选器状态来源 - URL 或本地存储
    const isFromUrl = ref(false);
    const isInitialized = ref(false);  // 新增：用于防止重复初始化

    // 判断是否有活跃筛选条件
    const hasActiveFilters = computed(() => {
        return selectedCategory.value !== 'all' ||
            selectedTags.value.length > 0 ||
            sortOption.value !== 'latest' ||
            searchText.value.trim() !== '';
    });

    // 重置所有筛选条件
    function resetAllFilters() {
        searchText.value = '';
        selectedCategory.value = 'all';
        selectedTags.value = [];
        sortOption.value = 'latest';
    }

    // 从URL参数加载筛选条件
    function loadFromUrlParams(params: URLSearchParams): boolean {
        let hasFilters = false;

        if (params.has('keyword')) {
            searchText.value = params.get('keyword') || '';
            hasFilters = true;
        }

        if (params.has('category')) {
            selectedCategory.value = params.get('category') || 'all';
            hasFilters = true;
        }

        if (params.has('tags')) {
            const tagParam = params.get('tags');
            if (tagParam) {
                try {
                    selectedTags.value = JSON.parse(decodeURIComponent(tagParam));
                    hasFilters = true;
                } catch (e) {
                    console.error('Failed to parse tags from URL', e);
                }
            }
        }

        if (params.has('sortBy')) {
            const sort = params.get('sortBy');
            if (sort && ['latest', 'popular', 'mostViewed', 'mostLiked', 'mostBookmarked'].includes(sort)) {
                sortOption.value = sort as SortType;
                hasFilters = true;
            }
        }

        isFromUrl.value = hasFilters;
        isInitialized.value = true;  // 标记初始化已完成
        return hasFilters;
    }

    // 更新URL参数
    function updateUrlParams() {
        const url = new URL(window.location.href);

        // 清除现有的筛选参数
        ['keyword', 'category', 'tags', 'sortBy'].forEach(param => {
            url.searchParams.delete(param);
        });

        // 添加当前的筛选条件
        if (searchText.value) {
            url.searchParams.set('keyword', searchText.value);
        }

        if (selectedCategory.value !== 'all') {
            url.searchParams.set('category', String(selectedCategory.value));
        }

        if (selectedTags.value.length > 0) {
            url.searchParams.set('tags', encodeURIComponent(JSON.stringify(selectedTags.value)));
        }

        if (sortOption.value !== 'latest') {
            url.searchParams.set('sortBy', sortOption.value);
        }

        // 更新浏览器历史记录，不刷新页面
        window.history.replaceState({}, '', url.toString());
    }

    // 获取筛选参数对象
    function getFilterParams() {
        const params = {};

        if (searchText.value.trim()) {
            params.keyword = searchText.value.trim();
        }

        if (selectedCategory.value !== 'all') {
            params.categoryId = selectedCategory.value;
        }

        if (selectedTags.value.length > 0) {
            params.tagIds = selectedTags.value;
        }

        params.sortBy = sortOption.value;

        return params;
    }

    return {
        searchText,
        selectedCategory,
        selectedTags,
        sortOption,
        isFromUrl,
        isInitialized,
        hasActiveFilters,
        resetAllFilters,
        loadFromUrlParams,
        updateUrlParams,
        getFilterParams
    };
}, {
    persist: {
        key: 'cloudgallery_filters',
        storage: localStorage
    }
});