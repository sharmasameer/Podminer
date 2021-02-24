import React from "react";
import axios from "axios";
// react plugin for creating vector maps
import { VectorMap } from "react-jvectormap";
import { CircularProgress } from "@material-ui/core";
import Dropdown from "../Dropdown/Dropdown";
import "./Map.css";

const regionStyle = {
	initial: {
		fill: "#e4e4e4",
		"fill-opacity": 0.9,
		stroke: "none",
		"stroke-width": 0,
		"stroke-opacity": 0,
	},
};

const containerStyle = {
	width: "100%",
};

export default function VectorMaps() {
	const [genre, setGenre] = React.useState('Education');
	const [genres, setGenres] = React.useState([]);

	const [loading, setLoading] = React.useState(false);
	const [countries, setCountries] = React.useState([]);
	const [mainData, setMainData] = React.useState([]);

	React.useEffect(() => {
		setLoading(true);
		axios
			.get("/podminer/top-by-country", {
				params: {
					genre,
				},
			})
			.then((res) => {
				// console.log(res.data);
				setMainData(res.data);
				setLoading(false);
			});
	}, [genre]);

	React.useEffect(() => {
		setLoading(true);

		axios.get("/genres").then((res) => {
			// console.log(res.data);
			setGenres(res.data);
		});

		axios.get("/countries").then((res) => {
			// console.log(res.data);
			setCountries(res.data);
		});

		axios
			.get("/podminer/top-by-country", {
				params: {
					genre,
				},
			})
			.then((res) => {
				// console.log(res.data);
				setMainData(res.data);
				setLoading(false);
			});
	}, []);

	let mapData = {};

	if (countries) {
		countries.forEach((country) => {
			mapData[country.country_code.toUpperCase()] = country.gdp;
		});
	}

	const series = {
		regions: [
			{
				values: mapData,
				scale: ["#AAAAAA", "#444444"],
				normalizeFunction: "polynomial",
			},
		],
	};

	return (
		<>
			{loading ? (
				<div
					style={{
						width: "100%",
						height: "60vh",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<CircularProgress color="primary" />
				</div>
			) : (
				<div>
					<Dropdown
						items={genres}
						label={"Category"}
						defaultValue={genre}
						changeValue={(genre) => setGenre(genre)}
					/>
					<VectorMap
						map={"world_mill"}
						backgroundColor="transparent"
						zoomOnScroll={false}
						containerStyle={containerStyle}
						containerClassName="map"
						regionStyle={regionStyle}
						series={series}
						onRegionTipShow={(e, el, code) => {
							for (const property in mainData) {
								if (property == code.toLowerCase()) {
									return el.html(el.html() + ' ( ' + mainData[property].show_data.name + ' )');
								}
							}
							el.html(el.html());
						}}
					/>
				</div>
			)}
		</>
	);
}
