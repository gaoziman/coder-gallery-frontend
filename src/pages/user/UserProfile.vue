<template>
  <div class="user-profile-container">
    <!-- 沉浸式头部区域 -->
    <div class="immersive-header">
      <div class="profile-cover" :style="{ backgroundImage: userInfo.coverImage ? `url(${userInfo.coverImage})` : 'linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%)' }">
        <div class="cover-overlay"></div>
        <div class="cover-edit-button">
          <a-tooltip title="更换封面">
            <a-button type="primary" shape="circle" @click="handleChangeCover">
              <template #icon><camera-outlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 个人简介卡片 -->
      <div class="profile-card">
        <div class="profile-avatar">
          <a-avatar :size="100" :src="userInfo.avatar" />
          <div class="avatar-edit-button">
            <a-tooltip title="更换头像">
              <a-button type="primary" shape="circle" size="small" @click="handleChangeAvatar">
                <template #icon><camera-outlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
        <div class="profile-details">
          <div class="profile-name">{{ userInfo.username }}</div>
          <div class="profile-tags">
            <a-tag color="#6554C0" v-if="userInfo.role === 'vip'">
              <crown-outlined /> VIP用户
            </a-tag>
            <a-tag color="#52C41A" v-if="userInfo.credits > 500">
              <fire-outlined /> 活跃创作者
            </a-tag>
            <a-tag color="#FAAD14" v-if="userInfo.verified">
              <check-circle-outlined /> 已认证
            </a-tag>
          </div>
          <div class="profile-bio">{{ userInfo.bio || '这个人很懒，还没有写自我介绍...' }}</div>
          <div class="profile-location" v-if="userInfo.location">
            <environment-outlined /> {{ userInfo.location }}
          </div>
          <div class="profile-website" v-if="userInfo.website">
            <link-outlined /> <a :href="`https://${userInfo.website}`" target="_blank">{{ userInfo.website }}</a>
          </div>
        </div>
      </div>

      <!-- 用户数据统计 -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-value">{{ userStats.pictures }}</div>
          <div class="stat-label">作品</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ userStats.followers }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ userStats.following }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ userStats.likes }}</div>
          <div class="stat-label">获赞</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.credits }}</div>
          <div class="stat-label">积分</div>
        </div>
      </div>

      <!-- 用户操作按钮组 -->
      <div class="action-buttons">
        <a-button type="primary" @click="openEditProfileModal">
          <template #icon><edit-outlined /></template>
          编辑资料
        </a-button>
        <a-button @click="showUploadModal">
          <template #icon><upload-outlined /></template>
          上传作品
        </a-button>
        <a-dropdown :trigger="['click']">
          <a-button>
            <template #icon><setting-outlined /></template>
            更多操作
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="activeTabKey = 'settings'">
                <key-outlined /> 账户设置
              </a-menu-item>
              <a-menu-item key="2" @click="showShareModal">
                <share-alt-outlined /> 分享我的主页
              </a-menu-item>
              <a-menu-item key="3" @click="downloadUserData">
                <download-outlined /> 下载我的数据
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="content-container">
      <a-row :gutter="16">
        <!-- 左侧边栏 -->
        <a-col :xs="24" :sm="24" :md="7" :lg="6" :xl="5">
          <!-- 个人信息卡片 -->
          <a-card class="info-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <user-outlined /> 个人信息
                <a-button type="link" @click="openEditInfoModal" class="edit-button">
                  <edit-outlined />
                </a-button>
              </div>
            </template>
            <div class="info-list">
              <div class="info-item">
                <user-outlined />
                <span class="info-label">账号名</span>
                <span class="info-value">{{ userInfo.account }}</span>
              </div>
              <div class="info-item">
                <mail-outlined />
                <span class="info-label">邮箱</span>
                <span class="info-value">{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <phone-outlined />
                <span class="info-label">手机</span>
                <span class="info-value">{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <tag-outlined />
                <span class="info-label">角色</span>
                <span class="info-value">
                  <a-tag :color="getRoleColor(userInfo.role)">{{ getRoleName(userInfo.role) }}</a-tag>
                </span>
              </div>
              <div class="info-item">
                <calendar-outlined />
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ formatDate(userInfo.registerTime) }}</span>
              </div>
              <div class="info-item">
                <clock-circle-outlined />
                <span class="info-label">最近登录</span>
                <span class="info-value">{{ formatDate(userInfo.lastLoginTime) }}</span>
              </div>
            </div>
          </a-card>

          <!-- 存储空间卡片 -->
          <a-card class="storage-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <cloud-outlined /> 存储空间
                <a-tooltip title="升级VIP获取更多空间">
                  <a-button type="link" @click="showStorageUpgradeModal" class="upgrade-icon">
                    <crown-outlined />
                  </a-button>
                </a-tooltip>
              </div>
            </template>
            <div class="storage-info">
              <div class="storage-progress">
                <a-progress
                    type="dashboard"
                    :percent="Math.round((userStorage.used / userStorage.total) * 100)"
                    :stroke-color="storageProgressGradient"
                />
              </div>
              <div class="storage-details">
                <div class="storage-progress-text">
                  已使用 <span class="storage-highlight">{{ formatStorage(userStorage.used) }}</span> / 总容量 <span class="storage-highlight">{{ formatStorage(userStorage.total) }}</span>
                </div>
                <div class="storage-breakdown">
                  <div class="storage-type-item">
                    <div class="storage-type-color" style="background-color: #6554C0;"></div>
                    <div class="storage-type-label">图片</div>
                    <div class="storage-type-value">{{ formatStorage(userStorage.breakdown.images) }}</div>
                  </div>
                  <div class="storage-type-item">
                    <div class="storage-type-color" style="background-color: #36CFC9;"></div>
                    <div class="storage-type-label">视频</div>
                    <div class="storage-type-value">{{ formatStorage(userStorage.breakdown.videos) }}</div>
                  </div>
                  <div class="storage-type-item">
                    <div class="storage-type-color" style="background-color: #FF7A45;"></div>
                    <div class="storage-type-label">文档</div>
                    <div class="storage-type-value">{{ formatStorage(userStorage.breakdown.documents) }}</div>
                  </div>
                  <div class="storage-type-item">
                    <div class="storage-type-color" style="background-color: #FAAD14;"></div>
                    <div class="storage-type-label">其他</div>
                    <div class="storage-type-value">{{ formatStorage(userStorage.breakdown.others) }}</div>
                  </div>
                </div>
                <a-button type="primary" class="upgrade-button" @click="showStorageUpgradeModal">
                  <template #icon><cloud-upload-outlined /></template>
                  升级空间
                </a-button>
              </div>
            </div>
          </a-card>

          <!-- 成就与徽章卡片 -->
          <a-card class="badges-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <trophy-outlined /> 成就与徽章
              </div>
            </template>
            <div class="badges-container">
              <a-tooltip v-for="badge in userBadges" :key="badge.id" :title="badge.description">
                <div class="badge-item" :class="{ 'badge-locked': !badge.unlocked }">
                  <div class="badge-icon">
                    <component :is="badge.icon" />
                  </div>
                  <div class="badge-name">{{ badge.name }}</div>
                </div>
              </a-tooltip>
              <div class="view-all-badges">
                <a-button type="link" @click="showAllBadges">查看全部成就</a-button>
              </div>
            </div>
          </a-card>

          <!-- 活跃度热图卡片 -->
          <a-card class="activity-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <calendar-outlined /> 创作热图
                <a-tooltip title="连续创作可获得额外积分奖励">
                  <info-circle-outlined class="info-icon" />
                </a-tooltip>
              </div>
            </template>
            <div class="activity-stats">
              <div class="activity-stat-item">
                <div class="activity-stat-value">{{ activityStats.streak }}</div>
                <div class="activity-stat-label">连续创作</div>
              </div>
              <div class="activity-stat-item">
                <div class="activity-stat-value">{{ activityStats.total }}</div>
                <div class="activity-stat-label">总创作天数</div>
              </div>
              <div class="activity-stat-item">
                <div class="activity-stat-value">{{ activityStats.max }}</div>
                <div class="activity-stat-label">最长连续</div>
              </div>
            </div>
            <div class="activity-heatmap">
              <div v-for="(week, weekIndex) in activityData" :key="'week-'+weekIndex" class="heatmap-week">
                <div v-for="(day, dayIndex) in week" :key="'day-'+weekIndex+'-'+dayIndex"
                     class="heatmap-day"
                     :class="'level-' + day.level"
                     :title="day.date + ': ' + day.count + '个操作'">
                </div>
              </div>
            </div>
            <div class="heatmap-legend">
              <div class="legend-text">低</div>
              <div class="legend-levels">
                <div class="legend-level level-0"></div>
                <div class="legend-level level-1"></div>
                <div class="legend-level level-2"></div>
                <div class="legend-level level-3"></div>
                <div class="legend-level level-4"></div>
              </div>
              <div class="legend-text">高</div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧主内容区 -->
        <a-col :xs="24" :sm="24" :md="17" :lg="18" :xl="19">
          <!-- 内容区域切换标签 -->
          <a-card class="content-card" :bordered="false">
            <a-tabs v-model:activeKey="activeTabKey" :animated="{ inkBar: true, tabPane: false }">
              <a-tab-pane key="pictures" tab="作品集">
                <!-- 作品筛选器 -->
                <div class="gallery-filter">
                  <div class="filter-buttons">
                    <a-radio-group v-model:value="pictureFilter" button-style="solid">
                      <a-radio-button value="all">全部</a-radio-button>
                      <a-radio-button value="public">公开</a-radio-button>
                      <a-radio-button value="private">私密</a-radio-button>
                    </a-radio-group>
                    <a-select
                        v-model:value="selectedCategory"
                        style="width: 120px"
                        placeholder="分类筛选"
                        allow-clear
                    >
                      <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
                        {{ category.label }}
                      </a-select-option>
                    </a-select>
                  </div>
                  <div class="sort-controls">
                    <a-select v-model:value="pictureSort" style="width: 120px">
                      <a-select-option value="newest">最新上传</a-select-option>
                      <a-select-option value="popular">最受欢迎</a-select-option>
                      <a-select-option value="viewed">最多浏览</a-select-option>
                    </a-select>
                    <a-tooltip title="刷新">
                      <a-button @click="refreshImages" shape="circle">
                        <template #icon><reload-outlined /></template>
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="上传新作品">
                      <a-button type="primary" @click="showUploadModal" shape="circle">
                        <template #icon><plus-outlined /></template>
                      </a-button>
                    </a-tooltip>
                  </div>
                </div>

                <!-- 作品集画廊 -->
                <div class="gallery-container">
                  <template v-if="processedImages.length > 0">
                    <div class="masonry-grid">
                      <div v-for="image in processedImages" :key="image.id" class="masonry-item">
                        <div class="image-card" @click="viewPictureDetails(image)">
                          <div class="image-preview" :style="{ paddingBottom: getAspectRatioPadding(image.aspectRatio) }">
                            <img :src="image.src" :alt="image.title" />
                            <div class="image-privacy-badge" v-if="!image.isPublic">
                              <lock-outlined />
                            </div>
                            <div class="image-actions">
                              <a-button shape="circle" @click.stop="toggleImageLike(image)" :type="image.liked ? 'primary' : 'default'">
                                <template #icon>
                                  <heart-filled v-if="image.liked" />
                                  <heart-outlined v-else />
                                </template>
                              </a-button>
                              <a-button shape="circle" @click.stop="toggleImageBookmark(image)" :type="image.bookmarked ? 'primary' : 'default'">
                                <template #icon>
                                  <star-filled v-if="image.bookmarked" />
                                  <star-outlined v-else />
                                </template>
                              </a-button>
                              <a-dropdown :trigger="['click']" @click.stop>
                                <a-button shape="circle">
                                  <template #icon><more-outlined /></template>
                                </a-button>
                                <template #overlay>
                                  <a-menu>
                                    <a-menu-item key="1" @click.stop="downloadImage(image)">
                                      <download-outlined /> 下载
                                    </a-menu-item>
                                    <a-menu-item key="2" @click.stop="editPicture(image.id)">
                                      <edit-outlined /> 编辑
                                    </a-menu-item>
                                    <a-menu-item key="3" @click.stop="shareImage(image)">
                                      <share-alt-outlined /> 分享
                                    </a-menu-item>
                                    <a-menu-item key="4" @click.stop="showDeleteConfirm(image)" danger>
                                      <delete-outlined /> 删除
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                              </a-dropdown>
                            </div>
                          </div>
                          <div class="image-info">
                            <div class="image-title">{{ image.title }}</div>
                            <div class="image-meta">
                              <div class="image-stats">
                                <span><eye-outlined /> {{ image.views }}</span>
                                <span><heart-outlined /> {{ image.likes }}</span>
                                <span><message-outlined /> {{ image.comments }}</span>
                              </div>
                              <div class="image-date">{{ formatTimeAgo(image.uploadTime) }}</div>
                            </div>
                            <div class="image-tags">
                              <a-tag v-for="tag in image.tags.slice(0, 3)" :key="tag.name">{{ tag.name }}</a-tag>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <a-empty
                        description="暂无符合条件的作品"
                        class="empty-gallery"
                    >
                      <template #image>
                        <img-outlined style="font-size: 64px; color: #d9d9d9;" />
                      </template>
                      <a-button type="primary" @click="showUploadModal">上传作品</a-button>
                    </a-empty>
                  </template>

                  <!-- 分页控件 -->
                  <div class="pagination-wrapper" v-if="processedImages.length > 0">
                    <a-pagination
                        v-model:current="picturesPagination.current"
                        :total="picturesPagination.total"
                        :page-size="picturesPagination.pageSize"
                        show-size-changer
                        show-quick-jumper
                        @change="handlePicturesPageChange"
                        @showSizeChange="handlePicturesSizeChange"
                    />
                  </div>
                </div>
              </a-tab-pane>

              <!-- 新增: 我的收藏标签页 -->
              <a-tab-pane key="bookmarks" tab="我的收藏">
                <div class="bookmarks-container">
                  <template v-if="bookmarkedImages.length > 0">
                    <div class="masonry-grid">
                      <div v-for="image in bookmarkedImages" :key="image.id" class="masonry-item">
                        <div class="image-card" @click="viewPictureDetails(image)">
                          <div class="image-preview" :style="{ paddingBottom: getAspectRatioPadding(image.aspectRatio) }">
                            <img :src="image.src" :alt="image.title" />
                            <div class="image-author">
                              <a-avatar :size="24" :src="image.author.avatar" />
                              <span>{{ image.author.name }}</span>
                            </div>
                            <div class="image-actions">
                              <a-button shape="circle" @click.stop="toggleImageLike(image)" :type="image.liked ? 'primary' : 'default'">
                                <template #icon>
                                  <heart-filled v-if="image.liked" />
                                  <heart-outlined v-else />
                                </template>
                              </a-button>
                              <a-button shape="circle" @click.stop="toggleImageBookmark(image)" type="primary">
                                <template #icon><star-filled /></template>
                              </a-button>
                              <a-dropdown :trigger="['click']" @click.stop>
                                <a-button shape="circle">
                                  <template #icon><more-outlined /></template>
                                </a-button>
                                <template #overlay>
                                  <a-menu>
                                    <a-menu-item key="1" @click.stop="downloadImage(image)">
                                      <download-outlined /> 下载
                                    </a-menu-item>
                                    <a-menu-item key="2" @click.stop="shareImage(image)">
                                      <share-alt-outlined /> 分享
                                    </a-menu-item>
                                    <a-menu-item key="3" @click.stop="removeFromBookmarks(image)">
                                      <delete-outlined /> 取消收藏
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                              </a-dropdown>
                            </div>
                          </div>
                          <div class="image-info">
                            <div class="image-title">{{ image.title }}</div>
                            <div class="image-meta">
                              <div class="image-stats">
                                <span><eye-outlined /> {{ image.views }}</span>
                                <span><heart-outlined /> {{ image.likes }}</span>
                              </div>
                              <div class="image-date">{{ formatTimeAgo(image.uploadTime) }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <a-empty
                        description="暂无收藏内容"
                        class="empty-gallery"
                    >
                      <template #image>
                        <star-outlined style="font-size: 64px; color: #d9d9d9;" />
                      </template>
                      <a-button type="primary" @click="activeTabKey = 'explore'">去探索</a-button>
                    </a-empty>
                  </template>

                  <!-- 分页控件 -->
                  <div class="pagination-wrapper" v-if="bookmarkedImages.length > 0">
                    <a-pagination
                        v-model:current="bookmarksPagination.current"
                        :total="bookmarksPagination.total"
                        :page-size="bookmarksPagination.pageSize"
                        show-size-changer
                        show-quick-jumper
                        @change="handleBookmarksPageChange"
                        @showSizeChange="handleBookmarksSizeChange"
                    />
                  </div>
                </div>
              </a-tab-pane>

              <!-- 账户设置标签页 -->
              <a-tab-pane key="settings" tab="账户设置">
                <a-card :bordered="false" class="settings-card">
                  <a-tabs tab-position="left">
                    <a-tab-pane key="security" tab="账户安全">
                      <div class="password-change-container">
                        <div class="password-form">
                          <h3>密码修改</h3>

                          <a-form :model="passwordForm" layout="vertical">
                            <a-form-item label="当前密码" name="currentPassword">
                              <a-input-password
                                  v-model:value="passwordForm.currentPassword"
                                  placeholder="请输入当前密码"
                                  class="custom-password-input"
                              />
                            </a-form-item>
                            <a-form-item label="新密码" name="newPassword">
                              <a-input-password
                                  v-model:value="passwordForm.newPassword"
                                  placeholder="请输入新密码"
                                  class="custom-password-input"
                              />
                              <div class="password-strength">
                                <div class="strength-label">密码强度:</div>
                                <div class="strength-meter">
                                  <div class="meter-bar" :class="passwordStrengthClass"></div>
                                </div>
                                <div class="strength-text">{{ passwordStrengthText }}</div>
                              </div>
                            </a-form-item>
                            <a-form-item label="确认新密码" name="confirmPassword">
                              <a-input-password
                                  v-model:value="passwordForm.confirmPassword"
                                  placeholder="请再次输入新密码"
                                  class="custom-password-input"
                              />
                            </a-form-item>
                            <a-form-item>
                              <a-button type="primary" @click="changePassword" class="update-password-button">
                                更新密码
                              </a-button>
                            </a-form-item>
                          </a-form>
                        </div>
                      </div>

                      <a-divider />

                      <div class="settings-section">
                        <h3>安全设置</h3>
                        <div class="security-item">
                          <div class="security-info">
                            <div class="security-title">两步验证</div>
                            <div class="security-desc">启用两步验证，增强账户安全</div>
                          </div>
                          <a-switch v-model:checked="securitySettings.twoFactorAuth" />
                        </div>
                        <div class="security-item">
                          <div class="security-info">
                            <div class="security-title">登录通知</div>
                            <div class="security-desc">检测到新设备登录时通知我</div>
                          </div>
                          <a-switch v-model:checked="securitySettings.loginAlert" />
                        </div>
                        <div class="security-item">
                          <div class="security-info">
                            <div class="security-title">活动日志</div>
                            <div class="security-desc">记录所有账户活动</div>
                          </div>
                          <a-switch v-model:checked="securitySettings.activityLog" />
                        </div>
                        <div class="security-item">
                          <div class="security-info">
                            <div class="security-title">异常登录保护</div>
                            <div class="security-desc">检测异常登录并阻止可疑活动</div>
                          </div>
                          <a-switch v-model:checked="securitySettings.abnormalLoginProtection" />
                        </div>
                      </div>
                    </a-tab-pane>

                    <a-tab-pane key="notifications" tab="通知设置">
                      <div class="settings-section">
                        <h3>电子邮件通知</h3>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">新关注者</div>
                            <div class="notification-desc">当有人关注我时发送邮件通知</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.newFollower" />
                        </div>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">点赞通知</div>
                            <div class="notification-desc">当有人点赞我的图片时发送邮件通知</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.newLike" />
                        </div>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">评论通知</div>
                            <div class="notification-desc">当有人评论我的图片时发送邮件通知</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.newComment" />
                        </div>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">系统公告</div>
                            <div class="notification-desc">接收系统更新和功能通知</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.systemNotice" />
                        </div>
                      </div>

                      <a-divider />

                      <div class="settings-section">
                        <h3>应用内通知</h3>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">作品互动</div>
                            <div class="notification-desc">点赞、评论、收藏等互动提醒</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.appInteraction" />
                        </div>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">关注动态</div>
                            <div class="notification-desc">关注的用户发布新作品时提醒</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.appFollowing" />
                        </div>
                        <div class="notification-item">
                          <div class="notification-info">
                            <div class="notification-title">活动提醒</div>
                            <div class="notification-desc">平台活动、挑战和比赛提醒</div>
                          </div>
                          <a-switch v-model:checked="notificationSettings.appEvents" />
                        </div>
                      </div>
                    </a-tab-pane>

                    <a-tab-pane key="privacy" tab="隐私设置">
                      <div class="settings-section">
                        <h3>内容隐私</h3>
                        <div class="privacy-item">
                          <div class="privacy-info">
                            <div class="privacy-title">默认上传权限</div>
                            <div class="privacy-desc">设置新上传图片的默认可见性</div>
                          </div>
                          <a-select v-model:value="privacySettings.defaultUploadVisibility" style="width: 120px">
                            <a-select-option value="public">公开</a-select-option>
                            <a-select-option value="followers">仅关注者</a-select-option>
                            <a-select-option value="private">私密</a-select-option>
                          </a-select>
                        </div>
                        <div class="privacy-item">
                          <div class="privacy-info">
                            <div class="privacy-title">个人资料可见性</div>
                            <div class="privacy-desc">允许其他用户查看我的个人资料</div>
                          </div>
                          <a-switch v-model:checked="privacySettings.profileVisibility" />
                        </div>
                        <div class="privacy-item">
                          <div class="privacy-info">
                            <div class="privacy-title">搜索引擎索引</div>
                            <div class="privacy-desc">允许搜索引擎索引我的内容</div>
                          </div>
                          <a-switch v-model:checked="privacySettings.searchEngineIndex" />
                        </div>
                        <div class="privacy-item">
                          <div class="privacy-info">
                            <div class="privacy-title">活动状态</div>
                            <div class="privacy-desc">显示我的在线状态</div>
                          </div>
                          <a-switch v-model:checked="privacySettings.activityStatus" />
                        </div>
                      </div>

                      <a-divider />

                      <div class="settings-section">
                        <h3>数据管理</h3>
                        <div class="data-controls">
                          <a-button @click="downloadUserData">
                            <template #icon><download-outlined /></template>
                            下载我的数据
                          </a-button>
                          <a-button danger @click="showPrivacyDeleteModal">
                            <template #icon><delete-outlined /></template>
                            删除账户
                          </a-button>
                        </div>
                      </div>
                    </a-tab-pane>

                    <a-tab-pane key="appearance" tab="外观设置">
                      <div class="settings-section">
                        <h3>主题设置</h3>
                        <div class="theme-cards">
                          <div
                              v-for="theme in availableThemes"
                              :key="theme.id"
                              class="theme-card"
                              :class="{ 'active': currentTheme === theme.id }"
                              @click="changeTheme(theme.id)"
                          >
                            <div class="theme-preview" :style="{ 'background-color': theme.background }">
                              <div class="theme-header" :style="{ 'background-color': theme.primary }"></div>
                              <div class="theme-sidebar" :style="{ 'background-color': theme.secondary }"></div>
                              <div class="theme-content"></div>
                            </div>
                            <div class="theme-name">{{ theme.name }}</div>
                          </div>
                        </div>

                        <a-divider />

                        <h3>界面密度</h3>
                        <div class="density-options">
                          <a-radio-group v-model:value="interfaceDensity">
                            <a-radio value="compact">紧凑</a-radio>
                            <a-radio value="normal">标准</a-radio>
                            <a-radio value="comfortable">舒适</a-radio>
                          </a-radio-group>
                        </div>

                        <a-divider />

                        <h3>字体大小</h3>
                        <div class="font-size-slider">
                          <div class="font-size-label">A</div>
                          <a-slider v-model:value="fontSize" :min="12" :max="20" />
                          <div class="font-size-label large">A</div>
                        </div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </a-card>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 编辑个人资料弹窗 -->
    <a-modal
        v-model:visible="editProfileModalVisible"
        title="编辑个人资料"
        @ok="handleEditProfileSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="editProfileForm" :rules="rules" ref="editProfileFormRef" layout="vertical">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editProfileForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="个人简介" name="bio">
          <a-textarea
              v-model:value="editProfileForm.bio"
              placeholder="请输入个人简介"
              :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
        <a-form-item label="个人网站" name="website">
          <a-input
              v-model:value="editProfileForm.website"
              placeholder="请输入个人网站"
              prefix="https://"
          />
        </a-form-item>
        <a-form-item label="所在地区" name="location">
          <a-input v-model:value="editProfileForm.location" placeholder="请输入所在地区" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
        v-model:visible="deleteModalVisible"
        title="确认删除"
        ok-text="删除"
        cancel-text="取消"
        :ok-button-props="{ danger: true }"
        @ok="confirmDelete"
    >
      <p>确定要删除这张图片吗？此操作无法撤销。</p>
    </a-modal>

    <!-- 上传作品弹窗 -->
    <a-modal
        v-model:visible="uploadModalVisible"
        title="上传新作品"
        @ok="handleUploadSubmit"
        :confirmLoading="uploadLoading"
        okText="上传"
        cancelText="取消"
        width="700px"
    >
      <div class="upload-modal-content">
        <div class="upload-area" @click="triggerFileInput" v-if="!uploadPreview">
          <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept="image/*"
              @change="handleFileChange"
          />
          <upload-outlined class="upload-icon" />
          <div class="upload-text">
            <div class="upload-title">点击或拖拽上传</div>
            <div class="upload-desc">支持 JPG, PNG, GIF 等格式，单张最大 10MB</div>
          </div>
        </div>
        <div class="upload-preview" v-else>
          <img :src="uploadPreview" alt="Upload preview" class="preview-image" />
          <div class="preview-controls">
            <a-button @click="cancelUpload">
              <template #icon><delete-outlined /></template>
              移除
            </a-button>
          </div>
        </div>
        <a-form :model="uploadForm" layout="vertical" v-if="uploadPreview">
          <a-form-item label="作品标题" name="title">
            <a-input v-model:value="uploadForm.title" placeholder="请输入作品标题" />
          </a-form-item>
          <a-form-item label="作品描述" name="description">
            <a-textarea
                v-model:value="uploadForm.description"
                placeholder="请输入作品描述"
                :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-row :gutter="{ xs: 16, sm: 16, md: 16, lg: 24, xl: 32, xxl: 40 }">
            <a-col :span="12">
              <a-form-item label="分类" name="category">
                <a-select v-model:value="uploadForm.category" placeholder="请选择分类">
                  <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
                    {{ category.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="可见性" name="visibility">
                <a-select v-model:value="uploadForm.visibility" placeholder="请选择可见性">
                  <a-select-option value="public">公开</a-select-option>
                  <a-select-option value="followers">仅关注者</a-select-option>
                  <a-select-option value="private">私密</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="标签" name="tags">
            <a-select
                v-model:value="uploadForm.tags"
                mode="tags"
                placeholder="输入标签并按回车，最多添加5个标签"
                :max-tag-count="5"
            >
              <a-select-option v-for="tag in suggestedTags" :key="tag">{{ tag }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 存储空间升级弹窗 -->
    <a-modal
        v-model:visible="storageUpgradeModalVisible"
        title="升级存储空间"
        @ok="handleStorageUpgrade"
        :confirmLoading="upgradeLoading"
        okText="立即升级"
        cancelText="取消"
        width="700px"
    >
      <div class="upgrade-plans">
        <div
            v-for="plan in storagePlans"
            :key="plan.id"
            class="plan-card"
            :class="{ 'active': selectedPlan === plan.id }"
            @click="selectPlan(plan.id)"
        >
          <div class="plan-badge" v-if="plan.popular">热门选择</div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-storage">{{ plan.storage }} GB</div>
          <div class="plan-price">¥{{ plan.price }}<span class="price-period">/月</span></div>
          <div class="plan-features">
            <div class="plan-feature" v-for="(feature, index) in plan.features" :key="index">
              <check-outlined /> {{ feature }}
            </div>
          </div>
          <div class="plan-action">
            <a-button :type="selectedPlan === plan.id ? 'primary' : 'default'">
              {{ selectedPlan === plan.id ? '已选择' : '选择此套餐' }}
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 分享主页弹窗 -->
    <a-modal
        v-model:visible="shareModalVisible"
        title="分享我的主页"
        :footer="null"
        width="400px"
    >
      <div class="share-modal-content">
        <div class="share-qrcode">
          <img :src="profileQRCode" alt="Profile QR Code" class="qrcode-image" />
          <div class="qrcode-label">扫描二维码访问我的主页</div>
        </div>
        <div class="share-link">
          <div class="share-link-label">个人主页链接</div>
          <a-input-group compact>
            <a-input
                :value="profileLink"
                readonly
                style="width: calc(100% - 80px)"
            />
            <a-tooltip title="复制链接">
              <a-button @click="copyProfileLink">
                <template #icon><copy-outlined /></template>
              </a-button>
            </a-tooltip>
          </a-input-group>
        </div>
        <div class="share-platforms">
          <div class="share-platforms-label">分享到社交平台</div>
          <div class="platform-buttons">
            <a-button type="primary" shape="circle" class="wechat-btn">
              <template #icon><wechat-outlined /></template>
            </a-button>
            <a-button type="primary" shape="circle" class="weibo-btn">
              <template #icon><weibo-outlined /></template>
            </a-button>
            <a-button type="primary" shape="circle" class="qq-btn">
              <template #icon><qq-outlined /></template>
            </a-button>
            <a-button type="primary" shape="circle" class="twitter-btn">
              <template #icon><twitter-outlined /></template>
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  LikeOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  HeartOutlined,
  HeartFilled,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  StarOutlined,
  StarFilled,
  CloudOutlined,
  TrophyOutlined,
  SettingOutlined,
  UploadOutlined,
  PlusOutlined,
  ReloadOutlined,
  FireOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  KeyOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  CopyOutlined,
  LockOutlined,
  WechatOutlined,
  WeiboOutlined,
  QqOutlined,
  TwitterOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useRouter } from 'vue-router';

// 初始化dayjs插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();

// 当前激活的标签页
const activeTabKey = ref('pictures');

// 用户基本信息
const userInfo = reactive({
  id: 1,
  account: 'user123',
  username: '云图爱好者',
  email: 'user123@example.com',
  phone: '139****1234',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123',
  coverImage: null, // 封面图片URL
  bio: '热爱摄影与设计，希望通过图片记录生活的美好瞬间。',
  role: 'vip',
  registerTime: '2025-01-15T08:30:00',
  lastLoginTime: '2025-03-25T10:25:30',
  website: 'mywebsite.com',
  location: '北京市',
  verified: true, // 是否已认证
  credits: 876, // 用户积分
});

// 用户统计数据
const userStats = reactive({
  pictures: 128,
  followers: 362,
  following: 89,
  likes: 2154
});

// 用户存储空间信息
const userStorage = reactive({
  used: 2.3, // GB
  total: 5, // GB
  breakdown: {
    images: 1.8, // GB
    videos: 0.3, // GB
    documents: 0.1, // GB
    others: 0.1, // GB
  }
});

// 存储空间进度条颜色计算
const storageProgressGradient = computed(() => {
  const percentage = (userStorage.used / userStorage.total) * 100;
  if (percentage < 50) return { '0%': '#52C41A', '100%': '#87d068' };
  if (percentage < 80) return { '0%': '#FAAD14', '100%': '#ffc53d' };
  return { '0%': '#F5222D', '100%': '#ff7a45' };
});

// 用户成就与徽章
const userBadges = reactive([
  {
    id: 1,
    name: '创作新星',
    description: '连续7天上传作品',
    icon: 'star-filled',
    unlocked: true
  },
  {
    id: 2,
    name: '人气之王',
    description: '单张作品获得100个赞',
    icon: 'heart-filled',
    unlocked: true
  },
  {
    id: 3,
    name: '资深玩家',
    description: '注册满1年',
    icon: 'trophy-outlined',
    unlocked: true
  },
  {
    id: 4,
    name: '收藏家',
    description: '收藏50张作品',
    icon: 'star-outlined',
    unlocked: false
  }
]);

// 活动热图数据
const activityData = reactive(generateActivityData());

// 活动统计
const activityStats = reactive({
  streak: 5, // 当前连续天数
  total: 87, // 总活跃天数
  max: 14 // 最长连续天数
});

// 生成模拟的活动数据
function generateActivityData() {
  const weeks = 12;
  const days = 7;
  const data = [];

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      // 生成随机活跃度等级 (0-4)
      const level = Math.floor(Math.random() * 5);
      const count = level === 0 ? 0 : level * Math.floor(Math.random() * 5 + 1);
      const date = dayjs().subtract((weeks - w - 1) * 7 + (days - d - 1), 'day').format('YYYY-MM-DD');

      week.push({
        level,
        count,
        date
      });
    }
    data.push(week);
  }

  return data;
}

// 图片过滤和排序
const pictureFilter = ref('all');
const pictureSort = ref('newest');
const selectedCategory = ref(null);

// 分类数据
const categories = [
  { value: 'photography', label: '摄影' },
  { value: 'design', label: '设计' },
  { value: 'illustration', label: '插画' },
  { value: 'uiux', label: 'UI/UX' },
  { value: 'drawing', label: '绘画' },
  { value: 'landscape', label: '风景' },
  { value: 'portrait', label: '人像' },
  { value: 'architecture', label: '建筑' }
];

// 模拟的用户图片数据
const userPictures = ref([
  {
    id: 1,
    title: '城市建筑摄影',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=1',
    views: 234,
    likes: 42,
    isPublic: true,
    uploadTime: '2025-03-20T14:25:00',
    createTime: '2025-03-20T14:25:00',
    liked: false,
    bookmarked: false,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '4/3',
    category: '建筑',
    tags: [
      { name: '建筑' },
      { name: '城市' },
      { name: '摄影' }
    ],
    comments: 15
  },
  {
    id: 2,
    title: '自然风光',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=2',
    views: 187,
    likes: 35,
    isPublic: true,
    uploadTime: '2025-03-18T10:15:00',
    createTime: '2025-03-18T10:15:00',
    liked: true,
    bookmarked: false,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '16/9',
    category: '风景',
    tags: [
      { name: '自然' },
      { name: '风景' },
      { name: '摄影' }
    ],
    comments: 8
  },
  {
    id: 3,
    title: '设计草图',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=3',
    views: 98,
    likes: 12,
    isPublic: false,
    uploadTime: '2025-03-15T16:30:00',
    createTime: '2025-03-15T16:30:00',
    liked: false,
    bookmarked: true,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '1/1',
    category: '设计',
    tags: [
      { name: '设计' },
      { name: '草图' },
      { name: '创意' }
    ],
    comments: 3
  },
  {
    id: 4,
    title: '城市夜景',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=4',
    views: 321,
    likes: 67,
    isPublic: true,
    uploadTime: '2025-03-12T20:45:00',
    createTime: '2025-03-12T20:45:00',
    liked: true,
    bookmarked: true,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '3/2',
    category: '城市',
    tags: [
      { name: '城市' },
      { name: '夜景' },
      { name: '摄影' }
    ],
    comments: 22
  },
  {
    id: 5,
    title: '产品摄影',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=5',
    views: 156,
    likes: 28,
    isPublic: true,
    uploadTime: '2025-03-10T11:20:00',
    createTime: '2025-03-10T11:20:00',
    liked: false,
    bookmarked: false,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '1/1',
    category: '摄影',
    tags: [
      { name: '产品' },
      { name: '静物' },
      { name: '摄影' }
    ],
    comments: 7
  },
  {
    id: 6,
    title: '创意设计草图',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=6',
    views: 113,
    likes: 19,
    isPublic: false,
    uploadTime: '2025-03-08T14:35:00',
    createTime: '2025-03-08T14:35:00',
    liked: false,
    bookmarked: true,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '4/3',
    category: '设计',
    tags: [
      { name: '创意' },
      { name: '草图' },
      { name: 'UI' }
    ],
    comments: 5
  },
  {
    id: 7,
    title: '风景写生',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=7',
    views: 208,
    likes: 45,
    isPublic: true,
    uploadTime: '2025-03-05T09:15:00',
    createTime: '2025-03-05T09:15:00',
    liked: true,
    bookmarked: false,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '16/9',
    category: '风景',
    tags: [
      { name: '写生' },
      { name: '风景' },
      { name: '自然' }
    ],
    comments: 12
  },
  {
    id: 8,
    title: '家居设计',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=8',
    views: 178,
    likes: 31,
    isPublic: true,
    uploadTime: '2025-03-02T15:40:00',
    createTime: '2025-03-02T15:40:00',
    liked: false,
    bookmarked: false,
    author: {
      name: '云图爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
    },
    aspectRatio: '3/2',
    category: '设计',
    tags: [
      { name: '家居' },
      { name: '室内' },
      { name: '设计' }
    ],
    comments: 9
  },
]);

// 我的收藏数据
const bookmarkedImages = ref([
  {
    id: 101,
    title: '现代建筑几何',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=101',
    views: 543,
    likes: 128,
    uploadTime: '2025-03-15T10:22:00',
    liked: true,
    bookmarked: true,
    aspectRatio: '1/1',
    author: {
      name: '建筑师Mike',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    },
    comments: 32
  },
  {
    id: 102,
    title: '自然光影',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=102',
    views: 412,
    likes: 86,
    uploadTime: '2025-03-10T14:35:00',
    liked: false,
    bookmarked: true,
    aspectRatio: '16/9',
    author: {
      name: '风光摄影师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo'
    },
    comments: 18
  },
  {
    id: 103,
    title: '抽象艺术',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=103',
    views: 378,
    likes: 92,
    uploadTime: '2025-03-05T09:15:00',
    liked: true,
    bookmarked: true,
    aspectRatio: '4/3',
    author: {
      name: '艺术家Jane',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
    },
    comments: 24
  },
  {
    id: 104,
    title: 'UI组件设计',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=104',
    views: 621,
    likes: 145,
    uploadTime: '2025-02-28T16:42:00',
    liked: false,
    bookmarked: true,
    aspectRatio: '3/2',
    author: {
      name: 'UI设计专家',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ui'
    },
    comments: 36
  }
]);

// 分页设置
const picturesPagination = reactive({
  current: 1,
  pageSize: 8,
  total: 28
});

// 收藏分页设置
const bookmarksPagination = reactive({
  current: 1,
  pageSize: 8,
  total: 15
});

// 探索页推荐创作者
const recommendedCreators = ref([
  {
    id: 201,
    name: '摄影师李白',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=libai',
    bio: '专注城市街头摄影，记录城市的温度与脉搏',
    works: 156,
    likes: 4328,
    following: false
  },
  {
    id: 202,
    name: '设计师小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    bio: 'UI/UX设计师，热爱简约与实用的设计理念',
    works: 89,
    likes: 2156,
    following: true
  },
  {
    id: 203,
    name: '插画师绘梦',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dream',
    bio: '专业插画师，擅长人物与场景创作',
    works: 124,
    likes: 3567,
    following: false
  }
]);

// 热门标签
const trendingTags = ref([
  { name: '摄影', count: 2345, hot: true },
  { name: '城市', count: 1872, hot: false },
  { name: '风景', count: 1653, hot: false },
  { name: 'UI设计', count: 1428, hot: true },
  { name: '人像', count: 1254, hot: false },
  { name: '创意', count: 1187, hot: false },
  { name: '建筑', count: 1023, hot: false },
  { name: '色彩', count: 987, hot: false },
  { name: '黑白', count: 842, hot: false },
  { name: '抽象', count: 786, hot: true },
  { name: '自然', count: 765, hot: false },
  { name: '动物', count: 687, hot: false }
]);

// 热门作品
const trendingWorks = ref([
  {
    id: 301,
    title: '城市几何',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=301',
    views: 1256,
    likes: 342,
    rank: 1,
    aspectRatio: '1/1',
    liked: false,
    bookmarked: false,
    author: {
      name: '城市摄影师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=city'
    }
  },
  {
    id: 302,
    title: '自然之美',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=302',
    views: 1124,
    likes: 287,
    rank: 2,
    aspectRatio: '16/9',
    liked: true,
    bookmarked: true,
    author: {
      name: '风光摄影师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo'
    }
  },
  {
    id: 303,
    title: '现代设计',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=303',
    views: 983,
    likes: 256,
    rank: 3,
    aspectRatio: '4/3',
    liked: false,
    bookmarked: false,
    author: {
      name: '设计师小王',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang'
    }
  },
  {
    id: 304,
    title: '人像摄影',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=304',
    views: 875,
    likes: 231,
    rank: 4,
    aspectRatio: '3/4',
    liked: false,
    bookmarked: false,
    author: {
      name: '人像大师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=portrait'
    }
  },
  {
    id: 305,
    title: '抽象艺术',
    src: 'https://api.dicebear.com/7.x/shapes/svg?seed=305',
    views: 642,
    likes: 178,
    rank: 5,
    aspectRatio: '1/1',
    liked: false,
    bookmarked: false,
    author: {
      name: '艺术家Jane',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
    }
  }
]);

// 主题设置
const availableThemes = [
  { id: 'purple', name: '紫色主题', primary: '#6554C0', secondary: '#8A7CE0', background: '#FFFFFF' },
  { id: 'blue', name: '蓝色主题', primary: '#1890FF', secondary: '#40A9FF', background: '#FFFFFF' },
  { id: 'green', name: '绿色主题', primary: '#52C41A', secondary: '#73D13D', background: '#FFFFFF' },
  { id: 'dark', name: '暗色主题', primary: '#3D3D3D', secondary: '#595959', background: '#141414' }
];
const currentTheme = ref('purple');

// 界面密度
const interfaceDensity = ref('normal');

// 字体大小
const fontSize = ref(14);

// 上传表单建议标签
const suggestedTags = ['摄影', '设计', '创意', '城市', '风景', '人像', '建筑', '抽象', '黑白', '色彩', '自然'];

// 删除确认对话框状态
const deleteModalVisible = ref(false);
const pictureToDelete = ref(null);

// 编辑个人资料弹窗
const editProfileModalVisible = ref(false);
const submitLoading = ref(false);

// 上传弹窗
const uploadModalVisible = ref(false);
const uploadLoading = ref(false);
const uploadPreview = ref(null);
const fileInput = ref(null);

// 存储空间升级弹窗
const storageUpgradeModalVisible = ref(false);
const upgradeLoading = ref(false);
const selectedPlan = ref('pro');

// 分享弹窗
const shareModalVisible = ref(false);
const profileQRCode = ref('https://api.dicebear.com/7.x/identicon/svg?seed=qrcode');
const profileLink = ref('https://yoursite.com/profile/user123');

// 编辑个人资料表单
const editProfileForm = reactive({
  username: userInfo.username,
  bio: userInfo.bio,
  website: userInfo.website,
  location: userInfo.location
});

// 上传表单
const uploadForm = reactive({
  title: '',
  description: '',
  category: '',
  visibility: 'public',
  tags: []
});

// 存储套餐
const storagePlans = [
  {
    id: 'basic',
    name: '基础版',
    storage: 10,
    price: 9.9,
    popular: false,
    features: [
      '10GB存储空间',
      '高质量图片上传',
      '基础数据统计'
    ]
  },
  {
    id: 'pro',
    name: '专业版',
    storage: 50,
    price: 19.9,
    popular: true,
    features: [
      '50GB存储空间',
      '4K图片与视频上传',
      '高级数据分析',
      '无水印下载',
      '优先客服支持'
    ]
  },
  {
    id: 'premium',
    name: '高级版',
    storage: 100,
    price: 29.9,
    popular: false,
    features: [
      '100GB存储空间',
      '8K图片与视频上传',
      '专业数据分析工具',
      '专属定制域名',
      '24/7专人客服支持'
    ]
  }
];

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 160, message: '个人简介不能超过160个字符', trigger: 'blur' }
  ]
};

