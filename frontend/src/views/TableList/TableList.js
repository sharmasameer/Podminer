import { makeStyles } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import CircularProgress from "@material-ui/core/CircularProgress"
import Icon from "@material-ui/core/Icon"
import TextField from "@material-ui/core/TextField"
import AddAlert from "@material-ui/icons/AddAlert"
import DateRange from "@material-ui/icons/DateRange"
import OndemandVideo from "@material-ui/icons/OndemandVideo"
import Search from "@material-ui/icons/Search"
import Store from "@material-ui/icons/Store"
import cardClasses from "assets/jss/material-dashboard-react/views/dashboardStyle.js"
import axios from "axios"
import Card from "components/Card/Card"
import CardBody from "components/Card/CardBody"
import CardHeader from "components/Card/CardHeader"
import CardIcon from "components/Card/CardIcon"
import Button from "components/CustomButtons/Button.js"
import Dropdown from "components/Dropdown/Dropdown"
import Gateway from "components/Gateway/Gateway"
import GridContainer from "components/Grid/GridContainer"
import GridItem from "components/Grid/GridItem"
import Snackbar from "components/Snackbar/Snackbar.js"
import Table from "components/Table/Table.js"
import React from 'react'
import Helmet from "react-helmet"
import { useHistory, useLocation, useParams } from "react-router-dom"
import { months } from "../../variables/months"
import styles from "./TableList.module.scss"
import { connect } from 'react-redux'
import Footer from "components/Footer/Footer"

const useStyles = makeStyles(cardClasses);

