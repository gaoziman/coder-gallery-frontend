<template>
  <div class="icon-management-container">
    <div class="header-banner">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1 class="main-title">图标库管理</h1>
            <p class="sub-title">管理多种图标库，提升您的设计效率</p>
          </div>
        </div>
        <div class="header-right">
          <div class="stats-card">
            <div class="stat-item">
              <span class="stat-value">{{ totalIcons }}</span>
              <span class="stat-label">图标总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ loadedScripts.length }}</span>
              <span class="stat-label">已加载库</span>
            </div>
          </div>
          <a-button type="primary" @click="openIconManager" class="add-library-btn">
            <template #icon><PlusOutlined /></template>
            更新图标库
          </a-button>
        </div>
      </div>
      <div class="decoration-dots">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
      </div>
    </div>

    <a-card class="content-card">
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- IconFont 图标标签页 -->
        <a-tab-pane key="iconfont" tab="IconFont图标">
          <div class="tool-bar">
            <a-input
                v-model:value="searchText"
                placeholder="搜索图标"
                allow-clear
                style="width: 300px"
            >
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>

            <div class="tool-right">
              <a-button
                  type="text"
                  class="refresh-button"
                  :loading="refreshing"
                  @click="refreshIcons"
                  title="刷新图标显示"
              >
                <template #icon><ReloadOutlined /></template>
                刷新显示
              </a-button>

              <a-select
                  v-model:value="sortOrder"
                  style="width: 150px"
                  placeholder="排序方式"
              >
                <a-select-option value="name-asc">名称 (A-Z)</a-select-option>
                <a-select-option value="name-desc">名称 (Z-A)</a-select-option>
                <a-select-option value="recent">最近添加</a-select-option>
              </a-select>

              <a-select
                  v-model:value="pageSize"
                  style="width: 120px"
                  title="每页显示图标数量"
              >
                <a-select-option :value="45">45个/页</a-select-option>
                <a-select-option :value="60">60个/页</a-select-option>
                <a-select-option :value="90">90个/页</a-select-option>
                <a-select-option :value="120">120个/页</a-select-option>
              </a-select>
            </div>
          </div>

          <a-spin :spinning="loading">
            <a-empty
                v-if="filteredIcons.length === 0"
                description="未找到图标"
            >
              <template #extra>
                <a-button type="primary" @click="openIconManager">
                  添加图标
                </a-button>
              </template>
            </a-empty>

            <template v-else>
              <div class="icon-grid">
                <div
                    v-for="icon in paginatedIcons"
                    :key="icon.id"
                    class="icon-grid-item"
                    @click="copyIconCode(icon.id)"
                >
                  <div class="icon-wrapper">
                    <IconFont :type="icon.id" size="20" />
                  </div>
                  <div class="icon-name">{{ formatIconName(icon.name) }}</div>
                  <div class="icon-actions">
                    <copy-outlined class="action-icon" title="复制组件代码" @click.stop="copyIconCode(icon.id)" />
                    <code-outlined class="action-icon" title="复制图标ID" @click.stop="copyIconId(icon.id)" />
                    <eye-outlined class="action-icon" title="预览" @click.stop="previewIcon(icon)" />
                  </div>
                </div>
              </div>

              <div class="pagination-container">
                <a-pagination
                    v-model:current="currentPage.iconfont"
                    :total="filteredIcons.length"
                    :pageSize="pageSize"
                    :showTotal="total => `共 ${total} 个图标`"
                    :showSizeChanger="false"
                    :showQuickJumper="true"
                />
              </div>
            </template>
          </a-spin>
        </a-tab-pane>

        <!-- Ant Design 图标标签页 -->
        <a-tab-pane key="ant" tab="Ant Design图标">
          <div class="tool-bar">
            <a-input
                v-model:value="antSearchText"
                placeholder="搜索图标"
                allow-clear
                style="width: 300px"
            >
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>

            <div class="tool-right">
              <a-radio-group v-model:value="antIconType" button-style="solid" class="custom-radio-group">
                <a-radio-button value="all">全部</a-radio-button>
                <a-radio-button value="outlined">线框风格</a-radio-button>
                <a-radio-button value="filled">实底风格</a-radio-button>
              </a-radio-group>

              <a-select
                  v-model:value="pageSize"
                  style="width: 120px"
                  title="每页显示图标数量"
              >
                <a-select-option :value="36">36个/页</a-select-option>
                <a-select-option :value="48">48个/页</a-select-option>
                <a-select-option :value="64">64个/页</a-select-option>
                <a-select-option :value="100">100个/页</a-select-option>
              </a-select>
            </div>
          </div>

          <a-spin :spinning="antLoading">
            <a-empty
                v-if="filteredAntIcons.length === 0"
                description="未找到图标"
            />

            <template v-else>
              <div class="icon-grid">
                <div
                    v-for="icon in paginatedAntIcons"
                    :key="icon.name"
                    class="icon-grid-item"
                    @click="copyAntIconCode(icon.name)"
                >
                  <div class="icon-wrapper">
                    <component :is="icon.component" />
                  </div>
                  <div class="icon-name">{{ formatIconName(formatAntIconName(icon.name)) }}</div>
                  <div class="icon-actions">
                    <copy-outlined class="action-icon" title="复制组件代码" @click.stop="copyAntIconCode(icon.name)" />
                    <code-outlined class="action-icon" title="复制图标名称" @click.stop="copyAntIconName(icon.name)" />
                    <eye-outlined class="action-icon" title="预览" @click.stop="previewAntIcon(icon)" />
                  </div>
                </div>
              </div>

              <div class="pagination-container">
                <a-pagination
                    v-model:current="currentPage.ant"
                    :total="filteredAntIcons.length"
                    :pageSize="pageSize"
                    :showTotal="total => `共 ${total} 个图标`"
                    :showSizeChanger="false"
                    :showQuickJumper="true"
                />
              </div>
            </template>
          </a-spin>
        </a-tab-pane>

        <!-- Font Awesome 图标标签页 -->
        <a-tab-pane key="fontawesome" tab="Font Awesome图标">
          <div class="tool-bar">
            <a-input
                v-model:value="fontawesomeSearchText"
                placeholder="搜索图标"
                allow-clear
                style="width: 300px"
            >
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>

            <div class="tool-right">
              <a-radio-group v-model:value="fontawesomeIconType" button-style="solid" class="custom-radio-group">
                <a-radio-button value="all">全部</a-radio-button>
                <a-radio-button value="solid">实底风格</a-radio-button>
                <a-radio-button value="regular">线框风格</a-radio-button>
                <a-radio-button value="brands">品牌图标</a-radio-button>
              </a-radio-group>

              <a-select
                  v-model:value="pageSize"
                  style="width: 120px"
                  title="每页显示图标数量"
              >
                <a-select-option :value="36">36个/页</a-select-option>
                <a-select-option :value="48">48个/页</a-select-option>
                <a-select-option :value="64">64个/页</a-select-option>
                <a-select-option :value="100">100个/页</a-select-option>
              </a-select>
            </div>
          </div>

          <a-spin :spinning="fontawesomeLoading">
            <template v-if="!fontawesomeLoaded">
              <div class="setup-fontawesome">
                <div class="setup-info">
                  <h3>设置 Font Awesome 图标库</h3>
                  <p>Font Awesome 是一个流行的图标库，拥有超过7,000个图标。您可以通过以下步骤设置：</p>
                  <ol>
                    <li>在您的项目中安装 Font Awesome：<code>npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons @fortawesome/vue-fontawesome</code></li>
                    <li>配置 Font Awesome 并将其添加到 Vue 项目</li>
                    <li>点击下方按钮加载图标库</li>
                  </ol>
                </div>
                <div class="setup-actions">
                  <a-button type="primary" @click="loadFontAwesomeIcons">
                    加载 Font Awesome 图标
                  </a-button>
                  <a-button type="link" target="_blank" href="https://fontawesome.com/icons">
                    访问 Font Awesome 官网
                  </a-button>
                </div>
              </div>
            </template>

            <a-empty
                v-else-if="filteredFontAwesomeIcons.length === 0"
                description="未找到图标"
            />

            <template v-else>
              <div class="icon-grid">
                <div
                    v-for="icon in paginatedFontAwesomeIcons"
                    :key="icon.id"
                    class="icon-grid-item"
                    @click="copyFontAwesomeCode(icon)"
                >
                  <div class="icon-wrapper">
                    <i :class="['fa' + icon.prefix, 'fa-' + icon.id]"></i>
                  </div>
                  <div class="icon-name">{{ formatIconName(formatFontAwesomeName(icon.id)) }}</div>
                  <div class="icon-actions">
                    <copy-outlined class="action-icon" title="复制组件代码" @click.stop="copyFontAwesomeCode(icon)" />
                    <code-outlined class="action-icon" title="复制图标名称" @click.stop="copyFontAwesomeName(icon.id)" />
                    <eye-outlined class="action-icon" title="预览" @click.stop="previewFontAwesomeIcon(icon)" />
                  </div>
                </div>
              </div>

              <div class="pagination-container">
                <a-pagination
                    v-model:current="currentPage.fontawesome"
                    :total="filteredFontAwesomeIcons.length"
                    :pageSize="pageSize"
                    :showTotal="total => `共 ${total} 个图标`"
                    :showSizeChanger="false"
                    :showQuickJumper="true"
                />
              </div>
            </template>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 图标管理模态框 -->
    <a-modal
        v-model:visible="iconManagerVisible"
        title="管理图标库"
        width="700px"
        :footer="null"
        :destroyOnClose="true"
    >
      <a-form layout="vertical">
        <a-form-item
            label="iconfont 项目URL"
            :validateStatus="urlValidateStatus"
            :help="urlValidateMessage"
        >
          <a-input
              v-model:value="iconProjectUrl"
              placeholder="如: //at.alicdn.com/t/c/font_4891495_bbjyzankq5r.js"
              :status="urlValidateStatus === 'error' ? 'error' : undefined"
              @change="validateIconUrl"
          />
        </a-form-item>

        <div class="info-box">
          <h4><info-circle-outlined /> 如何更新图标库:</h4>
          <ol>
            <li>访问 <a href="https://www.iconfont.cn/" target="_blank" rel="noopener noreferrer">iconfont.cn</a> 并登录您的账号</li>
            <li>进入您的项目，添加所需图标</li>
            <li>在项目设置中，查看项目内的"Symbol"代码链接</li>
            <li>复制链接并粘贴到上方输入框</li>
            <li>点击"更新图标库"按钮应用更改</li>
          </ol>
        </div>

        <!-- 已加载的图标库列表 -->
        <a-divider>已加载的图标库</a-divider>

        <a-spin :spinning="loadingScripts">
          <div v-if="loadedScripts.length === 0" class="empty-scripts">
            <a-empty description="暂无已加载的图标库" />
          </div>

          <a-list v-else size="small" bordered>
            <a-list-item v-for="script in loadedScripts" :key="script" class="script-item">
              <div class="script-url">{{ formatScriptUrl(script) }}</div>
              <div class="script-actions">
                <a-tooltip title="复制URL">
                  <copy-outlined class="action-icon" @click="copyScriptUrl(script)" />
                </a-tooltip>
                <a-tooltip title="移除">
                  <a-popconfirm
                      title="确定要移除这个图标库吗？"
                      @confirm="removeScript(script)"
                      okText="确定"
                      cancelText="取消"
                  >
                    <delete-outlined class="action-icon delete" />
                  </a-popconfirm>
                </a-tooltip>
              </div>
            </a-list-item>
          </a-list>
        </a-spin>

        <div class="form-actions">
          <a-button @click="iconManagerVisible = false">取消</a-button>
          <a-button
              type="primary"
              @click="updateIconLibrary"
              :loading="updateLoading"
              :disabled="urlValidateStatus === 'error' || !iconProjectUrl"
          >
            更新图标库
          </a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- 图标预览模态框 -->
    <a-modal
        v-model:visible="previewVisible"
        :title="previewTitle"
        width="500px"
        :footer="null"
        class="preview-modal"
    >
      <div class="preview-container">
        <div class="preview-icon-box">
          <div v-if="previewType === 'iconfont'">
            <IconFont :type="previewIconData?.id" :size="previewSize" :color="previewColor" />
          </div>
          <div v-else-if="previewType === 'ant'">
            <component :is="previewIconData?.component" :style="{ fontSize: `${previewSize}px`, color: previewColor }" />
          </div>
          <div v-else-if="previewType === 'fontawesome'">
            <i :class="['fa' + previewIconData?.prefix, 'fa-' + previewIconData?.id]" :style="{ fontSize: `${previewSize}px`, color: previewColor }"></i>
          </div>
        </div>

        <div class="preview-controls">
          <div class="control-group">
            <span class="control-label">尺寸:</span>
            <a-slider
                v-model:value="previewSize"
                :min="16"
                :max="96"
                :step="8"
                style="width: 200px"
            />
            <span class="control-value">{{ previewSize }}px</span>
          </div>

          <div class="control-group">
            <span class="control-label">颜色:</span>
            <a-input type="color" v-model:value="previewColor" style="width: 100px" />
          </div>
        </div>

        <a-divider />

        <div class="preview-code">
          <div class="code-header">
            <span>使用代码</span>
            <a-button type="text" size="small" @click="copyPreviewCode">
              <template #icon><copy-outlined /></template>
              复制
            </a-button>
          </div>
          <a-typography-paragraph class="code-content">
            <pre><code>{{ previewCode }}</code></pre>
          </a-typography-paragraph>
        </div>
      </div>
    </a-modal>

    <!-- 复制成功提示 -->
    <a-modal
        v-model:visible="copySuccessVisible"
        :title="null"
        :footer="null"
        :closable="false"
        :mask="false"
        :width="300"
        class="copy-success-modal"
    >
      <div class="copy-success-box">
        <check-circle-outlined class="success-icon" />
        <span>{{ copySuccessText }}</span>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {
  SearchOutlined,
  PlusOutlined,
  CopyOutlined,
  CodeOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import * as AntIcons from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import IconFont from '@/components/common/IconFont.vue';
import iconService from '@/services/IconService';

// 图标刷新状态
const refreshing = ref(false);

// 状态
const loading = ref(false);
const antLoading = ref(false);
const icons = ref([]);
const antIcons = ref([]);
const searchText = ref('');
const antSearchText = ref('');
const activeTabKey = ref('iconfont');

// 分页相关状态
const pageSize = ref(90);
const currentPage = ref({
  iconfont: 1,
  ant: 1,
  fontawesome: 1
});

// 图标管理状态
const iconManagerVisible = ref(false);
const iconProjectUrl = ref('');
const updateLoading = ref(false);
const urlValidateStatus = ref('');
const urlValidateMessage = ref('');
const loadedScripts = ref([]);
const loadingScripts = ref(false);
const sortOrder = ref('name-asc');
const antIconType = ref('all');

// Font Awesome相关状态
const fontawesomeSearchText = ref('');
const fontawesomeIconType = ref('all');
const fontawesomeIcons = ref([]);
const fontawesomeLoading = ref(false);
const fontawesomeLoaded = ref(false);

// 预览状态
const previewVisible = ref(false);
const previewType = ref('iconfont');
const previewIconData = ref(null);
const previewSize = ref(32);
const previewColor = ref('#666666');

// 在预览模态框中处理Font Awesome图标
const previewTitle = computed(() => {
  if (!previewIconData.value) return '图标预览';

  if (previewType.value === 'iconfont') {
    return `图标预览: ${previewIconData.value.name}`;
  } else if (previewType.value === 'ant') {
    return `图标预览: ${formatAntIconName(previewIconData.value.name)}`;
  } else if (previewType.value === 'fontawesome') {
    return `图标预览: ${formatFontAwesomeName(previewIconData.value.id)}`;
  }

  return '图标预览';
});

// 复制状态
const copySuccessVisible = ref(false);
const copySuccessText = ref('');
const copySuccessTimer = ref(null);

// 预览模态框中增加对Font Awesome的支持
const previewCode = computed(() => {
  if (!previewIconData.value) return '';

  if (previewType.value === 'iconfont') {
    return `<IconFont type="${previewIconData.value.id}" size="${previewSize.value}" color="${previewColor.value}" />`;
  } else if (previewType.value === 'ant') {
    // 导入语句
    const importName = previewIconData.value.name;
    const importStatement = `import { ${importName} } from '@ant-design/icons-vue';`;

    // 使用语句
    const useStatement = `<${importName} style="font-size: ${previewSize.value}px; color: ${previewColor.value};" />`;

    return `${importStatement}\n\n${useStatement}`;
  } else if (previewType.value === 'fontawesome') {
    const prefix = previewIconData.value.prefix;
    const iconName = previewIconData.value.id;
    const typeMap = {'s': 'solid', 'r': 'regular', 'b': 'brands'};
    const iconType = typeMap[prefix] || 'solid';
    const pascalCaseName = convertToUpperCamelCase(iconName);

    // 方法1: 导入单个图标
    const importStatement = `// 方法1: 导入单个图标\nimport { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';\nimport { fa${pascalCaseName} } from '@fortawesome/free-${iconType}-svg-icons';`;
    const useStatement = `<FontAwesomeIcon :icon="fa${pascalCaseName}" style="font-size: ${previewSize.value}px; color: ${previewColor.value};" />`;

    // 方法2: 使用全局注册的图标
    const globalStatement = `// 方法2: 使用全局注册的图标 (确保在main.js中已导入相关库)\n<font-awesome-icon :icon="['fa${prefix}', '${iconName}']" style="font-size: ${previewSize.value}px; color: ${previewColor.value};" />`;

    // 方法3: 直接使用HTML
    const htmlStatement = `// 方法3: 直接使用HTML (需要引入Font Awesome CSS)\n<i class="fa${prefix} fa-${iconName}" style="font-size: ${previewSize.value}px; color: ${previewColor.value};"></i>`;

    return `${importStatement}\n\n${useStatement}\n\n${globalStatement}\n\n${htmlStatement}`;
  }

  return '';
});



// 计算图标总数
const totalIcons = computed(() => {
  return icons.value.length + antIcons.value.length +
      (fontawesomeLoaded.value ? fontawesomeIcons.value.length : 0);
});
// 初始化组件
onMounted(() => {
  // 初始化前确保图标服务已经加载
  iconService.init();
  loadIcons();
  loadAntIcons();

  // 从localStorage恢复项目URL
  const savedUrl = localStorage.getItem('iconfont-project-url');
  if (savedUrl) {
    iconProjectUrl.value = savedUrl;
  }

  // 检查是否已加载过Font Awesome
  const faLoaded = localStorage.getItem('fontawesome-loaded');
  if (faLoaded === 'true') {
    loadFontAwesomeIcons();
  }

  // 从localStorage恢复分页设置
  const savedPageSize = localStorage.getItem('icon-page-size');
  if (savedPageSize) {
    pageSize.value = parseInt(savedPageSize);
  }
});

// 监听pageSize变化，保存到localStorage
watch(pageSize, (newValue) => {
  localStorage.setItem('icon-page-size', newValue.toString());
});

// 当分页大小或选项卡变化时，重置为第一页
watch([pageSize, activeTabKey], () => {
  currentPage.value[activeTabKey.value] = 1;
});

// 当搜索条件变化时，重置各自的分页
watch(searchText, () => {
  currentPage.value.iconfont = 1;
});

watch(antSearchText, () => {
  currentPage.value.ant = 1;
});

watch(fontawesomeSearchText, () => {
  currentPage.value.fontawesome = 1;
});

watch(antIconType, () => {
  currentPage.value.ant = 1;
});

watch(fontawesomeIconType, () => {
  currentPage.value.fontawesome = 1;
});

// 格式化图标名称，处理过长的名称
const formatIconName = (name) => {
  if (name.length > 12) {
    return name.substring(0, 10) + '...';
  }
  return name;
};

// 过滤和排序IconFont图标
const filteredIcons = computed(() => {
  let result = [...icons.value];

  // 首先过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(icon =>
        icon.id.toLowerCase().includes(search) ||
        icon.name.toLowerCase().includes(search)
    );
  }

  // 然后排序
  if (sortOrder.value === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder.value === 'name-desc') {
    result.sort((a, b) => b.name.localeCompare(a.name));
  }
  // 'recent' 排序假设图标已经按最近添加排序

  return result;
});

