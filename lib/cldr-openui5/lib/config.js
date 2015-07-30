module.exports = [
	{
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
		fileName: "scripts.json",
		template: {
			path: "localeDisplayNames",
			choose: ["scripts"]
		}
	},
	{
		fileName: "territories.json",
		template: {
			path: "localeDisplayNames",
			choose: ["territories"]
		}
	},
	{
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
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["dateFormats", "timeFormats"],
					format: function(node, value, key) {
						var aResult = [],
							name;
						for (name in value) {
							aResult.push({
								key:  key.substring(0, key.length - 1) + "-" + name,
								value: value[name]
							});
						}
						return aResult;
					}
				}
			}
		}
	},
	{
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian.dateTimeFormats",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["full", "long", "medium", "short"],
					format: function(node, value, key) {
						return {
							key: "dateTimeFormat-" + key
						};
					}
				}
			}
		}
	},
	{
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian.dateTimeFormats.intervalFormats",
			as: {
				"ca-gregorian": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						if (key === "intervalFormatFallback") {
							return {
								key: "intervalFormatFallback"
							};
						}
						var aResult = [],
								name;
						for (name in value) {
							aResult.push({
								key: "intervalFormat" + "-" + key + "-" + name,
								value: value[name]
							});
						}
						return aResult;
					}
				}
			}
		}
	},
	{
		fileName: "ca-gregorian.json",
		template: {
			path: "dates.calendars.gregorian",
			as: {
				"ca-gregorian": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var aResult = [], name1, name2, mData, aData,
								mConfig = {
									months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
									days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
									quarters: ["1", "2", "3", "4"],
									dayPeriods: ["am", "pm"]
								};
						
						for (name1 in value) {
							for (name2 in value[name1]) {
								aData = [];
								mData = value[name1][name2];
								mConfig[key].forEach(function(keyName, index, array) {
									aData.push(mData[keyName]);
								});
								aResult.push({
									key: (key + "-" + name1 + "-" + name2).replace("stand-alone", "standAlone"),
									value: aData
								});
							}
						}
						return aResult;
					}
				}
			}
		}
	},
	{
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
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["dateFormats", "timeFormats"],
					format: function(node, value, key) {
						var aResult = [],
							name;
						for (name in value) {
							aResult.push({
								key:  key.substring(0, key.length - 1) + "-" + name,
								value: value[name]
							});
						}
						return aResult;
					}
				}
			}
		}
	},
	{
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic.dateTimeFormats",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["full", "long", "medium", "short"],
					format: function(node, value, key) {
						return {
							key: "dateTimeFormat-" + key
						};
					}
				}
			}
		}
	},
	{
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic.dateTimeFormats.intervalFormats",
			as: {
				"ca-islamic": {
					path: ".",
					all: true,
					format: function(node, value, key) {
						if (key === "intervalFormatFallback") {
							return {
								key: "intervalFormatFallback"
							};
						}
						var aResult = [],
							name;
						for (name in value) {
							aResult.push({
								key: "intervalFormat" + "-" + key + "-" + name,
								value: value[name]
							});
						}
						return aResult;
					}
				}
			}
		}
	},
	{
		fileName: "ca-islamic.json",
		template: {
			path: "dates.calendars.islamic",
			as: {
				"ca-islamic": {
					path: ".",
					choose: ["months", "days", "quarters", "dayPeriods"],
					format: function(node, value, key) {
						var aResult = [], name1, name2, mData, aData,
							mConfig = {
								months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
								days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
								quarters: ["1", "2", "3", "4"],
								dayPeriods: ["am", "pm"]
							};						
						for (name1 in value) {
							for (name2 in value[name1]) {
								aData = [];
								mData = value[name1][name2];
								mConfig[key].forEach(function(keyName, index, array) {
									aData.push(mData[keyName]);
								});
								aResult.push({
									key: (key + "-" + name1 + "-" + name2).replace("stand-alone", "standAlone"),
									value: aData
								});
							}
						}
						return aResult;
					}
				}
			}
		}
	},
	{
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
	{
		fileName: "dateFields.json",
		template: {
			path: "dates.fields",
			choose: ["year", "month", "day", "second", "minute", "hour", "week"],
			format: function(node, value, key) {
				var aResult = [],
					mSelectedProperties = {
						"displayName": "displayName",
						"relative--1": "relative-type--1",
						"relative-0": "relative-type-0",
						"relative-1": "relative-type-1",
						"relativeTime-type-future": {
							"relative-future-one": "relativeTimePattern-count-one",
							"relative-future-other": "relativeTimePattern-count-other"
						},
						"relativeTime-type-past": {
							"relative-past-one": "relativeTimePattern-count-one",
							"relative-past-other": "relativeTimePattern-count-other"
						}
					}, name, name1, outputName;
				
				for (name in mSelectedProperties) {
					outputName = mSelectedProperties[name];
					if (typeof outputName === "string") {
						aResult.push({
							key: "dateField-" + key + "-" + name,
							value: value[outputName]
						});
					} else {
						for (name1 in outputName) {
							aResult.push({
								key: "dateField-" + key + "-" + name1,
								value: value[name][outputName[name1]]
							});
						}
					}
				}
				return aResult;
			}
		}
	},
	{
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
		fileName: "numbers.json",
		template: {
			path: "numbers",
			choose: ["scientificFormats-numberSystem-latn", "percentFormats-numberSystem-latn", "currencyFormats-numberSystem-latn"],
			format: function(node, value, key) {
				if (key === "currencyFormats-numberSystem-latn") {
					value = {
						standard: value.standard,
						accounting: value.accounting
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
	}
];