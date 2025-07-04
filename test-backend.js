// 测试后端连接的简单脚本
const axios = require('axios');

async function testBackendConnection() {
  try {
    console.log('正在测试后端连接...');
    
    // 测试后端健康检查或登录接口
    const response = await axios.get('http://192.168.3.139:5566/getCaptchaOpen', {
      timeout: 5000
    });
    
    console.log('✅ 后端连接成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.log('❌ 后端连接失败:');
    if (error.code === 'ECONNREFUSED') {
      console.log('连接被拒绝 - 后端服务可能没有运行');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('连接超时 - 网络不可达或服务响应慢');
    } else if (error.code === 'ENOTFOUND') {
      console.log('主机不存在 - 请检查IP地址');
    } else {
      console.log('错误详情:', error.message);
    }
  }
}

testBackendConnection();
