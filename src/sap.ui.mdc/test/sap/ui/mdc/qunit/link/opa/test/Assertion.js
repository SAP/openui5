/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/core/library",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Util",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"./waitForPersonalizationDialog"
], function(Opa5, coreLibrary, TestUtil, PropertyStrictEquals, Ancestor, Descendant, waitForPersonalizationDialog) {
	"use strict";
	var Assertion = Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Assertion", {
		thePersonalizationDialogOpens: function() {
			return waitForPersonalizationDialog.call(this, {
				success: function(oSelectionDialog) {
					Opa5.assert.ok(oSelectionDialog, 'Personalization Dialog should be open');
				}
			});
		},
		thePersonalizationDialogShouldBeClosed: function() {
			var aDomDialogs;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject('sap.m.Dialog');
					aDomDialogs = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return !aDomDialogs.length;
				},
				success: function() {
					Opa5.assert.ok(!aDomDialogs.length, "The personalization dialog is closed");
				},
				timeout: 5
			});
		},
		iShouldSeeVisibleColumnsInOrder: function(sColumnType, aOrderedColumnNames) {
			var aDomColumns;
			return this.waitFor({
				controlType: sColumnType,
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject(sColumnType);
					aDomColumns = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return aDomColumns.length === aOrderedColumnNames.length;
				},
				success: function() {
					Opa5.assert.equal(aOrderedColumnNames.length, aDomColumns.length);
					aDomColumns.forEach(function(oColumn, iIndex) {
						var sLabel = oColumn.getMetadata().getName() === "sap.m.Column" ? oColumn.getHeader().getText() : oColumn.getLabel().getText();
						Opa5.assert.equal(sLabel, aOrderedColumnNames[iIndex], "Column '" + aOrderedColumnNames[iIndex] + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeLinkItemWithSelection: function(sItemText, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "sap.m.Table found on Dialog");
					var oTable = aTables[0];
					this.waitFor({
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oTable, false),
							new PropertyStrictEquals({
								name: "text",
								value: sItemText
							})
						],
						success: function(aLinks) {
							Opa5.assert.equal(aLinks.length, 1, "sap.m.Link with text '" + sItemText + "' found on Dialog.");
							var oLink = aLinks[0];
							this.waitFor({
								controlType: "sap.m.ColumnListItem",
								matchers: new Descendant(oLink, false),
								success: function(aColumnListItems) {
									Opa5.assert.equal(aColumnListItems.length, 1, "sap.m.ColumnListItem with sap.m.Link found in Table");
									var oColumnListItem = aColumnListItems[0];
									this.waitFor({
										controlType: "sap.m.CheckBox",
										matchers: [
											new Ancestor(oColumnListItem, false),
											new PropertyStrictEquals({
												name: "selected",
												value: bSelected
											})
										],
										success: function(aCheckBoxes) {
											Opa5.assert.equal(aCheckBoxes.length, 1, (bSelected ? "selected" : "unselected") + " sap.m.CheckBox found in sap.m.ColumnListItem");
										}
									});
								}
							});
						}
					});
				}
			});
		},
		iShouldSeeLinkItemAsEnabled: function(sItemText, bEnabled) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "sap.m.Table found on Dialog");
					var oTable = aTables[0];
					this.waitFor({
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oTable, false),
							new PropertyStrictEquals({
								name: "text",
								value: sItemText
							}),
							new PropertyStrictEquals({
								name: "enabled",
								value: bEnabled
							})
						],
						success: function(aLinks) {
							Opa5.assert.equal(aLinks.length, 1, (bEnabled ? "enable" : "disabled") + " sap.m.Link found on Dialog");
						}
					});
				}
			});
		},
		iShouldSeeLinkItemOnPosition: function(sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "sap.m.Table found on Dialog");
					var oTable = aTables[0];
					this.waitFor({
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oTable, false),
							new PropertyStrictEquals({
								name: "text",
								value: sItemText
							})
						],
						success: function(aLinks) {
							Opa5.assert.equal(aLinks.length, 1, "sap.m.Link with text '" + sItemText + "' found on Dialog.");
							var oLink = aLinks[0];
							this.waitFor({
								controlType: "sap.m.ColumnListItem",
								matchers: new Descendant(oLink, false),
								success: function(aColumnListItems) {
									Opa5.assert.equal(aColumnListItems.length, 1, "sap.m.ColumnListItem with sap.m.Link found in Table");
									var oColumnListItem = aColumnListItems[0];
									Opa5.assert.equal(oTable.getItems().indexOf(oColumnListItem), iIndex, sItemText + " is on position " + iIndex);
								}
							});
						}
					});
				}
			});
		},
		iShouldSeeRestoreButtonWhichIsEnabled: function(bEnabled) {
			return waitForPersonalizationDialog.call(this, {
				success: function(oSelectionDialog) {
					return this.waitFor({
						searchOpenDialogs: true,
						visible: bEnabled,
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "text",
								value: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.RESET")
							}),
							new Ancestor(oSelectionDialog, false)
						],
						success: function(aButtons) {
							Opa5.assert.equal(aButtons.length, 1);
							Opa5.assert.ok(aButtons[0].getEnabled() === bEnabled, "The 'Restore' is " + (bEnabled ? "enabled" : "disabled"));
						},
						errorMessage: "The 'Restore' is not " + (bEnabled ? "enabled" : "disabled")
					});
				}
			});
		},
		iShouldSeeColumnWithName: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aColumn = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getHeader().getText() === sColumnName;
					});
					Opa5.assert.equal(aColumn.length, 1, "Column '" + sColumnName + "' is visible");
				}
			});
		},
		theCellWithTextIsOfType: function(sText, sType) {
			return this.waitFor({
				controlType: sType,
				check: function(aControls) {
					return !!aControls.length;
				},
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				success: function(aControls) {
					Opa5.assert.equal(aControls.length, 1, "One control found");
				}
			});
		},
		iShouldSeeOnNavigationPopoverPersonalizationLinkText: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.POPOVER_DEFINE_LINKS")
				}),
				success: function(aButton) {
					Opa5.assert.equal(aButton.length, 1, "The 'More Links' button found");
				}
			});
		},
		iShouldSeeStartRtaButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://wrench"
				}),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getIcon(), "sap-icon://wrench", "The Start RTA button found");
				}
			});
		},
		theRtaModeShouldBeClosed: function() {
			var aDomOverlay;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					if (!frameJQuery) {
						return false;
					}
					var fnOverlay = frameJQuery.sap.getObject('sap.ui.dt.ElementOverlay');
					aDomOverlay = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnOverlay);
					return !aDomOverlay.length;
				},
				success: function() {
					Opa5.assert.ok(!aDomOverlay.length, "RTA mode is closed");
				}
			});
		},
		iShouldSeeTheRtaOverlayForTheViewId: function(sId) {
			var oApp;
			this.waitFor({
				id: sId,
				errorMessage: "The app is still busy..",
				success: function(oAppControl) {
					oApp = oAppControl;
				}
			});
			return this.waitFor({
				controlType: "sap.ui.dt.ElementOverlay",
				matchers: function(oOverlay) {
					return oOverlay.getElementInstance() === oApp;
				},
				success: function(oOverlay) {
					Opa5.assert.ok(oOverlay[0].getVisible(), "The Overlay is shown.");
				},
				errorMessage: "Did not find the Element Overlay for the App Control"
			});
		},
		theApplicationIsLoaded: function(sId) {
			return this.waitFor({
				id: sId,
				visible: false,
				success: function(oDomApp) {
					Opa5.assert.ok(oDomApp, "One app is loaded");
					Opa5.assert.equal(oDomApp.getId(), sId, "App '" + sId + "' is loaded");
				}
			});
		},
		theApplicationURLContains: function(sText) {
			return this.waitFor({
				check: function() {
					var sUrl = Opa5.getWindow().location.href;
					return sUrl.includes(sText);
				},
				success: function() {
					Opa5.assert.ok(true, "The URL of the Application is correct.");
				},
				timeout: 15
			});
		},
		theApplicationURLDoesNotContain: function(sText) {
			return this.waitFor({
				check: function() {
					var sUrl = Opa5.getWindow().location.href;
					return !sUrl.includes(sText);
				},
				success: function() {
					Opa5.assert.ok(true, "The URL of the Application is correct.");
				}
			});
		},
		iShouldSeeAConfirmationDialog: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function() {
					Opa5.assert.ok(true, "The confirmation dialog is open.");
				}
			});
		}
	});
	return Assertion;
});