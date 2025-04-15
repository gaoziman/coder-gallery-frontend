declare namespace API {
  type AdminResetPasswordRequest = {
    /** 确认密码 */
    checkPassword: string;
    /** 新密码 */
    newPassword: string;
    /** 用户ID */
    userId: number;
  };

  type AdminUserAddRequest = {
    /** 用户账号 */
    account: string;
    /** 用户头像URL */
    avatar?: string;
    /** 用户密码 */
    password: string;
    /** 用户手机号 */
    phone?: string;
    /** 用户备注 */
    remark?: string;
    /** 用户角色 */
    role?: string;
    /** 用户状态 */
    status?: string;
    /** 用户简介 */
    userProfile?: string;
    /** 用户名 */
    username?: string;
  };

  type AdminUserUpdateRequest = {
    /** 用户头像URL */
    avatar?: string;
    /** 用户ID */
    id: number;
    /** 用户手机号 */
    phone?: string;
    /** 备注 */
    remark?: string;
    /** 用户角色 */
    role?: string;
    /** 用户状态 */
    status?: string;
    /** 用户名 */
    username?: string;
  };

  type banUserUsingPOSTParams = {
    /** id */
    id: number;
  };

  type BatchCategoryMoveRequest = {
    /** 分类ID列表 */
    ids: number[];
    /** 新的父分类ID */
    parentId: number;
  };

  type batchCreateCategoryRelationsUsingPOSTParams = {
    /** 分类ID列表 */
    categoryIds?: number[];
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type BatchDeleteRequest = {
    /** ID列表 */
    ids: number[];
  };

  type BatchDeleteRequest1 = {
    /** ID列表 */
    ids: number[];
  };

  type CategoryCreateRequest = {
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 分类名称 */
    name: string;
    /** 父分类ID */
    parentId?: number;
    /** 排序 */
    sortOrder?: number;
    /** 状态 */
    status?: string;
    /** 分类类型 */
    type: string;
    /** URL名称 */
    urlName?: string;
  };

  type CategoryExportRequest = {
    /** 是否导出所有分类 */
    exportAll?: boolean;
    /** 导出格式，支持xlsx, csv等 */
    format?: string;
    /** 要导出的分类ID列表 */
    ids?: number[];
  };

  type CategoryMoveRequest = {
    /** 分类ID */
    id: number;
    /** 新的父分类ID */
    parentId: number;
  };

  type CategoryStatisticsVO = {
    /** 激活状态的分类数量 */
    activeCategories?: number;
    /** 最近一月活跃分类数 */
    activeLastMonthCategories?: number;
    /** 最近一周活跃分类数 */
    activeLastWeekCategories?: number;
    /** 平均子分类数 */
    averageChildrenCount?: number;
    /** 平均每个分类的内容数 */
    averageItemsPerCategory?: number;
    /** 分类总增长率(与上月相比) */
    categoryGrowthRate?: number;
    /** 分类深度分布占比 */
    depthDistributionPercentage?: Record<string, any>;
    /** 禁用状态的分类数量 */
    disabledCategories?: number;
    /** 空分类数量(不包含任何内容) */
    emptyCategoriesCount?: number;
    /** 上月分类总数 */
    lastMonthTotalCategories?: number;
    /** 最少使用的分类ID */
    leastContentsCategory?: number;
    /** 最少使用的分类名称 */
    leastContentsCategoryName?: string;
    /** 最少使用的分类内容数 */
    leastContentsCount?: number;
    /** 各层级的分类数量分布 */
    levelDistribution?: Record<string, any>;
    /** 最大分类层级 */
    maxCategoryLevel?: number;
    /** 最多内容的分类ID */
    mostContentsCategory?: number;
    /** 最多内容的分类名称 */
    mostContentsCategoryName?: string;
    /** 最多内容的分类内容数 */
    mostContentsCount?: number;
    /** 本月新增分类数 */
    newCategoriesOfMonth?: number;
    /** 今日新增分类数 */
    newCategoriesOfToday?: number;
    /** 本周新增分类数 */
    newCategoriesOfWeek?: number;
    /** 统计数据更新时间 */
    statisticsUpdateTime?: string;
    /** 今日分类增长率 */
    todayCategoryGrowthRate?: number;
    /** 顶级分类数量 */
    topLevelCategories?: number;
    /** 分类使用率排名(前10个) */
    topUsedCategories?: Record<string, any>;
    /** 分类总数 */
    totalCategories?: number;
    /** 内容总数量 */
    totalItems?: number;
    /** 本周分类增长率 */
    weeklyCategoryGrowthRate?: number;
  };

  type CategoryTreeVO = {
    /** 子分类列表 */
    children?: CategoryTreeVO[];
    /** 内容数量 */
    contentCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 分类ID */
    id?: number;
    /** 层级 */
    level?: number;
    /** 分类名称 */
    name?: string;
    /** 父分类ID */
    parentId?: number;
    /** 路径 */
    path?: string;
    /** 排序 */
    sortOrder?: number;
    /** 状态 */
    status?: string;
    /** 分类类型 */
    type?: string;
    /** URL名称 */
    urlName?: string;
  };

  type CategoryUpdateRequest = {
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 分类ID */
    id: number;
    /** 分类名称 */
    name?: string;
    /** 排序 */
    sortOrder?: number;
    /** 状态 */
    status?: string;
    /** URL名称 */
    urlName?: string;
  };

  type CategoryVO = {
    /** 内容数量 */
    contentCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 创建用户 */
    createUser?: number;
    /** 创建用户名 */
    createUsername?: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 分类ID */
    id?: number;
    /** 层级 */
    level?: number;
    /** 分类名称 */
    name?: string;
    /** 父分类ID */
    parentId?: number;
    /** 父分类名称 */
    parentName?: string;
    /** 路径 */
    path?: string;
    /** 排序 */
    sortOrder?: number;
    /** 状态 */
    status?: string;
    /** 分类类型 */
    type?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 更新用户 */
    updateUser?: number;
    /** 更新用户名 */
    updateUsername?: string;
    /** URL名称 */
    urlName?: string;
  };

  type checkRelationExistsUsingGETParams = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
    /** 标签ID */
    tagId: number;
  };

  type countContentsByCategoryUsingGETParams = {
    /** 分类ID */
    categoryId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type createCategoryRelationUsingPOSTParams = {
    /** 分类ID */
    categoryId?: number;
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type createTagRelationUsingPOSTParams = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
    /** 标签ID */
    tagId: number;
  };

  type deleteAllRelationsByContentUsingDELETE1Params = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
  };

  type deleteAllRelationsByContentUsingDELETEParams = {
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type deleteCategoryRelationUsingDELETEParams = {
    /** 分类ID */
    categoryId?: number;
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type deleteCategoryUsingDELETEParams = {
    /** 分类ID */
    id?: number;
  };

  type deleteLoginLogUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteOperationLogUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteTagRelationUsingDELETEParams = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
    /** 标签ID */
    tagId: number;
  };

  type deleteTagUsingDELETEParams = {
    /** 标签ID */
    id: number;
  };

  type deleteUserUsingDELETEParams = {
    /** ID */
    id: number;
  };

  type exportLoginLogsUsingGETParams = {
    /** 浏览器 */
    browser?: string;
    /** 用户ID */
    createBy?: number;
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 是否导出全部 */
    exportAll?: boolean;
    /** 操作系统 */
    os?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 搜索内容（模糊匹配IP、位置、设备等） */
    searchContent?: string;
    /** 登录状态 */
    status?: number;
  };

  type exportOperationLogsUsingGETParams = {
    /** 操作类型 */
    action?: string;
    /** 用户ID */
    createBy?: number;
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 是否导出全部 */
    exportAll?: boolean;
    /** 操作模块 */
    module?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 搜索内容 */
    searchContent?: string;
    /** 操作状态 */
    status?: number;
  };

  type getCategoryByIdUsingGETParams = {
    /** 分类ID */
    id?: number;
  };

  type getCategoryIdsByContentUsingGETParams = {
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type getCategoryRelatedItemsUsingGETParams = {
    /** 分类ID */
    categoryId?: number;
    /** 内容类型 */
    contentType?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
  };

  type getCategoryTreeForFrontendUsingGETParams = {
    /** 分类类型 */
    type?: string;
  };

  type getCategoryTreeUsingGETParams = {
    /** 分类类型 */
    type?: string;
  };

  type getLoginLogDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getNextPictureUsingGETParams = {
    /** id */
    id: number;
  };

  type getOperationLogDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getPictureByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getPreviousPictureUsingGETParams = {
    /** id */
    id: number;
  };

  type getTagByIdUsingGETParams = {
    /** 标签ID */
    id: number;
  };

  type getTagIdsByContentUsingGETParams = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
  };

  type getTagRelatedItemsUsingGETParams = {
    /** contentType */
    contentType?: string;
    /** pageNum */
    pageNum?: number;
    /** pageSize */
    pageSize?: number;
    /** tagId */
    tagId: number;
  };

  type getTagUsageTrendUsingGETParams = {
    /** endDate */
    endDate: string;
    /** startDate */
    startDate: string;
    /** tagId */
    tagId: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type listCategoriesByTypeUsingGETParams = {
    /** 分类类型 */
    type?: string;
  };

  type listCategoryByPageUsingGETParams = {
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 层级 */
    level?: number;
    /** 分类名称 */
    name?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 父分类ID */
    parentId?: number;
    /** 状态 */
    status?: string;
    /** 分类类型 */
    type?: string;
  };

  type listLoginLogsUsingGETParams = {
    /** 浏览器 */
    browser?: string;
    /** 用户ID */
    createBy?: number;
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 是否导出全部 */
    exportAll?: boolean;
    /** 操作系统 */
    os?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 搜索内容（模糊匹配IP、位置、设备等） */
    searchContent?: string;
    /** 登录状态 */
    status?: number;
  };

  type listOperationLogsUsingGETParams = {
    /** 操作类型 */
    action?: string;
    /** 用户ID */
    createBy?: number;
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 是否导出全部 */
    exportAll?: boolean;
    /** 操作模块 */
    module?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 搜索内容 */
    searchContent?: string;
    /** 操作状态 */
    status?: number;
  };

  type listTagByPageUsingGETParams = {
    /** 创建结束时间 */
    createTimeEnd?: string;
    /** 创建开始时间 */
    createTimeStart?: string;
    /** 标签名称(模糊查询) */
    name?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 状态(active-已启用,inactive-未启用) */
    status?: string;
  };

  type listUserByPageUsingGETParams = {
    /** 用户账号 */
    account?: string;
    /** 用户ID */
    id?: number;
    /** 页码 */
    pageNum?: number;
    /** 每页大小 */
    pageSize?: number;
    /** 用户手机号 */
    phone?: string;
    /** 注册时间范围-结束 */
    registerTimeEnd?: string;
    /** 注册时间范围-开始 */
    registerTimeStart?: string;
    /** 用户角色 */
    role?: string;
    /** 用户状态 */
    status?: string;
    /** 用户名 */
    username?: string;
  };

  type loadMoreWaterfallPicturesUsingPOSTParams = {
    /** lastId */
    lastId: number;
    /** lastValue */
    lastValue?: string;
  };

  type LoginLogVO = {
    /** 用户头像 */
    avatar?: string;
    /** 浏览器 */
    browser?: string;
    /** 创建时间 */
    createTime?: string;
    /** 登录设备 */
    device?: string;
    /** 日志ID */
    id?: number;
    /** 登录IP */
    ip?: string;
    /** 登录地点 */
    location?: string;
    /** 登录时间 */
    loginTime?: string;
    /** 登出时间 */
    logoutTime?: string;
    /** 登录消息 */
    message?: string;
    /** 操作系统 */
    os?: string;
    /** 用户角色 */
    role?: string;
    /** 登录状态 */
    status?: number;
    /** 用户名 */
    username?: string;
  };

  type LoginStatisticsVO = {
    /** 异常登录数 */
    abnormalLoginCount?: number;
    /** 活跃用户数 */
    activeUserCount?: number;
    /** 环比增长率（%） */
    growthRate?: number;
    /** 本月登录次数 */
    monthLoginCount?: number;
    /** 登录成功率 */
    successRate?: number;
    /** 今日登录失败次数 */
    todayFailCount?: number;
    /** 今日登录次数 */
    todayLoginCount?: number;
    /** 今日登录用户数 */
    todayLoginUsers?: number;
    /** 总登录次数 */
    totalLoginCount?: number;
    /** 本周登录次数 */
    weekLoginCount?: number;
  };

  type LoginUserVO = {
    /** 账号 */
    account?: string;
    /** 用户头像 */
    avatar?: string;
    /** 创建时间 */
    createTime?: string;
    /** 用户 id */
    id?: number;
    /** 最后登录IP */
    lastLoginIp?: string;
    /** 最后登录时间 */
    lastLoginTime?: string;
    /** 用户角色 */
    role?: string;
    /** Sa-Token令牌名称 */
    tokenName?: string;
    /** 令牌过期时间（秒） */
    tokenTimeout?: number;
    /** Sa-Token令牌 */
    tokenValue?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 用户手机号 */
    userPhone?: string;
    /** 用户简介 */
    userProfile?: string;
    /** 用户昵称 */
    username?: string;
  };

  type ModelAndView = {
    empty?: boolean;
    model?: Record<string, any>;
    modelMap?: Record<string, any>;
    reference?: boolean;
    status?:
      | "CONTINUE"
      | "SWITCHING_PROTOCOLS"
      | "PROCESSING"
      | "CHECKPOINT"
      | "OK"
      | "CREATED"
      | "ACCEPTED"
      | "NON_AUTHORITATIVE_INFORMATION"
      | "NO_CONTENT"
      | "RESET_CONTENT"
      | "PARTIAL_CONTENT"
      | "MULTI_STATUS"
      | "ALREADY_REPORTED"
      | "IM_USED"
      | "MULTIPLE_CHOICES"
      | "MOVED_PERMANENTLY"
      | "FOUND"
      | "MOVED_TEMPORARILY"
      | "SEE_OTHER"
      | "NOT_MODIFIED"
      | "USE_PROXY"
      | "TEMPORARY_REDIRECT"
      | "PERMANENT_REDIRECT"
      | "BAD_REQUEST"
      | "UNAUTHORIZED"
      | "PAYMENT_REQUIRED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "METHOD_NOT_ALLOWED"
      | "NOT_ACCEPTABLE"
      | "PROXY_AUTHENTICATION_REQUIRED"
      | "REQUEST_TIMEOUT"
      | "CONFLICT"
      | "GONE"
      | "LENGTH_REQUIRED"
      | "PRECONDITION_FAILED"
      | "PAYLOAD_TOO_LARGE"
      | "REQUEST_ENTITY_TOO_LARGE"
      | "URI_TOO_LONG"
      | "REQUEST_URI_TOO_LONG"
      | "UNSUPPORTED_MEDIA_TYPE"
      | "REQUESTED_RANGE_NOT_SATISFIABLE"
      | "EXPECTATION_FAILED"
      | "I_AM_A_TEAPOT"
      | "INSUFFICIENT_SPACE_ON_RESOURCE"
      | "METHOD_FAILURE"
      | "DESTINATION_LOCKED"
      | "UNPROCESSABLE_ENTITY"
      | "LOCKED"
      | "FAILED_DEPENDENCY"
      | "TOO_EARLY"
      | "UPGRADE_REQUIRED"
      | "PRECONDITION_REQUIRED"
      | "TOO_MANY_REQUESTS"
      | "REQUEST_HEADER_FIELDS_TOO_LARGE"
      | "UNAVAILABLE_FOR_LEGAL_REASONS"
      | "INTERNAL_SERVER_ERROR"
      | "NOT_IMPLEMENTED"
      | "BAD_GATEWAY"
      | "SERVICE_UNAVAILABLE"
      | "GATEWAY_TIMEOUT"
      | "HTTP_VERSION_NOT_SUPPORTED"
      | "VARIANT_ALSO_NEGOTIATES"
      | "INSUFFICIENT_STORAGE"
      | "LOOP_DETECTED"
      | "BANDWIDTH_LIMIT_EXCEEDED"
      | "NOT_EXTENDED"
      | "NETWORK_AUTHENTICATION_REQUIRED";
    view?: View;
    viewName?: string;
  };

  type OperationLogStatisticsVO = {
    /** 活跃用户数 */
    activeUsers?: number;
    /** 活跃用户数环比增长率 */
    activeUsersGrowthRate?: number;
    /** 异常操作数 */
    exceptionOperations?: number;
    /** 异常操作环比增长率 */
    exceptionOperationsGrowthRate?: number;
    /** 本月操作量 */
    monthlyOperations?: number;
    /** 本月操作量环比增长率 */
    monthlyOperationsGrowthRate?: number;
    /** 操作成功率 */
    successRate?: number;
    /** 操作成功率环比增长率 */
    successRateGrowthRate?: number;
    /** 今日操作量 */
    todayOperations?: number;
    /** 今日操作量环比增长率 */
    todayOperationsGrowthRate?: number;
    /** 总操作次数 */
    totalOperations?: number;
    /** 总操作次数同比增长率 */
    totalOperationsGrowthRate?: number;
  };

  type OperationLogVO = {
    /** 操作类型 */
    action?: string;
    /** 用户头像 */
    avatar?: string;
    /** 创建人 */
    createBy?: number;
    /** 创建时间 */
    createTime?: string;
    /** 日志ID */
    id?: number;
    /** 操作IP */
    ip?: string;
    /** 请求方法 */
    method?: string;
    /** 操作模块 */
    module?: string;
    /** 操作时间 */
    operationTime?: string;
    /** 请求参数 */
    params?: string;
    /** 用户角色 */
    role?: string;
    /** 操作状态 */
    status?: number;
    /** 执行时长(毫秒) */
    time?: number;
    /** 用户名 */
    username?: string;
  };

  type PageResultCategoryVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: CategoryVO[];
    total?: number;
  };

  type PageResultLoginLogVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: LoginLogVO[];
    total?: number;
  };

  type PageResultOperationLogVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: OperationLogVO[];
    total?: number;
  };

  type PageResultRelatedItemVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: RelatedItemVO[];
    total?: number;
  };

  type PageResultTagRelatedItemVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: TagRelatedItemVO[];
    total?: number;
  };

  type PageResultTagVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: TagVO[];
    total?: number;
  };

  type PageResultUserVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: UserVO[];
    total?: number;
  };

  type PictureEditRequest = {
    /** 分类Id */
    categoryId: number;
    /** 简介 */
    description: string;
    /** id */
    id: number;
    /** 图片名称 */
    name: string;
    /** 标签IDs */
    tagIds: number[];
  };

  type PictureUploadByBatchRequest = {
    /** 分类ID */
    categoryId?: number;
    /** 抓取数量 */
    count?: number;
    /** 名称前缀 */
    namePrefix?: string;
    /** 搜索词 */
    searchText?: string;
    /** 搜索源 */
    source?: string;
  };

  type PictureUploadRequest = {
    /** 图片 url */
    fileUrl: string;
    /** 图片 id（用于修改） */
    id?: number;
    /** 图片名称 */
    picName: string;
    /** 空间 id */
    spaceId: number;
  };

  type PictureVO = {
    /** 分类名称 */
    category?: string;
    /** 分类Id */
    categoryId?: string;
    /** 收藏数量 */
    collectionCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 描述 */
    description?: string;
    /** 图片格式 */
    format?: string;
    /** id */
    id?: number;
    /** 图片点赞数 */
    likeCount?: number;
    /** 图片主色调 */
    mainColor?: string;
    /** 图片名称 */
    name?: string;
    /** 原始文件名 */
    originalName?: string;
    /** 图片高度 */
    picHeight?: number;
    /** 图片比例 */
    picScale?: number;
    /** 图片宽度 */
    picWidth?: number;
    /** 审核内容 */
    reviewMessage?: string;
    /** 审核状态 */
    reviewStatus?: number;
    /** 审核时间 */
    reviewTime?: string;
    /** 审核人 id */
    reviewerId?: number;
    /** 图片大小 */
    size?: number;
    /** 标签Ids */
    tagIds?: string[];
    /** 标签名称 */
    tags?: string[];
    /** 缩略图 url */
    thumbnailUrl?: string;
    /** 图片 url */
    url?: string;
    user?: UserVO;
    /** 浏览量 */
    viewCount?: number;
  };

  type PictureWaterfallRequest = {
    /** 分类ID */
    categoryId?: number;
    /** 图片格式，如jpg,png */
    format?: string;
    /** 搜索关键词 */
    keyword?: string;
    /** 高度下限 */
    minHeight?: number;
    /** 宽度下限 */
    minWidth?: number;
    /** 每页数量，默认30 */
    pageSize?: number;
    /** 排序方式: newest(最新发布)/popular(最受欢迎)/mostViewed(最多浏览)/mostLiked(最多点赞)/mostCollected(最多收藏) */
    sortBy?: string;
    /** 标签ID列表 */
    tagIds?: number[];
    /** 上传者ID */
    userId?: number;
  };

  type PictureWaterfallVO = {
    /** 是否有更多图片 */
    hasMore?: boolean;
    /** 最后一张图片ID，用于加载更多 */
    lastId?: number;
    /** 最后一张图片的排序值 */
    lastValue?: Record<string, any>;
    /** 图片列表 */
    records?: PictureVO[];
    /** 总记录数 */
    total?: number;
  };

  type RelatedItemVO = {
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
    /** 创建时间 */
    createTime?: string;
    /** 创建用户 */
    createUser?: number;
    /** 创建用户名 */
    createUsername?: string;
    /** 内容描述 */
    description?: string;
    /** 关联项ID */
    id?: number;
    /** 内容状态 */
    status?: string;
    /** 内容缩略图 */
    thumbnail?: string;
    /** 内容标题 */
    title?: string;
  };

  type ResultBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type ResultCategoryStatisticsVO_ = {
    code?: number;
    data?: CategoryStatisticsVO;
    message?: string;
  };

  type ResultCategoryVO_ = {
    code?: number;
    data?: CategoryVO;
    message?: string;
  };

  type ResultInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type ResultListCategoryTreeVO_ = {
    code?: number;
    data?: CategoryTreeVO[];
    message?: string;
  };

  type ResultListCategoryVO_ = {
    code?: number;
    data?: CategoryVO[];
    message?: string;
  };

  type ResultListLong_ = {
    code?: number;
    data?: number[];
    message?: string;
  };

  type ResultListTagUsageTrendVO_ = {
    code?: number;
    data?: TagUsageTrendVO[];
    message?: string;
  };

  type ResultListTagVO_ = {
    code?: number;
    data?: TagVO[];
    message?: string;
  };

  type ResultLoginLogVO_ = {
    code?: number;
    data?: LoginLogVO;
    message?: string;
  };

  type ResultLoginStatisticsVO_ = {
    code?: number;
    data?: LoginStatisticsVO;
    message?: string;
  };

  type ResultLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type ResultLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type ResultOperationLogStatisticsVO_ = {
    code?: number;
    data?: OperationLogStatisticsVO;
    message?: string;
  };

  type ResultOperationLogVO_ = {
    code?: number;
    data?: OperationLogVO;
    message?: string;
  };

  type ResultPageResultCategoryVO_ = {
    code?: number;
    data?: PageResultCategoryVO_;
    message?: string;
  };

  type ResultPageResultLoginLogVO_ = {
    code?: number;
    data?: PageResultLoginLogVO_;
    message?: string;
  };

  type ResultPageResultOperationLogVO_ = {
    code?: number;
    data?: PageResultOperationLogVO_;
    message?: string;
  };

  type ResultPageResultRelatedItemVO_ = {
    code?: number;
    data?: PageResultRelatedItemVO_;
    message?: string;
  };

  type ResultPageResultTagRelatedItemVO_ = {
    code?: number;
    data?: PageResultTagRelatedItemVO_;
    message?: string;
  };

  type ResultPageResultTagVO_ = {
    code?: number;
    data?: PageResultTagVO_;
    message?: string;
  };

  type ResultPageResultUserVO_ = {
    code?: number;
    data?: PageResultUserVO_;
    message?: string;
  };

  type ResultPictureVO_ = {
    code?: number;
    data?: PictureVO;
    message?: string;
  };

  type ResultPictureWaterfallVO_ = {
    code?: number;
    data?: PictureWaterfallVO;
    message?: string;
  };

  type ResultString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type ResultTagStatisticsVO_ = {
    code?: number;
    data?: TagStatisticsVO;
    message?: string;
  };

  type ResultTagVO_ = {
    code?: number;
    data?: TagVO;
    message?: string;
  };

  type ResultUserStatisticsVO_ = {
    code?: number;
    data?: UserStatisticsVO;
    message?: string;
  };

  type ResultUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type TagBatchDeleteRequest = {
    /** ID列表 */
    ids: number[];
  };

  type TagBatchTagStatusUpdateRequest = {
    /** 标签ID列表 */
    ids: number[];
    /** 状态(active-已启用,inactive-未启用) */
    status: string;
  };

  type TagCreateRequest = {
    /** 标签颜色(HEX格式) */
    color?: string;
    /** 标签描述 */
    description?: string;
    /** 标签名称 */
    name: string;
    /** 排序优先级 */
    sortOrder?: number;
    /** 标签状态 */
    status?: string;
  };

  type TagRelatedItemVO = {
    /** 创建时间 */
    createTime?: string;
    /** 创建人 */
    creator?: string;
    /** 内容描述 */
    description?: string;
    /** 内容ID */
    id?: number;
    /** 缩略图URL */
    thumbnailUrl?: string;
    /** 内容标题 */
    title?: string;
    /** 内容类型 */
    type?: string;
  };

  type TagRelationBatchCreateRequest = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
    /** 标签ID列表 */
    tagIds: number[];
  };

  type TagRelationUpdateRequest = {
    /** 内容ID */
    contentId: number;
    /** 内容类型 */
    contentType: string;
    /** 标签ID列表 */
    tagIds?: number[];
  };

  type TagStatisticsVO = {
    /** 已启用标签数 */
    activeCount?: number;
    /** 未启用标签数 */
    inactiveCount?: number;
    /** 本月新增标签数 */
    monthCount?: number;
    /** 今日创建标签数 */
    todayCount?: number;
    /** 标签总数 */
    totalCount?: number;
    /** 引用总数 */
    totalReferenceCount?: number;
    /** 未使用的标签数 */
    unusedTag?: number;
    /** 本周新增标签数 */
    weekCount?: number;
  };

  type TagStatusUpdateRequest = {
    /** 标签ID */
    id: number;
    /** 状态(active-已启用,inactive-未启用) */
    status: string;
  };

  type TagUpdateRequest = {
    /** 标签颜色(HEX格式) */
    color?: string;
    /** 标签描述 */
    description?: string;
    /** 标签ID */
    id: number;
    /** 标签名称 */
    name: string;
    /** 排序优先级 */
    sortOrder?: number;
    /** 标签状态 */
    status?: string;
  };

  type TagUsageTrendVO = {
    /** 使用次数 */
    count?: number;
    /** 日期 */
    date?: string;
  };

  type TagVO = {
    /** 标签颜色(HEX格式) */
    color?: string;
    /** 创建时间 */
    createTime?: string;
    /** 创建人 */
    createUser?: number;
    /** 标签描述 */
    description?: string;
    /** 标签ID */
    id?: number;
    /** 标签名称 */
    name?: string;
    /** 引用次数 */
    referenceCount?: number;
    /** 排序优先级 */
    sortOrder?: number;
    /** 状态(active-已启用,inactive-未启用) */
    status?: string;
  };

  type unbanUserUsingPOSTParams = {
    /** id */
    id: number;
  };

  type updateContentCategoriesUsingPUTParams = {
    /** 分类ID列表 */
    categoryIds?: number[];
    /** 内容ID */
    contentId?: number;
    /** 内容类型 */
    contentType?: string;
  };

  type uploadPictureUsingPOSTParams = {
    /** 图片 url */
    fileUrl: string;
    /** 图片 id（用于修改） */
    id?: number;
    /** 图片名称 */
    picName: string;
    /** 空间 id */
    spaceId: number;
  };

  type UserLoginRequest = {
    /** 用户名 */
    account: string;
    /** 密码 */
    password: string;
  };

  type UserRegisterRequest = {
    /** 用户名 */
    account: string;
    /** 确认密码 */
    checkPassword: string;
    /** 密码 */
    password: string;
  };

  type UserStatisticsVO = {
    /** 活跃用户比例变化(百分点)，与上月相比 */
    activeGrowth?: number;
    /** 活跃用户比例(%) */
    activeUserRatio?: number;
    /** 冻结账户数量 */
    bannedUsers?: number;
    /** 新增用户增长率(%)，与上月相比 */
    newUserGrowth?: number;
    /** 本月新增用户数 */
    newUsersThisMonth?: number;
    /** 本周新增用户数量 */
    newUsersThisWeek?: number;
    /** 今日登录用户数量 */
    todayLoginUsers?: number;
    /** 总用户增长率(%)，与上月相比 */
    totalUserGrowth?: number;
    totalUsers?: number;
    /** VIP用户增长率(%)，与上月相比 */
    vipUserGrowth?: number;
    /** VIP用户数 */
    vipUsers?: number;
  };

  type UserUpdatePasswordRequest = {
    /** 确认新密码 */
    checkPassword: string;
    /** 新密码 */
    newPassword: string;
    /** 旧密码 */
    oldPassword: string;
  };

  type UserUpdateRequest = {
    /** 头像URL */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 用户简介 */
    userProfile?: string;
    /** 用户名 */
    username?: string;
  };

  type UserVO = {
    /** 账户名 */
    account?: string;
    /** 头像URL */
    avatar?: string;
    /** 创建时间 */
    createTime?: string;
    /** 用户ID */
    id?: number;
    /** 最后登录IP */
    lastLoginIp?: string;
    /** 最后登录时间 */
    lastLoginTime?: string;
    /** 手机号 */
    phone?: string;
    /** 注册时间 */
    registerTime?: string;
    /** 备注 */
    remark?: string;
    /** 角色(admin-管理员,user-普通用户,superAdmin-超级管理员) */
    role?: string;
    /** 状态(active-已激活,inactive-未激活,disabled-已禁用) */
    status?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 个人简介 */
    userProfile?: string;
    /** 用户名 */
    username?: string;
  };

  type View = {
    contentType?: string;
  };
}
