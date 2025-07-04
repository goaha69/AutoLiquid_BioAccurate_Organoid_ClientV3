#!/bin/bash

##版本号
_tag=1.0
##镜像名称
_imageName=magix-vue

#停止容器
cid=$(docker ps -a | grep ${_imageName} | awk '{print $1}')
if [ -n "$cid" ]
     then
     docker stop ${cid}
fi

#删除容器
cid=$(docker ps -a | grep ${_imageName} | grep "Exited"  | awk '{print $1}')
if [ -n "$cid" ]
     then
     docker rm ${cid}
fi

#删除镜像
tags=`docker images | awk -v iname=${_imageName} '($1 ~ iname) {print $1":"$2}'`
if [ -n "${tags}" ]
then
  for tag in ${tags}
  do
    docker rmi ${tag}
  done
fi

#删除空镜像
cid=$(docker images | grep "none"  | awk '{print $3}')
if [ -n "$cid" ]
     then
     docker rmi ${cid}
fi

#编译代码
npm run build

if [ $? -ne 0 ]
     then
     echo "compilation fails"
     exit 1
fi
#生成镜像
docker build -t ${_imageName}:${_tag} .
if [ $? -ne 0 ]
     then
     echo "docker build fails"
     exit 1
fi

##启动镜像
echo '=====================run container==================='
docker run -p 81:80 \
-v /data/magic-vue/nginx:/etc/nginx/conf.d \
--restart=always \
--name ${_imageName} -d ${_imageName}:${_tag}
