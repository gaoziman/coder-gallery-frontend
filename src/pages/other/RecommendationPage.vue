<!-- RecommendationModule.vue -->
<template>
  <div class="recommendation-module"
       v-motion
       :initial="{ opacity: 0, y: 20 }"
       :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }">
    <a-card class="recommendation-card" :bordered="false">
      <div class="card-header">
        <div class="header-title">
          <bulb-outlined class="recommendation-icon" />
          <h3>智能推荐</h3>
          <a-tag color="#6366f1" class="ai-tag">AI</a-tag>
        </div>
        <div class="header-actions">
          <a-tooltip title="刷新推荐">
            <a-button type="text" @click="refreshRecommendations" class="refresh-btn">
              <sync-outlined :spin="isRefreshing" />
            </a-button>
          </a-tooltip>
          <a-dropdown :trigger="['click']">
            <a-button type="text">
              <setting-outlined />
            </a-button>
            <template #overlay>
              <a-menu @click="handleSettingMenuClick">
                <a-menu-item key="preferences">个性化偏好设置</a-menu-item>
                <a-menu-item key="frequency">推荐更新频率</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="feedback">反馈推荐质量</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <div class="recommendation-tabs">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="based-on-likes" tab="猜你喜欢">
            <div class="tab-header">
              <p class="recommendation-desc">基于您的收藏历史和浏览习惯推荐的内容</p>
              <a-button type="link" @click="viewAllRecommendations">查看全部</a-button>
            </div>
            <a-spin :spinning="loading">
              <div class="recommendation-grid">
                <div v-for="(item, index) in filteredRecommendations" :key="index" class="recommendation-item"
                     v-motion
                     :initial="{ opacity: 0, scale: 0.9 }"
                     :enter="{
                       opacity: 1,
                       scale: 1,
                       transition: {
                         delay: 1200 + (index * 100),
                         duration: 500,
                         ease: 'easeOut'
                       }
                     }">
                  <div class="recommendation-card-item" @click="viewItemDetails(item)">
                    <div class="item-image-container">
                      <img :src="item.src" :alt="item.title" class="item-image" />
                      <div class="item-overlay">
                        <div class="item-match">
                          <span class="match-percentage">{{ item.matchPercentage }}%</span>
                          <span class="match-text">匹配度</span>
                        </div>
                        <div class="item-actions">
                          <a-button type="primary" size="small" @click.stop="addToFavorites(item)" class="add-btn">
                            <template #icon><star-outlined /></template>
                            收藏
                          </a-button>
                          <a-button size="small" @click.stop="viewItemDetails(item)">
                            <template #icon><eye-outlined /></template>
                            查看
                          </a-button>
                        </div>
                      </div>
                    </div>
                    <div class="item-info">
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-author">
                        <a-avatar :src="item.author.avatar" :size="24" />
                        <span class="author-name">{{ item.author.name }}</span>
                      </div>
                      <div class="item-tags">
                        <a-tag v-for="(tag, tagIdx) in item.tags.slice(0, 2)" :key="tagIdx" class="item-tag">
                          {{ tag.name }}
                        </a-tag>
                        <a-tag v-if="item.tags.length > 2" class="item-tag more-tag">
                          +{{ item.tags.length - 2 }}
                        </a-tag>
                      </div>
                      <div class="recommendation-reason">
                        <bulb-outlined />
                        <span>{{ item.recommendReason }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="filteredRecommendations.length === 0 && !loading" class="empty-recommendations">
                <a-empty description="暂无推荐内容">
                  <template #extra>
                    <a-button type="primary" @click="refreshRecommendations">获取推荐</a-button>
                  </template>
                </a-empty>
              </div>
            </a-spin>
          </a-tab-pane>

          <a-tab-pane key="similar-collections" tab="相似收藏夹">
            <div class="tab-header">
              <p class="recommendation-desc">与您当前收藏夹内容相似的其他用户的收藏</p>
              <a-button type="link" @click="viewAllSimilarCollections">查看全部</a-button>
            </div>
            <a-spin :spinning="loading">
              <div class="collection-list">
                <a-list
                    :data-source="similarCollections"
                    :pagination="false"
                    class="similar-collections-list"
                >
                  <template #renderItem="{ item, index }">
                    <a-list-item
                        class="collection-list-item"
                        v-motion
                        :initial="{ opacity: 0, x: -20 }"
                        :enter="{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: 1200 + (index * 100),
                          duration: 500,
                        }
                      }"
                    >
                      <a-card class="collection-card" :bordered="false">
                        <div class="collection-preview">
                          <img v-for="(preview, pidx) in item.previews.slice(0, 3)"
                               :key="pidx"
                               :src="preview"
                               class="preview-image" />
                          <div v-if="item.totalItems > 3" class="more-items">+{{ item.totalItems - 3 }}</div>
                        </div>
                        <div class="collection-info">
                          <div class="collection-header">
                            <div class="collection-name">
                              <component :is="getCollectionIcon(item)" />
                              <span>{{ item.name }}</span>
                            </div>
                            <a-tag class="items-count">{{ item.totalItems }}项</a-tag>
                          </div>
                          <div class="collection-creator">
                            <a-avatar :src="item.creator.avatar" :size="24" />
                            <span>{{ item.creator.name }}</span>
                          </div>
                          <div class="collection-tags">
                            <a-tag v-for="(tag, tidx) in item.tags.slice(0, 3)"
                                   :key="tidx"
                                   class="collection-tag">
                              {{ tag }}
                            </a-tag>
                          </div>
                          <div class="similarity-meter">
                            <div class="similarity-label">相似度:</div>
                            <a-progress :percent="item.similarity"
                                        :stroke-color="getSimilarityColor(item.similarity)"
                                        size="small" />
                          </div>
                          <div class="collection-actions">
                            <a-button type="primary" size="small" @click="followCollection(item)">
                              <template #icon><plus-outlined /></template>
                              关注收藏夹
                            </a-button>
                            <a-button size="small" @click="viewCollection(item)">
                              <template #icon><eye-outlined /></template>
                              查看
                            </a-button>
                          </div>
                        </div>
                      </a-card>
                    </a-list-item>
                  </template>
                </a-list>
              </div>

              <!-- 空状态 -->
              <div v-if="similarCollections.length === 0 && !loading" class="empty-recommendations">
                <a-empty description="暂无相似收藏夹">
                  <template #extra>
                    <a-button type="primary" @click="refreshSimilarCollections">寻找相似收藏夹</a-button>
                  </template>
                </a-empty>
              </div>
            </a-spin>
          </a-tab-pane>

          <a-tab-pane key="trending" tab="热门发现">
            <div class="tab-header">
              <p class="recommendation-desc">最近平台上热门且可能符合您兴趣的内容</p>
              <a-button type="link" @click="viewAllTrending">查看全部</a-button>
            </div>
            <a-spin :spinning="loading">
              <div class="trending-categories">
                <a-radio-group v-model:value="trendingCategory" button-style="solid" class="trending-filter">
                  <a-radio-button value="all">全部</a-radio-button>
                  <a-radio-button value="design">设计</a-radio-button>
                  <a-radio-button value="code">代码</a-radio-button>
                  <a-radio-button value="wallpaper">壁纸</a-radio-button>
                  <a-radio-button value="art">艺术</a-radio-button>
                </a-radio-group>
              </div>

              <div class="trending-timeline">
                <a-timeline>
                  <a-timeline-item v-for="(item, index) in filteredTrending" :key="index"
                                   v-motion
                                   :initial="{ opacity: 0, x: -20 }"
                                   :enter="{
                       opacity: 1,
                       x: 0,
                       transition: {
                         delay: 1200 + (index * 100),
                         duration: 500,
                       }
                     }">
                    <div class="trending-item">
                      <div class="trending-image-container">
                        <img :src="item.src" :alt="item.title" class="trending-image" />
                        <div class="trending-badge">
                          <fire-outlined />
                          <span class="trending-count">{{ item.trendingCount }}+</span>
                        </div>
                      </div>
                      <div class="trending-content">
                        <div class="trending-title">{{ item.title }}</div>
                        <div class="trending-meta">
                          <div class="trending-author">
                            <a-avatar :src="item.author.avatar" :size="20" />
                            <span>{{ item.author.name }}</span>
                          </div>
                          <div class="trending-time">{{ item.trendingSince }}</div>
                        </div>
                        <div class="trending-stats">
                          <span class="stat-item">
                            <eye-outlined /> {{ item.views }}
                          </span>
                          <span class="stat-item">
                            <like-outlined /> {{ item.likes }}
                          </span>
                          <span class="stat-item">
                            <star-outlined /> {{ item.favorites }}
                          </span>
                        </div>
                        <div class="trending-tags">
                          <a-tag v-for="(tag, tidx) in item.tags.slice(0, 3)"
                                 :key="tidx"
                                 class="trending-tag">
                            {{ tag.name }}
                          </a-tag>
                        </div>
                        <div class="trending-actions">
                          <a-button type="primary" size="small" @click="addToFavorites(item)" class="add-btn">
                            <template #icon><star-outlined /></template>
                            收藏
                          </a-button>
                          <a-button size="small" @click="viewItemDetails(item)">
                            <template #icon><eye-outlined /></template>
                            查看
                          </a-button>
                        </div>
                      </div>
                    </div>
                  </a-timeline-item>
                </a-timeline>
              </div>

              <!-- 空状态 -->
              <div v-if="filteredTrending.length === 0 && !loading" class="empty-recommendations">
                <a-empty description="暂无热门内容">
                  <template #extra>
                    <a-button type="primary" @click="refreshTrending">刷新热门</a-button>
                  </template>
                </a-empty>
              </div>
            </a-spin>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 偏好设置弹窗 -->
      <a-modal
          v-model:visible="preferencesModalVisible"
          title="个性化推荐偏好设置"
          @ok="savePreferences"
          okText="保存"
          cancelText="取消"
          width="600px"
      >
        <a-form :model="preferences" layout="vertical">
          <a-form-item label="推荐内容类型">
            <a-checkbox-group v-model:value="preferences.contentTypes">
              <a-checkbox value="design">设计素材</a-checkbox>
              <a-checkbox value="wallpaper">壁纸</a-checkbox>
              <a-checkbox value="code">代码参考</a-checkbox>
              <a-checkbox value="art">艺术作品</a-checkbox>
              <a-checkbox value="photo">摄影作品</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="推荐匹配策略">
            <a-radio-group v-model:value="preferences.matchStrategy">
              <a-radio value="similar">与我当前兴趣相似的内容</a-radio>
              <a-radio value="diverse">扩展我的兴趣范围</a-radio>
              <a-radio value="trending">更多热门内容</a-radio>
              <a-radio value="balanced">平衡推荐</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="内容更新频率">
            <a-radio-group v-model:value="preferences.updateFrequency">
              <a-radio value="daily">每日</a-radio>
              <a-radio value="weekly">每周</a-radio>
              <a-radio value="realtime">实时</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="排除已浏览内容">
            <a-switch v-model:checked="preferences.excludeViewed" />
          </a-form-item>

          <a-form-item label="排除标签">
            <a-select
                v-model:value="preferences.excludeTags"
                mode="tags"
                placeholder="输入要排除的标签"
                style="width: 100%"
            ></a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  BulbOutlined,
  EyeOutlined,
  StarOutlined,
  SyncOutlined,
  SettingOutlined,
  FolderOutlined,
  HeartOutlined,
  PictureOutlined,
  FireOutlined,
  LikeOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

