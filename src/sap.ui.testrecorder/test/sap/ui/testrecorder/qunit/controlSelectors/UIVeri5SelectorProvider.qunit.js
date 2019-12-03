/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/test/RecordReplay",
	"sap/ui/testrecorder/controlSelectors/UIVeri5SelectorGenerator"
], function (RecordReplay, UIVeri5SelectorGenerator) {
	"use strict";

	QUnit.module("UIVeri5SelectorGenerator", {
		beforeEach: function () {
			this.fnGetSelector = sinon.stub(RecordReplay, "findControlSelectorByDOMElement");
			var testElement = document.createElement("div");
			testElement.id = "DomElement";
			document.getElementById("qunit-fixture").append(testElement);
		},
		afterEach: function () {
			UIVeri5SelectorGenerator.emptyCache();
			this.fnGetSelector.restore();
		}
	});

	QUnit.test("Should get control selector", function (assert) {
		var fnDone = assert.async();
		this.fnGetSelector.returns(Promise.resolve({
			mySelector: "test"
		}));
		UIVeri5SelectorGenerator.getSelector({
			domElement: "DomElement"
		}).then(function (oSelector) {
			assert.strictEqual(oSelector.mySelector, "test", "Should resolve with the selector value");
		}).finally(fnDone);
	});

	QUnit.test("Should memoize control selector", function (assert) {
		var fnDone = assert.async();
		var mMemoized = {
			domElement: "DomElement"
		};
		this.fnGetSelector.returns(Promise.resolve({
			mySelector: "test"
		}));
		UIVeri5SelectorGenerator.getSelector(mMemoized).then(function (oSelector) {
			assert.ok(this.fnGetSelector.calledOnce, "Should generate selector first time");
			assert.strictEqual(oSelector.mySelector, "test", "Should resolve with the selector value");
			return UIVeri5SelectorGenerator.getSelector(mMemoized);
		}.bind(this)).then(function (oSelector) {
			assert.ok(this.fnGetSelector.calledOnce, "Should not generate selector second time");
			assert.strictEqual(oSelector.mySelector, "test", "Should resolve with the selector value");
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should get error message when no control selector is generated", function (assert) {
		var fnDone = assert.async();
		this.fnGetSelector.returns(Promise.reject({
			error: "test"
		}));
		UIVeri5SelectorGenerator.getSelector({
			domElement: "DomElement"
		}).catch(function (oSelector) {
			assert.strictEqual(oSelector.error, "test", "Should reject with error message");
		}).finally(fnDone);
	});

});
