import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import AdminChart from 'components/Chart/AdminChart';
import React from 'react';
import { months } from "variables/months";
import styles from '../TableList/TableList.module.scss';
import Helmet from "react-helmet";
import Footer from 'components/Footer/Footer';

const UserMetrics = () => {
  const [chartData, setChartData] = React.useState(null)

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    axios.get('/podminer/user-metrics/stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        console.log(res.data)
        getChartData(res.data)
      })
      .catch(err => console.log(err))
  }, [])

  const getChartData = data => {
    const dates = data.map(d => {
      let dateArray = d.date.split("-")
      return `${months[dateArray[1] - 1]} ${dateArray[2]}`
    })
    const userCount = data.map(d => d.user_count)
    setChartData({ ...chartData, dates: dates, userCount: userCount })
  }

  return (
    <div>
      <Helmet>
        <title>User Metrics | Podminer </title>
        <meta
          name="description"
          content="User Metrics | Podminer - iTunes Spotify Google Podcast Rankings"
        />
        <meta name="og:title" property="og:title" content="User Metrics | Podminer"></meta>
        <meta name="og:description" property="og:description" content=" User Metrics | Podminer - itunes spotify google podcast rankings"></meta>
        <meta property="og:url" content="http://www.podminer.com" />
        <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
        <meta name="og:image:alt" content="Podminer Logo" />
        <meta property="og:site_name" content="Podminer, Pikkal & Co." />
      </Helmet>
      <Card>
        <CardHeader color="primary" className={styles.cardStyles}>
          <p className={styles.cardTitleWhite}>User Traffic on Site</p>
        </CardHeader>
        <CardBody>
          {
            chartData ?
              <AdminChart xAxis={chartData.dates} yAxis={chartData.userCount} admin/> :
              <div className={styles.loaderDiv}>
                <CircularProgress color='primary' />
              </div>
          }
        </CardBody>
      </Card>
      <Footer/>
    </div>
  )
}

export default UserMetrics
