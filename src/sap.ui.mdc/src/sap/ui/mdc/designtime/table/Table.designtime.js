/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/mdc/Table"
], function (Engine, Table) {
	"use strict";

	// Returns the designTime metadata for the control. By default all the properties/aggregations which are not part of the allowed list array will be ignored from RTA/DTA
	function enhanceDesignTimeMetadata(aAllowed, sKey, oDesignTime) {
		var bAllowed = aAllowed.includes(sKey);
		var oObject = bAllowed && oDesignTime[sKey] || {};
		if (!Object.keys(oObject).length) {
			oObject[sKey] = {
				ignore: !bAllowed
			};
		}
		Object.assign(oDesignTime, oObject);
	}

	// Returns the designTime object for RTA/DTA
	function getDesignTime() {
		// initial structure of designTime object
		var oDesignTime = {
			name: "{name}",
			description: "{description}",
			actions: {
				settings: function () {
					//RTA expects the settings to be returned as function
					return {
						handler: function (oControl, mPropertyBag) {
							return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getP13nMode());
						}
					};
				}
			},
			properties: {},
			aggregations: {}
		};

		var oTableMetadata = Table.getMetadata(),
			// array containing all allowed control properties. Update the aAllowedProperties to enable a property for DTA
			aAllowedProperties = ["width", "height", "headerLevel",
			"header", "headerVisible", "showRowCount", "threshold",
			"noDataText", "enableExport", "busyIndicatorDelay","enableColumnResize",
			"showPasteButton", "multiSelectMode"],
			// array containing all allowed control aggregations. Update the aAllowedAggregations to enable an aggregation for DTA
			aAllowedAggregations = [],
			// array containing all control properties
			aAllProperties = Object.keys(oTableMetadata.getAllProperties()).concat(Object.keys(oTableMetadata.getAllPrivateProperties())),
			// array containing all control aggregations
			aAllAggregations = Object.keys(oTableMetadata.getAllAggregations()).concat(Object.keys(oTableMetadata.getAllPrivateAggregations()));

		// populate the oDesignTime.properties with the control properties (allowed/disallowed). By default all properties are ignored.
		aAllProperties.forEach(function(sPropertyName) {
			enhanceDesignTimeMetadata(aAllowedProperties, sPropertyName, oDesignTime.properties);
		});

		// populate the oDesignTime.aggregations with the control aggregations (allowed/disallowed). By default all aggregations are ignored.
		aAllAggregations.forEach(function(sAggregationName) {
			enhanceDesignTimeMetadata(aAllowedAggregations, sAggregationName, oDesignTime.aggregations);
		});

		return oDesignTime;
	}

	return getDesignTime();
});
