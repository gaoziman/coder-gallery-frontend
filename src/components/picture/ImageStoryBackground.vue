<!-- components/picture/ImageStoryBackground.vue -->
<template>
  <div class="story-container">
    <div class="story-header">
      <book-outlined class="story-icon" />
      <h3 class="story-title">图片故事与背景</h3>
      <a-button
          type="link"
          class="expand-button"
          @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开' }}
        <template #icon>
          <down-outlined v-if="!expanded" />
          <up-outlined v-else />
        </template>
      </a-button>
    </div>

    <div v-show="expanded" class="story-content-wrapper">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 故事标签页 -->
        <a-tab-pane key="story" tab="背后故事">
          <div class="story-content">
            <div class="story-text" v-html="formatStoryText(storyData.story)"></div>

            <div class="story-meta">
              <div class="story-time">
                <calendar-outlined />
                <span>{{ storyData.captureDate }}</span>
              </div>
              <div class="story-location" v-if="storyData.location">
                <environment-outlined />
                <span>{{ storyData.location }}</span>
              </div>
            </div>

            <div v-if="storyData.quotes && storyData.quotes.length > 0" class="story-quotes">
              <div class="quote-container">
                <blockquote class="quote-text">
                  {{ storyData.quotes[0].text }}
                </blockquote>
                <div class="quote-author">— {{ storyData.quotes[0].author }}</div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 知识标签页 -->
        <a-tab-pane key="knowledge" tab="相关知识">
          <div class="knowledge-content">
            <div v-if="storyData.knowledgePoints && storyData.knowledgePoints.length > 0">
              <div
                  v-for="(point, index) in storyData.knowledgePoints"
                  :key="index"
                  class="knowledge-point"
                  v-motion
                  :initial="{ opacity: 0, x: -10 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 100 + index * 100, duration: 300 } }"
              >
                <div class="point-header">
                  <bulb-outlined class="point-icon" />
                  <h4 class="point-title">{{ point.title }}</h4>
                </div>
                <p class="point-text">{{ point.content }}</p>
              </div>
            </div>

            <div v-else class="empty-knowledge">
              <empty-outlined />
              <p>暂无相关知识点</p>
            </div>
          </div>
        </a-tab-pane>

        <!-- 创作标签页 -->
        <a-tab-pane key="creation" tab="创作灵感">
          <div class="creation-content">
            <div class="creation-text">{{ storyData.creationInspiration }}</div>

            <div v-if="storyData.relatedConcepts && storyData.relatedConcepts.length > 0" class="concept-container">
              <h4 class="concept-header">相关概念</h4>
              <div class="concept-tags">
                <a-tag
                    v-for="(concept, index) in storyData.relatedConcepts"
                    :key="index"
                    class="concept-tag"
                    :color="getConceptColor(concept.type)"
                    @click="searchRelatedConcept(concept.name)"
                >
                  {{ concept.name }}
                </a-tag>
              </div>
            </div>

            <div v-if="storyData.photographyTips" class="photo-tips">
              <camera-outlined class="tips-icon" />
              <div class="tips-content">
                <h4 class="tips-title">摄影小贴士</h4>
                <p class="tips-text">{{ storyData.photographyTips }}</p>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="story-footer">
        <div class="story-engagement">
          <a-button type="text" class="engage-button" @click="likeStory">
            <template #icon><like-outlined :class="{ 'liked': storyLiked }" /></template>
            {{ storyLiked ? '已赞' : '点赞故事' }}
          </a-button>
          <a-button type="text" class="engage-button" @click="showSuggestModal = true">
            <template #icon><edit-outlined /></template>
            投稿补充
          </a-button>
        </div>

        <a-tag v-if="storyData.verified" color="success" class="story-verified">
          <template #icon><check-circle-outlined /></template>
          已验证内容
        </a-tag>
      </div>
    </div>

    <!-- 补充内容的模态框 -->
    <a-modal
        v-model:visible="showSuggestModal"
        title="补充图片故事或背景"
        @ok="handleSuggestSubmit"
        :confirmLoading="submitLoading"
    >
      <a-form :model="suggestForm" layout="vertical">
        <a-form-item label="内容类型" name="type">
          <a-radio-group v-model:value="suggestForm.type">
            <a-radio value="story">故事补充</a-radio>
            <a-radio value="knowledge">知识点</a-radio>
            <a-radio value="creation">创作灵感</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="补充内容" name="content">
          <a-textarea
              v-model:value="suggestForm.content"
              :placeholder="getPlaceholderByType"
              :rows="5"
              :maxLength="500"
              show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import {
  BookOutlined,
  BulbOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  LikeOutlined,
  UpOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  storyData: {
    type: Object,
    default: () => ({
      story: '暂无背景故事信息',
      captureDate: '未知日期',
      location: '',
      quotes: [],
      knowledgePoints: [],
      creationInspiration: '暂无创作灵感信息',
      relatedConcepts: [],
      photographyTips: '',
      verified: false
    })
  }
});

// 状态控制
const expanded = ref(false);
const activeTab = ref('story');
const storyLiked = ref(false);
const showSuggestModal = ref(false);
const submitLoading = ref(false);
const router = useRouter();

// 表单数据
const suggestForm = ref({
  type: 'story',
  content: ''
});

