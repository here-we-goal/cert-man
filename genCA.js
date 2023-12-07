const fs = require('fs');
const { generateRootCertificate } = require('./utils/index')

// 从配置文件中读取配置
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// 调用函数生成根证书
generateRootCertificate(config);
