<template>
  <div class="share-component">
    <!-- 使用a-dropdown包裹分享按钮，使按钮成为下拉菜单的触发元素 -->
    <a-dropdown
        :trigger="['click']"
        placement="bottom"
        overlayClassName="share-dropdown"
    >
      <!-- 分享按钮作为触发元素 -->
      <div
          class="share-button"
          role="button"
          tabindex="0"
          @keydown.enter="$event.target.click()"
      >
        <span class="icon-wrapper">
          <IconFont type="icon-fenxiang5" />
        </span>
        <span v-if="showText" class="share-text">分享</span>
      </div>

      <!-- 下拉菜单内容 -->
      <template #overlay>
        <a-menu>
          <a-menu-item key="link" @click="copyLink">
            <template #icon>
              <IconFont type="icon-fuzhi1" />
            </template>
            复制链接
          </a-menu-item>
          <a-menu-item key="qrcode" @click="showQrcodeModal">
            <template #icon>
              <IconFont type="icon-erweima" />
            </template>
            二维码分享
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <!-- 二维码模态框 -->
    <a-modal
        v-model:open="qrcodeModalVisible"
        :footer="null"
        :width="320"
        centered
        title="扫码分享"
        class="qrcode-modal"
        destroyOnClose
    >
      <div class="qrcode-container">
        <div class="qrcode-wrapper">
          <!-- 加载状态显示 -->
          <div v-if="qrcodeLoading" class="qrcode-loading">
            <a-spin />
            <div class="loading-text">生成二维码中...</div>
          </div>

          <!-- 错误状态显示 -->
          <div v-if="qrcodeError" class="qrcode-error">
            <a-result status="error" title="生成失败，请重试">
              <template #extra>
                <a-button type="primary" @click="retryGenerateQrcode">
                  重试
                </a-button>
              </template>
            </a-result>
          </div>

          <!-- 二维码容器 -->
          <div v-show="!qrcodeLoading && !qrcodeError" class="qrcode" ref="qrcodeRef"></div>
        </div>

        <div class="qrcode-actions">
          <a-button
              type="primary"
              @click="downloadQrcode"
              :disabled="qrcodeError || qrcodeLoading || !qrcodeGenerated"
          >
            <template #icon>
              <IconFont type="icon-chevron_circle_down" />
            </template>
            下载二维码
          </a-button>
          <a-button @click="copyLink">
            <template #icon><IconFont type="icon-fuzhi1" />
            </template>
            复制链接
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';

// 状态变量
const dropdownVisible = ref(false);
const qrcodeModalVisible = ref(false);
const qrcodeRef = ref(null);
const currentUrl = ref('');
const qrcodeLoading = ref(false);
const qrcodeError = ref(false);
const qrcodeGenerated = ref(false);

