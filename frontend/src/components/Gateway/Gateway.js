import React from 'react'
import Button from "../CustomButtons/Button.js";
import styles from './Gateway.module.scss'
import { Lock } from '@material-ui/icons'
import { useHistory } from 'react-router-dom'

const Gateway = props => {
    const history = useHistory()
    return (
        <div className={`${styles.memberCard} ${props.small ? styles.small : null}`}>
            <div className={styles.lockDiv}>
                <Lock style={{color: 'white', fontSize: '2rem'}} />
            </div>
            <p className={styles.memberCardTitle}>Become a member to unlock content!</p>
            <p className={styles.memberCardDesc}>Podminer members get complete access to in depth podcast data.</p>
            <Button color="primary" className={styles.buttonEl} onClick={() => history.push('/login')}>Login</Button>
        </div>
    )
}

export default Gateway