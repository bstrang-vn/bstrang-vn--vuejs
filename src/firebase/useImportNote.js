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
const importNoteArray = reactive([])
const db = getFirestore()
const qr = query(collection(db, 'IMPORTNOTE'), where('updatedAt', '>', firstDayOfMonth), orderBy('updatedAt', 'asc'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		const newNote = {
			...change.doc.data(),
			importNoteID: change.doc.id,
		}
		const noteIndex = importNoteArray.findIndex(item => item.importNoteID === change.doc.id)
		if (change.type === 'added') {
			importNoteArray.unshift(newNote)
		} else if (change.type === 'modified') {
			importNoteArray.splice(noteIndex, 1, newNote)
		} else if (change.type === 'removed') {
			importNoteArray.splice(noteIndex, 1)
		}
	})
})

const startRealtimeImportNote = importNoteID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'IMPORTNOTE', importNoteID), async noteDoc => {
		if (!noteDoc.exists()) return
		data.value = {
			...noteDoc.data(),
			importNoteID,
		}
	})
	return { data, unSubscribe }
}

const getImportNoteById = async noteID => {
	if (!noteID) throw new Error('ID must not be empty')
	const noteRef = doc(db, 'IMPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (!noteSnap.exists()) throw new Error('ImportNote not found !!!')
	return {
		...noteSnap.data(),
		importNoteID: noteSnap.id,
	}
}

const getImportNoteList = async noteIDList => {
	const queryImportNoteList = noteIDList.map(noteID => getDoc(doc(db, 'IMPORTNOTE', noteID)))
	const importNoteSnapList = await Promise.all(queryImportNoteList)
	return importNoteSnapList.map(noteSnap => ({
		...noteSnap.data(),
		importNoteID: noteSnap.id,
	}))
}

const addImportNotePending = async noteData => {
	const noteID = MyFormatDateTime(new Date(), 'YY-MM-DD-HH-mm-ss')
	const noteRef = doc(db, 'IMPORTNOTE', noteID)
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

const processImportNote = async noteID => {
	await runTransaction(db, async transaction => {
		// transaction get import note
		const importNoteRef = doc(db, 'IMPORTNOTE', noteID)
		const noteDoc = await transaction.get(importNoteRef)
		if (!noteDoc.exists()) throw new Error('Document not exists')
		const { ...noteData } = noteDoc.data()
		if (noteData.status !== 'Pending') {
			throw new Error('Notes is not in pending status')
		}

		// transaction get all Goods Data
		Object.entries(noteData.stockIn).forEach(([goodsID, batch]) => {
			const listBatchUpdate = {}
			Object.entries(batch).forEach(([batchKey, { quantity }]) => {
				const each = 'stockAvail.' + batchKey + '.quantity'
				listBatchUpdate[each] = increment(quantity)
			})
			transaction.update(doc(db, 'WAREHOUSE', goodsID), {
				...listBatchUpdate,
				importNoteIDList: arrayUnion(importNoteRef.id),
			})
		})

		// transaction update provider
		transaction.update(doc(db, 'PROVIDER', noteData.provider.providerID), {
			importNoteIDList: arrayUnion(noteID),
		})

		transaction.update(importNoteRef, {
			status: 'Success',
		})
	})
}

const refundImportNote = async noteID => {
	await runTransaction(db, async transaction => {
		const importNoteRef = doc(db, 'IMPORTNOTE', noteID)
		const noteDoc = await transaction.get(importNoteRef)
		if (!noteDoc.exists()) throw new Error('Document not exists')
		const { ...noteData } = noteDoc.data()
		if (noteData.status !== 'Success') {
			throw new Error('Notes is not in success status')
		}

		// transaction get all Goods Data
		const queryGoodsRefList = Object.keys(noteData.stockIn).map(goodsID =>
			transaction.get(doc(db, 'WAREHOUSE', goodsID)),
		)
		const goodsDocList = await Promise.all(queryGoodsRefList)

		// transaction update stock avail in every goods in warehouse
		goodsDocList.forEach(goodsDoc => {
			const { stockAvail, goodsName } = goodsDoc.data() || {}
			Object.entries(noteData.stockIn[goodsDoc.id]).forEach(([batch, { quantity }]) => {
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
				importNoteIDList: arrayRemove(noteID),
			})
		})

		transaction.update(doc(db, 'PROVIDER', noteData.provider.providerID), {
			importNoteIDList: arrayRemove(noteID),
		})
		transaction.update(importNoteRef, {
			status: 'Pending',
		})
	})
}

const updateImportNotePending = async (noteID, noteData) => {
	if (!noteID) throw new Error('ID must not be empty')
	const noteRef = doc(db, 'IMPORTNOTE', noteID)
	const noteSnap = await getDoc(noteRef)
	if (!noteSnap.exists()) throw new Error('ImportNote not found !!!')
	if (noteSnap.data().status !== 'Pending') throw new Error('Notes is not in pending status')

	await updateDoc(noteRef, {
		...noteData,
		updatedAt: new Date().getTime(),
	})
	return noteID
}

const deleteImportNote = async noteID => {
	await deleteDoc(doc(db, 'IMPORTNOTE', noteID))
}

export {
	importNoteArray,
	startRealtimeImportNote,
	getImportNoteById,
	getImportNoteList,
	addImportNotePending,
	processImportNote,
	refundImportNote,
	updateImportNotePending,
	deleteImportNote,
}
