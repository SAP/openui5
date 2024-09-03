sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/SACIntegrationUpdateVariant",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	UIComponent,
	FlexState,
	ManifestUtils,
	InitialStorage,
	StorageUtils,
	Settings,
	WriteStorage,
	SACIntegrationUpdateVariant,
	Layer,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const sReference = "some.app.id";
	const sPersistencyKey = "someVMKey";
	const sVariantId = "flex_variant_1";
	const oAppComponent = new UIComponent();
	const oControl = new Control("controlId1");
	oControl.getPersistencyKey = function() {
		return sPersistencyKey;
	};

	const callCatchAndExpectMessage = (assert, sMessage, mPropertyBag) => {
		return SACIntegrationUpdateVariant(mPropertyBag).catch((sErrorMessage) => {
			assert.equal(sErrorMessage, sMessage, "the function rejects with the error");
		});
	};

	QUnit.module("Given an incomplete property bag was passed to update variant", {}, function() {
		QUnit.test("without a property bag", function(assert) {
			return callCatchAndExpectMessage(assert, "A property bag must be provided");
		});

		QUnit.test("without a control", function(assert) {
			const mPropertyBag = {};
			return callCatchAndExpectMessage(assert, "variant management control must be provided", mPropertyBag);
		});

		QUnit.test("without a variantId", function(assert) {
			const mPropertyBag = {
				control: {}
			};
			return callCatchAndExpectMessage(assert, "variant ID must be provided", mPropertyBag);
		});

		QUnit.test("without a content", function(assert) {
			const mPropertyBag = {
				control: {},
				id: "abcd1234"
			};
			return callCatchAndExpectMessage(assert, "content must be provided", mPropertyBag);
		});
	});

	QUnit.module("Given an invalid update variant was triggered", {
		beforeEach: () => {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
		},
		afterEach: () => {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("because the variant does not exists", function(assert) {
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [],
				comp: {
					variants: [{
						fileName: sVariantId,
						name: "F Variant",
						fileType: "variant",
						layer: Layer.USER,
						content: {},
						favorite: true,
						selector: {
							persistencyKey: sPersistencyKey
						},
						texts: {
							variantName: {
								value: "A variant"
							}
						}
					}],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			const mPropertyBag = {
				control: oControl,
				id: "some_invalid_id",
				content: {someKey: "someValue"}
			};

			return FlexState.initialize({
				reference: sReference,
				reInitialize: true
			}).then(() => {
				return callCatchAndExpectMessage(assert, "no variant with the ID found", mPropertyBag);
			});
		});
		QUnit.test("because the object is not a variant", function(assert) {
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [{
					fileName: sVariantId,
					name: "F Variant",
					layer: Layer.USER,
					fileType: "change",
					content: {},
					favorite: true,
					selector: {
						persistencyKey: sPersistencyKey
					},
					texts: {
						variantName: {
							value: "A variant"
						}
					}
				}],
				comp: {
					variants: [],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			const mPropertyBag = {
				control: oControl,
				id: "some_invalid_id",
				content: {someKey: "someValue"}
			};

			return FlexState.initialize({
				reference: sReference,
				reInitialize: true
			}).then(() => {
				return callCatchAndExpectMessage(assert, "no variant with the ID found", mPropertyBag);
			});
		});

		[Layer.CUSTOMER, Layer.CUSTOMER_BASE, Layer.VENDOR].forEach((sLayer) => {
			QUnit.test(`because the variant is in the ${sLayer} layer`, function(assert) {
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					...StorageUtils.getEmptyFlexDataResponse(),
					changes: [],
					comp: {
						variants: [{
							fileName: sVariantId,
							fileType: "variant",
							name: "F Variant",
							layer: sLayer,
							content: {},
							favorite: true,
							selector: {
								persistencyKey: sPersistencyKey
							},
							texts: {
								variantName: {
									value: "A variant"
								}
							}
						}],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					}
				});

				const mPropertyBag = {
					control: oControl,
					id: sVariantId,
					content: {someKey: "someValue"}
				};

				return FlexState.initialize({
					reference: sReference,
					reInitialize: true
				}).then(() => {
					return callCatchAndExpectMessage(assert, "only variants in the USER and PUBLIC layer can be updated", mPropertyBag);
				});
			});
		});

		QUnit.test(`because the variant is in the PUBLIC layer, but the user is not authorized to edit it (no key user nor author)`, function(assert) {
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [],
				comp: {
					variants: [{
						fileName: sVariantId,
						fileType: "variant",
						name: "F Variant",
						layer: Layer.PUBLIC,
						content: {},
						favorite: true,
						selector: {
							persistencyKey: sPersistencyKey
						},
						support: {
							user: "NORRISC"
						},
						texts: {
							variantName: {
								value: "A variant"
							}
						}
					}],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			const mPropertyBag = {
				control: oControl,
				id: sVariantId,
				content: {someKey: "someValue"}
			};

			return FlexState.initialize({
				reference: sReference,
				reInitialize: true
			}).then(() => {
				const oSettingsInstance = Settings.getInstanceOrUndef();
				sandbox.stub(oSettingsInstance, "getUserId").returns("SANTA");
				sandbox.stub(oSettingsInstance, "isKeyUser").returns(false);

				return callCatchAndExpectMessage(assert, "the user is not authorized to edit the PUBLIC variant (no author nor key user)", mPropertyBag);
			});
		});
	});

	QUnit.module("Given an update variant was triggered for a existing variant", {
		beforeEach: () => {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
		},
		afterEach: () => {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and all prerequisites are matched", function(assert) {
			const oWriteStorageUpdateStub = sandbox.stub(WriteStorage, "update").resolves({
				response: {}
			});
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [],
				comp: {
					variants: [{
						fileName: sVariantId,
						name: "F Variant",
						layer: Layer.USER,
						fileType: "variant",
						content: {},
						favorite: true,
						selector: {
							persistencyKey: sPersistencyKey
						},
						texts: {
							variantName: {
								value: "A variant"
							}
						}
					}, {
						fileName: "another_variant_id",
						name: "F Variant",
						layer: Layer.USER,
						fileType: "variant",
						content: {},
						favorite: true,
						selector: {
							persistencyKey: sPersistencyKey
						},
						texts: {
							variantName: {
								value: "A variant"
							}
						}
					}],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			const oContent = {someKey: "someValue"};
			const mPropertyBag = {
				control: oControl,
				id: sVariantId,
				content: oContent
			};

			return FlexState.initialize({
				reference: sReference,
				reInitialize: true
			}).then(() => {
				return SACIntegrationUpdateVariant(mPropertyBag).then(() => {
					assert.equal(oWriteStorageUpdateStub.callCount, 1, "the variant was persisted once");
					const oArgs = oWriteStorageUpdateStub.getCall(0).args;
					assert.equal(oArgs.length, 1, "one entity is passed");
					const oUpdatedVariant = oArgs[0].flexObject;
					assert.equal(oUpdatedVariant.fileName, sVariantId, "the correct variant is used");
					assert.deepEqual(oUpdatedVariant.content, oContent, "the content is passed");
				});
			});
		});
	});
});

/* global QUnit */
