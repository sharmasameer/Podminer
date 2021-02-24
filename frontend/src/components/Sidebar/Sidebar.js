/*eslint-disable*/
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Icon from "@material-ui/core/Icon";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/components/sidebarStyle.js";
import style from "./Sidebar.module.css";
import classNames from "classnames";
import RTLNavbarLinks from "components/Navbars/RTLNavbarLinks.js";
import PropTypes from "prop-types";
import React from "react";
import {Link, NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const useStyles = makeStyles(styles);
export default function Sidebar(props) {

  const { user } = React.useContext(UserContext)
  const location = useLocation()

  const classes = useStyles();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { color, logo, image, logoText, routes } = props;

  const closeDrawer = () => {
    if(props.open){
      props.handleDrawerToggle()
    }
  }

  var links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
        var activePro = " ";
        var listItemClasses;
        if (prop.path === "/upgrade-to-pro") {
          activePro = classes.activePro + " ";
          listItemClasses = classNames({
            [" " + classes[color]]: true
          });
        } else if (prop.path.includes('/rankings/') && location.pathname.includes('/rankings/')) {
          listItemClasses = classNames({
            [" " + classes[color]]: true
          });
        } 
        else {
          if((prop.path.includes('/top100/region') && location.pathname.includes('/top100/region')) || (prop.path.includes('/top100/category') && location.pathname.includes('/top100/category')) || (prop.path.includes('/top100/country') && location.pathname.includes('/top100/country'))){
            listItemClasses = classNames({
              [" " + classes[color]]: true
            });
          }
          else{
            if((prop.path === '/top100' && location.pathname.includes('/top100/region')) || (prop.path === '/top100' && location.pathname.includes('/top100/category')) || (prop.path === '/top100' && location.pathname.includes('/top100/country'))){
              listItemClasses = classNames({
                [" " + classes[color]]: false
              });
            }
            else{
              listItemClasses = classNames({
                [" " + classes[color]]: activeRoute(prop.path)
              });
            }
          }
        }
        const whiteFontClasses = classNames({
          [" " + classes.whiteFont]: activeRoute(prop.path)
        });
        if (prop.invisible) return null;
        if (!user) {
          if (prop.path === '/user' || prop.path === '/tasks' || prop.path === '/settings' || prop.path === '/logout' || prop.path === '/metrics' || prop.path === '/myfollows') return null;
        } else {
          if ((user.is_staff !== null && user.is_staff === false)) {
            if (prop.path === '/user' || prop.path === '/tasks' || prop.path === '/metrics') return null;
          }
          if (prop.path === '/login') return null;
        }
        return (
          <NavLink
            to={prop.path}
            className={prop.path !== '/logout' ? (prop.path !== '/tasks' ? (prop.path !== '/user' ? (prop.path !== '/metrics' ? (activePro + classes.item) : (`${activePro} ${classes.item} ${classes.metricsLink}`)) : (`${activePro} ${classes.item} ${classes.userLink}`)) : (`${activePro} ${classes.item} ${classes.tasksLink}`)) : `${activePro} ${classes.item} ${classes.logoutLink}`}
            activeClassName="active"
            key={key}
            onClick={closeDrawer}
          >
            <ListItem button className={classes.itemLink + listItemClasses}>
              {typeof prop.icon === "string" ? (
                <Icon
                  className={classNames(classes.itemIcon, whiteFontClasses, {
                    [classes.itemIconRTL]: props.rtlActive
                  })}
                >
                  {prop.icon}
                </Icon>
              ) : (
                  <prop.icon
                    className={classNames(classes.itemIcon, whiteFontClasses, {
                      [classes.itemIconRTL]: props.rtlActive
                    })}
                  />
                )}
              <ListItemText
                primary={props.rtlActive ? prop.rtlName : prop.name}
                className={classNames(classes.itemText, whiteFontClasses, {
                  [classes.itemTextRTL]: props.rtlActive
                })}
                disableTypography={true}
              />
            </ListItem>
          </NavLink>
        );
      })}
    </List>
  );
  var brand = (
    <div className={classes.logo}>
      <Link
        to="/"
        rel="nofollows noopener noreferrer"
        className={classNames(classes.logoLink, {
          [classes.logoLinkRTL]: props.rtlActive
        })}
      >
        <div className={classes.logoImage}>
          <img src={logo} alt="logo" className={classes.img} />
        </div>
        {logoText}
      </Link>
    </div>
  );
  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={props.rtlActive ? "left" : "right"}
          open={props.open}
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive
            })
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>
            {props.rtlActive ? <RTLNavbarLinks /> : null}
            {links}
          </div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          anchor={props.rtlActive ? "right" : "left"}
          variant="permanent"
          open
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive
            })
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>{links}</div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool
};
