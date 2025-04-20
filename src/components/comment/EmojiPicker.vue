<!-- components/comment/EmojiPicker.vue -->
<template>
  <div class="emoji-picker-container" :style="{ width: width + 'px' }" ref="emojiPickerRef">
    <div class="emoji-mart-wrapper">
      <div class="emoji-search">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索表情..."
            class="emoji-search-input"
        />
      </div>

      <div class="emoji-categories">
        <div
            v-for="(category, index) in categories"
            :key="index"
            :class="['emoji-category', { 'active': activeCategory === index }]"
            @click="activeCategory = index"
        >
          <span class="emoji-category-icon">{{ category.icon }}</span>
        </div>
      </div>

      <div class="emoji-content">
        <template v-if="searchQuery.trim()">
          <div class="emoji-grid">
            <div
                v-for="(emoji, index) in filteredEmojis"
                :key="index"
                class="emoji-item"
                @click="selectEmoji(emoji)"
            >
              {{ emoji.char }}
            </div>
          </div>
          <div v-if="filteredEmojis.length === 0" class="emoji-no-results">
            没有找到匹配的表情
          </div>
        </template>
        <template v-else>
          <div class="emoji-grid">
            <div
                v-for="(emoji, index) in currentCategoryEmojis"
                :key="index"
                class="emoji-item"
                @click="selectEmoji(emoji)"
            >
              {{ emoji.char }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent, onMounted, onBeforeUnmount, ref, computed} from 'vue';

