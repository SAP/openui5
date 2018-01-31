/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'jquery.sap.global',
	'sap/ui/rta/toolbar/Fiori',
	'sap/ui/rta/toolbar/Adaptation',
	'sap/m/Image',
	"sap/ui/thirdparty/sinon"
],
function(
	jQuery,
	Fiori,
	Adaptation,
	Image,
	sinon
) {
	'use strict';

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module('Basic functionality', {
		beforeEach: function(assert) {
			var done = assert.async();
			this.oImage = new Image({
				src: "../../testdata/sap_logo.png"
			});

			this.oImage.attachEventOnce("load", function() {
				done();
			}, this);

			this.oImage.placeAt("qunit-fixtures");
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
			this.oToolbar = new Fiori({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			var oImage = this.oToolbar.getControl('logo');
			assert.ok(oImage, "then the logo is among the controls");
			assert.equal(oImage.getMetadata().getName(), "sap.m.Image", "then the logo control is set correctly");
			assert.equal(oImage.getSrc(), "logo", "then the name of the logo is correctly set");

			var oErrorSpy = sandbox.spy(jQuery.sap.log, "error");
			this.oToolbar._checkLogoSize(jQuery({naturalWidth: 5, naturalHeight: 5}), 6, 6);
			assert.equal(oErrorSpy.callCount, 1, "then an error was thrown");

			this.oToolbar.show();
			assert.equal(this.sAdd, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got added");

			sandbox.stub(Adaptation.prototype, "hide").returns(Promise.resolve());
			return this.oToolbar.hide().then(function() {
				assert.equal(this.sRemove, "sapUiRtaFioriHeaderInvisible", "then the correct StyleClass got removed");
			}.bind(this));
		});
	});
});
