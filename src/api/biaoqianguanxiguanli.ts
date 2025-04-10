// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 批量创建标签关系 POST /api/api/tag/relation/batch/create */
export async function batchCreateTagRelationsUsingPost(
  body: API.TagRelationBatchCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/batch/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 检查标签关系是否存在 GET /api/api/tag/relation/check */
export async function checkRelationExistsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkRelationExistsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/check", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除内容的所有标签关系 DELETE /api/api/tag/relation/content/delete */
export async function deleteAllRelationsByContentUsingDelete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAllRelationsByContentUsingDELETE1Params,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/content/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建标签关系 POST /api/api/tag/relation/create */
export async function createTagRelationUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createTagRelationUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/create", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除标签关系 DELETE /api/api/tag/relation/delete */
export async function deleteTagRelationUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteTagRelationUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取内容关联的标签ID列表 GET /api/api/tag/relation/list */
export async function getTagIdsByContentUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagIdsByContentUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListLong_>("/api/api/tag/relation/list", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新内容标签关系 PUT /api/api/tag/relation/update */
export async function updateContentTagsUsingPut(
  body: API.TagRelationUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/api/tag/relation/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
