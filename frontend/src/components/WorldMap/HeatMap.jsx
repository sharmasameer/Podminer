import React from "react";
// react plugin for creating vector maps
import { VectorMap } from "react-jvectormap";
import "./Map.css";
// import { useFetch } from "Hooks/useFetch";

export default function HeatMap({ genre: g, rankingMapData }) {
  //fetching countries
  const _mapView = "world_mill";

  const _mapData = {};

  const getCountryCode = (storeURL) => storeURL.split("/")[3].toUpperCase();

  if (rankingMapData.length) {
    // console.log(rankingMapData);
    rankingMapData.forEach(
      ({ store_url, ranking, genre }) => {
        return genre === g ? (_mapData[getCountryCode(store_url)] = ranking) : null
      }
    );
  }
  //Map Component props
  const _regionStyle = {
    initial: {
      fill: "#e4e4e4",
      "fill-opacity": 1,
      stroke: "none",
      "stroke-width": 0,
      "stroke-opacity": 1,
    },
  };

  const _containerStyle = {
    width: "85%",
  };
  //Set color variation Top -> Low
  const { RED, BLUE, ORANGE, YELLOW } = {
    RED: "#df281a",
    ORANGE: "#FB8C00",
    YELLOW: "#FDD835",
    BLUE: "#03A9F4",
  };
  const _series = {
    regions: [
      {
        values: _mapData,
        scale: [RED, ORANGE, YELLOW, BLUE],
        normalizeFunction: "none",
        legend: {
          horizontal: true,
          cssClass: "jvectormap-legend-icons",
          title: "Ranking ",
        },
      },
    ],
  };

  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <VectorMap
        map={_mapView}
        backgroundColor="transparent"
        zoomOnScroll={false}
        containerStyle={_containerStyle}
        containerClassName="map"
        regionStyle={_regionStyle}
        series={_series}
        onRegionTipShow={(_, el, countryCode) =>
          el.html(
            _mapData[countryCode] !== undefined
              ? el.html() +
                  ` - ${g} - Rank ${_mapData[countryCode]}`
              : el.html()
          )
        }
      />
    </div>
  );
}
