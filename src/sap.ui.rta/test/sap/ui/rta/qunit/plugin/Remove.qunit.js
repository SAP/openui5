/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function (
	RemovePlugin,
	Utils,
	CommandFactory,
	Button,
	VerticalLayout,
	DesignTime,
	OverlayRegistry,
	ChangeRegistry,
	FlUtils,
	QUnitUtils,
	Log,
	sinon
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
	var oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and remove plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					hideControl : "default"
				},
				"sap.ui.layout.VerticalLayout" : {
					hideControl : "default"
				}
			})
			.then(function() {
				this.oRemovePlugin = new RemovePlugin({
					commandFactory : new CommandFactory()
				});
				this.oButton = new Button("button", {text : "Button"});
				this.oButton1 = new Button("button1", {text : "Button1"});
				this.oVerticalLayout = new VerticalLayout({
					content : [this.oButton, this.oButton1]
				}).placeAt("qunit-fixture");
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
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function () {
		QUnit.test("when an overlay has no remove action designTime metadata", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({});
			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

			assert.strictEqual(this.oRemovePlugin.isAvailable([this.oButtonOverlay]), false, "... then isAvailable is called, then it returns false");
			assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled is called, then it returns false");
			return Promise.resolve()
				.then(this.oRemovePlugin._isEditable.bind(this.oRemovePlugin, this.oButtonOverlay))
				.then(function(bEditable) {
					assert.strictEqual(bEditable, false, "then the overlay is not editable");
				});
		});

		QUnit.test("when an overlay has remove action designTime metadata, but has no isEnabled property defined", function(assert) {
			var done = assert.async(2);

			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType: "hideControl"
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRemovePlugin.isAvailable([this.oButtonOverlay]), true, "... then isAvailable is called, then it returns true");
				assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), true, "... then isEnabled is called, then it returns true");
				this.oRemovePlugin._isEditable(this.oButtonOverlay)
					.then(function(bEditable) {
						assert.strictEqual(bEditable, true, "then the overlay is editable");
						done();
					});
			}.bind(this));

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

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

		QUnit.test("when an overlay has remove action defined on a responsible element", function(assert) {
			var done = assert.async();

			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					getResponsibleElement: function (oElement) {
						if (oElement === this.oButton) {
							return this.oButton1;
						}
					}.bind(this)
				}
			});

			this.oRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
				var oRemoveCommand = oEvent.getParameter("command").getCommands()[0];
				assert.equal(this.oButton1.getId(), oRemoveCommand.getSelector().id, "then a command is created for the responsible element");
				assert.equal(oRemoveCommand.getName(), "remove", "then a remove command was created");
				done();
			}.bind(this));

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

			assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled returns false");
		});

		QUnit.test("when remove is not available for all elements in the same aggregation (empty aggregation use-case)", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType: "hideControl"
					}
				}
			});

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

			assert.notOk(this.oRemovePlugin.isEnabled([this.oButtonOverlay, this.oButtonOverlay1]), "... then isEnabled returns false");
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

			assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled returns false");
		});

		QUnit.test("when an overlay has remove action with changeOnRelevantContainer true, but the control's relevant container doesn't have stable ID", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType: "hideControl",
						changeOnRelevantContainer: true
					}
				}
			});

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

			sandbox.stub(this.oRemovePlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oLayoutOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			sandbox.stub(this.oButtonOverlay, "getRelevantContainer").returns(this.oVerticalLayout);
			return this.oRemovePlugin._isEditable(this.oButtonOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, false, "... then _isEditable returns false");
				});
		});

		QUnit.test("when an overlay has remove action designTime metadata with a confirmation text defined and is selected", function (assert) {
			var done = assert.async();
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType : "hideControl",
						getConfirmationText : function (oElementInstance) {
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

			sandbox.stub(Utils, "openRemoveConfirmationDialog").resolves(true);

			this.oRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
				assert.notOk(this.oButtonOverlay.getSelected(), "the overlay was deselected");
				var oCompositeCommand = oEvent.getParameter("command");
				assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created for selected overlay");
				assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
				done();
			}, this);

			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.DELETE);
			assert.ok(true, "... when plugin removeElement is called ...");
		});

		QUnit.test("when an overlay has remove action designTime metadata with a confirmation text defined and is selected and cancel is pressed", function (assert) {
			var done = assert.async();
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType : "hideControl",
						getConfirmationText : function (oElementInstance) {
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

			sandbox.stub(this.oRemovePlugin, "_fireElementModified").callsFake(function(oCompositeCommand) {
				assert.equal(oCompositeCommand.getCommands(), 0, "there is no command added");
				assert.ok(this.oButtonOverlay.getSelected(), "the button is selected again");
				done();
			}.bind(this));
			sandbox.stub(Utils, "openRemoveConfirmationDialog").resolves(false);

			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.DELETE);
			assert.ok(true, "... when plugin removeElement is called ...");
		});

		QUnit.test("when an overlay has remove action designTime metadata, and isEnabled property is boolean", function(assert) {
			var done = assert.async();
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType : "hideControl",
						isEnabled : false
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRemovePlugin.isAvailable([this.oButtonOverlay]), true, "... then isAvailable is called, then it returns true");
				assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled is called, then it returns correct value");
				this.oRemovePlugin._isEditable(this.oButtonOverlay)
					.then(function(bEditable) {
						assert.strictEqual(bEditable, true, "then the overlay is editable");
						done();
					});
			}.bind(this));

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
		});

		QUnit.test("when an overlay has remove action designTime metadata, and isEnabled is function", function(assert) {
			var done = assert.async();
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
			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRemovePlugin.isAvailable([this.oButtonOverlay]), true, "... then isAvailable is called, then it returns true");
				assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled is called, then it returns correct value from function call");
				this.oRemovePlugin._isEditable(this.oButtonOverlay)
					.then(function(bEditable) {
						assert.strictEqual(bEditable, true, "then the overlay is editable");
						done();
					});
			}.bind(this));

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
		});

		QUnit.test("when an overlay has remove action designTime metadata, and isEnabled property is boolean", function(assert) {
			var done = assert.async(2);
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						isEnabled : false
					}
				}
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRemovePlugin.isAvailable([this.oButtonOverlay]), false, "... then isAvailable is called, then it returns false");
				assert.strictEqual(this.oRemovePlugin.isEnabled([this.oButtonOverlay]), false, "... then isEnabled is called, then it returns correct value");
				Promise.resolve()
					.then(this.oRemovePlugin._isEditable.bind(this.oRemovePlugin, this.oButtonOverlay))
					.then(function(bEditable) {
						assert.strictEqual(bEditable, false, "then the overlay is not editable");
						done();
					});

				var bIsAvailable = true;

				sandbox.stub(this.oRemovePlugin, "isAvailable").callsFake(function (aElementOverlays) {
					assert.equal(aElementOverlays[0].getId(), this.oButtonOverlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
					return bIsAvailable;
				}.bind(this));
				sandbox.stub(this.oRemovePlugin, "handler").callsFake(function (aElementOverlays) {
					assert.deepEqual(aElementOverlays, [this.oButtonOverlay], "the 'handler' method is called with the right overlays");
				}.bind(this));
				sandbox.stub(this.oRemovePlugin, "isEnabled").callsFake(function (aElementOverlays) {
					assert.equal(aElementOverlays[0].getId(), this.oButtonOverlay.getId(), "the 'enabled' function calls isEnabled with the correct overlay");
				}.bind(this));

				var aMenuItems = this.oRemovePlugin.getMenuItems([this.oButtonOverlay]);
				assert.equal(aMenuItems[0].id, "CTX_REMOVE", "'getMenuItems' returns the context menu item for the plugin");

				aMenuItems[0].handler([this.oButtonOverlay]);
				aMenuItems[0].enabled([this.oButtonOverlay]);

				bIsAvailable = false;
				assert.equal(this.oRemovePlugin.getMenuItems([this.oButtonOverlay]).length, 0, "and if the plugin is not enabled, no menu entries are returned");
				done();
			}.bind(this));

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
		});

		QUnit.test("when an overlay has no remove action designTime metadata and removeElement() is called (via delete button)", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({});
			this.oButtonOverlay.setSelectable(true);
			this.oButtonOverlay.setSelected(true);
			this.oRemovePlugin._handleRemove = sinon.spy();
			this.oRemovePlugin.removeElement();

			assert.ok(this.oRemovePlugin._handleRemove.notCalled, "then element was filtered and internal '_handleRemove()' is not called");
		});

		QUnit.test("when the handler is called but '_getRemoveCommand' throws an error", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions : {
					remove : {
						changeType : "hideControl"
					}
				}
			});
			this.oButtonOverlay.setSelectable(true);
			this.oButtonOverlay.setSelected(true);
			sandbox.stub(this.oRemovePlugin, "_getRemoveCommand").rejects();
			var oErrorLogStub = sandbox.stub(Log, "error");
			var oFireElementModifiedStub = sandbox.stub(this.oRemovePlugin, "_fireElementModified");

			return this.oRemovePlugin.handler([this.oButtonOverlay]).then(function() {
				assert.equal(oErrorLogStub.callCount, 1, "an error was logged");
				assert.equal(oFireElementModifiedStub.callCount, 0, "no event was fired");
				assert.notOk(this.oButtonOverlay.getSelected(), "the overlay was not selected again");
			}.bind(this));
		});
	});

	QUnit.module("Given a designTime and a Layout with 3 Buttons in it, when _getElementToFocus is called...", {
		beforeEach : function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					hideControl : "default"
				},
				"sap.ui.layout.VerticalLayout" : {
					hideControl : "default"
				}
			})
			.then(function() {
				this.oButton1 = new Button("button1", {text : "Button1"});
				this.oButton2 = new Button("button2", {text : "Button2"});
				this.oButton3 = new Button("button3", {text : "Button3"});
				this.oVerticalLayout = new VerticalLayout({
					content : [this.oButton1, this.oButton2, this.oButton3]
				}).placeAt("qunit-fixture");
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
			}.bind(this));
		},
		afterEach: function () {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test(" with the first button", function (assert) {
			assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay1]).getId(), this.oButtonOverlay2.getId(), "then the second button is returned");
		});

		QUnit.test(" with the second button", function (assert) {
			assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay2]).getId(), this.oButtonOverlay3.getId(), "then the second button is returned");
		});

		QUnit.test(" with the third button", function (assert) {
			assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay3]).getId(), this.oButtonOverlay2.getId(), "then the second button is returned");
		});

		QUnit.test(" with two buttons", function (assert) {
			assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay1, this.oButtonOverlay2]).getId(), this.oLayoutOverlay.getId(), "then the second button is returned");
		});

		QUnit.test(" with the second button and the third hidden", function (assert) {
			this.oButton3.setVisible(false);
			assert.equal(RemovePlugin._getElementToFocus([this.oButtonOverlay2]).getId(), this.oButtonOverlay1.getId(), "then the second button is returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});