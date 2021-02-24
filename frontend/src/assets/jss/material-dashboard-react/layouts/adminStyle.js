import {
  drawerWidth,
  transition,
} from "assets/jss/material-dashboard-react.js";

const appStyle = theme => ({
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh"
  },
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch",
    overflowX: "hidden"
  },
  content: {
    marginTop: "10px",
    padding: "10px 20px",
    minHeight: "calc(100vh - 123px)",
  },
  container: {
    marginTop: "12px"
  },
  map: {
    marginTop: "70px"
  }
});

export default appStyle;
