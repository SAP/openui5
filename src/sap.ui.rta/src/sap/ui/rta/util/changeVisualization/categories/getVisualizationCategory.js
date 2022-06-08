/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/categories/RenameVisualization",
	"sap/ui/rta/util/changeVisualization/categories/MoveVisualization",
	"sap/ui/rta/util/changeVisualization/categories/CombineVisualization",
	"sap/ui/rta/util/changeVisualization/categories/SplitVisualization"
], function(
	RenameVisualization,
	MoveVisualization,
	CombineVisualization,
	SplitVisualization
) {
	"use strict";

	var mCategories = {
		rename: RenameVisualization,
		move: MoveVisualization,
		combine: CombineVisualization,
		split: SplitVisualization
	};

	return function(sCategoryName) {
		return mCategories[sCategoryName];
	};
});