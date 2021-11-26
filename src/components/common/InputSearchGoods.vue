<template>
	<div class="w-full relative">
		<InputAutoComplete
			:searchText="searchText"
			:dataSource="convertGoodList"
			:filterData="logicFilter"
			@searching="handleSearching"
			@selectItem="handleSelectItem"
		>
			<template v-slot:each="{ item: { goodsName, unit, quantity }, key: batch }">
				<p class="font-bold m-0">{{ goodsName }}</p>
				<p class="m-0">
					{{ formatDateTime(Number(batch.split('-')[1])) }}
					- {{ formatNumber(batch.split('-')[2]) }}/{{ unit }} - {{ quantity }}
				</p>
			</template>
		</InputAutoComplete>
		<div class="absolute right-2 top-1/4">
			<CheckCircleOutlined v-if="goodsID" style="color: blue" />
			<CloseCircleOutlined v-else style="color: #f5222d" />
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { goodsList } from '@/firebase/useWarehouse'
import InputAutoComplete from '@/components/common/InputAutoComplete.vue'
import { MyFormatDateTime, MyFormatNumber, MySearch } from '@/utils/convert'

export default {
	props: ['searchText'],
	components: { InputAutoComplete, CheckCircleOutlined, CloseCircleOutlined },
	setup() {
		return {
			goodsID: ref(''),
			goodsList,
		}
	},
	computed: {
		convertGoodList() {
			const data = {}
			Object.entries(this.goodsList).forEach(([goodsID, { stockAvail, ...goodsData }]) => {
				if (Object.keys(stockAvail).length === 0) {
					data[`${goodsID}-NaN-0`] = {
						...goodsData,
						quantity: 0,
					}
				} else {
					Object.entries(stockAvail).forEach(([batch, q]) => {
						data[`${goodsID}-${batch}`] = {
							...goodsData,
							quantity: q ? q.quantity : 0,
						}
					})
				}
			})
			return data
		},
	},
	methods: {
		handleSearching(string) {
			this.$emit('update:searchText', string)
			this.$emit('searching', string)
			this.goodsID = ''
		},
		handleSelectItem({ key, value }) {
			this.$emit('update:searchText', value.goodsName)
			this.$emit('selectItem', {
				goodsID: key.split('-')[0] || '',
				expiryDate: Number(key.split('-')[1]) || 'NaN',
				costPrice: Number(key.split('-')[2]) || 'NaN',
			})
			this.goodsID = key.split('-')[0] || ''
		},
		logicFilter(item, key) {
			return MySearch(item.goodsName, this.searchText)
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
		formatNumber(number) {
			return MyFormatNumber(number, 3)
		},
	},
}
</script>
