<template>
  <div class="comment-management-container">

    <DashboardHeader
        title="评论管理"
        description="管理系统内用户评论，支持审核、回复、分类以及举报处理"
        parent-module="内容管理"
        :module-icon="CommentOutlined"
        :metrics="headerMetrics"
    />

    <StatCards :cards="statCards"/>


    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 评论内容 -->
            <a-form-item label="评论内容" name="content">
              <a-input v-model:value="searchForm.content" placeholder="请输入评论内容关键词" allowClear/>
            </a-form-item>

            <!-- 评论类型 -->
            <a-form-item label="评论类型" name="type">
              <a-select
                  v-model:value="searchForm.type"
                  placeholder="请选择评论类型"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="article">文章评论</a-select-option>
                <a-select-option value="product">产品评论</a-select-option>
                <a-select-option value="service">服务评论</a-select-option>
                <a-select-option value="community">社区评论</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 评论状态 -->
            <a-form-item label="评论状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="approved">已通过</a-select-option>
                <a-select-option value="pending">待审核</a-select-option>
                <a-select-option value="rejected">已拒绝</a-select-option>
                <a-select-option value="reported">被举报</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 评论时间 -->
            <a-form-item label="评论时间" name="commentTime">
              <a-range-picker
                  v-model:value="searchForm.commentTime"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY-MM-DD"
                  style="width: 240px"
              />
            </a-form-item>

            <!-- 操作按钮 -->
            <div class="search-buttons">
              <a-button type="primary" html-type="submit" class="search-button">
                <search-outlined/>
                查询
              </a-button>
              <a-button @click="resetSearchForm" class="reset-button">
                <reload-outlined/>
                重置
              </a-button>
            </div>
          </div>
        </a-form>
      </div>
    </a-card>


    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <div class="operation-left">
        <a-space>
          <a-button type="primary" @click="handleBatchApprove">
            <check-outlined/>
            批量通过
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchReject">
            <stop-outlined/>
            批量拒绝
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
          <a-radio-button value="card">
            <appstore-outlined/>
            卡片视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="commentData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 评论用户列 -->
          <template v-if="column.dataIndex === 'user'">
            <div class="user-info">
              <a-avatar :src="record.userAvatar" :size="32"/>
              <span class="user-name">{{ record.userName }}</span>
            </div>
          </template>

          <!-- 评论内容列 -->
          <template v-if="column.dataIndex === 'content'">
            <div class="comment-content-cell">
              <div class="comment-text">{{ record.content }}</div>
              <div class="comment-target">
                <a-tag color="blue">{{ getCommentTypeName(record.type) }}</a-tag>
                <span class="target-name">{{ record.targetTitle }}</span>
              </div>
            </div>
          </template>

          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="getStatusType(record.status)"
                :text="getStatusText(record.status)"
            />
          </template>

          <!-- 创建时间 -->
          <template v-if="column.dataIndex === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewComment(record)">
                <eye-outlined/>
                查看
              </a-button>
              <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  @click="approveComment(record)"
                  style="color: #52C41A"
              >
                <check-outlined/>
                通过
              </a-button>
              <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  @click="rejectComment(record)"
                  style="color: #ff4d4f"
              >
                <stop-outlined/>
                拒绝
              </a-button>
              <a-button
                  type="link"
                  size="small"
                  @click="replyComment(record)"
              >
                <message-outlined/>
                回复
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="highlightComment(record)">
                      <star-outlined/>
                      设为精选
                    </a-menu-item>
                    <a-menu-item key="2" @click="manageReport(record)" v-if="record.status === 'reported'">
                      <flag-outlined/>
                      处理举报
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item key="3" danger @click="showDeleteConfirm(record)">
                      <delete-outlined/>
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  <more-outlined/>
                  更多
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>


    <!-- 卡片视图 -->
    <div v-else-if="viewMode === 'card'" class="comment-cards-container">
      <a-spin :spinning="loading">
        <div class="grid-header">
          <div class="grid-selection" v-if="hasSelected">
            <a-checkbox
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="onSelectAllChange"
            />
            <span class="selected-count">已选择 {{ selectedRowKeys.length }} 项</span>
          </div>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" v-for="comment in commentData" :key="comment.id">
            <div
                class="comment-card"
                :class="{ 'comment-card-selected': selectedRowKeys.includes(comment.id) }"
                @click="toggleCommentSelection(comment.id)"
            >
              <div class="comment-card-header">
                <a-checkbox :checked="selectedRowKeys.includes(comment.id)" @click.stop/>
                <a-badge :status="getStatusType(comment.status)" :text="getStatusText(comment.status)"/>
              </div>
              <div class="comment-card-body">
                <div class="comment-user-info">
                  <a-avatar :src="comment.userAvatar" :size="40"/>
                  <div class="user-details">
                    <div class="user-name">{{ comment.userName }}</div>
                    <div class="comment-time">{{ formatDateTime(comment.createTime) }}</div>
                  </div>
                </div>
                <div class="comment-target-info">
                  <a-tag color="blue">{{ getCommentTypeName(comment.type) }}</a-tag>
                  <span class="target-title">{{ comment.targetTitle }}</span>
                </div>
                <div class="comment-text-content">
                  {{ comment.content }}
                </div>
                <div class="comment-metrics">
                  <span class="metric-item">
                    <like-outlined/> {{ comment.likes }}
                  </span>
                  <span class="metric-item">
                    <dislike-outlined/> {{ comment.dislikes }}
                  </span>
                  <span class="metric-item">
                    <message-outlined/> {{ comment.replies }}
                  </span>
                </div>
              </div>
              <div class="comment-card-actions">
                <a-button type="link" size="small" @click.stop="viewComment(comment)">
                  <eye-outlined/>
                  查看
                </a-button>
                <a-button
                    v-if="comment.status === 'pending'"
                    type="link"
                    size="small"
                    @click.stop="approveComment(comment)"
                    style="color: #52C41A"
                >
                  <check-outlined/>
                  通过
                </a-button>
                <a-button
                    v-if="comment.status === 'pending'"
                    type="link"
                    size="small"
                    @click.stop="rejectComment(comment)"
                    style="color: #ff4d4f"
                >
                  <stop-outlined/>
                  拒绝
                </a-button>
                <a-button
                    type="link"
                    size="small"
                    @click.stop="replyComment(comment)"
                >
                  <message-outlined/>
                  回复
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="1" @click.stop="highlightComment(comment)">
                        <star-outlined/>
                        设为精选
                      </a-menu-item>
                      <a-menu-item key="2" @click.stop="manageReport(comment)" v-if="comment.status === 'reported'">
                        <flag-outlined/>
                        处理举报
                      </a-menu-item>
                      <a-menu-divider/>
                      <a-menu-item key="3" danger @click.stop="showDeleteConfirm(comment)">
                        <delete-outlined/>
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="link" size="small" @click.stop>
                    <more-outlined/>
                    更多
                  </a-button>
                </a-dropdown>
              </div>
            </div>
          </a-col>
        </a-row>

        <!-- 卡片视图分页 -->
        <div class="grid-pagination-bottom">
          <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '36', '48']"
              :showQuickJumper="true"
              :showTotal="(total) => `共 ${total} 项`"
              @change="onPageChange"
              @showSizeChange="onShowSizeChange"
          />
        </div>
      </a-spin>
    </div>


    <!-- 评论详情弹窗 -->
    <a-modal
        v-model:visible="commentDetailVisible"
        title="评论详情"
        width="700px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-comment-modal"
    >
      <template v-if="selectedComment">
        <div class="comment-detail-header">
          <div class="user-profile">
            <a-avatar :src="selectedComment.userAvatar" :size="64"/>
            <div class="user-info">
              <div class="user-name">{{ selectedComment.userName }}</div>
              <div class="user-meta">
                <span>评论次数: {{ selectedComment.userCommentCount || 32 }}</span>
                <a-divider type="vertical"/>
                <span>注册时间: {{ formatDate(selectedComment.userRegisterTime || new Date(2024, 5, 15)) }}</span>
              </div>
            </div>
          </div>
          <div class="comment-status">
            <a-badge :status="getStatusType(selectedComment.status)" :text="getStatusText(selectedComment.status)"/>
          </div>
        </div>

        <a-divider/>

        <div class="comment-detail-content">
          <div class="comment-target-section">
            <div class="section-title">评论对象</div>
            <div class="target-info">
              <a-tag color="blue">{{ getCommentTypeName(selectedComment.type) }}</a-tag>
              <div class="target-title">{{ selectedComment.targetTitle }}</div>
              <div class="target-link">
                <link-outlined/>
                <a href="#">查看原内容</a>
              </div>
            </div>
          </div>

          <div class="comment-content-section">
            <div class="section-title">评论内容</div>
            <div class="content-box">
              {{ selectedComment.content }}
            </div>
            <div class="comment-meta">
              <div class="meta-item">
                <clock-circle-outlined/>
                评论时间: {{ formatDateTime(selectedComment.createTime) }}
              </div>
              <div class="meta-item">
                <like-outlined/>
                点赞数: {{ selectedComment.likes }}
              </div>
              <div class="meta-item">
                <message-outlined/>
                回复数: {{ selectedComment.replies }}
              </div>
            </div>
          </div>

          <div v-if="selectedComment.replies > 0" class="comment-replies-section">
            <div class="section-title">回复列表</div>
            <div class="replies-list">
              <!-- 这里可以放回复列表 -->
              <div class="reply-item" v-for="(reply, index) in commentReplies" :key="index">
                <div class="reply-user">
                  <a-avatar :src="reply.userAvatar" :size="32"/>
                  <span class="reply-username">{{ reply.userName }}</span>
                  <span class="reply-time">{{ formatDateTime(reply.createTime) }}</span>
                </div>
                <div class="reply-content">
                  {{ reply.content }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedComment.status === 'reported'" class="comment-report-section">
            <div class="section-title danger-title">举报信息</div>
            <div class="report-list">
              <div class="report-item" v-for="(report, index) in commentReports" :key="index">
                <div class="report-user">
                  <warning-outlined style="color: #ff4d4f; margin-right: 8px;"/>
                  <span class="reporter">{{ report.reporterName }}</span>
                  <span class="report-time">{{ formatDateTime(report.reportTime) }}</span>
                </div>
                <div class="report-reason">
                  <a-tag color="#ff4d4f">{{ getReportReasonText(report.reason) }}</a-tag>
                  {{ report.description || '无详细说明' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="comment-detail-actions">
          <div class="action-group">
            <div class="action-title">审核操作</div>
            <div class="action-buttons">
              <a-button
                  v-if="selectedComment.status === 'pending' || selectedComment.status === 'reported'"
                  type="primary"
                  @click="approveComment(selectedComment)"
              >
                <template #icon>
                  <check-outlined/>
                </template>
                通过
              </a-button>
              <a-button
                  v-if="selectedComment.status === 'pending' || selectedComment.status === 'reported'"
                  danger
                  @click="rejectComment(selectedComment)"
              >
                <template #icon>
                  <stop-outlined/>
                </template>
                拒绝
              </a-button>
              <a-button
                  danger
                  @click="showDeleteConfirm(selectedComment)"
              >
                <template #icon>
                  <delete-outlined/>
                </template>
                删除
              </a-button>
            </div>
          </div>

          <a-divider/>

          <div class="reply-form">
            <div class="reply-title">回复评论</div>
            <a-form layout="vertical">
              <a-form-item>
                <a-textarea
                    v-model:value="replyContent"
                    placeholder="请输入回复内容"
                    :rows="3"
                    :maxLength="200"
                    showCount
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="submitReply">
                  <template #icon>
                    <send-outlined/>
                  </template>
                  发送回复
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>


<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted
} from 'vue';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CommentOutlined,
  CheckOutlined,
  StopOutlined,
  MoreOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
  FlagOutlined,
  StarOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  SendOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined,
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';
import DashboardHeader from "@/components/common/DashboardHeader.vue";
import StatCards from "@/components/common/StatCards.vue";

// 评论列表数据
const commentData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 搜索表单
const searchForm = reactive({
  content: '',
  type: undefined,
  status: undefined,
  commentTime: [],
});

// 选择状态
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);
const isAllSelected = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === commentData.value.length);
const isIndeterminate = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < commentData.value.length);