// 分页后的IconFont图标
const paginatedIcons = computed(() => {
  const startIndex = (currentPage.value.iconfont - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredIcons.value.slice(startIndex, endIndex);
});

// 过滤Ant Design图标
const filteredAntIcons = computed(() => {
  let result = [...antIcons.value];

  // 按类型过滤（outlined或filled）
  if (antIconType.value !== 'all') {
    result = result.filter(icon => icon.type === antIconType.value);
  }

  // 按搜索词过滤
  if (antSearchText.value) {
    const search = antSearchText.value.toLowerCase();
    result = result.filter(icon =>
        icon.name.toLowerCase().includes(search) ||
        formatAntIconName(icon.name).toLowerCase().includes(search)
    );
  }

  return result;
});

// 分页后的Ant Design图标
const paginatedAntIcons = computed(() => {
  const startIndex = (currentPage.value.ant - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredAntIcons.value.slice(startIndex, endIndex);
});

// 过滤Font Awesome图标
const filteredFontAwesomeIcons = computed(() => {
  if (!fontawesomeLoaded.value) return [];

  let result = [...fontawesomeIcons.value];

  // 按类型过滤
  if (fontawesomeIconType.value !== 'all') {
    result = result.filter(icon => icon.type === fontawesomeIconType.value);
  }

  // 按搜索词过滤
  if (fontawesomeSearchText.value) {
    const search = fontawesomeSearchText.value.toLowerCase();
    result = result.filter(icon =>
        icon.id.toLowerCase().includes(search) ||
        icon.name.toLowerCase().includes(search)
    );
  }

  return result;
});

// 分页后的Font Awesome图标
const paginatedFontAwesomeIcons = computed(() => {
  const startIndex = (currentPage.value.fontawesome - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredFontAwesomeIcons.value.slice(startIndex, endIndex);
});

// 刷新图标显示
const refreshIcons = async () => {
  refreshing.value = true;

  try {
    // 重置加载状态
    iconService.iconsLoaded = false;

    // 强制重新加载图标
    await iconService.loadIcons();

    // 清空并重新加载图标列表
    icons.value = [];
    setTimeout(() => {
      icons.value = iconService.getAllIcons();

      // 强制刷新SVG显示
      forceSvgRefresh();

      message.success('图标已刷新');
      refreshing.value = false;
    }, 200);
  } catch (error) {
    console.error('刷新图标失败:', error);
    message.error('刷新图标失败');
    refreshing.value = false;
  }
};

// 获取Ant Design图标
const loadAntIcons = () => {
  antLoading.value = true;

  try {
    const iconList = [];

    Object.entries(AntIcons).forEach(([name, component]) => {
      // 只加载Outlined和Filled风格的图标，排除TwoTone
      if (name.endsWith('Outlined') || name.endsWith('Filled')) {
        iconList.push({
          name,
          component,
          displayName: name.replace(/([A-Z])/g, ' $1').trim(),
          type: name.endsWith('Outlined') ? 'outlined' : 'filled'
        });
      }
    });

    antIcons.value = iconList;
  } catch (error) {
    console.error('加载Ant Design图标失败:', error);
  } finally {
    antLoading.value = false;
  }
};

// 格式化Ant Design图标名称
const formatAntIconName = (name) => {
  return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/Outlined|Filled|TwoTone/g, '')
      .trim();
};

// 加载IconFont图标
const loadIcons = async () => {
  loading.value = true;

  try {
    // 从图标服务中获取所有图标
    const allIcons = iconService.getAllIcons();

    // 清空当前图标列表后再重新赋值，确保视图会重新渲染
    icons.value = [];

    // 延迟后再赋值，确保DOM更新
    setTimeout(() => {
      icons.value = [...allIcons];
      loading.value = false;

      // 打印加载了多少图标的信息
      console.log(`已成功加载 ${icons.value.length} 个IconFont图标`);
    }, 200);
  } catch (error) {
    console.error('加载IconFont图标失败:', error);
    message.error('加载图标失败，请尝试刷新页面');
    loading.value = false;
  }
};


// 强制重新渲染所有SVG图标的辅助函数
const forceSvgRefresh = () => {
  // 获取所有使用SVG的图标容器
  const iconWrappers = document.querySelectorAll('.icon-wrapper');

  // 暂时隐藏并再次显示，强制浏览器重绘
  iconWrappers.forEach(wrapper => {
    if (wrapper) {
      const originalDisplay = wrapper.style.display;
      wrapper.style.display = 'none';
      // 强制重排
      wrapper.offsetHeight;
      // 恢复显示
      wrapper.style.display = originalDisplay;
    }
  });
};

// 将短横线格式转换为大驼峰格式 (如: user-circle 转为 UserCircle)
const convertToUpperCamelCase = (str) => {
  return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};

// 加载Font Awesome图标
const loadFontAwesomeIcons = () => {
  fontawesomeLoading.value = true;

  try {
    // 尝试从全局变量获取Font Awesome图标
    const allIcons = [];

    // 尝试多种可能的访问方式
    const detectFontAwesomeIcons = () => {
      // 方式1: 通过fontawesome-svg-core库的内部结构
      if (window.FontAwesomeIconDefinition) {
        return processFontAwesomeDefinition();
      }

      // 方式2: 尝试访问全局导出的库
      if (window.fas || window.far || window.fab) {
        return processFontAwesomeLibrary();
      }

      // 方式3: 如果安装了@fortawesome/fontawesome-free，尝试通过DOM扫描
      if (document.querySelector('.fas, .far, .fab')) {
        return processFontAwesomeClasses();
      }

      // 如果都不可用，使用预定义的图标列表
      return usePredefinedIconList();
    };

    // 方式1: 通过FontAwesomeIconDefinition
    const processFontAwesomeDefinition = () => {
      const icons = [];

      // 处理实底图标 (Solid)
      if (window.FontAwesomeIconDefinition.fas) {
        Object.keys(window.FontAwesomeIconDefinition.fas).forEach(iconName => {
          if (iconName.startsWith('fa')) {
            const id = iconName.replace(/^fa/, '').toLowerCase();
            icons.push({
              id,
              prefix: 's',
              type: 'solid',
              name: formatFontAwesomeName(id)
            });
          }
        });
      }

      // 处理线框图标 (Regular)
      if (window.FontAwesomeIconDefinition.far) {
        Object.keys(window.FontAwesomeIconDefinition.far).forEach(iconName => {
          if (iconName.startsWith('fa')) {
            const id = iconName.replace(/^fa/, '').toLowerCase();
            icons.push({
              id,
              prefix: 'r',
              type: 'regular',
              name: formatFontAwesomeName(id) + ' Regular'
            });
          }
        });
      }

      // 处理品牌图标 (Brands)
      if (window.FontAwesomeIconDefinition.fab) {
        Object.keys(window.FontAwesomeIconDefinition.fab).forEach(iconName => {
          if (iconName.startsWith('fa')) {
            const id = iconName.replace(/^fa/, '').toLowerCase();
            icons.push({
              id,
              prefix: 'b',
              type: 'brands',
              name: formatFontAwesomeName(id)
            });
          }
        });
      }

      return icons;
    };

    // 方式2: 通过全局导出的库
    const processFontAwesomeLibrary = () => {
      const icons = [];

      // 处理实底图标 (Solid)
      if (window.fas) {
        Object.keys(window.fas).forEach(iconKey => {
          if (iconKey.startsWith('fa')) {
            const id = iconKey.replace(/^fa/, '').replace(/([A-Z])/g, '-$1').toLowerCase();
            icons.push({
              id,
              prefix: 's',
              type: 'solid',
              name: formatFontAwesomeName(id)
            });
          }
        });
      }

      // 处理线框图标 (Regular)
      if (window.far) {
        Object.keys(window.far).forEach(iconKey => {
          if (iconKey.startsWith('fa')) {
            const id = iconKey.replace(/^fa/, '').replace(/([A-Z])/g, '-$1').toLowerCase();
            icons.push({
              id,
              prefix: 'r',
              type: 'regular',
              name: formatFontAwesomeName(id) + ' Regular'
            });
          }
        });
      }

      // 处理品牌图标 (Brands)
      if (window.fab) {
        Object.keys(window.fab).forEach(iconKey => {
          if (iconKey.startsWith('fa')) {
            const id = iconKey.replace(/^fa/, '').replace(/([A-Z])/g, '-$1').toLowerCase();
            icons.push({
              id,
              prefix: 'b',
              type: 'brands',
              name: formatFontAwesomeName(id)
            });
          }
        });
      }

      return icons;
    };

    // 方式3: 通过DOM扫描
    const processFontAwesomeClasses = () => {
      const icons = [];
      const addedIcons = new Set();

      // 查找页面上所有的Font Awesome图标
      document.querySelectorAll('.fas, .far, .fab, [class*="fa-"]').forEach(el => {
        const classList = Array.from(el.classList);

        // 确定前缀 (fas/far/fab)
        let prefix = '';
        if (classList.includes('fas')) prefix = 's';
        else if (classList.includes('far')) prefix = 'r';
        else if (classList.includes('fab')) prefix = 'b';
        else return; // 如果没有前缀类，跳过

        // 查找图标名称
        const iconClass = classList.find(cls => cls.startsWith('fa-'));
        if (iconClass) {
          const id = iconClass.replace('fa-', '');
          // 避免重复添加
          const key = `${prefix}-${id}`;
          if (!addedIcons.has(key)) {
            addedIcons.add(key);

            const typeMap = {'s': 'solid', 'r': 'regular', 'b': 'brands'};
            icons.push({
              id,
              prefix,
              type: typeMap[prefix] || 'solid',
              name: formatFontAwesomeName(id) + (prefix === 'r' ? ' Regular' : '')
            });
          }
        }
      });

      return icons;
    };

    // 使用预定义的图标列表
    const usePredefinedIconList = () => {
      // 精简的常用图标列表
      const solidIcons = [
        'address-book', 'address-card', 'adjust', 'air-freshener', 'align-center',
        'align-justify', 'align-left', 'align-right', 'allergies', 'ambulance',
        'american-sign-language-interpreting', 'anchor', 'angle-double-down',
        'angle-double-left', 'angle-double-right', 'angle-double-up', 'angle-down',
        'angle-left', 'angle-right', 'angle-up', 'angry', 'ankh', 'apple-alt',
        'archive', 'archway', 'arrow-alt-circle-down', 'arrow-alt-circle-left',
        'arrow-alt-circle-right', 'arrow-alt-circle-up', 'arrow-circle-down',
        'arrow-circle-left', 'arrow-circle-right', 'arrow-circle-up', 'arrow-down',
        'arrow-left', 'arrow-right', 'arrow-up', 'arrows-alt', 'arrows-alt-h',
        'arrows-alt-v', 'assistive-listening-systems', 'asterisk', 'at',
        'atlas', 'atom', 'audio-description', 'award', 'baby', 'baby-carriage',
        'backspace', 'backward', 'bacon', 'bacteria', 'bacterium', 'bahai',
        'balance-scale', 'balance-scale-left', 'balance-scale-right', 'ban',
        'band-aid', 'barcode', 'bars', 'baseball-ball', 'basketball-ball',
        'bath', 'battery-empty', 'battery-full', 'battery-half', 'battery-quarter',
        'battery-three-quarters', 'bed', 'beer', 'bell', 'bell-slash',
        'bezier-curve', 'bible', 'bicycle', 'biking', 'binoculars', 'biohazard',
        'birthday-cake', 'blender', 'blender-phone', 'blind', 'blog', 'bold',
        'bolt', 'bomb', 'bone', 'bong', 'book', 'book-dead', 'book-medical',
        'book-open', 'book-reader', 'bookmark', 'border-all', 'border-none',
        'border-style', 'bowling-ball', 'box', 'box-open', 'box-tissue',
        'boxes', 'braille', 'brain', 'bread-slice', 'briefcase',
        'briefcase-medical', 'broadcast-tower', 'broom', 'brush', 'bug',
        'building', 'bullhorn', 'bullseye', 'burn', 'bus', 'bus-alt',
        'business-time', 'calculator', 'calendar', 'calendar-alt',
        'calendar-check', 'calendar-day', 'calendar-minus', 'calendar-plus',
        'calendar-times', 'calendar-week', 'camera', 'camera-retro', 'campground',
        'candy-cane', 'cannabis', 'capsules', 'car', 'car-alt', 'car-battery',
        'car-crash', 'car-side', 'caravan', 'caret-down', 'caret-left',
        'caret-right', 'caret-square-down', 'caret-square-left',
        'caret-square-right', 'caret-square-up', 'caret-up', 'carrot',
        'cart-arrow-down', 'cart-plus', 'cash-register', 'cat', 'certificate',
        'chair', 'chalkboard', 'chalkboard-teacher', 'charging-station',
        'chart-area', 'chart-bar', 'chart-line', 'chart-pie', 'check',
        'check-circle', 'check-double', 'check-square', 'cheese', 'chess',
        'chess-bishop', 'chess-board', 'chess-king', 'chess-knight',
        'chess-pawn', 'chess-queen', 'chess-rook', 'chevron-circle-down',
        'chevron-circle-left', 'chevron-circle-right', 'chevron-circle-up',
        'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up', 'child',
        'church', 'circle', 'circle-notch', 'city', 'clinic-medical',
        'clipboard', 'clipboard-check', 'clipboard-list', 'clock', 'clone',
        'closed-captioning', 'cloud', 'cloud-download-alt', 'cloud-meatball',
        'cloud-moon', 'cloud-moon-rain', 'cloud-rain', 'cloud-showers-heavy',
        'cloud-sun', 'cloud-sun-rain', 'cloud-upload-alt', 'cocktail', 'code',
        'code-branch', 'coffee', 'cog', 'cogs', 'coins', 'columns', 'comment',
        'comment-alt', 'comment-dollar', 'comment-dots', 'comment-medical',
        'comment-slash', 'comments', 'comments-dollar', 'compact-disc',
        'compass', 'compress', 'compress-alt', 'compress-arrows-alt',
        'concierge-bell', 'cookie', 'cookie-bite', 'copy', 'copyright',
        'couch', 'credit-card', 'crop', 'crop-alt', 'cross', 'crosshairs',
        'crow', 'crown', 'crutch', 'cube', 'cubes', 'cut', 'database',
        'deaf', 'democrat', 'desktop', 'dharmachakra', 'diagnoses', 'dice',
        'dice-d20', 'dice-d6', 'dice-five', 'dice-four', 'dice-one',
        'dice-six', 'dice-three', 'dice-two', 'digital-tachograph',
        'directions', 'disease', 'divide', 'dizzy', 'dna', 'dog', 'dollar-sign',
        'dolly', 'dolly-flatbed', 'donate', 'door-closed', 'door-open',
        'dot-circle', 'dove', 'download', 'drafting-compass', 'dragon',
        'draw-polygon', 'drum', 'drum-steelpan', 'drumstick-bite', 'dumbbell',
        'dumpster', 'dumpster-fire', 'dungeon', 'edit', 'egg', 'eject',
        'ellipsis-h', 'ellipsis-v', 'envelope', 'envelope-open',
        'envelope-open-text', 'envelope-square', 'equals', 'eraser',
        'ethernet', 'euro-sign', 'exchange-alt', 'exclamation',
        'exclamation-circle', 'exclamation-triangle', 'expand',
        'expand-alt', 'expand-arrows-alt', 'external-link-alt',
        'external-link-square-alt', 'eye', 'eye-dropper', 'eye-slash',
        'fan', 'fast-backward', 'fast-forward', 'faucet', 'fax', 'feather',
        'feather-alt', 'female', 'fighter-jet', 'file', 'file-alt',
        'file-archive', 'file-audio', 'file-code', 'file-contract',
        'file-csv', 'file-download', 'file-excel', 'file-export',
        'file-image', 'file-import', 'file-invoice', 'file-invoice-dollar',
        'file-medical', 'file-medical-alt', 'file-pdf', 'file-powerpoint',
        'file-prescription', 'file-signature', 'file-upload', 'file-video',
        'file-word', 'fill', 'fill-drip', 'film', 'filter', 'fingerprint',
        'fire', 'fire-alt', 'fire-extinguisher', 'first-aid', 'fish',
        'fist-raised', 'flag', 'flag-checkered', 'flag-usa', 'flask',
        'flushed', 'folder', 'folder-minus', 'folder-open', 'folder-plus',
        'font', 'football-ball', 'forward', 'frog', 'frown', 'frown-open',
        'funnel-dollar', 'futbol', 'gamepad', 'gas-pump', 'gavel', 'gem',
        'genderless', 'ghost', 'gift', 'gifts', 'glass-cheers',
        'glass-martini', 'glass-martini-alt', 'glass-whiskey', 'glasses',
        'globe', 'globe-africa', 'globe-americas', 'globe-asia',
        'globe-europe', 'golf-ball', 'gopuram', 'graduation-cap', 'greater-than',
        'greater-than-equal', 'grimace', 'grin', 'grin-alt', 'grin-beam',
        'grin-beam-sweat', 'grin-hearts', 'grin-squint', 'grin-squint-tears',
        'grin-stars', 'grin-tears', 'grin-tongue', 'grin-tongue-squint',
        'grin-tongue-wink', 'grin-wink', 'grip-horizontal', 'grip-lines',
        'grip-lines-vertical', 'grip-vertical', 'guitar', 'h-square',
        'hamburger', 'hammer', 'hamsa', 'hand-holding', 'hand-holding-heart',
        'hand-holding-medical', 'hand-holding-usd', 'hand-holding-water',
        'hand-lizard', 'hand-middle-finger', 'hand-paper', 'hand-peace',
        'hand-point-down', 'hand-point-left', 'hand-point-right',
        'hand-point-up', 'hand-pointer', 'hand-rock', 'hand-scissors',
        'hand-sparkles', 'hand-spock', 'hands', 'hands-helping',
        'hands-wash', 'handshake', 'handshake-alt-slash', 'handshake-slash',
        'hanukiah', 'hard-hat', 'hashtag', 'hat-cowboy', 'hat-cowboy-side',
        'hat-wizard', 'hdd', 'head-side-cough', 'head-side-cough-slash',
        'head-side-mask', 'head-side-virus', 'heading', 'headphones',
        'headphones-alt', 'headset', 'heart', 'heart-broken', 'heartbeat',
        'helicopter', 'highlighter', 'hiking', 'hippo', 'history', 'hockey-puck',
        'holly-berry', 'home', 'horse', 'horse-head', 'hospital',
        'hospital-alt', 'hospital-symbol', 'hospital-user', 'hot-tub',
        'hotdog', 'hotel', 'hourglass', 'hourglass-end', 'hourglass-half',
        'hourglass-start', 'house-damage', 'house-user', 'hryvnia', 'i-cursor',
        'ice-cream', 'icicles', 'icons', 'id-badge', 'id-card', 'id-card-alt',
        'igloo', 'image', 'images', 'inbox', 'indent', 'industry', 'infinity',
        'info', 'info-circle', 'italic', 'jedi', 'joint', 'journal-whills',
        'kaaba', 'key', 'keyboard', 'khanda', 'kiss', 'kiss-beam',
        'kiss-wink-heart', 'kiwi-bird', 'landmark', 'language', 'laptop',
        'laptop-code', 'laptop-house', 'laptop-medical', 'laugh', 'laugh-beam',
        'laugh-squint', 'laugh-wink', 'layer-group', 'leaf', 'lemon',
        'less-than', 'less-than-equal', 'level-down-alt', 'level-up-alt',
        'life-ring', 'lightbulb', 'link', 'lira-sign', 'list', 'list-alt',
        'list-ol', 'list-ul', 'location-arrow', 'lock', 'lock-open',
        'long-arrow-alt-down', 'long-arrow-alt-left', 'long-arrow-alt-right',
        'long-arrow-alt-up', 'low-vision', 'luggage-cart', 'lungs',
        'lungs-virus', 'magic', 'magnet', 'mail-bulk', 'male', 'map',
        'map-marked', 'map-marked-alt', 'map-marker', 'map-marker-alt',
        'map-pin', 'map-signs', 'marker', 'mars', 'mars-double',
        'mars-stroke', 'mars-stroke-h', 'mars-stroke-v', 'mask', 'medal',
        'medkit', 'meh', 'meh-blank', 'meh-rolling-eyes', 'memory',
        'menorah', 'mercury', 'meteor', 'microchip', 'microphone',
        'microphone-alt', 'microphone-alt-slash', 'microphone-slash',
        'microscope', 'minus', 'minus-circle', 'minus-square', 'mitten',
        'mobile', 'mobile-alt', 'money-bill', 'money-bill-alt',
        'money-bill-wave', 'money-bill-wave-alt', 'money-check',
        'money-check-alt', 'monument', 'moon', 'mortar-pestle',
        'mosque', 'motorcycle', 'mountain', 'mouse', 'mouse-pointer',
        'mug-hot', 'music', 'network-wired', 'neuter', 'newspaper',
        'not-equal', 'notes-medical', 'object-group', 'object-ungroup',
        'oil-can', 'om', 'otter', 'outdent', 'pager', 'paint-brush',
        'paint-roller', 'palette', 'pallet', 'paper-plane', 'paperclip',
        'parachute-box', 'paragraph', 'parking', 'passport', 'pastafarianism',
        'paste', 'pause', 'pause-circle', 'paw', 'peace', 'pen',
        'pen-alt', 'pen-fancy', 'pen-nib', 'pen-square', 'pencil-alt',
        'pencil-ruler', 'people-arrows', 'people-carry', 'pepper-hot',
        'percent', 'percentage', 'person-booth', 'phone', 'phone-alt',
        'phone-slash', 'phone-square', 'phone-square-alt', 'phone-volume',
        'photo-video', 'piggy-bank', 'pills', 'pizza-slice', 'place-of-worship',
        'plane', 'plane-arrival', 'plane-departure', 'plane-slash',
        'play', 'play-circle', 'plug', 'plus', 'plus-circle', 'plus-square',
        'podcast', 'poll', 'poll-h', 'poo', 'poo-storm', 'poop',
        'portrait', 'pound-sign', 'power-off', 'pray', 'praying-hands',
        'prescription', 'prescription-bottle', 'prescription-bottle-alt',
        'print', 'procedures', 'project-diagram', 'pump-medical',
        'pump-soap', 'puzzle-piece', 'qrcode', 'question', 'question-circle',
        'quidditch', 'quote-left', 'quote-right', 'quran', 'radiation',
        'radiation-alt', 'rainbow', 'random', 'receipt', 'record-vinyl',
        'recycle', 'redo', 'redo-alt', 'registered', 'remove-format',
        'reply', 'reply-all', 'republican', 'restroom', 'retweet',
        'ribbon', 'ring', 'road', 'robot', 'rocket', 'route',
        'rss', 'rss-square', 'ruble-sign', 'ruler', 'ruler-combined',
        'ruler-horizontal', 'ruler-vertical', 'running', 'rupee-sign',
        'sad-cry', 'sad-tear', 'satellite', 'satellite-dish', 'save',
        'school', 'screwdriver', 'scroll', 'sd-card', 'search',
        'search-dollar', 'search-location', 'search-minus', 'search-plus',
        'seedling', 'server', 'shapes', 'share', 'share-alt',
        'share-alt-square', 'share-square', 'shekel-sign', 'shield-alt',
        'shield-virus', 'ship', 'shipping-fast', 'shoe-prints', 'shopping-bag',
        'shopping-basket', 'shopping-cart', 'shower', 'shuttle-van',
        'sign', 'sign-in-alt', 'sign-language', 'sign-out-alt', 'signal',
        'signature', 'sim-card', 'sink', 'sitemap', 'skating',
        'skiing', 'skiing-nordic', 'skull', 'skull-crossbones', 'slash',
        'sleigh', 'sliders-h', 'smile', 'smile-beam', 'smile-wink',
        'smog', 'smoking', 'smoking-ban', 'sms', 'snowboarding',
        'snowflake', 'snowman', 'snowplow', 'soap', 'socks', 'solar-panel',
        'sort', 'sort-alpha-down', 'sort-alpha-down-alt', 'sort-alpha-up',
        'sort-alpha-up-alt', 'sort-amount-down', 'sort-amount-down-alt',
        'sort-amount-up', 'sort-amount-up-alt', 'sort-down', 'sort-numeric-down',
        'sort-numeric-down-alt', 'sort-numeric-up', 'sort-numeric-up-alt',
        'sort-up', 'spa', 'space-shuttle', 'spell-check', 'spider',
        'spinner', 'splotch', 'spray-can', 'square', 'square-full',
        'square-root-alt', 'stamp', 'star', 'star-and-crescent', 'star-half',
        'star-half-alt', 'star-of-david', 'star-of-life', 'step-backward',
        'step-forward', 'stethoscope', 'sticky-note', 'stop', 'stop-circle',
        'stopwatch', 'stopwatch-20', 'store', 'store-alt', 'store-alt-slash',
        'store-slash', 'stream', 'street-view', 'strikethrough', 'stroopwafel',
        'subscript', 'subway', 'suitcase', 'suitcase-rolling', 'sun',
        'superscript', 'surprise', 'swatchbook', 'swimmer', 'swimming-pool',
        'synagogue', 'sync', 'sync-alt', 'syringe', 'table', 'table-tennis',
        'tablet', 'tablet-alt', 'tablets', 'tachometer-alt', 'tag',
        'tags', 'tape', 'tasks', 'taxi', 'teeth', 'teeth-open',
        'temperature-high', 'temperature-low', 'tenge', 'terminal',
        'text-height', 'text-width', 'th', 'th-large', 'th-list',
        'theater-masks', 'thermometer', 'thermometer-empty', 'thermometer-full',
        'thermometer-half', 'thermometer-quarter', 'thermometer-three-quarters',
        'thumbs-down', 'thumbs-up', 'thumbtack', 'ticket-alt', 'times',
        'times-circle', 'tint', 'tint-slash', 'tired', 'toggle-off',
        'toggle-on', 'toilet', 'toilet-paper', 'toilet-paper-slash',
        'toolbox', 'tools', 'tooth', 'torah', 'torii-gate', 'tractor',
        'trademark', 'traffic-light', 'trailer', 'train', 'tram',
        'transgender', 'transgender-alt', 'trash', 'trash-alt', 'trash-restore',
        'trash-restore-alt', 'tree', 'trophy', 'truck', 'truck-monster', 'truck-moving', 'truck-pickup', 'tshirt',
        'tty', 'tv', 'umbrella', 'umbrella-beach', 'underline',
        'undo', 'undo-alt', 'universal-access', 'university', 'unlink',
        'unlock', 'unlock-alt', 'upload', 'user', 'user-alt',
        'user-alt-slash', 'user-astronaut', 'user-check', 'user-circle',
        'user-clock', 'user-cog', 'user-edit', 'user-friends', 'user-graduate',
        'user-injured', 'user-lock', 'user-md', 'user-minus', 'user-ninja',
        'user-nurse', 'user-plus', 'user-secret', 'user-shield', 'user-slash',
        'user-tag', 'user-tie', 'user-times', 'users', 'users-cog',
        'users-slash', 'utensil-spoon', 'utensils', 'vector-square',
        'venus', 'venus-double', 'venus-mars', 'vest', 'vest-patches',
        'vial', 'vials', 'video', 'video-slash', 'vihara', 'virus',
        'virus-slash', 'viruses', 'voicemail', 'volleyball-ball', 'volume-down',
        'volume-mute', 'volume-off', 'volume-up', 'vote-yea', 'vr-cardboard',
        'walking', 'wallet', 'warehouse', 'water', 'wave-square',
        'weight', 'weight-hanging', 'wheelchair', 'wifi', 'wind',
        'window-close', 'window-maximize', 'window-minimize', 'window-restore',
        'wine-bottle', 'wine-glass', 'wine-glass-alt', 'won-sign',
        'wrench', 'x-ray', 'yen-sign', 'yin-yang'
      ];

      const regularIcons = [
        'address-book', 'address-card', 'angry', 'arrow-alt-circle-down',
        'arrow-alt-circle-left', 'arrow-alt-circle-right', 'arrow-alt-circle-up',
        'bell', 'bell-slash', 'bookmark', 'building', 'calendar',
        'calendar-alt', 'calendar-check', 'calendar-minus', 'calendar-plus',
        'calendar-times', 'caret-square-down', 'caret-square-left',
        'caret-square-right', 'caret-square-up', 'chart-bar', 'check-circle',
        'check-square', 'circle', 'clipboard', 'clock', 'clone',
        'closed-captioning', 'comment', 'comment-alt', 'comment-dots',
        'comments', 'compass', 'copy', 'copyright', 'credit-card',
        'dizzy', 'dot-circle', 'edit', 'envelope', 'envelope-open',
        'eye', 'eye-slash', 'file', 'file-alt', 'file-archive',
        'file-audio', 'file-code', 'file-excel', 'file-image', 'file-pdf',
        'file-powerpoint', 'file-video', 'file-word', 'flag', 'flushed',
        'folder', 'folder-open', 'font-awesome-logo-full', 'frown',
        'frown-open', 'grimace', 'grin', 'grin-alt', 'grin-beam',
        'grin-beam-sweat', 'grin-hearts', 'grin-squint', 'grin-squint-tears',
        'grin-stars', 'grin-tears', 'grin-tongue', 'grin-tongue-squint',
        'grin-tongue-wink', 'grin-wink', 'hand-lizard', 'hand-paper',
        'hand-peace', 'hand-point-down', 'hand-point-left', 'hand-point-right',
        'hand-point-up', 'hand-pointer', 'hand-rock', 'hand-scissors',
        'hand-spock', 'handshake', 'hdd', 'heart', 'hospital',
        'hourglass', 'id-badge', 'id-card', 'image', 'images',
        'keyboard', 'kiss', 'kiss-beam', 'kiss-wink-heart', 'laugh',
        'laugh-beam', 'laugh-squint', 'laugh-wink', 'lemon', 'life-ring',
        'lightbulb', 'list-alt', 'map', 'meh', 'meh-blank',
        'meh-rolling-eyes', 'minus-square', 'money-bill-alt', 'moon',
        'newspaper', 'object-group', 'object-ungroup', 'paper-plane',
        'pause-circle', 'play-circle', 'plus-square', 'question-circle',
        'registered', 'sad-cry', 'sad-tear', 'save', 'share-square',
        'smile', 'smile-beam', 'smile-wink', 'snowflake', 'square',
        'star', 'star-half', 'sticky-note', 'stop-circle', 'sun',
        'surprise', 'thumbs-down', 'thumbs-up', 'times-circle', 'tired',
        'trash-alt', 'user', 'user-circle', 'window-close', 'window-maximize',
        'window-minimize', 'window-restore'
      ];

      const brandIcons = [
        '500px', 'accessible-icon', 'accusoft', 'acquisitions-incorporated',
        'adn', 'adobe', 'adversal', 'affiliatetheme', 'airbnb', 'algolia',
        'alipay', 'amazon', 'amazon-pay', 'amilia', 'android', 'angellist',
        'angrycreative', 'angular', 'app-store', 'app-store-ios',
        'apper', 'apple', 'apple-pay', 'artstation', 'asymmetrik',
        'atlassian', 'audible', 'autoprefixer', 'avianex', 'aviato',
        'aws', 'bandcamp', 'battle-net', 'behance', 'behance-square',
        'bimobject', 'bitbucket', 'bitcoin', 'bity', 'black-tie',
        'blackberry', 'blogger', 'blogger-b', 'bluetooth', 'bluetooth-b',
        'bootstrap', 'btc', 'buffer', 'buromobelexperte', 'buy-n-large',
        'buysellads', 'canadian-maple-leaf', 'cc-amazon-pay', 'cc-amex', 'cc-apple-pay',
        'cc-diners-club', 'cc-discover', 'cc-jcb', 'cc-mastercard',
        'cc-paypal', 'cc-stripe', 'cc-visa', 'centercode', 'centos',
        'chrome', 'chromecast', 'cloudflare', 'cloudscale', 'cloudsmith',
        'cloudversify', 'codepen', 'codiepie', 'confluence', 'connectdevelop',
        'contao', 'cotton-bureau', 'cpanel', 'creative-commons',
        'creative-commons-by', 'creative-commons-nc', 'creative-commons-nc-eu',
        'creative-commons-nc-jp', 'creative-commons-nd', 'creative-commons-pd',
        'creative-commons-pd-alt', 'creative-commons-remix', 'creative-commons-sa',
        'creative-commons-sampling', 'creative-commons-sampling-plus', 'creative-commons-share',
        'creative-commons-zero', 'critical-role', 'css3', 'css3-alt',
        'cuttlefish', 'd-and-d', 'd-and-d-beyond', 'dailymotion',
        'dashcube', 'deezer', 'delicious', 'deploydog', 'deskpro',
        'dev', 'deviantart', 'dhl', 'diaspora', 'digg', 'digital-ocean',
        'discord', 'discourse', 'dochub', 'docker', 'draft2digital',
        'dribbble', 'dribbble-square', 'dropbox', 'drupal', 'dyalog',
        'earlybirds', 'ebay', 'edge', 'edge-legacy', 'elementor',
        'ello', 'ember', 'empire', 'envira', 'erlang', 'ethereum',
        'etsy', 'evernote', 'expeditedssl', 'facebook', 'facebook-f',
        'facebook-messenger', 'facebook-square', 'fantasy-flight-games',
        'fedex', 'fedora', 'figma', 'firefox', 'firefox-browser',
        'first-order', 'first-order-alt', 'firstdraft', 'flickr',
        'flipboard', 'fly', 'font-awesome', 'font-awesome-alt',
        'font-awesome-flag', 'font-awesome-logo-full', 'fonticons',
        'fonticons-fi', 'fort-awesome', 'fort-awesome-alt', 'forumbee',
        'foursquare', 'free-code-camp', 'freebsd', 'fulcrum', 'galactic-republic',
        'galactic-senate', 'get-pocket', 'gg', 'gg-circle', 'git',
        'git-alt', 'git-square', 'github', 'github-alt', 'github-square',
        'gitkraken', 'gitlab', 'gitter', 'glide', 'glide-g', 'gofore',
        'goodreads', 'goodreads-g', 'google', 'google-drive', 'google-pay',
        'google-play', 'google-plus', 'google-plus-g', 'google-plus-square',
        'google-wallet', 'gratipay', 'grav', 'gripfire', 'grunt',
        'gulp', 'hacker-news', 'hacker-news-square', 'hackerrank',
        'hips', 'hire-a-helper', 'hooli', 'hornbill', 'hotjar',
        'houzz', 'html5', 'hubspot', 'ideal', 'imdb', 'instagram',
        'instagram-square', 'intercom', 'internet-explorer', 'invision',
        'ioxhost', 'itch-io', 'itunes', 'itunes-note', 'java', 'jedi-order',
        'jenkins', 'jira', 'joget', 'joomla', 'js', 'js-square',
        'jsfiddle', 'kaggle', 'keybase', 'keycdn', 'kickstarter',
        'kickstarter-k', 'korvue', 'laravel', 'lastfm', 'lastfm-square',
        'leanpub', 'less', 'line', 'linkedin', 'linkedin-in',
        'linode', 'linux', 'lyft', 'magento', 'mailchimp',
        'mandalorian', 'markdown', 'mastodon', 'maxcdn', 'mdb',
        'medapps', 'medium', 'medium-m', 'medrt', 'meetup', 'megaport',
        'mendeley', 'microblog', 'microsoft', 'mix', 'mixcloud',
        'mixer', 'mizuni', 'modx', 'monero', 'napster', 'neos',
        'nimblr', 'node', 'node-js', 'npm', 'ns8', 'nutritionix',
        'odnoklassniki', 'odnoklassniki-square', 'old-republic', 'opencart',
        'openid', 'opera', 'optin-monster', 'orcid', 'osi', 'page4',
        'pagelines', 'palfed', 'patreon', 'paypal', 'penny-arcade',
        'periscope', 'phabricator', 'phoenix-framework', 'phoenix-squadron',
        'php', 'pied-piper', 'pied-piper-alt', 'pied-piper-hat',
        'pied-piper-pp', 'pied-piper-square', 'pinterest', 'pinterest-p',
        'pinterest-square', 'playstation', 'product-hunt', 'pushed',
        'python', 'qq', 'quinscape', 'quora', 'r-project', 'raspberry-pi',
        'ravelry', 'react', 'reacteurope', 'readme', 'rebel', 'red-river',
        'reddit', 'reddit-alien', 'reddit-square', 'redhat', 'renren',
        'replyd', 'researchgate', 'resolving', 'rev', 'rocketchat',
        'rockrms', 'rust', 'safari', 'salesforce', 'sass', 'schlix',
        'scribd', 'searchengin', 'sellcast', 'sellsy', 'servicestack',
        'shirtsinbulk', 'shopify', 'shopware', 'simplybuilt', 'sistrix',
        'sith', 'sketch', 'skyatlas', 'skype', 'slack', 'slack-hash',
        'slideshare', 'snapchat', 'snapchat-ghost', 'snapchat-square',
        'soundcloud', 'sourcetree', 'speakap', 'speaker-deck', 'spotify',
        'squarespace', 'stack-exchange', 'stack-overflow', 'stackpath',
        'staylinked', 'steam', 'steam-square', 'steam-symbol', 'sticker-mule',
        'strava', 'stripe', 'stripe-s', 'studiovinari', 'stumbleupon',
        'stumbleupon-circle', 'superpowers', 'supple', 'suse', 'swift',
        'symfony', 'teamspeak', 'telegram', 'telegram-plane', 'tencent-weibo',
        'the-red-yeti', 'themeco', 'themeisle', 'think-peaks', 'tiktok',
        'trade-federation', 'trello', 'tripadvisor', 'tumblr', 'tumblr-square',
        'twitch', 'twitter', 'twitter-square', 'typo3', 'uber', 'ubuntu',
        'uikit', 'umbraco', 'uniregistry', 'unity', 'unsplash',
        'untappd', 'ups', 'usb', 'usps', 'ussunnah', 'vaadin',
        'viacoin', 'viadeo', 'viadeo-square', 'viber', 'vimeo',
        'vimeo-square', 'vimeo-v', 'vine', 'vk', 'vnv', 'vuejs',
        'waze', 'weebly', 'weibo', 'weixin', 'whatsapp', 'whatsapp-square',
        'whmcs', 'wikipedia-w', 'windows', 'wix', 'wizards-of-the-coast',
        'wolf-pack-battalion', 'wordpress', 'wordpress-simple', 'wpbeginner',
        'wpexplorer', 'wpforms', 'wpressr', 'xbox', 'xing', 'xing-square',
        'y-combinator', 'yahoo', 'yammer', 'yandex', 'yandex-international',
        'yarn', 'yelp', 'yoast', 'youtube', 'youtube-square', 'zhihu'
      ];

      const icons = [
        ...solidIcons.map(id => ({id, prefix: 's', type: 'solid', name: formatFontAwesomeName(id)})),
        ...regularIcons.map(id => ({id, prefix: 'r', type: 'regular', name: formatFontAwesomeName(id) + ' Regular'})),
        ...brandIcons.map(id => ({id, prefix: 'b', type: 'brands', name: formatFontAwesomeName(id)}))
      ];

      return icons;
    };

    // 运行检测和处理
    const detectedIcons = detectFontAwesomeIcons();

    // 确保CSS样式表已加载
    ensureFontAwesomeCssLoaded();

    // 更新状态
    fontawesomeIcons.value = detectedIcons;
    fontawesomeLoaded.value = true;
    localStorage.setItem('fontawesome-loaded', 'true');

    message.success(`成功加载 ${detectedIcons.length} 个Font Awesome图标`);
  } catch (error) {
    console.error('加载Font Awesome图标失败:', error);
    message.error('加载Font Awesome图标失败');
  } finally {
    fontawesomeLoading.value = false;
  }
};

// 确保Font Awesome CSS样式表已加载
const ensureFontAwesomeCssLoaded = () => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(linkElement);
  }
};

