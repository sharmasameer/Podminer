import React from 'react'
import styles from './Chart.module.scss'
import { Line } from 'react-chartjs-2'

const AdminChart = props => {
  const [width, setWidth] = React.useState(window.innerWidth)

  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions)
  }, [])

  const updateDimensions = () => {
    setWidth(window.innerWidth)
  }

  const data = {
    labels: props.xAxis,
    datasets: [{
      fill: 'start',
      backgroundColor: 'rgba(255, 162, 0, 0.6)',
      borderColor: 'rgba(255, 162, 0, 1)',
      borderCapStyle: 'butt',
      pointBorderColor: 'rgba(255, 162, 0, 1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: width < 600 ? 3 : 5,
      pointHoverBackgroundColor: 'rgba(255, 162, 0, 1)',
      pointHoverBorderColor: 'rgba(255, 162, 0, 1)',
      pointHoverBorderWidth: 2,
      pointRadius: width < 600 ? 3 : 5,
      pointHitRadius: width < 600 ? 6 : 10,
      data: props.yAxis
    }]
  };

  const legend = {
    display: false
  };

  const options = () => {
    let minValue = Math.min(...props.yAxis)
    if(minValue <= 10){
      minValue = 0
    }
    else{
      minValue = (parseInt(minValue / 10) - 1) * 10
      if(minValue === 0)
        minValue = 1
    }

    let maxValue = Math.max(...props.yAxis)
    if(maxValue <= 10){
      maxValue = 10
    }
    else{
      maxValue = (parseInt(maxValue / 10) + 1) * 10
    }

    return (
      {
        maintainAspectRatio: false,
        tooltips: {
          displayColors: false,
          callbacks: {
            label: (tooltipItem) => {
              return props.admin ? `# of Users: ${tooltipItem.yLabel}` : `PAI Score : ${tooltipItem.yLabel}`
            }
          }
        },
        scales: {
          xAxes: [
            {
              ticks: {
                maxTicksLimit: width < 600 ? (width < 400 ? 5 : 10) : 20
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                min: minValue,
                max: maxValue,
                precision: 0
              }
            }
          ]
        },
        layout: {
          padding: {
              left: width < 600 ? 0 : 20,
              right: width < 600 ? 0 : 20,
              top: width < 600 ? 0 : 20,
              bottom: width < 600 ? 0 : 20
          }
        }
      }
    )
  }

  return (
    <div className={styles.chartContainer}>
      <Line data={data} legend={legend} options={options()} />
    </div>
  )
}

export default AdminChart
