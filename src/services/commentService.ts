// src/services/commentService.ts
import {
    addCommentUsingPost1,
    deleteCommentUsingDelete1,
    addCommentReplyUsingPost1,
    updateCommentStatusUsingPost1, getContentCommentsTreeUsingGet
} from "@/api/pinglunxiangguanjiekou";
import { message } from "ant-design-vue";

/**
 * 递归对评论树中的子评论进行时间排序
 * @param comments 评论数组
 * @returns 排序后的评论数组
 */
const sortCommentChildren = (comments: any[]): any[] => {
    if (!comments || !comments.length) return [];

    // 对当前层级的评论进行处理
    const sortedComments = comments.map(comment => {
        // 如果有子评论，递归处理
        if (comment.children && comment.children.length > 0) {
            // 先处理更深层级的子评论
            comment.children = sortCommentChildren(comment.children);

            // 再对当前评论的直接子评论进行排序（最新的在前面）
            comment.children.sort((a: any, b: any) =>
                new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            );
        }
        return comment;
    });

    return sortedComments;
};

/**
 * 评论服务类 - 封装评论相关API操作
 */
export const commentService = {

    /**
     * 添加评论
     * @param data 评论数据
     */
    async addComment(data: API.CommentAddRequest) {
        try {
            // 后端需要的格式: { content: "评论内容", contentType: "picture", contentId: 123 }
            const response = await addCommentUsingPost1(data);

            // 后端返回格式: { code: 200, data: 评论ID, message: "success" }
            if (response?.data?.code === 200) {
                return {
                    success: true,
                    commentId: response.data.data
                };
            } else {
                message.error(response?.data?.message || "评论发布失败");
                return { success: false, commentId: null };
            }
        } catch (error) {
            console.error("添加评论失败:", error);
            message.error("评论发布失败，请稍后重试");
            return { success: false, commentId: null };
        }
    },

    /**
     * 添加评论回复
     * @param data 回复数据
     */
    async addCommentReply(data: API.CommentReplyAddRequest) {
        try {
            // 转换为后端API所需要的格式
            // 后端需要的格式: { content: "回复内容", parentId: 123, replyUserId: 456 }
            const apiData = {
                content: data.content,
                parentId: data.parentId,      // 父评论/回复ID
                replyUserId: data.replyUserId // 被回复用户ID
            };

            const response = await addCommentReplyUsingPost1(apiData);

            // 后端返回格式: { code: 200, data: 回复ID, message: "success" }
            if (response?.data?.code === 200) {
                return {
                    success: true,
                    replyId: response.data.data
                };
            } else {
                message.error(response?.data?.message || "回复发布失败");
                return { success: false, replyId: null };
            }
        } catch (error) {
            console.error("添加回复失败:", error);
            message.error("回复发布失败，请稍后重试");
            return { success: false, replyId: null };
        }
    },

    /**
     * 删除评论
     * @param commentId 评论ID
     */
    async deleteComment(commentId: string | number) {
        try {
            const response = await deleteCommentUsingDelete1({
                commentId
            });

            // 后端返回格式: { code: 200, data: true, message: "success" }
            if (response?.data?.code === 200) {
                message.success("评论已删除");
                return { success: true };
            } else {
                message.error(response?.data?.message || "删除评论失败");
                return { success: false };
            }
        } catch (error) {
            console.error("删除评论失败:", error);
            message.error("删除评论失败，请稍后重试");
            return { success: false };
        }
    },

    /**
     * 更新评论状态（点赞/取消点赞）
     * @param commentId 评论ID
     * @param status 状态 (1-点赞 0-取消点赞)
     */
    async updateCommentStatus(commentId: string | number, status: number) {
        try {
            const response = await updateCommentStatusUsingPost1({
                commentId,
                status
            });

            // 后端返回格式: { code: 200, data: true, message: "success" }
            if (response?.data?.code === 200) {
                return { success: true };
            } else {
                message.error(response?.data?.message || "操作失败");
                return { success: false };
            }
        } catch (error) {
            console.error("更新评论状态失败:", error);
            message.error("操作失败，请稍后重试");
            return { success: false };
        }
    },

    /**
     * 获取内容评论树结构（包含所有评论及回复）
     * @param contentId 内容ID
     * @param contentType 内容类型，默认为"picture"
     */
    async getContentCommentsTree(contentId: string | number, contentType = "picture") {
        try {
            const response = await getContentCommentsTreeUsingGet({
                contentId,
                contentType
            });

            // 后端返回格式: { code: 200, data: [...评论树列表], message: "success" }
            if (response?.data?.code === 200) {
                // 在返回数据前，对子评论进行排序处理
                let commentList = response.data.data || [];
                commentList = sortCommentChildren(commentList);

                return {
                    list: commentList,
                    total: response.data.total || commentList.length || 0
                };
            }

            return { list: [], total: 0 };
        } catch (error) {
            console.error("获取评论树失败:", error);
            message.error("获取评论树失败，请稍后重试");
            return { list: [], total: 0 };
        }
    }
};