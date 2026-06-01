const { zip } = require('zip-a-folder');
const path = require('path');

async function zipDist() {
  try {
    const distPath = path.resolve(__dirname, '../dist');
    const zipPath = path.resolve(__dirname, '../dist.zip');
    
    console.log('开始压缩dist文件夹...');
    await zip(distPath, zipPath);
    console.log('成功创建 dist.zip 文件！');
  } catch (err) {
    console.error('压缩dist文件夹时出错:', err);
    process.exit(1);
  }
}

zipDist(); 