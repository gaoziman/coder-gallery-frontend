// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 删除图片 DELETE /api/admin/picture/${param0} */
export async function deletePictureUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePictureUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultBoolean_>(`/api/admin/picture/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 批量删除图片 DELETE /api/admin/picture/batch */
export async function batchDeletePicturesUsingDelete(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/picture/batch", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员分页查询图片列表 GET /api/admin/picture/list/page */
export async function listPicturesByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listPicturesByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultPictureVO_>(
    "/api/admin/picture/list/page",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 审核图片 POST /api/admin/picture/review */
export async function reviewPictureUsingPost(
  body: API.PictureReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/picture/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量审核图片 POST /api/admin/picture/review/batch */
export async function batchReviewPicturesUsingPost(
  body: API.PictureReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/picture/review/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取图片统计数据 GET /api/admin/picture/statistics */
export async function getPictureStatisticsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultPictureStatisticsVO_>(
    "/api/admin/picture/statistics",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
