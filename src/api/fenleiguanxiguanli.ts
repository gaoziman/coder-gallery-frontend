// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 批量创建分类关系 POST /api/category_relation/batch/create */
export async function batchCreateCategoryRelationsUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.batchCreateCategoryRelationsUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/category_relation/batch/create", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询分类下有多少内容 GET /api/category_relation/count */
export async function countContentsByCategoryUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.countContentsByCategoryUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultInt_>("/api/category_relation/count", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建分类关系 POST /api/category_relation/create */
export async function createCategoryRelationUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createCategoryRelationUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/category_relation/create", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除分类关系 DELETE /api/category_relation/delete */
export async function deleteCategoryRelationUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCategoryRelationUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/category_relation/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除指定内容的所有分类关系 DELETE /api/category_relation/delete/by-content */
export async function deleteAllRelationsByContentUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAllRelationsByContentUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>(
    "/api/category_relation/delete/by-content",
    {
      method: "DELETE",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 获取内容关联的分类ID列表 GET /api/category_relation/get-category-ids */
export async function getCategoryIdsByContentUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryIdsByContentUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultListLong_>(
    "/api/category_relation/get-category-ids",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 更新内容的分类关系 PUT /api/category_relation/update */
export async function updateContentCategoriesUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateContentCategoriesUsingPUTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/category_relation/update", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
