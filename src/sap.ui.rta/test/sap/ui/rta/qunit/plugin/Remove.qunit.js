/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

jQuery.sap.require("sap.ui.rta.plugin.Remove");
var RemovePlugin = sap.ui.rta.plugin.Remove;

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

	QUnit.module("Given a designTime and remove plugin are instantiated", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();

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
				commandFactory : new sap.ui.rta.command.CommandFactory()
			});

			this.oButton = new sap.m.Button("button", {text : "Button"});
			this.oVerticalLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oButton]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVerticalLayout],
				plugins : [this.oRemovePlugin]
			});


			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(that.oButton);

				done();
			});

		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when an overlay has no remove action designTime metadata", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({});
		this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oRemovePlugin.isRemoveAvailable(this.oButtonOverlay), false, "... then isRemoveAvailable is called, then it returns false");
		assert.strictEqual(this.oRemovePlugin.isRemoveEnabled(this.oButtonOverlay), false, "... then isRemoveEnabled is called, then it returns false");
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

		assert.strictEqual(this.oRemovePlugin.isRemoveAvailable(this.oButtonOverlay), true, "... then isRemoveAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isRemoveEnabled(this.oButtonOverlay), true, "... then isRemoveEnabled is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), true, "then the overlay is editable");

		this.oRemovePlugin.attachEventOnce("elementModified", function(oEvent) {
			var oCompositeCommand = oEvent.getParameter("command");
			assert.strictEqual(oCompositeCommand.getCommands().length, 1, "... command is created");
			assert.strictEqual(oCompositeCommand.getCommands()[0].getMetadata().getName(), "sap.ui.rta.command.Remove", "and command is of the correct type");
			done();
		});
		assert.ok(true, "... when plugin removeElement is called with this overlay ...");

		this.oRemovePlugin.removeElement([this.oButtonOverlay]);
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
		assert.strictEqual(jQuery(".sapUiRtaConfirmationDialogText").text(), "Button", "Confirmatioan dialog is shown with a correct text");
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

		assert.strictEqual(this.oRemovePlugin.isRemoveAvailable(this.oButtonOverlay), true, "... then isRemoveAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isRemoveEnabled(this.oButtonOverlay), false, "... then isRemoveEnabled is called, then it returns correct value");
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

		assert.strictEqual(this.oRemovePlugin.isRemoveAvailable(this.oButtonOverlay), true, "... then isRemoveAvailable is called, then it returns true");
		assert.strictEqual(this.oRemovePlugin.isRemoveEnabled(this.oButtonOverlay), false, "... then isRemoveEnabled is called, then it returns correct value from function call");
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

		assert.strictEqual(this.oRemovePlugin.isRemoveAvailable(this.oButtonOverlay), false, "... then isRemoveAvailable is called, then it returns false");
		assert.strictEqual(this.oRemovePlugin.isRemoveEnabled(this.oButtonOverlay), false, "... then isRemoveEnabled is called, then it returns correct value");
		assert.strictEqual(this.oRemovePlugin._isEditable(this.oButtonOverlay), false, "then the overlay is not editable");
	});

})();
