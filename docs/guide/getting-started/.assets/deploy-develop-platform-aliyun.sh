#!/bin/bash

# 阿里云镜像仓库相关参数
REGISTRY_URL=registry.cn-hangzhou.aliyuncs.com
NAMESPACE=ouroboros

# Ouroboros 默认版本号，可被 -v 参数覆盖
OUROBOROS_VERSION=1.0.0-beta.2
# 开发平台默认端口号，可被 -p 参数覆盖
DEV_PLATFORM_PORT=80
# 开发平台默认路径，可被 -r 参数覆盖
ROOT_DIR="${PWD}"
# 开发平台容器名称
DEV_CONTAINER_NAME=ouroboros-develop
SKIP_DOCKER_API_CHECK=false

# 数据库自动配置相关参数
NEED_CREATE_DB=false
DEV_DB_TYPE=mysql
DEV_DB_NAME=ouroboros-develop
DEV_DB_CONTAINER_NAME=ouroboros-dev-db
MYSQL_DB_PASSWORD=""
MYSQL_DB_PORT=13306
MYSQL_DB_IMAGE_NAME=mysql-server:8.0
MYSQL_DB_HOST_PATH="mysql-data"

# rabbitmq 相关参数
RABBITMQ_IMAGE_NAME=rabbitmq:3-management

# 开发网络和网段
OUROBOROS_DEVELOP_NETWORK_NAME=ouroboros-dev # 先不要动，代码里有硬编码
OUROBOROS_DEVELOP_NETWORK_SUBNET=172.20.88.0/24

while getopts ":v:p:r:a:k:" opt; do
  case $opt in
  v)
    OUROBOROS_VERSION="$OPTARG"
    echo 指定版本号为:"${OPTARG}"
    ;;
  # 获取端口参数
  p)
    DEV_PLATFORM_PORT=$OPTARG
    echo 指定开发平台端口号为:"${OPTARG}"
    ;;
  r)
    ROOT_DIR="$OPTARG"
    echo 指定开发平台工作目录为:"${OPTARG}"
    ;;
  k)
    SKIP_DOCKER_API_CHECK=true
    ;;
  \?)
    echo "无效的选项： -$OPTARG" >&2
    exit 1
    ;;
  :)
    if [ "$OPTARG" == "k" ]; then
      SKIP_DOCKER_API_CHECK=true
    else
      echo "选项 -$OPTARG 需要参数。" >&2
      exit 1
    fi
    ;;
  esac
done

# 镜像名称
MOTHERSHIP_IMAGE_NAME=ouroboros-mothership
DEVELOP_IMAGE_NAME=ouroboros-develop

# 初始化根目录
init_root_folder() {
  local root_dir=$1

  # 如果根目录不存在，则创建根目录
  if [ ! -d "$root_dir" ]; then
    mkdir "$root_dir"
  fi

  # 切换到根目录
  cd "$root_dir" || exit 1

  # 如果没有 workspace 目录，创建一个
  if [ ! -d "workspace" ]; then
    mkdir workspace
  fi

  # 如果没有 application.yml 文件则创建一个新的
  if [ ! -f "application.yml" ]; then
    _info "正在创建默认配置文件(application.yml)..." 2
    create_default_configuration
    _success "创建默认配置文件成功" 2
  else
    _success "已存在配置文件(application.yml)" 2
  fi
}

create_default_configuration() {
  # 根据数据库类型创建默认配置
  if [ "$DEV_DB_TYPE" == "mysql" ]; then
    create_default_configuration_with_mysql
  else
    _error "不支持自动配置 ${DEV_DB_TYPE} 数据库" 2
    exit 1
  fi
}

create_default_configuration_with_mysql() {
  NEED_CREATE_DB=true
  MYSQL_DB_PASSWORD=$(__generate_random_string 15)
  mkdir -p ${MYSQL_DB_HOST_PATH}
  touch application.yml
  cat >application.yml <<EOF
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${DEV_DB_CONTAINER_NAME}:3306/ouroboros-develop?useUnicode=true&characterEncoding=utf-8&nullCatalogMeansCurrent=true
    username: root
    password: ${MYSQL_DB_PASSWORD}
    migration-strategy: AUTO
  rabbitmq:
    host: ouroboros-rabbitmq
    port: 5672
    username: guest
    password: guest
EOF
}