// 表情数据
const emojiGroups = [
  {
    name: '最近使用',
    icon: '🕒',
    emojis: []
  },
  {
    name: '笑脸和情感',
    icon: '😀',
    emojis: [
      { char: '😀', name: '笑脸', keywords: ['笑脸', '开心', '高兴', '微笑'] },
      { char: '😃', name: '大笑', keywords: ['大笑', '开心', '高兴'] },
      { char: '😄', name: '眯眼笑', keywords: ['笑眯眯', '开心', '高兴'] },
      { char: '😁', name: '露齿笑', keywords: ['咧嘴笑', '开心', '高兴'] },
      { char: '😆', name: '大笑闭眼', keywords: ['大笑', '闭眼', '高兴'] },
      { char: '😅', name: '汗笑', keywords: ['汗', '笑', '尴尬'] },
      { char: '🤣', name: '笑翻了', keywords: ['笑得很厉害', '捧腹大笑'] },
      { char: '😂', name: '笑哭了', keywords: ['笑哭', '笑出眼泪'] },
      { char: '🙂', name: '微笑', keywords: ['微笑', '客气'] },
      { char: '🙃', name: '倒脸笑', keywords: ['倒过来', '有趣'] },
      { char: '😉', name: '眨眼', keywords: ['眨眼', '调皮', '暗示'] },
      { char: '😊', name: '微笑眼', keywords: ['微笑', '眼睛', '害羞'] },
      { char: '😇', name: '天使笑', keywords: ['天使', '光环', '纯洁'] },
      { char: '🥰', name: '三心笑', keywords: ['爱', '心', '喜欢'] },
      { char: '😍', name: '爱心眼', keywords: ['爱', '心', '喜欢'] },
      { char: '🤩', name: '星星眼', keywords: ['星星', '崇拜', '惊喜'] },
      { char: '😘', name: '飞吻', keywords: ['吻', '亲亲', '爱'] },
      { char: '😗', name: '亲嘴', keywords: ['吻', '亲亲'] },
      { char: '☺️', name: '微笑', keywords: ['微笑', '害羞'] },
      { char: '😚', name: '亲嘴闭眼', keywords: ['吻', '亲亲', '闭眼'] },
      { char: '😙', name: '亲嘴笑眼', keywords: ['吻', '亲亲', '笑眼'] },
      { char: '🥲', name: '带泪微笑', keywords: ['眼泪', '微笑', '感动'] },
      { char: '😋', name: '美味', keywords: ['美味', '舔嘴', '好吃'] },
      { char: '😛', name: '吐舌', keywords: ['吐舌', '调皮'] },
      { char: '😜', name: '吐舌眨眼', keywords: ['吐舌', '眨眼', '调皮'] },
      { char: '😝', name: '吐舌闭眼', keywords: ['吐舌', '闭眼', '调皮'] },
      { char: '🤑', name: '钱嘴', keywords: ['钱', '财富', '贪婪'] },
      { char: '🤗', name: '抱抱', keywords: ['拥抱', '开心', '欢迎'] },
      { char: '🤭', name: '捂嘴笑', keywords: ['偷笑', '害羞', '惊讶'] },
      { char: '🤫', name: '嘘', keywords: ['安静', '秘密', '保密'] },
      { char: '🤔', name: '思考', keywords: ['思考', '疑问', '困惑'] },
      { char: '🤐', name: '拉链嘴', keywords: ['闭嘴', '沉默', '保密'] },
      { char: '🤨', name: '挑眉', keywords: ['怀疑', '疑惑', '不信'] },
      { char: '😐', name: '平淡', keywords: ['无表情', '中性', '冷漠'] },
      { char: '😑', name: '无表情', keywords: ['面无表情', '冷漠', '厌烦'] },
      { char: '😶', name: '无嘴', keywords: ['无言', '沉默', '安静'] },
      { char: '😏', name: '得意', keywords: ['得意', '自信', '傲慢'] },
      { char: '😒', name: '不屑', keywords: ['不屑', '讨厌', '无聊'] },
      { char: '🙄', name: '白眼', keywords: ['白眼', '不耐烦', '不屑'] },
      { char: '😬', name: '尴尬', keywords: ['尴尬', '不自在', '难受'] },
      { char: '🤥', name: '说谎', keywords: ['说谎', '骗子', '不诚实'] },
      { char: '😌', name: '欣慰', keywords: ['安心', '满足', '放松'] },
      { char: '😔', name: '沉思', keywords: ['沉思', '忧郁', '失落'] },
      { char: '😪', name: '困倦', keywords: ['困倦', '疲倦', '睡意'] },
      { char: '🤤', name: '流口水', keywords: ['流口水', '垂涎', '想要'] },
      { char: '😴', name: '睡觉', keywords: ['睡觉', '疲倦', '打呼'] },
      { char: '😷', name: '戴口罩', keywords: ['口罩', '生病', '防护'] },
      { char: '🤒', name: '发烧', keywords: ['发烧', '感冒', '生病'] },
      { char: '🤕', name: '头部受伤', keywords: ['受伤', '头痛', '疼痛'] },
      { char: '🤮', name: '呕吐', keywords: ['呕吐', '恶心', '反胃'] }
    ]
  },
  {
    name: '手势和身体部位',
    icon: '👍',
    emojis: [
      { char: '👍', name: '点赞', keywords: ['赞', '好', '棒'] },
      { char: '👎', name: '踩', keywords: ['踩', '不好', '差'] },
      { char: '👌', name: '好的手势', keywords: ['好', '可以', 'OK'] },
      { char: '✌️', name: '剪刀手', keywords: ['胜利', 'V', '和平'] },
      { char: '🤞', name: '交叉手指', keywords: ['祈祷', '希望', '运气'] },
      { char: '🤟', name: '我爱你手势', keywords: ['爱', '手势', 'ILY'] },
      { char: '🤘', name: '摇滚手势', keywords: ['摇滚', '角', '手势'] },
      { char: '👊', name: '拳头', keywords: ['拳', '击打', '碰拳'] },
      { char: '👋', name: '挥手', keywords: ['挥手', '你好', '再见'] },
      { char: '🙌', name: '举手', keywords: ['欢呼', '庆祝', '举手'] },
      { char: '👏', name: '鼓掌', keywords: ['掌声', '鼓励', '赞赏'] },
      { char: '🙏', name: '合十', keywords: ['祈祷', '感谢', '拜托'] },
      { char: '🤝', name: '握手', keywords: ['握手', '协议', '合作'] },
      { char: '💪', name: '肌肉', keywords: ['强壮', '力量', '健身'] },
      { char: '👈', name: '左指', keywords: ['指向', '左边', '方向'] },
      { char: '👉', name: '右指', keywords: ['指向', '右边', '方向'] },
      { char: '👆', name: '上指', keywords: ['指向', '上面', '方向'] },
      { char: '👇', name: '下指', keywords: ['指向', '下面', '方向'] },
      { char: '✋', name: '举手', keywords: ['手掌', '停止', '高五'] },
      { char: '🤚', name: '举手背', keywords: ['手背', '停止', '举手'] },
      { char: '🖐️', name: '张开手指', keywords: ['手掌', '五指', '分开'] },
      { char: '👐', name: '张开双手', keywords: ['双手', '开放', '欢迎'] },
      { char: '🫶', name: '比心', keywords: ['爱心', '喜欢', '手势'] },
      { char: '🤲', name: '掌心向上', keywords: ['祈祷', '给予', '乞求'] },
      { char: '🫱', name: '右手伸出', keywords: ['指向', '递给', '右手'] },
      { char: '🫲', name: '左手伸出', keywords: ['指向', '递给', '左手'] },
      { char: '🫳', name: '手掌向下', keywords: ['按下', '放置', '手势'] },
      { char: '🫴', name: '手掌向上', keywords: ['接收', '乞求', '手势'] },
      { char: '👨', name: '男人', keywords: ['男人', '男性', '成人'] },
      { char: '👩', name: '女人', keywords: ['女人', '女性', '成人'] },
      { char: '🧑', name: '人', keywords: ['人', '成人', '中性'] },
      { char: '👶', name: '婴儿', keywords: ['宝宝', '婴儿', '小孩'] },
      { char: '🧒', name: '儿童', keywords: ['孩子', '儿童', '年轻'] },
      { char: '👦', name: '男孩', keywords: ['男孩', '年轻', '儿童'] },
      { char: '👧', name: '女孩', keywords: ['女孩', '年轻', '儿童'] },
      { char: '🧓', name: '老人', keywords: ['老人', '年长', '长者'] },
      { char: '👴', name: '老爷爷', keywords: ['老人', '爷爷', '男性'] },
      { char: '👵', name: '老奶奶', keywords: ['老人', '奶奶', '女性'] }
    ]
  },
  {
    name: '动物和自然',
    icon: '🐱',
    emojis: [
      { char: '🐶', name: '狗', keywords: ['狗', '宠物', '动物'] },
      { char: '🐱', name: '猫', keywords: ['猫', '宠物', '动物'] },
      { char: '🐭', name: '老鼠', keywords: ['鼠', '老鼠', '动物'] },
      { char: '🐹', name: '仓鼠', keywords: ['仓鼠', '宠物', '动物'] },
      { char: '🐰', name: '兔子', keywords: ['兔', '兔子', '动物'] },
      { char: '🦊', name: '狐狸', keywords: ['狐狸', '动物', '狡猾'] },
      { char: '🐻', name: '熊', keywords: ['熊', '动物', '森林'] },
      { char: '🐼', name: '熊猫', keywords: ['熊猫', '动物', '中国'] },
      { char: '🐨', name: '考拉', keywords: ['考拉', '动物', '澳大利亚'] },
      { char: '🐯', name: '老虎', keywords: ['虎', '老虎', '动物'] },
      { char: '🦁', name: '狮子', keywords: ['狮', '狮子', '动物'] },
      { char: '🐮', name: '牛', keywords: ['牛', '动物', '农场'] },
      { char: '🐷', name: '猪', keywords: ['猪', '动物', '农场'] },
      { char: '🐸', name: '青蛙', keywords: ['蛙', '青蛙', '动物'] },
      { char: '🐵', name: '猴子', keywords: ['猴', '猴子', '动物'] },
      { char: '🙈', name: '非礼勿视', keywords: ['猴子', '看不见', '遮眼'] },
      { char: '🙉', name: '非礼勿听', keywords: ['猴子', '听不见', '遮耳'] },
      { char: '🙊', name: '非礼勿言', keywords: ['猴子', '说不出', '遮嘴'] },
      { char: '🐔', name: '鸡', keywords: ['鸡', '动物', '农场'] },
      { char: '🐧', name: '企鹅', keywords: ['企鹅', '动物', '南极'] },
      { char: '🐦', name: '鸟', keywords: ['鸟', '动物', '飞行'] },
      { char: '🦆', name: '鸭子', keywords: ['鸭', '鸭子', '动物'] },
      { char: '🦅', name: '鹰', keywords: ['鹰', '猛禽', '动物'] },
      { char: '🦉', name: '猫头鹰', keywords: ['猫头鹰', '鸟', '动物'] },
      { char: '🐙', name: '章鱼', keywords: ['章鱼', '海洋', '动物'] },
      { char: '🦋', name: '蝴蝶', keywords: ['蝴蝶', '昆虫', '动物'] },
      { char: '🐌', name: '蜗牛', keywords: ['蜗牛', '慢', '动物'] },
      { char: '🦄', name: '独角兽', keywords: ['独角兽', '幻想', '动物'] },
      { char: '🐝', name: '蜜蜂', keywords: ['蜜蜂', '昆虫', '动物'] },
      { char: '🦕', name: '恐龙', keywords: ['恐龙', '史前', '动物'] },
      { char: '🌵', name: '仙人掌', keywords: ['仙人掌', '植物', '沙漠'] },
      { char: '🌱', name: '幼苗', keywords: ['幼苗', '植物', '生长'] },
      { char: '🌲', name: '常青树', keywords: ['树', '松树', '植物'] },
      { char: '🌳', name: '落叶树', keywords: ['树', '落叶', '植物'] },
      { char: '🌴', name: '棕榈树', keywords: ['棕榈', '树', '热带'] },
      { char: '🌸', name: '樱花', keywords: ['樱花', '花', '植物'] },
      { char: '🌹', name: '玫瑰', keywords: ['玫瑰', '花', '植物'] },
      { char: '🌻', name: '向日葵', keywords: ['向日葵', '花', '植物'] },
      { char: '🌼', name: '花朵', keywords: ['花', '花朵', '植物'] },
      { char: '🍄', name: '蘑菇', keywords: ['蘑菇', '菌类', '植物'] }
    ]
  },
  {
    name: '食物与饮料',
    icon: '🍎',
    emojis: [
      { char: '🍎', name: '红苹果', keywords: ['苹果', '水果', '红色'] },
      { char: '🍐', name: '梨', keywords: ['梨', '水果', '绿色'] },
      { char: '🍊', name: '橘子', keywords: ['橘子', '柑橘', '水果'] },
      { char: '🍋', name: '柠檬', keywords: ['柠檬', '水果', '酸'] },
      { char: '🍌', name: '香蕉', keywords: ['香蕉', '水果', '黄色'] },
      { char: '🍉', name: '西瓜', keywords: ['西瓜', '水果', '夏天'] },
      { char: '🍇', name: '葡萄', keywords: ['葡萄', '水果', '串'] },
      { char: '🍓', name: '草莓', keywords: ['草莓', '水果', '红色'] },
      { char: '🍈', name: '哈密瓜', keywords: ['哈密瓜', '水果', '甜瓜'] },
      { char: '🍒', name: '樱桃', keywords: ['樱桃', '水果', '对'] },
      { char: '🍑', name: '桃子', keywords: ['桃子', '水果', '桃'] },
      { char: '🥭', name: '芒果', keywords: ['芒果', '水果', '热带'] },
      { char: '🍍', name: '菠萝', keywords: ['菠萝', '凤梨', '水果'] },
      { char: '🥥', name: '椰子', keywords: ['椰子', '水果', '热带'] },
      { char: '🥝', name: '猕猴桃', keywords: ['猕猴桃', '奇异果', '水果'] },
      { char: '🍅', name: '西红柿', keywords: ['西红柿', '番茄', '蔬菜'] },
      { char: '🍆', name: '茄子', keywords: ['茄子', '蔬菜', '紫色'] },
      { char: '🥑', name: '牛油果', keywords: ['牛油果', '鳄梨', '蔬菜'] },
      { char: '🥦', name: '西兰花', keywords: ['西兰花', '花椰菜', '蔬菜'] },
      { char: '🥬', name: '绿叶蔬菜', keywords: ['叶', '菜', '蔬菜'] },
      { char: '🌭', name: '热狗', keywords: ['热狗', '食物', '快餐'] },
      { char: '🍔', name: '汉堡', keywords: ['汉堡', '食物', '快餐'] },
      { char: '🍟', name: '薯条', keywords: ['薯条', '食物', '快餐'] },
      { char: '🍕', name: '披萨', keywords: ['披萨', '食物', '意大利'] },
      { char: '🌮', name: '墨西哥卷', keywords: ['墨西哥卷', '塔可', '食物'] },
      { char: '🍙', name: '饭团', keywords: ['饭团', '日本', '食物'] },
      { char: '🍜', name: '面条', keywords: ['面条', '拉面', '食物'] },
      { char: '🍦', name: '冰淇淋', keywords: ['冰淇淋', '甜点', '食物'] },
      { char: '🍩', name: '甜甜圈', keywords: ['甜甜圈', '甜点', '食物'] },
      { char: '🎂', name: '生日蛋糕', keywords: ['蛋糕', '生日', '庆祝'] },
      { char: '🍰', name: '蛋糕', keywords: ['蛋糕', '甜点', '食物'] },
      { char: '🍫', name: '巧克力', keywords: ['巧克力', '甜食', '食物'] },
      { char: '🍬', name: '糖果', keywords: ['糖果', '甜食', '食物'] },
      { char: '🍭', name: '棒棒糖', keywords: ['棒棒糖', '甜食', '食物'] },
      { char: '☕', name: '咖啡', keywords: ['咖啡', '饮料', '热'] },
      { char: '🧋', name: '珍珠奶茶', keywords: ['奶茶', '饮料', '冷'] },
      { char: '🍵', name: '茶', keywords: ['茶', '饮料', '热'] },
      { char: '🥤', name: '冷饮', keywords: ['冷饮', '饮料', '冷'] },
      { char: '🍺', name: '啤酒', keywords: ['啤酒', '饮料', '酒精'] },
      { char: '🍷', name: '红酒', keywords: ['红酒', '饮料', '酒精'] }
    ]
  },
  {
    name: '活动和运动',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: '足球', keywords: ['足球', '运动', '球类'] },
      { char: '🏀', name: '篮球', keywords: ['篮球', '运动', '球类'] },
      { char: '🏈', name: '橄榄球', keywords: ['橄榄球', '运动', '球类'] },
      { char: '⚾', name: '棒球', keywords: ['棒球', '运动', '球类'] },
      { char: '🎾', name: '网球', keywords: ['网球', '运动', '球类'] },
      { char: '🏐', name: '排球', keywords: ['排球', '运动', '球类'] },
      { char: '🏉', name: '橄榄球', keywords: ['橄榄球', '运动', '球类'] },
      { char: '🎱', name: '台球', keywords: ['台球', '8号球', '运动'] },
      { char: '🏓', name: '乒乓球', keywords: ['乒乓球', '运动', '球类'] },
      { char: '🏸', name: '羽毛球', keywords: ['羽毛球', '运动', '球类'] },
      { char: '🥊', name: '拳击手套', keywords: ['拳击', '手套', '运动'] },
      { char: '🥋', name: '武术服', keywords: ['武术', '空手道', '运动'] },
      { char: '⛸️', name: '溜冰鞋', keywords: ['溜冰', '冰鞋', '运动'] },
      { char: '🛹', name: '滑板', keywords: ['滑板', '运动', '极限'] },
      { char: '🛷', name: '雪橇', keywords: ['雪橇', '雪', '运动'] },
      { char: '⛷️', name: '滑雪', keywords: ['滑雪', '雪', '运动'] },
      { char: '🏂', name: '单板滑雪', keywords: ['滑雪', '雪', '运动'] },
      { char: '🏊', name: '游泳', keywords: ['游泳', '运动', '水'] },
      { char: '🚴', name: '骑自行车', keywords: ['自行车', '骑行', '运动'] },
      { char: '🧗', name: '攀岩', keywords: ['攀岩', '攀登', '运动'] },
      { char: '🏆', name: '奖杯', keywords: ['奖杯', '获胜', '比赛'] },
      { char: '🏅', name: '运动奖牌', keywords: ['奖牌', '运动', '获奖'] },
      { char: '🥇', name: '金牌', keywords: ['金牌', '第一', '获奖'] },
      { char: '🥈', name: '银牌', keywords: ['银牌', '第二', '获奖'] },
      { char: '🥉', name: '铜牌', keywords: ['铜牌', '第三', '获奖'] }
    ]
  },
  {
    name: '旅行和地点',
    icon: '🚗',
    emojis: [
      { char: '🚗', name: '汽车', keywords: ['车', '汽车', '交通'] },
      { char: '🚕', name: '出租车', keywords: ['出租车', '出租', '交通'] },
      { char: '🚙', name: 'SUV', keywords: ['SUV', '汽车', '交通'] },
      { char: '🚌', name: '公交车', keywords: ['公交车', '巴士', '交通'] },
      { char: '🚎', name: '无轨电车', keywords: ['电车', '公交', '交通'] },
      { char: '🏎️', name: '赛车', keywords: ['赛车', '速度', '交通'] },
      { char: '🚓', name: '警车', keywords: ['警车', '警察', '交通'] },
      { char: '🚑', name: '救护车', keywords: ['救护车', '急救', '交通'] },
      { char: '🚒', name: '消防车', keywords: ['消防车', '消防', '交通'] },
      { char: '🚐', name: '面包车', keywords: ['面包车', '小巴', '交通'] },
      { char: '🚚', name: '卡车', keywords: ['卡车', '货车', '交通'] },
      { char: '🚛', name: '铰接式卡车', keywords: ['卡车', '大货车', '交通'] },
      { char: '🚜', name: '拖拉机', keywords: ['拖拉机', '农场', '交通'] },
      { char: '🛴', name: '滑板车', keywords: ['滑板车', '交通', '代步'] },
      { char: '🚲', name: '自行车', keywords: ['自行车', '单车', '交通'] },
      { char: '✈️', name: '飞机', keywords: ['飞机', '航空', '交通'] },
      { char: '🚀', name: '火箭', keywords: ['火箭', '太空', '发射'] },
      { char: '🛸', name: '飞碟', keywords: ['飞碟', 'UFO', '太空'] },
      { char: '🚁', name: '直升机', keywords: ['直升机', '航空', '交通'] },
      { char: '⛴️', name: '渡船', keywords: ['渡船', '轮渡', '交通'] },
      { char: '🚢', name: '轮船', keywords: ['轮船', '船', '交通'] },
      { char: '🚞', name: '山地铁路', keywords: ['铁路', '山地', '交通'] },
      { char: '🚂', name: '蒸汽火车', keywords: ['火车', '蒸汽', '交通'] },
      { char: '🚊', name: '有轨电车', keywords: ['电车', '轨道', '交通'] },
      { char: '🚈', name: '轻轨', keywords: ['轻轨', '地铁', '交通'] },
      { char: '🏙️', name: '城市景观', keywords: ['城市', '天际线', '建筑'] },
      { char: '🏖️', name: '沙滩', keywords: ['沙滩', '海滩', '度假'] },
      { char: '🏔️', name: '雪山', keywords: ['山', '雪', '高峰'] },
      { char: '🏕️', name: '露营', keywords: ['露营', '帐篷', '户外'] },
      { char: '🏭', name: '工厂', keywords: ['工厂', '工业', '建筑'] }
    ]
  },
  {
    name: '物品',
    icon: '💎',
    emojis: [
      { char: '💎', name: '宝石', keywords: ['宝石', '钻石', '珠宝'] },
      { char: '⌚', name: '手表', keywords: ['手表', '时间', '配饰'] },
      { char: '📱', name: '手机', keywords: ['手机', '电话', '设备'] },
      { char: '💻', name: '笔记本电脑', keywords: ['电脑', '笔记本', '设备'] },
      { char: '⌨️', name: '键盘', keywords: ['键盘', '输入', '设备'] },
      { char: '🖥️', name: '台式电脑', keywords: ['电脑', '显示器', '设备'] },
      { char: '🖨️', name: '打印机', keywords: ['打印机', '设备', '办公'] },
      { char: '🖱️', name: '鼠标', keywords: ['鼠标', '电脑', '设备'] },
      { char: '🕹️', name: '游戏杆', keywords: ['游戏', '控制器', '设备'] },
      { char: '💾', name: '软盘', keywords: ['软盘', '存储', '设备'] },
      { char: '💿', name: '光盘', keywords: ['光盘', 'CD', '存储'] },
      { char: '📀', name: 'DVD', keywords: ['DVD', '光盘', '存储'] },
      { char: '📷', name: '相机', keywords: ['相机', '照相机', '设备'] },
      { char: '📸', name: '闪光相机', keywords: ['相机', '闪光灯', '设备'] },
      { char: '📹', name: '摄像机', keywords: ['摄像机', '录像', '设备'] },
      { char: '📼', name: '录像带', keywords: ['录像带', 'VHS', '存储'] },
      { char: '🔍', name: '放大镜', keywords: ['放大镜', '搜索', '工具'] },
      { char: '💡', name: '灯泡', keywords: ['灯泡', '想法', '照明'] },
      { char: '🔦', name: '手电筒', keywords: ['手电筒', '照明', '工具'] },
      { char: '🕯️', name: '蜡烛', keywords: ['蜡烛', '照明', '浪漫'] },
      { char: '📚', name: '书籍', keywords: ['书', '书籍', '阅读'] },
      { char: '📰', name: '报纸', keywords: ['报纸', '新闻', '阅读'] },
      { char: '🗞️', name: '卷起的报纸', keywords: ['报纸', '新闻', '阅读'] },
      { char: '📝', name: '备忘录', keywords: ['笔记', '写作', '文具'] },
      { char: '✏️', name: '铅笔', keywords: ['铅笔', '写作', '文具'] },
      { char: '🖋️', name: '钢笔', keywords: ['钢笔', '写作', '文具'] },
      { char: '🖊️', name: '圆珠笔', keywords: ['笔', '写作', '文具'] },
      { char: '📦', name: '包裹', keywords: ['包裹', '盒子', '快递'] },
      { char: '📂', name: '文件夹', keywords: ['文件夹', '文档', '办公'] },
      { char: '📅', name: '日历', keywords: ['日历', '日期', '时间'] },
      { char: '🔒', name: '锁', keywords: ['锁', '安全', '封闭'] },
      { char: '🔑', name: '钥匙', keywords: ['钥匙', '开锁', '安全'] },
      { char: '🔨', name: '锤子', keywords: ['锤子', '工具', '建筑'] },
      { char: '🪛', name: '螺丝刀', keywords: ['螺丝刀', '工具', '修理'] },
      { char: '🔧', name: '扳手', keywords: ['扳手', '工具', '修理'] }
    ]
  },
  {
    name: '符号',
    icon: '❤️',
    emojis: [
      { char: '❤️', name: '红心', keywords: ['爱', '心', '红'] },
      { char: '🧡', name: '橙心', keywords: ['爱', '心', '橙'] },
      { char: '💛', name: '黄心', keywords: ['爱', '心', '黄'] },
      { char: '💚', name: '绿心', keywords: ['爱', '心', '绿'] },
      { char: '💙', name: '蓝心', keywords: ['爱', '心', '蓝'] },
      { char: '💜', name: '紫心', keywords: ['爱', '心', '紫'] },
      { char: '🖤', name: '黑心', keywords: ['爱', '心', '黑'] },
      { char: '🤍', name: '白心', keywords: ['爱', '心', '白'] },
      { char: '🤎', name: '棕心', keywords: ['爱', '心', '棕'] },
      { char: '💔', name: '破碎的心', keywords: ['心碎', '分手', '难过'] },
      { char: '❣️', name: '心形感叹号', keywords: ['心', '感叹号', '惊讶'] },
      { char: '💕', name: '两颗心', keywords: ['爱', '心', '情侣'] },
      { char: '💞', name: '旋转的心', keywords: ['爱', '心', '旋转'] },
      { char: '💓', name: '跳动的心', keywords: ['爱', '心', '跳动'] },
      { char: '💗', name: '成长的心', keywords: ['爱', '心', '成长'] },
      { char: '💖', name: '闪亮的心', keywords: ['心', '闪亮', '爱'] },
      { char: '💘', name: '箭头穿心', keywords: ['心', '丘比特', '爱'] },
      { char: '💝', name: '心与缎带', keywords: ['心', '礼物', '爱'] },
      { char: '💟', name: '心形装饰', keywords: ['心', '装饰', '爱'] },
      { char: '☮️', name: '和平标志', keywords: ['和平', '标志', '符号'] },
      { char: '✝️', name: '十字架', keywords: ['十字架', '宗教', '基督教'] },
      { char: '☪️', name: '星月', keywords: ['伊斯兰', '宗教', '星月'] },
      { char: '☯️', name: '阴阳', keywords: ['阴阳', '平衡', '道教'] },
      { char: '✡️', name: '大卫之星', keywords: ['犹太', '宗教', '符号'] },
      { char: '☸️', name: '法轮', keywords: ['佛教', '宗教', '符号'] },
      { char: '⚛️', name: '原子符号', keywords: ['原子', '科学', '符号'] },
      { char: '⚧️', name: '跨性别符号', keywords: ['跨性别', '性别', '符号'] },
      { char: '✨', name: '闪光', keywords: ['闪光', '星星', '闪闪'] },
      { char: '💫', name: '眩晕', keywords: ['眩晕', '星星', '旋转'] },
      { char: '💥', name: '碰撞', keywords: ['碰撞', '爆炸', '冲击'] },
      { char: '💢', name: '愤怒', keywords: ['愤怒', '生气', '烦躁'] },
      { char: '💦', name: '汗水', keywords: ['汗水', '汗', '液体'] },
      { char: '💤', name: '睡觉', keywords: ['睡觉', 'ZZZ', '打瞌睡'] },
      { char: '⭐', name: '星星', keywords: ['星星', '星', '天空'] },
      { char: '⚡', name: '闪电', keywords: ['闪电', '电', '风暴'] }
    ]
  },
  {
    name: '旗帜',
    icon: '🏁',
    emojis: [
      { char: '🏁', name: '方格旗', keywords: ['旗', '赛车', '终点'] },
      { char: '🚩', name: '三角旗', keywords: ['旗', '标记', '三角'] },
      { char: '🎌', name: '交叉旗', keywords: ['旗', '交叉', '日本'] },
      { char: '🏴', name: '黑旗', keywords: ['旗', '黑色', '海盗'] },
      { char: '🏳️', name: '白旗', keywords: ['旗', '白色', '投降'] },
      { char: '🏳️‍🌈', name: '彩虹旗', keywords: ['旗', '彩虹', 'LGBT'] },
      { char: '🏳️‍⚧️', name: '跨性别旗', keywords: ['旗', '跨性别', 'LGBT'] },
      { char: '🏴‍☠️', name: '海盗旗', keywords: ['旗', '海盗', '骷髅'] },
      { char: '🇨🇳', name: '中国', keywords: ['旗', '中国', '国家'] },
      { char: '🇺🇸', name: '美国', keywords: ['旗', '美国', '国家'] },
      { char: '🇬🇧', name: '英国', keywords: ['旗', '英国', '国家'] },
      { char: '🇯🇵', name: '日本', keywords: ['旗', '日本', '国家'] },
      { char: '🇰🇷', name: '韩国', keywords: ['旗', '韩国', '国家'] },
      { char: '🇷🇺', name: '俄罗斯', keywords: ['旗', '俄罗斯', '国家'] },
      { char: '🇫🇷', name: '法国', keywords: ['旗', '法国', '国家'] },
      { char: '🇩🇪', name: '德国', keywords: ['旗', '德国', '国家'] },
      { char: '🇮🇹', name: '意大利', keywords: ['旗', '意大利', '国家'] },
      { char: '🇨🇦', name: '加拿大', keywords: ['旗', '加拿大', '国家'] },
      { char: '🇦🇺', name: '澳大利亚', keywords: ['旗', '澳大利亚', '国家'] },
      { char: '🇧🇷', name: '巴西', keywords: ['旗', '巴西', '国家'] }
    ]
  }
];

