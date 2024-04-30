const baseUrl = 'http://127.0.0.1:8899'
import {Base64} from 'js-base64'
// 获取后端需要的token认证
function encryptToken(){
    const {access_token} = wx.getStorageSync('userInfo')
    const auth = Base64.encode(access_token + ':')
    return 'Bearer ' + auth
}


// 发送请求
function requestApi(url,data={},method='GET'){
    return new Promise((resolve,reject)=>{
        uni.request({
            url: baseUrl + url,
            method,
            data,
            header:{Authorization:encryptToken()},
            success:(res)=>{
                const status = res.statusCode
                switch(status){
                    case 200:
                        resolve(res.data)
                        wx.hideLoading()
                        break;
                    case 404:
                        console.error('接口不存在')
                        reject('404')
                        wx.hideLoading()
                        break;
                    case 401:
                        wx.navigateTo({url:'/pages/login/index'})
                        wx.hideLoading()
                        break;
                    case 500:
                        console.error('异常错误')
                        showToast('发生异常错误')
                        reject('500')
                        wx.hideLoading()
                        break;
                    case 501:
                        console.error('异常错误')
                        showToast('发生异常错误')
                        reject('501')
                        wx.hideLoading()
                        break;
                    case 502:
                        console.error('异常错误')
                        showToast('发生异常错误')
                        reject('502')
                        wx.hideLoading()
                        break;
                    case 400:
                        console.error(res.data.msg)
                        reject('400')
                        wx.hideLoading()
                        break;
                    case 422:
                        console.error(res.data.msg)
                        reject('422')
                        wx.hideLoading()
                        break;
                }
            },
            fail:(err)=>{
                reject(err)
                console.log(err);
                wx.hideLoading()
            }
        })
    })
}

function showToast(title){
    wx.showToast({
        title,
        icon: 'none',
        duration: 1500
    })
}

export {requestApi}