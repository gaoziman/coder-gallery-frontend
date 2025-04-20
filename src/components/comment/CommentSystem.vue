<template>
  <div class="comment-system">
    <!-- 评论区标题 -->
    <div class="comment-section-header">
      <h2 class="section-title">
        <comment-outlined class="section-icon"/>
        评论 ({{ commentTotal }})
      </h2>
      <!-- 排序控制区 -->
      <div class="comment-filters">
        <a-dropdown :trigger="['click']">
          <a-button type="link" class="sort-button">
            <template #icon>
              <sort-ascending-outlined/>
            </template>
            {{ sortLabelMap[sortType] }}
            <down-outlined/>
          </a-button>
          <template #overlay>
            <a-menu @click="handleSortChange">
              <a-menu-item key="latest">
                <clock-circle-outlined/>
                最新发布
              </a-menu-item>
              <a-menu-item key="hottest">
                <fire-outlined/>
                最热排序
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-section">
      <div class="avatar-wrapper">
        <img
            :src="userAvatar"
            class="user-avatar"
            :alt="isLoggedIn ? '用户头像' : '未登录用户'"
        />
      </div>
      <div class="input-wrapper">
        <a-textarea
            v-model:value="commentContent"
            placeholder="添加评论..."
            :auto-size="{ minRows: 2, maxRows: 6 }"
            :disabled="!isLoggedIn"
            class="comment-textarea"
            @focus="handleTextareaFocus"
        />

        <div class="comment-controls" v-if="isInputActive || commentContent">
          <div class="emotion-selector">
            <a-button type="text" @click="toggleEmojiPicker">
              <template #icon>
                <smile-outlined/>
              </template>
            </a-button>
            <!-- 表情选择器 -->
            <div v-if="showEmojiPicker" class="emoji-picker">
              <EmojiPicker
                  :width="400"
                  :emojiSize="20"
                  :showPreview="true"
                  :theme="'light'"
                  :closeOnClickOutside="true"
                  @select="insertEmoji"
                  @close="showEmojiPicker = false"
              />
            </div>
          </div>

          <div class="button-group">
            <a-button @click="resetComment">取消</a-button>
            <a-button
                type="primary"
                :disabled="!commentContent.trim()"
                :loading="submitting"
                @click="submitComment"
            >
              发表评论
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-section">
      <a-spin :spinning="loading">
        <!-- 无评论时显示提示 -->
        <div v-if="!loading && comments.length === 0" class="empty-comment">
          <empty-outlined/>
          <p>暂无评论，快来发表第一条评论吧</p>
        </div>

        <!-- 评论列表 -->
        <div v-else class="comment-list">
          <!-- 只渲染可见的顶级评论，子评论通过递归组件处理 -->
          <div
              v-for="comment in visibleComments"
              :key="comment.id"
              class="comment-item root-comment"
          >
            <!-- 评论内容和基本操作 -->
            <Comment
                :comment="comment"
                :current-user-id="currentUserId"
                :content-author-id="contentAuthorId"
                :nest-level="0"
                :is-showing-reply-box="activeReplyId === comment.id"
                :active-reply-id="activeReplyId"
                :active-highlight-id="activeHighlightId"
                :auto-expand-children="expandedCommentIds.has(comment.id)"
                :user-avatar="userAvatar"
                :submitting="submitting"
                @reply="handleReply"
                @like="handleLikeComment"
                @delete="handleDeleteComment"
                @report="handleReportComment"
                @submit-reply="handleSubmitReply"
                @cancel-reply="handleCancelReply"
                @update:reply-content="updateReplyContent"
            />
          </div>

          <!-- 加载更多顶级评论按钮 -->
          <div
              v-if="shouldShowMoreRootCommentsButton"
              class="show-more-root-comments"
              @click="expandAllRootComments"
          >
            <div class="action-button">
              <down-outlined />
              <span>查看全部 {{ sortedComments.length }} 条评论</span>
            </div>
          </div>

          <!-- 收起顶级评论按钮 -->
          <div
              v-if="shouldShowLessRootCommentsButton"
              class="collapse-root-comments"
              @click="collapseRootComments"
          >
            <div class="action-button">
              <up-outlined />
              <span>收起评论列表</span>
            </div>
          </div>

          <!-- 加载更多分页评论按钮 -->
          <div
              v-if="hasMoreComments"
              class="load-more-comments"
              @click="loadMoreComments"
          >
            <a-button :loading="loadingMore">
              <template #icon>
                <down-outlined />
              </template>
              加载更多评论
            </a-button>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>


