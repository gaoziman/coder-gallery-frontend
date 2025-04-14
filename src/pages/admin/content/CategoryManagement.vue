<template>
  <div class="category-management-container">

    <DashboardHeader
        title="分类管理"
        description="管理系统分类资源，支持创建、组织、批量操作以及层级结构管理"
        parent-module="内容管理"
        :module-icon="AppstoreOutlined"
        :metrics="headerMetrics"
    />

    <!-- 使用统计卡片组件 -->
    <StatCards :cards="statCards"/>

    <!-- 搜索条件区域 -->
    <a-card v-if="viewMode === 'list'" class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 分类名称 -->
            <a-form-item label="分类名称" name="categoryName">
              <a-input v-model:value="searchForm.categoryName" placeholder="请输入分类名称" allowClear/>
            </a-form-item>

            <!-- 分类类型 -->
            <a-form-item label="分类类型" name="categoryType">
              <a-select
                  v-model:value="searchForm.categoryType"
                  placeholder="请选择类型"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option v-for="type in categoryTypes" :key="type.value" :value="type.value">
                  {{ type.text }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <!-- 创建时间 -->
            <a-form-item label="创建时间" name="createTime">
              <a-range-picker
                  v-model:value="searchForm.createTime"
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
          <a-button type="primary" @click="openCreateModal">
            <IconFont type="icon-chuangjian2"/>
            新建分类
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchExport">
            <export-outlined/>
            批量导出
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="tree">
            <branches-outlined/>
            树形视图
          </a-radio-button>
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 树形视图 - 全新设计 -->
    <div v-if="viewMode === 'tree'" class="tree-view-container">
      <a-row :gutter="16">
        <!-- 左侧树形结构 -->
        <a-col :span="7">
          <a-card class="tree-card" :body-style="{ padding: '0' }">
            <template #title>
              <div class="tree-card-header">
                <div class="tree-card-title">
                  <branches-outlined class="tree-icon"/>
                  <span>分类层级树</span>
                </div>
                <div class="tree-actions">
                  <a-tooltip title="刷新分类">
                    <a-button type="text" shape="circle" @click="refreshTree">
                      <reload-outlined/>
                    </a-button>
                  </a-tooltip>
                  <a-tooltip :title="isTreeCollapsed ? '展开全部' : '折叠全部'">
                    <a-button type="text" shape="circle" @click="toggleTreeExpand">
                      <expand-outlined :rotate="isTreeCollapsed ? 0 : 90"/>
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </template>

            <div class="tree-search-wrapper">
              <a-input
                  v-model:value="searchTreeValue"
                  placeholder="搜索分类名称"
                  class="tree-search"
                  @change="handleTreeSearch"
                  allowClear
              >
                <template #prefix>
                  <search-outlined/>
                </template>
              </a-input>
            </div>

            <a-spin :spinning="loading" class="tree-spin-container">
              <div class="tree-content">
                <div v-if="categoryTreeData.length === 0" class="tree-empty-state">
                  <a-empty
                      description="暂无分类数据"
                      :image="Empty.PRESENTED_IMAGE_SIMPLE"
                  />
                  <a-button type="primary" size="small" @click="openCreateModal">新建分类</a-button>
                </div>
                <a-tree
                    v-else
                    :tree-data="categoryTreeData"
                    :selectable="true"
                    :selected-keys="selectedTreeKeys"
                    :expandable="true"
                    :show-line="{ showLeafIcon: false }"
                    :auto-expand-parent="true"
                    :expanded-keys="expandedKeys"
                    block-node
                    class="custom-tree"
                    @select="onTreeSelect"
                    @expand="onTreeExpand"
                >
                  <template #switcherIcon="{ expanded }">
                    <caret-down-outlined
                        :style="{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', fontSize: '12px', color: '#6554C0' }"
                    />
                  </template>
                  <template #title="{ title, key, dataRef }">
                    <div class="tree-node-wrapper">
                      <div class="tree-node-content">
                        <!-- 树节点中的图标 -->
                        <div class="tree-node-icon" :style="{ background: getCategoryTypeColor(dataRef.type) + '15' }">
                          <IconFont v-if="dataRef.icon && dataRef.icon.startsWith('icon-')"
                                    :type="dataRef.icon"
                                    :style="{ color: getCategoryTypeColor(dataRef.type) }"/>
                          <component v-else
                                     :is="getIconComponent(dataRef.icon || 'AppstoreOutlined')"
                                     :style="{ color: getCategoryTypeColor(dataRef.type) }"/>
                        </div>
                        <span class="tree-node-title">{{ title }}</span>
                        <a-tag class="tree-node-counter" :color="getCategoryTypeColor(dataRef.type)">
                          {{ dataRef.contentCount || 0 }}
                        </a-tag>
                      </div>
                      <div class="tree-node-actions">
                        <a-dropdown :trigger="['click']" @click.stop>
                          <a-button type="text" size="small" class="tree-node-action-btn">
                            <more-outlined/>
                          </a-button>
                          <template #overlay>
                            <a-menu>
                              <a-menu-item key="view" @click.stop="viewCategory(dataRef)">
                                <eye-outlined/>
                                查看详情
                              </a-menu-item>
                              <a-menu-item key="add" @click.stop="addChildCategory(key)">
                                <plus-outlined/>
                                添加子分类
                              </a-menu-item>
                              <a-menu-item key="edit" @click.stop="editCategory(key)">
                                <edit-outlined/>
                                编辑分类
                              </a-menu-item>
                              <a-menu-item key="move" @click.stop="moveCategory(dataRef)">
                                <swap-outlined/>
                                移动分类
                              </a-menu-item>
                              <a-menu-divider/>
                              <a-menu-item key="delete" danger @click.stop="showDeleteConfirm(key)">
                                <delete-outlined/>
                                删除分类
                              </a-menu-item>
                            </a-menu>
                          </template>
                        </a-dropdown>
                      </div>
                    </div>
                  </template>
                </a-tree>
              </div>
            </a-spin>

            <div class="tree-footer">
              <a-statistic title="总分类数" :value="statistics.totalCategories || 0"/>
              <a-statistic title="子分类总数" :value="statistics.totalCategories - statistics.topLevelCategories || 0"/>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧详情面板 -->
        <a-col :span="17">
          <div v-if="selectedCategory" class="category-detail-panel">
            <a-card :body-style="{ padding: '0' }" class="detail-card">
              <!-- 详情面板顶部 -->
              <div class="detail-panel-header"
                   :style="{ background: `linear-gradient(to right, ${getCategoryTypeColor(selectedCategory.type) + '30'}, ${getCategoryTypeColor(selectedCategory.type) + '05'})` }">
                <div class="detail-panel-icon" :style="{ background: getCategoryTypeColor(selectedCategory.type) }">
                  <component :is="getIconComponent(selectedCategory.icon || 'AppstoreOutlined')"
                             style="color: white; font-size: 24px;"/>
                </div>
                <div class="detail-panel-title">
                  <h2>{{ selectedCategory.name }}</h2>
                  <div class="detail-panel-subtitle">
                    <a-tag :color="getCategoryTypeColor(selectedCategory.type)">
                      {{ getCategoryTypeName(selectedCategory.type) }}
                    </a-tag>
                    <span class="detail-panel-path">
                      <partition-outlined/>
                      {{ getCategoryPath(selectedCategory) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-panel-content">
                <!-- 信息卡片与指标 -->
                <div class="detail-panel-metrics" style="margin-top: 24px;">
                  <div class="detail-metric-card">
                    <div class="detail-metric-icon">
                      <calendar-outlined style="color: #6554C0"/>
                    </div>
                    <div class="detail-metric-info">
                      <div class="detail-metric-value">{{ formatDateTime(selectedCategory.createTime, true) }}</div>
                      <div class="detail-metric-label">创建时间</div>
                    </div>
                  </div>

                  <div class="detail-metric-card">
                    <div class="detail-metric-icon">
                      <file-outlined style="color: #2F54EB"/>
                    </div>
                    <div class="detail-metric-info">
                      <div class="detail-metric-value">{{ selectedCategory.contentCount || 0 }}</div>
                      <div class="detail-metric-label">关联内容</div>
                    </div>
                  </div>

                  <div class="detail-metric-card">
                    <div class="detail-metric-icon">
                      <branches-outlined style="color: #52C41A"/>
                    </div>
                    <div class="detail-metric-info">
                      <div class="detail-metric-value"> {{
                          selectedCategory && selectedCategory.childCount !== undefined ? selectedCategory.childCount : childCategories.length || 0
                        }}
                      </div>
                      <div class="detail-metric-label">子分类数量</div>
                    </div>
                  </div>

                  <div class="detail-metric-card">
                    <div class="detail-metric-icon">
                      <sort-ascending-outlined style="color: #FA8C16"/>
                    </div>
                    <div class="detail-metric-info">
                      <div class="detail-metric-value">{{ selectedCategory.sortOrder || 0 }}</div>
                      <div class="detail-metric-label">排序优先级</div>
                    </div>
                  </div>
                </div>

                <!-- 详细信息面板 -->
                <div class="detail-panel-info">
                  <a-collapse :bordered="false" class="detail-collapse" :default-active-key="['1']">
                    <a-collapse-panel key="1" header="基本信息">
                      <a-descriptions :column="2" bordered size="small">
                        <a-descriptions-item label="分类ID">{{ selectedCategory.id }}</a-descriptions-item>
                        <a-descriptions-item label="URL别名">{{
                            selectedCategory.urlName || '未设置'
                          }}
                        </a-descriptions-item>
                        <a-descriptions-item label="层级" span="2">
                          <div class="level-indicator">
                            <div v-for="i in selectedCategory.level" :key="i" class="level-dot"></div>
                            <span>{{ getLevelText(selectedCategory.level) }}</span>
                          </div>
                        </a-descriptions-item>
                        <a-descriptions-item label="分类描述" span="2">
                          <div class="description-content">
                            {{ selectedCategory.description || '暂无描述信息' }}
                          </div>
                        </a-descriptions-item>
                      </a-descriptions>
                    </a-collapse-panel>

                    <a-collapse-panel key="2" header="关联内容">
                      <div class="related-items-container">
                        <a-empty v-if="!relatedItems || relatedItems.length === 0" description="暂无关联内容"/>
                        <div v-else class="related-items-list">
                          <a-list :data-source="relatedItems" :pagination="{ pageSize: 5, size: 'small' }">
                            <template #renderItem="{ item }">
                              <a-list-item>
                                <a-list-item-meta>
                                  <template #title>
                                    <a href="javascript:;">{{ item.title }}</a>
                                  </template>
                                  <template #avatar>
                                    <a-avatar :style="{ backgroundColor: getContentTypeColor(item.type) }">
                                      {{ item.type.charAt(0) }}
                                    </a-avatar>
                                  </template>
                                  <template #description>
                                    <div class="content-item-meta">
                                      <a-tag :color="getContentTypeColor(item.type)">{{ item.type }}</a-tag>
                                      <span class="content-item-time">
                                        <calendar-outlined/> {{ formatDateTime(item.createTime, true) }}
                                      </span>
                                    </div>
                                  </template>
                                </a-list-item-meta>
                                <template #actions>
                                  <a-button type="link" size="small">
                                    <eye-outlined/>
                                    查看
                                  </a-button>
                                </template>
                              </a-list-item>
                            </template>
                          </a-list>
                        </div>
                      </div>
                    </a-collapse-panel>

                    <a-collapse-panel key="3" header="子分类列表">
                      <div class="children-categories-container">
                        <a-empty v-if="!childCategories || childCategories.length === 0" description="暂无子分类"/>
                        <a-row :gutter="[16, 16]" v-else>
                          <a-col :xs="24" :sm="12" :md="8" v-for="child in childCategories" :key="child.id">
                            <div class="child-category-card" @click="viewCategory(child)">
                              <div class="child-category-icon"
                                   :style="{ background: getCategoryTypeColor(child.type) + '15' }">
                                <component
                                    :is="getIconComponent(child.icon || 'AppstoreOutlined')"
                                    :style="{ color: getCategoryTypeColor(child.type) }"
                                />
                              </div>
                              <div class="child-category-info">
                                <div class="child-category-name">{{ child.name }}</div>
                                <div class="child-category-meta">
                                  <a-tag size="small" :color="getCategoryTypeColor(child.type)">
                                    {{ getCategoryTypeName(child.type) }}
                                  </a-tag>
                                  <span class="child-category-count">
                                    <file-outlined/> {{ child.contentCount || 0 }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </a-col>
                        </a-row>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>

                <!-- 操作按钮区域 -->
                <div class="detail-action-bar">
                  <a-button @click="selectedCategory = null">
                    <rollback-outlined/>
                    返回
                  </a-button>
                  <div class="action-buttons">
                    <a-button type="primary" @click="editCategory(selectedCategory.id)">
                      <edit-outlined/>
                      编辑分类
                    </a-button>
                    <a-button @click="addChildCategory(selectedCategory.id)">
                      <plus-outlined/>
                      添加子分类
                    </a-button>
                    <a-button type="primary" @click="moveCategory(selectedCategory)">
                      <swap-outlined/>
                      移动分类
                    </a-button>
                    <a-button danger @click="showDeleteConfirm(selectedCategory.id)">
                      <delete-outlined/>
                      删除分类
                    </a-button>
                  </div>
                </div>
              </div>
            </a-card>
          </div>

          <div v-else class="category-empty-detail">
            <div class="empty-detail-content">
              <div class="empty-detail-icon">
                <appstore-outlined/>
              </div>
              <h3>请选择一个分类以查看详情</h3>
              <p>从左侧分类层级树中选择一个分类，或者新建一个分类</p>
              <a-button type="primary" @click="openCreateModal">新建分类</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="categoryData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 分类名称列 -->
          <template v-if="column.dataIndex === 'name'">
            <div class="category-name-cell">
              <div class="category-icon"
                   :style="{ background: getCategoryTypeColor(record.type) + '15', color: getCategoryTypeColor(record.type) }">
                <component :is="getIconComponent(record.icon || 'AppstoreOutlined')"/>
              </div>
              <span>{{ record.name }}</span>
            </div>
          </template>

          <!-- 分类类型列 -->
          <template v-if="column.dataIndex === 'type'">
            <a-tag :color="getCategoryTypeColor(record.type)">
              {{ getCategoryTypeName(record.type) }}
            </a-tag>
          </template>


          <!-- 分类层级列 -->
          <template v-if="column.dataIndex === 'level'">
            <div class="level-indicator">
              <div v-for="i in record.level" :key="i" class="level-dot"></div>
              <span>{{ getLevelText(record.level) }}</span>
            </div>
          </template>

          <!-- 创建时间 -->
          <template v-if="column.dataIndex === 'createTime'">
            {{ formatDateTime(record.createTime, true) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="viewCategory(record)">
                <eye-outlined/>
                查看
              </a-button>
              <a-button type="link" size="small" @click="editCategory(record.id)">
                <edit-outlined/>
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="addChildCategory(record.id)"
                                 style="white-space: nowrap; min-width: 110px;">
                      <plus-outlined/>
                      添加子分类
                    </a-menu-item>
                    <a-menu-item key="2" @click="moveCategory(record)">
                      <swap-outlined/>
                      移动分类
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item key="3" danger @click="showDeleteConfirm(record.id)">
                      <delete-outlined/>
                      删除分类
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  <more-outlined/>
                  更多
                </a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </div>


    <!-- 分类管理弹窗 -->
    <a-modal
        v-model:visible="categoryModalVisible"
        :title="null"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="category-management-modal"
    >
      <div class="modal-header">
        <div class="header-title">
          <h2>{{ isEditing ? '编辑分类信息' : '创建新分类' }}</h2>
          <p>{{ isEditing ? '请修改以下信息更新分类' : '请填写以下信息创建一个新的分类' }}</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="categoryForm"
          :rules="categoryRules"
          ref="categoryFormRef"
          layout="vertical"
      >
        <!-- 分类表单布局 -->
        <div class="form-row-container">
          <!-- 左侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <appstore-outlined/>
              <span>基本信息</span>
            </div>

            <a-form-item label="分类名称" name="name" required>
              <a-input
                  v-model:value="categoryForm.name"
                  placeholder="请输入分类名称"
                  :maxLength="50"
                  showCount
              >
                <template #prefix>
                  <appstore-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="上级分类" name="parentId">
              <a-tree-select
                  v-model:value="categoryForm.parentId"
                  :tree-data="parentCategoryOptions"
                  :dropdown-style="{ maxHeight: '280px' }"
                  placeholder="请选择上级分类"
                  allow-clear
                  show-search
                  :tree-default-expand-all="true"
              >
                <template #prefix>
                  <partition-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-tree-select>
              <div class="form-hint">不选择时将创建为顶级分类</div>
            </a-form-item>

            <!-- 将URL别名和分类图标分离为各自独立的表单项 -->
            <a-form-item label="URL别名" name="urlName">
              <a-input
                  v-model:value="categoryForm.urlName"
                  placeholder="用于生成友好URL"
                  :maxLength="50"
                  allow-clear
              >
                <template #prefix>
                  <link-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
              <div class="form-hint">不填写系统将自动生成</div>
            </a-form-item>
          </div>

          <!-- 右侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <setting-outlined/>
              <span>分类设置</span>
            </div>

            <a-form-item label="分类类型" name="type" required>
              <a-select
                  v-model:value="categoryForm.type"
                  placeholder="请选择分类类型"
                  @change="handleTypeChange"
              >
                <template #suffixIcon>
                  <tag-outlined/>
                </template>
                <a-select-option v-for="type in categoryTypes" :key="type.value" :value="type.value">
                  <div class="type-option">
                    <span class="type-color" :style="{ backgroundColor: getCategoryTypeColor(type.value) }"></span>
                    <span>{{ type.text }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="排序优先级" name="sortOrder">
              <a-input
                  v-model:value="categoryForm.sortOrder"
                  :min="0"
                  :max="999"
                  style="width: 100%"
              >
                <template #prefix>
                  <sort-ascending-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
              <div class="form-hint">数值越小，排序越靠前</div>
            </a-form-item>

            <a-form-item label="分类图标" name="icon" required>
              <a-input
                  v-model:value="categoryForm.icon"
                  placeholder="请选择图标"
                  readonly
                  @click="openIconSelector"
              >
                <template #prefix>
                  <IconFont v-if="categoryForm.icon" :type="categoryForm.icon" size="18"/>
                  <tag-outlined v-else style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <!-- 图标选择器弹窗 -->
            <a-modal
                v-model:visible="iconSelectorVisible"
                title="选择图标"
                width="720px"
                :footer="null"
                :mask-closable="true"
            >
              <IconSelector
                  v-model:value="tempSelectedIcon"
                  @select="selectIconItem"
              />

              <div class="modal-footer">
                <a-button @click="closeIconSelector">取消</a-button>
                <a-button type="primary" @click="confirmIconSelection">确定</a-button>
              </div>
            </a-modal>
          </div>
        </div>


        <a-form-item label="分类描述" name="description">
          <a-textarea
              v-model:value="categoryForm.description"
              placeholder="请输入分类描述信息（选填）"
              :rows="4"
              :maxLength="200"
              showCount
          />
        </a-form-item>

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-header">
            <eye-outlined/>
            <span>预览效果</span>
          </div>
          <div class="preview-content">
            <div class="preview-card">
              <div class="preview-icon" :style="{backgroundColor: getCategoryTypeColor(categoryForm.type) + '15'}">
                <IconFont v-if="categoryForm.icon && categoryForm.icon.startsWith('icon-')"
                          :type="categoryForm.icon"
                          size="26"
                          :style="{ color: getCategoryTypeColor(categoryForm.type) }"/>
                <component v-else-if="categoryForm.icon && AntIcons[categoryForm.icon]"
                           :is="AntIcons[categoryForm.icon]"
                           :style="{ color: getCategoryTypeColor(categoryForm.type) }"/>
                <component v-else
                           :is="getIconComponent(categoryForm.icon || 'AppstoreOutlined')"
                           :style="{ color: getCategoryTypeColor(categoryForm.type) }"/>
              </div>
              <div class="preview-info">
                <div class="preview-name">{{ categoryForm.name || '分类名称' }}</div>
                <div class="preview-meta">
                  <a-tag :color="getCategoryTypeColor(categoryForm.type)">
                    {{ getCategoryTypeName(categoryForm.type) }}
                  </a-tag>
                  <span class="preview-path">
                    {{ categoryForm.parentId ? getParentName(categoryForm.parentId) : '顶级分类' }}
                  </span>
                </div>
                <div class="preview-desc">{{ categoryForm.description || '分类描述将显示在此处...' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="handleCategorySubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <!--  移动分类  -->
    <a-modal
        v-model:visible="categoryMoveModalVisible"
        :title="null"
        width="780px"
        :mask-closable="false"
        :footer="null"
        :destroyOnClose="true"
        class="category-move-modal"
        :bodyStyle="{ padding: 0 }"
    >
      <div class="move-container">
        <!-- 头部区域 -->
        <div class="move-header">
          <div class="header-bg-decoration"></div>
          <div class="header-content">
            <div class="header-icon">
              <swap-outlined/>
            </div>
            <div class="header-text">
              <h2 class="modal-title">{{ isBatchMove ? '批量移动分类' : '移动分类' }}</h2>
              <p class="modal-subtitle">
                {{
                  isBatchMove
                      ? `将选定的 ${batchSourceCategories.length} 个分类移动到新的位置`
                      : '将当前分类移动到新的位置，同时保留其子分类结构'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- 源分类信息卡片 - 单个移动时 -->
        <div class="source-section" v-if="!isBatchMove && currentSourceCategory">
          <div class="source-label">当前分类</div>
          <div class="source-card">
            <div class="source-icon"
                 :style="{ background: getCategoryTypeColor(currentSourceCategory.type) + '15', color: getCategoryTypeColor(currentSourceCategory.type) }">
              <component :is="getIconComponent(currentSourceCategory.icon || 'AppstoreOutlined')"/>
            </div>
            <div class="source-info">
              <div class="source-name">{{ currentSourceCategory.name }}</div>
              <div class="source-path">
                <a-tag :color="getCategoryTypeColor(currentSourceCategory.type)">
                  {{ getCategoryTypeName(currentSourceCategory.type) }}
                </a-tag>
                <div class="path-text">
                  <partition-outlined/>
                  {{ getCategoryPath(currentSourceCategory) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 批量移动源信息 -->
        <div class="source-section" v-if="isBatchMove">
          <div class="source-label">选中分类</div>
          <div class="source-card batch-card">
            <div class="source-icon" style="background: #6554C015; color: #6554C0">
              <swap-outlined/>
            </div>
            <div class="source-info">
              <div class="source-name">已选择 {{ batchSourceCategories.length }} 个分类</div>
              <div class="selected-categories">
                <a-tag v-for="(cat, index) in batchSourceCategories.slice(0, 3)" :key="index"
                       :color="getCategoryTypeColor(cat.type)" class="category-tag">
                  {{ cat.name }}
                </a-tag>
                <a-tag v-if="batchSourceCategories.length > 3" class="more-tag">
                  +{{ batchSourceCategories.length - 3 }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 目标选择区域 -->
        <div class="destination-section">
          <div class="section-label">
            <folder-outlined/>
            选择目标位置
          </div>

          <!-- 顶级分类选项 -->
          <div
              class="top-level-option"
              :class="{ selected: selectedDestination === 0 }"
              @click="selectedDestination = 0"
          >
            <div class="option-icon">
              <partition-outlined/>
            </div>
            <div class="option-content">
              <div class="option-title">作为顶级分类</div>
              <div class="option-desc">将分类移动到最顶层，不属于任何父分类</div>
            </div>
            <div class="option-arrow">
              <right-outlined/>
            </div>
          </div>

          <!-- 分类列表 -->
          <div v-if="availableCategoryOptions.length > 0" class="parent-category-section">
            <div class="section-label secondary-label">
              <branches-outlined/>
              选择父分类
            </div>

            <div class="categories-tree-container">
              <a-tree
                  :tree-data="formattedTreeData"
                  :selectable="true"
                  :selected-keys="[selectedDestination]"
                  :expandable="true"
                  :show-line="{ showLeafIcon: false }"
                  :auto-expand-parent="true"
                  :default-expanded-keys="defaultTreeExpandedKeys"
                  @select="onDestinationSelect"
              >
                <template #title="{ title, key, dataRef }">
                  <div class="tree-node-container">
                    <div class="node-icon"
                         :style="{ background: getCategoryTypeColor(dataRef.type) + '15', color: getCategoryTypeColor(dataRef.type) }">
                      <component :is="getIconComponent(dataRef.icon || 'AppstoreOutlined')"/>
                    </div>
                    <div class="node-content">
                      <span class="node-title">{{ title }}</span>
                    </div>
                  </div>
                </template>
              </a-tree>
            </div>
          </div>

          <a-empty
              v-else
              description="没有可选的目标分类"
              image="simple"
              style="margin: 20px 0"
          >
            <span class="empty-note">可能是因为选择了所有可用分类或不存在其他分类</span>
          </a-empty>
        </div>

        <!-- 警告提示 -->
        <div class="move-info-note">
          <a-alert type="info" show-icon>
            <template #message>
              <div class="alert-content">
                <span>移动分类后，该分类下的所有子分类也会随之移动。此操作不会影响关联的内容项。</span>
              </div>
            </template>
          </a-alert>
        </div>

        <!-- 底部操作区域 -->
        <div class="modal-footer">
          <a-button @click="categoryMoveModalVisible = false">取消</a-button>
          <a-button
              type="primary"
              :loading="moveConfirmLoading"
              :disabled="selectedDestination === undefined"
              @click="handleMoveConfirm"
          >
            确认移动
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
  watch,
  h,
  nextTick
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  CalendarOutlined,
  BookOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  MoreOutlined,
  TagOutlined,
  SwapOutlined,
  ExportOutlined,
  FolderOutlined,
  FileOutlined,
  BranchesOutlined,
  PartitionOutlined,
  RightOutlined,
  ExpandOutlined,
  CaretDownOutlined,
  SettingOutlined,
  SaveOutlined,
  SortAscendingOutlined,
  RollbackOutlined,
} from '@ant-design/icons-vue';
// 引入 IconFont 组件
import IconFont from '@/components/common/IconFont.vue';
import {Empty, message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getCategoryTreeUsingGet,
  listCategoryByPageUsingGet,
  createCategoryUsingPost,
  updateCategoryUsingPut,
  deleteCategoryUsingDelete,
  batchDeleteCategoriesUsingDelete,
  batchMoveCategoriesUsingPost,
  moveCategoryUsingPost,
  getCategoryStatisticsUsingGet,
  getCategoryByIdUsingGet,
  getCategoryRelatedItemsUsingGet,
} from "@/api/fenleiguanli";
import IconSelector from "@/components/common/IconSelector.vue";
import * as AntIcons from "@ant-design/icons-vue";
import DashboardHeader from "@/components/common/DashboardHeader.vue";
import StatCards from "@/components/common/StatCards.vue";

// 从父组件接收的属性
const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);


// 临时存储选中的图标，确认后才会更新到表单
const tempSelectedIcon = ref('');
const iconSelectorVisible = ref(false);


// 用于控制树的展开/折叠状态
const isTreeCollapsed = ref(true);
const allTreeKeys = ref([]);
const expandedKeys = ref([]);

// 视图模式
const viewMode = ref('list');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 树形视图相关变量
const categoryTreeData = ref([]);
const selectedTreeKeys = ref([]);
const searchTreeValue = ref('');
const selectedCategory = ref(null);
const childCategories = ref([]);

// 其他必要的变量和方法
const categoryModalVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const categoryFormRef = ref(null);

const availableCategoryOptions = ref([]);
const loading = ref(false);
const completeCategories = ref([]);
const selectedDestination = ref(null);

// 统计数据
const statistics = reactive({
  todayCreated: 0,
  totalCategories: 0,
  totalItems: 0,
  topLevelCategories: 0,
  emptyCategoriesCount: 0,
  newCategoriesThisMonth: 0
});

// 移动分类相关变量
const categoryMoveModalVisible = ref(false);
const currentSourceCategory = ref(null);
const batchSourceCategories = ref([]);
const isBatchMove = ref(false);
const moveConfirmLoading = ref(false);

// 表格数据和加载状态
const categoryData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  // 添加下面的页码大小选项配置
  pageSizeOptions: ['10', '20', '50', '100'],
  // 添加onShowSizeChange回调函数
  onShowSizeChange: (current, size) => {
    pagination.current = 1; // 切换每页条数时，重置为第一页
    pagination.pageSize = size;
    fetchCategoryData(); // 重新获取数据
  }
});


// 搜索表单数据
const searchForm = reactive({
  categoryName: '',
  categoryType: undefined,
  createTime: [],
});

// 分类表单
const categoryForm = reactive({
  id: '',
  name: '',
  parentId: null,
  type: '',
  description: '',
  icon: 'AppstoreOutlined',
  sortOrder: 1,
  urlName: '',
});


// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 170,
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    align: 'left',
    width: 180,
  },
  {
    title: '分类类型',
    dataIndex: 'type',
    align: 'center',
    width: 120,
  },
  {
    title: '层级',
    dataIndex: 'level',
    align: 'center',
    width: 100,
  },
  {
    title: '内容数量',
    dataIndex: 'contentCount',
    align: 'center',
    width: 100,
    sorter: true,
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    align: 'center',
    width: 80,
    sorter: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 170,
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 200,
    className: 'action-column',
    fixed: 'right',
  }
];

// 关联内容表格列定义
const relatedItems = ref([
  {
    id: 1,
    type: '文章',
    title: '2025年市场趋势分析报告',
    createTime: new Date(2025, 0, 15).getTime()
  },
  {
    id: 2,
    type: '产品',
    title: '智能家居控制系统',
    createTime: new Date(2025, 0, 18).getTime()
  },
  {
    id: 3,
    type: '文章',
    title: '如何提升团队协作效率',
    createTime: new Date(2025, 0, 22).getTime()
  },
  {
    id: 4,
    type: '媒体',
    title: '新品发布会视频',
    createTime: new Date(2025, 0, 25).getTime()
  },
  {
    id: 5,
    type: '产品',
    title: '移动办公解决方案',
    createTime: new Date(2025, 0, 28).getTime()
  }
]);


// 头部统计指标
const headerMetrics = computed(() => [
  {
    icon: CalendarOutlined,
    label: '今日创建',
    value: statistics.todayCreated || 0
  },
  {
    icon: PartitionOutlined,
    label: '总分类数',
    value: statistics.totalCategories || 0
  },
  {
    icon: LinkOutlined,
    label: '内容总数',
    value: statistics.totalItems || 0
  }
]);

// 顶部卡片数据
const statCards = reactive([
  {
    title: '分类总数',
    value: '0',
    change: 0,
    color: 'purple',
    icon: AppstoreOutlined,
  },
  {
    title: '本月新增',
    value: '0',
    change: 0,
    color: 'blue',
    icon: PlusOutlined,
  },
  {
    title: '顶级分类',
    value: '0',
    change: 0,
    color: 'green',
    icon: PartitionOutlined,
  },
  {
    title: '空分类',
    value: '0',
    change: 0,
    color: 'gold',
    icon: FolderOutlined,
  },
]);


// 主分类类型定义
const categoryTypes = [
  {value: 'animation', text: '动漫类型'},
  {value: 'theme', text: '多样素材'},
  {value: 'learning', text: '技术学习'},
  {value: 'figure', text: '人物样式'},
  {value: 'style', text: '样式风格'},
  {value: 'wallpaper', text: '花样壁纸'}
];


// 分类表单验证规则
const categoryRules = {
  name: [
    {required: true, message: '请输入分类名称', trigger: 'blur'},
    {max: 50, message: '分类名称不能超过50个字符', trigger: 'blur'}
  ],
  type: [
    {required: true, message: '请选择分类类型', trigger: 'change'}
  ],
  icon: [
    {required: true, message: '请选择图标', trigger: 'change'}
  ],
  sortOrder: [
    {required: true, message: '请设置排序优先级', trigger: 'blur'},
    {type: 'number', min: 0, max: 999, message: '排序值必须在0-999之间', trigger: 'blur'}
  ],
  urlName: [
    {
      validator: (_, value) => {
        if (!value || value.trim() === '') {
          return Promise.resolve();
        }
        // 修改别名格式校验，支持大小写字母、数字和连字符
        if (!/^[a-zA-Z0-9-]+$/.test(value)) {
          return Promise.reject('别名只能包含字母、数字和连字符');
        }
        // 唯一性检查
        const isUnique = !categoryData.value.some(item =>
            item.urlName === value && item.id !== categoryForm.id
        );
        return isUnique ? Promise.resolve() : Promise.reject('该别名已被使用，请更换');
      }, trigger: 'blur'
    }
  ]
};


// 获取图标组件
const getIconComponent = (iconName) => {
  // 判断是否为 iconfont 图标
  if (iconName && iconName.startsWith('icon-')) {
    return {
      render() {
        return h(IconFont, {type: iconName, size: 16});
      }
    };
  }

  // 处理 Ant Design 图标
  // 这里需要确保 iconName 是 Ant Design 图标组件的正确名称
  if (iconName && (iconName.endsWith('Outlined') || iconName.endsWith('Filled') || iconName.endsWith('TwoTone'))) {
    const iconComponent = AntIcons[iconName];
    if (iconComponent) {
      return iconComponent;
    }
  }

  // 后备默认图标
  return AntIcons.AppstoreOutlined || AppstoreOutlined;
};

// 获取分类类型名称
const getCategoryTypeName = (type) => {
  // 如果类型为空或未定义，使用默认类型
  if (!type) return '技术学习'; // 默认显示

  const typeMap = {
    'animation': '动漫类型',
    'theme': '多样素材',
    'learning': '技术学习',
    'figure': '人物样式',
    'style': '样式风格',
    'wallpaper': '花样壁纸'
  };
  return typeMap[type] || '未知类型';
};


// 打开图标选择器
const openIconSelector = () => {
  tempSelectedIcon.value = categoryForm.icon; // 初始化为当前选中的图标
  iconSelectorVisible.value = true;
};

// 关闭图标选择器
const closeIconSelector = () => {
  iconSelectorVisible.value = false;
  tempSelectedIcon.value = ''; // 重置临时选择
};


// 选择图标项
const selectIconItem = (iconValue) => {
  tempSelectedIcon.value = iconValue;
  console.log('选中图标:', iconValue); // 调试用
};


// 确认图标选择
const confirmIconSelection = () => {
  if (tempSelectedIcon.value) {
    categoryForm.icon = tempSelectedIcon.value;
    console.log('确认选择图标:', categoryForm.icon); // 调试用
  }
  iconSelectorVisible.value = false;
};

// 监听图标变化以更新预览
watch(() => categoryForm.icon, (newIcon) => {
  if (newIcon) {
    // 可以添加额外的逻辑来更新预览
    console.log('图标已更新:', newIcon);
  }
});

// 获取内容类型对应的颜色
const getContentTypeColor = (type) => {
  const colorMap = {
    '文章': '#1890FF',
    '产品': '#52C41A',
    '媒体': '#FA8C16',
    '图片': '#EB2F96',
    '视频': '#F5222D',
    '音频': '#722ED1',
    '文档': '#2F54EB'
  };
  return colorMap[type] || '#8C8C8C';
};

// 获取分类类型颜色
const getCategoryTypeColor = (type) => {
  const colorMap = {
    'animation': '#FF6B8B',   // 鲜艳的粉红色，适合动漫类型
    'theme': '#4ECDC4',       // 清新的青绿色，适合视觉主题
    'learning': '#4F86F7',    // 明亮的蓝色，代表学习和技术
    'figure': '#FFB347',      // 温暖的橙色，适合人物样式
    'style': '#bf99e3',       // 鲜明的紫色，代表设计风格
    'wallpaper': '#50C878'    // 翠绿色，适合花样壁纸
  };
  return colorMap[type] || '#BFBFBF';  // 默认为灰色
};

// 获取层级文本
const getLevelText = (level) => {
  const levelMap = {
    1: '一级',
    2: '二级',
    3: '三级',
    4: '四级'
  };
  return levelMap[level] || `${level}级`;
};

// 格式化日期时间
const formatDateTime = (timestamp, dateOnly = false) => {
  if (!timestamp) return '未设置';
  return dayjs(timestamp).format(dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

// 搜索处理
const handleSearch = async () => {
  pagination.current = 1; // 重置到第一页
  await fetchCategoryData();
};

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.categoryName = '';
  searchForm.categoryType = undefined;
  searchForm.createTime = [];

  // 重新获取所有数据
  pagination.current = 1;
  fetchCategoryData();

  message.success('搜索条件已重置');
};

// 刷新数据
const handleRefresh = () => {
  fetchCategoryData();
  fetchCategoryStatistics();
  fetchCategoryTree();
  selectedRowKeys.value = [];
  if (viewMode.value === 'tree') {
    selectedTreeKeys.value = [];
    selectedCategory.value = null;
  }
  message.success('数据已刷新');
};

// 刷新树形结构
const refreshTree = () => {
  fetchCategoryTree();
  message.success('分类树已刷新');
};

// 表格选择变化
const onSelectChange = (selected) => {
  selectedRowKeys.value = selected;
};

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  // 处理分页变化
  if (pag.current !== pagination.current || pag.pageSize !== pagination.pageSize) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchCategoryData(); // 重新获取数据
    return; // 分页变化后直接返回，避免重复处理
  }

  // 处理排序（这部分逻辑保持不变）
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    categoryData.value = [...categoryData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }

  // 处理筛选
  if (filters.type && filters.type.length > 0) {
    categoryData.value = categoryData.value.filter(item => filters.type.includes(item.type));
  }

  if (filters.level && filters.level.length > 0) {
    categoryData.value = categoryData.value.filter(item => filters.level.includes(item.level));
  }
};

// 添加默认展开的节点
const defaultExpandedKeys = computed(() => {
  // 默认展开第一级节点
  return categoryTreeData.value
      .filter(item => item.children && item.children.length > 0)
      .map(item => item.key)
      .slice(0, 5); // 只展开前5个以避免过多展开
});

// 父分类选项
const parentCategoryOptions = computed(() => {
  // 首先确保我们有完整的分类数据
  const fetchAllCategoriesIfNeeded = async () => {
    if (completeCategories.value.length === 0) {
      await loadCompleteCategories();
    }
  };

  // 确保在首次渲染时加载完整数据
  if (completeCategories.value.length === 0) {
    fetchAllCategoriesIfNeeded();
  }

  // 使用更完整的数据源
  const dataSource = completeCategories.value.length > 0
      ? completeCategories.value
      : categoryData.value;

  // 构建适用于树选择的数据结构
  const buildTreeData = (data, parentId = null) => {
    const result = [];
    const items = data.filter(item =>
        (parentId === null && (!item.parentId || item.parentId === 0)) ||
        (item.parentId === parentId)
    );

    items.forEach(item => {
      // 避免自己选择自己为父类
      if (isEditing.value && item.id === categoryForm.id) {
        return;
      }

      const node = {
        title: item.name,
        value: item.id,
        key: item.id,
        // 添加图标和类型信息，增强视觉效果
        icon: getIconComponent(item.icon || 'AppstoreOutlined'),
        type: item.type,
        // 添加自定义类，用于样式定制
        className: `category-tree-node type-${item.type || 'default'}`
      };

      const children = buildTreeData(data, item.id);
      if (children.length) {
        node.children = children;
      }

      result.push(node);
    });

    return result;
  };

  return buildTreeData(dataSource);
});

// 获取分类数据
const fetchCategoryData = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.categoryName,
      type: searchForm.categoryType,
      createTimeStart: searchForm.createTime?.[0] ? dayjs(searchForm.createTime[0]).format('YYYY-MM-DD 00:00:00') : undefined,
      createTimeEnd: searchForm.createTime?.[1] ? dayjs(searchForm.createTime[1]).format('YYYY-MM-DD 23:59:59') : undefined,
    };

    // 调用API获取分页数据
    const response = await listCategoryByPageUsingGet(params);

    if (response.data && response.data.code === 200) {
      const result = response.data.data;
      categoryData.value = result.records || [];
      pagination.total = result.total || 0;

      // 获取分类树结构
      await fetchCategoryTree();
    } else {
      throw new Error(response.data?.message || '获取分类数据失败');
    }
  } catch (error) {
    console.error('获取分类数据错误:', error);
    message.error('获取分类数据失败，请稍后重试');
    // 确保即使出错也有一些数据显示
    categoryData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取分类树形结构
const fetchCategoryTree = async () => {
  try {
    const response = await getCategoryTreeUsingGet();

    if (response.data && response.data.code === 200) {
      const treeData = response.data.data || [];
      // 在转换前先检查数据是否包含 contentCount
      const enhancedTreeData = ensureContentCounts(treeData);
      categoryTreeData.value = transformTreeData(enhancedTreeData);

      // 更新所有可能的键，但不自动展开
      allTreeKeys.value = getAllTreeNodeKeys(categoryTreeData.value);

      // 保持折叠状态
      if (isTreeCollapsed.value) {
        expandedKeys.value = []; // 确保折叠状态
      }
    } else {
      // 异常处理：确保即使API出错，视图也不会崩溃
      categoryTreeData.value = [];
      message.warning('获取分类树形结构异常，请刷新重试');
    }
  } catch (error) {
    console.error('获取分类树形结构错误:', error);
    message.error('获取分类树形结构失败，请稍后重试');
    // 确保在出错时也有一个空数组，而不是undefined
    categoryTreeData.value = [];
  }
};

// 确保所有节点都有 contentCount 值
const ensureContentCounts = (treeData) => {
  return treeData.map(item => {
    // 确保当前节点有 contentCount
    const enhancedItem = {
      ...item,
      contentCount: item.contentCount !== undefined ? item.contentCount : 0
    };
    // 递归处理子节点
    if (item.children && item.children.length > 0) {
      enhancedItem.children = ensureContentCounts(item.children);
    }

    return enhancedItem;
  });
};

// 将后端返回的树形数据转换为前端树组件所需格式
const transformTreeData = (data) => {
  return data.map(item => {
    const node = {
      title: item.name,
      key: item.id,
      type: item.type,
      icon: item.icon || 'AppstoreOutlined',
      contentCount: item.contentCount || 0,
      dataRef: {
        ...item,  // 复制所有原始数据
        contentCount: item.contentCount || 0
      }
    };

    // 递归处理子节点
    if (item.children && item.children.length > 0) {
      node.children = transformTreeData(item.children);
    }

    return node;
  });
};

// 获取统计数据
const fetchCategoryStatistics = async () => {
  try {
    const response = await getCategoryStatisticsUsingGet();

    if (response.data && response.data.code === 200) {
      const stats = response.data.data;

      // 更新统计数据对象，一次性更新所有值
      Object.assign(statistics, {
        todayCreated: stats.newCategoriesOfToday || 0,  // 修改为使用正确的API字段
        totalCategories: stats.totalCategories || 0,
        totalItems: stats.mostContentsCount || 0,
        topLevelCategories: stats.topLevelCategories || 0,
        emptyCategoriesCount: stats.disabledCategories || 0,  // 如API没提供，使用可能相关的字段
        newCategoriesThisMonth: stats.newCategoriesOfMonth || 0  // 修改为使用正确的API字段
      });

      // 更新卡片统计数据
      statCards[0].value = stats.totalCategories?.toString() || '0';
      statCards[0].change = stats.categoryGrowthRate || 0;

      statCards[1].value = stats.newCategoriesOfMonth?.toString() || '0';  // 修改为使用正确的API字段
      statCards[1].change = stats.categoryGrowthRate || 0;

      statCards[2].value = stats.topLevelCategories?.toString() || '0';
      statCards[2].change = stats.categoryGrowthRate || 0;

      // 如果API没有提供空分类数，可以计算或使用相关数据
      statCards[3].value = (stats.totalCategories - stats.activeCategories)?.toString() || '0';
      statCards[3].change = 0;  // 如果没有增长率数据，默认为0
    } else {
      // 处理异常情况，使用默认值
      Object.assign(statistics, {
        todayCreated: 0,
        totalCategories: 0,
        totalItems: 0,
        topLevelCategories: 0,
        emptyCategoriesCount: 0,
        newCategoriesThisMonth: 0
      });
    }
  } catch (error) {
    console.error('获取分类统计数据错误:', error);
    message.error('获取统计数据失败，请稍后重试');
  }
};

// 树搜索处理函数
const handleTreeSearch = () => {
  if (!searchTreeValue.value) {
    // 如果搜索框清空，恢复完整树
    fetchCategoryTree();
    return;
  }

  const keyword = searchTreeValue.value.toLowerCase();

  // 递归搜索匹配的节点
  const filterTree = (nodes) => {
    return nodes.filter(node => {
      const matched = node.title.toLowerCase().includes(keyword);
      let childrenMatched = false;

      if (node.children && node.children.length > 0) {
        const filteredChildren = filterTree(node.children);
        childrenMatched = filteredChildren.length > 0;

        if (childrenMatched) {
          node.children = filteredChildren;
        }
      }

      return matched || childrenMatched;
    });
  };

  // 应用筛选 - 确保使用深拷贝避免修改原始数据
  const clonedTreeData = JSON.parse(JSON.stringify(categoryTreeData.value));
  categoryTreeData.value = filterTree(clonedTreeData);

  // 如果过滤后没有结果，显示提示
  if (categoryTreeData.value.length === 0) {
    message.info(`没有找到包含 "${searchTreeValue.value}" 的分类`);
  }
};

// 树节点选择处理
const onTreeSelect = async (selectedKeys, info) => {
  if (selectedKeys.length === 0) {
    selectedCategory.value = null;
    childCategories.value = [];
    return;
  }

  selectedTreeKeys.value = selectedKeys;
  const categoryId = selectedKeys[0];

  // 直接加载详情，不使用缓存
  loading.value = true;
  try {
    const response = await getCategoryByIdUsingGet({id: categoryId});
    if (response.data && response.data.code === 200) {
      selectedCategory.value = response.data.data;
      // 获取关联内容和子分类
      await fetchRelatedItems(categoryId);
      await fetchCategoryChildren(categoryId);
    } else {
      throw new Error(response.data?.message || '获取分类详情失败');
    }
  } catch (error) {
    console.error('获取分类详情错误:', error);
    message.error('获取分类详情失败');
    selectedCategory.value = {
      id: categoryId,
      name: '数据加载失败',
      type: 'learning',
      description: '请尝试刷新或选择其他分类'
    };
  } finally {
    loading.value = false;
  }
};

// 获取分类子分类数据
const fetchCategoryChildren = async (categoryId) => {
  try {
    const response = await listCategoryByPageUsingGet({
      parentId: categoryId,
      pageNum: 1,
      pageSize: 100 // 获取足够的子分类以计算正确的总数
    });

    if (response.data && response.data.code === 200) {
      // 更新子分类列表
      childCategories.value = response.data.data.records || [];

      // 关键修复：基于实际返回的子分类数量更新统计数字
      if (selectedCategory.value && selectedCategory.value.id === categoryId) {
        // 更新子分类计数
        selectedCategory.value.childCount = childCategories.value.length;

        // 同时更新顶部统计区域的数字
        // 假设统计区域是通过一个响应式变量更新的
        const childrenCount = childCategories.value.length;

        // 更新顶部统计区域的"子分类数量"值
        // 这里根据实际UI组件的绑定变量名可能需要调整
        statistics.currentChildrenCount = childrenCount;
      }
    } else {
      childCategories.value = [];
      if (selectedCategory.value) {
        selectedCategory.value.childCount = 0;
      }
    }
  } catch (error) {
    console.error('获取子分类错误:', error);
    childCategories.value = [];
    if (selectedCategory.value) {
      selectedCategory.value.childCount = 0;
    }
  }
};

const expandCategoryList = (expanded) => {
  if (expanded && selectedCategory.value) {
    // 当展开子分类列表时，强制刷新子分类数量
    fetchCategoryChildren(selectedCategory.value.id);
  }
};

// 打开创建分类模态框
const openCreateModal = () => {
  // 重置表单为默认值
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = '';
  });

  // 设置默认值
  categoryForm.type = 'learning';
  categoryForm.sortOrder = 100;
  categoryForm.icon = '';

  // 标记为创建模式
  isEditing.value = false;

  // 显示模态框
  categoryModalVisible.value = true;
};

// 编辑分类
const editCategory = async (id) => {
  try {
    // 从API获取最新数据
    const response = await getCategoryByIdUsingGet({id});
    if (response.data && response.data.code === 200) {
      const category = response.data.data;

      // 复制分类数据到编辑表单
      Object.keys(categoryForm).forEach(key => {
        if (key in category) {
          categoryForm[key] = category[key];
        }
      });

      isEditing.value = true;
      categoryModalVisible.value = true;
    } else {
      message.error('获取分类信息失败');
    }
  } catch (error) {
    console.error('获取分类信息错误:', error);
    message.error('加载分类信息失败，请稍后重试');
  }
};

// 查看分类详情
const viewCategory = async (record) => {
  try {
    // 切换到树形视图
    viewMode.value = 'tree';

    // 设置加载状态
    loading.value = true;

    // 直接从API获取最新数据
    const response = await getCategoryByIdUsingGet({id: record.id});
    if (response.data && response.data.code === 200) {
      // 设置选中的节点和展开视图
      selectedTreeKeys.value = [record.id];
      selectedCategory.value = response.data.data;

      // 展开到该节点
      expandToNode(record.id);

      // 获取关联内容
      await fetchRelatedItems(record.id);

      // 获取子分类
      await fetchCategoryChildren(record.id);
    } else {
      throw new Error(response.data?.message || '获取分类详情失败');
    }
  } catch (error) {
    console.error('获取分类详情错误:', error);
    message.error('获取分类详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取分类关联的内容
const fetchRelatedItems = async (categoryId) => {
  try {
    // 调用API获取关联内容
    const response = await getCategoryRelatedItemsUsingGet({
      categoryId,
      pageNum: 1,
      pageSize: 5
    });

    if (response.data && response.data.code === 200) {
      relatedItems.value = response.data.data.records || [];
    } else {
      // 如果API返回错误，使用空数组
      relatedItems.value = [];
    }
  } catch (error) {
    console.error('获取关联内容错误:', error);
    // 出错时使用空数组，确保UI不会崩溃
    relatedItems.value = [];
  }
};

// 添加子分类
const addChildCategory = async (parentId) => {
  // 重置表单
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = key === 'type' ? 'learning' :
        key === 'sortOrder' ? 100 :
            key === 'showInMenu' ? true :
                key === 'icon' ? 'AppstoreOutlined' : '';
  });

  // 设置父分类ID
  categoryForm.parentId = parentId;

  // 获取父分类详情以设置一致的类型
  try {
    const response = await getCategoryByIdUsingGet({id: parentId});
    if (response.data && response.data.code === 200) {
      const parentCategory = response.data.data;
      categoryForm.type = parentCategory.type;
    }
  } catch (error) {
    console.error('获取父分类详情错误:', error);
    // 如果获取失败，使用默认类型
    categoryForm.type = 'learning';
  }

  isEditing.value = false;
  categoryModalVisible.value = true;
};

// 处理取消按钮
const handleCancel = () => {
  // 重置表单
  categoryFormRef.value && categoryFormRef.value.resetFields();
  // 关闭模态框
  categoryModalVisible.value = false;
};

// 类型变更处理函数
const handleTypeChange = (value) => {
  categoryForm.type = value;
  // 确保预览区域立即更新
  nextTick(() => {
    // 更新预览区域颜色和图标
    const previewIcon = document.querySelector('.preview-icon');
    if (previewIcon) {
      previewIcon.style.backgroundColor = getCategoryTypeColor(value) + '15';
    }

    const iconComponent = document.querySelector('.preview-icon .anticon');
    if (iconComponent) {
      iconComponent.style.color = getCategoryTypeColor(value);
    }

    // 更新标签颜色
    const tag = document.querySelector('.preview-meta .ant-tag');
    if (tag) {
      tag.style.backgroundColor = getCategoryTypeColor(value);
      tag.style.borderColor = getCategoryTypeColor(value);
    }
  });
};

// 初始化表单时设置默认值
const initCategoryForm = () => {
  // 如果是新建分类，设置默认值
  if (!isEditing.value) {
    categoryForm.type = 'learning';  // 默认类型为"技术学习"
    categoryForm.sortOrder = 100;
    categoryForm.icon = 'AppstoreOutlined';
  }
};

// 处理分类提交
const handleCategorySubmit = () => {
  categoryFormRef.value.validate()
      .then(async () => {
        submitLoading.value = true;
        try {
          const formData = {...categoryForm};

          if (!formData.urlName || formData.urlName.trim() === '') {
            // 使用分类名称+时间戳作为默认别名
            formData.urlName = `${formData.name}-${Date.now()}`;
          }

          let savedCategoryId; // 存储保存后的分类ID

          if (isEditing.value) {
            // 更新分类
            const params = {
              id: formData.id,
              name: formData.name,
              description: formData.description,
              icon: formData.icon,
              urlName: formData.urlName, // 字段名称映射
              sortOrder: formData.sortOrder, // 字段名称映射
              status: formData.status
            };

            const response = await updateCategoryUsingPut(params);

            if (response.data && response.data.code === 200) {
              message.success('分类信息已更新');
              savedCategoryId = formData.id; // 使用当前编辑的ID
              categoryModalVisible.value = false;
              await fetchCategoryData(); // 刷新数据

              // 在更新后自动选中并显示该分类详情
              await selectCategoryAfterSave(savedCategoryId);
            } else {
              message.error('更新分类失败: ' + (response.data?.message || '未知错误'));
            }
          } else {
            // 创建分类
            const params = {
              name: formData.name,
              parentId: formData.parentId,
              type: formData.type,
              description: formData.description,
              icon: formData.icon,
              urlName: formData.urlName,
              sortOrder: formData.sortOrder,
              status: formData.status
            };

            const response = await createCategoryUsingPost(params);

            if (response.data && response.data.code === 200) {
              message.success('分类创建成功');
              savedCategoryId = response.data.data.id; // 从响应中获取新创建的ID
              categoryModalVisible.value = false;
              await fetchCategoryData(); // 刷新数据

              // 在创建后自动选中并显示该分类详情
              await selectCategoryAfterSave(savedCategoryId);
            } else {
              message.error('创建分类失败: ' + (response.data?.message || '未知错误'));
            }
          }
        } catch (error) {
          console.error('提交分类数据错误:', error);
          message.error('操作失败，请稍后重试');
        } finally {
          submitLoading.value = false;
        }
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};

// 增强的父分类选项，添加样式和类型信息
const enhancedParentCategoryOptions = computed(() => {
  const processNode = (node) => {
    // 确保节点有类型属性
    const nodeType = node.type || 'default';

    // 创建新节点对象，复制原有属性
    const enhancedNode = {
      ...node,
      type: nodeType,
      className: `category-tree-node type-${nodeType}`,
      // 递归处理子节点
      children: node.children ? node.children.map(childNode => processNode(childNode)) : []
    };

    return enhancedNode;
  };

  // 处理所有顶级节点
  return parentCategoryOptions.value.map(node => processNode(node));
});

// 保存后根据视图模式决定是否显示详情
const selectCategoryAfterSave = async (categoryId) => {
  if (!categoryId) return;

  try {
    // 判断当前视图模式
    if (viewMode.value === 'tree') {
      // 只有在树形视图模式下才进行详情跳转和选中状态设置

      // 1. 展开到对应节点
      expandToNode(categoryId);

      // 2. 设置树形视图选中状态
      selectedTreeKeys.value = [categoryId];

      // 3. 确保树节点展开
      const parentCategory = findParentCategory(categoryId);
      if (parentCategory) {
        expandedKeys.value = Array.from(
            new Set([...expandedKeys.value, parentCategory.id])
        );
      }

      // 4. 获取并加载详情数据
      const response = await getCategoryByIdUsingGet({id: categoryId});
      if (response.data && response.data.code === 200) {
        selectedCategory.value = response.data.data;

        // 5. 获取关联内容
        await fetchRelatedItems(categoryId);

        // 6. 获取子分类
        await fetchCategoryChildren(categoryId);
      } else {
        throw new Error(response.data?.message || '获取分类详情失败');
      }
    } else {
      // 如果需要确保该项在当前页面显示，但不选中它
      const index = categoryData.value.findIndex(item => item.id === categoryId);
      if (index >= 0) {
        const pageNum = Math.floor(index / pagination.pageSize) + 1;
        if (pagination.current !== pageNum) {
          pagination.current = pageNum;
          // 注意：这里我们需要再次刷新数据以显示正确的页面
          await fetchCategoryData();
          // 不再重新设置选中状态
        }
      }
    }
  } catch (error) {
    console.error('选中分类失败:', error);
    message.error('加载分类详情失败');
    // 出错时重置选中状态
    if (viewMode.value === 'tree') {
      selectedCategory.value = null;
      selectedTreeKeys.value = [];
    }
  }
};

// 辅助函数：查找父分类
const findParentCategory = (categoryId) => {
  // 直接从原始数据查找
  const category = categoryData.value.find(item => item.id === categoryId);
  if (category && category.parentId) {
    return categoryData.value.find(item => item.id === category.parentId);
  }
  return null;
};

// 辅助函数：展开到指定节点
const expandToNode = (categoryId) => {
  const category = categoryData.value.find(item => item.id === categoryId);
  if (!category) return;

  // 收集所有父节点ID
  const parentIds = [];
  let currentParentId = category.parentId;

  while (currentParentId) {
    parentIds.push(currentParentId);
    const parentCategory = categoryData.value.find(item => item.id === currentParentId);
    currentParentId = parentCategory ? parentCategory.parentId : null;
  }

  // 更新展开的键
  if (parentIds.length > 0) {
    expandedKeys.value = Array.from(
        new Set([...expandedKeys.value, ...parentIds])
    );
  }
};

const getParentName = (parentId) => {
  if (!parentId) return '顶级分类';

  if (!categoryData.value || categoryData.value.length === 0) return '加载中...';

  const parent = categoryData.value.find(item => item.id === parentId);
  return parent ? parent.name : '未知分类';
};

// 显示删除确认对话框
const showDeleteConfirm = async (id) => {
  // 直接从API获取最新数据
  try {
    const response = await getCategoryByIdUsingGet({id});
    if (response.data && response.data.code === 200) {
      const category = response.data.data;

      // 检查是否有子分类
      const hasChildren = category.childCount > 0 || childCategories.value.length > 0 ||
          categoryData.value.some(item => item.parentId === id);

      // 检查是否有关联内容
      const hasContents = category.contentCount > 0;

      const modal = Modal;

      let confirmContent = '删除后将无法恢复，请谨慎操作。';
      if (hasChildren) {
        confirmContent = '该分类下包含子分类，删除后所有子分类将一并删除，且无法恢复，请谨慎操作。';
      }
      if (hasContents) {
        confirmContent += `\n该分类下有${category.contentCount}个关联内容，删除分类后内容不会被删除，但会失去分类关联。`;
      }

      modal.confirm({
        title: '确定要删除此分类吗?',
        content: confirmContent,
        okText: '确定删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          deleteCategory(id);
        }
      });
    } else {
      message.error('获取分类信息失败');
    }
  } catch (error) {
    console.error('获取分类信息错误:', error);
    message.error('无法获取分类信息');
  }
};

// 删除分类
const deleteCategory = async (id) => {
  loading.value = true;
  try {
    const response = await deleteCategoryUsingDelete({id});

    if (response.data && response.data.code === 200) {
      // 从当前列表中移除被删除的分类
      if (selectedCategory.value && selectedCategory.value.id === id) {
        selectedCategory.value = null;
        selectedTreeKeys.value = [];
      }

      // 清除已选择的行，如果该行在选中行中
      if (selectedRowKeys.value.includes(id)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id);
      }

      message.success('分类已删除');

      // 重新获取数据
      await fetchCategoryData();

      // 重新获取统计数据
      await fetchCategoryStatistics();

      // 如果在树视图中，需要刷新树
      if (viewMode.value === 'tree') {
        await fetchCategoryTree();
      }
    } else {
      message.error('删除分类失败: ' + (response.data?.message || '未知错误'));
    }
  } catch (error) {
    console.error('删除分类错误:', error);
    message.error('删除分类失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 批量删除分类
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的分类');
    return;
  }

  // 检查是否有子分类和关联内容
  // 通过API获取所选分类的详细信息
  try {
    const promises = selectedRowKeys.value.map(id => getCategoryByIdUsingGet({id}));
    const responses = await Promise.allSettled(promises);

    // 提取成功获取的分类数据
    const selectedCategories = responses
        .filter(result => result.status === 'fulfilled' && result.value.data && result.value.data.code === 200)
        .map(result => result.value.data.data);

    // 检查子分类和内容情况
    const hasChildren = selectedCategories.some(category =>
        category.childCount > 0 || categoryData.value.some(item => item.parentId === category.id)
    );

    const totalContents = selectedCategories.reduce((sum, category) => sum + (category.contentCount || 0), 0);

    const modal = Modal;

    let confirmContent = `确定要删除选中的 ${selectedRowKeys.value.length} 个分类吗？删除后将无法恢复。`;
    if (hasChildren) {
      confirmContent += '\n\n所选分类中有包含子分类的项，删除后所有子分类将一并删除。';
    }
    if (totalContents > 0) {
      confirmContent += `\n\n所选分类关联了共计 ${totalContents} 个内容项，删除分类后内容不会被删除，但会失去分类关联。`;
    }

    modal.confirm({
      title: '批量删除分类',
      content: confirmContent,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        loading.value = true;
        try {
          const response = await batchDeleteCategoriesUsingDelete({
            ids: selectedRowKeys.value
          });

          if (response.data && response.data.code === 200) {
            selectedRowKeys.value = [];
            selectedTreeKeys.value = [];
            selectedCategory.value = null;

            message.success('已批量删除分类');

            // 重新获取数据
            await fetchCategoryData();

            // 刷新统计数据
            await fetchCategoryStatistics();

            // 如果在树视图中，需要刷新树
            if (viewMode.value === 'tree') {
              await fetchCategoryTree();
            }
          } else {
            message.error('批量删除分类失败: ' + (response.data?.message || '未知错误'));
          }
        } catch (error) {
          console.error('批量删除分类错误:', error);
          message.error('批量删除分类失败，请稍后重试');
        } finally {
          loading.value = false;
        }
      }
    });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    message.error('获取分类信息失败，请稍后重试');
  }
};

// 批量导出分类
const handleBatchExport = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的分类');
    return;
  }

  // 这里可以实现实际的导出逻辑，目前只是显示一个消息提示
  message.loading('正在准备导出数据...', 2)
      .then(() => message.success('导出成功，文件已保存到下载中心'));
};

// 获取完整的分类数据
const loadCompleteCategories = async () => {
  try {
    // 使用默认参数获取所有分类数据
    const response = await listCategoryByPageUsingGet({
      pageNum: 1,
      pageSize: 90, // 使用较大的数值确保获取所有数据
      // 不传递任何搜索条件
    });

    if (response.data && response.data.code === 200) {
      // 存储完整的分类数据到临时变量（不影响当前列表显示）
      completeCategories.value = response.data.data.records || [];
    } else {
      throw new Error(response.data?.message || '获取分类数据失败');
    }
  } catch (error) {
    console.error('获取完整分类数据错误:', error);
    message.error('获取分类数据失败');
    completeCategories.value = []; // 出错时重置为空数组
  }
};

// 加载可用的目标分类
const loadAvailableCategories = async (sourceId) => {
  if (!sourceId) return;

  try {
    // 防止重复加载
    if (completeCategories.value.length === 0) {
      await loadCompleteCategories();
    }

    // 排除当前分类及其所有子分类
    const excludeIds = getAllChildIds(sourceId, completeCategories.value);

    // 从完整数据中过滤可选目标
    availableCategoryOptions.value = flattenCategoryTree(completeCategories.value)
        .filter(item => !excludeIds.includes(item.id))
        .map(item => ({
          ...item,
          level: getCategoryLevel(item, completeCategories.value)
        }));
  } catch (error) {
    console.error('加载可用分类数据错误:', error);
    message.error('加载可用分类数据失败');
    availableCategoryOptions.value = [];
  }
};

// 获取分类的所有子ID（递归）
const getAllChildIds = (categoryId, categoriesSource) => {
  const result = [categoryId];

  // 使用提供的数据源查找子分类
  categoriesSource.forEach(item => {
    if (item.parentId === categoryId) {
      result.push(...getAllChildIds(item.id, categoriesSource));
    }
  });

  return result;
};

// 将树形结构扁平化并保留层级信息
const flattenCategoryTree = (categories, parentId = null, level = 0) => {
  let result = [];

  // 找出当前层级的分类
  const currentLevelCategories = categories.filter(item =>
      (parentId === null && (!item.parentId || item.parentId === 0)) ||
      (item.parentId === parentId)
  );

  // 处理每个分类及其子分类
  currentLevelCategories.forEach(category => {
    // 添加当前分类（带有层级信息）
    result.push({...category, level});

    // 递归处理子分类
    const children = flattenCategoryTree(categories, category.id, level + 1);
    result = [...result, ...children];
  });

  return result;
};

// 获取分类在树中的层级
const getCategoryLevel = (category, categoriesSource, level = 0) => {
  if (!category.parentId) return level;

  const parentCategory = categoriesSource.find(c => c.id === category.parentId);
  if (!parentCategory) return level;

  return getCategoryLevel(parentCategory, categoriesSource, level + 1);
};

// 获取分类路径文本
const getCategoryPath = (category) => {
  if (!category) return '';
  if (!category.parentId) return '顶级分类';

  // 确定使用哪个数据源
  const dataSource = completeCategories.value.length > 0
      ? completeCategories.value
      : categoryData.value;

  // 构建从根到当前的路径
  const buildPath = (categoryId) => {
    if (!categoryId) return [];

    const currentCategory = dataSource.find(c => c.id === categoryId);
    if (!currentCategory) return [];

    if (!currentCategory.parentId) {
      return [currentCategory.name];
    }

    return [...buildPath(currentCategory.parentId), currentCategory.name];
  };

  const path = buildPath(category.parentId);
  return path.join(' > ');
};

// 添加移动单个分类的函数
const moveCategory = async (record) => {
  try {
    // 设置源分类信息 - 确保获取最新数据
    const response = await getCategoryByIdUsingGet({id: record.id});
    if (response.data && response.data.code === 200) {
      const sourceCategory = response.data.data;

      // 加载可用的目标分类（排除自身及其子分类）
      await loadAvailableCategories(sourceCategory.id);

      // 打开移动模态框
      showCategoryMoveModal(sourceCategory);
    } else {
      message.error('获取分类信息失败');
    }
  } catch (error) {
    console.error('获取分类信息错误:', error);
    message.error('加载分类信息失败，请稍后重试');
  }
};

// 批量移动分类
const handleBatchMove = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要移动的分类');
    return;
  }

  // 获取所选分类详情
  const selectedCategories = categoryData.value.filter(item =>
      selectedRowKeys.value.includes(item.id)
  );

  // 确保所有选中的分类都存在
  if (selectedCategories.length !== selectedRowKeys.value.length) {
    message.error('部分选中的分类信息不完整，请刷新后重试');
    return;
  }

  // 获取所有ID，用于排除不可选的目标
  const allSelectedIds = selectedRowKeys.value;

  // 加载可用的目标分类（排除所有选中的分类及其子分类）
  await loadAllAvailableCategories(allSelectedIds);

  // 打开批量移动模态框
  showBatchMoveModal(selectedCategories);
};

// 更新加载所有可用分类的函数（排除多个源分类）
const loadAllAvailableCategories = async (sourceIds) => {
  try {
    if (completeCategories.value.length === 0) {
      await loadCompleteCategories();
    }

    // 收集所有需要排除的ID（包括选中的分类及其所有子分类）
    let excludeIds = [];
    sourceIds.forEach(id => {
      excludeIds = [...excludeIds, ...getAllChildIds(id, completeCategories.value)];
    });

    // 从完整数据中过滤可选目标
    availableCategoryOptions.value = flattenCategoryTree(completeCategories.value)
        .filter(item => !excludeIds.includes(item.id))
        .map(item => ({
          ...item,
          level: getCategoryLevel(item, completeCategories.value)
        }));
  } catch (error) {
    console.error('加载可用分类数据错误:', error);
    message.error('加载可用分类数据失败');
    availableCategoryOptions.value = [];
  }
};

// 显示分类移动模态框
const showCategoryMoveModal = (sourceCategory) => {
  // 设置源分类
  currentSourceCategory.value = sourceCategory;

  // 初始化选中的目标分类
  selectedDestination.value = null;

  // 设置是否为批量操作
  isBatchMove.value = false;

  // 打开模态框
  categoryMoveModalVisible.value = true;
};

// 显示批量移动模态框
const showBatchMoveModal = (sourceCategories) => {
  // 设置多个源分类
  batchSourceCategories.value = sourceCategories;

  // 初始化选中的目标分类
  selectedDestination.value = null;

  // 设置为批量操作
  isBatchMove.value = true;

  // 打开模态框
  categoryMoveModalVisible.value = true;
};

// 处理移动确认
const handleMoveConfirm = async () => {
  if (selectedDestination.value === undefined && selectedDestination.value !== 0) {
    message.warning('请选择目标分类');
    return;
  }

  moveConfirmLoading.value = true;

  try {
    let response;

    if (isBatchMove.value) {
      // 批量移动 - 根据实际API要求调整参数名
      response = await batchMoveCategoriesUsingPost({
        ids: selectedRowKeys.value,  // 假设后端期望是ids而不是categoryIds
        parentId: selectedDestination.value === 0 ? null : selectedDestination.value  // 假设后端期望是parentId而不是targetParentId
      });
    } else {
      // 单个移动
      response = await moveCategoryUsingPost({
        id: currentSourceCategory.value.id,  // 修改为id
        parentId: selectedDestination.value === 0 ? null : selectedDestination.value  // 修改为parentId
      });
    }

    if (response.data && response.data.code === 200) {
      message.success(isBatchMove.value ? '批量移动分类成功' : '分类移动成功');
      categoryMoveModalVisible.value = false;

      // 重新获取数据
      await fetchCategoryData();

      // 刷新统计数据
      await fetchCategoryStatistics();

      // 刷新树形结构
      if (viewMode.value === 'tree') {
        await fetchCategoryTree();
      }

      // 清除选中状态
      if (isBatchMove.value) {
        selectedRowKeys.value = [];
      }
    } else {
      message.error((isBatchMove.value ? '批量移动' : '移动') + '分类失败: ' +
          (response.data?.message || '未知错误'));
    }
  } catch (error) {
    console.error('移动分类错误:', error);
    message.error('移动分类失败，请稍后重试');
  } finally {
    moveConfirmLoading.value = false;
  }
};

// 将扁平的类别选项转换为树形结构
const formattedTreeData = computed(() => {
  // 构建适用于树选择的数据结构
  const buildTreeData = (data, parentId = null, level = 0) => {
    const result = [];
    const items = data.filter(item =>
        (parentId === null && (!item.parentId || item.parentId === 0)) ||
        (item.parentId === parentId)
    );

    items.forEach(item => {
      const node = {
        title: item.name,
        key: item.id,
        icon: getIconComponent(item.icon || 'AppstoreOutlined'),
        type: item.type,
        level,
        dataRef: item,
      };

      const children = buildTreeData(availableCategoryOptions.value, item.id, level + 1);
      if (children.length) {
        node.children = children;
      }

      result.push(node);
    });

    return result;
  };

  return buildTreeData(availableCategoryOptions.value);
});

// 默认展开第一级节点
const defaultTreeExpandedKeys = computed(() => {
  // 获取所有顶级节点的ID
  return availableCategoryOptions.value
      .filter(item => !item.parentId || item.parentId === 0)
      .map(item => item.id);
});

// 处理树节点选择
const onDestinationSelect = (selectedKeys) => {
  if (selectedKeys && selectedKeys.length > 0) {
    selectedDestination.value = selectedKeys[0];
  } else {
    selectedDestination.value = null;
  }
};

// 添加展开/折叠切换方法
const toggleTreeExpand = () => {
  if (isTreeCollapsed.value) {
    // 展开全部
    const allKeys = getAllTreeNodeKeys(categoryTreeData.value);
    allTreeKeys.value = allKeys;
    expandedKeys.value = [...allKeys];
  } else {
    // 折叠全部
    expandedKeys.value = [];
  }
  isTreeCollapsed.value = !isTreeCollapsed.value;
};

// 展开事件处理函数
const onTreeExpand = (keys) => {
  expandedKeys.value = keys;
  // 根据展开状态更新折叠标志
  isTreeCollapsed.value = keys.length === 0 ||
      (allTreeKeys.value.length > 0 && keys.length < allTreeKeys.value.length);
};

// 获取所有树节点的 key
const getAllTreeNodeKeys = (treeNodes) => {
  let keys = [];

  const collect = (nodes) => {
    if (!nodes || !nodes.length) return;

    nodes.forEach(node => {
      if (node.key) {
        keys.push(node.key);
      }

      if (node.children && node.children.length) {
        collect(node.children);
      }
    });
  };

  collect(treeNodes);
  return keys;
};

// 监听树展开状态
watch(defaultExpandedKeys, (newKeys) => {
  // 根据展开的key数量判断当前状态
  isTreeCollapsed.value = newKeys.length === 0 ||
      (allTreeKeys.value.length > 0 && newKeys.length < allTreeKeys.value.length);
}, {deep: true});

// 组件挂载时获取数据
onMounted(() => {
  // 初始时清除选中状态
  selectedDestination.value = undefined;
  // 获取列表数据
  fetchCategoryData();
  // 获取统计数据
  fetchCategoryStatistics();

  // 初始化为折叠状态
  expandedKeys.value = []; // 设置为空数组，表示没有展开的节点
  isTreeCollapsed.value = true; // 设置折叠状态标志为true

  if (viewMode.value === 'tree') {
    // 初始化树形视图相关数据
    expandedKeys.value = [];
    isTreeCollapsed.value = true;
  }

  // 如果未设置类型，设置默认类型
  if (!categoryForm.type) {
    categoryForm.type = 'learning'; // 设置默认类型
  }

  // 监听表单类型变化
  watch(() => categoryForm.type, (newType) => {
    if (newType) {
      handleTypeChange(newType);
    }
  });

  // 监听图标变化
  watch(() => categoryForm.icon, () => {
    nextTick(() => {
      const iconComponent = document.querySelector('.preview-icon .anticon');
      if (iconComponent && categoryForm.type) {
        iconComponent.style.color = getCategoryTypeColor(categoryForm.type);
      }
    });
  });

  // 初始化表单
  initCategoryForm();
});
</script>

<style scoped>

/* 全局容器样式 */
.category-management-container {
  padding: 24px;
  background-color: #f5f7fa;
}

/* 搜索表单样式 */
.search-form-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
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
  align-items: flex-start;
  width: 100%;
  padding: 12px 0;
}

