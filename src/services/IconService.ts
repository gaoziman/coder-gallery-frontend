// src/api/IconService.ts - 修复版本
import { ref, Ref } from 'vue';

// 图标信息接口
interface IconInfo {
    id: string;
    name: string;
    addedTime?: number; // 添加时间戳，用于"最近添加"排序
}

// window的扩展类型定义
declare global {
    interface Window {
        _iconfont_svg_string_?: string;
    }
}

// 创建一个单例服务来管理图标
class IconService {
    private static instance: IconService;
    // 使用public使外部可以访问这些ref，但仍将其命名为private表示不建议直接修改
    public readonly _iconsLoaded: Ref<boolean> = ref(false);
    public readonly _iconRegistry: Ref<Map<string, IconInfo>> = new ref(new Map());
    public readonly _iconScripts: Ref<Set<string>> = ref(new Set());
    private initPromise: Promise<void> | null = null;
    private currentScriptElement: HTMLScriptElement | null = null;

    // 获取单例
    public static getInstance(): IconService {
        if (!IconService.instance) {
            IconService.instance = new IconService();
        }
        return IconService.instance;
    }

    // 提供公共属性访问方法
    get iconsLoaded(): boolean {
        return this._iconsLoaded.value;
    }

    set iconsLoaded(value: boolean) {
        this._iconsLoaded.value = value;
    }

