import axios from 'axios';
import * as actions from "./actionTypes";

export const fetchGlobalTopHundred=()=> async(dispatch) => {
    try{
        const { data } = await axios.get('/globaltop100');
    if(data){
    dispatch({
        type: actions.FETCH_TOP_HUNDRED,
        payload:data.queryset,
        info : 'Get global top 100',
    });
    }
    else{
        throw "NO DATA FOUND";
    }
    } catch(error){
        console.log(error.message);
        dispatch({
            type: actions.SET_ERROR_TOP_HUNDRED,
        })
    }
}

export const fetchHotPodcast=()=> async(dispatch) => {
    try{
        const { data } = await axios.get('/hotfire');
        if(data){
            dispatch({
                type: actions.FETCH_HOT_PODCAST,
                payload:data.queryset,
                info : 'Get Hot podacasts',
            });
    }
    else{
        throw "NO DATA FOUND";
    }
    } catch(error){
        console.log(error.message);
        dispatch({
            type:actions.SET_ERROR_HOT_PODCAST,
        })
    }
}

export const fetchFeaturedShow=(pID)=> async(dispatch) => {
    try{
        const { data } = await axios.get("/podminer/rankings", {
            params: {
              show_id: pID,
            },
          });
    dispatch({
        type: actions.FETCH_FEATURED_SHOW,
        payload:data,
        info : 'Featured show',
    });
    } catch(error){
          console.log(error.message);
    }
}

export const setCountryFeaturedShow=(country)=>{
    return {
        type:actions.SET_COUNTRY_FEATURED_SHOW,
        payload:country,
    }
}

export const setGenreFeaturedShow=(genre)=>{
    return {
        type:actions.SET_GENRE_FEATURED_SHOW,
        payload:genre,
    }
}

export const setHeatMapFeaturedShow=(genre)=>{
    return {
        type:actions.SET_HEATMAP_GENRE_FEATURED_SHOW,
        payload:genre,
    }
}

export const fetchLoadChartFeaturedShow=(country,genre,pID)=> async(dispatch) => {
    try{
        const { data } = await axios.get(`/podminer/history?country=${country}&genre=${genre}&show_id=${pID}`)
    dispatch({
        type: actions.FETCH_LOADCHART_FEATURED_SHOW,
        payload:data,
    });
    } catch(error){
          console.log(error.message);
    }
}

export const fetchCountryGenre=()=> async(dispatch) => {
    try{
        const { data } = await axios.get(`/fcountrygenre`);

    dispatch({
        type: actions.FETCH_COUNTRY_GENRE,
        payload:data.queryset,
        info : 'Fetch genre',
    });
    } catch(error){
        console.log(error.message);
    }
}

export const setCountry=(country)=>{
    return {
        type:actions.SET_COUNTRY,
        payload:country,
        info: 'Sets the country',
    }
}

export const setRankingsCountry=(mapCountriesWithCode,country)=> async(dispatch) =>{
    try{
        const { data } = await axios.get(`/countrytop100?country_name=${mapCountriesWithCode[country]}`);

        if(data){
            dispatch({
                type: actions.SET_RANKINGS_COUNTRY,
                payload:data.queryset,
                info : 'Set Rankings',
            });
        }
        else{
            throw "NO DATA FOUND";
        }
    } catch(error){
        console.log(error.message);
        dispatch({
            type: actions.SET_ERROR_COUNTRY,
            info : 'dispatches when error',
        }); 
    }
}

export const fetchRegions=()=> async(dispatch) =>{
    try{
        const { data } = await axios.get(`/regions`);

    dispatch({
        type: actions.FETCH_REGIONS,
        payload:data.queryset,
        info : 'Fetches regions',
    });
    } catch(error){
        console.log(error.message);
    }
}

export const setRegion=(region)=>{
    return {
        type:actions.SET_REGION,
        payload:region,
        info: 'Sets the region',
    }
}

export const setRankingsRegion=(mapRegionsWithCode,region)=> async(dispatch) =>{
    try{
        const { data } = await axios.get(`/regiontop100?regionname=${mapRegionsWithCode[region]}`);
    if(data){
        dispatch({
            type: actions.SET_RANKINGS_REGION,
            payload:data.queryset,
            info : 'Set Rankings',
        });
    }
    else{
        throw "NO DATA FOUND";
    }
    } catch(error){
        console.log(error.message);
        dispatch({
            type: actions.SET_ERROR_REGION,
            info : 'dispatches when error',
        }); 
    }
}

export const fetchGenres=()=> async(dispatch) =>{
    try{
        const { data } = await axios.get(`/genres`);

    dispatch({
        type: actions.FETCH_GENRES,
        payload:data,
        info : 'Fetches genres',
    });
    } catch(error){
        console.log(error.message);
    }
}

export const setGenre=(genre)=>{
    return {
        type:actions.SET_GENRE,
        payload:genre,
        info: 'Sets the genre',
    }
}

export const setRankingsGenre=(mapGenresWithCode,genre)=> async(dispatch) =>{
    try{
        const { data } = await axios.get(`/genretop100?genre_id=${mapGenresWithCode[genre]}`);

    if(data){
        dispatch({
            type: actions.SET_RANKINGS_GENRE,
            payload:data.queryset,
            info : 'Set Rankings',
        });
    }
    else{
        throw "NO DATA FOUND";
    }
    } catch(error){
        console.log(error.message);
        dispatch({
            type: actions.SET_ERROR_GENRE,
            info : 'dispatches when error',
        }); 
    }
}

export const fetchPodminerStats=()=> async(dispatch) =>{
    try{
        const { data } = await axios.get("/podminer/stats");

    dispatch({
        type: actions.FETCH_PODMINER_STATS,
        payload:data,
        info : 'Fetches podminer data',
    });
    } catch(error){
        console.log(error.message);
    }
}

export const setCountryCount=()=> async(dispatch) =>{
    try{
        const { data } = await axios.get("/countries");

    dispatch({
        type: actions.SET_COUNTRY_COUNT,
        payload:data,
        info : 'Set country count',
    });
    } catch(error){
        console.log(error.message);
    }
}