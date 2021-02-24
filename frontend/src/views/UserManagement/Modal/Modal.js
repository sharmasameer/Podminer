import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import React from 'react'
import styles from './Modal.module.scss'

const Modal = props => {
    const [info, setInfo] = React.useState({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        role: 'user'
    })

    React.useEffect(() => {

        setInfo({
            ...info,
            id: props.data?.id,
            username: props.data?.username,
            firstName: props.data?.first_name,
            lastName: props.data?.last_name,
            email: props.data?.email,
            password: props.data?.password,
            role: props.data?.is_staff ? "admin" : "user"
        })
    }, [props.data])

    const inputChangedHandler = e => {
        if(e.target.value === "user" || e.target.value === "admin"){
            setInfo({
                ...info,
                role: e.target.value
            })
        }
        else{
            setInfo({
                ...info,
                [e.target.id]: e.target.value,
            })
        }
    }

    const handleSubmit = () => {
        setInfo({
            ...info,
            username: '',
            firstName: '',
            lastName: '',
            password: '',
            email: '',
            role: 'user'
        })
        const user = {
            id: info.id,
            username: info.username,
            firstName: info.firstName,
            lastName: info.lastName,
            password: info.password,
            email: info.email,
            admin: info.role === "admin" ? true : false,
            deleteUser: user => props.deleteUser(user)
        }
        props.addUser(user);
        props.onModalClose();
    }

    return (
            props.open ? 
                (
                    <>
                        <div className={styles.Modal}>
                            <div className={styles.ModalContainer}>
                                <p>{props.update ? "Update User" : "Add a New User" }</p>
                                <TextField id="username" label="Username" variant="outlined" className={styles.Input} value={info.username} onChange={inputChangedHandler}/>
                                <TextField id="password" label="Password" variant="outlined" type="password" className={styles.Input} value={info.password} onChange={inputChangedHandler}/>
                                <TextField id="firstName" label="First Name" variant="outlined" className={styles.Input} value={info.firstName} onChange={inputChangedHandler}/>
                                <TextField id="lastName" label="Last Name" variant="outlined" className={styles.Input} value={info.lastName} onChange={inputChangedHandler}/>
                                <TextField id="email" label="Email" variant="outlined" className={styles.Input} value={info.email} onChange={inputChangedHandler}/>
                                <FormControl className={styles.Input}>
                                    <InputLabel id="role">Role</InputLabel>
                                    <Select
                                        id="role"
                                        name="role"
                                        value={info.role}
                                        onChange={inputChangedHandler}
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                    </Select>
                                </FormControl>
                                <div className={styles.ButtonDiv}>
                                    {
                                        info.username && info.firstName && info.lastName && info.password ?
                                            props.update ? 
                                                <Button color="primary" className={styles.buttonEl} onClick={handleSubmit}>Update User</Button>
                                            :
                                                <Button color="primary" className={styles.buttonEl} onClick={handleSubmit}>Add User</Button>
                                        :   props.update ? 
                                                <Button color="primary" className={styles.buttonEl} disabled>Update User</Button>
                                            :
                                                <Button color="primary" className={styles.buttonEl} disabled>Add User</Button>
                                    }
                                    <Button color="danger" className={styles.buttonEl} onClick={props.onModalClose} >Cancel</Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) :
                null        
    )
}

export default Modal