// 编辑表单引用
const editProfileFormRef = ref(null);

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码强度计算
const passwordStrength = computed(() => {
  if (!passwordForm.newPassword) return 0;
  let strength = 0;
  if (passwordForm.newPassword.length >= 8) strength += 1;
  if (/[A-Z]/.test(passwordForm.newPassword)) strength += 1;
  if (/[a-z]/.test(passwordForm.newPassword)) strength += 1;
  if (/[0-9]/.test(passwordForm.newPassword)) strength += 1;
  if (/[^A-Za-z0-9]/.test(passwordForm.newPassword)) strength += 1;
  return strength;
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'strength-weak';
  if (strength <= 3) return 'strength-medium';
  return 'strength-strong';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return '弱';
  if (strength <= 3) return '中';
  return '强';
});

// 安全设置
const securitySettings = reactive({
  twoFactorAuth: true,
  loginAlert: true,
  activityLog: true,
  abnormalLoginProtection: false
});

// 通知设置
const notificationSettings = reactive({
  newFollower: true,
  newLike: true,
  newComment: true,
  systemNotice: true,
  appInteraction: true,
  appFollowing: true,
  appEvents: false
});

// 隐私设置
const privacySettings = reactive({
  defaultUploadVisibility: 'public',
  profileVisibility: true,
  searchEngineIndex: true,
  activityStatus: true
});

