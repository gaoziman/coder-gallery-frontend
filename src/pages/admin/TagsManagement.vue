<template>
  <div class="tag-management-container">
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
        <a-form-item label="标签名称" name="tagName">
          <a-input v-model:value="searchForm.tagName" placeholder="请输入标签名称" allowClear/>
        </a-form-item>
        <a-form-item label="分类" name="category">
          <a-select
              v-model:value="searchForm.category"
              placeholder="请选择分类"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="tech">技术</a-select-option>
            <a-select-option value="design">设计</a-select-option>
            <a-select-option value="life">生活</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="热度" name="popularity">
          <a-select
              v-model:value="searchForm.popularity"
              placeholder="请选择热度"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="创建时间" name="createTime">
          <a-range-picker
              v-model:value="searchForm.createTime"
              :placeholder="['开始日期', '结束日期']"
              format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item>
          <div>
            <button type="submit" class="custom-button primary">
              <search-outlined/>
              查询
            </button>
            <button type="button" class="custom-button secondary" style="margin-left: 8px;" @click="resetForm">
              <reload-outlined/>
              重置
            </button>
          </div>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <div class="left-buttons">
        <button class="custom-button primary" @click="openAddTagModal">
          <plus-outlined/>
          添加标签
        </button>
        <button class="custom-button secondary" style="margin-left: 8px;" @click="handleRefresh">
          <reload-outlined/>
          刷新
        </button>
        <button class="custom-button danger" style="margin-left: 8px;" :disabled="!hasSelected" @click="handleBatchDelete">
          <delete-outlined/>
          批量删除
        </button>
        <button class="custom-button secondary" style="margin-left: 8px;" @click="openBatchEditModal" :disabled="!hasSelected">
          <edit-outlined/>
          批量编辑
        </button>
      </div>

      <div class="right-buttons">
        <button class="custom-button secondary" @click="toggleViewMode">
          <component :is="viewMode === 'table' ? 'AppstoreOutlined' : 'BarsOutlined'" />
          {{ viewMode === 'table' ? '切换到卡片视图' : '切换到表格视图' }}
        </button>
        <a-dropdown>
          <button class="custom-button secondary" style="margin-left: 8px;">
            <export-outlined />
            导出
            <down-outlined />
          </button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="exportExcel">导出Excel</a-menu-item>
              <a-menu-item key="2" @click="exportPDF">导出PDF</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 标签云展示 -->
    <a-card class="tag-cloud-card" :body-style="{ padding: '24px' }">
      <template #title>
        <div class="card-title">
          <tags-outlined /> 标签云
        </div>
      </template>
      <div class="tag-cloud">
        <a-tag
            v-for="tag in tagData"
            :key="tag.id"
            :color="tag.color"
            :style="{ fontSize: getTagSize(tag.articleCount) + 'px', margin: '8px' }"
            @click="viewTagDetails(tag)"
        >
          {{ tag.name }} ({{ tag.articleCount }})
        </a-tag>
      </div>
    </a-card>

    <!-- 标签数据表格 -->
    <div v-if="viewMode === 'table'">
      <a-table
          :columns="columns"
          :data-source="tagData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
          class="tag-table"
      >
        <template #bodyCell="{ column, record }">
          <!-- 标签列 -->
          <template v-if="column.dataIndex === 'tag'">
            <a-tag :color="record.color">{{ record.name }}</a-tag>
          </template>

          <!-- 分类列 -->
          <template v-if="column.dataIndex === 'category'">
            <span class="custom-tag" :class="`tag-${record.category}`">{{ getCategoryName(record.category) }}</span>
          </template>

          <!-- 热度列 -->
          <template v-if="column.dataIndex === 'popularity'">
            <div class="popularity-indicator">
              <fire-outlined class="fire-icon" v-for="i in getPopularityLevel(record.popularity)" :key="i" />
              <fire-outlined class="fire-icon inactive" v-for="i in 3 - getPopularityLevel(record.popularity)" :key="i + 3" />
            </div>
          </template>

          <!-- 关联数量列 -->
          <template v-if="column.dataIndex === 'articleCount'">
            <button class="link-button" @click="viewRelatedArticles(record)">
              {{ record.articleCount }} 篇文章
            </button>
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <div class="table-actions">
              <button class="action-button" @click="viewTagDetails(record)">
                <eye-outlined />
              </button>
              <button class="action-button" @click="editTag(record)">
                <edit-outlined />
              </button>
              <a-popconfirm
                  title="确定要删除此标签吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="deleteTag(record)"
              >
                <button class="action-button delete">
                  <delete-outlined />
                </button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="card-view">
      <div v-for="tag in tagData" :key="tag.id" class="tag-card">
        <div class="tag-card-header">
          <h3 class="tag-title">{{ tag.name }}</h3>
          <span class="custom-tag" :class="`tag-${tag.category}`">{{ getCategoryName(tag.category) }}</span>
        </div>
        <div class="tag-card-content">
          <p class="tag-description">{{ tag.description || '暂无描述' }}</p>
          <div class="tag-meta">
            <div class="tag-stat">
              <file-outlined /> {{ tag.articleCount }} 篇文章
            </div>
            <div class="tag-stat">
              <fire-outlined /> 热度:
              <span class="popularity-indicator">
                <fire-outlined class="fire-icon" v-for="i in getPopularityLevel(tag.popularity)" :key="i" />
                <fire-outlined class="fire-icon inactive" v-for="i in 3 - getPopularityLevel(tag.popularity)" :key="i + 3" />
              </span>
            </div>
            <div class="tag-stat">
              <calendar-outlined /> {{ formatDate(tag.createTime) }}
            </div>
          </div>
          <div class="tag-actions">
            <button class="action-button" @click="viewTagDetails(tag)">
              <eye-outlined />
            </button>
            <button class="action-button" @click="editTag(tag)">
              <edit-outlined />
            </button>
            <a-popconfirm
                title="确定要删除此标签吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteTag(tag)"
            >
              <button class="action-button delete">
                <delete-outlined />
              </button>
            </a-popconfirm>
          </div>
        </div>
      </div>

      <!-- 卡片视图分页 -->
      <div class="card-pagination">
        <a-pagination
            v-model:current="pagination.current"
            :total="pagination.total"
            :pageSize="pagination.pageSize"
            :showSizeChanger="pagination.showSizeChanger"
            :showQuickJumper="pagination.showQuickJumper"
            :showTotal="pagination.showTotal"
            @change="(page) => handleCardPageChange(page)"
            @showSizeChange="(current, size) => handleCardSizeChange(current, size)"
        />
      </div>
    </div>

    <!-- 查看标签详情弹窗 -->
    <a-modal
        v-model:visible="viewModalVisible"
        title="标签详细信息"
        :footer="null"
        width="600px"
        class="custom-modal tag-detail-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeTagDetailModal"
    >
      <div class="tag-detail-header">
        <a-tag :color="currentTag.color" class="tag-detail-name">{{ currentTag.name }}</a-tag>
        <span class="custom-tag" :class="`tag-${currentTag.category}`">{{ getCategoryName(currentTag.category) }}</span>
      </div>

      <a-descriptions bordered :column="1" style="margin-top: 16px">
        <a-descriptions-item label="标签ID">{{ currentTag.id }}</a-descriptions-item>
        <a-descriptions-item label="标签描述">{{ currentTag.description || '暂无描述' }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ getCategoryName(currentTag.category) }}</a-descriptions-item>
        <a-descriptions-item label="热度">
          <div class="popularity-indicator">
            <fire-outlined class="fire-icon" v-for="i in getPopularityLevel(currentTag.popularity)" :key="i" />
            <fire-outlined class="fire-icon inactive" v-for="i in 3 - getPopularityLevel(currentTag.popularity)" :key="i + 3" />
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="关联文章数">{{ currentTag.articleCount }} 篇</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDateTime(currentTag.createTime) }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ formatDateTime(currentTag.updateTime) }}</a-descriptions-item>
        <a-descriptions-item label="SEO关键词">{{ currentTag.seoKeywords || '暂无' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <div class="tag-detail-related">
        <h3>关联的其他标签</h3>
        <div class="related-tags">
          <a-tag v-for="tag in relatedTags" :key="tag.id" :color="tag.color" style="margin: 4px" @click="switchToTag(tag)">
            {{ tag.name }} ({{ tag.articleCount }})
          </a-tag>
          <a-empty v-if="relatedTags.length === 0" description="暂无关联标签" />
        </div>
      </div>

      <div class="modal-footer">
        <button class="custom-button secondary" @click="viewModalVisible = false">关闭</button>
        <button class="custom-button primary" @click="editTag(currentTag)">编辑此标签</button>
        <button class="custom-button primary" @click="viewRelatedArticles(currentTag)">查看关联文章</button>
      </div>
    </a-modal>

    <!-- 编辑标签信息弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑标签信息"
        @ok="handleEditSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
        class="custom-modal edit-tag-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeEditModal"
    >
      <a-form :model="editForm" :rules="rules" ref="editFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="标签名称" name="name">
              <a-input v-model:value="editForm.name" placeholder="请输入标签名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属分类" name="category">
              <a-select v-model:value="editForm.category" placeholder="请选择分类">
                <a-select-option value="tech">技术</a-select-option>
                <a-select-option value="design">设计</a-select-option>
                <a-select-option value="life">生活</a-select-option>
                <a-select-option value="other">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="标签描述" name="description">
          <a-textarea v-model:value="editForm.description" placeholder="请输入标签描述" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="标签颜色" name="color">
              <div class="color-selector">
                <div
                    v-for="color in tagColors"
                    :key="color"
                    class="color-option"
                    :class="{ active: editForm.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="editForm.color = color"
                ></div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="热度" name="popularity">
              <a-select v-model:value="editForm.popularity" placeholder="请选择热度">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="SEO关键词" name="seoKeywords">
          <a-input v-model:value="editForm.seoKeywords" placeholder="多个关键词用英文逗号分隔" />
        </a-form-item>
      </a-form>

      <div class="color-preview">
        <span>效果预览：</span>
        <a-tag :color="editForm.color">{{ editForm.name || '标签名称' }}</a-tag>
      </div>
    </a-modal>

    <!-- 添加标签弹窗 -->
    <a-modal
        v-model:visible="addModalVisible"
        title="添加标签"
        @ok="handleAddSubmit"
        :confirmLoading="submitLoading"
        okText="添加"
        cancelText="取消"
        width="600px"
        class="custom-modal add-tag-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeAddModal"
    >
      <a-form :model="addForm" :rules="rules" ref="addFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="标签名称" name="name">
              <a-input v-model:value="addForm.name" placeholder="请输入标签名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属分类" name="category">
              <a-select v-model:value="addForm.category" placeholder="请选择分类">
                <a-select-option value="tech">技术</a-select-option>
                <a-select-option value="design">设计</a-select-option>
                <a-select-option value="life">生活</a-select-option>
                <a-select-option value="other">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="标签描述" name="description">
          <a-textarea v-model:value="addForm.description" placeholder="请输入标签描述" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="标签颜色" name="color">
              <div class="color-selector">
                <div
                    v-for="color in tagColors"
                    :key="color"
                    class="color-option"
                    :class="{ active: addForm.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="addForm.color = color"
                ></div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="热度" name="popularity">
              <a-select v-model:value="addForm.popularity" placeholder="请选择热度">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="SEO关键词" name="seoKeywords">
          <a-input v-model:value="addForm.seoKeywords" placeholder="多个关键词用英文逗号分隔" />
        </a-form-item>
      </a-form>

      <div class="color-preview">
        <span>效果预览：</span>
        <a-tag :color="addForm.color">{{ addForm.name || '标签名称' }}</a-tag>
      </div>
    </a-modal>

    <!-- 批量编辑弹窗 -->
    <a-modal
        v-model:visible="batchEditModalVisible"
        title="批量编辑标签"
        @ok="handleBatchEditSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
        class="custom-modal batch-edit-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeBatchEditModal"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          您已选择 <span style="font-weight: bold;">{{ selectedRowKeys.length }}</span> 个标签进行批量编辑，仅会更新您选择修改的字段。
        </template>
      </a-alert>

      <a-form :model="batchEditForm" ref="batchEditFormRef" layout="vertical">
        <a-form-item label="所属分类">
          <a-select v-model:value="batchEditForm.category" placeholder="请选择分类" allowClear>
            <a-select-option value="tech">技术</a-select-option>
            <a-select-option value="design">设计</a-select-option>
            <a-select-option value="life">生活</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="标签颜色">
          <div class="color-selector">
            <div
                v-for="color in tagColors"
                :key="color"
                class="color-option"
                :class="{ active: batchEditForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="batchEditForm.color = color"
            ></div>
            <div
                class="color-option clear-option"
                @click="batchEditForm.color = undefined"
            >
              <close-outlined />
            </div>
          </div>
        </a-form-item>

        <a-form-item label="热度">
          <a-select v-model:value="batchEditForm.popularity" placeholder="请选择热度" allowClear>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <a-alert
          type="warning"
          message="批量编辑将应用于所有选中的标签，请谨慎操作！"
          style="margin-top: 16px"
      />
    </a-modal>

    <!-- 查看关联文章弹窗 -->
    <a-modal
        v-model:visible="relatedArticlesModalVisible"
        title="关联文章列表"
        :footer="null"
        width="800px"
        class="custom-modal articles-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeRelatedArticlesModal"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          标签 <span style="font-weight: bold;">{{ currentTag.name }}</span> 下的文章列表 (共 {{ currentTag.articleCount }} 篇)
        </template>
      </a-alert>

      <a-table
          :columns="articleColumns"
          :data-source="relatedArticles"
          :loading="articleLoading"
          :pagination="{ pageSize: 5 }"
          size="small"
          class="article-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getArticleStatusColor(record.status)">{{ getArticleStatusText(record.status) }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag.id" :color="tag.color" style="margin: 2px">
              {{ tag.name }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <button class="action-button" @click="openArticlePreview(record)">
              <eye-outlined />
              预览
            </button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  watch
} from 'vue';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  TagsOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  ExportOutlined,
  DownOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FileOutlined,
  CalendarOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60,
  },
  {
    title: '标签',
    dataIndex: 'tag',
    key: 'tag',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 100,
    filters: [
      { text: '技术', value: 'tech' },
      { text: '设计', value: 'design' },
      { text: '生活', value: 'life' },
      { text: '其他', value: 'other' },
    ],
  },
  {
    title: '热度',
    dataIndex: 'popularity',
    key: 'popularity',
    width: 120,
    sorter: true,
    filters: [
      { text: '高', value: 'high' },
      { text: '中', value: 'medium' },
      { text: '低', value: 'low' },
    ],
  },
  {
    title: '文章数量',
    dataIndex: 'articleCount',
    key: 'articleCount',
    width: 100,
    sorter: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    sorter: true,
    width: 180,
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
];

// 关联文章表格列定义
const articleColumns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    width: 100,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    key: 'publishTime',
    width: 180,
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 100,
  },
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '标签总数',
    value: 36,
    change: 12.5,
    color: 'purple',
    icon: TagsOutlined,
  },
  {
    title: '本月新增标签',
    value: 9,
    change: 18.2,
    color: 'blue',
    icon: PlusOutlined,
  },
  {
    title: '热门标签',
    value: 12,
    change: 5.8,
    color: 'gold',
    icon: FireOutlined,
  },
  {
    title: '标签覆盖率',
    value: '92.7%',
    change: 3.4,
    color: 'green',
    icon: FileOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  tagName: '',
  category: undefined,
  popularity: undefined,
  createTime: [],
});

