const fs = require('fs')
const nodemailer = require('nodemailer');

// 读取JSON文件
const getJSONList = async function(JSONFileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(JSONFileName, 'utf-8', (err, data) => {
            if (err) {
                reject(err)
            }
            const downloadList = JSON.parse(data.toString())

            resolve(downloadList)
        })
    })
}

// 写入JSON文件
const setJSONList = async function(JSONFileName, newDownload) {
    // const historyDown = await getDownloadList() // 获取历史下载文件记录
    const downloadList = JSON.stringify(newDownload)
    return new Promise((resolve, reject) => {
        fs.writeFile(JSONFileName, downloadList, (err) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(downloadList)
        })
    })
}

const transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
        user: '1820566696@qq.com',
        // 这里密码不是qq密码，是你设置的smtp授权码
        pass: 'mvjeoapjantyefbh',
    }
});

const scrollTimer = async function(page) {
    return page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 300
            var timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance

                if(totalHeight >= 300000){
                    clearInterval(timer)
                    resolve()
                }
            }, 400)
        })
    })
}

const waitForFile = async function(fileName) {
    return new Promise(function(resolve, reject){
        fs.access(fileName, fs.constants.R_OK, (err)=>{
            if(!err){
                resolve(`文件 ${fileName} 已出现.`)
            }else{
                // reject(new Error(`文件 ${fileName} 未找到.`))
                console.log(`文件 ${fileName} 未找到.`)
                resolve(false)
            }
        })

        fs.access(fileName, fs.constants.R_OK, (err)=>{
            if(!err){
                resolve(`文件 ${fileName} 已存在.`)
            }
        })
    })
}

// 等待文件上传完毕
const waitFileDownload = async function(filePath) {
    return new Promise((resolve, reject) => {
        const fileDownloadTimer = setInterval(async () => {
            // 等待文件出现
            fileShow = await waitForFile(filePath);
            if (fileShow) {
                clearInterval(fileDownloadTimer) // 清理定时器
                resolve(true)
            }
        }, 10000)
    })
}

exports.getJSONList = getJSONList
exports.setJSONList = setJSONList
exports.transporter = transporter
exports.scrollTimer = scrollTimer
exports.waitForFile = waitForFile
exports.waitFileDownload = waitFileDownload
