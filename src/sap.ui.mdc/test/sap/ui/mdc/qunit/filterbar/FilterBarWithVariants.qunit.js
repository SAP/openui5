/* global QUnit, sinon*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/base/Log",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI"
], function (
	FilterBar,
	FilterBarBase,
	Log,
	VariantManagement,
	ControlVariantApplyAPI
) {
	"use strict";

	QUnit.module("FilterBar", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("check assigned variantBackreference association", function (assert) {

		let fnResolve;
		const oLoadFlexPromise = new Promise(function(resolve) {
			fnResolve = resolve;
		});

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		sinon.stub(VariantManagement.prototype, "_updateWithSettingsInfo");

		sinon.stub(FilterBarBase.prototype, "_loadFlex").callsFake(function() {
			fnResolve(ControlVariantApplyAPI);
			return oLoadFlexPromise;
		});

		const oVM = new VariantManagement();
		const oFB = new FilterBar({
			variantBackreference: oVM.getId()
		});

		return oLoadFlexPromise.then(function() {

			assert.ok(oFB._hasAssignedVariantManagement());

			oFB.destroy();
			oVM.destroy();

			assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
			assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

			ControlVariantApplyAPI.attachVariantApplied.restore();
			ControlVariantApplyAPI.detachVariantApplied.restore();

			VariantManagement.prototype._updateWithSettingsInfo.restore();
			FilterBarBase.prototype._loadFlex.restore();
		});
	});

	QUnit.test("check late assigned variant association", function (assert) {

		let fnResolve;
		const oLoadFlexPromise = new Promise(function(resolve) {
			fnResolve = resolve;
		});

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		sinon.stub(VariantManagement.prototype, "_updateWithSettingsInfo");

		sinon.stub(FilterBarBase.prototype, "_loadFlex").callsFake(function() {
			fnResolve(ControlVariantApplyAPI);
			return oLoadFlexPromise;
		});

		const oFB = new FilterBar();

		assert.ok(!oFB._hasAssignedVariantManagement());

		const oVM = new VariantManagement();
		oFB.setVariantBackreference(oVM);

		return oLoadFlexPromise.then(function() {

			assert.ok(oFB._hasAssignedVariantManagement());

			oFB.destroy();
			oVM.destroy();

			assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
			assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

			ControlVariantApplyAPI.attachVariantApplied.restore();
			ControlVariantApplyAPI.detachVariantApplied.restore();

			VariantManagement.prototype._updateWithSettingsInfo.restore();
			FilterBarBase.prototype._loadFlex.restore();
		});
	});

	QUnit.test("check assigned variant association twice", function (assert) {

		let fnResolve;
		const oLoadFlexPromise = new Promise(function(resolve) {
			fnResolve = resolve;
		});

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		sinon.stub(VariantManagement.prototype, "_updateWithSettingsInfo");

		sinon.stub(FilterBarBase.prototype, "_loadFlex").callsFake(function() {
			fnResolve(ControlVariantApplyAPI);
			return oLoadFlexPromise;
		});

		const oVM = new VariantManagement();
		const oFB = new FilterBar({
			variantBackreference: oVM.getId()
		});

		return oLoadFlexPromise.then(function() {

			assert.ok(oFB._hasAssignedVariantManagement());

			const oVM2 = new VariantManagement();

			sinon.stub(Log, "error");

			assert.ok(!Log.error.called);
			oFB.setVariantBackreference(oVM2);
			assert.ok(Log.error.calledOnce);

			Log.error.reset();

			assert.ok(oFB.getVariantBackreference(), oVM.getId());
			assert.ok(oVM === oFB._getAssignedVariantManagement());

			oVM2.destroy();
			oFB.destroy();
			oVM.destroy();

			assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
			assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

			ControlVariantApplyAPI.attachVariantApplied.restore();
			ControlVariantApplyAPI.detachVariantApplied.restore();

			VariantManagement.prototype._updateWithSettingsInfo.restore();
			FilterBarBase.prototype._loadFlex.restore();
		});
	});

});
