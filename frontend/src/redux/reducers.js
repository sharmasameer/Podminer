import { months } from "../variables/months";
import randomNumber from 'variables/randomNumberForEachDay';
import * as actions from "./actionTypes";
import * as initials from "./initialStates";

export const powerRankingsReducer = (state=initials.initialPowerRankings, action) => {
    switch(action.type){
        case actions.FETCH_TOP_HUNDRED:
            return {
                ...state,
                powerRankings: action.payload,
                podcastID: state.podcastID!==null ? state.podcastID : action.payload[randomNumber()].show__podcast_id,
            }
        case actions.SET_ERROR_TOP_HUNDRED:
            return {
                ...state,
                error:true,
            }
        default :
            return state
    }
}

export const hotPodcastsReducer = (state=initials.initialHotPodcasts, action) => {
    switch(action.type){
        case actions.FETCH_HOT_PODCAST:
            return {
                ...state,
                hotRankings: action.payload
            }
        case actions.SET_ERROR_HOT_PODCAST:
            return {
                ...state,
                error:true,
            }
        default :
            return state
    }
}

export const featuredShowReducer = (state=initials.initialFeaturedShow, action) => {
    switch(action.type){
        case actions.FETCH_FEATURED_SHOW:
            let countryData = action.payload.map((d) => d.country);
            let genreData = action.payload.map((d) => d.genre);
            countryData = countryData.filter(
              (d, ind) => countryData.indexOf(d) === ind
            );
            genreData = genreData.filter((d, ind) => genreData.indexOf(d) === ind);
            countryData = countryData.sort((a, b) => (b < a ? 1 : -1));
            genreData = genreData.sort((a, b) => (b < a ? 1 : -1));
            let countryVal = countryData[0];
            let genreVal = genreData[genreData.length - 1]
            countryData = countryData.map((d) => {
              return { name: d };
            });
            genreData = genreData.map((d) => {
              return { name: d };
            });
            return {
                ...state,
                heatmapData: action.payload,
                showData: action.payload ,
                countries: countryData,
                genres: genreData,
                country: state.country!==""? state.country :countryVal,
                genre: state.genre!=="" ? state.genre : genreVal,
                heatmapGenre: state.heatmapGenre === "" ? genreVal : state.heatmapGenre ,
            }
        case actions.SET_COUNTRY_FEATURED_SHOW:
            return {
                ...state,
                country:action.payload,
            }
        case actions.SET_GENRE_FEATURED_SHOW:
            return {
                ...state,
                genre:action.payload,
            }
        case actions.SET_HEATMAP_GENRE_FEATURED_SHOW:
            return{
                ...state,
                heatmapGenre:action.payload,
            }
        case actions.FETCH_LOADCHART_FEATURED_SHOW:
            let messageSet;
            let data;
            let dates;
            let rankings;
            if (action.payload.length !== 0) {
            messageSet="";
            data = action.payload.sort((a, b) => {
                const date1 = new Date(a.updated);
                const date2 = new Date(b.updated);
                return date2 < date1 ? 1 : -1;
            });
            rankings = data.map((d) => +d.ranking);
            dates = data.map((d) => {
                const date = new Date(d.updated.substring(0, 10) + "T00:00:00");
                return `${months[date.getMonth()]} ${date.getDate()}`;
            });
            } else {
                messageSet="No data exists for this country and category!";
            }
            return{
                ...state,
                message:messageSet,
                datas:{
                    ...data,
                    dates:dates,
                    rankings:rankings,
                }

            }
        default :
            return state
    }
}

export const countryGenreReducer = (state=initials.initialCountryGenre, action) => {
    switch(action.type){
        case actions.FETCH_COUNTRY_GENRE:
            let countriesData = action.payload;
            let mapCountries = {}
            countriesData = countriesData.sort((a, b) => b.country_name < a.country_name ? 1 : -1)
            countriesData = countriesData.map(r => {
                mapCountries[`${r.country_name}`] = r.country_code
                return {
                    name: r.country_name
                }
            })
            return {
                ...state,
                mapCountriesWithCode :mapCountries,
                countries: countriesData,
            }
        case actions.SET_COUNTRY:
            return {
                ...state,
                country: action.payload,
            }
        case actions.SET_RANKINGS_COUNTRY:
            return{
                ...state,
                rankings:action.payload,
            }
        case actions.SET_ERROR_COUNTRY:
            return{
                ...state,
                error:true,
            }
        default :
            return state
    }
}

export const regionReducer = (state=initials.initialRegions, action) => {
    switch(action.type){
        case actions.FETCH_REGIONS:
            let regionsData = action.payload;
            let mapRegions = {}
            regionsData = regionsData.sort((a, b) => b.regionname < a.regionname ? 1 : -1)
            regionsData = regionsData.map(r => {
                mapRegions[`${r.regionname}`] = r.regionname
                return {
                    name: r.regionname
                }
            })
            return {
                ...state,
                mapRegionsWithCode: mapRegions,
                regions: regionsData,
            }
        case actions.SET_REGION:
            return {
                ...state,
                region: action.payload,
            }
        case actions.SET_RANKINGS_REGION:
            return {
                ...state,
                rankings: action.payload,
            }
        case actions.SET_ERROR_REGION:
            return{
                ...state,
                error:true,
            }
        default :
            return state
    }
}

export const genreReducer = (state=initials.initialGenre, action) => {
    switch(action.type){
        case actions.FETCH_GENRES:
            let genresData = action.payload;
            let mapGenres = {}
            genresData = genresData.sort((a, b) => b.name < a.name ? 1 : -1)
            genresData = genresData.map(r => {
                mapGenres[`${r.name}`] = r.genre_id
                return {
                    name: r.name
                }
            })
            return {
                ...state,
                mapGenresWithCode: mapGenres,
                genres: genresData,
            }
        case actions.SET_GENRE:
            return {
                ...state,
                genre: action.payload,
            }
        case actions.SET_RANKINGS_GENRE:
            return {
                ...state,
                rankings: action.payload,
            }
        case actions.SET_ERROR_GENRE:
            return {
                ...state,
                error:true,
            }
        default :
            return state
    }
}

export const fetchPodminerStatsReducer = (state=initials.initialPodminerStats, action) => {
    switch(action.type){
        case actions.FETCH_PODMINER_STATS:
            let d = new Date(action.payload["last_update"]);
            return {
                ...state,
                showCount: action.payload["show_count"],
                lastUpdate: `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
            }
        case actions.SET_COUNTRY_COUNT:
            return {
                ...state,
                countryCount: action.payload.length,
            }
        default :
            return state
    }
}