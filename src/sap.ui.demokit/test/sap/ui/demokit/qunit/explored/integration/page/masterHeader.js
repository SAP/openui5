sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/Ancestor',
	'test/page/Common'
],
function(Opa5, PropertyStrictEquals, Ancestor, Common) {
	"use strict";
	var sViewName = "master";

	Opa5.createPageObjects({
		onTheMasterHeaderPage: {
			baseClass: Common,
			actions: {
				iGroupByCategoryDescending: function () {
					this.iPressOnSettings();
					this.iPressOnGroupInTheViewSettingsDialog();
					this.iChooseDescendingInTheViewSettingsDialog();
					this.iPressOnCategoryInTheViewSettingsDialog();
					this.iPressOkInTheViewSettingsDialog();
				},

				iPressOnSettings: function () {
					return this.waitFor({
						viewName: sViewName,
						id: "viewSettingsButton",
						success: function (oButton) {
							oButton.$().trigger("tap");
						},
						errorMessage: "The settings buttons was not found"
					});
				},

				iPressOnGroupInTheViewSettingsDialog: function () {
					return this.waitFor({
						viewName: sViewName,
						id: "viewSettingsDialog",
						success: function (oViewSettingsDialog) {
							// workaround for view settings dialog bug getDomref is not working
							var sId = oViewSettingsDialog.getId();
							Opa5.getJQuery()("#" + sId + "-groupbutton").trigger("tap");
						},
						errorMessage: "The settings buttons was not found"
					});
				},

				iChooseDescendingInTheViewSettingsDialog: function () {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [
							new PropertyStrictEquals({
								name: "Title",
								value: "Descending"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs descending list item was not found"
					});
				},

				iPressOnCategoryInTheViewSettingsDialog: function () {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [
							new PropertyStrictEquals({
								name: "Title",
								value: "Category"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs category list item was not found"
					});
				},

				iPressOkInTheViewSettingsDialog : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "Text",
								value: "OK"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs ok button was not found"
					});
				}
			},
			assertions: {}
		}
	});

});
