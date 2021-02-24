import { makeStyles } from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from 'axios';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Table from 'components/Table/Table';
import React from 'react';
import Helmet from "react-helmet";
import styles from "views/TableList/TableList.module.scss";
import { useDispatch,useSelector } from 'react-redux';
import { fetchGlobalTopHundred } from "../../redux";
import Footer from "components/Footer/Footer";
import CardIcon from "components/Card/CardIcon";
import Icon from "@material-ui/core/Icon";
import OndemandVideo from "@material-ui/icons/OndemandVideo";
import cardClasses from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import DateRange from "@material-ui/icons/DateRange";
import Store from "@material-ui/icons/Store";
import { months } from "../../variables/months"
import { connect } from 'react-redux'

const useStyles = makeStyles(cardClasses);

const PowerRankings = (props) => {
    const classes = useStyles()
    const dispatch = useDispatch();
    const powerRankings = useSelector(state=>state.rankings.powerRankings);
    const error = useSelector(state=>state.rankings.error);
    const [loading, setLoading] = React.useState(true)

    const fieldRef = React.useRef(null);
    React.useEffect(() => {
        if (fieldRef.current) {
        fieldRef.current.scrollIntoView();
        }
    }, []);

    React.useEffect(() => {
        setLoading(true);
        updateData()
        dispatch(fetchGlobalTopHundred());
    }, [])

    React.useEffect(()=>{
        if(powerRankings || error){
            setLoading(false);
        }
    },[powerRankings, error])

    function updateData(){
        if(!props.showCount){
            console.log("Fetching Show Count and Last Update")
            axios.get("/podminer/stats")
            .then((res) => {
            let d = new Date(res.data["last_update"]);
            props.onShowCountUpdate(res.data["show_count"].toLocaleString())
            props.onLastDateUpdate(`${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`)
            })
            .catch((err) => console.log(err));
        }

        if(!props.countryCount){
            console.log("Fetching Country Count");
            axios.get('/countries')
            .then(res => {
            props.onCountryCountUpdate(res.data.length.toLocaleString())
            })
            .catch(err => console.log(err))  
        }
    }

    return (
        <div ref={fieldRef}>
            <GridContainer>
                <Helmet>
                    <title>Top 100 Global Podcasts | Podcast Maps </title>
                    <meta
                        name="description"
                        content="Top 100 Global Podcasts | Podcast Maps - iTunes Spotify Google Podcast Rankings"
                    />
                    <meta name="og:title" property="og:title" content="Top 100 Global Podcasts | Podcast Maps"></meta>
                    <meta name="og:description" property="og:description" content="Top 100 Global Podcasts | Podcast Maps - iTunes Spotify Google Podcast Rankings"></meta>
                    <meta property="og:url" content="http://www.podcastmaps.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podcast Maps, Pikkal & Co." />
                </Helmet>
            </GridContainer>

            <GridContainer>
                <GridItem xs={12} sm={6} md={4}>
                <Card style={{ height: "70%" }}>
                    <CardHeader style={{ height: "100%" }} color="warning" stats icon>
                    <CardIcon color="warning">
                        <Icon>
                            <OndemandVideo />
                        </Icon>
                    </CardIcon>
                    <p className={classes.cardCategory}>Shows in Database</p>
                    <h3 className={classes.cardTitle}>
                        {props.showCount ? props.showCount : null}
                    </h3>
                    </CardHeader>
                </Card>
                </GridItem>
                <GridItem xs={12} sm={6} md={4}>
                <Card style={{ height: "70%" }}>
                    <CardHeader style={{ height: "100%" }} color="success" stats icon>
                    <CardIcon color="success">
                        <Store />
                    </CardIcon>
                    <p className={classes.cardCategory}>Stores Tracked</p>
                    <h3 className={classes.cardTitle}>
                        {props.countryCount ? props.countryCount : null}
                    </h3>
                    </CardHeader>
                </Card>
                </GridItem>
                <GridItem xs={12} sm={6} md={4}>
                <Card style={{ height: "70%" }}>
                    <CardHeader style={{ height: "100%" }} color="info" stats icon>
                    <CardIcon color="info">
                        <Icon>
                        <DateRange />
                        </Icon>
                    </CardIcon>
                    <p className={classes.cardCategory}>Date of Last Update</p>
                    <h3 className={classes.cardTitle}>{props.lastUpdate}</h3>
                    </CardHeader>
                </Card>
                </GridItem>
            </GridContainer>

            <GridContainer>
                <GridItem xs={12} sm={12} md={12} style={{marginTop: '2em'}}>
                    <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                            <p className={styles.cardTitleWhite}>Top 100 Podcast Shows Globally</p>
                        </CardHeader>

                        <CardBody>
                            {
                                loading ?
                                    (
                                        <div className={styles.loaderDiv}>
                                            <CircularProgress color="primary" />
                                        </div>
                                    ) :
                                    (
                                        <Table
                                            tableHeaderColor="charcoal"
                                            tableHead={["Rank", "Podcast", "Ref"]}
                                            tableType="powerrankings"
                                            tableData={powerRankings}
                                        />
                                    )
                            }
                        </CardBody>
                    </Card>
                    <p className={styles.powerRankingsDesc}><strong>*PAI</strong> = <strong>Podcast Authority Index</strong>. It counts the number of instances ths show ranks in the regional top 20 category on Apple Podcast stores. Scores are relative to the highest ranked show, which is set at 100.</p>
                    <Footer/>
                </GridItem>
            </GridContainer>
        </div>
    )
}

const mapStateToProps = state => {
    return {
      showCount: state.rankingsReducer.showCount,
      countryCount: state.rankingsReducer.countryCount,
      lastUpdate: state.rankingsReducer.lastUpdate
    }
}
  
const mapDispatchToProps = dispatch => {
return {
    onShowCountUpdate: val => dispatch({ type: 'SHOW_COUNT_UPDATE', payload: val }),
    onCountryCountUpdate: val => dispatch({ type: 'COUNTRY_COUNT_UPDATE', payload: val }),
    onLastDateUpdate: val => dispatch({ type: 'LAST_DATE_UPDATE', payload: val })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PowerRankings)