// 表格数据和加载状态
const loading = ref(false);
const tagData = ref([]);
const viewMode = ref('table'); // 'table' 或 'card'
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 选中行数据
// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 模态框可见性和当前操作标签
const viewModalVisible = ref(false);
const editModalVisible = ref(false);
const addModalVisible = ref(false);
const batchEditModalVisible = ref(false);
const relatedArticlesModalVisible = ref(false);
const submitLoading = ref(false);
const currentTag = ref({});
const relatedTags = ref([]);
const articleLoading = ref(false);
const relatedArticles = ref([]);

// 表单引用
const editFormRef = ref(null);
const addFormRef = ref(null);
const batchEditFormRef = ref(null);

// 标签颜色选项
const tagColors = [
  '#6554C0', // 紫色
  '#4E7CF6', // 蓝色
  '#1890FF', // 亮蓝色
  '#13C2C2', // 青色
  '#52C41A', // 绿色
  '#FAAD14', // 金色
  '#FA8C16', // 橙色
  '#F5222D', // 红色
  '#EB2F96', // 粉色
  '#722ED1', // 深紫色
  '#2F54EB', // 靛蓝色
  '#FA541C', // 朱红色
  '#A0D911', // 青柠绿
  '#08979C', // 蓝绿色
  '#595959', // 灰色
];

