/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.require([
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/EasyAdd",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/VBox",
	"sap/m/Button"
],
function(
	DesignTime,
	CommandFactory,
	EasyAdd,
	AddElementsDialog,
	AdditionalElementsPlugin,
	OverlayRegistry,
	ObjectPageSection,
	ObjectPageLayout,
	ObjectPageSubSection,
	VBox,
	Button
) {
	"use strict";
	QUnit.start();

	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and EasyAdd plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory : new CommandFactory(),
				dialog: new AddElementsDialog({title: "hugo"}),
				analyzer : sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
			});

			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"})]
			});
			this.oSection = new ObjectPageSection("section", {
				subSections: [this.oSubSection]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				sections : [this.oSection]
			});
			this.oVBox = new VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVBox],
				plugins : [this.oEasyAddPlugin]
			});

			this.oShowAvailableElementsSpy = sandbox.spy(AdditionalElementsPlugin.prototype, "showAvailableElements");

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used on the Layout", function(assert) {
		var done = assert.async();

		var oButton = sap.ui.getCore().byId(this.oLayoutOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button of the Layout is displayed");

		this.oEasyAddPlugin.getDialog().attachOpened(function() {
			assert.ok(true, "then dialog pops up,");
			assert.equal(this.oShowAvailableElementsSpy.callCount, 1, "then showAvailableElements was called");
			assert.ok(this.oShowAvailableElementsSpy.calledWith(false, [this.oLayoutOverlay], 0, "Sections"), "then showAvailableElements was called with the right parameters");
			assert.equal(this.oEasyAddPlugin.getDialog().getTitle(), "Available Sections", "then the title is set");
			this.oEasyAddPlugin.getDialog()._cancelDialog();
			done();
		}.bind(this));
		sap.ui.qunit.QUnitUtils.triggerEvent("tap", oButton.getDomRef());
	});

	QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used on the Section", function(assert) {
		var done = assert.async();
		var oButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button of the Layout is displayed");

		this.oEasyAddPlugin.getDialog().attachOpened(function() {
			assert.ok(true, "then dialog pops up,");
			assert.equal(this.oShowAvailableElementsSpy.callCount, 1, "then showAvailableElements was called");
			assert.ok(this.oShowAvailableElementsSpy.calledWith(true, [this.oSectionOverlay], undefined, "Sections"), "then showAvailableElements was called with the right parameters");
			assert.equal(this.oEasyAddPlugin.getDialog().getTitle(), "Available Sections", "then the title is set");
			this.oEasyAddPlugin.getDialog()._cancelDialog();
			done();
		}.bind(this));
		sap.ui.qunit.QUnitUtils.triggerEvent("tap", oButton.getDomRef());
	});

	QUnit.test("when the section gets removed", function(assert) {
		this.oSection.setVisible(false);
		sap.ui.getCore().applyChanges();
		this.oEasyAddPlugin.deregisterElementOverlay(this.oSectionOverlay);

		var oButton = sap.ui.getCore().byId(this.oLayoutOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button is displayed on the layout");

		oButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-AddButton-img");
		assert.notOk(!!oButton, "then the Add-Button is not displayed on the section anymore");
	});

	QUnit.test("when the section gets added again", function(assert) {
		this.oSection.setVisible(false);
		this.oSection.setVisible(true);
		sap.ui.getCore().applyChanges();

		var oButton = sap.ui.getCore().byId(this.oLayoutOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button on the layout is still there");

		oButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button is displayed");
	});


	QUnit.module("Given a designTime and EasyAdd plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory : new CommandFactory(),
				dialog: new AddElementsDialog(),
				analyzer : sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
			});

			this.oLayout = new ObjectPageLayout("layout", {});
			this.oVBox = new VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVBox],
				plugins : [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the ObjectPageLayout has no Sections initially", function(assert) {
		var oButton = sap.ui.getCore().byId(this.oLayoutOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button is displayed on the layout");
	});


	QUnit.module("Given a designTime and AddPlugin plugin are instantiated with a OP without stableID", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new EasyAdd({
				commandFactory : new CommandFactory()
			});

			this.oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"})]
			});
			this.oSection = new ObjectPageSection({
				subSections: [this.oSubSection]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				sections : [this.oSection]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used", function(assert) {
		var oButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-AddButton");
		assert.notOk(!!oButton, "then the Add-Button is not displayed");
	});

});