// 格式化Font Awesome图标名称
const formatFontAwesomeName = (name) => {
  return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
};

// 打开图标管理模态框
const openIconManager = () => {
  iconManagerVisible.value = true;
  loadScriptsList();
  // 重置表单状态
  iconProjectUrl.value = localStorage.getItem('last-iconfont-url') || '';
  validateIconUrl();
};


// 加载已有脚本列表
const loadScriptsList = () => {
  loadingScripts.value = true;
  try {
    // 从localStorage获取已加载的脚本
    const scripts = localStorage.getItem('iconfont-scripts');
    if (scripts) {
      loadedScripts.value = JSON.parse(scripts);
    } else {
      loadedScripts.value = [];
    }
  } catch (error) {
    console.error('加载图标脚本列表失败:', error);
    loadedScripts.value = [];
  } finally {
    loadingScripts.value = false;
  }
};

// 验证IconFont URL
const validateIconUrl = () => {
  if (!iconProjectUrl.value) {
    urlValidateStatus.value = '';
    urlValidateMessage.value = '';
    return;
  }

  const url = iconProjectUrl.value.trim();

  // 基本格式验证
  if (!url.includes('alicdn.com') || !url.includes('font_')) {
    urlValidateStatus.value = 'error';
    urlValidateMessage.value = '请输入有效的iconfont项目URL (应包含alicdn.com和font_)';
    return;
  }

  // 检查是否为JS文件
  if (!url.endsWith('.js')) {
    urlValidateStatus.value = 'error';
    urlValidateMessage.value = '请确保链接指向.js文件';
    return;
  }

  // 检查是否重复
  if (loadedScripts.value.some(script => {
    return normalizeUrl(script) === normalizeUrl(url);
  })) {
    urlValidateStatus.value = 'warning';
    urlValidateMessage.value = '此图标库已加载，继续将会重新加载';
    return;
  }

  urlValidateStatus.value = 'success';
  urlValidateMessage.value = '';
};

