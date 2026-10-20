/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/odata/v4/ListDelegate",
	"sap/ui/mdc/ListDelegate",
	"sap/ui/mdc/List"
], function(ODataV4ListDelegate, ListDelegate, List) {
	"use strict";

	QUnit.module("updateBinding - showExtendedView", {
		beforeEach: function() {
			this.oShowExtendedViewSpy = sinon.spy();
			this.oList = {
				_oTableTitle: {
					setShowExtendedView: this.oShowExtendedViewSpy
				}
			};
			// Stub the inherited updateBinding so the test does not require a real binding/inner control.
			this.oSuperStub = sinon.stub(ListDelegate, "updateBinding");
		},
		afterEach: function() {
			this.oSuperStub.restore();
		}
	});

	QUnit.test("extends the base ListDelegate", function(assert) {
		assert.notStrictEqual(ODataV4ListDelegate, ListDelegate, "ODataV4 ListDelegate is a distinct object");
		assert.strictEqual(typeof ODataV4ListDelegate.updateBindingInfo, "function", "inherits base delegate methods");
	});

	QUnit.test("enables the extended view when selections are not cleared on filter", function(assert) {
		const oBindingInfo = {parameters: {}};
		ODataV4ListDelegate.updateBinding(this.oList, oBindingInfo);

		assert.ok(this.oShowExtendedViewSpy.calledOnceWithExactly(true), "showExtendedView(true) when $$clearSelectionOnFilter is not set");
		assert.ok(this.oSuperStub.calledOnce, "delegates to the base updateBinding");
	});

	QUnit.test("uses the compact view when selections are cleared on filter", function(assert) {
		const oBindingInfo = {parameters: {$$clearSelectionOnFilter: true}};
		ODataV4ListDelegate.updateBinding(this.oList, oBindingInfo);

		assert.ok(this.oShowExtendedViewSpy.calledOnceWithExactly(false), "showExtendedView(false) when $$clearSelectionOnFilter is set");
		assert.ok(this.oSuperStub.calledOnce, "delegates to the base updateBinding");
	});

	QUnit.test("does not fail when the title is not yet available", function(assert) {
		ODataV4ListDelegate.updateBinding({}, {parameters: {}});
		assert.ok(this.oSuperStub.calledOnce, "still delegates to the base updateBinding");
	});
});