// 视图模式
const viewMode = ref('list');

// 评论详情相关
const commentDetailVisible = ref(false);
const selectedComment = ref(null);
const replyContent = ref('');
const commentReplies = ref([]);
const commentReports = ref([]);

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 60,
    align: 'center',
  },
  {
    title: '用户',
    dataIndex: 'user',
    width: 150,
  },
  {
    title: '评论内容',
    dataIndex: 'content',
    ellipsis: true,
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
  },
  {
    title: '点赞',
    dataIndex: 'likes',
    width: 80,
    align: 'center',
    sorter: true,
  },
  {
    title: '回复数',
    dataIndex: 'replies',
    width: 80,
    align: 'center',
    sorter: true,
  },
  {
    title: '评论时间',
    dataIndex: 'createTime',
    width: 170,
    align: 'center',
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 260,
    align: 'center',
    fixed: 'right',
  },
];

// 为头部指标准备数据
const headerMetrics = computed(() => [
  {
    icon: CalendarOutlined,
    label: '今日评论',
    value: 36
  },
  {
    icon: TeamOutlined,
    label: '待审核',
    value: 12
  },
  {
    icon: WarningOutlined,
    label: '举报量',
    value: 8
  }
]);

// 为统计卡片准备数据
const statCards = computed(() => [
  {
    title: '评论总数',
    value: '3,842',
    change: 15.3,
    color: 'purple',
    icon: CommentOutlined
  },
  {
    title: '本月新增',
    value: '528',
    change: 9.6,
    color: 'blue',
    icon: LikeOutlined
  },
  {
    title: '已审核',
    value: '3,614',
    change: 12.8,
    color: 'green',
    icon: CheckCircleOutlined
  },
  {
    title: '举报评论',
    value: '86',
    change: -4.7,
    color: 'gold',
    icon: FlagOutlined
  }
]);


