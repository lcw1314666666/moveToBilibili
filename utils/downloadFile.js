// import { exec } from 'child_process'
// import iconv from 'iconv-lite'
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 判断当前字符串是否是JSON字符串
function isJsonString(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}

// 复制文本
// export const copyText = async(str: string, type = 'gbk') => {
//   await exec('clip').stdin?.end(iconv.encode(str, type))
// }

/**
* @Date: 2022-05-25 10:02:09
* @Describe: 下载文件到本地
* @param: {{name:string, url:string}} file - 需要下载的文件 对象
* @param: {string} dir - 下载目录地址
* @return: void
*/
async function downloadFile(file, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const filePath = path.resolve(dir, file.name)
  console.log('下载开始')
  const response = await axios({
    url: file.url,
    method: 'GET',
    responseType: 'arraybuffer'
  })
  console.log('下载完成')
  fs.writeFileSync(filePath, response.data)
  console.log('写入完成')
  return Promise.resolve()
}

// 商标文件下载方法
function downloadTrademarkFile(url) {
  console.log(url, 'url')
  // let url='http://sbsjxz.ctdns.net/216319d4eead310095aff7d54a7b5638/623d63b1/incremental_data/202202/image_9.zip'
  const urlArr = url.split('/')
  const fileName = 'trademarkFile/' + urlArr.slice(-2).join('_') // 定义文件名称和存储路径

  const saveFileName = '/' + urlArr.slice(-3).join('/') // 需要保存的商标文件名称

  return new Promise((resolve, reject)=>{
    // 确保dest路径存在
    const file = fs.createWriteStream(fileName)

    http.get(url , (res)=>{
      if(res.statusCode !== 200){
        reject(res.statusCode)
        return
      }

      res.on('end', ()=>{
        console.log(saveFileName + '文件已下载完成')
      });
      // 进度、超时等

      file.on('finish', ()=>{
        file.close(resolve)
        resolve(true)
      }).on('error', (err)=>{
        fs.unlink(fileName)
        reject(err.message)
      })

      res.pipe(file)
    });
  });
}

module.exports = downloadFile
