/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/testrecorder/inspector/ControlInspector",
	"sap/ui/testrecorder/inspector/ControlInspectorRepo",
	"sap/ui/testrecorder/controlSelectors/ControlSelectorGenerator",
	"sap/ui/testrecorder/codeSnippets/CodeSnippetProvider",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/Dialects"
], function (ControlInspector, ControlInspectorRepo, ControlSelectorGenerator, CodeSnippetProvider, CommunicationBus, Dialects) {
	"use strict";

	function asPOMethod(sSnippet) {
		return "<iDoAction>: function () {\n" + sSnippet + "\n}";
	}

	QUnit.module("ControlInspector", {
		beforeEach: function () {
			this.sTestSnippet = "element(by.control({\n" +
			"    id: \"container-cart---homeView--searchField\"\n" +
			"}));";
			this.sTestSnippetPO = "    element(by.control({\n" +
			"        id: \"container-cart---homeView--searchField\"\n" +
			"    }));";
			this.fnFindSelector = sinon.stub(ControlInspectorRepo, "findSelector");
			this.fnFindSelector.withArgs("searchField").returns({
				id: "container-cart---homeView--searchField"
			});
			this.fnGenerateSelector = sinon.stub(ControlSelectorGenerator, "getSelector");
			this.fnGenerateSelector.returns(Promise.resolve("test-selector"));
			this.fnGenerateSelector.withArgs({
				domElementId: "searchField-generate",
				settings: {
					preferViewId: false,
					formatAsPOMethod: true,
					multipleSnippets: false
				}
			}).returns(Promise.resolve({
				id: "container-cart---homeView--searchField"
			}));
			this.fnGetSnippets = sinon.stub(ControlInspectorRepo, "getSnippets");
			this.fnGetSnippets.returns([]);
			this.fnGetRequests = sinon.stub(ControlInspectorRepo, "getRequests");
			this.fnGetRequests.returns([]);
			this.fnPublish = sinon.spy(CommunicationBus, "publish");
		},
		afterEach: function () {
			this.fnFindSelector.restore();
			this.fnGenerateSelector.restore();
			this.fnGetSnippets.restore();
			this.fnGetRequests.restore();
			this.fnPublish.restore();
			//defaults
			ControlInspector.updateSettings({
				preferViewId: false,
				formatAsPOMethod: true,
				multipleSnippets: false
			});
		}
	});

	QUnit.test("Should use cached selector", function (assert) {
		var fnDone = assert.async();
		ControlInspector.getCodeSnippet({
			domElementId: "searchField"
		}).then(function () {
			assert.equal(this.fnPublish.getCalls()[0].args[1].codeSnippet, asPOMethod(this.sTestSnippetPO), "Should generate snippet");
			assert.ok(this.fnFindSelector.calledOnce, "Should use cached selector");
			assert.ok(this.fnGenerateSelector.notCalled, "Should not generate selector");
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should generate new selector when needed", function (assert) {
		var fnDone = assert.async();
		ControlInspector.getCodeSnippet({
			domElementId: "searchField-generate"
		}).then(function () {
			// 3rd call because of updateSettings in afterEach
			assert.equal(this.fnPublish.getCalls()[2].args[1].codeSnippet, asPOMethod(this.sTestSnippetPO), "Should generate snippet");
			assert.ok(this.fnFindSelector.calledOnce, "Should look for cached selector");
			assert.ok(this.fnGenerateSelector.calledOnce, "Should generate selector");
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should combine multiple snippets in a PO method", function (assert) {
		var fnDone = assert.async();
		var sPrevSnippet = "element(by.control({\n" +
		"    id: \"previous-snippet\"\n" +
		"}));";
		this.fnGetSnippets.returns([sPrevSnippet, this.sTestSnippet]);

		ControlInspector.updateSettings({multipleSnippets: true});
		ControlInspector.getCodeSnippet({
			domElementId: "searchField"
		}).then(function () {
			var sResult = this.fnPublish.getCalls()[3].args[1].codeSnippet; // skip calls made by updateSettings
			assert.equal(sResult, asPOMethod("    element(by.control({\n" +
			"        id: \"previous-snippet\"\n" +
			"    }));\n\n" + this.sTestSnippetPO));
			assert.ok(this.fnFindSelector.calledOnce, "Should use cached selector");
			assert.ok(this.fnGenerateSelector.notCalled, "Should not generate selector");
			assert.ok(this.fnGetSnippets.calledOnce, "Should collect previous snippets");
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should refresh snippets when dialect is changed", function (assert) {
		var fnStub = sinon.stub(ControlInspector, "getCodeSnippet");
		this.fnGetRequests.returns([{
			domElementId: "first"
		}, {
			domElementId: "second"
		}]);
		ControlInspector.setDialect(Dialects.OPA5);
		assert.ok(fnStub.calledTwice, "Should get snippets again");
		assert.strictEqual(fnStub.getCalls()[0].args[0].domElementId, "first");
		assert.strictEqual(fnStub.getCalls()[1].args[0].domElementId, "second");
		fnStub.restore();
	});

	QUnit.test("Should refesh snippets when settings are changed", function (assert) {
		var fnSpy = sinon.spy(ControlInspector, "getCodeSnippet");
		this.fnGetRequests.returns([{
			domElementId: "first"
		}, {
			domElementId: "second"
		}]);
		var fnProvider = sinon.stub(CodeSnippetProvider, "getSnippet");
		fnProvider.returns("test-snippet");

		ControlInspector.updateSettings({preferViewId: true});
		assert.ok(fnSpy.calledOnce, "Should get snippets again - preferViewId - single");
		assert.strictEqual(fnSpy.getCalls()[0].args[0].domElementId, "second");
		fnSpy.reset();

		ControlInspector.updateSettings({formatAsPOMethod: false});
		assert.ok(fnSpy.calledOnce, "Should get snippets again - formatAsPOMethod - single");
		assert.strictEqual(fnSpy.getCalls()[0].args[0].domElementId, "second");
		fnSpy.reset();

		ControlInspector.updateSettings({multipleSnippets: true});
		assert.ok(fnSpy.calledOnce, "Should get snippets again - multipleSelectors");
		assert.strictEqual(fnSpy.getCalls()[0].args[0].domElementId, "second");
		fnSpy.reset();

		ControlInspector.updateSettings({preferViewId: true});
		assert.ok(fnSpy.calledTwice, "Should get snippets again - preferViewId with multi");
		assert.strictEqual(fnSpy.getCalls()[0].args[0].domElementId, "first");
		assert.strictEqual(fnSpy.getCalls()[1].args[0].domElementId, "second");
		fnSpy.reset();

		ControlInspector.updateSettings({formatAsPOMethod: false});
		assert.ok(fnSpy.calledTwice, "Should get snippets again - formatAsPoMethod with multi");
		assert.strictEqual(fnSpy.getCalls()[0].args[0].domElementId, "first");
		assert.strictEqual(fnSpy.getCalls()[1].args[0].domElementId, "second");

		fnSpy.restore();
		fnProvider.restore();
	});

});
