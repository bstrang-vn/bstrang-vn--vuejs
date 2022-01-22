<template>
	<div class="export-note-finance-wrapper">
		<canvas id="export-note-finance" width="350" height="350"></canvas>
	</div>
</template>

<script>
import Chart from 'chart.js/auto'
import { exportNoteArray } from '@/firebase/useExportNote'
import { statisticArray } from '@/firebase/useStatistics'
import { MyFormatDateTime } from '@/utils/convert'

window.exportNoteFinance = null

export default {
	setup() {
		return {
			exportNoteArray,
			statisticArray,
		}
	},
	computed: {
		allStatistic() {
			const result = this.statisticArray.map(i => i)
			const currentMonthCost = this.exportNoteArray.reduce((acc, note) => {
				if (note.status === 'Success') {
					const c = note.finance.revenue - note.finance.profit
					acc += c
				}
				return acc
			}, 0)
			const currentMonthProfit = this.exportNoteArray.reduce((acc, note) => {
				if (note.status === 'Success') {
					acc += note.finance.profit
				}
				return acc
			}, 0)
			result.push({
				statisticID: MyFormatDateTime(new Date(), 'YYYY-MM'),
				cost: currentMonthCost,
				profit: currentMonthProfit,
			})
			result.sort((a, b) => {
				if (a.statisticID > b.statisticID) return 1
				if (a.statisticID < b.statisticID) return -1
				return 0
			})
			return result
		},
	},
	watch: {
		allStatistic(newValue) {
			this.$forceUpdate()
		},
	},
	mounted() {
		this.startDrawChart()
	},
	updated() {
		if (window.exportNoteFinance?.destroy) {
			window.exportNoteFinance.destroy()
		}
		this.startDrawChart()
	},
	methods: {
		startDrawChart() {
			const listGoodsName = this.allStatistic.map(item => item.statisticID)
			const listTotalCost = this.allStatistic.map(item => item.cost)
			const listTotalProfit = this.allStatistic.map(item => item.profit)
			const ctx = document.getElementById('export-note-finance').getContext('2d')
			window.exportNoteFinance = new Chart(ctx, {
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
							text: 'Doanh thu',
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
.export-note-finance-wrapper {
	max-width: 400px;
}
</style>
