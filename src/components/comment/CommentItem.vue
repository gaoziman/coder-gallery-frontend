<!-- components/comment/CommentItem.vue -->
<template>
  <div class="comment-item-container">
    <!-- 主评论 -->
    <div class="comment-main">
      <a-avatar :src="comment.author?.avatar" :size="36" class="comment-avatar" />

      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">{{ comment.author?.name || '未知用户' }}</span>
          <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
        </div>

        <div class="comment-text">{{ comment.content }}</div>

        <div class="comment-actions">
          <a-button
              type="text"
              size="small"
              class="action-btn like-btn"
              :class="{ 'liked': comment.liked }"
              @click="handleLike"
          >
            <template #icon>
              <template v-if="comment.liked">
                <heart-filled />
              </template>
              <template v-else>
                <heart-outlined />
              </template>
            </template>
            {{ comment.likes || 0 }}
          </a-button>

          <a-button type="text" size="small"  @click="toggleReply">
            <template #icon><message-outlined /></template>
            回复
          </a-button>

          <a-button v-if="isCommentOwner" type="text" size="small"  @click="confirmDelete">
            <template #icon><delete-outlined /></template>
            删除
          </a-button>
        </div>

        <!-- 回复输入框 -->
        <div v-if="showReplyInput" class="reply-input-container">
          <a-textarea
              v-model:value="replyContent"
              placeholder="回复内容..."
              :auto-size="{ minRows: 2, maxRows: 4 }"
              class="reply-input"
          />
          <div class="reply-tools">
            <a-button class="comment-action-btn" @click="toggleReply">取消</a-button>
            <a-button
                type="primary"
                class="comment-action-btn"
                :disabled="!replyContent.trim()"
                @click="submitReply"
            >
              发表回复
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
      <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply-item"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
      >
        <a-avatar :src="reply.author?.avatar" :size="32" class="reply-avatar" />
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-author">{{ reply.author?.name || '未知用户' }}</span>
            <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
          </div>
          <div class="reply-text">{{ reply.content }}</div>
          <div class="reply-actions">
            <a-button
                type="text"
                size="small"
                class="action-btn like-btn"
                :class="{ 'liked': reply.liked }"
                @click="handleReplyLike(reply)"
            >
              <template #icon>
                <template v-if="reply.liked">
                  <heart-filled />
                </template>
                <template v-else>
                  <heart-outlined />
                </template>
              </template>
              {{ reply.likes || 0 }}
            </a-button>

            <a-button type="text" size="small" class="action-btn reply-btn" @click="toggleReplyForReply(reply)">
              <template #icon><message-outlined /></template>
              回复
            </a-button>

            <a-button v-if="isReplyOwner(reply)" type="text" size="small" class="action-btn delete-btn" @click="confirmDeleteReply(reply)">
              <template #icon><delete-outlined /></template>
              删除
            </a-button>
          </div>

          <!-- 添加回复输入框 - 新增部分 -->
          <div v-if="replyInputMap[reply.id]" class="reply-input-container">
            <a-textarea
                v-model:value="replyContentForReplies[reply.id]"
                placeholder="回复内容..."
                :auto-size="{ minRows: 2, maxRows: 4 }"
                class="reply-input"
            />
            <div class="reply-tools">
              <a-button class="comment-action-btn" @click="toggleReplyForReply(reply)">取消</a-button>
              <a-button
                  type="primary"
                  class="comment-action-btn"
                  :disabled="!replyContentForReplies[reply.id] || !replyContentForReplies[reply.id].trim()"
                  @click="submitReplyToReply(reply)"
              >
                发表回复
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';

// 定义Props
const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  }
});

// 定义Emits
const emit = defineEmits(['reply', 'delete', 'like']);

// 回复相关
const showReplyInput = ref(false);
const replyContent = ref('');

const replyInputMap = ref({});  // 用于追踪每个回复的输入框显示状态
const replyContentForReplies = ref({});  // 用于存储对回复的回复内容

// 切换回复框
const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value;
  if (!showReplyInput.value) {
    replyContent.value = '';
  }
};

// 提交回复
const submitReply = () => {
  if (!replyContent.value.trim()) return;

  emit('reply', props.comment);

  // 发送回复数据到父组件
  emit('reply', props.comment);

  // 重置输入框
  replyContent.value = '';
  showReplyInput.value = false;

  message.success('回复已发送');
};


