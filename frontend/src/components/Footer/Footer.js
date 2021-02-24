import React from "react";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    footer: {
        textAlign: 'center',
        padding: '0',
        bottom: '0'
    },
    sourceLink: {
        color: 'black',
        fontSize: 'medium',
        '&:hover': {
            color: 'black',
          textDecoration: 'underline',
        },
    },
}));


export default function Footer(){
    const classes = useStyles();
    return(
        <footer className={classes.footer}>
            <p><strong>Podminer</strong> by <a href="https://www.pikkal.com" target="_blank" className={classes.sourceLink}>Pikkal & Co</a></p>
        </footer>
    )
}