<!-- UserCenterPage.vue -->
<template>
  <div class="user-center-page">
    <!-- 顶部信息卡片 -->
    <a-card class="user-profile-card" :bordered="false">
      <div class="user-profile-header">
        <div class="user-avatar-container">
          <a-avatar :size="100" :src="userInfo.avatar"/>
          <div class="edit-avatar">
            <camera-outlined/>
          </div>
        </div>
        <div class="user-info">
          <h1 class="user-name">{{ userInfo.name }}</h1>
          <p class="user-bio">{{ userInfo.userProfile }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.imageCount }}</span>
              <span class="stat-label">图片</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.filterCount }}</span>
              <span class="stat-label">筛选器</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.favoriteCount }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.viewCount }}</span>
              <span class="stat-label">被浏览</span>
            </div>
          </div>
          <div class="user-actions">
            <a-button type="primary" @click="showEditProfileDialog">
              <template #icon>
                <edit-outlined/>
              </template>
              编辑资料
            </a-button>
            <a-button @click="showAccountSettingsDialog">
              <template #icon>
                <setting-outlined/>
              </template>
              账号设置
            </a-button>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 主要内容区 -->
    <div class="content-container">
      <!-- 左侧菜单 -->
      <div class="side-menu">
        <a-menu
            :selectedKeys="[activeTab]"
            mode="inline"
            @select="onMenuSelect"
        >
          <a-menu-item key="my-images">
            <template #icon>
              <picture-outlined/>
            </template>
            我的图片
          </a-menu-item>
          <a-menu-item key="uploads">
            <template #icon>
              <cloud-upload-outlined/>
            </template>
            上传记录
          </a-menu-item>
          <a-menu-item key="teams">
            <template #icon>
              <team-outlined/>
            </template>
            我的团队
          </a-menu-item>
          <a-menu-item key="downloads">
            <template #icon>
              <download-outlined/>
            </template>
            下载记录
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-content">
        <!-- 标题栏 -->
        <div class="content-header">
          <h2 class="section-title">{{ getTabTitle() }}</h2>
          <div class="header-actions">
            <a-input-search
                v-if="showSearch"
                placeholder="搜索..."
                style="width: 250px"
                @search="onSearch"
            >
              <template #enterButton>
                <a-button type="primary">
                  <template #icon>
                    <search-outlined/>
                  </template>
                </a-button>
              </template>
            </a-input-search>
            <a-button type="primary" v-if="activeTab === 'my-images'">
              <template #icon>
                <upload-outlined/>
              </template>
              上传图片
            </a-button>
            <a-dropdown v-if="['my-images', 'favorites', 'uploads'].includes(activeTab)">
              <a-button>
                <template #icon>
                  <sort-ascending-outlined/>
                </template>
                排序
                <down-outlined/>
              </a-button>
              <template #overlay>
                <a-menu @click="handleSortChange">
                  <a-menu-item key="newest">最新上传</a-menu-item>
                  <a-menu-item key="oldest">最早上传</a-menu-item>
                  <a-menu-item key="popular">最受欢迎</a-menu-item>
                  <a-menu-item key="views">最多浏览</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <div class="view-mode-switch">
              <div
                  class="view-mode-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="changeViewMode('grid')"
              >
                <appstore-outlined/>
                <span>网格</span>
              </div>
              <div
                  class="view-mode-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="changeViewMode('list')"
              >
                <unordered-list-outlined/>
                <span>列表</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="tab-content">
          <!-- 网格视图 - 使用新的图片卡片组件 -->
          <div v-if="activeTab === 'my-images' && viewMode === 'grid'" class="gallery-wrapper">
            <div class="image-grid">
              <a-row :gutter="[24, 24]">
                <a-col :xs="24" :sm="12" :md="8" :xl="6" v-for="image in paginatedImages" :key="image.id">
                  <improved-image-card
                      :image="image"
                      @view="viewImage"
                      @download="downloadImage"
                      @like="toggleLike"
                  />
                </a-col>
              </a-row>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-container">
              <a-pagination
                  v-model:current="currentPage"
                  :total="userImages.length"
                  :pageSize="pageSize"
                  show-size-changer
                  :pageSizeOptions="['8', '12', '16', '24']"
                  @change="handlePageChange"
                  @showSizeChange="handleSizeChange"
                  :show-total="(total) => `共 ${total} 张图片`"
              />
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="activeTab === 'my-images' && viewMode === 'list'" class="gallery-wrapper list-view">
            <a-list
                :dataSource="paginatedImages"
                :pagination="{
                  pageSize: pageSize,
                  current: currentPage,
                  total: userImages.length,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['8', '12', '16', '24'],
                  onShowSizeChange: handleSizeChange,
                  showTotal: (total) => `共 ${total} 张图片`
                }"
            >
              <template #renderItem="{ item: image }">
                <a-list-item key={image.id}>
                  <a-list-item-meta>
                    <template #avatar>
                      <div class="list-image-container">
                        <img :src="image.src" :alt="image.title"/>
                        <a-tag v-if="image.isHot" color="red" class="hot-tag">
                          <fire-outlined/>
                          热门
                        </a-tag>
                        <a-tag v-if="image.liked" color="red" class="liked-tag">
                          <heart-filled/>
                          已点赞
                        </a-tag>
                      </div>
                    </template>
                    <template #title>
                      <a @click="viewImage(image)">{{ image.title }}</a>
                    </template>
                    <template #description>
                      <div class="list-image-meta">
                        <div class="list-image-tags">
                          <a-tag v-for="(tag, index) in image.tags" :key="index" :color="getTagColor(index)">
                            {{ tag.name }}
                          </a-tag>
                        </div>
                        <div class="list-image-info">
                          <span><eye-outlined/> {{ image.views }} 次浏览</span>
                          <span><heart-outlined/> {{ image.likes }} 次点赞</span>
                          <span><message-outlined/> {{ image.comments }} 条评论</span>
                          <span><calendar-outlined/> {{ formatDate(image.createTime) }}</span>
                        </div>
                      </div>
                    </template>
                  </a-list-item-meta>
                  <template #actions>
                    <a @click="viewImage(image)">
                      <eye-outlined/>
                      查看</a>
                    <a @click="downloadImage(image)">
                      <download-outlined/>
                      下载</a>
                    <a @click="toggleLike(image)">
                      <template v-if="image.liked">
                        <heart-filled style="color: #f56565"/>
                        已点赞
                      </template>
                      <template v-else>
                        <heart-outlined/>
                        点赞
                      </template>
                    </a>
                    <a @click="editImage(image)">
                      <edit-outlined/>
                      编辑</a>
                    <a @click="confirmDelete(image)">
                      <delete-outlined/>
                      删除</a>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </div>

          <!-- 上传记录 -->
          <div v-else-if="activeTab === 'uploads'" class="uploads-list">
            <a-list
                :dataSource="uploadRecords"
                :pagination="{
                  onChange: page => {
                    console.log(page);
                  },
                  pageSize: 10,
                }"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar shape="square" :size="64" :src="item.src"/>
                    </template>
                    <template #title>
                      <a href="javascript:;">{{ item.title }}</a>
                    </template>
                    <template #description>
                      上传于 {{ formatDate(item.uploadTime) }}
                    </template>
                  </a-list-item-meta>
                  <div class="upload-status">
                    <a-tag
                        :color="item.status === '成功' ? 'success' : item.status === '处理中' ? 'processing' : 'error'">
                      {{ item.status }}
                    </a-tag>
                  </div>
                  <template #actions>
                    <a @click="viewImage(item)">
                      <eye-outlined/>
                      查看</a>
                    <a @click="copyLink(item)">
                      <link-outlined/>
                      复制链接</a>
                    <a @click="deleteUpload(item)">
                      <delete-outlined/>
                      删除</a>
                  </template>
                </a-list-item>
              </template>
            </a-list>
          </div>

          <!-- 我的团队 -->
          <div v-else-if="activeTab === 'teams'" class="teams-content">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" tab="我创建的团队">
                <div class="teams-list">
                  <a-row :gutter="[16, 16]">
                    <a-col :xs="24" :sm="12" :md="8" v-for="team in createdTeams" :key="team.id">
                      <a-card hoverable class="team-card">
                        <div class="team-info">
                          <div class="team-avatar">
                            <a-avatar :size="60" :src="team.avatar">
                              {{ team.name.substring(0, 2) }}
                            </a-avatar>
                          </div>
                          <div class="team-details">
                            <h3 class="team-name">{{ team.name }}</h3>
                            <p class="team-description">{{ team.description }}</p>
                            <div class="team-stats">
                              <div class="team-stat">
                                <user-outlined/>
                                <span>{{ team.memberCount }} 成员</span>
                              </div>
                              <div class="team-stat">
                                <picture-outlined/>
                                <span>{{ team.imageCount }} 图片</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <template #actions>
                          <a @click="enterTeam(team)">
                            <login-outlined/>
                            进入团队</a>
                          <a @click="editTeam(team)">
                            <edit-outlined/>
                            编辑</a>
                          <a @click="manageMembers(team)">
                            <user-outlined/>
                            管理成员</a>
                        </template>
                      </a-card>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="8">
                      <a-card hoverable class="team-create-card" @click="createTeam">
                        <div class="team-create-content">
                          <plus-outlined class="create-icon"/>
                          <p>创建新团队</p>
                        </div>
                      </a-card>
                    </a-col>
                  </a-row>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="我加入的团队">
                <div class="teams-list">
                  <a-row :gutter="[16, 16]">
                    <a-col :xs="24" :sm="12" :md="8" v-for="team in joinedTeams" :key="team.id">
                      <a-card hoverable class="team-card">
                        <div class="team-info">
                          <div class="team-avatar">
                            <a-avatar :size="60" :src="team.avatar">
                              {{ team.name.substring(0, 2) }}
                            </a-avatar>
                          </div>
                          <div class="team-details">
                            <h3 class="team-name">{{ team.name }}</h3>
                            <p class="team-description">{{ team.description }}</p>
                            <div class="team-meta">
                              <div class="team-owner">
                                <a-avatar :size="16" :src="team.owner.avatar"/>
                                <span>{{ team.owner.name }}</span>
                              </div>
                              <div class="team-role">
                                <a-tag :color="getRoleColor(team.role)">{{ team.role }}</a-tag>
                              </div>
                            </div>
                          </div>
                        </div>
                        <template #actions>
                          <a @click="enterTeam(team)">
                            <login-outlined/>
                            进入团队</a>
                          <a @click="leaveTeam(team)">
                            <logout-outlined/>
                            退出团队</a>
                        </template>
                      </a-card>
                    </a-col>
                  </a-row>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>

          <!-- 下载记录 -->
          <div v-else-if="activeTab === 'downloads'" class="downloads-list">
            <a-table
                :columns="downloadColumns"
                :dataSource="downloadRecords"
                :pagination="{ pageSize: 10 }"
                :rowKey="record => record.id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                  <div class="download-image">
                    <img :src="record.src" :alt="record.title"/>
                    <span>{{ record.title }}</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'time'">
                  {{ formatDate(record.downloadTime) }}
                </template>
                <template v-else-if="column.key === 'size'">
                  {{ formatFileSize(record.size) }}
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" @click="redownloadImage(record)">
                      <download-outlined/>
                      重新下载
                    </a-button>
                    <a-button type="link" @click="viewImage(record)">
                      <eye-outlined/>
                      查看原图
                    </a-button>
                    <a-popconfirm
                        title="确定要删除此下载记录吗?"
                        ok-text="是"
                        cancel-text="否"
                        @confirm="deleteDownload(record)"
                    >
                      <a-button type="link">
                        <delete-outlined/>
                        删除记录
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <edit-profile-dialog
      :visible="editProfileVisible"
      :user-info="userInfo"
      @update:visible="editProfileVisible = $event"
      @save="handleUpdateUserInfo"
      @passwordChanged="handlePasswordChanged"
  />

  <account-settings-dialog
      :visible="accountSettingsVisible"
      :user-account="userAccount"
      @update:visible="accountSettingsVisible = $event"
      @save="handleUpdateAccount"
  />
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  SearchOutlined,
  HeartFilled,
  CalendarOutlined,
  EditOutlined,
  SettingOutlined,
  PictureOutlined,
  CloudUploadOutlined,
  HeartOutlined,
  TeamOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  SortAscendingOutlined,
  DownOutlined,
  LinkOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  CameraOutlined,
  MessageOutlined,
  FireOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  StarOutlined
} from '@ant-design/icons-vue';

