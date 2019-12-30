/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/P13nOperationsHelper"
], function(
	qutils,
	P13nOperationsHelper
) {
	"use strict";

	QUnit.module("Properties", {
		beforeEach: function() {
			this.oOH = new P13nOperationsHelper();
		},
		afterEach: function() {
			this.oOH = null;
		}
	});

	QUnit.test("getIncludeTypes", function (assert) {
		// Assert
		assert.strictEqual(
			this.oOH.getIncludeTypes().join(","),
			"default,string,date,time,datetime,numeric,numc,boolean",
			"Types should match"
		);
	});

	QUnit.test("getExcludeTypes", function (assert) {
		// Assert
		assert.strictEqual(
			this.oOH.getExcludeTypes().join(","),
			"default",
			"Types should match"
		);

		// Act
		this.oOH.setUseExcludeOperationsExtended();

		// Assert
		assert.strictEqual(
			this.oOH.getExcludeTypes().join(","),
			"default,string,date,time,datetime,numeric,numc,boolean",
			"Types should match"
		);
	});

	QUnit.test("getIncludeOperationsByType", function (assert) {
		// Assert
		assert.strictEqual(
			this.oOH.getIncludeOperationsByType().join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Default operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("string").join(","),
			"Contains,EQ,BT,StartsWith,EndsWith,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("date").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("time").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("datetime").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("numeric").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("numc").join(","),
			"Contains,EQ,BT,EndsWith,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getIncludeOperationsByType("boolean").join(","),
			"EQ",
			"Operations should match"
		);
	});

	QUnit.test("getExcludeOperationsByType", function (assert) {
		// Assert
		assert.strictEqual(
			this.oOH.getExcludeOperationsByType().join(","),
			"EQ",
			"Default operations should match"
		);

		// Act
		this.oOH.setUseExcludeOperationsExtended();

		// Assert
		assert.strictEqual(
			this.oOH.getExcludeOperationsByType().join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Default operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("string").join(","),
			"Contains,EQ,BT,StartsWith,EndsWith,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("date").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("time").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("datetime").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("numeric").join(","),
			"EQ,BT,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("numc").join(","),
			"Contains,EQ,BT,EndsWith,LT,LE,GT,GE",
			"Operations should match"
		);

		assert.strictEqual(
			this.oOH.getExcludeOperationsByType("boolean").join(","),
			"EQ",
			"Operations should match"
		);
	});

});