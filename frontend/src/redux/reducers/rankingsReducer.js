const initialState = {
    podcastRankings: [],
    countries: [],
    genres: [],
    showCount: null,
    countryCount: null,
    lastUpdate: null
}

const dashboardReducer = (state = initialState, action) => {
    switch(action.type){
        case 'SHOW_COUNT_UPDATE':
            return {
                ...state,
                showCount: action.payload
            }
        case 'COUNTRY_COUNT_UPDATE':
            return {
                ...state,
                countryCount: action.payload
            }
        case 'LAST_DATE_UPDATE':
            return {
                ...state,
                lastUpdate: action.payload
            }
        case 'COUNTRIES_UPDATE':
            return {
                ...state,
                countries: action.payload
            }
        case 'GENRES_UPDATE':
            return {
                ...state,
                genres: action.payload
            }
    }
    return state
}

export default dashboardReducer