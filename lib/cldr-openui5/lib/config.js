import util from "./util.js";
// Maps the lenient-scope-number keys "-", "+" and "," as used in CLDR-misc characters.json to the corresponding keys
// used in the generated UI5 CLDR files "minusSign", "plusSign" and "commaSign"
const mLenientScopeNumberKeyMapping = {"-": "minusSign", "+": "plusSign", ",": "commaSign"};
// Gets the lenient characters between "[" and "]" in the first matching group
const rLenientCharacters = /^\[(.*)\]$/;

/**
 * Extracts calendar specific "dayPeriods" formats from CLDR, except "am" / "pm" related entries,
 * to be used as calendar specific "flexibleDayPeriods".
 *
 * @example <caption>Input</caption>
 * {
 *   "abbreviated": {
 *     "midnight": "midnight",
 *     "am": "AM",
 *     "am-alt-variant": "am",
 *     "noon": "noon",
 *     "pm": "PM",
 *     "pm-alt-variant": "pm",
 *     "morning1": "in the morning",
 *     "afternoon1": "in the afternoon",
 *     "evening1": "in the evening",
 *     "night1": "at night"
 *   }
 * }
 * @example <caption>Output</caption>
 * {
 *   "key": "abbreviated",
 *   "value": {
 *     "midnight": "midnight",
 *     "noon": "noon",
 *     "morning1": "in the morning",
 *     "afternoon1": "in the afternoon",
 *     "evening1": "in the evening",
 *     "night1": "at night"
 *   }
 * }
 *
 * @param {object} node The JSON object to format e.g. {"abbreviated": {...}}
 * @param {object} value The JSON object's value of the given key e.g. {"midnight": "Mitternacht"}
 * @param {string} key The JSON object's key e.g. "abbreviated"
 * @returns {{key: string, value: object}}
 *   The formatted JSON object containing the given key and the given value without the "am", "pm",
 *   "am-alt-variant" and "pm-alt-variant" properties.
 *
 * @private
 */
function _formatFlexibleDayPeriods(node, value, key) {
	const oResult = {};

	Object.keys(value).forEach(function(sKey){
		if (!["am", "pm", "am-alt-variant", "pm-alt-variant"].includes(sKey)) {
			oResult[sKey] = value[sKey];
		}
	});

	return {key: key, value: oResult};
}

