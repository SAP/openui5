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
	"sap/base/util/UriParameters"
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
	UriParameters
) {
	"use strict";

	var oMDCBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

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
						return oP13nDialog.getParent().getChart() === oControlInstance.getChart().getId();
					});
				} else {
					aDialogMatchers.push(new Ancestor(oControlInstance, false));
				}

				if (oControlInstance.isA("sap.ui.mdc.FilterBar")) {
					// Add matcher for p13n button text
					var oMatcher = new Matcher();
					oMatcher.isMatching = function(oButton) {
						return oButton.getText().includes(oMDCBundle.getText("filterbar.ADAPT"));
					};
					aButtonMatchers.push(oMatcher);
					aDialogMatchers.push(new Properties({
						title: oMDCBundle.getText("filterbar.ADAPT_TITLE")
					}));
				} else {
					// Add matcher for p13n button icon
					aButtonMatchers.push(new Properties({
						icon: Util.icons.settings
					}));
					aDialogMatchers.push(new Properties({
						title: oMDCBundle.getText("p13nDialog.VIEW_SETTINGS")
					}));
				}

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

	var iPressTheResetButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.reset, oSettings);
	};

	var waitForNavigationControl = function (oP13nDialog, oSettings) {
		oSettings = oSettings || {};

		//Mobile
		if (sap.ui.Device.system.phone) {
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

	var iPersonalize = function(oControl, sPanelName, oSettings) {
		return iOpenThePersonalizationDialog.call(this, oControl, {
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

	var iChangeSelectOnPanel = function(oGroupPanel, sOld, sNew, oSettings) {
		waitForSelectWithSelectedTextOnPanel.call(this, sOld, oGroupPanel, {
			actions: function (oSelect) {
				iChangeSelectSelection.call(this, oSelect, sNew);
			}.bind(this),
			success: function(oSelect) {
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, oSelect);
				}
			}
		});
	};

	var iAddGroupConfiguration = function(oGroupPanel, oGroupConfiguration) {
		return iChangeSelectOnPanel.call(this, oGroupPanel, Util.texts.none, oGroupConfiguration.key, {
			success: function(oSelect) {
				if (oGroupConfiguration.showFieldAsColumn !== undefined) {
					this.waitFor({
						controlType: "sap.m.CustomListItem",
						matchers: new Descendant(oSelect, false),
						success: function(aCustomListItems) {
							var aCustomListItem = aCustomListItems[0];
							this.waitFor({
								controlType: "sap.m.CheckBox",
								matchers: new Ancestor(aCustomListItem),
								actions: function(oCheckBox) {
									if (oCheckBox.getSelected() !== oGroupConfiguration.showFieldAsColumn) {
										new Press().executeOn(oCheckBox);
									}
								}
							});
						}
					});
				}
			}
		});
	};

	var iAddSortConfiguration = function(oSortPanel, oSortConfiguration) {
		return iChangeSelectOnPanel.call(this, oSortPanel, Util.texts.none, oSortConfiguration.key, {
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

	var iAddFilterConfiguration = function(oWrappingGrid, oConfiguration, bPressAddButton) {
		this.waitFor({
			controlType: "sap.m.Button",
			matchers: [
				new PropertyStrictEquals({
					name: "text",
					value: "Add"
				}),
				new Ancestor(oWrappingGrid, false)
			],
			success: function(aAddButtons) {
				var oAddButton = aAddButtons[0];
				this.waitFor({
					controlType: "sap.ui.layout.Grid",
					matchers: [
						new Descendant(oAddButton),
						new Ancestor(oWrappingGrid)
					],
					success: function(aGrids) {
						var oGrid = aGrids[0];
						this.waitFor({
							controlType: "sap.m.ComboBox",
							matchers: new Ancestor(oGrid),
							success: function(aComboBoxes) {
								var oComboBoxName = aComboBoxes[0];
								var oComboBoxCondition = aComboBoxes[1];
								// Select name
								iChangeComboBoxSelection.call(this, oComboBoxName, oConfiguration.key , {
									success: function() {
										// Select condition
										iChangeComboBoxSelection.call(this, oComboBoxCondition, oConfiguration.operator, {
											success: function() {
												// Add filter value(s)
												if (oConfiguration.values && oConfiguration.values.length) {
													oConfiguration.values.forEach(function(sConfigurationValue) {
														this.waitFor({
															controlType: oConfiguration.inputControl,
															matchers: new Ancestor(oGrid),
															success: function(aInputs) {
																var oInput = aInputs[oConfiguration.values.indexOf(sConfigurationValue)];
																new EnterText({
																	text: sConfigurationValue
																}).executeOn(oInput);
															}
														});
													}.bind(this));
												}
												// click add button if needed
												if (bPressAddButton) {
													new Press().executeOn(oAddButton);
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
			controlType: oP13nDialog.getContent()[0].getView("columns") ? "sap.ui.mdc.p13n.panels.ListView" : "sap.m.p13n.SelectionPanel",
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
									controlType: "sap.m.Label",
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

    return {
		iPressTheOKButtonOnTheDialog: function(oDialog, oSettings) {
			return iPressTheOKButtonOnTheDialog.call(this, oDialog, oSettings);
		},
		iOpenThePersonalizationDialog: function(oControl, oSettings) {
			return iOpenThePersonalizationDialog.call(this, oControl, oSettings);
		},
		iPersonalizeChart: function(oControl, sChartType, aItems) {
			return iPersonalize.call(this, oControl, Util.texts.chart, {
				success: function(oP13nDialog) {

					if (UriParameters.fromQuery(window.location.search).get("newChartP13n") === "true") {

						this.waitFor({
							controlType: "sap.ui.mdc.p13n.panels.ChartItemPanelNew",
							matchers: new Ancestor(oP13nDialog, false),
							success: function() {
								// Setup chart type
								var aItemsToRemoveIds = [];
								var aItemsAlreadyPresent = [];

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
													return oComboBox.getSelectedKey() === oItem.key;
												});
												var bItemIsPresent = !!oItem;

												//Remove if not selected
												if (!bItemIsPresent) {

													//Template has only one cell (no role & remove)
													var  bTemplate = oColumnListItem.getCells().length === 1;

													if (!bTemplate){
														this.waitFor({
															controlType: "sap.m.Button",
															matchers: new Ancestor(oColumnListItem, false),
															actions: function(oBtn) {
																aItemsToRemoveIds.push(oBtn.getId());
															}
														});
													}
												} else {
													aItemsAlreadyPresent.push(oComboBox.getSelectedKey());
												}
											}
										});
									}.bind(this),
									success: function() {

										aItemsToRemoveIds.forEach(function(oBtnId){

											this.waitFor({

												controlType: "sap.m.Button",
												matchers: [
													new Ancestor(oP13nDialog, false),
													new Properties({
														id: oBtnId
													})
												],
												success: function(aBtns) {
													new Press().executeOn(aBtns[0]);
												}
											});

										}.bind(this));

										var aItemsToAdd = aItems.filter(function(oItem){return aItemsAlreadyPresent.indexOf(oItem.key) === -1;});

										aItemsToAdd.forEach(function(oItem) {

											if (oItem.kind) {
												this.waitFor({
													controlType: "sap.m.ComboBox",
													matchers: [
														new Ancestor(oP13nDialog, false),
														new Properties({
															id: "p13nPanel-templateComboBox-" + oItem.kind
														})
													],
													actions: function(oComboBox) {
														iChangeComboBoxSelection.call(this, oComboBox, oItem.key);
													}.bind(this)
												});
											} else {
												Log.error("P13nChartPersonalizationOPA: No kind field given for " + oItem.key + ". Ignoring the field!");
											}


										}.bind(this));

										//Make sure every new item has the correct role
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
															return oComboBox.getSelectedKey() === oItem.key;
														});
														var bItemIsPresent = !!oItem;

														if (bItemIsPresent) {

															var bMobile = oColumnListItem.getTable().getParent().getParent()._bMobileMode;
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
											}.bind(this)
										});

										iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
									}
								});
							}
						});
					} else {
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
					}
				}
			});
		},
		/**
		 *
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be personalized
		 * @param {string[]} aColumns Array containing the keys of the columns that should be result of the personalisation
		 * @returns {Promise} Opa waitFor
		 */
		 iPersonalizeColumns: function(oControl, aColumns) {
			return iPersonalize.call(this, oControl, Util.texts.column, {
				success: function(oP13nDialog) {
					iPersonalizeListViewItems.call(this, oP13nDialog, aColumns);
				}
			});
		},
		iPersonalizeFilterBar: function(oControl, mSettings) {
			var sIcon = Util.icons.group;
			return iOpenThePersonalizationDialog.call(this, oControl, {
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
		 * @typedef {object} FilterPersonalizationConfiguration
		 * @property {string} key of the item that should be result of the personalisation
		 * @property {string} operator operator in which the items should be filtered
		 * @property {string[]} values filter values for the given operator
		 * @property {string} inputControl
		 */
		/**
		 *
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be reset
		 * @param {FilterPersonalizationConfiguration[]} aConfigurations an array containing the group personalization configuration objects
		 * @returns {Promise} Opa waitFor
		 */
		iPersonalizeFilter: function(oControl, aConfigurations) {
			return iPersonalize.call(this, oControl, Util.texts.filter, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.ui.comp.p13n.P13nFilterPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aFilterPanels) {
							var oFilterPanel = aFilterPanels[0];
							this.waitFor({
								controlType: "sap.m.Panel",
								matchers: new Ancestor(oFilterPanel),
								success: function(aPanels) {
									var oPanel = aPanels[0];
									this.waitFor({
										controlType: "sap.ui.comp.p13n.P13nConditionPanel",
										matchers: new Ancestor(oPanel),
										success: function(aP13nConditionPanels) {
											var oP13nConditionPanel = aP13nConditionPanels[0];
											// Remove all filter entries
											iPressAllDeclineButtonsOnPanel.call(this, oP13nConditionPanel, {
												success: function() {
													this.waitFor({
														controlType: "sap.ui.layout.Grid",
														matchers: new Ancestor(oP13nConditionPanel),
														success: function(aGrids) {
															var oWrappingGrid = aGrids[0];
															aConfigurations.forEach(function(oConfiguration) {
																var bPressAddButton = (aConfigurations.indexOf(oConfiguration) != aConfigurations.length - 1);
																iAddFilterConfiguration.call(this, oWrappingGrid, oConfiguration, bPressAddButton);
															}.bind(this));
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
		},
		/**
		 * @typedef {object} GroupPersonalizationConfiguration
		 * @property {string} key of the item that should be result of the personalisation
		 * @property {boolean} showFieldAsColumn determinating if the "Show Field as Column" checkbox should be checked
		 */
		/**
		 *
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be reset
		 * @param {GroupPersonalizationConfiguration[]} aConfigurations an array containing the group personalization configuration objects
		 * @returns {Promise} Opa waitFor
		 */
		iPersonalizeGroup: function(oControl, aConfigurations) {
			return iPersonalize.call(this, oControl, Util.texts.group, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: (oP13nDialog.getContent()[0].getView("group") ? "sap.ui.mdc.p13n.panels.GroupPanel" : "sap.m.p13n.GroupPanel"),
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
		 * @property {string} key of the item that should be result of the personalisation
		 * @property {boolean} descending determinating if the sort direction is descending
		 */
		/**
		 *
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be reset
		 * @param {SortPersonalizationConfiguration[]} aConfigurations an array containing the sort personalization configuration objects
		 * @returns {Promise} Opa waitFor
		 */
		iPersonalizeSort: function(oControl, aConfigurations) {
			return iPersonalize.call(this, oControl, Util.texts.sort, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: oP13nDialog.getContent()[0].getView("sort") ? "sap.ui.mdc.p13n.panels.SortQueryPanel" : "sap.m.p13n.SortPanel",
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
		 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control which is to be reset
		 * @returns {Promise} Opa waitFor
		 */
		iResetThePersonalization: function (oControl) {
			return iOpenThePersonalizationDialog.call(this, oControl, {
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
