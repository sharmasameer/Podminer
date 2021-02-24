export const initialPowerRankings = {
    powerRankings : null,
    podcastID : null,
    error: false,
}

export const initialHotPodcasts = {
    hotRankings : null,
    error: false,
}

export const initialFeaturedShow = {
    heatmapData : null,
    showData : null,
    countries:[],
    genres:[],
    country:'',
    genre:'',
    heatmapGenre:'',
    datas:{
        dates: [],
        rankings: [],
      },
    message:'',
}

export const initialCountryGenre = {
    mapCountriesWithCode :null,
    countries: null,
    country: null,
    rankings:null,
    error:false,
}

export const initialRegions = {
    mapRegionsWithCode: null,
    regions: null,
    region: null,
    rankings: null,
    error:false,
}

export const initialGenre = {
    mapGenresWithCode: null,
    genres:null,
    genre:null,
    rankings: null,
    error:false,
}

export const initialPodminerStats = {
    showCount: null,
    lastUpdate: "",
    countryCount: null,
}