// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 获取操作日志详情 GET /api/admin/log/operation/${param0} */
export async function getOperationLogDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOperationLogDetailUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultOperationLogVO_>(
    `/api/admin/log/operation/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 删除操作日志 DELETE /api/admin/log/operation/${param0} */
export async function deleteOperationLogUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteOperationLogUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultBoolean_>(`/api/admin/log/operation/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 批量删除操作日志 DELETE /api/admin/log/operation/batch */
export async function batchDeleteOperationLogsUsingDelete(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/log/operation/batch", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 清空操作日志 DELETE /api/admin/log/operation/clear */
export async function clearOperationLogsUsingDelete(options?: {
  [key: string]: any;
}) {
  return request<API.ResultBoolean_>("/api/admin/log/operation/clear", {
    method: "DELETE",
    ...(options || {}),
  });
}

/** 导出操作日志 GET /api/admin/log/operation/export */
export async function exportOperationLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.exportOperationLogsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultString_>("/api/admin/log/operation/export", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页查询操作日志 GET /api/admin/log/operation/list */
export async function listOperationLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listOperationLogsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultOperationLogVO_>(
    "/api/admin/log/operation/list",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
