@echo off

setlocal enabledelayedexpansion

rem 阿里云镜像仓库相关参数
set REGISTRY_URL=registry.cn-hangzhou.aliyuncs.com
set NAMESPACE=ouroboros

rem Ouroboros 默认版本号，可被 -v 参数覆盖
set OUROBOROS_VERSION=1.0.0-beta.2
rem 开发平台默认端口号，可被 -p 参数覆盖
set DEV_PLATFORM_PORT=80
rem 开发平台默认路径，可被 -r 参数覆盖
set ROOT_DIR=%CD%
rem 开发平台容器名称
set DEV_CONTAINER_NAME=ouroboros-develop

rem 数据库自动配置相关参数
set NEED_CREATE_DB=false
set DEV_DB_TYPE=mysql
set DEV_DB_NAME=ouroboros-develop
set DEV_DB_CONTAINER_NAME=ouroboros-dev-db
set MYSQL_DB_PASSWORD=
set MYSQL_DB_PORT=13306
set MYSQL_DB_IMAGE_NAME=!REGISTRY_URL!/!NAMESPACE!/mysql-server:8.0
set MYSQL_DB_HOST_PATH="mysql-data"

rem rabbitmq 相关参数
set RABBITMQ_IMAGE_NAME=!REGISTRY_URL!/!NAMESPACE!/rabbitmq:3-management

rem 开发网络和网段
rem 先不要动，代码里有硬编码
set OUROBOROS_DEVELOP_NETWORK_NAME=ouroboros-dev
set OUROBOROS_DEVELOP_NETWORK_SUBNET=172.20.88.0/24

rem 是否使用多架构镜像
set IS_MULTI_ARCH=true

rem 读取参数
:loop
if not "%1"=="" (
    if "%1"=="-v" (
        set OUROBOROS_VERSION=%2
        shift
    )
    if "%1"=="-p" (
        set DEV_PLATFORM_PORT=%2
        shift
    )
    if "%1"=="-r" (
        set ROOT_DIR=%2
        shift
    )
    shift
    goto :loop
)

rem 镜像名称
set MOTHERSHIP_IMAGE_NAME=ouroboros-mothership
set DEVELOP_IMAGE_NAME=ouroboros-develop

call :run
pause
goto :eof

:run
  call :_step "配置环境..." 1 1 6
  call :init_docker_env

  call :_step "拉取开发平台镜像..." 1 2 6
  call :pull_develop

  call :_step "拉取基座镜像..." 1 3 6
  call :pull_mothership

  call :_step "初始化开发平台根目录(!ROOT_DIR!)..." 1 4 6
  call :init_root_folder "!ROOT_DIR!"

  call :_step "初始化数据库..." 1 5 6
  call :init_dev_database

  call :_step "创建开发平台容器..." 1 6 6
  call :recreate_develop_container

  call :print_success_info
goto :eof

rem 初始化容器环境
rem 1. 安装docker
rem 2. 配置 docker-api
rem 3. 检查是否存在 ouroboros-dev 网络，如果没有则创建一个
rem 4. 配置 rabbitmq
:init_docker_env
  rem 1. 检查 docker 是否安装
  call :check_docker_installation

  rem 2. 配置 docker-api
  call :config_docker_api

  rem 3. 初始化网络
  call :init_ouroboros_dev_network

  rem 4. 配置 rabbitmq
  call :config_rabbitmq
goto :eof

:check_docker_installation
  call :_hint "正在检查是否已安装 Docker..." 2
  where docker >nul 2>&1
  if !errorlevel! neq 0 (
    call :_error "未检测到 Docker 环境，请先按照开发指南安装 Docker 环境" 2
    pause
    exit
  )

  call :_success "Docker 已安装" 2
goto :eof

:config_docker_api
  call :_hint "正在检查 Docker Engine API..." 2

  call :check_docker_api
  if "!return!" neq "true" (
    call :_error "Windows暂不支持自动配置 Docker Engine API, 请参照用户手册进行配置" 2
    pause
    exit
  ) else (
    call :_success "Docker Engine API 已配置" 2
  )
goto :eof

:check_docker_api
  call :_resetReturn
  for /f "delims=" %%t in ('curl -s -o nul -I -w %%{http_code} http://localhost:2375/info') do set return=%%t
  if "!return!" neq "000" (
    set return=true
  ) else (
    set return=false
  )
goto :eof