// 根据过滤和排序条件获取过滤后的图片列表
const processedImages = computed(() => {
  let result = [...userPictures.value];

  // 应用过滤条件
  if (pictureFilter.value === 'public') {
    result = result.filter(pic => pic.isPublic);
  } else if (pictureFilter.value === 'private') {
    result = result.filter(pic => !pic.isPublic);
  }

  // 应用分类筛选
  if (selectedCategory.value) {
    result = result.filter(pic => pic.category.toLowerCase() === selectedCategory.value ||
        pic.tags.some(tag => tag.name.toLowerCase() === selectedCategory.value));
  }

  // 应用排序条件
  if (pictureSort.value === 'newest') {
    result.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
  } else if (pictureSort.value === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  } else if (pictureSort.value === 'viewed') {
    result.sort((a, b) => b.views - a.views);
  }

  return result;
});

// 获取宽高比例的padding-bottom值
function getAspectRatioPadding(ratio) {
  if (!ratio) return '100%';

  const [width, height] = ratio.split('/');
  const paddingPercent = (height / width) * 100;
  return `${paddingPercent}%`;
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
  // 实际项目中这里应该应用主题变量
  message.success(`已切换到${availableThemes.find(t => t.id === newTheme).name}`);
});

// 格式化日期
function formatDate(dateStr) {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
}

