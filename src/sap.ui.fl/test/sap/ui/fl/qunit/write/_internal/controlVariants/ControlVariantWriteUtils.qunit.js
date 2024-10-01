/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexObjectFactory,
	VariantManagementState,
	Settings,
	ControlVariantWriteUtils,
	FlexObjectManager,
	Layer,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function createFlexObjects(sReference) {
		return [
			FlexObjectFactory.createFlVariant({
				variantName: "variant1",
				id: "testVariant",
				reference: sReference,
				layer: Layer.USER
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_management_change",
				reference: sReference,
				layer: Layer.USER,
				content: {
					defaultVariant: "variant1"
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "setVisible",
				content: {
					visible: false
				},
				selector: {
					id: "variant1"
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "setTitle",
				selector: {
					id: "variant1"
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "dummyChange",
				variantReference: "variant1"
			})
		];
	}

	QUnit.module("Utils", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when deleteVariant is called and condensing is enabled", (assert) => {
			sandbox.stub(Settings, "getInstanceOrUndef").callsFake(() => {
				return {
					isCondensingEnabled: () => true,
					getUserId: () => "testUser"
				};
			});
			const sReference = "appReference";
			const sVMReference = "vmReference";
			const sVariantReference = "variantReference";
			const mExpectedPropertyBag = {
				reference: sReference,
				vmReference: sVMReference,
				vReference: sVariantReference
			};

			const [
				oVariant,
				oVMChange,
				oSetVisibleVariantChange,
				oSetTitleVariantChange,
				oVMDependentChange
			] = createFlexObjects(sReference);
			sandbox.stub(VariantManagementState, "getVariant").withArgs(mExpectedPropertyBag).returns({instance: oVariant});
			sandbox.stub(VariantManagementState, "getVariantManagementChanges").withArgs(mExpectedPropertyBag).returns([oVMChange]);
			sandbox.stub(
				VariantManagementState,
				"getVariantChangesForVariant"
			).withArgs(mExpectedPropertyBag).returns([oSetVisibleVariantChange, oSetTitleVariantChange]);
			sandbox.stub(
				VariantManagementState,
				"getControlChangesForVariant"
			).withArgs(mExpectedPropertyBag).returns([oVMDependentChange]);

			const aAllChanges = [oVariant, oVMChange, oSetVisibleVariantChange, oSetTitleVariantChange, oVMDependentChange];
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const aDeletedChanges = ControlVariantWriteUtils.deleteVariant(sReference, sVMReference, sVariantReference);
			assert.deepEqual(
				aDeletedChanges,
				aAllChanges,
				"then all changes are returned"
			);
			assert.ok(
				FlexObjectManager.deleteFlexObjects.calledWith({
					reference: sReference,
					flexObjects: aAllChanges
				}),
				"then FlexObjectManager.deleteFlexObjects is called with the correct parameters"
			);
		});

		QUnit.test("when deleteVariant is called and condensing is disabled", (assert) => {
			sandbox.stub(Settings, "getInstanceOrUndef").callsFake(() => {
				return {
					isCondensingEnabled: () => false,
					getUserId: () => "testUser"
				};
			});
			const sReference = "appReference";
			const sVMReference = "vmReference";
			const sVariantReference = "variantReference";
			const mExpectedPropertyBag = {
				reference: sReference,
				vmReference: sVMReference,
				vReference: sVariantReference
			};

			const [
				oVariant,
				oVMChange,
				oSetVisibleVariantChange,
				oSetTitleVariantChange,
				oVMDependentChange
			] = createFlexObjects(sReference);
			sandbox.stub(VariantManagementState, "getVariant").withArgs(mExpectedPropertyBag).returns({instance: oVariant});
			sandbox.stub(VariantManagementState, "getVariantManagementChanges").withArgs(mExpectedPropertyBag).returns([oVMChange]);
			sandbox.stub(
				VariantManagementState,
				"getVariantChangesForVariant"
			).withArgs(mExpectedPropertyBag).returns([oSetVisibleVariantChange, oSetTitleVariantChange]);
			sandbox.stub(
				VariantManagementState,
				"getControlChangesForVariant"
			).withArgs(mExpectedPropertyBag).returns([oVMDependentChange]);

			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const aDeletedChanges = ControlVariantWriteUtils.deleteVariant(sReference, sVMReference, sVariantReference);
			assert.strictEqual(aDeletedChanges.length, 0, "then no changes are returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
