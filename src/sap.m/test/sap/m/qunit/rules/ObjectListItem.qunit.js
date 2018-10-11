/*global QUnit */

sap.ui.define([
		"sap/m/Page",
		"sap/m/ObjectListItem",
		"sap/m/ObjectMarker",
		"test-resources/sap/ui/support/TestHelper"
], function (Page, ObjectListItem, ObjectMarker, testRule)  {
		"use strict";

		QUnit.module("ObjectListItem markers aggregation with markFlagged: true", {
			setup: function () {
				this.page = new Page("objectListItemContext", {
					content: new ObjectListItem({
						markers: new ObjectMarker(),
						markFlagged: true
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			teardown: function () {
				this.page.destroy();
			}
		});

		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectListItemContext",
			libName: "sap.m",
			ruleId: "objectListItemMarkers",
			expectedNumberOfIssues: 1
		});

		QUnit.module("ObjectListItem markers aggregation with markFavorite: true", {
			setup: function () {
				this.page = new Page("objectListItemContext", {
					content: new ObjectListItem({
						markers: new ObjectMarker(),
						markFavorite: true
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			teardown: function () {
				this.page.destroy();
			}
		});

		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectListItemContext",
			libName: "sap.m",
			ruleId: "objectListItemMarkers",
			expectedNumberOfIssues: 1
		});
	});
