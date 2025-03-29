<template>
  <div class="user-profile-container">
    <!-- 个人中心顶部信息卡片 -->
    <a-row :gutter="24">
      <a-col :span="24">
        <a-card class="profile-header-card" :body-style="{ padding: '0' }">
          <div class="profile-header">
            <div class="profile-cover">
              <div class="cover-edit-button">
                <a-tooltip title="更换封面">
                  <a-button type="primary" shape="circle" @click="handleChangeCover">
                    <template #icon><camera-outlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </div>
            <div class="profile-info">
              <div class="avatar-container">
                <a-avatar :size="88" :src="userInfo.avatar" />
                <div class="avatar-edit-button">
                  <a-tooltip title="更换头像">
                    <a-button type="primary" shape="circle" size="small" @click="handleChangeAvatar">
                      <template #icon><camera-outlined /></template>
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              <div class="user-info-container">
                <div class="user-name">{{ userInfo.username }}</div>
                <div class="user-bio">{{ userInfo.bio || '这个人很懒，还没有写自我介绍...' }}</div>
                <div class="user-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ userStats.pictures }}</div>
                    <div class="stat-label">图片</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-value">{{ userStats.followers }}</div>
                    <div class="stat-label">粉丝</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-value">{{ userStats.following }}</div>
                    <div class="stat-label">关注</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-value">{{ userStats.likes }}</div>
                    <div class="stat-label">获赞</div>
                  </div>
                </div>
                <div class="user-actions">
                  <a-button type="primary" @click="openEditProfileModal">
                    <template #icon><edit-outlined /></template>
                    编辑资料
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 个人中心主体内容 -->
    <a-row :gutter="24" class="profile-content">
      <a-col :span="6">
        <!-- 左侧个人信息卡片 -->
        <a-card class="info-card" title="个人信息" :bordered="false">
          <template #extra>
            <a-button type="link" @click="openEditInfoModal">
              <edit-outlined />
            </a-button>
          </template>
          <div class="info-list">
            <div class="info-item">
              <user-outlined />
              <span class="info-label">账号名</span>
              <span class="info-value">{{ userInfo.account }}</span>
            </div>
            <div class="info-item">
              <mail-outlined />
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <phone-outlined />
              <span class="info-label">手机</span>
              <span class="info-value">{{ userInfo.phone }}</span>
            </div>
            <div class="info-item">
              <tag-outlined />
              <span class="info-label">角色</span>
              <span class="info-value">
                <a-tag :color="getRoleColor(userInfo.role)">{{ getRoleName(userInfo.role) }}</a-tag>
              </span>
            </div>
            <div class="info-item">
              <calendar-outlined />
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(userInfo.registerTime) }}</span>
            </div>
            <div class="info-item">
              <clock-circle-outlined />
              <span class="info-label">最近登录</span>
              <span class="info-value">{{ formatDate(userInfo.lastLoginTime) }}</span>
            </div>
          </div>
        </a-card>

        <!-- 左侧存储空间卡片 -->
        <a-card class="storage-card" title="存储空间" :bordered="false">
          <div class="storage-info">
            <div class="storage-progress">
              <a-progress
                  type="circle"
                  :percent="Math.round((userStorage.used / userStorage.total) * 100)"
                  :stroke-color="storageProgressColor"
              />
            </div>
            <div class="storage-details">
              <div class="storage-text">
                已使用 <span class="storage-highlight">{{ formatStorage(userStorage.used) }}</span>
              </div>
              <div class="storage-text">
                总容量 <span class="storage-highlight">{{ formatStorage(userStorage.total) }}</span>
              </div>
              <a-button type="primary" class="upgrade-button">
                <template #icon><cloud-upload-outlined /></template>
                升级空间
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- 左侧活跃度卡片 -->
        <a-card class="activity-card" title="最近活跃" :bordered="false">
          <div class="activity-heatmap">
            <div v-for="(week, weekIndex) in activityData" :key="'week-'+weekIndex" class="heatmap-week">
              <div v-for="(day, dayIndex) in week" :key="'day-'+weekIndex+'-'+dayIndex"
                   class="heatmap-day"
                   :class="'level-' + day.level"
                   :title="day.date + ': ' + day.count + '个操作'">
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <div class="legend-text">活跃度</div>
            <div class="legend-levels">
              <div class="legend-level level-0"></div>
              <div class="legend-level level-1"></div>
              <div class="legend-level level-2"></div>
              <div class="legend-level level-3"></div>
              <div class="legend-level level-4"></div>
            </div>
            <div class="legend-text">高</div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="18">
        <!-- 内容区域切换标签 -->
        <a-card :bordered="false" class="tab-card">
          <a-tabs v-model:activeKey="activeTabKey">
            <a-tab-pane key="pictures" tab="我的图片">
              <!-- 我的图片过滤和排序 -->
              <div class="filter-row">
                <div class="filter-left">
                  <a-radio-group v-model:value="pictureFilter" button-style="solid">
                    <a-radio-button value="all">全部图片</a-radio-button>
                    <a-radio-button value="public">公开</a-radio-button>
                    <a-radio-button value="private">私密</a-radio-button>
                  </a-radio-group>
                </div>
                <div class="filter-right">
                  <a-select
                      v-model:value="pictureSort"
                      style="width: 140px"
                      placeholder="排序方式"
                  >
                    <a-select-option value="newest">最新上传</a-select-option>
                    <a-select-option value="popular">最受欢迎</a-select-option>
                    <a-select-option value="viewed">最多浏览</a-select-option>
                  </a-select>
                </div>
              </div>

              <!-- 图片网格 -->
              <div class="picture-grid">
                <a-row :gutter="[16, 16]">
                  <a-col :span="6" v-for="picture in filteredPictures" :key="picture.id">
                    <div class="picture-card">
                      <div class="picture-wrapper">
                        <img :src="picture.url" :alt="picture.title" class="picture-image" />
                        <div class="picture-overlay">
                          <div class="picture-actions">
                            <a-tooltip title="查看详情">
                              <a-button type="primary" shape="circle" size="small" @click="viewPictureDetails(picture.id)">
                                <template #icon><eye-outlined /></template>
                              </a-button>
                            </a-tooltip>
                            <a-tooltip title="编辑图片">
                              <a-button type="primary" shape="circle" size="small" @click="editPicture(picture.id)">
                                <template #icon><edit-outlined /></template>
                              </a-button>
                            </a-tooltip>
                            <a-tooltip title="删除图片">
                              <a-popconfirm
                                  title="确定要删除此图片吗？"
                                  ok-text="确定"
                                  cancel-text="取消"
                                  @confirm="deletePicture(picture.id)"
                              >
                                <a-button type="primary" danger shape="circle" size="small">
                                  <template #icon><delete-outlined /></template>
                                </a-button>
                              </a-popconfirm>
                            </a-tooltip>
                          </div>
                        </div>
                      </div>
                      <div class="picture-info">
                        <div class="picture-title">{{ picture.title }}</div>
                        <div class="picture-meta">
                          <span><eye-outlined /> {{ picture.views }}</span>
                          <span><like-outlined /> {{ picture.likes }}</span>
                          <a-tag color="blue" v-if="picture.isPublic">公开</a-tag>
                          <a-tag color="purple" v-else>私密</a-tag>
                        </div>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>

              <!-- 分页 -->
              <div class="pagination-container">
                <a-pagination
                    v-model:current="picturesPagination.current"
                    :total="picturesPagination.total"
                    :page-size="picturesPagination.pageSize"
                    show-size-changer
                    show-quick-jumper
                    @change="handlePicturesPageChange"
                    @showSizeChange="handlePicturesSizeChange"
                />
              </div>
            </a-tab-pane>

            <a-tab-pane key="settings" tab="账户设置">
              <a-card :bordered="false" class="settings-card">
                <a-tabs tab-position="left">
                  <a-tab-pane key="security" tab="账户安全">
                    <div class="password-change-container">
                      <div class="password-form">
                        <h3>密码修改</h3>

                        <a-form :model="passwordForm" layout="vertical">
                          <a-form-item label="当前密码" name="currentPassword">
                            <a-input-password
                                v-model:value="passwordForm.currentPassword"
                                placeholder="请输入当前密码"
                                class="custom-password-input"
                            />
                          </a-form-item>
                          <a-form-item label="新密码" name="newPassword">
                            <a-input-password
                                v-model:value="passwordForm.newPassword"
                                placeholder="请输入新密码"
                                class="custom-password-input"
                            />
                          </a-form-item>
                          <a-form-item label="确认新密码" name="confirmPassword">
                            <a-input-password
                                v-model:value="passwordForm.confirmPassword"
                                placeholder="请再次输入新密码"
                                class="custom-password-input"
                            />
                          </a-form-item>
                          <a-form-item>
                            <a-button type="primary" @click="changePassword" class="update-password-button">
                              更新密码
                            </a-button>
                          </a-form-item>
                        </a-form>
                      </div>
                    </div>

                    <a-divider />

                    <div class="settings-section">
                      <h3>安全设置</h3>
                      <div class="security-item">
                        <div class="security-info">
                          <div class="security-title">两步验证</div>
                          <div class="security-desc">启用两步验证，增强账户安全</div>
                        </div>
                        <a-switch v-model:checked="securitySettings.twoFactorAuth" />
                      </div>
                      <div class="security-item">
                        <div class="security-info">
                          <div class="security-title">登录通知</div>
                          <div class="security-desc">检测到新设备登录时通知我</div>
                        </div>
                        <a-switch v-model:checked="securitySettings.loginAlert" />
                      </div>
                      <div class="security-item">
                        <div class="security-info">
                          <div class="security-title">活动日志</div>
                          <div class="security-desc">记录所有账户活动</div>
                        </div>
                        <a-switch v-model:checked="securitySettings.activityLog" />
                      </div>
                    </div>
                  </a-tab-pane>

                  <a-tab-pane key="notifications" tab="通知设置">
                    <div class="settings-section">
                      <h3>电子邮件通知</h3>
                      <div class="notification-item">
                        <div class="notification-info">
                          <div class="notification-title">新关注者</div>
                          <div class="notification-desc">当有人关注我时发送邮件通知</div>
                        </div>
                        <a-switch v-model:checked="notificationSettings.newFollower" />
                      </div>
                      <div class="notification-item">
                        <div class="notification-info">
                          <div class="notification-title">点赞通知</div>
                          <div class="notification-desc">当有人点赞我的图片时发送邮件通知</div>
                        </div>
                        <a-switch v-model:checked="notificationSettings.newLike" />
                      </div>
                      <div class="notification-item">
                        <div class="notification-info">
                          <div class="notification-title">评论通知</div>
                          <div class="notification-desc">当有人评论我的图片时发送邮件通知</div>
                        </div>
                        <a-switch v-model:checked="notificationSettings.newComment" />
                      </div>
                      <div class="notification-item">
                        <div class="notification-info">
                          <div class="notification-title">系统公告</div>
                          <div class="notification-desc">接收系统更新和功能通知</div>
                        </div>
                        <a-switch v-model:checked="notificationSettings.systemNotice" />
                      </div>
                    </div>
                  </a-tab-pane>

                  <a-tab-pane key="privacy" tab="隐私设置">
                    <div class="settings-section">
                      <h3>内容隐私</h3>
                      <div class="privacy-item">
                        <div class="privacy-info">
                          <div class="privacy-title">默认上传权限</div>
                          <div class="privacy-desc">设置新上传图片的默认可见性</div>
                        </div>
                        <a-select v-model:value="privacySettings.defaultUploadVisibility" style="width: 120px">
                          <a-select-option value="public">公开</a-select-option>
                          <a-select-option value="private">私密</a-select-option>
                        </a-select>
                      </div>
                      <div class="privacy-item">
                        <div class="privacy-info">
                          <div class="privacy-title">个人资料可见性</div>
                          <div class="privacy-desc">允许其他用户查看我的个人资料</div>
                        </div>
                        <a-switch v-model:checked="privacySettings.profileVisibility" />
                      </div>
                      <div class="privacy-item">
                        <div class="privacy-info">
                          <div class="privacy-title">搜索引擎索引</div>
                          <div class="privacy-desc">允许搜索引擎索引我的内容</div>
                        </div>
                        <a-switch v-model:checked="privacySettings.searchEngineIndex" />
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </a-card>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑个人资料弹窗 -->
    <a-modal
        v-model:visible="editProfileModalVisible"
        title="编辑个人资料"
        @ok="handleEditProfileSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="editProfileForm" :rules="rules" ref="editProfileFormRef" layout="vertical">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editProfileForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="个人简介" name="bio">
          <a-textarea
              v-model:value="editProfileForm.bio"
              placeholder="请输入个人简介"
              :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
        <a-form-item label="个人网站" name="website">
          <a-input
              v-model:value="editProfileForm.website"
              placeholder="请输入个人网站"
              prefix="https://"
          />
        </a-form-item>
        <a-form-item label="所在地区" name="location">
          <a-input v-model:value="editProfileForm.location" placeholder="请输入所在地区" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  LikeOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