:init_ouroboros_dev_network
  call :_hint "正在检查 Docker 网络配置..." 2

  rem 检查是否存在 ouroboros-dev 网络，如果没有则创建一个
  call :_resetReturn
  for /f "delims=" %%t in ('docker network ls --filter "name=!OUROBOROS_DEVELOP_NETWORK_NAME!" --format "{{.Name}}"') do set return=%%t
  if "!return!" equ "!OUROBOROS_DEVELOP_NETWORK_NAME!" (
    call :_success "Docker 网络已存在(!OUROBOROS_DEVELOP_NETWORK_NAME!)" 2
  ) else (
    call :_info "正在创建 Docker 网络(!OUROBOROS_DEVELOP_NETWORK_NAME!)..." 2
    docker network create --subnet "!OUROBOROS_DEVELOP_NETWORK_SUBNET!" "!OUROBOROS_DEVELOP_NETWORK_NAME!" >nul 2>&1
    call :_success "创建 Docker 网络成功" 2
  )

  rem 检查网络是否已配置正确
  call :_resetReturn
  for /f "delims=" %%t in ('docker network inspect "!OUROBOROS_DEVELOP_NETWORK_NAME!" --format "{{(index .IPAM.Config 0).Subnet}}"') do set return=%%t
  if "!return!" neq "!OUROBOROS_DEVELOP_NETWORK_SUBNET!" (
    call :_error "Docker 网络配置错误，期望：!OUROBOROS_DEVELOP_NETWORK_SUBNET!，实际：!return!" 2
    pause
    exit
  )
goto :eof

:config_rabbitmq
  call :_hint "正在检查 Rabbitmq 配置..." 2

  rem 检查是否有名为 ourboros-rabbitmq 的容器，没有则创建
  call :_resetReturn
  for /f "delims=" %%t in ('docker ps -a --filter "name=ouroboros-rabbitmq" --format "{{.ID}}"') do set return=%%t
  if "!return!" equ ""  (
    call :_info "正在创建 Rabbitmq 容器..." 2

    rem 如果没有则创建一个
    docker run -d ^
      --name ouroboros-rabbitmq ^
      -p 5672:5672 ^
      -p 15672:15672 ^
      -p 15692:15692 ^
      -e TZ=Asia/Shanghai ^
      --network !OUROBOROS_DEVELOP_NETWORK_NAME! ^
      !RABBITMQ_IMAGE_NAME! >nul 2>&1

    call :_success "创建 Rabbitmq 容器成功" 2
    goto :eof
  )

  call :_resetReturn
  for /f "delims=" %%t in ('docker ps -a --filter "name=ouroboros-rabbitmq" --filter "status=exited" --format "{{.ID}}"') do set return=%%t
  if "!return!" neq ""  (
    call :_info "正在启动 Rabbitmq 容器(!return!)..." 2
    docker start !return! >nul 2>&1
    call :_success "启动 Rabbitmq 容器成功(!return!)" 2
  ) else (
    call :_success "Rabbitmq 容器正在运行" 2
  )
goto :eof

rem 拉取开发环境镜像
:pull_develop
  call :__pull !DEVELOP_IMAGE_NAME! !OUROBOROS_VERSION!
goto :eof

rem 拉取基座镜像
:pull_mothership
  call :__pull !MOTHERSHIP_IMAGE_NAME! !OUROBOROS_VERSION!
goto :eof


:init_root_folder
  set dir=%1
  if not exist !dir! (
    mkdir !dir!
  )

  cd !dir!

  if not exist "workspace" (
    mkdir "workspace"
  )

  rem 如果没有 application.yml 文件则创建一个新的
  if not exist !dir!/application.yml (
    call :_info "正在创建默认配置文件(application.yml)..." 2
    call :create_default_configuration
    call :_success "创建默认配置文件成功" 2
  ) else (
    call :_success "已存在配置文件(application.yml)" 2
  )
  set dir=
goto :eof

:create_default_configuration
  rem 根据数据库类型创建默认配置
  if "!DEV_DB_TYPE!" equ "mysql" (
    call :create_default_configuration_with_mysql
  ) else (
    call :_error "不支持自动配置 !DEV_DB_TYPE! 数据库" 2
    pause
    exit
  )
goto :eof

