/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onThePage: {
			viewName: "sap.ui.v4demo.view.App",
			actions: {
				iEnterTextOnFilterField: function(sId, sValue) {
					return this.mdcTestLibrary.iEnterTextOnTheFilterField(sId, sValue);
				},
				iPressKeyOnFilterField: function(sLabel, sValue) {
					return this.mdcTestLibrary.iPressKeyOnFilterFieldWithLabel(sLabel, sValue);
				}
			},
			assertions: {
			}
		}
	});

});
