const fs = require('fs');
const { generateServerCertificate } = require('./utils/index')

// 从配置文件中读取配置
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// 调用函数生成服务器证书
generateServerCertificate(config.serverCert);
