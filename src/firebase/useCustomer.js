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
	increment,
} from 'firebase/firestore'
import { reactive, ref } from 'vue'

const customerList = reactive({})
const db = getFirestore()
const qr = query(collection(db, 'CUSTOMER'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			customerList[change.doc.id] = change.doc.data()
		} else if (change.type === 'removed') {
			delete customerList[change.doc.id]
		}
	})
})

const startRealtimeCustomer = customerID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'CUSTOMER', customerID), async customerDoc => {
		if (!customerDoc.exists()) return
		const { exportNoteIDList } = customerDoc.data()

		const getExportNoteList = exportNoteIDList.map(noteID =>
			getDoc(doc(db, 'EXPORTNOTE', noteID)),
		)
		const exportNoteSnapList = await Promise.all(getExportNoteList)

		const exportNoteList = {}
		exportNoteSnapList.forEach(noteSnap => {
			exportNoteList[noteSnap.id] = noteSnap.data()
		})

		data.value = {
			customerID,
			...customerDoc.data(),
			exportNoteList,
		}
	})
	return { data, unSubscribe }
}

const getCustomer = async customerID => {
	const customerRef = doc(db, 'CUSTOMER', customerID)
	const customerSnap = await getDoc(customerRef)
	if (!customerSnap.exists()) return {}
	const { customerName, phone, address, finance, exportNoteIDList } = customerSnap.data()
	return {
		customerID,
		customerName,
		phone,
		address,
		finance,
		exportNoteIDList,
	}
}

const addCustomer = async data => {
	const customerRef = await addDoc(collection(db, 'CUSTOMER'), {
		customerName: data.customerName,
		phone: data.phone,
		address: data.address,
		finance: { debt: 0, payDebt: {} },
		exportNoteIDList: {},

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const customer = await getCustomer(customerRef.id)
	return customer
}

const updateCustomer = async (customerID, customerData) => {
	const customerRef = doc(db, 'CUSTOMER', customerID)
	await updateDoc(customerRef, {
		customerName: customerData.customerName,
		phone: customerData.phone,
		address: customerData.address,

		updatedAt: new Date().getTime(),
	})

	const customer = await getCustomer(customerRef.id)
	return customer
}

const addPayDebt = async (customerID, money) => {
	const customerRef = doc(db, 'CUSTOMER', customerID)
	const payDebtTime = `finance.payDebt.${new Date().getTime()}`
	await updateDoc(customerRef, {
		'finance.debt': increment(0 - money),
		[payDebtTime]: money,
	})
}

const deleteCustomer = async customerID => {
	await deleteDoc(doc(db, 'CUSTOMER', customerID))
	return customerID
}

export {
	customerList,
	startRealtimeCustomer,
	getCustomer,
	addCustomer,
	updateCustomer,
	addPayDebt,
	deleteCustomer,
}