.search-form-items .ant-form-item,
.search-buttons {
  margin-bottom: 16px !important;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  height: 32px;
  align-self: flex-end;
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
  padding: 16px 20px;
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.operation-left {
  display: flex;
  align-items: center;
}

.operation-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* 新的树形视图样式 */
.tree-view-container {
  margin-bottom: 24px;
}

.tree-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
}

.tree-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-card-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #262626;
}

.tree-icon {
  color: #6554C0;
  font-size: 18px;
  margin-right: 8px;
}

.tree-actions {
  display: flex;
  gap: 4px;
}

.tree-search-wrapper {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-search {
  border-radius: 8px;
}

.tree-content {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 8px 16px;
  flex: 1;
}

.tree-content::-webkit-scrollbar {
  width: 4px;
}

.tree-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #d5d5d5;
  border-radius: 4px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #b5b5b5;
}

.tree-footer {
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

/* 自定义树节点样式 */
.tree-node-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 6px 0;
}

.tree-node-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.tree-node-icon {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-right: 8px;
  flex-shrink: 0;
}

.tree-node-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
}

.tree-node-counter {
  font-size: 12px;
  font-weight: 500;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  border-radius: 10px;
  flex-shrink: 0;
}

.tree-node-actions {
  visibility: hidden;
  transition: visibility 0.2s, opacity 0.2s;
  opacity: 0;
}

