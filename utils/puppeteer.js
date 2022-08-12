// import {ElementHandle, Page} from 'puppeteer'
// import { Protocol } from 'devtools-protocol'
const fs = require('fs');
const path = require('path');
// const downloadFile = require('./downloadFile.js');

class PuppeteerUtil {
  /**
     * @description 睡眠
     * @param {number} time 睡眠时间（ms）
     * @return Promise<void>
     */
  async sleep(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    })
  }

  /**
     * @description 页面注入cookie
     * @param {Page} page 页面对象
     * @param {{path: string, session: boolean, domain: string, name: string, httpOnly: boolean, value: string, ex: string}[]} cookies [{ "name": string,  }] cookies
     * @return Promise<void>
     */
  // async addCookies(page: Page, cookies: Protocol.Network.CookieParam[]) {
  //   await Promise.all(cookies.map((pair) => {
  //     return page.setCookie(pair)
  //   }))
  // }

  /**
     * @description 页面是否加载完成
     * @param {Page} page 页面对象
     * @return Promise<void>
     */
  async pageLoaded(page) {
    await page.waitForFunction(() => {
      console.log(document.readyState, 'document.readyState')
      document.readyState === 'complete'
    }, { timeout: 5000 })
    console.log(123)
  }

  /**
     * @description 判断页面是否有某个节点
     * @param {Page} page 页面对象
     * @param {string} select 节点选择器
     * @return Promise<boolean>
     */
  async pageHasElement(page, select) {
    try {
      const element = await page.$(select)
      return Promise.resolve(!!element)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
    * @Date: 2022-05-25 08:59:38
    * @Describe: 上传文件 将文件下载到本地 -- 上传
    * @param: {Page} page - 页面对象
    * @param: {{name:string, url:string}} file - 文件对象
    * @param: {string} selector - css 选择器
    * @return: void
    */
  async uploadFile(page, file, xpath) {
    try {
      // 1. 获取临时缓存目录
      // const dir = path.join(process.cwd(), 'temp')
      // 2. 下载文件到本地
      // await downloadFile(file, dir)
      // 3. 获取本地文件地址
      const filePath = file.url
      console.log(filePath)
      // 4. 等待节点并发起上传
      const uploadBtn = await page.waitForXPath(xpath, { timeout: 10000 })
      await uploadBtn.uploadFile(filePath)
      // 5. 上传完成
      console.log('文件上传完成~~~~~~~')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * @Date: 2022-05-25 08:59:38
   * @Describe: 上传文件 将文件下载到本地 -- 上传
   * @param: {Page} page - 页面对象
   * @param: {{name:string, url:string}} file - 文件对象
   * @param: {string} selector - css 选择器
   * @return: void
   */
  async uploadImageFile(page, file, xpath) {
    try {
      // 1. 获取临时缓存目录
      const dir = path.join(process.cwd(), 'temp')
      // 2. 下载文件到本地
      await downloadFile(file, dir)
      // 3. 获取本地文件地址
      const filePath = path.resolve(dir, file.name)
      console.log(filePath)
      // 4. 等待节点并发起上传
      const uploadBtn = await page.waitForXPath(xpath, { timeout: 10000 })
      await uploadBtn.uploadFile(filePath)
      // 5. 上传完成
      console.log('文件上传完成~~~~~~~')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async uploadFiles(page, files, xpath) {
    try {
      // 1. 获取临时缓存目录
      const dir = path.join(process.cwd(), 'temp')
      // 2. 下载文件到本地
      await Promise.all(files.map((x) => {
        const fileName = x.materialUrl.split('/').pop()
        return downloadFile({name: fileName, url: x.materialUrl}, dir)
      }))
      // 3. 获取本地文件地址
      const filePathList = await Promise.all(files.map((x) => {
        return new Promise<string>(resolve => {
          const fileName = x.materialUrl.split('/').pop()
          const filePath = path.resolve(dir, fileName)
          resolve(filePath)
        })
      }))
      // 4. 等待节点并发起上传
      const uploadBtn= await page.waitForXPath(xpath, { timeout: 10000 })
      await uploadBtn.uploadFile(...filePathList)
      // 5. 上传完成
      console.log('小红书图片文件上传完成~~~~~~~')
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /* 上传结束 删除临时文件 */
  async delTempFile(path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, function(fsErr) {
        if (fsErr) {
          reject(fsErr)
        }
        resolve('success')
      })
    })
  }
}
module.exports = new PuppeteerUtil()
