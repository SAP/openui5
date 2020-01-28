module.exports = [
	{
		packageName: "cldr-localenames-modern",
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
		packageName: "cldr-localenames-modern",
		fileName: "scripts.json",
		template: {
			path: "localeDisplayNames",
			choose: ["scripts"]
		}
	},
	{
		packageName: "cldr-localenames-modern",
		fileName: "territories.json",
		template: {
			path: "localeDisplayNames",
			choose: ["territories"]
		}
	},
	{
		packageName: "cldr-misc-modern",
		fileName: "layout.json",
		template: {
			path: "layout.orientation",
			choose: ["characterOrder"],
			format: function(node, value, key) {
				return {
					key: "orientation"
				};
			}
		}
	},

	//gregorian
	{
		packageName: "cldr-dates-modern",
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
						var oAvailableFormats;
						var iCountIndex;

						var sKeyword = "-count-";
						var sKeywordOther = "-count-other";
						if (key === "dateTimeFormats") {
							oAvailableFormats = value.availableFormats;

							Object.keys(oAvailableFormats).forEach(function(sKey) {
								iCountIndex = sKey.indexOf(sKeyword);
								if (iCountIndex !== -1) {
									if (sKey.indexOf(sKeywordOther) !== -1) {
										oAvailableFormats[sKey.substring(0, iCountIndex)] = oAvailableFormats[sKey];
									}

									delete oAvailableFormats[sKey];
								}
							});
						}

						return {
							key: key,
							value: value
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-dates-modern",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var oResult = {}, sUsage, oUsage, sWidth, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};

						for (sUsage in value) {
							oUsage = {};
							for (sWidth in value[sUsage]) {
								aData = [];
								mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName, index, array) {
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
		packageName: "cldr-dates-modern",
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian.eras",
			as: {
				"ca-gregorian": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						var sName;
						for (sName in value) {
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
						}
					}
				}
			}
		}
	},

	// islamic
	{
		packageName: "cldr-cal-islamic-modern",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"]
				}
			}
		}
	},
	{
		packageName: "cldr-cal-islamic-modern",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var oResult = {}, sUsage, oUsage, sWidth, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};

						for (sUsage in value) {
							oUsage = {};
							for (sWidth in value[sUsage]) {
								aData = [];
								mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName, index, array) {
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
		packageName: "cldr-cal-islamic-modern",
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic.eras",
			as: {
				"ca-islamic": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						var sName;
						for (sName in value) {
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
						}
					}
				}
			}
		}
	},

	// japanese
	{
		packageName: "cldr-cal-japanese-modern",
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
						var oValue = value, vFormat;
						// Remove special notation for jpanyear
						if (key === "dateFormats") {
							for (var sName in oValue) {
								vFormat = oValue[sName];
								if (typeof vFormat === "object") {
									oValue[sName] = vFormat._value;
								}
							}
						}
						// Add missing intervalFormats for era difference
						if (key === "dateTimeFormats") {
							var oIntervalFormats = oValue["intervalFormats"], oFormat, sYearPattern, sEraPattern, oMatch,
								sEraReplace, oReplaceExp, bLeft, sFill, sSymbol, sMatchEra, sMatchFill, sMatch;
							for (var sSkeleton in oIntervalFormats) {
								if (sSkeleton.startsWith("y")) {
									oFormat = oIntervalFormats[sSkeleton];
									sYearPattern = oFormat.y;
									oMatch = sYearPattern.match(/G+\s*([^\w\s]+\s*)?(\w+)|(\w+)(\s*[^\w\s]+)?\s*G+/);
									if (oMatch) {
										sEraReplace = escapeReplacement(oMatch[0]);
										bLeft = !!oMatch[2];
										sFill = escapePattern(bLeft ? oMatch[1] : oMatch[4]);
										sSymbol = escapePattern(bLeft ? oMatch[2] : oMatch[3]);
										sMatchEra = bLeft ? "(G+\\s*)?" : "(\\s*G+)?";
										sMatchFill = sFill ? "(" + sFill + ")?" : "";
										sMatch = bLeft ? sMatchEra + sMatchFill + sSymbol : sSymbol + sMatchFill + sMatchEra;
										oReplaceExp = new RegExp(sMatch, "g");
										sEraPattern = sYearPattern.replace(oReplaceExp, sEraReplace);
										oFormat.G = sEraPattern;
									}
								}
							}
						}
						return {
							key: key,
							value: oValue
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-cal-japanese-modern",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese",
			as: {
				"ca-japanese": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var oResult = {}, sUsage, oUsage, sWidth, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};

						for (sUsage in value) {
							oUsage = {};
							for (sWidth in value[sUsage]) {
								aData = [];
								mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName, index, array) {
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
		packageName: "cldr-cal-japanese-modern",
		fileName: "ca-japanese.json",
		template: {
			path: "dates.calendars.japanese.eras",
			as: {
				"ca-japanese": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						var oValue = {};
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
						}
					}
				}
			}
		}
	},

	// persian
	{
		packageName: "cldr-cal-persian-modern",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian",
			as: {
				"ca-persian": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"]
				}
			}
		}
	},
	{
		packageName: "cldr-cal-persian-modern",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian",
			as: {
				"ca-persian": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var oResult = {}, sUsage, oUsage, sWidth, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};

						for (sUsage in value) {
							oUsage = {};
							for (sWidth in value[sUsage]) {
								aData = [];
								mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName, index, array) {
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
		packageName: "cldr-cal-persian-modern",
		fileName: "ca-persian.json",
		template: {
			path: "dates.calendars.persian.eras",
			as: {
				"ca-persian": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						var sName;
						for (sName in value) {
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
						}
					}
				}
			}
		}
	},

	// buddhist
	{
		packageName: "cldr-cal-buddhist-modern",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist",
			as: {
				"ca-buddhist": {
					path: ".",
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"]
				}
			}
		}
	},
	{
		packageName: "cldr-cal-buddhist-modern",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist",
			as: {
				"ca-buddhist": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var oResult = {}, sUsage, oUsage, sWidth, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};

						for (sUsage in value) {
							oUsage = {};
							for (sWidth in value[sUsage]) {
								aData = [];
								mData = value[sUsage][sWidth];
								mConfig[key].forEach(function(keyName, index, array) {
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
		packageName: "cldr-cal-buddhist-modern",
		fileName: "ca-buddhist.json",
		template: {
			path: "dates.calendars.buddhist.eras",
			as: {
				"ca-buddhist": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						var sName;
						for (sName in value) {
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
						}
					}
				}
			}
		}
	},

	{
		packageName: "cldr-dates-modern",
		fileName: "dateFields.json",
		template: {
			path: "dates.fields",
			as: {
				"dateFields": {
					path: ".",
					choose: ["era", "year", "year-short", "year-narrow", "quarter", "quarter-short", "quarter-narrow", "month", "month-short", "month-narrow", "week", "week-short", "week-narrow", "weekday", "day", "day-short", "day-narrow", "hour", "hour-short", "hour-narrow", "minute", "minute-short", "minute-narrow", "second", "second-short", "second-narrow", "zone"],
					format: function(node, value, key) {
						var aSingleFormFields = ["era", "weekday", "zone"],
							oSingleFormMap = {};

						aSingleFormFields.forEach(function(value, index) {
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
		packageName: "cldr-numbers-modern",
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
		packageName: "cldr-numbers-modern",
		fileName: "numbers.json",
		template: {
			path: "numbers.decimalFormats-numberSystem-latn.",
			choose: ["long", "short"],
			format: function(node, value, key) {
				var name, mData = value.decimalFormat, mChangedData = {};
				for (name in mData) {
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
		packageName: "cldr-numbers-modern",
		fileName: "numbers.json",
		template: {
			path: "numbers",
			choose: ["scientificFormats-numberSystem-latn", "percentFormats-numberSystem-latn", "currencyFormats-numberSystem-latn", "miscPatterns-numberSystem-latn"],
			format: function(node, value, key) {
				if (key === "currencyFormats-numberSystem-latn") {
					value = {
						standard: value.standard,
						accounting: value.accounting,
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
		packageName: "cldr-numbers-modern",
		fileName: "numbers.json",
		template: {
			path: "numbers.currencyFormats-numberSystem-latn.",
			choose: ["long", "short"],
			format: function(node, value, key) {
				var name, mData = value.standard, mChangedData = {};
				for (name in mData) {
					mChangedData[name.replace("-count-", "-")] = mData[name];
				}
				return {
					key: "currencyFormat-" + key,
					value: mChangedData
				};
			}
		}
	},
	{
		packageName: "cldr-numbers-modern",
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
		packageName: "cldr-numbers-modern",
		fileName: "currencies.json",
		template: {
			path: "numbers.currencies",
			as: {
				"currencySymbols": {
					path: ".",
					choose: function(node, value, key) {
						return value.symbol && value.symbol !== key;
					},
					format: function(node, value, key) {
						return {
							value: value.symbol
						};
					}
				}
			}
		}
	},
	{
		packageName: "cldr-misc-modern",
		fileName: "layout.json",
		template: {
			path: "layout.orientation",
			choose: ["characterOrder"],
			format: function(node, value, key) {
				return {
					key: "rtl",
					value: value === "right-to-left"
				};
			}
		}
	},
	{
		packageName: "cldr-misc-modern",
		fileName: "listPatterns.json",
		template: {
			path: "listPatterns",
			choose: ["listPattern-type-standard", "listPattern-type-standard-short", "listPattern-type-or",  "listPattern-type-or-short"],
			format: function(node, value, key) {
				key = key.replace(/-type/, "");

				if (key.match(/-/g).length === 1) {
					key = key + "-wide";
				}

				if (key === "listPattern-or-wide" && !node["listPattern-type-or-short"]) {
					return [{ key: key, value: value }, { key: "listPattern-or-short", value: value }];
				} else {
					return { key: key };
				}
			}
		}
	},
	{
		packageName: "cldr-units-modern",
		fileName: "units.json",
		template: {
			path: "units",
			as: {
				"units": {
					path: ".",
					choose: ["short"],
					format: function(node, value, key) {
						return { key: key, value: value };
					}
				}
			}
		}
	},
	{
		// this package includes character information for lenient parsing
		packageName: "cldr-misc-modern",
		fileName: "characters.json",
		template: {
			path: "characters",
			choose: ["lenient-scope-number"],
			/**
			 * Retrieve the lenient symbols without brackets and escape characters
			 * Convert PCRE Regex Syntax to a String containing all the symbols
			 * @param {object} node xml node
			 * @param {object} value e.g. { "-" : "[\\--/]" }
			 * @param {string} key e.g. "lenient-scope-date"
			 * @returns {object} formatted symbols e.g. "lenient-scope-date: { "minusSign": "--"}"
			 */
			format: function(node, value, key) {
				Object.keys(value).forEach(function(sKey) {
					var sOldKey = sKey,
						oPattern = value[sKey];

						switch (sKey) {
						case "-":
							sKey = "minusSign";
							break;
						case "+":
							sKey = "plusSign";
							break;
						case ",":
							sKey = "commaSign";
							break;
						case ":":
							sKey = "colonSign";
							break;
					}
					// For unicode Regular Expressions see:
					// * https://github.com/twitter/twitter-cldr-js#unicode-regular-expressions
					// * https://www.unicode.org/reports/tr18/#Notation
					// * https://www.unicode.org/reports/tr35/tr35-53/tr35.html#Unicode_Sets

					// remove brackets "[" and "]" from the patterns
					if (oPattern.startsWith("[") && oPattern.endsWith("]")) {
						oPattern = oPattern.substring(1, oPattern.length - 1);
					}

					// Remove invalid escape characters from character array
					if (oPattern.indexOf("\\\\") > -1) {
						oPattern = oPattern.replace(/\\\\/g, "");
					}

					// remove duplicate symbols
					var oPatternArray = oPattern.split("");

					oPattern = oPatternArray.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					}).join("");


					value[sKey] = oPattern;

					delete value[sOldKey];
				});
				return { key: key, value: value };
			}
		}
	}
];
