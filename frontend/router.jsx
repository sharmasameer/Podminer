import React from 'react';
import { Switch, Route } from 'react-router';

export default (
    <Switch>
        <Route path='/myfollows' />
        <Route path='/user' />
        <Route path='/login' />
        <Route path='/search' />
        <Route path='/settings' />
        <Route path='/metrics' />
        <Route path='/tasks' />
        <Route path='/podcast/:showId/:showSlug' /> 
        <Route path='/rankings/:showCountry/:showGenre' />
    </Switch>
); 