<template>
	<div class="export-note-finance-wrapper">
		<canvas id="export-note-finance" width="350" height="350"></canvas>
	</div>
</template>

<script>
import Chart from 'chart.js/auto'
import { exportNoteArray } from '@/firebase/useExportNote'

window.exportNoteFinance = null

export default {
	setup() {
		return { exportNoteArray }
	},
	computed: {
		totalRevenue() {
			return exportNoteArray.reduce((acc, note) => {
				if (note.status === 'Success') {
					acc += note.finance.revenue
				}
				return acc
			}, 0)
		},
		totalProfit() {
			return exportNoteArray.reduce((acc, note) => {
				if (note.status === 'Success') {
					acc += note.finance.profit
				}
				return acc
			}, 0)
		},
	},
	watch: {
		totalRevenue(newValue) {
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
			const that = this
			const getMonth = new Date().getMonth() + 1
			const ctx = document.getElementById('export-note-finance').getContext('2d')
			window.exportNoteFinance = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: ['Tiền Gốc', 'Tiền Lãi'],
					datasets: [
						{
							label: '# of Votes',
							data: [that.totalRevenue - that.totalProfit, that.totalProfit],
							backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)'],
							borderColor: ['rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)'],
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
							text: 'Doanh thu trong tháng ' + getMonth,
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
