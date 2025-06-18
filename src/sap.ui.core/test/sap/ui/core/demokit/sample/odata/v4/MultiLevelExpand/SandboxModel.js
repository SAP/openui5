/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/base/util/JSTokenizer",
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (JSTokenizer, SandboxModelHelper, ODataModel, _Helper) {
	"use strict";
	const aAirlineCurrencyCodes = ["USD", "EUR", "JPY", "EUR", "SGD", "USD"];
	const mAirline2Name = {
		AA : "American Airlines Inc.",
		AZ : "Alitalia Societa Aerea Italiana S.p.A.",
		JL : "Japan Airlines Co., Ltd.",
		LH : "Deutsche Lufthansa AG",
		SQ : "Singapore Airlines Limited",
		UA : "United Airlines, Inc."
	};
	const aAirlineIDs = Object.keys(mAirline2Name);
	const iNoOfAirlines = aAirlineIDs.length;

	/**
	 * Builds a response for any GET query on the "Bookings" collection.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetCollectionResponse(aMatches, oResponse) {
		const mQueryOptions = getQueryOptions(aMatches[1]);
		const sApply = mQueryOptions.$apply.replace(/%20/g, " ");
		const iSkip = parseInt(sApply.match(/[,\/]skip\((\d+)\)/)?.[1] ?? "0"); // optional
		const iTop = parseFloat(sApply.match(/[,\/]top\((\d+)\)/)?.[1] ?? "Infinity"); // optional

		let iLevels = 1;
		let vSubtotalsAtBottom;
		if (sApply.includes("MultiLevelExpand(")) {
			//     ,com.sap.vocabularies.Analytics.v1.MultiLevelExpand(
			//         LevelProperties=[{
			//             "DimensionProperties":["airline"]
			//             ,"AdditionalProperties":["airlineName"]
			//         }, ...]
			//         ,Aggregation=["FlightPrice","CurrencyCode_code"]
			//         ,SiblingOrder=[{"Property":"FlightPrice","Descending":true}]
			//         ,Levels=3)
			//         /concat(aggregate($count as UI5__count),top(119)))
			const sParameters = sApply
				.split("com.sap.vocabularies.Analytics.v1.MultiLevelExpand(")[1] // from
				.split(")/")[0]; //to ")/concat(" or ")/skip("
			const mParameters = JSTokenizer.parseJS(
				"{" + decodeURIComponent(sParameters).replaceAll("=", ":") + "}");
			iLevels = mParameters.Levels ?? Infinity;
			vSubtotalsAtBottom = mParameters.Aggregation.length
				? mParameters.SubtotalsAtBottom
				: "off";
		} else if (!sApply.includes("),aggregate(FlightPrice,CurrencyCode_code))")) {
			vSubtotalsAtBottom = "off";
		} // else in case of concat(...):
		//     ,groupby((airline,airlineName),aggregate(FlightPrice,CurrencyCode_code))
		//         /orderby(FlightPrice desc)/concat(aggregate($count as UI5__count),top(119)))

		let aRows = getAirlines(vSubtotalsAtBottom, iLevels);
		if (sApply.includes("concat(")) {
			// $apply=filter(status ne '')/concat(
			//     groupby((BookingDate,ConnectionID,FlightDate,airline,status))
			//         /aggregate($count as UI5__leaves)
			//     ,aggregate(FlightPrice,CurrencyCode_code)
			const aAllRows = [
				{
					UI5__leaves : String(2000 * iNoOfAirlines),
					"UI5__leaves@odata.type" : "#Decimal"
				},
				{CurrencyCode_code : /* multi-unit situation */null, FlightPrice : null},
				{UI5__count : String(aRows.length), "UI5__count@odata.type" : "#Decimal"},
				...aRows.slice(iSkip, iSkip + iTop)
			];
			if (!sApply.includes("UI5__leaves),aggregate(")) { // no grand total
				aAllRows.splice(1, 1);
			}
			oResponse.message = JSON.stringify({
				// "@odata.context" : "$metadata#Bookings(@SAP__core.AnyStructure)",
				// "@odata.metadataEtag" : 'W/"20250603082442"',
				value : aAllRows
			});

			return;
		} else if (iLevels > 1) {
			// $apply=filter(status ne '')/....MultiLevelExpand(...)/skip(119)/top(110)
			oResponse.message = JSON.stringify({
				// "@odata.context" : "$metadata#Bookings(@SAP__core.AnyStructure)", ...
				value : aRows.slice(iSkip, iSkip + iTop)
			});

			return;
		}

		const sAirline = getFilterValue(sApply, "airline");
		const iAirline = aAirlineIDs.indexOf(sAirline);
		const sConnectionID = getFilterValue(sApply, "ConnectionID");
		const iConnectionID = parseInt(sConnectionID?.at(-1));
		const sFlightDate = getFilterValue(sApply, "FlightDate", true);
		const iFlightDate = parseInt(sFlightDate?.at(-1));
		const sStatus = getFilterValue(sApply, "status");
		const iStatus = sStatus === "B" ? 0 : 1;
		const sBookingDate = getFilterValue(sApply, "BookingDate", true);
		if (sBookingDate) {
			throw new Error("Unsupported BookingDate filter"); // cannot drill-down further
		} else if (sStatus) {
			// $apply=filter(airline eq 'AZ' and ConnectionID eq '789'
			//         and FlightDate eq 2024-12-27 and status eq 'B' and (status ne ''))
			//     /groupby((BookingDate),aggregate(FlightPrice,CurrencyCode_code))
			//         /orderby(FlightPrice desc)&$count=true&$skip=0&$top=120
			// "@odata.context" : "$metadata#Bookings(BookingDate,FlightPrice,CurrencyCode_code)"
			// Note: no subtotals here!
			aRows = getBookings(iAirline, iConnectionID, iFlightDate, iStatus);
		} else if (sFlightDate) {
			// $apply=filter(airline eq 'LH' and ConnectionID eq '401'
			//         and FlightDate eq 2024-03-02 and (status ne ''))
			//     /groupby((status),aggregate(FlightPrice,CurrencyCode_code))
			//         /orderby(status,FlightPrice desc)&$count=true&$skip=0&$top=120
			// "@odata.context" : "$metadata#Bookings(status,FlightPrice,CurrencyCode_code)"
			aRows = getStatus(iAirline, iConnectionID, iFlightDate, vSubtotalsAtBottom);
		} else if (sConnectionID) {
			// $apply=filter(airline eq 'LH' and ConnectionID eq '403' and (status ne ''))
			//     /groupby((FlightDate),aggregate(FlightPrice,CurrencyCode_code))
			//         /orderby(FlightPrice desc)&$count=true&$skip=0&$top=120
			// "@odata.context" : "$metadata#Bookings(FlightDate,FlightPrice,CurrencyCode_code)"
			aRows = getFlights(iAirline, iConnectionID, vSubtotalsAtBottom);
		} else if (sAirline) {
			// $apply=filter(airline eq 'LH' and (status ne ''))
			//     /groupby((ConnectionID),aggregate(FlightPrice,CurrencyCode_code))
			//         /orderby(FlightPrice desc)&$count=true&$skip=0&$top=120
			// "@odata.context" : "$metadata#Bookings(ConnectionID,FlightPrice,CurrencyCode_code)"
			aRows = getConnections(iAirline, vSubtotalsAtBottom);
		} else { // airlines, but w/o concat
			// $apply=groupby((airline,airlineName))&$count=true&$skip=0&$top=120
			// ...
			// $apply=filter(status ne '')
			//     /groupby((airline,airlineName),aggregate(FlightPrice,CurrencyCode_code))
			//         /orderby(FlightPrice desc)&$count=true&$skip=0&$top=120
			aRows = getAirlines(vSubtotalsAtBottom);
		}

		selectCountSkipTop(aRows, mQueryOptions, oResponse);
	}

	/**
	 * Inherits missing properties from the given parent to all of its children. Adds the level
	 * information as instance annotation with distance from root and limited descendant count.
	 *
	 * @param {number} iDistanceFromRoot - The parents' distance from root
	 * @param {object[]} aRows - The parent "nodes" (group levels)
	 * @param {boolean|"off"} vSubtotalsAtBottom - Whether to duplicate group headers...
	 * @param {number} iLevels - The number of levels to return
	 * @param {function(number,number,boolean):object[]} fnExpand
	 *   Function to expand a single parent node identified by its index
	 * @returns {object[]} The group levels, possibly expanded
	 */
	function expand(iDistanceFromRoot, aRows, vSubtotalsAtBottom, iLevels, fnExpand) {
		/*
		 * Inherits missing properties from the given parent to all of its children. Adds the level
		 * information as instance annotation with distance from root and limited descendant count.
		 *
		 * @param {object} oParent - A parent "node" (group level)
		 * @param {object[]} aChildren - The child "nodes"
		 * @returns {object[]} The modified children
		 */
		function inherit(oParent, aChildren) {
			let iLimitedDescendantCount = 0;
			aChildren = aChildren.map((oChild) => ({...oParent, ...oChild}));
			aChildren.forEach((oChild) => {
				// BEWARE: not all children belong to the same level!
				oChild["@com.sap.vocabularies.Analytics.v1.LevelInformation"] ??= {
					DistanceFromRoot : String(iDistanceFromRoot + 1),
					DrillState : iDistanceFromRoot >= 4
						? "leaf"
						: "collapsed" // Note: overridden for parent nodes later on!
					// LimitedDescendantCount : "0"
				};
				const sLimitedDescendantCount
					= oChild["@com.sap.vocabularies.Analytics.v1.LevelInformation"]
						.LimitedDescendantCount ?? "0";
				iLimitedDescendantCount += parseInt(sLimitedDescendantCount) + 1;
			});
			oParent["@com.sap.vocabularies.Analytics.v1.LevelInformation"] = {
				DistanceFromRoot : String(iDistanceFromRoot), // Edm.Int64
				DrillState : "expanded", // "expanded|subtotal|leaf|collapsed"
				LimitedDescendantCount : String(iLimitedDescendantCount) // Edm.Int64
			};
			if (vSubtotalsAtBottom === true) {
				const oSubtotal = _Helper.clone(oParent); //TODO avoid deep clone?
				oSubtotal["@com.sap.vocabularies.Analytics.v1.LevelInformation"].DrillState
					= "subtotal";
				aChildren.push(oSubtotal);
			}

			return aChildren;
		}

		if (vSubtotalsAtBottom === "off") {
			aRows.forEach((oParent) => { //TODO MUST not be done on leaf level!
				delete oParent.CurrencyCode_code;
				delete oParent.FlightPrice;
			});
		}

		return iLevels <= 1
			? aRows
			: aRows.map((oParent, i) => {
				return [
					oParent,
					...inherit(oParent, fnExpand(i, vSubtotalsAtBottom, iLevels - 1))
				];
			}).flat();
	}

	/**
	 * Returns group levels for airlines, expanded to achieve the given number of levels.
	 *
	 * @param {boolean|"off"} vSubtotalsAtBottom - Whether to duplicate group headers...
	 * @param {number} [iLevels=1] - The number of levels to return
	 * @returns {object[]} Group levels for airlines, possibly expanded
	 */
	function getAirlines(vSubtotalsAtBottom, iLevels = 1) {
		const aRows = aAirlineIDs.map((sAirline, iAirline) => {
			return {
				airline : sAirline,
				airlineName : mAirline2Name[sAirline],
				CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
				FlightPrice : String(getFlightPrice(iAirline))
			};
		});

		return expand(/*iDistanceFromRoot*/0, aRows, vSubtotalsAtBottom, iLevels, getConnections);
	}

	/**
	 * Returns leaves for bookings, which cannot be expanded further.
	 *
	 * @param {number} [iAirline] - Index of airline
	 * @param {number} [iConnectionID] - Index of connection ID
	 * @param {number} [iFlightDate] - Index of flight date
	 * @param {number} [iStatus] - Index of status (0 for "B", 1 for "N")
	 * @param {boolean|"off"} [_vSubtotalsAtBottom] - Whether to duplicate group headers...
	 * @param {number} [_iLevels] - Ignored
	 * @returns {object[]} Leaves for bookings
	 */
	function getBookings(iAirline, iConnectionID, iFlightDate, iStatus, _vSubtotalsAtBottom,
			_iLevels) {
		const aRows = [];
		for (let iBookingDate = 0; iBookingDate < 10; iBookingDate++) {
			aRows.push({
				BookingDate : `2024-0${iAirline + 1}-1${iBookingDate}`,
				CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
				FlightPrice : String(
					getFlightPrice(iAirline, iConnectionID, iFlightDate, iStatus, iBookingDate))
			});
		}

		return aRows;
	}

	/**
	 * Returns group levels for connections, expanded to achieve the given number of levels.
	 *
	 * @param {number} [iAirline] - Index of airline
	 * @param {boolean|"off"} vSubtotalsAtBottom - Whether to duplicate group headers...
	 * @param {number} [iLevels=1] - The number of levels to return
	 * @returns {object[]} Group levels for connections, possibly expanded
	 */
	function getConnections(iAirline, vSubtotalsAtBottom, iLevels = 1) {
		const aRows = [];
		for (let iConnectionID = 0; iConnectionID < 10; iConnectionID++) {
			aRows.push({
				// IsDigitSequence: avoid leading zeroes!
				ConnectionID : `1${iAirline}0${iConnectionID}`,
				CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
				FlightPrice : String(getFlightPrice(iAirline, iConnectionID))
			});
		}

		return expand(/*iDistanceFromRoot*/1, aRows, vSubtotalsAtBottom, iLevels,
			getFlights.bind(null, iAirline));
	}

	/**
	 * Returns the value of the filter for the given property name from the $apply part of a query;
	 * returns <code>undefined</code> if no such filter is present.
	 *
	 * @param {string} sApply - The $apply part of the query
	 * @param {string} sName - The name of the property to get the filter value for
	 * @param {boolean} [bNoString] - Whether the value is not expected to be a quoted string
	 * @returns {string|undefined} The value of the filter for the given property name, if found
	 */
	function getFilterValue(sApply, sName, bNoString) {
		// filter(airline eq 'AA' and ConnectionID eq '1000' and FlightDate eq 2025-01-10)/...
		// filter(airline eq 'LH' and ConnectionID eq '403' and (status ne ''))
		const sFilter = sName + " eq ";
		const iFilter = sApply.indexOf(sFilter);
		if (iFilter < 0) {
			return undefined; // no such filter
		}

		const sSeparator = bNoString ? " " : "'";
		const iStart = sApply.indexOf(sSeparator, iFilter + sFilter.length - 1);
		// Note: space separator not present right before closing parenthesis
		const iEnd = sApply.replace(")", sSeparator).indexOf(sSeparator, iStart + 1);

		return sApply.substring(iStart + 1, iEnd);
	}

	/**
	 * Returns the total flight price for the group with the given "dimension indices".
	 *
	 * @param {number} [iAirline] - Index of airline
	 * @param {number} [iConnectionID] - Index of connection ID
	 * @param {number} [iFlightDate] - Index of flight date
	 * @param {number} [iStatus] - Index of status (0 for "B", 1 for "N")
	 * @param {number} [iBookingDate] - Index of booking date
	 * @returns {number} The total flight price
	 */
	function getFlightPrice(iAirline, iConnectionID, iFlightDate, iStatus, iBookingDate) {
		/*
		 * Returns the sum of [0, 1, ..., X[.
		 *
		 * @param {number} X - Some integer (exclusive upper bound)
		 * @returns {number}
		 */
		function sum(X) {
			return X * (X - 1) / 2;
		}

		if (iBookingDate !== undefined) {
			return 10000 * iAirline + 1000 * iConnectionID + 100 * iFlightDate + 10 * iStatus
				+ iBookingDate;
		}

		if (iStatus !== undefined) {
			return 10 * getFlightPrice(iAirline, iConnectionID, iFlightDate, iStatus, 0) + sum(10);
		}

		if (iFlightDate !== undefined) {
			return 2 * getFlightPrice(iAirline, iConnectionID, iFlightDate, 0) + 100;
		}

		if (iConnectionID !== undefined) {
			return 10 * getFlightPrice(iAirline, iConnectionID, 0) + 2000 * sum(10);
		}

		if (iAirline !== undefined) {
			return 10 * getFlightPrice(iAirline, 0) + 200000 * sum(10);
		}

		return iNoOfAirlines * getFlightPrice(0) + 20000000 * sum(iNoOfAirlines);
	}

	/**
	 * Returns group levels for flights, expanded to achieve the given number of levels.
	 *
	 * @param {number} [iAirline] - Index of airline
	 * @param {number} [iConnectionID] - Index of connection ID
	 * @param {boolean|"off"} vSubtotalsAtBottom - Whether to duplicate group headers...
	 * @param {number} [iLevels=1] - The number of levels to return
	 * @returns {object[]} Group levels for flights, possibly expanded
	 */
	function getFlights(iAirline, iConnectionID, vSubtotalsAtBottom, iLevels = 1) {
		const aRows = [];
		for (let iFlightDate = 0; iFlightDate < 10; iFlightDate++) {
			aRows.push({
				CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
				FlightDate : `2025-0${iAirline + 1}-1${iFlightDate}`,
				FlightPrice : String(getFlightPrice(iAirline, iConnectionID, iFlightDate))
			});
		}

		return expand(/*iDistanceFromRoot*/1, aRows, vSubtotalsAtBottom, iLevels,
			getStatus.bind(null, iAirline, iConnectionID));
	}

	/**
	 * Gets the query options as a map from the given URL query part.
	 *
	 * @param {string} sQuery - Query part of a URL
	 * @returns {Object<string,string>} Map of query options
	 */
	function getQueryOptions(sQuery) {
		const mQueryOptions = {};
		for (const sName_Value of sQuery.split("&")) {
			const [sName, ...aValues] = sName_Value.split("=");
			mQueryOptions[sName] = aValues.join("=");
		}

		return mQueryOptions;
	}

	/**
	 * Returns group levels for status, expanded to achieve the given number of levels.
	 *
	 * @param {number} [iAirline] - Index of airline
	 * @param {number} [iConnectionID] - Index of connection ID
	 * @param {number} [iFlightDate] - Index of flight date
	 * @param {boolean|"off"} vSubtotalsAtBottom - Whether to duplicate group headers...
	 * @param {number} [iLevels=1] - The number of levels to return
	 * @returns {object[]} Group levels for status, possibly expanded
	 */
	function getStatus(iAirline, iConnectionID, iFlightDate, vSubtotalsAtBottom, iLevels = 1) {
		const aRows = [{
			status : "B",
			CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
			FlightPrice : String(getFlightPrice(iAirline, iConnectionID, iFlightDate, 0))
		}, {
			status : "N",
			CurrencyCode_code : aAirlineCurrencyCodes[iAirline],
			FlightPrice : String(getFlightPrice(iAirline, iConnectionID, iFlightDate, 1))
		}];
		// Note: in theory, there can also be "X"...

		return expand(/*iDistanceFromRoot*/1, aRows, vSubtotalsAtBottom, iLevels,
			getBookings.bind(null, iAirline, iConnectionID, iFlightDate));
	}

	/**
	 * Fills the given response object from the given list of rows, taking $select, $count, $skip,
	 * and $top into account.
	 *
	 * @param {object[]} aRows - List of row objects to build the response from
	 * @param {Object<string>} mQueryOptions - Map of (system) query options (names to values)
	 * @param {object} oResponse - Response object to fill
	 */
	function selectCountSkipTop(aRows, mQueryOptions, oResponse) {
		const aSelect = mQueryOptions.$select?.split(",");

		function select(oNode) {
			if (!aSelect) {
				return oNode;
			}

			const oResult = {};
			for (const sSelect of aSelect) {
				oResult[sSelect] = sSelect === "DescendantCount" || sSelect === "DistanceFromRoot"
					? String(oNode[sSelect]) // Edm.Int64
					: oNode[sSelect];
			}
			return oResult;
		}

		const oMessage = {};
		if ("$count" in mQueryOptions) {
			oMessage["@odata.count"] = String(aRows.length);
		}
		const iSkip = "$skip" in mQueryOptions ? parseInt(mQueryOptions.$skip) : 0;
		const iTop = "$top" in mQueryOptions ? parseInt(mQueryOptions.$top) : Infinity;
		oMessage.value = aRows.slice(iSkip, iSkip + iTop).map(select);
		oResponse.message = JSON.stringify(oMessage);
	}

	/**
	 * Wrapper for an OData V4 model's constructor. For the "non-realOData" case, a mock server for
	 * the back-end requests is set up.
	 *
	 * @param {object} mParameters
	 *   The original OData V4 model's constructor parameters
	 * @returns {sap.ui.model.odata.v4.ODataModel}
	 *   The created OData V4 model
	 */
	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, {
			sFilterBase : "/sap/opu/odata4/sap/zsadl_anly_flight_v4/",
			mFixture : {
			},
			aRegExps : [{
				regExp : /^GET \/sap\/opu\/odata4\/sap\/zsadl_anly_flight_v4\/default\/iwbep\/common\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "common.xml"}
			}, {
				regExp : /^GET \/sap\/opu\/odata4\/sap\/zsadl_anly_flight_v4\/default\/iwbep\/common\/0001\/Currencies\?sap-language=..&\$select=CurrencyCode,DecimalPlaces,Text,ISOCode$/,
				response : {source : "Currencies.json"}
			}, {
				regExp : /^GET \/sap\/opu\/odata4\/sap\/zsadl_anly_flight_v4\/srvd\/sap\/zsadl_anly_flight\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET \/sap\/opu\/odata4\/sap\/zsadl_anly_flight_v4\/srvd\/sap\/zsadl_anly_flight\/0001\/Bookings\?(.*)$/,
				response : {buildResponse : buildGetCollectionResponse}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/MultiLevelExpand/data"
		});
	}
	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
