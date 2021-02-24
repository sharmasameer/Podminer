import { CircularProgress } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import axios from "axios";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import AdminChart from "components/Chart/AdminChart";
import Dropdown from "components/Dropdown/Dropdown";
import Footer from "components/Footer/Footer";
import Gateway from "components/Gateway/Gateway";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PodHeader from "components/PodHeader/PodHeader.js";
import Table from "components/Table/Table.js";
import { LocationContext } from "context/locationContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import pptxgen from "pptxgenjs";
import React from "react";
import Helmet from "react-helmet";
import { useParams } from "react-router-dom";
import { months } from "variables/months";
import styles from "views/TableList/TableList.module.scss";
import ShowRankingsChart from "../../components/Chart/ShowRankingsChart";
import HeatMap from "../../components/WorldMap/HeatMap";

export default function ShowRankings({ history }) {
  let { showId } = useParams()

  const [loading, setLoading] = React.useState(false)
  const [showData, setShowData] = React.useState(null)
  const [heatmapData, setHeatmapData] = React.useState(null)

  const [countries, setCountries] = React.useState([])
  const [genres, setGenres] = React.useState([])

  const [country, setCountry] = React.useState("")
  const [genre, setGenre] = React.useState("")
  const [heatmapGenre, setHeatmapGenre] = React.useState("")

  const [prChart, setPrChart] = React.useState({
    dates: [],
    scores: []
  })

  const [prChartError, setPrChartError] = React.useState(false)

  const [data, setData] = React.useState({
    dates: [],
    rankings: [],
  });

  const [message, setMessage] = React.useState("");

  const { location } = React.useContext(LocationContext)
  const scrollRef = React.useRef(null)
  const [contentLocked, setContentLocked] = React.useState(false)

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, true)
  }, [])

  React.useEffect(() => {
    setLoading(true);
    if (location) {
      axios.get("/podminer/rankings", {
        params: {
          show_id: showId,
        },
      })
      .then((res) => {
        console.log(res.data);
        setHeatmapData(res.data)
        setShowData(res.data);
        cleanData(res.data);
        setLoading(false)
      })
      .catch((err) => console.log(err));

      axios.get(`/fastpowerrankingshistory?show_id=${showId}`)
      .then(res => {
        console.log(res.data);
        let prData = res.data.queryset
        let dates = []
        let scores = []
        prData.forEach(d => {
          let date = d.updated__date.split('-')
          let month = months[parseInt(date[1])-1]
          dates.push(`${month} ${date[2]}`)
          scores.push(d.score)
        })
        setPrChart({
          ...prChart,
          dates: dates,
          scores: scores
        })
      })
      .catch(err => {
        console.log(err);
        setPrChartError(true)
      })
    }
    document.getElementById('hd3').scrollIntoView();
  }, [location]);

  React.useEffect(() => {
    loadChart();
  }, [country, genre]);

  const cleanData = data => {
    let countryData = data.map((d) => d.country);
    let genreData = data.map((d) => d.genre);
    countryData = countryData.filter(
      (d, ind) => countryData.indexOf(d) === ind
    );
    genreData = genreData.filter((d, ind) => genreData.indexOf(d) === ind);
    countryData = countryData.sort((a, b) => (b < a ? 1 : -1));
    genreData = genreData.sort((a, b) => (b < a ? 1 : -1));
    if (countryData.includes(localStorage.getItem("country"))) {
      setCountry(localStorage.getItem("country"));
    } else {
      if (location && countryData.includes(location)) {
        setCountry(location)
      }
      else {
        setCountry(countryData[0]);
      }
    }
    setGenre(genreData[genreData.length - 1])
    if (heatmapGenre === "") {
      setHeatmapGenre(genreData[genreData.length - 1])
    }
    countryData = countryData.map((d) => {
      return { name: d };
    });
    genreData = genreData.map((d) => {
      return { name: d };
    });
    setCountries(countryData);
    setGenres(genreData);
  };

  const loadChart = () => {
    if (country && genre) {
      axios
        .get(
          `/podminer/history?country=${country}&genre=${genre}&show_id=${showId}`
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.length !== 0) {
            setMessage("");
            const data = res.data.sort((a, b) => {
              const date1 = new Date(a.updated);
              const date2 = new Date(b.updated);
              return date2 < date1 ? 1 : -1;
            });
            const rankings = data.map((d) => +d.ranking);
            const dates = data.map((d) => {
              const date = new Date(d.updated.substring(0, 10) + "T00:00:00");
              return `${months[date.getMonth()]} ${date.getDate()}`;
            });
            setData({
              ...data,
              dates: dates,
              rankings: rankings,
            });
          } else {
            setMessage("No data exists for this country and category!");
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const exportPDF = () => {
    if (!localStorage.getItem("refresh_token")) {
      history.push('/login')
      return
    }
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);


    var lMargin = 15; //left margin in mm
    var rMargin = 15; //right margin in mm
    var pdfInMM = 500;  // width of A4 in mm

    doc.setFontSize(15);
    try {
      doc.addImage(showData[0].show_data.image_link, 'JPEG', 40, 20, 100, 100);
    }
    catch {
      console.log("no image found");
    }
    const title = showData[0].show_data.name;
    const description = showData[0].show_data.description;
    const splitTitle = doc.splitTextToSize(title, 300);
    const headers = [["Rank", "Apple Podcasts"]];
    const graphheaders = [["Apple Podcast Rankings"]]
    const lines = doc.splitTextToSize(description, (550));
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yy = String(today.getFullYear());

    const data = showData.map(elt => [elt.ranking, elt.genre + " | " + elt.country]);

    try {
      var url_base64 = document.getElementById('myChart').toDataURL('image/png');
      doc.addImage(url_base64, 'PNG', 35, 170, 520, 200);
    }
    catch {
      doc.setFontSize(13)
      doc.text('No data exists for this category/genre', 200, 260);
    }

    let content = {
      startY: 365,
      head: headers,
      body: data
    };

    let graphcontent = {
      startY: 130,
      head: graphheaders
    }
    doc.setFontSize(15)
    doc.text(splitTitle, 155, 40);
    doc.setFontSize(10);
    doc.text(" A Pikkal & Co Analytics Report Generated on " + dd + "-" + mm + "-" + yy, 155, 100)
    doc.text(country + " | " + genre, 48, 165)
    doc.autoTable(graphcontent);
    doc.autoTable(content);
    doc.save(dd + "-" + mm + "-" + yy + "-" + showData[0].show_data.name.substring(0, 15) + ".pdf")
  }

  const exportPPT = () => {
    if (!localStorage.getItem("refresh_token")) {
      history.push('/login')
      return
    }
    let pres = new pptxgen();
    let slide = pres.addSlide({ fill: "F5F5F5" });
    let data = showData.map(elt => [elt.ranking, elt.genre + " | " + elt.country]);
    let title = showData[0].show_data.name;
    let legend = country + " | " + genre;
    let titleStyle = { x: 2.6, y: .5, w: "60%", fontFace: "Monserrat", autoFit: true, bold: true };
    let legendStyle = { x: "0.5", y: "50%", w: "60%", fontFace: "Monserrat", fontSize: 13, autoFit: true };
    let description = showData[0].show_data.description.substring(0, 250) + "...";
    let descStyle = { x: 2.6, y: 1.3, w: "60%", fontSize: 11 };
    let repdateStyle = { x: 2.6, y: 2.0, w: "60%", fontSize: 11 };
    let nodata = "No data exsists for this country / genre!"
    let nodataStyle = { x: "30%", y: "75%", w: "60%", fontFace: "Monserrat", fontSize: 13, autoFit: true };
    try {
      var url_base64 = document.getElementById('myChart').toDataURL('image/png');
      slide.addImage({ path: url_base64, x: "0.4", y: "52%", w: "90%", h: "50%", sizing: { w: 20, h: 5 } })
    }
    catch {
      slide.addText(nodata, nodataStyle);
    }
    let graphheader = [["Apple Podcast Rankings"]]
    let header = [["Rank", "Apple Podcasts"]]
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yy = String(today.getFullYear());
    let repdate = "A Pikkal & Co Analytics Report Generated on " + dd + "-" + mm + "-" + yy;
    let rows = data;
    slide.addImage({ path: showData[0].show_data.image_link, x: 0.5, y: 0.3, sizing: { type: 'cover', w: 1.8, h: 1.8 } })
    slide.addText(title, titleStyle);
    slide.addText(legend, legendStyle);
    slide.addText(description, descStyle);
    slide.addText(repdate, repdateStyle);
    slide.addTable(graphheader, { x: "0.5", y: "41%", w: "90%", h: "5%", autoPage: true, fill: "f5f5f5", fontFace: "Monserrat", fontSize: 16, bold: true, margin: "0.5" });
    let slide2 = pres.addSlide({ fill: "F5F5F5" });
    slide2.addTable(header, { colW: [1.5, 7.0], x: "0.5", y: "5%", w: "100%", h: "5%", autoPage: true, fill: "f5f5f5", fontFace: "Monserrat", fontSize: 16, bold: true, margin: "0.5" });
    slide2.addTable(rows, { colW: [1.5, 7.0], y: "10%", w: "100%", newPageStartY: "5", autoPage: true, fill: "f5f5f5", margin: "0.1", rowspan: 2, fontSize: 16 });
    pres.writeFile(dd + "-" + mm + "-" + yy + "-" + showData[0].show_data.name.substring(0, 15))
  }

  const handleScroll = e => {
    if(!localStorage.getItem("refresh_token")){
      if(scrollRef && scrollRef.current && scrollRef.current.children[0] && scrollRef.current.children[0].children[2] && scrollRef.current.children[0].children[2].children[2] && scrollRef.current.children[0].children[2].children[2].getBoundingClientRect().top < -450){
        setContentLocked(true)
      }
      else{
        setContentLocked(false)
      }
    }
  }

  return (
    <div ref={scrollRef}>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress color="primary" />
        </div>
      ) : (
          <div style={{ marginTop: "40px" }}>
            <a
              href="#"
              rel="nofollows noopener noreferrer"
              onClick={() => history.goBack()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginBottom: "1rem",
                color: "#36454F",
                textDecoration: "none"
              }}
            >
              <ArrowBackIcon />
              <span style={{ marginLeft: ".8rem" }}>Back to List</span>
            </a>
            {
              showData && showData[0] && showData[0].show_data && (
                <PodHeader
                  title={showData[0].show_data.name}
                  exportPDF={() => exportPDF()}
                  exportPPT={() => exportPPT()}
                  description={showData[0].show_data.description}
                  image={showData[0].show_data.image_link}
                  id={showData[0].show_data.id}
                />
              )
            }
            <Helmet>
              {
                showData && showData[0]?.show_data &&
                (
                  <title>
                    {
                      showData[0]?.show_data.name.slice(0, 35) + (showData[0]?.show_data.name.length > 36 ? ".." : "")
                    }
                    {" "}
                    Podcast Rankings - Podminer
                  </title>
                )
              }
              <meta
                name="description"
                content="Podcast Rankings | Podminer - itunes spotify google podcast rankings"
              />

              <meta name="og:title" property="og:title" content=" Podcast Rankings - Podminer "></meta>
              <meta name="og:description" property="og:description" content="Podcast Rankings  | Podminer - itunes spotify google podcast rankings"></meta>
              <meta property="og:url" content="http://www.podminer.com" />
              <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
                
              <meta name="og:image:alt" content="Podminer Logo" />
				      <meta property="og:site_name" content="Podminer, Pikkal & Co." /> 
            </Helmet>
            {
              showData && showData.length ?
                (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                          <p className={styles.cardTitleWhite}>
                            Daily PAI Score
                          </p>
                        </CardHeader>
                        <CardBody>
                          {
                            prChart.dates.length ? (
                              <AdminChart
                                xAxis={prChart.dates}
                                yAxis={prChart.scores}
                              />
                            ) : (
                              prChartError ?
                              <p style={{fontSize: '1.5rem', margin: '2em !important'}}>No data available for this podcast!</p> :
                              <div className={styles.loaderDiv}>
                                <CircularProgress color="primary" />
                              </div>
                            )
                          }
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                          <p className={styles.cardTitleWhite}>
                            Apple Podcast Rankings
                          </p>
                        </CardHeader>
                        <CardBody>
                          <div className={styles.chartContainer}>
                            {countries && countries.length && (
                              <>
                                <Dropdown
                                  items={countries}
                                  label={"Country"}
                                  defaultValue={country}
                                  changeValue={(country) => setCountry(country)}
                                  disabled={localStorage.getItem("refresh_token") ? false : true}
                                />
                              </>
                            )}
                            {genres && (
                              <>
                                <Dropdown
                                  items={genres}
                                  label={"Category"}
                                  defaultValue={genre}
                                  changeValue={(genre) => setGenre(genre)}
                                  disabled={localStorage.getItem("refresh_token") ? false : true}
                                />
                              </>
                            )}
                          </div>
                          {
                            message !== "" ? (
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
                              <ShowRankingsChart
                                xAxis={data.dates}
                                yAxis={data.rankings}
                                country={country}
                                genre={genre}
                              />
                            )
                          }
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardHeader color="primary" className={styles.cardStyles}>
                          <p className={styles.cardTitleWhite}>
                            Podcast Rankings By Country
                          </p>
                        </CardHeader>
                        <CardBody>
                          {genres && (
                            <>
                              <Dropdown
                                items={genres}
                                label={"Category"}
                                defaultValue={heatmapGenre}
                                changeValue={g => setHeatmapGenre(g)}
                              />
                            </>
                          )}
                          {
                            heatmapData && heatmapData.length &&
                            <HeatMap genre={heatmapGenre} rankingMapData={heatmapData} />
                          }
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        {!showData && (
                          <CardHeader color="primary" className={styles.cardStyles}>
                            <p className={styles.cardTitleWhite}>
                              No rankings for this show
                            </p>
                          </CardHeader>
                        )}
                        <CardBody>
                          {showData && showData.length && (
                            <Table
                              tableHeaderColor="charcoal"
                              tableHead={["Rank", "Apple Podcasts", "Ref"]}
                              tableType={"showrankings"}
                              tableData={showData}
                            />
                          )}
                          {
                            contentLocked ? (
                              <Gateway />
                            ) : null
                          }
                        </CardBody>
                      </Card>
                      <Footer/>
                    </GridItem>
                  </GridContainer>
                ) :
                (
                  <div className={styles.noResultFound}>
                    No data available for this show!
                  </div>
                )
            }
          </div>
        )}
    </div>
  )
}
