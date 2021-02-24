// @material-ui/core components
import { FormControlLabel, Switch } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Block, Delete, Edit, Visibility, Clear } from "@material-ui/icons";
// core components
import s from "assets/jss/material-dashboard-react/components/tableStyle.js";
import axios from 'axios';
import PropTypes from "prop-types";
import React from "react";
import { Link, withRouter } from "react-router-dom";
import { UserContext } from '../../context/userContext';
import styles from './tableStyle.module.scss';
const useStyles = makeStyles(s);
function CustomTable({ tableHead, tableData, tableHeaderColor, tableType, enableReport, disableReport, seeReportNow, generateReportNow, revokeTask, history, updatePage }) {
  const classes = useStyles();
  const { user, loadUserData } = React.useContext(UserContext)

  function renderTableData(prop,key) {
    if(tableType==='rankings') {
      return (
        <>
          <TableCell className={styles.tableCell}>{prop.ranking}
            {
              (prop.last_ranking==-1)? <span style={{ color: 'orange',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  NEW</span>:
                (prop.last_ranking-prop.ranking)>0? <span style={{ color: 'green',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▲{prop.last_ranking-prop.ranking}</span>:
                  (prop.last_ranking-prop.ranking)<0? <span style={{ color: 'red',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▼{prop.ranking-prop.last_ranking}</span>:
                    <span style={{ color: 'gray',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▶–</span>
            }
          </TableCell>
          <TableCell className={styles.tableCell2} style={{ cursor: 'pointer' }}>
            <Link to={'/podcast/'+prop.show__podcast_id+'/'+prop.show__slug}>
              {prop.show__name}
            </Link>
          </TableCell>
          <TableCell className={styles.tableCell}><a href={prop.store_url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>
      )
    }
    else if(tableType==="users") {
      return (
        <>
          <TableCell className={styles.tableCell}>{prop.username}</TableCell>
          <TableCell className={styles.tableCell}>{prop.first_name} {prop.last_name}</TableCell>
          <TableCell className={styles.tableCell}>{prop.email}</TableCell>
          <TableCell className={styles.tableCell}>{prop.is_staff? "True":"False"}</TableCell>
          <TableCell className={styles.tableCell}>
            {
              prop.is_superuser?
                <Block color="disabled" style={{ cursor: "not-allowed" }} />:
                (
                  <>
                    <Edit color="primary" onClick={() => prop.editUser(prop)} style={{ cursor: "pointer",marginRight: "10px" }} />
                    <Delete color="error" onClick={() => prop.deleteUser(prop)} style={{ cursor: "pointer" }} />
                  </>
                )
            }
          </TableCell>
        </>
      )
    }
    else if(tableType==="tasks") {
      let dc=new Date(prop.date_created);
      let dd=new Date(prop.date_done);
      return (
        <>
          <TableCell className={`${styles.tableCell} ${styles.shortenTableWidth}`} style={{ maxWidth: "12ch" }}>{prop.task_id}</TableCell>
          <TableCell className={styles.tableCell}>{`${prop.task_type[0].toUpperCase()}${prop.task_type.slice(1)}`}</TableCell>
          <TableCell className={`${styles.tableCell} ${styles.shortenTableWidth}`}>{`${dc.toDateString()} - ${dc.toTimeString().slice(0,8)}`}</TableCell>
          <TableCell className={`${styles.tableCell} ${styles.shortenTableWidth}`}>{`${dd.toDateString()} - ${dd.toTimeString().slice(0,8)}`}</TableCell>
          <TableCell className={styles.tableCell}>{prop.status}</TableCell>
          <TableCell className={styles.tableCell} style={{ cursor: "pointer" }}>
            <Link to={`/tasks/${prop.task_id}`}><Visibility /></Link>
            {
              prop.status === "PENDING" ?
              <Clear style={{marginLeft: '1em'}} color="error" onClick={() => revokeTask(prop.task_id)} /> : null
            }
          </TableCell>
        </>
      )
    }
    else if(tableType==='showlist') {
      return (
        <>
          <TableCell className={styles.tableCell2} style={{ cursor: 'pointer' }}>
            <Link to={'/podcast/'+prop.podcast_id+'/'+prop.slug}>
              {prop.name}
            </Link>
          </TableCell>
          <TableCell>
            {
              user ? 
              (user.shows_followed.find(show => show === prop.id) ? (
                <Button onClick={() => {
                  const token=localStorage.getItem("access_token");
                  axios.delete('/shows/followed',{
                    headers: {
                      Authorization: "Bearer "+token
                    },
                    data: {
                      id: prop.id
                    }
                  })
                    .then(res => {
                      loadUserData()
                    })
                    .catch(err => console.log(err))
                }}>Unfollow</Button>
              ) : (
                <Button onClick={() => {
                  const token=localStorage.getItem("access_token");
                  axios.post('/shows/followed', {
                    id: prop.id
                  }, {
                    headers: {
                      Authorization: "Bearer "+token
                    }
                  })
                    .then(res => {
                      loadUserData()
                    })
                    .catch(err => console.log(err))
                }}>Follow</Button>
              )) : null
            }
          </TableCell>
          <TableCell className={styles.tableCell}><a href={prop.url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>)
    } else if(tableType==='showsFollowed') {
      return (
        <>
          <TableCell className={styles.tableCell2} style={{ cursor: 'pointer' }}>
            <Link to={'/podcast/'+prop.podcast_id+'/'+prop.slug}>
              {prop.name}
            </Link>
          </TableCell>
          {
            user ? 
            <TableCell>
              {
                <Button onClick={() => {
                  const token=localStorage.getItem("access_token");
                  axios.delete('/shows/followed',{
                    headers: {
                      Authorization: "Bearer "+token
                    },
                    data: {
                      id: prop.id
                    }
                  })
                    .then(res => {
                      loadUserData()
                      updatePage()
                    })
                    .catch(err => console.log(err))
                  // window.location.reload()
                }}>Unfollow</Button> 
              }
            </TableCell> : null
          }
          {
            user ?
            <TableCell align="center">
              {
                <FormControlLabel
                  control = {
                    <Switch 
                      checked={prop.report_status === 1 ? true : false}
                      onChange={() => {
                        if(prop.report_status === 2){
                          enableReport(prop.id)
                        }
                        else{
                          disableReport(prop.id)
                        }
                      }}
                      color="primary"
                    />
                  }
                />
              }
            </TableCell> : null
          }
          {
            user ? 
            <TableCell align="center">
              {
                <Button onClick={() => generateReportNow(prop.podcast_id)}>Now</Button> 
              }
            </TableCell> : null
          }
          {
            user ? 
            <TableCell align="center">
              {
                <Button onClick={() => seeReportNow(prop.podcast_id)}>View</Button> 
              }
            </TableCell> : null
          }
          <TableCell className={styles.tableCell}><a href={prop.url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>)
    }
    else if(tableType==='showrankings') {
      return (
        <>
          <TableCell className={styles.tableCell}>{prop.ranking}
            {
              (prop.last_ranking==-1)? <span style={{ color: 'orange',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  NEW</span>:
                (prop.last_ranking-prop.ranking)>0? <span style={{ color: 'green',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▲{prop.last_ranking-prop.ranking}</span>:
                  (prop.last_ranking-prop.ranking)<0? <span style={{ color: 'red',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▼{prop.ranking-prop.last_ranking}</span>:
                    <span style={{ color: 'gray',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▶–</span>
            }
          </TableCell>
          <TableCell className={styles.tableCell}>
            <Link to={`/rankings/${prop.country}/${prop.genre}`}>
              {prop.genre+' | '+prop.country}
            </Link>
          </TableCell>
          <TableCell className={styles.tableCell}><a href={prop.store_url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>)
    }
    else if (tableType === "powerRankingsByRegion" || tableType === "powerRankingsByCategory" || tableType === "powerRankingsByCountry") {
      return (
        <>
          <TableCell className={styles.tableCell}>
            {prop.place}
            {
              (prop.lastplace===-1)? <span style={{ color: 'orange',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  NEW</span>:
                (prop.lastplace-prop.place)>0? <span style={{ color: 'green',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▲{prop.lastplace-prop.place}</span>:
                  (prop.lastplace-prop.place)<0? <span style={{ color: 'red',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▼{prop.place-prop.lastplace}</span>:
                    <span style={{ color: 'gray',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▶–</span>
            }
          </TableCell>
          <TableCell className={styles.tableCell2} style={{ cursor: 'pointer' }}>
            <Link to={'/podcast/' + prop.show__podcast_id + '/' + prop.show__slug}>
              {prop.show__name}
            </Link>
          </TableCell>
          
          <TableCell className={styles.tableCell}><a href={prop.show__url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>
      )
    }
    else if (tableType === 'powerrankings') {
      return (
        <>
          <TableCell className={styles.tableCell}>{prop.place}
          {
            (prop.lastplace===-1)? <span style={{ color: 'orange',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  NEW</span>:
              (prop.lastplace-prop.place)>0? <span style={{ color: 'green',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▲{prop.lastplace-prop.place}</span>:
                (prop.lastplace-prop.place)<0? <span style={{ color: 'red',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▼{prop.place-prop.lastplace}</span>:
                  <span style={{ color: 'gray',fontSize: 'small',fontStyle: 'cursive',display: 'flex' }}>  ▶–</span>
          }
          </TableCell>
          <TableCell className={styles.tableCell2} style={{ cursor: 'pointer' }}>
            <Link to={'/podcast/' + prop.show__podcast_id + '/' + prop.show__slug}>
              {prop.show__name}
            </Link>
          </TableCell>
          
          <TableCell className={styles.tableCell}><a href={prop.show__url} rel="nofollows noopener noreferrer" target="_blank">Store page</a></TableCell>
        </>
      )
    }
    else {
      prop.map((prop,key) => {
        return (
          <TableCell className={styles.tableCell} key={key}>
            {
              /^\d+$/.test(prop)? prop:<a href='#' rel="nofollows noopener noreferrer" style={{ color: 'grey' }}>{prop}</a>
            }
          </TableCell>
        );
      })
    }
  }

  return (
    <div className={styles.tableResponsive}>
      <Table className={styles.table}>
        {tableHead!==undefined? (
          <TableHead className={classes[tableHeaderColor+"TableHeader"]}>
            {
              tableType === "showsFollowed" ? 
              (
                <>
                  <TableRow className={styles.tableHeadRow}>
                    <TableCell className={styles.tableHeadCell} rowSpan={2}>Podcast</TableCell>
                    <TableCell className={styles.tableHeadCell} rowSpan={2}>Unfollow</TableCell>
                    <TableCell className={styles.tableHeadCell} style={{borderBottom: 0}} align="center" rowSpan={1} colSpan={3}>Reports</TableCell>
                    <TableCell className={styles.tableHeadCell} rowSpan={2}>Ref</TableCell>
                  </TableRow>
                  <TableRow className={styles.tableHeadRow}>
                    <TableCell className={styles.tableHeadCell} align="center">Monthly</TableCell>
                    <TableCell className={styles.tableHeadCell} align="center">Send Now</TableCell>
                    <TableCell className={styles.tableHeadCell} align="center">View</TableCell>
                  </TableRow>
                </>
              ) :
              (
                <TableRow className={styles.tableHeadRow}>
                  {
                    tableHead.map((prop,key) => {
                      return (
                        <TableCell
                          className={styles.tableHeadCell}
                          key={key}
                        >
                          {prop}
                        </TableCell>
                      );
                    })
                  }
                </TableRow>
              )
            }
          </TableHead>
        ):null}
        <TableBody>
          {tableData && tableData.length && tableData.map((prop,key) => {
            return (
              user ?
                (
                  tableType === "rankings"?
                  (
                    <TableRow key={key} className={user&&user.shows_followed&&user.shows_followed.includes(prop.show__id)? styles.followedShowsBgColor:(key%2? styles.stripedTableBodyRow:styles.tableBodyRow)}>
                      {renderTableData(prop,key)}
                    </TableRow>
                  ) :
                  (
                    (tableType==="powerrankings" || tableType === "powerRankingsByRegion" || tableType === "powerRankingsByCategory") ?
                      (
                        <TableRow key={key} className={user&&user.shows_followed&&user.shows_followed.includes(prop.show__id)? styles.followedShowsBgColor:(key%2? styles.stripedTableBodyRow:styles.tableBodyRow)}>
                          {renderTableData(prop,key)}
                        </TableRow>
                      ) :
                      (
                        tableType === "users" ?
                        (
                          <TableRow key={key} className={prop.is_staff ? styles.followedShowsBgColor : (key%2 ? styles.stripedTableBodyRow : styles.tableBodyRow)}>
                            {renderTableData(prop,key)}
                          </TableRow>
                        ) :
                        (
                          <TableRow key={key} className={key%2? styles.stripedTableBodyRow:styles.tableBodyRow}>
                            {renderTableData(prop,key)}
                          </TableRow>
                        )
                      )
                  )
                ) :
                (
                  <TableRow key={key} className={key%2? styles.stripedTableBodyRow:styles.tableBodyRow}>
                    {renderTableData(prop,key)}
                  </TableRow>
                )
            )
          })}
        </TableBody>
      </Table>

    </div>
  );
}

CustomTable.defaultProps={
  tableHeaderColor: "gray"
};

CustomTable.propTypes={
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
    "charcoal"
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  tableData: PropTypes.array,
  tableType: PropTypes.string
};

export default withRouter(CustomTable)
