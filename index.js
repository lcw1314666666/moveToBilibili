const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer');
const { getJSONList, setJSONList, transporter, scrollTimer, waitForFile, waitFileDownload } = require('./utils/index')
const { updateTop, updateAll } = require('./utils/update.js') // 更新数据
const { uploadFile } = require('./uploadVideo.js')

Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

;(async () => {
    // let api = 'https://www.youtube.com/channel/UCMUnInmOkrWN4gof9KlhNmQ/videos?view=0&sort=dd&shelf_id=0' // 站外链接 老高
    let api = 'https://www.youtube.com/channel/UCXZLmOdYB5_O8G_tjkDpTbQ/videos' // 平川电竞

    const browser = await puppeteer.launch({
        slowMo: 100,    //放慢速度
        headless: false,
        defaultViewport: {width: 1440, height: 780},
        ignoreHTTPSErrors: false, //忽略 https 报错
    });
    const page = await browser.newPage();
    await page.goto(api);

    // const videoList = await updateTop(page) // 更新最新
    let videoList = await getJSONList('./AllVideo.json')// 全部更新
    if (videoList.length === 0) {
        const allVideoList = await updateAll(page)
        videoList = allVideoList
        await setJSONList('./AllVideo.json', allVideoList) // 保存全部
    }

    const historyVideoList = await getJSONList('./historyVideo.json')

    const videoInfoList = videoList.filter(item => { // 过滤掉已下载的视频
        return historyVideoList.findIndex(findItem => item.videoName === findItem.videoName) === -1
    })
    if (videoInfoList.length === 0) {
        console.log('无视频数据')
        return
    }

    // 下载视频
    const downloadPage = await browser.newPage();
    for (let i = 0; i < 8; i++) {
        await downloadPage.goto('https://en.savefrom.net/181/', {// 跳转视频下载网站
            waitUntil: 'load', // Remove the timeout
            timeout: 60 * 1000
        })
        const currentVideo = videoInfoList[i]
        console.log(currentVideo, '当前下载视频')
        await downloadPage.type('#sf_url', currentVideo.videoUrl, {delay: 20}) // 填写下载地址
        await downloadPage.click('#sf_submit')
        await downloadPage.waitForSelector('#sf_result'); // 等待下载链接加载完毕

        await downloadPage.waitForSelector('#sf_result .info-box .meta .title');
        const downloadfileName = await downloadPage.$eval('#sf_result .info-box .meta .title',e => e.title); // 获取下载文件名称
        console.log(downloadfileName, 'downloadfileName')

        await downloadPage.waitForSelector('.def-btn-box > a.link-download');
        const client = await downloadPage.target().createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: 'D:\\Download'
        });
        await downloadPage.click('.def-btn-box > a.link-download') // 点击开始下载

        const filePath = `D:\\Download\\${downloadfileName}.mp4`.replace(/\-/g, '_') // 下载文件路径

        // 等待文件下载完毕
        const fileDownloadState = await waitFileDownload(filePath)
        if (fileDownloadState) {
            console.log('文件上传完毕')
            // 整理下载视频信息
            const newVideoObj = {
                videoName: currentVideo.videoName,
                videoUrl: currentVideo.videoUrl,
                videoCover: currentVideo.videoCover,
                videoPath: filePath
            }
            // 更新json文件
            const historyJSONInfo = await getJSONList('./historyVideo.json') // 获取历史信息
            historyJSONInfo.push(newVideoObj)
            console.log(historyJSONInfo, 'historyJSONInfo')
            await setJSONList('./historyVideo.json', historyJSONInfo) // 更新下载记录

            await uploadFile(browser, newVideoObj)
            // 上传完毕保存数据
            const uploadListHistory = await getJSONList('./historyVideo.json') // 获取历史信息
            uploadListHistory.push(newVideoObj)
            await setJSONList('./uploadOver.json', uploadListHistory) // 更新下载记录
        }
    }
})();