// 标签页状态
const activeTab = ref('based-on-likes');
const loading = ref(false);
const isRefreshing = ref(false);

// 猜你喜欢推荐列表
const recommendations = ref([
  {
    id: 'rec1',
    src: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: '创意UI设计灵感集合',
    author: {
      name: 'UI设计师小王',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'UI设计', color: 'purple' },
      { name: '灵感', color: '' },
      { name: '创意', color: 'green' },
    ],
    matchPercentage: 96,
    recommendReason: '与您收藏的"现代UI组件设计集"相似',
  },
  {
    id: 'rec2',
    src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Vue 3 Composition API最佳实践',
    author: {
      name: '前端架构师大白',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'Vue3', color: 'green' },
      { name: '前端开发', color: '' },
      { name: '代码', color: 'blue' },
    ],
    matchPercentage: 92,
    recommendReason: '根据您的"Vue 3组件设计模式"收藏推荐',
  },
  {
    id: 'rec3',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '极简主义城市摄影集',
    author: {
      name: '摄影师阿杰',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '摄影', color: 'orange' },
      { name: '城市', color: '' },
      { name: '极简', color: 'cyan' },
    ],
    matchPercentage: 88,
    recommendReason: '与您的浏览历史和壁纸收藏相关',
  },
  {
    id: 'rec4',
    src: 'https://images.unsplash.com/photo-1506097425191-7ad538b29cef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '网页渐变配色方案精选',
    author: {
      name: '色彩设计师小林',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '配色', color: 'pink' },
      { name: '渐变', color: '' },
      { name: '设计', color: 'blue' },
    ],
    matchPercentage: 85,
    recommendReason: '与您收藏的设计素材类似',
  },
]);