// 获取评论数据
function fetchCommentData() {
  loading.value = true;

  // 模拟 API 请求
  setTimeout(() => {
    const data = [
      {
        id: 1,
        userName: '张小明',
        userAvatar: 'https://via.placeholder.com/40',
        content: '这篇文章写得真不错，解决了我长期困扰的问题，感谢作者分享！',
        type: 'article',
        targetTitle: '如何高效管理时间：10个实用技巧',
        status: 'approved',
        createTime: new Date(2025, 2, 15, 10, 30).getTime(),
        likes: 24,
        dislikes: 2,
        replies: 3
      },
      {
        id: 2,
        userName: '李华',
        userAvatar: 'https://via.placeholder.com/40',
        content: '产品质量很好，但是发货速度有点慢，希望可以改进一下物流环节。',
        type: 'product',
        targetTitle: '智能家居控制套装 Pro',
        status: 'approved',
        createTime: new Date(2025, 2, 14, 16, 45).getTime(),
        likes: 18,
        dislikes: 3,
        replies: 1
      },
      {
        id: 3,
        userName: '王强',
        userAvatar: 'https://via.placeholder.com/40',
        content: '这个服务太棒了，客服人员非常专业，解决问题迅速高效！',
        type: 'service',
        targetTitle: '7x24小时技术支持服务',
        status: 'approved',
        createTime: new Date(2025, 2, 14, 9, 20).getTime(),
        likes: 36,
        dislikes: 0,
        replies: 2
      },
      {
        id: 4,
        userName: '刘芳',
        userAvatar: 'https://via.placeholder.com/40',
        content: '这个功能还不完善，希望能增加更多自定义选项，现在的设置太有限了。',
        type: 'product',
        targetTitle: '数据分析工具 v2.5',
        status: 'pending',
        createTime: new Date(2025, 2, 13, 14, 10).getTime(),
        likes: 5,
        dislikes: 1,
        replies: 0
      },
      {
        id: 5,
        userName: '陈明',
        userAvatar: 'https://via.placeholder.com/40',
        content: '非常感谢社区的帮助，我的问题已经解决了，大家都很热心！',
        type: 'community',
        targetTitle: '技术讨论区 - API集成问题',
        status: 'approved',
        createTime: new Date(2025, 2, 12, 11, 25).getTime(),
        likes: 42,
        dislikes: 0,
        replies: 7
      },
      {
        id: 6,
        userName: '赵丽',
        userAvatar: 'https://via.placeholder.com/40',
        content: '这篇文章有一些明显的错误，特别是关于框架兼容性的说明部分，建议作者核实后更新。',
        type: 'article',
        targetTitle: '前端框架比较：2025年最新指南',
        status: 'reported',
        createTime: new Date(2025, 2, 11, 15, 30).getTime(),
        likes: 8,
        dislikes: 12,
        replies: 4
      },
      {
        id: 7,
        userName: '孙建',
        userAvatar: 'https://via.placeholder.com/40',
        content: '**该评论内容违反社区规范，已被举报**',
        type: 'community',
        targetTitle: '产品更新讨论',
        status: 'reported',
        createTime: new Date(2025, 2, 10, 19, 15).getTime(),
        likes: 3,
        dislikes: 28,
        replies: 2
      },
      {
        id: 8,
        userName: '周婷',
        userAvatar: 'https://via.placeholder.com/40',
        content: '文档非常清晰，按照步骤操作成功完成了部署，感谢提供这么详细的指南！',
        type: 'article',
        targetTitle: '云服务部署完全指南',
        status: 'approved',
        createTime: new Date(2025, 2, 9, 10, 45).getTime(),
        likes: 56,
        dislikes: 1,
        replies: 0
      },
      {
        id: 9,
        userName: '林小云',
        userAvatar: 'https://via.placeholder.com/40',
        content: '请问这个产品支持跨平台使用吗？我需要在不同的设备上同步数据。',
        type: 'product',
        targetTitle: '便携式数据存储设备 X1',
        status: 'pending',
        createTime: new Date(2025, 2, 8, 16, 20).getTime(),
        likes: 2,
        dislikes: 0,
        replies: 1
      },
      {
        id: 10,
        userName: '黄杰',
        userAvatar: 'https://via.placeholder.com/40',
        content: '参加了昨天的线上讲座，内容非常有深度，期待下一次活动！',
        type: 'service',
        targetTitle: '数字化转型专题讲座',
        status: 'approved',
        createTime: new Date(2025, 2, 7, 12, 10).getTime(),
        likes: 31,
        dislikes: 3,
        replies: 5
      }
    ];

    commentData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 600);
}

// 模拟评论回复数据
function fetchCommentReplies(commentId) {
  // 模拟 API 请求获取回复数据
  const replies = [
    {
      id: 101,
      userName: '系统管理员',
      userAvatar: 'https://via.placeholder.com/40',
      content: '感谢您的反馈，我们会持续改进产品和服务！',
      createTime: new Date(2025, 2, 15, 11, 30).getTime(),
    },
    {
      id: 102,
      userName: '技术支持',
      userAvatar: 'https://via.placeholder.com/40',
      content: '您好，关于您提到的问题，我们已经记录并转交给相关团队处理。',
      createTime: new Date(2025, 2, 15, 14, 25).getTime(),
    },
    {
      id: 103,
      userName: '产品经理',
      userAvatar: 'https://via.placeholder.com/40',
      content: '非常感谢您的建议，这对我们产品的改进非常有价值！',
      createTime: new Date(2025, 2, 16, 9, 15).getTime(),
    }
  ];

  return replies;
}

// 模拟举报数据
function fetchCommentReports(commentId) {
  // 模拟 API 请求获取举报数据
  const reports = [
    {
      id: 201,
      reporterName: '匿名用户',
      reportTime: new Date(2025, 2, 11, 16, 30).getTime(),
      reason: 'inappropriate',
      description: '评论内容包含不适当的言论'
    },
    {
      id: 202,
      reporterName: '系统监测',
      reportTime: new Date(2025, 2, 11, 16, 35).getTime(),
      reason: 'spam',
      description: '系统检测到可能的垃圾内容'
    }
  ];

  return reports;
}

// 获取评论类型名称
function getCommentTypeName(type) {
  const typeMap = {
    'article': '文章评论',
    'product': '产品评论',
    'service': '服务评论',
    'community': '社区讨论'
  };
  return typeMap[type] || '未知类型';
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    'approved': 'success',
    'pending': 'warning',
    'rejected': 'error',
    'reported': 'error'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'approved': '已通过',
    'pending': '待审核',
    'rejected': '已拒绝',
    'reported': '被举报'
  };
  return statusMap[status] || '未知状态';
}

