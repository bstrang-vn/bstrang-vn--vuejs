<template>
	<h1 class="title-content">Thống Kê</h1>
	<div>
		<WarehouseChart />
	</div>
	<div>
		<ExportNoteFinance />
	</div>
</template>

<script>
import ExportNoteFinance from '@/components/home/ExportNoteFinance.vue'
import WarehouseChart from '@/components/home/WarehouseChart.vue'

export default {
	components: { ExportNoteFinance, WarehouseChart },
}
</script>

<style></style>
