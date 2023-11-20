/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (
	JSONModel
) {
	"use strict";

	return new JSONModel({
		columns: {
			rules: {
				title: "Rules",
				visible: true,
				visibilityConfigurable: false
			},
			categories: {
				title: "Categories",
				visible: true,
				visibilityConfigurable: true
			},
			audience: {
				title: "Audience",
				visible: false,
				visibilityConfigurable: true
			},
			ruleId: {
				title: "RuleID",
				visible: false,
				visibilityConfigurable: true
			}
		}
	});
});