// 规范化URL
const normalizeUrl = (url) => {
  // 移除首尾空格
  url = url.trim();

  // 如果URL不含协议且不以//开头，添加//
  if (!url.match(/^(https?:)?\/\//i) && !url.startsWith('//')) {
    url = `//${url}`;
  }

  return url;
};

// 格式化显示URL
const formatScriptUrl = (url) => {
  // 显示最后的文件名部分
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];

  // 如果文件名太长，截断中间部分
  if (fileName.length > 30) {
    return `${fileName.substring(0, 15)}...${fileName.substring(fileName.length - 10)}`;
  }

  return fileName;
};


// 复制脚本URL
const copyScriptUrl = (url) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
        .then(() => {
          message.success('URL已复制到剪贴板');
        })
        .catch(() => {
          fallbackCopy(url);
        });
  } else {
    fallbackCopy(url);
  }
};

// 回退复制方法
const fallbackCopy = (text) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      message.success('URL已复制到剪贴板');
    } else {
      message.error('复制失败，请手动复制');
    }
  } catch (error) {
    message.error('复制失败，请手动复制');
  }
};

// 移除脚本
const removeScript = async (url) => {
  try {
    loadingScripts.value = true;
    await iconService.removeIconScript(url);
    message.success('图标库已成功移除');
    loadScriptsList();
    // 重新加载图标列表
    loadIcons();
  } catch (error) {
    console.error('移除图标库失败:', error);
    message.error('移除图标库失败，请刷新页面后重试');
  } finally {
    loadingScripts.value = false;
  }
};


