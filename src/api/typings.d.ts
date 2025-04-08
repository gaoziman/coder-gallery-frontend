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

  type BatchDeleteRequest = {
    /** ID列表 */
    ids: number[];
  };

  type deleteUserUsingDELETEParams = {
    /** ID */
    id: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id: number;
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

  type PageResultUserVO_ = {
    hasNext?: boolean;
    hasPrevious?: boolean;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    records?: UserVO[];
    total?: number;
  };

  type ResultBoolean_ = {
    code?: number;
    data?: boolean;
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

  type ResultPageResultUserVO_ = {
    code?: number;
    data?: PageResultUserVO_;
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