// 相似收藏夹
const similarCollections = ref([
  {
    id: 'col1',
    name: '现代UI设计资源',
    icon: 'picture',
    creator: {
      name: '设计师小张',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    previews: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506097425191-7ad538b29cef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    ],
    totalItems: 15,
    tags: ['UI设计', '素材', '创意'],
    similarity: 92,
  },
  {
    id: 'col2',
    name: '前端开发技术收藏',
    icon: 'file',
    creator: {
      name: '资深工程师',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    previews: [
      'https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    ],
    totalItems: 24,
    tags: ['Vue3', '代码', '前端开发'],
    similarity: 86,
  },
]);

// 热门发现
const trendingItems = ref([
  {
    id: 'trend1',
    src: 'https://images.unsplash.com/photo-1596120236172-231808e4d566?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '2025设计趋势预测指南',
    category: 'design',
    author: {
      name: '设计趋势观察家',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '设计趋势', color: 'blue' },
      { name: '2025', color: '' },
      { name: 'UI/UX', color: 'purple' },
    ],
    trendingCount: 2453,
    trendingSince: '2小时前',
    views: '12.5k',
    likes: 876,
    favorites: 342,
  },
  {
    id: 'trend2',
    src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'TypeScript高级类型技巧指南',
    category: 'code',
    author: {
      name: 'TS大师',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'TypeScript', color: 'blue' },
      { name: '编程', color: '' },
      { name: '技巧', color: 'green' },
    ],
    trendingCount: 1872,
    trendingSince: '5小时前',
    views: '9.8k',
    likes: 723,
    favorites: 291,
  },
  {
    id: 'trend3',
    src: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '北极光4K超清壁纸集',
    category: 'wallpaper',
    author: {
      name: '自然摄影师',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '壁纸', color: 'cyan' },
      { name: '风景', color: 'blue' },
      { name: '4K', color: 'green' },
    ],
    trendingCount: 1563,
    trendingSince: '1天前',
    views: '15.2k',
    likes: 1423,
    favorites: 567,
  },
  {
    id: 'trend4',
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代抽象水彩艺术作品集',
    category: 'art',
    author: {
      name: '水彩艺术家',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '艺术', color: 'pink' },
      { name: '水彩', color: 'purple' },
      { name: '抽象', color: 'orange' },
    ],
    trendingCount: 1257,
    trendingSince: '3天前',
    views: '8.7k',
    likes: 943,
    favorites: 412,
  },
]);