// 导入自定义图片卡片组件
import ImprovedImageCard from '@/components/user/ImprovedImageCard.vue';
import EditProfileDialog from "@/components/user/EditProfileDialog.vue";
import AccountSettingsDialog from "@/components/user/AccountSettingsDialog.vue";

import {useUserStore} from '@/stores/user';
import router from "@/router";
import UserUpdateRequest = API.UserUpdateRequest;

const userStore = useUserStore();

// 用户信息
const userInfo = computed(() => {
  // 如果用户已登录，返回store中的用户信息
  if (userStore.isLoggedIn && userStore.userInfo) {
    return {
      name: userStore.userInfo.username || userStore.userInfo.account,
      avatar: userStore.userInfo.avatar || defaultAvatar.value,
      userProfile: userStore.userInfo.userProfile || '热爱技术与设计的前端开发者，Vue.js爱好者，喜欢分享高质量的编程资源和UI设计灵感。',
      // 保留其他统计数据
      imageCount: 128,
      filterCount: 12,
      favoriteCount: 256,
      viewCount: 10520
    };
  }

  // 若用户未登录，返回默认值
  return {
    name: '游客',
    avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    userProfile: '您当前未登录，请登录后查看个人资料。',
    imageCount: 0,
    filterCount: 0,
    favoriteCount: 0,
    viewCount: 0
  };
})


