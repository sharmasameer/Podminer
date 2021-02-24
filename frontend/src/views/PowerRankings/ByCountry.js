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
import { func } from "prop-types";
import React from 'react';
import Helmet from "react-helmet";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory, useParams } from "react-router-dom";
import styles from "views/TableList/TableList.module.scss";
import { fetchCountryGenre, setCountry, setRankingsCountry } from "../../redux";

const ByCountry = () => {
    const dispatch = useDispatch();
    const history = useHistory()
    const location = useLocation()
    const countries = useSelector(state=>state.countryGenre.countries);
    const mapCountriesWithCode = useSelector(state=>state.countryGenre.mapCountriesWithCode);
    const rankings = useSelector(state=>state.countryGenre.rankings);
    const country = useSelector(state=>state.countryGenre.country);
    const error = useSelector(state=>state.countryGenre.error);
    const [loading, setLoading] = React.useState(true);

    let { country_name } = useParams();

    const fieldRef = React.useRef(null);
    React.useEffect(() => {
        if (fieldRef.current) {
        fieldRef.current.scrollIntoView();
        }
    }, []);

    React.useEffect(() => {
        setLoading(true);
        if(mapCountriesWithCode===null || countries=== null){
            dispatch(fetchCountryGenre());
            dispatch(setCountry(country_name.split("_").join(" ")));
        }
    }, [])

    React.useEffect(() => {
        if(!error){
        setLoading(true);
        }
        if (country && mapCountriesWithCode) {
            history.push(`/top100/country/${country.split(" ").join('_')}`)
            dispatch(setRankingsCountry(mapCountriesWithCode,country));
        }
    }, [country, mapCountriesWithCode])

    React.useEffect(()=>{
        if(rankings || error){
            setLoading(false);
        }
    },[rankings,error])

    React.useEffect(() => {
        if(location.pathname && country){
            const locationArray = location.pathname.split("/")
            if(locationArray[locationArray.length - 1] !== country){
                history.push(`/top100/country/${country.split(" ").join("_")}`)
            }
        }
    }, [location.pathname, country])

    return (
        <div  ref={fieldRef}>
            <GridContainer>
                <Helmet>
                    <title>{`Top 100 Podcasts by Country | ${country_name ? country_name : null} | Podcast Maps`}</title>
                    <meta
                        name="description"
                        content="Top 100 Podcasts By Category | Podcast Maps - iTunes Spotify Google Podcast Rankings"
                    />
                    <meta name="og:title" property="og:title" content="Top 100 Podcast By Country | Podcast Maps"></meta>
                    <meta name="og:description" property="og:description" content="Top 100 Podcast By Country | Podcast Maps - iTunes Spotify Google Podcast Rankings"></meta>
                    <meta property="og:url" content="http://www.podcastmaps.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podcast Maps, Pikkal & Co." />
                </Helmet>
                {
                    countries && countries.length && country ?
                        (
                            <GridItem xs={12} sm={6} md={3} style={{marginTop: '-1em'}}>
                                <Dropdown
                                    items={countries}
                                    label={"Countries"}
                                    defaultValue={country}
                                    changeValue={country => dispatch(setCountry(country))}
                                    long
                                />
                            </GridItem>
                        ) : null
                }
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                            <p className={styles.cardTitleWhite}>Top 100 Podcasts By Country : {country}</p>
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
                                                tableType="powerRankingsByCountry"
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

export default ByCountry
