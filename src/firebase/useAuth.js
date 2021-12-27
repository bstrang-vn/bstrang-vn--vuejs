import { ref } from 'vue'
import {
	getAuth,
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'

const auth = getAuth()
const getUser = ref(auth.currentUser)

onAuthStateChanged(auth, user => {
	getUser.value = user
})

const register = async (email, password) => {
	await createUserWithEmailAndPassword(auth, email, password)
}

const login = async (email, password) => {
	await signInWithEmailAndPassword(auth, email, password)
}

const logout = async () => {
	await signOut(auth)
}

export { getUser, register, login, logout }
