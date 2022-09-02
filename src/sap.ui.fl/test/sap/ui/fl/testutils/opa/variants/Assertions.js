/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/base/Log',
	"sap/m/VariantManagement",
	"sap/ui/test/matchers/Ancestor"
], function(
	Opa5,
	Log,
	VariantManagement,
	Ancestor
) {
	"use strict";

	return {

		theVariantShouldBeDisplayed: function (sFlVMId, sVariantTitle) {
			return this.waitFor({
				id: sFlVMId,
				success: function (oVariantManagement) {
					Opa5.assert.equal(oVariantManagement.getTitle().getText(), sVariantTitle, "Expected " + sVariantTitle + " to be displayed.");
				},
				errorMessage: "VariantManagement could't be found"
			});
		},

		theMyViewShouldContain: function (sFlVMId, aVariantNames) {
			return this.waitFor({
				id: sFlVMId + "-vm-popover-popover",
				success: function () {
					return this.waitFor({
						controlType: "sap.m.SelectList",
						id: sFlVMId + "-vm-list",
						success: function() {
							return this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: function(oItem) {
									return oItem.getId().indexOf(sFlVMId + "-vm-list-") >= 0;
								},
								success: function(aItems) {
									var aIsVariantTitle = [];
									aItems.forEach(function(oItem) { aIsVariantTitle.push(oItem.getText());});
									Opa5.assert.deepEqual(aVariantNames, aIsVariantTitle, "expected [" + aVariantNames + "] views found");
								}
							});
						},
						errorMessage: "Did not find any variants"
					});
				},
				errorMessage: "'My Views' could not be found"
			});
		},

		theOpenDialog: function (sId) {
			return this.waitFor({
				id: sId,
				success: function (oDialog) {
					Opa5.assert.ok(oDialog);
				}
			});
		},

		theOpenManageViewsDialogTitleShouldContain: function (aVariantNames) {
			return	this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					var oDialog = aDialogs[0];
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: new Ancestor(oDialog),
						success: function(aTables) {
							var oTable = aTables[0];
							var aIsVariantTitle = [];
							oTable.getItems().forEach(function(oItem) {
								var oCell = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
								if (oCell.isA("sap.m.ObjectIdentifier")) {
									aIsVariantTitle.push(oCell.getTitle());
								} else {
									aIsVariantTitle.push(oCell.getValue());
								}
							});
							Opa5.assert.deepEqual(aVariantNames, aIsVariantTitle, "expected [" + aVariantNames + "] views found");
						},
						errorMessage: "No variant list found"
					});
				}
			});
		},

		theOpenManageViewsDialogFavoritesShouldContain: function (aVariantFavorites) {
			return	this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					var oDialog = aDialogs[0];
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: new Ancestor(oDialog),
						success: function(aTables) {
							var oTable = aTables[0];
							var aIsVariantFavorites = [];
							oTable.getItems().forEach(function(oItem) {
								var oCell = oItem.getCells()[VariantManagement.COLUMN_FAV_IDX];
								aIsVariantFavorites.push(oCell.getSrc() === "sap-icon://favorite");
							});
							Opa5.assert.deepEqual(aVariantFavorites, aIsVariantFavorites, "expected [" + aVariantFavorites + "] favorite states found");
						},
						errorMessage: "No variant list found"
					});
				}
			});
		},

		theOpenManageViewsDialogApplyAutomaticallyShouldContain: function (aVariantApplayAutos) {
			return	this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					var oDialog = aDialogs[0];
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: new Ancestor(oDialog),
						success: function(aTables) {
							var oTable = aTables[0];
							var aIsVariantApplyAutos = [];
							oTable.getItems().forEach(function(oItem) {
								var oCell = oItem.getCells()[4]; //EXEC
								aIsVariantApplyAutos.push(oCell.getSelected());
							});

							Opa5.assert.deepEqual(aVariantApplayAutos, aIsVariantApplyAutos, "expected [" + aVariantApplayAutos + "] apply automatically states found");
						},
						errorMessage: "No variant list items found"
					});
				}
			});
		},

		theOpenManageViewsDialogSharingShouldContain: function (aVariantSharing) {
			return	this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					var oDialog = aDialogs[0];
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: new Ancestor(oDialog),
						success: function(aTables) {
							var oTable = aTables[0];
							var aIsVariantSharing = [];
							oTable.getItems().forEach(function(oItem) {
								var oCell = oItem.getCells()[2]; //SHARING
								aIsVariantSharing.push(oCell.getText());
							});

							Opa5.assert.deepEqual(aVariantSharing, aIsVariantSharing, "expected [" + aVariantSharing + "] sharing information found");
						},
						errorMessage: "No variant list items found"
					});
				}
			});
		},

		theOpenManageViewsDialogDefaultShouldBe: function (sVariantName) {
			return	this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					var oDialog = aDialogs[0];
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: new Ancestor(oDialog),
						success: function(aTables) {
							var oTable = aTables[0];
							var oListItem = oTable.getItems().filter(function(oItem) {
								var oCell = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
								if (oCell.isA("sap.m.ObjectIdentifier")) {
									return oCell.getTitle() === sVariantName;
								}
								return oCell.getValue() === sVariantName;
							})[0];

							if (!oListItem) {
								Log.error("No variant with name " + sVariantName + " was found in 'Manage Views'");
							} else {
								var oDefault = oListItem.getCells()[3]; //DEF
								Opa5.assert.ok(oDefault.getSelected(), "the default for " + sVariantName + " was expected to be set");
							}
						},
						errorMessage: "No variant list items found"
					});
				}
			});
		}
	};
});