// 格式化相对时间
function formatTimeAgo(dateStr) {
  return dayjs(dateStr).fromNow();
}

// 格式化存储空间大小
function formatStorage(sizeInGB) {
  return sizeInGB.toFixed(1) + ' GB';
}

// 获取角色名称
function getRoleName(role) {
  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户'
  };
  return roleMap[role] || '未知角色';
}

// 获取角色颜色
function getRoleColor(role) {
  const colorMap = {
    admin: '#6554C0',
    user: '#52C41A',
    vip: '#FAAD14'
  };
  return colorMap[role] || 'default';
}

// 处理编辑个人资料表单提交
function handleEditProfileSubmit() {
  editProfileFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 更新用户信息
          userInfo.username = editProfileForm.username;
          userInfo.bio = editProfileForm.bio;
          userInfo.website = editProfileForm.website;
          userInfo.location = editProfileForm.location;

          submitLoading.value = false;
          editProfileModalVisible.value = false;
          message.success('个人资料已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 打开编辑个人资料弹窗
function openEditProfileModal() {
  // 初始化表单数据
  editProfileForm.username = userInfo.username;
  editProfileForm.bio = userInfo.bio;
  editProfileForm.website = userInfo.website;
  editProfileForm.location = userInfo.location;

  editProfileModalVisible.value = true;
}

// 查看图片详情
function viewPictureDetails(image) {
  router.push(`/picture/${image.id}`);
}

// 下载图片
function downloadImage(image) {
  message.success(`开始下载: ${image.title}`);
  // 实际项目中这里应该调用下载API
}

// 点赞/取消点赞
function toggleImageLike(image) {
  if (image.liked) {
    image.likes--;
    message.info('已取消点赞');
  } else {
    image.likes++;
    message.success('已点赞');
  }
  image.liked = !image.liked;
}

// 收藏/取消收藏
function toggleImageBookmark(image) {
  image.bookmarked = !image.bookmarked;
  if (image.bookmarked) {
    message.success('已收藏');
  } else {
    message.info('已取消收藏');
  }
}

// 从收藏中移除
function removeFromBookmarks(image) {
  bookmarkedImages.value = bookmarkedImages.value.filter(img => img.id !== image.id);
  message.success('已从收藏中移除');
}

// 分享图片
function shareImage(image) {
  message.success(`分享图片: ${image.title}`);
  // 实际项目中应调用分享组件或API
}

// 刷新图片列表
function refreshImages() {
  message.loading('正在刷新图片...', 1);
  // 实际项目中应调用API重新获取数据
  setTimeout(() => {
    message.success('图片已刷新');
  }, 1000);
}

// 编辑图片
function editPicture(id) {
  router.push(`/edit-image/${id}`);
}

// 显示删除确认对话框
function showDeleteConfirm(image) {
  pictureToDelete.value = image.id;
  deleteModalVisible.value = true;
}

// 确认删除
function confirmDelete() {
  if (pictureToDelete.value) {
    deletePicture(pictureToDelete.value);
    deleteModalVisible.value = false;
    pictureToDelete.value = null;
  }
}

// 删除图片
function deletePicture(id) {
  // 模拟API调用
  message.loading('正在删除...', 1).then(() => {
    userPictures.value = userPictures.value.filter(pic => pic.id !== id);
    message.success('图片已删除');
  });
}

// 图片分页变化处理
function handlePicturesPageChange(page, pageSize) {
  picturesPagination.current = page;
  picturesPagination.pageSize = pageSize;
  // 实际项目中这里应该重新获取数据
}

// 图片每页条数变化处理
function handlePicturesSizeChange(current, size) {
  picturesPagination.current = 1;
  picturesPagination.pageSize = size;
  // 实际项目中这里应该重新获取数据
}

// 收藏分页变化处理
function handleBookmarksPageChange(page, pageSize) {
  bookmarksPagination.current = page;
  bookmarksPagination.pageSize = pageSize;
  // 实际项目中这里应该重新获取数据
}

// 收藏每页条数变化处理
function handleBookmarksSizeChange(current, size) {
  bookmarksPagination.current = 1;
  bookmarksPagination.pageSize = size;
  // 实际项目中这里应该重新获取数据
}

// 更换封面
function handleChangeCover() {
  // 实际项目中应打开文件选择器并上传新封面
  message.info('更换个人主页封面');
}

// 更换头像
function handleChangeAvatar() {
  // 实际项目中应打开文件选择器并上传新头像
  message.info('更换头像');
}

// 打开修改个人信息弹窗
function openEditInfoModal() {
  // 实际项目中应打开编辑个人信息的弹窗
  message.info('编辑个人信息');
}

// 更改密码
function changePassword() {
  if (!passwordForm.currentPassword) {
    message.error('请输入当前密码');
    return;
  }

  if (!passwordForm.newPassword) {
    message.error('请输入新密码');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的新密码不一致');
    return;
  }

  if (passwordStrength.value <= 1) {
    message.warning('密码强度较弱，建议包含大小写字母、数字和特殊字符');
    return;
  }

  // 模拟API调用
  message.loading('正在更新密码...', 1.5).then(() => {
    message.success('密码已成功更新');

    // 重置表单
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  });
}

// 显示上传弹窗
function showUploadModal() {
  uploadModalVisible.value = true;
  uploadPreview.value = null;
  uploadForm.title = '';
  uploadForm.description = '';
  uploadForm.category = '';
  uploadForm.visibility = 'public';
  uploadForm.tags = [];
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value.click();
}

// 处理文件选择
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type.indexOf('image/') !== 0) {
    message.error('请选择图片文件');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    message.error('图片大小不能超过10MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadPreview.value = e.target.result;

    // 从文件名提取标题
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    uploadForm.title = fileName;

    // 猜测分类
    const lowerFileName = fileName.toLowerCase();
    for (const category of categories) {
      if (lowerFileName.includes(category.label.toLowerCase())) {
        uploadForm.category = category.value;
        break;
      }
    }
  };
  reader.readAsDataURL(file);
}

// 取消上传
function cancelUpload() {
  uploadPreview.value = null;
  fileInput.value.value = '';
}

// 处理上传提交
function handleUploadSubmit() {
  if (!uploadPreview.value) {
    message.error('请选择要上传的图片');
    return;
  }

  if (!uploadForm.title) {
    message.error('请输入作品标题');
    return;
  }

  uploadLoading.value = true;

  // 模拟上传API调用
  setTimeout(() => {
    const newImage = {
      id: Date.now(),
      title: uploadForm.title,
      src: uploadPreview.value,
      description: uploadForm.description,
      category: uploadForm.category,
      views: 0,
      likes: 0,
      comments: 0,
      isPublic: uploadForm.visibility === 'public',
      uploadTime: new Date().toISOString(),
      createTime: new Date().toISOString(),
      liked: false,
      bookmarked: false,
      author: {
        name: userInfo.username,
        avatar: userInfo.avatar
      },
      aspectRatio: '1/1', // 实际项目中应该计算实际比例
      tags: uploadForm.tags.map(tag => ({ name: tag }))
    };

    userPictures.value.unshift(newImage);
    uploadLoading.value = false;
    uploadModalVisible.value = false;
    message.success('作品上传成功');

    // 更新统计数据
    userStats.pictures++;
  }, 1500);
}
// 显示存储空间升级弹窗
function showStorageUpgradeModal() {
  storageUpgradeModalVisible.value = true;
}

// 选择存储套餐
function selectPlan(planId) {
  selectedPlan.value = planId;
}

// 处理存储空间升级
function handleStorageUpgrade() {
  if (!selectedPlan.value) {
    message.error('请选择一个套餐');
    return;
  }

  upgradeLoading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const plan = storagePlans.find(p => p.id === selectedPlan.value);
    userStorage.total = plan.storage;

    upgradeLoading.value = false;
    storageUpgradeModalVisible.value = false;
    message.success(`已成功升级到${plan.name}，存储空间已增加到${plan.storage}GB`);
  }, 1000);
}

