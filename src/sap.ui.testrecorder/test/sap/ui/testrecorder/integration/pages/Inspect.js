sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/integration/pages/Common",
	"sap/ui/testrecorder/fixture/treeAPI",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press",
	"sap/ui/testrecorder/Dialects"
], function(Opa5, Common, testTreeAPI, AggregationLengthEquals, Properties, Ancestor, Press, Dialects) {
	"use strict";

	Opa5.createPageObjects({
		onTheInspectPage: {
			baseClass: Common,
			actions: {
				iSelectTab: function (sTab) {
					this.waitFor({
						controlType: "sap.m.IconTabFilter",
						matchers: new Properties({
							text: sTab
						}),
						actions: new Press(),
						errorMessage: "Cannot press the " + sTab + " tab"
					});
				},
				iSelectDialect: function (sDialect) {
					this.waitFor({
						controlType: "sap.m.Select",
						actions: new Press("arrow"),
						success: function () {
							return this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: new Properties({
									key: sDialect
								}),
								actions: new Press(),
								errorMessage: "Cannot select the " + sDialect + " dropdown item"
							});
						},
						errorMessage: "Cannot open the dialect dropdown items"
					});
				}
			},
			assertions: {
				iShouldSeeSelectedDialect: function (sDialect) {
					this.waitFor({
						controlType: "sap.m.Select",
						matchers: new Properties({
							selectedKey: sDialect
						}),
						success: function () {
							Opa5.assert.ok(true, "The selected dialect is " + sDialect);
						},
						errorMessage: "Cannot find the dialect dropdown"
					});
				},
				iShouldSeeItemCodeSnippet: function (sId, sDialect, sAction) {
					sDialect = sDialect || Dialects.UIVERI5;
					sAction = sAction || "Highlight";
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						controlType: "sap.ui.codeeditor.CodeEditor",
						matchers: [
							new Properties({
								value: mData.snippet[sDialect][sAction],
								type: "javascript"
							})
						],
						success: function (aTables) {
							Opa5.assert.ok(true, "Code snippet is visible");
						},
						errorMessage: "Cannot find snippets"
					});
				},
				iShouldSeeItemOwnProperties: function (sId) {
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: [
							new AggregationLengthEquals({
								name: "items",
								length: mData.properties.own.length
							}),
							new Properties({
								headerText: "Own"
							})
						],
						success: function (aTables) {
							Opa5.assert.ok(true, "Own Properties table is filled");
							this.waitFor({
								controlType: "sap.m.Text",
								matchers: [
									new Ancestor(aTables[0]),
									new Properties({
										text: mData.properties.own[0].value
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Own property value is visible");
								},
								errorMessage: "Cannot find own property value"
							});
						},
						errorMessage: "Cannot find own properties table"
					});
				},
				iShouldSeeItemInheritedProperties: function (sId) {
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: [new AggregationLengthEquals({
							name: "items",
							length: mData.properties.inherited.length
						}), new Properties({
							headerText: "Inherited"
						})],
						success: function (aTables) {
							Opa5.assert.ok(true, "Inherited Properties table is filled");
							this.waitFor({
								controlType: "sap.m.Text",
								matchers: [
									new Ancestor(aTables[0]),
									new Properties({
										text: JSON.stringify(mData.properties.inherited[0].value)
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Inherited property value is visible");
								},
								errorMessage: "Cannot find inherited property value"
							});
						},
						errorMessage: "Cannot find inherited properties table"
					});
				},
				iShouldSeeItemBindingContext: function (sId) {
					var mData = testTreeAPI.getMockData(sId);
					this.waitFor({
						controlType: "sap.m.Table",
						matchers: [
							new AggregationLengthEquals({
								name: "items",
								length: 1
							}), new Properties({
								headerText: "Binding Context"
							})
						],
						success: function (aTables) {
							Opa5.assert.ok(true, "Binding context table is filled");
							this.waitFor({
								controlType: "sap.m.Text",
								matchers: [
									new Ancestor(aTables[0]),
									new Properties({
										text: mData.bindings.context[0].path
									})
								],
								success: function () {
									Opa5.assert.ok(true, "Binding context path is visible");
								},
								errorMessage: "Cannot find binding context path"
							});
						},
						errorMessage: "Cannot find binding context table"
					});
				}
			}
		}
	});
});
