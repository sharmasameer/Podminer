import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
	formControl: {
		minWidth: 120,
		margin: 20,
		marginTop: 0,
	},
	selectEmpty: {
		width: "150px",
		"&:before": {
			borderColor: "#036635",
		},
		"&:after": {
			borderColor: "#036635",
		},
	},
	long: {
		width: "200px",
		"&:before": {
			borderColor: "#036635",
		},
		"&:after": {
			borderColor: "#036635",
		}
	},
	icon: {
		fill: "#036635",
	},
}));

export default function SimpleSelect({ label, items, changeValue, defaultValue, disabled, long }) {
	const classes = useStyles();
	const [selected, setSelected] = React.useState(defaultValue);

	const handleChange = (event) => {
		setSelected(event.target.value);
		changeValue(event.target.value);
	};

	return (
		<div>
			<FormControl className={classes.formControl}>
				<InputLabel id="demo-simple-select-label" style={{ fontSize: "1.1rem" }}>{label}</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={selected}
					onChange={handleChange}
					style={{ fontSize: "1.2rem" }}
					className={ long ? classes.long : classes.selectEmpty }
					inputProps={{
						classes: {
							icon: classes.icon,
						}
					}}
					disabled={disabled}
				>
					{items.map((item, idx) => (
						<MenuItem
							value={label === "Country" ? item.name : item.name}
							key={idx}
						>
							{item.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div >
	);
}
