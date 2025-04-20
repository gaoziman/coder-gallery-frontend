// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 添加评论 POST /api/comment/add */
export async function addCommentUsingPost1(
  body: API.CommentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/comment/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除评论 DELETE /api/comment/delete */
export async function deleteCommentUsingDelete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCommentUsingDELETE1Params,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/comment/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加评论回复 POST /api/comment/reply */
export async function addCommentReplyUsingPost1(
  body: API.CommentReplyAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/comment/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新评论状态 POST /api/comment/status */
export async function updateCommentStatusUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateCommentStatusUsingPOST1Params,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/comment/status", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取内容评论树 GET /api/comment/tree */
export async function getContentCommentsTreeUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getContentCommentsTreeUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListCommentVO_>("/api/comment/tree", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
