<template>
  <div class="comment"
       :class="[
        { 'reply-comment': isReply || nestLevel > 0 },
        'nest-level-' + (isReply || nestLevel > 0 ? '1' : '0'),
        { 'highlight-comment': isHighlighted }
      ]"
       :data-comment-id="comment.id">
    <!-- 用户头像 -->
    <div class="comment-avatar">
      <img
          :src="comment.user?.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${comment.user?.username || 'unknown'}`"
          :alt="comment.user?.username || '用户'"
          class="avatar"
      />
    </div>

    <!-- 评论内容区 -->
    <div class="comment-content">
      <!-- 评论头部：用户名、回复对象 -->
      <div class="comment-header">
        <div class="user-info">
          <span class="username">{{ comment.user?.username || '未知用户' }}</span>

          <!-- 只有在回复非顶级评论时才显示回复对象 -->
          <span v-if="comment.replyUser && isNestedReply" class="reply-to">
            回复 <span class="reply-username">{{ comment.replyUser.username || '未知用户' }}</span>
          </span>

          <!-- 如果是管理员或官方账号，显示标签 -->
          <span v-if="isAdmin" class="user-tag admin-tag">管理员</span>
          <span v-else-if="isAuthor" class="user-tag author-tag">作者</span>
        </div>
      </div>

      <!-- 评论正文 -->
      <div class="comment-body">
        <p class="comment-text">{{ comment.content }}</p>
      </div>

      <!-- 评论操作区 -->
      <div class="comment-actions">
        <div class="left-actions">
          <!-- 评论时间 -->
          <span class="comment-time-mobile">{{ formatTime(comment.createTime) }}</span>

          <!-- 点赞按钮 - 使用自定义div结构 -->
          <div
              class="custom-btn like-btn"
              :class="{ 'liked': isLiked, 'like-btn-pulse': likePulse }"
              @click="toggleLike"
          >
        <span class="btn-icon">
          <IconFont type="icon-dianzan2" v-if="!isLiked" />
          <IconFont type="icon-dianzan_kuai" v-else />
        </span>
            <span v-if="likeCount > 0" class="btn-text">{{ likeCount }}</span>
            <span class="btn-text" v-else-if="!isLiked">点赞</span>
          </div>

          <!-- 回复按钮 - 使用自定义div结构 -->
          <div class="custom-btn reply-btn" @click="handleReply">
            <span class="btn-icon">
              <IconFont type="icon-pinglun2" />
            </span>
            <span class="btn-text">回复</span>
          </div>
        </div>

        <!-- 更多操作按钮 (放在右侧) -->
        <div class="right-actions">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <div class="custom-btn more-btn">
            <span class="btn-icon">
              <more-outlined/>
            </span>
            </div>
            <template #overlay>
              <a-menu>
                <!-- 只有评论作者或管理员才显示删除选项 -->
                <a-menu-item v-if="isCommentOwner" key="delete" @click="showDeleteConfirm">
                  <delete-outlined />
                  <span>删除</span>
                </a-menu-item>
                <!-- 举报选项对所有用户显示，但不能举报自己的评论 -->
                <a-menu-item v-if="!isCommentOwner" key="report" @click="handleReport">
                  <flag-outlined />
                  <span>举报</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>
  </div>

  <!-- 当前评论下的回复框 -->
  <div v-if="isShowingReplyBox" class="reply-input-container inline-reply-box">
    <div class="avatar-wrapper">
      <img :src="userAvatar" class="user-avatar"/>
    </div>
    <div class="input-wrapper">
      <a-textarea
          v-model:value="localReplyContent"
          :placeholder="`回复 ${comment.user?.username || '未知用户'}...`"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          class="reply-textarea"
          ref="replyTextarea"
          @input="onReplyContentChange"
      />

      <div class="reply-controls">
        <div class="emotion-selector">
          <a-button type="text" @click="toggleReplyEmojiPicker">
            <template #icon>
              <IconFont type="icon-wode"/>
            </template>
          </a-button>
          <!-- 表情选择器 -->
          <div v-if="showReplyEmojiPicker" class="emoji-picker">
            <EmojiPicker
                :width="380"
                :emojiSize="20"
                :showPreview="true"
                :theme="'light'"
                :closeOnClickOutside="true"
                @select="insertReplyEmoji"
                @close="showReplyEmojiPicker = false"
            />
          </div>
        </div>
        <div class="button-group">
          <a-button @click="cancelReply">取消</a-button>
          <a-button
              type="primary"
              :disabled="!localReplyContent.trim()"
              :loading="submitting"
              @click="submitReply"
          >
            发表回复
          </a-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 递归渲染子评论 -->
  <div
      v-if="hasChildren && shouldRenderChildren && !isChildrenComponent"
      class="nested-comments"
  >
    <!-- 显示可见的子评论 -->
    <template v-for="(item, index) in visibleFlattenedComments" :key="item.id">
      <component
          :is="$options.name"
          :comment="item"
          :current-user-id="currentUserId"
          :content-author-id="contentAuthorId"
          :is-reply="true"
          :is-nested-reply="isReplyToReply(item)"
          :nest-level="1"
          :should-render-children="false"
          :is-showing-reply-box="activeReplyId === item.id"
          :submitting="submitting"
          :user-avatar="userAvatar"
          :active-reply-id="activeReplyId"
          :is-children-component="true"
          @reply="onChildReply"
          @like="onChildLike"
          @delete="onChildDelete"
          @report="onChildReport"
          @submit-reply="onSubmitReply"
          @cancel-reply="onCancelReply"
          @update:reply-content="onUpdateReplyContent"
      />
    </template>

    <!-- 加载更多子评论按钮 -->
    <div
        v-if="flattenedComments.length > initialVisibleChildren && !expanded"
        class="load-more-replies"
        @click="expand"
    >
      <down-outlined/>
      <span>查看全部 {{ flattenedComments.length }} 条回复</span>
    </div>

    <!-- 收起子评论按钮 -->
    <div
        v-if="flattenedComments.length > initialVisibleChildren && expanded"
        class="collapse-replies"
        @click="collapse"
    >
      <up-outlined/>
      <span>收起回复</span>
    </div>
  </div>
