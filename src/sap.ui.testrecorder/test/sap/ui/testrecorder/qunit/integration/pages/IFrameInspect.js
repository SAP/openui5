sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/qunit/integration/pages/Common",
	"sap/ui/testrecorder/fixture/treeAPI",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/actions/Press",
	"sap/ui/testrecorder/Dialects"
], function(Opa5, Common, testTreeAPI, AggregationLengthEquals, Properties, Ancestor, Descendant, Press, Dialects) {
	"use strict";

	Opa5.createPageObjects({
		onTheIFrameInspectPage: {
			baseClass: Common,
			actions: {
				iSelectDialect: function (sDialect) {
					this.waitFor({
						asyncPolling: true,
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Select"
							});
						},
						actions: new Press("arrow"),
						success: function () {
							return this.waitFor({
								asyncPolling: true,
								matchers: function () {
									return Opa5.getContext()._getRecorderControls({
										controlType: "sap.ui.core.Item",
										matchers: new Properties({
											key: sDialect
										})
									});
								},
								actions: new Press(),
								errorMessage: "Cannot select the " + sDialect + " dropdown item"
							});
						},
						errorMessage: "Cannot open the dialect dropdown items"
					});
				},
				iOpenTheSettingsDialog: function () {
					this.waitFor({
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.ui.core.Icon",
								matchers: new Properties({
									src: "sap-icon://settings"
								})
							});
						},
						actions: new Press(),
						errorMessage: "Cannot open the settings dialog"
					});
				},
				iSelectViewIdPreference: function () {
					return this.iSelectSettingCheckBox("Prefer View ID over Global ID", "viewId");
				},
				iSelectPOMethodPreference: function () {
					return this.iSelectSettingCheckBox("Show Snippets in Page Object Methods", "formatAsPoMethod");
				},
				iSelectSettingCheckBox: function (sLabel, sPreference) {
					this.waitFor({
						asyncPolling: true,
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.CheckBox",
								searchOpenDialogs: true,
								matchers: new Properties({
									text: sLabel
								})
							});
						},
						actions: new Press(),
						success: function () {
							return this.waitFor({
								asyncPolling: true,
								matchers: function () {
									return Opa5.getContext()._getRecorderControls({
										controlType: "sap.m.Button",
										matchers: new Properties({
											text: "Close"
										})
									});
								},
								actions: new Press(),
								errorMessage: "Cannot press the close button"
							});
						},
						errorMessage: "Cannot change the " + sPreference + " preference"
					});
				},
				iClearSnippets: function () {
					this.waitFor({
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Button",
								properties: {
									text: "Clear"
								}
							});
						},
						actions: new Press(),
						errorMessage: "Cannot press the clear snippets button"
					});
				},
				iSwitchMultiple: function () {
					this.waitFor({
						asyncPolling: true,
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Switch"
							});
						},
						actions: new Press(),
						errorMessage: "Cannot press the switch for multi snippets"
					});
				},
				iAssertProperty: function (sText) {
					this.waitFor({
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Text",
								matchers: new Properties({
									text: sText
								})
							});
						},
						success: function (aText) {
							this.waitFor({
								matchers: function () {
									return Opa5.getContext()._getRecorderControls({
										controlType: "sap.m.ColumnListItem",
										matchers: new Descendant(aText[0])
									});
								},
								success: function (aItems) {
									this.waitFor({
										matchers: function () {
											return Opa5.getContext()._getRecorderControls({
												controlType: "sap.ui.core.Icon",
												matchers: [
													new Ancestor(aItems[0]),
													new Properties({
														src: "sap-icon://add-process"
													})
												]
											});
										},
										actions: new Press(),
										errorMessage: "Cannot find property icon"
									});
								},
								errorMessage: "Cannot find property"
							});
						}
					});
				}
			},
			assertions: {
				iShouldSeeItemCodeSnippet: function (sId, sDialect, sAction) {
					sDialect = sDialect || Dialects.UIVERI5;
					sAction = sAction || "Highlight";
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						asyncPolling: true,
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.ui.codeeditor.CodeEditor",
								matchers: [
									new Properties({
										value: mData.snippet[sDialect][sAction],
										type: "javascript"
									})
								]
							});
						},
						success: function (aTables) {
							Opa5.assert.ok(true, "Code snippet is visible");
						},
						errorMessage: "Cannot find snippets"
					});
				},
				iShouldSeeItemOwnProperties: function (sId) {
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Table",
								matchers: [
									new AggregationLengthEquals({
										name: "items",
										length: mData.properties.ownTotalCount
									}),
									new Properties({
										headerText: "Own"
									})
								]
							});
						},
						success: function (aTables) {
							Opa5.assert.ok(true, "Own Properties table is filled");
							return this.waitFor({
								matchers: function () {
									return Opa5.getContext()._getRecorderControls({
										controlType: "sap.m.Text",
										matchers: [
											new Properties({
												text: mData.properties.own[0].value
											}),
											new Ancestor(aTables[0])
										]
									});
								},
								success: function () {
									Opa5.assert.ok(true, "Own property value is visible");
								},
								errorMessage: "Cannot find own property value"
							});
						},
						errorMessage: "Cannot find own properties table"
					});
				},
				iShouldSeeItemProperty: function (sProperty, sValue) {
					this.waitFor({
						matchers: function () {
							return Opa5.getContext()._getRecorderControls({
								controlType: "sap.m.Text",
								matchers: new Properties({
									text: sProperty
								})
							});
						},
						success: function (aTextWithProperty) {
							Opa5.assert.ok(true, "There is a property " + sProperty);
							// the text can be in either table - own or inherited props
							this.waitFor({
								matchers: function () {
									return Opa5.getContext()._getRecorderControls({
										controlType: "sap.m.Table",
										matchers: new Descendant(aTextWithProperty[0])
									});
								},
								success: function (aTables) {
									this.waitFor({
										matchers: function () {
											return Opa5.getContext()._getRecorderControls({
												controlType: "sap.m.Text",
												matchers: [
													new Properties({
														text: sValue
													}),
													new Ancestor(aTables[0])
												]
											});
										},
										success: function () {
											Opa5.assert.ok(true, "There is a property " + sProperty + " with value " + sValue + " for the selected control");
										},
										errorMessage: "The selected item doesn't have a property " + sProperty + " with value " + sValue
									});
								}
							});
						}
					});
				}
			}
		}
	});
});
