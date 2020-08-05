sap.ui.define([
	'sap/ui/base/ManagedObject',
	"jquery.sap.global",
	"sap/ui/thirdparty/sinon"
], function (ManagedObject, jQuery, sinon) {
	"use strict";

	return ManagedObject.extend("sap.ui.mdc.sample.table.mockServer", {

		started: null,
		init: function () {
			var mockData, metadata;

			this.started = jQuery.get("./mockserver/ProductList.json").then(function (data, status, jqXHR) {
				mockData = data;
				return jQuery.get("./mockserver/metadata.xml");
			}).then(function (data, status, jqXHR) {
				metadata = jqXHR.responseText;

				var fServer = sinon.fakeServer.create();
				fServer.autoRespond = true;
				fServer.xhr.useFilters = true;

				fServer.xhr.addFilter(function (method, url) {
					// whenever the this returns true the request will not faked
					return !url.match(/\/sap\/opu\/odata4\//);
				});

				generateResponse(fServer);
			});
			function generateResponse(fServer) {
				fServer.respondWith("GET", /\/sap\/opu\/odata4\/IWBEP\/V4_SAMPLE\/default\/IWBEP\/V4_GW_SAMPLE_BASIC\/0001\//, function (xhr, id) {
					var oParams = jQuery.sap.getUriParameters(xhr.url), sFilter = oParams.get("$filter");
					var oFilteredData = jQuery.extend({}, (mockData));
					if (xhr.url.indexOf("metadata") > -1) {
						return xhr.respond(200, {
							"Content-Type": "application/xml",
							"OData-Version": "4.0"
						}, metadata);
					}
					//search
					if (xhr.url.indexOf("$search") > -1) {
						var sSearchString = oParams.get("$search");

						oFilteredData.value = searchData(sSearchString, oFilteredData.value);
					}
					if (xhr.url.indexOf("$filter") > 0) {
						//sFilter = xhr.url.match(/\$filter=(.*)&/)[1];

						if (sFilter.indexOf("&$skip=0") > -1) {
							sFilter = sFilter.slice(0, sFilter.indexOf("&$skip=0"));
						}

						oFilteredData.value = recursiveOdataQueryFilter(mockData.value, sFilter);

					}
					if (xhr.url.indexOf("$orderby") > -1) {
						var bDesc = false;
						if (xhr.url.indexOf("desc") > -1) {
							bDesc = true;
						}
						var sOrderByProperty = oParams.get("$orderby"),
							//sEntitySet = "ProductList",
							//sEntityType = "Product",
							sOrderByString = sOrderByProperty.split(' ')[0],
						//oFilteredData.value = sortData(sOrderByString, oFilteredData.value);
							aSearchableProperty = ["ProductID", "TypeCode", "Category", "Name", "NameLanguage", "Description", "DescriptionLanguage", "SupplierID", "SupplierName", "MeasureUnit", "WeightUnit", "CurrencyCode", "DimUnit"];
						oFilteredData.value = sortData(sOrderByString, oFilteredData.value, aSearchableProperty, bDesc);
					}
					if (xhr.url.indexOf("ProductList") > -1) {
						return xhr.respond(200, {
							"Content-Type": "application/json",
							"OData-Version": "4.0"
						}, JSON.stringify(oFilteredData));
					}
				});
			}

			function trim(sString) {
				return sString && sString.replace(/^\s+|\s+$/g, "");
			}

			function escapeStringForRegExp(sString) {
				return sString.replace(/[\\\/\[\]\{\}\(\)\-\*\+\?\.\^\$\|]/g, "\\$&");
			}

			function searchData(sValue, aData) {
				return aData.filter(function (oEntry) {
					var aKeys = Object.keys(oEntry), bHit = false;
					aKeys.forEach(function (sKey) {
						if (oEntry[sKey] && (typeof oEntry[sKey] === "string") && oEntry[sKey].indexOf(sValue) > -1) {
							bHit = true;
							return;
						}
					});
					return bHit;
				});
			}

			function filterData(aData, sODataQueryValue) {
				if (aData.length === 0) {
					return aData;
				}

				var rExp = new RegExp("(.*) (eq|ne|gt|lt|le|ge) (.*)");
				var rExp2 = new RegExp("(endswith|startswith|contains)\\((.*)\\)(.*)");
				var sODataFilterMethod = null;
				var aODataFilterValues = rExp.exec(sODataQueryValue);
				if (aODataFilterValues) {
					sODataFilterMethod = aODataFilterValues[2];
				} else {
					aODataFilterValues = rExp2.exec(sODataQueryValue);
					if (aODataFilterValues) {
						sODataFilterMethod = aODataFilterValues[1];
					}
				}

				// startsWith, contains, endswith
				if (sODataFilterMethod === "startswith" || sODataFilterMethod === "contains" || sODataFilterMethod === "endswith") {
					var aKeyValue = aODataFilterValues[2].split(",");
					// remove quotes from value
					if (typeof aKeyValue[1] === 'string' && aKeyValue[1].indexOf("'") === 0) {
						aKeyValue[1] = aKeyValue[1].slice(1, -1);
					}
					switch (sODataFilterMethod) {
						case "contains":
							return aData.filter(function (oEntry) {
								// return false if not found
								return oEntry.hasOwnProperty(aKeyValue[0]) ? oEntry[aKeyValue[0]].toString().includes(aKeyValue[1]) : false;
							});
						case "startswith":
							return aData.filter(function (oEntry) {
								// return false if not found
								return oEntry.hasOwnProperty(aKeyValue[0]) ? oEntry[aKeyValue[0]].toString().startsWith(aKeyValue[1]) : false;
							});
						default: //endswith
							return aData.filter(function (oEntry) {
								// return false if not found
								return oEntry.hasOwnProperty(aKeyValue[0]) ? oEntry[aKeyValue[0]].toString().endsWith(aKeyValue[1]) : false;
							});
					}

				}

				//eq, ne
				if (sODataFilterMethod === "eq") {
					return aData.filter(function (oEntry) {
						// return false if not found
						if (aODataFilterValues[3].match(/'([^']+)'/)) {
							return oEntry.hasOwnProperty(aODataFilterValues[1]) ? oEntry[aODataFilterValues[1]].toString() === aODataFilterValues[3].match(/'([^']+)'/)[1] : false;
						} else { //In case the property is of numeric type, it wont be enclosed inside braces
							return oEntry.hasOwnProperty(aODataFilterValues[1]) ? oEntry[aODataFilterValues[1]].toString() === aODataFilterValues[3] : false;
						}
					});
				}
				if (sODataFilterMethod === "ne") {
					return aData.filter(function (oEntry) {
						// return false if not found
						if (aODataFilterValues[3].match(/'([^']+)'/)) {
							return oEntry.hasOwnProperty(aODataFilterValues[1]) ? oEntry[aODataFilterValues[1]].toString() !== aODataFilterValues[3].match(/'([^']+)'/)[1] : false;
						} else { //In case the property is of numeric type, it wont be enclosed inside braces
							return oEntry.hasOwnProperty(aODataFilterValues[1]) ? oEntry[aODataFilterValues[1]].toString() !== aODataFilterValues[3] : false;
						}
					});
				}

				return aData;
			}

			function _getBracketIndices(sString) {
				var aStack = [];
				var bReserved = false;
				var iStartIndex, iEndIndex = 0;
				for (var character = 0; character < sString.length; character++) {
					if (sString[character] === '(') {
						if (/[contains|endswith|startswith]$/.test(sString.substring(0, character))) {
							bReserved = true;
						} else {
							aStack.push(sString[character]);
							if (iStartIndex === undefined) {
								iStartIndex = character;
							}
						}
					} else if (sString[character] === ')') {
						if (!bReserved) {
							aStack.pop();
							iEndIndex = character;
							if (aStack.length === 0) {
								return {
									start: iStartIndex,
									end: iEndIndex
								};
							}
						} else {
							bReserved = false;
						}
					}
				}
				return {
					start: iStartIndex,
					end: iEndIndex
				};
			}

			function arrayUnique(array) {
				var a = array.concat();
				for (var i = 0; i < a.length; ++i) {
					for (var j = i + 1; j < a.length; ++j) {
						if (a[i] === a[j]) {
							a.splice(j--, 1);
						}
					}
				}
				return a;
			}

			function addAllUnique(array, others) {
				return others.reduce(function(item) {
					if ( array.indexOf(item) < 0 ) {
						array.push(item);
					}
					return array;
				}, array);
			}

			function recursiveOdataQueryFilter(aDataSet, sODataQueryValue) {
				if (sODataQueryValue) {

					// check for wrapping brackets, e.g. (A), (A op B), (A op (B)), (((A)))
					var oIndices = _getBracketIndices(sODataQueryValue);
					if (oIndices.start === 0 && oIndices.end === sODataQueryValue.length - 1) {
						sODataQueryValue = trim(sODataQueryValue.substring(oIndices.start + 1, oIndices.end));
						return recursiveOdataQueryFilter(aDataSet, sODataQueryValue);
					}

					// find brackets that are not related to the reserved words
					var rExp = /([^contains|endswith|startswith]|^)\((.*)\)/,
						aSet2,
						aParts;

					var sOperator;
					if (rExp.test(sODataQueryValue)) {
						var sBracketed = sODataQueryValue.substring(oIndices.start, oIndices.end + 1);
						var rExp1 = new RegExp("(.*) +(or|and) +(" + trim(escapeStringForRegExp(sBracketed)) + ".*)");
						if (oIndices.start === 0) {
							rExp1 = new RegExp("(" + trim(escapeStringForRegExp(sBracketed)) + ") +(or|and) +(.*)");
						}

						var aExp1Parts = rExp1.exec(sODataQueryValue);
						// remove brackets around values
						if (aExp1Parts === null) {
							sODataQueryValue = sODataQueryValue.replace(/[\(\)]/g, "");
							return filterData(aDataSet, trim(sODataQueryValue));
						}
						var sExpression = aExp1Parts[1];
						sOperator = aExp1Parts[2];
						var sExpression2 = aExp1Parts[3];

						var aSet1 = recursiveOdataQueryFilter(aDataSet, sExpression);
						if (sOperator === "or") {
							aSet2 = recursiveOdataQueryFilter(aDataSet, sExpression2);
							return arrayUnique(aSet1.concat(aSet2));
						}
						if (sOperator === "and") {
							return recursiveOdataQueryFilter(aSet1, sExpression2);
						}
					} else {
						//there are only brackets with the reserved words
						// e.g. A or B and C or D
						aParts = sODataQueryValue.split(/ +and | or +/);

						// base case
						if (aParts.length === 1) {
							// IE8 handling
							if (sODataQueryValue.match(/ +and | or +/)) {
								throw new Error("400");
							}

							return filterData(aDataSet, trim(sODataQueryValue));
						}

						var aResult = recursiveOdataQueryFilter(aDataSet, aParts[0]);
						var rRegExp;
						for (var i = 1; i < aParts.length; i++) {
							rRegExp = new RegExp(trim(escapeStringForRegExp(aParts[i - 1])) + " +(and|or) +" + trim(escapeStringForRegExp(
								aParts[i])));
							sOperator = rRegExp.exec(sODataQueryValue)[1];

							if (sOperator === "or") {
								aSet2 = recursiveOdataQueryFilter(aDataSet, aParts[i]);
								addAllUnique(aResult, aSet2);
							}
							if (sOperator === "and") {
								aResult = recursiveOdataQueryFilter(aResult, aParts[i]);
							}
						}
						return aResult;
					}
				}
			}

			function sortData(sFieldName, aData, aSearchableProperties, bDesc) {
				if (aSearchableProperties.indexOf(sFieldName) === -1) {
					aData.sort(function (oEntry1, oEntry2) {
						return oEntry1[sFieldName] - oEntry2[sFieldName];
					});
				} else {
					// data type 'string'
					aData.sort(function (oEntry1, oEntry2) {
						return oEntry1[sFieldName].localeCompare(oEntry2[sFieldName]);
					});
				}
				if (bDesc) {
					return aData.reverse();
				}
				return aData;
			}
		}
	});
}, true);
