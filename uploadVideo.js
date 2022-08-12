const fs = require('fs');
const path = require('path');
const { getJSONList } = require('./utils/index.js')
const PuppeteerUtil = require('./utils/puppeteer.js');

const uploadFile = async function(browser, newVideoObj) {
    const url = 'https://member.bilibili.com/york/videoup?new&spm_id_from=333.1007.top_bar.upload'
    let cookies = await getJSONList('./Cookie.json')

    const uploadPage = await browser.newPage();

    if (cookies) { // 判断是否有cookie
        await Promise.all(cookies.map((pair) => {
            uploadPage.setCookie(pair)
        }))
    }

    await uploadPage.goto(url) // 进度创作中心

    await PuppeteerUtil.uploadFile(uploadPage, { name: newVideoObj.videoName, url: newVideoObj.videoPath }, '//*[@id="video-up-app"]//input') // 上传视频文件

    await uploadPage.waitForSelector('#video-up-app > div.content > div > div > div.video-basic > div.form > div:nth-child(4) > div > div > div.type-check-radio-wrp > div:nth-child(2)')
    await uploadPage.click('#video-up-app > div.content > div > div > div.video-basic > div.form > div:nth-child(4) > div > div > div.type-check-radio-wrp > div:nth-child(2)') // 点击转载
    await uploadPage.type(".type-source-input-wrp .input-container .input-instance input", newVideoObj.videoUrl, { delay: 100 });  // 填写素材来源

    // 选择标签
    for (let i = 0; i < 10; i++) {
        await uploadPage.click('.tag-wrp .tag-list .hot-tag-container:nth-child(' + (i + 1) + ')' )
    }

    // 填写简介
    let divHandle = await uploadPage.$('.archive-info-editor .metion-toolkit .mention-hidden-input')
    await uploadPage.evaluate((el, value) => el.setAttribute('textContent', value),
        divHandle,
        newVideoObj.videoName
    )

    // 提交
    await uploadPage.click('.submit-container .submit-add') // 点击转载
}

exports.uploadFile = uploadFile
