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

	return function(mIndicatorInformation) {
		var sCategoryName = mIndicatorInformation.commandName;
		// to enable e.g. move changes in settings commands to show the 'Show Source' button
		if (sCategoryName === "settings") {
			sCategoryName = mIndicatorInformation.commandCategory;
		}
		return mCategories[sCategoryName];
	};
});