import axios from 'axios';
import React from 'react';
import {  useHistory} from 'react-router-dom';
import placeholderImage from '../../assets/img/asset0.png';
import { UserContext } from '../../context/userContext';
import Button from '../CustomButtons/Button';
import styles from './PodHeader.module.scss';

const PodHeader = (props) => {
    const { user, loadUserData } = React.useContext(UserContext)
    const history = useHistory()

    const followShow = () => {
        const token = localStorage.getItem("access_token");
        axios.post('/shows/followed', {
            id: props.id
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            console.log(res)
            loadUserData()
        })
        .catch(err => console.log(err))
    }

    const unfollowShow = () => {
        const token = localStorage.getItem("access_token");
        axios.delete('/shows/followed', {
            headers: {
                Authorization: "Bearer " + token
            },
            data: {
                id: props.id
            }
        })
        .then(res => {
            console.log(res)
            loadUserData()
        })
        .catch(err => console.log(err))
    }

    const adjustImage = image => {
        const newImg = image.slice(0, image.indexOf("170x170bb.png")) + "300x300bb.png"
        return newImg
    }

    let followedByUser

    if (user && user.shows_followed) {
        followedByUser = user.shows_followed.includes(props.id)
    }

    return (
        <div className={styles.PodHeader}>
            <img src={props.image ? adjustImage(props.image) : placeholderImage} alt="Logo" />
            <div className={styles.contentDiv}>
                <p className={styles.title}>{props.title}</p>
                {
                    user ? (
                        followedByUser ?
                            <Button color="warning" onClick={() => unfollowShow()}>Unfollow</Button> :
                            <Button color="primary" onClick={() => followShow()}>Follow</Button>
                    ) : (
                        null
                    )
                }
				<Button color="primary" onClick={props.exportPDF}>Save as PDF</Button>
                <Button color="primary" onClick={props.exportPPT}>Save as PPT</Button>
                <p className={styles.description}>{props.description}</p>
            </div>
        </div>
    )
}

export default PodHeader
