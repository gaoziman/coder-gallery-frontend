<template>
  <div class="comments-management-container">
    <!-- 顶部卡片统计信息 -->
    <div class="stat-cards">
      <a-row :gutter="16">
        <a-col :span="6" v-for="(card, index) in statCards" :key="index">
          <a-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="card-content">
              <div class="icon-container" :class="`bg-${card.color}`">
                <component :is="card.icon"/>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ card.title }}</div>
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-change" :class="{ 'increase': card.change > 0, 'decrease': card.change < 0 }">
                  <arrow-up-outlined v-if="card.change > 0"/>
                  <arrow-down-outlined v-if="card.change < 0"/>
                  {{ Math.abs(card.change) }}% 较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
        <a-form-item label="评论内容" name="content">
          <a-input v-model:value="searchForm.content" placeholder="搜索评论内容" allowClear/>
        </a-form-item>
        <a-form-item label="评论者" name="commenter">
          <a-input v-model:value="searchForm.commenter" placeholder="评论者用户名" allowClear/>
        </a-form-item>
        <a-form-item label="图片名称" name="pictureName">
          <a-input v-model:value="searchForm.pictureName" placeholder="所属图片" allowClear/>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="approved">已审核</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="评论时间" name="commentTime">
          <a-range-picker
              v-model:value="searchForm.commentTime"
              :placeholder="['开始日期', '结束日期']"
              format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <search-outlined/>
              查询
            </a-button>
            <a-button @click="resetForm" >
              <reload-outlined/>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="handleApproveSelected" :disabled="!hasSelected">
          <check-outlined/>
          批量审核通过
        </a-button>
        <a-button danger  :disabled="!hasSelected" @click="handleRejectSelected">
          <stop-outlined/>
          批量拒绝
        </a-button>
        <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
          <delete-outlined/>
          批量删除
        </a-button>
        <a-button  @click="handleRefresh">
          <reload-outlined/>
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 评论数据表格 -->
    <a-table
        :columns="columns"
        :data-source="commentsData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        row-key="id"
        class="comments-table"
    >
      <template #bodyCell="{ column, record }">
        <!-- 评论者头像列 -->
        <template v-if="column.dataIndex === 'avatar'">
          <div class="user-info">
            <a-avatar :src="record.author.avatar" :alt="record.author.name"/>
            <span class="username">{{ record.author.name }}</span>
          </div>
        </template>

        <!-- 评论内容列 -->
        <template v-if="column.dataIndex === 'content'">
          <div class="comment-content-cell">
            <div class="comment-text">{{ truncateText(record.content, 100) }}</div>
            <div v-if="record.replyTo" class="reply-info">
              <span class="reply-label">回复</span>
              <a-tag>@{{ record.replyTo.name }}</a-tag>
            </div>
            <div class="comment-images" v-if="record.images && record.images.length">
              <a-image
                  v-for="(image, i) in record.images"
                  :key="i"
                  :src="image"
                  :width="40"
                  class="comment-thumbnail"
              />
            </div>
          </div>
        </template>

        <!-- 图片信息列 -->
        <template v-if="column.dataIndex === 'picture'">
          <div class="picture-info">
            <a-image
                :src="record.picture.thumbnail"
                :width="60"
                class="picture-thumbnail"
            />
            <router-link :to="`/picture/${record.picture.id}`" class="picture-title">
              {{ record.picture.title }}
            </router-link>
          </div>
        </template>

        <!-- 状态列 -->
        <template v-if="column.dataIndex === 'status'">
          <a-badge
              :status="getStatusType(record.status)"
              :text="getStatusText(record.status)"
          />
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <div class="action-buttons-cell">
            <a-space>
              <a-button type="link" size="small"  @click="viewCommentDetails(record)">
                <template #icon><eye-outlined /></template>
                查看
              </a-button>
              <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  class="operation-btn approve-btn"
                  @click="approveComment(record)"
              >
                <template #icon><check-outlined /></template>
                通过
              </a-button>
              <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  class="operation-btn reject-btn"
                  @click="rejectComment(record)"
              >
                <template #icon><stop-outlined /></template>
                拒绝
              </a-button>
              <a-popconfirm
                  title="确定要删除此评论吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="deleteComment(record)"
              >
                <a-button type="link" size="small" class="operation-btn delete-btn">
                  <template #icon><delete-outlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 查看评论详情弹窗 -->
    <a-modal
        v-model:visible="viewModalVisible"
        title="评论详细信息"
        :footer="null"
        width="700px"
        class="custom-modal view-comment-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeViewModal"
    >
      <div class="comment-detail" v-if="currentComment.id">
        <div class="comment-detail-header">
          <div class="user-detail">
            <a-avatar :src="currentComment.author.avatar" :size="64"/>
            <div class="user-info-detail">
              <div class="author-name">{{ currentComment.author.name }}</div>
              <div class="comment-time">{{ formatDateTime(currentComment.time) }}</div>
            </div>
          </div>
          <a-tag :color="getStatusColor(currentComment.status)">{{ getStatusText(currentComment.status) }}</a-tag>
        </div>

        <a-divider/>

        <div class="picture-detail">
          <h4>所属图片：</h4>
          <div class="picture-info-detail">
            <a-image :src="currentComment.picture.thumbnail" :width="120"/>
            <div class="picture-meta">
              <div class="picture-title">{{ currentComment.picture.title }}</div>
              <router-link :to="`/picture/${currentComment.picture.id}`" class="view-picture-link">
                查看原图
              </router-link>
            </div>
          </div>
        </div>

        <a-divider/>

        <div class="comment-content-detail">
          <h4>评论内容：</h4>
          <div v-if="currentComment.replyTo" class="reply-quote-detail">
            <div class="reply-header">
              回复 <span class="quote-author">@{{ currentComment.replyTo.name }}</span>:
            </div>
            <div class="quote-content">{{ currentComment.replyTo.content }}</div>
          </div>
          <div class="main-content">{{ currentComment.content }}</div>
          <div class="comment-images-detail" v-if="currentComment.images && currentComment.images.length">
            <h4>附带图片：</h4>
            <a-image
                v-for="(image, i) in currentComment.images"
                :key="i"
                :src="image"
                :width="150"
                class="attached-image"
            />
          </div>
        </div>

        <a-divider/>

        <div class="comment-actions-detail">
          <a-space>
            <a-button
                v-if="currentComment.status === 'pending'"
                type="primary"
                @click="approveComment(currentComment, true)"
            >
              <template #icon><check-outlined /></template>
              审核通过
            </a-button>
            <a-button
                v-if="currentComment.status === 'pending'"
                danger
                @click="rejectComment(currentComment, true)"
            >
              <template #icon><stop-outlined /></template>
              拒绝
            </a-button>
            <a-popconfirm
                title="确定要删除此评论吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteComment(currentComment, true)"
            >
              <a-button danger>
                <template #icon><delete-outlined /></template>
                删除评论
              </a-button>
            </a-popconfirm>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  StopOutlined,
  MessageOutlined,
  LikeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CommentOutlined
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
    align: 'center',
  },
  {
    title: '评论者',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 150,
    align: 'center',
  },
  {
    title: '评论内容',
    dataIndex: 'content',
    key: 'content',
    width: 200,
    align: 'center',
  },
  {
    title: '所属图片',
    dataIndex: 'picture',
    key: 'picture',
    width: 180,
    align: 'center',
  },
  {
    title: '评论时间',
    dataIndex: 'time',
    key: 'time',
    width: 150,
    sorter: true,
    render: (text) => formatDateTime(text),
    align: 'center',
  },
  {
    title: '点赞数',
    dataIndex: 'likes',
    key: 'likes',
    width: 120,
    sorter: true,
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 220,
    align: 'center',
  },
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '评论总数',
    value: 346,
    change: 15.8,
    color: 'purple',
    icon: CommentOutlined,
  },
  {
    title: '本月新增评论',
    value: 57,
    change: 22.3,
    color: 'blue',
    icon: MessageOutlined,
  },
  {
    title: '待审核评论',
    value: 12,
    change: -8.4,
    color: 'gold',
    icon: MessageOutlined,
  },
  {
    title: '评论点赞总数',
    value: 2341,
    change: 9.7,
    color: 'green',
    icon: LikeOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  content: '',
  commenter: '',
  pictureName: '',
  status: undefined,
  commentTime: [],
});

