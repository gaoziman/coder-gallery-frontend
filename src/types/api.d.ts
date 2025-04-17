// 为API命名空间声明类型定义
declare namespace API {
    // 筛选参数接口
    interface FilterParams {
        keyword?: string;
        categoryId?: string | number;
        tagIds?: Array<string | number>;
        sortBy?: string;
    }

    interface ApiPictureRecord {
        id?: string | number;
        url?: string;
        name?: string;
        user?: {
            username?: string;
            avatar?: string;
        };
        category?: string;
        viewCount?: number;
        likeCount?: number;
        collectionCount?: number;
        picWidth?: number;
        picHeight?: number;
        picScale?: string;
        tags?: Array<string | { id: string | number; name: string }>;
        tagColors?: string[];
        createTime?: string;
        updateTime?: string;
        [key: string]: any; // 允许其他可能的属性
    }

    // 图库图片接口
    interface GalleryImage {
        id: string | number;
        src: string;
        url: string;
        title: string;
        author: {
            name: string;
            avatar: string;
        };
        category?: string;
        tags?: Array<{ name: string; color: string }>;
        liked?: boolean;
        bookmarked?: boolean;
        createTime?: string;
        updateTime?: string | undefined;
        viewCount?: number;
        likeCount?: number;
        collectionCount?: number;
        comments?: number;
        aspectRatio?: string;
        raw?: any;
    }

    // 标签接口
    interface Tag {
        id: string | number;
        name: string;
        color?: string;
        count?: number;
    }

    // 分类接口
    interface Category {
        id: string | number;
        name: string;
        icon?: string;
        count?: number;
    }

    // 瀑布流图片请求接口
    interface PictureWaterfallRequest {
        keyword?: string;
        categoryId?: number;
        tagIds?: number[];
        sortBy?: string;
    }

    // 加载更多瀑布流图片接口参数
    interface loadMoreWaterfallPicturesUsingPOSTParams {
        offset?: number;
        limit?: number;
        lastId?: string | number | null;
        lastValue?: any;
    }
}

// 声明模块，确保TypeScript能够识别
declare module '@/api/tupianxiangguanjiekou' {
    export function getWaterfallPicturesUsingPost(params: API.PictureWaterfallRequest): Promise<any>;
    export function loadMoreWaterfallPicturesUsingPost(
        params: API.loadMoreWaterfallPicturesUsingPOSTParams,
        requestBody: API.PictureWaterfallRequest
    ): Promise<any>;
}

declare module '@/api/fenleiguanli' {
    export function listCategoriesByTypeUsingGet(params: { type: string }): Promise<any>;
}

declare module '@/api/biaoqianguanli' {
    export function getTagListUsingGet(): Promise<any>;
}