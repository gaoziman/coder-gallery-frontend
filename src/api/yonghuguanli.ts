// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 创建用户 创建一个新用户，仅管理员可用 POST /api/admin/user/add */
export async function addUserUsingPost(
  body: API.AdminUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultLong_>("/api/admin/user/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 禁用用户 禁用指定用户，仅管理员可用 POST /api/admin/user/ban */
export async function banUserUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.banUserUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/ban", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 批量删除用户 根据ID列表批量删除用户，仅管理员可用 DELETE /api/admin/user/batch/delete */
export async function batchDeleteUsersUsingDelete(
  body: API.BatchDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/batch/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 根据ID删除用户，仅管理员可用 DELETE /api/admin/user/delete */
export async function deleteUserUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUserUsingDELETEParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/delete", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据ID获取用户详情 获取用户完整信息，仅管理员可用 GET /api/admin/user/get */
export async function getUserByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultUserVO_>("/api/admin/user/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据ID获取脱敏用户信息 获取脱敏后的用户信息 GET /api/admin/user/get/vo */
export async function getUserVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserVOByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultUserVO_>("/api/admin/user/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取用户列表 分页获取用户列表，支持条件查询，仅管理员可用 GET /api/admin/user/list/page */
export async function listUserByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listUserByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPageResultUserVO_>("/api/admin/user/list/page", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 重置用户密码 重置指定用户的密码，仅管理员可用 POST /api/admin/user/reset/password */
export async function resetUserPasswordUsingPost(
  body: API.AdminResetPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/reset/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户统计信息 统计注册用户总数、本月新增用户、VIP用户数以及活跃用户比例 GET /api/admin/user/statistics */
export async function getUserStatisticsUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.ResultUserStatisticsVO_>("/api/admin/user/statistics", {
    method: "GET",
    ...(options || {}),
  });
}

/** 解禁用户 解除用户禁用状态，仅管理员可用 POST /api/admin/user/unban */
export async function unbanUserUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unbanUserUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/unban", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新用户信息 管理员更新用户信息，仅管理员可用 PUT /api/admin/user/update */
export async function updateUserUsingPut(
  body: API.AdminUserUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/admin/user/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
