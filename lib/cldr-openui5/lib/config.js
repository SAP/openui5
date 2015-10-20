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
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"]
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
								oUsage[sWidth] = aData
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						}
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
								oUsage[sWidth] = aData
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						}
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
					choose: ["dateFormats", "timeFormats", "dateTimeFormats"]
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
								oUsage[sWidth] = aData
							}
							oResult[sUsage] = oUsage;
						}
						return {
							key: key,
							value: oResult
						}
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
						["232", "233", "234", "235"].forEach(function(sEra) {
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

	{
		packageName: "cldr-dates-modern",
		fileName: "dateFields.json",
		template: {
			path: "dates.fields",
			as: {
				"dateFields": {
					path: ".",
					choose: ["era", "year", "quarter", "month", "day", "weekday", "second", "minute", "hour", "week", "zone"]
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
	}
];
