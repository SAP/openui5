/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press",
	"./Util",
	"sap/ui/Device",
	"./waitForP13nButtonWithMatchers",
	"./waitForP13nDialog"
], function(
	Opa5,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Properties,
	Press,
	Util,
	Device,
	waitForP13nButtonWithMatchers,
	waitForP13nDialog
) {
	"use strict";

	var oMDCBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

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

	var iPressTheOKButtonOnTheDialog = function(oDialog, oSettings) {
		return iPressAButtonOnTheDialog.call(this, oDialog, Util.texts.ok, oSettings);
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

	return {
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
		 * @returns {Promise} OPA waitFor
		 */
		iCheckFilterPersonalization: function(oControl, aConfigurations, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.filter, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.ui.mdc.p13n.panels.FilterPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aFilterPanels) {
							var oFilterPanel = aFilterPanels[0];

							aConfigurations.forEach(function(oConfig, iConfigIndex){
								this.waitFor({
									controlType: "sap.m.Label",
									matchers: {
										ancestor: oFilterPanel,
										properties: {
											text: oConfig.key
										}
									},
									success: function() {
										this.waitFor({
											id: oConfig.inputControl,
											success: function(oFilterField) {
												oFilterField.getConditions().forEach(function(oCondition, iConditionIndex){
													var vValue = aConfigurations[iConfigIndex].values[iConditionIndex];
													Opa5.assert.equal(oCondition.values[0], vValue, "Filter value " + vValue + " has been found in the FilterPanel");
												});
											}
										});
									}
								});
							}, this);

							iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
						}
					});
				}
			});
		},

		iCheckAvailableFilters: function(oControl, aAvailable, fnOpenThePersonalizationDialog) {
			fnOpenThePersonalizationDialog = fnOpenThePersonalizationDialog ? fnOpenThePersonalizationDialog : iOpenThePersonalizationDialog;
			return iPersonalize.call(this, oControl, Util.texts.filter, fnOpenThePersonalizationDialog, {
				success: function(oP13nDialog) {
					this.waitFor({
						controlType: "sap.ui.mdc.p13n.panels.FilterPanel",
						matchers: new Ancestor(oP13nDialog, false),
						success: function(aFilterPanels) {
							this.waitFor({
								controlType: "sap.m.ComboBox",
								matchers: {
									ancestor: aFilterPanels[0],
									properties: {
										placeholder: "Filter by"
									}
								},
								actions: new Press(),
								success: function() {
									aAvailable.forEach(function(sText){
										this.waitFor({
											controlType: "sap.m.StandardListItem",
											matchers: {
												properties: {
													title: sText
												}
											},
											success: function(oItem) {
												Opa5.assert.ok(oItem, "Filterable item " + sText + " has been found in the FilterPanel");
											}
										});
									}, this);
									iPressTheOKButtonOnTheDialog.call(this, oP13nDialog);
								}
							});
						}
					});
				}
			});
		}
	};

});