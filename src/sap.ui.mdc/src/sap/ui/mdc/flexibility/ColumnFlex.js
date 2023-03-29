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
						return Promise.resolve()
							.then(oModifier.getProperty.bind(oModifier, oColumn, "dataProperty"))
							.then(function(sDataProperty) {
								if (sDataProperty === sName) {
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