// 当前热门分类筛选
const trendingCategory = ref('all');

// 个性化偏好设置
const preferencesModalVisible = ref(false);
const preferences = reactive({
  contentTypes: ['design', 'wallpaper', 'code', 'art'],
  matchStrategy: 'balanced',
  updateFrequency: 'daily',
  excludeViewed: true,
  excludeTags: [],
});

// 计算属性 - 根据标签筛选的推荐项
const filteredRecommendations = computed(() => {
  return recommendations.value.filter(item => {
    return preferences.contentTypes.some(type => {
      return item.tags.some(tag => tag.name.toLowerCase().includes(type.toLowerCase()));
    });
  });
});

// 计算属性 - 根据分类筛选的热门项
const filteredTrending = computed(() => {
  if (trendingCategory.value === 'all') {
    return trendingItems.value;
  }

  return trendingItems.value.filter(item =>
      item.category === trendingCategory.value ||
      item.tags.some(tag => tag.name.toLowerCase().includes(trendingCategory.value.toLowerCase()))
  );
});

// 获取收藏夹图标
const getCollectionIcon = (collection) => {
  const iconMap = {
    folder: FolderOutlined,
    heart: HeartOutlined,
    picture: PictureOutlined,
    file: FolderOutlined,
  };
  return iconMap[collection.icon] || FolderOutlined;
};