// 获取举报原因文本
function getReportReasonText(reason) {
  const reasonMap = {
    'inappropriate': '不当内容',
    'spam': '垃圾信息',
    'offensive': '冒犯性言论',
    'illegal': '违法内容',
    'other': '其他原因'
  };
  return reasonMap[reason] || '未知原因';
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 格式化日期
function formatDate(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD');
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索逻辑
  setTimeout(() => {
    // 实际应用中应该调用API进行搜索
    const filteredData = commentData.value.filter(comment => {
      let match = true;

      if (searchForm.content && !comment.content.includes(searchForm.content)) {
        match = false;
      }

      if (searchForm.type && comment.type !== searchForm.type) {
        match = false;
      }

      if (searchForm.status && comment.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.commentTime && searchForm.commentTime.length === 2) {
        const startTime = searchForm.commentTime[0].valueOf();
        const endTime = searchForm.commentTime[1].valueOf();
        if (comment.createTime < startTime || comment.createTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    commentData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.content = '';
  searchForm.type = undefined;
  searchForm.status = undefined;
  searchForm.commentTime = [];

  // 重新获取所有数据
  fetchCommentData();

  message.success('搜索条件已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchCommentData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 全选/取消全选
function onSelectAllChange(e) {
  if (e.target.checked) {
    selectedRowKeys.value = commentData.value.map(item => item.id);
  } else {
    selectedRowKeys.value = [];
  }
}

// 切换评论选择
function toggleCommentSelection(id) {
  const index = selectedRowKeys.value.indexOf(id);
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1);
  } else {
    selectedRowKeys.value.push(id);
  }
}

// 表格变化处理
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    commentData.value = [...commentData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }
}

// 页面变化
function onPageChange(page, pageSize) {
  pagination.current = page;
  pagination.pageSize = pageSize;
}

// 每页条数变化
function onShowSizeChange(current, size) {
  pagination.pageSize = size;
  pagination.current = 1;
}

// 查看评论详情
function viewComment(record) {
  selectedComment.value = record;
  commentReplies.value = fetchCommentReplies(record.id);

  if (record.status === 'reported') {
    commentReports.value = fetchCommentReports(record.id);
  } else {
    commentReports.value = [];
  }

  commentDetailVisible.value = true;
}

// 批量通过评论
function handleBatchApprove() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要通过的评论');
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    commentData.value = commentData.value.map(comment => {
      if (selectedRowKeys.value.includes(comment.id) && (comment.status === 'pending' || comment.status === 'reported')) {
        return {...comment, status: 'approved'};
      }
      return comment;
    });

    loading.value = false;
    message.success(`已通过 ${selectedRowKeys.value.length} 条评论`);
    selectedRowKeys.value = [];
  }, 500);
}

// 批量拒绝评论
function handleBatchReject() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要拒绝的评论');
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    commentData.value = commentData.value.map(comment => {
      if (selectedRowKeys.value.includes(comment.id) && (comment.status === 'pending' || comment.status === 'reported')) {
        return {...comment, status: 'rejected'};
      }
      return comment;
    });

    loading.value = false;
    message.success(`已拒绝 ${selectedRowKeys.value.length} 条评论`);
    selectedRowKeys.value = [];
  }, 500);
}

