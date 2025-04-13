// @ts-ignore
/* eslint-disable */
import request from "@/utils/request";

/** 获取图片详情 GET /api/picture/${param0} */
export async function getPictureByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultPictureVO_>(`/api/picture/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取下一张图片 GET /api/picture/${param0}/next */
export async function getNextPictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getNextPictureUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultPictureVO_>(`/api/picture/${param0}/next`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取上一张图片 GET /api/picture/${param0}/previous */
export async function getPreviousPictureUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPreviousPictureUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultPictureVO_>(`/api/picture/${param0}/previous`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 编辑图片（用户使用） POST /api/picture/edit */
export async function editPictureUsingPost(
  body: API.PictureEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultBoolean_>("/api/picture/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传图片（可重新上传） POST /api/picture/upload */
export async function uploadPictureUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadPictureUsingPOSTParams,
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.ResultPictureVO_>("/api/picture/upload", {
    method: "POST",
    params: {
      ...params,
    },
    data: formData,
    requestType: "form",
    ...(options || {}),
  });
}

/** 批量抓取图片 POST /api/picture/upload/batch */
export async function uploadPictureByBatchUsingPost(
  body: API.PictureUploadByBatchRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultInt_>("/api/picture/upload/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** url上传图片 POST /api/picture/upload/url */
export async function uploadPictureByUrlUsingPost(
  body: API.PictureUploadRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultPictureVO_>("/api/picture/upload/url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取首页瀑布流图片列表 POST /api/picture/waterfall */
export async function getWaterfallPicturesUsingPost(
  body: API.PictureWaterfallRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultPictureWaterfallVO_>("/api/picture/waterfall", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 加载更多瀑布流图片 POST /api/picture/waterfall/more */
export async function loadMoreWaterfallPicturesUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loadMoreWaterfallPicturesUsingPOSTParams,
  body: API.PictureWaterfallRequest,
  options?: { [key: string]: any }
) {
  return request<API.ResultPictureWaterfallVO_>("/api/picture/waterfall/more", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}
