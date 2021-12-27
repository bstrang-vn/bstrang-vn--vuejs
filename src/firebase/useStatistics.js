import { getFirestore, onSnapshot, collection, query } from 'firebase/firestore'
import { reactive, ref } from 'vue'

const statisticsList = reactive({})
const db = getFirestore()
const qr = query(collection(db, 'STATISTICS'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			statisticsList[change.doc.id] = change.doc.data()
		} else if (change.type === 'removed') {
			delete statisticsList[change.doc.id]
		}
	})
})

export { statisticsList }