// 获取相似度色彩
const getSimilarityColor = (similarity) => {
  if (similarity >= 90) return '#52c41a';
  if (similarity >= 70) return '#1890ff';
  if (similarity >= 50) return '#faad14';
  return '#f5222d';
};

// 处理标签页切换
const handleTabChange = (key) => {
  console.log('切换到标签:', key);

  // 如果是首次切换到该标签，加载数据
  if (key === 'similar-collections' && similarCollections.value.length === 0) {
    refreshSimilarCollections();
  } else if (key === 'trending' && trendingItems.value.length === 0) {
    refreshTrending();
  }
};

// 刷新推荐
const refreshRecommendations = () => {
  isRefreshing.value = true;
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    // 这里可以放真实的API请求，获取新的推荐内容
    // 假设我们得到了新的数据，这里仅作演示
    const newItems = [
      {
        id: 'rec5',
        src: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
        title: 'React+TypeScript项目架构',
        author: {
          name: '全栈开发者',
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
        },
        tags: [
          { name: 'React', color: 'blue' },
          { name: 'TypeScript', color: 'green' },
          { name: '代码', color: '' },
        ],
        matchPercentage: 90,
        recommendReason: '基于您对前端开发的偏好推荐',
      },
      // 可以添加更多的项目...
    ];

    // 在实际应用中可能是完全替换或添加到现有列表
    recommendations.value = [...recommendations.value, ...newItems];

    loading.value = false;
    isRefreshing.value = false;
    message.success('推荐内容已更新');
  }, 1500);
};

// 刷新相似收藏夹
const refreshSimilarCollections = () => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    // 添加一个新的相似收藏夹
    const newCollection = {
      id: 'col3',
      name: '摄影艺术启发',
      icon: 'picture',
      creator: {
        name: '摄影爱好者',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      },
      previews: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      ],
      totalItems: 18,
      tags: ['摄影', '艺术', '灵感'],
      similarity: 78,
    };

    similarCollections.value = [...similarCollections.value, newCollection];

    loading.value = false;
    message.success('已找到新的相似收藏夹');
  }, 1500);
};