const router = useRouter();

// 用户基本信息
const userInfo = reactive({
  id: 1,
  account: 'user123',
  username: '云图爱好者',
  email: 'user123@example.com',
  phone: '139****1234',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123',
  bio: '热爱摄影与设计，希望通过图片记录生活的美好瞬间。',
  role: 'vip',
  registerTime: '2025-01-15T08:30:00',
  lastLoginTime: '2025-03-25T10:25:30',
  website: 'mywebsite.com',
  location: '北京市'
});

// 用户统计数据
const userStats = reactive({
  pictures: 128,
  followers: 362,
  following: 89,
  likes: 2154
});

// 用户存储空间信息
const userStorage = reactive({
  used: 2.3, // GB
  total: 5, // GB
});

// 存储空间进度条颜色计算
const storageProgressColor = computed(() => {
  const percentage = (userStorage.used / userStorage.total) * 100;
  if (percentage < 50) return '#52C41A';
  if (percentage < 80) return '#FAAD14';
  return '#F5222D';
});

// 活动热图数据
const activityData = reactive(generateActivityData());

// 生成模拟的活动数据
function generateActivityData() {
  const weeks = 12;
  const days = 7;
  const data = [];

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      // 生成随机活跃度等级 (0-4)
      const level = Math.floor(Math.random() * 5);
      const count = level === 0 ? 0 : level * Math.floor(Math.random() * 5 + 1);
      const date = dayjs().subtract((weeks - w - 1) * 7 + (days - d - 1), 'day').format('YYYY-MM-DD');

      week.push({
        level,
        count,
        date
      });
    }
    data.push(week);
  }

  return data;
}

