<template>
  <div class="image-management-container">
    <div class="im-page-container">
      <!-- 图片管理页面标题区域 -->
      <div class="im-header">
        <div class="im-header-left">
          <div class="im-icon-container">
            <picture-outlined class="im-icon"/>
          </div>
          <div class="im-header-info">
            <div class="im-title-row">
              <h1 class="im-title">图片管理</h1>
              <a-tag color="#6554C0">内容管理</a-tag>
            </div>
            <p class="im-description">
              管理系统图片资源，支持上传、分类、优化以及使用情况追踪
            </p>
          </div>
        </div>

        <div class="im-header-right">
          <div class="im-metrics">
            <div class="im-metric-item">
              <div class="im-metric-label">
                <calendar-outlined/>
                今日上传
              </div>
              <div class="im-metric-value">32</div>
            </div>
            <div class="im-divider"></div>
            <div class="im-metric-item">
              <div class="im-metric-label">
                <cloud-upload-outlined/>
                本周新增
              </div>
              <div class="im-metric-value">147</div>
            </div>
            <div class="im-divider"></div>
            <div class="im-metric-item">
              <div class="im-metric-label">
                <warning-outlined/>
                待优化
              </div>
              <div class="im-metric-value">18</div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 图片名称 -->
            <a-form-item label="图片名称" name="imageName">
              <a-input v-model:value="searchForm.imageName" placeholder="请输入图片名称" allowClear/>
            </a-form-item>

            <!-- 分类 -->
            <a-form-item label="分类" name="category">
              <a-select
                  v-model:value="searchForm.category"
                  placeholder="请选择分类"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="banner">Banner</a-select-option>
                <a-select-option value="product">产品图片</a-select-option>
                <a-select-option value="avatar">用户头像</a-select-option>
                <a-select-option value="background">背景图片</a-select-option>
                <a-select-option value="icon">图标</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 状态 -->
            <a-form-item label="状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="active">已启用</a-select-option>
                <a-select-option value="inactive">未启用</a-select-option>
                <a-select-option value="processing">处理中</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 上传时间 -->
            <a-form-item label="上传时间" name="uploadTime">
              <a-range-picker
                  v-model:value="searchForm.uploadTime"
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
          <a-button type="primary" @click="openUploadModal">
            <upload-outlined/>
            上传图片
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="list">
            <unordered-list-outlined />
            列表视图
          </a-radio-button>
          <a-radio-button value="grid">
            <appstore-outlined />
            网格视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="imageData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 缩略图列 -->
          <template v-if="column.dataIndex === 'thumbnail'">
            <div class="image-thumbnail-container">
              <img :src="record.url" :alt="record.name" class="image-thumbnail"  @click="handlePreviewImage(record)"/>
            </div>
          </template>

          <!-- 图片大小列 -->
          <template v-if="column.dataIndex === 'size'">
            {{ formatFileSize(record.size) }}
          </template>

          <!-- 分类列 -->
          <template v-if="column.dataIndex === 'category'">
            <a-tag :color="getCategoryColor(record.category)">{{ getCategoryName(record.category) }}</a-tag>
          </template>

          <!-- 格式列 -->
          <template v-if="column.dataIndex === 'format'">
            <a-tag :color="getFormatColor(record.format)">{{ record.format.toUpperCase() }}</a-tag>
          </template>

          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="getStatusType(record.status)"
                :text="getStatusText(record.status)"
            />
          </template>

          <!-- 上传时间 -->
          <template v-if="column.dataIndex === 'uploadTime'">
            {{ formatDateTime(record.uploadTime) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handlePreviewImage(record)">
                <eye-outlined/>
                预览
              </a-button>
              <a-button type="link" size="small" @click="copyImageUrl(record)">
                <link-outlined/>
                复制链接
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="editImageInfo(record)">
                      <edit-outlined /> 编辑信息
                    </a-menu-item>
                    <a-menu-item key="2" @click="replaceImage(record)">
                      <swap-outlined /> 替换图片
                    </a-menu-item>
                    <a-menu-item key="3" @click="downloadImage(record)">
                      <download-outlined /> 下载
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="4" danger @click="showDeleteConfirm(record)">
                      <delete-outlined /> 删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  <more-outlined />
                  更多
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 网格视图 -->
    <div v-else-if="viewMode === 'grid'" class="grid-view-container">
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
          <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4" v-for="image in imageData" :key="image.id">
            <div
                class="image-card"
                :class="{ 'image-card-selected': selectedRowKeys.includes(image.id) }"
                @click="toggleImageSelection(image.id)"
            >
              <div class="image-card-header">
                <a-checkbox :checked="selectedRowKeys.includes(image.id)" @click.stop />
                <a-tag :color="getCategoryColor(image.category)">{{ getCategoryName(image.category) }}</a-tag>
              </div>
              <div class="image-card-body" @click.stop="handlePreviewImage(image)">
                <img :src="image.url" :alt="image.name" class="grid-image" />
                <div class="image-info-overlay">
                  <div class="image-dimension">{{ image.width }} × {{ image.height }}</div>
                  <div class="image-format">{{ image.format.toUpperCase() }}</div>
                </div>
              </div>
              <div class="image-card-footer">
                <div class="image-name" :title="image.name">{{ image.name }}</div>
                <div class="image-meta">
                  <span class="image-size">{{ formatFileSize(image.size) }}</span>
                  <span class="image-status">
                    <a-badge :status="getStatusType(image.status)" :text="getStatusText(image.status)" />
                  </span>
                </div>
                <div class="image-actions">
                  <a-button type="link" size="small" @click.stop="handlePreviewImage(image)">
                    <eye-outlined />
                  </a-button>
                  <a-button type="link" size="small" @click.stop="editImageInfo(image)">
                    <edit-outlined />
                  </a-button>
                  <a-button type="link" size="small" @click.stop="copyImageUrl(image)">
                    <link-outlined />
                  </a-button>
                  <a-dropdown>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="3" @click.stop="downloadImage(image)">
                          <download-outlined /> 下载
                        </a-menu-item>
                        <a-menu-divider />
                        <a-menu-item key="4" danger @click.stop="showDeleteConfirm(image)">
                          <delete-outlined /> 删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                    <a-button type="link" size="small" @click.stop>
                      <more-outlined />
                    </a-button>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <!-- 网格视图分页 -->
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

    <!-- 图片预览 -->
    <a-modal
        v-model:visible="previewVisible"
        :footer="null"
        :width="1200"
        :centered="true"
        :mask-closable="true"
        class="custom-preview-modal"
        @cancel="handlePreviewClose"
        :destroyOnClose="true"
    >
      <!-- 确保关闭按钮可见且正确绑定事件 -->
      <template #closeIcon>
        <div class="close-btn-wrapper" @click="handlePreviewClose">
          <close-outlined class="custom-close-icon" />
        </div>
      </template>

      <div class="preview-container">
        <!-- 左侧图片区域 - 调整为60%宽度 -->
        <div class="preview-image-container">
          <img
              :src="previewImage ? previewImage.url : ''"
              :alt="previewImage ? previewImage.name : ''"
              class="preview-image"
          />

          <!-- 上一张/下一张按钮 -->
          <div class="preview-nav prev" @click.stop="navigateImages(-1)" v-if="imageData.length > 1">
            <left-outlined />
          </div>
          <div class="preview-nav next" @click.stop="navigateImages(1)" v-if="imageData.length > 1">
            <right-outlined />
          </div>

          <!-- 图片计数器 -->
          <div class="preview-counter" v-if="imageData.length > 1">
            {{ previewIndex + 1 }} / {{ imageData.length }}
          </div>
        </div>

        <!-- 右侧信息面板，增加宽度到40% -->
        <div class="preview-info-panel">
          <div class="preview-info-content">
            <div class="preview-header">
              <h2 class="preview-title">{{ previewImage ? previewImage.name : '' }}</h2>
              <div class="file-type-badge">
                <a-tag :color="getFormatColor(previewImage?.format)">
                  {{ previewImage?.format?.toUpperCase() }}
                </a-tag>
              </div>
            </div>

            <!-- 基本信息区域 -->
            <div class="info-section">
              <div class="section-header">
                <info-circle-outlined />
                <span>基本信息</span>
              </div>

              <div class="info-table">
                <div class="info-row">
                  <div class="info-label">分类</div>
                  <div class="info-value">
                    <a-tag :color="getCategoryColor(previewImage?.category)">
                      {{ getCategoryName(previewImage?.category) }}
                    </a-tag>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">尺寸</div>
                  <div class="info-value">{{ previewImage?.width || 0 }} × {{ previewImage?.height || 0 }} px</div>
                </div>
                <div class="info-row">
                  <div class="info-label">大小</div>
                  <div class="info-value">{{ formatFileSize(previewImage?.size) }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">状态</div>
                  <div class="info-value">
                    <a-badge :status="getStatusType(previewImage?.status)" :text="getStatusText(previewImage?.status)" />
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">上传时间</div>
                  <div class="info-value">{{ formatDateTime(previewImage?.uploadTime) }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">访问控制</div>
                  <div class="info-value">
                    {{ previewImage?.accessControl === 'public' ? '公开访问' :
                      previewImage?.accessControl === 'restricted' ? '限制访问' : '私有' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 描述信息区域 -->
            <div class="info-section">
              <div class="section-header">
                <file-text-outlined />
                <span>描述</span>
              </div>
              <div class="description-content">
                {{ previewImage?.description || '暂无描述' }}
              </div>
            </div>

            <!-- 使用情况区域 -->
            <div class="info-section">
              <div class="section-header">
                <bar-chart-outlined />
                <span>使用情况</span>
              </div>
              <div class="usage-content">
                <div class="usage-stat-item">
                  <div class="usage-label">引用次数</div>
                  <div class="usage-value">{{ Math.floor(Math.random() * 50) }}</div>
                </div>
                <div class="usage-stat-item">
                  <div class="usage-label">最近使用</div>
                  <div class="usage-value">{{ dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD') }}</div>
                </div>
              </div>
            </div>

            <!-- 操作按钮，确保在滚动区域内 -->
            <div class="action-section">
              <a-button type="primary" @click="copyImageUrl(previewImage)" class="action-button">
                <template #icon><link-outlined /></template>
                复制链接
              </a-button>
              <a-button @click="downloadImage(previewImage)" class="action-button">
                <template #icon><download-outlined /></template>
                下载
              </a-button>
              <a-button type="dashed" @click="editImageInfo(previewImage)" class="action-button">
                <template #icon><edit-outlined /></template>
                编辑信息
              </a-button>
              <a-button danger @click="showDeleteConfirm(previewImage)" class="action-button">
                <template #icon><delete-outlined /></template>
                删除
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 图片上传弹窗 -->
    <a-modal
        v-model:visible="uploadModalVisible"
        title="上传图片"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-image-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <upload-outlined/>
        </div>
        <div class="header-title">
          <h2>上传新图片</h2>
          <p>支持单张或批量上传，格式包括JPG、PNG、WebP、SVG</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="uploadForm"
          :rules="uploadRules"
          ref="uploadFormRef"
          layout="vertical"
      >
        <div class="uploader-container">
          <a-upload-dragger
              name="file"
              :multiple="true"
              :file-list="fileList"
              :before-upload="beforeUpload"
              @change="handleUploadChange"
              @drop="handleDrop"
          >
            <p class="ant-upload-drag-icon">
              <inbox-outlined />
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint">
              支持单个或批量上传，严禁上传违法图片或文件
            </p>
          </a-upload-dragger>
        </div>

        <div class="batch-settings" v-if="fileList.length > 0">
          <div class="settings-header">
            <setting-outlined/>
            <span>批量设置</span>
          </div>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="分类" name="category">
                <a-select
                    v-model:value="uploadForm.category"
                    placeholder="请选择图片分类"
                    :options="categoryOptions"
                >
                  <template #suffixIcon>
                    <appstore-outlined/>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="状态" name="status">
                <a-select
                    v-model:value="uploadForm.status"
                    placeholder="请选择图片状态"
                    :options="statusOptions"
                >
                  <template #suffixIcon>
                    <check-circle-outlined/>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>


          <a-form-item label="访问限制" name="accessControl">
            <a-radio-group v-model:value="uploadForm.accessControl">
              <a-radio value="public">公开访问</a-radio>
              <a-radio value="restricted">限制访问</a-radio>
              <a-radio value="private">私有</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleUploadCancel">取消</a-button>
            <a-button
                type="primary"
                @click="handleUploadSubmit"
                :loading="submitLoading"
                :disabled="fileList.length === 0"
            >
              <template #icon>
                <cloud-upload-outlined/>
              </template>
              开始上传
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <!-- 编辑图片信息弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑图片信息"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-image-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <edit-outlined/>
        </div>
        <div class="header-title">
          <h2>编辑图片信息</h2>
          <p>修改图片的基本信息和分类等配置</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="editForm"
          :rules="editRules"
          ref="editFormRef"
          layout="vertical"
      >
        <div class="form-row-container">
          <!-- 左侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <profile-outlined/>
              <span>基本信息</span>
            </div>

            <a-form-item label="图片名称" name="name">
              <a-input
                  v-model:value="editForm.name"
                  placeholder="请输入图片名称"
              >
                <template #prefix>
                  <file-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="分类" name="category">
              <a-select
                  v-model:value="editForm.category"
                  placeholder="请选择图片分类"
                  :options="categoryOptions"
              >
                <template #suffixIcon>
                  <appstore-outlined/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="状态" name="status">
              <a-select
                  v-model:value="editForm.status"
                  placeholder="请选择图片状态"
                  :options="statusOptions"
              >
                <template #suffixIcon>
                  <check-circle-outlined/>
                </template>
              </a-select>
            </a-form-item>
          </div>

          <!-- 右侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <picture-outlined/>
              <span>图片预览</span>
            </div>

            <div class="image-preview-container">
              <img :src="editForm.url" :alt="editForm.name" class="image-preview" />
              <div class="image-preview-info">
                <div class="info-item">
                  <span class="info-label"><file-image-outlined /> 文件名:</span>
                  <span class="info-value">{{ getFileName(editForm.url) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><column-width-outlined /> 尺寸:</span>
                  <span class="info-value">{{ editForm.width || '未知' }} × {{ editForm.height || '未知' }} px</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><file-outlined /> 格式:</span>
                  <span class="info-value">{{ editForm.format ? editForm.format.toUpperCase() : '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><cloud-outlined /> 大小:</span>
                  <span class="info-value">{{ formatFileSize(editForm.size) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><calendar-outlined /> 上传时间:</span>
                  <span class="info-value">{{ formatDateTime(editForm.uploadTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a-form-item label="图片描述" name="description">
          <a-textarea
              v-model:value="editForm.description"
              placeholder="请输入图片描述信息（选填）"
              :rows="3"
              :maxLength="200"
              :showCount="true"
          />
        </a-form-item>

        <a-form-item label="访问控制" name="accessControl">
          <a-radio-group v-model:value="editForm.accessControl">
            <a-radio value="public">公开访问</a-radio>
            <a-radio value="restricted">限制访问</a-radio>
            <a-radio value="private">私有</a-radio>
          </a-radio-group>
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleEditCancel">取消</a-button>
            <a-button type="primary" @click="handleEditSubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  h, onBeforeUnmount
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  CloudUploadOutlined,
  WarningOutlined,
  SettingOutlined,
  PictureOutlined,
  CloseOutlined,
  UploadOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileOutlined,
  LinkOutlined,
  MoreOutlined,
  InboxOutlined,
  SwapOutlined,
  DownloadOutlined,
  CloudOutlined,
  FileImageOutlined,
  ProfileOutlined,
  ColumnWidthOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 70,
    fixed: 'left'
  },
  {
    title: '缩略图',
    dataIndex: 'thumbnail',
    align: 'center',
    width: 100
  },
  {
    title: '图片名称',
    dataIndex: 'name',
    align: 'left',
    width: 200
  },
  {
    title: '分类',
    dataIndex: 'category',
    align: 'center',
    width: 120
  },
  {
    title: '尺寸',
    dataIndex: 'dimension',
    align: 'center',
    width: 120,
    customRender: ({ record }) => `${record.width}×${record.height}`
  },
  {
    title: '格式',
    dataIndex: 'format',
    align: 'center',
    width: 80
  },
  {
    title: '大小',
    dataIndex: 'size',
    align: 'center',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    width: 100
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    align: 'center',
    width: 170
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 260,
    className: 'action-column'
  }
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '图片总数',
    value: '4,672',
    change: 8.7,
    color: 'purple',
    icon: PictureOutlined,
  },
  {
    title: '本月上传',
    value: '683',
    change: 15.2,
    color: 'blue',
    icon: CloudUploadOutlined,
  },
  {
    title: '总存储空间',
    value: '8.73 GB',
    change: 12.6,
    color: 'green',
    icon: CloudOutlined,
  },
  {
    title: '优化节省空间',
    value: '2.41 GB',
    change: 7.3,
    color: 'gold',
    icon: ThunderboltOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  imageName: '',
  category: undefined,
  status: undefined,
  uploadTime: [],
});

// 表格数据和加载状态
const loading = ref(false);
const imageData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 视图模式
const viewMode = ref('list');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);
const isAllSelected = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === imageData.value.length);
const isIndeterminate = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < imageData.value.length);

// 模态框可见性
const uploadModalVisible = ref(false);
const editModalVisible = ref(false);
const previewVisible = ref(false);
const previewImage = ref(null);
const previewIndex = ref(0);
const submitLoading = ref(false);

// 表单引用
const uploadFormRef = ref(null);
const editFormRef = ref(null);

// 文件上传
const fileList = ref([]);

// 上传表单数据
const uploadForm = reactive({
  category: 'product',
  status: 'active',
  optimize: true,
  accessControl: 'public',
});

// 编辑表单数据
const editForm = reactive({
  id: '',
  name: '',
  category: '',
  status: '',
  altText: '',
  description: '',
  url: '',
  width: 0,
  height: 0,
  size: 0,
  format: '',
  uploadTime: '',
  accessControl: 'public',
});

// 上传表单验证规则
const uploadRules = {
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择图片状态', trigger: 'change' }
  ],
};

// 编辑表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入图片名称', trigger: 'blur' },
    { max: 50, message: '图片名称不能超过50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择图片状态', trigger: 'change' }
  ],
  altText: [
    { max: 100, message: '替代文本不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '图片描述不能超过200个字符', trigger: 'blur' }
  ],
};

// 分类选项
const categoryOptions = [
  { value: 'banner', label: 'Banner图' },
  { value: 'product', label: '产品图片' },
  { value: 'avatar', label: '用户头像' },
  { value: 'background', label: '背景图片' },
  { value: 'icon', label: '图标' },
  { value: 'other', label: '其他' }
];

// 状态选项
const statusOptions = [
  { value: 'active', label: '已启用', tagColor: 'success' },
  { value: 'inactive', label: '未启用', tagColor: 'warning' },
  { value: 'processing', label: '处理中', tagColor: 'processing' }
];

// 组件挂载时获取数据
onMounted(() => {
  fetchImageData();
});

// 获取图片数据
function fetchImageData() {
  loading.value = true;
  // 使用真实线上图片而不是placeholder
  setTimeout(() => {
    const data = [
      {
        id: 1,
        name: '商品展示图_01',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        category: 'product',
        width: 2048,
        height: 512,
        size: 1342177, // 约1.28 MB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 2).getTime(),
        altText: '红色运动鞋特写',
        description: '产品系列展示图，适用于电商首页和产品详情页。',
        accessControl: 'public',
      },
      {
        id: 2,
        name: '自然风景_山川',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        category: 'background',
        width: 4096,
        height: 4096,
        size: 1689599, // 约1.61 MB
        format: 'png',
        status: 'active',
        uploadTime: new Date(2025, 0, 3).getTime(),
        altText: '山川湖泊自然风景',
        description: '高清自然风景图，适用于网站背景和宣传材料。',
        accessControl: 'public',
      },
      {
        id: 3,
        name: '数码产品_相机',
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        category: 'product',
        width: 4096,
        height: 2048,
        size: 2768584, // 约2.64 MB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 4).getTime(),
        altText: '专业数码相机产品展示',
        description: '数码产品系列展示图，突出产品细节和质感。',
        accessControl: 'public',
      },
      {
        id: 4,
        name: '网站Banner_科技',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        category: 'banner',
        width: 512,
        height: 4096,
        size: 869376, // 约849 KB
        format: 'png',
        status: 'active',
        uploadTime: new Date(2025, 0, 5).getTime(),
        altText: '科技主题banner图',
        description: '适用于网站顶部的科技主题横幅图片。',
        accessControl: 'public',
      },
      {
        id: 5,
        name: '促销Banner_春节',
        url: 'https://images.unsplash.com/photo-1541417904950-b855846fe074',
        category: 'banner',
        width: 1024,
        height: 256,
        size: 5115617, // 约4.88 MB
        format: 'webp',
        status: 'inactive',
        uploadTime: new Date(2025, 0, 6).getTime(),
        altText: '春节促销活动banner',
        description: '春节促销活动宣传横幅，使用红色和金色突出节日氛围。',
        accessControl: 'public',
      },
      {
        id: 6,
        name: '用户头像_默认',
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        category: 'avatar',
        width: 512,
        height: 512,
        size: 624640, // 约610 KB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 7).getTime(),
        altText: '默认女性用户头像',
        description: '系统默认女性用户头像，色彩明亮自然。',
        accessControl: 'public',
      },
      {
        id: 7,
        name: '图标_通知',
        url: 'https://img.icons8.com/fluency/96/000000/appointment-reminders.png',
        category: 'icon',
        width: 96,
        height: 96,
        size: 15872, // 约15.5 KB
        format: 'png',
        status: 'active',
        uploadTime: new Date(2025, 0, 8).getTime(),
        altText: '通知提醒图标',
        description: '系统通知提醒功能使用的彩色图标。',
        accessControl: 'public',
      },
      {
        id: 8,
        name: '商品图_手表',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        category: 'product',
        width: 2048,
        height: 1365,
        size: 1853491, // 约1.77 MB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 9).getTime(),
        altText: '高端手表产品图',
        description: '奢侈品系列手表产品图，黑色背景突出产品质感。',
        accessControl: 'public',
      },
      {
        id: 9,
        name: '背景_抽象渐变',
        url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85',
        category: 'background',
        width: 4096,
        height: 2730,
        size: 3149824, // 约3.0 MB
        format: 'jpg',
        status: 'processing',
        uploadTime: new Date(2025, 0, 10).getTime(),
        altText: '抽象渐变背景',
        description: '紫色调抽象渐变背景，适用于现代设计风格的网页和应用。',
        accessControl: 'public',
      },
      {
        id: 10,
        name: 'Logo_彩色版',
        url: 'https://img.icons8.com/fluency/96/000000/butterfly.png',
        category: 'icon',
        width: 96,
        height: 96,
        size: 14336, // 约14 KB
        format: 'png',
        status: 'active',
        uploadTime: new Date(2025, 0, 11).getTime(),
        altText: '公司Logo彩色版',
        description: '公司Logo标识的彩色版本，适用于浅色背景。',
        accessControl: 'restricted',
      },
      {
        id: 11,
        name: 'Banner_夏季促销',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        category: 'banner',
        width: 2048,
        height: 512,
        size: 1572864, // 约1.5 MB
        format: 'jpg',
        status: 'inactive',
        uploadTime: new Date(2025, 0, 12).getTime(),
        altText: '夏季促销Banner',
        description: '夏季促销活动Banner，海滩主题设计。',
        accessControl: 'public',
      },
      {
        id: 12,
        name: '用户头像_男性',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        category: 'avatar',
        width: 512,
        height: 512,
        size: 573440, // 约560 KB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 13).getTime(),
        altText: '默认男性用户头像',
        description: '系统默认男性用户头像，专业商务风格。',
        accessControl: 'public',
      },
      {
        id: 8,
        name: '商品图_手表',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        category: 'product',
        width: 2048,
        height: 1365,
        size: 1853491, // 约1.77 MB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 9).getTime(),
        altText: '高端手表产品图',
        description: '奢侈品系列手表产品图，黑色背景突出产品质感。',
        accessControl: 'public',
      },
      {
        id: 9,
        name: '背景_抽象渐变',
        url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85',
        category: 'background',
        width: 4096,
        height: 2730,
        size: 3149824, // 约3.0 MB
        format: 'jpg',
        status: 'processing',
        uploadTime: new Date(2025, 0, 10).getTime(),
        altText: '抽象渐变背景',
        description: '紫色调抽象渐变背景，适用于现代设计风格的网页和应用。',
        accessControl: 'public',
      },
      {
        id: 10,
        name: 'Logo_彩色版',
        url: 'https://img.icons8.com/fluency/96/000000/butterfly.png',
        category: 'icon',
        width: 96,
        height: 96,
        size: 14336, // 约14 KB
        format: 'png',
        status: 'active',
        uploadTime: new Date(2025, 0, 11).getTime(),
        altText: '公司Logo彩色版',
        description: '公司Logo标识的彩色版本，适用于浅色背景。',
        accessControl: 'restricted',
      },
      {
        id: 11,
        name: 'Banner_夏季促销',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        category: 'banner',
        width: 2048,
        height: 512,
        size: 1572864, // 约1.5 MB
        format: 'jpg',
        status: 'inactive',
        uploadTime: new Date(2025, 0, 12).getTime(),
        altText: '夏季促销Banner',
        description: '夏季促销活动Banner，海滩主题设计。',
        accessControl: 'public',
      },
      {
        id: 12,
        name: '用户头像_男性',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        category: 'avatar',
        width: 512,
        height: 512,
        size: 573440, // 约560 KB
        format: 'jpg',
        status: 'active',
        uploadTime: new Date(2025, 0, 13).getTime(),
        altText: '默认男性用户头像',
        description: '系统默认男性用户头像，专业商务风格。',
        accessControl: 'public',
      }
    ];

    imageData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 生成随机颜色
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件名
function getFileName(url) {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索过滤
  setTimeout(() => {
    // 过滤条件实现
    const filteredData = imageData.value.filter(image => {
      let match = true;

      if (searchForm.imageName && !image.name.includes(searchForm.imageName)) {
        match = false;
      }

      if (searchForm.category && image.category !== searchForm.category) {
        match = false;
      }

      if (searchForm.status && image.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.uploadTime && searchForm.uploadTime.length === 2) {
        const startTime = searchForm.uploadTime[0].valueOf();
        const endTime = searchForm.uploadTime[1].valueOf();
        if (image.uploadTime < startTime || image.uploadTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    imageData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.imageName = '';
  searchForm.category = undefined;
  searchForm.status = undefined;
  searchForm.uploadTime = [];

  // 重新获取所有数据
  fetchImageData();

  message.success('搜索条件已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchImageData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 选择所有改变
function onSelectAllChange(e) {
  if (e.target.checked) {
    selectedRowKeys.value = imageData.value.map(item => item.id);
  } else {
    selectedRowKeys.value = [];
  }
}

// 切换图片选择
function toggleImageSelection(id) {
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
    imageData.value = [...imageData.value].sort((a, b) => {
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

// 获取分类名称
function getCategoryName(category) {
  const categoryMap = {
    banner: 'Banner图',
    product: '产品图片',
    avatar: '用户头像',
    background: '背景图片',
    icon: '图标',
    other: '其他'
  };
  return categoryMap[category] || '未知分类';
}

// 获取分类颜色
function getCategoryColor(category) {
  const colorMap = {
    banner: '#6554C0',
    product: '#52C41A',
    avatar: '#1890FF',
    background: '#FAAD14',
    icon: '#F5222D',
    other: '#8C8C8C'
  };
  return colorMap[category] || 'default';
}

// 获取格式颜色
function getFormatColor(format) {
  const colorMap = {
    jpg: '#1890FF',
    jpeg: '#1890FF',
    png: '#52C41A',
    webp: '#722ED1',
    svg: '#EB2F96',
    gif: '#FAAD14'
  };
  return colorMap[format.toLowerCase()] || 'default';
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    active: 'success',
    inactive: 'warning',
    processing: 'processing'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    active: '已启用',
    inactive: '未启用',
    processing: '处理中'
  };
  return statusMap[status] || '未知状态';
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 打开上传模态框
function openUploadModal() {
  // 重置上传表单
  uploadForm.category = 'product';
  uploadForm.status = 'active';
  uploadForm.optimize = true;
  uploadForm.accessControl = 'public';
  fileList.value = [];

  uploadModalVisible.value = true;
}

// 上传前验证
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过5MB!');
    return false;
  }

  // 允许上传，但阻止自动上传行为
  return false;
}

// 处理文件上传变更
function handleUploadChange(info) {
  const { fileList: newFileList } = info;
  fileList.value = newFileList;
}

// 处理拖拽上传
function handleDrop(e) {
  console.log('文件被拖拽到上传区域', e);
}

// 取消上传
function handleUploadCancel() {
  uploadModalVisible.value = false;
}

// 处理上传提交
function handleUploadSubmit() {
  if (fileList.value.length === 0) {
    message.warning('请先选择要上传的图片');
    return;
  }

  uploadFormRef.value?.validate().then(() => {
    submitLoading.value = true;

    // 模拟上传过程
    setTimeout(() => {
      submitLoading.value = false;
      uploadModalVisible.value = false;

      message.success(`成功上传 ${fileList.value.length} 张图片`);

      // 刷新图片列表
      fetchImageData();
    }, 1500);
  }).catch(err => {
    console.error('表单验证失败', err);
  });
}

// 预览图片
function handlePreviewImage(record) {
  previewImage.value = record;
  previewIndex.value = imageData.value.findIndex(item => item.id === record.id);
  previewVisible.value = true;
}

const isFiltered = computed(() => {
  return searchForm.imageName ||
      searchForm.category ||
      searchForm.status ||
      (searchForm.uploadTime && searchForm.uploadTime.length === 2);
});



// 复制图片链接
function copyImageUrl(record) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(record.url)
        .then(() => {
          message.success('图片链接已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败，请手动复制');
        });
  } else {
    // 兼容性处理
    const textArea = document.createElement('textarea');
    textArea.value = record.url;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      message.success('图片链接已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请手动复制');
    }

    document.body.removeChild(textArea);
  }
}

// 编辑图片信息
function editImageInfo(record) {
  // 复制图片数据到编辑表单
  Object.keys(editForm).forEach(key => {
    if (key in record) {
      editForm[key] = record[key];
    }
  });

  // 打开编辑模态框
  editModalVisible.value = true;
}


// 处理预览关闭
function handlePreviewClose() {
  // 确保明确设置为false强制关闭
  previewVisible.value = false;

  // 延迟清空预览图片数据，确保动画完成后再清理数据
  setTimeout(() => {
    previewImage.value = null;
    previewIndex.value = 0;
  }, 300);
}


// 图片导航
function navigateImages(step) {
  // 防止快速点击导致的问题
  if (!previewImage.value) return;

  let newIndex = previewIndex.value + step;

  // 循环导航
  if (newIndex < 0) {
    newIndex = imageData.value.length - 1;
  } else if (newIndex >= imageData.value.length) {
    newIndex = 0;
  }

  previewIndex.value = newIndex;
  previewImage.value = imageData.value[newIndex];
}

// 确保在组件销毁时清理相关资源
onBeforeUnmount(() => {
  if (previewVisible.value) {
    previewVisible.value = false;
    previewImage.value = null;
  }
});

// 取消编辑
function handleEditCancel() {
  editModalVisible.value = false;
}

// 处理编辑提交
function handleEditSubmit() {
  editFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 更新表格中的数据
          const index = imageData.value.findIndex(image => image.id === editForm.id);
          if (index !== -1) {
            imageData.value[index] = { ...imageData.value[index], ...editForm };
          }

          submitLoading.value = false;
          editModalVisible.value = false;
          message.success('图片信息已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 替换图片
function replaceImage(record) {
  message.info('请选择新的图片文件进行替换');

  // 实际项目中应该打开文件选择器
  // 这里简单模拟替换过程
  setTimeout(() => {
    const index = imageData.value.findIndex(item => item.id === record.id);
    if (index > -1) {
      // 模拟替换后的新图片
      const newWidth = 800;
      const newHeight = 600;
      imageData.value[index].url = `https://via.placeholder.com/${newWidth}x${newHeight}/${getRandomColor()}/${getRandomColor()}?text=New+Image`;
      imageData.value[index].width = newWidth;
      imageData.value[index].height = newHeight;
      imageData.value[index].size = Math.floor(Math.random() * 2000 + 500) * 1024; // 随机大小

      message.success('图片替换成功');
    }
  }, 1000);
}

// 下载图片
function downloadImage(record) {
  // 创建一个临时链接元素
  const link = document.createElement('a');
  link.href = record.url;
  link.download = record.name || `image-${record.id}.${record.format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success('图片下载已开始');
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  window.$modal?.confirm({
    title: '确定要删除此图片吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteImage(record);
    }
  });
}

// 删除图片
function deleteImage(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    imageData.value = imageData.value.filter(image => image.id !== record.id);
    pagination.total -= 1;
    loading.value = false;
    message.success('图片已删除');

    // 如果删除的是当前选中的图片，则清除选中状态
    if (selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
    }
  }, 500);
}

// 批量删除图片
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的图片');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 张图片吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        imageData.value = imageData.value.filter(image => !selectedRowKeys.value.includes(image.id));
        pagination.total -= selectedRowKeys.value.length;
        selectedRowKeys.value = [];
        loading.value = false;
        message.success('已批量删除图片');
      }, 800);
    }
  });
}

// 暴露方法给父组件使用
defineExpose({
  openUploadModal
});
</script>

<style scoped>
/* 全局容器样式 */
.image-management-container {
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

/* 优化的搜索表单样式 */
.search-form-card {
  margin-bottom: 24px;
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

/* 确保表单项有合适的间距 */
.search-form-items .ant-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

/* 确保查询和重置按钮保持水平排列 */
.search-buttons {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

/* 搜索按钮样式 */
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
  margin-bottom: 24px;
}

.operation-left, .operation-right {
  display: flex;
  align-items: center;
}

/* 图片缩略图样式 */
.image-thumbnail-container {
  width: 60px;
  height: 60px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  margin-bottom: 16px;
  background: white;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.image-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.image-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9f9;
}

.image-card-body {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 比例 */
  overflow: hidden;
}

.grid-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card-body:hover .grid-image {
  transform: scale(1.05);
}

.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  justify-content: space-between;
}

.image-card-body:hover .image-info-overlay {
  opacity: 1;
}

.image-card-footer {
  padding: 10px 12px;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.image-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.grid-pagination-bottom {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 上传弹窗样式 */
.custom-image-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-image-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-image-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-image-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-image-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 0 4px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background-color: #6554C0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  color: white;
  font-size: 20px;
}

.header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-title p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #888;
}

.uploader-container {
  margin-bottom: 24px;
}

.form-item-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.batch-settings {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9f9ff;
  border-radius: 8px;
}

.settings-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: #6554C0;
}

.settings-header .anticon {
  margin-right: 8px;
}

.form-row-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.form-column {
  flex: 0 0 50%;
  padding: 0 12px;
  box-sizing: border-box;
}

.column-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f0f0f0;
  color: #6554C0;
  font-weight: 600;
}

.column-header .anticon {
  margin-right: 8px;
  font-size: 16px;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 图片预览样式 */
.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #f6f6f6;
}

.image-preview-info {
  width: 100%;
  padding: 12px;
  background: #f9f9ff;
  border-radius: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  display: flex;
  align-items: center;
  color: #666;
  width: 80px;
  font-weight: 500;
}

.info-label .anticon {
  margin-right: 4px;
  color: #6554C0;
}

.info-value {
  flex: 1;
  color: #333;
}

/* 图片管理专用样式 - 使用im-前缀避免冲突 */
.im-page-container {
  padding: 0; /* 移除内边距，让子元素决定间距 */
}

.im-header {
  background: linear-gradient(135deg, #ffffff 0%, #f6f5ff 100%);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(101, 84, 192, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.im-header-left {
  display: flex;
  align-items: center;
}

.im-icon-container {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.2);
}

.im-icon {
  font-size: 28px;
  color: white;
}

.im-header-info {
  display: flex;
  flex-direction: column;
}

.im-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.im-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.im-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.im-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.im-metrics {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.im-metric-item {
  padding: 0 16px;
  position: relative;
}

.im-divider {
  width: 1px;
  height: 24px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.im-metric-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.im-metric-label .anticon {
  margin-right: 6px;
}

.im-metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 图片预览弹窗样式 */
.custom-preview-modal :deep(.ant-modal-content) {
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-preview-modal :deep(.ant-modal-body) {
  padding: 0;
  margin: 0;
  height: 100%;
}

.custom-preview-modal :deep(.ant-modal-close) {
  top: 12px;
  right: 12px;
  z-index: 100;
}

.custom-preview-modal :deep(.ant-modal-close-x) {
  width: 30px;
  height: 30px;
  line-height: 30px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 关闭按钮包装器，确保点击区域更大 */
.close-btn-wrapper {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 预览容器样式 */
.preview-container {
  display: flex;
  height: 600px; /* 增加高度以显示更多内容 */
}

/* 左侧图片区域样式 */
.preview-image-container {
  position: relative;
  width: 60%; /* 调整为60%宽度 */
  height: 100%;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 左右导航按钮 */
.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  font-size: 16px;
}

.preview-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.preview-nav.prev {
  left: 16px;
}

.preview-nav.next {
  right: 16px;
}

/* 图片计数器 */
.preview-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 16px;
  border-radius: 16px;
  font-size: 14px;
}

/* 右侧信息面板样式 */
.preview-info-panel {
  width: 40%; /* 增加至40%宽度 */
  height: 100%;
  overflow: hidden;
  background: #f7f9fc;
  display: flex;
  flex-direction: column;
}

/* 可滚动内容区域 */
.preview-info-content {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 #f7f9fc;
}

/* 自定义滚动条样式 */
.preview-info-content::-webkit-scrollbar {
  width: 6px;
}

.preview-info-content::-webkit-scrollbar-track {
  background: #f7f9fc;
}

.preview-info-content::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 6px;
}

/* 标题区域 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.preview-title {
  margin: 0;
  font-size: 20px;
  color: #262626;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

.file-type-badge {
  flex-shrink: 0;
}

/* 信息区域样式 */
.info-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  color: #262626;
  font-weight: 500;
}

.section-header .anticon {
  margin-right: 8px;
  color: #6554C0;
  font-size: 18px;
}

/* 表格式布局 */
.info-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  flex: 0 0 100px;
  padding: 12px 16px;
  background: #f9f9f9;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.info-value {
  flex: 1;
  padding: 12px 16px;
  color: #333;
}

/* 描述内容 */
.description-content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  min-height: 50px;
  padding: 8px 0;
}

/* 使用情况统计 */
.usage-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.usage-stat-item {
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  flex: 1;
  min-width: 120px;
}

.usage-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.usage-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

/* 操作按钮区 */
.action-section {
  margin-top: 24px;
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-button {
  flex: 1;
  min-width: 100px;
}

/* 自定义关闭图标样式 */
.custom-close-icon {
  font-size: 18px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 6px;
  color: white;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .preview-container {
    flex-direction: column;
    height: auto;
  }

  .preview-image-container {
    width: 100%;
    height: 400px;
  }

  .preview-info-panel {
    width: 100%;
    height: 400px;
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .im-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .im-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .im-metrics {
    width: 100%;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .im-metric-item {
    padding: 0 10px;
  }

  .im-metric-value {
    font-size: 16px;
  }

  .im-title {
    font-size: 20px;
  }

  .form-column {
    flex: 0 0 100%;
  }

  .custom-image-modal {
    width: 95% !important;
    max-width: 500px;
  }
}

@media (max-width: 576px) {
  .im-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .im-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .im-divider {
    display: none;
  }

  .im-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }
}
</style>;