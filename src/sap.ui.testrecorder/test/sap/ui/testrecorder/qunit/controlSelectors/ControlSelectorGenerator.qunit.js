/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/test/RecordReplay",
	"sap/ui/testrecorder/controlSelectors/ControlSelectorGenerator"
], function (RecordReplay, ControlSelectorGenerator) {
	"use strict";

	QUnit.module("ControlSelectorGenerator", {
		beforeEach: function () {
			this.fnGetSelector = sinon.stub(RecordReplay, "findControlSelectorByDOMElement");
			var testElement = document.createElement("div");
			testElement.id = "DomElement";
			document.getElementById("qunit-fixture").append(testElement);
		},
		afterEach: function () {
			this.fnGetSelector.restore();
		}
	});

	QUnit.test("Should get control selector", function (assert) {
		var fnDone = assert.async();
		this.fnGetSelector.returns(Promise.resolve({
			mySelector: "test"
		}));
		ControlSelectorGenerator.getSelector({
			domElement: "DomElement"
		}).then(function (oSelector) {
			assert.strictEqual(oSelector.mySelector, "test", "Should resolve with the selector value");
		}).finally(fnDone);
	});

	QUnit.test("Should get error message when no control selector is generated", function (assert) {
		var fnDone = assert.async();
		this.fnGetSelector.returns(Promise.reject({
			error: "test"
		}));
		ControlSelectorGenerator.getSelector({
			domElement: "DomElement"
		}).catch(function (oSelector) {
			assert.strictEqual(oSelector.error, "test", "Should reject with error message");
		}).finally(fnDone);
	});
});
