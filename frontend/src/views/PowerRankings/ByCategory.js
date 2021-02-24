import CircularProgress from "@material-ui/core/CircularProgress";
import axios from 'axios';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import Dropdown from "components/Dropdown/Dropdown";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Table from 'components/Table/Table';
import React from 'react';
import Helmet from "react-helmet";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory, useParams } from "react-router-dom";
import { fetchGenres, setGenre, setRankingsGenre } from "../../redux";
import styles from "views/TableList/TableList.module.scss";
import Footer from "components/Footer/Footer";

const ByCategory = () => {
    const dispatch = useDispatch();
    const history = useHistory()
    const location = useLocation()
    const mapGenresWithCode = useSelector(state=>state.genreData.mapGenresWithCode);
    const genres = useSelector(state=>state.genreData.genres);
    const genre = useSelector(state=>state.genreData.genre);
    const rankings = useSelector(state=>state.genreData.rankings);
    const error = useSelector(state=>state.genreData.error);
    const [loading, setLoading] = React.useState(true);

    let { category_name } = useParams()
    category_name = category_name.split("%20").join(" ")

    const fieldRef = React.useRef(null);
    React.useEffect(() => {
        if (fieldRef.current) {
        fieldRef.current.scrollIntoView();
        }
    }, []);

    React.useEffect(() => {
        setLoading(true);
        if(mapGenresWithCode===null || genres=== null){
            dispatch(fetchGenres());
            dispatch(setGenre(category_name));
        }
    }, [])

    React.useEffect(() => {
        if(!error){
        setLoading(true);
        }
        if (genre && mapGenresWithCode) {
            history.push(`/top100/category/${genre}`)
            dispatch(setRankingsGenre(mapGenresWithCode,genre));
        }
        }, [genre, mapGenresWithCode])

    React.useEffect(()=>{
        if(rankings || error){
            setLoading(false);
        }
    },[rankings,error])
    
    React.useEffect(() => {
        if(location.pathname && genre){
            const locationArray = location.pathname.split("/")
            if(locationArray[locationArray.length - 1] !== genre){
                history.push(`/top100/category/${genre}`)
            }
        }
    }, [location.pathname, genre])

    return (
        <div  ref={fieldRef}>
            <GridContainer>
                <Helmet>
                    <title>Top 100 Podcasts by Category | {category_name ? category_name : null} | Podcast Maps </title>
                    <meta
                        name="description"
                        content="Top 100 Podcasts By Category | Podcast Maps - iTunes Spotify Google Podcast Rankings"
                    />
                    <meta name="og:title" property="og:title" content="Top 100 Podcast By Category | Podcast Maps"></meta>
                    <meta name="og:description" property="og:description" content="Top 100 Podcast By Category | Podcast Maps - iTunes Spotify Google Podcast Rankings"></meta>
                    <meta property="og:url" content="http://www.podcastmaps.com" />
                    <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                    <meta name="og:image:alt" content="Podminer Logo" />
                    <meta property="og:site_name" content="Podcast Maps, Pikkal & Co." />
                </Helmet>
                {
                    genres && genres.length && genre ?
                        (
                            <GridItem xs={12} sm={6} md={3} style={{marginTop: '-1em'}}>
                                <Dropdown
                                    items={genres}
                                    label={"Categories"}
                                    defaultValue={genre}
                                    changeValue={genre => dispatch(setGenre(genre))}
                                    long
                                />
                            </GridItem>
                        ) : null
                }
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                            <p className={styles.cardTitleWhite}>Top 100 Podcasts By Category : {genre}</p>
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
                                                tableType="powerRankingsByCategory"
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

export default ByCategory