// 当前选中的导航项
const activeTab = ref('my-images');

// 视图模式
const viewMode = ref('grid');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(12);

// 对话框可见性状态
const editProfileVisible = ref(false);
const accountSettingsVisible = ref(false);

// 用户图片数据
const userImages = reactive([
  {
    id: '1',
    src: 'https://cdn.pixabay.com/photo/2016/11/23/14/37/coding-1853305_1280.jpg',
    title: 'macbook-workspace',
    category: '工作区',
    tags: [
      {name: 'Mac壁纸', color: ''},
      {name: '高清', color: ''}
    ],
    liked: false,
    views: 1250,
    likes: 520,
    comments: 45,
    createTime: '2023-09-15T08:30:00.000Z',
    author: {
      name: '程序员Leo',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    aspectRatio: '16/9',
    isHot: false
  },
  {
    id: '2',
    src: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    title: '山脉风光摄影',
    category: '风景',
    tags: [
      {name: '高清', color: ''},
      {name: '自然', color: ''}
    ],
    liked: true,
    views: 3840,
    likes: 1520,
    comments: 120,
    createTime: '2023-10-10T14:20:00.000Z',
    author: {
      name: '风景摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_1280.png',
    },
    aspectRatio: '16/9',
    isHot: true
  },
]);


// 添加默认头像计算属性
const defaultAvatar = computed(() => {
  const username = userStore.userInfo?.username || userStore.userInfo?.account || 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
});


// 处理密码修改
const handlePasswordChanged = (passwordData: any) => {
  console.log('密码已修改, 等待重新登录');
};

// 根据分页获取当前页的图片
const paginatedImages = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return userImages.slice(startIndex, endIndex);
});

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 处理每页条数变化
const handleSizeChange = (current, size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
};

