"""
学校数据导入脚本
将爬取的大学数据导入到 Supabase schools 表

功能：
1. 已存在的学校（通过中文名匹配）-> 只更新 logo_url
2. 不存在的学校 -> 插入完整记录（填充其他字段）

作者：AI进化论-花生
"""

import json
import os
from supabase import create_client, Client
from typing import Dict, List, Optional, Tuple
import re

# ============================================
# 配置区域 - 请根据实际情况修改
# ============================================

# Supabase 配置
SUPABASE_URL = "https://swyajeiqqewyckzbfkid.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWFqZWlxcWV3eWNremJma2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0ODQxNDUsImV4cCI6MjA1MzA2MDE0NX0.Q3ayCcjYwGuWAPMNF_O98XQV7P4Q8rDx4P2mO3LW7Zs"

# 数据文件路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "universities.json")

# ============================================
# 国家/地区识别规则
# ============================================

# 通过学校名称或英文名识别国家/地区
COUNTRY_KEYWORDS = {
    "英国": ["UK", "United Kingdom", "Britain", "British", "England", "Scotland", "Wales", 
             "London", "Oxford", "Cambridge", "Manchester", "Edinburgh", "Birmingham", 
             "Bristol", "Leeds", "Liverpool", "Southampton", "Glasgow", "Sheffield",
             "Warwick", "Durham", "York", "Bath", "Exeter", "Lancaster", "Leicester",
             "Nottingham", "Sussex", "Surrey", "Cardiff", "Reading", "Queen Mary",
             "Imperial College", "UCL", "LSE", "SOAS", "Royal Holloway", "Goldsmiths",
             "King's College", "City, University of London", "Cranfield"],
    "美国": ["USA", "United States", "America", "American",
             "MIT", "Stanford", "Harvard", "Yale", "Princeton", "Columbia", "Cornell",
             "Berkeley", "UCLA", "USC", "NYU", "Chicago", "Pennsylvania", "Duke",
             "Northwestern", "Carnegie Mellon", "Georgia Tech", "Michigan", "Virginia",
             "Boston", "California", "Texas", "Florida", "Illinois", "Ohio", "Washington",
             "Arizona", "Colorado", "Maryland", "North Carolina", "Indiana", "Wisconsin",
             "Minnesota", "Purdue", "Penn State", "Iowa", "Oregon", "Utah", "Emory",
             "Rice", "Vanderbilt", "Notre Dame", "Georgetown", "Johns Hopkins", "Tufts",
             "Brandeis", "Rochester", "Case Western", "Northeastern", "Syracuse", "Tulane",
             "Miami", "Denver", "San Diego", "Pepperdine", "Fordham", "American University",
             "George Washington", "George Mason", "Rensselaer", "Stevens", "WPI",
             "Illinois Institute", "Drexel", "Temple", "Pittsburgh", "Buffalo", "Stony Brook"],
    "澳大利亚": ["Australia", "Australian", "Sydney", "Melbourne", "Queensland", "Monash",
                 "Adelaide", "Western Australia", "UNSW", "New South Wales", "ANU",
                 "Macquarie", "Wollongong", "Newcastle", "Deakin", "Griffith", "RMIT",
                 "Curtin", "UTS", "La Trobe", "Swinburne", "Tasmania", "Flinders"],
    "加拿大": ["Canada", "Canadian", "Toronto", "McGill", "UBC", "British Columbia", 
               "Montreal", "Waterloo", "Alberta", "Ottawa", "Queen's", "McMaster",
               "Western", "Calgary", "Simon Fraser", "Victoria", "Dalhousie", "Manitoba"],
    "新加坡": ["Singapore", "NUS", "NTU", "Nanyang", "SMU", "Singapore Management"],
    "中国香港": ["Hong Kong", "HKU", "CUHK", "HKUST", "PolyU", "City University of Hong Kong",
                "Baptist University", "Lingnan", "Education University"],
    "中国澳门": ["Macau", "Macao", "澳门"],
    "日本": ["Japan", "Japanese", "Tokyo", "Kyoto", "Osaka", "Nagoya", "Tohoku", "Hokkaido",
             "Waseda", "Keio", "早稻田", "庆应"],
    "德国": ["Germany", "German", "Munich", "Berlin", "Heidelberg", "TUM", "LMU",
             "Aachen", "RWTH", "Bonn", "Hamburg", "Frankfurt", "Göttingen", "Freiburg",
             "Mannheim", "Karlsruhe", "Stuttgart", "Dresden", "Leipzig", "慕尼黑", "柏林"],
    "法国": ["France", "French", "Paris", "HEC", "ESSEC", "ESCP", "INSEAD", "Sciences Po",
             "Sorbonne", "Polytechnique", "巴黎", "里昂", "马赛"],
    "荷兰": ["Netherlands", "Dutch", "Amsterdam", "Rotterdam", "Leiden", "Utrecht", "Delft",
             "Eindhoven", "Tilburg", "Maastricht", "Groningen", "Erasmus", "阿姆斯特丹"],
    "瑞士": ["Switzerland", "Swiss", "ETH Zurich", "EPFL", "Zurich", "Geneva", "Lausanne",
             "St. Gallen", "Basel", "Bern", "苏黎世", "日内瓦", "洛桑"],
    "爱尔兰": ["Ireland", "Irish", "Dublin", "Trinity College Dublin", "UCD", "都柏林"],
    "瑞典": ["Sweden", "Swedish", "Stockholm", "KTH", "Uppsala", "Lund", "Gothenburg", "斯德哥尔摩"],
    "丹麦": ["Denmark", "Danish", "Copenhagen", "哥本哈根"],
    "挪威": ["Norway", "Norwegian", "Oslo", "奥斯陆"],
    "芬兰": ["Finland", "Finnish", "Helsinki", "Aalto", "赫尔辛基"],
    "比利时": ["Belgium", "Belgian", "KU Leuven", "Ghent", "Brussels", "鲁汶", "布鲁塞尔"],
    "奥地利": ["Austria", "Austrian", "Vienna", "维也纳"],
    "意大利": ["Italy", "Italian", "Milan", "Rome", "Bologna", "米兰", "罗马", "博洛尼亚"],
    "西班牙": ["Spain", "Spanish", "Barcelona", "Madrid", "巴塞罗那", "马德里"],
    "新西兰": ["New Zealand", "Auckland", "Wellington", "奥克兰", "惠灵顿"],
    "韩国": ["Korea", "Korean", "Seoul", "首尔", "延世", "高丽"],
    "马来西亚": ["Malaysia", "Malaysian", "马来西亚", "吉隆坡", "槟城"],
}

