/*global QUnit */

sap.ui.define([
		"sap/m/Page",
		"sap/m/ObjectListItem",
		"sap/m/ObjectMarker",
		"test-resources/sap/ui/support/TestHelper"
], function (Page, ObjectListItem, ObjectMarker, testRule)  {
		"use strict";

		/**
		 * @deprecated as of version 1.16,<code>markFlagged</code> has been replaced by <code>markers</code> aggregation
		 */
		QUnit.module("ObjectListItem markers aggregation with markFlagged: true", {
			beforeEach: function () {
				this.page = new Page("objectListItemContext", {
					content: new ObjectListItem({
						markers: new ObjectMarker(),
						markFlagged: true
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			afterEach: function () {
				this.page.destroy();
			}
		});

		/**
		 * @deprecated as of version 1.16,<code>markFlagged</code> has been replaced by <code>markers</code> aggregation
		 */
		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectListItemContext",
			libName: "sap.m",
			ruleId: "objectListItemMarkers",
			expectedNumberOfIssues: 1
		});

		/**
		 * @deprecated as of version 1.16,<code>markFavorite</code> has been replaced by <code>markers</code> aggregation
		 */
		QUnit.module("ObjectListItem markers aggregation with markFavorite: true", {
			beforeEach: function () {
				this.page = new Page("objectListItemContext", {
					content: new ObjectListItem({
						markers: new ObjectMarker(),
						markFavorite: true
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			afterEach: function () {
				this.page.destroy();
			}
		});

		/**
		 * @deprecated as of version 1.16,<code>markFavorite</code> has been replaced by <code>markers</code> aggregation
		 */
		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectListItemContext",
			libName: "sap.m",
			ruleId: "objectListItemMarkers",
			expectedNumberOfIssues: 1
		});
	});
