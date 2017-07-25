/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.qunit.QUnitUtils");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.uxap.ObjectPageSection");
jQuery.sap.require("sap.uxap.ObjectPageLayout");
jQuery.sap.require("sap.uxap.ObjectPageSubSection");
jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

jQuery.sap.require("sap.ui.rta.plugin.EasyRemove");

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
		},
		getModel: function () {}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.module("Given a designTime and EasyRemove plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.uxap.ObjectPageSection" : {
					"stashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				}
			});

			this.oEasyRemovePlugin = new sap.ui.rta.plugin.EasyRemove({
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});

			this.oSubSection = new sap.uxap.ObjectPageSubSection("subsection", {
				blocks: [new sap.m.Button({text: "abc"})]
			});
			this.oSection = new sap.uxap.ObjectPageSection("section", {
				subSections: [this.oSubSection]
			});
			this.oLayout = new sap.uxap.ObjectPageLayout("layout", {
				sections : [this.oSection]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oEasyRemovePlugin]
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

	QUnit.test("when an ObjectPageSection is rendered and the EasyRemovePlugin is used", function(assert) {
		var done = assert.async();

		this.oEasyRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created");
			assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
			done();
		});

		var oIcon = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-DeleteIcon");
		assert.ok(oIcon, "then the Delete-Icon is displayed");

		sap.ui.qunit.QUnitUtils.triggerEvent("click", oIcon.getDomRef());
	});


	QUnit.module("Given a designTime and EasyRemove plugin are instantiated with a OP-Section without stableID", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.uxap.ObjectPageSection" : {
					"stashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				}
			});

			this.oEasyRemovePlugin = new sap.ui.rta.plugin.EasyRemove({
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
				plugins : [this.oEasyRemovePlugin]
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

	QUnit.test("when an ObjectPageSection is rendered and the EasyRemovePlugin is used", function(assert) {
		var oIcon = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-DeleteIcon");
		assert.notOk(oIcon, "then the Delete-Icon is not displayed");
	});

})();
