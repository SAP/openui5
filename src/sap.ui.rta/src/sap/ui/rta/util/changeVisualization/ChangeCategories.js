/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/common/ChangeCategories"
], function(
	FlChangeCategories
) {
	"use strict";

	var ChangeCategories = {};

	ChangeCategories.ALL = "all";

	// Assignment of commands to change categories
	var COMMANDS = {};
	COMMANDS[FlChangeCategories.ADD] = [
		"createContainer",
		"addDelegateProperty",
		"reveal",
		"addIFrame"
	];
	COMMANDS[FlChangeCategories.MOVE] = ["move"];
	COMMANDS[FlChangeCategories.RENAME] = ["rename"];
	COMMANDS[FlChangeCategories.COMBINESPLIT] = ["combine", "split"];
	COMMANDS[FlChangeCategories.REMOVE] = ["remove"];
	COMMANDS[FlChangeCategories.OTHER] = [];

	var CATEGORY_ICONS = {};
	CATEGORY_ICONS[ChangeCategories.ALL] = "sap-icon://show";
	CATEGORY_ICONS[FlChangeCategories.ADD] = "sap-icon://add";
	CATEGORY_ICONS[FlChangeCategories.MOVE] = "sap-icon://move";
	CATEGORY_ICONS[FlChangeCategories.RENAME] = "sap-icon://edit";
	CATEGORY_ICONS[FlChangeCategories.COMBINESPLIT] = "sap-icon://combine";
	CATEGORY_ICONS[FlChangeCategories.REMOVE] = "sap-icon://less";
	CATEGORY_ICONS[FlChangeCategories.OTHER] = "sap-icon://key-user-settings";

	ChangeCategories.getCategories = function() {
		return COMMANDS;
	};

	ChangeCategories.getIconForCategory = function(sCategory) {
		return CATEGORY_ICONS[sCategory];
	};

	return ChangeCategories;
});