# 域名迁移指南：从 Replit 到 Vercel

## 📋 概述

将 `rofiinternal.org` 从 Replit 迁移到 Vercel 需要更新 DNS 记录。

---

## 🔧 步骤 1：在 Vercel 中配置域名

### 1.1 添加域名到 Vercel 项目

1. **进入 Vercel 项目设置**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择项目 `googoogaga-platform`
   - 进入 **Settings** → **Domains**

2. **添加域名**
   - 点击 **"Add Domain"** 按钮
   - 输入：`rofiinternal.org`
   - 点击 **"Add"**

3. **添加 www 子域名（可选）**
   - 再次点击 **"Add Domain"**
   - 输入：`www.rofiinternal.org`
   - 点击 **"Add"**

4. **获取 DNS 配置信息**
   - Vercel 会显示需要配置的 DNS 记录
   - 通常需要：
     - **A 记录** 或 **CNAME 记录**
     - 可能还需要 **TXT 验证记录**

---

## 🔧 步骤 2：在 Replit 中更新 DNS 记录

### 2.1 登录 Replit 域名管理

1. **访问 Replit 域名管理**
   - 登录 [Replit](https://replit.com)
   - 进入域名管理页面（您刚才看到的页面）
   - 找到 `rofiinternal.org` 的 DNS 记录

### 2.2 删除旧的 DNS 记录

1. **删除现有的 A 记录**
   - 找到类型为 **A** 的记录
   - Hostname: `@`
   - Record: `34.111.179.208`
   - 点击删除图标（垃圾桶）删除此记录

2. **保留或删除 TXT 验证记录**
   - 如果 Vercel 需要新的 TXT 记录，可以删除旧的
   - 如果不需要，可以保留

### 2.3 添加 Vercel 的 DNS 记录

根据 Vercel 提供的配置，添加以下记录：

#### 选项 A：使用 CNAME 记录（推荐）

1. **添加 CNAME 记录**
   - 点击 **"Add DNS record"**
   - **Type**: 选择 `CNAME`
   - **Hostname**: `@`（根域名）
   - **Record**: `cname.vercel-dns.com`
   - 点击保存

2. **添加 www 子域名 CNAME**
   - **Type**: `CNAME`
   - **Hostname**: `www`
   - **Record**: `cname.vercel-dns.com`
   - 点击保存

#### 选项 B：使用 A 记录（如果 CNAME 不支持）

如果 Replit 不支持根域名的 CNAME（某些 DNS 提供商不支持），使用 A 记录：

1. **获取 Vercel 的 IP 地址**
   - 在 Vercel 域名设置页面查看
   - 或使用以下 IP（Vercel 的负载均衡器）：
     - `76.76.21.21`
     - 或 Vercel 提供的其他 IP

2. **添加 A 记录**
   - **Type**: `A`
   - **Hostname**: `@`
   - **Record**: Vercel 提供的 IP 地址
   - 点击保存

#### 选项 C：使用 Vercel 的 DNS（最佳方案）

如果 Replit 允许更改域名服务器（Nameservers）：

1. **在 Vercel 中获取 Nameservers**
   - Vercel → 项目 → Settings → Domains
   - 选择 `rofiinternal.org`
   - 查看 "Nameservers" 部分
   - 通常会显示类似：
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

2. **在 Replit 中更新 Nameservers**
   - 在 Replit 域名设置中
   - 找到 "Nameservers" 或 "DNS Settings"
   - 更新为 Vercel 提供的 Nameservers

---

## 🔧 步骤 3：验证配置

### 3.1 等待 DNS 传播

DNS 更改通常需要：
- **最快**: 几分钟
- **通常**: 1-24 小时
- **最长**: 48 小时

### 3.2 在 Vercel 中验证

1. **检查域名状态**
   - 返回 Vercel → Settings → Domains
   - 查看 `rofiinternal.org` 的状态
   - 应该从 "Invalid Configuration" 变为 "Valid Configuration"

2. **刷新域名**
   - 如果状态未更新，点击 **"Refresh"** 按钮
   - Vercel 会重新检查 DNS 配置

### 3.3 测试访问

1. **等待几分钟后**
   - 访问 `https://rofiinternal.org`
   - 应该显示您的 Vercel 应用

2. **测试 www 子域名**
   - 访问 `https://www.rofiinternal.org`
   - 应该也正常工作

---

## 📝 详细 DNS 配置示例

### 如果使用 CNAME（推荐）

在 Replit DNS 管理中添加：

| Type | Hostname | Record | TTL |
|------|----------|--------|-----|
| CNAME | @ | cname.vercel-dns.com | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

### 如果使用 A 记录

在 Replit DNS 管理中添加：

| Type | Hostname | Record | TTL |
|------|----------|--------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

---

## ⚠️ 常见问题

### 问题 1：Replit 不支持根域名 CNAME

**解决方案**：
- 使用 A 记录指向 Vercel IP
- 或使用 Vercel 的 Nameservers

### 问题 2：DNS 传播缓慢

**解决方案**：
- 使用在线工具检查 DNS 传播：https://dnschecker.org
- 输入 `rofiinternal.org` 查看全球 DNS 状态
- 清除本地 DNS 缓存：
  ```bash
  # macOS
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder
  ```

### 问题 3：Vercel 显示 "Invalid Configuration"

**可能原因**：
- DNS 记录未正确配置
- DNS 传播未完成
- 记录类型错误

**解决方案**：
1. 检查 Replit 中的 DNS 记录是否正确
2. 等待 10-30 分钟后点击 Vercel 中的 "Refresh"
3. 确认记录值与 Vercel 要求的一致

### 问题 4：SSL 证书问题

**说明**：
- Vercel 会自动为您的域名配置 SSL 证书
- 这需要 DNS 配置正确后才能完成
- 通常需要几分钟到几小时

---

## 🔍 验证 DNS 配置

### 使用命令行检查

```bash
# 检查 A 记录
dig rofiinternal.org A

# 检查 CNAME 记录
dig rofiinternal.org CNAME

# 检查所有记录
dig rofiinternal.org ANY
```

### 使用在线工具

- **DNS Checker**: https://dnschecker.org
- **What's My DNS**: https://www.whatsmydns.net

---

## 📋 检查清单

迁移前：
- [ ] 在 Vercel 中添加了 `rofiinternal.org`
- [ ] 在 Vercel 中添加了 `www.rofiinternal.org`（可选）
- [ ] 获取了 Vercel 的 DNS 配置信息

迁移中：
- [ ] 在 Replit 中删除了旧的 A 记录（`34.111.179.208`）
- [ ] 在 Replit 中添加了新的 DNS 记录（CNAME 或 A）
- [ ] 配置了 www 子域名（如果使用）

迁移后：
- [ ] 等待 DNS 传播（10-30 分钟）
- [ ] 在 Vercel 中点击 "Refresh" 验证
- [ ] 域名状态显示 "Valid Configuration"
- [ ] 可以访问 `https://rofiinternal.org`
- [ ] SSL 证书已自动配置

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Vercel 域名设置页面的具体错误信息
2. 查看 Replit DNS 记录是否正确
3. 使用 DNS 检查工具验证传播状态
4. 联系 Vercel 支持（如果问题持续）

---

**完成这些步骤后，您的域名就会指向 Vercel 部署的应用了！** 🚀

