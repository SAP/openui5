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
	var sandbox = sinon.createSandbox();
	QUnit.dump.maxDepth = 20;

	QUnit.module("Given Switcher.switchVariant()", {
		beforeEach() {
			this.oChangesMap = {
				mChanges: {
					control1: [{
						getId() {
							return "change1";
						},
						id: "change1"
					}],
					control2: [{
						getId() {
							return "change2";
						},
						id: "change2"
					}, {
						getId() {
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
			sandbox.stub(VariantManagementState, "setCurrentVariant");
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
			.callThrough()
			.withArgs(Object.assign(
				_pick(this.mPropertyBag, ["vmReference"]), {
					vReference: this.mPropertyBag.currentVReference
				}
			))
			.returns(this.aSourceVariantChanges)
			.withArgs(Object.assign(
				_pick(this.mPropertyBag, ["vmReference"]), {
					vReference: this.mPropertyBag.newVReference
				}
			))
			.returns(this.aTargetControlChangesForVariant);
		},
		afterEach() {
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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});