# 通过中文名关键词识别
CN_COUNTRY_KEYWORDS = {
    "英国": ["伦敦", "牛津", "剑桥", "曼彻斯特", "爱丁堡", "伯明翰", "布里斯托", "利兹",
             "利物浦", "谢菲尔德", "格拉斯哥", "华威", "杜伦", "约克", "巴斯", "埃克塞特",
             "兰卡斯特", "萨里", "苏塞克斯", "诺丁汉", "卡迪夫", "雷丁", "帝国理工",
             "伦敦大学", "伦敦政经", "伦敦商学院", "皇家", "亚非学院", "金史密斯"],
    "美国": ["麻省理工", "哈佛", "耶鲁", "普林斯顿", "哥伦比亚", "康奈尔", "斯坦福",
             "加州大学", "加州理工", "纽约大学", "芝加哥大学", "宾夕法尼亚", "杜克",
             "西北大学", "卡内基梅隆", "佐治亚理工", "密歇根", "弗吉尼亚", "波士顿",
             "得克萨斯", "佛罗里达", "伊利诺伊", "俄亥俄", "华盛顿", "亚利桑那",
             "科罗拉多", "马里兰", "北卡罗来纳", "印第安纳", "威斯康星", "明尼苏达",
             "普渡", "爱荷华", "俄勒冈", "犹他", "埃默里", "莱斯", "范德堡", "圣母",
             "乔治城", "约翰霍普金斯", "塔夫茨", "布兰迪斯", "罗切斯特", "凯斯西储",
             "东北大学（美国）", "雪城", "杜兰", "迈阿密", "丹佛", "圣迭戈", "佩珀代因",
             "福特汉姆", "美利坚", "乔治华盛顿", "乔治梅森", "伦斯勒", "史蒂文斯"],
    "澳大利亚": ["悉尼", "墨尔本", "昆士兰", "莫纳什", "阿德莱德", "西澳", "新南威尔士",
                 "澳大利亚国立", "麦考瑞", "伍伦贡", "纽卡斯尔", "迪肯", "格里菲斯",
                 "皇家墨尔本", "科廷", "拉筹伯", "斯威本", "塔斯马尼亚", "弗林德斯"],
    "加拿大": ["多伦多", "麦吉尔", "英属哥伦比亚", "蒙特利尔", "滑铁卢", "阿尔伯塔",
               "渥太华", "女王", "麦克马斯特", "西安大略", "卡尔加里", "西蒙弗雷泽",
               "维多利亚", "达尔豪斯", "曼尼托巴"],
    "新加坡": ["新加坡国立", "南洋理工", "新加坡管理"],
    "中国香港": ["香港大学", "香港中文", "香港科技", "香港理工", "香港城市", "香港浸会",
                "岭南", "香港教育"],
    "中国澳门": ["澳门大学", "澳门科技", "澳门城市", "澳门理工"],
    "日本": ["东京", "京都", "大阪", "名古屋", "东北", "北海道", "早稻田", "庆应"],
    "德国": ["慕尼黑", "柏林", "海德堡", "亚琛", "波恩", "汉堡", "法兰克福", "哥廷根",
             "弗莱堡", "曼海姆", "卡尔斯鲁厄", "斯图加特", "德累斯顿", "莱比锡"],
    "法国": ["巴黎", "里昂", "马赛", "巴黎高等", "索邦", "巴黎综合理工", "巴黎文理"],
    "荷兰": ["阿姆斯特丹", "鹿特丹", "莱顿", "乌得勒支", "代尔夫特", "埃因霍温",
             "蒂尔堡", "马斯特里赫特", "格罗宁根", "伊拉斯姆斯"],
    "瑞士": ["苏黎世", "日内瓦", "洛桑", "圣加仑", "巴塞尔", "伯尔尼"],
    "爱尔兰": ["都柏林", "圣三一"],
    "瑞典": ["斯德哥尔摩", "乌普萨拉", "隆德", "哥德堡"],
    "丹麦": ["哥本哈根"],
    "挪威": ["奥斯陆"],
    "芬兰": ["赫尔辛基", "阿尔托"],
    "比利时": ["鲁汶", "根特", "布鲁塞尔"],
    "奥地利": ["维也纳"],
    "意大利": ["米兰", "罗马", "博洛尼亚"],
    "西班牙": ["巴塞罗那", "马德里"],
    "新西兰": ["奥克兰", "惠灵顿"],
    "韩国": ["首尔", "延世", "高丽", "成均馆"],
    "马来西亚": ["马来亚", "马来西亚"],
}


