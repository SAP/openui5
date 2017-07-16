/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.qunit.QUnitUtils");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

// jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.m.VBox");
jQuery.sap.require("sap.uxap.ObjectPageSection");
jQuery.sap.require("sap.uxap.ObjectPageLayout");
jQuery.sap.require("sap.uxap.ObjectPageSubSection");
jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
jQuery.sap.require("sap.ui.rta.plugin.additionalElements.AddElementsDialog");
jQuery.sap.require("sap.ui.rta.plugin.EasyAdd");

(function() {
	"use strict";

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
		}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.module("Given a designTime and EasyAdd plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oEasyAddPlugin = new sap.ui.rta.plugin.EasyAdd({
				commandFactory : new sap.ui.rta.command.CommandFactory(),
				dialog: new sap.ui.rta.plugin.additionalElements.AddElementsDialog({title: "hugo"}),
				analyzer : sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
			});

			this.oSubSection = new sap.uxap.ObjectPageSubSection("subsection", {
				blocks: [new sap.m.Button({text: "abc"})]
			});
			this.oSection = new sap.uxap.ObjectPageSection("section", {
				subSections: [this.oSubSection]
			});
			this.oLayout = new sap.uxap.ObjectPageLayout("layout", {
				sections : [this.oSection]
			});
			this.oVBox = new sap.m.VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVBox],
				plugins : [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSection);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an ObjectPageSection is rendered and the EasyAddPlugin is used", function(assert) {
		var done = assert.async();
		var oButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button is displayed on the Section");

		oButton = sap.ui.getCore().byId(this.oLayoutOverlay.getId() + "-AddButton-img");
		assert.ok(!!oButton, "then the Add-Button of the Layout is displayed");

		this.oEasyAddPlugin.getDialog().attachOpened(function() {
			assert.ok(true, "then dialog pops up,");
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

			this.oEasyAddPlugin = new sap.ui.rta.plugin.EasyAdd({
				commandFactory : new sap.ui.rta.command.CommandFactory(),
				dialog: new sap.ui.rta.plugin.additionalElements.AddElementsDialog(),
				analyzer : sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
			});

			this.oLayout = new sap.uxap.ObjectPageLayout("layout", {});
			this.oVBox = new sap.m.VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVBox],
				plugins : [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSection);
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

			this.oEasyAddPlugin = new sap.ui.rta.plugin.EasyAdd({
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});

			this.oSubSection = new sap.uxap.ObjectPageSubSection("subsection", {
				blocks: [new sap.m.Button({text: "abc"})]
			});
			this.oSection = new sap.uxap.ObjectPageSection({
				subSections: [this.oSubSection]
			});
			this.oLayout = new sap.uxap.ObjectPageLayout("layout", {
				sections : [this.oSection]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oEasyAddPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSection);
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

})();