// 是否显示搜索框
const showSearch = computed(() => {
  return ['my-images', 'favorites', 'uploads', 'history'].includes(activeTab.value);
});

// 获取当前标签页的标题
const getTabTitle = () => {
  const titles = {
    'my-images': '我的图片',
    'uploads': '上传记录',
    'teams': '我的团队',
    'downloads': '下载记录',
  };
  return titles[activeTab.value] || '我的图片';
};

// 下载记录列
const downloadColumns = [
  {
    title: '图片',
    key: 'image',
    width: '30%',
  },
  {
    title: '下载时间',
    key: 'time',
    width: '20%',
  },
  {
    title: '文件大小',
    key: 'size',
    width: '15%',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '15%',
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
    align: 'center',
  },
];

// 生成一些模拟的上传记录数据
const uploadRecords = reactive([
  {
    id: '1',
    src: 'https://cdn.pixabay.com/photo/2016/11/23/14/37/coding-1853305_1280.jpg',
    title: 'macbook-workspace.jpg',
    uploadTime: '2023-11-20T10:15:30.000Z',
    status: '成功',
    size: 3452000,
  },
  // 省略其他上传记录...
]);

// 生成一些模拟的下载记录数据
const downloadRecords = reactive([
  {
    id: '1',
    src: 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg',
    title: '日常生活摄影.jpg',
    downloadTime: '2023-11-21T11:30:45.000Z',
    size: 3245000,
    status: '完成',
  },
  // 省略其他下载记录...
]);