// 刷新热门内容
const refreshTrending = () => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    // 模拟获取新的热门内容
    const newTrending = {
      id: 'trend5',
      src: 'https://images.unsplash.com/photo-1618335829737-2228915674e0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
      title: 'CSS新一代布局技术指南',
      category: 'code',
      author: {
        name: 'CSS专家',
        avatar: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      },
      tags: [
        { name: 'CSS', color: 'blue' },
        { name: '布局', color: 'purple' },
        { name: '前端', color: 'green' },
      ],
      trendingCount: 2105,
      trendingSince: '刚刚',
      views: '6.3k',
      likes: 521,
      favorites: 187,
    };

    trendingItems.value = [newTrending, ...trendingItems.value];

    loading.value = false;
    message.success('热门内容已更新');
  }, 1500);
};

// 查看全部推荐
const viewAllRecommendations = () => {
  router.push({ name: 'AllRecommendations' });
};

// 查看全部相似收藏夹
const viewAllSimilarCollections = () => {
  router.push({ name: 'SimilarCollections' });
};

// 查看全部热门内容
const viewAllTrending = () => {
  router.push({ name: 'TrendingDiscovery' });
};

// 添加到收藏
const addToFavorites = (item) => {
  message.success(`已将"${item.title}"添加到收藏`);
};

// 查看项目详情
const viewItemDetails = (item) => {
  router.push({
    name: 'PictureDetail',
    params: { id: item.id },
    state: { imageData: item }
  });
};

// 关注收藏夹
const followCollection = (collection) => {
  message.success(`已关注"${collection.name}"收藏夹`);
};

// 查看收藏夹
const viewCollection = (collection) => {
  router.push({
    name: 'CollectionDetail',
    params: { id: collection.id }
  });
};

// 处理设置菜单点击
const handleSettingMenuClick = (e) => {
  if (e.key === 'preferences') {
    showPreferencesModal();
  } else if (e.key === 'frequency') {
    message.info('更新频率设置功能即将上线');
  } else if (e.key === 'feedback') {
    message.info('感谢您对推荐质量的反馈，我们将不断改进');
  }
};

// 显示偏好设置弹窗
const showPreferencesModal = () => {
  preferencesModalVisible.value = true;
};

// 保存偏好设置
const savePreferences = () => {
  preferencesModalVisible.value = false;
  message.success('个性化偏好设置已保存');

  // 重新加载推荐
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('根据您的偏好更新了推荐内容');
  }, 1000);
};

// 监听偏好设置变化
watch(
    () => preferences.matchStrategy,
    (newStrategy) => {
      console.log('匹配策略已更改为:', newStrategy);
      // 在实际应用中，这里可能会触发重新获取推荐内容
    }
);