// 根据选择类型获取占位符
const getPlaceholderByType = computed(() => {
  const placeholders = {
    story: '请分享您所知道的关于这张图片的故事或背景信息...',
    knowledge: '请分享与这张图片相关的知识点或有趣发现...',
    creation: '请分享这张图片给您的创作灵感或摄影建议...'
  };
  return placeholders[suggestForm.value.type];
});

// 格式化故事文本，支持段落
const formatStoryText = (text) => {
  if (!text) return '';
  return text.split('\n').map(para => `<p>${para}</p>`).join('');
};

// 获取概念标签颜色
const getConceptColor = (type) => {
  const colorMap = {
    technique: '#1890ff',
    subject: '#52c41a',
    style: '#722ed1',
    mood: '#fa8c16',
    composition: '#eb2f96',
    default: '#6366f1'
  };
  return colorMap[type] || colorMap.default;
};

// 搜索相关概念
const searchRelatedConcept = (concept) => {
  router.push({
    name: 'SearchResults',
    query: { keyword: concept, type: 'concept' }
  });
};

// 点赞故事
const likeStory = () => {
  storyLiked.value = !storyLiked.value;
  message.success(storyLiked.value ? '感谢您的点赞！' : '已取消点赞');
};

// 提交补充内容
const handleSuggestSubmit = () => {
  if (!suggestForm.value.content.trim()) {
    message.error('请输入补充内容');
    return;
  }

  submitLoading.value = true;

  // 模拟API请求
  setTimeout(() => {
    submitLoading.value = false;
    showSuggestModal.value = false;
    message.success('感谢您的投稿！我们会尽快审核。');
    suggestForm.value.content = '';
  }, 1000);
};
</script>

<style scoped>
.story-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s;
}

.story-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.story-icon {
  color: #6366f1;
  font-size: 18px;
  margin-right: 12px;
}

.story-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  flex: 1;
}

.expand-button {
  padding: 4px 8px;
  color: #6366f1;
}

.story-content-wrapper {
  padding: 0;
}

/* 故事内容样式 */
.story-content {
  padding: 16px 20px;
}

.story-text {
  font-size: 15px;
  line-height: 1.8;
  color: #262626;
  margin-bottom: 20px;
}

.story-text p {
  margin-bottom: 16px;
}

.story-text p:last-child {
  margin-bottom: 0;
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  color: #595959;
  font-size: 14px;
}

.story-time, .story-location {
  display: flex;
  align-items: center;
  gap: 6px;
}

.story-quotes {
  margin-top: 20px;
}

.quote-container {
  border-left: 3px solid #6366f1;
  padding-left: 16px;
  margin-left: 8px;
}

.quote-text {
  font-size: 15px;
  font-style: italic;
  color: #595959;
  margin: 0 0 8px 0;
}

.quote-author {
  text-align: right;
  font-size: 14px;
  color: #8c8c8c;
}

/* 知识内容样式 */
.knowledge-content {
  padding: 16px 20px;
}

.knowledge-point {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.knowledge-point:last-child {
  margin-bottom: 0;
}

.point-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.point-icon {
  color: #6366f1;
  font-size: 16px;
  margin-right: 8px;
}

.point-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.point-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #595959;
}

.empty-knowledge {
  padding: 30px 0;
  text-align: center;
  color: #8c8c8c;
}

/* 创作灵感样式 */
.creation-content {
  padding: 16px 20px;
}

.creation-text {
  font-size: 15px;
  line-height: 1.8;
  color: #262626;
  margin-bottom: 20px;
}

.concept-container {
  margin-bottom: 20px;
}

.concept-header {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 12px 0;
}

.concept-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.concept-tag {
  cursor: pointer;
  padding: 4px 12px;
  font-size: 13px;
  transition: all 0.3s;
}

.concept-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.photo-tips {
  padding: 16px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
  display: flex;
  gap: 12px;
}

.tips-icon {
  font-size: 18px;
  color: #6366f1;
  margin-top: 2px;
}

.tips-content {
  flex: 1;
}

.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.tips-text {
  font-size: 14px;
  line-height: 1.6;
  color: #595959;
  margin: 0;
}

/* 页脚样式 */
.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fbfbfc;
}

.story-engagement {
  display: flex;
  gap: 16px;
}

.engage-button {
  color: #595959;
}

.engage-button:hover {
  color: #6366f1;
}

.liked {
  color: #ff4d4f;
}

.story-verified {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .story-meta {
    flex-direction: column;
    gap: 8px;
  }

  .story-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .story-container {
    background-color: #1f1f1f;
  }

  .story-header {
    border-bottom-color: #333;
  }

  .story-title {
    color: #e0e0e0;
  }

  .story-text {
    color: #d9d9d9;
  }

  .story-meta {
    color: #a6a6a6;
  }

  .quote-text {
    color: #b3b3b3;
  }

  .quote-author {
    color: #a6a6a6;
  }

  .knowledge-point {
    background: #2a2a2a;
  }

  .point-title {
    color: #e0e0e0;
  }

  .point-text {
    color: #b3b3b3;
  }

  .creation-text {
    color: #d9d9d9;
  }

  .concept-header {
    color: #e0e0e0;
  }

  .photo-tips {
    background: rgba(99, 102, 241, 0.1);
  }

  .tips-title {
    color: #e0e0e0;
  }

  .tips-text {
    color: #b3b3b3;
  }

  .story-footer {
    border-top-color: #333;
    background: #2a2a2a;
  }

  .engage-button {
    color: #a6a6a6;
  }
}
</style>