// 切换对回复的回复框
const toggleReplyForReply = (reply) => {
  if (!replyInputMap.value[reply.id]) {
    replyInputMap.value = {}; // 清除其他可能打开的回复框
    replyContentForReplies.value[reply.id] = ''; // 初始化内容
  }
  replyInputMap.value[reply.id] = !replyInputMap.value[reply.id];

  // 如果关闭了输入框，清除内容
  if (!replyInputMap.value[reply.id]) {
    replyContentForReplies.value[reply.id] = '';
  }
};

// 提交对回复的回复
const submitReplyToReply = (reply) => {
  const content = replyContentForReplies.value[reply.id];
  if (!content || !content.trim()) return;

  // 发送回复事件到父组件
  emit('reply', reply, props.comment);

  // 清除输入内容和隐藏输入框
  replyContentForReplies.value[reply.id] = '';
  replyInputMap.value[reply.id] = false;

  message.success('回复已发送');
};


// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未知时间';

  const date = dayjs(timestamp);
  const now = dayjs();
  const diffMinutes = now.diff(date, 'minute');

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffMinutes < 24 * 60) {
    return `${Math.floor(diffMinutes / 60)}小时前`;
  } else if (diffMinutes < 7 * 24 * 60) {
    return `${Math.floor(diffMinutes / (24 * 60))}天前`;
  } else {
    return date.format('YYYY-MM-DD HH:mm');
  }
};

// 检查用户是否是评论的所有者
const isCommentOwner = computed(() => {
  if (!props.comment.author || !props.currentUser) return false;
  return props.comment.author.id === props.currentUser.id;
});

// 检查用户是否是回复的所有者
const isReplyOwner = (reply) => {
  if (!reply.author || !props.currentUser) return false;
  return reply.author.id === props.currentUser.id;
};

// 点赞评论
const handleLike = () => {
  const liked = !props.comment.liked;
  emit('like', { commentId: props.comment.id, liked });
};

// 点赞回复
const handleReplyLike = (reply) => {
  const liked = !reply.liked;
  emit('like', { commentId: reply.id, liked });
};

// 确认删除评论
const confirmDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条评论吗？删除后无法恢复。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      emit('delete', props.comment.id);
      message.success('评论已删除');
    }
  });
};

// 确认删除回复
const confirmDeleteReply = (reply) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条回复吗？删除后无法恢复。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      emit('delete', { replyId: reply.id, commentId: props.comment.id });
      message.success('回复已删除');
    }
  });
};
</script>

<style scoped>
.comment-item-container {
  width: 100%;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-right: 8px;
}

.comment-time {
  font-size: 12px;
  color: #8c8c8c;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.action-btn {
  font-size: 12px;
  color: #8c8c8c;
  padding: 0 4px;
  height: 24px;
}

.like-btn.liked {
  color: #ff4d4f;
}

/* 回复区域 */
.replies-container {
  margin-top: 8px;
  margin-left: 48px;
  border-left: 2px solid #f0f0f0;
  padding-left: 16px;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.reply-author {
  font-weight: 600;
  font-size: 13px;
  color: #333;
  margin-right: 8px;
}

.reply-time {
  font-size: 12px;
  color: #8c8c8c;
}

.reply-text {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

/* 回复输入框 */
.reply-input-container {
  margin-top: 8px;
  margin-bottom: 16px;
}

.reply-input {
  width: 100%;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
}

.reply-tools {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-content .reply-input-container {
  margin-top: 8px;
  margin-bottom: 8px;
}

.reply-content .reply-input {
  width: 100%;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
}

.reply-content .reply-tools {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.comment-action-btn {
  height: 36px;  /* 与主评论区域保持一致的高度 */
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

/* 主要按钮样式 */
.reply-tools .ant-btn-primary {
  background: var(--primary-color, #6366f1);
  border: none;
}

/* 取消size="small"的影响 */
.reply-tools .ant-btn {
  padding: 0 15px;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .comment-author,
  .reply-author {
    color: #e0e0e0;
  }

  .comment-time,
  .reply-time,
  .action-btn {
    color: #a6a6a6;
  }

  .comment-text,
  .reply-text {
    color: #d9d9d9;
  }

  .replies-container {
    border-left-color: #333;
  }
}
</style>