// 团队数据
const createdTeams = reactive([
  {
    id: '1',
    name: '设计工作室',
    description: '专注UI/UX设计与视觉创意的团队',
    avatar: 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_1280.png',
    memberCount: 8,
    imageCount: 156,
    createdAt: '2023-05-12T14:30:00.000Z',
  },
  // 省略其他团队数据...
]);

const joinedTeams = reactive([
  {
    id: '3',
    name: '摄影爱好者',
    description: '分享高质量摄影作品与技术交流',
    avatar: 'https://cdn.pixabay.com/photo/2016/04/01/10/04/camera-1299443_1280.png',
    owner: {
      name: '摄影大师',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    memberCount: 32,
    imageCount: 520,
    role: '编辑',
    joinedAt: '2023-08-15T16:45:00.000Z',
  },
  // 省略其他团队数据...
]);

// 菜单选择处理
const onMenuSelect = (e) => {
  activeTab.value = e.key;
};

// 搜索处理
const onSearch = (value) => {
  message.info(`搜索: ${value}`);
};

// 排序变更处理
const handleSortChange = (e) => {
  message.info(`排序方式已更改为: ${e.key}`);
};

// 改变视图模式
const changeViewMode = (mode) => {
  viewMode.value = mode;
  localStorage.setItem('preferredViewMode', mode);
};

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['#6554C0', '#36CFC9', '#FF7A45', '#597EF7', '#73D13D'];
  return colors[index % colors.length];
};

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

// 获取角色颜色
const getRoleColor = (role) => {
  const roleColors = {
    '管理员': 'red',
    '编辑': 'blue',
    '成员': 'green',
  };
  return roleColors[role] || 'default';
};

// 图片操作相关函数
const viewImage = (image) => {
  message.info(`查看图片: ${image.title}`);
};

const downloadImage = (image) => {
  message.success(`开始下载: ${image.title}`);
};

const toggleLike = (image) => {
  image.liked = !image.liked;
  if (image.liked) {
    image.likes = (image.likes || 0) + 1;
  } else if (image.likes > 0) {
    image.likes -= 1;
  }
  message.success(image.liked ? '已添加到喜欢' : '已取消喜欢');
};


