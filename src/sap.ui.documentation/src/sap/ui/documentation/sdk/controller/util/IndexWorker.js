/*!
 * ${copyright}
 */
/* global fetch */

(function() {
	"use strict";
	/* global lunr, importScripts, XMLHttpRequest, JSON, Object */

	fetch("../../../../../../../documentation-config.js")
		.then(function(response) {
			if (response.ok) {
				importScripts(response.url);

				var ResourcesUtil = {
					/**
					 *
					 * @param {string} sPath Relative path to resources
					 */
					getResourceOriginPath: function (sPath) {
						var oConfig = self['sap-ui-documentation-config'],
							sOrigin = (oConfig && oConfig.demoKitResourceOrigin) || '.';
						return sOrigin + this._formatPath(sPath);
					},
					_formatPath: function(sPath) {
						sPath = sPath.replace(/^\.\//, '/');

						if (!sPath.match(/^\//)) {
							sPath = "/" + sPath;
						}
						return sPath;
					}
				};

				URL.SEARCH_INDEX = ResourcesUtil.getResourceOriginPath("../../../../../../../searchindex.json");
			}
		});

	var URL = {
		SEARCH_INDEX: "../../../../../../../searchindex.json",
		SEARCH_LIB: "../../thirdparty/elasticlunr.js"
	};

	var APIREF_URL_PATHS = {
			"properties": "controlProperties",
			"fields": "properties",
			"aggregations": "aggregations",
			"associations": "associations",
			"events": "events",
			"specialSettings": "specialsettings",
			"annotations": "annotations",
			"methods": "methods"
		},

		APIREF_SECTION_TITLE = {
			"properties": "property",
			"fields": "field",
			"aggregations": "aggregation",
			"associations": "association",
			"events": "event",
			"specialSettings": "specialsetting",
			"annotations": "annotation",
			"methods": "method"
		},

		DOC_CATEGORY = {
			"documentation": "topics",
			"samples": "entity",
			"apiref": "apiref"
		};

	importScripts(URL.SEARCH_LIB);


	var WORKER = {
			COMMANDS: {
				INIT: "fetch",
				SEARCH: "search"
			},
			RESPONSE_FIELDS: {
				DONE: "bDone",
				SEARCH_RESULT: "oSearchResult"
			}
		},

		METADATA_FIELDS = [
			"properties",
			"aggregations",
			"associations",
			"events",
			"methods",
			"specialSettings",
			"annotations"
		],

		INDEXED_FIELDS = METADATA_FIELDS.concat([
			"title",
			"contents",
			"paramTypes"
		]),

		AUTO_GENERATED_METHOD_PREFIXES = [
			"get",
			"set",
			"add",
			"insert",
			"remove",
			"removeAll",
			"destroy",
			"indexOf",
			"attach",
			"detach"
		],

		WORD_REGEX = new RegExp("[a-zA-Z]+"),

		OR_separator = " ", // separator of terms in the search query

		oIndexCache = {};


	/**
	 * Listen for job requests
	 */
	self.addEventListener('message', function(oEvent) {

		var oData = oEvent.data,
			sCmd = oData && oData.cmd;

		// Init request may be received separately from search
		// because we want to be able to start the download
		// of the index in the earliest point in time
		if (sCmd === WORKER.COMMANDS.INIT) {
			fetchIndex().then(function() {
				var oResponse = {};
				oResponse[WORKER.RESPONSE_FIELDS.DONE] = true;
				self.postMessage(oResponse);
			});


		} else if (sCmd === WORKER.COMMANDS.SEARCH) {
			searchIndex(oEvent.data.query, oEvent.data.options).then(function(oSearchResult) {
				var oResponse = {};
				oResponse[WORKER.RESPONSE_FIELDS.SEARCH_RESULT] = oSearchResult;
				self.postMessage(oResponse);
			});
		}
	}, false);


	/**
	 * Obtains the index via network request
	 * or from cache
	 *
	 * @returns {Promise<any>}
	 */
	function fetchIndex() {

		return new Promise(function(resolve, reject) {

			var oIndex = oIndexCache["index"],
				oSerializedIndex;

			if (oIndex) {
				resolve(oIndex);
				return;
			}

			var req = new XMLHttpRequest(),

				onload = function (oEvent) {

					if (oEvent.target.response === null) {
						return self.postMessage({error: "Resource file searchindex.json not found"});
					}

					oSerializedIndex = oEvent.target.response;

					if (typeof oSerializedIndex !== 'object') {
						// fallback in case the browser does not support automatic JSON parsing
						oSerializedIndex = JSON.parse(oSerializedIndex);
					}

					oSerializedIndex = decompressIndex(oSerializedIndex);

					overrideLunrTokenizer();

					oIndex = lunr.Index.load(oSerializedIndex.lunr);

					oIndexCache["index"] = oIndex;
					oIndexCache["docs"] = oSerializedIndex.docs;

					resolve(oIndex);
				};

			req.responseType = 'json';
			req.addEventListener("load", onload, false);
			req.open("get", URL.SEARCH_INDEX);
			req.send();
		});
	}


	/**
	 * Searches the index, given a search string
	 *
	 * @param sQuery - the search string
	 * @returns {Promise<any>}
	 */
	function searchIndex(sQuery, oOptions) {

		oOptions || (oOptions = {});

		sQuery = preprocessQuery(sQuery);

		return new Promise(function(resolve, reject) {

			fetchIndex().then(function(oIndex) {

				var aSearchResults,
					oSearchResultsCollector = new SearchResultCollector();

				function searchByField(sFieldToSearch, sSubQuery, bReturnMatchedDocWord) {

					var aResults = oIndex.search(sSubQuery, createSearchConfig(sFieldToSearch));

					oSearchResultsCollector.add(aResults,
						sSubQuery,
						sFieldToSearch,
						bReturnMatchedDocWord);
				}

				// search by fields in priority order
				searchByField("title", sQuery);
				METADATA_FIELDS.forEach(function(sField) {
					lunr.tokenizer(sQuery).forEach(function(sSubQuery) {
						searchByField(sField, sSubQuery, true);
					});
				});
				searchByField("paramTypes", sQuery);
				searchByField("contents", sQuery);

				// collect all results
				aSearchResults = oSearchResultsCollector.getAll();
				aSearchResults = formatResult(aSearchResults, sQuery, oOptions);

				resolve({
					success: aSearchResults.data && !!(aSearchResults.data.length),
					totalHits: aSearchResults.data && aSearchResults.data.length,
					matches: aSearchResults
				});
			});
		});
	}

	/**
	 * Extends the search string to increase the chance to find *metadata*-specific terms
	 *
	 * e.g. when user searched for 'attachPress'
	 * => modify into 'attachPress OR press'
	 *
	 * @param sQuery
	 * @returns {*}
	 */
	function preprocessQuery(sQuery) {

		var base;
		for (var i = 0; i < AUTO_GENERATED_METHOD_PREFIXES.length; i++) {
			var sPrefix = AUTO_GENERATED_METHOD_PREFIXES[i];
			if (sQuery.indexOf(sPrefix) === 0) {
				base = sQuery.substring(sPrefix.length);
			}
		}

		if (base && WORD_REGEX.test(base)) {
			sQuery += OR_separator + base; // adds one more *optional* keyword to the search string
		}
		return sQuery;
	}


	/**
	 * overrides the lunr tokenizer in order to define custom token separators
	 */
	function overrideLunrTokenizer() {

		var origTokenizer = lunr.tokenizer;
		var rSeparators = /[-./#_,;\(\)=><|]/g;

		lunr.tokenizer = function(str) {
			return origTokenizer.call(lunr, str).reduce( function (result, token) {
				if ( rSeparators.test(token) ) {
					token = token.replace(rSeparators, " ");
					result.push.apply(result, token.toLowerCase().split(/ +/));
				} else {
					result.push(token.toLowerCase());
				}
				return result;
			}, []);
		};
		Object.keys(origTokenizer).forEach(function (key) {
			lunr.tokenizer[key] = origTokenizer[key];
		});
	}

	/**
	 * Decompresses the oIndex
	 *
	 * @param oIndex
	 * @returns {*}
	 */
	function decompressIndex(oIndex) {

		function decompressField(sFieldName) {

			var tfValues = oIndex.lunr.index[sFieldName].tfValues;
			tfValues[0] = NaN; // restore NaN, JSON converts it to null
			oIndex.lunr.index[sFieldName].tfValues = undefined;

			function decompressArrayItemsByLength(sCompressed) {
				var aDocIds = [];
				sCompressed.split(",").forEach(function(sCompressedOfLength) {
					var aParts = sCompressedOfLength.split(":"),
						iKey = parseInt(aParts[0]),
						sDocIdsOfLen = aParts[1];

					while (sDocIdsOfLen.length > 0) {
						aDocIds.push(sDocIdsOfLen.slice(0, iKey));
						sDocIdsOfLen = sDocIdsOfLen.slice(iKey);
					}
				});
				return aDocIds;
			}

			function decompressDocs(oNode) {
				var oDocs = oNode.docs,
					iCount = 0;
				if ( oDocs === undefined ) {
					oNode.docs = {};
				} else {
					Object.keys(oDocs).forEach(function (sDocKey) {
						if ( typeof oDocs[sDocKey] === 'number' ) {
							oDocs[sDocKey] = {
								tf: tfValues[ oDocs[sDocKey] ]
							};
						}
						if ( sDocKey.indexOf(':') >= 0 ) {
							var aDocIds = decompressArrayItemsByLength(sDocKey);
							aDocIds.forEach( function (docKeyPart) {
								oDocs[docKeyPart] = oDocs[sDocKey];
								iCount++;
							});
							oDocs[sDocKey] = undefined;
						} else {
							iCount++;
						}
					});
				}
				if ( oNode.df === undefined ) {
					oNode.df = iCount;
				}
			}

			function decompressIndexNode(oNode) {
				decompressDocs(oNode);
				Object.keys(oNode).forEach( function (sKey) {
					if ( sKey !== 'docs' && sKey !== 'df' ) {
						var oValue = oNode[sKey];
						var iLength = sKey.length;
						if ( iLength > 1 ) {
							while ( --iLength > 0 ) {
								var oTmp = {};
								oTmp[ sKey.charAt(iLength) ] = oValue;
								oValue = oTmp;
							}
							oNode[ sKey.charAt(0) ] = oValue;
							oNode[sKey] = undefined;
						}
						decompressIndexNode(oValue);
					}
				} );
			}

			decompressIndexNode(oIndex.lunr.index[sFieldName].root);
		}

		function traverse(oNode,fnProcessNode) {
			for (var i in oNode) {
				fnProcessNode.apply(oNode,[i,oNode[i]]);
				if (oNode[i] !== null && typeof (oNode[i]) == "object") {
					//going one step down in the object tree!!
					traverse(oNode[i],fnProcessNode);
				}
			}
		}

		function deleteUndefinedEntries(sKey, oValue) {
			if (oValue === undefined) {
				delete this[sKey];
			}
		}

		INDEXED_FIELDS.forEach(function(sFieldName) {
			decompressField(sFieldName);
		});

		// return a deep copy to get rid of properties with value "undefined"
		traverse(oIndex, deleteUndefinedEntries);

		return oIndex;
	}

	/**
	 * Helper class
	 * used for collecting and post-processing
	 * of the search results
	 * @constructor
	 */
	var SearchResultCollector = function() {
		var oDocs = oIndexCache["docs"];
		if (!oDocs) {
			throw new Error("docs are required");
		}
		this._oDocs = oDocs;
		this._oCollectedResults = {};
	};

	SearchResultCollector.prototype.add = function(aResults, sQuery, sMatchedDocField, bReturnMatchedDocWord) {
		aResults.forEach(function(oResult) {

			this._mergeResultWithDocInfo(oResult, sQuery, sMatchedDocField, bReturnMatchedDocWord);

			this._oCollectedResults[this._getResultId(oResult)] = oResult;
		}.bind(this));

		return this;
	};

	SearchResultCollector.prototype.getAll = function() {
		return getObjectValues(this._oCollectedResults);
	};

	SearchResultCollector.prototype._mergeResultWithDocInfo = function(oResult, sQuery, sDocFieldName, bReturnMatchedDocWord) {
		var oDoc = this._oDocs[oResult.ref];

		oResult.doc = oDoc;
		oResult.matchedDocField = sDocFieldName;
		if (bReturnMatchedDocWord) {
			oResult.matchedDocWord = getMatchedWord(oDoc[sDocFieldName], sQuery);
		}
	};

	SearchResultCollector.prototype._getResultId = function(oResult) {
		var sDocId = oResult.ref,
			// if more than one word is matched in the same doc
			// e.g. search for 'headerContent' returned
			// 'headerContentPinnable' and 'headerContent' in the SAME doc
			// => BOTH should be displayed even though they are in the SAME doc
			// => they should count as DIFFERENT results
			// => they should have different IDs
			// => we append the matched word to the ID:
			sDocSubSectionId = oResult.matchedDocWord || "";

		return sDocId + "/" + sDocSubSectionId;
	};


	/**
	 * Utility functions
	 */

	/**
	 * Returns the first word that *starts with* the token to match
	 * @param sWords
	 * @param sTokenToMatch
	 * @returns {*}
	 */
	function getMatchedWord(sWords, sTokenToMatch) {
		if (sWords) {

			var fnStartsWithToken = function (sString) {
				return sString.toLowerCase().indexOf(sTokenToMatch.toLowerCase()) === 0;
			};

			var aMetadataTokens = sWords.split(" ");
			// note we search words that *start with* the token to match
			// rather than *exact* match only, because the user may have entered only the beginning of the word;
			// and Lunr supports search by the *beginning* of the word (but not by substring other than the beginning)
			var sMatchedMetadataToken = aMetadataTokens.filter(fnStartsWithToken);
			if (sMatchedMetadataToken.length) {
				return sMatchedMetadataToken[0];
			}
		}
		return null;
	}

	/**
	 * Create config for search of the lunr index
	 * in the expected (by lunr lib) format
	 *
	 * @param sFieldToSearch
	 * @returns {{fields: {}, expand: boolean}}
	 */
	function createSearchConfig(sFieldToSearch) {
		var oConfig = {
			fields: {},
			expand: true
		};

		oConfig.fields[sFieldToSearch] = {};
		return oConfig;
	}

	/**
	 * Polyfill for Object.values
	 *
	 * as original Object.values is N/A on IE
	 * @param oObject
	 * @returns {Array}
	 */
	function getObjectValues(oObject) {
		var aKeys = Object.keys(oObject),
			aValues = [];

		aKeys.forEach(function(sKey) {
			aValues.push(oObject[sKey]);
		});

		return aValues;
	}


	function formatResult(aMatches, sQuery, oOptions) {
		var oNext,
		iNext = 0,
		aData = [],
		aDataAPI = [],
		aDataDoc = [],
		aDataExplored = [],
		aFilteredData = [],
		iAllLength = 0,
		iAPILength = 0,
		iDocLength = 0,
		iExploredLength = 0,
		sPreferencedCategory = oOptions.sPreferencedCategory,
		bIncludeDeprecated = oOptions.includeDeprecated;

		if ( aMatches ) {

			for (var i = 0; i < aMatches.length; i++) {
				var oMatch = aMatches[i],
					oDoc = oMatch.doc;
				//TODO: Find a nicer Date formatting procedure
				oDoc.modifiedStr = oDoc.modified + "";
				var sModified = oDoc.modifiedStr.substring(0,4) + "/" + oDoc.modifiedStr.substring(4,6) + "/" + oDoc.modifiedStr.substring(6,8) + ", " + oDoc.modifiedStr.substring(8,10) + ":" + oDoc.modifiedStr.substring(10),
					sTitle = oDoc.title,
					sSummary = oDoc.summary ? oDoc.summary.trim() : "",
					sNavURL = oDoc.path,
					bShouldAddToSearchResults = false,
					sCategory,
					oObject,
					sDeprecatedMarker;
				if (oDoc.category === DOC_CATEGORY.documentation) {
					bShouldAddToSearchResults = true;
					sCategory = "Documentation";
					oObject = {
						title: sTitle ? sTitle : "Untitled",
						path: sNavURL,
						summary: sSummary || "",
						score: oDoc.score,
						modified: sModified,
						category: sCategory,
						external: oDoc.external
					};
					aDataDoc.push(oObject);
					iDocLength++;
				} else if (oDoc.category === DOC_CATEGORY.samples) {
					bShouldAddToSearchResults = true;
					if (oDoc.deprecated && !bIncludeDeprecated) {
						continue;
					}
					sCategory = "Samples";
					sDeprecatedMarker = oDoc.deprecated ? "deprecated " : "";
					oObject = {
						title: sTitle ? sTitle + " (" + sDeprecatedMarker + "samples)" : "Untitled",
						path: sNavURL,
						summary: sSummary || "",
						score: oDoc.score,
						modified: sModified,
						category: sCategory,
						external: oDoc.external
					};
					aDataExplored.push(oObject);
					iExploredLength++;
				} else if (oDoc.category === DOC_CATEGORY.apiref) {
					sNavURL = _formatApiRefURL(oMatch);
					sTitle = _formatApiRefTitle(oMatch);
					sSummary = _formatApiRefSummary(oMatch);
					bShouldAddToSearchResults = true;
					if (!bIncludeDeprecated && oDoc.deprecated) {
						continue;
					}
					sCategory = "API Reference";
					oObject = {
						title: sTitle,
						path: sNavURL,
						summary: sSummary || "",
						score: oDoc.score,
						modified: sModified,
						category: sCategory
					};
					aDataAPI.push(oObject);
					iAPILength++;
				}

				if (bShouldAddToSearchResults) {
					aData.push(oObject);
					iAllLength++;

					if ((aFilteredData.length < 10) && (oDoc.category === sPreferencedCategory)) {
						aFilteredData.push(oObject);
					}
				}

			}
		}

		while ((aFilteredData.length < 10) && (iNext < aData.length)) {
			oNext = aData[iNext++];
			if (aFilteredData.indexOf(oNext) === -1) {
				aFilteredData.push(oNext);
			}
		}

		return {
			data: aData,
			aDataAPI: aDataAPI,
			aDataDoc : aDataDoc,
			aDataExplored: aDataExplored,
			filteredData : aFilteredData,
			AllLength: iAllLength,
			APILength: iAPILength,
			DocLength : iDocLength,
			ExploredLength : iExploredLength
		};
	}


	function _formatApiRefURL(oMatch) {
		var sEntityType = oMatch.matchedDocField,
			sEntityName = oMatch.doc.title,
			sEntityPath = APIREF_URL_PATHS[sEntityType],
			sURL;

		sURL = "api/" + sEntityName;

		if (sEntityPath) {
			sURL += "#" + sEntityPath; // add target section
		}

		if (sEntityType === "methods") {
			sURL += "/" + oMatch.matchedDocWord; // add target subSection
		}

		return sURL;
	}

	function _formatApiRefTitle (oMatch) {
		var oDoc = oMatch.doc,
			sKind = oDoc.kind.toLowerCase(),
			sMetadataFieldType = APIREF_SECTION_TITLE[oMatch.matchedDocField],
			sMetadataFieldName = oMatch.matchedDocWord;

		if (sMetadataFieldType && sMetadataFieldName) {
			// a match was found within a *known* section of the apiref doc
			return sMetadataFieldName + " (" + sMetadataFieldType + ")";
		}

		if (sKind) {
			var sFormattedKind = oDoc.deprecated ? ("deprecated " + sKind) : sKind;
			return oDoc.title + " (" + sFormattedKind + ")";
		}
		//default case
		return oDoc.title;
	}

	function _formatApiRefSummary (oMatch) {
		var oDoc = oMatch.doc,
			sMatchedFieldType = APIREF_SECTION_TITLE[oMatch.matchedDocField],
			sMatchedFieldName = oMatch.matchedDocWord,
			bMatchedSubSection = sMatchedFieldType && sMatchedFieldName;

		if (bMatchedSubSection) {
			// we matched a known property/aggregation/method (etc.) *name*
			// so the default doc summary (which is the summary of the entire class/namespace)
			// may not be the closest context anymore
			// => return the doc title only (to indicate in which class/namespace the match was found)
			return oDoc.title;
		}
		//default case
		return oDoc.summary;
	}


})();