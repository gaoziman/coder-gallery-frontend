<template>
  <div class="image-management-container">
    <RealTimeStats
        :header-config="headerConfig"
        :refresh-interval="refreshInterval"
        @data-updated="handleDataUpdated"
        data-source-type="picture"
    />

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 图片名称 -->
            <a-form-item label="图片名称" name="name">
              <a-input v-model:value="searchForm.name" placeholder="请输入图片名称" allowClear/>
            </a-form-item>

            <!-- 分类 -->
            <a-form-item label="分类" name="categoryId">
              <a-select
                  v-model:value="searchForm.categoryId"
                  placeholder="请选择分类"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="5292695230519296">编程学习</a-select-option>
                <a-select-option value="5294819497121792">自然风光</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 标签 -->
            <a-form-item label="标签" name="tagId">
              <a-select
                  v-model:value="searchForm.tagId"
                  placeholder="请选择标签"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="5425790635075584">封面图</a-select-option>
                <a-select-option value="5417035914520576">Git</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 状态 -->
            <a-form-item label="审核状态" name="reviewStatus">
              <a-select
                  v-model:value="searchForm.reviewStatus"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="1">已通过</a-select-option>
                <a-select-option value="0">待审核</a-select-option>
                <a-select-option value="2">已拒绝</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 操作按钮 -->
            <div class="search-buttons">
              <a-button type="primary" html-type="submit" class="search-button">
                <IconFont type="icon-chaxun2"/>
                查询
              </a-button>
              <a-button @click="resetSearchForm" class="reset-button">
                <IconFont type="icon-refresh"/>
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
            <IconFont type="icon-upload11"/>
            上传图片
          </a-button>
          <a-button type="primary" @click="navigateToBatchCreatePicture">
            <IconFont type="icon-B-shuliang"/>
            批量创建图片
          </a-button>
          <a-button @click="handleRefresh">
            <IconFont type="icon-icon"/>
            刷新
          </a-button>
          <a-button
              type="primary"
              :disabled="!hasSelected"
              @click="openBatchReviewModal"
              class="batch-review-btn"
          >
            <IconFont type="icon-piliangguanli1"/>
            批量审核
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <IconFont type="icon-piliangshanchu3"/>
            批量删除
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="list">
            <IconFont type="icon-liebiao2"/>
            列表视图
          </a-radio-button>
          <a-radio-button value="grid">
            <IconFont type="icon-fenlei"/>
            网格视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <BaseTable
          :dataSource="imageData"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :showSelection="true"
          :selectedKeys="selectedRowKeys"
          :rowActions="getRowActions"
          rowKey="id"
          @selectionChange="onSelectChange"
          @rowAction="handleRowActionClick"
          @confirmBatchAction="confirmBatchDelete"
          @tableChange="handleTableChange"
          @refresh="fetchImageData"
      >
        <!-- 自定义列插槽 -->
        <template #column-thumbnail="{ record }">
          <div class="image-thumbnail-container">
            <img :src="record.thumbnailUrl || record.url" :alt="record.name" class="image-thumbnail"
                 @click="handlePreviewImage(record)"/>
          </div>
        </template>

        <!-- 图片信息字段 -->
        <template #column-imageInfo="{ record }">
          <a-popover placement="right" trigger="hover" overlayClassName="image-info-popover">
            <template #content>
              <div class="image-info-detail-card">
                <div class="info-detail-row">
                  <span class="info-detail-label">尺寸：</span>
                  <span class="info-detail-value">{{ record.picWidth }}×{{ record.picHeight }}px</span>
                </div>
                <div class="info-detail-row">
                  <span class="info-detail-label">格式：</span>
                  <a-tag :color="getFormatColor(record.format)" class="format-tag">{{ record.format }}</a-tag>
                </div>
                <div class="info-detail-row">
                  <span class="info-detail-label">大小：</span>
                  <span class="info-detail-value">{{ formatFileSize(record.size) }}</span>
                </div>
                <div class="info-detail-row">
                  <span class="info-detail-label">宽高比：</span>
                  <span class="info-detail-value">{{ calculateAspectRatio(record.picWidth, record.picHeight) }}</span>
                </div>
              </div>
            </template>
            <div class="image-info-compact">
              <div class="info-primary">{{ record.picWidth }}×{{ record.picHeight }}</div>
              <div class="info-secondary">
                <a-tag :color="getFormatColor(record.format)" class="tiny-tag">{{ record.format }}</a-tag>
                <span class="size-text">{{ formatFileSize(record.size) }}</span>
              </div>
            </div>
          </a-popover>
        </template>


        <!-- 分类列 - 优化设计 -->
        <template #column-category="{ record }">
          <div class="category-column-wrapper">
            <a-tag
                v-if="record.category"
                :color="getCategoryColor(record.category)"
                class="enhanced-category-tag">
              {{ record.category }}
            </a-tag>
            <span v-else class="empty-placeholder">-</span>
          </div>
        </template>

        <!--  标签列-->
        <template #column-tags="{ record }">
          <div class="tags-column-wrapper">
            <template v-if="record.tags && record.tags.length">
              <div class="tags-container">
                <a-tag
                    v-for="(tag, index) in record.tags.slice(0, 2)"
                    :key="index"
                    :style="{
                                backgroundColor: getTagColorFromRecord(record, index),
                                color: getTagTextColorFromRecord(record, index),
                                borderColor: 'transparent'
                              }"
                    class="enhanced-tag">
                  {{ tag }}
                </a-tag>
                <a-tag v-if="record.tags.length > 2" class="more-tag">
                  +{{ record.tags.length - 2 }}
                </a-tag>
              </div>
            </template>
            <span v-else class="empty-placeholder">-</span>
          </div>
        </template>

        <!-- 审核状态列 -->
        <template #column-reviewInfo="{ record }">
          <div class="review-status-display">
            <div class="status-pill" :class="getStatusPillClass(record.reviewStatus)">
              {{ getStatusText(record.reviewStatus) }}
            </div>
            <a-popover placement="left" trigger="hover" overlayClassName="review-info-popover">
              <template #content>
                <div class="review-info-detail-card">
                  <div class="review-info-item" v-if="record.reviewMessage">
                    <div class="review-info-label">审核状态：</div>
                    <div class="status-pill" :class="getStatusPillClass(record.reviewStatus)">
                      {{ getStatusText(record.reviewStatus) }}
                    </div>
                  </div>
                  <div class="review-info-item" v-if="record.reviewMessage">
                    <div class="review-info-label">审核信息：</div>
                    <div class="review-info-value">{{ record.reviewMessage }}</div>
                  </div>
                  <div class="review-info-item" v-if="record.reviewerUserName">
                    <div class="review-info-label">审核人：</div>
                    <div class="review-info-value">{{ record.reviewerUserName }}</div>
                  </div>
                  <div class="review-info-item" v-if="record.reviewTime">
                    <div class="review-info-label">审核时间：</div>
                    <div class="review-info-value">{{ formatDateTime(record.reviewTime, false) }}</div>
                  </div>
                </div>
              </template>
              <span v-if="record.reviewTime" class="review-time-hint">
        {{ formatDateTime(record.reviewTime, true, true) }}
      </span>
            </a-popover>
          </div>
        </template>

        <template #column-user="{ record }">
          <div class="user-compact" v-if="record.user">
            <a-tooltip :title="record.user.username || '-'">
              <a-avatar
                  :src="record.user.avatar"
                  :size="28"
                  class="user-avatar-compact"
              >
                {{ record.user.username ? record.user.username.charAt(0) : 'U' }}
              </a-avatar>
            </a-tooltip>
          </div>
          <span v-else>-</span>
        </template>

        <template #column-createTime="{ record }">
          {{ formatDateTime(record.createTime, false) }}
        </template>
      </BaseTable>
    </div>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view-container">
      <!-- 网格选择区域 - 当有选中项时显示 -->
      <div v-if="hasSelected" class="grid-header">
        <div class="grid-selection">
          <a-checkbox
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="onSelectAllChange"
          />
          <span class="selected-count">已选择 {{ selectedRowKeys.length }} 项</span>
        </div>
      </div>

      <!-- 图片网格 -->
      <div class="image-grid">
        <div v-for="image in imageData" :key="image.id" class="image-card"
             :class="{ 'image-card-selected': selectedRowKeys.includes(image.id) }">
          <!-- 选择复选框 -->
          <div class="image-selection" @click.stop="toggleImageSelection(image.id)">
            <a-checkbox :checked="selectedRowKeys.includes(image.id)"/>
          </div>

          <!-- 状态标识 -->
          <div class="image-status-badge" :class="getStatusClass(image.reviewStatus)">
            {{ getStatusText(image.reviewStatus) }}
          </div>

          <!-- 图片区域 -->
          <div class="image-card-body" @click="handlePreviewImage(image)">
            <img :src="image.thumbnailUrl || image.url" :alt="image.name" class="grid-image"/>

            <!-- 图片信息悬浮层 -->
            <div class="image-info-overlay">
              <div class="image-resolution">{{ image.picWidth || 1920 }}×{{ image.picHeight || 1080 }}</div>
              <div class="image-size">{{ formatFileSize(image.size || 1024000) }}</div>
            </div>
          </div>

          <!-- 图片信息区域 -->
          <div class="image-card-info">
            <!-- 图片名称和格式 -->
            <div class="image-title-row">
              <div class="image-title" :title="image.name">
                {{ image.name }}
              </div>
              <a-tag :color="getFormatColor(image.format)" class="format-badge">
                {{ image.format }}
              </a-tag>
            </div>

            <!-- 分类和标签区域 -->
            <div class="image-meta-tags">
              <a-tag
                  v-if="image.category"
                  :color="getCategoryColor(image.category)"
                  class="category-tag">
                {{ image.category }}
              </a-tag>

              <template v-if="image.tags && image.tags.length">
                <a-tag
                    v-for="(tag, index) in image.tags.slice(0, 2)"
                    :key="index"
                    :style="{
                backgroundColor: getTagColorFromRecord(image, index),
                color: getTagTextColorFromRecord(image, index),
                borderColor: 'transparent'
              }"
                    class="image-tag">
                  {{ tag }}
                </a-tag>
                <a-tag v-if="image.tags.length > 2" class="more-tag">
                  +{{ image.tags.length - 2 }}
                </a-tag>
              </template>
            </div>

            <!-- 底部信息栏 -->
            <div class="image-footer">
              <div class="image-uploader">
                <a-avatar :src="image.user?.avatar" :size="28" class="uploader-avatar">
                  {{ image.user?.username ? image.user.username.charAt(0) : 'U' }}
                </a-avatar>
                <div class="uploader-info">
                  <span class="uploader-name">{{ image.user?.username || '未知用户' }}</span>
                  <span class="upload-time">{{ formatDateTime(image.createTime, false, true) }}</span>
                </div>
              </div>

              <!-- 快捷操作 -->
              <div class="image-actions">
                <a-tooltip title="预览">
                  <div class="action-btn" @click.stop="handlePreviewImage(image)">
                    <IconFont type="icon-chakan"/>
                  </div>
                </a-tooltip>

                <a-tooltip title="编辑">
                  <div class="action-btn" @click.stop="editImageInfo(image)">
                    <IconFont type="icon-bianji2"/>
                  </div>
                </a-tooltip>

                <a-tooltip title="审核">
                  <div class="action-btn" @click.stop="openReviewModal(image)">
                    <IconFont type="icon-daishenhe3"/>
                  </div>
                </a-tooltip>

                <a-dropdown :trigger="['click']" placement="bottomRight" @click.stop>
                  <div class="action-btn">
                    <more-outlined/>
                  </div>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="download" @click.stop="downloadImage(image)">
                        <IconFont type="icon-download2"/>
                        下载
                      </a-menu-item>
                      <a-menu-item key="copy" @click.stop="copyImageUrl(image)">
                        <IconFont type="icon-lianjie-copy"/>
                        复制链接
                      </a-menu-item>
                      <a-menu-divider/>
                      <a-menu-item key="delete" danger @click.stop="showDeleteConfirm(image)">
                        <IconFont type="icon-shanchu"/>
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="grid-pagination-bottom">
        <a-pagination
            :current="pagination.current"
            :pageSize="pagination.pageSize"
            :total="pagination.total"
            :showSizeChanger="true"
            :pageSizeOptions="['12', '24', '36', '48']"
            :showQuickJumper="true"
            :showTotal="(total) => `共 ${total} 条`"
            @change="onPageChange"
            @showSizeChange="onShowSizeChange"
        />
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <a-modal
        v-model:visible="previewVisible"
        :footer="null"
        :width="1200"
        :centered="true"
        :mask-closable="true"
        class="immersive-preview-modal"
        @cancel="handlePreviewClose"
        :destroyOnClose="true"
    >

      <div class="preview-container">
        <!-- 左侧图片区域 -->
        <div class="preview-image-section">
          <!-- 图片展示区 -->
          <img
              :src="previewImage ? previewImage.url : ''"
              :alt="previewImage ? previewImage.name : ''"
              class="preview-image"
          />

          <!-- 导航控制 -->
          <div class="preview-controls">
            <!-- 上一张按钮 -->
            <div class="nav-btn prev-btn" @click.stop="navigateImages(-1)" v-if="imageData.length > 1">
              <IconFont type="icon-shangyizhang12"/>
            </div>

            <!-- 下一张按钮 -->
            <div class="nav-btn next-btn" @click.stop="navigateImages(1)" v-if="imageData.length > 1">
              <IconFont type="icon-xiayizhang8"/>
            </div>

            <!-- 图片计数器 -->
            <div class="image-counter" v-if="imageData.length > 1">
              {{ previewIndex + 1 }} / {{ imageData.length }}
            </div>
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="preview-info-panel">
          <div class="info-panel-content">
            <!-- 图片标题和格式 -->
            <div class="image-header">
              <h2 class="image-title">{{ previewImage ? previewImage.name : '' }}</h2>
              <a-tag :color="getFormatColor(previewImage?.format)" class="format-badge">
                {{ previewImage?.format }}
              </a-tag>
            </div>

            <!-- 审核状态 -->
            <div class="status-section">
              <div class="status-badge" :class="getStatusClass(previewImage?.reviewStatus)">
                {{ getStatusText(previewImage?.reviewStatus) }}
              </div>
            </div>

            <!-- 基础信息卡片 -->
            <div class="info-block">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">
                    <IconFont type="icon-tupiangeshi"/>
                    尺寸
                  </div>
                  <div class="info-value">{{ previewImage?.picWidth || 0 }} × {{ previewImage?.picHeight || 0 }} px
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <IconFont type="icon-kuangaobi1"/>
                    宽高比
                  </div>
                  <div class="info-value">{{
                      calculateAspectRatio(previewImage?.picWidth, previewImage?.picHeight)
                    }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <IconFont type="icon-wenjiandaxiao"/>
                    大小
                  </div>
                  <div class="info-value">{{ formatFileSize(previewImage?.size) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <IconFont type="icon-shangchuanshijian1"/>
                    上传时间
                  </div>
                  <div class="info-value">{{ formatDateTime(previewImage?.createTime, true) }}</div>
                </div>
              </div>
            </div>

            <!-- 分类与标签 -->
            <div class="tags-section"
                 v-if="previewImage?.category || (previewImage?.tags && previewImage?.tags.length)">
              <div class="section-label">
                <IconFont type="icon-biaoqian4"/>
                <span>分类与标签</span>
              </div>

              <div class="tags-container">
                <!-- 分类标签 -->
                <a-tag
                    v-if="previewImage?.category"
                    :color="getCategoryColor(previewImage.category)"
                    class="category-tag"
                >
                  {{ previewImage.category }}
                </a-tag>

                <!-- 标签列表 -->
                <a-tag
                    v-for="(tag, index) in previewImage?.tags"
                    :key="index"
                    :style="{
                  backgroundColor: getTagColorFromRecord(previewImage, index),
                  color: getTagTextColorFromRecord(previewImage, index),
                  borderColor: 'transparent'
                }"
                    class="image-tag"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </div>

            <!-- 用户信息 -->
            <div class="user-section" v-if="previewImage?.user">
              <div class="user-info">
                <a-avatar :src="previewImage.user.avatar" :size="36" class="user-avatar">
                  {{ previewImage.user.username ? previewImage.user.username.charAt(0) : 'U' }}
                </a-avatar>
                <div class="user-details">
                  <div class="user-name">{{ previewImage.user.username }}</div>
                  <div class="user-role">{{ previewImage.user.role || '上传者' }}</div>
                </div>
              </div>
            </div>

            <!-- 审核信息 -->
            <div class="review-section" v-if="hasReviewDetails">
              <div class="review-details">
                <div class="review-item" v-if="previewImage?.reviewMessage">
                  <div class="review-message">{{ previewImage.reviewMessage }}</div>
                </div>
                <div class="review-meta">
                <span v-if="previewImage?.reviewerUserName">
                  <IconFont type="icon-xinzengyonghu1"/> {{ previewImage.reviewerUserName }}
                </span>
                  <span v-if="previewImage?.reviewTime">
                 <IconFont type="icon-shijian3"/> {{ formatDateTime(previewImage.reviewTime, true) }}
                </span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" @click="downloadImage(previewImage)" class="primary-action">
                <IconFont type="icon-download2" />
                下载图片
              </a-button>

              <div class="secondary-actions">
                <a-button @click="copyImageUrl(previewImage)">
                  <IconFont type="icon-lianjie-copy"/>
                  复制链接
                </a-button>
                <a-button @click="editImageInfo(previewImage)">
                  <IconFont type="icon-bianji2"/>
                  编辑
                </a-button>
                <a-button danger @click="showDeleteConfirm(previewImage)">
                  <IconFont type="icon-shanchu"/>
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 审核弹窗 -->
    <a-modal
        v-model:visible="reviewModalVisible"
        :footer="null"
        :width="980"
        :centered="true"
        :maskClosable="false"
        :destroyOnClose="true"
        class="custom-review-modal"
        @cancel="handleReviewCancel"
    >
      <template #closeIcon>
        <div class="review-close-btn">
          <close-outlined/>
        </div>
      </template>

      <div class="review-container">
        <!-- 左侧图片展示区 -->
        <div class="review-left-panel">
          <div class="image-preview-container">
            <img
                :src="currentReviewImage?.url"
                :alt="currentReviewImage?.name"
                class="review-image"
            />

            <div class="image-overlay-info">
              <div class="overlay-badge" :class="getStatusClass(currentReviewImage?.reviewStatus)">
                {{ getStatusText(currentReviewImage?.reviewStatus) }}
              </div>
            </div>
          </div>

          <div class="image-meta-info">
            <div class="image-name">{{ currentReviewImage?.name }}</div>
            <div class="image-tags">
              <a-tag :color="getFormatColor(currentReviewImage?.format)" class="format-tag">
                {{ currentReviewImage?.format }}
              </a-tag>
              <a-tag color="blue" v-for="(tag, index) in currentReviewImage?.tags" :key="index">
                {{ tag }}
              </a-tag>
            </div>
            <div class="image-specs">
              <div class="spec-item">
                <resize-outlined/>
                <span>{{ currentReviewImage?.picWidth }}×{{ currentReviewImage?.picHeight }}px</span>
              </div>
              <div class="spec-item">
                <cloud-outlined/>
                <span>{{ formatFileSize(currentReviewImage?.size) }}</span>
              </div>
              <div class="spec-item">
                <calendar-outlined/>
                <span>{{ formatDateTime(currentReviewImage?.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧审核表单区 -->
        <div class="review-right-panel">
          <div class="review-header">
            <div class="review-title">
              <safety-certificate-outlined/>
              <span>图片审核操作</span>
            </div>
            <a-tag
                class="current-status"
                :color="getStatusColor(currentReviewImage?.reviewStatus)">
              当前状态: {{ getStatusText(currentReviewImage?.reviewStatus) }}
            </a-tag>
          </div>

          <a-divider/>

          <a-form
              :model="reviewForm"
              ref="reviewFormRef"
              layout="vertical"
              class="review-form"
          >
            <!-- 审核状态 -->
            <a-form-item
                label="更改审核状态"
                name="reviewStatus"
                :rules="[{ required: true, message: '请选择审核状态' }]"
            >
              <div class="status-options">
                <div
                    class="status-option"
                    :class="{ active: reviewForm.reviewStatus === 1 }"
                    @click="updateReviewStatus(1)"
                >
                  <div class="option-icon success">
                    <check-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">通过</div>
                    <div class="option-desc">图片符合规范要求</div>
                  </div>
                </div>

                <div
                    class="status-option"
                    :class="{ active: reviewForm.reviewStatus === 0 }"
                    @click="updateReviewStatus(0)"
                >
                  <div class="option-icon warning">
                    <clock-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">待审核</div>
                    <div class="option-desc">暂不处理，等待再次审核</div>
                  </div>
                </div>

                <div
                    class="status-option"
                    :class="{ active: reviewForm.reviewStatus === 2 }"
                    @click="updateReviewStatus(2)"
                >
                  <div class="option-icon danger">
                    <close-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">拒绝</div>
                    <div class="option-desc">图片存在问题，不予通过</div>
                  </div>
                </div>
              </div>
            </a-form-item>

            <!-- 审核意见 -->
            <a-form-item
                label="审核意见"
                name="reviewMessage"
                :rules="[{ required: reviewForm.reviewStatus === 2, message: '拒绝时必须填写审核意见' }]"
            >
              <a-textarea
                  v-model:value="reviewForm.reviewMessage"
                  :placeholder="reviewForm.reviewStatus === 2 ? '请填写拒绝原因（必填）' : '请输入审核意见（选填）'"
                  :rows="4"
                  :maxLength="200"
                  :showCount="true"
                  class="review-textarea"
              />
            </a-form-item>
          </a-form>

          <div class="review-actions">
            <a-button @click="handleReviewCancel" class="cancel-btn">取消</a-button>
            <a-button
                type="primary"
                @click="handleReviewSubmit"
                :loading="submitLoading"
                class="submit-btn"
            >
              确认审核
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!--批量审核模态框 -->
    <a-modal
        v-model:visible="batchReviewModalVisible"
        :footer="null"
        :width="640"
        :centered="true"
        :maskClosable="false"
        :destroyOnClose="true"
        class="batch-review-modal"
        @cancel="handleBatchReviewCancel"
    >
      <template #closeIcon>
        <div class="review-close-btn">
          <close-outlined/>
        </div>
      </template>

      <div class="batch-review-container">
        <div class="batch-review-header">
          <div class="review-title">
            <safety-certificate-outlined/>
            <span>批量审核 {{ selectedRowKeys.length }} 张图片</span>
          </div>
        </div>

        <a-divider/>

        <div class="batch-review-content">
          <div class="selected-images-summary">
            <div class="images-count">
              <IconFont type="icon-Files" />
              <span>已选择 {{ selectedRowKeys.length }} 张图片</span>
            </div>
            <div class="images-preview" v-if="selectedRowKeys.length > 0">
              <div class="preview-thumbnails">
                <div v-for="(id, index) in selectedRowKeys.slice(0, 5)" :key="id" class="preview-thumb">
                  <img :src="getImageById(id)?.thumbnailUrl || getImageById(id)?.url" :alt="getImageById(id)?.name"/>
                </div>
                <div v-if="selectedRowKeys.length > 5" class="more-previews">
                  +{{ selectedRowKeys.length - 5 }}
                </div>
              </div>
            </div>
          </div>

          <a-form
              :model="batchReviewForm"
              layout="vertical"
              ref="batchReviewFormRef"
              class="batch-review-form"
          >
            <!-- 审核状态选择 -->
            <a-form-item
                label="选择审核状态"
                name="reviewStatus"
                :rules="[{ required: true, message: '请选择审核状态' }]"
            >
              <div class="status-options batch-status-options">
                <div
                    class="status-option"
                    :class="{ active: batchReviewForm.reviewStatus === 1 }"
                    @click="updateBatchReviewStatus(1)"
                >
                  <div class="option-icon success">
                    <check-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">通过</div>
                    <div class="option-desc">图片符合规范要求</div>
                  </div>
                </div>

                <div
                    class="status-option"
                    :class="{ active: batchReviewForm.reviewStatus === 0 }"
                    @click="updateBatchReviewStatus(0)"
                >
                  <div class="option-icon warning">
                    <clock-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">待审核</div>
                    <div class="option-desc">暂不处理，待后续审核</div>
                  </div>
                </div>

                <div
                    class="status-option"
                    :class="{ active: batchReviewForm.reviewStatus === 2 }"
                    @click="updateBatchReviewStatus(2)"
                >
                  <div class="option-icon danger">
                    <close-circle-outlined/>
                  </div>
                  <div class="option-info">
                    <div class="option-title">拒绝</div>
                    <div class="option-desc">图片存在问题，不予通过</div>
                  </div>
                </div>
              </div>
            </a-form-item>

            <!-- 统一审核意见 -->
            <a-form-item
                label="统一审核意见"
                name="reviewMessage"
                :rules="[{ required: batchReviewForm.reviewStatus === 2, message: '拒绝时必须填写审核意见' }]"
            >
              <a-textarea
                  v-model:value="batchReviewForm.reviewMessage"
                  :placeholder="batchReviewForm.reviewStatus === 2 ? '请填写拒绝原因（必填）' : '请输入统一审核意见（选填）'"
                  :rows="4"
                  :maxLength="200"
                  :showCount="true"
                  class="review-textarea"
              />
            </a-form-item>
          </a-form>
        </div>

        <div class="batch-review-actions">
          <a-button @click="handleBatchReviewCancel" class="cancel-btn">取消</a-button>
          <a-button
              type="primary"
              @click="handleBatchReviewSubmit"
              :loading="batchSubmitLoading"
              class="submit-btn"
              :disabled="selectedRowKeys.length === 0 || (batchReviewForm.reviewStatus === 2 && !batchReviewForm.reviewMessage)"
          >
            确认审核
          </a-button>
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
  computed,
  h,
  onBeforeUnmount
} from 'vue';
import {
  CalendarOutlined,
  CloudUploadOutlined,
  PictureOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined, CloudOutlined, ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {message, Modal, RadioGroup, RadioButton, Input} from 'ant-design-vue';
import dayjs from 'dayjs';
import {useRouter} from "vue-router";

import RealTimeStats from "@/components/common/RealTimeStats.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import {
  listPicturesByPageUsingGet,
  deletePictureUsingDelete,
  batchDeletePicturesUsingDelete,
  reviewPictureUsingPost,
  batchReviewPicturesUsingPost
} from "@/api/tupianhoutaiguanlijiekou";
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter();

// 表格列定义 - 调整宽度，使其更紧凑
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 68,
    fixed: 'left'
  },
  {
    title: '缩略图',
    dataIndex: 'thumbnail',
    align: 'center',
    width: 78,
    scopedSlots: {customRender: 'column-thumbnail'}
  },
  {
    title: '图片名称',
    dataIndex: 'name',
    align: 'center',
    width: 120,
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    align: 'center',
    width: 100
  },
  {
    title: '标签',
    dataIndex: 'tags',
    align: 'center',
    width: 100
  },
  {
    title: '图片信息',
    dataIndex: 'imageInfo',
    align: 'center',
    width: 150
  },
  {
    title: '审核状态',
    dataIndex: 'reviewInfo',
    align: 'center',
    width: 150
  },
  {
    title: '上传人',
    dataIndex: 'user',
    align: 'center',
    width: 80
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 120,
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 180,
    className: 'action-column',
    fixed: 'right'
  }
];

const headerConfig = {
  title: "图片管理",
  description: "管理系统图片资源，支持上传、分类、优化以及使用情况追踪",
  parentModule: "内容管理",
  iconType: "icon-tupian2"
};

// 顶部卡片数据
const statCards = reactive([
  {
    title: '本月上传',
    value: '4,672',
    change: 8.7,
    color: 'purple',
    icon: PictureOutlined,
  },
  {
    title: '本周上传',
    value: '683',
    change: 15.2,
    color: 'blue',
    icon: CloudUploadOutlined,
  },
  {
    title: '浏览量',
    value: '1000',
    change: 12.6,
    color: 'green',
    icon: CloudOutlined,
  },
  {
    title: '点赞量',
    value: '2000',
    change: 7.3,
    color: 'gold',
    icon: ThunderboltOutlined,
  },
]);

// 搜索表单数据 - 增加tagId字段
const searchForm = reactive({
  name: '',
  categoryId: undefined,
  reviewStatus: undefined,
  tagId: undefined, // 新增标签搜索
  uploadTime: [],
  startTime: undefined,
  endTime: undefined
});

// 表格数据和加载状态
const loading = ref(false);
const imageData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
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

// 审核信息相关计算属性
const hasReviewDetails = computed(() => {
  if (!previewImage.value) return false;
  return !!(previewImage.value.reviewMessage ||
      previewImage.value.reviewerUserName ||
      previewImage.value.reviewTime);
});


// 表单引用
const uploadFormRef = ref(null);
const editFormRef = ref(null);

// 文件上传
const fileList = ref([]);

const refreshInterval = ref(30000); // 30秒刷新一次

// 审核相关的响应式数据
const reviewModalVisible = ref(false);
const currentReviewImage = ref(null);
const reviewFormRef = ref(null);
const reviewForm = reactive({
  reviewStatus: 1,
  reviewMessage: '',
  pictureId: null,
});

// 新增: 批量审核相关的数据
const batchReviewModalVisible = ref(false);
const batchReviewFormRef = ref(null);
const batchSubmitLoading = ref(false);
const batchReviewForm = reactive({
  reviewStatus: 1,
  reviewMessage: '',
});


// 上传表单数据
const uploadForm = reactive({
  categoryId: undefined,
  tagIds: [],
  description: '',
});

// 编辑表单数据
const editForm = reactive({
  id: '',
  name: '',
  categoryId: '',
  tagIds: [],
  description: '',
  url: '',
  thumbnailUrl: '',
  picWidth: 0,
  picHeight: 0,
  size: 0,
  format: '',
  createTime: '',
  originalName: ''
});

// 上传表单验证规则
const uploadRules = {
  categoryId: [
    {required: false, message: '请选择图片分类', trigger: 'change'}
  ]
};

// 编辑表单验证规则
const editRules = {
  name: [
    {required: true, message: '请输入图片名称', trigger: 'blur'},
    {max: 50, message: '图片名称不能超过50个字符', trigger: 'blur'}
  ],
  description: [
    {max: 200, message: '图片描述不能超过200个字符', trigger: 'blur'}
  ],
};

// 分类选项
const categoryOptions = [
  {value: '5292695230519296', label: '编程学习'},
  {value: '5294819497121792', label: '自然风光'}
];

// 标签选项
const tagOptions = [
  {value: '5425790635075584', label: '封面图'},
  {value: '5417035914520576', label: 'Git'}
];

// 组件挂载时获取数据
onMounted(() => {
  fetchImageData();
});

// 获取图片数据，使用实际API
async function fetchImageData() {
  loading.value = true;

  try {
    // 处理日期范围
    if (searchForm.uploadTime && searchForm.uploadTime.length === 2) {
      searchForm.startTime = dayjs(searchForm.uploadTime[0]).format('YYYY-MM-DD 00:00:00');
      searchForm.endTime = dayjs(searchForm.uploadTime[1]).format('YYYY-MM-DD 23:59:59');
    } else {
      searchForm.startTime = undefined;
      searchForm.endTime = undefined;
    }

    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      categoryId: searchForm.categoryId || undefined,
      reviewStatus: searchForm.reviewStatus || undefined,
      tagId: searchForm.tagId || undefined, // 添加标签ID查询参数
      startTime: searchForm.startTime,
      endTime: searchForm.endTime
    };

    const response = await listPicturesByPageUsingGet(params);

    // 访问正确的数据层级
    if (response.data.code === 200 && response.data.data) {
      // 直接使用后端返回的数据，不再添加模拟信息
      imageData.value = response.data.data.records || [];
      pagination.total = response.data.data.total || 0;

      // 更新统计卡片数据
      statCards[0].value = response.data.data.total || 0;
    } else {
      message.error(response.data.message || '获取图片列表失败');
      imageData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取图片列表出错:', error);
    message.error('获取图片列表失败，请检查网络连接');
    imageData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

const handleDataUpdated = (data) => {
  // 使用返回的数据更新本地统计信息
  updateLocalStatistics(data);
};

// 5. 添加本地统计数据更新方法
const updateLocalStatistics = (data) => {
  if (data) {
    // 更新统计卡片数据(如果需要在其他地方使用)
    statCards[0].value = data.monthUploadCount || '0';
    statCards[0].change = data.monthUploadGrowth || 0;

    statCards[1].value = data.weekUploadCount || '0';
    statCards[1].change = data.weekUploadGrowth || 0;

    statCards[2].value = data.totalViews || '0';
    statCards[2].change = data.viewsGrowth || 0;

    statCards[3].value = data.totalLikes || '0';
    statCards[3].change = data.likesGrowth || 0;
  }
};

function updateReviewStatus(status) {
  reviewForm.reviewStatus = status;
  reviewForm.reviewMessage = getDefaultReviewMessage(status);
}

// 新增：更新批量审核状态
function updateBatchReviewStatus(status) {
  batchReviewForm.reviewStatus = status;
  batchReviewForm.reviewMessage = getDefaultReviewMessage(status);
}

// 打开审核弹窗函数
function openReviewModal(record) {
  currentReviewImage.value = record;

  // 设置表单初始值
  reviewForm.reviewStatus = record.reviewStatus || 0; // 使用当前状态，默认为待审核
  reviewForm.pictureId = record.id;

  // 设置默认审核意见
  reviewForm.reviewMessage = record.reviewMessage || getDefaultReviewMessage(reviewForm.reviewStatus);

  reviewModalVisible.value = true;
}

// 新增：打开批量审核弹窗函数
function openBatchReviewModal() {
  if (!hasSelected.value) {
    message.warning('请先选择要审核的图片');
    return;
  }

  batchReviewForm.reviewStatus = 1; // 默认设置为通过
  batchReviewForm.reviewMessage = getDefaultReviewMessage(1);

  batchReviewModalVisible.value = true;
}

// 处理行操作点击 - 添加审核功能处理
function handleRowActionClick({action, record}) {
  switch (action.key) {
    case 'preview':
      handlePreviewImage(record);
      break;
    case 'edit':
      editImageInfo(record);
      break;
    case 'copy':
      copyImageUrl(record);
      break;
    case 'download':
      downloadImage(record);
      break;
    case 'review': // 添加审核操作处理
      openReviewModal(record);
      break;
    case 'delete':
      showDeleteConfirm(record);
      break;
    default:
      console.log('未处理的操作:', action.key);
  }
}

// 取消审核
function handleReviewCancel() {
  reviewModalVisible.value = false;
  // 重置表单
  setTimeout(() => {
    currentReviewImage.value = null;
    reviewForm.reviewStatus = 1;
    reviewForm.reviewMessage = '';
    reviewForm.pictureId = null;
  }, 300);
}

// 新增：取消批量审核
function handleBatchReviewCancel() {
  batchReviewModalVisible.value = false;
  // 重置表单
  setTimeout(() => {
    batchReviewForm.reviewStatus = 1;
    batchReviewForm.reviewMessage = '';
  }, 300);
}

// 提交审核
async function handleReviewSubmit() {
  // 表单验证
  try {
    await reviewFormRef.value.validate();

    submitLoading.value = true;

    // 调用审核API
    const params = {
      pictureId: reviewForm.pictureId,
      reviewStatus: reviewForm.reviewStatus,
      reviewMessage: reviewForm.reviewMessage || undefined
    };

    const response = await reviewPictureUsingPost(params);

    if (response.data && response.data.code === 200) {
      message.success('审核操作成功');

      // 更新本地数据
      const index = imageData.value.findIndex(item => item.id === reviewForm.pictureId);
      if (index > -1) {
        // 更新审核状态和信息
        imageData.value[index] = {
          ...imageData.value[index],
          reviewStatus: reviewForm.reviewStatus,
          reviewMessage: reviewForm.reviewMessage,
          reviewTime: new Date().toISOString(), // 当前时间
          reviewerUserName: '当前用户名' // 这里需要根据实际登录用户信息设置
        };

        // 如果当前预览的是该图片，也更新预览数据
        if (previewImage.value && previewImage.value.id === reviewForm.pictureId) {
          previewImage.value = {...imageData.value[index]};
        }
      }

      // 关闭弹窗
      reviewModalVisible.value = false;
    } else {
      message.error(response.data?.message || '审核操作失败');
    }
  } catch (error) {
    console.error('审核提交出错:', error);
    message.error('提交审核时出现错误');
  } finally {
    submitLoading.value = false;
  }
}

// 新增：提交批量审核
async function handleBatchReviewSubmit() {
  try {
    await batchReviewFormRef.value.validate();

    batchSubmitLoading.value = true;

    const params = {
      pictureIds: selectedRowKeys.value,
      reviewStatus: batchReviewForm.reviewStatus,
      reviewMessage: batchReviewForm.reviewMessage || undefined
    };

    const response = await batchReviewPicturesUsingPost(params);

    if (response.data && response.data.code === 200) {
      message.success(`成功审核 ${selectedRowKeys.value.length} 张图片`);

      // 更新本地数据
      imageData.value = imageData.value.map(item => {
        if (selectedRowKeys.value.includes(item.id)) {
          return {
            ...item,
            reviewStatus: batchReviewForm.reviewStatus,
            reviewMessage: batchReviewForm.reviewMessage,
            reviewTime: new Date().toISOString(),
            reviewerUserName: '当前用户名' // 需要根据实际情况获取
          };
        }
        return item;
      });

      // 清空选择
      selectedRowKeys.value = [];

      // 关闭弹窗
      batchReviewModalVisible.value = false;

      // 刷新数据
      fetchImageData();
    } else {
      message.error(response.data?.message || '批量审核操作失败');
    }
  } catch (error) {
    console.error('批量审核出错:', error);
    message.error('批量审核时出现错误');
  } finally {
    batchSubmitLoading.value = false;
  }
}

// 根据ID获取图片对象 - 用于批量审核预览
function getImageById(id) {
  return imageData.value.find(item => item.id === id);
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
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

// 计算宽高比
function calculateAspectRatio(width, height) {
  if (!width || !height) return '-';

  // 计算最大公约数
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divisor = gcd(width, height);

  // 返回最简形式的宽高比
  return `${width / divisor}:${height / divisor}`;
}

// 格式化日期时间 - 增加简洁模式参数
const formatDateTime = (timestamp, dateOnly = false, compact = false) => {
  if (!timestamp) return '-';

  if (compact) {
    // 简洁模式，只返回月日时分
    return dayjs(timestamp).format('MM-DD HH:mm');
  }

  return dayjs(timestamp).format(dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

// 搜索处理
function handleSearch() {
  pagination.current = 1;
  fetchImageData();
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.name = '';
  searchForm.categoryId = undefined;
  searchForm.reviewStatus = undefined;
  searchForm.tagId = undefined; // 重置标签搜索
  searchForm.uploadTime = [];
  searchForm.startTime = undefined;
  searchForm.endTime = undefined;

  pagination.current = 1;
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
function handleTableChange(event) {
  const {pagination: pag, sorter} = event;

  if (pag) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
  }

  // 处理排序
  if (sorter && sorter.field) {
    // 这里可以根据后端API的排序参数进行处理
    console.log('排序字段:', sorter.field, '排序方式:', sorter.order);
  }

  fetchImageData();
}

// 页面变化
function onPageChange(page, pageSize) {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchImageData();
}

// 每页条数变化
function onShowSizeChange(current, size) {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchImageData();
}

// 获取分类名称
function getCategoryName(category) {
  return category || '未分类';
}

// 获取分类颜色
function getCategoryColor(category) {
  if (!category) return '';

  const colorMap = {
    '编程学习': '#6554C0',
    '自然风光': '#52C41A',
    '人物头像': '#1890FF'
  };

  // 如果没有预定义颜色，根据文本生成一致的颜色
  if (!colorMap[category]) {
    const colors = ['#1890FF', '#52C41A', '#722ED1', '#FA8C16', '#EB2F96', '#F5222D', '#13C2C2'];
    const index = category.length % colors.length;
    return colors[index];
  }

  return colorMap[category];
}


// 将深色转换为浅色，保持色调一致
function lightifyColor(color) {
  if (!color) return '';

  // 如果颜色为十六进制格式
  if (color.startsWith('#')) {
    // 将十六进制转为RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // 计算亮度
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 如果颜色已经很亮，返回稍微淡化的版本
    if (luminance > 0.7) {
      return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }

    // 将颜色转为HSL，提高亮度但保持色相
    // 简化转换: 创建淡化版本（15%的原色）
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  }

  // 如果是其他颜色格式，返回淡蓝色
  return 'rgba(24, 144, 255, 0.15)';
}

// 获取标签文字颜色，确保在浅色背景上有足够对比度
function getTagTextColor(color) {
  if (!color) return '#1890FF';

  if (color.startsWith('#')) {
    // 获取原始色调作为文字颜色
    return color;
  }

  return '#1890FF'; // 默认蓝色
}

// 获取标签颜色
function getTagColorFromRecord(record, index) {
  // 检查记录中是否有标签颜色数组
  if (record.tagColors && record.tagColors.length > 0) {
    // 如果索引存在，使用对应颜色，否则使用第一个颜色
    const baseColor = index < record.tagColors.length ? record.tagColors[index] : record.tagColors[0];
    // 转换为浅色背景
    return lightifyColor(baseColor);
  }

  // 默认颜色 - 当没有颜色值时
  return 'rgba(24, 144, 255, 0.15)';
}

function getTagTextColorFromRecord(record, index) {
  // 检查记录中是否有标签颜色数组
  if (record.tagColors && record.tagColors.length > 0) {
    // 如果索引存在，使用对应颜色，否则使用第一个颜色
    const baseColor = index < record.tagColors.length ? record.tagColors[index] : record.tagColors[0];
    // 使用原色调作为文字颜色
    return baseColor;
  }

  // 默认颜色 - 当没有颜色值时
  return '#1890FF';
}


// 获取格式颜色
function getFormatColor(format) {
  if (!format) return 'default';

  const formatLower = format.toLowerCase();
  const colorMap = {
    'jpg': '#1890FF',
    'jpeg': '#1890FF',
    'png': '#52C41A',
    'webp': '#722ED1',
    'svg': '#EB2F96',
    'gif': '#FAAD14'
  };
  return colorMap[formatLower] || 'default';
}

// 添加导航函数
function navigateToCreatePicture() {
  router.push('/create-picture');
}

function navigateToBatchCreatePicture() {
  router.push('/create-batch-picture');
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    '1': 'success',
    '0': 'warning',
    '2': 'error'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    '1': '已通过',
    '0': '待审核',
    '2': '已拒绝'
  };
  return statusMap[status] || '未知状态';
}

// 获取状态颜色
function getStatusColor(status) {
  const statusMap = {
    '1': '#73D13D',
    '0': '#FAAD14',
    '2': '#F5222D'
  };
  return statusMap[status] || 'default';
}

// 获取状态CSS类
function getStatusClass(status) {
  const statusMap = {
    '1': 'status-success',
    '0': 'status-pending',
    '2': 'status-rejected'
  };
  return statusMap[status] || 'status-default';
}

// 打开上传模态框
function openUploadModal() {
  // 重置上传表单
  uploadForm.categoryId = undefined;
  uploadForm.tagIds = [];
  uploadForm.description = '';
  fileList.value = [];

  uploadModalVisible.value = true;
}

// 获取审核状态胶囊样式类
function getStatusPillClass(status) {
  const statusMap = {
    '1': 'status-pill-success',
    '0': 'status-pill-pending',
    '2': 'status-pill-rejected'
  };
  return statusMap[status] || 'status-pill-default';
}


// 获取行操作按钮配置
function getRowActions(record) {
  return [
    {
      key: 'preview',
      text: '预览',
      icon: () => h(IconFont, {type: 'icon-chakan'}),
      type: 'link'
    },
    {
      key: 'edit',
      text: '编辑',
      icon: () => h(IconFont, {type: 'icon-bianji6'}),
      type: 'link'
    },
    {
      key: 'review',
      text: record.reviewStatus === 1 ? '修改审核' : '审核图片',
      icon: () => h(IconFont, {type: 'icon-shenhezhuangtai-tijiaoshenhe',size:'40'})
    },
    {
      key: 'more',
      text: '更多',
      type: 'dropdown',
      items: [
        {
          key: 'download',
          text: '下载',
          icon: () => h(IconFont, {type: 'icon-download2'})
        },
        {divider: true},
        {
          key: 'delete',
          text: '删除',
          icon: () => h(IconFont, {type: 'icon-shanchu'}),
          danger: true
        }
      ]
    }
  ];
}

function getDefaultReviewMessage(status) {
  const defaultMessages = {
    0: "图片需进一步评估，暂时保持待审核状态。", // 待审核
    1: "图片内容符合平台规范，质量良好，审核通过。", // 通过
    2: "图片不符合平台发布规范，请修改后重新提交。" // 拒绝
  };

  return defaultMessages[status] || "";
}

// 获取应该显示的缩略图
function getVisibleThumbnails() {
  const centerIndex = Math.min(Math.max(0, previewIndex.value), imageData.value.length - 1);
  const start = Math.max(0, centerIndex - 2);
  const end = Math.min(imageData.value.length, start + 5);
  return imageData.value.slice(start, end);
}

// 获取缩略图起始索引
function getThumbStartIndex() {
  const centerIndex = Math.min(Math.max(0, previewIndex.value), imageData.value.length - 1);
  return Math.max(0, centerIndex - 2);
}

// 计算是否有分类或标签
const hasCategoryOrTags = computed(() => {
  if (!previewImage.value) return false;
  return !!(previewImage.value.category || (previewImage.value.tags && previewImage.value.tags.length > 0));
});

// 预览图片
function handlePreviewImage(record) {
  previewImage.value = record;
  previewIndex.value = imageData.value.findIndex(item => item.id === record.id);
  previewVisible.value = true;
}

// 处理预览关闭
function handlePreviewClose() {
  previewVisible.value = false;

  // 延迟清空预览图片数据，确保动画完成后再清理数据
  setTimeout(() => {
    previewImage.value = null;
    previewIndex.value = 0;
  }, 300);
}

// 缩略图选择方法
function selectThumbnail(index) {
  previewIndex.value = index;
  previewImage.value = imageData.value[index];
}

// 复制图片链接
function copyImageUrl(record) {
  if (!record) return;

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
  router.push({name: 'EditPicture', params: {id: record.id}});
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


// 下载图片
function downloadImage(record) {
  if (!record) return;

  // 创建一个临时链接元素
  const link = document.createElement('a');
  link.href = record.url;
  link.download = record.name || `image-${record.id}.${record.format.toLowerCase()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success('图片下载已开始');
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  if (!record) return;

  Modal.confirm({
    title: '确定要删除此图片吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      return deleteImage(record);
    }
  });
}

// 删除图片
async function deleteImage(record) {
  if (!record) return;

  loading.value = true;

  try {
    const response = await deletePictureUsingDelete({id: record.id});

    // 修改这里：使用正确的响应数据结构判断
    if (response.data && response.data.code === 200 && response.data.data) {
      // 从列表中移除
      imageData.value = imageData.value.filter(image => image.id !== record.id);
      pagination.total -= 1;

      // 如果删除的是当前选中的图片，则清除选中状态
      if (selectedRowKeys.value.includes(record.id)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
      }

      message.success('图片已删除');
    } else {
      // 错误消息也需要修改
      message.error((response.data && response.data.message) || '删除图片失败');
    }
  } catch (error) {
    console.error('删除图片出错:', error);
    message.error('删除图片失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
}

// 批量删除确认
async function confirmBatchDelete({selectedRowKeys: keys}) {
  if (!keys || keys.length === 0) {
    message.warning('请先选择要删除的图片');
    return;
  }

  loading.value = true;

  try {
    const response = await batchDeletePicturesUsingDelete(keys);

    // 同样修改这里的判断条件
    if (response.data && response.data.code === 200 && response.data.data) {
      // 从列表中移除
      imageData.value = imageData.value.filter(image => !keys.includes(image.id));
      pagination.total -= keys.length;
      selectedRowKeys.value = [];

      message.success('已批量删除图片');
    } else {
      message.error((response.data && response.data.message) || '批量删除图片失败');
    }
  } catch (error) {
    console.error('批量删除图片出错:', error);
    message.error('批量删除图片失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
}

// 批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的图片');
    return;
  }

  Modal.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 张图片吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      return confirmBatchDelete({selectedRowKeys: selectedRowKeys.value});
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

/* 批量审核按钮样式 */
.batch-review-btn {
  background-color: #6554C0;
  border-color: #6554C0;
  position: relative;
  overflow: hidden;
}

.batch-review-btn:hover, .batch-review-btn:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
  box-shadow: 0 2px 8px rgba(101, 84, 192, 0.3);
}

/* 图片缩略图样式 */
.image-thumbnail-container {
  width: 60px;
  height: 60px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  margin: 0 auto;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.image-thumbnail-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.image-thumbnail {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 优化后的图片信息紧凑布局 */
.image-info-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
}

.info-primary {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.info-secondary {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tiny-tag {
  padding: 0 4px;
  font-size: 11px;
  line-height: 16px;
  height: 16px;
}

.size-text {
  font-size: 12px;
  color: #888;
}

/* 图片详细信息弹出框样式 */
.image-info-detail-card {
  padding: 8px;
  width: 220px;
}

.info-detail-row {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.info-detail-row:last-child {
  margin-bottom: 0;
}

.info-detail-label {
  min-width: 60px;
  color: #666;
  font-size: 13px;
}

.info-detail-value {
  font-size: 13px;
  color: #333;
}

/* 优化的审核信息紧凑布局 */
.review-info-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

/* 改进审核状态标签样式 - 修复标签偏移问题 */
.compact-status-tag {
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.compact-status-tag .ant-badge {
  margin-right: 4px;
  top: -1px;
  position: relative;
}

.review-time-hint {
  font-size: 11px;
  color: #999;
}

/* 审核信息详情弹出框样式 */
.review-info-detail-card {
  padding: 12px;
  width: 280px;
  border-radius: 8px;
  background-color: #fff;
}

.review-info-item {
  margin-bottom: 12px;
}

.review-info-item:last-child {
  margin-bottom: 0;
}

.review-info-label {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
}

.review-info-value {
  font-size: 13px;
  color: #333;
}

/* 用户信息紧凑布局 */
.user-compact {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar-compact {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

/* 分类标签样式 */
.category-tag {
  padding: 0 8px;
  font-size: 12px;
  height: 24px;
  line-height: 24px;
  border-radius: 4px;
  border: none;
}

/* 图片标签样式 */
.image-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}

.count-tag {
  padding: 0 4px;
  font-size: 11px;
  height: 16px;
  line-height: 16px;
  background: #f0f0f0;
  color: #888;
  border: none;
}

/* 网格视图样式 */
.image-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 16px;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.image-info-row {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.image-info-row .anticon {
  margin-right: 4px;
  color: #6554C0;
}

.image-tags-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.small-tag {
  font-size: 10px;
  padding: 0 4px;
  margin-right: 4px;
  margin-bottom: 4px;
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

/* 用户卡片网格样式 */
.user-card-grid {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 8px;
}

.username-grid {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 网格选择区域 */
.grid-header {
  margin-bottom: 16px;
}

.grid-selection {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f0f8ff;
  border-radius: 6px;
}

.selected-count {
  margin-left: 10px;
  font-size: 14px;
  color: #6554C0;
  font-weight: 500;
}

/* 全屏沉浸式模态框 */
.immersive-preview-modal :deep(.ant-modal-content) {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a1a;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  height: 600px; /* 减少高度 */
}

.immersive-preview-modal :deep(.ant-modal-body) {
  padding: 0;
  height: 100%;
}

.immersive-preview-modal :deep(.ant-modal-close) {
  display: none;
}

/* 预览容器 */
.preview-container {
  display: flex;
  height: 100%;
  position: relative;
}

/* 左侧图片展示区 - 无边距设计 */
.preview-image-section {
  flex: 1;
  background: #000;
  display: flex;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: 0; /* 移除边距 */
  padding: 0; /* 移除填充 */
}

/* 导航控制 */
.preview-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.prev-btn {
  left: 16px;
}

.next-btn {
  right: 16px;
}

.image-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  pointer-events: none;
}

/* 自定义关闭按钮 */
.preview-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100;
  transition: all 0.25s;
}

.preview-close-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: rotate(90deg);
}

/* 右侧信息面板 - 更紧凑的设计 */
.preview-info-panel {
  width: 320px; /* 减少宽度 */
  background: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.info-panel-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px; /* 减少间距 */
}

/* 图片标题区域 */
.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.format-badge {
  text-transform: uppercase;
  font-weight: 500;
  font-size: 12px;
}

/* 状态区域 */
.status-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.status-badge {
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
  color: white;
  font-size: 13px;
}

.status-success {
  background-color: #73D13D;
}

.status-pending {
  background-color: #FAAD14;
}

.status-rejected {
  background-color: #F5222D;
}

/* 信息块 */
.info-block {
  background: #f9f9fc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.info-label .anticon {
  margin-right: 4px;
  color: #6554C0;
}

.info-value {
  font-size: 13px;
  color: #262626;
  font-weight: 500;
}

/* 标签区域 */
.tags-section {
  margin-bottom: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.section-label .anticon {
  color: #6554C0;
  margin-right: 6px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-tag {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.category-tag .anticon {
  margin-right: 4px;
}

.image-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  border: none;
}

/* 用户区域 */
.user-section {
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #8c8c8c;
}

/* 审核信息 */
.review-section {
  margin-bottom: 8px;
}

.review-details {
  background: #f9f9fc;
  border-radius: 6px;
  padding: 10px;
}

.review-message {
  font-size: 13px;
  color: #262626;
  background: #f0f0f0;
  padding: 6px 10px;
  border-radius: 4px;
  border-left: 3px solid #6554C0;
  margin-bottom: 8px;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}

.review-meta .anticon {
  margin-right: 4px;
  color: #6554C0;
}

/* 操作按钮区 */
.action-buttons {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.primary-action {
  height: 36px;
  width: 100%;
  font-size: 14px;
  background: #6554C0;
  border-color: #6554C0;
}

.primary-action:hover {
  background: #7C68EE;
  border-color: #7C68EE;
}

.secondary-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.secondary-actions .ant-btn {
  padding: 0 8px;
  height: 32px;
  font-size: 12px;
}

/* 自定义滚动条 */
.preview-info-panel::-webkit-scrollbar {
  width: 4px;
}

.preview-info-panel::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.preview-info-panel::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .preview-container {
    flex-direction: column;
  }

  .preview-info-panel {
    width: 100%;
    max-height: 300px;
  }

  .preview-image-section {
    height: 300px;
  }
}

/* 优化的审核弹框样式 */
.custom-review-modal :deep(.ant-modal-content) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.custom-review-modal :deep(.ant-modal-body) {
  padding: 0;
  margin: 0;
}

.custom-review-modal :deep(.ant-modal-close) {
  top: 12px;
  right: 12px;
}

.review-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  color: white;
  font-size: 16px;
  transition: all 0.3s;
}

.review-close-btn:hover {
  background: rgba(0, 0, 0, 0.65);
  transform: rotate(90deg);
}

/* 主容器布局 */
.review-container {
  display: flex;
  height: 640px;
}

/* 左侧图片面板 */
.review-left-panel {
  width: 450px;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.image-preview-container {
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.review-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-overlay-info {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.overlay-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overlay-badge.status-success {
  background-color: rgba(101, 84, 192, 0.85);
}

.overlay-badge.status-pending {
  background-color: rgba(250, 173, 20, 0.85);
}

.overlay-badge.status-rejected {
  background-color: rgba(245, 34, 45, 0.85);
}

.image-meta-info {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.image-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-tags {
  margin-bottom: 12px;
}

.format-tag {
  text-transform: uppercase;
  font-weight: 500;
}

.image-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.spec-item .anticon {
  margin-right: 4px;
  color: #6554C0;
}

/* 右侧审核面板 */
.review-right-panel {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
}

.review-title .anticon {
  font-size: 20px;
  margin-right: 8px;
  color: #6554C0;
}

.current-status {
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
}

.review-form {
  flex: 1;
}

/* 状态选择卡片样式 */
.status-options {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.status-option {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.status-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.status-option.active {
  border-color: #6554C0;
  background: rgba(101, 84, 192, 0.05);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 20px;
}

.option-icon.success {
  background-color: #73D13D;
}

.option-icon.warning {
  background-color: #faad14;
}

.option-icon.danger {
  background-color: #f5222d;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 审核文本域样式 */
.review-textarea {
  border-radius: 8px;
  resize: none;
}

/* 按钮区域 */
.review-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}

.cancel-btn {
  min-width: 100px;
}

.submit-btn {
  min-width: 120px;
  background-color: #6554C0;
  border-color: #6554C0;
}

.submit-btn:hover,
.submit-btn:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 批量审核模态框样式 */
.batch-review-modal :deep(.ant-modal-content) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.batch-review-modal :deep(.ant-modal-body) {
  padding: 0;
  margin: 0;
}

.batch-review-container {
  padding: 24px;
}

.batch-review-header {
  margin-bottom: 16px;
}

.batch-review-content {
  margin-top: 16px;
}

.selected-images-summary {
  background: #f9f9fc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.images-count {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #6554C0;
  margin-bottom: 12px;
}

.images-count .anticon {
  margin-right: 8px;
  font-size: 20px;
}

.preview-thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.preview-thumb {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-previews {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666;
  font-weight: 500;
}

.batch-status-options {
  margin-bottom: 24px;
}

.batch-review-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .review-container {
    flex-direction: column;
    height: auto;
  }

  .review-left-panel {
    width: 100%;
    height: 350px;
  }

  .review-right-panel {
    padding: 16px;
  }

  .status-options {
    flex-direction: column;
  }

  .batch-review-container {
    padding: 16px;
  }
}

/* Popover 样式定制 */
:deep(.image-info-popover),
:deep(.review-info-popover) {
  max-width: 320px;
}

:deep(.ant-popover-inner) {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
  0 6px 16px 0 rgba(0, 0, 0, 0.08),
  0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

:deep(.ant-popover-arrow) {
  display: none;
}

/* 确保表格行不被撑高 */
:deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px;
  vertical-align: middle;
  height: 60px;
  white-space: nowrap;
}

/* 确保缩略图保持固定大小 */
:deep(.column-thumbnail) {
  width: 60px;
  height: 60px;
}

/* 网格视图容器 */
.grid-view-container {
  margin-top: 16px;
}

/* 网格选择头部区域 */
.grid-header {
  margin-bottom: 16px;
}

.grid-selection {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.selected-count {
  margin-left: 12px;
  font-size: 14px;
  color: #6554C0;
  font-weight: 500;
}

/* 图片网格布局 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* 图片卡片样式 */
.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.image-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

/* 图片选择复选框 */
.image-selection {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 4px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-selection,
.image-card-selected .image-selection {
  opacity: 1;
}

/* 审核状态徽章 */
.image-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-success {
  background-color: #73D13D;
}

.status-pending {
  background-color: rgba(250, 173, 20, 0.85);
}

.status-rejected {
  background-color: rgba(245, 34, 45, 0.85);
}

/* 图片主体区域 */
.image-card-body {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 比例 */
  overflow: hidden;
  cursor: pointer;
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

/* 图片信息悬浮层 */
.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-resolution {
  font-weight: 500;
}

.image-size {
  opacity: 0.9;
}

.image-card-body:hover .image-info-overlay {
  opacity: 1;
}

/* 图片信息区域 */
.image-card-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 图片标题行 */
.image-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.image-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

.format-badge {
  font-size: 11px;
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
  text-transform: uppercase;
  font-weight: 500;
  border-radius: 3px;
}

/* 分类和标签区域 */
.image-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.category-tag {
  font-size: 11px;
  padding: 2px 8px;
  height: 20px;
  line-height: 16px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.image-tag {
  font-size: 11px;
  padding: 2px 8px;
  height: 20px;
  line-height: 16px;
  border-radius: 4px;
  border: none;
}

.more-tag {
  font-size: 11px;
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
  background: #f5f5f5;
  color: #888;
  border: none;
}

/* 统计指标 */
.image-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.metric-item .anticon {
  font-size: 14px;
  color: #6554C0;
}

/* 底部信息和操作区 */
.image-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
}

.image-uploader {
  display: flex;
  align-items: center;
}

.uploader-avatar {
  margin-right: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.uploader-info {
  display: flex;
  flex-direction: column;
}

.uploader-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.upload-time {
  font-size: 11px;
  color: #999;
}

/* 操作按钮 */
.image-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666;
  font-size: 16px;
  transition: all 0.2s;
  background: transparent;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #f5f0ff;
  color: #6554C0;
}

/* 分页容器 */
.grid-pagination-bottom {
  margin-top: 24px;
  text-align: right;
}

/* 响应式布局 */
@media (max-width: 1600px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 992px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 576px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}

/* 列表视图审核状态胶囊样式 */
.status-pill {
  padding: 2px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  display: inline-block;
  text-align: center;
  min-width: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
}

.status-pill-success {
  background-color: #52c41a;
}

.status-pill-pending {
  background-color: #faad14;
}

.status-pill-rejected {
  background-color: #f5222d;
}

.status-pill-default {
  background-color: #d9d9d9;
}

/* 审核状态显示容器优化 */
.review-status-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.review-time-hint {
  font-size: 11px;
  color: #999;
}

/* 审核信息弹出框样式优化 */
.review-info-detail-card {
  padding: 12px;
  width: 280px;
  border-radius: 8px;
  background-color: #fff;
}

.review-info-item {
  margin-bottom: 12px;
}

.review-info-item:last-child {
  margin-bottom: 0;
}

.review-info-label {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
}

.review-info-value {
  font-size: 13px;
  color: #333;
}
</style>