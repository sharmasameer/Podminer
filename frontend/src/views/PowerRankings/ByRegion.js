import CircularProgress from "@material-ui/core/CircularProgress";
import axios from 'axios';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import Dropdown from "components/Dropdown/Dropdown";
import Footer from "components/Footer/Footer";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Table from 'components/Table/Table';
import React from 'react';
import Helmet from "react-helmet";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory, useParams } from "react-router-dom";
import styles from "views/TableList/TableList.module.scss";
import { setRegion, fetchRegions, setRankingsRegion } from "../../redux";

const ByRegion = () => {
    const dispatch = useDispatch();
    const regions = useSelector(state=>state.regionData.regions);
    const mapRegionsWithCode = useSelector(state=>state.regionData.mapRegionsWithCode);
    const region = useSelector(state=>state.regionData.region);
    const rankings = useSelector(state=>state.regionData.rankings);
    const error = useSelector(state=>state.regionData.error);
    const history = useHistory()
    const location = useLocation()
    const [loading, setLoading] = React.useState(true);

    let { region_name } = useParams()

    const fieldRef = React.useRef(null);
    React.useEffect(() => {
        if (fieldRef.current) {
        fieldRef.current.scrollIntoView();
        }
    }, []);

    React.useEffect(() => {
        setLoading(true);
        if(mapRegionsWithCode===null || regions===null){
            dispatch(fetchRegions());
            dispatch(setRegion(region_name.split("_").join(" ")));
        }
    }, [])

    React.useEffect(() => {
        if(!error){
            setLoading(true);
        }
        if (region && mapRegionsWithCode) {
            history.push(`/top100/region/${region.split(" ").join("_")}`)
            dispatch(setRankingsRegion(mapRegionsWithCode,region));
        }
    }, [region, mapRegionsWithCode])

    React.useEffect(()=>{
        if(rankings || error){
            setLoading(false);
        }
    },[rankings,error])

    React.useEffect(() => {
        if(location.pathname && region){
            const locationArray = location.pathname.split("/")
            if(locationArray[locationArray.length - 1] !== region){
                history.push(`/top100/region/${region.split(" ").join("_")}`)
            }
        }
    }, [location.pathname, region])

    return (
        <div  ref={fieldRef}>
            <GridContainer>
                <Helmet>
                    <title> {`Top 100 Podcasts By Region | ${region_name ? region_name.split("_").join(" ") : null} | Podcast Maps`} </title>
                    <meta
                        name="description"
                        content="Top 100 Podcasts By Region | Podcast Maps - iTunes Spotify Google Podcast Rankings"
                    />
                    <meta name="og:title" property="og:title" content="Top 100 Podcasts By Region | Podcast Maps"></meta>
                    <meta name="og:description" property="og:description" content="Top 100 Podcasts By Region | Podcast Maps - iTunes Spotify Google Podcast Rankings"></meta>
                    <meta property="og:url" content="http://www.podcastmaps.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podcast Maps, Pikkal & Co." />
                </Helmet>
                {
                    regions && regions.length && region ?
                        (
                            <GridItem xs={12} sm={6} md={3} style={{marginTop: '-1em'}}>
                                <Dropdown
                                    items={regions}
                                    label={"Regions"}
                                    defaultValue={region}
                                    changeValue={region => dispatch(setRegion(region))}
                                    long
                                />
                            </GridItem>
                        ) : null
                }
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                            <p className={styles.cardTitleWhite}>Top 100 Podcasts By Region : {region}</p>
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
                                        rankings && rankings.length ? (
                                            <Table
                                                tableHeaderColor="charcoal"
                                                tableHead={["Rank", "Podcast", "Ref"]}
                                                tableType="powerRankingsByRegion"
                                                tableData={rankings}
                                            />
                                        ) : (
                                                <div className={styles.noResultFound}>No results found!</div>
                                            )
                                    )
                            }
                        </CardBody>
                    </Card>
                    <Footer/>
                </GridItem>
            </GridContainer>
        </div>
    )
}

export default ByRegion