.tree-node-wrapper:hover .tree-node-actions {
  visibility: visible;
  opacity: 1;
}

.tree-node-action-btn {
  color: #8c8c8c;
}

.tree-node-action-btn:hover {
  color: #6554C0;
  background-color: rgba(101, 84, 192, 0.08);
}

.tree-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 16px;
}

/* 详情面板样式 */
.category-detail-panel {
  height: 100%;
}

.detail-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  display: flex;
  flex-direction: column;
}

.detail-panel-header {
  padding: 24px;
  display: flex;
  align-items: center;
  position: relative;
}

.detail-panel-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.detail-panel-title {
  flex: 1;
}

.detail-panel-title h2 {
  font-size: 22px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.detail-panel-subtitle {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-panel-path {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #8c8c8c;
}

.detail-panel-path .anticon {
  margin-right: 6px;
}

.detail-panel-content {
  padding: 0 24px 24px;
  overflow: auto;
  flex: 1;
}

.detail-panel-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px; /* 增加与上方内容的间距 */
  margin-bottom: 24px;
}

.category-detail-card {
  position: relative;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9ff 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  border: 1px solid rgba(101, 84, 192, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-metric-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  height: 90px; /* 统一卡片高度，确保时间显示不会影响卡片布局 */
}

.detail-metric-value {
  font-size: 16px; /* 稍微调小字体，确保长内容不会换行 */
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  white-space: nowrap; /* 防止内容换行 */
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  font-size: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.detail-metric-info {
  flex: 1;
}

.detail-metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.detail-metric-label {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-panel-info {
  margin-bottom: 24px;
}

.detail-collapse {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-collapse-header) {
  font-weight: 500;
  color: #262626 !important;
  background-color: #f9fafb;
}

.level-indicator {
  display: flex;
  align-items: center;
}

.level-dot {
  width: 8px;
  height: 8px;
  background-color: #6554C0;
  border-radius: 50%;
  margin-right: 4px;
}

.description-content {
  padding: 8px 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #595959;
  white-space: pre-wrap;
}

.related-items-container,
.children-categories-container {
  padding: 12px 0;
}

.related-items-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.content-item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.content-item-time {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
}

.content-item-time .anticon {
  margin-right: 4px;
}

.child-category-card {
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.child-category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(101, 84, 192, 0.12);
  border-color: #d9d3f3;
}

.child-category-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  font-size: 16px;
}

.child-category-info {
  flex: 1;
  min-width: 0;
}

.child-category-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.child-category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.child-category-count {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
}

.child-category-count .anticon {
  margin-right: 4px;
}

.detail-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.category-empty-detail {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px;
  max-width: 400px;
}

.empty-detail-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-detail-content h3 {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.empty-detail-content p {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 24px;
}

/* 表格视图样式 */
.category-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-name-cell {
  display: flex;
  align-items: center;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  font-size: 16px;
  flex-shrink: 0;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 分类管理弹窗样式 */
.category-management-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.category-management-modal :deep(.ant-modal-header) {
  padding: 16px 24px;
  border-bottom: none;
}

.category-management-modal :deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.category-management-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.category-management-modal :deep(.ant-modal-close) {
  color: rgba(0, 0, 0, 0.45);
}

/* 模态框头部样式 */
.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 0 0;
}

.header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.header-title p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #8c8c8c;
}

/* 表单布局样式 */
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
  color: #6554c0;
  font-weight: 600;
}

.column-header .anticon {
  margin-right: 8px;
  font-size: 16px;
}

/* 表单提示样式 */
.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 类型选择样式 */
.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}


/* 预览区域样式 */
.preview-section {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  border: 1px solid #f0f0f0;
}

.preview-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #262626;
}

