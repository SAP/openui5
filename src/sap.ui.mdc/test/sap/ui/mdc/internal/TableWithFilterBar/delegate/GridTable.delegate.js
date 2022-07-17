/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/core/Core",
	'sap/ui/model/FilterOperator'
], function(
	TableDelegate,
	FilterUtil,
	Core,
	FilterOperator
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var ODataTableDelegate = Object.assign({}, TableDelegate);

	ODataTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = TableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			aProperties.forEach(function(oPropertyInfo){
				if (oPropertyInfo.typeConfig.className === "Edm.Guid") {
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 18}}; // auto width seems not to work for GUID
				}
			});

			return aProperties;
		});
	};

	/**
	 * Updates the binding info with the relevant path and model from the metadata.
	 *
	 * @param {Object} oTable The MDC table instance
	 * @param {Object} oBindingInfo The bindingInfo of the table
	 */
	ODataTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);

		var oFilterBar = Core.byId(oTable.getFilter());

		if (oFilterBar) {
			this._updateSearch(oBindingInfo, oFilterBar);
		}

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		var oDataStateIndicator = oTable.getDataStateIndicator();
		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			if (oBindingInfo.filters) { // adjust already created filters as it may come from FilterBar or from Table-Filtering
				this._updateDateTimeFilter(oBindingInfo, oTable.getPropertyHelper().getProperties());
			}
		}

		var oPayload = oTable.getPayload();
		if (oPayload.$select) {
			oBindingInfo.parameters.$select = oPayload.$select;
		}

	};

	ODataTableDelegate._updateSearch = function(oBindingInfo, oFilterBar) {

		// get the basic search
		var sSearchText = oFilterBar.getSearch instanceof Function ? oFilterBar.getSearch() :  "";
		if (sSearchText && sSearchText.indexOf(" ") === -1) { // to allow search for "(".....
			sSearchText = '"' + sSearchText + '"'; // TODO: escape " in string
		} // if it contains spaces allow opeartors like OR...
		oBindingInfo.parameters.$search = sSearchText || undefined;

	};

	ODataTableDelegate._updateDateTimeFilter = function(oBindingInfo, aPropertiesMetadata) {

		if (oBindingInfo.filters) { // adjust already created filters as it may come from FilterBar or from Table-Filtering

			var fnAdjustDate = function(sValue, bStart) {
				if (sValue && typeof sValue === "string" && sValue.indexOf("T") > 0) {
					var aParts = sValue.split("T");
					var sDate = aParts[0];
					var sTime = aParts[1];
					aParts = sDate.split("-");
					var iYear = parseInt(aParts[0]);
					var iMonth = parseInt(aParts[1]) - 1;
					var iDay = parseInt(aParts[2]);
					var iIndex = sTime.indexOf("+") !== -1 ? sTime.indexOf("+") : sTime.indexOf("-");
					var sOffset = sTime.slice(iIndex);
					var sSign = sOffset[0];
					var iOffsetHours = parseInt(sOffset.substr(1, 2));
					var iOffsetMinutes = parseInt(sOffset.substr(4));
					sTime = sTime.substr(0, iIndex);
					aParts = sTime.split(":");
					var iHours = parseInt(aParts[0]);
					var iMinutes = parseInt(aParts[1]);
					aParts = aParts[2].split(".");
					var iSeconds = parseInt(aParts[0]);
					var iMilliseconds = parseInt(aParts[1].slice(0, 3)); // take only 3 digits
					if (sSign === "-") {
						iMinutes = iMinutes + iOffsetMinutes;
						iHours = iHours + iOffsetHours;
					} else {
						iMinutes = iMinutes - iOffsetMinutes;
						iHours = iHours - iOffsetHours;
					}
					var oDate = new Date(Date.UTC(iYear, iMonth, iDay, iHours, iMinutes, iSeconds, iMilliseconds));
					var sYear = oDate.getUTCFullYear().toString();
					iMonth = oDate.getUTCMonth() + 1;
					var sMonth = iMonth < 10 ? "0" + iMonth : iMonth.toString();
					iDay = oDate.getUTCDate();
					var sDay = iDay < 10 ? "0" + iDay : iDay.toString();
					iHours = oDate.getUTCHours();
					var sHours = iHours < 10 ? "0" + iHours : iHours.toString();
					iMinutes = oDate.getUTCMinutes();
					var sMinutes = iMinutes < 10 ? "0" + iMinutes : iMinutes.toString();
					iSeconds = oDate.getUTCSeconds();
					iMilliseconds = bStart ? 0 : 999;
					var fSeconds = iSeconds + iMilliseconds / 1000;
					var sSeconds = iSeconds < 10 ? "0" + fSeconds.toPrecision(4) : fSeconds.toPrecision(5);
					var sNewValue =  sYear + "-" + sMonth + "-" + sDay + "T" + sHours + ":" + sMinutes + ":" + sSeconds + "Z";
					return sNewValue;
				} else {
					return sValue;
				}
			};

			var fnAdjustDateTimeFilter = function(oFilter) {
				if (oFilter.sOperator === FilterOperator.EQ && oFilter.oValue1 && typeof oFilter.oValue1 === "string" && oFilter.oValue1.indexOf("T") > 0) {
					// as milliseconds stored at service - convert into a range
					var vValue = oFilter.oValue1;
					oFilter.oValue1 = fnAdjustDate(vValue, true);
					oFilter.oValue2 = fnAdjustDate(vValue, false);
					oFilter.sOperator = FilterOperator.BT;
				} else if (oFilter.sOperator === FilterOperator.BT || oFilter.sOperator === FilterOperator.NB) {
					oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, true);
					oFilter.oValue2 = fnAdjustDate(oFilter.oValue2, false);
				} else if (oFilter.sOperator === FilterOperator.LT || oFilter.sOperator === FilterOperator.GE) {
					oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, true);
				} else if (oFilter.sOperator === FilterOperator.GT || oFilter.sOperator === FilterOperator.LE) {
					oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, false);
				}
			};

			var fnAdjustFilter = function(oFilter) {
				if (oFilter.aFilters) {
					for (var j = 0; j < oFilter.aFilters.length; j++) {
						fnAdjustFilter(oFilter.aFilters[j]);
					}
				} else {
					var oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, oFilter.sPath);
					if (oProperty && oProperty.typeConfig.typeInstance.getMetadata().getName() === "sap.ui.model.odata.type.DateTimeOffset") {
						fnAdjustDateTimeFilter(oFilter);
					}
				}
			};

			fnAdjustFilter(oBindingInfo.filters);
		}

	};

	return ODataTableDelegate;
});
