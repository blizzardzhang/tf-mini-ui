<template>
  <view class="login-view">
    <image src="/static/yonghu.png" mode="widthFix"></image>
    <button type="primary" @click="login">登录</button>
  </view>
</template>

<script setup>
import {requestApi} from '@/api/request.js'
import {appId} from "@/api/constant";

function login() {
  wx.showLoading({title: '登录中'})
  wx.login({
    success: async (res) => {
      console.log("jsCode:" , res.code)

      const loginRes = await requestApi('/api/auth/wxLogin',
          {
            jsCode: res.code
          }, 'GET'
      )
      console.log("res:" , loginRes)
      wx.setStorageSync('userInfo', loginRes.data)
      wx.navigateBack({
        delta: 1  //返回上一个页面
      })
      wx.hideLoading()
    }
  })
}
</script>


<style>
page {
  background-image: url('https://qita-1252107261.cos.ap-chengdu.myqcloud.com/motuoche.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  /* background: linear-gradient(to bottom, #b3cffa, #f6f8fe); */
}

.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 80rpx;
  margin-top: 400rpx;
  font-size: 35rpx;
}

.login-view image {
  width: 150rpx;
}

.login-view button {
  width: 100%;
  margin-top: 100rpx;
}
</style>