.preview-header .anticon {
  margin-right: 8px;
  color: #6554c0;
}

.preview-content {
  padding: 16px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.preview-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
}

.preview-info {
  flex: 1;
  overflow: hidden;
}

.preview-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-path {
  font-size: 13px;
  color: #8c8c8c;
}

.preview-desc {
  font-size: 13px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 底部按钮区域 */
.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 移动分类模态框样式 */
.category-move-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(101, 84, 192, 0.15);
}

.category-move-modal {
  width: 680px !important;
}

.category-move-modal :deep(.ant-modal-close) {
  color: rgba(255, 255, 255, 0.85);
  top: 14px;
  right: 16px;
  z-index: 10;
  transition: all 0.3s;
}

.category-move-modal :deep(.ant-modal-close:hover) {
  color: #fff;
  transform: rotate(90deg);
}

.move-container {
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.move-header {
  position: relative;
  padding: 20px 32px;
  overflow: hidden;
}

.header-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(120deg, #6554C0, #9F44D3);
  z-index: 0;
}

.header-bg-decoration::after {
  content: '';
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.header-bg-decoration::before {
  content: '';
  position: absolute;
  left: -20px;
  top: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.2);
}

.header-text {
  color: white;
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* 源分类信息区域 */
.source-section {
  padding: 12px 32px;
  background-color: #f9fafb;
}

.source-label {
  font-size: 14px;
  color: #6e7191;
  margin-bottom: 12px;
  font-weight: 500;
}

.source-card {
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.source-card:hover {
  box-shadow: 0 4px 16px rgba(101, 84, 192, 0.08);
}

.source-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 20px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.source-path {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.path-text {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #6e7191;
}

.path-text .anticon {
  margin-right: 6px;
  font-size: 14px;
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.category-tag {
  font-size: 12px;
  border-radius: 4px;
}

.more-tag {
  background: #f0f0f0;
  color: #6e7191;
  border: none;
}

/* 目标选择区域 */
.destination-section {
  padding: 12px 32px;
}

.section-label {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.section-label .anticon {
  margin-right: 10px;
  font-size: 16px;
  color: #6554C0;
}

.secondary-label {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

/* 顶级分类选项 */
.top-level-option {
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: white;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.top-level-option:hover {
  background-color: #f9f5ff;
  border-color: #ddd6f3;
}

.top-level-option.selected {
  background-color: #f0eaff;
  border-color: #c0b6e9;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #52C41A, #95DE64);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 18px;
  color: white;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 13px;
  color: #6e7191;
}

.option-arrow {
  color: #d9d9d9;
  font-size: 14px;
  transition: all 0.2s;
}

.top-level-option:hover .option-arrow,
.top-level-option.selected .option-arrow {
  color: #6554C0;
  transform: translateX(4px);
}

/* 警告提示区域 */
.move-info-note {
  padding: 0 32px 12px;
}

.alert-content {
  font-size: 13px;
  color: #0958d9;
}

/* 底部操作区域 */
.modal-footer {
  padding: 12px 32px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  position: relative;
  bottom: auto;
}

.categories-tree-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: white;
  padding: 12px;
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.categories-tree-container::-webkit-scrollbar {
  width: 6px;
}

.categories-tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.categories-tree-container::-webkit-scrollbar-thumb {
  background: #d5d5d5;
  border-radius: 6px;
}

.categories-tree-container::-webkit-scrollbar-thumb:hover {
  background: #b5b5b5;
}

.tree-node-container {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.node-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-size: 16px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-title {
  font-size: 14px;
  color: #1f2937;
}

.node-tag {
  font-size: 12px;
  padding: 0 4px;
  height: 20px;
  line-height: 20px;
}

/* 调整树形组件样式 */
:deep(.ant-tree-treenode) {
  padding: 1px 0 !important;
}

:deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f9f5ff;
}

:deep(.ant-tree-node-selected) {
  background-color: #f0eaff !important;
}

:deep(.ant-tree-switcher) {
  color: #6554C0;
}

:deep(.ant-tree-show-line .ant-tree-indent-unit::before) {
  border-color: #e1e1e1;
}

:deep(.ant-tree-node-selected) {
  background-color: #f0eaff !important;
}

:deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f9f5ff;
}

:deep(.ant-tree-switcher) {
  color: #6554C0;
}

/* 自定义Tree组件样式 */
.custom-tree :deep(.ant-tree-node-content-wrapper) {
  display: flex;
  width: 100%;
  padding: 4px 0;
}

.custom-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: #f0eaff;
}


.modal-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 确保表单项标签对齐 */
.url-icon-row .ant-form-item-label {
  min-width: 80px;
}


/* 响应式设计 */
@media (max-width: 992px) {
  .tm-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tm-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .tm-metrics {
    width: 100%;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }

  .detail-panel-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .tm-metric-item {
    padding: 0 10px;
  }

  .tm-metric-value {
    font-size: 16px;
  }

  .tm-title {
    font-size: 20px;
  }

  .form-column {
    flex: 0 0 100%;
  }

  .tree-view-container .ant-row {
    flex-direction: column;
  }

  .tree-view-container .ant-col {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }

  .category-detail-panel {
    margin-top: 24px;
  }

  .detail-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-panel-icon {
    margin-bottom: 16px;
    margin-right: 0;
  }

  .detail-panel-metrics {
    grid-template-columns: repeat(1, 1fr);
  }

  .detail-action-bar {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .tm-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .tm-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .tm-divider {
    display: none;
  }

  .tm-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }

  /* 增强小屏幕上的操作按钮响应性 */
  .operation-left .ant-space {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .operation-left .ant-btn {
    margin-bottom: 8px;
  }

  .move-header,
  .source-section,
  .destination-section,
  .move-info-note,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>