// 显示分享弹窗
function showShareModal() {
  shareModalVisible.value = true;
}

// 复制个人主页链接
function copyProfileLink() {
  // 实际项目中应该使用剪贴板API
  navigator.clipboard.writeText(profileLink.value)
      .then(() => {
        message.success('链接已复制');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
}

// 下载用户数据
function downloadUserData() {
  message.loading('正在准备数据...', 1.5).then(() => {
    message.success('数据已开始下载');
    // 实际项目中应调用下载API
  });
}

// 关注/取消关注创作者
function toggleFollow(creator) {
  creator.following = !creator.following;
  if (creator.following) {
    message.success(`已关注 ${creator.name}`);
  } else {
    message.info(`已取消关注 ${creator.name}`);
  }
}

// 刷新推荐
function refreshRecommendations() {
  message.loading('正在刷新推荐...', 1);
  // 实际项目中应调用API获取新的推荐
  setTimeout(() => {
    message.success('推荐已更新');
    // 这里可以模拟更新推荐数据
  }, 1000);
}

// 选择热门标签
function selectTrendingTag(tag) {
  selectedCategory.value = tag.name.toLowerCase();
  activeTabKey.value = 'pictures';
  message.info(`已筛选标签: ${tag.name}`);
}

// 显示删除账户确认
function showPrivacyDeleteModal() {
  // 实际项目中应显示删除账户确认弹窗
  message.warning('此操作将永久删除您的账户，请谨慎操作');
}

// 查看全部成就
function showAllBadges() {
  message.info('查看全部成就和徽章');
  // 实际项目中应跳转到成就页面或打开成就弹窗
}

// 更改主题
function changeTheme(themeId) {
  currentTheme.value = themeId;
}

// 组件挂载时执行
onMounted(() => {
  // 这里可以调用API获取用户数据
  console.log('个人中心页面已加载');

  // 设置初始主题
  document.documentElement.setAttribute('data-theme', currentTheme.value);
});
</script>

<style scoped>
/* ---- 页面总体布局 ---- */
.user-profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  transition: all 0.3s;
  max-width: 100%;
  margin: 0 auto;
}

/* ---- 沉浸式头部区域 ---- */
.immersive-header {
  position: relative;
  margin: 0 auto 16px;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  max-width: 2400px;
  width: 100%;
}

/* 顶部背景封面 */
.profile-cover {
  height: 200px;
  background-image: linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%);
  background-size: cover;
  background-position: center;
  position: relative;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3));
}

