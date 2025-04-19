// utils/fileValidator.ts
import { message } from 'ant-design-vue';

/**
 * 文件类型与大小限制配置
 */
export interface FileValidationConfig {
    // 允许的文件类型，例如：['image/jpeg', 'image/png']
    allowedTypes?: string[];
    // 允许的文件扩展名，例如：['.jpg', '.png']
    allowedExtensions?: string[];
    // 最大文件大小（字节）
    maxSize?: number;
    // 最小文件大小（字节）
    minSize?: number;
    // 自定义验证函数
    customValidator?: (file: File) => boolean | Promise<boolean>;
    // 错误消息配置
    errorMessages?: {
        typeError?: string;
        extensionError?: string;
        maxSizeError?: string;
        minSizeError?: string;
        customError?: string;
    };
}

/**
 * 文件验证结果
 */
export interface FileValidationResult {
    valid: boolean;
    message?: string;
    file?: File;
}

/**
 * 默认配置
 */
const defaultConfig: FileValidationConfig = {
    maxSize: 10 * 1024 * 1024, // 默认10MB
    errorMessages: {
        typeError: '文件类型不支持',
        extensionError: '文件扩展名不支持',
        maxSizeError: '文件大小超过限制',
        minSizeError: '文件大小低于最小要求',
        customError: '文件验证失败'
    }
};

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 文件扩展名（小写）
 */
export const getFileExtension = (fileName: string): string => {
    return fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
};

/**
 * 格式化文件大小显示
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
};

/**
 * 验证单个文件
 * @param file 要验证的文件
 * @param config 验证配置
 * @returns 验证结果
 */
export const validateFile = async (
    file: File,
    config: FileValidationConfig = {}
): Promise<FileValidationResult> => {
    // 合并默认配置
    const mergedConfig = { ...defaultConfig, ...config };
    const {
        allowedTypes,
        allowedExtensions,
        maxSize,
        minSize,
        customValidator,
        errorMessages
    } = mergedConfig;

    // 验证文件类型
    if (allowedTypes && allowedTypes.length > 0) {
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: errorMessages?.typeError || defaultConfig.errorMessages?.typeError,
                file
            };
        }
    }

    // 验证文件扩展名
    if (allowedExtensions && allowedExtensions.length > 0) {
        const extension = getFileExtension(file.name);
        if (!allowedExtensions.includes(extension)) {
            return {
                valid: false,
                message: errorMessages?.extensionError || defaultConfig.errorMessages?.extensionError,
                file
            };
        }
    }

    // 验证最大文件大小
    if (maxSize && file.size > maxSize) {
        const formattedSize = formatFileSize(maxSize);
        return {
            valid: false,
            message: (errorMessages?.maxSizeError || defaultConfig.errorMessages?.maxSizeError) + `（最大 ${formattedSize}）`,
            file
        };
    }

    // 验证最小文件大小
    if (minSize && file.size < minSize) {
        const formattedSize = formatFileSize(minSize);
        return {
            valid: false,
            message: (errorMessages?.minSizeError || defaultConfig.errorMessages?.minSizeError) + `（最小 ${formattedSize}）`,
            file
        };
    }

    // 执行自定义验证
    if (customValidator) {
        try {
            const isValid = await Promise.resolve(customValidator(file));
            if (!isValid) {
                return {
                    valid: false,
                    message: errorMessages?.customError || defaultConfig.errorMessages?.customError,
                    file
                };
            }
        } catch (error) {
            return {
                valid: false,
                message: error instanceof Error ? error.message : String(error),
                file
            };
        }
    }

    // 所有验证通过
    return {
        valid: true,
        file
    };
};

/**
 * 预设配置 - 图片文件验证
 */
export const imageValidationConfig: FileValidationConfig = {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5MB
    errorMessages: {
        typeError: '请上传图片文件 (JPG, PNG, GIF, WEBP, SVG)',
        maxSizeError: '图片大小不能超过5MB'
    }
};

/**
 * 预设配置 - 头像图片验证
 */
export const avatarValidationConfig: FileValidationConfig = {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    errorMessages: {
        typeError: '请上传头像图片 (JPG, PNG, WEBP)',
        maxSizeError: '头像图片大小不能超过2MB'
    }
};

/**
 * 预设配置 - 文档文件验证
 */
export const documentValidationConfig: FileValidationConfig = {
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    maxSize: 20 * 1024 * 1024, // 20MB
    errorMessages: {
        extensionError: '请上传有效的文档文件 (PDF, Word, Excel, PowerPoint, TXT)',
        maxSizeError: '文档大小不能超过20MB'
    }
};

/**
 * 封装的文件上传验证方法，自动显示错误消息
 * @param file 要验证的文件
 * @param config 验证配置
 * @returns 如果验证通过返回true，否则返回false
 */
export const validateFileWithFeedback = async (
    file: File,
    config: FileValidationConfig = {}
): Promise<boolean> => {
    const result = await validateFile(file, config);

    if (!result.valid && result.message) {
        message.error(result.message);
        return false;
    }

    return true;
};

/**
 * 图片文件转换为 Data URL
 * @param file 图片文件
 * @returns Promise<string> Data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * 压缩图片
 * @param file 图片文件
 * @param options 压缩选项
 * @returns Promise<File> 压缩后的图片文件
 */
export const compressImage = async (
    file: File,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        type?: string;
    } = {}
): Promise<File> => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        type = file.type
    } = options;

    // 如果不是图片，直接返回原文件
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
        return file;
    }

    // 转换为Data URL
    const dataUrl = await fileToDataURL(file);

    // 创建图片对象
    const image = new Image();
    await new Promise((resolve) => {
        image.onload = resolve;
        image.src = dataUrl;
    });

    // 计算缩放尺寸
    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    // 绘制到Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return file; // 如果无法获取上下文，返回原文件
    }

    ctx.drawImage(image, 0, 0, width, height);

    // 转换回Blob
    const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((result) => {
            if (result) {
                resolve(result);
            } else {
                // 如果转换失败，返回空Blob
                resolve(new Blob([], { type }));
            }
        }, type, quality);
    });

    // 创建新文件
    const compressedFile = new File([blob], file.name, {
        type,
        lastModified: file.lastModified
    });

    // 如果压缩后比原文件大，返回原文件
    return compressedFile.size < file.size ? compressedFile : file;
};

export default {
    validateFile,
    validateFileWithFeedback,
    fileToDataURL,
    compressImage,
    formatFileSize,
    getFileExtension,
    imageValidationConfig,
    avatarValidationConfig,
    documentValidationConfig
};