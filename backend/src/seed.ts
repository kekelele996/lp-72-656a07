import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { User, UserDocument } from './users/user.schema';
import { Folder, FolderDocument } from './folders/folder.schema';
import { DocumentModel, DocumentDocument, Visibility } from './documents/document.schema';
import { Version, VersionDocument } from './versions/version.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<{ new (...args: any[]): UserDocument } & any>(
      getModelToken(User.name),
    );
    const folderModel = app.get<{ new (...args: any[]): FolderDocument } & any>(
      getModelToken(Folder.name),
    );
    const documentModel = app.get<{ new (...args: any[]): DocumentDocument } & any>(
      getModelToken(DocumentModel.name),
    );
    const versionModel = app.get<{ new (...args: any[]): VersionDocument } & any>(
      getModelToken(Version.name),
    );

    console.log('Starting seed...');

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedMemberPassword = await bcrypt.hash('member123', 10);

    console.log('Creating users...');
    const adminUser = await userModel.findOneAndUpdate(
      { username: 'admin' },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        displayName: '管理员',
        role: 'admin',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const memberUser = await userModel.findOneAndUpdate(
      { username: 'member' },
      {
        username: 'member',
        email: 'member@example.com',
        password: hashedMemberPassword,
        displayName: '普通成员',
        role: 'user',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log('Creating folders...');
    const productFolder = await folderModel.findOneAndUpdate(
      { name: '产品文档', createdBy: adminUser._id },
      {
        name: '产品文档',
        parentId: null,
        createdBy: adminUser._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const techFolder = await folderModel.findOneAndUpdate(
      { name: '技术文档', createdBy: adminUser._id },
      {
        name: '技术文档',
        parentId: null,
        createdBy: adminUser._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log('Creating documents...');

    const prdDoc = await documentModel.findOneAndUpdate(
      { title: '产品需求文档 v1.0', createdBy: adminUser._id },
      {
        title: '产品需求文档 v1.0',
        content: `## 产品概述\n\n本产品是一个团队知识库系统，旨在帮助团队高效管理文档和知识。\n\n## 核心功能\n\n1. **文档管理** - 支持创建、编辑、删除文档\n2. **富文本编辑** - 支持标题、加粗、列表、代码块\n3. **版本控制** - 自动保存历史版本\n4. **全文搜索** - 快速定位所需内容\n\n## 技术栈\n\n\`\`\`\n前端：React + TypeScript + Tailwind CSS\n后端：NestJS + TypeScript\n数据库：MongoDB\n\`\`\`\n\n## 项目目标\n\n- 提高团队知识共享效率\n- 降低文档查找成本\n- 保障知识资产安全`,
        folderId: productFolder._id,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        visibility: Visibility.PRIVATE,
        tags: ['产品', '需求', 'PRD'],
        version: 3,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const roadmapDoc = await documentModel.findOneAndUpdate(
      { title: '产品路线图', createdBy: adminUser._id },
      {
        title: '产品路线图',
        content: `## 产品路线图\n\n### Q1 2024\n\n| 里程碑 | 时间 | 状态 |\n| --- | --- | --- |\n| 基础功能 | 1-2月 | 已完成 |\n| 权限管理 | 2-3月 | 进行中 |\n\n### Q2 2024\n\n| 里程碑 | 时间 | 状态 |\n| --- | --- | --- |\n| 团队协作 | 4-5月 | 待开始 |\n| 第三方集成 | 5-6月 | 待开始 |\n\n### 未来规划\n\n- 移动端支持\n- 离线编辑\n- AI 智能推荐`,
        folderId: productFolder._id,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        visibility: Visibility.PRIVATE,
        tags: ['产品', '路线图'],
        version: 1,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const apiDoc = await documentModel.findOneAndUpdate(
      { title: 'API 接口规范', createdBy: adminUser._id },
      {
        title: 'API 接口规范',
        content: `## API 接口规范\n\n### 认证\n\n所有 API 请求需要携带 JWT Token：\n\n\`\`\`json\n{\n  \"Authorization\": \"Bearer <your_token>\"\n}\n\`\`\`\n\n### 用户接口\n\n\`\`\`\nGET /api/users/me      # 获取当前用户\nPOST /api/auth/login   # 登录\nPOST /api/auth/register # 注册\n\`\`\`\n\n### 文档接口\n\n\`\`\`\nGET    /api/documents     # 获取文档列表\nPOST   /api/documents     # 创建文档\nGET    /api/documents/:id # 获取文档详情\nPATCH  /api/documents/:id # 更新文档\nDELETE /api/documents/:id # 删除文档\n\`\`\`\n\n### 响应格式\n\n\`\`\`json\n{\n  \"success\": true,\n  \"data\": {},\n  \"message\": \"操作成功\"\n}\n\`\`\``,
        folderId: techFolder._id,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        visibility: Visibility.PRIVATE,
        tags: ['API', '后端', '接口'],
        version: 1,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const dbDoc = await documentModel.findOneAndUpdate(
      { title: '数据库设计', createdBy: adminUser._id },
      {
        title: '数据库设计',
        content: `## 数据库设计文档\n\n### 用户表 (users)\n\n| 字段 | 类型 | 说明 |\n| --- | --- | --- |\n| _id | ObjectId | 主键 |\n| username | String | 用户名，唯一 |\n| email | String | 邮箱，唯一 |\n| password | String | 加密密码 |\n\n### 文档表 (documents)\n\n| 字段 | 类型 | 说明 |\n| --- | --- | --- |\n| _id | ObjectId | 主键 |\n| title | String | 文档标题 |\n| content | String | 文档内容 |\n| createdBy | ObjectId | 创建者 |\n| visibility | Enum | 可见性 |\n\n### 索引设计\n\n\`\`\`javascript\n// 全文搜索索引\ndb.documents.createIndex({ title: 'text', content: 'text' });\n\n// 常用查询索引\ndb.documents.createIndex({ createdBy: 1, updatedAt: -1 });\ndb.versions.createIndex({ documentId: 1, versionNumber: -1 });\n\`\`\``,
        folderId: techFolder._id,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        visibility: Visibility.PRIVATE,
        tags: ['数据库', '设计', 'MongoDB'],
        version: 1,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const teamDoc = await documentModel.findOneAndUpdate(
      { title: '团队规范', createdBy: adminUser._id },
      {
        title: '团队规范',
        content: `## 团队规范\n\n### 代码规范\n\n1. 使用 TypeScript 编写代码\n2. 遵循 ESLint 规则\n3. 提交前必须通过 lint 检查\n\n### 文档规范\n\n1. 技术文档使用 Markdown 格式\n2. 重要文档需要审核\n3. 及时更新过时内容\n\n### 协作规范\n\n1. 每周五进行代码评审\n2. 有问题及时沟通\n3. 保持代码库整洁\n\n> 注意：本文档是公开文档，所有团队成员均可查看。`,
        folderId: null,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        visibility: Visibility.PUBLIC,
        tags: ['团队', '规范', '协作'],
        version: 1,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log('Creating versions for PRD document...');
    await versionModel.deleteMany({ documentId: prdDoc._id });

    await versionModel.create([
      {
        documentId: prdDoc._id,
        versionNumber: 1,
        title: '产品需求文档 v1.0',
        content: `## 产品概述\n\n初始版本，仅包含产品概述。`,
        createdBy: adminUser._id,
        changeLog: 'Initial version',
      },
      {
        documentId: prdDoc._id,
        versionNumber: 2,
        title: '产品需求文档 v1.0',
        content: `## 产品概述\n\n本产品是一个团队知识库系统，旨在帮助团队高效管理文档和知识。\n\n## 核心功能\n\n1. 文档管理\n2. 富文本编辑`,
        createdBy: adminUser._id,
        changeLog: 'Added core features section',
      },
      {
        documentId: prdDoc._id,
        versionNumber: 3,
        title: '产品需求文档 v1.0',
        content: `## 产品概述\n\n本产品是一个团队知识库系统，旨在帮助团队高效管理文档和知识。\n\n## 核心功能\n\n1. **文档管理** - 支持创建、编辑、删除文档\n2. **富文本编辑** - 支持标题、加粗、列表、代码块\n3. **版本控制** - 自动保存历史版本\n4. **全文搜索** - 快速定位所需内容\n\n## 技术栈\n\n\`\`\`\n前端：React + TypeScript + Tailwind CSS\n后端：NestJS + TypeScript\n数据库：MongoDB\n\`\`\`\n\n## 项目目标\n\n- 提高团队知识共享效率\n- 降低文档查找成本\n- 保障知识资产安全`,
        createdBy: adminUser._id,
        changeLog: 'Added tech stack and project goals',
      },
    ]);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
