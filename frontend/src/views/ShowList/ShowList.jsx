import { Grid } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import CachedIcon from "@material-ui/icons/Cached";
import Search from "@material-ui/icons/Search";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import RegularButton from "components/CustomButtons/Button";
import Footer from "components/Footer/Footer";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Table from "components/Table/Table.js";
import { UserContext } from "context/userContext";
import { usePagination } from "Hooks/usePagination";
import React, { useState } from "react";
import Helmet from "react-helmet";
import styles from "../TableList/TableList.module.scss";

export default function ShowList() {
  const { user } = React.useContext(UserContext);

  const [search, setSearch] = useState("");
  const [loadMore, setLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  //fetchData usePagination(url<String>,search<String>,page<Number>,loadMore<bool>)
  const { state: shows, loading, error, hasMore, setFetchData } = usePagination(
    `/shows?&page_size=${10}`,
    search,
    page,
    loadMore
  );

  //handle new search
  const handleSearch = (e) => {
    setPage(1);
    setLoadMore(false);
    setSearch(e.target.value);
    setFetchData(true);
  };

  const handleLoadMore = () => {
    setLoadMore(true);
    setPage((page) => page + 1);
  };

  return (
    <Box >
      <GridContainer>
        <Helmet>
          <title>Search Podcast Show Rankings | Podminer </title>
          <meta
            name="description"
            content="Search Podcast Show Rankings | Podminer - iTunes Spotify Google Podcast Rankings"
          />
          <meta name="og:title" property="og:title" content="Search podcast show rankings - Podminer"></meta>
          <meta name="og:description" property="og:description" content="Search podcast show rankings | Podminer - itunes spotify google podcast rankings"></meta>
          <meta property="og:url" content="http://www.podminer.com" />
          <meta property="og:image" content="https://podminer.com/static/media/asset0.c417b5cf.png" />
          <meta name="og:image:alt" content="Podminer Logo" />
          <meta property="og:site_name" content="Podminer, Pikkal & Co." />
        </Helmet>
        <Box className={styles.searchBox} m={2}>
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
              label="Search Podcast"
              id="searchbar"
              type={"search"}
              value={search}
              style={{ width: "20vw" }}
              onChange={handleSearch}
            />
          </form>
        </Box>
        <GridItem xs={12} sm={12}>
          <Card>
            <CardHeader color="primary" className={styles.cardStyles}>
              <p className={styles.cardTitleWhite}>Podcasts</p>
            </CardHeader>
            <CardBody>
              <>
                {shows?.length === 0 && !loading ? (
                  <CardBody>
                    <div className={styles.noResultFound}>
                      Enter a keyword to see results
                    </div>
                  </CardBody>
                ) : loading && shows?.length === 0 ? (
                  <div className={styles.loaderDiv}>
                    <CircularProgress color="primary" />
                  </div>
                ) : (
                      <Grid
                        container
                        direction="column"
                        justify="space-between"
                        alignItems="center"
                      >
                        {
                          user ?
                            <Table
                              tableHeaderColor="charcoal"
                              tableHead={["Podcast", "Follow", "Ref"]}
                              tableType={"showlist"}
                              tableData={shows}
                            /> :
                            <Table
                              tableHeaderColor="charcoal"
                              tableHead={["Podcast", "", "Ref"]}
                              tableType={"showlist"}
                              tableData={shows}
                            />
                        }
                        <Box mt={2}>
                          {hasMore && (
                            <RegularButton
                              onClick={handleLoadMore}
                              variant="outlined"
                              color="primary"
                              startIcon={<CachedIcon />}
                            >
                              {loading ? "Loading..." : "Load More"}
                            </RegularButton>
                          )}
                        </Box>
                      </Grid>
                    )}
              </>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      <Footer/>
    </Box>
  );
}