// 批量删除评论
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的评论');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 条评论吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        commentData.value = commentData.value.filter(comment => !selectedRowKeys.value.includes(comment.id));
        pagination.total -= selectedRowKeys.value.length;
        selectedRowKeys.value = [];
        loading.value = false;
        message.success('已批量删除评论');
      }, 800);
    }
  });
}

// 通过单个评论
function approveComment(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = commentData.value.findIndex(comment => comment.id === record.id);
    if (index !== -1) {
      commentData.value[index].status = 'approved';
      message.success('评论已通过');

      if (commentDetailVisible.value) {
        selectedComment.value = {...commentData.value[index]};
      }
    }
    loading.value = false;
  }, 500);
}

// 拒绝单个评论
function rejectComment(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = commentData.value.findIndex(comment => comment.id === record.id);
    if (index !== -1) {
      commentData.value[index].status = 'rejected';
      message.success('评论已拒绝');

      if (commentDetailVisible.value) {
        selectedComment.value = {...commentData.value[index]};
      }
    }
    loading.value = false;
  }, 500);
}

// 回复评论
function replyComment(record) {
  viewComment(record);
  // 聚焦到回复框
  setTimeout(() => {
    document.querySelector('.reply-form textarea')?.focus();
  }, 300);
}

// 提交回复
function submitReply() {
  if (!replyContent.value.trim()) {
    message.warning('请输入回复内容');
    return;
  }

  // 模拟API调用
  loading.value = true;
  setTimeout(() => {
    // 添加新回复到回复列表
    const newReply = {
      id: Date.now(),
      userName: '系统管理员',
      userAvatar: 'https://via.placeholder.com/40',
      content: replyContent.value,
      createTime: new Date().getTime()
    };

    commentReplies.value.unshift(newReply);

    // 更新主评论的回复数
    const index = commentData.value.findIndex(comment => comment.id === selectedComment.value.id);
    if (index !== -1) {
      commentData.value[index].replies += 1;
      selectedComment.value.replies += 1;
    }

    message.success('回复成功');
    replyContent.value = '';
    loading.value = false;
  }, 500);
}

