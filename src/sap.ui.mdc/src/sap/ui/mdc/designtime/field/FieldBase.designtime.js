/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/FieldBase", "../Util"
], (FieldBase, Util) => {
	"use strict";

	const oDesignTime = {};

	const aAllowedAggregations = [],
		aAllowedProperties = [];

	return Util.getDesignTime(FieldBase, aAllowedProperties, aAllowedAggregations, oDesignTime);

});