// 编辑表单数据
const editForm = reactive({
  id: '',
  name: '',
  description: '',
  category: '',
  color: '',
  popularity: '',
  seoKeywords: '',
});

// 添加表单数据
const addForm = reactive({
  name: '',
  description: '',
  category: 'tech',
  color: '#6554C0',
  popularity: 'medium',
  seoKeywords: '',
});

// 批量编辑表单数据
const batchEditForm = reactive({
  category: undefined,
  color: undefined,
  popularity: undefined,
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '标签名称长度应为2-20个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择颜色', trigger: 'change' }
  ],
  popularity: [
    { required: true, message: '请选择热度', trigger: 'change' }
  ]
};

// 在弹窗中显示标签信息的计算属性
const relatedArticlesMessage = computed(() => {
  return `标签 '${currentTag.value.name}' 下的文章列表 (共 ${currentTag.value.articleCount} 篇)`;
});

// 模拟标签数据
const fetchTagData = () => {
  loading.value = true;

  // 模拟API请求延迟
  setTimeout(() => {
    // 生成测试数据
    const mockTags = [];
    const categories = ['tech', 'design', 'life', 'other'];
    const popularityLevels = ['high', 'medium', 'low'];
    const descriptions = [
      '这是一个技术相关的标签，用于归类编程和开发文章',
      '设计类标签，包含UI/UX设计相关内容',
      '生活类标签，记录日常生活和心得体会',
      '其他类型的标签，涵盖多种主题',
      '热门标签，文章数量较多',
      '这是一个描述性标签，用于特定主题的归纳',
      '最近新增的标签，用于分类新内容'
    ];

    // 生成30个标签数据
    for (let i = 1; i <= 30; i++) {
      const color = tagColors[Math.floor(Math.random() * tagColors.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const popularity = popularityLevels[Math.floor(Math.random() * popularityLevels.length)];
      const articleCount = Math.floor(Math.random() * 50) + 1;
      const createTime = new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).getTime();
      const updateTime = new Date(2024, Math.floor(Math.random() * 3) + 3, Math.floor(Math.random() * 28) + 1).getTime();

      mockTags.push({
        id: i,
        name: `标签${i}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        category: category,
        color: color,
        popularity: popularity,
        articleCount: articleCount,
        createTime: createTime,
        updateTime: updateTime,
        seoKeywords: `标签${i},关键词,${category}`
      });
    }

    tagData.value = mockTags;
    pagination.total = mockTags.length;
    loading.value = false;
  }, 600);
};

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    'tech': '技术',
    'design': '设计',
    'life': '生活',
    'other': '其他'
  };
  return categoryMap[category] || '未分类';
};

// 获取热度等级 (1-3)
const getPopularityLevel = (popularity) => {
  const levelMap = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  return levelMap[popularity] || 1;
};

// 获取标签云大小
const getTagSize = (count) => {
  // 根据文章数量计算字体大小，最小12px，最大24px
  return Math.max(12, Math.min(24, 12 + count / 5));
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '暂无';
  return dayjs(timestamp).format('YYYY-MM-DD');
};

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return '暂无';
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

// 获取文章状态颜色
const getArticleStatusColor = (status) => {
  const colorMap = {
    'published': 'green',
    'draft': 'orange',
    'pending': 'blue',
    'rejected': 'red'
  };
  return colorMap[status] || 'default';
};

// 获取文章状态文本
const getArticleStatusText = (status) => {
  const textMap = {
    'published': '已发布',
    'draft': '草稿',
    'pending': '待审核',
    'rejected': '已拒绝'
  };
  return textMap[status] || '未知状态';
};


// 关闭编辑标签模态框
const closeEditModal = () => {
  editModalVisible.value = false;
  document.body.classList.remove('modal-open');
};

// 关闭添加标签模态框
const closeAddModal = () => {
  addModalVisible.value = false;
  document.body.classList.remove('modal-open');
};

// 关闭批量编辑模态框
const closeBatchEditModal = () => {
  batchEditModalVisible.value = false;
  document.body.classList.remove('modal-open');
};

// 表格数据处理函数
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    tagData.value = [...tagData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'number') {
        return order * (a[sorter.field] - b[sorter.field]);
      } else if (sorter.field === 'createTime') {
        return order * (a.createTime - b.createTime);
      } else {
        return order * String(a[sorter.field]).localeCompare(String(b[sorter.field]));
      }
    });
  }

  // 处理筛选
  if (filters) {
    let filteredData = [...tagData.value];

    if (filters.category && filters.category.length > 0) {
      filteredData = filteredData.filter(item => filters.category.includes(item.category));
    }

    if (filters.popularity && filters.popularity.length > 0) {
      filteredData = filteredData.filter(item => filters.popularity.includes(item.popularity));
    }

    tagData.value = filteredData;
  }
};

// 关闭标签详情模态框
const closeTagDetailModal = () => {
  viewModalVisible.value = false;
  document.body.classList.remove('modal-open');
};

// 查看标签详情
const viewTagDetails = (tag) => {
  currentTag.value = { ...tag };
  // 获取关联标签
  relatedTags.value = tagData.value
      .filter(item => item.id !== tag.id && item.category === tag.category)
      .slice(0, 5);
  viewModalVisible.value = true;
  document.body.classList.add('modal-open');
};

// 表格多选处理
const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
};

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
};

// 卡片视图分页处理
const handleCardPageChange = (page) => {
  pagination.current = page;
};

const handleCardSizeChange = (current, size) => {
  pagination.pageSize = size;
  pagination.current = current;
};

// 搜索处理
const handleSearch = () => {
  loading.value = true;

  // 模拟API搜索请求
  setTimeout(() => {
    const filteredData = tagData.value.filter(tag => {
      // 名称搜索
      if (searchForm.tagName && !tag.name.includes(searchForm.tagName)) {
        return false;
      }

      // 分类搜索
      if (searchForm.category && tag.category !== searchForm.category) {
        return false;
      }

      // 热度搜索
      if (searchForm.popularity && tag.popularity !== searchForm.popularity) {
        return false;
      }

      // 创建时间搜索
      if (searchForm.createTime && searchForm.createTime.length === 2) {
        const startTime = searchForm.createTime[0].valueOf();
        const endTime = searchForm.createTime[1].valueOf();
        if (tag.createTime < startTime || tag.createTime > endTime) {
          return false;
        }
      }

      return true;
    });

    tagData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
};

// 重置搜索表单
const resetForm = () => {
  searchForm.tagName = '';
  searchForm.category = undefined;
  searchForm.popularity = undefined;
  searchForm.createTime = [];

  // 重新获取数据
  fetchTagData();
  message.success('表单已重置');
};

// 刷新数据
const handleRefresh = () => {
  fetchTagData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
};


// 切换到其他标签详情
const switchToTag = (tag) => {
  viewModalVisible.value = false;
  setTimeout(() => {
    viewTagDetails(tag);
  }, 300);
};

// 编辑标签
const editTag = (tag) => {
  currentTag.value = { ...tag };
  Object.keys(editForm).forEach(key => {
    if (key in tag) {
      editForm[key] = tag[key];
    }
  });
  viewModalVisible.value = false;
  document.body.classList.remove('modal-open');
  editModalVisible.value = true;
  document.body.classList.add('modal-open');
};


// 处理编辑提交
const handleEditSubmit = () => {
  editFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API提交
        setTimeout(() => {
          // 更新数据源
          const index = tagData.value.findIndex(item => item.id === editForm.id);
          if (index !== -1) {
            tagData.value[index] = {
              ...tagData.value[index],
              ...editForm,
              updateTime: new Date().getTime()
            };
          }

          submitLoading.value = false;
          editModalVisible.value = false;
          document.body.classList.remove('modal-open'); // 确保移除 modal-open 类
          message.success('标签信息已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};

// 打开添加标签弹窗
const openAddTagModal = () => {
  // 重置添加表单
  Object.keys(addForm).forEach(key => {
    addForm[key] = key === 'category' ? 'tech' : (key === 'color' ? '#6554C0' : (key === 'popularity' ? 'medium' : ''));
  });

  addModalVisible.value = true;
  document.body.classList.add('modal-open');
};


// 处理添加提交
const handleAddSubmit = () => {
  addFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API提交
        setTimeout(() => {
          // 创建新标签并添加到数据源
          const newTag = {
            id: tagData.value.length > 0 ? Math.max(...tagData.value.map(item => item.id)) + 1 : 1,
            name: addForm.name,
            description: addForm.description,
            category: addForm.category,
            color: addForm.color,
            popularity: addForm.popularity,
            articleCount: 0,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime(),
            seoKeywords: addForm.seoKeywords
          };

          tagData.value.unshift(newTag);
          pagination.total += 1;
          pagination.current = 1;

          submitLoading.value = false;
          addModalVisible.value = false;
          document.body.classList.remove('modal-open'); // 确保移除 modal-open 类
          message.success('标签已添加');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};


// 删除标签
const deleteTag = (tag) => {
  loading.value = true;

  // 模拟API删除
  setTimeout(() => {
    tagData.value = tagData.value.filter(item => item.id !== tag.id);
    pagination.total -= 1;

    // 如果当前选中行包含被删除的标签，从选中行中移除
    if (selectedRowKeys.value.includes(tag.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== tag.id);
    }

    loading.value = false;
    message.success(`标签"${tag.name}"已删除`);
  }, 500);
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的标签');
    return;
  }

  loading.value = true;

  // 模拟API批量删除
  setTimeout(() => {
    tagData.value = tagData.value.filter(item => !selectedRowKeys.value.includes(item.id));
    pagination.total -= selectedRowKeys.value.length;
    selectedRowKeys.value = [];

    loading.value = false;
    message.success('所选标签已批量删除');
  }, 500);
};

// 打开批量编辑弹窗
const openBatchEditModal = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要编辑的标签');
    return;
  }

  // 重置批量编辑表单
  batchEditForm.category = undefined;
  batchEditForm.color = undefined;
  batchEditForm.popularity = undefined;

  // 获取选中的标签名称列表（用于显示）
  const selectedTagNames = tagData.value
      .filter(item => selectedRowKeys.value.includes(item.id))
      .map(item => item.name)
      .join('、');

  currentTag.value = { name: selectedTagNames, articleCount: selectedRowKeys.value.length };
  batchEditModalVisible.value = true;
  document.body.classList.add('modal-open');
};

// 处理批量编辑提交
const handleBatchEditSubmit = () => {
  submitLoading.value = true;

  // 模拟API批量更新
  setTimeout(() => {
    // 更新所选标签
    tagData.value = tagData.value.map(tag => {
      if (selectedRowKeys.value.includes(tag.id)) {
        // 只更新有值的字段
        const updates = {};
        if (batchEditForm.category !== undefined) {
          updates.category = batchEditForm.category;
        }
        if (batchEditForm.color !== undefined) {
          updates.color = batchEditForm.color;
        }
        if (batchEditForm.popularity !== undefined) {
          updates.popularity = batchEditForm.popularity;
        }

        return {
          ...tag,
          ...updates,
          updateTime: new Date().getTime()
        };
      }
      return tag;
    });

    submitLoading.value = false;
    batchEditModalVisible.value = false;
    document.body.classList.remove('modal-open'); // 确保移除 modal-open 类
    message.success(`已成功更新${selectedRowKeys.value.length}个标签`);
  }, 500);
};

// 查看关联文章
const viewRelatedArticles = (tag) => {
  currentTag.value = { ...tag };
  articleLoading.value = true;
  document.body.classList.add('modal-open');

  // 模拟API获取关联文章
  setTimeout(() => {
    // 生成模拟文章数据
    const mockArticles = [];
    const statuses = ['published', 'draft', 'pending', 'rejected'];
    const authors = ['张三', '李四', '王五', '赵六', '系统管理员'];

    // 生成tag.articleCount篇文章
    for (let i = 1; i <= tag.articleCount; i++) {
      // 为每篇文章随机生成1-3个关联标签
      const relatedTags = [];
      // 必定包含当前标签
      relatedTags.push({
        id: tag.id,
        name: tag.name,
        color: tag.color
      });

      // 随机添加其他标签
      const randomTagCount = Math.floor(Math.random() * 3);
      const otherTags = tagData.value.filter(t => t.id !== tag.id);
      for (let j = 0; j < randomTagCount && j < otherTags.length; j++) {
        const randomIndex = Math.floor(Math.random() * otherTags.length);
        relatedTags.push({
          id: otherTags[randomIndex].id,
          name: otherTags[randomIndex].name,
          color: otherTags[randomIndex].color
        });
      }

      mockArticles.push({
        id: i,
        title: `与"${tag.name}"相关的文章${i}`,
        author: authors[Math.floor(Math.random() * authors.length)],
        tags: relatedTags,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        publishTime: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).getTime()
      });
    }

    relatedArticles.value = mockArticles;
    articleLoading.value = false;
    relatedArticlesModalVisible.value = true;
  }, 600);
};

// 关闭关联文章模态框
const closeRelatedArticlesModal = () => {
  relatedArticlesModalVisible.value = false;
  document.body.classList.remove('modal-open');
};

// 预览文章
const openArticlePreview = (article) => {
  message.info(`正在预览文章：${article.title}`);
  // 实际项目中应该跳转到文章预览页或打开预览弹窗
};

// 导出Excel
const exportExcel = () => {
  message.success('正在导出Excel文件，请稍候...');
  // 实际项目中接入Excel导出功能
  setTimeout(() => {
    message.success('Excel文件导出成功');
  }, 1500);
};

// 导出PDF
const exportPDF = () => {
  message.success('正在导出PDF文件，请稍候...');
  // 实际项目中接入PDF导出功能
  setTimeout(() => {
    message.success('PDF文件导出成功');
  }, 1500);
};

// 在组件挂载时获取数据
onMounted(() => {
  fetchTagData();
});

</script>

<style scoped>
  /* 全局容器样式 */
  .tag-management-container {
  padding: 16px;
  background-color: #f8f9fc;
}

  /* 数据统计卡片样式 */
  .stat-cards {
    margin-bottom: 24px;
}

  .stat-card {
    border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  overflow: hidden;
  border: none;
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

  .bg-purple {
  background: linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%);
}

  .bg-blue {
  background: linear-gradient(135deg, #4E7CF6 0%, #7B97F6 100%);
}

  .bg-gold {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
}

  .bg-green {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: none;
}

  .search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

  /* 操作按钮区域样式 */
  .operation-bar {
    margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

  /* 标签云卡片样式 */
  .tag-cloud-card {
    margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: none;
}

  .card-title {
    font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

  .tag-cloud {
  padding: 16px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

  /* 标签表格样式 */
  :deep(.ant-table) {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

  :deep(.ant-table-thead > tr > th) {
    background-color: #f8f9fc;
  font-weight: 500;
  color: #333;
}

  :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #f0ebff;
}

  :deep(.ant-table-tbody > tr.ant-table-row-selected > td) {
    background-color: #f0ebff !important;
}

  /* 卡片视图样式 */
  .card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

  .tag-card {
    border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  height: 100%;
  background-color: white;
  overflow: hidden;
  border: none;
  position: relative;
}

  .tag-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

  .tag-card-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

  .tag-title {
    font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex: 1;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

  .tag-card-content {
  padding: 16px;
}

  .tag-description {
  color: #666;
  margin-bottom: 16px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: 14px;
  line-height: 1.5;
}

  .tag-meta {
    margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

  .tag-stat {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 12px;
}

  .tag-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

  /* 自定义标签样式 */
  .custom-tag {
    border-radius: 16px;
  padding: 2px 10px;
  font-size: 12px;
  margin-left: 8px;
  color: white;
  display: inline-block;
}

  .tag-tech {
    background-color: #4E7CF6;
}

  .tag-design {
    background-color: #6554C0;
}

  .tag-life {
    background-color: #13C2C2;
}

  .tag-other {
    background-color: #FAAD14;
}

  /* 热度指示器自定义样式 */
  .popularity-indicator {
  display: flex;
  align-items: center;
}

  .fire-icon {
  color: #FF4D4F;
  margin-right: 2px;
}

  .fire-icon.inactive {
  color: #E8E8E8;
}

  /* 自定义按钮样式 */
  .custom-button {
    border-radius: 8px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  padding: 0 16px;
  cursor: pointer;
}

  .custom-button.primary {
  background: linear-gradient(to right, #6554C0, #7C68EE);
  color: white;
}

  .custom-button.primary:hover {
  background: linear-gradient(to right, #7C68EE, #8A7CF6);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(101, 84, 192, 0.3);
}

  .custom-button.secondary {
    background-color: white;
  color: #6554C0;
  border: 1px solid #6554C0;
}

  .custom-button.secondary:hover {
    background-color: #f0ebff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(101, 84, 192, 0.1);
}

  .custom-button.danger {
    background-color: white;
  color: #FF4D4F;
  border: 1px solid #FF4D4F;
}

  .custom-button.danger:hover {
    background-color: #fff1f0;
  color: #ff7875;
  border-color: #ff7875;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.1);
}

  .custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

  .action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

  .action-button:hover {
    background-color: #f0f0f0;
  color: #6554C0;
}

  .action-button.delete:hover {
  color: #FF4D4F;
}

  .table-actions {
  display: flex;
  gap: 8px;
}

  .link-button {
  background: none;
  border: none;
  padding: 0;
  color: #6554C0;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

  .link-button:hover {
  color: #7C68EE;
  text-decoration: underline;
}

  /* 分页器自定义样式 */
  .card-pagination {
    margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

  :deep(.ant-pagination-item-active) {
    border-color: #6554C0;
}

  :deep(.ant-pagination-item-active a) {
  color: #6554C0;
}

  :deep(.ant-pagination-item:hover) {
    border-color: #6554C0;
}

  :deep(.ant-pagination-item:hover a) {
  color: #6554C0;
}

  :deep(.ant-pagination-next:hover .ant-pagination-item-link),
  :deep(.ant-pagination-prev:hover .ant-pagination-item-link) {
  color: #6554C0;
  border-color: #6554C0;
}

  /* 表单控件自定义样式 */
  :deep(.ant-input) {
    border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  transition: all 0.3s;
}

  :deep(.ant-input:focus),
  :deep(.ant-input-focused) {
    border-color: #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

  :deep(.ant-select-selector) {
    border-radius: 8px !important;
  border: 1px solid #e8e8e8 !important;
  padding: 0 12px !important;
}

  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #6554C0 !important;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2) !important;
}

  :deep(.ant-picker) {
    border-radius: 8px;
  border: 1px solid #e8e8e8;
}

  :deep(.ant-picker-focused) {
    border-color: #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

  /* 标签详情样式 */
  .tag-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

  .tag-detail-name {
    font-size: 16px;
  padding: 4px 12px;
  border-radius: 16px;
}

  .tag-detail-related {
    margin-top: 24px;
}

  .tag-detail-related h3 {
    font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

  .related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

  /* 弹窗自定义样式 */
  :deep(.ant-modal-content) {
    border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

  :deep(.ant-modal-header) {
    background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

  :deep(.ant-modal-title) {
    font-weight: 600;
  font-size: 18px;
  color: #333;
}

  :deep(.ant-modal-body) {
  padding: 24px;
}

  :deep(.ant-modal-footer) {
    border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
}

  /* 自定义描述列表样式 */
  :deep(.ant-descriptions-bordered) {
    border-radius: 8px;
  overflow: hidden;
}

  :deep(.ant-descriptions-item-label) {
    background-color: #f9f9f9;
  font-weight: 500;
}

  /* 颜色选择器样式 */
  .color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

  .color-option {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

  .color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

  .color-option.active {
  border: 2px solid #6554C0;
  transform: scale(1.1);
}

  .clear-option {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

  .color-preview {
    margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

  /* 自定义Alert样式 */
  :deep(.ant-alert) {
    border-radius: 8px;
  margin-bottom: 16px;
}

  /* 文章表格样式 */
  .article-table {
    border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

  /* 弹窗底部按钮样式 */
  .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

  /* 响应式样式调整 */
  @media (max-width: 768px) {
  .operation-bar {
  flex-direction: column;
  align-items: flex-start;
}

  .operation-bar > div {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

  .search-form {
  flex-direction: column;
}

  .search-form .ant-form-item {
  margin-right: 0;
  width: 100%;
}

  .card-view {
  grid-template-columns: 1fr;
}
}

  /* 操作按钮区域样式 */
  .operation-bar {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .left-buttons, .right-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .left-buttons {
    flex-grow: 1;
  }

  .right-buttons {
    justify-content: flex-end;
  }

  /* 按钮样式保持不变 */
  .custom-button {
    border-radius: 8px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    padding: 0 16px;
    cursor: pointer;
    white-space: nowrap;
  }

  /* 模态框样式优化 */
  :deep(.tag-detail-modal .ant-modal-content),
  :deep(.articles-modal .ant-modal-content),
  :deep(.custom-modal .ant-modal-content) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  :deep(.custom-modal .ant-modal-mask) {
    backdrop-filter: blur(5px);
  }

  /* 当模态框打开时禁用页面滚动 */
  body.modal-open {
    overflow: hidden;
  }

  /* 模态框的全屏覆盖 */
  :deep(.custom-modal .ant-modal-wrap) {
    z-index: 2000;
  }

  :deep(.custom-modal .ant-modal) {
    top: 20px;
    padding-bottom: 20px;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .operation-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .left-buttons, .right-buttons {
      width: 100%;
      margin-bottom: 12px;
    }

    .right-buttons {
      justify-content: flex-start;
    }
  }

  @media (min-width: 769px) and (max-width: 1200px) {
  .card-view {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
}
</style>