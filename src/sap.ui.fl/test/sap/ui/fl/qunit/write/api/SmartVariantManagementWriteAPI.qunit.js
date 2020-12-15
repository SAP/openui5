/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	SmartVariantManagementWriteAPI,
	CompVariantState,
	Storage,
	Settings,
	ManifestUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementWriteAPI", {
		afterEach: function() {
			delete Settings._instance;
			delete Settings._oLoadSettingsPromise;
			sandbox.restore();
		}
	}, function() {
		[{
			apiFunctionName: "add",
			compVariantStateFunctionName: "add",
			mockedResponse: {
				getId: function () {
					return "id_123";
				}
			},
			expectedResponse: "id_123"
		}, {
			apiFunctionName: "addVariant",
			compVariantStateFunctionName: "add",
			expectedFileType: "variant"
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

				var oMockResponse = testData.mockedResponse || {};
				var oCompVariantStateStub = sandbox.stub(CompVariantState, testData.compVariantStateFunctionName).resolves(oMockResponse);
				var sReference = "the.app.id";
				var oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

				return SmartVariantManagementWriteAPI[testData.apiFunctionName](mPropertyBag).then(function (oResponse) {
					assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
					assert.equal(oResponse, testData.expectedResponse || oMockResponse, "the response was passed to the caller,");
					assert.equal(oCompVariantStateStub.callCount, 1, "the CompVariantState function was called once,");
					var oCompVariantStateFunctionArguments = oCompVariantStateStub.getCall(0).args[0];
					assert.equal(oCompVariantStateFunctionArguments, mPropertyBag, "the propertyBag was passed,");
					assert.equal(oCompVariantStateFunctionArguments.reference, sReference, "the reference was added,");
					assert.equal(oCompVariantStateFunctionArguments.persistencyKey, sPersistencyKey, "and the reference was added");
					if (testData.expectedFileType) {
						assert.equal(oCompVariantStateFunctionArguments.fileType, testData.expectedFileType, "and the file type was set");
					}
				});
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns true", function (assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isVariantSharingEnabled: true
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function (bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns false", function (assert) {
			var oSetting = {
				isKeyUser: false,
				isAtoAvailable: true,
				isVariantSharingEnabled: false
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function (bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns true", function (assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: true
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function (bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns false", function (assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: false
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function (bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});