def identify_country_region(cn_name: str, en_name: str) -> Tuple[str, str]:
    """
    根据学校名称识别国家和地区
    
    返回: (country, region)
    """
    combined = f"{cn_name} {en_name}"
    
    # 先检查中文名关键词
    for country, keywords in CN_COUNTRY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in cn_name:
                return country, get_region(country)
    
    # 再检查英文名关键词
    for country, keywords in COUNTRY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in en_name.lower():
                return country, get_region(country)
    
    # 默认返回
    return "其他", "其他"


def get_region(country: str) -> str:
    """获取地区分类"""
    region_map = {
        "英国": "欧洲",
        "美国": "北美",
        "加拿大": "北美",
        "澳大利亚": "大洋洲",
        "新西兰": "大洋洲",
        "新加坡": "亚洲",
        "中国香港": "亚洲",
        "中国澳门": "亚洲",
        "日本": "亚洲",
        "韩国": "亚洲",
        "马来西亚": "亚洲",
        "德国": "欧洲",
        "法国": "欧洲",
        "荷兰": "欧洲",
        "瑞士": "欧洲",
        "爱尔兰": "欧洲",
        "瑞典": "欧洲",
        "丹麦": "欧洲",
        "挪威": "欧洲",
        "芬兰": "欧洲",
        "比利时": "欧洲",
        "奥地利": "欧洲",
        "意大利": "欧洲",
        "西班牙": "欧洲",
    }
    return region_map.get(country, "其他")