// 用户账号信息
const userAccount = reactive({
  email: 'programmer.leo@example.com',
  phone: '13812345678',
  phonePrefix: '+86',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  securitySettings: {
    twoFactorEnabled: false,
    loginNotification: true
  },
  privacySettings: {
    profileVisibility: 'public',
    searchable: true,
    showActivity: true
  },
  notificationSettings: {
    likes: {email: false, site: true, push: true},
    comments: {email: true, site: true, push: true},
    follows: {email: true, site: true, push: false},
    announcements: {email: true, site: true, push: false}
  }
});

// 打开编辑资料对话框
const showEditProfileDialog = () => {
  // 确保userInfo中的信息是最新的
  if (userStore.isLoggedIn) {
    // 可以在这里触发刷新用户信息的操作
    userStore.validateToken();
  }

  editProfileVisible.value = true;
};

// 打开账号设置对话框
const showAccountSettingsDialog = () => {
  accountSettingsVisible.value = true;
};

// 处理用户信息更新
const handleUpdateUserInfo = (updatedInfo:UserUpdateRequest) => {
  // 更新用户信息
  userStore.updateUserInfo(updatedInfo);

  // 额外刷新一次用户信息，确保数据同步
  setTimeout(() => {
    userStore.validateToken();
  }, 500);
};

// 处理账号信息更新
const handleUpdateAccount = (updatedAccount :UserUpdateRequest) => {
  // 更新账号信息
  Object.assign(userAccount, updatedAccount);
  message.success('账号设置已更新');
};

const editImage = (image) => {
  message.info(`编辑图片: ${image.title}`);
};

const confirmDelete = (image) => {
  message.success(`删除图片: ${image.title}`);
};

// 下载记录相关函数
const redownloadImage = (record) => {
  message.success(`重新下载: ${record.title}`);
};

const deleteDownload = (record) => {
  message.success(`下载记录已删除: ${record.title}`);
};

// 上传记录相关函数
const copyLink = (record) => {
  message.success(`链接已复制: ${record.title}`);
};

const deleteUpload = (record) => {
  message.success(`上传记录已删除: ${record.title}`);
};

// 团队相关函数
const enterTeam = (team) => {
  message.info(`进入团队: ${team.name}`);
};

const editTeam = (team) => {
  message.info(`编辑团队: ${team.name}`);
};

const manageMembers = (team) => {
  message.info(`管理成员: ${team.name}`);
};

const createTeam = () => {
  message.info('创建新团队');
};

const leaveTeam = (team) => {
  message.warning(`确定要退出团队 "${team.name}" 吗?`);
};

// 个人资料相关函数
const handleEditProfile = () => {
  message.info('编辑个人资料');
};

const handleSettings = () => {
  message.info('打开账号设置');
};

// 添加更多图片用于分页展示
const addMoreImages = () => {
  // 模拟更多示例图片数据
  for (let i = 15; i <= 30; i++) {
    userImages.push({
      id: i.toString(),
      src: `https://picsum.photos/id/${i + 20}/400/300`,
      title: `样例图片 ${i}`,
      category: i % 3 === 0 ? '风景' : i % 3 === 1 ? '人物' : '创意',
      tags: [
        {name: i % 2 === 0 ? '精选' : '推荐', color: ''},
        {name: i % 4 === 0 ? '热门' : '新作', color: ''}
      ],
      liked: i % 3 === 0,
      views: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 2000) + 100,
      comments: Math.floor(Math.random() * 200) + 10,
      createTime: dayjs().subtract(i, 'day').toISOString(),
      author: {
        name: userInfo.name,
        avatar: userInfo.avatar
      },
      aspectRatio: '16/9',
      isHot: i % 5 === 0
    });
  }
};

// 组件挂载时的初始化
onMounted(() => {
  // 如果用户未登录，显示提示并跳转
  if (!userStore.isLoggedIn) {
    message.warning('请先登录后查看个人资料');
    router.push('/');

    // 显示登录框
    setTimeout(() => {
      userStore.openLoginModal();
    }, 500);

    return;
  }

  // 添加更多图片用于分页展示
  addMoreImages();

  // 从本地存储获取之前的视图模式偏好
  const savedViewMode = localStorage.getItem('preferredViewMode');
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }
});
</script>

