import {
	getFirestore,
	onSnapshot,
	collection,
	doc,
	addDoc,
	setDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	limit,
	runTransaction,
	increment,
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore'
import { ref, reactive } from 'vue'

const nowTime = new Date().getTime()
const exportNoteList = reactive({})
const db = getFirestore()
const qr = query(
	collection(db, 'EXPORTNOTE'),
	where('updatedAt', '>', nowTime - 7 * 24 * 60 * 60 * 1000),
	orderBy('updatedAt', 'asc'),
	limit(10),
)

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			exportNoteList[change.doc.id] = change.doc.data()
		}
		if (change.type === 'removed') {
			delete exportNoteList[change.doc.id]
		}
	})
})

const startRealtimeExportNote = exportNoteID => {
	const data = ref({
		exportNoteID: '',
		customer: {
			customerID: '',
			customerName: '',
		},
		stockOut: {},
		shipping: {
			cost: '',
			unit: 'Viettel Post',
			whoPays: '-',
		},
		payment: {
			alreadyPaid: 0,
			method: '',
		},
		finance: {
			revenue: 0,
			profit: 0,
		},
		state: '',
	})
	let unSubscribe = () => {}
	if (exportNoteID) {
		unSubscribe = onSnapshot(doc(db, 'EXPORTNOTE', exportNoteID), async noteDoc => {
			if (!noteDoc.exists()) return
			data.value = {
				exportNoteID,
				...noteDoc.data(),
			}
		})
	}
	return { data, unSubscribe }
}

const addExportNotePending = async noteData => {
	const noteRef = await addDoc(collection(db, 'EXPORTNOTE'), {
		customer: noteData.customer,
		stockOut: noteData.stockOut,
		shipping: noteData.shipping,
		payment: noteData.payment,
		finance: noteData.finance,
		status: 'Pending',

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	return noteRef.id
}

const processExportNote = async noteID => {
	await runTransaction(db, async transaction => {
		// transaction get export note
		const exportNoteRef = doc(db, 'EXPORTNOTE', noteID)
		const noteDoc = await transaction.get(exportNoteRef)
		if (!noteDoc.exists()) throw new Error('Document not exists')
		const { ...noteData } = noteDoc.data()
		if (noteData.status !== 'Pending') {
			throw new Error('Notes is not in pending status')
		}

		// transaction get all Goods Data
		const queryGoodsRefList = Object.keys(noteData.stockOut).map(goodsID =>
			transaction.get(doc(db, 'WAREHOUSE', goodsID)),
		)
		const goodsDocList = await Promise.all(queryGoodsRefList)

		// transaction update stock avail in every goods in warehouse
		goodsDocList.forEach(goodsDoc => {
			const { stockAvail, goodsName } = goodsDoc.data() || {}
			Object.entries(noteData.stockOut[goodsDoc.id]).forEach(([batch, { quantity }]) => {
				if (!stockAvail[batch]) {
					throw new Error(`${goodsName} with ${batch} are not available in warehouse`)
				}
				if (stockAvail[batch].quantity < quantity) {
					throw new Error(
						`${goodsName} available is ${stockAvail[batch].quantity}. But, you have just export ${quantity}`,
					)
				}
				if (stockAvail[batch].quantity === quantity) {
					delete stockAvail[batch]
					return
				}
				stockAvail[batch].quantity -= quantity
			})
			transaction.update(doc(db, 'WAREHOUSE', goodsDoc.id), {
				stockAvail,
				exportNoteIDList: arrayUnion(noteID),
			})
		})

		// transaction update customer
		transaction.update(doc(db, 'CUSTOMER', noteData.customer.customerID), {
			exportNoteIDList: arrayUnion(noteID),
			'finance.debt': increment(noteData.finance.revenue - noteData.payment.alreadyPaid),
		})

		transaction.update(exportNoteRef, {
			status: 'Success',
		})
	})
}

const refundExportNote = async noteID => {
	await runTransaction(db, async transaction => {
		const exportNoteRef = doc(db, 'EXPORTNOTE', noteID)
		const noteDoc = await transaction.get(exportNoteRef)
		if (!noteDoc.exists()) throw new Error('Document not exists')
		const { ...noteData } = noteDoc.data()
		if (noteData.status !== 'Success') {
			throw new Error('Notes is not in success status')
		}
		Object.entries(noteData.stockOut).forEach(([goodsID, batch]) => {
			const listBatchUpdate = {}
			Object.entries(batch).forEach(([batchKey, { quantity }]) => {
				const each = 'stockAvail.' + batchKey + '.quantity'
				listBatchUpdate[each] = increment(quantity)
			})
			transaction.update(doc(db, 'WAREHOUSE', goodsID), {
				...listBatchUpdate,
				exportNoteIDList: arrayRemove(noteID),
			})
		})

		transaction.update(doc(db, 'CUSTOMER', noteData.customer.customerID), {
			exportNoteIDList: arrayRemove(noteID),
			'finance.debt': increment(noteData.payment.alreadyPaid - noteData.finance.revenue),
		})
		transaction.update(exportNoteRef, {
			status: 'Pending',
		})
	})
}

const updateExportNotePending = async (noteID, noteData) => {
	if (noteData.status !== 'Pending') {
		throw new Error('You only can update import note in pending status')
	}
	const exportNoteRef = doc(db, 'EXPORTNOTE', noteID)
	await setDoc(exportNoteRef, {
		customer: noteData.customer,
		stockOut: noteData.stockOut,
		shipping: noteData.shipping,
		payment: noteData.payment,
		finance: noteData.finance,
		status: 'Pending',

		updatedAt: new Date().getTime(),
	})
	return noteID
}

const payDebtExportNote = async (noteID, number) => {
	await runTransaction(db, async transaction => {
		// transaction get export note
		const exportNoteRef = doc(db, 'EXPORTNOTE', noteID)
		const noteDoc = await transaction.get(exportNoteRef)
		if (!noteDoc.exists()) throw new Error('Document not exists')
		const { ...noteData } = noteDoc.data()
		if (noteData.status !== 'Success') {
			throw new Error('Notes is not in success status')
		}

		transaction.update(exportNoteRef, {
			'payment.alreadyPaid': increment(number),
		})
		transaction.update(doc(db, 'CUSTOMER', noteData.customer.customerID), {
			'finance.debt': increment(0 - number),
		})
	})
}

const deleteExportNote = async noteID => {
	await deleteDoc(doc(db, 'EXPORTNOTE', noteID))
}
export {
	exportNoteList,
	startRealtimeExportNote,
	addExportNotePending,
	processExportNote,
	refundExportNote,
	updateExportNotePending,
	payDebtExportNote,
	deleteExportNote,
}
