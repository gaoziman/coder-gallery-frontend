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
    /** 分类总增长率(与上月相比) */
    categoryGrowthRate?: number;
    /** 禁用状态的分类数量 */
    disabledCategories?: number;
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
    /** 顶级分类数量 */
    topLevelCategories?: number;
    /** 分类总数 */
    totalCategories?: number;
  };

  type CategoryTreeVO = {
    /** 子分类列表 */
    children?: CategoryTreeVO[];
    /** 内容数量 */
    contentCount?: number;
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

  type deleteUserUsingDELETEParams = {
    /** ID */
    id: number;
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

  type listUserByPageUsingGETParams = {
    /** 用户账号 */
    account?: string;
    /** 用户ID */
    id?: number;
    /** 当前页码 */
    pageNum?: number;
    /** 每页记录数 */
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

  type LoginUserVO = {
    account?: string;
    avatar?: string;
    createTime?: string;
    id?: number;
    lastLoginIp?: string;
    lastLoginTime?: string;
    role?: string;
    tokenName?: string;
    tokenTimeout?: number;
    tokenValue?: string;
    updateTime?: string;
    userPhone?: string;
    userProfile?: string;
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

  type PageResultCategoryVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: CategoryVO[];
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

  type PageResultUserVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: UserVO[];
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

  type ResultPageResultCategoryVO_ = {
    code?: number;
    data?: PageResultCategoryVO_;
    message?: string;
  };

  type ResultPageResultRelatedItemVO_ = {
    code?: number;
    data?: PageResultRelatedItemVO_;
    message?: string;
  };

  type ResultPageResultUserVO_ = {
    code?: number;
    data?: PageResultUserVO_;
    message?: string;
  };

  type ResultString_ = {
    code?: number;
    data?: string;
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
    activeGrowth?: number;
    activeUserRatio?: number;
    bannedUsers?: number;
    newUserGrowth?: number;
    newUsersThisMonth?: number;
    newUsersThisWeek?: number;
    todayLoginUsers?: number;
    totalUserGrowth?: number;
    totalUsers?: number;
    vipUserGrowth?: number;
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
    account?: string;
    avatar?: string;
    createTime?: string;
    id?: number;
    lastLoginIp?: string;
    lastLoginTime?: string;
    phone?: string;
    registerTime?: string;
    remark?: string;
    role?: string;
    status?: string;
    updateTime?: string;
    userProfile?: string;
    username?: string;
  };

  type View = {
    contentType?: string;
  };
}
