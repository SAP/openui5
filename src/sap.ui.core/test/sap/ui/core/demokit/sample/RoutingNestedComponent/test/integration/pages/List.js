sap.ui.define([
	"sap/ui/test/Opa5",
	"./Base",
	"sap/ui/test/actions/Press"
], function (Opa5, Base, Press) {
	"use strict";

	var sViewName = "List";

	Opa5.createPageObjects({
		onTheListPage: {
			baseClass: Base,
			actions: {

				iPressListItem: function (sComponentPrefix, sColumnName, sListItemText) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewName:  sViewName,
						viewNamespace: "sap.ui.core.sample.RoutingNestedComponent.reuse." + sComponentPrefix + ".view.",
						matchers: function(oListItem){
							var oObject = oListItem.getBindingContext().getObject();
							return oObject[sColumnName] === sListItemText;
						},
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "The list item with text '" + sListItemText + "' was pressed.");
						}
					});
				}
			}

		}

	});

});