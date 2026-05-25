@echo off
echo ========================================
echo  保定铁球非遗销售系统
echo ========================================
echo.

echo [1/3] 检查数据库连接...
echo 请确保MySQL服务已启动
echo.

echo [2/3] 启动后端服务...
cd /d %~dp0server
start "后端服务" cmd /k "npm install && npm start"

echo [3/3] 启动前端服务...
cd /d %~dp0client
start "前端服务" cmd /k "npm install && npm run dev"

echo.
echo ========================================
echo  启动完成！
echo  前端地址: http://localhost:3000
echo  后端地址: http://localhost:5000
echo ========================================
pause
