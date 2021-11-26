import { ref } from 'vue'
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'

const signPending = ref(false)
const signFailed = ref(null)
const auth = getAuth()
const getUser = ref(auth.currentUser)

onAuthStateChanged(auth, user => {
    getUser.value = user
})

const register = async (email, password) => {
    try {
        signFailed.value = null
        signPending.value = true
        await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
        signFailed.value = error.message
    } finally {
        signPending.value = false
    }
}

const login = async (email, password) => {
    try {
        signFailed.value = null
        signPending.value = true
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        signFailed.value = error.message
    } finally {
        signPending.value = false
    }
}

const logout = async () => {
    try {
        signFailed.value = null
        signPending.value = true
        await signOut(auth)
    } catch (error) {
        signFailed.value = error.message
    } finally {
        signPending.value = false
    }
}

export { getUser, register, login, logout, signPending, signFailed }