<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {message} from 'ant-design-vue';
import {
  CommentOutlined,
  SmileOutlined,
  SortAscendingOutlined,
  DownOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons-vue';
import {useUserStore} from '@/stores/user';
import {commentService} from '@/services/commentService';
import Comment from '@/components/comment/Comment.vue';
import EmojiPicker from "@/components/comment/EmojiPicker.vue";

import {useUserReactionStore} from '@/stores/userReaction';


// Props
const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true,
  },
  contentType: {
    type: String,
    default: 'picture',
  },
  initialComments: {
    type: Array,
    default: () => [],
  },
  initialTotal: {
    type: Number,
    default: 0,
  },
  contentAuthorId: {
    type: [String, Number],
    default: null,
  }
});

const userReactionStore = useUserReactionStore();

// Emits
const emit = defineEmits(['update', 'updated']);

// 加载评论相关状态
const loading = ref(true);
const loadingMore = ref(false);
const comments = ref(props.initialComments || []);
const commentTotal = ref(props.initialTotal || 0);
const page = ref(1);
const hasMoreComments = computed(() => comments.value.length < commentTotal.value);

// 用户身份相关
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentUserId = computed(() => userStore.userInfo?.id);
const userAvatar = computed(() =>
    userStore.userInfo?.avatar ||
    `https://api.dicebear.com/7.x/micah/svg?seed=fallback`
);

// 评论输入相关
const commentContent = ref('');
const submitting = ref(false);
const isInputActive = ref(false);
const showEmojiPicker = ref(false);

// 回复相关状态
const replyContent = ref('');
const activeReplyId = ref(null); // 当前正在回复的评论ID


// 默认显示的顶级评论数量
const initialVisibleRootComments = 3;
// 是否展开所有顶级评论
const expandedRootComments = ref(false);

const activeHighlightId = ref(null); // 当前需要高亮的评论ID
const expandedCommentIds = ref(new Set()); // 已展开的评论ID集合

const shouldKeepExpanded = ref(false);

// 计算可见的顶级评论
const visibleComments = computed(() => {
  if (expandedRootComments.value || sortedComments.value.length <= initialVisibleRootComments) {
    return sortedComments.value;
  } else {
    return sortedComments.value.slice(0, initialVisibleRootComments);
  }
});

// 是否显示"查看更多评论"按钮
const shouldShowMoreRootCommentsButton = computed(() => {
  return !expandedRootComments.value && sortedComments.value.length > initialVisibleRootComments;
});

// 是否显示"收起评论"按钮
const shouldShowLessRootCommentsButton = computed(() => {
  return expandedRootComments.value && sortedComments.value.length > initialVisibleRootComments;
});

// 展开所有顶级评论
const expandAllRootComments = () => {
  expandedRootComments.value = true;
};

