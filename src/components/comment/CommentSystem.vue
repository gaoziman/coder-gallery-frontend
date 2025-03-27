<template>
  <div class="comment-system">
    <h2 class="comment-title">
      评论（{{ totalComments }}）
    </h2>

    <!-- 评论输入区 -->
    <div class="comment-input-container"
         v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 300 } }">
      <a-avatar
          :src="currentUser.avatar"
          :size="40"
          class="comment-avatar"
      />
      <div class="comment-input-wrapper">
        <a-textarea
            v-model:value="commentContent"
            :placeholder="replyTo ? `回复 ${replyTo.name}：` : '添加评论...'"
            :auto-size="{ minRows: 2, maxRows: 6 }"
            class="comment-input"
        />
        <div class="comment-tools">
          <div class="tool-buttons">
            <a-button
                type="text"
                class="tool-btn emoji-btn"
                @click="toggleEmojiPicker"
            >
              <template #icon><smile-outlined /></template>
            </a-button>
            <a-button type="text" class="tool-btn image-btn">
              <template #icon><picture-outlined /></template>
            </a-button>
          </div>
          <div class="submit-area">
            <a-button
                v-if="replyTo"
                @click="cancelReply"
                class="cancel-btn"
            >
              取消
            </a-button>
            <a-button
                type="primary"
                class="submit-btn"
                :disabled="!commentContent.trim()"
                @click="submitComment"
            >
              发布
            </a-button>
          </div>
        </div>

        <!-- 表情选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-container">
            <div
                v-for="emoji in emojis"
                :key="emoji"
                class="emoji-item"
                @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list"
         v-motion
         :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { delay: 300, duration: 500 } }">
      <a-empty
          v-if="comments.length === 0"
          description="暂无评论，快来发表第一条评论吧！"
      />

      <template v-else>
        <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 300 } }"
        >
          <CommentItem
              :comment="comment"
              :current-user="currentUser"
              @reply="handleReply"
              @delete="$emit('delete', $event)"
              @like="$emit('like', $event.commentId, $event.liked)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { SmileOutlined, PictureOutlined } from '@ant-design/icons-vue';
import CommentItem from '@/components/comment/CommentItem.vue';

// Props
const props = defineProps({
  pictureId: {
    type: String,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['reply', 'delete', 'like']);

// 当前用户信息（实际应用中从用户store获取）
const currentUser = ref({
  id: 'current-user',
  name: '当前用户',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
});

// 评论内容
const commentContent = ref('');

// 回复对象
const replyTo = ref(null);

// 表情选择器
const showEmojiPicker = ref(false);
const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🎉', '❤️', '🔥', '✨', '🌟', '🎊', '🙌', '🤩', '😊', '😇', '🥺', '😅', '😆', '😋', '🤗', '🫡', '🙏', '💯'];

// 计算总评论数（包括回复）
const totalComments = computed(() => {
  let count = props.comments.length;
  props.comments.forEach(comment => {
    count += comment.replies ? comment.replies.length : 0;
  });
  return count;
});

// 处理回复评论
const handleReply = (comment, parentComment = null) => {
  replyTo.value = {
    id: comment.author.id,
    name: comment.author.name,
    commentId: comment.id,
    parentId: parentComment ? parentComment.id : null
  };
  // 滚动到评论输入框
  setTimeout(() => {
    document.querySelector('.comment-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

// 取消回复
const cancelReply = () => {
  replyTo.value = null;
};

// 提交评论
const submitComment = () => {
  if (!commentContent.value.trim()) {
    return;
  }

  // 构建评论数据
  const commentData = {
    content: commentContent.value,
    replyTo: replyTo.value,
    pictureId: props.pictureId
  };

  // 发送评论事件
  emit('reply', commentData, commentContent.value);

  // 重置输入
  commentContent.value = '';
  replyTo.value = null;
  showEmojiPicker.value = false;

  message.success('评论发布成功！');
};

// 切换表情选择器
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// 插入表情
const insertEmoji = (emoji) => {
  commentContent.value += emoji;
};

// 监听点击事件关闭表情选择器
watch(showEmojiPicker, (newValue) => {
  if (newValue) {
    const handleClickOutside = (e) => {
      const picker = document.querySelector('.emoji-picker');
      const btn = document.querySelector('.emoji-btn');
      if (
          picker &&
          !picker.contains(e.target) &&
          btn &&
          !btn.contains(e.target)
      ) {
        showEmojiPicker.value = false;
        document.removeEventListener('click', handleClickOutside);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  }
});
</script>

<style scoped>
.comment-system {
  width: 100%;
}

.comment-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.comment-input-container {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
  position: relative;
}

.comment-input {
  border-radius: 8px;
  resize: none;
}

.comment-tools {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.tool-buttons {
  display: flex;
  gap: 12px;
}

.tool-btn {
  color: #666;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.tool-btn:hover {
  color: var(--primary-color, #722ed1);
  background: rgba(114, 46, 209, 0.05);
}

.submit-area {
  display: flex;
  gap: 8px;
}

.cancel-btn {
  height: 36px;
  border-radius: 6px;
}

.submit-btn {
  height: 36px;
  border-radius: 6px;
  background: var(--primary-color, #722ed1);
}

.emoji-picker {
  position: absolute;
  width: 320px;
  max-width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 100;
  left: 0;
  top: 100%;
  margin-top: 8px;
}

.emoji-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: #f5f5f5;
  transform: scale(1.2);
}

.comment-list {
  margin-top: 32px;
}

.comment-item {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .comment-input-container {
    gap: 8px;
  }

  .emoji-container {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>