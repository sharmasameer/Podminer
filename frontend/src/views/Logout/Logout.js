import React from 'react'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../../context/userContext'

const Logout = () => {
    const { setUser } = React.useContext(UserContext)
    const history = useHistory()

    React.useEffect(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username_token')
        localStorage.removeItem('email_token')
        localStorage.removeItem('firstname_token')
        localStorage.removeItem('lastname_token')
        localStorage.removeItem('data_token')
        setUser(null)
        history.push('/top100')
    }, [])
    
    return null
}

export default Logout
