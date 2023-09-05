/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/p13n/Engine', './ItemBaseFlex'
], function(Engine, ItemBaseFlex) {
	"use strict";

	var ColumnFlex = Object.assign({}, ItemBaseFlex);

	ColumnFlex.findItem = function(oModifier, aColumns, sName) {
		return aColumns.reduce(function(oPreviousPromise, oColumn) {
			return oPreviousPromise
				.then(function(oFoundColumn) {
					if (!oFoundColumn) {
						return Promise.all([
								oModifier.getProperty(oColumn, "propertyKey"),
								oModifier.getProperty(oColumn, "dataProperty")
							])
							.then(function(aProperties) {
								if (aProperties[0] === sName || aProperties[1] === sName) {
									return oColumn;
								}
							});
					}
					return oFoundColumn;
				});
		}, Promise.resolve());
	};

	ColumnFlex.addColumn = ColumnFlex.createAddChangeHandler();
	ColumnFlex.removeColumn = ColumnFlex.createRemoveChangeHandler();
	ColumnFlex.moveColumn = ColumnFlex.createMoveChangeHandler();

	return ColumnFlex;

});