export default [
	{
		packageName: "cldr-localenames-full",
		fileName: "languages.json",
		template: {
			path: "localeDisplayNames.languages",
			as: {
				"languages": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						return {
							key: key.replace("-", "_")
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-localenames-full",
		fileName: "scripts.json",
		template: {
			path: "localeDisplayNames",
			choose: ["scripts"]
		}
	},
	{
		packageName: "cldr-localenames-full",
		fileName: "territories.json",
		template: {
			path: "localeDisplayNames",
			choose: ["territories"]
		}
	},
	{
		packageName: "cldr-misc-full",
		fileName: "layout.json",
		template: {
			path: "layout.orientation",
			choose: ["characterOrder"],
			format: function() {
				return {
					key: "orientation"
				};
			}
		}
	},

	//gregorian
	{
		packageName: "cldr-dates-full",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"],
					format: function(node, value, key) {
						// Filter out the skeleton with multi-plural form except the one
						// with '-count-other'. Save the '-count-other' pattern under
						// the skeleton without plural suffix
						const sKeyword = "-count-";
						const sKeywordOther = "-count-other";
						if (key === "dateTimeFormats") {
							const oAvailableFormats = value.availableFormats;

							Object.keys(oAvailableFormats).forEach(function(sKey) {
								const iCountIndex = sKey.indexOf(sKeyword);
								if (iCountIndex !== -1) {
									if (sKey.indexOf(sKeywordOther) !== -1) {
										oAvailableFormats[sKey.substring(0, iCountIndex)] = oAvailableFormats[sKey];
									}

									delete oAvailableFormats[sKey];
								}
							});
						}

						return util.removeAltAsciiTimeFormats(node, value, key);
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						const oResult = {};
						const mConfig = {
							months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
							days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
							quarters: ["1", "2", "3", "4"],
							dayPeriods: ["am", "pm"]
						};

						for (const sUsage in value) {
							const oUsage = {};
							for (const sWidth in value[sUsage]) {
								const aData = [];
								const mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName) {
									aData.push(mData[keyName]);
								});
								oUsage[sWidth] = aData;
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: "dayPeriods",
					as: {
						flexibleDayPeriods: {
							path: ".",
							all: true,
							nested: true,
							format: _formatFlexibleDayPeriods
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian.eras",
			as: {
				"ca-gregorian": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						for (const sName in value) {
							if (sName.length !== 1) {
								delete value[sName];
							}
						}
						switch (key) {
							case "eraNames":
								return {
									key: "era-wide"
								};
							case "eraAbbr":
								return {
									key: "era-abbreviated"
								};
							case "eraNarrow":
								return {
									key: "era-narrow"
								};
							default:
								return undefined;
						}
					}
				}
			}
		}
	},

	// islamic
	{
		packageName: "cldr-cal-islamic-full",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"],
					format: function (node, value, key) {
						return util.removeAltAsciiTimeFormats(node, value, key);
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-islamic-full",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						const oResult = {};
						const mConfig = {
							months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
							days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
							quarters: ["1", "2", "3", "4"],
							dayPeriods: ["am", "pm"]
						};

						for (const sUsage in value) {
							const oUsage = {};
							for (const sWidth in value[sUsage]) {
								const aData = [];
								const mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName) {
									aData.push(mData[keyName]);
								});
								oUsage[sWidth] = aData;
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-islamic-full",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: "dayPeriods",
					as: {
						flexibleDayPeriods: {
							path: ".",
							all: true,
							nested: true,
							format: _formatFlexibleDayPeriods
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-islamic-full",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic.eras",
			as: {
				"ca-islamic": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						for (const sName in value) {
							if (sName.length !== 1) {
								delete value[sName];
							}
						}
						switch (key) {
							case "eraNames":
								return {
									key: "era-wide"
								};
							case "eraAbbr":
								return {
									key: "era-abbreviated"
								};
							case "eraNarrow":
								return {
									key: "era-narrow"
								};
							default:
								return undefined;
						}
					}
				}
			}
		}
	},

	// japanese
	{
		packageName: "cldr-cal-japanese-full",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese",
			as: {
				"ca-japanese": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"],
					format: function(node, value, key) {
						function escapePattern(str) {
							return str ? str.replace(/[[\]{}()*+?.\\^$|]/g, "\\$&") : str;
						}
						function escapeReplacement(str) {
							return str ? str.replace(/\$/g, "$$$$") : str;
						}
						const oValue = value;
						// Remove special notation for jpanyear
						if (key === "dateFormats") {
							for (const sName in oValue) {
								const vFormat = oValue[sName];
								if (typeof vFormat === "object") {
									oValue[sName] = vFormat._value;
								}
							}
						}
						// Add missing intervalFormats for era difference
						if (key === "dateTimeFormats") {
							const oIntervalFormats = oValue["intervalFormats"];
							for (const sSkeleton in oIntervalFormats) {
								if (sSkeleton.startsWith("y")) {
									const oFormat = oIntervalFormats[sSkeleton];
									const sYearPattern = oFormat.y;
									const oMatch = sYearPattern.match(/G+\s*([^\w\s]+\s*)?(\w+)|(\w+)(\s*[^\w\s]+)?\s*G+/);
									if (oMatch) {
										const sEraReplace = escapeReplacement(oMatch[0]);
										const bLeft = !!oMatch[2];
										const sFill = escapePattern(bLeft ? oMatch[1] : oMatch[4]);
										const sSymbol = escapePattern(bLeft ? oMatch[2] : oMatch[3]);
										const sMatchEra = bLeft ? "(G+\\s*)?" : "(\\s*G+)?";
										const sMatchFill = sFill ? "(" + sFill + ")?" : "";
										const sMatch = bLeft
											? sMatchEra + sMatchFill + sSymbol
											: sSymbol + sMatchFill + sMatchEra;
										const oReplaceExp = new RegExp(sMatch, "g");
										const sEraPattern = sYearPattern.replace(oReplaceExp, sEraReplace);
										oFormat.G = sEraPattern;
									}
								}
							}
						}

						return util.removeAltAsciiTimeFormats(node, oValue, key);
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-japanese-full",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese",
			as: {
				"ca-japanese": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						const oResult = {};
						const mConfig = {
							months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
							days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
							quarters: ["1", "2", "3", "4"],
							dayPeriods: ["am", "pm"]
						};

						for (const sUsage in value) {
							const oUsage = {};
							for (const sWidth in value[sUsage]) {
								const aData = [];
								const mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName) {
									aData.push(mData[keyName]);
								});
								oUsage[sWidth] = aData;
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-japanese-full",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese",
			as: {
				"ca-japanese": {
					path: "dayPeriods",
					as: {
						flexibleDayPeriods: {
							path: ".",
							all: true,
							nested: true,
							format: _formatFlexibleDayPeriods
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-japanese-full",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese.eras",
			as: {
				"ca-japanese": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						const oValue = {};
						// Modern Japan - eras from 1868
						["232", "233", "234", "235", "236"].forEach(function(sEra) {
							oValue[sEra] = node[key][sEra];
						});
						switch (key) {
							case "eraNames":
								return {
									key: "era-wide",
									value: oValue
								};
							case "eraAbbr":
								return {
									key: "era-abbreviated",
									value: oValue
								};
							case "eraNarrow":
								return {
									key: "era-narrow",
									value: oValue
								};
							default:
								return undefined;
						}
					}
				}
			}
		}
	},

	// persian
	{
		packageName: "cldr-cal-persian-full",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian",
			as: {
				"ca-persian": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"],
					format: function (node, value, key) {
						return util.removeAltAsciiTimeFormats(node, value, key);
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-persian-full",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian",
			as: {
				"ca-persian": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						const oResult = {};
						const mConfig = {
							months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
							days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
							quarters: ["1", "2", "3", "4"],
							dayPeriods: ["am", "pm"]
						};

						for (const sUsage in value) {
							const oUsage = {};
							for (const sWidth in value[sUsage]) {
								const aData = [];
								const mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName) {
									aData.push(mData[keyName]);
								});
								oUsage[sWidth] = aData;
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-persian-full",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian",
			as: {
				"ca-persian": {
					path: "dayPeriods",
					as: {
						flexibleDayPeriods: {
							path: ".",
							all: true,
							nested: true,
							format: _formatFlexibleDayPeriods
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-persian-full",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian.eras",
			as: {
				"ca-persian": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						for (const sName in value) {
							if (sName.length !== 1) {
								delete value[sName];
							}
						}
						switch (key) {
							case "eraNames":
								return {
									key: "era-wide"
								};
							case "eraAbbr":
								return {
									key: "era-abbreviated"
								};
							case "eraNarrow":
								return {
									key: "era-narrow"
								};
							default:
								return undefined;
						}
					}
				}
			}
		}
	},

	// buddhist
	{
		packageName: "cldr-cal-buddhist-full",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist",
			as: {
				"ca-buddhist": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"],
					format: function (node, value, key) {
						return util.removeAltAsciiTimeFormats(node, value, key);
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-buddhist-full",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist",
			as: {
				"ca-buddhist": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						const oResult = {};
						const mConfig = {
							months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
							days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
							quarters: ["1", "2", "3", "4"],
							dayPeriods: ["am", "pm"]
						};

						for (const sUsage in value) {
							const oUsage = {};
							for (const sWidth in value[sUsage]) {
								const aData = [];
								const mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName) {
									aData.push(mData[keyName]);
								});
								oUsage[sWidth] = aData;
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-buddhist-full",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist",
			as: {
				"ca-buddhist": {
					path: "dayPeriods",
					as: {
						flexibleDayPeriods: {
							path: ".",
							all: true,
							nested: true,
							format: _formatFlexibleDayPeriods
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-buddhist-full",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist.eras",
			as: {
				"ca-buddhist": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						for (const sName in value) {
							if (sName.length !== 1) {
								delete value[sName];
							}
						}
						switch (key) {
							case "eraNames":
								return {
									key: "era-wide"
								};
							case "eraAbbr":
								return {
									key: "era-abbreviated"
								};
							case "eraNarrow":
								return {
									key: "era-narrow"
								};
							default:
								return undefined;
						}
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "dateFields.json",
		template: {
			path: "dates.fields",
			as: {
				"dateFields": {
					path: ".",
					choose: [
						"era", "year", "year-short", "year-narrow", "quarter", "quarter-short", "quarter-narrow",
						"month", "month-short", "month-narrow", "week", "week-short", "week-narrow", "weekday", "day",
						"day-short", "day-narrow", "hour", "hour-short", "hour-narrow", "minute", "minute-short",
						"minute-narrow", "second", "second-short", "second-narrow", "zone"
					],
					format: function(node, value, key) {
						const aSingleFormFields = ["era", "weekday", "zone"];
						const oSingleFormMap = {};

						aSingleFormFields.forEach(function(value) {
							oSingleFormMap[value] = true;
						});

						if (!oSingleFormMap[key] && key.indexOf("-") === -1) {
							// wide form: the key needs to be suffixed with '-wide'
							key = key + "-wide";
						}

						return {
							key: key
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "timeZoneNames.json",
		template: {
			path: "dates.timeZoneNames.zone",
			as: {
				"timezoneNames": {
					path: ".",
					all: true,
					format: function (node, value, key) {
						const iterate = function(value) {
							if (typeof value === "object") {
								Object.keys(value).forEach(function(childKey) {
									const childValue = value[childKey];
									if (childValue.exemplarCity) {
										value[childKey] = childValue.exemplarCity;
									}
									iterate(childValue);
								});
							}
						};
						iterate(value);
						return {key: key, value: value};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-full",
		fileName: "timeZoneNames.json",
		template: {
			path: "dates.timeZoneNames",
			as: {
				"timezoneNamesFormats": {
					path: ".",
					choose: ["gmtFormat"]
				}
			}
		}
	},
	{
		packageName: "cldr-numbers-full",
		fileName: "numbers.json",
		template: {
			path: "numbers.decimalFormats-numberSystem-latn",
			as: {
				"decimalFormat": {
					path: ".",
					choose: ["standard"]
				}
			}
		}
	},
	{
		packageName: "cldr-numbers-full",
		fileName: "numbers.json",
		template: {
			path: "numbers.decimalFormats-numberSystem-latn.",
			choose: ["long", "short"],
			format: function(node, value, key) {
				const mData = value.decimalFormat, mChangedData = {};
				for (const name in mData) {
					mChangedData[name.replace("-count-", "-")] = mData[name];
				}
				return {
					key: "decimalFormat-" + key,
					value: mChangedData
				};
			}
		}
	},
	{
		id: "numbers.json -> scientificFormat|percentFormat|currencyFormat|miscPattern",
		packageName: "cldr-numbers-full",
		fileName: "numbers.json",
		template: {
			path: "numbers",
			choose: [
				"scientificFormats-numberSystem-latn", "percentFormats-numberSystem-latn",
				"currencyFormats-numberSystem-latn", "miscPatterns-numberSystem-latn"
			],
			/**
			 * Copies the "scientificFormats-numberSystem-latn" object as "scientificFormat", the
			 * "percentFormats-numberSystem-latn" object as "percentFormat" and the "miscPatterns-numberSystem-latn"
			 * object as "miscPattern" to the result.
			 * For "currencyFormats-numberSystem-latn" only the values for "standard", "standard-alphaNextToNumber",
			 * "standard-noCurrency", "accounting", "accounting-alphaNextToNumber", "accounting-noCurrency" and
			 * "currencySpacing" are copied to the result as the "currencyFormat" object.
			 *
			 * @param {object} node
			 *   Not used
			 * @param {Object<string,any>} value
			 *   The "scientificFormats-numberSystem-latn", "percentFormats-numberSystem-latn",
			 *   "currencyFormats-numberSystem-latn" or "miscPatterns-numberSystem-latn" object for the current locale
			 * @param {"scientificFormats-numberSystem-latn"|"percentFormats-numberSystem-latn"|
			 *     "currencyFormats-numberSystem-latn"|"miscPatterns-numberSystem-latn"} key
			 *   The key to be processed
			 *
			 * @returns {{
			 *     key: ("scientificFormat"|"percentFormat"|"currencyFormat"|"miscPattern"),
			 *     value: any
			 * }}
			 *   An object with two properties:
			 *   <ul>
			 *     <li>"key": the shortened key; either "scientificFormat", "percentFormat", "miscPattern", or
			 *       "currencyFormat"</li>
			 *     <li>"value": the corresponding value from the CLDR data</li>
			 *   </ul>
			 */
			format: function(node, value, key) {
				if (key === "currencyFormats-numberSystem-latn") {
					value = {
						standard: value.standard,
						"standard-alphaNextToNumber": value["standard-alphaNextToNumber"],
						"standard-noCurrency": value["standard-noCurrency"],
						accounting: value.accounting,
						"accounting-alphaNextToNumber": value["accounting-alphaNextToNumber"],
						"accounting-noCurrency": value["accounting-noCurrency"],
						currencySpacing: value.currencySpacing
					};
				}
				return {
					key: key.replace("s-numberSystem-latn", ""),
					value: value
				};
			}
		}
	},
	{
		id: "numbers.json -> currencyFormat-short",
		packageName: "cldr-numbers-full",
		fileName: "numbers.json",
		template: {
			path: "numbers.currencyFormats-numberSystem-latn.short",
			choose: ["standard"],
			/**
			 * Copies the standard latin short currencyFormats with the "-count-" and "-alt-" removed from the keys to
			 * "currencyFormat-short" in the result.
			 *
			 * @param {object} node
			 *   Not used
			 * @param {object} value
			 *   The latin standard short currencyFormats object for the current locale
			 * @param {string} key
			 *   Not used
			 *
			 * @returns {{key: "currencyFormat-short", value: Object<string, string>}}
			 *   An object with two properties:
			 *   <ul>
			 *     <li>"key": "currencyFormat-short"</li>
			 *     <li>"value": the object from the CLDR data with the "-count-" and "-alt-" removed from the keys
			 *   </ul>
			 */
			format: function(node, value, key) {
				const mChangedData = {};
				for (const name in value) {
					mChangedData[name.replace("-count-", "-").replace("-alt-", "-")] = value[name];
				}
				return {
					key: "currencyFormat-short",
					value: mChangedData
				};
			}
		}
	},
	{
		packageName: "cldr-numbers-full",
		fileName: "numbers.json",
		template: {
			path: "numbers.symbols-numberSystem-latn",
			all: true,
			format: function(node, value, key) {
				return {
					key: "symbols-latn-" + key
				};
			}
		}
	},
	{
		packageName: "cldr-numbers-full",
		fileName: "currencies.json",
		template: {
			path: "numbers.currencies",
			as: {
				"currencySymbols": {
					path: ".",
					choose: function(node, value, key) {
						return value.symbol && value.symbol !== key;
					},
					format: function(node, value) {
						return {
							value: value.symbol
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-misc-full",
		fileName: "layout.json",
		template: {
			path: "layout.orientation",
			choose: ["characterOrder"],
			format: function(node, value) {
				return {
					key: "rtl",
					value: value === "right-to-left"
				};
			}
		}
	},
	{
		packageName: "cldr-misc-full",
		fileName: "listPatterns.json",
		template: {
			path: "listPatterns",
			choose: [
				"listPattern-type-standard", "listPattern-type-standard-short", "listPattern-type-or",
				"listPattern-type-or-short"
			],
			format: function(node, value, key) {
				key = key.replace(/-type/, "");

				if (key.match(/-/g).length === 1) {
					key = key + "-wide";
				}

				if (key === "listPattern-or-wide" && !node["listPattern-type-or-short"]) {
					return [{key: key, value: value}, {key: "listPattern-or-short", value: value}];
				} else {
					return {key: key};
				}
			}
		}
	},
	{
		packageName: "cldr-units-full",
		fileName: "units.json",
		template: {
			path: "units",
			as: {
				"units": {
					path: ".",
					choose: ["short"],
					format: function(node, value, key) {
						return {key: key, value: value};
					}
				}
			}
		}
	},
	{
		// this package includes character information for lenient parsing
		id: "characters.json -> lenient-scope-number",
		packageName: "cldr-misc-full",
		fileName: "characters.json",
		template: {
			path: "characters",
			choose: ["lenient-scope-number"],
			/**
			 * Gets the lenient symbols without brackets and escape characters.
			 * Converts PCRE Regex Syntax to a string containing all the symbols.
			 *
			 * @param {object} node
			 *   Not used
			 * @param {Object<string, string>} value
			 *   The "lenient-scope-number" object for the current locale
			 * @param {"lenient-scope-number"} key
			 *   The key to be processed
			 * @returns {{key: "lenient-scope-number", value: Object<"minusSign"|"plusSign"|"commaSign", string>}}
			 *   An object with two properties:
			 *   <ul>
			 *     <li>"key": "lenient-scope-number"</li>
			 *     <li>"value": The formatted object value from the CLDR data, in which the keys are changed, the
			 *       values do not contain any brackets, escape characters, or spaces</li>
			 *   </ul>
			 */
			format: function (node, value, key) {
				const oResult = {};
				Object.keys(value).forEach((sKey) => {
					const sMappedKey = mLenientScopeNumberKeyMapping[sKey];
					if (!sMappedKey) {
						console.log("WARNING: Ignored unknown lenient scope number key: " + sKey);
						return;
					}
					// For unicode Regular Expressions see:
					// * https://github.com/twitter/twitter-cldr-js#unicode-regular-expressions
					// * https://www.unicode.org/reports/tr18/#Notation
					// * https://www.unicode.org/reports/tr35/tr35-53/tr35.html#Unicode_Sets

					// remove brackets "[" and "]", invalid escape characters, and spaces from the patterns
					oResult[sMappedKey] = value[sKey].replace(rLenientCharacters, "$1").replaceAll("\\", "")
						.replaceAll(" ", "");
				});
				return {key: key, value: oResult};
			}
		}
	}
];
