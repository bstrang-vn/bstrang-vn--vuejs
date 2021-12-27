import {
	getFirestore,
	onSnapshot,
	collection,
	doc,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
} from 'firebase/firestore'
import { reactive, ref } from 'vue'

const providerArray = reactive([])
const db = getFirestore()
const qr = query(collection(db, 'PROVIDER'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		const newProvider = {
			providerID: change.doc.id,
			...change.doc.data(),
		}
		const providerIndex = providerArray.findIndex(item => item.providerID === change.doc.id)
		if (change.type === 'added') {
			providerArray.push(newProvider)
		} else if (change.type === 'modified') {
			providerArray.splice(providerIndex, 1, newProvider)
		} else if (change.type === 'removed') {
			providerArray.splice(providerIndex, 1)
		}
	})
})

const startRealtimeProvider = providerID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'PROVIDER', providerID), async providerDoc => {
		if (!providerDoc.exists()) return
		data.value = {
			providerID,
			...providerDoc.data(),
		}
	})
	return { data, unSubscribe }
}

const getProvider = async providerID => {
	const providerRef = doc(db, 'PROVIDER', providerID)
	const providerSnap = await getDoc(providerRef)
	if (!providerSnap.exists()) return {}
	const { providerName, phone, address, importNoteIDList } = providerSnap.data()
	return {
		providerID,
		providerName,
		phone,
		address,
		importNoteIDList,
	}
}

const addProvider = async data => {
	const providerRef = await addDoc(collection(db, 'PROVIDER'), {
		providerName: data.providerName,
		phone: data.phone,
		address: data.address,
		importNoteIDList: [],

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const provider = await getProvider(providerRef.id)
	return provider
}

const updateProvider = async (providerID, providerData) => {
	const providerRef = doc(db, 'PROVIDER', providerID)
	await updateDoc(providerRef, {
		providerName: providerData.providerName,
		phone: providerData.phone,
		address: providerData.address,

		updatedAt: new Date().getTime(),
	})

	const provider = await getProvider(providerRef.id)
	return provider
}

const deleteProvider = async providerID => {
	await deleteDoc(doc(db, 'PROVIDER', providerID))
	return providerID
}

export {
	providerArray,
	startRealtimeProvider,
	addProvider,
	deleteProvider,
	updateProvider,
	getProvider,
}
