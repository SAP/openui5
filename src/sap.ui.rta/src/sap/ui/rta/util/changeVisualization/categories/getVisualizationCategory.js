/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/categories/RenameVisualization",
	"sap/ui/rta/util/changeVisualization/categories/MoveVisualization",
	"sap/ui/rta/util/changeVisualization/categories/SplitVisualization"
], function(
	RenameVisualization,
	MoveVisualization,
	SplitVisualization
) {
	"use strict";

	var mCategories = {
		rename: RenameVisualization,
		move: MoveVisualization,
		split: SplitVisualization
	};

	return function(sCategoryName) {
		return mCategories[sCategoryName];
	};
});