/* 修改封面按钮 */
.cover-edit-button {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 10;
}

/* 个人简介卡片 */
.profile-card {
  display: flex;
  padding: 20px 32px;
  background-color: #fff;
  position: relative;
}

/* 头像容器 */
.profile-avatar {
  margin-top: -60px;
  position: relative;
  margin-right: 24px;
  flex-shrink: 0;
}

/* 头像样式 */
.profile-avatar .ant-avatar {
  width: 100px;
  height: 100px;
  border: 4px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

/* 头像编辑按钮 */
.avatar-edit-button {
  position: absolute;
  right: 0;
  bottom: 0;
}

/* 个人详情 */
.profile-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

/* 用户名称 */
.profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

/* 用户标签 */
.profile-tags {
  margin-bottom: 12px;
}

.profile-tags .ant-tag {
  margin-right: 8px;
  padding: 0 8px;
  border-radius: 4px;
}

/* 用户简介 */
.profile-bio {
  font-size: 14px;
  color: #595959;
  margin-bottom: 12px;
  max-width: 80%;
  line-height: 1.5;
}

/* 用户位置 */
.profile-location {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

/* 用户网站 */
.profile-website {
  font-size: 14px;
  color: #8c8c8c;
}

.profile-website a {
  color: #6554C0;
}

/* 用户数据统计 */
.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 16px 32px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}

/* 统计项 */
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

/* 统计数值 */
.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

/* 统计标签 */
.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 统计分隔线 */
.stat-divider {
  width: 1px;
  height: 30px;
  background-color: #f0f0f0;
}

/* 用户操作按钮组 */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 32px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}

