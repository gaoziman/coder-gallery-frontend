<template>
  <div class="icon-selector-wrapper">
        <div class="search-bar">
          <a-input
              v-model:value="searchText"
              placeholder="搜索图标"
              allow-clear
              @change="handleSearch"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>
        </div>

        <a-spin :spinning="loading">
          <a-empty
              v-if="filteredIcons.length === 0"
              description="未找到图标"
          >
            <template #extra>
              <a-button type="primary" @click="openIconManager">
                管理图标
              </a-button>
            </template>
          </a-empty>

          <div v-else class="icon-grid">
            <div
                v-for="icon in filteredIcons"
                :key="icon.id"
                class="icon-grid-item"
                :class="{ 'selected': selectedIcon === icon.id }"
                @click="selectIcon(icon.id)"
            >
              <div class="icon-wrapper">
                <IconFont :type="icon.id" size="24" />
              </div>
              <div class="icon-name">{{ icon.name }}</div>
            </div>
          </div>
        </a-spin>

    <!-- 图标管理模态框 -->
    <a-modal
        v-model:visible="iconManagerVisible"
        title="管理图标库"
        width="700px"
        :footer="null"
    >
      <a-form layout="vertical">
        <a-form-item label="iconfont 项目URL">
          <a-input
              v-model:value="iconProjectUrl"
              placeholder="如: //at.alicdn.com/t/c/font_4891495_bbjyzankq5r.js"
          />
        </a-form-item>

        <div class="info-box">
          <h4>如何更新图标库:</h4>
          <ol>
            <li>访问 <a href="https://www.iconfont.cn/" target="_blank">iconfont.cn</a> 并登录您的账号</li>
            <li>进入您的项目，添加所需图标</li>
            <li>在项目设置中，查看项目内的"Symbol"代码链接</li>
            <li>复制链接并粘贴到上方输入框</li>
            <li>点击"更新图标库"按钮应用更改</li>
          </ol>
        </div>

        <div class="form-actions">
          <a-button @click="iconManagerVisible = false">取消</a-button>
          <a-button type="primary" @click="updateIconLibrary" :loading="updateLoading">
            更新图标库
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import * as AntIcons from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import IconFont from '@/components/common/IconFont.vue';
import iconService from '@/api/IconService';

const props = defineProps({
  value: String
});

const emit = defineEmits(['update:value', 'select']);

// 状态
const loading = ref(false);
const antLoading = ref(false);
const icons = ref([]);
const antIcons = ref([]);
const searchText = ref('');
const antSearchText = ref('');
const selectedIcon = ref(props.value);
const iconManagerVisible = ref(false);
const iconProjectUrl = ref('');
const updateLoading = ref(false);

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
});

// 监听value变化
watch(() => props.value, (newVal) => {
  if (newVal !== selectedIcon.value) {
    selectedIcon.value = newVal;
  }
});

// 获取Ant Design图标
const loadAntIcons = () => {
  antLoading.value = true;

  try {
    const iconList = [];

    Object.entries(AntIcons).forEach(([name, component]) => {
      if (name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone')) {
        iconList.push({
          name,
          component,
          displayName: name.replace(/([A-Z])/g, ' $1').trim()
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
const loadIcons = () => {
  loading.value = true;

  try {
    // 从图标服务中获取所有图标
    icons.value = iconService.getAllIcons();

    // 如果没有图标，尝试等待图标加载完成
    if (icons.value.length === 0) {
      // 稍微延迟再次尝试加载
      setTimeout(() => {
        icons.value = iconService.getAllIcons();
        loading.value = false;
      }, 500);
    } else {
      loading.value = false;
    }
  } catch (error) {
    console.error('加载IconFont图标失败:', error);
    loading.value = false;
  }
};

// 打开图标管理模态框
const openIconManager = () => {
  iconManagerVisible.value = true;
};

// 更新图标库
const updateIconLibrary = async () => {
  if (!iconProjectUrl.value) {
    message.error('请输入有效的iconfont项目URL');
    return;
  }

  updateLoading.value = true;

  try {
    // 使用图标服务加载外部图标
    await iconService.loadExternalIcons(iconProjectUrl.value);

    // 保存URL到localStorage
    localStorage.setItem('iconfont-project-url', iconProjectUrl.value);

    // 重新加载图标
    loadIcons();

    message.success('图标库已成功更新');
    iconManagerVisible.value = false;
  } catch (error) {
    console.error('更新图标库失败:', error);
    message.error('无法加载图标资源，请检查URL是否正确');
  } finally {
    updateLoading.value = false;
  }
};

// 过滤IconFont图标
const filteredIcons = computed(() => {
  if (!searchText.value) return icons.value;

  const search = searchText.value.toLowerCase();
  return icons.value.filter(icon =>
      icon.id.toLowerCase().includes(search) ||
      icon.name.toLowerCase().includes(search)
  );
});

// 过滤Ant Design图标
const filteredAntIcons = computed(() => {
  if (!antSearchText.value) return antIcons.value;

  const search = antSearchText.value.toLowerCase();
  return antIcons.value.filter(icon =>
      icon.name.toLowerCase().includes(search) ||
      formatAntIconName(icon.name).toLowerCase().includes(search)
  );
});

// 选择图标
const selectIcon = (iconName) => {
  selectedIcon.value = iconName;
  emit('update:value', iconName);
  emit('select', iconName);
};

// 处理IconFont搜索和Ant Design搜索
const handleSearch = () => {};
const handleAntSearch = () => {};
</script>

<style scoped>
.icon-selector-wrapper {
  width: 100%;
}

.search-bar {
  margin-bottom: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
}

.icon-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.icon-grid-item:hover {
  background-color: #f5f5f5;
}

.icon-grid-item.selected {
  background-color: #f0eaff;
  border-color: #6554C0;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  font-size: 24px;
  margin-bottom: 8px;
}

.icon-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.info-box {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 12px 16px;
  margin: 16px 0;
}

.info-box h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.info-box ol {
  padding-left: 20px;
  margin-bottom: 0;
}

.info-box li {
  margin-bottom: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
</style>