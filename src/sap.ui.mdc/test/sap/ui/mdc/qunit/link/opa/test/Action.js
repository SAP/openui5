/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/actions/Press', 'sap/ui/test/actions/EnterText', 'sap/ui/test/matchers/Properties', 'sap/ui/test/matchers/Ancestor', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Util', 'sap/ui/test/matchers/PropertyStrictEquals'
], function(Opa5, Press, EnterText, Properties, Ancestor, TestUtil, PropertyStrictEquals) {
	'use strict';

	var Action = Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Action", {

		iLookAtTheScreen: function() {
			return this;
		},

		iPressOnPersonalizationButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://action-settings"
				}),
				actions: new Press()
			});
		},

		iPressOnLinkPersonalizationButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.POPOVER_DEFINE_LINKS")
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "The 'More Links' button found");
				}
			});
		},

		// iClickOnTheCheckboxSelectAll: function() {
		// 	var oSelectAllCheckbox;
		// 	return this.waitFor({
		// 		searchOpenDialogs: true,
		// 		controlType: "sap.m.CheckBox",
		// 		check: function(aCheckboxes) {
		// 			return aCheckboxes.filter(function(oCheckbox) {
		// 				if (jQuery.sap.endsWith(oCheckbox.getId(), '-sa')) {
		// 					oSelectAllCheckbox = oCheckbox;
		// 					return true;
		// 				}
		// 				return false;
		// 			});
		// 		},
		// 		success: function() {
		// 			oSelectAllCheckbox.$().trigger("tap");
		// 		}
		// 	});
		// },

		// iClickOnTheCheckboxShowFieldAsColumn: function() {
		// 	return this.waitFor({
		// 		searchOpenDialogs: true,
		// 		controlType: "sap.m.CheckBox",
		// 		matchers: new PropertyStrictEquals({
		// 			name: "text",
		// 			value: TestUtil.getTextFromResourceBundle("sap.m", "CONDITIONPANEL_LABELGROUPING")
		// 		}),
		// 		success: function(aCheckBoxes) {
		// 			Opa5.assert.equal(aCheckBoxes.length, 1, "One CheckBox found");
		// 			aCheckBoxes[0].$().trigger("tap");
		// 		}
		// 	});
		// },

		iNavigateToPanel: function(sPanelType) {
			if (sap.ui.Device.system.phone) {
				return this.waitFor({
					controlType: "sap.m.List",
					success: function(aLists) {
						var oItem = TestUtil.getNavigationItem(aLists[0], TestUtil.getTextOfPanel(sPanelType));
						oItem.$().trigger("tap");
					}
				});
			}
			return this.waitFor({
				controlType: "sap.m.SegmentedButton",
				success: function(aSegmentedButtons) {
					var oGroupButton = TestUtil.getNavigationItem(aSegmentedButtons[0], TestUtil.getTextOfPanel(sPanelType));
					oGroupButton.$().trigger("tap");
				}
			});
		},

		iSelectLink: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.m.CheckBox",
				matchers: function (oCheckBox) {
					var oItem = oCheckBox.getParent();
					if (oItem.getCells && oItem.getCells()[0].getText() === sColumnName) {
						return true;
					}
					return false;
				},
				actions: new Press()
			});
		},

		iPressRemoveLineButton: function(sPanelType) {
			var oFirstRemoveLineButton;
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.filter(function(oButton) {
						// "sap-icon://sys-cancel"
						if (oButton.getTooltip_Text() !== TestUtil.getRemoveButtonTooltipOf(sPanelType)) {
							return false;
						}
						if (!oFirstRemoveLineButton) {
							oFirstRemoveLineButton = oButton;
						}
						return true;
					});
				},
				success: function() {
					oFirstRemoveLineButton.$().trigger("tap");
				}
			});
		},

		iPressRestoreButton: function() {
			var oRestoreButton;
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.filter(function(oButton) {
						if (oButton.getText() !== TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.RESET")) {
							return false;
						}
						oRestoreButton = oButton;
						return true;
					});
				},
				success: function() {
					oRestoreButton.$().trigger("tap");
				}
			});
		},

		// iPressCancelButton: function() {
		// 	var oCancelButton;
		// 	return this.waitFor({
		// 		searchOpenDialogs: true,
		// 		controlType: "sap.m.Button",
		// 		check: function(aButtons) {
		// 			return aButtons.filter(function(oButton) {
		// 				if (oButton.getText() !== TestUtil.getTextFromResourceBundle("sap.m", "P13NDIALOG_CANCEL")) {
		// 					return false;
		// 				}
		// 				oCancelButton = oButton;
		// 				return true;
		// 			});
		// 		},
		// 		success: function() {
		// 			oCancelButton.$().trigger("tap");
		// 		}
		// 	});
		// },

		iPressOkButton: function() {
			var oOKButton;
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.some(function(oButton) {
						if (oButton.getText() === TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.OK")) {
							oOKButton = oButton;
							return true;
						}
					});
				},
				success: function() {
					Opa5.assert.ok(oOKButton, "'OK' button found");
					oOKButton.$().trigger("tap");
				},
				errorMessage: "Did not find the 'OK' button"
			});
		},

		iChangeSortSelection: function(sTextOld, sTextNew) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				matchers: new PropertyStrictEquals({
					name: "value",
					value: sTextOld
				}),
				actions: new Press(),
				success: function(aComboBoxes) {
					Opa5.assert.equal(aComboBoxes.length, 1, "SortSelections Combobox found");
					this.waitFor({
						controlType: "sap.ui.core.Item",
						matchers: [
							new Ancestor(aComboBoxes[0]), new Properties({
								text: sTextNew
							})
						],
						actions: new Press(),
						success: function(aCoreItems) {
							Opa5.assert.equal(aCoreItems[0].getText(), sTextNew, "SortSelection changed to '" + sTextNew + "'");
						},
						errorMessage: "Cannot select '" + sTextNew + "' from SortSelections Combobox"
					});
				}
			});
		},
		iChangeGroupSelection: function(sTextOld, sTextNew) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				matchers: new PropertyStrictEquals({
					name: "value",
					value: sTextOld
				}),
				actions: new Press(),
				success: function(aComboBoxes) {
					Opa5.assert.equal(aComboBoxes.length, 1, "GroupSelections Combobox found");
					this.waitFor({
						controlType: "sap.ui.core.Item",
						matchers: [
							new Ancestor(aComboBoxes[0]), new Properties({
								text: sTextNew
							})
						],
						actions: new Press(),
						success: function(aCoreItems) {
							Opa5.assert.equal(aCoreItems[0].getText(), sTextNew, "GroupSelection changed to '" + sTextNew + "'");
						},
						errorMessage: "Cannot select '" + sTextNew + "' from GroupSelections Combobox"
					});
				}
			});
		},
		iChangeFilterSelectionToDate: function(sDate) {
			return this.waitFor({
				controlType: "sap.m.DatePicker",
				success: function(aDatePickers) {
					var oDatePicker = aDatePickers[0];
					oDatePicker.setValue(sDate);
				}
			});
		},

		// iChangeComboBoxWithChartTypeTo: function(sChartTypeText) {
		// 	return this.waitFor({
		// 		controlType: "sap.m.ComboBox",
		// 		matchers: new PropertyStrictEquals({
		// 			name: "placeholder",
		// 			value: TestUtil.getTextFromResourceBundle("sap.m", "COLUMNSPANEL_CHARTTYPE")
		// 		}),
		// 		actions: new Press(),
		// 		success: function(aComboBoxes) {
		// 			Opa5.assert.equal(aComboBoxes.length, 1, "ChartType Combobox found");
		// 			this.waitFor({
		// 				controlType: "sap.ui.core.Item",
		// 				matchers: [
		// 					new Ancestor(aComboBoxes[0]), new Properties({
		// 						text: sChartTypeText
		// 					})
		// 				],
		// 				actions: new Press(),
		// 				success: function(aCoreItems) {
		// 					Opa5.assert.equal(aCoreItems[0].getText(), sChartTypeText, "ChartType changed to '" + sChartTypeText + "'");
		// 				},
		// 				errorMessage: "Cannot select '" + sChartTypeText + "' from ChartType Combobox"
		// 			});
		// 		}
		// 	});
		// },

		// iChangeRoleOfColumnTo: function(sColumnName, sRole) {
		// this.waitFor({
		// controlType: "sap.m.ColumnListItem",
		// });
		// return this.waitFor({
		// controlType: "sap.m.Select",
		// matchers: new PropertyStrictEquals({
		// name: "text",
		// value: "Category"//TestUtil.getTextFromResourceBundle("sap.m", "COLUMNSPANEL_CHARTTYPE")
		// }),
		// actions: new EnterText({
		// text: sRole
		// })
		// // success: function(aSelects) {
		// // var aSelect = aSelects.filter(function(oSelect) {
		// // return oSelect.getParent().getCells()[0].getText() === sColumnName;
		// // });
		// // Opa5.assert.equal(aSelect.length, 1);
		// // aSelect[0].getFocusDomRef().value = sRole;
		// // // sap.ui.qunit.QUnitUtils.triggerEvent("input", oT);
		// // aSelect[0].$().trigger("tap");
		// // // oSelect.onSelectionChange();
		// // }
		// });
		// },

		iPressBackButton: function() {
			var oBackButton;
			return this.waitFor({
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.filter(function(oButton) {
						if (oButton.getType() !== "Back") {
							return false;
						}
						oBackButton = oButton;
						return true;
					});
				},
				success: function() {
					oBackButton.$().trigger("tap");
				}
			});
		},

		// iSetDataSuiteFormat: function(sControlType, oDataSuiteFormat) {
		// 	return this.waitFor({
		// 		controlType: sControlType,
		// 		success: function(aControls) {
		// 			Opa5.assert.equal(aControls.length, 1, "'" + sControlType + "' has been found");
		// 			aControls[0].setUiState(new UIState({
		// 				presentationVariant: oDataSuiteFormat
		// 			}));
		// 		}
		// 	});
		// },

		// iSelectVariant: function(sVariantName) {
		// 	return this.waitFor({
		// 		controlType: "sap.ui.comp.smartvariants.SmartVariantManagement",
		// 		matchers: new PropertyStrictEquals({
		// 			name: "defaultVariantKey",
		// 			value: "*standard*"
		// 		}),
		// 		actions: new Press(),
		// 		success: function(aSmartVariantManagements) {
		// 			Opa5.assert.equal(aSmartVariantManagements.length, 1, "SmartVariantManagement found");
		// 			// var aVariantItem = aSmartVariantManagements[0].getVariantItems().filter(function(oVariantItem) {
		// 			// return oVariantItem.getText() === sVariantName;
		// 			// });
		// 			// Opa5.assert.equal(aVariantItem.length, 1, "Variant '" + sVariantName + "' found");
		// 			this.waitFor({
		// 				controlType: "sap.ui.comp.variants.VariantItem",
		// 				matchers: [
		// 					new Ancestor(aSmartVariantManagements[0]), new Properties({
		// 						// key: aVariantItem[0].getKey()
		// 						text: sVariantName
		// 					})
		// 				],
		// 				actions: new Press(),
		// 				errorMessage: "Cannot select '" + sVariantName + "' from VariantManagement"
		// 			});
		// 		},
		// 		errorMessage: "Could not find SmartVariantManagement"
		// 	});
		// },

		// iSaveVariantAs: function(sVariantNameOld, sVariantNameNew) {
		// 	return this.waitFor({
		// 		controlType: "sap.ui.comp.smartvariants.SmartVariantManagement",
		// 		matchers: new PropertyStrictEquals({
		// 			name: "defaultVariantKey",
		// 			value: "*standard*"
		// 		}),
		// 		actions: new Press(),
		// 		success: function(aSmartVariantManagements) {
		// 			Opa5.assert.equal(aSmartVariantManagements.length, 1, "SmartVariantManagement found");
		// 			this.waitFor({
		// 				controlType: "sap.m.Button",
		// 				matchers: new PropertyStrictEquals({
		// 					name: "text",
		// 					value: TestUtil.getTextFromResourceBundle("sap.ui.comp", "VARIANT_MANAGEMENT_SAVEAS")
		// 				}),
		// 				actions: new Press(),
		// 				success: function(aButtons) {
		// 					Opa5.assert.equal(aButtons.length, 1, "'Save As' button found");
		// 					this.waitFor({
		// 						controlType: "sap.m.Input",
		// 						matchers: new PropertyStrictEquals({
		// 							name: "value",
		// 							value: sVariantNameOld
		// 						}),
		// 						actions: new sap.ui.test.actions.EnterText({
		// 							text: sVariantNameNew
		// 						}),
		// 						success: function(aInputs) {
		// 							Opa5.assert.ok(aInputs[0].getValue() === sVariantNameNew, "Input value is set to '" + sVariantNameNew + "'");
		// 							this.waitFor({
		// 								controlType: "sap.m.Button",
		// 								matchers: new PropertyStrictEquals({
		// 									name: "text",
		// 									value: TestUtil.getTextFromResourceBundle("sap.ui.comp", "VARIANT_MANAGEMENT_OK")
		// 								}),
		// 								actions: new Press(),
		// 								success: function(aButtons) {
		// 									Opa5.assert.equal(aButtons.length, 1, "'OK' button found");
		// 								}
		// 							});
		// 						}
		// 					});
		// 				},
		// 				errorMessage: "Cannot find 'Save As' button on VariantManagement"
		// 			});
		// 		},
		// 		errorMessage: "Could not find SmartVariantManagement"
		// 	});
		// },

		iExcludeColumnKeysOnControl: function(aColumnKeys, sControlType) {
			return this.waitFor({
				controlType: sControlType,
				success: function(aControls) {
					Opa5.assert.equal(aControls.length, 1);
					aControls[0].deactivateColumns(aColumnKeys);
				}
			});
		},

		iFreezeColumn: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "'sap.ui.table.Table' found");
					var aColumn = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getLabel().getText() === sColumnName;
					});
					Opa5.assert.equal(aColumn.length, 1, "Column '" + sColumnName + "' found");
					Opa5.assert.equal(aColumn[0].getVisible(), true, "Column '" + sColumnName + "' is visible");
					var aVisibleColumns = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getVisible() === true;
					});
					aTables[0].setFixedColumnCount(aVisibleColumns.indexOf(aColumn[0]) + 1);
					Opa5.assert.ok(aVisibleColumns.indexOf(aColumn[0]) > -1, true, "Column '" + sColumnName + "' is fixed on position " + (aVisibleColumns.indexOf(aColumn[0]) + 1));
				}
			});
		},

		iPressOnDrillUpButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://drill-up"
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'DrillUp' button found");
				},
				errorMessage: "DrillUp button could not be found"
			});
		},
		iPressOnDrillDownButton: function(sDimensionName) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://drill-down"
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'DrillDown' button found");
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						// Retrieve all list items in the table
						matchers: [
							function(oStandardListItem) {
								return oStandardListItem.getTitle() === sDimensionName;
							}
						],
						actions: new Press(),
						success: function(aStandardListItems) {
							Opa5.assert.equal(aStandardListItems.length, 1);
							Opa5.assert.equal(aStandardListItems[0].getTitle(), sDimensionName, "List item '" + sDimensionName + "' has been found");
						},
						errorMessage: "Dimension '" + sDimensionName + "' could not be found in the list"
					});
				},
				errorMessage: "DrillDown button could not be found"
			});
		},

		iPressOnMoveToBottomButton: function() {
			return this.waitFor({
				controlType: "sap.m.OverflowToolbarButton",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://expand-group"
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'Move to Botton' button found");
				},
				errorMessage: "'Move To Botton' button could not be found"
			});
		},
		iPressOnMoveToTopButton: function() {
			return this.waitFor({
				controlType: "sap.m.OverflowToolbarButton",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://collapse-group"
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'Move to Top' button found");
				},
				errorMessage: "'Move to Top' button could not be found"
			});
		},
		iClickOnLink: function(sText) {
			return this.waitFor({
				controlType: "sap.m.Link",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				actions: new Press(),
				success: function(aLinks) {
					Opa5.assert.equal(aLinks.length, 1, "One link found");
				}
			});
		},
		iPressOnControlWithText: function(sControlType, sText) {
			return this.waitFor({
				id: this.getContext()[sText],
				controlType: sControlType,
				actions: new Press(),
				errorMessage: "The given control was not pressable"
			});
		},
		iPressOnStartRtaButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://wrench"
				}),
				actions: new Press()
			});
		},
		iWaitUntilTheBusyIndicatorIsGone: function(sId) {
			return this.waitFor({
				id: sId,
				check: function(oRootView) {
					return !!oRootView && oRootView.getBusy() === false;
				},
				success: function() {
					Opa5.assert.ok(true, "the App is not busy anymore");
				},
				errorMessage: "The app is still busy.."
			});
		},
		// iRightClickOnLinkInElementOverlay: function(sText) {
		// 	return this.waitFor({
		// 		controlType: "sap.ui.dt.ElementOverlay",
		// 		matchers: function(oElementOverlay) {
		// 			return (oElementOverlay.getElementInstance().getMetadata().getElementName() === "sap.ui.comp.navpopover.SmartLink" && oElementOverlay.getElementInstance().getText() === sText) || (oElementOverlay.getElementInstance().getMetadata().getElementName() === "sap.m.ObjectIdentifier" && oElementOverlay.getElementInstance().getTitle() === sText);
		// 		},
		// 		success: function(aElementOverlays) {
		// 			Opa5.assert.equal(aElementOverlays.length, 1, "One ElementOverlay corresponding to the link with text '" + sText + "' found.");
		// 			aElementOverlays[0].$().triggerHandler('contextmenu');
		// 		},
		// 		errorMessage: "Did not find the ElementOverlay '" + sText + "'"
		// 	});
		// },
		iPressOnSettingsOfContextMenu: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "CTX_SETTINGS")
				}),
				actions: new Press(),
				errorMessage: "The Settings of context menu was not pressable"
			});
		},
		iPressOnRtaResetButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "BTN_RESTORE")
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'Reset' button found");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "BTN_FREP_OK")
						}),
						actions: new Press(),
						success: function(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'OK' button of the warning dialog found");
						}
					});
				}
			});
		},

		iPressOnRtaSaveButton: function(bWithReload) {
			var oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: function(oButton) {
					return oButton.$().closest(".sapUiRtaToolbar").length > 0 && oButton.getProperty("text") === oResources.getText("BTN_EXIT");
				},
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'Save & Exit' button found");
					if (bWithReload) {
						this.waitFor({
							controlType: "sap.m.Button",
							matchers: new PropertyStrictEquals({
								name: "text",
								value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "BUTTON_RELOAD_NEEDED")
							}),
							actions: new Press(),
							success: function(aButtons) {
								Opa5.assert.equal(aButtons.length, 1, "'Reload' button of the info dialog found");
							}
						});
					}
				}
			});
		},
		iConfirmTheNavigation: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function(aDialogs) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(aDialogs[0]),
							new PropertyStrictEquals({
								name: "text",
								value: "Navigate"
							})
						],
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Navigation confirmed");
						}
					});
				}
			});
		},
		iCancelTheNavigation: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function(aDialogs) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(aDialogs[0]),
							new PropertyStrictEquals({
								name: "text",
								value: "Cancel"
							})
						],
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Navigation canceled ");
						}
					});
				}
			});
		},
		iSelectAllLinks: function(bSelectAll) {
			return this.waitFor({
				controlType: "sap.m.CheckBox",
				matchers: function(oCheckBox) {
					return oCheckBox.getSelected() !== bSelectAll && oCheckBox.getId().endsWith("-sa");
				},
				actions: new Press()
			});
		}
	});

	return Action;
}, true);