/* ---- 主体内容区域 ---- */
.content-container {
  width: 100%;
  max-width: 2400px;
  margin: 0 auto;
  padding: 0 24px 32px;
}

/* ---- 左侧边栏 ---- */
/* 卡片通用样式 */
.info-card,
.storage-card,
.badges-card,
.activity-card {
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 卡片标题 */
.card-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #262626;
}

.card-title > span {
  margin-right: 6px;
}

.info-icon {
  margin-left: 6px;
  color: #bfbfbf;
  cursor: help;
}

.edit-button {
  margin-left: auto;
  padding: 0;
}

.upgrade-icon {
  margin-left: auto;
  padding: 0;
  color: #faad14;
}

/* 左侧个人信息列表 */
.info-list {
  padding: 8px 0;
}

/* 个人信息项 */
.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 14px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item > span:first-child {
  color: #8c8c8c;
  margin-right: 8px;
}

/* 信息项标签 */
.info-label {
  margin-left: 8px;
  color: #8c8c8c;
  width: 60px;
}

/* 信息项内容 */
.info-value {
  flex: 1;
  text-align: right;
  color: #262626;
}

/* 存储空间卡片内容 */
.storage-info {
  padding: 16px;
}

/* 存储进度环 */
.storage-progress {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

/* 存储详情 */
.storage-details {
  width: 100%;
}

/* 存储进度文本 */
.storage-progress-text {
  text-align: center;
  font-size: 14px;
  color: #595959;
  margin-bottom: 16px;
}

/* 存储数值 */
.storage-highlight {
  font-weight: 600;
  color: #262626;
}

/* 存储类型细分 */
.storage-breakdown {
  margin: 16px 0;
}

.storage-type-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.storage-type-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.storage-type-label {
  flex: 1;
  font-size: 14px;
  color: #595959;
}

.storage-type-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

/* 升级按钮 */
.upgrade-button {
  margin-top: 16px;
  width: 100%;
  background-color: #6554C0;
  border-color: #6554C0;
  height: 36px;
}

/* 徽章卡片 */
.badges-container {
  padding: 16px;
}

.badge-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.badge-item:hover {
  background-color: #f9f9f9;
}

.badge-item:last-child {
  border-bottom: none;
}

.badge-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6554C0;
  font-size: 18px;
}

.badge-name {
  font-size: 14px;
  color: #262626;
}