// 表格数据和加载状态
const loading = ref(false);
const commentsData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 模态框可见性和当前操作评论
const viewModalVisible = ref(false);
const currentComment = ref({});

// 组件挂载时获取数据
onMounted(() => {
  fetchCommentsData();
});

// 获取评论数据
function fetchCommentsData() {
  loading.value = true;
  // 这里应该是调用API获取数据，现在模拟一些数据
  setTimeout(() => {
    const data = [];
    const statuses = ['approved', 'pending', 'rejected'];

    // 模拟图片数据
    const pictures = [
      { id: 1, title: '夏日海滩风景', thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pic1' },
      { id: 2, title: '城市夜景摄影', thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pic2' },
      { id: 3, title: '花卉特写', thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pic3' },
      { id: 4, title: '山脉日出', thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pic4' },
      { id: 5, title: '美食摄影集', thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pic5' },
    ];

    for (let i = 1; i <= 50; i++) {
      const hasReply = i % 3 === 0;
      const hasImages = i % 4 === 0;

      data.push({
        id: i,
        author: {
          id: 100 + i,
          name: `用户${100 + i}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        },
        content: i % 5 === 0
            ? '这张图片真的很精彩，光影处理非常专业，请问用的什么软件编辑的？'
            : (i % 4 === 0
                ? '构图很棒，色彩鲜明，看了让人心情愉悦！'
                : (i % 3 === 0
                    ? '这是我见过的最好的作品之一，期待更多你的创作。'
                    : '非常漂亮的照片，请问拍摄地点在哪里？想去打卡。')),
        replyTo: hasReply ? {
          id: 200 + i,
          name: `用户${200 + i}`,
          content: '请问这张图片是在哪里拍摄的？非常喜欢这个场景。'
        } : null,
        time: new Date(2025, 2, (i % 28) + 1, (i % 24), (i % 60)).getTime(),
        likes: Math.floor(Math.random() * 50),
        status: statuses[i % 3],
        picture: pictures[i % 5],
        images: hasImages ? [
          `https://api.dicebear.com/7.x/shapes/svg?seed=img${i}1`,
          `https://api.dicebear.com/7.x/shapes/svg?seed=img${i}2`
        ] : [],
      });
    }

    commentsData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 搜索处理
function handleSearch() {
  loading.value = true;
  setTimeout(() => {
    // 模拟搜索过滤
    const filteredData = commentsData.value.filter(comment => {
      let match = true;

      if (searchForm.content && !comment.content.includes(searchForm.content)) {
        match = false;
      }

      if (searchForm.commenter && !comment.author.name.includes(searchForm.commenter)) {
        match = false;
      }

      if (searchForm.pictureName && !comment.picture.title.includes(searchForm.pictureName)) {
        match = false;
      }

      if (searchForm.status && comment.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.commentTime && searchForm.commentTime.length === 2) {
        const startTime = searchForm.commentTime[0].valueOf();
        const endTime = searchForm.commentTime[1].valueOf();
        if (comment.time < startTime || comment.time > endTime) {
          match = false;
        }
      }

      return match;
    });

    commentsData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetForm() {
  searchForm.content = '';
  searchForm.commenter = '';
  searchForm.pictureName = '';
  searchForm.status = undefined;
  searchForm.commentTime = [];
  fetchCommentsData();
  message.success('表单已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchCommentsData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 表格变化处理（排序、分页等）
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    commentsData.value = [...commentsData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'number' && typeof b[sorter.field] === 'number') {
        return order * (a[sorter.field] - b[sorter.field]);
      }
      return 0;
    });
  }
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
}

// 截断文本
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    approved: '已审核',
    pending: '待审核',
    rejected: '已拒绝'
  };
  return statusMap[status] || '未知状态';
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    approved: '#52C41A',
    pending: '#FAAD14',
    rejected: '#F5222D'
  };
  return colorMap[status] || '';
}

// 查看评论详情
function viewCommentDetails(record) {
  currentComment.value = {...record};
  viewModalVisible.value = true;
  document.body.classList.add('modal-open'); // 添加这一行
}

// 批量审核通过
function handleApproveSelected() {
  if (!selectedRowKeys.value.length) return;

  // 模拟API调用
  loading.value = true;
  setTimeout(() => {
    commentsData.value = commentsData.value.map(comment => {
      if (selectedRowKeys.value.includes(comment.id)) {
        return {...comment, status: 'approved'};
      }
      return comment;
    });
    selectedRowKeys.value = [];
    loading.value = false;
    message.success('已批量审核通过');
  }, 500);
}

// 批量拒绝
function handleRejectSelected() {
  if (!selectedRowKeys.value.length) return;

  // 模拟API调用
  loading.value = true;
  setTimeout(() => {
    commentsData.value = commentsData.value.map(comment => {
      if (selectedRowKeys.value.includes(comment.id)) {
        return {...comment, status: 'rejected'};
      }
      return comment;
    });
    selectedRowKeys.value = [];
    loading.value = false;
    message.success('已批量拒绝');
  }, 500);
}

// 批量删除评论
function handleBatchDelete() {
  if (!selectedRowKeys.value.length) return;

  // 模拟API调用
  loading.value = true;
  setTimeout(() => {
    commentsData.value = commentsData.value.filter(comment => !selectedRowKeys.value.includes(comment.id));
    pagination.total -= selectedRowKeys.value.length;
    selectedRowKeys.value = [];
    loading.value = false;
    message.success('已批量删除评论');
  }, 500);
}

// 审核通过单个评论
function approveComment(record, closeModal = false) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = commentsData.value.findIndex(comment => comment.id === record.id);
    if (index !== -1) {
      commentsData.value[index].status = 'approved';
      // 如果是在模态框中操作，更新当前评论对象
      if (currentComment.value.id === record.id) {
        currentComment.value = {...currentComment.value, status: 'approved'};
      }
    }

    loading.value = false;
    if (closeModal) {
      viewModalVisible.value = false;
      document.body.classList.remove('modal-open'); // 添加这一行
    }
    message.success('评论已审核通过');
  }, 500);
}


// 拒绝单个评论
function rejectComment(record, closeModal = false) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = commentsData.value.findIndex(comment => comment.id === record.id);
    if (index !== -1) {
      commentsData.value[index].status = 'rejected';
      // 如果是在模态框中操作，更新当前评论对象
      if (currentComment.value.id === record.id) {
        currentComment.value = {...currentComment.value, status: 'rejected'};
      }
    }

    loading.value = false;
    if (closeModal) {
      viewModalVisible.value = false;
      document.body.classList.remove('modal-open'); // 添加这一行
    }
    message.success('评论已拒绝');
  }, 500);
}

