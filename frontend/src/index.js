import 'assets/css/material-dashboard-react.css?v=1.9.0'
import axios from 'axios'
import Loader from 'components/Loader/Loader'
import { createBrowserHistory } from 'history'
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { LocationContext } from './context/locationContext'
import { UserContext } from './context/userContext'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from 'redux/reducers/rootReducer'
import { store } from "./redux/store";

import ReactGA from 'react-ga'

// GOOGLE ANALYTICS CONFIG
const trackingId = 'UA-188313063-1'

const ForgotPassword = lazy(() =>
	import('views/Login/ForgotPassword/ForgotPassword')
)
const Login = lazy(() => import('views/Login/Login'))
const Admin = lazy(() => import('layouts/Admin'))

const hist = createBrowserHistory()

// const store = createStore(rootReducer)
// const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

if (process.env.REACT_APP_ENV === 'staging') {
	axios.defaults.baseURL = 'http://app0api.pikkalfm.com'
} else if (process.env.REACT_APP_ENV === 'production') {
	axios.defaults.baseURL = 'https://api.podminer.com'
} else if (process.env.REACT_APP_ENV === 'development') {
	axios.defaults.baseURL = 'http://localhost:8000'
}

// axios.defaults.baseURL = 'https://api.podminer.com'

// if (process.env.REACT_APP_ENV !== "development" && process.env.REACT_APP_ENV !== "staging")
//     console.log = () => {};





// to get new access_token using refresh_token
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refresh_token");
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config._retry &&
	  refreshToken
    ) {
	  originalRequest._retry = true;
	  //console.log("Access token invalid");
      console.log("Requesting new access token");
      axios
        .post(
          "/auth/token/refresh/",
          {
            refresh: refreshToken,
          },
          {
            "Content-Type": "application/json",
          }
        )
        .then((res) => {
		  const newtoken = res.data.access;	  
          localStorage.setItem("access_token", newtoken);
          //console.log("New token received");
          originalRequest.headers.Authorization = "Bearer " + newtoken;  
		  console.log("New Access token generated successfully");
          return axios(originalRequest);
        })
        .catch((err) => {
		  console.log(err);
		  localStorage.removeItem("access_token")
		  localStorage.removeItem("refresh_token")
          return axios(originalRequest);
        });  
	}
	else{
		return error;
	}
  }
);
  
  

const App = () => {
	const [user, setUser] = React.useState(null)
	const [location, setLocation] = React.useState(null)
	const value = React.useMemo(() => ({ user, setUser }), [user, setUser])

	React.useEffect(() => {
		setTimeout(() => {
			if (!user && process.env.REACT_APP_ENV === 'production') {
				ReactGA.initialize(trackingId)
			}
		}, 1000)
	}, [user])

	function loadUserData() {
		if (localStorage.getItem('access_token')) {
			const token = localStorage.getItem('access_token')
			axios
				.get('/auth/current/', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					//console.log(res.data)
					localStorage.setItem('id_token', res.data.id)
					setUser(res.data)
				})
				.catch((err) => console.log(err))
		}
	}

	const loadLocationData = () => {
		if (!location) {
			axios
				.get('https://ipapi.co/json/')
				.then((response) => {
					setLocation(response.data.country_name)
				})
				.catch((err) => console.log(err))
		}
	}

	React.useEffect(() => {
		loadUserData()
		loadLocationData()

		axios
			.post('/podminer/user-metrics', {
				username_field: localStorage.getItem('username_token'),
			})
			.then((response) => {
				console.log(response.data)
			})
			.catch((err) => console.log(err))
	}, [])

	return (
		<BrowserRouter history={hist}>
			<Suspense fallback={<Loader />}>
				<Provider store={store}>
					<LocationContext.Provider value={{ location }}>
						<UserContext.Provider
							value={{
								...value,
								loadUserData,
							}}
						>
							<Switch>
								<Route
									path='/forgotpassword/:uid/:token'
									component={ForgotPassword}
								/>
								<Route path='/login' component={Login} />
								<Route path='/' component={Admin} />
								<Redirect from='/' to='/rankings/Singapore/Business' />
							</Switch>
						</UserContext.Provider>
					</LocationContext.Provider>
				</Provider>
			</Suspense>
		</BrowserRouter>
	)
}

ReactDOM.render(<App />, document.getElementById('root'))
