import { createStore,combineReducers,applyMiddleware,compose } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from "./reducers";
import rankingsReducer from './reducers/rankingsReducer'

const rootReducer = combineReducers({
    rankings: reducers.powerRankingsReducer,
    hotPodcatsRankings: reducers.hotPodcastsReducer,
    featuredShow: reducers.featuredShowReducer,
    countryGenre : reducers.countryGenreReducer,
    regionData : reducers.regionReducer,
    genreData : reducers.genreReducer,
    podminerStats: reducers.fetchPodminerStatsReducer,
    rankingsReducer
})

export const store = createStore(rootReducer, compose(applyMiddleware(thunk)));