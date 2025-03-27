<!-- src/components/comment/CommentItem.vue -->
<template>
  <div class="comment-item">
    <!-- 主评论内容 -->
    <div class="comment-main">
      <a-avatar
          :src="comment.author.avatar"
          :size="40"
          class="comment-avatar"
      />
      <div class="comment-content">
        <div class="comment-header">
          <div class="author-info">
            <router-link
                :to="`/user/${comment.author.id}`"
                class="author-name"
            >
              {{ comment.author.name }}
            </router-link>
            <span class="comment-time">{{ formatTime(comment.time) }}</span>
          </div>

          <div class="comment-actions">
            <a-button
                type="text"
                class="action-btn reply-btn"
                @click="$emit('reply', comment)"
            >
              <template #icon><comment-outlined /></template>
              回复
            </a-button>
            <a-button
                type="text"
                class="action-btn like-btn"
                :class="{ 'liked': comment.isLiked }"
                @click="toggleLike(comment)"
            >
              <template #icon>
                <like-filled v-if="comment.isLiked" />
                <like-outlined v-else />
              </template>
              {{ comment.likes || 0 }}
            </a-button>
            <a-dropdown
                v-if="isOwner(comment) || isAdmin"
                :trigger="['click']"
            >
              <a-button type="text" class="action-btn more-btn">
                <template #icon><more-outlined /></template>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="deleteComment(comment)">
                    <template #icon><delete-outlined /></template>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <!-- 回复引用 -->
        <div
            v-if="comment.replyTo"
            class="reply-quote"
        >
          回复 <span class="quote-author">@{{ comment.replyTo.name }}</span>: {{ getQuotedContent(comment) }}
        </div>

        <!-- 评论文本内容 -->
        <div class="comment-text">
          {{ comment.content }}
        </div>

        <!-- 评论中的图片附件 -->
        <div
            v-if="comment.images && comment.images.length > 0"
            class="comment-images"
        >
          <a-image
              v-for="(image, index) in comment.images"
              :key="index"
              :src="image"
              :preview="{ src: image }"
              class="comment-image"
          />
        </div>
      </div>
    </div>

    <!-- 嵌套的回复 -->
    <div
        v-if="comment.replies && comment.replies.length > 0"
        class="replies-container"
    >
      <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply-item"
      >
        <div class="reply-main">
          <a-avatar
              :src="reply.author.avatar"
              :size="32"
              class="reply-avatar"
          />
          <div class="reply-content">
            <div class="reply-header">
              <div class="author-info">
                <router-link
                    :to="`/user/${reply.author.id}`"
                    class="author-name"
                >
                  {{ reply.author.name }}
                </router-link>
                <span class="reply-time">{{ formatTime(reply.time) }}</span>
              </div>

              <div class="reply-actions">
                <a-button
                    type="text"
                    class="action-btn reply-btn"
                    @click="$emit('reply', reply, comment)"
                >
                  <template #icon><comment-outlined /></template>
                  回复
                </a-button>
                <a-button
                    type="text"
                    class="action-btn like-btn"
                    :class="{ 'liked': reply.isLiked }"
                    @click="toggleLike(reply)"
                >
                  <template #icon>
                    <like-filled v-if="reply.isLiked" />
                    <like-outlined v-else />
                  </template>
                  {{ reply.likes || 0 }}
                </a-button>
                <a-dropdown
                    v-if="isOwner(reply) || isAdmin"
                    :trigger="['click']"
                >
                  <a-button type="text" class="action-btn more-btn">
                    <template #icon><more-outlined /></template>
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="deleteComment(reply)">
                        <template #icon><delete-outlined /></template>
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>

            <!-- 回复引用 -->
            <div class="reply-to">
              回复 <span class="quote-author">@{{ reply.replyTo.name }}</span>
            </div>

            <!-- 回复文本内容 -->
            <div class="reply-text">
              {{ reply.content }}
            </div>

            <!-- 回复中的图片附件 -->
            <div
                v-if="reply.images && reply.images.length > 0"
                class="reply-images"
            >
              <a-image
                  v-for="(image, index) in reply.images"
                  :key="index"
                  :src="image"
                  :preview="{ src: image }"
                  class="reply-image"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 展开更多回复 -->
      <div
          v-if="comment.replies.length > 2 && !showAllReplies"
          class="load-more-replies"
      >
        <a-button type="link" @click="showAllReplies = true">
          查看全部 {{ comment.replies.length }} 条回复
          <template #icon><down-outlined /></template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import {
  CommentOutlined,
  LikeOutlined,
  LikeFilled,
  MoreOutlined,
  DeleteOutlined,
  DownOutlined
} from '@ant-design/icons-vue';

// 日期格式化初始化
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Props
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

// Emits
const emit = defineEmits(['reply', 'delete', 'like']);

// 是否展示所有回复
const showAllReplies = ref(false);

// 格式化时间
const formatTime = (time :any) => {
  return dayjs(time).fromNow();
};

// 获取引用内容
const getQuotedContent = (comment :any) => {
  if (!comment.replyTo || !comment.replyToContent) {
    return '';
  }

  // 截取内容，避免过长
  let content = comment.replyToContent;
  if (content.length > 20) {
    content = content.substring(0, 20) + '...';
  }

  return content;
};

// 检查是否是评论所有者
const isOwner = (comment:any) => {
  return comment.author.id === props.currentUser.id;
};

// 是否是管理员
const isAdmin = computed(() => {
  // 这里可以根据实际情况判断当前用户是否是管理员
  return false;
});

// 点赞或取消点赞
const toggleLike = (comment :any) => {
  const newLikedStatus = !comment.isLiked;

  // 更新UI
  comment.isLiked = newLikedStatus;
  comment.likes = newLikedStatus ? (comment.likes || 0) + 1 : (comment.likes || 1) - 1;

  // 发送事件
  emit('like', { commentId: comment.id, liked: newLikedStatus });
};

// 删除评论
const deleteComment = (comment :any) => {
  // 确认对话框
  Modal.confirm({
    title: '确定要删除这条评论吗？',
    content: '删除后无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      emit('delete', comment.id);
    }
  });
};
</script>

<style scoped>
.comment-item {
  margin-bottom: 24px;
}

.comment-main {
  display: flex;
  gap: 16px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
}

.author-name:hover {
  color: var(--primary-color, #722ed1);
}

.comment-time, .reply-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.comment-actions, .reply-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  transition: all 0.3s;
}

.action-btn:hover {
  color: var(--primary-color, #722ed1);
}

.action-btn.liked {
  color: #ff4d4f;
}

.comment-text, .reply-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-images, .reply-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.comment-image, .reply-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  overflow: hidden;
}

.reply-quote {
  margin-bottom: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.quote-author {
  color: var(--primary-color, #722ed1);
  font-weight: 500;
}

.replies-container {
  margin-left: 56px;
  margin-top: 16px;
}

.reply-item {
  margin-bottom: 16px;
}

.reply-main {
  display: flex;
  gap: 12px;
}

.reply-content {
  flex: 1;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reply-to {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.load-more-replies {
  text-align: center;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .comment-main, .reply-main {
    gap: 8px;
  }

  .replies-container {
    margin-left: 32px;
  }

  .comment-content, .reply-content {
    padding: 12px;
  }

  .comment-header, .reply-header {
    flex-direction: column;
  }

  .comment-actions, .reply-actions {
    margin-top: 8px;
  }

  .comment-image, .reply-image {
    width: 60px;
    height: 60px;
  }
}
</style>