# 初始化容器环境
# 1. 安装docker
# 2. 配置 docker-api
# 3. 检查是否存在 ouroboros-dev 网络，如果没有则创建一个
# 4. 配置 rabbitmq

init_docker_env() {
  # 1. 检查 docker 是否安装
  check_docker_installation
  # 2. 配置 docker-api
  config_docker_api
  # 3. 初始化网络
  init_ouroboros_dev_network
  # 4. 配置 rabbitmq
  config_rabbitmq
}

# 安装docker
check_docker_installation() {
  _hint "正在检查是否已安装 Docker..." 2
  if ! command -v docker >/dev/null 2>&1; then
    _error "未检测到 Docker 环境，请先按照开发指南安装 Docker 环境" 2
    exit 1
  fi
  _success "Docker 已安装" 2
}

# 初始化 docker 的 ouroboros-dev 网络
init_ouroboros_dev_network() {
  _hint "正在检查 Docker 网络配置..." 2
  # 检查是否存在 ouroboros-dev 网络，如果没有则创建一个
  local network_name=$(docker network ls --filter name="^${OUROBOROS_DEVELOP_NETWORK_NAME}$" --format '{{.Name}}')
  if [ "$network_name" != $OUROBOROS_DEVELOP_NETWORK_NAME ]; then
    _info "正在创建 Docker 网络(${OUROBOROS_DEVELOP_NETWORK_NAME})..." 2
    docker network create --subnet "$OUROBOROS_DEVELOP_NETWORK_SUBNET" "$OUROBOROS_DEVELOP_NETWORK_NAME" >/dev/null 2>&1
    _success "创建 Docker 网络成功" 2
    return
  else
    _success "Docker 网络已存在(${OUROBOROS_DEVELOP_NETWORK_NAME})" 2
  fi
  # 检查网络是否已配置正确
  local network_subnet=$(docker network inspect "$OUROBOROS_DEVELOP_NETWORK_NAME" --format '{{(index .IPAM.Config 0).Subnet}}')
  if [ "$network_subnet" != "$OUROBOROS_DEVELOP_NETWORK_SUBNET" ]; then
    _error "Docker 网络配置错误，期望：${OUROBOROS_DEVELOP_NETWORK_SUBNET}，实际：${network_subnet}" 2
    exit 1
  fi
}

# 配置docker-api
config_docker_api() {
  local os_type=$(uname)
  local check_result=$(check_docker_api)
  if [ "$SKIP_DOCKER_API_CHECK" == "true" ]; then
    _success "跳过 Docker Engine API 检查" 2
    return
  fi
  _hint "正在检查 Docker Engine API..." 2
  if [ "${check_result}" == "false" ]; then
    if [ "$os_type" == "Darwin" ]; then
      config_docker_api_for_mac
    else
      _error "$os_type 暂不支持自动配置 Docker Engine API, 请参照用户手册进行配置" 2
      exit 1
    fi
  else
    _success "Docker Engine API 已配置" 2
    return
  fi
}

