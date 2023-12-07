const fs = require('fs');
const path = require('path');
const forge = require('node-forge');

function generateRootCertificate(conf) {
  // 创建根证书
  const rootKeys = forge.pki.rsa.generateKeyPair(2048);
  const rootCert = forge.pki.createCertificate();
  rootCert.publicKey = rootKeys.publicKey;
  rootCert.serialNumber = '01';
  rootCert.validity.notBefore = new Date();
  rootCert.validity.notAfter = new Date();
  rootCert.validity.notAfter.setFullYear(rootCert.validity.notBefore.getFullYear() + 1);  // 1年有效期

  const rootAttrs = [
    {name: 'commonName', value: conf.commonName},
    {name: 'countryName', value: conf.countryName},
    // ... 其他属性
  ];
  rootCert.setSubject(rootAttrs);
  rootCert.setIssuer(rootAttrs);

  const extensions = [
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'subjectAltName',
      altNames: [{
        type: 2, // DNS
        value: conf.subjectAltName // 你的域名
      }]
    }
  ];
  rootCert.setExtensions(extensions);
  // 使用 SHA-256 签名算法签署证书
  rootCert.sign(rootKeys.privateKey, forge.md.sha256.create());


  // 确保目录存在
  const dir = './dist/CA';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, 'root-cert.crt'), forge.pki.certificateToPem(rootCert));
  fs.writeFileSync(path.join(dir, 'root-key.key'), forge.pki.privateKeyToPem(rootKeys.privateKey));
}

module.exports = generateRootCertificate