// 更新图标库
const updateIconLibrary = async () => {
  if (!iconProjectUrl.value) {
    message.error('请输入有效的iconfont项目URL');
    return;
  }

  // 最后验证一次
  validateIconUrl();
  if (urlValidateStatus.value === 'error') {
    return;
  }

  updateLoading.value = true;

  try {
    // 规范化URL
    const normalizedUrl = normalizeUrl(iconProjectUrl.value);

    // 显示加载提示
    const loadingMessage = message.loading('正在更新图标库...', 0);

    // 使用图标服务加载外部图标
    await iconService.loadExternalIcons(normalizedUrl);

    // 关闭加载提示
    loadingMessage();

    // 保存最后使用的URL
    localStorage.setItem('last-iconfont-url', normalizedUrl);

    // 刷新脚本列表
    loadScriptsList();

    // 重新加载图标（延迟一点以确保图标已完全加载）
    setTimeout(async () => {
      await loadIcons();
      message.success('图标库已成功更新，新图标已加载');
    }, 500);

    // 提醒用户更新index.html
    const latestUrl = localStorage.getItem('latest-iconfont-url');
    if (latestUrl) {
      setTimeout(() => {
        message.info({
          title: '更新提示',
          content: `为确保下次启动应用时图标库仍然可用，建议更新index.html中的iconfont脚本链接为:\n${latestUrl}`,
          okText: '知道了'
        });
      }, 1000);
    }

    iconManagerVisible.value = false;
  } catch (error) {
    console.error('更新图标库失败:', error);
    message.error(error.message || '无法加载图标资源，请检查URL是否正确');
  } finally {
    updateLoading.value = false;
  }
};

