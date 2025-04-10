// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 获取登录日志详情 GET /api/admin/log/login/${param0} */
export async function getLoginLogDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLoginLogDetailUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultLoginLogVO_>(`/api/admin/log/login/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除登录日志 DELETE /api/admin/log/login/${param0} */
export async function deleteLoginLogUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteLoginLogUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultBoolean_>(`/api/admin/log/login/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 批量删除登录日志 DELETE /api/admin/log/login/batch */
export async function batchDeleteLoginLogsUsingDelete(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/log/login/batch", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 清空登录日志 DELETE /api/admin/log/login/clear */
export async function clearLoginLogsUsingDelete(options?: {
  [key: string]: any;
}) {
  return request<API.ResultBoolean_>("/api/admin/log/login/clear", {
    method: "DELETE",
    ...(options || {}),
  });
}

/** 导出登录日志 GET /api/admin/log/login/export */
export async function exportLoginLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.exportLoginLogsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultString_>("/api/admin/log/login/export", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页查询登录日志 GET /api/admin/log/login/list */
export async function listLoginLogsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listLoginLogsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultLoginLogVO_>("/api/admin/log/login/list", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取登录统计信息 GET /api/admin/log/login/statistics */
export async function getLoginStatisticsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultLoginStatisticsVO_>(
    "/api/admin/log/login/statistics",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
