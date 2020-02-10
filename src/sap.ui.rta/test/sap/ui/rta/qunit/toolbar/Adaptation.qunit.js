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

	function destroyToolbar(oToolbar) {
		// by default the dependent controls are handled by RuntimeAuthoring
		oToolbar.getItems().forEach(function (oControl) {
			oControl.destroy();
		});
		oToolbar.destroy(true);
	}

	var sandbox = sinon.sandbox.create();

	QUnit.module('Different Screen Sizes', {
		beforeEach: function() {
			this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange");
		},
		afterEach: function() {
			destroyToolbar(this.oToolbar);
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
				assert.equal(this.oToolbar.getControl('restore').getLayoutData().getPriority(), "High", "the layout data priority is correct");
				assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
				assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
			}.bind(this));
		});

		QUnit.test("when a draft is visible and the toolbar gets initially shown in desktop mode (>= 1200px) and then rerendered in the other 2 modes and back", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				draftVisible: true
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;

			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is shown");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
					assert.ok(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is shown");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
					assert.notOk(this.oToolbar.getControl('exit').getIcon(), "the exit button has no icon");
					assert.ok(this.oToolbar.getControl('exit').getText(), "the exit button has text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				draftVisible: true
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl('exit').getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl('exit').getText(), "the exit button has no text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				draftVisible: true
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl('exit').getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl('exit').getText(), "the exit button has no text");
				}.bind(this));
		});
	});

	QUnit.module('Custom setters', {
		before: function() {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.sMode = Adaptation.modes.DESKTOP;
		},
		after: function() {
			destroyToolbar(this.oToolbar);
		}
	}, function() {
		QUnit.test("setUndoRedoEnabled", function(assert) {
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
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");

			this.oToolbar.setPublishEnabled(true);
			assert.ok(this.oToolbar.getControl("publish").getEnabled(), "the undo button is enabled");

			this.oToolbar.setPublishEnabled(false);
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setRestoreEnabled", function(assert) {
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");

			this.oToolbar.setRestoreEnabled(true);
			assert.ok(this.oToolbar.getControl("restore").getEnabled(), "the undo button is enabled");

			this.oToolbar.setRestoreEnabled(false);
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setDraftVisible", function(assert) {
			assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
			assert.notOk(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is hidden");
			assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is hidden");

			this.oToolbar.setDraftVisible(true);
			assert.ok(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is visible");
			assert.ok(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is visible");
			assert.ok(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is visible");

			this.oToolbar.setDraftVisible(false);
			assert.notOk(this.oToolbar.getControl("draftLabel").getVisible(), "the draft label is hidden");
			assert.notOk(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is hidden");
			assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is hidden");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
