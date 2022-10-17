/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/valueHelp/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/valueHelp/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/field/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/field/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Assertions"
], function(Opa5,
	ValueHelpActions,
	ValueHelpAssertions,
	FieldActions,
	FieldAssertions,
	FilterFieldActions,
	FilterFieldAssertions) {
	"use strict";

	var _createMethods = function (aSources) {
		return aSources.reduce(function (oAcc, oSource) {
			Object.keys(oSource).forEach(function (sKey) {

				if (oAcc[sKey]) {
					throw "Property '" + sKey + "' already exists!";
				}

				oAcc[sKey] = function () {
					return oSource[sKey].apply(this, arguments);
				};
			});
			return oAcc;
		}, {});
	};

	Opa5.createPageObjects({
		onTheOPAPage: {
			viewName: "sap.ui.v4demo.view.App",
			actions: _createMethods([ValueHelpActions, FieldActions, FilterFieldActions]),
			assertions: _createMethods([ValueHelpAssertions, FieldAssertions, FilterFieldAssertions])
		}
	});
});
