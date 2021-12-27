<template>
	<h1 class="title-content">Thống Kê</h1>
	<div>
		<WarehouseChart />
	</div>
	<div>
		<ExportNoteFinance />
	</div>
	<div>
		<BestSelling />
	</div>
</template>

<script>
import ExportNoteFinance from '@/components/statistics/ExportNoteFinance.vue'
import WarehouseChart from '@/components/statistics/WarehouseChart.vue'
import BestSelling from '@/components/statistics/BestSelling.vue'

export default {
	components: { ExportNoteFinance, WarehouseChart, BestSelling },
}
</script>

<style></style>