# 检查 Docker Engine API
check_docker_api() {
  local response=$(curl -Is http://localhost:2375/info | head -n 1 | awk '{print $1}')
  if [ "$response" != "HTTP/1.1" ]; then
    echo 'false'
  else
    echo 'true'
  fi
}

# 配置 mac 下的 docker-api
config_docker_api_for_mac() {
  _hint "自动配置 Docker Engine API 容器..." 2
  # 检查是否有已创建的 bobrik/socat 镜像的容器
  if [ ! "$(docker ps -a --filter name=docker-api --format {{.ID}})" ]; then
    _info "正在创建 Docker Engine API 容器..." 2
    local socat_image="${REGISTRY_URL}/${NAMESPACE}/socat:latest"
    if [ $(__get_architecture) == "arm64" ]; then
      socat_image="${socat_image}-arm64"
    fi
    # 如果没有则创建一个
    docker run -d -q \
      --name docker-api \
      --restart always \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -p 127.0.0.1:2375:2375 \
      ${socat_image} \
      TCP-LISTEN:2375,fork \
      UNIX-CONNECT:/var/run/docker.sock >/dev/null 2>&1
    _success "创建 Docker Engine API 容器成功" 2
    return
  fi
  # 如果该容器已停止
  local stopped_container_id=$(docker ps -a --filter name=docker-api --filter status=exited --format "{{.ID}}" | head -n 1)
  if [ "$stopped_container_id" ]; then
    _info "尝试启动已停止的 Docker Engine API 容器 ($stopped_container_id)..." 2
    docker start $stopped_container_id >/dev/null 2>&1
    _success "启动 Docker Engine API 容器成功($stopped_container_id)" 2
    return
  else
    _success "Docker Engine API 容器正在运行" 2
    return
  fi

  _error "Docker Engine API 容器启动失败" 2
  exit 1
}

# 配置 rabbitmq 容器
config_rabbitmq() {
  _hint "正在检查 Rabbitmq 配置..." 2
  # 检查是否有名为 ouroboros-rabbitmq 的容器，没有则创建
  if [ ! "$(docker ps -a --filter name="^ouroboros-rabbitmq$" --format {{.ID}})" ]; then
    _info "正在创建 Rabbitmq 容器..." 2
    local rabbitmq_image="${REGISTRY_URL}/${NAMESPACE}/${RABBITMQ_IMAGE_NAME}"
    if [ $(__get_architecture) == "arm64" ]; then
      rabbitmq_image="${rabbitmq_image}-arm64"
    fi
    # 如果没有则创建一个
    docker run -d \
      --name ouroboros-rabbitmq \
      -p 5672:5672 \
      -p 15672:15672 \
      -p 15692:15692 \
      -e TZ=Asia/Shanghai \
      --network ${OUROBOROS_DEVELOP_NETWORK_NAME} \
      ${rabbitmq_image} >/dev/null 2>&1
    _success "创建 Rabbitmq 容器成功" 2
    return
  fi
  local stopped_container_id=$(docker ps -a --filter name="^ouroboros-rabbitmq$" --filter status=exited --format "{{.ID}}" | head -n 1)
  if [ "$stopped_container_id" ]; then
    _info "正在启动 Rabbitmq 容器($stopped_container_id)..." 2
    docker start $stopped_container_id >/dev/null 2>&1
    _success "启动 Rabbitmq 容器成功($stopped_container_id)" 2
  else
    _success "Rabbitmq 容器正在运行" 2
  fi
}

# 初始化数据库
init_dev_database() {
  if [ "$DEV_DB_TYPE" == "mysql" ]; then
    init_dev_database_mysql
  else
    _error "不支持的数据库类型：$DEV_DB_TYPE!" 2
    exit 1
  fi
}

# 初始化 mysql 数据库
init_dev_database_mysql() {
  # 检查是否需要创建数据库
  if [ "$NEED_CREATE_DB" == false ]; then
    _success "不需要创建数据库" 2
    return
  fi

  # 检查容器中是否有名为 ouroboros-db-dev 的容器
  local container_id=$(docker ps -a --filter name="^${DEV_DB_CONTAINER_NAME}$" --format '{{.ID}}')
  if [ "$container_id" ]; then
    # 如果有则启动该容器
    _error "已存在 ${DEV_DB_CONTAINER_NAME} 容器，请手动修改配置文件的连接密码后重试" 2
    exit 1
  fi

  _info "正在创建 MySQL 数据库容器..." 2
  # 获取空闲的端口
  MYSQL_DB_PORT=$(__get_port ${MYSQL_DB_PORT})
  local root_host_subnet=$(echo "$OUROBOROS_DEVELOP_NETWORK_SUBNET" | sed 's/0\/[0-9]\{1,2\}$/%/')
  local mysql_image="${REGISTRY_URL}/${NAMESPACE}/${MYSQL_DB_IMAGE_NAME}"
  if [ $(__get_architecture) == "arm64" ]; then
    mysql_image="${mysql_image}-arm64"
  fi
  # 创建并启动数据库容器
  docker run -dit \
    --name ${DEV_DB_CONTAINER_NAME} \
    -p 127.0.0.1:${MYSQL_DB_PORT}:3306 \
    -e TZ=Asia/Shanghai \
    -e MYSQL_DATABASE=${DEV_DB_NAME} \
    -e MYSQL_ROOT_PASSWORD=${MYSQL_DB_PASSWORD} \
    -e MYSQL_ROOT_HOST=${root_host_subnet} \
    -v ${ROOT_DIR}/${MYSQL_DB_HOST_PATH}:/var/lib/mysql \
    --network ${OUROBOROS_DEVELOP_NETWORK_NAME} \
    ${mysql_image} >/dev/null 2>&1

  _success "创建 MySQL 数据库容器成功" 2
}

# 重新创建开发平台容器
recreate_develop_container() {
  # 删除现有容器
  if [ "$(docker ps -a --filter name="^${DEV_CONTAINER_NAME}$" --format '{{.ID}}')" ]; then
    _info "正在删除旧容器..." 2
    docker stop ${DEV_CONTAINER_NAME} >/dev/null 2>&1 && docker rm ${DEV_CONTAINER_NAME} >/dev/null 2>&1
    _success "删除旧容器成功" 2
  fi

  local final_port=$(__get_port $DEV_PLATFORM_PORT)
  DEV_PLATFORM_PORT=$final_port

  _info "正在创建开发平台容器..." 2

  # 创建并启动开发平台容器
  docker run -dit \
    --name ${DEV_CONTAINER_NAME} \
    -p ${final_port}:80 \
    -v ${ROOT_DIR}/:/app/deploy/ \
    -e TZ=Asia/Shanghai \
    -e DEBUG=false \
    -e HOST_WORKSPACE_PATH="$ROOT_DIR/workspace" \
    --add-host=host.docker.internal:host-gateway \
    --network ${OUROBOROS_DEVELOP_NETWORK_NAME} \
    $(get_pull_image_name ${DEVELOP_IMAGE_NAME} ${OUROBOROS_VERSION})

  _success "创建开发平台容器成功" 2
}

# 拉取镜像
__pull() {
  local image_name=$1
  local version=$2
  local pull_image_name=$(get_pull_image_name ${image_name} ${version})
  local pull_result=$(docker pull -q ${pull_image_name})
  docker tag ${pull_image_name} ${image_name}:${version}
  if [ -z "${pull_result}" ]; then
    _error "拉取镜像(${image_name})失败" 2
    exit 1
  fi
  _success "拉取镜像成功(${pull_result})" 2
}

# 拉取基座镜像
pull_mothership() {
  __pull ${MOTHERSHIP_IMAGE_NAME} ${OUROBOROS_VERSION}
}

# 拉取开发环境镜像
pull_develop() {
  __pull ${DEVELOP_IMAGE_NAME} ${OUROBOROS_VERSION}
}

# 获取当前系统架构
__get_architecture() {
  local arch=$(uname -m)
  if [ "${arch}" = "aarch64" ] || [ "${arch}" = "arm64" ]; then
    echo "arm64"
  elif [ "${arch}" = "x86_64" ]; then
    echo "amd64"
  elif [ "${arch}" = "i686" ] || [ "${arch}" = "i386" ]; then
    echo "x86"
  else
    echo "Unknown architecture: ${arch}"
    exit 1
  fi
}

# 获取镜像名称
get_pull_image_name() {
  local image_name=$1
  local version=$2
  local arch_affix=""
  if [ $(__get_architecture) == "arm64" ]; then
    arch_affix="-arm64"
  fi
  echo "${REGISTRY_URL}/${NAMESPACE}/${image_name}:${version}${arch_affix}"
}

# 生成随机字符串，用于生成密码
__generate_random_string() {
  local length=$1
  LC_CTYPE=C tr -dc 'a-zA-Z0-9' </dev/urandom | head -c "$length"
}

# 获取空闲端口
__get_port() {
  local port=$1

  while lsof -i :"$port" | grep -q LISTEN; do
    ((port++))
  done

  echo "$port"
}

_step() {
  local msg=$1
  local level=$2
  local step=$3
  local total=$4
  # 加粗
  local progress_style='\033[1m'
  local reset_style='\033[0m'
  # level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  local indent=""
  if [ "$level" -gt 1 ]; then
    indent=$(printf "%${level}s" | tr ' ' ' ')
  fi
  # 输出信息
  echo -e "${indent}${progress_style}(${step}/${total}) ${msg}...${reset_style}"
}

_hint() {
  local msg=$1
  local level=$2
  local color='\033[2m'
  local reset_style='\033[0m'
  # level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  local indent=""
  if [ "$level" -gt 1 ]; then
    indent=$(printf "%${level}s" | tr ' ' ' ')
  fi
  # 输出信息
  echo -e "${indent}${color} - ${msg}${reset_style}"
}

_info() {
  local msg=$1
  local level=$2
  local color='\033[0m'
  local reset_style='\033[0m'
  # level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  local indent=""
  if [ "$level" -gt 1 ]; then
    indent=$(printf "%${level}s" | tr ' ' ' ')
  fi
  # 输出信息
  echo -e "${indent}🕒 ${color}${msg}${reset_style}"
}

_success() {
  local msg=$1
  local level=$2
  # 绿色
  local color='\033[0;32m'
  local reset_style='\033[0m'
  # level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  local indent=""
  if [ "$level" -gt 1 ]; then
    indent=$(printf "%${level}s" | tr ' ' ' ')
  fi
  # 输出信息
  echo -e "${indent}${color}✅ ${msg}${reset_style}"
}

_error() {
  local msg=$1
  local level=$2
  # 红色
  local color='\033[0;31m'
  local reset_style='\033[0m'
  # level 控制缩进: 1级无缩进，2级缩进2个空格，3级缩进4个空格，以此类推
  local indent=""
  if [ "$level" -gt 1 ]; then
    indent=$(printf "%${level}s" | tr ' ' ' ')
  fi
  # 输出信息
  echo -e "${indent}🚫 ${color}${msg}${reset_style}"
}

# 输出成功信息
print_success_info() {
  echo
  echo
  echo
  echo -e " ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \033[0;33m\033[1m"
  echo -e "   _______                    __                              "
  echo -e "  |       |.--.--.----.-----.|  |--.-----.----.-----.-----.   "
  echo -e "  |   -   ||  |  |   _|  _  ||  _  |  _  |   _|  _  |__ --|   "
  echo -e "  |_______||_____|__| |_____||_____|_____|__| |_____|_____|   \033[0;34m\033[1m"
  echo -e "             _____               __                           "
  echo -e "            |     \.-----.-----.|  |.-----.--.--.             "
  echo -e "            |  --  |  -__|  _  ||  ||  _  |  |  |             "
  echo -e "            |_____/|_____|   __||__||_____|___  |             "
  echo -e "                         |__|             |_____|             \033[0;32m\033[1m"
  echo -e "          _______                                 __          "
  echo -e "         |     __|.--.--.----.----.-----.-----.--|  |         "
  echo -e "         |__     ||  |  |  __|  __|  -__|  -__|  _  |         "
  echo -e "         |_______||_____|____|____|_____|_____|_____|         "
  echo -e "                                                              \033[0m"
  echo -e " ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ "
  echo -e "    \033[36m开发平台已启动，访问 \033[0;34m\033[0;4mhttp://localhost:${DEV_PLATFORM_PORT}\033[0;36m 查看\033[0m"
  echo
  echo
}

run() {
  _step "配置环境..." 1 1 6
  init_docker_env

  _step "拉取开发平台镜像..." 1 2 6
  pull_develop

  _step "拉取基座镜像..." 1 3 6
  pull_mothership

  _step "初始化开发平台根目录(${ROOT_DIR})..." 1 4 6
  init_root_folder "${ROOT_DIR}"

  _step "初始化数据库..." 1 5 6
  init_dev_database

  _step "创建开发平台容器..." 1 6 6
  recreate_develop_container

  print_success_info
}

run
