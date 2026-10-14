/* global QUnit */

sap.ui.define([
	"../RtaQunitUtils",
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/Image",
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Log,
	Button,
	Image,
	Core,
	Lib,
	VersionsAPI,
	Utils,
	VerticalLayout,
	JSONModel,
	nextUIUpdate,
	Adaptation,
	BaseToolbar,
	Fiori,
	RuntimeAuthoring,
	RtaUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sLogoSource = "test-resources/sap/ui/rta/testdata/sap_logo.png";

	async function stubFlpAPI(assert) {
		const done = assert.async();

		this.oImage = new Image({
			src: sLogoSource
		});

		this.oImage.attachEventOnce("load", done);

		this.oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oGetLogoStub = sandbox.stub().returns(this.oImage.getSrc());
		const oGetLogoDomRefStub = sandbox.stub().returns(this.oImage.getDomRef());
		this.oUshellApi = {
			getLogo: oGetLogoStub,
			getLogoDomRef: oGetLogoDomRefStub,
			navigateBack: sandbox.stub()
		};

		sandbox.stub(Utils, "getUshellContainer").returns({
			async getServiceAsync() {},
			getRenderer() {
				return {
					getRootControl() {
						return {
							getShellHeader() {
								return {
									addStyleClass: () => {},
									removeStyleClass: () => {}
								};
							}
						};
					}
				};
			}
		});
		RtaQunitUtils.stubSapUiRequire(sandbox, [{
			name: "sap/ushell/api/RTA",
			stub: this.oUshellApi
		}]);
	}

	QUnit.module("Basic functionality", {
		async beforeEach(assert) {
			await nextUIUpdate();
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			await stubFlpAPI.call(this, assert);
		},
		afterEach() {
			this.oImage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initialized", async function(assert) {
			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			await this.oToolbar.onFragmentLoaded();
			const oImage = this.oToolbar.getControl("icon");
			assert.ok(oImage, "then the logo is among the controls");
			assert.equal(oImage.getMetadata().getName(), "sap.m.Image", "then the logo control is set correctly");
			assert.equal(oImage.getSrc(), sLogoSource, "then the source of the logo is correctly set");

			await this.oToolbar.show();

			const oErrorStub = sandbox.stub(Log, "error");
			this.oToolbar._checkLogoSize(oImage.getDomRef(), 20, 20);
			assert.equal(oErrorStub.callCount, 1, "then an error is thrown if the logo size is incorrect");
			this.oToolbar._checkLogoSize(oImage.getDomRef(), 54.75, 27.25);
			assert.equal(oErrorStub.callCount, 1, "then an error is not thrown if the logo size is correct when rounded");

			sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
			await this.oToolbar.hide();

			this.oToolbar.destroy();
		});

		QUnit.test("when the Fiori header is destroyed while the toolbar is being hidden", async function(assert) {
			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			const oAdaptationDestroyStub = sandbox.stub(Adaptation.prototype, "destroy").callsFake(function(...aArgs) {
				oAdaptationDestroyStub.wrappedMethod.apply(this, aArgs);
				assert.ok(true, "then the destroy is executed without errors");
			});

			await this.oToolbar.onFragmentLoaded();
			await this.oToolbar.show();
			sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
			await this.oToolbar.hide();
			this.oToolbar.destroy();
		});

		QUnit.test("when there is a logo source, but no logo domRef", async function(assert) {
			this.oUshellApi.getLogoDomRef.returns(null);
			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			await this.oToolbar.onFragmentLoaded();
			const oImage = this.oToolbar.getControl("icon");
			assert.deepEqual(oImage.getSrc(), sLogoSource, "then the source of the logo is correctly set");
			assert.deepEqual(oImage.getWidth(), "80%", "then the width of the logo is set to 80% when no domRef is available");

			this.oToolbar.destroy();
		});

		QUnit.test("when there is no logo source", async function(assert) {
			this.oUshellApi.getLogo.returns(null);
			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			await this.oToolbar.onFragmentLoaded();
			assert.notOk(this.oToolbar.getControl("icon"), "then no logo control is created");
		});

		QUnit.test("when the FLP renderer does not provide a root control", async function(assert) {
			// The FLP renderer (owned by a different repository) may no longer expose getRootControl().
			// UI adaptation must still start - only the hiding of the original Fiori header is skipped.
			Utils.getUshellContainer.returns({
				async getServiceAsync() {},
				getRenderer() {
					return {};
				}
			});

			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			assert.notOk(this.oToolbar._oFioriHeader, "then no Fiori header reference is created");

			await this.oToolbar.onFragmentLoaded();

			// show / hide / destroy must not throw even though the Fiori header is not available
			await this.oToolbar.show();
			assert.ok(true, "then show does not throw");

			sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
			await this.oToolbar.hide();
			assert.ok(true, "then hide does not throw");

			this.oToolbar.destroy();
			assert.ok(true, "then destroy does not throw");
		});
	});

	QUnit.module("Navigate Back", {
		async beforeEach(assert) {
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			await stubFlpAPI.call(this, assert);
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when navigateBack is called, it calls ushell API", async function(assert) {
			this.oToolbar = new Fiori({
				ushellApi: this.oUshellApi,
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			await this.oToolbar.onFragmentLoaded();
			this.oToolbar.navigateBack();

			assert.strictEqual(this.oUshellApi.navigateBack.callCount, 1, "then ushellApi.navigateBack was called");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
