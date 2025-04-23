// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 管理员添加评论 POST /api/admin/comments/add */
export async function addCommentUsingPost(
  body: API.CommentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/admin/comments/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员批量删除评论 DELETE /api/admin/comments/batch/delete */
export async function batchDeleteCommentsUsingDelete(
  body: API.BatchDeleteCommentRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/comments/batch/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员删除评论 DELETE /api/admin/comments/delete */
export async function deleteCommentUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCommentUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/comments/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 设置评论热门状态 POST /api/admin/comments/hot */
export async function setCommentHotStatusUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setCommentHotStatusUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/comments/hot", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 管理员分页查询评论列表 GET /api/admin/comments/list/page */
export async function listCommentByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listCommentByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultCommentVO_>(
    "/api/admin/comments/list/page",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 管理员添加评论回复 POST /api/admin/comments/reply */
export async function addCommentReplyUsingPost(
  body: API.CommentReplyAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/admin/comments/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员更新评论状态 POST /api/admin/comments/status */
export async function updateCommentStatusUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateCommentStatusUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/comments/status", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 设置评论置顶状态 POST /api/admin/comments/top */
export async function setCommentTopStatusUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setCommentTopStatusUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/comments/top", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
