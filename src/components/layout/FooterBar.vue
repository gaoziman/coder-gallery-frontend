<!-- src/components/layout/FooterBar.vue -->
<template>
  <a-layout-footer class="footer">
    <div class="footer-container">
      <!-- 第一行：主要内容区 -->
      <div class="footer-main">
        <!-- 左侧：品牌信息 -->
        <div class="footer-brand">
          <div class="brand-title">
            <span class="icon"><i class="ant-icon ant-icon-cloud"></i></span>
            智能云图库
          </div>
          <div class="brand-desc">发现、创作、分享，让创意无限展动</div>
          <div class="social-links">
            <a href="#" class="social-link"><i class="ant-icon ant-icon-wechat"></i></a>
            <a href="#" class="social-link"><i class="ant-icon ant-icon-weibo"></i></a>
            <a href="#" class="social-link"><i class="ant-icon ant-icon-notification"></i></a>
            <a href="#" class="social-link"><i class="ant-icon ant-icon-github"></i></a>
          </div>
        </div>

        <!-- 中间列：关于我们 -->
        <div class="footer-column">
          <h4>关于我们</h4>
          <ul>
            <li><a href="#">加入我们</a></li>
            <li><a href="#">合作伙伴</a></li>
          </ul>
        </div>

        <!-- 中间列：产品服务 -->
        <div class="footer-column">
          <h4>产品服务</h4>
          <ul>
            <li><a href="#">功能特性</a></li>
            <li><a href="#">API文档</a></li>
          </ul>
        </div>

        <!-- 中间列：支持与帮助 -->
        <div class="footer-column">
          <h4>支持与帮助</h4>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">常见问题</a></li>
          </ul>
        </div>

      </div>

      <!-- 第二行：底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          © {{ currentYear }} 智能云图库, 版权所有 &nbsp;&nbsp; 京ICP备12345678号-1
        </div>
        <div class="bottom-links">
          <a href="#">关于我们</a>
          <a href="#">使用条款</a>
          <a href="#">隐私政策</a>
          <a href="#">帮助中心</a>
          <a href="#">联系我们</a>
        </div>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #fff;
  padding: 40px 0 20px;
  border-top: 1px solid #f0f0f0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 主要内容区样式 */
.footer-main {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

/* 品牌区域样式 */
.footer-brand {
  flex: 0 0 240px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  display: flex;
  align-items: center;
}

.brand-title .icon {
  color: var(--primary-color, #722ed1);
  margin-right: 8px;
  font-size: 20px;
}

.brand-desc {
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.3s;
}

.social-link:hover {
  background: var(--primary-color, #722ed1);
  color: #fff;
}

/* 导航列样式 */
.footer-column {
  flex: 0 0 160px;
  margin-bottom: 20px;
}

.footer-column h4 {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column li {
  margin-bottom: 10px;
}

.footer-column a {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-column a:hover {
  color: var(--primary-color, #722ed1);
}

/* 联系方式样式 */
.footer-contact {
  flex: 0 0 240px;
}

.footer-contact h4 {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.contact-item i {
  margin-right: 8px;
  color: var(--primary-color, #722ed1);
  font-size: 16px;
}

/* 底部版权区域样式 */
.footer-bottom {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.copyright {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  margin-bottom: 10px;
}

.bottom-links {
  display: flex;
  flex-wrap: wrap;
}

.bottom-links a {
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
  margin-left: 16px;
  text-decoration: none;
  transition: color 0.3s;
}

.bottom-links a:hover {
  color: var(--primary-color, #722ed1);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .footer-brand, .footer-column, .footer-contact {
    flex: 0 0 calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .footer-main {
    flex-direction: column;
  }

  .footer-brand, .footer-column, .footer-contact {
    flex: 0 0 100%;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .bottom-links {
    justify-content: center;
    margin-top: 10px;
  }

  .bottom-links a {
    margin: 0 8px;
  }
}
</style>