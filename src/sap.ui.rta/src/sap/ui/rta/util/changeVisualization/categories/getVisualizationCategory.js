/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/categories/RenameVisualization"
], function(
	RenameVisualization
) {
	"use strict";

	var mCategories = {
		rename: RenameVisualization
	};

	return function(sCategoryName) {
		return mCategories[sCategoryName];
	};
});