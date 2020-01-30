sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/integration/pages/Common",
	"sap/ui/testrecorder/fixture/treeAPI",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/LabelFor",
	"sap/ui/test/actions/Press",
	"sap/ui/testrecorder/Dialects"
], function(Opa5, Common, testTreeAPI, AggregationLengthEquals, Properties, Ancestor, LabelFor, Press, Dialects) {
	"use strict";

	Opa5.createPageObjects({
		onTheIFrameInspectPage: {
			baseClass: Common,
			actions: {
				iSelectDialect: function (sDialect) {
					this.waitFor({
						matchers: function () {
							return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
								controlType: "sap.m.Select"
							});
						}.bind(this),
						actions: new Press("arrow"),
						success: function () {
							return this.waitFor({
								matchers: function () {
									return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
										controlType: "sap.ui.core.Item",
										matchers: new Properties({
											key: sDialect
										})
									});
								}.bind(this),
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
							return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
								controlType: "sap.ui.core.Icon",
								matchers: new Properties({
									src: "sap-icon://settings"
								})
							});
						}.bind(this),
						actions: new Press(),
						errorMessage: "Cannot open the settings dialog"
					});
				},
				iSelectViewIdPreference: function () {
					this.waitFor({
						matchers: function () {
							return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
								controlType: "sap.m.CheckBox",
								searchOpenDialogs: true,
								matchers: new Properties({
									text: "Prefer view ID over global ID"
								})
							});
						}.bind(this),
						actions: new Press(),
						success: function () {
							return this.waitFor({
								matchers: function () {
									return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
										controlType: "sap.m.Button",
										matchers: new Properties({
											text: "Close"
										})
									});
								}.bind(this),
								actions: new Press(),
								errorMessage: "Cannot press the close button"
							});
						},
						errorMessage: "Cannot change the viewID preference"
					});
				}
			},
			assertions: {
				iShouldSeeItemCodeSnippet: function (sId, sDialect, sAction) {
					sDialect = sDialect || Dialects.UIVERI5;
					sAction = sAction || "Highlight";
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						matchers: function () {
							return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
								controlType: "sap.ui.codeeditor.CodeEditor",
								matchers: [
									new Properties({
										value: mData.snippet[sDialect][sAction],
										type: "javascript"
									})
								]
							});
						}.bind(this),
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
							return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
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
						}.bind(this),
						success: function (aTables) {
							Opa5.assert.ok(true, "Own Properties table is filled");
							return this.waitFor({
								matchers: function () {
									return this._getRecorderInFrame().__opaPlugin__._getFilteredControls({
										controlType: "sap.m.Text",
										matchers: [
											new Properties({
												text: mData.properties.own[0].value
											}),
											new Ancestor(aTables[0])
										]
									});
								}.bind(this),
								success: function () {
									Opa5.assert.ok(true, "Own property value is visible");
								},
								errorMessage: "Cannot find own property value"
							});
						},
						errorMessage: "Cannot find own properties table"
					});
				}
			}
		}
	});
});
