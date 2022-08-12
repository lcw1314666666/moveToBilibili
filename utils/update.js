const { getDownloadList, setDownloadList, transporter, scrollTimer } = require('./index')


const updateAll = async function(page) {
    return new Promise(async (resolve, reject) => {
        await scrollTimer(page) // 将滚动条滚动到最底部

        const videUrlList = await page.$$eval('#video-title', el => el.map(el => el.href)) // 视频链接集合
        const videoCoverList = await page.$$eval('.style-scope ytd-grid-renderer #img', el => el.map(el => el.src)) // 封面链接集合
        const videoNameList = await page.$$eval('#video-title', el => el.map(el => el.innerText)) // 视频名称集合

        console.log(videUrlList.length, videoCoverList.length, videoNameList.length)

        let videoDataList = []
        if (videUrlList.length === videoCoverList.length && videoCoverList.length === videoNameList.length) { // 整理视频数据
            for(let i = 0; i < videUrlList.length; i++) {
                videoDataList.push({
                    videoUrl: videUrlList[i],
                    videoCover: videoCoverList[i].replace(/hqdefault/g, 'maxresdefault'),
                    videoName: videoNameList[i]
                })
            }
        }
        videoDataList = videoDataList.reverse()
        resolve(videoDataList)
    })
}

const updateTop = async function(page) {
    return new Promise(async (resolve, reject) => {

        const videUrlList = await page.$$eval('#video-title', el => el.map(el => el.href)) // 视频链接集合
        const videoCoverList = await page.$$eval('.style-scope ytd-grid-renderer #img', el => el.map(el => el.src)) // 封面链接集合
        const videoNameList = await page.$$eval('#video-title', el => el.map(el => el.innerText)) // 视频名称集合

        let videoDataList = []
        if (videUrlList.length === videoCoverList.length && videoCoverList.length === videoNameList.length) { // 整理视频数据
            for(let i = 0; i < videUrlList.length; i++) {
                videoDataList.push({
                    videoUrl: videUrlList[i],
                    videoCover: videoCoverList[i].replace(/hqdefault/g, 'maxresdefault'),
                    videoName: videoNameList[i]
                })
            }
        }
        // videoDataList = videoDataList.reverse()
        resolve(videoDataList)
    })
}

exports.updateAll = updateAll
exports.updateTop = updateTop
