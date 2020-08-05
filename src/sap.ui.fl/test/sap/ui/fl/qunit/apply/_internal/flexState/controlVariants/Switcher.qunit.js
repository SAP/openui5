/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/sinon-4"
], function(
	_pick,
	VariantManagementState,
	Switcher,
	Reverter,
	JsControlTreeModifier,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	QUnit.dump.maxDepth = 20;

	QUnit.module("Given Switcher.switchVariant()", {
		beforeEach: function() {
			this.oVariantsMap = {
				type: "variantsMap"
			};

			this.oChangesMap = {
				mChanges: {
					control1: [{
						getId: function() {
							return "change1";
						},
						id: "change1"
					}],
					control2: [{
						getId: function() {
							return "change2";
						},
						id: "change2"
					}, {
						getId: function() {
							return "change3";
						},
						id: "change3"
					}]
				}
			};
			this.aSourceVariantChanges = [this.oChangesMap.mChanges.control1[0], this.oChangesMap.mChanges.control2[1]];
			this.aTargetControlChangesForVariant = [this.oChangesMap.mChanges.control2[0]];
			this.oFlexController = {
				_oChangePersistence: {
					getChangesMapForComponent: function() {
						return this.oChangesMap;
					}.bind(this)
				},
				getComponentName: function() {
					return "componentName";
				},
				applyVariantChanges: sandbox.stub()
			};
			this.oAppComponent = {type: "appComponent"};

			this.mPropertyBag = {
				vmReference: "variantManagementReference",
				currentVReference: "currentVariantReference",
				newVReference: "newVariantReference",
				flexController: this.oFlexController,
				appComponent: this.oAppComponent,
				modifier: JsControlTreeModifier
			};

			sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			sandbox.stub(VariantManagementState, "getContent").returns(this.oVariantsMap);
			sandbox.stub(VariantManagementState, "setCurrentVariant");
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs(Object.assign(
					_pick(this.mPropertyBag, ["vmReference"]), {
						variantsMap: this.oVariantsMap,
						vReference: this.mPropertyBag.currentVReference,
						changeInstance: true
					}
				))
				.returns(this.aSourceVariantChanges)
				.withArgs(Object.assign(
					_pick(this.mPropertyBag, ["vmReference"]), {
						variantsMap: this.oVariantsMap,
						vReference: this.mPropertyBag.newVReference,
						changeInstance: true
					}
				))
				.returns(this.aTargetControlChangesForVariant);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called", function(assert) {
			return Switcher.switchVariant(this.mPropertyBag)
				.then(function() {
					assert.ok(Reverter.revertMultipleChanges.calledWith(this.aSourceVariantChanges.reverse(), this.mPropertyBag), "then revert of changes was correctly triggered");
					assert.ok(this.oFlexController.applyVariantChanges.calledWith(this.aTargetControlChangesForVariant, this.oAppComponent), "then apply of changes was correctly triggered");
					assert.ok(VariantManagementState.setCurrentVariant.calledWith(this.mPropertyBag), "then setting current variant was correctly triggered");
				}.bind(this));
		});

		QUnit.test("when called and and there is an error in evaluating changes", function(assert) {
			VariantManagementState.getContent.throws();
			return Switcher.switchVariant(this.mPropertyBag)
				.catch(function() {
					assert.equal(Reverter.revertMultipleChanges.callCount, 0, "then revert of changes was not called");
					assert.equal(this.oFlexController.applyVariantChanges.callCount, 0, "then apply of changes was not called");
					assert.equal(VariantManagementState.setCurrentVariant.callCount, 0, "then setting current variant was not called");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});