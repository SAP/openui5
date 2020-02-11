/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/m/Image",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function(
	jQuery,
	Fiori,
	Adaptation,
	Image,
	Log,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

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
			sap.ui.getCore().applyChanges();

			sandbox.stub(sap.ui.rta.Utils, "getFiori2Renderer").returns({
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
			this.oToolbar.destroy();
			this.oImage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initialized", function(assert) {
			var done = assert.async();

			this.oToolbar = new Fiori({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});

			// settings a timeout to allow the async loading of the icon to finish; in the productive system this async does not matter
			window.setTimeout(function () {
				var oImage = this.oToolbar.getControl('icon');
				assert.ok(oImage, "then the logo is among the controls");
				assert.equal(oImage.getMetadata().getName(), "sap.m.Image", "then the logo control is set correctly");
				assert.equal(oImage.getSrc(), "logo", "then the name of the logo is correctly set");

				var oErrorStub = sandbox.stub(Log, "error");
				this.oToolbar._checkLogoSize(jQuery({naturalWidth: 5, naturalHeight: 5}), 6, 6);
				assert.equal(oErrorStub.callCount, 1, "then an error was thrown");

				this.oToolbar.show();
				assert.equal(this.sAdd, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got added");

				sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
				return this.oToolbar.hide().then(function() {
					assert.equal(this.sRemove, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got removed");
					done();
				}.bind(this));
			}.bind(this), 0);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
