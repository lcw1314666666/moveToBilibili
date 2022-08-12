const { updateTop, updateAll } = require('./utils/update.js') // 更新数据
const { getDownloadList, setDownloadList, transporter, scrollTimer } = require('./utils/index')

const main = async function(page, browser) {
    const newVideoList = await updateTop(page) // 获取最新视频列表

    const historyVideo = await getDownloadList() // 获取历史视频

    const newVideoUrl = newVideoList[0].videoUrl // 视频链接
    const newVideoName = newVideoList[0].videoName

    if (historyVideo.newestVideo !== undefined && historyVideo.newestVideo !== newVideoName) { // 有新视频
        console.log('有新视频！' + newVideoName, new Date().Format("yyyy-MM-dd hh:mm:ss"))
        clearInterval(updateTimer) // 如果有新视频清理掉定时器

        // await page.click('#video-title').then(async () => {
        //      newVideoUrl = await page.url()
        // }); // 点击获取最新视频链接

        // 发送邮箱提示
        let mailOptions = {
            from: '1820566696@qq.com', // sender address
            to: '1820566696@qq.com', // list of receivers
            subject: `老高最新视频${newVideoName}更新`, // Subject line
            // 发送text或者html格式
            // text: 'Hello world?', // plain text body
            html: `<b>${newVideoName}<span>视频地址：${newVideoUrl}</span>></b>` // html body
        };

        // 发送邮箱
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('邮件发送成功', info.messageId);
            // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
        });

        // 下载新视频并上传

        const downloadPage = await browser.newPage();
        await downloadPage.goto('https://en.savefrom.net/181/') // 跳转视频下载网站

        await downloadPage.type('#sf_url', newVideoUrl, {delay: 100}) // 填写下载地址
        await downloadPage.click('#sf_submit')
        await downloadPage.waitForSelector('#sf_result'); // 等待下载链接加载完毕
        await downloadPage.waitForSelector('.def-btn-box > a.link-download');
        await downloadPage.click('.def-btn-box > a.link-download') // 点击下载

        // 更新json文件
        setDownloadList({ newestVideo: newVideoName })
        await page.goto(api) // 返回主页
    } else {
        console.log('无新视频,继续刷新页面！', new Date().Format("yyyy-MM-dd hh:mm:ss"))
        await page.reload()
    }
}

exports.main = main
