/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table"
], function(Table) {
	"use strict";

	QUnit.module("Table - DesignTime", {
		beforeEach: function() {
			this.oTableMetadata = Table.getMetadata();
			this.fnExecuteWhenDesigntimeIsLoaded = function(assert, fnExecute) {
				const fnDone = assert.async();
				this.oTableMetadata.loadDesignTime().then(function(mDesignTimeMetadata) {
					fnExecute.apply(this, [mDesignTimeMetadata, fnDone]);
				}.bind(this));
			}.bind(this);
		},
		afterEach: function() {
			this.oTableMetadata = null;
		}
	});

	QUnit.test("Properties", function(assert) {
		this.fnExecuteWhenDesigntimeIsLoaded(assert, function(mDesignTimeMetadata, fnDone) {
			assert.ok(Object.keys(mDesignTimeMetadata.properties).length > 0, "properties are defined in the DesignTime metadata");

			const aAllowedProperties = ["width", "headerLevel",
				"header", "headerVisible", "showRowCount", "threshold",
				"enableExport", "busyIndicatorDelay","enableColumnResize",
				"showPasteButton", "multiSelectMode"];

			for (const sKey in mDesignTimeMetadata.properties) {
				if (aAllowedProperties.includes(sKey)) {
					assert.strictEqual(mDesignTimeMetadata.properties[sKey].ignore, false, sKey + " is allowed for DesignTime changes");
				} else {
					assert.strictEqual(mDesignTimeMetadata.properties[sKey].ignore, true, sKey + " is ignored from DesignTime changes");
				}
			}

			fnDone();
		});
	});

	QUnit.test("Aggregations", function(assert) {
		this.fnExecuteWhenDesigntimeIsLoaded(assert, function(mDesignTimeMetadata, fnDone) {
			assert.ok(Object.keys(mDesignTimeMetadata.aggregations).length > 0, "aggregations are defined in the DesignTime metadata");

			const aAllowedAggregations = ["_content"];

			for (const sKey in mDesignTimeMetadata.aggregations) {
				if (aAllowedAggregations.includes(sKey)) {
					assert.ok(!mDesignTimeMetadata.aggregations[sKey].ignore, sKey + " is allowed for DesignTime changes");
				} else {
					assert.strictEqual(mDesignTimeMetadata.aggregations[sKey].ignore, true, sKey + " is ignored from DesignTime changes");
				}
			}

			fnDone();
		});
	});
});