    // 初始化
    public init(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = new Promise<void>((resolve) => {
                // 检查localStorage中是否有已保存的图标信息
                this.loadFromStorage();

                // 检查当前页面是否已有图标
                this.loadIcons().then(() => {
                    // 从localStorage加载已保存的脚本URL并尝试加载
                    this.loadSavedScripts().then(() => resolve());
                });
            });
        }
        return this.initPromise;
    }

    // 从localStorage加载保存的图标信息
    private loadFromStorage(): void {
        try {
            const storedIcons = localStorage.getItem('iconfont-registry');
            if (storedIcons) {
                const parsed = JSON.parse(storedIcons);
                const registry = new Map<string, IconInfo>();

                // 转换回Map结构
                Object.entries(parsed).forEach(([key, value]) => {
                    registry.set(key, value as IconInfo);
                });

                this._iconRegistry.value = registry;
                console.log(`IconService: 从缓存加载了 ${registry.size} 个图标`);
            }

            // 加载已保存的脚本列表
            const storedScripts = localStorage.getItem('iconfont-scripts');
            if (storedScripts) {
                this._iconScripts.value = new Set(JSON.parse(storedScripts));
            }
        } catch (error) {
            console.error('IconService: 从缓存加载图标失败', error);
        }
    }

    // 保存到localStorage
    private saveToStorage(): void {
        try {
            // 将Map转换为对象以便序列化
            const registryObj = {};
            this._iconRegistry.value.forEach((value, key) => {
                registryObj[key] = value;
            });

            localStorage.setItem('iconfont-registry', JSON.stringify(registryObj));
            localStorage.setItem('iconfont-scripts', JSON.stringify([...this._iconScripts.value]));
        } catch (error) {
            console.error('IconService: 保存图标到缓存失败', error);
        }
    }

    // 加载已保存的脚本
    private async loadSavedScripts(): Promise<void> {
        const scripts = [...this._iconScripts.value];

        // 顺序加载所有脚本
        for (const url of scripts) {
            try {
                await this.loadScriptWithoutRegistry(url);
            } catch (error) {
                console.error(`IconService: 加载保存的脚本 ${url} 失败`, error);
            }
        }

        // 重新解析图标
        await this.loadIcons();
    }

    // 从SVG Symbol中提取图标
    public async loadIcons(): Promise<void> {
        return new Promise<void>((resolve) => {
            // 重置状态
            this._iconsLoaded.value = false;

            // 尝试从页面中获取图标
            const tryExtractFromPage = () => {
                try {
                    const beforeCount = this._iconRegistry.value.size;
                    let iconFound = false;

                    // 1. 尝试从DOM中已存在的SVG符号获取
                    const svgElements = document.querySelectorAll('svg');

                    // 遍历所有SVG元素
                    svgElements.forEach(svg => {
                        const symbols = svg.querySelectorAll('symbol');
                        symbols.forEach(symbol => {
                            const id = symbol.id;
                            if (id && id.startsWith('icon-')) {
                                iconFound = true;
                                // 如果不存在该图标或者该图标不包含addedTime，则添加/更新
                                const existingIcon = this._iconRegistry.value.get(id);
                                if (!existingIcon || !existingIcon.addedTime) {
                                    this._iconRegistry.value.set(id, {
                                        id,
                                        name: this.formatIconName(id),
                                        addedTime: Date.now()
                                    });
                                }
                            }
                        });
                    });

                    // 2. 尝试从iconfont脚本中提取
                    if (window._iconfont_svg_string_) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(window._iconfont_svg_string_, 'text/html');
                        const symbols = doc.querySelectorAll('symbol');

                        symbols.forEach(symbol => {
                            const id = symbol.id;
                            if (id && id.startsWith('icon-')) {
                                iconFound = true;
                                // 如果不存在该图标或者该图标不包含addedTime，则添加/更新
                                const existingIcon = this._iconRegistry.value.get(id);
                                if (!existingIcon || !existingIcon.addedTime) {
                                    this._iconRegistry.value.set(id, {
                                        id,
                                        name: this.formatIconName(id),
                                        addedTime: Date.now()
                                    });
                                }
                            }
                        });
                    }

                    // 只有在找到图标时才更新缓存，防止清空已有的图标
                    if (iconFound) {
                        this.saveToStorage();
                    }

                    const newCount = this._iconRegistry.value.size - beforeCount;
                    if (newCount > 0) {
                        console.log(`IconService: 新增 ${newCount} 个图标，现有 ${this._iconRegistry.value.size} 个图标`);
                    } else {
                        console.log(`IconService: 当前共有 ${this._iconRegistry.value.size} 个图标`);
                    }

                    this._iconsLoaded.value = true;
                    resolve();
                } catch (error) {
                    console.error('IconService: 解析图标失败', error);
                    resolve();
                }
            };

            // 检查图标是否已加载
            if (document.readyState === 'complete') {
                tryExtractFromPage();
            } else {
                // 等待页面加载完成
                window.addEventListener('load', () => {
                    tryExtractFromPage();
                });

                // 定时尝试加载图标（有些情况下load事件可能已经错过）
                setTimeout(() => {
                    if (!this._iconsLoaded.value) {
                        tryExtractFromPage();
                    }
                }, 1000);
            }
        });
    }

    // 格式化图标名称
    private formatIconName(id: string): string {
        return id
            .replace('icon-', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    // 获取所有图标
    public getAllIcons(): IconInfo[] {
        return Array.from(this._iconRegistry.value.values());
    }

    // 检查图标是否存在
    public hasIcon(iconId: string): boolean {
        return this._iconRegistry.value.has(iconId);
    }

    // 获取图标信息
    public getIcon(iconId: string): IconInfo | null {
        return this._iconRegistry.value.get(iconId) || null;
    }

    // 查找并移除现有的iconfont脚本
    private findAndRemoveExistingScripts(): void {
        // 查找所有包含"alicdn.com"的script标签
        const scripts = document.querySelectorAll('script[src*="alicdn.com"][src*="font_"]');

        scripts.forEach(script => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
                console.log(`IconService: 移除了旧的图标脚本: ${script.src}`);
            }
        });

        // 清除window上可能存在的iconfont变量
        if (window._iconfont_svg_string_) {
            delete window._iconfont_svg_string_;
        }
    }

    // 仅加载脚本，不更新注册表
    private loadScriptWithoutRegistry(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // 规范化URL
            const normalizedUrl = this.normalizeUrl(url);

            const script = document.createElement('script');
            script.src = normalizedUrl;
            script.async = true;

            script.onload = () => {
                // 保存当前脚本引用
                this.currentScriptElement = script;
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`加载图标资源失败: ${normalizedUrl}`));
            };

            document.head.appendChild(script);
        });
    }

    // 动态加载新图标（通过script方式，可替换现有脚本）
    public async loadExternalIcons(url: string): Promise<boolean> {
        try {
            // 规范化URL
            const normalizedUrl = this.normalizeUrl(url);

            // 检查URL有效性
            if (!this.isValidIconFontUrl(normalizedUrl)) {
                throw new Error('无效的IconFont URL，请确保URL格式正确');
            }

            // 清除旧的图标注册信息
            this._iconRegistry.value.clear();

            // 移除现有的iconfont脚本
            this.findAndRemoveExistingScripts();

            // 加载新脚本
            await this.loadScriptWithoutRegistry(normalizedUrl);

            // 将URL添加到已加载脚本集合（替换可能已存在的）
            this._iconScripts.value.clear();  // 清除旧的脚本集合
            this._iconScripts.value.add(normalizedUrl);

            // 重置加载状态，以便重新解析图标
            this._iconsLoaded.value = false;

            // 短暂延迟以确保脚本执行完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 重新加载图标
            await this.loadIcons();

            // 检查是否有图标加载
            if (this._iconRegistry.value.size <= 0) {
                console.warn(`IconService: 从 ${normalizedUrl} 未能加载到图标，请检查URL是否正确`);
                return false;
            }

            // 保存更新后的图标和脚本URL到localStorage
            this.saveToStorage();

            // 更新HTML中的Script标签，以便下次页面刷新时自动加载
            this.updateHtmlScriptTag(normalizedUrl);

            return true;
        } catch (error) {
            console.error('IconService: 加载外部图标失败', error);
            throw error;
        }
    }

    // 更新HTML中的Script标签
    private updateHtmlScriptTag(url: string): void {
        try {
            // 使用localStorage存储最新的URL，以便使用者可以手动更新index.html
            localStorage.setItem('latest-iconfont-url', url);
            console.log(`IconService: 请考虑更新index.html中的iconfont脚本链接为: ${url}`);
        } catch (error) {
            console.error('更新HTML脚本标签失败', error);
        }
    }

    // 检查是否已有相同脚本
    private isDuplicateScript(url: string): boolean {
        // 检查是否已在已加载脚本集合中
        if (this._iconScripts.value.has(url)) {
            return true;
        }

        // 检查DOM中是否已有相同src的script标签
        const scripts = document.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.src === url || script.src === `https:${url}` || script.src === `http:${url}`) {
                return true;
            }
        }

        return false;
    }

    // 规范化URL（确保使用//开头或完整的协议）
    private normalizeUrl(url: string): string {
        // 移除首尾空格
        url = url.trim();

        // 如果URL不含协议且不以//开头，添加//
        if (!url.match(/^(https?:)?\/\//i) && !url.startsWith('//')) {
            url = `//${url}`;
        }

        return url;
    }

    // 验证是否为有效的IconFont URL
    private isValidIconFontUrl(url: string): boolean {
        // 基本检查：包含alicdn.com和font_
        return url.includes('alicdn.com') && url.includes('font_') && url.endsWith('.js');
    }

    // 清除图标库
    public clearIcons(): void {
        this._iconRegistry.value.clear();
        this._iconScripts.value.clear();
        localStorage.removeItem('iconfont-registry');
        localStorage.removeItem('iconfont-scripts');
        console.log('IconService: 已清除所有图标');
    }

    // 移除特定URL的图标库
    public async removeIconScript(url: string): Promise<void> {
        const normalizedUrl = this.normalizeUrl(url);

        // 从集合中移除
        this._iconScripts.value.delete(normalizedUrl);

        // 清空当前图标注册表
        this._iconRegistry.value.clear();

        // 重新加载剩余的脚本
        this._iconsLoaded.value = false;
        await this.loadSavedScripts();

        // 保存更新后的状态
        this.saveToStorage();
    }
}

// 导出单例
export const iconService = IconService.getInstance();
export default iconService;