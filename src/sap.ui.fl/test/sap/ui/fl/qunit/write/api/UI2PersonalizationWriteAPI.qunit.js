/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/write/api/UI2PersonalizationWriteAPI",
	"sap/ui/core/Manifest",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	ManifestUtils,
	UI2PersonalizationState,
	UI2PersonalizationWriteAPI,
	Manifest,
	FlexUtils,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	const sandbox = sinon.createSandbox();

	function createAppComponent() {
		const oDescriptor = {
			"sap.app": {
				id: "reference.app",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		const oManifest = new Manifest(oDescriptor);
		return {
			name: "testComponent",
			getManifest() {
				return oManifest;
			},
			getId() {
				return "Control---demo--test";
			},
			getLocalId() {}
		};
	}

	QUnit.module("setPersonalization", {
		beforeEach() {
			this.oAppComponent = createAppComponent();
			this.oSetPersonalizationStub = sandbox.stub(UI2PersonalizationState, "setPersonalization");
			this.oDeletePersonalizationStub = sandbox.stub(UI2PersonalizationState, "deletePersonalization");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("create is called and complains about too few parameters (no properties except selector property)", async function(assert) {
			try {
				await UI2PersonalizationWriteAPI.create({
					selector: this.oAppComponent
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
			}
		});

		QUnit.test("create is called and complains about missing component name", async function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector");

			try {
				await UI2PersonalizationWriteAPI.create({
					selector: this.oAppComponent,
					containerKey: "someContainerKey",
					itemName: "someItemName",
					content: {}
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
			}
		});

		QUnit.test("create is called and complains about too few parameters (no containerKey)", async function(assert) {
			try {
				await UI2PersonalizationWriteAPI.create({
					selector: this.oAppComponent,
					itemName: "someItemName",
					content: {}
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
			}
		});

		QUnit.test("create is called and complains about too few parameters (no ItemName)", async function(assert) {
			try {
				await UI2PersonalizationWriteAPI.create({
					selector: this.oAppComponent,
					containerKey: "someContainerKey",
					content: {}
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
			}
		});

		QUnit.test("create is called and successful", async function(assert) {
			await UI2PersonalizationWriteAPI.create({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				itemName: "someItemName",
				content: {},
				category: "someCategory",
				containerCategory: "someContainerCategory"
			});
			assert.ok(this.oSetPersonalizationStub.calledWithExactly({
				reference: "testComponent",
				containerKey: "someContainerKey",
				itemName: "someItemName",
				content: {},
				category: "someCategory",
				containerCategory: "someContainerCategory"
			}), "then UI2PersonalizationState.setPersonalization is called with correct parameters");
		});

		QUnit.test("deletePersonalization is called and successful", async function(assert) {
			await UI2PersonalizationWriteAPI.deletePersonalization({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				itemName: "someItemName"
			});
			assert.ok(
				this.oDeletePersonalizationStub.calledWithExactly("testComponent", "someContainerKey", "someItemName"),
				"then UI2PersonalizationState.deletePersonalization is called with correct parameters"
			);
		});

		QUnit.test("deletePersonalization is called and complains about missing component name", async function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector");

			try {
				await UI2PersonalizationWriteAPI.deletePersonalization({
					selector: this.oAppComponent,
					containerKey: "someContainerKey",
					itemName: "someItemName"
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oDeletePersonalizationStub.notCalled, "then UI2PersonalizationState.deletePersonalization is not called");
			}
		});

		QUnit.test("deletePersonalization gets called and complains about too few parameters (no properties except selector property)", async function(assert) {
			try {
				await UI2PersonalizationWriteAPI.deletePersonalization({
					selector: this.oAppComponent
				});
			} catch {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oDeletePersonalizationStub.notCalled, "then UI2PersonalizationState.deletePersonalization is not called");
			}
		});
	});
});