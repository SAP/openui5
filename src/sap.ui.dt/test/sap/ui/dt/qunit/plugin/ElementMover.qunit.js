/* global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.ui.comp.smartform.SmartForm");
jQuery.sap.require("sap.ui.comp.smartform.GroupElement");
jQuery.sap.require("sap.ui.comp.smartform.Group");
jQuery.sap.require("sap.ui.dt.plugin.ElementMover");

(function() {
	"use strict";

	QUnit.module("Given smartform groups and groupElements", {
		beforeEach : function(assert) {
			this.oSmartForm1 = new sap.ui.comp.smartform.SmartForm("form1", {
				groups : [
					new sap.ui.comp.smartform.Group("group1"),
					new sap.ui.comp.smartform.Group("group2")
				]
			});

			this.oGroup1 = sap.ui.getCore().byId("group1");
			this.oGroup2 = sap.ui.getCore().byId("group2");
			this.oElementMover = new sap.ui.dt.plugin.ElementMover();

			this.oSmartForm1.placeAt("test-view");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function(assert) {
			this.oSmartForm1.destroy();
		}
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the aggregation property of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({aggregation: "formElements"}, {aggregation: "formElements"}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the aggregation property of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({aggregation: "formElements"}, {aggregation: "content"}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the index of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({index: 0}, {index: 0}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the index of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({index: 0}, {index: 1}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the parent of GroupElement is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({parent: this.oGroup1}, {parent: this.oGroup1}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the parent of GroupElement is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({parent: this.oGroup1}, {parent: this.oGroup2}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicAggregation aggregation property of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicAggregation: "formElements"}, {publicAggregation: "formElements"}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicAggregation property of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicAggregation: "formElements"}, {publicAggregation: "content"}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicParent of GroupElement is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicParent: this.oGroup1}, {publicParent: this.oGroup1}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicParent of GroupElement is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicParent: this.oGroup1}, {publicParent: this.oGroup2}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when all the properties of source and target are same", function(assert) {

		var oSource = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		var oTarget = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		assert.strictEqual(this.oElementMover._compareSourceAndTarget(oSource, oTarget), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when one of the properties of source and target is not same", function(assert) {

		var oSource = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		var oTarget = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup2,
			publicAggregation: "formElements",
			publicParent: this.oGroup2
		};

		assert.strictEqual(this.oElementMover._compareSourceAndTarget(oSource, oTarget), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

})();