// 当前激活的标签页
const activeTabKey = ref('pictures');

// 图片过滤和排序
const pictureFilter = ref('all');
const pictureSort = ref('newest');

// 模拟的用户图片数据
const userPictures = ref([
  {
    id: 1,
    title: '城市建筑摄影',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=1',
    views: 234,
    likes: 42,
    isPublic: true,
    uploadTime: '2025-03-20T14:25:00'
  },
  {
    id: 2,
    title: '自然风光',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=2',
    views: 187,
    likes: 35,
    isPublic: true,
    uploadTime: '2025-03-18T10:15:00'
  },
  {
    id: 3,
    title: '设计草图',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=3',
    views: 98,
    likes: 12,
    isPublic: false,
    uploadTime: '2025-03-15T16:30:00'
  },
  {
    id: 4,
    title: '城市夜景',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=4',
    views: 321,
    likes: 67,
    isPublic: true,
    uploadTime: '2025-03-12T20:45:00'
  },
  {
    id: 5,
    title: '产品摄影',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=5',
    views: 156,
    likes: 28,
    isPublic: true,
    uploadTime: '2025-03-10T11:20:00'
  },
  {
    id: 6,
    title: '创意设计草图',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=6',
    views: 113,
    likes: 19,
    isPublic: false,
    uploadTime: '2025-03-08T14:35:00'
  },
  {
    id: 7,
    title: '风景写生',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=7',
    views: 208,
    likes: 45,
    isPublic: true,
    uploadTime: '2025-03-05T09:15:00'
  },
  {
    id: 8,
    title: '家居设计',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=8',
    views: 178,
    likes: 31,
    isPublic: true,
    uploadTime: '2025-03-02T15:40:00'
  },
]);



