/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/EasyRemove",
	"sap/ui/dt/OverlayRegistry",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon"
],
function(
	QUnitUtils,
	DesignTime,
	CommandFactory,
	EasyRemove,
	OverlayRegistry,
	ObjectPageSection,
	ObjectPageLayout,
	ObjectPageSubSection,
	Button,
	sinon
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

			this.oEasyRemovePlugin = new EasyRemove({
				commandFactory : new CommandFactory()
			});

			//	layout
			//		section
			//			subsection
			//				Button
			//		section2
			//			subsection2
			//				Button
			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "firstSubSection"})]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "secondSubSection"})]
			});
			this.oSection = new ObjectPageSection("section", {
				subSections: [oSubSection]
			});
			this.oSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				sections : [this.oSection, this.oSection2]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oEasyRemovePlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oSectionOverlay = OverlayRegistry.getOverlay(this.oSection);
				this.oSectionOverlay2 = OverlayRegistry.getOverlay(this.oSection2);
				done();
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when an ObjectPageSection is rendered and the EasyRemovePlugin is used", function(assert) {
			var done = assert.async();

			this.oEasyRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created");
				assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
				done();
			});

			var oDeleteButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-DeleteIcon");
			QUnitUtils.triggerEvent("tap", oDeleteButton.getDomRef());
		});

		QUnit.test("when an ObjectPageSection is rendered and one section gets removed", function(assert) {
			var oDeleteButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-DeleteIcon");
			var oDeleteButton2 = sap.ui.getCore().byId(this.oSectionOverlay2.getId() + "-DeleteIcon");

			assert.ok(oDeleteButton, "then the 1st Delete-Icon is displayed");
			assert.ok(oDeleteButton.getEnabled(), "and enabled");
			assert.ok(oDeleteButton2, "then the 2nd Delete-Icon is displayed");
			assert.ok(oDeleteButton2.getEnabled(), "and enabled");

			this.oSection.setVisible(false);
			sap.ui.getCore().applyChanges();

			assert.ok(oDeleteButton2, "after removing the 1st section, the 2nd Delete-Icon is still displayed");
			assert.notOk(oDeleteButton2.getEnabled(), "but disabled");
		});

		QUnit.test("when the overlay for the section gets deregistered", function(assert) {
			var sControlStyleClass = "sapUiRtaPersDelete";
			assert.ok(this.oSectionOverlay.hasStyleClass(sControlStyleClass), "initially the style class got set on the section");

			this.oEasyRemovePlugin.deregisterElementOverlay(this.oSectionOverlay);
			assert.ok(this.oSectionOverlay._oDeleteButton.bIsDestroyed, "after deregistering, the easy add button got destroyed");
			assert.notOk(this.oSectionOverlay.hasStyleClass(sControlStyleClass), "and the style class got deleted");
		});
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

			this.oEasyRemovePlugin = new EasyRemove({
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
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oEasyRemovePlugin]
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
	}, function() {
		QUnit.test("when an ObjectPageSection is rendered and the EasyRemovePlugin is used", function(assert) {
			var oDeleteButton = sap.ui.getCore().byId(this.oSectionOverlay.getId() + "-DeleteIcon");
			assert.notOk(oDeleteButton, "then the Delete-Icon is not displayed");
		});
	});
});
