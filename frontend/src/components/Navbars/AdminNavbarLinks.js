import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Divider from "@material-ui/core/Divider";
import Grow from "@material-ui/core/Grow";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Poppers from "@material-ui/core/Popper";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import classNames from "classnames";
import React from "react";
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axios from 'axios'

const useStyles = makeStyles(styles);

export default function AdminNavbarLinks() {
  
  const { user, setUser } = React.useContext(UserContext)
  const history = useHistory()
  const classes = useStyles();
  const [openProfile, setOpenProfile] = React.useState(null);
  const [hasToken, setHasToken] = React.useState(
    localStorage.getItem("refresh_token")
  );

  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

  React.useEffect(() => {
    if (localStorage.getItem('access_token')) {
			const token = localStorage.getItem('access_token')
			axios
				.get('/auth/current/', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					localStorage.setItem('id_token', res.data.id)
					setUser(res.data)
				})
				.catch((err) => console.log(err))
		}
  },[]);

  const OptionList = hasToken ? (
    <div>
      <MenuItem
        onClick={() => history.push(`/settings`) }
        className={classes.dropdownItem}
      >
        Settings
      </MenuItem>
      <Divider light />
      <MenuItem
        onClick={() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('username_token')
          localStorage.removeItem('email_token')
          localStorage.removeItem('firstname_token')
          localStorage.removeItem('lastname_token')
          localStorage.removeItem('data_token')
          setUser(null)
          history.push('/dashboard')
          window.location.reload()
        }}
        className={classes.dropdownItem}
      >
        Logout
      </MenuItem>
    </div>
  ) : (
    <MenuItem
      onClick={() => history.push('/login')}
      className={classes.dropdownItem}
    >
      Login
    </MenuItem>
  );

  return (
    <div>
      <div className={classes.manager}>
        <Poppers
          open={Boolean(openProfile)}
          anchorEl={openProfile}
          transition
          disablePortal
          className={
            classNames({ [classes.popperClose]: !openProfile }) +
            " " +
            classes.popperNav
          }
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="profile-menu-list-grow"
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom"
              }}
            >
              <Paper >
                <ClickAwayListener onClickAway={handleCloseProfile}>
                  <MenuList role="menu">
                    {OptionList}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Poppers>
      </div>
    </div>
  );
}
