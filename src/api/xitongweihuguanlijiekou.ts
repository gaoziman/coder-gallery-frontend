// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 修复指定标签引用计数 POST /api/admin/system/repair/tag-count/${param0} */
export async function repairTagCountUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.repairTagCountUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { tagId: param0, ...queryParams } = params;
  return request<API.ResultBoolean_>(
    `/api/admin/system/repair/tag-count/${param0}`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 修复所有标签引用计数 POST /api/admin/system/repair/tag-counts */
export async function repairAllTagCountsUsingPost(options?: {
  [key: string]: any;
}) {
  return request<API.ResultBoolean_>("/api/admin/system/repair/tag-counts", {
    method: "POST",
    ...(options || {}),
  });
}
