import { Snackbar } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import MuiAlert from '@material-ui/lab/Alert';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import axios from "axios";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import FollowedShowsChart from "components/Chart/FollowedShowsChart";
import Button from "components/CustomButtons/Button.js";
import Dropdown from "components/Dropdown/Dropdown";
import Footer from "components/Footer/Footer";
import Gateway from "components/Gateway/Gateway";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Table from "components/Table/Table.js";
import { LocationContext } from "context/locationContext";
import React from "react";
import Helmet from "react-helmet";
import { UserContext } from "../../context/userContext";
import { months } from "../../variables/months";
import followShowsStyle from "../TableList/TableList.module.scss";

const useStyles = makeStyles(styles);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Dashboard = () => {
  const { location } = React.useContext(LocationContext)
  const classes = useStyles()
  const { user } = React.useContext(UserContext);
  const token = localStorage.getItem("access_token");

  const [tableLoader, setTableLoader] = React.useState(false);
  const [genreLoader, setGenreLoader] = React.useState(true)

  const [countries, setCountries] = React.useState(null)
  const [genres, setGenres] = React.useState(null)

  const [country, setCountry] = React.useState(null)
  const [genre, setGenre] = React.useState(null)
  const [selectedCountry, setSelectedCountry] = React.useState(null)
  const [selectedGenre, setSelectedGenre] = React.useState(null)

  const [showsFollowed, setshowsFollowed] = React.useState([])
  const [mapFollowedShows, setMapFollowedShows] = React.useState(null)
  const [chartData, setChartData] = React.useState(null)

  const [followedShowsPAIChart, setFollowedShowsPAIChart] = React.useState(null)

  const [message, setMessage] = React.useState("")

  const [btnDisabled, setBtnDisabled] = React.useState(false)

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackMessage, setSnackMessage] = React.useState(false)
  const [snackColor, setSnackColor] = React.useState("")

  // useEffect's
  React.useEffect(() => {
    loadData()
    document.getElementById('hd3').scrollIntoView();
  }, [location]);

  React.useEffect(() => {
    if (selectedCountry === null && selectedGenre === null && country !== null && genre !== null) {
      updateChart()
    }
    if (selectedCountry !== country || selectedGenre !== genre) {
      setBtnDisabled(false)
    }
    else {
      setBtnDisabled(true)
    }
  }, [country, genre])

  React.useEffect(() => {
    loadGenres()
  }, [country])

  React.useEffect(() => {
    if(mapFollowedShows){
      getFollowedShowsChartData()
    }
  }, [mapFollowedShows])

  const loadData = () => {
    if (location) {
      if(token){
        getFollowedShowsData()
        getCountriesData()
      }
    }
  }

  const loadGenres = () => {
    setGenreLoader(true)
    if (country) {
      getGenres(country)
    }
  }

  const getFollowedShowsData = () => {
    setTableLoader(true)
    axios.get("/shows/followed", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res.data);
      let map = {}
      res.data.followed_shows.forEach(s => {
        map[s.id] = s.name
      })
      setMapFollowedShows(map)
      setshowsFollowed(res.data.followed_shows);
      setTableLoader(false)
    })
    .catch((err) => console.log(err));
  }

  const getFollowedShowsChartData = () => {
    axios.get('/followed-shows-prhistory', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res => {
      // console.log(res.data)
      let showIds = Object.keys(res.data)
      if(showIds.length){
        let dates = res.data[showIds[0]].map(d => {
          let day = d.updated__date.slice(8, 10)
          let month = parseInt(d.updated__date.slice(5, 7))
          return `${months[month-1]} ${day}`
        })
        let chartD = showIds.map(id => {
          let rankings = res.data[id].map(r => {
            return r.score
          })
          return {
            data: rankings,
            label: mapFollowedShows[id],
            lineTesion: 0,
            fill: false,
            borderColor: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`,
            spanGaps: true
          }
        })
        // console.log(dates);
        // console.log(chartD);
        setFollowedShowsPAIChart({
          xAxis: dates,
          yAxis: chartD
        })
      }else{
        setFollowedShowsPAIChart(null)
      }
    })
    .catch(err => console.log(err))
  }

  const getCountriesData = () => {
    axios.get('/fcountriesfilter', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      res.data = res.data.queryset
      let sortedData = [...res.data].sort((a, b) => (b[0].length === 2 ? b[1] : b[0]) < (a[0].length === 2 ? a[1] : a[0]) ? 1 : -1);
      sortedData = sortedData.map(d => { return { name: (d[0].length === 2 ? d[1] : d[0]) } })
      setCountries(sortedData)
      let locationAvailable = false
      let localStorageLocationPresent = false
      sortedData.forEach(s => {
        if (s.name === location) {
          locationAvailable = true
        }
        if (localStorage.getItem("country") && s.name === localStorage.getItem("country")) {
          localStorageLocationPresent = true
        }
      })
      if(sortedData.length){
        if (locationAvailable) {
          setCountry(location)
          getGenres(location)
        }
        else if (localStorageLocationPresent) {
          setCountry(localStorage.getItem("country"))
          getGenres(localStorage.getItem("country"))
        }
        else {
          setCountry(sortedData[0]["name"])
          getGenres(sortedData[0]["name"])
        }
      }
      document.getElementById('hd3').scrollIntoView();
    })
    .catch(err => console.log(err))
  }

  const getGenres = ctry => {
    axios.get(`/fgenresfilter?country=${ctry}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      res.data = res.data.queryset
      let sortedData = [...res.data].sort((a, b) => (isNaN(b[0]) ? b[0] : b[1]) < (isNaN(a[0]) ? a[0] : a[1]) ? 1 : -1);
      sortedData = sortedData.map(d => { return { name: (isNaN(d[0]) ? d[0] : d[1]) } })
      setGenres(sortedData)
      setGenre(sortedData[sortedData.length-1]["name"])
      setGenreLoader(false)
    })
    .catch(err => console.log(err))
  }

  const updateChart = () => {
    if (location) {
      const token = localStorage.getItem("access_token");
      if (country && genre && showsFollowed) {
        axios.get(`/shows/followed/history?country=${country}&genre=${genre}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(res => {
          setSelectedCountry(country)
          setSelectedGenre(genre)
          setBtnDisabled(true)
          cleanData(res.data)
        })
        .catch(err => console.log(err))
      }
    }
  }

  const cleanData = data => {
    // console.log(data);
    let validShowData = showsFollowed.map(show => data[show.id].length ? { name: show.name, id: show.id } : null)
    validShowData = validShowData.filter(show => show)
    let maxLengthId = 0
    validShowData.map(s => {
      if (data[s.id].length > maxLengthId) {
        maxLengthId = s.id
      }
      return null
    })
    if (validShowData.length) {
      setMessage("")
      let labelForChart = data[maxLengthId].map(i => {
        const newDate = new Date(i.updated.substring(0, 10) + "T00:00:00");
        return `${months[newDate.getMonth()]} ${newDate.getDate()}`
      })
      const chartD = validShowData.map(show => {
        const currentValue = data[show.id]
        let indOfDash = show.name.indexOf('-')
        if (indOfDash !== -1) {
          show.name = show.name.slice(0, indOfDash - 1)
        }
        let rankings = labelForChart.map(i => null)
        currentValue.map(v => {
          let checkDate = new Date(v.updated.substring(0, 10) + "T00:00:00")
          checkDate = `${months[checkDate.getMonth()]} ${checkDate.getDate()}`
          if (labelForChart.includes(checkDate)) {
            const position = labelForChart.indexOf(checkDate)
            rankings[position] = v.ranking
          }
          return null
        })
        return {
          data: rankings,
          label: show.name,
          lineTesion: 0,
          fill: false,
          borderColor: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`,
          spanGaps: true
        }
      })
      // console.log(chartD);
      setChartData({
        xAxis: labelForChart,
        yAxis: chartD
      })
    }
    else {
      setChartData(null)
      setMessage("No data exists for this country and category!")
    }
  }

  const handleGenerateReportNow = id => {
    axios.get(`/users/reportnow?show_id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setSnackMessage("We have sent your reports via email.")
      setSnackColor('success')
      setSnackOpen(true)
    })
    .catch(err => {
      setSnackMessage("Some error occured while sending your reports by mail! Please try again in some time.")
      setSnackColor('error')
      setSnackOpen(true)
      console.log(err)
    })
    
  }

  const enableReport = id => {
    axios.post('/shows/followed', {
      id: id,
      report_status: 1
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      getFollowedShowsData()
    })
    .catch(err => console.log(err))
  }

  const disableReport = id => {
    axios.delete('/shows/followed', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data:{
        id: id,
        report_status: 2
      }
    })
    .then(res => {
      getFollowedShowsData()
    })
    .catch(err => console.log(err))
  }

  const seeReportNow = id => {
    let newWindow = window.open()
    axios.get(`/users/reportview?show_id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob'
    })
    .then(res => {
      //Create a Blob from the PDF Stream
      const file = new Blob(
        [res.data], 
        {type: 'application/pdf'});
      //Build a URL from the file
      const fileURL = URL.createObjectURL(file);
      //Open the URL on new Window
      newWindow.location = fileURL;
    })
    .catch(err => {
      newWindow.close()
      setSnackMessage("Some error occured while opening your report! Please try again in some time.")
      setSnackColor('error')
      setSnackOpen(true)
      console.log(err)
    })
  }

  return (
    <div className={classes.wrapperDiv}>
      <GridContainer>
        <Helmet>
          <title>My Follows | Podminer</title>
          <meta name="description" content="My Follows | Podminer - iTunes Spotify Google Podcast Rankings" />

          <meta name="og:title" property="og:title" content=" My Follows Shows - Podminer "></meta>
          <meta name="og:description" property="og:description" content=" Shows Followed by User - Podminer"></meta>
          <meta property="og:url" content="http://www.podminer.com" />
          <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                
          <meta name="og:image:alt" content="Podminer Logo" />
				  <meta property="og:site_name" content="Podminer, Pikkal & Co." /> 
        </Helmet>
      </GridContainer>
      <Box>
        <GridContainer>
          {
            localStorage.getItem("refresh_token") ?
              (
                <GridItem xs={12} sm={12} md={12}>
                  <Card>
                    <CardHeader color="primary" className={followShowsStyle.cardStyles}>
                      <p className={followShowsStyle.cardTitleWhite}>
                        Followed Shows
                      </p>
                    </CardHeader>
                    <CardBody>
                      {
                        tableLoader ?
                          <div className={followShowsStyle.loaderDiv}>
                            <CircularProgress color='primary' />
                          </div> :
                          (showsFollowed.length ?
                            <Table
                              tableHeaderColor="charcoal"
                              tableHead={["Podcast", "Unfollow", "Report", "Ref"]}
                              tableType="showsFollowed"
                              tableData={showsFollowed}
                              enableReport={enableReport}
                              disableReport={disableReport}
                              seeReportNow={seeReportNow}
                              generateReportNow={handleGenerateReportNow}
                              updatePage={getFollowedShowsData}
                            /> :
                            <div className={followShowsStyle.noResultFound}>You haven't followed any shows yet!</div>
                          )
                      }
                    </CardBody>
                  </Card>
                </GridItem>
              ) :
              (
                <Gateway small/>
              )
          }
          {
            localStorage.getItem("refresh_token") && location && showsFollowed && showsFollowed.length ?
            (
              <GridItem style={{ marginBottom: "2.5em" }} xs={12} sm={12} md={12}>
                <Card>
                  <CardHeader color="primary" className={followShowsStyle.cardStyles}>
                    <p className={followShowsStyle.cardTitleWhite}>
                      My Follows: Apple Podcast Rankings
                    </p>
                  </CardHeader>
                  <CardBody>
                    <div className={followShowsStyle.chartContainer}>
                      {user && countries && country && (
                        <>
                          <Dropdown
                            items={countries}
                            label={"Country"}
                            defaultValue={country}
                            changeValue={(country) => setCountry(country)}
                          />
                        </>
                      )}
                      {
                        genreLoader ?
                          (
                            <CircularProgress color='primary' style={{ marginLeft: "2em" }} />
                          ) :
                          (
                            <>
                              <Dropdown
                                items={genres}
                                label={"Category"}
                                defaultValue={genre}
                                changeValue={(genre) => setGenre(genre)}
                              />
                            </>
                          )
                      }
                    </div>
                    {countries && genres && (
                      <>
                        {btnDisabled ? (
                          <Button
                            color="primary"
                            className={followShowsStyle.chartContainerButton}
                            disabled
                          >
                            Update Chart
                          </Button>
                        ) : (
                            <Button
                              color="primary"
                              className={followShowsStyle.chartContainerButton}
                              onClick={updateChart}
                            >
                              Update Chart
                            </Button>
                          )}
                      </>
                    )}
                    
                    {message !== "" ? (
                      <div
                        style={{
                          height: "20vh",
                          fontSize: "1.5rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {message}
                      </div>
                    ) : (
                        chartData &&
                        <FollowedShowsChart
                          xAxis={chartData.xAxis}
                          yAxis={chartData.yAxis}
                        />
                      )}
                  </CardBody>
                </Card>
              </GridItem>
            ) : null
          }
          {
            user && followedShowsPAIChart !== null ?
            (
              <GridItem style={{ marginBottom: "0em" }} xs={12} sm={12} md={12}>
                <Card>
                  <CardHeader color="primary" className={followShowsStyle.cardStyles}>
                    <p className={followShowsStyle.cardTitleWhite}>
                      My Follows: Daily PAI Scores
                    </p>
                  </CardHeader>
                  <CardBody>
                    <FollowedShowsChart
                      xAxis={followedShowsPAIChart.xAxis}
                      yAxis={followedShowsPAIChart.yAxis}
                      pai
                    />
                  </CardBody>
                </Card>
              </GridItem>
            ) : null
          }
        </GridContainer>
        <Snackbar open={snackOpen} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} autoHideDuration={5000} onClose={() => setSnackOpen(false)}>
          <Alert onClose={() => setSnackOpen(false)} severity={snackColor}>
            {snackMessage}
          </Alert>
        </Snackbar>
      </Box>
      <Footer/>
    </div>
  );
}

export default Dashboard;
