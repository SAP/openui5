/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

    function getDefaultDesginTime() {
        return {
            actions: {},
            aggregations: {},
            description: "{description}",
            name: "{name}",
            properties: {}
        };
    }

    // Returns the designTime metadata for the control. By default all the properties/aggregations which are not part of the allowed list array will be ignored from RTA/DTA
    function enhanceDesignTimeMetadata(aAllowed, sKey, oDesignTime) {
        var bAllowed = aAllowed.includes(sKey);
        var oObject = bAllowed && oDesignTime[sKey] || {};
        if (!Object.keys(oObject).length) {
            oObject[sKey] = {
                ignore: !bAllowed
            };
            Object.assign(oDesignTime, oObject);
        }
    }

    return {
        getDesignTime: function(ControlClass, aAllowedProperties, aAllowedAggregations, oDesignTime) {
            // Check if designTime is provided and has all the necessary attributes.
            oDesignTime = oDesignTime ? oDesignTime : getDefaultDesginTime();
            oDesignTime.actions = oDesignTime.actions ? oDesignTime.actions : {};
            oDesignTime.properties = oDesignTime.properties ? oDesignTime.properties : {};
            oDesignTime.aggregations = oDesignTime.aggregations ? oDesignTime.aggregations : {};

            var oControlMetadata = ControlClass.getMetadata(),
                // array containing all allowed control properties. Update the aAllowedProperties to enable a property for DTA
                aAllowedProperties = aAllowedProperties ? aAllowedProperties : [],
                // array containing all allowed control aggregations. Update the aAllowedAggregations to enable an aggregation for DTA
                aAllowedAggregations = aAllowedAggregations ? aAllowedAggregations : [],
                // array containing all control properties
                aAllProperties = Object.keys(oControlMetadata.getAllProperties()).concat(Object.keys(oControlMetadata.getAllPrivateProperties())),
                // array containing all control aggregations
                aAllAggregations = Object.keys(oControlMetadata.getAllAggregations()).concat(Object.keys(oControlMetadata.getAllPrivateAggregations()));

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
    };

});