// 复制文本到剪贴板
const copyToClipboard = (text, successMessage = '复制成功') => {
  // 使用新的Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
        .then(() => {
          showCopySuccess(successMessage);
        })
        .catch(err => {
          console.error('复制失败:', err);
          fallbackCopy(text, successMessage);
        });
  } else {
    fallbackCopy(text, successMessage);
  }
};


// 显示复制成功提示
const showCopySuccess = (successMessage) => {
  copySuccessText.value = successMessage;
  copySuccessVisible.value = true;

  // 清除之前的定时器
  if (copySuccessTimer.value) {
    clearTimeout(copySuccessTimer.value);
  }

  // 设置新的定时器自动隐藏提示
  copySuccessTimer.value = setTimeout(() => {
    copySuccessVisible.value = false;
  }, 2000);
};

// 复制IconFont组件代码
const copyIconCode = (iconId) => {
  const code = `<IconFont type="${iconId}" />`;
  copyToClipboard(code, '组件代码已复制');
};

// 复制IconFont ID
const copyIconId = (iconId) => {
  copyToClipboard(iconId, 'ID已复制');
};

// 复制Ant Design组件代码
const copyAntIconCode = (iconName) => {
  const code = `<${iconName} />`;
  const importStmt = `import { ${iconName} } from '@ant-design/icons-vue';`;
  copyToClipboard(`${importStmt}\n\n${code}`, '组件代码已复制');
};

