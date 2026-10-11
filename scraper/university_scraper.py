"""
大学信息爬虫
爬取 https://www.compassedu.hk/university 网站的大学信息
包括：中文名、英文名、Logo URL

作者：AI进化论-花生
功能：使用多线程爬取13页大学数据
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from typing import List, Dict, Optional

# 配置参数
BASE_URL = "https://www.compassedu.hk/university"
TOTAL_PAGES = 13
MAX_WORKERS = 5  # 线程数
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# 请求头，模拟浏览器访问
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": "https://www.compassedu.hk/",
}

# 线程安全的数据存储
all_universities: List[Dict] = []
data_lock = Lock()
progress_lock = Lock()
completed_pages = 0


def get_logo_url(img_src: str) -> str:
    """
    处理 Logo URL，获取高清版本
    原始URL示例: https://logo.compassedu.hk/85.png?imageMogr2/thumbnail/!50p/blur/1x0/quality/50
    返回清晰版本: https://logo.compassedu.hk/85.png
    """
    if img_src:
        # 移除图片处理参数，获取原始图片
        return img_src.split("?")[0]
    return ""


def parse_university_item(item) -> Optional[Dict]:
    """
    解析单个大学信息
    
    参数:
        item: BeautifulSoup 元素，代表一个大学卡片
        
    返回:
        包含大学信息的字典，或 None（解析失败时）
    """
    try:
        # 获取中文名
        cname_elem = item.select_one(".cname")
        chinese_name = cname_elem.get_text(strip=True) if cname_elem else ""
        
        # 获取英文名
        ename_elem = item.select_one(".ename")
        english_name = ename_elem.get_text(strip=True) if ename_elem else ""
        
        # 获取 Logo URL
        img_elem = item.select_one(".slot_left img")
        logo_url = ""
        if img_elem:
            # 优先使用 src 属性
            logo_url = img_elem.get("src", "")
            logo_url = get_logo_url(logo_url)
        
        # 只有当至少有中文名时才返回数据
        if chinese_name:
            return {
                "chinese_name": chinese_name,
                "english_name": english_name,
                "logo_url": logo_url
            }
    except Exception as e:
        print(f"  [警告] 解析大学信息时出错: {e}")
    
    return None


def fetch_page(page_num: int) -> List[Dict]:
    """
    爬取单页数据
    
    参数:
        page_num: 页码 (1-13)
        
    返回:
        该页所有大学信息的列表
    """
    global completed_pages
    
    universities = []
    
    # 构建 URL（第一页不需要页码参数）
    if page_num == 1:
        url = BASE_URL
    else:
        url = f"{BASE_URL}?page={page_num}"
    
    try:
        print(f"[线程] 正在爬取第 {page_num} 页: {url}")
        
        # 发送请求
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        response.encoding = "utf-8"
        
        # 解析 HTML
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 查找所有大学卡片
        univ_items = soup.select(".univ-item")
        
        for item in univ_items:
            univ_data = parse_university_item(item)
            if univ_data:
                universities.append(univ_data)
        
        print(f"[完成] 第 {page_num} 页爬取完成，获取 {len(universities)} 所大学")
        
        # 更新进度
        with progress_lock:
            completed_pages += 1
            print(f"[进度] 已完成 {completed_pages}/{TOTAL_PAGES} 页")
        
    except requests.RequestException as e:
        print(f"[错误] 第 {page_num} 页请求失败: {e}")
    except Exception as e:
        print(f"[错误] 第 {page_num} 页处理失败: {e}")
    
    return universities


def scrape_all_universities() -> List[Dict]:
    """
    使用多线程爬取所有页面的大学数据
    
    返回:
        所有大学信息的列表
    """
    global all_universities, completed_pages
    all_universities = []
    completed_pages = 0
    
    print("=" * 60)
    print("开始爬取大学信息")
    print(f"总页数: {TOTAL_PAGES}")
    print(f"线程数: {MAX_WORKERS}")
    print("=" * 60)
    
    start_time = time.time()
    
    # 使用线程池执行爬取任务
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # 提交所有页面的爬取任务
        future_to_page = {
            executor.submit(fetch_page, page): page 
            for page in range(1, TOTAL_PAGES + 1)
        }
        
        # 收集结果
        for future in as_completed(future_to_page):
            page_num = future_to_page[future]
            try:
                page_universities = future.result()
                with data_lock:
                    all_universities.extend(page_universities)
            except Exception as e:
                print(f"[错误] 第 {page_num} 页任务异常: {e}")
    
    elapsed_time = time.time() - start_time
    
    print("=" * 60)
    print(f"爬取完成！")
    print(f"总耗时: {elapsed_time:.2f} 秒")
    print(f"获取大学总数: {len(all_universities)}")
    print("=" * 60)
    
    return all_universities


def save_to_json(data: List[Dict], filename: str = "universities.json"):
    """
    将数据保存为 JSON 文件
    
    参数:
        data: 大学数据列表
        filename: 输出文件名
    """
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"[保存] JSON 文件已保存: {filepath}")
    return filepath


def save_to_csv(data: List[Dict], filename: str = "universities.csv"):
    """
    将数据保存为 CSV 文件
    
    参数:
        data: 大学数据列表
        filename: 输出文件名
    """
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
        if data:
            writer = csv.DictWriter(f, fieldnames=["chinese_name", "english_name", "logo_url"])
            writer.writeheader()
            writer.writerows(data)
    
    print(f"[保存] CSV 文件已保存: {filepath}")
    return filepath


def main():
    """
    主函数：执行爬取并保存数据
    """
    print("\n" + "🎓" * 30)
    print("    指南者留学 - 大学信息爬虫")
    print("🎓" * 30 + "\n")
    
    # 执行爬取
    universities = scrape_all_universities()
    
    if universities:
        # 按中文名排序（可选）
        universities.sort(key=lambda x: x.get("chinese_name", ""))
        
        # 保存数据
        json_path = save_to_json(universities)
        csv_path = save_to_csv(universities)
        
        # 显示部分数据预览
        print("\n" + "=" * 60)
        print("数据预览（前 10 所大学）:")
        print("=" * 60)
        for i, univ in enumerate(universities[:10], 1):
            print(f"{i}. {univ['chinese_name']}")
            print(f"   英文名: {univ['english_name']}")
            print(f"   Logo: {univ['logo_url']}")
            print()
        
        print(f"\n✅ 爬取成功！共获取 {len(universities)} 所大学信息")
        print(f"📁 JSON 文件: {json_path}")
        print(f"📁 CSV 文件: {csv_path}")
    else:
        print("\n❌ 未获取到任何数据，请检查网络连接或网站结构是否变化")
    
    return universities


if __name__ == "__main__":
    main()