:create_default_configuration_with_mysql
  set NEED_CREATE_DB=true

  if "!MYSQL_DB_PASSWORD!" equ "" (
    call :__generate_random_string 15
    set MYSQL_DB_PASSWORD=!return!
  )

  call :__get_port !MYSQL_DB_PORT!
  set MYSQL_DB_PORT=!return!

  mkdir !MYSQL_DB_HOST_PATH!
  echo spring: > application.yml
  echo   datasource: >> application.yml
  echo     type: com.alibaba.druid.pool.DruidDataSource >> application.yml
  echo     driverClassName: com.mysql.cj.jdbc.Driver >> application.yml
  echo     url: jdbc:mysql://!DEV_DB_CONTAINER_NAME!:3306/ouroboros-develop?useUnicode=true^&characterEncoding=utf-8^&nullCatalogMeansCurrent=true >> application.yml
  echo     username: root >> application.yml
  echo     password: !MYSQL_DB_PASSWORD! >> application.yml
  echo     migration-strategy: AUTO >> application.yml
  echo. >> application.yml
  echo   rabbitmq:  >> application.yml
  echo     host: ouroboros-rabbitmq >> application.yml
  echo     port: 5672 >> application.yml
  echo     username: guest >> application.yml
  echo     password: guest >> application.yml
  echo. >> application.yml
goto :eof


:init_dev_database
  if "!DEV_DB_TYPE!" equ "mysql" (
    call :init_dev_database_mysql
  ) else (
    call :_error "不支持的数据库类型：!DEV_DB_TYPE!!" 2
    pause
    exit
  )
goto :eof

:init_dev_database_mysql
  rem 检查是否需要创建数据库
  if "!NEED_CREATE_DB!" equ "false" (
    call :_success "不需要创建数据库" 2
    goto :eof
  )

  rem 检查容器中是否有名为 ouroboros-db-dev 的容器
  call :_resetReturn
  for /f "delims=" %%t in ('docker ps -a --filter "name=!DEV_DB_CONTAINER_NAME!" --format "{{.ID}}"') do set return=%%t
  if "!return!" neq ""  (
    call :_error "已存在 !DEV_DB_CONTAINER_NAME! 容器，请手动修改配置文件的连接密码后重试"
    pause
    exit
  )

  call :_info "正在创建 MySQL 数据库容器..." 2

  call :_resetReturn
  for /f "tokens=1 delims=/" %%a in ("!OUROBOROS_DEVELOP_NETWORK_SUBNET!") do (set "return=%%a")
  set "root_host_subnet=%return:.0=%.%%"

  rem 创建并启动数据库容器
  docker run -dit ^
    --name !DEV_DB_CONTAINER_NAME! ^
    -p 127.0.0.1:!MYSQL_DB_PORT!:3306 ^
    -e TZ=Asia/Shanghai ^
    -e MYSQL_DATABASE=!DEV_DB_NAME! ^
    -e MYSQL_ROOT_PASSWORD=!MYSQL_DB_PASSWORD! ^
    -e MYSQL_ROOT_HOST=!root_host_subnet! ^
    -v !ROOT_DIR!/!MYSQL_DB_HOST_PATH!:/var/lib/mysql ^
    --network !OUROBOROS_DEVELOP_NETWORK_NAME! ^
    !MYSQL_DB_IMAGE_NAME! >nul 2>&1

  call :_success "创建 MySQL 数据库容器成功" 2

  call :_info "等待 MySQL 数据库容器启动..." 2

  call :__wait_container_start_complete !DEV_DB_CONTAINER_NAME! 3306

  call :_success "等待 MySQL 数据库容器启动完成" 2

  set root_host_subnet=
goto :eof

:recreate_develop_container
  rem 删除现有容器
  for /f "delims=" %%t in ('docker ps -a --filter "name=!DEV_CONTAINER_NAME!" --format "{{.ID}}"') do set return=%%t
  if "!return!" neq ""  (
    call :_info "正在删除旧容器..." 2
    docker stop !DEV_CONTAINER_NAME! >nul 2>&1 && docker rm !DEV_CONTAINER_NAME! >nul 2>&1
    call :_success "删除旧容器成功" 2
  )

  call :__get_port !DEV_PLATFORM_PORT!
  set DEV_PLATFORM_PORT=!return!

  call :_info "正在创建开发平台容器..." 2

  rem 创建并启动开发平台容器
  docker run -dit ^
    --name !DEV_CONTAINER_NAME! ^
    -p !DEV_PLATFORM_PORT!:80 ^
    -v !ROOT_DIR!/:/app/deploy/ ^
    -e TZ=Asia/Shanghai ^
    -e DEBUG=false ^
    -e HOST_WORKSPACE_PATH=!ROOT_DIR!/workspace ^
    --add-host=host.docker.internal:host-gateway ^
    --network !OUROBOROS_DEVELOP_NETWORK_NAME! ^
    !REGISTRY_URL!/!NAMESPACE!/!DEVELOP_IMAGE_NAME!:!OUROBOROS_VERSION! >nul 2>&1

  call :_success "创建开发平台容器成功" 2

  set dev_container_port=