// 复制Ant Design图标名称
const copyAntIconName = (iconName) => {
  copyToClipboard(iconName, '图标名称已复制');
};

// 复制Font Awesome组件代码
const copyFontAwesomeCode = (icon) => {
  const prefix = icon.prefix;
  const iconName = icon.id;
  const typeMap = {'s': 'solid', 'r': 'regular', 'b': 'brands'};
  const iconType = typeMap[prefix] || 'solid';
  const pascalCaseName = convertToUpperCamelCase(iconName);

  // 方法1: 导入单个图标
  const importStatement = `// 方法1: 导入单个图标\nimport { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';\nimport { fa${pascalCaseName} } from '@fortawesome/free-${iconType}-svg-icons';`;
  const useStatement = `<FontAwesomeIcon :icon="fa${pascalCaseName}" style="font-size: 24px; color: currentColor;" />`;

  // 方法2: 使用全局注册的图标
  const globalStatement = `// 方法2: 使用全局注册的图标 (确保在main.js中已导入相关库)\n<font-awesome-icon :icon="['fa${prefix}', '${iconName}']" style="font-size: 24px; color: currentColor;" />`;

  // 方法3: 直接使用HTML
  const htmlStatement = `// 方法3: 直接使用HTML (需要引入Font Awesome CSS)\n<i class="fa${prefix} fa-${iconName}"></i>`;

  copyToClipboard(`${importStatement}\n\n${useStatement}\n\n${globalStatement}\n\n${htmlStatement}`, '组件代码已复制');
};

