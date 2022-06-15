/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Core,
	Version,
	Layer,
	JSONModel,
	AppVariantFeature,
	Adaptation,
	Device,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createToolbarControlsModel() {
		return new JSONModel({
			undoEnabled: false,
			redoEnabled: false,
			publishVisible: false,
			publishEnabled: false,
			restoreEnabled: false,
			appVariantsOverviewVisible: false,
			appVariantsOverviewEnabled: false,
			saveAsVisible: false,
			saveAsEnabled: false,
			manageAppsVisible: false,
			manageAppsEnabled: false,
			modeSwitcher: "adaptation",
			visualizationButtonVisible: false
		});
	}

	function createAndWaitForToolbar() {
		this.oToolbar = new Adaptation({
			textResources: Core.getLibraryResourceBundle("sap.ui.rta")
		});
		document.getElementById("qunit-fixture").style.width = "1600px";
		this.oToolbar.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oToolbar.setModel(this.oVersionsModel, "versions");
		this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
		this.oToolbar.animation = false;

		return this.oToolbar._pFragmentLoaded.then(function() {
			return this.oToolbar.show();
		}.bind(this));
	}

	QUnit.module("Different Screen Sizes", {
		beforeEach: function() {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false,
				versions: [],
				draftAvailable: false
			});
			this.oToolbarControlsModel = createToolbarControlsModel();
			this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange");
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in desktop mode (>= 900px) and then rerendered in the other 2 modes", function(assert) {
			var oInitRangeSetStub = sandbox.stub(Device.media, "initRangeSet");
			// the 'calledOnceWithMatch' function is not yet available in the current sinon versions
			// and the toolbar does not exist in time to only stub the call from the toolbar
			var nCallCount = 0;
			sandbox.stub(Device.media, "attachHandler").callsFake(function(fnHandler, oContext, sName) {
				if (sName === "sapUiRtaToolbar") {
					nCallCount++;
				}
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});

			return createAndWaitForToolbar.call(this).then(function() {
				assert.equal(oInitRangeSetStub.callCount, 1, "our range set was initialized");
				assert.equal(oInitRangeSetStub.lastCall.args[0], "sapUiRtaToolbar", "the first parameter is correct");
				assert.deepEqual(oInitRangeSetStub.lastCall.args[1], [900, 1200], "the second parameter is correct");
				assert.equal(oInitRangeSetStub.lastCall.args[2], "px", "the third parameter is correct");
				assert.deepEqual(oInitRangeSetStub.lastCall.args[3], [Adaptation.modes.MOBILE, Adaptation.modes.TABLET, Adaptation.modes.DESKTOP], "the fourth parameter is correct");
				assert.equal(nCallCount, 1, "the handler was attached once");
				assert.equal(this.oToolbar.sMode, Adaptation.modes.DESKTOP, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("exit").getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl("exit").getText(), "the exit button has text");
				assert.equal(this.oToolbar.getControl("restore").getLayoutData().getPriority(), "High", "the layout data priority is correct");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});

			return createAndWaitForToolbar.call(this).then(function() {
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("exit").getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl("exit").getText(), "the exit button has text");
			}.bind(this));
		});

		QUnit.test("when the draft is set to visible and toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oVersionsModel.setProperty("/draftAvailable", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});

			return createAndWaitForToolbar.call(this).then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is shown");
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});

			return createAndWaitForToolbar.call(this).then(function() {
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.ok(this.oToolbar.getControl("exit").getIcon(), "the exit button has an icon");
				assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
			}.bind(this));
		});

		QUnit.test("when the draft is set to visible and the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oVersionsModel.setProperty("/draftAvailable", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});

			return createAndWaitForToolbar.call(this).then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.ok(this.oToolbar.getControl("exit").getIcon(), "the exit button has an icon");
				assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
			}.bind(this));
		});
	});

	QUnit.module("Versions Model binding & formatter for the restore button", {
		before: function () {
			this.oToolbarControlsModel = createToolbarControlsModel();
			this.oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given switching versions is possible", function (assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oVersionsModel, "versions");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
					this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
					this.oVersionButton = this.oToolbar.getControl("versionButton");
				}.bind(this))
				.then(function () {
					assert.equal(this.oToolbar.getControl("restore").getVisible(), false, "then the restore button is hidden");
				}.bind(this));
		});

		QUnit.test("Given switching versions is not possible", function (assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oVersionsModel, "versions");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
					this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
					this.oVersionButton = this.oToolbar.getControl("versionButton");
				}.bind(this))
				.then(function () {
					assert.equal(this.oToolbar.getControl("restore").getVisible(), true, "then the restore button is shown");
				}.bind(this));
		});
	});

	QUnit.module("Setting AppVariant properties", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: Core.getLibraryResourceBundle("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					}
				}
			});
			this.oControlsModel = createToolbarControlsModel();
			this.oToolbar.setModel(this.oControlsModel, "controls");
			this.oToolbar.setModel(new JSONModel({}), "versions");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a toolbar is created and app variants parameter in the model are switched back and forth", function (assert) {
			this.oControlsModel.setProperty("/saveAsVisible", false);
			this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
			this.oControlsModel.setProperty("/manageAppsVisible", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show().then(function() {
				var oGetOverviewStub = sandbox.stub(AppVariantFeature, "onGetOverview");
				var oSaveAsStub = sandbox.stub(AppVariantFeature, "onSaveAs");
				var oSaveAsButton = this.oToolbar.getControl("saveAs");
				var oManageAppsButton = this.oToolbar.getControl("manageApps");
				var oOverviewButton = this.oToolbar.getControl("appVariantOverview");

				assert.notOk(oSaveAsButton.getVisible(), "saveAs is not visible");
				assert.notOk(oOverviewButton.getVisible(), "appVariantOverview is not visible");
				assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");

				this.oControlsModel.setProperty("/saveAsVisible", true);
				this.oControlsModel.setProperty("/saveAsEnabled", false);
				this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
				this.oControlsModel.setProperty("/manageAppsVisible", true);
				this.oControlsModel.setProperty("/manageAppsEnabled", false);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.notOk(oSaveAsButton.getEnabled(), "saveAs is not enabled");
				assert.notOk(oOverviewButton.getVisible(), "AppVariantOverview is not visible");
				assert.ok(oManageAppsButton.getVisible(), "manageApps is visible");
				assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

				this.oControlsModel.setProperty("/saveAsVisible", true);
				this.oControlsModel.setProperty("/saveAsEnabled", true);
				this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
				this.oControlsModel.setProperty("/manageAppsVisible", true);
				this.oControlsModel.setProperty("/manageAppsEnabled", true);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.ok(oSaveAsButton.getEnabled(), "saveAs is enabled");
				assert.notOk(oOverviewButton.getVisible(), "AppVariantOverview is not visible");
				assert.ok(oManageAppsButton.getVisible(), "manageApps is visible");
				assert.ok(oManageAppsButton.getEnabled(), "manageApps is enabled");

				oManageAppsButton.firePress();
				assert.strictEqual(oGetOverviewStub.callCount, 1, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], true, "the first agrument is true");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");

				oSaveAsButton.firePress();
				assert.strictEqual(oSaveAsStub.callCount, 1, "the save as function was called");
				assert.deepEqual(oSaveAsStub.lastCall.args, [true, true, Layer.CUSTOMER, null], "the correct arguments got passed");

				this.oControlsModel.setProperty("/saveAsVisible", true);
				this.oControlsModel.setProperty("/saveAsEnabled", true);
				this.oControlsModel.setProperty("/appVariantsOverviewVisible", true);
				this.oControlsModel.setProperty("/appVariantsOverviewEnabled", true);
				this.oControlsModel.setProperty("/manageAppsVisible", false);
				this.oControlsModel.setProperty("/manageAppsEnabled", false);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.ok(oSaveAsButton.getEnabled(), "saveAs is enabled");
				assert.ok(oOverviewButton.getVisible(), "AppVariantOverview is visible");
				assert.ok(oOverviewButton.getEnabled(), "AppVariantOverview is enabled");
				assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");
				assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

				oOverviewButton.getMenu().fireItemSelected({
					item: oOverviewButton.getMenu().getItems()[0]
				});
				assert.strictEqual(oGetOverviewStub.callCount, 2, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], true, "the first agrument is true");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");

				oOverviewButton.getMenu().fireItemSelected({
					item: oOverviewButton.getMenu().getItems()[1]
				});
				assert.strictEqual(oGetOverviewStub.callCount, 3, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], false, "the first agrument is false");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");
			}.bind(this));
		});
	});

	QUnit.module("Setting different modes", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: Core.getLibraryResourceBundle("sap.ui.rta")
			});
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true,
				displayedVersion: Version.Number.Draft
			});
			this.oControlsModel = new JSONModel({
				publishVisible: true,
				appVariantsOverviewVisible: true,
				saveAsVisible: true,
				manageAppsVisible: true
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oControlsModel, "controls");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a toolbar is created and mode is set to 'adaptation'", function(assert) {
			this.oControlsModel.setProperty("/modeSwitcher", "adaptation");
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is visible");
					assert.ok(this.oToolbar.getControl("activate").getVisible(), "activate is visible");
					assert.ok(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is visible");
					assert.notOk(this.oToolbar.getControl("publishVersion").getVisible(), "publishVersion is visible");
					assert.ok(this.oToolbar.getControl("undo").getVisible(), "undo is visible");
					assert.ok(this.oToolbar.getControl("redo").getVisible(), "redo is visible");
					assert.notOk(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is not visible");
					assert.notOk(this.oToolbar.getControl("publish").getVisible(), "publish is hidden");
					assert.notOk(this.oToolbar.getControl("restore").getVisible(), "restore is not visible");
					assert.ok(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is visible");
					assert.ok(this.oToolbar.getControl("appVariantOverview").getVisible(), "appVariantOverview is visible");
					assert.ok(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and mode is set to 'navigation'", function(assert) {
			this.oControlsModel.setProperty("/modeSwitcher", "navigation");
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is not visible");
					assert.notOk(this.oToolbar.getControl("activate").getVisible(), "activate is not visible");
					assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is not visible");
					assert.notOk(this.oToolbar.getControl("publishVersion").getVisible(), "publishVersion is visible");
					assert.notOk(this.oToolbar.getControl("undo").getVisible(), "undo is not visible");
					assert.notOk(this.oToolbar.getControl("redo").getVisible(), "redo is not visible");
					assert.notOk(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is not visible");
					assert.notOk(this.oToolbar.getControl("publish").getVisible(), "publish is not visible");
					assert.notOk(this.oToolbar.getControl("restore").getVisible(), "restore is not visible");
					assert.notOk(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is not visible");
					assert.notOk(this.oToolbar.getControl("appVariantOverview").getVisible(), "appVariantOverview is not visible");
					assert.notOk(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is not visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and mode is set to 'visualization'", function(assert) {
			this.oControlsModel.setProperty("/modeSwitcher", "visualization");
			this.oVersionsModel.setProperty("/versioningEnabled", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is not visible");
					assert.notOk(this.oToolbar.getControl("activate").getVisible(), "activate is not visible");
					assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is not visible");
					assert.notOk(this.oToolbar.getControl("publishVersion").getVisible(), "publishVersion is visible");
					assert.notOk(this.oToolbar.getControl("undo").getVisible(), "undo is not visible");
					assert.notOk(this.oToolbar.getControl("redo").getVisible(), "redo is not visible");
					assert.ok(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is visible");
					assert.notOk(this.oToolbar.getControl("publish").getVisible(), "publish is not visible");
					assert.ok(this.oToolbar.getControl("restore").getVisible(), "restore is visible");
					assert.notOk(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is not visible");
					assert.notOk(this.oToolbar.getControl("appVariantOverview").getVisible(), "appVariantOverview is not visible");
					assert.notOk(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is not visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and visualizationButtonVisible is set to 'true'", function(assert) {
			this.oControlsModel.setProperty("/visualizationButtonVisible", true);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("visualizationSwitcherButton").getVisible(), "visualizationSwitcherButton is visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and visualizationButtonVisible is set to 'false'", function(assert) {
			this.oControlsModel.setProperty("/visualizationButtonVisible", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("visualizationSwitcherButton").getVisible(), "visualizationSwitcherButton is not visible");
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});