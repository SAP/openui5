/* global QUnit */

sap.ui.define([
	"../RtaQunitUtils",
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/m/Image",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	RtaQunitUtils,
	Button,
	Lib,
	VersionsAPI,
	VerticalLayout,
	JSONModel,
	Adaptation,
	BaseToolbar,
	Fiori,
	RuntimeAuthoring,
	RtaUtils,
	Image,
	Log,
	sinon,
	nextUIUpdate
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sLogoSource = "test-resources/sap/ui/rta/testdata/sap_logo.png";

	function stubFioriRenderer(assert) {
		const done = assert.async();

		this.oImage = new Image({
			src: sLogoSource
		});

		this.oImage.attachEventOnce("load", function() {
			done();
		}, this);

		this.oImage.placeAt("qunit-fixture");

		sandbox.stub(RtaUtils, "getFiori2Renderer").returns({
			getRootControl: function() {
				return {
					getShellHeader: function() {
						return {
							getLogo() {
								return sLogoSource;
							},
							addStyleClass: function(sText) {
								this.sAdd = sText;
							}.bind(this),
							removeStyleClass: function(sText) {
								this.sRemove = sText;
							}.bind(this),
							getShowLogo() {
								return true;
							},
							getDomRef: function() {
								return this.oImage.getDomRef();
							}.bind(this)
						};
					}.bind(this)
				};
			}.bind(this)
		});
	}

	QUnit.module("Basic functionality", {
		async beforeEach(assert) {
			await nextUIUpdate();

			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

			stubFioriRenderer.call(this, assert);
		},
		afterEach() {
			this.oImage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initialized", function(assert) {
			const done = assert.async();

			this.oToolbar = new Fiori({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			this.oToolbar.onFragmentLoaded().then(async function() {
				const oImage = this.oToolbar.getControl("icon");
				assert.ok(oImage, "then the logo is among the controls");
				assert.equal(oImage.getMetadata().getName(), "sap.m.Image", "then the logo control is set correctly");
				assert.equal(
					oImage.getSrc(),
					sLogoSource,
					"then the source of the logo is correctly set"
				);

				await this.oToolbar.show();
				assert.equal(this.sAdd, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got added");

				const oErrorStub = sandbox.stub(Log, "error");
				this.oToolbar._checkLogoSize(oImage.getDomRef(), 20, 20);
				assert.equal(oErrorStub.callCount, 1, "then an error is thrown if the logo size is incorrect");
				this.oToolbar._checkLogoSize(oImage.getDomRef(), 54.75, 27.25);
				assert.equal(oErrorStub.callCount, 1, "then an error is not thrown if the logo size is correct when rounded");

				sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
				return this.oToolbar.hide().then(function() {
					assert.equal(this.sRemove, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got removed");
					this.oToolbar.destroy();
					done();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when the Fiori header is destroyed while the toolbar is being hidden", function(assert) {
			const done = assert.async();

			this.oToolbar = new Fiori({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			const oAdaptationDestroyStub = sandbox.stub(Adaptation.prototype, "destroy").callsFake(function(...aArgs) {
				oAdaptationDestroyStub.wrappedMethod.apply(this, aArgs);
				assert.ok(true, "then the destroy is executed without errors");
			});

			const oRemoveStyleClassSpy = sandbox.spy(this.oToolbar._oFioriHeader, "removeStyleClass");

			this.oToolbar.onFragmentLoaded().then(function() {
				this.oToolbar.show();
				sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
				this.oToolbar.hide().then(function() {
					assert.ok(
						oRemoveStyleClassSpy.called,
						"then the invisible style class was removed before the destruction"
					);
					done();
				});
				this.oToolbar.destroy();
			}.bind(this));
		});
	});

	function createAndStartRTA() {
		this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		const oButton = new Button("testButton");
		this.oContainer = new VerticalLayout({
			id: this.oComponent.createId("myVerticalLayout"),
			content: [oButton],
			width: "100%"
		});
		this.oContainer.placeAt("qunit-fixture");
		this.oRta = new RuntimeAuthoring({
			rootControl: this.oContainer,
			flexSettings: {
				developerMode: false
			}
		});
		return this.oRta.start()
		.then(async function() {
			this.oToolbar = this.oRta.getToolbar();
			await nextUIUpdate();
		}.bind(this));
	}

	QUnit.module("Different Screen Sizes", {
		beforeEach(assert) {
			sandbox.stub(BaseToolbar.prototype, "placeToContainer").callsFake(function() {
				this.placeAt("qunit-fixture");
			});
			sandbox.stub(RtaUtils, "isOriginalFioriToolbarAccessible").returns(true);
			const oVersionsModel = new JSONModel({
				versioningEnabled: true
			});
			oVersionsModel.setDirtyChanges = function() {};
			sandbox.stub(VersionsAPI, "initialize").resolves(oVersionsModel);
			stubFioriRenderer.call(this, assert);
		},
		afterEach() {
			this.oContainer.destroy();
			this.oComponent.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in a wide window (1600px)", function(assert) {
			document.getElementById("qunit-fixture").style.width = "1600px";
			return createAndStartRTA.call(this)
			.then(function() {
				assert.ok(this.oToolbar.getControl("iconBox").getVisible(), "then the logo is visible");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in a narrow window (600px)", function(assert) {
			const fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "600px";
			const oSetLogoVisibilityStub = sandbox.stub(Fiori.prototype, "_setLogoVisibility")
			.callsFake(function(...aArgs) {
				oSetLogoVisibilityStub.wrappedMethod.apply(this.oToolbar, aArgs);
				assert.notOk(this.oToolbar.getControl("iconBox").getVisible(), "then the logo is not visible");
				fnDone();
			}.bind(this));
			return createAndStartRTA.call(this);
		});

		QUnit.test("when the toolbar gets initially shown in a wide window (1600px), then the window is reduced and then expanded again", function(assert) {
			const fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "1600px";
			const oSetLogoVisibilityStub = sandbox.stub(Fiori.prototype, "_setLogoVisibility")
			.callsFake(function(...aArgs) {
				oSetLogoVisibilityStub.wrappedMethod.apply(this.oToolbar, aArgs);
				assert.notOk(this.oToolbar.getControl("iconBox").getVisible(), "then the logo disappears");
				oSetLogoVisibilityStub.callsFake(function(...aArgs) {
					oSetLogoVisibilityStub.wrappedMethod.apply(this.oToolbar, aArgs);
					assert.ok(this.oToolbar.getControl("iconBox").getVisible(), "then the logo is visible again");
					fnDone();
				}.bind(this));
				document.getElementById("qunit-fixture").style.width = "1600px";
				window.dispatchEvent(new Event("resize"));
			}.bind(this));
			return createAndStartRTA.call(this).then(function() {
				assert.ok(this.oToolbar.getControl("iconBox").getVisible(), "first the logo is visible");
				document.getElementById("qunit-fixture").style.width = "600px";
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});