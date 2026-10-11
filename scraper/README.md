# 指南者留学 - 大学信息爬虫

## 📖 简介

这是一个用于爬取 [指南者留学](https://www.compassedu.hk/university) 网站大学信息的 Python 爬虫工具。

## ✨ 功能特性

- 🚀 **多线程爬取**：使用 5 个线程并行爬取，大幅提升效率
- 📊 **完整数据**：爬取全部 13 页，共 364 所大学信息
- 📝 **多格式输出**：同时生成 JSON 和 CSV 两种格式
- 🔗 **高清 Logo**：自动处理 Logo URL，获取原图而非缩略图

## 📦 爬取的数据字段

| 字段名 | 说明 | 示例 |
|--------|------|------|
| `chinese_name` | 大学中文名称 | 麻省理工学院 |
| `english_name` | 大学英文名称 | Massachusetts Institute of Technology |
| `logo_url` | 大学 Logo 图片 URL | https://logo.compassedu.hk/85.png |

## 🚀 快速开始

### 1. 安装依赖

```bash
cd scraper
pip install -r requirements.txt
```

### 2. 运行爬虫

```bash
python university_scraper.py
```

### 3. 查看结果

爬取完成后，会在当前目录生成两个文件：
- `universities.json` - JSON 格式数据
- `universities.csv` - CSV 格式数据（Excel 可直接打开）

## 📁 输出文件示例

### JSON 格式

```json
[
  {
    "chinese_name": "麻省理工学院",
    "english_name": "Massachusetts Institute of Technology",
    "logo_url": "https://logo.compassedu.hk/85.png"
  },
  {
    "chinese_name": "帝国理工学院",
    "english_name": "Imperial College London",
    "logo_url": "https://logo.compassedu.hk/3.png"
  }
]
```

### CSV 格式

```csv
chinese_name,english_name,logo_url
麻省理工学院,Massachusetts Institute of Technology,https://logo.compassedu.hk/85.png
帝国理工学院,Imperial College London,https://logo.compassedu.hk/3.png
```

## ⚙️ 配置参数

在 `university_scraper.py` 文件中可以修改以下参数：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `TOTAL_PAGES` | 13 | 总页数 |
| `MAX_WORKERS` | 5 | 线程数 |

## 🛠️ 技术实现

- **HTTP 请求**：`requests` 库
- **HTML 解析**：`BeautifulSoup4` + `lxml`
- **多线程**：`concurrent.futures.ThreadPoolExecutor`
- **数据格式**：`json` + `csv`

## ⚠️ 注意事项

1. 请合理使用爬虫，避免频繁请求对目标网站造成压力
2. 爬取的数据仅供学习和研究使用
3. 如网站结构发生变化，可能需要更新解析逻辑

## 📊 爬取统计

- **总大学数**：364 所
- **总页数**：13 页
- **爬取耗时**：约 5-10 秒（取决于网络状况）

---

## 🔄 数据导入到 Supabase

### 功能说明

`import_to_supabase.py` 脚本用于将爬取的数据导入到 Supabase `schools` 表：

1. **已存在的学校**（通过中文名匹配）→ 只更新 `logo_url` 字段
2. **不存在的学校** → 插入完整记录，自动填充 `country` 和 `region` 字段

### 使用方法

```bash
# 1. 确保已爬取数据
python university_scraper.py

# 2. 执行导入
python import_to_supabase.py
```

### 自动填充的字段

| 字段 | 说明 |
|------|------|
| `cn_name` | 中文名称 |
| `en_name` | 英文名称 |
| `logo_url` | Logo 图片 URL |
| `country` | 国家（自动识别） |
| `region` | 地区（自动识别） |
| `is_verified` | 默认为 false |

### 国家识别统计

导入后按国家分布：

| 国家 | 数量 |
|------|------|
| 美国 | 133 所 |
| 英国 | 54 所 |
| 澳大利亚 | 16 所 |
| 中国香港 | 12 所 |
| 法国 | 9 所 |
| 瑞士 | 8 所 |
| 德国 | 7 所 |
| 马来西亚 | 7 所 |
| 其他 | 92 所 |

## 📄 许可证

MIT License

---

**作者**：AI进化论-花生

