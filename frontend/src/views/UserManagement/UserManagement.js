import CircularProgress from '@material-ui/core/CircularProgress'
import AddIcon from '@material-ui/icons/Add'
import axios from 'axios'
import Card from "components/Card/Card"
import CardBody from "components/Card/CardBody"
import CardHeader from "components/Card/CardHeader"
import Button from "components/CustomButtons/Button"
import Footer from 'components/Footer/Footer'
import GridContainer from "components/Grid/GridContainer"
import GridItem from "components/Grid/GridItem"
import Table from "components/Table/Table.js"
import React from 'react'
import Helmet from "react-helmet"
import styles from "../TableList/TableList.module.scss"
import Modal from "./Modal/Modal"

const UserManagement = () => {
	const [users, setUsers] = React.useState(null)
	const [modalOpen, setModalOpen] = React.useState(false);
	const [updateModalOpen, setUpdateModalOpen] = React.useState(false);
	const [editingUser, setEditingUser] = React.useState({});
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		loadUsers();
		document.getElementById('hd3').scrollIntoView();
	}, [])

	React.useEffect(() => {
		console.log(users);
		document.getElementById('hd3').scrollIntoView();
	}, [users])

	const loadUsers = () => {
		setLoading(true)
		const token = localStorage.getItem("access_token");
		axios.get('/users', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then(res => {
				console.log(res.data);
				const newUsers = res.data.map(user => {
					return {
						...user,
						deleteUser: u => deleteUser(u),
						editUser: u => { setUpdateModalOpen(true); setEditingUser(u); }
					}
				})
				setUsers(newUsers)
				setLoading(false)
				// document.getElementById('hd3').scrollIntoView();
			})
			.catch(err => {
				console.log(err)
				setLoading(false)
			})
	}

	const addUser = user => {
		const token = localStorage.getItem("access_token");
		axios.post('/users', {
			username: user.username,
			password: user.password,
			first_name: user.firstName,
			last_name: user.lastName,
			is_staff: user.admin,
			email: user.email
		}, {
			headers: {
				Authorization: "Bearer " + token
			}
		})
			.then(res => {
				loadUsers();
			})
			.catch(err => console.log(err))
	}

	const deleteUser = user => {
		const token = localStorage.getItem("access_token");
		axios.delete(`/users/${user.id}`, {
			headers: {
				Authorization: "Bearer " + token
			}
		})
			.then(res => {
				console.log(res.data);
				loadUsers();
			})
			.catch(err => console.log(err))
	}

	const updateUser = user => {
		const token = localStorage.getItem("access_token");
		axios.put(`/users/${user.id}`, {
			username: user.username,
			password: user.password,
			first_name: user.firstName,
			last_name: user.lastName,
			is_staff: user.admin,
			email: user.email
		}, {
			headers: {
				Authorization: "Bearer " + token
			}
		})
			.then(res => {
				loadUsers();
			})
			.catch(err => console.log(err))
	}

	return (
		<div>
			<GridContainer>
				<Helmet>
					<title>User Management | Podminer</title>
					<meta name="description" content="User Management | Podminer - itunes spotify google podcast rankings" />
					<meta name="og:title" property="og:title" content="User Management | Podminer"></meta>
					<meta name="og:description" property="og:description" content=" User Management  | Podminer - itunes spotify google podcast rankings"></meta>
					<meta property="og:url" content="http://www.podminer.com" />
					<meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
					<meta name="og:image:alt" content="Podminer Logo" />
					<meta property="og:site_name" content="Podminer, Pikkal & Co." />

				</Helmet>
				<Button style={{ margin: "1em 6em 2em auto" }} color="primary" onClick={() => setModalOpen(true)} startIcon={<AddIcon />}>Add User</Button>
				<GridItem xs={12} sm={12} md={12}>
					<Card>
						<CardHeader color="primary" className={styles.cardStyles}>
							<p className={styles.cardTitleWhite}>Users</p>
						</CardHeader>
						<CardBody>
							{
								loading ?
									<div className={styles.loaderDiv}>
										<CircularProgress color='primary' />
									</div> :
									(
										users && users.length ?
											<Table
												tableHeaderColor="charcoal"
												tableHead={["Username", "Name", "Email", "Admin", "Delete"]}
												tableType='users'
												tableData={users}
											/> :
											<div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2rem", height: "60vh" }}>No users found!</div>
									)
							}
						</CardBody>
					</Card>
					<Footer/>
				</GridItem>
			</GridContainer>
			<Modal open={modalOpen} addUser={addUser} deleteUser={deleteUser} onModalClose={() => setModalOpen(false)} />
			<Modal open={updateModalOpen} data={editingUser} addUser={updateUser} deleteUser={deleteUser} onModalClose={() => setUpdateModalOpen(false)} update />
		</div>
	)
}

export default UserManagement