export default defineComponent({
  name: 'EmojiPicker',
  props: {
    width: {
      type: Number,
      default: 320
    },
    emojiSize: {
      type: Number,
      default: 24
    },
    showPreview: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'light'
    },
    // 添加新的prop，用于控制点击外部是否关闭
    closeOnClickOutside: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const categories = ref(emojiGroups);
    const activeCategory = ref(0);
    const searchQuery = ref('');
    const recentEmojis = ref(loadRecentEmojis());
    const emojiPickerRef = ref(null); // 引用表情选择器元素

    // 选择表情
    const selectEmoji = (emoji) => {
      emit('select', emoji.char);
      saveRecentEmoji(emoji);
    };

    // 计算当前分类的表情
    const currentCategoryEmojis = computed(() => {
      if (activeCategory.value === 0) {
        return recentEmojis.value.length > 0
            ? recentEmojis.value
            : categories.value[1].emojis.slice(0, 16); // 如果没有最近使用，显示一些笑脸
      }
      return categories.value[activeCategory.value].emojis;
    });

    // 搜索过滤的表情
    const filteredEmojis = computed(() => {
      if (!searchQuery.value.trim()) return [];

      const query = searchQuery.value.trim().toLowerCase();
      let results = [];

      // 从所有分类中搜索
      categories.value.forEach(category => {
        if (category.name === '最近使用') return; // 跳过最近使用分类

        const matches = category.emojis.filter(emoji => {
          return emoji.name.toLowerCase().includes(query) ||
              emoji.keywords.some(keyword => keyword.toLowerCase().includes(query));
        });

        results = [...results, ...matches];
      });

      // 限制结果数量
      return results.slice(0, 30);
    });

    // 处理点击外部关闭
    const handleOutsideClick = (event) => {
      if (props.closeOnClickOutside && emojiPickerRef.value && !emojiPickerRef.value.contains(event.target)) {
        // 如果点击事件不是发生在表情选择器内部，则触发关闭事件
        emit('close');
      }
    };

    // 组件挂载时添加点击事件监听器
    onMounted(() => {
      if (props.closeOnClickOutside) {
        document.addEventListener('click', handleOutsideClick);
      }
    });

    // 组件卸载前移除事件监听器
    onBeforeUnmount(() => {
      if (props.closeOnClickOutside) {
        document.removeEventListener('click', handleOutsideClick);
      }
    });

    // 加载最近使用的表情
    function loadRecentEmojis() {
      try {
        const stored = localStorage.getItem('recent-emojis');
        if (stored) {
          const emojiIds = JSON.parse(stored);
          return emojiIds.map(id => {
            // 从所有表情中找到对应ID的表情
            for (const category of emojiGroups) {
              if (category.name === '最近使用') continue;

              const found = category.emojis.find(emoji =>
                  emoji.name === id || emoji.char === id
              );
              if (found) return found;
            }
            return null;
          }).filter(emoji => emoji !== null);
        }
      } catch (e) {
        console.warn('无法加载最近使用的表情', e);
      }
      return [];
    }

    // 保存最近使用的表情
    function saveRecentEmoji(emoji) {
      try {
        // 更新内存中的最近使用列表
        const existingIndex = recentEmojis.value.findIndex(e => e.char === emoji.char);
        if (existingIndex !== -1) {
          recentEmojis.value.splice(existingIndex, 1);
        }

        recentEmojis.value.unshift(emoji);

        // 限制数量
        if (recentEmojis.value.length > 20) {
          recentEmojis.value = recentEmojis.value.slice(0, 20);
        }

        // 保存到localStorage
        const emojiIds = recentEmojis.value.map(e => e.name);
        localStorage.setItem('recent-emojis', JSON.stringify(emojiIds));
      } catch (e) {
        console.warn('无法保存最近使用的表情', e);
      }
    }

    return {
      categories,
      activeCategory,
      searchQuery,
      recentEmojis,
      currentCategoryEmojis,
      filteredEmojis,
      selectEmoji,
      emojiPickerRef  // 暴露ref给模板
    };
  }
});
</script>

