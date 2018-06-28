/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([ "sap/ui/rta/command/CommandFactory",
				"sap/ui/rta/command/Rename",
				"sap/ui/dt/DesignTimeMetadata",
				"sap/ui/fl/Utils",
				"sap/m/Button",
				"sap/ui/fl/registry/ChangeRegistry"],
	function (CommandFactory, Rename, DesignTimeMetadata, Utils, Button, ChangeRegistry) {
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
		sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

		QUnit.module("Given a Button and its designtime metadata with undo functionality are created...", {
			beforeEach : function(assert) {
				this.oButton = new Button({
					text : "Label"
				});

				var oChangeRegistry = ChangeRegistry.getInstance();

				this.fnApplyChangeSpy = sinon.spy();
				this.fnCompleteChangeContentSpy = sinon.spy();

				oChangeRegistry.registerControlsForChanges({
					"sap.m.Button": {
						"rename" : {
							applyChange: this.fnApplyChangeSpy,
							completeChangeContent: this.fnCompleteChangeContentSpy
						}
					}
				});

				this.oButtonDesignTimeMetadata = new DesignTimeMetadata({
					data : {
						actions : {
							rename : {
								changeType : "rename"
							}
						}
					}
				});

			},
			afterEach : function(assert) {
				this.oButton.destroy();
			}
		});

		QUnit.test("when getting a rename command for a Button...", function(assert) {
			return CommandFactory.getCommandFor(this.oButton, "Rename", {
				renamedElement : this.oButton,
				value : "new value"
			}, this.oButtonDesignTimeMetadata)

			.then(function(oRenameCommand) {
				var sChangeType = this.oButtonDesignTimeMetadata.getAction("rename", this.oButton).changeType;
				assert.ok(oRenameCommand, "rename command for Button exists");
				assert.equal(oRenameCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");
				return oRenameCommand.execute();
			}.bind(this))

			.then( function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
});
