const fs = require('fs');
const path = require('path');
const forge = require('node-forge');

function generateServerCertificate(config) {
  const caDir = path.join(__dirname, '../dist/CA')
  // 读取根证书和私钥
  const rootCertPem = fs.readFileSync(path.join(caDir, 'root-cert.crt'));
  const rootKeyPem = fs.readFileSync(path.join(caDir, 'root-key.key'));
  const rootCert = forge.pki.certificateFromPem(rootCertPem);
  const rootKey = forge.pki.privateKeyFromPem(rootKeyPem);

  // 创建服务器证书
  const serverKeys = forge.pki.rsa.generateKeyPair(2048);
  const serverCert = forge.pki.createCertificate();
  serverCert.publicKey = serverKeys.publicKey;
  serverCert.serialNumber = '02';
  serverCert.validity.notBefore = new Date();
  serverCert.validity.notAfter = new Date();
  serverCert.validity.notAfter.setFullYear(serverCert.validity.notBefore.getFullYear() + 1);  // 1年有效期

  const serverAttrs = [
    {name: 'commonName', value: config.commonName},
    {name: 'countryName', value: config.countryName},
    // ... 其他属性
  ];
  serverCert.setSubject(serverAttrs);
  serverCert.setIssuer(rootCert.subject.attributes);  // 使用根证书的主题作为颁发者
  // 证书扩展
  const extensions = [
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true,
    },
    {
      name: 'subjectAltName',
      altNames: [{
        type: 2, // DNS
        value: config.subjectAltName // 你的域名
      }]
    }
  ];

  // 检查是否存在IP地址，如果存在，则添加到subjectAltName扩展中
  if (config.ipAddress && config.ipAddress.trim() !== '') {
    extensions[1].altNames.push({
      type: 7, // IP
      ip: config.ipAddress // 你的IP地址
    });
  }

  serverCert.setExtensions(extensions);  

  // 使用 SHA-256 签名算法签署证书
  serverCert.sign(rootKey, forge.md.sha256.create());

  // 输出服务器证书和私钥到文件
  const dir = path.join(__dirname, '../dist/server');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, `${config.ipAddress || config.subjectAltName || config.commonName}-cert.crt`), forge.pki.certificateToPem(serverCert));
  fs.writeFileSync(path.join(dir, `${config.ipAddress || config.subjectAltName || config.commonName}-key.key`), forge.pki.privateKeyToPem(serverKeys.privateKey));
}

module.exports = generateServerCertificate