// 删除单个评论
function deleteComment(record, closeModal = false) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    commentsData.value = commentsData.value.filter(comment => comment.id !== record.id);
    pagination.total -= 1;

    loading.value = false;
    if (closeModal) {
      viewModalVisible.value = false;
      document.body.classList.remove('modal-open'); // 添加这一行
    }
    message.success('评论已删除');
  }, 500);
}

// 添加一个新函数用于关闭评论详情弹窗
function closeViewModal() {
  viewModalVisible.value = false;
  document.body.classList.remove('modal-open');
}

</script>

<style scoped>
/* 全局容器样式 */
.comments-management-container {
  padding: 16px;
}

/* 数据统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  color: white;
  font-size: 22px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #8C8C8C;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.increase {
  color: #52C41A;
}

.decrease {
  color: #F5222D;
}

/* 搜索表单卡片样式 */
.search-form-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* 操作按钮区域样式 */
.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.primary-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.primary-button:hover, .primary-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

.search-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.search-button:hover, .search-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 表格样式 */
.comments-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 用户信息单元格样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 500;
}

/* 评论内容单元格样式 */
.comment-content-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-text {
  line-height: 1.5;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.reply-label {
  color: #999;
}

.comment-images {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.comment-thumbnail {
  border-radius: 4px;
  overflow: hidden;
}

/* 图片信息单元格样式 */
.picture-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.picture-thumbnail {
  border-radius: 4px;
  overflow: hidden;
}

.picture-title {
  font-size: 12px;
  color: #333;
  text-align: center;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 评论详情弹窗样式 */
.comment-detail {
  padding: 16px;
}

.comment-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-detail {
  display: flex;
  gap: 16px;
  align-items: center;
}

.user-info-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.picture-detail {
  margin-bottom: 16px;
}

.picture-info-detail {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.picture-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.picture-title {
  font-size: 16px;
  font-weight: 500;
}

.view-picture-link {
  color: #6554C0;
  font-size: 14px;
}

.comment-content-detail {
  margin-bottom: 16px;
}

.reply-quote-detail {
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
}

.reply-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.quote-author {
  color: #6554C0;
  font-weight: 500;
}

.quote-content {
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.main-content {
  font-size: 15px;
  line-height: 1.6;
  margin: 12px 0;
}

.comment-images-detail {
  margin-top: 16px;
}

.attached-image {
  margin-right: 8px;
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.comment-actions-detail {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 修改表格中操作按钮的样式 */
.operation-btn {
  padding: 0 8px;
}


.approve-btn {
  color: #42a884 !important;
}

.approve-btn:hover {
  color: #42a884 !important;
}

.reject-btn {
  color: #F5222D !important;
}

.reject-btn:hover {
  color: #FF4D4F !important;
}

.delete-btn {
  color: #F5222D !important;
}

.delete-btn:hover {
  color: #FF4D4F !important;
}


/* 确保弹窗内的链接样式不会影响全局导航 */
.comment-detail a,
.comment-detail router-link {
  color: #6554C0;
  text-decoration: none;
}

/* 确保弹窗内的按钮样式正确 */
.comment-actions-detail .ant-btn-primary {
  background-color: #6554C0;
  border-color: #6554C0;
}

.comment-actions-detail .ant-btn-primary:hover,
.comment-actions-detail .ant-btn-primary:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

.comment-actions-detail .ant-btn-dangerous {
  background-color: white;
  border-color: #F5222D;
  color: #F5222D;
}

.comment-actions-detail .ant-btn-dangerous:hover,
.comment-actions-detail .ant-btn-dangerous:focus {
  background-color: #FFF1F0;
  border-color: #FF4D4F;
  color: #FF4D4F;
}

/* 防止模态框遮罩影响导航样式 */
.ant-modal-mask {
  z-index: 999;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }

  .user-detail {
    flex-direction: column;
    align-items: flex-start;
  }

  .picture-info-detail {
    flex-direction: column;
  }
}
</style>