<style scoped>
/* 基础样式 */
.user-center-page {
  padding: 24px;
  background-color: var(--bg-color, #f9fafb);
  min-height: calc(100vh - 64px);
}

/* 用户资料卡片 */
.user-profile-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-profile-header {
  display: flex;
  gap: 24px;
}

.user-avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.edit-avatar {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color, #6554C0);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.edit-avatar:hover {
  transform: scale(1.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0 0 4px 0;
}

.user-bio {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 16px 0;
}

.user-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.user-actions {
  display: flex;
  gap: 12px;
}

/* 内容区布局 */
.content-container {
  display: flex;
  gap: 24px;
}

.side-menu {
  width: 220px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px 0;
  height: fit-content;
}

.main-content {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  min-height: 500px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 图片网格 */
.image-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
}

/* 视图切换开关 */
.view-mode-switch {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  height: 32px;
}

.view-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  cursor: pointer;
  font-size: 14px;
  gap: 6px;
  transition: all 0.2s ease;
}

.view-mode-btn:first-child {
  border-right: 1px solid #e5e7eb;
}

.view-mode-btn.active {
  background-color: rgba(101, 84, 192, 0.1);
  color: #6554C0;
}

.view-mode-btn:hover:not(.active) {
  background-color: #f5f5f5;
}

/* 上传记录 */
.uploads-list {
  padding: 0 16px;
}

.upload-status {
  margin-right: 16px;
}

/* 团队卡片 */
.teams-list {
  margin-top: 16px;
}

.team-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.team-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.team-info {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.team-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-details {
  flex: 1;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.team-description {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 8px 0;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.team-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.team-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.team-owner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-role {
  margin-left: auto;
}

.team-create-card {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #f9fafb;
}

.team-create-card:hover {
  border-color: #6554C0;
  background-color: rgba(101, 84, 192, 0.05);
}

.team-create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.create-icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: #6554C0;
}

/* 下载记录 */
.download-image {
  display: flex;
  align-items: center;
  gap: 12px;
}

.download-image img {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

/* 列表视图 */
.list-view {
  margin-bottom: 24px;
}

.list-image-container {
  position: relative;
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.list-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-image-container .hot-tag,
.list-image-container .liked-tag {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 3px;
}

.list-image-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list-image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.list-image-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.list-image-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .content-container {
    flex-direction: column;
  }

  .side-menu {
    width: 100%;
    margin-bottom: 16px;
  }

  .user-profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }

  .user-actions {
    justify-content: center;
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .user-center-page {
    padding: 16px;
  }

  .team-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .team-stats {
    justify-content: center;
  }

  .team-meta {
    flex-direction: column;
    gap: 8px;
  }

  .team-owner {
    margin-bottom: 8px;
  }

  .team-role {
    margin-left: 0;
  }
}

/* 组件样式覆盖 */
:deep(.ant-menu-inline) {
  border-right: none;
}

:deep(.ant-menu-item) {
  border-radius: 0 24px 24px 0;
  margin: 4px 0;
}

:deep(.ant-menu-item-selected) {
  background-color: rgba(101, 84, 192, 0.1);
  color: #6554C0;
}

:deep(.ant-menu-item-selected::after) {
  border-right: 3px solid #6554C0;
}

:deep(.ant-pagination-item-active) {
  border-color: #6554C0;
}

:deep(.ant-pagination-item-active a) {
  color: #6554C0;
}

:deep(.ant-btn-primary) {
  background-color: #6554C0;
  border-color: #6554C0;
}

:deep(.ant-btn-primary:hover) {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #6554C0;
}

:deep(.ant-tabs-ink-bar) {
  background-color: #6554C0;
}
</style>