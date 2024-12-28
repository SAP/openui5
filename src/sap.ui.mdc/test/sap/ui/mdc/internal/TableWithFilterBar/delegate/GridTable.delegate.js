/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/FilterOperator",
	"delegates/util/PayloadSearchKeys"
], function(
	TableDelegate,
	Element,
	Library,
	FilterUtil,
	UI5Date,
	FilterOperator,
	PayloadSearchKeys
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
				if (oPropertyInfo.dataType === "Edm.Guid") {
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

		var oFilterBar = Element.getElementById(oTable.getFilter());

		if (!oFilterBar && !PayloadSearchKeys.inUse(oTable)) {
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

		oBindingInfo.parameters.$count = true;

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
					var oDate = UI5Date.getInstance(sValue); // Date object understands ISO strings
					if (!bStart) {
						oDate.setUTCMilliseconds(999);
					}
					var sNewValue = oDate.toISOString();
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
					if (oProperty && oProperty.typeConfig && oProperty.typeConfig.typeInstance.getMetadata().getName() === "sap.ui.model.odata.type.DateTimeOffset") {
						fnAdjustDateTimeFilter(oFilter);
					}
				}
			};

			if (Array.isArray(oBindingInfo.filters)) {
				for (let i = 0; i < oBindingInfo.filters.length; i++) {
					fnAdjustFilter(oBindingInfo.filters[i]);
				}
			} else {
				fnAdjustFilter(oBindingInfo.filters);
			}
		}

	};

	ODataTableDelegate.formatGroupHeader = function(oTable, oContext, sProperty) {
		const oPropertyHelper = oTable.getPropertyHelper();
		const oProperty = oPropertyHelper.getProperty(sProperty);
		const oTextProperty = oPropertyHelper.getProperty(oProperty.text);
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		const sResourceKey = "table.ROW_GROUP_TITLE";
		let vValue = oContext.getProperty(oProperty.path);
		let oType = oProperty.typeConfig.typeInstance;

		if (oType) {
			vValue = oType.formatValue(vValue, "string");
		}

		if (oTextProperty) {
			const oComplexProperty = oTable.getPropertyHelper().getProperty(sProperty + "_ComplexWithText"); // use complex property to get information about text
			const sTemplate = oComplexProperty.exportSettings && oComplexProperty.exportSettings.template;
			let vTextValue = oContext.getProperty(oTextProperty.path);
			oType = oTextProperty.typeConfig.typeInstance;
			if (oType) {
				vTextValue = oType.formatValue(vTextValue, "string");
			}
			if (sTemplate) {
				vValue = sTemplate.replace(/\{0\}/g, vValue).replace(/\{1\}/g, vTextValue);
			}
		}

		const aValues = [oProperty.label, vValue];

		return oResourceBundle.getText(sResourceKey, aValues);
	};

	return ODataTableDelegate;
});