.badge-locked {
  opacity: 0.6;
}

.badge-locked .badge-icon {
  background-color: #f5f5f5;
  color: #d9d9d9;
}

.view-all-badges {
  text-align: center;
  margin-top: 12px;
}

/* 活跃度统计 */
.activity-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 16px 0;
  text-align: center;
}

.activity-stat-item {
  flex: 1;
}

.activity-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #6554C0;
}

.activity-stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 活跃度热图 */
.activity-heatmap {
  display: flex;
  justify-content: center;
  padding: 16px;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: #ebedf0;
  transition: all 0.3s;
}

/* 热图颜色级别 */
.level-0 { background-color: #ebedf0; }
.level-1 { background-color: #c6e48b; }
.level-2 { background-color: #7bc96f; }
.level-3 { background-color: #239a3b; }
.level-4 { background-color: #196127; }

/* 热图图例 */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
  margin: 8px 0 16px;
}

.legend-levels {
  display: flex;
  gap: 3px;
  margin: 0 8px;
}

.legend-level {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* ---- 右侧内容区 ---- */
/* 内容卡片 */
.content-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 标签页样式 */
.content-card .ant-tabs-nav {
  margin-bottom: 0;
  padding: 0 16px;
}

.content-card .ant-tabs-tab {
  padding: 12px 16px;
  font-size: 14px;
}

.content-card .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #6554C0;
  font-weight: 500;
}

.content-card .ant-tabs-ink-bar {
  background-color: #6554C0;
}

.content-card .ant-tabs-content {
  padding: 16px;
}

/* 作品筛选器 */
.gallery-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  overflow: visible;
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图片瀑布流布局 */
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-gap: 16px;
  margin-bottom: 32px;
}

/* 图片卡片 */
.image-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.image-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card:hover .image-preview img {
  transform: scale(1.05);
}

/* 图片动作按钮 */
.image-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}

.image-card:hover .image-actions {
  opacity: 1;
  transform: translateY(0);
}

.image-actions .ant-btn {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-actions .ant-btn-primary {
  background-color: #6554C0;
}

/* 图片信息 */
.image-info {
  padding: 12px;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.image-stats {
  display: flex;
  gap: 8px;
}

.image-date {
  font-size: 12px;
  color: #bfbfbf;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.image-tags .ant-tag {
  margin-right: 0;
  font-size: 12px;
  padding: 0 4px;
  border-radius: 3px;
}



/* 图片作者信息 */
.image-author {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  padding: 4px 8px;
  color: white;
  font-size: 12px;
  z-index: 10;
}

.image-author .ant-avatar {
  margin-right: 6px;
}

/* 私密图片标记 */
.image-privacy-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 空状态 */
.empty-gallery {
  padding: 40px 0;
}

/* 分页样式 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.pagination-wrapper .ant-pagination-item-active {
  border-color: #6554C0;
}

.pagination-wrapper .ant-pagination-item-active a {
  color: #6554C0;
}



.section-title > span {
  margin-right: 8px;
}

.section-title .ant-btn-link {
  margin-left: auto;
  font-size: 12px;
  padding: 0;
}

/* 账户设置卡片 */
.settings-card {
  border-radius: 8px;
  overflow: hidden;
}

.settings-card .ant-tabs-nav {
  width: 160px;
}

.settings-card .ant-tabs-content-holder {
  border-left: 1px solid #f0f0f0;
  padding-left: 24px;
}

/* 设置区域 */
.settings-section {
  max-width: 600px;
  padding: 0 16px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 安全设置项目 */
.security-item,
.notification-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child,
.notification-item:last-child,
.privacy-item:last-child {
  border-bottom: none;
}

.security-title,
.notification-title,
.privacy-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.security-desc,
.notification-desc,
.privacy-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 数据管理按钮 */
.data-controls {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

/* 密码表单 */
.password-change-container {
  max-width: 400px;
  padding: 16px;
}

.password-form h3 {
  font-size: 16px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
}

.custom-password-input {
  border-radius: 4px;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.strength-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}

.strength-meter {
  flex: 1;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.meter-bar {
  height: 100%;
  transition: all 0.3s;
}

.strength-weak {
  width: 30%;
  background-color: #ff4d4f;
}

.strength-medium {
  width: 60%;
  background-color: #faad14;
}

.strength-strong {
  width: 100%;
  background-color: #52c41a;
}

.strength-text {
  font-size: 12px;
  margin-left: 8px;
  font-weight: 500;
}

.strength-weak + .strength-text {
  color: #ff4d4f;
}

.strength-medium + .strength-text {
  color: #faad14;
}

.strength-strong + .strength-text {
  color: #52c41a;
}

.update-password-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

/* 主题设置 */
.theme-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.theme-card {
  width: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.theme-card.active {
  border-color: #6554C0;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-preview {
  height: 80px;
  position: relative;
}

.theme-header {
  height: 20px;
  width: 100%;
}

.theme-sidebar {
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 0;
  width: 30px;
}

.theme-content {
  position: absolute;
  left: 30px;
  right: 0;
  top: 20px;
  bottom: 0;
}

.theme-name {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #595959;
}

/* 密度选项 */
.density-options {
  margin-bottom: 24px;
}

.font-size-slider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.font-size-label {
  margin: 0 12px;
  font-size: 14px;
}

.font-size-label.large {
  font-size: 18px;
}

/* 上传模态框 */
.upload-modal-content {
  padding: 16px 0;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #6554C0;
  background-color: #f9f7ff;
}

.upload-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 16px;
  color: #262626;
  margin-bottom: 8px;
}

.upload-desc {
  font-size: 14px;
  color: #8c8c8c;
}

.upload-preview {
  margin-bottom: 16px;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.preview-controls {
  margin-top: 12px;
  text-align: center;
}

/* 存储空间升级弹窗 */
.upgrade-plans {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 16px 0;
}

.plan-card {
  flex: 1;
  max-width: 240px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 24px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-card.active {
  border-color: #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.plan-storage {
  font-size: 32px;
  font-weight: 700;
  color: #6554C0;
  margin-bottom: 8px;
}

.plan-price {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}

.price-period {
  font-size: 14px;
  font-weight: normal;
  color: #8c8c8c;
}

.plan-features {
  text-align: left;
  margin-bottom: 24px;
}

.plan-feature {
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
}

.plan-feature span {
  color: #52c41a;
  margin-right: 8px;
}

.plan-action {
  margin-top: auto;
}

/* 分享弹窗 */
.share-modal-content {
  padding: 16px 0;
}

.share-qrcode {
  text-align: center;
  margin-bottom: 24px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  margin-bottom: 12px;
}

.qrcode-label {
  font-size: 14px;
  color: #595959;
}

.share-link {
  margin-bottom: 24px;
}

.share-link-label {
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
}

.share-platforms {
  text-align: center;
}

.share-platforms-label {
  font-size: 14px;
  color: #595959;
  margin-bottom: 12px;
}

.platform-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.wechat-btn {
  background-color: #07c160;
  border-color: #07c160;
}

.weibo-btn {
  background-color: #e6162d;
  border-color: #e6162d;
}

.qq-btn {
  background-color: #12b7f5;
  border-color: #12b7f5;
}

.twitter-btn {
  background-color: #1da1f2;
  border-color: #1da1f2;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-container {
    padding: 0 16px 32px;
  }

  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 992px) {
  .immersive-header {
    border-radius: 0;
  }

  .profile-card {
    padding: 20px 16px;
  }

  .stats-card {
    padding: 16px;
  }

  .action-buttons {
    padding: 16px;
    flex-wrap: wrap;
  }

  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .profile-bio {
    max-width: 100%;
  }

  .stats-card {
    overflow-x: auto;
  }

  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .upgrade-plans {
    flex-direction: column;
    align-items: center;
  }

  .plan-card {
    max-width: 100%;
  }

  .settings-card .ant-tabs-nav {
    width: 120px;
  }
}

@media (max-width: 576px) {
  .content-container {
    padding: 0 8px 24px;
  }

  .gallery-filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-controls {
    width: 100%;
    justify-content: space-between;
    margin-top: 8px;
  }

  .masonry-grid {
    grid-gap: 8px;
  }

  .settings-card .ant-tabs-nav {
    width: 100px;
  }

  .settings-card .ant-tabs-content-holder {
    padding-left: 12px;
  }

  .storage-breakdown {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

@media (min-width: 2400px) {
  .user-profile-container {
    padding: 0;
  }

  .immersive-header,
  .content-container {
    max-width: 2400px;
    width: 2400px;
  }
}

@media (min-width: 1600px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  /* 调整左右列的宽度比例 */
  :deep(.ant-col-xl-5) {
    flex: 0 0 18%;
    max-width: 18%;
  }

  :deep(.ant-col-xl-19) {
    flex: 0 0 82%;
    max-width: 82%;
  }
}
</style>