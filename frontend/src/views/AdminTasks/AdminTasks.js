import CircularProgress from '@material-ui/core/CircularProgress';
import { PlayArrow } from '@material-ui/icons';
import axios from 'axios';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import Button from 'components/CustomButtons/Button';
import Footer from 'components/Footer/Footer';
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Table from "components/Table/Table.js";
import React from 'react';
import Helmet from "react-helmet";
import styles from '../TableList/TableList.module.scss';

const AdminTasks = props => {
    const token = localStorage.getItem("access_token");
    const [tasks, setTasks] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [taskOutput, setTaskOutput] = React.useState("")
    const [taskLoading, setTaskLoading] = React.useState(false)

    const loadTasks = () => {
        setLoading(true)
        axios.get('/podminer/tasks', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log(res.data);
            setTasks(res.data);
            setLoading(false)
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
        })
    }

    const loadIndividualTask = () => {
        if(window.location.pathname !== '/tasks'){
            axios.get('/podminer/tasks/'+ props.match.params.taskId, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                let output = res.data.output.replaceAll("\u001b[0;34m", "")
                                            .replaceAll("\u001b[0m", "")
                                            .replaceAll()
                setTaskOutput(output)
                if(res.data.status === "PENDING"){
                    setTimeout(loadIndividualTask, 1000)
                    document.getElementById('hd5').scrollIntoView(false);
                }
                else{
                    setTaskLoading(false)
                }
            })
            .catch(err => console.log(err))
        }
    }

    React.useEffect(() => {
        if (props.match.params.taskId){
            setTaskLoading(true)
            loadIndividualTask()
        }
        else{
            loadTasks();
            document.getElementById('hd3').scrollIntoView();
        }
    }, [])

    const startManualJob = () => {
        axios.get('/podminer/rankings/update', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((res) => {
            loadTasks();
        })
    }

    const revokeTask = task_id => {
        console.log("Task " + task_id + " revoked.");
        axios.post(`/podminer/tasks-abort/${task_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log(res.data)
            loadTasks()
        })
        .catch(err => console.log(err))
    }

    return (
        <div>
            <GridContainer>
                <Helmet>
                    <title>Podminer-Admin Tasks</title>
                    <meta name="description" content="Podminer - Admin Tasks | Podminer" />

                    <meta name="og:title" property="og:title" content=" Admin Tasks- Podminer "></meta>
                    <meta name="og:description" property="og:description" content=" Only For Admin Tasks- Podminer"></meta>
                    <meta property="og:url" content="http://www.podminer.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                    
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podminer, Pikkal & Co." /> 
                </Helmet>
                <Button color="primary" style={{margin: "1em 6em 2em auto"}} startIcon={<PlayArrow />} onClick={startManualJob}>Manual Update</Button>
                <GridItem xs={12} sm={12} md={12}>
                    {props.match.params.taskId ?
                        <Card id="hd5">
                            <CardHeader color="primary" className={styles.cardStyles}>
                                <p className={styles.cardTitleWhite}>Tasks Output:</p>
                            </CardHeader>
                            <CardBody>
                                {taskOutput.split("\n").map((str, idx) => <p key={idx}>{str}</p>)}
                                {
                                    taskLoading ?
                                    <CircularProgress color='primary' size='1.5rem' />: null
                                }
                            </CardBody>
                        </Card> : 
                        <Card>
                            <CardHeader color="primary" className={styles.cardStyles}>
                                <GridContainer>
                                    <GridItem sm={8}>
                                        <p className={styles.cardTitleWhite} style={{verticalAlign: "text-bottom"}}>Update Tasks </p>
                                    </GridItem>
                                </GridContainer>
                            </CardHeader>
                            <CardBody>
                                {
                                    loading ?
                                        <div className={styles.loaderDiv}>
                                            <CircularProgress color='primary' />
                                        </div> :
                                        (
                                            tasks && tasks.length ?
                                                <Table
                                                    tableHeaderColor="charcoal"
                                                    tableHead={["ID", "Type", "Date Created", "Date Done", "Status", "Output"]}
                                                    tableType='tasks'
                                                    tableData={tasks}
                                                    revokeTask={revokeTask}
                                                /> :
                                                <div style={{display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2rem", height: "60vh"}}>No users found!</div>
                                        )
                                }
                            </CardBody>
                        </Card>
                    }
                    <Footer/>
                </GridItem>
            </GridContainer>
        </div>
    )
}

export default AdminTasks