// 设置为精选评论
function highlightComment(record) {
  message.success(`评论"${record.content.substring(0, 20)}..."已设为精选`);
}

// 处理举报
function manageReport(record) {
  viewComment(record);
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  window.$modal?.confirm({
    title: '确定要删除此评论吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteComment(record);
    }
  });
}

// 删除评论
function deleteComment(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    commentData.value = commentData.value.filter(comment => comment.id !== record.id);
    pagination.total -= 1;

    // 如果在详情弹窗中删除，则关闭弹窗
    if (commentDetailVisible.value && selectedComment.value && selectedComment.value.id === record.id) {
      commentDetailVisible.value = false;
    }

    loading.value = false;
    message.success('评论已删除');

    // 从选中的行中移除
    if (selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
    }
  }, 500);
}

// 生命周期钩子
onMounted(() => {
  fetchCommentData();
});
</script>

<style scoped>
/* 评论管理容器样式 */
.comment-management-container {
  padding: 16px;
}

/* 搜索表单样式 */
.search-form-card {
  margin-bottom: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form-container {
  width: 100%;
}

.search-form {
  width: 100%;
}

.search-form-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}

.search-form-items .ant-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-buttons {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.search-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.search-button:hover, .search-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 8px 0;
}

.operation-left, .operation-right {
  display: flex;
  align-items: center;
}

