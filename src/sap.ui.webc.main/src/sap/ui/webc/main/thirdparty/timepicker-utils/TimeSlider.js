sap.ui.define(['exports'], function (exports) { 'use strict';

	const generateTimeItemsArray = (x, step = 1) => {
		const array = [];
		for (let i = 0; i < x; i++) {
			if (i % step === 0) {
				let tempString = i.toString();
				if (tempString.length === 1) {
					tempString = `0${tempString}`;
				}
				array.push(tempString);
			}
		}
		return array;
	};
	const getHours = (config, max) => {
		let hoursValueArray = [];
		if (config.isTwelveHoursFormat) {
			hoursValueArray = generateTimeItemsArray(max || 12, 1);
		} else {
			hoursValueArray = generateTimeItemsArray(max || 24, 1);
		}
		if (config.minHour === 1) {
			for (let i = 0; i < hoursValueArray.length; i++) {
				const tempValue = hoursValueArray[i] * 1 + 1;
				if (tempValue.toString().length === 1) {
					hoursValueArray[i] = `0${tempValue.toString()}`;
				} else {
					hoursValueArray[i] = tempValue.toString();
				}
			}
		}
		return hoursValueArray;
	};
	const getMinutes = (max, step) => {
		return generateTimeItemsArray(max || 60, step);
	};
	const getSeconds = (max, step) => {
		return generateTimeItemsArray(max || 60, step);
	};
	const getHoursConfigByFormat = type => {
		const config = {};
		if (type === "hour0_23") {
			config.minHour = 0;
			config.maxHour = 23;
			config.isTwelveHoursFormat = false;
		} else if (type === "hour1_24") {
			config.minHour = 1;
			config.maxHour = 24;
			config.isTwelveHoursFormat = false;
		} else if (type === "hour0_11") {
			config.minHour = 0;
			config.maxHour = 11;
			config.isTwelveHoursFormat = true;
		} else if (type === "hour1_12") {
			config.minHour = 1;
			config.maxHour = 12;
			config.isTwelveHoursFormat = true;
		}
		return config;
	};
	const getTimeControlsByFormat = (formatArray, hoursConfig) => {
		const timeControls = [false, false, false, false];
		for (let i = 0; i < formatArray.length; i++) {
			if (hoursConfig.maxHour !== 0) {
				timeControls[0] = true;
			}
			if (hoursConfig.maxHour !== 0 && hoursConfig.isTwelveHoursFormat) {
				timeControls[0] = true;
			}
			if (formatArray[i].type === "minute") {
				timeControls[1] = true;
			}
			if (formatArray[i].type === "second") {
				timeControls[2] = true;
			}
			if (formatArray[i].type === "amPmMarker") {
				timeControls[3] = true;
			}
		}
		return timeControls;
	};

	exports.getHours = getHours;
	exports.getHoursConfigByFormat = getHoursConfigByFormat;
	exports.getMinutes = getMinutes;
	exports.getSeconds = getSeconds;
	exports.getTimeControlsByFormat = getTimeControlsByFormat;

	Object.defineProperty(exports, '__esModule', { value: true });

});
