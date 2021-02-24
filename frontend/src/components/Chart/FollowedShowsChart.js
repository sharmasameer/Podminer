import React from 'react'
import styles from './Chart.module.scss'
import { Line } from 'react-chartjs-2'

const FollowedShowsChart = props => {
    const data = {
        labels: props.xAxis,
        datasets: [...props.yAxis]
    };

    const legend = {
        display: true,
        position: "bottom",
        labels: {
            fontColor: "#323130",
            fontSize: 14
        }
    };
    
    const options = {
        maintainAspectRatio: false,
        tooltips: {
            displayColors: false,
            callbacks: {
                title: (tooltipItem) => {
                    return `${tooltipItem[0].xLabel}`
                },
                label: (tooltipItem) => {
                    return `Rank: ${tooltipItem.yLabel}`
                }
            }
        },
        scales: {
            xAxes: [
                {
                  ticks: {
                    maxTicksLimit: 20
                  }
                }
            ],
            yAxes: [
                {
                    ticks: {
                        min: props.pai ? 0 : 1,
                        reverse: props.pai ? false : true,
                        precision: 0
                    }
                }
            ]
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    }

  return (
    <div className={styles.followedShowsChartContainer}>
      <Line id="myChart" data={data} legend={legend} options={options} />
    </div>
  )
}

export default FollowedShowsChart