// 分页设置
const picturesPagination = reactive({
  current: 1,
  pageSize: 8,
  total: 28
});


// 模态框状态
const editProfileModalVisible = ref(false);
const submitLoading = ref(false);

// 编辑个人资料表单
const editProfileForm = reactive({
  username: userInfo.username,
  bio: userInfo.bio,
  website: userInfo.website,
  location: userInfo.location
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 160, message: '个人简介不能超过160个字符', trigger: 'blur' }
  ]
};

// 编辑表单引用
const editProfileFormRef = ref(null);

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 安全设置
const securitySettings = reactive({
  twoFactorAuth: true,
  loginAlert: true,
  activityLog: true
});

// 通知设置
const notificationSettings = reactive({
  newFollower: true,
  newLike: true,
  newComment: true,
  systemNotice: true
});

// 隐私设置
const privacySettings = reactive({
  defaultUploadVisibility: 'public',
  profileVisibility: true,
  searchEngineIndex: true
});

// 根据过滤和排序条件获取过滤后的图片列表
const filteredPictures = computed(() => {
  let result = [...userPictures.value];

  // 应用过滤条件
  if (pictureFilter.value === 'public') {
    result = result.filter(pic => pic.isPublic);
  } else if (pictureFilter.value === 'private') {
    result = result.filter(pic => !pic.isPublic);
  }

  // 应用排序条件
  if (pictureSort.value === 'newest') {
    result.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
  } else if (pictureSort.value === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  } else if (pictureSort.value === 'viewed') {
    result.sort((a, b) => b.views - a.views);
  }

  return result;
});

