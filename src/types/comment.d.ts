// src/types/comment.d.ts

declare namespace API {
    // 评论添加请求
    interface CommentAddRequest {
        // 内容ID
        contentId: string | number;
        // 内容类型
        contentType: string;
        // 评论内容
        content: string;
    }

    // 评论回复添加请求
    interface CommentReplyAddRequest {
        // 父评论ID
        parentId: string | number;
        // 内容ID
        contentId: string | number;
        // 内容类型
        contentType: string;
        // 回复内容
        content: string;
        // 被回复用户ID（可选）
        replyUserId?: string | number;
    }

    // 删除评论参数
    interface deleteCommentUsingDELETE1Params {
        // 评论ID
        commentId: string | number;
    }

    // 获取内容评论列表参数
    interface getContentCommentsUsingGETParams {
        // 内容ID
        contentId: string | number;
        // 内容类型
        contentType: string;
        // 页码，默认为1
        page?: string | number;
        // 每页大小，默认为10
        size?: string | number;
        // 排序方式，可选 'time' 或 'hot'
        sort?: string;
    }

    // 获取评论回复列表参数
    interface getCommentRepliesUsingGETParams {
        // 评论ID
        commentId: string | number;
        // 页码，默认为1
        page?: string | number;
        // 每页大小，默认为10
        size?: string | number;
    }

    // 更新评论状态参数
    interface updateCommentStatusUsingPOST1Params {
        // 评论ID
        commentId: string | number;
        // 状态（1-点赞，0-取消点赞）
        status: number;
    }

    // 用户信息
    interface UserInfo {
        id: string | number;
        account: string;
        username: string;
        phone?: string;
        avatar: string;
        userProfile?: string;
        role: string;
        status: string;
        lastLoginIp?: string;
        lastLoginTime?: string;
        registerTime?: string;
        createTime?: string;
        updateTime?: string;
        remark?: string;
    }

    // 评论VO对象
    interface CommentVO {
        // 评论ID
        id: string | number;
        // 内容ID
        contentId: string | number;
        // 内容类型
        contentType: string;
        // 父评论ID
        parentId?: string | number;
        // 根评论ID
        rootId?: string | number;
        // 评论内容
        content: string;
        // 点赞数
        likeCount: number;
        // 回复数
        replyCount: number;
        // 评论状态
        status?: string;
        // 是否置顶
        isTop?: boolean;
        // 是否热门
        isHot?: boolean;
        // 创建时间
        createTime: string;
        // 用户信息
        user: UserInfo;
        // 被回复用户信息（可能为null）
        replyUser?: UserInfo;
        // 回复列表
        replies?: CommentVO[];
        // 当前用户是否已点赞
        hasLiked?: boolean;
    }

    // API响应结果
    interface APIResponse<T> {
        // 状态码
        code: number;
        // 数据
        data: T;
        // 消息
        message: string;
        // 其他可能的属性
        [key: string]: any;
    }

    // Result<List<CommentVO>>
    interface ResultListCommentVO_ extends APIResponse<CommentVO[]> {}

    // Result<Long>
    interface ResultLong_ extends APIResponse<number> {}

    // Result<Boolean>
    interface ResultBoolean_ extends APIResponse<boolean> {}
}