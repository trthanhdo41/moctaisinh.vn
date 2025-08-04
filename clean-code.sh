#!/bin/bash

# Script dọn dẹp code - Xóa console logs và ghi chú //
echo "🧹 Đang dọn dẹp code..."

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Đếm số file trước khi dọn dẹp
echo -e "${BLUE}📊 Thống kê trước khi dọn dẹp:${NC}"
console_files=$(find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "console\." | wc -l)
comment_files=$(find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "^[[:space:]]*//" | wc -l)

echo -e "  📁 Files có console logs: ${YELLOW}$console_files${NC}"
echo -e "  📁 Files có ghi chú //: ${YELLOW}$comment_files${NC}"

echo ""
echo -e "${GREEN}🚀 Bắt đầu dọn dẹp...${NC}"

# 1. Xóa console.log
echo -e "${BLUE}1️⃣ Xóa console.log...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/console\.log/d'
echo -e "   ✅ Đã xóa console.log"

# 2. Xóa console.error
echo -e "${BLUE}2️⃣ Xóa console.error...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/console\.error/d'
echo -e "   ✅ Đã xóa console.error"

# 3. Xóa console.warn
echo -e "${BLUE}3️⃣ Xóa console.warn...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/console\.warn/d'
echo -e "   ✅ Đã xóa console.warn"

# 4. Xóa console.info
echo -e "${BLUE}4️⃣ Xóa console.info...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/console\.info/d'
echo -e "   ✅ Đã xóa console.info"

# 5. Xóa console.debug
echo -e "${BLUE}5️⃣ Xóa console.debug...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/console\.debug/d'
echo -e "   ✅ Đã xóa console.debug"

# 6. Xóa ghi chú // (chỉ dòng bắt đầu bằng //)
echo -e "${BLUE}6️⃣ Xóa ghi chú //...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/^[[:space:]]*\/\/.*$/d'
echo -e "   ✅ Đã xóa ghi chú //"

# 7. Xóa dòng trống thừa (nhiều dòng trống liên tiếp)
echo -e "${BLUE}7️⃣ Xóa dòng trống thừa...${NC}"
find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs sed -i '' '/^[[:space:]]*$/d'
echo -e "   ✅ Đã xóa dòng trống thừa"

echo ""
echo -e "${GREEN}📊 Thống kê sau khi dọn dẹp:${NC}"

# Kiểm tra kết quả
remaining_console=$(find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "console\." | wc -l)
remaining_comments=$(find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "^[[:space:]]*//" | wc -l)

echo -e "  📁 Files còn console logs: ${RED}$remaining_console${NC}"
echo -e "  📁 Files còn ghi chú //: ${RED}$remaining_comments${NC}"

# Báo cáo kết quả
if [ $remaining_console -eq 0 ] && [ $remaining_comments -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Hoàn thành! Code đã được dọn dẹp sạch sẽ!${NC}"
    echo -e "${GREEN}   ✅ Không còn console logs${NC}"
    echo -e "${GREEN}   ✅ Không còn ghi chú //${NC}"
    echo -e "${GREEN}   ✅ Code nhẹ và gọn gàng hơn${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ Còn một số file chưa được dọn dẹp hoàn toàn${NC}"
    if [ $remaining_console -gt 0 ]; then
        echo -e "${YELLOW}   📋 Files còn console logs:${NC}"
        find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "console\." | head -5
    fi
    if [ $remaining_comments -gt 0 ]; then
        echo -e "${YELLOW}   📋 Files còn ghi chú //:${NC}"
        find . -name "*.html" -o -name "*.js" -o -name "*.java" -o -name "*.css" -o -name "*.scss" | xargs grep -l "^[[:space:]]*//" | head -5
    fi
fi

echo ""
echo -e "${BLUE}💡 Lưu ý:${NC}"
echo -e "   • Script này chỉ xóa ghi chú // ở đầu dòng"
echo -e "   • Ghi chú // ở giữa dòng sẽ được giữ lại"
echo -e "   • Có thể chạy lại script nếu cần dọn dẹp thêm"
echo ""
echo -e "${GREEN}✨ Dọn dẹp hoàn tất!${NC}" 