const props = defineProps({
  // 要分享的链接，默认为空字符串（安全处理）
  shareUrl: {
    type: String,
    default: ''
  },
  // 内容标题，用于下载二维码命名
  contentTitle: {
    type: String,
    default: '分享内容'
  },
  // 是否显示"分享"文字
  showText: {
    type: Boolean,
    default: false
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
});

// 在组件挂载后安全地获取当前URL
onMounted(() => {
  try {
    if (typeof window !== 'undefined') {
      currentUrl.value = window.location.href;
    }
  } catch (error) {
    console.error('获取页面URL失败:', error);
  }
});

// 获取要分享的URL，优先使用props传入的URL，其次使用当前页面URL
const getShareUrl = () => {
  return props.shareUrl || currentUrl.value || window.location.href || '';
};

// 显示二维码模态框
const showQrcodeModal = () => {
  qrcodeModalVisible.value = true;
  dropdownVisible.value = false;
  qrcodeError.value = false;
  qrcodeLoading.value = true;
  qrcodeGenerated.value = false;

  // 在DOM更新后生成二维码
  nextTick(() => {
    generateQrcode();
  });
};

// 监听模态框的可见性变化
watch(qrcodeModalVisible, (isVisible) => {
  if (isVisible && !qrcodeGenerated.value && !qrcodeLoading.value) {
    qrcodeLoading.value = true;
    nextTick(() => {
      generateQrcode();
    });
  }
});

// 重试生成二维码
const retryGenerateQrcode = () => {
  qrcodeError.value = false;
  qrcodeLoading.value = true;
  qrcodeGenerated.value = false;
  generateQrcode();
};

// 生成二维码 - 使用更可靠的方法
const generateQrcode = async () => {
  qrcodeLoading.value = true;
  qrcodeError.value = false;

  try {
    // 清除之前的二维码
    if (qrcodeRef.value) {
      qrcodeRef.value.innerHTML = '';
    }

    // 获取分享URL
    const url = getShareUrl();
    if (!url) {
      throw new Error('无法获取分享链接');
    }

    // 动态导入QRCode库
    const QRCodeModule = await import('qrcode');

    // 创建一个canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    // 生成二维码到canvas
    await QRCodeModule.default.toCanvas(canvas, url, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // 将canvas添加到DOM
    if (qrcodeRef.value) {
      qrcodeRef.value.appendChild(canvas);
      qrcodeGenerated.value = true;
    } else {
      throw new Error('二维码容器不存在');
    }

    qrcodeLoading.value = false;
  } catch (error) {
    console.error('生成二维码错误:', error);
    qrcodeError.value = true;
    qrcodeLoading.value = false;
    qrcodeGenerated.value = false;
    message.error('生成二维码失败，请重试');
  }
};

// 下载二维码
const downloadQrcode = () => {
  try {
    const canvas = qrcodeRef.value?.querySelector('canvas');
    if (!canvas) {
      throw new Error('找不到二维码canvas元素');
    }

    // 将canvas转换为图片并下载
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.contentTitle || 'qrcode'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    message.success('二维码已下载');
  } catch (error) {
    console.error('下载二维码出错:', error);
    message.error('下载二维码失败');
  }
};

// 复制链接
const copyLink = () => {
  const url = getShareUrl();

  if (!url) {
    message.error('无法获取分享链接，请重试');
    return;
  }

  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制');
    // 关闭打开的弹窗
    dropdownVisible.value = false;
    if (qrcodeModalVisible.value) {
      qrcodeModalVisible.value = false;
    }
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
};
</script>

<style scoped>
/* 基础组件样式 */
.share-component {
  display: inline-flex;
  position: relative;
}

/* 分享按钮样式优化 */
.share-button {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: transparent;
  color: #555;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.share-button:hover {
  transform: translateY(-2px);
  color: #6366f1;
  border-color: #6366f1;
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.15);
}

.share-button:active {
  transform: translateY(0);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-text {
  font-size: 14px;
  margin-left: 8px;
  font-weight: 500;
}

/* 二维码容器样式优化 */
.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.qrcode-wrapper {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  min-height: 260px;
  min-width: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.qrcode canvas {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 加载和错误状态样式 */
.qrcode-loading,
.qrcode-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 1;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

/* 按钮区域样式 */
.qrcode-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
}

.qrcode-actions .ant-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.qrcode-actions .ant-btn-primary {
  background: #6366f1;
  border-color: #6366f1;
}

.qrcode-actions .ant-btn-primary:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.qrcode-actions .ant-btn:not(.ant-btn-primary) {
  border-color: #e5e7eb;
}

.qrcode-actions .ant-btn:not(.ant-btn-primary):hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* QR码模态框样式 */
:deep(.qrcode-modal .ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

:deep(.qrcode-modal .ant-modal-header) {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

:deep(.qrcode-modal .ant-modal-title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

:deep(.qrcode-modal .ant-modal-body) {
  padding: 24px;
}

:deep(.qrcode-modal .ant-modal-close) {
  top: 16px;
  right: 16px;
}

:deep(.qrcode-modal .ant-result-title) {
  font-size: 16px;
}

/* 暗色模式样式优化 */
:global(.dark-theme) .share-button {
  color: #e6e6e6;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:global(.dark-theme) .share-button:hover {
  border-color: #818cf8;
  color: #818cf8;
  box-shadow: 0 3px 8px rgba(129, 140, 248, 0.2);
}

:global(.dark-theme) .qrcode-wrapper,
:global(.dark-theme) .qrcode-loading,
:global(.dark-theme) .qrcode-error {
  background: #1f1f1f;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

:global(.dark-theme) .qrcode canvas {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

:global(.dark-theme) .loading-text {
  color: #a0a0a0;
}

:global(.dark-theme) .qrcode-actions .ant-btn-primary {
  background: #818cf8;
  border-color: #818cf8;
}

:global(.dark-theme) .qrcode-actions .ant-btn-primary:hover {
  background: #6366f1;
  border-color: #6366f1;
}

:global(.dark-theme) .qrcode-actions .ant-btn:not(.ant-btn-primary) {
  border-color: #333;
  color: #e0e0e0;
}

:global(.dark-theme) .qrcode-actions .ant-btn:not(.ant-btn-primary):hover {
  border-color: #818cf8;
  color: #818cf8;
}

:global(.dark-theme) :deep(.qrcode-modal .ant-modal-content) {
  background: #1f1f1f;
}

:global(.dark-theme) :deep(.qrcode-modal .ant-modal-header) {
  background: #1f1f1f;
  border-bottom-color: #333;
}

:global(.dark-theme) :deep(.qrcode-modal .ant-modal-title) {
  color: #e0e0e0;
}

:global(.dark-theme) :deep(.ant-result-title) {
  color: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .qrcode-wrapper {
    padding: 16px;
    min-height: 240px;
    min-width: 240px;
  }

  .qrcode-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>