// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 批量删除分类 DELETE /api/admin/category/batch/delete */
export async function batchDeleteCategoriesUsingDelete(
  body: API.BatchDeleteRequest1,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/category/batch/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量移动分类 POST /api/admin/category/batch/move */
export async function batchMoveCategoriesUsingPost(
  body: API.BatchCategoryMoveRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/category/batch/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建分类 POST /api/admin/category/create */
export async function createCategoryUsingPost(
  body: API.CategoryCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/admin/category/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除分类 DELETE /api/admin/category/delete */
export async function deleteCategoryUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCategoryUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/category/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 导出分类数据 POST /api/admin/category/export */
export async function exportCategoriesUsingPost(
  body: API.CategoryExportRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultString_>("/api/admin/category/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取分类详情 GET /api/admin/category/get */
export async function getCategoryByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultCategoryVO_>("/api/admin/category/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取分类列表 GET /api/admin/category/list/page */
export async function listCategoryByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listCategoryByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultCategoryVO_>(
    "/api/admin/category/list/page",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 移动分类 POST /api/admin/category/move */
export async function moveCategoryUsingPost(
  body: API.CategoryMoveRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/category/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取分类关联的内容列表 GET /api/admin/category/related/items */
export async function getCategoryRelatedItemsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryRelatedItemsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultRelatedItemVO_>(
    "/api/admin/category/related/items",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 获取分类统计信息 GET /api/admin/category/statistics */
export async function getCategoryStatisticsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultCategoryStatisticsVO_>(
    "/api/admin/category/statistics",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 获取分类树形结构 GET /api/admin/category/tree */
export async function getCategoryTreeUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryTreeUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListCategoryTreeVO_>("/api/admin/category/tree", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新分类 PUT /api/admin/category/update */
export async function updateCategoryUsingPut(
  body: API.CategoryUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/category/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取分类树形结构(前台) GET /api/category/frontend-tree */
export async function getCategoryTreeForFrontendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryTreeForFrontendUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListCategoryTreeVO_>("/api/category/frontend-tree", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取分类列表(不分页) GET /api/category/list */
export async function listCategoriesByTypeUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listCategoriesByTypeUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListCategoryVO_>("/api/category/list", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
