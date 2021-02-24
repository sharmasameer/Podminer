import { Button, FormControl, IconButton, Input, InputAdornment, InputLabel, Snackbar, TextField } from '@material-ui/core'
import { Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@material-ui/icons'
import MuiAlert from '@material-ui/lab/Alert'
import axios from 'axios'
import React from 'react'
import Helmet from 'react-helmet'
import { useHistory } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import styles from './Login.module.scss'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Login = () => {
    const { setUser } = React.useContext(UserContext)
    const [password, setPassword] = React.useState({
        value: '',
        showPassword: false
    })
    const [email, setEmail] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [message, setMessage] = React.useState('');
    const [forgotPassword, setForgotPassword] = React.useState(false)
    const [alertColor, setAlertColor] = React.useState("") 
    const history = useHistory();

    const handleClick = e => {
        e.preventDefault()
        if (email && password.value) {
            axios.post('/auth/token/', {
                username: email,
                password: password.value
            })
            .then(res => {
                console.log(res.data)
                localStorage.setItem('access_token', res.data.access)
                localStorage.setItem('refresh_token', res.data.refresh)
                localStorage.setItem('username_token', res.data.username)
                localStorage.setItem('email_token', res.data.email)
                localStorage.setItem('firstname_token', res.data.first_name)
                localStorage.setItem('lastname_token', res.data.last_name)
                localStorage.setItem('data_token', res.data)
                setUser(res.data)
                history.push('/top100')
                window.location.reload()
            })
            .catch(err => {
                setMessage("Invalid credentials!")
                setAlertColor("error")
                setSnackOpen(true)
            })
        } else {
            if (email.length === 0) {
                setMessage('Email is required!');
                setAlertColor("error")
                setSnackOpen(true);
            }
            else if (password.value.length === 0) {
                setMessage('Password is required!');
                setAlertColor("error")
                setSnackOpen(true);
            }
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };

    const handleForgotPassword = e => {
        e.preventDefault()
        setForgotPassword(!forgotPassword)
    }

    const handlePasswordChange = e => {
        e.preventDefault()
        if(email.length){
            setEmail("")
            axios.post('/auth/reset-password', {
                email: email,
                url: window.location.href
            })
            .then(res => {
                console.log(res.data)
                setMessage("Please check your inbox for the password update email")
                setAlertColor("info")
                setSnackOpen(true)
                handleForgotPassword(e)
            })
            .catch(err => {
                if(err.response.status === 400){
                    setMessage("User with the given email ID does not exist. Please enter a valid email ID!")
                    setAlertColor("error")
                    setSnackOpen(true) 
                }
            })
        }
        else{
            setMessage("Please fill in your email id!")
            setAlertColor("error")
            setSnackOpen(true)
        }
    }

    return (
        <div className={styles.Login}>
            <div className={styles.backButton}>
                <a
                    href="#"
                    rel="nofollows noopener noreferrer"
                    onClick={() => history.goBack()}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginBottom: "1rem",
                        color: "white",
                        textDecoration: "none"
                    }}
                >
                    <ArrowBackIcon />
                    <span style={{ marginLeft: ".8rem" }}>Back</span>
                </a>
            </div>
            <div className={styles.noAccount}>
                <p>Get access to all <strong>Podminer</strong> data.</p>
                <p>Podminer is currently only available to <strong>Pikkal & Co clients</strong>.</p>
                <p>To work with Pikkal, <a href="https://www.pikkal.com/contact" rel="nofollows noopener noreferrer" target="_blank">contact us here</a>.</p>
            </div>
            <div className={styles.wrapper}>
                <Helmet>
                    <title>Login | Podminer</title>
                    <meta name="description" content="Login | Podminer " />

                    <meta name="og:title" property="og:title" content=" Login - Podminer "></meta>
                    <meta name="og:description" property="og:description" content=" Login To Access Your Favorite Podcasts- Podminer"></meta>
                    <meta property="og:url" content="http://www.podminer.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podminer, Pikkal & Co." /> 
                </Helmet>
                
                <div className={styles.imgDiv}></div>
                {
                    forgotPassword ?
                        (
                            <form onSubmit={handlePasswordChange}>
                                <div className={styles.contentDiv}>
                                    <p>Enter email</p>
                                    <TextField
                                        id="email"
                                        label="Email"
                                        type="email"
                                        onChange={e => setEmail(e.target.value)}
                                        value={email}
                                        className={styles.input}
                                        autoComplete="false"
                                    />
                                    <Button type="submit" variant="contained" className={styles.button}>Submit</Button>
                                    <a href="#" rel="nofollows noopener noreferrer" className={styles.forgotPass} onClick={handleForgotPassword}>Return to login!</a>
                                </div>
                            </form>
                        ) :
                        (    
                            <form onSubmit={handleClick}>
                                <div className={styles.contentDiv}>
                                    <p>Pikkal Client Login</p>
                                    <TextField
                                        id="email"
                                        label="Email"
                                        onChange={e => setEmail(e.target.value)}
                                        value={email}
                                        className={styles.input}
                                        autoComplete="false"
                                    />
                                    <FormControl className={styles.input} style={{ marginTop: "1em" }}>
                                        <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                                        <Input
                                            id="standard-adornment-password"
                                            type={password.showPassword ? 'text' : 'password'}
                                            value={password.value}
                                            autoComplete="false"
                                            onChange={e => setPassword({ ...password, value: e.target.value })}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setPassword({ ...password, showPassword: !password.showPassword })}
                                                        onMouseDown={e => e.preventDefault()}
                                                    >
                                                        {password.showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                    <Button type="submit" variant="contained" className={styles.button}>Login</Button>
                                    <a href="#" rel="nofollows noopener noreferrer" className={styles.forgotPass} onClick={handleForgotPassword}>Forgot password?</a>
                                </div>
                            </form>
                        )
                }
            </div>
            <Snackbar open={snackOpen} autoHideDuration={5000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertColor}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Login
