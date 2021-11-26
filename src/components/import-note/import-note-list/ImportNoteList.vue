<template>
	<div class="flex justify-end mb-2">
		<a-button
			type="primary"
			@click="$router.push({ name: 'ImportNote Create Modify', params: {} })"
		>
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo Phiếu Nhập Thuốc Mới
		</a-button>
	</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<tr>
					<th rowspan="2">#</th>
					<th rowspan="2">Nguồn</th>
					<th colspan="2">Hàng Nhập</th>
					<th rowspan="2">Tổng</th>
					<th rowspan="2">Ngày</th>
				</tr>
				<tr>
					<th>Tên</th>
					<th>SL</th>
				</tr>
			</thead>
			<tbody style="text-align:right">
				<tr v-if="Object.keys(importNoteList).length === 0">
					<td colspan="10" style="text-align:center">No data available in table</td>
				</tr>
				<template v-for="(note, noteID, noteIndex) in importNoteList" :key="noteIndex">
					<tr
						v-for="(stock, goodsID, stockIndex) in note.stockIn"
						:key="stockIndex"
						@click="
							$router.push({ name: 'ImportNote Details', params: { id: noteID } })
						"
						:style="note.status === 'Pending' ? 'opacity: 0.7' : ''"
					>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ noteIndex + 1 }}
						</td>
						<td
							v-if="stockIndex === 0"
							:rowspan="Object.keys(note.stockIn).length"
							style="text-align:left"
						>
							{{ note.provider?.providerName || '-' }}
						</td>
						<td style="text-align:left">{{ goodsList[goodsID]?.goodsName || '-' }}</td>
						<td>
							<p v-for="({ quantity }, batch, index) in stock" :key="index">
								{{ quantity }}
							</p>
						</td>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ note.finance?.totalMoney }}
						</td>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ formatDateTime(note.createdAt) }}
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	</div>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { importNoteList } from '@/firebase/useImportNote'
import { goodsList } from '@/firebase/useWarehouse'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { PlusOutlined },
	setup() {
		return { importNoteList, goodsList }
	},
	methods: {
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>

<style lang="scss" scoped>
.wrapper-table {
	overflow-x: scroll;
}
</style>