// 复制Font Awesome图标名称
const copyFontAwesomeName = (iconName) => {
  copyToClipboard(iconName, '图标名称已复制');
};

// 复制预览代码
const copyPreviewCode = () => {
  copyToClipboard(previewCode.value, '代码已复制');
};

// 预览IconFont图标
const previewIcon = (icon) => {
  previewType.value = 'iconfont';
  previewIconData.value = icon;
  previewVisible.value = true;
};

// 预览Ant Design图标
const previewAntIcon = (icon) => {
  previewType.value = 'ant';
  previewIconData.value = icon;
  previewVisible.value = true;
};

// 预览Font Awesome图标
const previewFontAwesomeIcon = (icon) => {
  previewType.value = 'fontawesome';
  previewIconData.value = icon;
  previewVisible.value = true;
};

</script>

<style scoped>
.icon-management-container {
  padding: 16px;
  background-color: #f6f8fa;
  min-height: 100vh;
}

.content-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  margin-bottom: 16px;
}

.tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.tool-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-button {
  display: flex;
  align-items: center;
  color: #6554C0;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding: 8px;
}

.icon-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
  background-color: white;
  position: relative;
  overflow: hidden;
  height: 78px;
}



.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  font-size: 20px;
  margin-bottom: 8px;
  color: #595959;
  transition: all 0.2s ease;
}

.icon-name {
  font-size: 11px;
  line-height: 1.2;
  color: #8c8c8c;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: -5px;
  padding: 0 2px;
}

.icon-grid-item:hover {
  border-color: var(--primary-color, #6554C0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.15);
  background-color: var(--primary-lighter, #f0ebff);
}


.icon-grid-item:hover .icon-wrapper {
  color: var(--primary-color, #6554C0);
  transform: scale(1.1);
}

.icon-grid-item:hover .icon-name {
  color: var(--primary-color, #6554C0);
}

.icon-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(101, 84, 192, 0.9);
  display: flex;
  justify-content: space-around;
  padding: 4px;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}


.icon-grid-item:hover .icon-actions {
  opacity: 1;
  transform: translateY(0);
}

/* 当前选中的图标样式 */
.icon-grid-item.selected {
  border: 2px solid var(--primary-color, #6554C0);
  background-color: var(--primary-lighter, #f0ebff);
}

.icon-grid-item.selected::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent var(--primary-color, #6554C0) transparent transparent;
}


/* 图标管理模态框样式 */
.info-box {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0 24px;
  border-left: 3px solid #6554C0;
}

.info-box h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 12px;
  color: #6554C0;
  font-size: 15px;
}

.info-box ol {
  padding-left: 20px;
  margin-bottom: 0;
}

.info-box li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.info-box a {
  color: #6554C0;
  text-decoration: none;
  transition: color 0.3s;
}

.info-box a:hover {
  color: #6554C0;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 脚本列表样式 */
.script-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.script-url {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  color: #666;
  font-size: 13px;
}

.script-actions {
  display: flex;
  gap: 12px;
}

/* 图标动作按钮美化 */
.action-icon {
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:hover {
  transform: scale(1.2);
  filter: brightness(1.1);
}

.action-icon.delete:hover {
  color: #ff4d4f;
}

.empty-scripts {
  padding: 24px 0;
}

/* 预览模态框样式 */
.preview-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  padding: 16px;
}

.preview-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f6f8fa 0%, #eff3f9 100%);
  border-radius: 8px;
}

.preview-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  width: 40px;
  font-weight: 500;
  color: #595959;
}

.control-value {
  min-width: 40px;
  text-align: right;
  color: #8c8c8c;
  font-size: 13px;
}

.preview-code {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.code-content {
  margin: 0;
  max-height: 150px;
  overflow: auto;
  background: #272822;
  color: #f8f8f2;
  border-radius: 4px;
  padding: 12px;
  font-size: 13px;
}

.code-content pre {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, Monaco, 'Andale Mono', monospace;
}

/* 复制成功提示 */
.copy-success-modal {
  position: fixed;
  top: 24px;
  right: 24px;
}

.copy-success-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.success-icon {
  color: #52c41a;
  font-size: 18px;
}

/* Font Awesome设置区域 */
.setup-fontawesome {
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.setup-info {
  margin-bottom: 16px;
}

.setup-info h3 {
  margin-top: 0;
  color: #6554C0;
  font-size: 16px;
}

.setup-info code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, Monaco, monospace;
  font-size: 85%;
}

.setup-actions {
  display: flex;
  gap: 12px;
}

.custom-radio-group {
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: flex-end; /* 改为右对齐 */
  align-items: center;
  margin-top: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .pagination-container {
    justify-content: flex-end;
  }
}

.header-banner {
  background: linear-gradient(135deg, #6554C0 0%, #8A75DA 100%);
  border-radius: 10px;
  padding: 24px 32px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(101, 84, 192, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.title-section {
  color: white;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
}

.sub-title {
  font-size: 14px;
  opacity: 0.9;
  margin: 6px 0 0 0;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.add-library-btn {
  background: white;
  color: #6554C0;
  border: none;
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.add-library-btn:hover {
  background: #f9f9f9;
  color: #6554C0;
}

.add-library-btn:active {
  background: #f0f0f0;
}

.decoration-dots {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.dot-1 {
  width: 120px;
  height: 120px;
  right: -40px;
  bottom: -40px;
}

.dot-2 {
  width: 80px;
  height: 80px;
  right: 40px;
  bottom: 10px;
}

.dot-3 {
  width: 40px;
  height: 40px;
  right: 100px;
  bottom: 60px;
}

/* 媒体查询，适配小屏幕 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>