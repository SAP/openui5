/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/CombineButtons",
	"sap/m/changeHandler/SplitMenuButton",
	"sap/f/changeHandler/MoveDynamicPageTitleActions"
], function (CombineButtonsHandler, SplitMenuButtonHandler, MoveDynamicPageTitleActions) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"combineButtons": {
			"changeHandler": CombineButtonsHandler
		},
		"splitMenuButton": {
			"changeHandler": SplitMenuButtonHandler
		},
		"moveActions": {
			"changeHandler": MoveDynamicPageTitleActions
		},
		"moveControls": "default"
	};
});
