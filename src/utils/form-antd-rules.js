export const checkEmail = async (rule, value) => {
    if (!value) {
        return Promise.reject(new Error('Please input the email'))
    }
    if (!value.includes('@gmail.com')) {
        return Promise.reject(new Error('Email must be includes "@gmail.com"'))
    }
    return Promise.resolve()
}

export const checkPassword = async (rule, value) => {
    if (!value) {
        return Promise.reject(new Error('Please input the password'))
    }
    if (value.length < 6) {
        return Promise.reject(new Error('Password must be at least 6 characters'))
    }
    return Promise.resolve()
}

export const checkPhone = async (rule, value) => {
    if (!value) {
        return Promise.reject(new Error('Please input the phone number'))
    }
    if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(value)) {
        return Promise.reject(new Error('This field must be a number of your phone'))
    }
    return Promise.resolve()
}

export const checkCheckboxTerms = async (rule, value) => {
    if (!value) {
        return Promise.reject(new Error('You must agree to the terms and conditions'))
    }
    return Promise.resolve()
}
