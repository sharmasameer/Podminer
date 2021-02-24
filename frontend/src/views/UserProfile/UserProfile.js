import { FormControl, IconButton, Input, InputAdornment, InputLabel, Snackbar, TextField } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import MuiAlert from '@material-ui/lab/Alert'
import axios from "axios"
import Card from "components/Card/Card"
import CardBody from "components/Card/CardBody"
import CardHeader from "components/Card/CardHeader"
import Button from "components/CustomButtons/Button"
import Footer from 'components/Footer/Footer'
import GridContainer from "components/Grid/GridContainer"
import GridItem from "components/Grid/GridItem"
import React from "react"
import Helmet from "react-helmet"
import styles from "./UserProfile.module.scss"

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const UserProfile = () => {
  const [info, setInfo] = React.useState({
    username: "",
    firstname: "",
    lastname: "",
    email: ""
  })

  const [password, setPassword] = React.useState({
    value: "",
    showPassword: false
  })

  const [message, setMessage] = React.useState("");
  const [snackColor, setSnackColor] = React.useState("")
  const [snackOpen, setSnackOpen] = React.useState(false)

  React.useEffect(() => {
    setInfo({
      ...info,
      username: localStorage.getItem("username_token"),
      firstname: localStorage.getItem("firstname_token"),
      lastname: localStorage.getItem("lastname_token"),
      email: localStorage.getItem("email_token")
    })
  }, [])

  React.useEffect(() => {
    document.getElementById('hd3').scrollIntoView();
  }, []);

  const updateProfileHandler = e => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    const id = localStorage.getItem("id_token")
    if (info.firstname.length && info.lastname.length && info.email.length && password.value.length) {
      axios.put(`/users/settings/${id}`, {
        username: info.username,
        first_name: info.firstname,
        last_name: info.lastname,
        email: info.email,
        password: password.value
      },
        {
          headers: {
            Authorization: "Bearer " + token
          }
        })
        .then(res => {
          localStorage.setItem('email_token', info.email)
          localStorage.setItem('firstname_token', info.firstname)
          localStorage.setItem('lastname_token', info.lastname)
          setMessage('Profile updated!')
          setSnackColor("success")
          setSnackOpen(true)
        })
        .catch(err => {
          console.log(err)
          setMessage('Oops! Either you are logged out or entered invalid credentials')
          setSnackColor("error")
          setSnackOpen(true);
        })
    }
    else {
      setMessage("Please fill in all the details!")
      setSnackColor("error")
      setSnackOpen(true)
    }
  }

  return (
    <div className={styles.UserProfile}>
      <GridContainer>
        <Helmet>
          <title>Edit Profile | Podminer</title>
          <meta name="description" content="Edit Profile | Podminer - itunes spotify google podcast rankings" />
          <meta name="og:title" property="og:title" content="Edit Profile | Podminer"></meta>
          <meta name="og:description" property="og:description" content=" Edit Profile | Podminer - itunes spotify google podcast rankings"></meta>
          <meta property="og:url" content="http://www.podminer.com" />
          <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
          <meta name="og:image:alt" content="Podminer Logo" />
          <meta property="og:site_name" content="Podminer, Pikkal & Co." />
        </Helmet>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary" className={styles.cardStyles}>
              <p className={styles.cardTitleWhite}>Edit Profile</p>
            </CardHeader>
            <CardBody className={styles.cardBody}>
              <div className={styles.container}>
                <div>
                  <TextField
                    id="firstname"
                    value={info.firstname}
                    className={styles.input}
                    label="First Name"
                    inputProps={{ style: { fontSize: "20px" } }}
                    InputLabelProps={{ style: { fontSize: "18px" } }}
                    onChange={e => setInfo({ ...info, firstname: e.target.value })}
                    autoComplete="false"
                  />
                </div>
                <div>
                  <TextField
                    id="lastname"
                    value={info.lastname}
                    className={styles.input}
                    label="Last Name"
                    inputProps={{ style: { fontSize: "20px" } }}
                    InputLabelProps={{ style: { fontSize: "18px" } }}
                    onChange={e => setInfo({ ...info, lastname: e.target.value })}
                    autoComplete="false"
                  />
                </div>
              </div>
              <div>
                <div>
                  <TextField
                    id="username"
                    value={info.username}
                    className={styles.input}
                    label="Username"
                    inputProps={{ style: { fontSize: "20px" } }}
                    InputLabelProps={{ style: { fontSize: "18px" } }}
                    onChange={e => setInfo({ ...info, username: e.target.value })}
                    autoComplete="false"
                  />
                </div>
              </div>
              <div>
                <div>
                  <TextField
                    id="email"
                    value={info.email}
                    className={styles.input}
                    label="Email"
                    inputProps={{ style: { fontSize: "20px" } }}
                    InputLabelProps={{ style: { fontSize: "18px" } }}
                    onChange={e => setInfo({ ...info, email: e.target.value })}
                    autoComplete="false"
                  />
                </div>
              </div>
              <div>
                <div>
                  <FormControl className={styles.input}>
                    <InputLabel style={{ fontSize: "18px" }} htmlFor="standard-adornment-password">Password</InputLabel>
                    <Input
                      id="standard-adornment-password"
                      type={password.showPassword ? 'text' : 'password'}
                      value={password.value}
                      autoComplete="false"
                      inputProps={{ style: { fontSize: "20px" } }}
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
                </div>
              </div>
              <div className={styles.btnContainer}>
                <Button color="primary" className={styles.buttonEl} onClick={updateProfileHandler}>Update Profile</Button>
              </div>
            </CardBody>
          </Card>
          <Footer/>
        </GridItem>
      </GridContainer>
      <Snackbar open={snackOpen} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} autoHideDuration={5000} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity={snackColor}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default UserProfile;
