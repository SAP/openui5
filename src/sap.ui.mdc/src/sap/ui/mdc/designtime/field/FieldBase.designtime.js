/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/FieldBase",
	"../Util"
], function (FieldBase, Util) {
	"use strict";

	var oDesignTime = {};

	var aAllowedAggregations = [],
		aAllowedProperties = [];

	return Util.getDesignTime(FieldBase, aAllowedProperties, aAllowedAggregations, oDesignTime);

});
