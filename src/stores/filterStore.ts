import { defineStore } from 'pinia';

interface FilterTag {
    name: string;
    hot: boolean;
    count?: string;
}

interface FilterCategory {
    name: string;
    active: boolean;
}

interface CustomFilter {
    id: string;
    name: string;
    categories: string[];
    tags: string[];
    sortBy: string;
    createdAt: string;
}

export const useFilterStore = defineStore('filter', {
    state: () => ({
        savedFilters: [] as CustomFilter[],
        activeFilter: null as CustomFilter | null,
        currentSort: 'newest',
        categories: [] as FilterCategory[],
        tags: [] as FilterTag[],
    }),

    actions: {
        // 初始化数据
        initialize(categories: FilterCategory[], tags: FilterTag[]) {
            this.categories = categories;
            this.tags = tags;
            this.loadSavedFilters();
        },

        // 从本地存储加载筛选器
        loadSavedFilters() {
            const storedFilters = localStorage.getItem('userFilters');
            if (storedFilters) {
                try {
                    this.savedFilters = JSON.parse(storedFilters);
                } catch (e) {
                    console.error('解析保存的筛选器出错', e);
                }
            }
        },

        // 保存筛选器
        saveFilter(filter: CustomFilter) {
            // 检查是否已存在相同名称的筛选器
            const exists = this.savedFilters.some(f => f.name === filter.name);
            if (exists) {
                return { success: false, message: `已存在名为"${filter.name}"的筛选器` };
            }

            this.savedFilters.push(filter);
            this.persistFilters();

            return { success: true, message: `筛选器"${filter.name}"已创建` };
        },

        // 应用筛选器
        applyFilter(filter: CustomFilter) {
            this.activeFilter = filter;

            // 应用分类
            if (filter.categories && filter.categories.length > 0) {
                this.categories.forEach(cat => {
                    cat.active = filter.categories.includes(cat.name) || cat.name === '全部';
                });
            }

            // 应用标签
            if (filter.tags && filter.tags.length > 0) {
                this.tags.forEach(tag => {
                    tag.hot = filter.tags.includes(tag.name);
                });
            }

            // 应用排序
            if (filter.sortBy) {
                this.currentSort = filter.sortBy;
            }

            return { success: true, message: `已应用筛选器"${filter.name}"` };
        },

        // 删除筛选器
        deleteFilter(filterId: string) {
            const filterIndex = this.savedFilters.findIndex(f => f.id === filterId);
            if (filterIndex !== -1) {
                const filterName = this.savedFilters[filterIndex].name;
                this.savedFilters.splice(filterIndex, 1);

                // 如果删除的是当前激活的筛选器，则清除激活状态
                if (this.activeFilter && this.activeFilter.id === filterId) {
                    this.clearFilter();
                }

                this.persistFilters();
                return { success: true, message: `筛选器"${filterName}"已删除` };
            }

            return { success: false, message: '筛选器不存在' };
        },

        // 清除当前筛选器
        clearFilter() {
            this.activeFilter = null;

            // 重置分类（设置"全部"为激活）
            this.categories.forEach(category => {
                category.active = category.name === '全部';
            });

            // 重置标签（只保留"热门"为激活）
            this.tags.forEach(tag => {
                tag.hot = tag.name === '热门';
            });

            // 重置排序
            this.currentSort = 'newest';

            return { success: true, message: '已清除筛选条件' };
        },

        // 切换分类激活状态
        toggleCategoryActive(index: number) {
            this.categories.forEach((category, i) => {
                category.active = i === index;
            });

            // 清除当前激活的筛选器，因为手动修改了条件
            this.activeFilter = null;
        },

        // 切换标签激活状态
        toggleTagActive(index: number) {
            this.tags[index].hot = !this.tags[index].hot;

            // 清除当前激活的筛选器，因为手动修改了条件
            this.activeFilter = null;
        },

        // 设置排序方式
        setSort(sortKey: string) {
            this.currentSort = sortKey;

            // 如果有激活的筛选器，但手动更改了排序，则清除筛选器
            if (this.activeFilter) {
                this.activeFilter = null;
            }
        },

        // 将筛选器持久化到本地存储
        persistFilters() {
            localStorage.setItem('userFilters', JSON.stringify(this.savedFilters));
        },

        // 获取当前筛选条件
        getCurrentFilters() {
            return {
                categories: this.categories.filter(c => c.active).map(c => c.name),
                tags: this.tags.filter(t => t.hot).map(t => t.name),
                sort: this.currentSort
            };
        }
    }
});