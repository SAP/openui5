/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"./waitForP13nButtonWithMatchers",
	"./waitForP13nDialog",
	"./waitForSelectWithSelectedTextOnPanel",
	"./Util",
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(
	Opa5,
	Matcher,
	Properties,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Press,
	EnterText,
	waitForP13nButtonWithMatchers,
	waitForP13nDialog,
	waitForSelectWithSelectedTextOnPanel,
	Util,
	Log,
	UriParameters,
	oCore,
	Device
) {
	"use strict";

	var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

	var iOpenThePersonalizationDialog = function(oControl, oSettings) {
		var sControlId = typeof oControl === "string" ? oControl : oControl.getId();
		var aDialogMatchers = [];
		var aButtonMatchers = [];
		return this.waitFor({
			id: sControlId,
			success: function(oControlInstance) {
				Opa5.assert.ok(oControlInstance);

				aButtonMatchers.push(new Ancestor(oControlInstance));

				if (oControlInstance.isA("sap.ui.comp.smartchart.SmartChart")) {
					aDialogMatchers.push(function(oP13nDialog) {

							var oInnerChart = oControlInstance.getItems().find(function(oItem){
								return oItem.isA("sap.chart.Chart");
							});

							if (!oInnerChart){
								return false;
							}

							return oP13nDialog.getParent().getChart() === oInnerChart.getId();
					});
				} else {
					aDialogMatchers.push(new Ancestor(oControlInstance, false));
				}

				// Add matcher for p13n button icon
				aButtonMatchers.push(new Properties({
					icon: Util.icons.settings
				}));
				aDialogMatchers.push(new Properties({
					title: oMDCBundle.getText("p13nDialog.VIEW_SETTINGS")
				}));

				waitForP13nButtonWithMatchers.call(this, {
					actions: new Press(),
					matchers: aButtonMatchers,
					success: function() {
						waitForP13nDialog.call(this, {
							matchers: aDialogMatchers,
							success:  function(oP13nDialog) {
								if (oSettings && typeof oSettings.success === "function") {
									oSettings.success.call(this, oP13nDialog);
								}
							}
						});
					},
					errorMessage: "Control '" + sControlId + "' has no P13n button"
				});
			},
			errorMessage: "Control '" + sControlId + "' not found."
		});
	};

	var iPressAButtonOnTheDialog = function(oDialog, sButtonText, oSettings) {
		return this.waitFor({
			searchOpenDialogs: true,
			controlType: "sap.m.Button",
			matchers: [
				new PropertyStrictEquals({
					name: "text",
					value: sButtonText
				}),
				new Ancestor(oDialog, false)
			],
			actions: new Press(),
			success: function() {
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this);
				}
			},
			errorMessage: "Could not find the '" + sButtonText + "' button"
		});
	};

	var waitForTheWarningDialog = function(oSettings) {
		return this.waitFor({
			controlType: "sap.m.Dialog",
			matchers: new PropertyStrictEquals({
				name: "title",
				value: Util.texts.resetwarning
			}),
			success: function(aDialogs) {
				Opa5.assert.equal(aDialogs.length, 1, "warning dialog found");
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, aDialogs[0]);
				}
			}
		});
	};

	var iPressTheOKButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.ok, oSettings);
	};
	var iPressTheCancelButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.cancel, oSettings);
	};

	var iPressTheResetButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.reset, oSettings);
	};

	var waitForNavigationControl = function (oP13nDialog, oSettings) {
		oSettings = oSettings || {};

		//Mobile
		if (Device.system.phone) {
			return this.waitFor({
				controlType: "sap.m.List",
				success: function(aLists) {
					Opa5.assert.equal(aLists.length, 1 , "One list found");
					if (oSettings && typeof oSettings.success === "function") {
						oSettings.success.call(this, aLists[0]);
					}
				}
			});
		}

		return this.waitFor({
			controlType: "sap.m.IconTabBar",
			matchers: {
				ancestor: oP13nDialog
			},
			success: function(aTabBar) {
				Opa5.assert.ok(aTabBar.length === 1, "IconTabBar found");
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, aTabBar[0]);
				}
			},
			errorMessage: "sap.m.IconTabBar not found"
		});
	};

	var iNavigateToPanel = function(oP13nPanel, sPanelName, oSettings) {
		return waitForNavigationControl.call(this, oP13nPanel, {
			success: function(oNavigationControl) {

				var sNavigationControlType, sInnerControlType, sInnerControlPropertyName;

				//Mobile
				if (oNavigationControl.isA("sap.m.List")) {
					sNavigationControlType = "sap.m.List";
					sInnerControlType = "sap.m.StandardListItem";
					sInnerControlPropertyName = "title";
				}

				//New Layout
				if (oNavigationControl.isA("sap.m.IconTabBar")) {
					sNavigationControlType = "sap.m.IconTabBar";
					sInnerControlType = "sap.m.IconTabFilter";
					sInnerControlPropertyName = "text";
				}

				//Old Layout
				if (oNavigationControl.isA("sap.m.SegmentedButton")) {
					sNavigationControlType = "sap.m.SegmentedButton";
					sInnerControlType = "sap.m.Button";
					sInnerControlPropertyName = "text";
				}

				return this.waitFor({
					controlType: sNavigationControlType,
					success: function(aNavigationControls) {
						var oNavigationControl = aNavigationControls[0];
						this.waitFor({
							controlType: sInnerControlType,
							matchers: [
								new Ancestor(oNavigationControl),
								new PropertyStrictEquals({
									name: sInnerControlPropertyName,
									value: sPanelName
								})
							],
							actions: new Press(),
							success: function () {
								if (oSettings && typeof oSettings.success === "function") {
									oSettings.success.call(this);
								}
							}
						});
					}
				});
			}
		});
	};

	var iPersonalize = function(oControl, sPanelName, fnOpenThePersonalizationDialog, oSettings) {
		return fnOpenThePersonalizationDialog.call(this, oControl, {
			success:  function(oP13nDialog) {
				iNavigateToPanel.call(this, oP13nDialog, sPanelName, {
					success: function() {
						if (oSettings && typeof oSettings.success === "function") {
							oSettings.success.call(this, oP13nDialog);
						}
					}
				});
			}
		});
	};

	var iChangeComboBoxSelection = function(oComboBox, sNew, oSettings) {
		new Press().executeOn(oComboBox);
		this.waitFor({
			controlType: "sap.m.Popover",
			matchers: new Ancestor(oComboBox),
			success: function(aPopovers) {
				Opa5.assert.ok(aPopovers.length === 1, "ComboBox popover found");
				var oPopover = aPopovers[0];
				this.waitFor({
					controlType: "sap.m.StandardListItem",
					matchers: [
						new Ancestor(oPopover, false),
						new PropertyStrictEquals({
							name: "title",
							value: sNew
						})
					],
					actions: new Press(),
					success: function(oSelect) {
						if (oSettings && typeof oSettings.success === "function") {
							oSettings.success.call(this, oSelect);
						}
					},
					errorMessage: "ComboBox StandardListItem with text '" + sNew + "' not found"
				});
			}
		});
	};

	var iChangeSelectSelection = function(oSelect, sNew) {
		// if (oSelect.isA("sap.m.Select")) {
			new Press().executeOn(oSelect);
			this.waitFor({
				controlType: "sap.m.Popover",
				matchers: new Ancestor(oSelect),
				success: function(aPopovers) {
					Opa5.assert.ok(aPopovers.length === 1, "Selection popover found");
					var oPopover = aPopovers[0];
					this.waitFor({
						controlType: "sap.ui.core.Item",
						matchers: [
							new Ancestor(oPopover, false),
							new PropertyStrictEquals({
								name: "text",
								value: sNew
							})
						],
						actions: new Press(),
						errorMessage: "Selection Item with text '" + sNew + "' not found"
					});
				}
			});
	};

	var iChangeSelectOnPanel = function(oGroupPanel, sNew, oSettings) {
		waitForSelectWithSelectedTextOnPanel.call(this, "", oGroupPanel, {
			actions: function (oSelect) {
				iChangeComboBoxSelection.call(this, oSelect, sNew);
			}.bind(this),
			success: function(oSelect) {
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, oSelect);
				}
			}
		});
	};

	var iAddGroupConfiguration = function(oGroupPanel, oGroupConfiguration) {
		return iChangeSelectOnPanel.call(this, oGroupPanel, oGroupConfiguration.key);
	};

	var iAddSortConfiguration = function(oSortPanel, oSortConfiguration) {
		return iChangeSelectOnPanel.call(this, oSortPanel, oSortConfiguration.key, {
			success: function(oSelect) {
				if (oSortConfiguration.descending !== undefined) {
					this.waitFor({
						controlType: "sap.m.CustomListItem",
						matchers: new Descendant(oSelect, false),
						success: function(aCustomListItems) {
							var aCustomListItem = aCustomListItems[0];
							this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(aCustomListItem),
									new PropertyStrictEquals({
										name: "icon",
										value: Util.icons.descending
									})
								],
								actions: function(oButton) {
									if (oSortConfiguration.descending && oButton.getParent().getSelectedButton() !== oButton) {
										new Press().executeOn(oButton);
									}

									if (oSortConfiguration && typeof oSortConfiguration.success === "function") {
										oSortConfiguration.success.call(this);
									}
								}
							});
						}
					});
				}
			}
		});
	};

	var iAddFilterConfiguration = function(oFilterPanel, iIndex, oConfiguration) {
		this.waitFor({
			controlType: "sap.m.CustomListItem",
			//matchers: new Ancestor(oFilterPanel, false),
			success: function(aCustomListItems) {
				//var oLastItem = aCustomListItems[aCustomListItems.length - 1];
				this.waitFor({
					controlType: "sap.m.ComboBox",
					//matchers: new Ancestor(oLastItem, false),
					actions: new EnterText({
						text: oConfiguration.key,
						pressEnterKey: true
					}),
					success: function() {
						this.waitFor({
							controlType: "sap.m.CustomListItem",
							//matchers: new Ancestor(oFilterPanel, false),
							success: function(aCustomListItems) {
								Opa5.assert.ok(aCustomListItems.length > iIndex + 1, "New filter entry generated");

								oConfiguration.values.forEach(function(vValue){
									this.waitFor({
										id: oConfiguration.inputControl,
										//matchers: new Ancestor(oCreatedItem, false), Parent of FilterField is an AdapationFilterbar
										actions: new EnterText({
											text: vValue,
											pressEnterKey: true
										})
									});
								}, this);
							}
						});
					}
				});
			}
		});
	};

	var iPressAllDeclineButtonsOnPanel = function(oPanel, oSettings) {

		if (oSettings.itemAmount < 2) {
			oSettings.success.call(this);
			return;
		}

		this.waitFor({
			controlType: "sap.m.Button",
			matchers: [
				new Ancestor(oPanel, false),
				new PropertyStrictEquals({
					name: "icon",
					value: Util.icons.decline
				})
			],
			actions: new Press(),
			// Add new group entries
			success: function() {
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this);
				}
			}
		});
	};

	var iPersonalizeListViewItems = function(oP13nDialog, aItems) {
		this.waitFor({
			controlType: oP13nDialog.getContent()[0].getView("columns") && oP13nDialog.getContent()[0].getView("columns").getContent().isA("sap.m.p13n.SelectionPanel") ? "sap.m.p13n.SelectionPanel" : "sap.m.p13n.SelectionPanel",
			matchers: new Ancestor(oP13nDialog, false),
			success: function(aListViews) {
				var oListView = aListViews[0];
				this.waitFor({
					controlType: "sap.m.ColumnListItem",
					matchers: new Ancestor(oListView, false),
					actions: function(oColumnListItem) {
						this.waitFor({
							controlType: "sap.m.Label",
							matchers: new Ancestor(oColumnListItem, false),
							success: function(aLabels) {
								var oLabelControl = aLabels[0];
								this.waitFor({
									controlType: "sap.m.CheckBox",
									matchers: [
										new Ancestor(oColumnListItem, false)
									],
									actions: function(oCheckBox) {
										if ((!oCheckBox.getSelected() && aItems.includes(oLabelControl.getText())) ||
											(oCheckBox.getSelected() && !aItems.includes(oLabelControl.getText()))) {
											new Press().executeOn(oCheckBox);
										}
									},
									success: function(aCheckBoxes) {
										if (aCheckBoxes[0].getSelected()) {
											// click on columnlist item
											new Press().executeOn(oColumnListItem);
											// click on move to top
											if (oColumnListItem.getParent().getItems().indexOf(oColumnListItem) > 0) {
												this.waitFor({
													controlType: "sap.m.Button",
													matchers: [
														new PropertyStrictEquals({
															name: "icon",
															value: Util.icons.movetotop
														})
													],
													actions: new Press(),
													success: function() {
														var iIndex = aItems.indexOf(oLabelControl.getText());
														while (iIndex > 0) {
															this.waitFor({
																controlType: "sap.m.Button",
																matchers:  [
																	new PropertyStrictEquals({
																		name: "icon",
																		value: Util.icons.movedown
																	})
																],
																actions: new Press()
															});
															iIndex--;
														}
													}
												});
											}
										}
									}
								});
							}
						});
					}.bind(this),
					success: function() {
						iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
					}
				});
			}
		});
	};

	var iPersonalizeGroupViewItem = function(oGroupViewItem, mSettings) {
		// Get sap.m.Panel of GroupViewItem
		this.waitFor({
			controlType: "sap.m.Panel",
			matchers: new Ancestor(oGroupViewItem, true),
			success: function(aPanels) {
				var oGroupPanel = aPanels[0];
				// Get the expand button for the panel
				this.waitFor({
					controlType: "sap.m.Button",
					matchers: new Ancestor(oGroupPanel, true),
					success: function(aButtons) {
						var oButton = aButtons[0];
						// click on expand button
						if (!oGroupPanel.getExpanded()) {
							new Press().executeOn(oButton);
						}
						this.waitFor({
							controlType: "sap.m.Toolbar",
							matchers: new Ancestor(oGroupPanel, true),
							success: function(aToolbars) {
								var oToolbar = aToolbars[0];
								// Get label of the GroupViewItem
								this.waitFor({
									controlType: "sap.m.Title",
									matchers: new Ancestor(oToolbar, true),
									success: function(aToolbarLabels) {
										var oToolbarLabel = aToolbarLabels[0];
										this.waitFor({
											controlType: "sap.m.List",
											matchers: new Ancestor(oGroupPanel, true),
											success: function(aLists) {
												var oList = aLists[0];
												// Get CustomListItems inside the GroupViewItem panel
												this.waitFor({
													controlType: "sap.m.CustomListItem",
													matchers: new Ancestor(oList, true),
													actions: function(oFilterItem) {
														this.waitFor({
															controlType: "sap.m.Label",
															matchers: new Ancestor(oFilterItem, false),
															success: function(aFilterItemLabels) {
																var oFilterItemLabel = aFilterItemLabels[0];
																this.waitFor({
																	controlType: "sap.m.CheckBox",
																	matchers: new Ancestor(oFilterItem, false),
																	actions: function (oFilterItemCheckBox) {
																		if (mSettings[oToolbarLabel.getText()]) {
																			var aSettings = mSettings[oToolbarLabel.getText()];
																			// check / uncheck item if needed and group is in mSettings
																			if ((aSettings.includes(oFilterItemLabel.getText()) && !oFilterItemCheckBox.getSelected()) ||
																				(!aSettings.includes(oFilterItemLabel.getText()) && oFilterItemCheckBox.getSelected())) {
																					new Press().executeOn(oFilterItemCheckBox);
																			}
																		} else {
																			// uncheck all items of group if it's not in mSettings
																			if (oFilterItemCheckBox.getSelected()) {
																				new Press().executeOn(oFilterItemCheckBox);
																			}
																		}
																	}
																});
															}
														});
													}.bind(this),
													// close group panel
													success: function() {
														if (oGroupPanel.getExpanded()) {
															new Press().executeOn(oButton);
														}
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	};

	var iPersonalizeOldChartP13n = function(oControl, sChartType, aItems, oP13nDialog) {
		this.waitFor({
			controlType: "sap.m.P13nDimMeasurePanel",
			matchers: new Ancestor(oP13nDialog, false),
			success: function(aP13nDimMeasurePanels) {
				var oP13nDimMeasurePanel = aP13nDimMeasurePanels[0];
				this.waitFor({
				controlType: "sap.m.OverflowToolbar",
				matchers: new Ancestor(oP13nDimMeasurePanel, false),
				success: function(aOverflowToolbars) {
					var oOverflowToolbar = aOverflowToolbars[0];
					this.waitFor({
						controlType: "sap.m.ComboBox",
						matchers: new Ancestor(oOverflowToolbar),
						success: function(aComboBoxes) {
							var oComboBox = aComboBoxes[0];
							iChangeComboBoxSelection.call(this, oComboBox, sChartType, {
								success: function() {
									this.waitFor({
										controlType: "sap.m.ColumnListItem",
										matchers: [
											new Ancestor(oP13nDialog, false)
										],
										actions: function(oColumnListItem) {
											this.waitFor({
												controlType: "sap.m.Text",
												matchers: new Ancestor(oColumnListItem),
												success: function(aTexts) {
													var oText = aTexts[0];
													var oItem = aItems.find(function(oItem) {
														return oText.getText() === oItem.key;
													});
													var bItemIsPresent = !!oItem;

													this.waitFor({
														controlType: "sap.m.CheckBox",
														matchers: new Ancestor(oColumnListItem),
														actions: function(oCheckBox) {
															if ((!oCheckBox.getSelected() && bItemIsPresent) ||
																(oCheckBox.getSelected() && !bItemIsPresent)) {
																new Press().executeOn(oCheckBox);
															}
														},
														success: function() {
															if (bItemIsPresent) {
																this.waitFor({
																	controlType: "sap.m.Select",
																	matchers: new Ancestor(oColumnListItem),
																	actions: function(oSelect) {
																		iChangeSelectSelection.call(this, oSelect, oItem.role);
																	}.bind(this)
																});
															}
														}
													});
												}
											});
										}.bind(this),
										success: function() {
											iPressTheOKButtonOnTheDialog.call(this,oP13nDialog);
										}
									});
								}
							});
						}
					});
				}
				});
			}
		});
	};

	return {
		iPressTheOKButtonOnTheDialog: function(oDialog, oSettings) {
			return iPressTheOKButtonOnTheDialog.call(this, oDialog, oSettings);
		},
		iOpenThePersonalizationDialog: function(oControl, oSettings) {
			return iOpenThePersonalizationDialog.call(this, oControl, oSettings);
		},
		/**
		 * @typedef {object} ChartPersonalizationConfiguration
		 * @property {string} key Key of the value that is the result of the personalization
		 * @property {string} role Role of the given value
		 */

		/**
		 * OPA5 test action
		 * 1. Opens the personalization dialog of a given chart.
		 * 2. Selects a chart type given by <code>sChartType</code>.
		 * 3. Executes the given <code>ChartPersonalizationConfiguration</code>.
		 * 4. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>SmartChart</code> that is personalized
		 * @param {string} sChartType String containing the type of chart that is displayed
		 * @param {ChartPersonalizationConfiguration[]} aItems Array containing the chart personalization configuration objects
		 * @param {boolean} bIsMDC indicates, that the action is called by the MDC framework instead of comp
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
		 * @returns {Promise} OPA waitFor
		 */
		iPersonalizeChart: function(oControl, sChartType, aItems, bIsMDC, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.chart, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {

					var sViewName = bIsMDC ? "Item" : "dimeasure";

					//oP13nDialog.getContent()[0].getView("item") && oP13nDialog.getContent()[0].getView("item").getContent().isA("sap.m.p13n.SelectionPanel")
					if (oP13nDialog.getContent()[0].getView(sViewName).getContent().isA("sap.m.P13nDimMeasurePanel")){
						iPersonalizeOldChartP13n.call(this, oControl, sChartType, aItems, oP13nDialog);
					} else {
						this.waitFor({
							controlType: "sap.ui.mdc.p13n.panels.ChartItemPanel",
							matchers: new Ancestor(oP13nDialog, false),
							success: function(aItemPanels) {
								//This is done in 3 steps
								//1. Remove current selection
								//2. Add items in order
								//3. Select correct roles

								var aItemsToRemoveIds = [];
								var oItemPanel = aItemPanels[0];

								this.waitFor({

									controlType: "sap.m.ColumnListItem",
									matchers: [
										new Ancestor(oP13nDialog, false)
									],
									actions: function(oColumnListItem) {
										//Step 1.1: Find all remove buttons
										var  bTemplate = oColumnListItem.getCells().length === 1;

										if (!bTemplate){
											this.waitFor({
												controlType: "sap.m.Button",
												matchers: [
													new Ancestor(oColumnListItem),
													new Properties({
														icon: "sap-icon://decline"
													})
												],
												success: function(aBtns) {
													var oButton = aBtns[0];
													aItemsToRemoveIds.push(oButton.getId());
												}
											});
										}
									}.bind(this),
									success: function() {

										var iClickOnChartP13nRemoveButton = function(sCurrentBtnId, oP13nDialog, aBtnIds, fnFollowUpFunction, aFollowUpParams){
											this.waitFor({

												controlType: "sap.m.Button",
												id: sCurrentBtnId,
												matchers: [
													new Ancestor(oP13nDialog, false)
												],
												success: function(oBtn) {
													new Press().executeOn(oBtn);

													var iIdx = aBtnIds.indexOf(sCurrentBtnId);

													if (iIdx === aBtnIds.length - 1){
														fnFollowUpFunction.apply(this, aFollowUpParams);
													} else {
														iClickOnChartP13nRemoveButton.call(this, aBtnIds[iIdx + 1], oP13nDialog, aBtnIds, fnFollowUpFunction, aFollowUpParams);
													}
												}
											});
										};

										var fnAddAllItems = function(oCurrentItem, aItems, fnFollowUp){
											if (oCurrentItem.kind) {

												var sKind = oCurrentItem.kind;

												if (bIsMDC) {
													if (sKind === "Dimension") {
														sKind = "Groupable";
													} else if (sKind === "Measure") {
														sKind = "Aggregatable";
													}
												}

												this.waitFor({
													controlType: "sap.m.ComboBox",
													id: "p13nPanel-templateComboBox-" + sKind,
													matchers: new Ancestor(oP13nDialog, false),
													actions: function(oComboBox) {
														iChangeComboBoxSelection.call(this, oComboBox, oCurrentItem.key);
													}.bind(this),
													success: function(){
														var iIdx = aItems.indexOf(oCurrentItem);

														if (iIdx === aItems.length - 1){
															fnFollowUp.call(this);
														} else {
															fnAddAllItems.call(this, aItems[iIdx + 1], aItems, fnFollowUp);
														}
													}
												});
											} else {
												Log.error("P13nChartPersonalizationOPA: No kind field given for " + oCurrentItem.key + ". Ignoring the field!");
											}
										};

										var fnAssignRoles = function(){
											this.waitFor({

												controlType: "sap.m.ColumnListItem",
												matchers: [
													new Ancestor(oP13nDialog, false)
												],
												actions: function(oColumnListItem) {
													this.waitFor({
														controlType: "sap.m.ComboBox",
														matchers: new Ancestor(oColumnListItem),
														success: function(aComboBoxes) {
															var oComboBox = aComboBoxes[0];
															var oItem = aItems.find(function(oItem) {
																if (bIsMDC){
																	//Account for templates
																	return oComboBox.getSelectedItem() ? oComboBox.getSelectedItem().getText() === oItem.key : undefined;
																}
																return oComboBox.getSelectedKey() === oItem.key;
															});
															var bItemIsPresent = !!oItem;

															if (bItemIsPresent) {

																//Ignore templates / items with no role select (due to chart type)
																var bMobile = oItemPanel._bMobileMode;
																if (bMobile && oColumnListItem.getCells()[0].getItems[1].getVisible() == false) {
																	return;
																}

															if (!bMobile && !oColumnListItem.getCells()[1].getVisible()) {
																	return;
																}

																//Select correct role if selected
																this.waitFor({
																	controlType: "sap.m.Select",
																	matchers: new Ancestor(oColumnListItem),
																	actions: function(oSelect) {
																		iChangeSelectSelection.call(this, oSelect, oItem.role);
																	}.bind(this)
																});
															}
														}.bind(this)
													});
												}.bind(this),
												success: function() {
													iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
												}
											});
										};


										if (aItemsToRemoveIds.length != 0){
											iClickOnChartP13nRemoveButton.call(this, aItemsToRemoveIds[0], oP13nDialog, aItemsToRemoveIds, fnAddAllItems, [aItems[0], aItems, fnAssignRoles]);
										} else {
											fnAddAllItems.call(this, aItems[0], aItems, fnAssignRoles);
										}
									}
								});
							}
						});
					}
				}
			});
		},
		/**
		 * OPA5 test action
		 * 1. Opens the personalization dialog of a given table.
		 * 2. Selects all columns determined by the given labels. Also deselects all other columns that are selected but not included in the given labels.
		 * 3. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be personalized
		 * @param {string[]} aColumns Array containing the labels of the columns that are the result of the personalization
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
		 * @returns {Promise} Opa waitFor
		 */
		 iPersonalizeColumns: function(oControl, aColumns, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.column, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					iPersonalizeListViewItems.call(this, oP13nDialog, aColumns);
				}
			});
		},
		iPersonalizeFilterBar: function(oControl, mSettings, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			var sIcon = Util.icons.group;
			return fnOpenThePersonalizationDialog.call(this, oControl, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(oP13nDialog, false),
							new PropertyStrictEquals({
								name: "icon",
								value: sIcon
							})
						],
						actions: new Press(),
						success: function() {
							this.waitFor({
								controlType: "sap.ui.mdc.p13n.panels.GroupView",
								matchers: new Ancestor(oP13nDialog, false),
								success: function(aGroupViews) {
									var oGroupView = aGroupViews[0];
									this.waitFor({
										controlType: "sap.m.VBox",
										matchers: new Ancestor(oGroupView, true),
										success: function(aVBoxes) {
											var oVBox = aVBoxes[0];
											this.waitFor({
												controlType: "sap.m.List",
												matchers: new Ancestor(oVBox, true),
												success: function(aLists) {
													var oList = aLists[0];
													this.waitFor({
														controlType: "sap.m.CustomListItem",
														matchers: new Ancestor(oList, true),
														actions: function(oGroupViewItem) {
															iPersonalizeGroupViewItem.call(this, oGroupViewItem, mSettings);
														}.bind(this),
														success: function() {
															iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
														}
													});
												}
											});
										}
									});
								}
							});
						},
						errorMessage: "No button with icon '" + sIcon + "' found on P13nDialog"
					});
				}
			});
		},
		/**
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be personalized
		 * @param {string[]} aLinks an array containing the names of the links that should be result of the personalisation
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the <code>mdc.Link</code>
		 * @returns {Promise} Opa waitFor
		 */
		iPersonalizeLink: function(oControl, aLinks, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return fnOpenThePersonalizationDialog.call(this, oControl, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.ui.mdc.p13n.panels.LinkSelectionPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aLinkSelectionPanels) {
							Opa5.assert.equal(aLinkSelectionPanels.length, 1, "sap.ui.mdc.p13n.panels.LinkSelectionPanel found");
							var oLinkSelectionPanel = aLinkSelectionPanels[0];
							this.waitFor({
								controlType: "sap.m.ColumnListItem",
								matchers: new Ancestor(oLinkSelectionPanel, false),
								actions: function(oColumnListItem) {
									this.waitFor({
										controlType: "sap.m.Link",
										matchers: new Ancestor(oColumnListItem, false),
										success: function(aLinkControls) {
											var oLinkControl = aLinkControls[0];
											this.waitFor({
												controlType: "sap.m.CheckBox",
												matchers: [
													new Ancestor(oColumnListItem, false)
												],
												actions: function(oCheckBox) {
													if ((!oCheckBox.getSelected() && aLinks.includes(oLinkControl.getText())) ||
														(oCheckBox.getSelected() && !aLinks.includes(oLinkControl.getText()))) {
														new Press().executeOn(oCheckBox);
													}
												}
											});
										}
									});
								}.bind(this),
								success: function() {
									iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
								}
							});
						}
					});
				}
			});
		},
		/**
		 * @typedef {object} FilterPersonalizationConfiguration
		 * @property {string} key Key of the value that is the result of the personalization
		 * @property {string} operator Operator defining how the items are filtered
		 * @property {string[]} values Filter values for the given operator
		 * @property {string} inputControl <code>Control</code> that is used as input for the value
		 */

		/**
		 * OPA5 test action
		 * 1. Opens the personalization dialog of a given chart.
		 * 2. Executes the given <code>FilterPersonalizationConfiguration</code>.
		 * 3. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
		 * @param {FilterPersonalizationConfiguration[]} aConfigurations Array containing the filter personalization configuration objects
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
		 * @param {boolean} bCancel The dialog will be cancelled instead of confirmed
		 * @returns {Promise} OPA waitFor
		 */
		iPersonalizeFilter: function(oControl, aConfigurations, fnOpenThePersonalizationDialog, bCancel) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.filter, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.ui.mdc.p13n.panels.FilterPanel",
						//matchers: new Ancestor(oP13nDialog, false),
						success: function(aFilterPanels) {
							var oFilterPanel = aFilterPanels[0];
							iPressAllDeclineButtonsOnPanel.call(this, oFilterPanel, {
								itemAmount: oFilterPanel._oListControl.getItems().length,
								success: function() {
									aConfigurations.forEach(function(oConfiguration, iIndex) {
										iAddFilterConfiguration.call(this, oP13nDialog, iIndex, oConfiguration);
									}.bind(this));
									if (bCancel) {
										iPressTheCancelButtonOnTheDialog.call(this, oP13nDialog);
									} else {
										iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
									}
								}
							});
						}
					});
				}
			});
		},
		/**
		 * @typedef {object} GroupPersonalizationConfiguration
		 * @property {string} key of the item that is the result of the personalization
		 */

		/**
		 * Opa5 test action:
		 * 1. Opens the personalization dialog of a given control.
		 * 2. Executes the given <code>GroupPersonalizationConfiguration</code>.
		 * 3. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be reset
		 * @param {GroupPersonalizationConfiguration[]} aConfigurations an array containing the group personalization configuration objects
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
		 * @returns {Promise} Opa waitFor
		 */
		iPersonalizeGroup: function(oControl, aConfigurations, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.group, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: oP13nDialog.getContent()[0].getView("group") && oP13nDialog.getContent()[0].getView("group").getContent().isA("sap.ui.mdc.p13n.panels.GroupPanel") ? "sap.ui.mdc.p13n.panels.GroupPanel" : "sap.m.p13n.GroupPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aGroupPanels) {
							var oGroupPanel = aGroupPanels[0];
							// Remove all group entries
							iPressAllDeclineButtonsOnPanel.call(this, oGroupPanel, {
								// Add new group entries
								itemAmount: oGroupPanel._oListControl.getItems().length, //TODO: cleanup
								success: function() {
									this.waitFor({
										controlType: "sap.m.CustomListItem",
										matchers: new Ancestor(oGroupPanel, false),
										success: function(aCustomListItems) {
											Opa5.assert.ok(aCustomListItems.length === 1);
											aConfigurations.forEach(function(oConfiguration) {
												iAddGroupConfiguration.call(this, oGroupPanel, oConfiguration);
											}.bind(this));
											iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
										}
									});
								}
							});
						}
					});
				}
			});
		},
		/**
		 * @typedef {object} SortPersonalizationConfiguration
		 * @property {string} key Key of the item that is the result of the personalization
		 * @property {boolean} descending Determines whether the sort direction is descending
		 */

		/**
		 * OPA5 test action
		 * 1. Opens the personalization dialog of a given chart.
		 * 2. Executes the given <code>SortPersonalizationConfiguration</code>.
		 * 3. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is sorted
		 * @param {SortPersonalizationConfiguration[]} aConfigurations Array containing the sort personalization configuration objects
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
		 * @returns {Promise} OPA waitFor
		 */
		iPersonalizeSort: function(oControl, aConfigurations, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.sort, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: oP13nDialog.getContent()[0].getView("sort") && oP13nDialog.getContent()[0].getView("sort").getContent().isA("sap.ui.mdc.p13n.panels.SortQueryPanel") ? "sap.ui.mdc.p13n.panels.SortQueryPanel" : "sap.m.p13n.SortPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aSortPanels) {
							var oSortPanel = aSortPanels[0];
							// Remove all Sort entries
							iPressAllDeclineButtonsOnPanel.call(this, oSortPanel, {
								// Add new Sort entries
								itemAmount: oSortPanel._oListControl.getItems().length, //TODO: cleanup,
								success: function() {
									this.waitFor({
										controlType: "sap.m.CustomListItem",
										matchers: new Ancestor(oSortPanel, false),
										success: function(aCustomListItems) {
											Opa5.assert.ok(aCustomListItems.length === 1);
											aConfigurations.forEach(function(oConfiguration, iIndex) {
												iAddSortConfiguration.call(this, oSortPanel, oConfiguration);
											}.bind(this));
											iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
										}
									});
								}
							});
						}
					});
				}
			});
		},
		/**
		 * Opa5 test action
		 * 1. Opens the personalization dialog of a given chart.
		 * 2. Presses the reset personalization button.
		 * 3. Confirms the reset dialog.
		 * 4. Closes the personalization dialog.
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is reset
		 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the <code>mdc.Link</code>
		 * @returns {Promise} OPA waitFor
		 */
		iResetThePersonalization: function (oControl, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return fnOpenThePersonalizationDialog.call(this, oControl, {
				success: function(oP13nDialog) {
					iPressTheResetButtonOnTheDialog.call(this, oP13nDialog, {
						success: function() {
							waitForTheWarningDialog.call(this, {
								success: function(oWarningDialog) {
									iPressTheOKButtonOnTheDialog.call(this, oWarningDialog, {
										success: function() {
											iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	};
});