<style scoped>
/* 表情选择器样式保持不变 */
.emoji-picker-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e8f0;
  z-index: 100;
}

.emoji-mart-wrapper {
  display: flex;
  flex-direction: column;
  height: 350px;
}

.emoji-search {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.emoji-search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e6e8f0;
  outline: none;
  transition: all 0.3s ease;
}

.emoji-search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.emoji-categories {
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
}

.emoji-category {
  flex: 0 0 auto;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.emoji-category:hover {
  background-color: #f6f8ff;
}

.emoji-category.active {
  background-color: #edf0ff;
}

.emoji-category-icon {
  font-size: 18px;
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: v-bind('emojiSize + "px"');
  height: 38px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  user-select: none;
}

.emoji-item:hover {
  background-color: #f0f2ff;
  transform: scale(1.2);
}

.emoji-no-results {
  text-align: center;
  padding: 20px;
  color: #8c8c8c;
}

/* 暗色主题 */
.emoji-picker-container[data-theme="dark"] {
  background-color: #222;
  border-color: #444;
}

.emoji-picker-container[data-theme="dark"] .emoji-search-input {
  background-color: #333;
  border-color: #555;
  color: #fff;
}

.emoji-picker-container[data-theme="dark"] .emoji-category:hover {
  background-color: #333;
}

.emoji-picker-container[data-theme="dark"] .emoji-category.active {
  background-color: #444;
}

.emoji-picker-container[data-theme="dark"] .emoji-item:hover {
  background-color: #333;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .emoji-item {
    height: 36px;
  }
}
</style>