/* 表格内容样式 */
:deep(.ant-table-cell) {
  padding: 14px 16px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

/* 评论内容单元格样式 */
.comment-content-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-text {
  color: #333;
  line-height: 1.5;
}

.comment-target {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 卡片视图样式 */
.comment-cards-container {
  margin-bottom: 24px;
}

.grid-header {
  margin-bottom: 16px;
}

.grid-selection {
  display: flex;
  align-items: center;
  background: #f0f8ff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.selected-count {
  margin-left: 12px;
  color: #666;
}

.comment-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.comment-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.comment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.comment-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 12px;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #8c8c8c;
}

.comment-target-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.target-title {
  font-size: 13px;
  color: #555;
}

.comment-text-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 8px 0;
  flex-grow: 1;
}

.comment-metrics {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.comment-card-actions {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  justify-content: space-around;
}

/* 评论详情弹窗样式 */
.custom-comment-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-comment-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-comment-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-comment-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-comment-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.comment-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
}

.comment-status {
  background-color: #f9f9f9;
  padding: 6px 12px;
  border-radius: 20px;
}

.comment-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .anticon {
  color: #6554C0;
}

.danger-title .anticon,
.danger-title {
  color: #ff4d4f;
}

.target-info {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.target-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 8px 0;
}

.target-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
}

.target-link a {
  color: #6554C0;
}

.content-box {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  color: #333;
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
}

.comment-replies-section {
  border-top: 1px dashed #f0f0f0;
  padding-top: 20px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.reply-username {
  font-weight: 500;
  color: #333;
}

.reply-time {
  font-size: 12px;
  color: #888;
  margin-left: auto;
}

.reply-content {
  color: #333;
  line-height: 1.5;
}

.comment-report-section {
  border-top: 1px dashed #f0f0f0;
  padding-top: 20px;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-item {
  padding: 12px;
  background-color: #fff0f0;
  border-radius: 8px;
  border-left: 4px solid #ff4d4f;
}

.report-user {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.reporter {
  font-weight: 500;
  color: #333;
}

.report-time {
  font-size: 12px;
  color: #888;
  margin-left: auto;
}

.report-reason {
  color: #333;
  line-height: 1.5;
}

.comment-detail-actions {
  margin-top: 24px;
}

.action-group {
  margin-bottom: 16px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.reply-form {
  margin-top: 16px;
}

.reply-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 分页样式 */
.grid-pagination-bottom {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .comment-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .comment-status {
    align-self: flex-start;
  }
}

@media (max-width: 576px) {

  .user-profile {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .comment-meta {
    flex-direction: column;
    gap: 8px;
  }

  .custom-comment-modal {
    width: 95% !important;
    max-width: 500px;
  }
}
</style>