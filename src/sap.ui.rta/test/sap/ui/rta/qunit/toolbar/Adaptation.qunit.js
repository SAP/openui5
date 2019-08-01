/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/Device",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Adaptation,
	Device,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module('Different Screen Sizes', {
		beforeEach: function() {
			this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange");
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in desktop mode (>= 900px) and then rerendered in the other 2 modes", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.DESKTOP, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl('exit').getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl('exit').getText(), "the exit button has text");
				assert.ok(this.oToolbar.getControl('manageApps').getIcon(), "the App Variant button has an icon");
				assert.notOk(this.oToolbar.getControl('manageApps').getText(), "the App Variant button has no text");
				assert.equal(this.oToolbar.getControl('restore').getLayoutData().getPriority(), "Low", "the layout data priority is correct");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in tablet mode (between 600px and 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl('exit').getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl('exit').getText(), "the exit button has text");
				assert.notOk(this.oToolbar.getControl('manageApps').getIcon(), "the App Variant button has no icon");
				assert.ok(this.oToolbar.getControl('manageApps').getText(), "the App Variant button has text");
				assert.equal(this.oToolbar.getControl('restore').getLayoutData().getPriority(), "AlwaysOverflow", "the layout data priority is correct");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in mobile mode (< 600px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.ok(this.oToolbar.getControl('exit').getIcon(), "the exit button has an icon");
				assert.notOk(this.oToolbar.getControl('exit').getText(), "the exit button has no text");
				assert.notOk(this.oToolbar.getControl('manageApps').getIcon(), "the App Variant button has no icon");
				assert.ok(this.oToolbar.getControl('manageApps').getText(), "the App Variant button has text");
				assert.equal(this.oToolbar.getControl('restore').getLayoutData().getPriority(), "AlwaysOverflow", "the layout data priority is correct");
			}.bind(this));
		});

		QUnit.test("when initially the mode switcher is invisible, but then gets rendered", function(assert) {
			var done = assert.async();
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				width: "900px"
			});
			// erase padding on outer toolbar for better width comparison
			var oModeSwitcher = this.oToolbar.getControl("modeSwitcher");
			oModeSwitcher.setVisible(false);
			oModeSwitcher.setWidth("50px");

			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;
			this.oToolbar.show()
			.then(function() {
				this.oToolbar.getDomRef().style.padding = 0;
				var aContent = this.oToolbar.getItems();
				assert.equal(aContent[0].getDomRef().offsetWidth, 450);
				assert.equal(aContent[1].getDomRef().offsetWidth, 450);

				oModeSwitcher.setVisible(true);
				setTimeout(function() {
					assert.equal(aContent[0].getDomRef().offsetWidth, 425);
					assert.equal(aContent[1].getDomRef().offsetWidth, 475);
					done();
				}, 0);
			}.bind(this));
		});
	});

	QUnit.module('Custom setters', {
		beforeEach: function() {},
		afterEach: function() {
			this.oToolbar.destroy();
		}
	}, function() {
		QUnit.test("setUndoRedoEnabled", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");

			this.oToolbar.setUndoRedoEnabled(true, true);
			assert.ok(this.oToolbar.getControl("redo").getEnabled(), "the undo button is enabled");
			assert.ok(this.oToolbar.getControl("redo").getEnabled(), "the undo button is enabled");

			this.oToolbar.setUndoRedoEnabled(false, false);
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setPublishEnabled", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");

			this.oToolbar.setPublishEnabled(true);
			assert.ok(this.oToolbar.getControl("publish").getEnabled(), "the undo button is enabled");

			this.oToolbar.setPublishEnabled(false);
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setRestoreEnabled", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");

			this.oToolbar.setRestoreEnabled(true);
			assert.ok(this.oToolbar.getControl("restore").getEnabled(), "the undo button is enabled");

			this.oToolbar.setRestoreEnabled(false);
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