// 收起顶级评论
const collapseRootComments = () => {
  expandedRootComments.value = false;
  // 平滑滚动到评论区顶部
  const commentSection = document.querySelector('.comment-system');
  if (commentSection) {
    commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


watch(
    () => comments.value,
    () => {
      // 只有当不需要保持展开状态时，才重置
      if (!shouldKeepExpanded.value) {
        expandedRootComments.value = false;
      } else {
        // 重置标志，以便下次刷新时恢复默认行为
        shouldKeepExpanded.value = false;
      }
    }
);

// 查找指定ID的评论内容
const findCommentById = (commentId, commentsList) => {
  if (!commentsList) return null;

  for (const comment of commentsList) {
    if (comment.id.toString() === commentId.toString()) {
      return comment;
    }

    // 递归查找子评论
    if (comment.children && comment.children.length > 0) {
      const found = findCommentById(commentId, comment.children);
      if (found) return found;
    }
  }

  return null;
};

// 评论排序相关
const sortType = ref('latest'); // 'latest' 或 'hottest'
const sortLabelMap = {
  latest: '最新发布',
  hottest: '最热排序',
};

// 排序后的评论列表 (只针对顶级评论排序)
const sortedComments = computed(() => {
  if (sortType.value === 'latest') {
    return [...comments.value].sort(
        (a, b) => new Date(b.createTime) - new Date(a.createTime)
    );
  } else {
    return [...comments.value].sort((a, b) => {
      // 优先按是否置顶排序
      if (a.isTop !== b.isTop) return b.isTop ? 1 : -1;
      // 然后按是否热门排序
      if (a.isHot !== b.isHot) return b.isHot ? 1 : -1;
      // 最后按点赞数排序
      return (b.likeCount || 0) - (a.likeCount || 0);
    });
  }
});

// 处理排序方式变更
const handleSortChange = (e) => {
  sortType.value = e.key;
};

// 处理评论框获取焦点
const handleTextareaFocus = () => {
  if (!isLoggedIn.value) {
    message.warning('请先登录后再评论');
    return;
  }
  isInputActive.value = true;
};

const insertEmoji = (emoji) => {
  commentContent.value += emoji;
};

// 切换表情选择器
const toggleEmojiPicker = (event) => {
  // 阻止事件冒泡，防止立即被document点击事件关闭
  event.stopPropagation();
  showEmojiPicker.value = !showEmojiPicker.value;
};

// 重置评论输入
const resetComment = () => {
  commentContent.value = '';
  isInputActive.value = false;
  showEmojiPicker.value = false;
};

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn.value) {
    message.warning('请先登录后再评论');
    return;
  }

  if (!commentContent.value.trim()) {
    message.warning('评论内容不能为空');
    return;
  }

  try {
    submitting.value = true;

    const result = await commentService.addComment({
      contentId: props.contentId,
      content: commentContent.value.trim(),
      contentType: props.contentType
    });

    if (result.success) {
      message.success('评论发布成功');
      resetComment();
      // 重新加载评论列表以获取最新数据
      await fetchComments();
      emit('updated');
    }
  } catch (error) {
    console.error('发布评论失败:', error);
    message.error('评论发布失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 处理回复点击
const handleReply = (data) => {
  if (!isLoggedIn.value) {
    message.warning('请先登录后再回复');
    return;
  }

  // 如果点击的是同一条评论的回复按钮，则关闭回复框
  if (activeReplyId.value === data.id) {
    activeReplyId.value = null;
    replyContent.value = '';
    return;
  }

  // 设置当前活跃回复ID
  activeReplyId.value = data.id;
  replyContent.value = '';
};

// 更新回复内容
const updateReplyContent = (content) => {
  replyContent.value = content;
};

// 取消回复
const handleCancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = '';
};

// 提交回复
const handleSubmitReply = async (data) => {
  if (!isLoggedIn.value) {
    message.warning('请先登录后再回复');
    return;
  }

  if (!replyContent.value.trim()) {
    message.warning('回复内容不能为空');
    return;
  }

  try {
    submitting.value = true;

    // 查找要回复的评论
    const targetComment = findCommentById(data.commentId, comments.value);

    if (!targetComment) {
      message.warning('回复目标不存在');
      return;
    }

    const replyData = {
      content: replyContent.value.trim(),
      parentId: data.commentId,
      contentId: props.contentId,
      contentType: props.contentType,
      replyUserId: data.author?.id,
      rootId: data.rootId || data.commentId
    };

    // 保存当前回复的评论ID和根评论ID，用于后续自动展开和定位
    const currentReplyId = data.commentId;
    const rootCommentId = data.rootId || data.commentId;

    const result = await commentService.addCommentReply(replyData);

    if (result.success) {
      message.success('回复发布成功');
      activeReplyId.value = null;
      replyContent.value = '';

      // 设置标志，表示需要保持展开状态
      shouldKeepExpanded.value = true;

      // 记录需要展开和高亮的评论ID
      expandedCommentIds.value.add(rootCommentId);

      // 重新加载评论列表以获取最新数据
      await fetchComments();

      // 确保能看到新回复所在的顶级评论（如果使用了折叠功能）
      expandedRootComments.value = true;

      // 设置需要高亮的评论ID
      activeHighlightId.value = currentReplyId;

      // 延迟执行，确保DOM已更新
      setTimeout(() => {
        // 滚动到相应评论位置
        const replyElement = document.querySelector(`[data-comment-id="${currentReplyId}"]`);
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      emit('updated');
    }
  } catch (error) {
    console.error('发布回复失败:', error);
    message.error('回复发布失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 处理评论点赞
const handleLikeComment = async (commentId) => {
  try {
    // 确保用户已登录
    if (!isLoggedIn.value) {
      message.warning('请先登录后再操作');
      return;
    }

    // 使用 userReactionStore 进行点赞操作
    const result = await userReactionStore.toggleLikeComment(commentId);

    if (result) {
      // 触发更新事件，但不需要刷新整个列表
      emit('updated');
    }
  } catch (error) {
    console.error('评论点赞操作失败:', error);
  }
};

// 处理评论删除
const handleDeleteComment = async (commentId) => {
  if (!isLoggedIn.value) {
    message.warning('请先登录后再操作');
    return;
  }

  try {
    const result = await commentService.deleteComment(commentId);

    if (result.success) {
      // 重新加载评论列表以获取最新数据
      await fetchComments();
      emit('updated');
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    message.error('删除失败，请稍后重试');
  }
};

// 处理评论举报
const handleReportComment = (commentId) => {
};

// 加载更多评论
const loadMoreComments = async () => {
  if (loadingMore.value || !hasMoreComments.value) return;

  try {
    loadingMore.value = true;
    page.value += 1;

    // 这里如果后端接口支持分页，可以拓展fetchComments函数
    await fetchComments(true);
  } catch (error) {
    console.error('加载更多评论失败:', error);
    message.error('加载更多评论失败');
  } finally {
    loadingMore.value = false;
  }
};

// 找到评论所属的顶级评论ID
const findRootCommentId = (commentId, commentsList) => {
  for (const comment of commentsList) {
    // 如果这个评论就是我们要找的
    if (comment.id.toString() === commentId.toString()) {
      return comment.rootId || comment.id;
    }

    // 递归查找子评论
    if (comment.children && comment.children.length > 0) {
      const rootId = findCommentIdInChildren(commentId, comment.children);
      if (rootId) return rootId;
    }
  }
  return null;
};

// 在子评论中查找指定ID
const findCommentIdInChildren = (commentId, children) => {
  for (const child of children) {
    if (child.id.toString() === commentId.toString()) {
      return child.rootId || child.id;
    }

    // 继续递归查找
    if (child.children && child.children.length > 0) {
      const found = findCommentIdInChildren(commentId, child.children);
      if (found) return found;
    }
  }
  return null;
};

// 获取评论列表
const fetchComments = async (append = false) => {
  if (!props.contentId) return;

  try {
    if (!append) {
      loading.value = true;
    }

    // 调用接口获取完整评论树
    const {list, total} = await commentService.getContentCommentsTree(
        props.contentId,
        props.contentType
    );

    // 对每个顶级评论下的子评论进行排序
    const processedList = list.map(comment => {
      if (comment.children && comment.children.length > 0) {
        // 对子评论按时间降序排序
        comment.children = [...comment.children].sort(
            (a, b) => new Date(b.createTime) - new Date(a.createTime)
        );
      }
      return comment;
    });

    if (append) {
      // 如果是加载更多，将新评论追加到现有列表
      comments.value = [...comments.value, ...processedList];
    } else {
      comments.value = processedList;
    }

    commentTotal.value = total;

    if (activeHighlightId.value) {
      // 如果有需要高亮的评论，保持展开状态
      const rootCommentId = findRootCommentId(activeHighlightId.value, comments.value);
      if (rootCommentId) {
        expandedCommentIds.value.add(rootCommentId);
        // 确保这条评论对应的顶级评论在可见范围内
        // 如果使用折叠功能，需要展开顶级评论
        expandedRootComments.value = true;
      }
    }

    emit('update', {comments: comments.value, total});
  } catch (error) {
    console.error('获取评论列表失败:', error);
    message.error('获取评论列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 监听内容ID变化，重新加载评论
watch(() => props.contentId, (newId) => {
  if (newId) {
    page.value = 1;
    fetchComments();
  }
});

// 组件挂载时加载评论
onMounted(() => {
  // 如果已有初始评论数据，则不需要再次加载
  if (props.initialComments && props.initialComments.length > 0) {
    loading.value = false;
  } else {
    fetchComments();
  }
});
</script>

<style scoped>
.comment-system {
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03), 0 6px 12px rgba(0, 0, 0, 0.02);
  margin-bottom: 30px;
  border: 1px solid rgba(230, 232, 240, 0.7);
  transition: all 0.4s ease-in-out;
}

.comment-system:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05), 0 8px 15px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* 评论区标题样式 */
.comment-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(230, 232, 240, 0.7);
  position: relative;
}

.comment-section-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 30%, #a5b4fc 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.comment-section-header:hover::after {
  width: 100px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  margin: 0;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
}

.section-icon {
  margin-right: 12px;
  color: #6366f1;
  font-size: 22px;
  transform-origin: center;
  transition: transform 0.3s ease;
}

.section-title:hover .section-icon {
  transform: scale(1.2) rotate(10deg);
}

.comment-filters {
  display: flex;
  align-items: center;
}

.sort-button {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #595959;
}

.input-wrapper {
  flex-grow: 1;
  min-width: 0;
  max-width: calc(100% - 60px);
  width: 100%;
}

/* 评论输入区样式 */
.comment-input-section {
  display: flex;
  margin-bottom: 28px;
  padding: 20px;
  background-color: rgba(249, 250, 251, 0.7);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px dashed rgba(230, 232, 240, 0.9);
}

.comment-input-section:focus-within {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.avatar-wrapper {
  flex-shrink: 0;
  margin-right: 16px;
  position: relative;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.comment-input-section:focus-within .user-avatar {
  border-color: #6366f1;
  transform: scale(1.05);
}

.comment-textarea {
  border-radius: 10px;
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;
  font-size: 15px;
  padding: 14px 16px;
  resize: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  line-height: 1.6;
}

.comment-textarea:hover {
  border-color: #c0c0c0;
}

.comment-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.button-group {
  display: flex;
  gap: 12px;
}

.button-group .ant-btn {
  height: 38px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.button-group .ant-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  border: none;
}

.button-group .ant-btn-primary:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.25);
}

.comment-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

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

.button-group {
  display: flex;
  gap: 12px;
}

/* 评论列表样式 */
.comment-list-section {
  margin-top: 24px;
}

.empty-comment {
  text-align: center;
  padding: 40px 0;
  color: #8c8c8c;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

.empty-comment:hover {
  transform: scale(1.02);
}

.empty-comment .anticon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.empty-comment:hover .anticon {
  color: #b5b5b5;
  transform: rotate(10deg);
}

.empty-comment p {
  font-size: 16px;
  color: #8c8c8c;
  margin-top: 16px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.comment-item:last-child {
  border-bottom: none;
}

.root-comment {
  margin-bottom: 16px;
}

/* 加载更多按钮 */
.load-more-comments {
  text-align: center;
  margin-top: 28px;
}

.load-more-comments .ant-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 20px;
  background: linear-gradient(to right, #f7f8fa, #f1f3f9, #f7f8fa);
  border: 1px solid rgba(230, 232, 240, 0.7);
  font-weight: 500;
  color: #5c5c7b;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.load-more-comments .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e2e4f0;
  background: linear-gradient(to right, #f1f3f9, #e9ecf6, #f1f3f9);
}

.load-more-comments .ant-btn .anticon {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.load-more-comments .ant-btn:hover .anticon {
  transform: translateY(3px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .comment-system {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .comment-controls {
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }

  .sort-button {
    font-size: 13px;
  }
}

/* 顶级评论展开/收起按钮样式 */
.show-more-root-comments,
.collapse-root-comments {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-more-root-comments:hover,
.collapse-root-comments:hover {
  transform: translateY(-2px);
}

.action-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(252, 252, 255, 0.9);
  border: 1px solid rgba(230, 232, 240, 0.8);
  border-radius: 20px;
  color: #6366f1;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(248, 249, 255, 1);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.action-button .anticon {
  margin-right: 8px;
  font-size: 15px;
  transition: transform 0.3s ease;
}

.show-more-root-comments:hover .action-button .anticon {
  transform: translateY(3px);
}

.collapse-root-comments:hover .action-button .anticon {
  transform: translateY(-3px);
}

/* 顶级评论列表展开收起的过渡效果 */
.comment-list {
  position: relative;
}

.root-comment {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.root-comment.hidden {
  opacity: 0;
  transform: translateY(10px);
}

.root-comment.visible {
  opacity: 1;
  transform: translateY(0);
}

.button-group .ant-btn:hover {
  border-color: #d9d9e3;
  color: #4f46e5;
  background-color: #f5f5f8;
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
</style>