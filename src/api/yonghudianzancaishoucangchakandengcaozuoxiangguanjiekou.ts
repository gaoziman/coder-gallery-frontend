// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 添加用户点赞/收藏（点赞、收藏等） POST /api/reaction/add */
export async function addReactionUsingPost(
  body: API.UserReactionRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取目标的点赞/收藏计数 GET /api/reaction/count */
export async function getReactionCountsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getReactionCountsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultUserReactionCountVO_>("/api/reaction/count", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 批量获取多个目标的点赞/收藏计数 POST /api/reaction/count/batch */
export async function batchGetReactionCountsUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.batchGetReactionCountsUsingPOSTParams,
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.ResultMapLongUserReactionCountVO_>(
    "/api/reaction/count/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        ...params,
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 快捷接口：收藏图片 GET /api/reaction/favorite */
export async function favoritePictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.favoritePictureUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/favorite", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取热门图片列表 GET /api/reaction/hot/pictures */
export async function getHotPicturesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHotPicturesUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListPictureVO_>("/api/reaction/hot/pictures", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 快捷接口：点赞图片 GET /api/reaction/like */
export async function likePictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likePictureUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/like", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 取消用户点赞/收藏 POST /api/reaction/remove */
export async function removeReactionUsingPost(
  body: API.UserReactionRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询用户对目标的点赞/收藏状态 GET /api/reaction/status */
export async function getReactionStatusUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getReactionStatusUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultUserReactionStatusVO_>("/api/reaction/status", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 批量查询用户对多个目标的点赞/收藏状态 POST /api/reaction/status/batch */
export async function batchGetReactionStatusUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.batchGetReactionStatusUsingPOSTParams,
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.ResultMapLongUserReactionStatusVO_>(
    "/api/reaction/status/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        ...params,
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 快捷接口：取消收藏图片 GET /api/reaction/unfavorite */
export async function unfavoritePictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unfavoritePictureUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/unfavorite", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 快捷接口：取消点赞图片 GET /api/reaction/unlike */
export async function unlikePictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unlikePictureUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/reaction/unlike", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取用户的互动统计 GET /api/reaction/user/stats */
export async function getUserInteractionStatsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultMapStringLong_>("/api/reaction/user/stats", {
    method: "GET",
    ...(options || {}),
  });
}
