<template>
  <progress :percent="percent" stroke-width="10" active active-mode="forwards"/>
  <swiper :current="swiperCurrent" @change="changeCurrent">
    <swiper-item v-for="(item,index) in subjects" :key="index">
      <!-- 题目 -->
      <view class="topic-area">
        <text>单选</text>
        <text>{{ item.subject }}</text>
      </view>
      <!--      单选-->
      <view>
        <view @tap="checkAnswer('A',item.answer)">
          <text>A. {{ item.optionA }}</text>
        </view>
        <view @tap="checkAnswer('B',item.answer)">
          <text>B. {{ item.optionB }}</text>
        </view>
        <view @tap="checkAnswer('C',item.answer)">
          <text>C. {{ item.optionC }}</text>
        </view>

        <!-- 显示解析的区域 -->
        <view v-if="showExplanation">
          <text>解析:{{ item.analysis }}</text>
        </view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup>
import {reactive, ref, watch} from 'vue'
import {onShow, onUnload} from '@dcloudio/uni-app'
import {requestApi} from "@/api/request";
//import {requestApi} from '@/api/request.js'
// 存储题目顺序的abcd
const sequence = ref(['A', 'B', 'C', 'D', 'E', 'F'])
// 存储所有题
const subjects = ref([])
// 存储答错和答对的题的图标
const imgData = ref(['/static/yes.png', '/static/no.png'])
// 存储答对的题的下标
const correntIndex = ref([])
// 存储答错的题的下标
const errorIndex = ref([])
// 进度条进度值
const percent = ref(0)
// 滑块顺序，下标从0开始
const swiperCurrent = ref(0)

onShow(async () => {
  const res = await requestApi('/api/knowledge/list',
      {
        type: 1
      }, 'GET'
  )
  subjects.value = res.data
  console.log(res.data)
  shuffleArray(res.data)        //打乱题目
  res.data.forEach(item => {      //打乱选项
    shuffleArray(item.options)
  })
})

// 控制是否显示解析的标志
const showExplanation = ref(false);

// 检查答案的方法
const checkAnswer = (selectedOption, answer) => {
  // 判断所选答案是否正确
  if (selectedOption === answer) {
    // 如果正确，切换到下一题的逻辑这里省略，实际应用中可能需要和父组件通信或管理一个题目列表的索引
    console.log('答案正确，准备切换下一题');
    // 选择正确自动进入下一题
    if (swiperCurrent.value + 1 < subjects.value.length) {
      setTimeout(() => {
        swiperCurrent.value = index + 1
      }, 500)
    }
    showExplanation.value = false;

  } else {
    // 如果错误，显示解析
    showExplanation.value = true;
  }
};

// 随机打乱数据
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}


// 当前题目的顺序
const currentOrder = ref(1)

// 滑动时触发
function changeCurrent(event) {
  currentOrder.value = event.detail.current + 1
  showExplanation.value = false
}

</script>

<style>
@import url("@/style.css");

.selected {
  background-color: #333;
  color: #ffffff;
}

.yes-text {
  background-color: #5dbf84 !important;
  color: #ffffff;
}

.no-text {
  background-color: red !important;
  color: #ffffff;
}
</style>