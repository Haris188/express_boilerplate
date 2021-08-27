
import Db from '../Db'

export const getUserWithEmail = async (email: string) => {
    const user = await Db.select('*').from('users').where('email', email)
        .catch(e => {
            console.log(e)
            return null
        })

    return user ? user[0] : null
}

export const getUserWithId = async (userId: string) => {
    const user = await Db.select('*').from('users').where('id', userId)
        .catch(e => {
            console.log(e)
            return null
        })

    return user ? user[0] : null
}

export const insertUser = async (userData) => {
    const foundUsers = await Db.select('id').from('users').where('email', userData.email)

    if (foundUsers.length > 0)
        return { userExists: true }

    const created = await Db('users').insert(userData, ['id'])
    return created[0]
}