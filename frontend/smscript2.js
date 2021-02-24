//yarn add react-router-sitemap
//yarn add babel-register
//yarn add babel-plugin-transform-class-properties
//yarn add babel-plugin-transform-react-jsx
//yarn add babel-plugin-module-resolver
//yarn add babel-plugin-import-rename
//yarn add babel-preset-es2015

require('babel-register');
const shows= require('./shows.json');
const genres= require('./genres.json');
const countries= require('./countries.json');

//Import our routes
const router = require("./router").default;
const Sitemap = require("react-router-sitemap").default;

function generateSitemap() {
  let idMap = [];

  for(let i = 0; i < shows.length; i++) {
    let obj = shows[i];
    idMap.push({ showId: obj.podcast_id, showSlug:obj.slug});
  }
  
  let idMap2 = [];

  for(let i = 0; i < countries.length; i++) {
    for(let j = 0; j < genres.length; j++) {
      
      let obj = countries[i].name;
      let obj2= genres[j].name;

      let Aobj=obj;
      let Bobj='';
      for(let ii=0;ii<Aobj.length;ii++)
      {
        if(Aobj[ii]==' ')
        {
          Bobj=Bobj+'%20';
        }
        else
        {
          Bobj=Bobj+Aobj[ii];
        }
      }
      // Bobj=Bobj.toLowerCase();


      let Aobj2=obj2;
      let Bobj2='';
      for(let ii=0;ii<Aobj2.length;ii++)
      {
        if(Aobj2[ii]==' ')
        {
          Bobj2=Bobj2+'%20';
        }
        else
        {
          Bobj2=Bobj2+Aobj2[ii];
        }
      }
      // Bobj2=Bobj2.toLowerCase();


      idMap2.push({ showCountry: Bobj, showGenre:Bobj2});
    }
  }

  const paramsConfig = {
    "/podcast/:showId/:showSlug": idMap,
    "/rankings/:showCountry/:showGenre":idMap2
  }; 

  return (
    new Sitemap(router).applyParams(paramsConfig)
    //use accordingly
    // .build("http://app0.pikkalfm.com")
    // .build("http://localhost:3000")
    .build("https://www.podminer.com")
    // .save("public/sitemap.xml")
    .save("build/sitemap.xml")
  );
}
 
generateSitemap();  
