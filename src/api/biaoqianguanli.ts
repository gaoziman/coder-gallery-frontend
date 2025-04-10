// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 批量删除标签 DELETE /api/admin/tag/batch/delete */
export async function batchDeleteTagsUsingDelete(
  body: API.TagBatchDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/tag/batch/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量更新标签状态 PUT /api/admin/tag/batch/status */
export async function batchUpdateTagStatusUsingPut(
  body: API.TagBatchTagStatusUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/tag/batch/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建标签 POST /api/admin/tag/create */
export async function createTagUsingPost(
  body: API.TagCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/admin/tag/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除标签 DELETE /api/admin/tag/delete */
export async function deleteTagUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteTagUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/tag/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取标签详情 GET /api/admin/tag/get */
export async function getTagByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultTagVO_>("/api/admin/tag/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取标签列表 GET /api/admin/tag/list/page */
export async function listTagByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listTagByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultTagVO_>("/api/admin/tag/list/page", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取标签关联的内容 GET /api/admin/tag/related/items */
export async function getTagRelatedItemsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagRelatedItemsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultTagRelatedItemVO_>(
    "/api/admin/tag/related/items",
    {
      method: "GET",
      params: {
        // pageNum has a default value: 1
        pageNum: "1",
        // pageSize has a default value: 10
        pageSize: "10",
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 获取标签统计信息 GET /api/admin/tag/statistics */
export async function getTagStatisticsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultTagStatisticsVO_>("/api/admin/tag/statistics", {
    method: "GET",
    ...(options || {}),
  });
}

/** 更新标签状态 PUT /api/admin/tag/status */
export async function updateTagStatusUsingPut(
  body: API.TagStatusUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/tag/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新标签 PUT /api/admin/tag/update */
export async function updateTagUsingPut(
  body: API.TagUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/tag/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取标签使用趋势数据 GET /api/admin/tag/usage/trend */
export async function getTagUsageTrendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagUsageTrendUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListTagUsageTrendVO_>("/api/admin/tag/usage/trend", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
