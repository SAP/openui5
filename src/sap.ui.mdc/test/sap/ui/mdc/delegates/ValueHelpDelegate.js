/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"./util/PayloadSearchKeys"
], function(
	ValueHelpDelegate,
	PayloadSearchKeys
) {
	"use strict";


	const TestValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	TestValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {
		return PayloadSearchKeys.isEnabled(oValueHelp, oContent);
	};

	TestValueHelpDelegate.getFilters = function(oValueHelp, oContent) {
		return PayloadSearchKeys.combineFilters([
			...ValueHelpDelegate.getFilters(oValueHelp, oContent),
			...PayloadSearchKeys.getFilters(oValueHelp, oContent)
		], true);
	};

	return TestValueHelpDelegate;
});