const TableList = props => {
  const classes = useStyles()

  // table filters
  const [country, setCountry] = React.useState("")
  const [genre, setGenre] = React.useState("")

  // data from api
  const [rankings, setRankings] = React.useState(props.podcastRankings)
  const [initialRankings, setInitialRankings] = React.useState([])

  // error on filters
  const [countryError, setCountryError] = React.useState(false)
  const [genreError, setGenreError] = React.useState(false)

  // Loading animation while receiving rankings
  const [loading, setLoading] = React.useState(false)
  const [tableLoading, setTableLoading] = React.useState(false)

  // button disabled if filters are unchanged
  const [btnDisabled, setBtnDisabled] = React.useState(true)

  // searchbar
  const [search, setSearch] = React.useState("")

  const history = useHistory()
  const location = useLocation()

  const scrollRef = React.useRef(null)
  const [contentLocked, setContentLocked] = React.useState(false)

  let { country_id, genre_id } = useParams()

  country_id = country_id.split("%20").join(" ")

  genre_id = genre_id.split("%20").join(" ")

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, true)
  }, [])

  React.useEffect(() => {
    if ((country !== country_id) || (genre !== genre_id)) {
      updateData()
    }
  }, [location.pathname])

  function updateData() {
    if (country_id && genre_id) {
      history.push(`/rankings/${country_id}/${genre_id}`)
      setLoading(true)

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

      axios.get("/podminer/fastrankings", {
        params: {
          country: country_id,
          genre: genre_id,
        },
      })
      .then(res => {
        setInitialRankings(res.data)
        setRankings(res.data)
        localStorage.setItem("country", country_id)
        localStorage.setItem("genre", genre_id)
        setCountry(country_id)
        setGenre(genre_id)
        setLoading(false)
      })
      .catch(err => console.log(err))
    }

    if(!props.countries.length){
      console.log("Updating Countries");
      axios.get('/fcountrygenre')
      .then(res => {
        console.log(res.data);
        let sortedData = [...res.data.queryset].sort((a, b) => b.country_name < a.country_name ? 1 : -1)
        sortedData = sortedData.map(d => {
          return {
            name: d.country_name
          }
        })
        props.onCountriesUpdate(sortedData)
      })
      .catch((err) => console.log(err))
    }

    if(!props.genres.length){
      console.log("Updating Genres");
      axios.get('/genres')
      .then(res => {
        const sortedData = [...res.data].sort((a, b) => b.name < a.name ? 1 : -1)
        props.onGenresUpdate(sortedData)
        // setGenres(sortedData)
      })
      .catch((err) => console.log(err))
    }
  }

  React.useEffect(() => {
    if (country === country_id && genre === genre_id) {
      setBtnDisabled(true)
    } else {
      setBtnDisabled(false)
    }
    document.getElementById("hd3").scrollIntoView()
  }, [country, genre])

  React.useEffect(() => {
    setTableLoading(true)
    const copyRankings = initialRankings.filter((ranking) => {
      return ranking["show__name"]
        .toLowerCase()
        .includes(search.toLowerCase())
    })
    setRankings(copyRankings)
    setTableLoading(false)
  }, [search])

  function showNotification(type) {
    switch (type) {
      case "country":
        if (!countryError) {
          setCountryError(true)
          setTimeout(function () {
            setCountryError(false)
          }, 6000)
        }
        break

      case "genre":
        if (!genreError) {
          setGenreError(true)
          setTimeout(function () {
            setGenreError(false)
          }, 6000)
        }
        break

      default:
        break
    }
  }

  function updateRankings() {
    if (country && genre) {
      history.push(`/rankings/${country}/${genre}`)
      setTableLoading(true)
      localStorage.setItem("country", country)
      localStorage.setItem("genre", genre)
      axios
        .get(`/podminer/fastrankings?country=${country}&genre=${genre}`)
        .then((res) => {
          setSearch("")
          setInitialRankings(res.data)
          setRankings(res.data)
          setBtnDisabled(true)
          setTableLoading(false)
        })
        .catch(err => console.log(err))
    }
    else if (!country) {
      showNotification('country')
    }
    else if (!genre) {
      showNotification('genre')
    }
  }

  const handleScroll = e => {
    if(!localStorage.getItem("refresh_token")){
      if(scrollRef && scrollRef.current && scrollRef.current.children[2] && scrollRef.current.children[2].getBoundingClientRect().top < -500){
        setContentLocked(true)
      }
      else{
        setContentLocked(false)
      }
    }
  }

  return (
    <div ref={scrollRef}>
      <GridContainer>
        <Helmet>
          <title>Podcast Rankings | {genre_id} {country_id} | Podminer </title>
          <meta
            name="description"
            content="Podcast Rankings | Podminer - iTunes Spotify Google Podcast Rankings"
          />
          <meta name="og:title" property="og:title" content="Podcast Rankings - Podminer"></meta>
          <meta name="og:description" property="og:description" content="Search podcast show rankings | Podminer - itunes spotify google podcast rankings"></meta>
          <meta property="og:url" content="http://www.podminer.com" />
          <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
          <meta name="og:image:alt" content="Podminer Logo" />
          <meta property="og:site_name" content="Podminer, Pikkal & Co." />
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
        
      <Box mt="1em">
        <GridContainer>
          {
            loading ?
              (<div className={styles.loaderDiv}>
                <CircularProgress color="primary" />
              </div>) :
              (
                <>
                  <Snackbar
                    place="tr"
                    color="danger"
                    icon={AddAlert}
                    message="Please select a country."
                    open={countryError}
                    closeNotification={() => setCountryError(false)}
                    close
                  />
                  <Snackbar
                    place="tr"
                    color="danger"
                    icon={AddAlert}
                    message="Please select a genre."
                    open={genreError}
                    closeNotification={() => setGenreError(false)}
                    close
                  />

                  <Box className={styles.searchBox}>
                    <form autoComplete="off">
                      <Search style={{ marginTop: "20px" }} />
                      <TextField
                        className={styles.searchbar}
                        inputProps={{
                          style: {
                            fontSize: "1.2rem",
                          }
                        }}
                        InputLabelProps={{
                          style: {
                            fontSize: "1.1rem",
                          }
                        }}
                        label="Filter Podcasts"
                        id="searchbar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      ></TextField>
                    </form>
                  </Box>
                  <Box className={styles.dropdownBox}>
                    <GridContainer className={styles.wrapper}>
                      {
                        props.countries.length ? (
                          <GridItem xs={5} sm={3} md={3}>
                            <Dropdown
                              items={props.countries}
                              label={"Country"}
                              defaultValue={country_id}
                              changeValue={(country) => setCountry(country)}
                            />
                          </GridItem>
                        ) : null
                      }
                      {
                        props.genres.length ? (
                          <GridItem xs={5} sm={3} md={3}>
                            <Dropdown
                              items={props.genres}
                              label={"Category"}
                              defaultValue={genre}
                              changeValue={(genre) => setGenre(genre)}
                            />
                          </GridItem>
                        ) : null
                      }
                      {
                        props.countries.length && props.genres.length ? (
                          <GridItem xs={6} sm={3} md={3}>
                            {btnDisabled ? (
                              <Button
                                color="primary"
                                style={{ marginLeft: "1em" }}
                                className={styles.buttonEl}
                                disabled
                              >
                                Update Rankings
                              </Button>
                            ) : (
                                <Button
                                  color="primary"
                                  style={{ marginLeft: "1em" }}
                                  className={styles.buttonEl}
                                  onClick={updateRankings}
                                >
                                  Update Rankings
                                </Button>
                              )}
                          </GridItem>
                        ) : null
                      }
                    </GridContainer>
                  </Box>
                  <GridItem xs={12} sm={12} md={12}>
                    <Card>
                      <CardHeader color="primary" className={styles.cardStyles}>
                        <p className={styles.cardTitleWhite}>Podcast Rankings</p>
                        {/* <p className={styles.cardCategoryWhite}>Top 100 podcasts</p> */}
                      </CardHeader>
                      <CardBody>
                        {
                          tableLoading ?
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
                                  tableType="rankings"
                                  tableData={rankings}
                                />
                              ) : 
                              (
                                <div className={styles.noResultFound}>No results found!</div>
                              )
                            )
                        }
                        {
                          contentLocked ?
                          (
                            <Gateway />
                          )
                          : null
                        }
                      </CardBody>
                    </Card>
                    <Footer/>
                  </GridItem>
                </>
              )
          }          
        </GridContainer>
      </Box>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    countries: state.rankingsReducer.countries,
    genres: state.rankingsReducer.genres,
    showCount: state.rankingsReducer.showCount,
    countryCount: state.rankingsReducer.countryCount,
    lastUpdate: state.rankingsReducer.lastUpdate
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onShowCountUpdate: val => dispatch({ type: 'SHOW_COUNT_UPDATE', payload: val }),
    onCountryCountUpdate: val => dispatch({ type: 'COUNTRY_COUNT_UPDATE', payload: val }),
    onLastDateUpdate: val => dispatch({ type: 'LAST_DATE_UPDATE', payload: val }),
    onCountriesUpdate: val => dispatch({ type: 'COUNTRIES_UPDATE', payload: val }),
    onGenresUpdate: val => dispatch({ type: 'GENRES_UPDATE', payload: val })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableList)
