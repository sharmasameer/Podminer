import { makeStyles } from '@material-ui/core/styles'
import logo from 'assets/img/asset0.png'
import styles from 'assets/jss/material-dashboard-react/layouts/adminStyle.js'
import Navbar from 'components/Navbars/Navbar.js'
import Sidebar from 'components/Sidebar/Sidebar.js'
import { UserContext } from 'context/userContext'
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import React from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import routes from 'routes.js'

import ReactGA from 'react-ga'

let ps

const switchRoutes = (
	<Switch>
		{routes.map((prop, key) => {
			if (
				prop.layout === '/admin' &&
				prop.name !== 'Podcast Ranking' &&
				prop.name !== 'Podcast Rankings' &&
				prop.name !== 'By Country' &&
				prop.name !== 'By Region'  && prop.name !== 'By Category' && prop.name !== "Top 100"
			) {
				return (
					<Route exact path={prop.path} component={prop.component} key={key} />
				)
			}
			if (prop.name === 'Podcast Ranking') {
				return (
					<Route
						exact
						path='/podcast/:showId/:slug'
						component={prop.component}
						key={key}
					/>
				)
			}
			if (prop.name === 'Podcast Rankings') {
				return (
					<Route
						exact
						path='/rankings/:country_id/:genre_id'
						component={prop.component}
						key={key}
					/>
				)
			}
			if (prop.name === 'User Management') {
				return (
					<Route exact path={prop.path} component={prop.component} key={key} />
				)
			}
			if (prop.name === 'Admin Tasks') {
				return (
					<Route exact path={prop.path} component={prop.component} key={key} />
				)
			}
			if (prop.name === 'By Country') {
				return (
				  <Route
					path="/top100/country/:country_name"
					component={prop.component}
					key={key}
				  />
				)
			  }
			  if (prop.name === 'By Region') {
				return (
				  <Route
					path="/top100/region/:region_name"
					component={prop.component}
					key={key}
				  />
				)
			  }
			  if (prop.name === 'By Category') {
				return (
				  <Route
					path="/top100/category/:category_name"
					component={prop.component}
					key={key}
				  />
				)
			  }
			return null
		})}
		<Redirect from='/' to='/top100' />
	</Switch>
)
const useStyles = makeStyles(styles)

export default function Admin({ ...rest }) {
	const history = useHistory()
	const { user } = React.useContext(UserContext)
	history.listen((location) => {
		if (!user) {
			console.log(location)
			ReactGA.pageview(location.pathname) // Record a pageview for the given page
		}
	})
	const classes = useStyles()
	const mainPanel = React.createRef()
	const [color, setColor] = React.useState('blue')
	const [fixedClasses, setFixedClasses] = React.useState('dropdown show')
	const [mobileOpen, setMobileOpen] = React.useState(false)
	const handleFixedClick = () => {
		if (fixedClasses === 'dropdown') {
			setFixedClasses('dropdown show')
		} else {
			setFixedClasses('dropdown')
		}
	}
	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}
	const getRoute = () => {
		return window.location.pathname
	}
	const resizeFunction = () => {
		if (window.innerWidth >= 960) {
			setMobileOpen(false)
		}
	}
	React.useEffect(() => {
		if (navigator.platform.indexOf('Win') > -1) {
			ps = new PerfectScrollbar(mainPanel.current, {
				suppressScrollX: true,
				suppressScrollY: false,
			})
			document.body.style.overflow = 'hidden'
		}
		window.addEventListener('resize', resizeFunction)
		return function cleanup() {
			if (navigator.platform.indexOf('Win') > -1) {
				ps.destroy()
			}
			window.removeEventListener('resize', resizeFunction)
		}
	}, [mainPanel])
	return (
		<div className={classes.wrapper} ref={mainPanel}>
			<Sidebar
				routes={routes}
				logoText={'Podminer'}
				logo={logo}
				handleDrawerToggle={handleDrawerToggle}
				open={mobileOpen}
				color={color}
				{...rest}
			/>
			<div className={classes.mainPanel}>
				<Navbar
					routes={routes}
					handleDrawerToggle={handleDrawerToggle}
					{...rest}
				/>
				{getRoute() !== '/admin/maps' ? (
					<div className={classes.content}>
						<div className={classes.container}>
							{switchRoutes}
							{localStorage.getItem('access_token') ? (
								<Switch>
									<Redirect exact from='/' to='/top100' />
								</Switch>
							) : (
								<Switch>
									<Redirect exact from='/' to='/top100' />
								</Switch>
							)}
						</div>
					</div>
				) : (
					<div className={classes.map}>
						{switchRoutes}
						{localStorage.getItem('access_token') ? (
							<Switch>
								<Redirect exact from='/' to='/top100' />
							</Switch>
						) : (
							<Switch>
								<Redirect exact from='/' to='/top100' />
							</Switch>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
