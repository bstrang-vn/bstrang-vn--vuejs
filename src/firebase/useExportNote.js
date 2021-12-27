import {
	getFirestore,
	onSnapshot,
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	runTransaction,
	increment,
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore'
import { ref, reactive } from 'vue'
import { MyFormatDateTime } from '@/utils/convert'

const getYear = new Date().getFullYear()
const getMonth = new Date().getMonth() + 1
const firstDayOfMonth = new Date(getYear + '-' + getMonth).getTime()
const exportNoteArray = reactive([])
const db = getFirestore()
const qr = query(collection(db, 'EXPORTNOTE'), where('updatedAt', '>', firstDayOfMonth), orderBy('updatedAt', 'asc'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		const newNote = {
			...change.doc.data(),
			exportNoteID: change.doc.id,
		}
		const noteIndex = exportNoteArray.findIndex(item => item.exportNoteID === change.doc.id)
		if (change.type === 'added') {
			exportNoteArray.unshift(newNote)
		} else if (change.type === 'modified') {
			exportNoteArray.splice(noteIndex, 1, newNote)
		} else if (change.type === 'removed') {
			exportNoteArray.splice(noteIndex, 1)
		}
	})
})

const startRealtimeExportNote = exportNoteID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'EXPORTNOTE', exportNoteID), async noteDoc => {
		if (!noteDoc.exists()) return
		data.value = {
			...noteDoc.data(),
			exportNoteID,
		}
	})
	return { data, unSubscribe }
}

const getExportNoteById = async noteID => {
	if (!noteID) throw new Error('ID must not be empty')
	const noteRef = doc(db, 'EXPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (!noteSnap.exists()) throw new Error('ExportNote not found !!!')
	return {
		...noteSnap.data(),
		exportNoteID: noteSnap.id,
	}
}

const getExportNoteList = async noteIDList => {
	const queryExportNoteList = noteIDList.map(noteID => getDoc(doc(db, 'EXPORTNOTE', noteID)))
	const exportNoteSnapList = await Promise.all(queryExportNoteList)
	return exportNoteSnapList.map(noteSnap => ({
        ...noteSnap.data(),
		exportNoteID: noteSnap.id,
	}))
}

const addExportNotePending = async noteData => {
	const noteID = MyFormatDateTime(new Date(), 'YY-MM-DD-HH-mm-ss')
	const noteRef = doc(db, 'EXPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (noteSnap.exists()) throw new Error('Phiếu nhập này đã tồn tại')

	await setDoc(noteRef, {
		...noteData,
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
			'finance.debt': increment(noteData.finance.debt),
		})

		transaction.update(exportNoteRef, {
			status: 'Success',
			updatedAt: new Date().getTime(),
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
			'finance.debt': increment(0 - noteData.finance.debt),
		})
		transaction.update(exportNoteRef, {
			status: 'Pending',
			updatedAt: new Date().getTime(),
		})
	})
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
			'finance.debt': increment(0 - number),
		})
		transaction.update(doc(db, 'CUSTOMER', noteData.customer.customerID), {
			'finance.debt': increment(0 - number),
		})
	})
}

const updateExportNotePending = async (noteID, noteData) => {
	if (!noteID) throw new Error('ID must not be empty')
	const noteRef = doc(db, 'EXPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (!noteSnap.exists()) throw new Error('ExportNote not found !!!')
	if (noteSnap.data().status !== 'Pending') throw new Error('Notes is not in pending status')

	await updateDoc(noteRef, {
		...noteData,
		updatedAt: new Date().getTime(),
	})
	return noteID
}

const deleteExportNote = async noteID => {
	if (!noteID) throw new Error('ID must not be empty')
	const noteRef = doc(db, 'EXPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (!noteSnap.exists()) throw new Error('ExportNote not found !!!')
	if (noteSnap.data().status !== 'Pending') throw new Error('Notes is not in pending status')

	await deleteDoc(doc(db, 'EXPORTNOTE', noteID))
}

const getExportNoteListHasDebtByCustomerID = async customerID => {
	const queryNoteList = query(
		collection(db, 'EXPORTNOTE'),
		where('customer.customerID', '==', customerID),
		where('status', '==', 'Success'),
		where('finance.debt', '>', 0),
	)
	const exportNoteSnapList = await getDocs(queryNoteList)
	const noteListHasDebt = []
	exportNoteSnapList.forEach(noteSnap => {
		noteListHasDebt.push({ exportNoteID: noteSnap.id, ...noteSnap.data() })
	})
	return noteListHasDebt
}
export {
	exportNoteArray,
	getExportNoteList,
	getExportNoteListHasDebtByCustomerID,
	startRealtimeExportNote,
	getExportNoteById,
	addExportNotePending,
	processExportNote,
	refundExportNote,
	updateExportNotePending,
	payDebtExportNote,
	deleteExportNote,
}