// 初始化
onMounted(() => {
  // 初始加载数据
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
/* 基础样式 */
.recommendation-module {
  margin-top: 32px;
  margin-bottom: 40px;
}

.recommendation-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 8px 0 0;
  color: #333;
}

.recommendation-icon {
  color: #6366f1;
  font-size: 20px;
  margin-right: 8px;
}

.ai-tag {
  font-size: 11px;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  margin-left: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn {
  color: #6366f1;
}

.refresh-btn:hover {
  color: #818cf8;
}

/* 标签页样式 */
.recommendation-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.recommendation-tabs :deep(.ant-tabs-tab) {
  padding: 8px 16px;
}

.recommendation-tabs :deep(.ant-tabs-tab-active) {
  font-weight: 500;
}

.recommendation-tabs :deep(.ant-tabs-ink-bar) {
  background-color: #6366f1;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recommendation-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 推荐网格布局 */
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

/* 推荐卡片项目 */
.recommendation-card-item {
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recommendation-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.item-image-container {
  position: relative;
  overflow: hidden;
  padding-top: 75%; /* 4:3 比例 */
}

.item-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.recommendation-card-item:hover .item-image {
  transform: scale(1.05);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.recommendation-card-item:hover .item-overlay {
  opacity: 1;
}

.item-match {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  padding: 4px 10px;
  color: white;
  align-self: flex-start;
  text-align: center;
}

.match-percentage {
  font-size: 16px;
  font-weight: bold;
  color: #52c41a;
}

.match-text {
  font-size: 12px;
  margin-left: 4px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.add-btn {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
}

.item-info {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-author {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.author-name {
  margin-left: 8px;
  font-size: 13px;
  color: #666;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.item-tag {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  color: #666;
  margin: 0;
}

.more-tag {
  background: #e6e6fa;
  color: #6366f1;
}

.recommendation-reason {
  margin-top: auto;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

.recommendation-reason :deep(.anticon) {
  font-size: 14px;
  color: #6366f1;
  margin-right: 6px;
}

/* 相似收藏夹 */
.collection-list {
  margin-bottom: 16px;
}

.similar-collections-list {
  background: transparent;
}

.similar-collections-list :deep(.ant-list-item) {
  padding: 0;
  margin-bottom: 16px;
  border-bottom: none;
}

.collection-card {
  padding: 12px;
  display: flex;
  gap: 16px;
  width: 100%;
}

.collection-preview {
  display: flex;
  gap: 2px;
  position: relative;
  flex-basis: 120px;
  flex-shrink: 0;
}

.preview-image {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.more-items {
  position: absolute;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.collection-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collection-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.collection-name :deep(.anticon) {
  margin-right: 6px;
  color: #6366f1;
}

.items-count {
  background: #f0f0f0;
  color: #666;
  font-weight: normal;
  border: none;
  margin: 0;
}

.collection-creator {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.collection-creator span {
  margin-left: 8px;
}

.collection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.collection-tag {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  color: #666;
  margin: 0;
}

.similarity-meter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.similarity-label {
  font-size: 12px;
  color: #666;
  width: 60px;
  flex-shrink: 0;
}

.similarity-meter :deep(.ant-progress) {
  flex-grow: 1;
  margin-bottom: 0;
}

.collection-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.collection-actions .ant-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
}

/* 热门发现 */
.trending-categories {
  margin-bottom: 16px;
}

.trending-filter {
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
}

.trending-filter::-webkit-scrollbar {
  height: 4px;
}

.trending-filter::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.trending-filter :deep(.ant-radio-button-wrapper) {
  border-radius: 16px;
  height: 32px;
  line-height: 30px;
}

.trending-filter :deep(.ant-radio-button-wrapper:first-child) {
  border-radius: 16px;
}

.trending-filter :deep(.ant-radio-button-wrapper:last-child) {
  border-radius: 16px;
}

.trending-filter :deep(.ant-radio-button-wrapper-checked) {
  border-color: #6366f1;
  color: #6366f1;
}

.trending-timeline {
  margin-bottom: 16px;
}

.trending-timeline :deep(.ant-timeline-item-tail) {
  border-left-color: #ddd;
}

.trending-timeline :deep(.ant-timeline-item-head) {
  background-color: #6366f1;
}

.trending-item {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.trending-image-container {
  position: relative;
  width: 120px;
  height: 80px;
  flex-shrink: 0;
}

.trending-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.trending-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 77, 79, 0.85);
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.trending-badge :deep(.anticon) {
  margin-right: 4px;
}

.trending-count {
  font-weight: bold;
}

.trending-content {
  flex-grow: 1;
}

.trending-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.trending-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.trending-author {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.trending-author span {
  margin-left: 6px;
}

.trending-time {
  font-size: 12px;
  color: #999;
}

.trending-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
}

.stat-item :deep(.anticon) {
  margin-right: 4px;
}

.trending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.trending-tag {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  color: #666;
  margin: 0;
}

.trending-actions {
  display: flex;
  gap: 8px;
}

.trending-actions .ant-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
}

/* 空状态 */
.empty-recommendations {
  padding: 32px 0;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .recommendation-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .trending-item {
    flex-direction: column;
  }

  .trending-image-container {
    width: 100%;
    height: 160px;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>