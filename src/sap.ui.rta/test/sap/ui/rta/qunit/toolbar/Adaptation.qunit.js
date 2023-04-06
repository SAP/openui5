/*global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	RtaQunitUtils,
	Core,
	ContextBasedAdaptationsAPI,
	Settings,
	Version,
	VersionsAPI,
	Layer,
	VerticalLayout,
	JSONModel,
	AppVariantFeature,
	Adaptation,
	BaseToolbar,
	RuntimeAuthoring,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given Versions Model binding & formatter", {
		before: function () {
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When switching versions is possible", function (assert) {
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
					assert.ok(this.oToolbar.getControl("versionButton").getEnabled(), "then the version button is enabled");
				}.bind(this));
		});

		QUnit.test("When switching versions is not possible", function (assert) {
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
					this.oVersionButton = this.oToolbar.getControl("versionButton");
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "then the version button is not visible");
				}.bind(this));
		});

		QUnit.test("When adaptation toolbar is given including save button", function(assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oToolbar.setModel(this.oVersionsModel, "versions");

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					assert.strictEqual(this.oToolbar.getControl("save").getTooltip(), "Save", "then without versioning enabled tooltip on save button is correct");
					this.oVersionsModel.setProperty("/versioningEnabled", true);
					assert.strictEqual(this.oToolbar.getControl("save").getTooltip(), "Save Draft", "then with versioning enabled tooltip on save button is correct");
				}.bind(this));
		});
	});

	QUnit.module("Given Adaptation Model binding & formatter", {
		before: function () {
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When no context-based adaptation is available", function (assert) {
			this.oAdaptationsModel = new JSONModel({
				adaptations: [],
				count: 0,
				displayedAdaptation: {}
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					assert.ok(this.oToolbar.getControl("contextBasedAdaptationMenu").getEnabled(), "then the context-based adaptation menu is enabled");
					assert.strictEqual(this.oToolbar.getControl("contextBasedAdaptationMenu").getText(), "Adapting for 'All Users'", "then the menu text is rendered correctly ");
				}.bind(this));
		});

		QUnit.test("When two context-based adaptation are available", function (assert) {
			this.oAdaptationsModel = new JSONModel({
				adaptations: [{title: "Sales"}, {title: "Manager"}],
				count: 2,
				displayedAdaptation: {title: "Sales"}
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					assert.ok(this.oToolbar.getControl("contextBasedAdaptationMenu").getEnabled(), "then the context-based adaptation menu is enabled");
					assert.strictEqual(this.oToolbar.getControl("contextBasedAdaptationMenu").getText(), "Adapting for 'Sales'", "then the menu text is rendered correctly ");
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
			this.oControlsModel = RtaQunitUtils.createToolbarControlsModel();
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
			this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", false);
			this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
			this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", false);
			this.oToolbar.animation = false;

			var oGetOverviewStub;
			var oSaveAsStub;
			return this.oToolbar.show()
				.then(function() {
					oGetOverviewStub = sandbox.stub(AppVariantFeature, "onGetOverview");
					oSaveAsStub = sandbox.stub(AppVariantFeature, "onSaveAs");
					return RtaQunitUtils.showActionsMenu(this.oToolbar);
				}.bind(this))
				.then(function () {
					var oSaveAsButton = this.oToolbar.getControl("saveAs");
					var oManageAppsButton = this.oToolbar.getControl("manageApps");
					var oOverviewButton = this.oToolbar.getControl("appVariantOverview");

					assert.notOk(oSaveAsButton.getVisible(), "saveAs is not visible");
					assert.notOk(oOverviewButton.getVisible(), "appVariantOverview is not visible");
					assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");

					this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", false);
					this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", false);
					assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
					assert.notOk(oSaveAsButton.getEnabled(), "saveAs is not enabled");
					assert.notOk(oOverviewButton.getVisible(), "AppVariantOverview is not visible");
					assert.ok(oManageAppsButton.getVisible(), "manageApps is visible");
					assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

					this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", true);
					this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", true);
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

					this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", true);
					this.oControlsModel.setProperty("/appVariantMenu/overview/visible", true);
					this.oControlsModel.setProperty("/appVariantMenu/overview/enabled", true);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", false);
					this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", false);
					assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
					assert.ok(oSaveAsButton.getEnabled(), "saveAs is enabled");
					assert.ok(oOverviewButton.getVisible(), "AppVariantOverview is visible");
					assert.ok(oOverviewButton.getEnabled(), "AppVariantOverview is enabled");
					assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");
					assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

					oOverviewButton.getItems()[0].firePress();
					assert.strictEqual(oGetOverviewStub.callCount, 2, "the overview function was called");
					assert.strictEqual(oGetOverviewStub.lastCall.args[0], true, "the first agrument is true");
					assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");

					oOverviewButton.getItems()[1].firePress();
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
				restore: {
					visible: true
				},
				appVariantMenu: {
					overview: {
						visible: true
					},
					saveAs: {
						visible: true
					},
					manageApps: {
						visible: true
					}
				},
				visualizationButton: {
					visible: false
				}
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
					assert.ok(this.oToolbar.getControl("undo").getVisible(), "undo is visible");
					assert.ok(this.oToolbar.getControl("redo").getVisible(), "redo is visible");
					assert.notOk(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is not visible");
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is visible");
					assert.ok(this.oToolbar.getControl("activate").getVisible(), "activate is visible");
					assert.ok(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is visible");

					return RtaQunitUtils.showActionsMenu(this.oToolbar);
				}.bind(this))
				.then(function () {
					assert.ok(this.oToolbar.getControl("restore").getVisible(), "restore is visible");
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
					assert.notOk(this.oToolbar.getControl("undo").getVisible(), "undo is not visible");
					assert.notOk(this.oToolbar.getControl("redo").getVisible(), "redo is not visible");
					assert.notOk(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is not visible");
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is not visible");
					assert.notOk(this.oToolbar.getControl("activate").getVisible(), "activate is not visible");
					assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is not visible");
					assert.notOk(this.oToolbar.getControl("actionsMenu").getVisible(), "actionsMenu is not visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and mode is set to 'visualization'", function(assert) {
			this.oControlsModel.setProperty("/modeSwitcher", "visualization");
			this.oVersionsModel.setProperty("/versioningEnabled", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("undo").getVisible(), "undo is not visible");
					assert.notOk(this.oToolbar.getControl("redo").getVisible(), "redo is not visible");
					assert.ok(this.oToolbar.getControl("toggleChangeVisualizationMenuButton").getVisible(), "toggleChangeVisualizationMenuButton is visible");
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is not visible");
					assert.notOk(this.oToolbar.getControl("activate").getVisible(), "activate is not visible");
					assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is not visible");
					assert.notOk(this.oToolbar.getControl("actionsMenu").getVisible(), "actionsMenu is not visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and visualizationButton visible property is set to 'true'", function(assert) {
			this.oControlsModel.setProperty("/visualizationButton/visible", true);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("visualizationSwitcherButton").getVisible(), "visualizationSwitcherButton is visible");
				}.bind(this));
		});

		QUnit.test("Given a toolbar is created and visualizationButton visible property is set to 'false'", function(assert) {
			this.oControlsModel.setProperty("/visualizationButton/visible", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("visualizationSwitcherButton").getVisible(), "visualizationSwitcherButton is not visible");
				}.bind(this));
		});
	});

	function createAndStartRTA() {
		this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		var oButton = new Button("testButton");
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
			.then(function() {
				this.oToolbar = this.oRta.getToolbar();
			}.bind(this));
	}

	QUnit.module("Different screen sizes and common buttons", {
		beforeEach: function() {
			this.oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(BaseToolbar.prototype, "placeToContainer").callsFake(function() {
				this.placeAt("qunit-fixture");
			});
			var oVersionsModel = new JSONModel({
				versioningEnabled: true
			});
			oVersionsModel.setDirtyChanges = function() {};
			sandbox.stub(VersionsAPI, "initialize").resolves(oVersionsModel);
		},
		afterEach: function() {
			this.oContainer.destroy();
			this.oComponent.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in a wide window (1200px)", function(assert) {
			document.getElementById("qunit-fixture").style.width = "1200px";
			return createAndStartRTA.call(this)
				.then(function() {
					var oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					var oNavigationSwitcherButton = this.oToolbar.getControl("navigationSwitcherButton");
					var oVisualizationSwitcherButton = this.oToolbar.getControl("visualizationSwitcherButton");
					assert.strictEqual(
						oAdaptationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_ADAPTATION"),
						"the adaptation button shows the right text"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_NAVIGATION"),
						"the navigation button shows the right text"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_VISUALIZATION"),
						"the visualization button shows the right text"
					);
					assert.strictEqual(this.oToolbar.getControl("save").getIcon(), "sap-icon://save", "the save button has save icon");
					assert.notOk(this.oToolbar.getControl("save").getText(), "the save button has no text");
					assert.strictEqual(this.oToolbar.getControl("exit").getIcon(), "sap-icon://decline", "the exit button has decline icon");
					assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
					return RtaQunitUtils.showActionsMenu(this.oToolbar);
				}.bind(this))
				.then(function () {
					assert.strictEqual(this.oToolbar.getControl("restore").getIcon(), "sap-icon://reset", "the reset button has reset icon");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in a narrow window (600px)", function(assert) {
			var fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "600px";
			var oSwitchIconsStub = sandbox.stub(Adaptation.prototype, "_switchToIcons")
				.callsFake(function() {
					oSwitchIconsStub.wrappedMethod.apply(this.oToolbar, arguments);
					var oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					var oNavigationSwitcherButton = this.oToolbar.getControl("navigationSwitcherButton");
					var oVisualizationSwitcherButton = this.oToolbar.getControl("visualizationSwitcherButton");
					assert.strictEqual(
						oAdaptationSwitcherButton.getText(),
						"",
						"the adaptation button has no text"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getText(),
						"",
						"the navigation button has no text"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getText(),
						"",
						"the visualization button has no text"
					);
					assert.strictEqual(
						oAdaptationSwitcherButton.getIcon(),
						"sap-icon://wrench",
						"the adaptation button has the right icon"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getIcon(),
						"sap-icon://explorer",
						"the navigation button has the right icon"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getIcon(),
						"sap-icon://show",
						"the visualization button has the right icon"
					);
					fnDone();
				}.bind(this));
			return createAndStartRTA.call(this);
		});

		QUnit.test("when the toolbar gets initially shown in a wide window (1200px), then reduced to 600px and then expanded to 1600px", function(assert) {
			var fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "1200px";

			var fnCheckIcon = function() {
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getText(),
					"",
					"the adaptation button has no text"
				);
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getIcon(),
					"sap-icon://wrench",
					"the adaptation button has an icon"
				);
			};

			var fnCheckText = function() {
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getText(),
					this.oTextResources.getText("BTN_ADAPTATION"),
					"the adaptation button shows text"
				);
			};

			var oSwitchIconsStub = sandbox.stub(Adaptation.prototype, "_switchToIcons")
				.callsFake(function() {
					oSwitchIconsStub.wrappedMethod.apply(this.oToolbar, arguments);
					fnCheckIcon.call(this);
					var oSwitchTextsStub = sandbox.stub(Adaptation.prototype, "_switchToTexts").callsFake(function() {
						oSwitchTextsStub.wrappedMethod.apply(this.oToolbar, arguments);
						fnCheckText.call(this);
						fnDone();
					}.bind(this));
					document.getElementById("qunit-fixture").style.width = "1200px";
					window.dispatchEvent(new Event('resize'));
				}.bind(this));

			return createAndStartRTA.call(this)
				.then(function() {
					this.oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					fnCheckText.call(this);
					document.getElementById("qunit-fixture").style.width = "600px";
				}.bind(this));
		});
	});

	QUnit.module("Different screen sizes and common buttons with context-based adaptation enabled", {
		beforeEach: function() {
			this.oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(BaseToolbar.prototype, "placeToContainer").callsFake(function() {
				this.placeAt("qunit-fixture");
			});
			var oVersionsModel = new JSONModel({
				versioningEnabled: true
			});
			oVersionsModel.setDirtyChanges = function() {};
			var oAdaptationsModel = new JSONModel({
				adaptations: [],
				count: 0,
				displayedAdaptation: {}
			});
			sandbox.stub(Settings.prototype, "isContextBasedAdaptationEnabled").resolves(true);
			sandbox.stub(ContextBasedAdaptationsAPI, "initialize").resolves(oAdaptationsModel);
			sandbox.stub(VersionsAPI, "initialize").resolves(oVersionsModel);
		},
		afterEach: function() {
			this.oContainer.destroy();
			this.oComponent.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in a wide window (1200px)", function(assert) {
			document.getElementById("qunit-fixture").style.width = "1200px";
			return createAndStartRTA.call(this)
				.then(function() {
					var oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					var oNavigationSwitcherButton = this.oToolbar.getControl("navigationSwitcherButton");
					var oVisualizationSwitcherButton = this.oToolbar.getControl("visualizationSwitcherButton");
					assert.strictEqual(
						oAdaptationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_ADAPTATION"),
						"the adaptation button shows the right text"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_NAVIGATION"),
						"the navigation button shows the right text"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getText(),
						this.oTextResources.getText("BTN_VISUALIZATION"),
						"the visualization button shows the right text"
					);
					assert.strictEqual(this.oToolbar.getControl("save").getIcon(), "sap-icon://save", "the save button has save icon");
					assert.notOk(this.oToolbar.getControl("save").getText(), "the save button has no text");
					assert.strictEqual(this.oToolbar.getControl("exit").getIcon(), "sap-icon://decline", "the exit button has decline icon");
					assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
					return RtaQunitUtils.showActionsMenu(this.oToolbar);
				}.bind(this))
				.then(function () {
					assert.strictEqual(this.oToolbar.getControl("restore").getIcon(), "sap-icon://reset", "the reset button has reset icon");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in a narrow window (600px)", function(assert) {
			var fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "600px";
			var oSwitchIconsStub = sandbox.stub(Adaptation.prototype, "_switchToIcons")
				.callsFake(function() {
					oSwitchIconsStub.wrappedMethod.apply(this.oToolbar, arguments);
					var oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					var oNavigationSwitcherButton = this.oToolbar.getControl("navigationSwitcherButton");
					var oVisualizationSwitcherButton = this.oToolbar.getControl("visualizationSwitcherButton");
					assert.strictEqual(
						oAdaptationSwitcherButton.getText(),
						"",
						"the adaptation button has no text"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getText(),
						"",
						"the navigation button has no text"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getText(),
						"",
						"the visualization button has no text"
					);
					assert.strictEqual(
						oAdaptationSwitcherButton.getIcon(),
						"sap-icon://wrench",
						"the adaptation button has the right icon"
					);
					assert.strictEqual(
						oNavigationSwitcherButton.getIcon(),
						"sap-icon://explorer",
						"the navigation button has the right icon"
					);
					assert.strictEqual(
						oVisualizationSwitcherButton.getIcon(),
						"sap-icon://show",
						"the visualization button has the right icon"
					);
					fnDone();
				}.bind(this));
			return createAndStartRTA.call(this);
		});

		QUnit.test("when the toolbar gets initially shown in a wide window (1200px), then reduced to 600px and then expanded to 1600px", function(assert) {
			var fnDone = assert.async();
			document.getElementById("qunit-fixture").style.width = "1200px";

			var fnCheckIcon = function() {
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getText(),
					"",
					"the adaptation button has no text"
				);
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getIcon(),
					"sap-icon://wrench",
					"the adaptation button has an icon"
				);
			};

			var fnCheckText = function() {
				assert.strictEqual(
					this.oAdaptationSwitcherButton.getText(),
					this.oTextResources.getText("BTN_ADAPTATION"),
					"the adaptation button shows text"
				);
			};

			var oSwitchIconsStub = sandbox.stub(Adaptation.prototype, "_switchToIcons")
				.callsFake(function() {
					oSwitchIconsStub.wrappedMethod.apply(this.oToolbar, arguments);
					fnCheckIcon.call(this);
					var oSwitchTextsStub = sandbox.stub(Adaptation.prototype, "_switchToTexts").callsFake(function() {
						oSwitchTextsStub.wrappedMethod.apply(this.oToolbar, arguments);
						fnCheckText.call(this);
						fnDone();
					}.bind(this));
					document.getElementById("qunit-fixture").style.width = "1200px";
					window.dispatchEvent(new Event('resize'));
				}.bind(this));

			return createAndStartRTA.call(this)
				.then(function() {
					this.oAdaptationSwitcherButton = this.oToolbar.getControl("adaptationSwitcherButton");
					fnCheckText.call(this);
					document.getElementById("qunit-fixture").style.width = "600px";
				}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});