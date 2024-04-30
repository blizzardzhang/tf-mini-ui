<template>
  <view class="exam-top">
    <text>CAAC理论考试</text>
  </view>
  <view class="container">
    <button class="round-button" @click="orderPractice">顺序练习</button>
    <button class="round-button" @click="classPractice">分类练习</button>
    <button class="round-button" @click="mockExam">模拟考试</button>
  </view>
</template>

<script setup>

//顺序练习
function orderPractice() {
  wx.navigateTo({
    url: '/pages/exam/index'
  })
}
//分类练习
function classPractice() {
  wx.navigateTo({
    url: '/pages/classification/index'
  })
}
//模拟考
function mockExam() {
  wx.navigateTo({
    url: '/pages/mock/index'
  })
}

</script>

<style>

.exam-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  font-size: 35rpx;
  margin-top: 100rpx;
}

.container {
  /* 容器样式，可以根据需要设置 */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 视口高度 */
}

.round-button {
  /* 圆形按钮样式 */
  width: 80px; /* 宽度 */
  height: 80px; /* 高度 */
  border-radius: 50%; /* 设置为50%使其成为圆形 */
  background-color: #409EFF; /* 背景颜色 */
  color: #fff; /* 文字颜色 */
  border: none; /* 去除边框 */
  text-align: center; /* 文字居中 */
  line-height: 80px; /* 行高与高度一致，确保文字垂直居中 */
  /* 可以根据需要添加更多的样式属性，比如字体大小、字体样式等 */
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}


</style>