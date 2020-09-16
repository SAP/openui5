/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	SmartVariantManagementWriteAPI,
	CompVariantState,
	ManifestUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementWriteAPI", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		[{
			apiFunctionName: "add",
			compVariantStateFunctionName: "add"
		}, {
			apiFunctionName: "save",
			compVariantStateFunctionName: "persist"
		}, {
			apiFunctionName: "setDefaultVariantId",
			compVariantStateFunctionName: "setDefault"
		}, {
			apiFunctionName: "setExecuteOnSelect",
			compVariantStateFunctionName: "setExecuteOnSelect"
		}].forEach(function(testData) {
			QUnit.test("When " + testData.apiFunctionName + " is called", function (assert) {
				// mock control
				var sPersistencyKey = "thePersistencyKey";
				var mPropertyBag = {};
				mPropertyBag.control = {
					getPersistencyKey: function () {
						return sPersistencyKey;
					}
				};
				var oMockResponse = {};
				var oCompVariantStateStub = sandbox.stub(CompVariantState, testData.compVariantStateFunctionName).resolves(oMockResponse);
				var sReference = "the.app.id";
				var oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

				return SmartVariantManagementWriteAPI[testData.apiFunctionName](mPropertyBag).then(function (oResponse) {
					assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
					assert.equal(oResponse, oMockResponse, "the response was passed to the caller,");
					assert.equal(oCompVariantStateStub.callCount, 1, "the CompVariantState function was called once,");
					var oCompVariantStateFunctionArguments = oCompVariantStateStub.getCall(0).args[0];
					assert.equal(oCompVariantStateFunctionArguments, mPropertyBag, "the propertyBag was passed,");
					assert.equal(oCompVariantStateFunctionArguments.reference, sReference, "the reference was added,");
					assert.equal(oCompVariantStateFunctionArguments.persistencyKey, sPersistencyKey, "and the reference was added");
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});