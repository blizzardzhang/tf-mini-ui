<template>
	<progress :percent="percent" stroke-width="10" active active-mode="forwards"/>
	<swiper :current="swiperCurrent" @change="changeCurrent">
		<swiper-item v-for="(item,index) in topicData" :key="index">
			<!-- 题目 -->
			<view class="topic-area">
				<text>{{item.type === '101' ? '判断' : '多选'}}</text>
				<text>{{item.ExamQuestion}}</text>
			</view>
			<!-- 如果有图 -->
			<view class="picture" v-if="item.picture != ''">
				<image :src="item.picture" mode="widthFix"></image>
			</view>
			<!-- 单选:判断题 -->
			<block v-if="item.type === '101'">
				<view class="select-answer" v-for="(itema,indexa) in item.options" :key="indexa">
					<text v-if="!itema.isCorrect">{{sequence[indexa]}}</text>
					<image v-if="itema.isCorrect" :src="itema.icon_url" mode="widthFix"></image>
					<text @click="judgment(index,indexa,itema.select_id,item.correct_id,itema.isCorrect)">{{itema.select}}</text>
				</view>
			</block>
			<!-- 多选题 -->
			<block v-if="item.type === '102'">
				<view class="select-answer" v-for="(itema,indexa) in item.options" :key="indexa">
					<text v-if="!itema.whetherSubmit" :class="multipTextStyle(itema.isCorrect)">{{sequence[indexa]}}</text>
					<image v-if="itema.whetherSubmit" :src="itema.icon_url" mode="widthFix"></image>
					<text @click="multipleChoice(index,indexa,itema.select_id,item.correct_id,itema.isCorrect,item.store_check_id)">{{itema.select}}</text>
				</view>
				<!-- 确定提交按钮 -->
				<button class="submit"
				v-if="!item.answered"
				:type="item.store_check_id.length >= 2 ? 'primary' : 'default'"
				:disabled="item.store_check_id.length >= 2 ? false : true"
				@click="subMit(index,item.store_check_id,item.correct_id,item.options)"
				>确定</button>
			</block>
			<block v-if="item.answered">
			<!-- 正确答案 -->
			<view class="Correct-answer">
				<text>答案：</text>
				<text v-for="(itema,indexa) in item.correct_answer" :key="index">{{itema}}</text>
			</view>
			<!-- 题目解析 -->
			<view class="analyze">
				<view class="analyze-title">
					<text></text>
					<text>题目解析</text>
				</view>
				<text user-select>{{item.analyze}}</text>
			</view>
			</block>
		</swiper-item>
	</swiper>
	<!-- 底部 -->
	<view class="bottom-area">
		<view class="bottom-left" @click="submitPaper = true">交卷 {{state.formattedTime}}</view>
		<view class="bottom-right">
			<view @click="showPopup = true">
				<text>{{correntIndex.length}}</text>
				<text>答对</text>
			</view>
			<view @click="showPopup = true">
				<text>{{errorIndex.length}}</text>
				<text>答错</text>
			</view>
			<view @click="showPopup = true">
				<text>{{currentOrder}}/{{topicData.length}}</text>
				<text>题板</text>
			</view>
		</view>
	</view>
	<!-- 题板弹窗 -->
	<page-container :show="showPopup"
		@beforeleave="showPopup = false" @clickoverlay="showPopup = false"
		>
		<view class="popup-view">
			<view class="topic-number">
				<view>
					<text v-for="(item,index) in topicData.length" :key="index"
					:class="getTestStyle(index)"
					@click="numericalOrder(index)"
					>{{item}}</text>
				</view>
			</view>
		</view>
	</page-container>
	<!-- 答错6题不合格的弹窗 -->
	<view class="below-standard" v-if="isCorrectAnswer">
		<view class="main-content">
			<text class="unqualified-title">成绩不合格</text>
			<text class="unqualified-alert">已答错6题，正确率待提升</text>
			<view class="submit-button">
				<text @click="isCorrectAnswer = false">继续考试</text>
				<text @click="examCompleted">现在交卷</text>
			</view>
		</view>
	</view>
	<!-- 用户自主交卷弹窗 -->
	<view class="below-standard" v-if="submitPaper">
		<view class="main-content">
			<text class="unqualified-title">确认交卷</text>
			<view class="answer-data">
				<view>
					<text>{{topicData.length - (correntIndex.length + errorIndex.length)}}</text>
					<text>未答题数</text>
				</view>
				<view>
					<text>{{state.formattedTime}}</text>
					<text>剩余时间</text>
				</view>
				<view>
					<text>{{2 * correntIndex.length}}</text>
					<text>考试得分</text>
				</view>
			</view>
			<view class="submit-button">
				<text @click="submitPaper = false">继续考试</text>
				<text @click="examCompleted">现在交卷</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {reactive, ref, watch} from 'vue'
	import {onShow,onUnload} from '@dcloudio/uni-app'
	//import {requestApi} from '@/api/request.js'
	// 存储题目顺序的abcd
	const sequence = ref(['A','B','C','D','E','F'])
	// 存储所有题
	const topicData = ref([])
	// 存储答错和答对的题的图标
	const imgData = ref(['/static/yes.png','/static/no.png'])
	// 存储答对的题的下标
	const correntIndex = ref([])
	// 存储答错的题的下标
	const errorIndex = ref([])
	// 进度条进度值
	const percent = ref(0)
	// 滑块顺序，下标从0开始
	const swiperCurrent = ref(0)
	
	onShow(async()=>{
		const res = await requestApi('/getTopic')
		topicData.value = res.data
		shuffleArray(res.data)//打乱题目
		res.data.forEach(item=>{//打乱选项
			shuffleArray(item.options)
		})
		// 倒计时
		countdownStarts()
	})
	
	// 随机打乱数据
	function shuffleArray(array){
		for(let i = array.length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * (i + 1));
			[array[i],array[j]] = [array[j],array[i]]
		}
	}
	
	// 选择判断题
	function judgment(index,indexa,select_id,correct_id,isCorrect){
		if(topicData.value[index].answered)return false
		if(correct_id.includes(select_id)){//选择正确
			// 更新当前答案的图标为正确图标
			topicData.value[index].options[indexa].icon_url = imgData.value[0]
			topicData.value[index].options[indexa].isCorrect = true
			// 存储答对的题的下标
			correntIndex.value.push(index)
			// 取出正确答案的顺序
			var sequenceData = sequence.value[indexa]
			// 选择正确自动进入下一题
			if(swiperCurrent.value + 1 < topicData.value.length){
				setTimeout(()=>{
					swiperCurrent.value = index + 1
				},500)
			}
		}else{//选择错误
			/* 
			当前项加上错误图标，将正确项加上正确图标 
			 */
			topicData.value[index].options[indexa].icon_url = imgData.value[1]
			// 取出正确答案的下标
			const idx = topicData.value[index].options.findIndex(item=>item.select_id ===  correct_id[0])
			topicData.value[index].options[idx].icon_url = imgData.value[0]
			topicData.value[index].options[indexa].isCorrect = true
			topicData.value[index].options[idx].isCorrect = true
			// 存储答错的题的下标
			errorIndex.value.push(index)
			// 取出正确答案的顺序
			var sequenceData = sequence.value[idx]
		}
		// 取出正确答案的顺序更新数据
		topicData.value[index].correct_answer = [sequenceData]
		// 已选择了该题
		topicData.value[index].answered = true
		// 进度条
		percent.value += 2
	}
	
	// 多选题
	function multipleChoice(index,indexa,select_id,correct_id,isCorrect,store_check_id){
		if(topicData.value[index].answered)return false
		// 点击可选中，也可取消选中
		if(isCorrect){
			const indexRemove = topicData.value[index].store_check_id.findIndex(item=>item === select_id)
			topicData.value[index].store_check_id.splice(indexRemove,1)
			topicData.value[index].options[indexa].isCorrect = false
		}else{
			topicData.value[index].store_check_id.push(select_id)
			topicData.value[index].options[indexa].isCorrect = true
		}
	}
	
	// 多选题选中或取消选中加上样式
	function multipTextStyle(isCorrect){
		if(isCorrect){
			return 'selected'
		}else{
			return ''
		}
	}
	
	// 提交多选
	function subMit(index,store_check_id,correct_id,options){
		const isSame = store_check_id.length === correct_id.length && store_check_id.every(item=>correct_id.includes(item))
		if(isSame){//都选对了
			// 存储答对的题的下标
			correntIndex.value.push(index)
			// 选择正确自动进入下一题
			if(swiperCurrent.value + 1 < topicData.value.length){
				setTimeout(()=>{
					swiperCurrent.value = index + 1
				},500)
			}
		}else{
			// 存储答错的题的下标
			errorIndex.value.push(index)
		}
		//取出正确答案在视图层展示
		const correctId = correct_id.map(value=>options.findIndex(item=>item.select_id === value))
		correctId.forEach(item=>{
			topicData.value[index].options[item].whetherSubmit = true
			topicData.value[index].options[item].icon_url = imgData.value[0]
			topicData.value[index].correct_answer.push(sequence.value[item])
		})
		// 取出错误答案在视图层上加上错误图标
		let errorId = []
		options.forEach((item,index)=>{
			if(!correct_id.includes(item.select_id)){
				errorId.push(index)
			}
		})
		if(errorId.length > 0){
			errorId.forEach(item=>{
				topicData.value[index].options[item].whetherSubmit = true
				topicData.value[index].options[item].icon_url = imgData.value[1]
			})
		}
		// 已选择了该题
		topicData.value[index].answered = true
		// 进度条
		percent.value += 2
	}
	
	// 当前题目的顺序
	const currentOrder = ref(1)
	// 滑动时触发
	function changeCurrent(event){
		currentOrder.value = event.detail.current + 1
	}
	// 控制弹窗弹出
	const showPopup = ref(false)
	// 给选择的错题和正确题顺序加上样式
	function getTestStyle(index){
		if(correntIndex.value.includes(index)){//选择正确的题
			return 'yes-text'
		}else if(errorIndex.value.includes(index)){//选择错误的题
			return 'no-text'
		}else{
			return ''
		}
	}
	// 点击题目序号滚动到对应的题
	function numericalOrder(index){
		swiperCurrent.value = index
		currentOrder.value = index + 1
		showPopup.value = false
	}
	
	// 控制答错6题的弹窗
	const isCorrectAnswer = ref(false)
	watch(errorIndex,(newVal)=>{
		if(newVal.length === 6){
			isCorrectAnswer.value = true
		}
	},{deep:true})
	// 控制用户自主交卷的弹窗
	const submitPaper = ref(false)
	// 倒计时
	const state = reactive({
		countdown:2700,//考试时间
		formattedTime:'45:00',
		countdownInterval:null
	})
	// 每秒更新倒计时
	function countdownStarts(){
		state.countdownInterval = setInterval(()=>{
			state.countdown--
			state.formattedTime = formatTime(state.countdown)
			if(state.countdown <= 0){
				clearInterval(state.countdownInterval)
				// 倒计时结束自动交卷
				wx.showModal({
					title:'考试超时，即将自动交卷',
					icon:'none',
					duration:3000,
					mask:true
				})
				// 
			}
		},1000)
	}
	// 计算出分钟和秒
	function formatTime(seconds){
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
	}
	
	// 页面销毁时也要销毁定时器
	onUnload(()=>{
		clearInterval(state.countdownInterval)
	})
	// 提交考试成绩
	function examCompleted(){
		const obj = {
			mart:2*correntIndex.value.length,
			questionsLeft:topicData.value.length - (correntIndex.value.length + errorIndex.value.length),
			wrongQuestions:errorIndex.value.length,
			correctAnswers:correntIndex.value.length
		}
		wx.redirectTo({
			url:'/pages/grade/index?data=' + JSON.stringify(obj)
		})
	}
</script>

<style>
	@import url("@/style.css");
	.selected{
		background-color: #333;
		color: #ffffff;
	}
	.yes-text{
		background-color: #5dbf84 !important;
		color: #ffffff;
	}
	.no-text{
		background-color: red !important;
		color: #ffffff;
	}
</style>