goto :eof

rem 等待容器启动完成
:__wait_container_start_complete
  set name=%1
  set keyword=%2
  docker logs !name! | findstr !keyword! >nul || (
    goto :__wait_container_start_complete
  )

  set name=
  set keyword=
goto :eof

rem 拉取镜像
:__pull
  set image_name=%1
  set image_version=%2

  docker pull -q !REGISTRY_URL!/!NAMESPACE!/!image_name!:!image_version! >nul 2>&1
  docker tag !REGISTRY_URL!/!NAMESPACE!/!image_name!:!image_version! !image_name!:!image_version!

  if !errorlevel! neq 0 (
    _error "拉取镜像(!image_name!)失败" 2
    pause
    exit
  )

  call :_success "拉取镜像成功(!image_name!)" 2
  set image_name=
  set image_version=
goto :eof

rem 获取当前系统架构
:__get_architecture
  call :_resetReturn
  reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set return=x86 || set return=amd64
goto :eof

rem 生成随机字符串，用于生成密码
:__generate_random_string
  set chars=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
  set length=%1

  call :_resetReturn
  for /L %%i in (1,1,!length!) do (
      set /A index=!random! %% 62
      for %%j in (!index!) do set return=!return!!chars:~%%j,1!
  )

  set chars=
  set length=
goto :eof

rem 获取空闲端口
:__get_port
  set return=%1
  netstat -ano | findstr /r /c:":%1.*LISTENING" > nul
  if !errorlevel! equ 0 (
    set /a return=%1+1
    call :__get_port !return!
  )
goto :eof


rem 重置内部变量
:_resetReturn
  set return=
goto :eof

:_step
  set msg=%1
  set level=%2
  set indent=

  rem level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  for /l %%i in (1, 1, !level!) do (
    set indent=  !indent!
  )

  rem 输出信息
  echo !indent!!msg:"=%!

  set msg=
  set level=
  set indent=
goto :eof

:_hint
  set msg=%1
  set level=%2
  set indent=

  rem level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  for /l %%i in (1, 1, !level!) do (
    set indent=  !indent!
  )

  rem 输出信息
  echo !indent!!msg:"=%!

  set msg=
  set level=
  set indent=
goto :eof

:_info
  set msg=%1
  set level=%2
  set indent=

  rem level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  for /l %%i in (1, 1, !level!) do (
    set indent=  !indent!
  )

  rem 输出信息
  echo !indent!!msg:"=%!

  set msg=
  set level=
  set indent=
goto :eof

:_success
  set msg=%1
  set level=%2
  set indent=

  rem level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  for /l %%i in (1, 1, !level!) do (
    set indent=  !indent!
  )

  rem 输出信息
  echo !indent!!msg:"=%!

  set msg=
  set level=
  set indent=
goto :eof

:_error
  set msg=%1
  set level=%2
  set indent=

  rem level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  for /l %%i in (1, 1, !level!) do (
    set indent=  !indent!
  )

  rem 输出信息
  echo !indent!!msg:"=%!

  set msg=
  set level=
  set indent=
goto :eof

rem 输出成功信息
:print_success_info
  echo.
  echo.
  echo.
  echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
  echo "  _______                    __                             "
  echo " |       |.--.--.----.-----.|  |--.-----.----.-----.-----.  "
  echo " |   -   ||  |  |   _|  _  ||  _  |  _  |   _|  _  |__ --|  "
  echo " |_______||_____|__| |_____||_____|_____|__| |_____|_____|  "
  echo "            _____               __                          "
  echo "           |     \.-----.-----.|  |.-----.--.--.            "
  echo "           |  --  |  -__|  _  ||  ||  _  |  |  |            "
  echo "           |_____/|_____|   __||__||_____|___  |            "
  echo "                        |__|             |_____|            "
  echo "         _______                                 __         "
  echo "        |     __|.--.--.----.----.-----.-----.--|  |        "
  echo "        |__     ||  |  |  __|  __|  -__|  -__|  _  |        "
  echo "        |_______||_____|____|____|_____|_____|_____|        "
  echo "                                                            "
  echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
  echo         开发平台已启动，访问 http://localhost:%DEV_PLATFORM_PORT% 查看
  echo.
  echo.
goto :eof
