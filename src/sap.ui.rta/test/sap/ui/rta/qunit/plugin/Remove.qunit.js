/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.require([
	"sap/ui/rta/plugin/Remove",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry"
],
function(
	RemovePlugin,
	Button,
	VerticalLayout,
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry
) {
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

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and remove plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			// simulate that one overlay is selected
			this.oNumberOfOverlaysStub = sandbox.stub(RemovePlugin.prototype, "getNumberOfSelectedOverlays").returns(1);

			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"hideControl" : "default"
				},
				"sap.ui.layout.VerticalLayout" : {
					"hideControl" : "default"
				}
			});

			this.oRemovePlugin = new RemovePlugin({
				commandFactory : new CommandFactory()
			});

			this.oButton = new Button("button", {text : "Button"});
			this.oButton1 = new Button("button1", {text : "Button1"});
			this.oVerticalLayout = new VerticalLayout({
				content : [this.oButton, this.oButton1]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout],
				plugins : [this.oRemovePlugin]
			});


			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay1 = OverlayRegistry.getOverlay(this.oButton1);

				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	});

	QUnit.test("when an overlay has no remove action designTime metadata", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isAvailable(this.oButtonOverlay), false, "... then isAvailable is called, then it returns false");
		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled is called, then it returns false");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), false, "then the overlay is not editable");
	});

	QUnit.test("when an overlay has remove action designTime metadata, but has no isEnabled property defined", function(assert) {
		var done = assert.async();

		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType: "hideControl"
				}
			}
		});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isAvailable(this.oButtonOverlay), true, "... then isAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), true, "... then isEnabled is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), true, "then the overlay is editable");

		this.oRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created");
			assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
			setTimeout(function() {
				assert.ok(this.oButtonOverlay1.getSelected(), "and the second Button is selected");
				done();
			}.bind(this), 0);
		}.bind(this));
		assert.ok(true, "... when plugin removeElement is called with this overlay ...");

		this.oButtonOverlay1.setSelectable(true);
		this.oRemovePlugin.removeElement([this.oButtonOverlay]);
	});

	QUnit.test("when an overlay has remove action designTime metadata, but the control is the last visible element in an aggregation", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType: "hideControl"
				}
			}
		});

		this.oButton1.setVisible(false);

		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled returns false");
	});

	QUnit.test("when multiple overlays have remove action designTime metadata, but all visible elements in an aggregation are selected", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType: "hideControl"
				}
			}
		});

		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		this.oNumberOfOverlaysStub.restore();
		sandbox.stub(RemovePlugin.prototype, "getNumberOfSelectedOverlays").returns(2);
		assert.notOk(this.oRemovePlugin.isEnabled(this.oButtonOverlay), "... then isEnabled returns false");
	});

	QUnit.test("when an overlay has remove action designTime metadata, but the control has no parent", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType: "hideControl"
				}
			}
		});

		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		this.oButton.setParent(undefined);

		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled returns false");
	});

	QUnit.test("when an overlay has remove action designTime metadata with a confirmation text defined and is selected", function(assert) {
		var done = assert.async();

		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType : "hideControl",
					getConfirmationText : function(oElementInstance) {
						return oElementInstance.getText();
					}
				}
			}
		});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		this.oLayoutOverlay.setSelectable(true);
		this.oButtonOverlay.setSelectable(true);
		this.oButtonOverlay.setSelected(true);

		this.oRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created for selected overlay");
			assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
			done();
		});
		sap.ui.test.qunit.triggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.DELETE);
		assert.ok(true, "... when plugin removeElement is called ...");

		sap.ui.getCore().applyChanges();
		assert.strictEqual(jQuery(".sapUiRtaConfirmationDialogText").text(), "Button", "Confirmation dialog is shown with a correct text");
		sap.ui.getCore().byId(jQuery(".sapUiRtaConfirmationDialogRemoveButton")[0].id).firePress();
	});

	QUnit.test("when an overlay has remove action designTime metadata, and isEnabled property is boolean", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType : "hideControl",
					isEnabled : false
				}
			}
		});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isAvailable(this.oButtonOverlay), true, "... then isAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled is called, then it returns correct value");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has remove action designTime metadata, and isEnabled is function", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					changeType : "hideControl",
					isEnabled : function(oElementInstance) {
						return oElementInstance.getMetadata().getName() !== "sap.m.Button";
					}
				}
			}
		});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isAvailable(this.oButtonOverlay), true, "... then isAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled is called, then it returns correct value from function call");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), true, "then the overlay is editable");
	});

	QUnit.test("when an overlay has remove action designTime metadata, and isEnabled property is boolean", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions : {
				remove : {
					isEnabled : false
				}
			}
		});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isAvailable(this.oButtonOverlay), false, "... then isAvailable is called, then it returns false");
		assert.strictEqual(this.oRemovePlugin.isEnabled(this.oButtonOverlay), false, "... then isEnabled is called, then it returns correct value");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), false, "then the overlay is not editable");

		var bIsAvailable = true;

		sandbox.stub(this.oRemovePlugin, "isAvailable", function(oOverlay){
			assert.equal(oOverlay, this.oButtonOverlay, "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		}.bind(this));
		sandbox.stub(this.oRemovePlugin, "handler", function(aSelectedOverlays){
			assert.deepEqual(aSelectedOverlays, [this.oButtonOverlay], "the 'handler' method is called with the right overlays");
		}.bind(this));
		sandbox.stub(this.oRemovePlugin, "isEnabled", function(oOverlay){
			assert.equal(oOverlay, this.oButtonOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
		}.bind(this));

		var aMenuItems = this.oRemovePlugin.getMenuItems(this.oButtonOverlay);
		assert.equal(aMenuItems[0].id, "CTX_REMOVE", "'getMenuItems' returns the context menu item for the plugin");

		aMenuItems[0].handler([this.oButtonOverlay]);
		aMenuItems[0].enabled(this.oButtonOverlay);

		bIsAvailable = false;
		assert.equal(this.oRemovePlugin.getMenuItems(this.oButtonOverlay).length, 0, "and if the plugin is not enabled, no menu entries are returned");
	});

	QUnit.test("when an overlay has no remove action designTime metadata and removeElement() is called (via delete button)", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({});
		this.oButtonOverlay.setSelectable(true);
		this.oButtonOverlay.setSelected(true);
		this.oRemovePlugin._handleRemove = sinon.spy();
		this.oRemovePlugin.removeElement();

		assert.ok(this.oRemovePlugin._handleRemove.notCalled, "then element was filtered and internal '_handleRemove()' is not called");
	});


	QUnit.module("Given a designTime and a Layout with 3 Buttons in it, when _getElementToFocus is called...", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"hideControl" : "default"
				},
				"sap.ui.layout.VerticalLayout" : {
					"hideControl" : "default"
				}
			});

			this.oButton1 = new Button("button1", {text : "Button1"});
			this.oButton2 = new Button("button2", {text : "Button2"});
			this.oButton3 = new Button("button3", {text : "Button3"});
			this.oVerticalLayout = new VerticalLayout({
				content : [this.oButton1, this.oButton2, this.oButton3]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout]
			});


			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oButtonOverlay2 = OverlayRegistry.getOverlay(this.oButton2);
				this.oButtonOverlay3 = OverlayRegistry.getOverlay(this.oButton3);

				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test(" with the first button", function(assert) {
		assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay1]).getId(), this.oButtonOverlay2.getId(), "then the second button is returned");
	});

	QUnit.test(" with the second button", function(assert) {
		assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay2]).getId(), this.oButtonOverlay3.getId(), "then the second button is returned");
	});

	QUnit.test(" with the third button", function(assert) {
		assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay3]).getId(), this.oButtonOverlay2.getId(), "then the second button is returned");
	});

	QUnit.test(" with two buttons", function(assert) {
		assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay1, this.oButtonOverlay2]).getId(), this.oLayoutOverlay.getId(), "then the second button is returned");
	});

	QUnit.test(" with the second button and the third hidden", function(assert) {
		this.oButton3.setVisible(false);
		assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay2]).getId(), this.oButtonOverlay1.getId(), "then the second button is returned");
	});

});
