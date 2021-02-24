import { Button, FormControl, IconButton, Input, InputAdornment, InputLabel, Snackbar } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';
import axios from 'axios';
import React from 'react';
import Helmet from 'react-helmet';
import { useHistory, useParams } from 'react-router-dom';
import styles from '../Login.module.scss';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const ForgotPassword = () => {
    const { uid, token } = useParams()
    const [loading, setLoading] = React.useState(true)
    const [message, setMessage] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const [alertColor, setAlertColor] = React.useState("") 

    const history = useHistory();

    React.useEffect(() => {
        setLoading(true)
        axios.get(`/auth/reset-password/validate/${uid}/${token}/`)
        .then(res => {
            setLoading(false)
        })
        .catch(err => {
            setLoading(false)
        })
    }, [])

    const handlePasswordChange = e => {
        e.preventDefault()
        if(password.length){
            axios.patch('/auth/reset-password/confirm', {
                password: password,
                token: token,
                uidb64: uid
            })
            .then(res => {
                setMessage("Login with new password to get started!")
                setAlertColor("sucess")
                setSnackOpen(true)
                history.push('/login')
            })
            .catch(err => {
                setMessage("Invalid link. Please try again later")
                setAlertColor("error")
                setSnackOpen(true)
            })
        }
        else{
            setMessage("Please enter a valid password!")
            setAlertColor("error")
            setSnackOpen(true)
        }
    }

    return (
        <div className={styles.Login}>
            <div className={styles.wrapper}>
                <Helmet>
                    <title>Forgot Password | Podminer</title>
                    <meta name="description" content="Forgot Password | Podminer" />

                    <meta name="og:title" property="og:title" content=" Forgot Psssword "></meta>
                    <meta name="og:description" property="og:description" content=" Forgot Your Password- Podminer"></meta>
                    <meta property="og:url" content="http://www.podminer.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                
                    <meta name="og:image:alt" content="Podminer Logo" />
				    <meta property="og:site_name" content="Podminer, Pikkal & Co." /> 
                </Helmet>
                {
                    loading ?
                        (
                            <div className={styles.loaderDiv}>
                                <CircularProgress color='primary' />
                            </div>
                        ) :
                        (
                            <>
                                <div className={styles.imgDiv}></div>
                                <form onSubmit={handlePasswordChange}>
                                    <div className={styles.contentDiv}>
                                        <p>Confirm new password</p>
                                        <FormControl className={styles.input} style={{ marginTop: "1em" }}>
                                            <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                                            <Input
                                                id="standard-adornment-password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                autoComplete="false"
                                                onChange={e => setPassword(e.target.value)}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={() => setShowPassword(true)}
                                                            onMouseDown={e => e.preventDefault()}
                                                        >
                                                            {password.showPassword ? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                        <Button type="submit" variant="contained" className={styles.button}>Confirm Password</Button>
                                    </div>
                                </form>
                            </>
                        )
                }
            </div>
            <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)}>
                <Alert onClose={() => setSnackOpen(false)} severity={alertColor}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ForgotPassword
