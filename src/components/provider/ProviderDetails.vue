<template>
	<div>
		<div class="flex">
			<div class="w-10">Tên</div>
			<div class="w-3">:</div>
			<div>{{ provider.providerName }}</div>
		</div>
		<div class="flex">
			<div class="w-10">SĐT</div>
			<div class="w-3">:</div>
			<div>{{ provider.phone }}</div>
		</div>
		<div class="flex">
			<div class="w-10">Đ/c</div>
			<div class="w-3">:</div>
			<div>{{ provider.address }}</div>
		</div>
		<div>
			<a-button @click="$refs.modalProviderCreateModify.openModal(provider.providerID)">
				Edit
			</a-button>
			<ModalProviderCreateModify ref="modalProviderCreateModify" />
		</div>
	</div>

	<div class="mt-4 mb-1 font-bold">Danh sách phiếu nhập hàng</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th>Ngày</th>
				<th>Tổng tiền</th>
			</thead>
			<tbody>
				<tr
					v-if="
						!provider.importNoteList ||
							Object.keys(provider.importNoteList).length === 0
					"
				>
					<td class="text-center" colspan="4">No data available in table</td>
				</tr>
				<tr
					v-for="(noteData, noteID, noteIndex) in provider.importNoteList"
					:key="noteIndex"
					@click="$router.push({ name: 'ImportNote Details', params: { id: noteID } })"
				>
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td class="text-right">{{ formatDateTime(noteData.createdAt) }}</td>
					<td class="text-right font-bold">{{ noteData.finance.totalMoney }}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="flex justify-between mt-4">
		<a-button @click="$router.go(-1)">Back</a-button>
		<a-button @click="confirmDeleteProvider" :loading="loadingDeleteProvider" type="dashed">
			Delete
		</a-button>
	</div>
</template>

<script>
import { ref, createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { startRealtimeProvider, deleteProvider } from '@/firebase/useProvider'
import ModalProviderCreateModify from '@/components/common/ModalProviderCreateModify.vue'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { ModalProviderCreateModify },
	setup() {
		const route = useRoute()
		const realtimeProvider = startRealtimeProvider(route.params.id)
		return {
			provider: realtimeProvider.data,
			realtimeProvider,
			payDebtMoney: ref(0),
			loadingDeleteProvider: ref(false),
		}
	},
	unmounted() {
		this.realtimeProvider.unSubscribe()
	},
	methods: {
		async startDeleteProvider() {
			this.loadingDeleteProvider = true
			try {
				this.realtimeProvider.unSubscribe()
				await deleteProvider(this.provider.providerID)
				this.$router.push({ name: 'Provider List', params: {} })
				message.success('Delete provider success !!!', 2)
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingDeleteProvider = false
			}
		},
		confirmDeleteProvider() {
			if (this.provider.importNoteIDList.length > 0) {
				this.$notification.open({
					message: 'Lỗi !!!',
					description:
						'Phiếu nhập hàng của nhà cung cấp này vẫn tồn tại. Không thể xóa nhà cung cấp này',
					placement: 'topRight',
					duration: 5,
				})
				return
			}
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn xóa nhà cung cấp này ?',
				onOk() {
					that.startDeleteProvider()
				},
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>