// 更改密码
function changePassword() {
  if (!passwordForm.currentPassword) {
    message.error('请输入当前密码');
    return;
  }

  if (!passwordForm.newPassword) {
    message.error('请输入新密码');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的新密码不一致');
    return;
  }

  // 模拟API调用
  message.loading('正在更新密码...', 1.5).then(() => {
    message.success('密码已成功更新');

    // 重置表单
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  });
}


// 组件挂载时执行
onMounted(() => {
  // 这里可以调用API获取用户数据
  console.log('个人中心页面已加载');
});

// 格式化日期
function formatDate(dateStr) {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
}

// 格式化存储空间大小
function formatStorage(sizeInGB) {
  return sizeInGB.toFixed(1) + ' GB';
}

// 获取角色名称
function getRoleName(role) {
  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户'
  };
  return roleMap[role] || '未知角色';
}

// 获取角色颜色
function getRoleColor(role) {
  const colorMap = {
    admin: '#6554C0',
    user: '#52C41A',
    vip: '#FAAD14'
  };
  return colorMap[role] || 'default';
}

// 处理编辑个人资料表单提交
function handleEditProfileSubmit() {
  editProfileFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 更新用户信息
          userInfo.username = editProfileForm.username;
          userInfo.bio = editProfileForm.bio;
          userInfo.website = editProfileForm.website;
          userInfo.location = editProfileForm.location;

          submitLoading.value = false;
          editProfileModalVisible.value = false;
          message.success('个人资料已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 打开编辑个人资料弹窗
function openEditProfileModal() {
  // 初始化表单数据
  editProfileForm.username = userInfo.username;
  editProfileForm.bio = userInfo.bio;
  editProfileForm.website = userInfo.website;
  editProfileForm.location = userInfo.location;

  editProfileModalVisible.value = true;
}

// 查看图片详情
function viewPictureDetails(id) {
  router.push(`/picture/${id}`);
}

// 编辑图片
function editPicture(id) {
  router.push(`/edit-image/${id}`);
}

// 删除图片
function deletePicture(id) {
  // 模拟API调用
  message.loading('正在删除...', 1).then(() => {
    userPictures.value = userPictures.value.filter(pic => pic.id !== id);
    message.success('图片已删除');
  });
}

// 图片分页变化处理
function handlePicturesPageChange(page, pageSize) {
  picturesPagination.current = page;
  picturesPagination.pageSize = pageSize;
  // 实际项目中这里应该重新获取数据
}

// 图片每页条数变化处理
function handlePicturesSizeChange(current, size) {
  picturesPagination.current = 1;
  picturesPagination.pageSize = size;
  // 实际项目中这里应该重新获取数据
}

// 更换封面
function handleChangeCover() {
  // 实际项目中应打开文件选择器并上传新封面
  message.info('更换个人主页封面');
}

// 更换头像
function handleChangeAvatar() {
  // 实际项目中应打开文件选择器并上传新头像
  message.info('更换头像');
}

// 打开修改个人信息弹窗
function openEditInfoModal() {
  // 实际项目中应打开编辑个人信息的弹窗
  message.info('编辑个人信息');
}
</script>
<style scoped>
/* 页面总体布局 */
.user-profile-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 头部个人信息区域 */
.profile-header-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 顶部背景封面 */
.profile-cover {
  height: 90px;
  background-image: linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%);
  background-size: cover;
  background-position: center;
  position: relative;
}

/* 修改封面按钮 */
.cover-edit-button {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

/* 个人信息区 */
.profile-info {
  padding: 0 20px 20px;
  display: flex;
  position: relative;
  background-color: white;
}

/* 头像容器 */
.avatar-container {
  margin-top: -30px;
  position: relative;
}

/* 头像样式 */
.avatar-container .ant-avatar {
  width: 60px;
  height: 60px;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 头像编辑按钮 */
.avatar-edit-button {
  position: absolute;
  right: 0;
  bottom: 0;
}

/* 用户信息容器 */
.user-info-container {
  margin-left: 16px;
  padding-top: 10px;
}

/* 用户名称 */
.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

/* 用户简介 */
.user-bio {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  max-width: 80%;
}

/* 用户数据统计 */
.user-stats {
  display: flex;
  margin: 10px 0;
}

/* 统计项 */
.stat-item {
  display: flex;
  align-items: center;
  padding-right: 16px;
  margin-right: 16px;
  position: relative;
}

/* 统计数值 */
.stat-value {
  font-size: 14px;
  font-weight: 500;
  margin-right: 4px;
}

/* 统计标签 */
.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 统计分隔线 */
.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 14px;
  background-color: #eee;
}

/* 用户操作区域 */
.user-actions {
  margin-top: 16px;
}

/* 编辑资料按钮 */
.user-actions .ant-btn-primary {
  background-color: #6554C0;
  border-color: #6554C0;
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

/* 主内容区布局 */
.profile-content {
  display: flex;
  gap: 20px;
}

/* 左侧内容区 */
.profile-content .ant-col-6 {
  width: 280px;
  flex: 0 0 280px;
}

/* 右侧内容区 */
.profile-content .ant-col-18 {
  flex: 1;
  min-width: 0;
}

/* 卡片通用样式 */
.info-card,
.storage-card,
.activity-card,
.tab-card {
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 卡片标题 */
.ant-card-head {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
  min-height: 48px;
}

.ant-card-head-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* 左侧个人信息列表 */
.info-list {
  padding: 8px 0;
}

/* 个人信息项 */
.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 12px;
}

.info-item:last-child {
  border-bottom: none;
}

/* 信息项标签 */
.info-label {
  margin-left: 8px;
  color: #8c8c8c;
  width: 60px;
}

/* 信息项内容 */
.info-value {
  flex: 1;
  text-align: right;
  color: #262626;
}

/* 存储空间卡片内容 */
.storage-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
}

/* 存储进度环 */
.storage-progress {
  margin-bottom: 16px;
}

/* 存储详情 */
.storage-details {
  width: 100%;
  text-align: center;
}

/* 存储文本 */
.storage-text {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

/* 存储数值 */
.storage-highlight {
  font-weight: 600;
  color: #262626;
}

/* 升级按钮 */
.upgrade-button {
  margin-top: 12px;
  background-color: #6554C0;
  border-color: #6554C0;
  font-size: 12px;
  height: 30px;
}

/* 活跃度热图 */
.activity-heatmap {
  display: flex;
  justify-content: center;
  padding: 16px;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-day {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: #ebedf0;
}

/* 热图颜色级别 */
.level-0 { background-color: #ebedf0; }
.level-1 { background-color: #c6e48b; }
.level-2 { background-color: #7bc96f; }
.level-3 { background-color: #239a3b; }
.level-4 { background-color: #196127; }

/* 热图图例 */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
}

.legend-levels {
  display: flex;
  gap: 3px;
  margin: 0 8px;
}

.legend-level {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

/* 标签页样式 */
.tab-card .ant-tabs-nav {
  margin-bottom: 16px;
}

.tab-card .ant-tabs-tab {
  font-size: 14px;
  padding: 12px 16px;
}

.tab-card .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #6554C0;
  font-weight: 500;
}

.tab-card .ant-tabs-ink-bar {
  background-color: #6554C0;
}

/* 过滤栏样式 */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 单选按钮组样式 */
.ant-radio-button-wrapper {
  height: 30px;
  line-height: 28px;
  font-size: 12px;
  padding: 0 12px;
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background: #6554C0;
  border-color: #6554C0;
}

/* 图片网格样式 */
.picture-grid {
  margin-bottom: 24px;
}

/* 图片卡片样式 */
.picture-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  transition: all 0.3s;
  height: 100%;
}

.picture-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 图片容器 */
.picture-wrapper {
  position: relative;
  height: 160px;
  overflow: hidden;
}

/* 图片样式 */
.picture-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片悬停遮罩 */
.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.picture-wrapper:hover .picture-overlay {
  opacity: 1;
}

/* 图片操作按钮 */
.picture-actions {
  display: flex;
  gap: 8px;
}

/* 图片信息区 */
.picture-info {
  padding: 12px;
}

/* 图片标题 */
.picture-title {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图片元数据 */
.picture-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 作者信息 */
.picture-author {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}



/* 账户设置标签页 */
.settings-card {
  border-radius: 8px;
  overflow: hidden;
}

.settings-card .ant-tabs-nav {
  width: 160px;
}

.settings-card .ant-tabs-content-holder {
  border-left: 1px solid #f0f0f0;
  padding-left: 24px;
}

/* 设置区域 */
.settings-section {
  max-width: 600px;
  padding: 0 16px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 安全设置项目 */
.security-item,
.notification-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child,
.notification-item:last-child,
.privacy-item:last-child {
  border-bottom: none;
}

.security-title,
.notification-title,
.privacy-title {
  font-size: 14px;
  margin-bottom: 2px;
}

.security-desc,
.notification-desc,
.privacy-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 垂直标签页样式 */
.settings-card .ant-tabs-tab {
  padding: 12px 16px;
  text-align: left;
}

.settings-card .ant-tabs-tab.ant-tabs-tab-active {
  background-color: #f6f3ff;
}

.settings-card .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #6554C0;
}

/* 密码表单 */
.password-form {
  max-width: 360px;
}

.password-form .ant-form-item-label {
  font-size: 14px;
}

.password-form .ant-input-affix-wrapper {
  height: 36px;
}

.password-form .ant-btn {
  height: 36px;
  background-color: #6554C0;
  border-color: #6554C0;
}

/* 我的空间样式 */
.my-space-tab {
  padding: 0 16px;
}

/* 覆盖Ant Design样式 */
:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #6554C0;
}

:deep(.ant-tabs-ink-bar) {
  background-color: #6554C0;
}

:deep(.ant-btn-primary) {
  background-color: #6554C0;
  border-color: #6554C0;
}

:deep(.ant-btn-primary:hover) {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

:deep(.ant-switch-checked) {
  background-color: #6554C0;
}

:deep(.ant-tag-blue) {
  color: #6554C0;
  background: #f0ebff;
  border-color: #d8ceff;
}

:deep(.ant-tag-purple) {
  color: #722ed1;
  background: #f9f0ff;
  border-color: #efdbff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-content .ant-col-6,
  .profile-content .ant-col-18 {
    width: 100%;
    max-width: 100%;
  }

  .storage-info {
    flex-direction: column;
  }

  .info-value {
    text-align: right;
  }

  .user-stats {
    flex-wrap: wrap;
  }

  .stat-item {
    margin-bottom: 8px;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .settings-card .ant-tabs-nav {
    width: 100%;
  }

  .settings-card .ant-tabs-content-holder {
    border-left: none;
    padding-left: 0;
    padding-top: 16px;
  }
}

/* 页面选项卡样式（账户设置页面） */
.account-settings-container {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.account-sidebar {
  width: 180px;
  border-right: 1px solid #f0f0f0;
}

.settings-content {
  flex: 1;
  padding: 24px;
}

/* 修复特定的我的空间/账户设置页面导航样式 */
.my-space-nav,
.account-settings-nav {
  width: 180px;
  border-right: 1px solid #f0f0f0;
}

.my-space-nav .ant-menu-item,
.account-settings-nav .ant-menu-item {
  height: 40px;
  line-height: 40px;
  margin: 0;
  padding-left: 24px !important;
}

.ant-menu-item-selected {
  background-color: #f6f3ff !important;
  color: #6554C0 !important;
}

.ant-menu-light.ant-menu-root.ant-menu-vertical {
  border-right: none;
}

/* 确保底部保存按钮间距合理 */
.settings-bottom {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 密码表单中的眼睛图标位置修正 */
.ant-input-password-icon {
  color: #999;
}

.ant-input-password-icon:hover {
  color: #6554C0;
}

/* 确保avatar尺寸适合页面 */
.profile-header .ant-avatar {
  border: 2px solid white;
}

/* 特定调整账户设置页面的tab高度 */
.ant-tabs-tab {
  padding: 8px 16px !important;
}

/* 修复一些浏览器兼容性问题 */
* {
  box-sizing: border-box;
}

/* 针对您截图中左侧栏的特定样式 */
.info-item {
  display: flex;
  padding: 8px 0;
  font-size: 12px;
  color: #666;
}

.info-label {
  width: 70px;
}

.info-value {
  margin-left: auto;
  color: #262626;
}

.user-profile-container .anticon {
  color: #6554C0;
  margin-right: 5px;
}

/* 存储空间卡片样式调整 */
.storage-card .ant-progress-text {
  font-size: 12px;
  font-weight: bold;
}

.upgrade-button {
  height: 32px;
  font-size: 13px;
}

.password-change-container {
  padding: 20px;
}

.password-form {
  max-width: 400px;
}

.password-form h3 {
  font-size: 16px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
}

.custom-password-input {
  border-radius: 4px;
}

/* 修复密码输入框眼睛图标颜色 */
:deep(.custom-password-input .ant-input-password-icon) {
  color: #c0c0c0;
}

:deep(.custom-password-input .ant-input-password-icon:hover) {
  color: #6554C0 !important;
}

/* 修复输入框悬停和获取焦点样式 */
:deep(.custom-password-input:hover) {
  border-color: #6554C0 !important;
}

:deep(.custom-password-input:focus),
:deep(.custom-password-input-focused) {
  border-color: #6554C0 !important;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2) !important;
}

.update-password-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.update-password-button:hover,
.update-password-button:focus {
  background-color: #7C68EE !important;
  border-color: #7C68EE !important;
}
/* 进度条颜色 */
.ant-progress-circle .ant-progress-text {
  color: #262626 !important;
}
</style>