def load_crawled_data(filepath: str) -> List[Dict]:
    """加载爬取的数据"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def normalize_name(name: str) -> str:
    """标准化名称用于匹配"""
    # 移除括号内容、空格、特殊字符
    name = re.sub(r'[（\(][^）\)]*[）\)]', '', name)
    name = re.sub(r'\s+', '', name)
    name = name.lower()
    return name


def create_supabase_client() -> Client:
    """创建 Supabase 客户端"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_existing_schools(supabase: Client) -> Dict[str, Dict]:
    """
    获取数据库中已存在的学校
    返回: {标准化中文名: {id, cn_name, en_name, logo_url, ...}}
    """
    response = supabase.table("schools").select("*").execute()
    
    existing = {}
    for school in response.data:
        cn_name = school.get("cn_name", "")
        if cn_name:
            normalized = normalize_name(cn_name)
            existing[normalized] = school
    
    return existing


def import_universities(dry_run: bool = True):
    """
    导入大学数据到 Supabase
    
    参数:
        dry_run: 如果为 True，只显示将要执行的操作，不实际执行
    """
    print("=" * 60)
    print("学校数据导入工具")
    print("=" * 60)
    
    # 加载爬取的数据
    print(f"\n[1/4] 加载爬取数据: {DATA_FILE}")
    crawled_data = load_crawled_data(DATA_FILE)
    print(f"  ✓ 共 {len(crawled_data)} 条记录")
    
    # 创建 Supabase 客户端
    print(f"\n[2/4] 连接 Supabase...")
    try:
        supabase = create_supabase_client()
        print("  ✓ 连接成功")
    except Exception as e:
        print(f"  ✗ 连接失败: {e}")
        return
    
    # 获取已存在的学校
    print(f"\n[3/4] 获取数据库现有学校...")
    existing_schools = get_existing_schools(supabase)
    print(f"  ✓ 数据库中已有 {len(existing_schools)} 所学校")
    
    # 分类处理
    print(f"\n[4/4] 分析数据...")
    to_update = []  # 需要更新 logo_url 的学校
    to_insert = []  # 需要新增的学校
    
    for univ in crawled_data:
        cn_name = univ["chinese_name"]
        en_name = univ["english_name"]
        logo_url = univ["logo_url"]
        
        normalized = normalize_name(cn_name)
        
        if normalized in existing_schools:
            # 学校已存在，准备更新 logo_url
            existing = existing_schools[normalized]
            if existing.get("logo_url") != logo_url:
                to_update.append({
                    "id": existing["id"],
                    "cn_name": existing["cn_name"],
                    "new_logo_url": logo_url,
                    "old_logo_url": existing.get("logo_url")
                })
        else:
            # 学校不存在，准备插入
            country, region = identify_country_region(cn_name, en_name)
            to_insert.append({
                "cn_name": cn_name,
                "en_name": en_name,
                "logo_url": logo_url,
                "country": country,
                "region": region,
                "is_verified": False
            })
    
    # 统计
    print("\n" + "=" * 60)
    print("分析结果:")
    print("=" * 60)
    print(f"  • 需要更新 logo_url: {len(to_update)} 所")
    print(f"  • 需要新增: {len(to_insert)} 所")
    print(f"  • 已存在且无需更新: {len(crawled_data) - len(to_update) - len(to_insert)} 所")
    
    if dry_run:
        print("\n" + "=" * 60)
        print("🔍 DRY RUN 模式 - 仅预览，不执行实际操作")
        print("=" * 60)
        
        if to_update:
            print("\n📝 将要更新 logo_url 的学校（前 10 所）:")
            for item in to_update[:10]:
                print(f"  - {item['cn_name']}")
                print(f"    旧: {item['old_logo_url']}")
                print(f"    新: {item['new_logo_url']}")
        
        if to_insert:
            print("\n➕ 将要新增的学校（前 10 所）:")
            for item in to_insert[:10]:
                print(f"  - {item['cn_name']} ({item['en_name']})")
                print(f"    国家: {item['country']}, 地区: {item['region']}")
                print(f"    Logo: {item['logo_url']}")
        
        print("\n" + "=" * 60)
        print("如需执行实际导入，请将 dry_run 参数设为 False")
        print("=" * 60)
        
    else:
        print("\n" + "=" * 60)
        print("🚀 开始执行导入...")
        print("=" * 60)
        
        # 执行更新
        if to_update:
            print(f"\n更新 logo_url ({len(to_update)} 所)...")
            update_success = 0
            for item in to_update:
                try:
                    supabase.table("schools").update({
                        "logo_url": item["new_logo_url"]
                    }).eq("id", item["id"]).execute()
                    update_success += 1
                except Exception as e:
                    print(f"  ✗ 更新失败 [{item['cn_name']}]: {e}")
            print(f"  ✓ 成功更新 {update_success}/{len(to_update)} 所")
        
        # 执行插入
        if to_insert:
            print(f"\n新增学校 ({len(to_insert)} 所)...")
            insert_success = 0
            # 批量插入
            try:
                # Supabase 支持批量插入
                batch_size = 50
                for i in range(0, len(to_insert), batch_size):
                    batch = to_insert[i:i+batch_size]
                    supabase.table("schools").insert(batch).execute()
                    insert_success += len(batch)
                    print(f"  ✓ 已插入 {insert_success}/{len(to_insert)} 所")
            except Exception as e:
                print(f"  ✗ 批量插入失败: {e}")
                # 尝试逐条插入
                print("  尝试逐条插入...")
                for item in to_insert[insert_success:]:
                    try:
                        supabase.table("schools").insert(item).execute()
                        insert_success += 1
                    except Exception as e2:
                        print(f"  ✗ 插入失败 [{item['cn_name']}]: {e2}")
            
            print(f"  ✓ 成功插入 {insert_success}/{len(to_insert)} 所")
        
        print("\n" + "=" * 60)
        print("✅ 导入完成!")
        print("=" * 60)


def main():
    """主函数"""
    # 检查配置
    if SUPABASE_KEY == "YOUR_SUPABASE_ANON_KEY":
        print("❌ 错误: 请先配置 SUPABASE_KEY")
        print("\n获取方式:")
        print("1. 登录 Supabase Dashboard")
        print("2. 进入项目 Settings -> API")
        print("3. 复制 anon public key")
        print(f"4. 替换本文件中的 SUPABASE_KEY 变量")
        return
    
    # 检查数据文件
    if not os.path.exists(DATA_FILE):
        print(f"❌ 错误: 数据文件不存在: {DATA_FILE}")
        print("请先运行 university_scraper.py 爬取数据")
        return
    
    # 执行导入
    import_universities(dry_run=False)


if __name__ == "__main__":
    main()

