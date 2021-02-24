import React from 'react'
import CircularProgress from "@material-ui/core/CircularProgress"

const Loader = () => {
    return (
        <div style={{
            height: "100vh", 
            width: "100%", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center"
        }}>
            <CircularProgress color="primary" />
        </div>
    )
}

export default Loader