</template>

<script>
import {ref, computed, defineComponent, nextTick, watch, onMounted} from 'vue';
import dayjs from 'dayjs';
import {message, Modal} from 'ant-design-vue';
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  FlagOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
  MoreOutlined
} from '@ant-design/icons-vue';
import EmojiPicker from "@/components/comment/EmojiPicker.vue";

import {useUserReactionStore} from '@/stores/userReaction';

// 递归地将评论树平铺为一维数组
const flattenCommentTree = (comments) => {
  if (!comments || !comments.length) return [];

  // 先对子评论按时间降序排序（最新的在最前面）
  const sortedComments = [...comments].sort(
      (a, b) => new Date(b.createTime) - new Date(a.createTime)
  );

  let result = [];
  for (const comment of sortedComments) {
    result.push(comment);
    if (comment.children && comment.children.length > 0) {
      // 递归处理子评论
      const childrenFlattened = flattenCommentTree(comment.children);
      result = result.concat(childrenFlattened);
    }
  }

  return result;
};

// 递归组件必须有名称
export default defineComponent({
  name: 'Comment',
  components: {
    EmojiPicker,
    LikeOutlined,
    LikeFilled,
    CommentOutlined,
    FlagOutlined,
    DeleteOutlined,
    DownOutlined,
    UpOutlined,
    MoreOutlined
  },
  props: {
    // 评论数据
    comment: {
      type: Object,
      required: true,
    },
    // 当前登录用户ID
    currentUserId: {
      type: [String, Number],
      default: null,
    },
    // 是否为回复
    isReply: {
      type: Boolean,
      default: false,
    },
    // 是否为嵌套回复
    isNestedReply: {
      type: Boolean,
      default: false,
    },
    // 嵌套级别
    nestLevel: {
      type: Number,
      default: 0
    },
    // 内容作者ID
    contentAuthorId: {
      type: [String, Number],
      default: null,
    },
    // 是否直接显示子评论
    shouldRenderChildren: {
      type: Boolean,
      default: true
    },
    // 是否显示回复框
    isShowingReplyBox: {
      type: Boolean,
      default: false
    },
    // 当前活跃的回复评论ID
    activeReplyId: {
      type: [String, Number],
      default: null
    },
    // 提交中状态
    submitting: {
      type: Boolean,
      default: false
    },
    // 用户头像
    userAvatar: {
      type: String,
      default: ''
    },
    // 是否为子评论组件（用于避免重复渲染子评论）
    isChildrenComponent: {
      type: Boolean,
      default: false
    },
    // 当前需要高亮的评论ID
    activeHighlightId: {
      type: [String, Number],
      default: null
    },

    // 是否自动展开当前评论的子评论
    autoExpandChildren: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'reply',
    'like',
    'delete',
    'report',
    'submit-reply',
    'cancel-reply',
    'update:reply-content'
  ],
  setup(props, {emit}) {
    // 状态
    const expanded = ref(false);
    const initialVisibleChildren = 5; // 默认显示的子评论数量
    const replyTextarea = ref(null);
    const localReplyContent = ref('');
    const likeLoading = ref(false);
    const showReplyEmojiPicker = ref(false);


    const likePulse = ref(false);  // 新增点赞脉冲状态
    const likeAnimationTimeout = ref(null);

    // 获取用户反应状态 store
    const userReactionStore = useUserReactionStore();

    // 添加高亮状态
    const isHighlighted = ref(false);

    // 监听 props.comment.id 是否等于 activeHighlightId
    watch(() => props.activeHighlightId, (newId) => {
      if (newId && newId.toString() === props.comment.id.toString()) {
        isHighlighted.value = true;

        // 延长高亮时间，与动画时长保持一致为 4 秒
        setTimeout(() => {
          isHighlighted.value = false;
        }, 4000);

        // 如果评论在视野外，尝试滚动到评论位置
        nextTick(() => {
          const element = document.querySelector(`[data-comment-id="${props.comment.id}"]`);
          if (element) {
            // 使用 scrollIntoView 确保评论在视野内，并使用平滑滚动效果
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    });

    // 如果收到展开子评论的事件，自动展开
    watch(() => props.autoExpandChildren, (shouldExpand) => {
      if (shouldExpand) {
        expanded.value = true;
      }
    });

    // 计算属性 - 当前评论的点赞状态
    const isLiked = computed(() => {
      // 首先检查 userReactionStore 中的状态
      const storeStatus = userReactionStore.isCommentLiked(props.comment.id);
      // 如果 store 中有状态，则使用 store 中的状态
      if (storeStatus !== undefined) {
        return storeStatus;
      }
      // 否则回退到评论对象自带的状态
      return !!props.comment.hasLiked;
    });

    // 计算属性 - 当前评论的点赞数
    const likeCount = computed(() => {
      // 首先检查 userReactionStore 中的计数
      const storeCount = userReactionStore.getCommentLikeCount(props.comment.id);
      if (storeCount !== undefined && storeCount > 0) {
        return storeCount;
      }
      // 否则回退到评论对象自带的点赞数
      return props.comment.likeCount || 0;
    });

    // 检查是否有子评论
    const hasChildren = computed(() => {
      return props.comment.children && props.comment.children.length > 0;
    });

    // 将评论树平铺为一维数组
    const flattenedComments = computed(() => {
      if (!hasChildren.value) return [];
      return flattenCommentTree(props.comment.children);
    });

    // 计算可见的平铺评论列表
    const visibleFlattenedComments = computed(() => {
      if (!hasChildren.value) return [];

      // 这里不需要额外排序，因为 flattenedComments 已经排好序了
      if (expanded.value) {
        // 展开状态：显示所有平铺评论
        return flattenedComments.value;
      } else {
        // 折叠状态：只显示前几条平铺评论
        return flattenedComments.value.slice(0, initialVisibleChildren);
      }
    });

    // 计算属性：是否为评论作者
    const isCommentOwner = computed(() => {
      return props.currentUserId &&
          props.comment.user?.id.toString() === props.currentUserId.toString();
    });

    // 计算属性：是否为内容作者
    const isAuthor = computed(() => {
      return props.contentAuthorId &&
          props.comment.user?.id.toString() === props.contentAuthorId.toString();
    });

    // 判断是否是回复另一条回复（而不是直接回复顶级评论）
    const isReplyToReply = (comment) => {
      // 如果有replyUser且parentId不等于rootId，则说明是回复其他回复
      return comment.replyUser && comment.parentId && comment.rootId && comment.parentId !== comment.rootId;
    };

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return '';

      const commentDate = dayjs(time);
      const now = dayjs();
      const diffMinutes = now.diff(commentDate, 'minute');

      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;

      const diffHours = now.diff(commentDate, 'hour');
      if (diffHours < 24) return `${diffHours}小时前`;

      const diffDays = now.diff(commentDate, 'day');
      if (diffDays < 30) return `${diffDays}天前`;

      // 超过30天显示具体日期
      return commentDate.format('YYYY-MM-DD HH:mm');
    };

    // 展开全部回复
    const expand = () => {
      expanded.value = true;
    };

    // 收起回复
    const collapse = () => {
      expanded.value = false;
    };

    // 处理回复事件
    const handleReply = () => {
      emit('reply', {
        id: props.comment.id,
        author: {
          id: props.comment.user?.id,
          name: props.comment.user?.username
        },
        rootId: props.comment.rootId || props.comment.id
      });
    };

    // 回复内容变化
    const onReplyContentChange = (e) => {
      emit('update:reply-content', localReplyContent.value);
    };

    // 更新子评论的回复内容
    const onUpdateReplyContent = (content) => {
      emit('update:reply-content', content);
    };

    // 提交回复
    const submitReply = () => {
      emit('submit-reply', {
        commentId: props.comment.id,
        content: localReplyContent.value,
        author: {
          id: props.comment.user?.id,
          name: props.comment.user?.username
        },
        rootId: props.comment.rootId || props.comment.id
      });
      localReplyContent.value = ''; // 清空本地回复内容
    };

    // 取消回复
    const cancelReply = () => {
      localReplyContent.value = '';
      emit('cancel-reply');
    };

    // 处理子评论的回复事件
    const onChildReply = (data) => {
      // 将事件冒泡到上层
      emit('reply', data);
    };

    // 处理子评论的提交回复事件
    const onSubmitReply = (data) => {
      emit('submit-reply', data);
    };

    // 处理子评论的取消回复事件
    const onCancelReply = () => {
      emit('cancel-reply');
    };

    const toggleLike = async () => {
      if (!props.currentUserId) {
        message.warning('请先登录后再操作');
        return;
      }

      try {
        // 防止重复点击
        if (likeLoading.value) return;

        likeLoading.value = true;

        // 触发视觉反馈动画
        likePulse.value = true;
        if (likeAnimationTimeout.value) clearTimeout(likeAnimationTimeout.value);
        likeAnimationTimeout.value = setTimeout(() => {
          likePulse.value = false;
        }, 400);

        emit('like', props.comment.id);
      } catch (error) {
        console.error('点赞操作失败:', error);
        message.error('操作失败，请稍后重试');
      } finally {
        likeLoading.value = false;
      }
    };


    // 处理子评论的点赞事件
    const onChildLike = (commentId, isLiked) => {
      // 将事件冒泡到上层
      emit('like', commentId, isLiked);
    };

    // 显示删除确认对话框
    const showDeleteConfirm = () => {
      Modal.confirm({
        title: '确定要删除这条评论吗？',
        content: '删除后将无法恢复',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          handleDelete();
        }
      });
    };

    // 处理删除评论
    const handleDelete = () => {
      emit('delete', props.comment.id);
    };

    // 处理子评论的删除事件
    const onChildDelete = (commentId) => {
      // 将事件冒泡到上层
      emit('delete', commentId);
    };

    // 处理举报评论
    const handleReport = () => {
      emit('report', props.comment.id);
    };

    // 处理子评论的举报事件
    const onChildReport = (commentId) => {
      // 将事件冒泡到上层
      emit('report', commentId);
    };

    const toggleReplyEmojiPicker = (event) => {
      // 阻止事件冒泡，防止立即被document点击事件关闭
      event.stopPropagation();
      showReplyEmojiPicker.value = !showReplyEmojiPicker.value;
    };

    const insertReplyEmoji = (emoji) => {
      localReplyContent.value += emoji;
      //  插入标签后触发更新事件
      emit('update:reply-content', localReplyContent.value);
    };

    // 监听显示回复框状态变化，自动聚焦
    watch(() => props.isShowingReplyBox, (newValue) => {
      if (newValue) {
        nextTick(() => {
          if (replyTextarea.value) {
            replyTextarea.value.focus();
          }
        });
      }
    });


    // 在组件挂载时获取评论的点赞状态
    onMounted(async () => {
      if (props.comment?.id) {
        try {
          // 明确指定 targetType 为 'comment'
          // 强制刷新点赞状态和计数
          await userReactionStore.getStatus(props.comment.id, 'comment', true);
          await userReactionStore.getCounts(props.comment.id, 'comment', true);
        } catch (error) {
          console.error('获取评论状态失败:', error);
        }
      }
    });

    return {
      expanded,
      initialVisibleChildren,
      hasChildren,
      flattenedComments,
      visibleFlattenedComments,
      replyTextarea,
      localReplyContent,
      isCommentOwner,
      isAuthor,
      isReplyToReply,
      formatTime,
      expand,
      collapse,
      handleReply,
      onChildReply,
      toggleLike,
      onChildLike,
      showDeleteConfirm,
      handleDelete,
      onChildDelete,
      handleReport,
      onChildReport,
      onReplyContentChange,
      submitReply,
      cancelReply,
      onSubmitReply,
      onCancelReply,
      onUpdateReplyContent,
      showReplyEmojiPicker,
      toggleReplyEmojiPicker,
      insertReplyEmoji,
      likeLoading,
      likePulse,
      isLiked,
      likeCount,
    };
  }
});
</script>

<style scoped>
.comment {
  display: flex;
  margin-bottom: 16px;
  position: relative;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 12px;
}

.comment:hover {
  background-color: rgba(249, 250, 251, 0.9);
  transform: translateX(4px);
}

.comment-avatar {
  flex-shrink: 0;
  margin-right: 16px;
  position: relative;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.comment:hover .avatar {
  transform: scale(1.08);
  border-color: #e6e8ff;
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #262626;
  margin-right: 8px;
  transition: color 0.2s ease;
}

.comment:hover .username {
  color: #4f46e5;
}

.user-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 6px;
  height: 20px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.admin-tag {
  background-color: #f0f3ff;
  color: #5247e8;
  border: 1px solid #dfe3ff;
}

.author-tag {
  background-color: #fff7e6;
  color: #d48806;
  border: 1px solid #ffe7ba;
}

.comment:hover .admin-tag {
  background-color: #e1e7ff;
  transform: translateY(-1px);
}

.comment:hover .author-tag {
  background-color: #ffeed6;
  transform: translateY(-1px);
}

.comment-text {
  font-size: 15px;
  color: #262626;
  line-height: 1.7;
  margin: 0;
  word-break: break-word;
  transition: all 0.2s ease;
}

.comment:hover .comment-text {
  color: #000000;
}

/* 优化按钮中图标与文本的对齐 */
.action-btn {
  font-size: 13px;
  color: #8c8c8c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  background: transparent !important;
  line-height: 1;
  height: 24px;
  position: relative;
}

.action-btn:hover,
.action-btn:focus,
.action-btn:active {
  background-color: transparent !important;
  color: var(--primary-color, #6366f1);
}

/* 对于点赞按钮，特殊处理 */
.action-btn.like-btn.liked {
  color: #6366f1 !important;
  background-color: transparent !important;
}

/* 图标容器对齐修复 */
.like-icon-wrapper,
.action-btn .anticon,
.action-btn .iconfont {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px;
  height: 16px;
  line-height: 1;
}

/* 调整图标内部对齐 */
.action-btn .iconfont {
  position: relative;
  top: -1px; /* 微调图标垂直位置 */
}

/* 按钮内部文本对齐 */
.action-btn > span,
.action-btn > :not(.ant-btn-icon) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

/* 所有图标与文本对齐 */
.action-btn .ant-btn-icon + span {
  margin-left: 4px;
  position: relative;
  top: 0;
}

/* 点赞数量的对齐调整 */
.like-count {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  min-width: 14px;
}

.nested-comments {
  position: relative;
  margin-left: 38px;
  padding-left: 22px;
  border-left: 2px dashed rgba(230, 232, 240, 0.7);
  transition: border-left 0.3s ease;
}

.nested-comments:hover {
  border-left: 2px dashed #a5b4fc;
}

/* 全局动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 应用动画效果到新元素 */
.comment-item {
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
  margin-bottom: 12px;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.like-btn:active {
  animation: pulse 0.3s ease;
}

.reply-input-container {
  animation: fadeInUp 0.3s ease-out;
}

.load-more-replies, .collapse-replies {
  transition: all 0.3s ease;
  opacity: 0.85;
}

.load-more-replies:hover, .collapse-replies:hover {
  transform: translateY(-2px);
  opacity: 1;
  color: #4338ca;
}

.load-more-replies .anticon, .collapse-replies .anticon {
  transition: transform 0.3s ease;
}

.load-more-replies:hover .anticon {
  transform: translateY(3px);
}

.collapse-replies:hover .anticon {
  transform: translateY(-3px);
}

/* 回复评论的样式调整 */
.reply-comment {
  margin-bottom: 8px;
}

/* 简化嵌套级别样式 - 只使用两级缩进 */
.nest-level-0 {
  margin-left: 0;
}

.nest-level-1 {
  margin-left: 36px; /* 统一的缩进距离 */
}

/* 确保子评论容器不添加额外的缩进 */
.nested-comments {
  margin-left: 0;
  margin-top: 8px;
  margin-bottom: 12px;
}

.comment-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

/* 所有回复评论使用相同大小的头像 */
.reply-comment .avatar {
  width: 36px;
  height: 36px;
}

.comment-content {
  flex-grow: 1;
  min-width: 0; /* 确保内容可以被压缩 */
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.username {
  font-weight: 500;
  color: #262626;
  font-size: 14px;
  margin-right: 8px;
}

.reply-to {
  color: #8c8c8c;
  font-size: 13px;
  margin-right: 8px;
}

.reply-username {
  color: #6366f1;
  font-weight: 500;
}

.user-tag {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 4px;
  margin-left: 4px;
  height: 18px;
  line-height: 18px;
}

.admin-tag {
  background-color: #f6f7ff;
  color: #6366f1;
  border: 1px solid #e6e8ff;
}

.author-tag {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffe7ba;
}

/* 评论时间放到操作区左侧 */
.comment-time-mobile {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 12px;
  display: inline-block;
  flex-shrink: 0;
}

.comment-body {
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  color: #262626;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

/* 调整评论操作区布局 */
.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 左侧操作按钮组 */
.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 右侧操作按钮组 */
.right-actions {
  display: flex;
  justify-content: flex-end;
}

/* 评论时间样式 */
.comment-time-mobile {
  font-size: 12px;
  color: #8c8c8c;
  display: inline-block;
  margin-right: 4px;
}

/* 内联回复框样式优化 */
.reply-input-container.inline-reply-box {
  display: flex;
  margin-top: 12px;
  margin-bottom: 12px;
  margin-left: 36px;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
}

.reply-input-container.inline-reply-box:hover {
  border-color: #e6e6e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reply-input-container .avatar-wrapper {
  flex-shrink: 0;
  margin-right: 12px;
}

.reply-input-container .user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reply-input-container .input-wrapper {
  flex-grow: 1;
}

.reply-textarea {
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  transition: all 0.3s;
  font-size: 14px;
  resize: none;
  padding: 10px 12px;
  background-color: white;
}

.reply-textarea:hover {
  border-color: #d9d9d9;
}

.reply-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.reply-controls {
  display: flex;
  justify-content: flex-start; /* 改为从左侧开始排列 */
  align-items: center;
  margin-top: 12px;
  gap: 16px; /* 添加间距 */
}

.button-group {
  margin-left: auto; /* 这会将按钮组推到最右侧 */
  display: flex;
  gap: 12px;
}

.button-group .ant-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
}

/* 修改后 */
.button-group .ant-btn:hover {
  border-color: #d9d9e3; /* 浅灰色边框 */
  color: #4f46e5; /* 深紫色文字，与主题一致 */
  background-color: #f5f5f8; /* 浅灰背景 */
}

/* 确保普通按钮在所有状态下都与主题一致 */
.button-group .ant-btn:focus,
.button-group .ant-btn:active {
  border-color: #d9d9e3;
  color: #4f46e5;
  background-color: #f5f5f8;
}

/* 取消按钮特定样式 */
.button-group .ant-btn:not(.ant-btn-primary):hover {
  background-color: #f5f5f8;
  color: #4f46e5;
  border-color: #d9d9e3;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
}

.button-group .ant-btn-primary {
  background-color: #6366f1;
}

.button-group .ant-btn-primary:hover {
  background-color: #5258ea;
}

/* 加载更多回复按钮 */
.load-more-replies {
  display: flex;
  align-items: center;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-top: 4px;
  margin-left: 36px; /* 与回复评论保持一致的缩进 */
}

.load-more-replies:hover {
  color: #4f46e5;
}

.load-more-replies .anticon {
  margin-right: 6px;
}

/* 收起回复按钮 */
.collapse-replies {
  display: flex;
  align-items: center;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-top: 4px;
  margin-left: 36px; /* 与回复评论保持一致的缩进 */
}

.collapse-replies:hover {
  color: #4f46e5;
}

.collapse-replies .anticon {
  margin-right: 6px;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .comment-avatar {
    margin-right: 8px;
  }

  .avatar,
  .reply-comment .avatar,
  .reply-input-container .user-avatar {
    width: 32px;
    height: 32px;
  }

  .username, .comment-text {
    font-size: 13px;
  }

  .reply-to, .comment-time-mobile {
    font-size: 12px;
  }

  .action-btn {
    font-size: 12px;
    padding: 2px 6px;
  }

  .action-buttons {
    gap: 5px;
  }

  /* 移动端减少缩进 */
  .nest-level-1,
  .load-more-replies,
  .collapse-replies,
  .reply-input-container.inline-reply-box {
    margin-left: 20px;
  }

  /* 移动端回复框样式调整 */
  .reply-input-container.inline-reply-box {
    padding: 12px;
  }

  .button-group .ant-btn {
    padding: 0 12px;
    height: 30px;
    font-size: 13px;
  }
}

/* 统一所有头像包装器 */
.avatar-wrapper, .reply-input-container .avatar-wrapper {
  flex-shrink: 0;
  margin-right: 16px;
  position: relative;
  width: 44px;
}

/* 统一所有输入框包装器 */
.input-wrapper, .reply-input-container .input-wrapper {
  flex-grow: 1;
  min-width: 0;
  max-width: calc(100% - 60px);
  width: 100%;
}

/* 统一所有按钮组 */
.button-group {
  display: flex;
  gap: 12px;
}

/* 统一所有按钮样式 */
.button-group .ant-btn {
  height: 38px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 统一所有主按钮样式 */
.button-group .ant-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  border: none;
}

/* 统一所有主按钮悬停样式 */
.button-group .ant-btn-primary:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.25);
}

/* 修改回复框的样式，使其与主评论框一致 */
.reply-input-container.inline-reply-box {
  margin-left: 36px;
  background-color: rgba(249, 250, 251, 0.7);
  border: 1px dashed rgba(230, 232, 240, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.reply-input-container.inline-reply-box:focus-within {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.reply-input-container .user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reply-input-container:focus-within .user-avatar {
  border-color: #6366f1;
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .reply-input-container.inline-reply-box {
    padding: 16px;
  }

  .user-avatar, .reply-input-container .user-avatar {
    width: 38px;
    height: 38px;
  }

  .button-group .ant-btn {
    height: 36px;
    padding: 0 16px;
  }
}

@media (max-width: 576px) {
  .reply-input-container.inline-reply-box {
    padding: 12px;
  }

  .avatar-wrapper, .reply-input-container .avatar-wrapper {
    margin-right: 12px;
    width: 36px;
  }

  .user-avatar, .reply-input-container .user-avatar {
    width: 36px;
    height: 36px;
  }

  .input-wrapper, .reply-input-container .input-wrapper {
    max-width: calc(100% - 48px);
  }

  .button-group .ant-btn {
    height: 34px;
    padding: 0 14px;
    font-size: 13px;
  }

  .reply-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }
}

/* 点赞按钮加载状态样式 */
.like-btn.ant-btn-loading {
  background-color: transparent !important;
  border-color: transparent !important;
  color: #8c8c8c;
}

/* 点赞图标动效 */
.like-btn:active .anticon {
  transform: scale(1.2);
  transition: transform 0.2s;
}

/* 表情选择器弹出层 */
.emotion-selector {
  position: relative;
}

.emoji-picker {
  position: absolute;
  left: 0;
  bottom: 40px;
  z-index: 100;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

/* 针对移动设备的调整 */
@media (max-width: 576px) {
  .emoji-picker {
    left: -100px;
  }

  /* 确保表情选择器在移动设备上不会太宽 */
  :deep(.emoji-mart) {
    max-width: 280px !important;
  }
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

/* 点赞按钮脉冲效果 */
@keyframes pulseLike {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}



/* 重要：回复按钮图标与文本对齐修复 */
.reply-btn {
  position: relative;
  color: #a0a0a0 !important;
}

.reply-btn .iconfont {
  position: relative;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}


.reply-btn:hover {
  color: var(--primary-color, #6366f1) !important; /* 悬停时变为主题色 */
}

.like-btn.liked .btn-icon {
  color: #6366f1 !important; /* 强制使用紫色 */
}


.reply-btn > span:last-child {
  position: relative;
  top: 0;
  display: inline-flex;
  align-items: center;
}

/* 修复回复图标与文本的对齐 */
.action-btn .iconfont + span,
.action-btn > :not(.ant-btn-icon) + span {
  margin-left: 4px;
  line-height: 1;
  position: relative;
  display: inline-flex;
  align-items: center;
}



/* 统一按钮间距和样式 */
.custom-btn {
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  user-select: none;
  transition: all 0.2s;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1;
  height: 24px;
  position: relative;
  cursor: pointer;
  gap: 1px;
}

/* 调整图标与文本的间距 */
.custom-btn .btn-text {
  margin-left: 1px; /* 从原来的间距大幅减小 */
  display: inline-flex;
  align-items: center;
}

.like-btn .btn-text {
  color: inherit;
}

/* 当点赞激活时的文字颜色 */
.like-btn.liked .btn-text {
  color: #6366f1;
}

/* 回复按钮图标与文字间距优化 */
.reply-btn .btn-icon + .btn-text {
  margin-left: 1px;
}


/* 超级强烈高亮效果 - 无法被忽略的版本 */
.comment.highlight-comment {
  background-color: #4338ca !important;
  color: white !important;
  border-radius: 12px !important;
  box-shadow: 0 0 0 4px #6366f1, 0 0 20px rgba(99, 102, 241, 0.6) !important;
  transform: scale(1.02) !important;
  z-index: 10 !important;
  position: relative !important;
  animation: super-highlight-flash 2s infinite !important; /* 永久闪烁效果 */
}

/* 闪烁动画 */
@keyframes super-highlight-flash {
  0%, 100% {
    background-color: #4338ca;
    box-shadow: 0 0 0 4px #6366f1, 0 0 20px rgba(99, 102, 241, 0.6);
  }
  50% {
    background-color: #6366f1;
    box-shadow: 0 0 0 4px #818cf8, 0 0 30px rgba(99, 102, 241, 0.8);
  }
}

/* 确保所有文本在高亮背景上可见 */
.comment.highlight-comment .comment-text,
.comment.highlight-comment .username,
.comment.highlight-comment .comment-time-mobile {
  color: white !important;
  font-weight: bold !important;
}

/* 添加超明显的"新回复"标记 */
.comment.highlight-comment::before {
  content: "👉 新回复!";
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: bounce-in 0.5s ease-out;
  z-index: 11;
}

@keyframes bounce-in {
  0% { transform: translateX(-50%) scale(0); }
  50% { transform: translateX(-50%) scale(1.2); }
  100% { transform: translateX(-50%) scale(1); }
}

/* 必要时修改按钮颜色以确保在深色背景上可见 */
.comment.highlight-comment .custom-btn {
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

</style>