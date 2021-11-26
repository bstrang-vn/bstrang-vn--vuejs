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
const importNoteList = reactive({})
const db = getFirestore()
const qr = query(
	collection(db, 'IMPORTNOTE'),
	where('updatedAt', '>', nowTime - 7 * 24 * 60 * 60 * 1000),
	orderBy('updatedAt', 'asc'),
	limit(10),
)

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			importNoteList[change.doc.id] = change.doc.data()
		}
		if (change.type === 'removed') {
			delete importNoteList[change.doc.id]
		}
	})
})

const startRealtimeImportNote = importNoteID => {
	const data = ref({
		importNoteID: '',
		provider: {
			providerID: '',
			providerName: '',
		},
		stockIn: {},
		shipping: { cost: '' },
		finance: { totalMoney: '' },
		status: '',
	})
	let unSubscribe = () => {}
	if (importNoteID) {
		unSubscribe = onSnapshot(doc(db, 'IMPORTNOTE', importNoteID), async noteDoc => {
			if (!noteDoc.exists()) return
			data.value = {
				importNoteID,
				...noteDoc.data(),
			}
		})
	}
	return { data, unSubscribe }
}

const addImportNotePending = async noteData => {
	const noteRef = await addDoc(collection(db, 'IMPORTNOTE'), {
		provider: noteData.provider,
		stockIn: noteData.stockIn,
		shipping: noteData.shipping,
		finance: noteData.finance,
		status: 'Pending',

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	return noteRef.id
}

const processImportNote = async noteID => {
	await runTransaction(db, async transaction => {
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
	if (noteData.status !== 'Pending') {
		throw new Error('You only can update import note in pending status')
	}

	const importNoteRef = doc(db, 'IMPORTNOTE', noteID)
	await setDoc(importNoteRef, {
		provider: noteData.provider,
		stockIn: noteData.stockIn,
		shipping: noteData.shipping,
		finance: noteData.finance,
		status: 'Pending',

		updatedAt: new Date().getTime(),
	})
	return noteID
}

const deleteImportNote = async noteID => {
	await deleteDoc(doc(db, 'IMPORTNOTE', noteID))
}

export {
	importNoteList,
	startRealtimeImportNote,
	addImportNotePending,
	processImportNote,
	refundImportNote,
	updateImportNotePending,
	deleteImportNote,
}
