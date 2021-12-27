<template>
	<div class="ware-house-chart-wrapper">
		<canvas id="ware-house-chart" width="350" height="350"></canvas>
	</div>
</template>

<script>
import Chart from 'chart.js/auto'
import { goodsArray } from '@/firebase/useWarehouse'

window.warehouseChart = null

export default {
	setup() {
		return { goodsArray }
	},
	computed: {
		warehouseCost() {
			return this.goodsArray.reduce((accGoods, goods) => {
				const eachGoods = Object.entries(goods.stockAvail).reduce((accStock, [batch, { quantity }]) => {
					const eachStock = quantity * Number(batch.split('-')[1])
					return accStock + eachStock
				}, 0)
				return accGoods + eachGoods
			}, 0)
		},

		warehouseRetail() {
			return this.goodsArray.reduce((accGoods, goods) => {
				const eachGoods = Object.entries(goods.stockAvail).reduce((accStock, [batch, { quantity }]) => {
					const eachStock = quantity * goods.retailPrice
					return accStock + eachStock
				}, 0)
				return accGoods + eachGoods
			}, 0)
		},
	},
	watch: {
		warehouseCost(newValue) {
			this.$forceUpdate()
		},
	},
	mounted() {
		this.startDrawChart()
	},
	updated() {
		if (window.warehouseChart?.destroy) {
			window.warehouseChart.destroy()
		}
		this.startDrawChart()
	},
	methods: {
		startDrawChart() {
			const that = this
			const ctx = document.getElementById('ware-house-chart').getContext('2d')
			window.warehouseChart = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: ['Giá Gốc', 'Dự Kiến Lãi'],
					datasets: [
						{
							label: '# of Votes',
							data: [that.warehouseCost, that.warehouseRetail - that.warehouseCost],
							backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
							borderColor: ['rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
							borderWidth: 1,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Tổng Kho Hàng',
						},
					},
				},
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.ware-house-chart-wrapper {
	max-width: 400px;
}
</style>
