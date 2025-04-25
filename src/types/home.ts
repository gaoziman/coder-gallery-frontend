// 排序选项接口
export interface SortOption {
    [key: string]: string;
}

// 颜色映射接口
export interface ColorMap {
    [key: string]: string;
}

// 筛选参数接口
export interface FilterParams {
    keyword?: string;
    categoryId?: string | number;
    tagIds?: (string | number)[];
    sortBy?: string;
    [key: string]: any; // 允许动态添加其他属性
}

// 标签接口
export interface TagData {
    id: string | number;
    name?: string;
    color?: string;
    status?: string;
    count?: number;
    [key: string]: any;
}

// 分类接口
export interface CategoryData {
    id: string | number;
    name?: string;
    icon?: string;
    count?: number;
    status?: string;
    [key: string]: any;
}