<template>
	<div class="best-selling-wrapper">
		<canvas id="best-selling" width="100%" height="600"></canvas>
	</div>
</template>

<script>
import Chart from 'chart.js/auto'
import { goodsArray } from '@/firebase/useWarehouse'
import { exportNoteArray } from '@/firebase/useExportNote'

window.bestSellingChart = null

export default {
	setup() {
		return { goodsArray, exportNoteArray }
	},
	computed: {
		topGoodsSell() {
			if (this.goodsArray.length === 0 || this.exportNoteArray.length === 0) return []
			const that = this
			const listGoods = []
			this.exportNoteArray.forEach(note => {
				Object.entries(note.stockOut).forEach(([goodsID, batch]) => {
					let goods = listGoods.find(item => item.goodsID === goodsID)
					if (!goods) {
						const goodsName = that.goodsArray.find(item => item.goodsID === goodsID)?.goodsName
						goods = { goodsID, goodsName, quantity: 0, totalCost: 0, totalSell: 0 }
						listGoods.push(goods)
					}
					Object.entries(batch).forEach(([batchKey, { actualPrice, quantity }]) => {
						goods.quantity += quantity
						goods.totalSell += quantity * actualPrice
						goods.totalCost += quantity * Number(batchKey.split('-')[1])
					})
				})
			})
			listGoods.sort((a, b) => {
				if (a.quantity < b.quantity) return 1
				if (a.quantity > b.quantity) return -1
				return 0
			})
			return listGoods.slice(0, 10)
		},
	},
	watch: {
		topGoodsSell(after) {
			this.$forceUpdate()
		},
	},
	mounted() {
		this.startDrawChart()
	},
	updated() {
		if (window.bestSellingChart?.destroy) {
			window.bestSellingChart.destroy()
		}
		this.startDrawChart()
	},
	methods: {
		startDrawChart() {
			const that = this
			const listGoodsName = this.topGoodsSell.map(item => item.goodsName + '(' + item.quantity + ')')
			const listTotalCost = this.topGoodsSell.map(item => item.totalCost)
			const listTotalProfit = this.topGoodsSell.map(item => item.totalSell - item.totalCost)
			const ctx = document.getElementById('best-selling').getContext('2d')
			window.bestSellingChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: listGoodsName,
					datasets: [
						{
							label: 'Tiền Vốn',
							data: listTotalCost,
							backgroundColor: ['rgba(255, 99, 132, 0.2)'],
							borderColor: ['rgba(54, 162, 235, 1)'],
							borderWidth: 1,
							stack: 'Stack 0',
						},
						{
							label: 'Tiền Lãi',
							data: listTotalProfit,
							backgroundColor: ['rgba(54, 162, 235, 0.2)'],
							borderColor: ['rgba(54, 162, 235, 1)'],
							borderWidth: 1,
							stack: 'Stack 0',
						},
					],
				},
				options: {
					indexAxis: 'x',
					responsive: true,
					plugins: {
						title: {
							display: true,
							text: 'Top 10 sản phẩm bán chạy nhất',
						},
					},
					scales: {
						x: {
							stacked: true,
						},
					},
				},
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.best-selling-wrapper {
	max-width: 100%;
}
</style>
