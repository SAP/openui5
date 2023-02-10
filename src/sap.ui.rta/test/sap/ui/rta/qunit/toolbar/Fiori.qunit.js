/*global QUnit*/

sap.ui.define([
	"../RtaQunitUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/Utils",
	"sap/m/Image",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
],
function(
	RtaQunitUtils,
	jQuery,
	JSONModel,
	Fiori,
	Adaptation,
	RtaUtils,
	Image,
	Log,
	sinon,
	oCore
) {
	'use strict';

	var sandbox = sinon.createSandbox();

	QUnit.module('Basic functionality', {
		beforeEach: function(assert) {
			var done = assert.async();
			this.oImage = new Image({
				src: "test-resources/sap/ui/rta/testdata/sap_logo.png"
			});

			this.oImage.attachEventOnce("load", function() {
				done();
			}, this);

			this.oImage.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

			sandbox.stub(RtaUtils, "getFiori2Renderer").returns({
				getRootControl: function() {
					return {
						getOUnifiedShell: function() {
							return {
								getHeader: function() {
									return {
										getLogo: function() {
											return "logo";
										},
										addStyleClass: function(sText) {
											this.sAdd = sText;
										}.bind(this),
										removeStyleClass: function(sText) {
											this.sRemove = sText;
										}.bind(this),
										getShowLogo: function() {
											return true;
										},
										$: function() {
											return {
												find: function() {
													return jQuery(this.oImage.getDomRef());
												}.bind(this)
											};
										}.bind(this)
									};
								}.bind(this)
							};
						}.bind(this)
					};
				}.bind(this)
			});
		},
		afterEach: function() {
			this.oImage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initialized", function(assert) {
			var done = assert.async();

			this.oToolbar = new Fiori({
				textResources: oCore.getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			this.oToolbar.onFragmentLoaded().then(function() {
				var oImage = this.oToolbar.getControl('icon');
				assert.ok(oImage, "then the logo is among the controls");
				assert.equal(oImage.getMetadata().getName(), "sap.m.Image", "then the logo control is set correctly");
				assert.equal(oImage.getSrc(), "logo", "then the name of the logo is correctly set");

				var oErrorStub = sandbox.stub(Log, "error");
				var oImg = document.createElement('img');
				oImg.width = "5px";
				oImg.height = "5px";
				this.oToolbar._checkLogoSize(oImg, 6, 6);
				assert.equal(oErrorStub.callCount, 1, "then an error was thrown");

				this.oToolbar.show();
				assert.equal(this.sAdd, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got added");

				sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
				return this.oToolbar.hide().then(function() {
					assert.equal(this.sRemove, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got removed");
					this.oToolbar.destroy();
					done();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when the Fiori header is destroyed while the toolbar is being hidden", function(assert) {
			var done = assert.async();

			this.oToolbar = new Fiori({
				textResources: oCore.getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			var oAdaptationDestroyStub = sandbox.stub(Adaptation.prototype, "destroy").callsFake(function() {
				oAdaptationDestroyStub.wrappedMethod.apply(this, arguments);
				assert.ok(true, "then the destroy is executed without errors");
			});

			var oRemoveStyleClassSpy = sandbox.spy(this.oToolbar._oFioriHeader, "removeStyleClass");

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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});