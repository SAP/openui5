/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon-4"
], function (
	CommandFactory,
	DesignTimeMetadata,
	FlUtils,
	Button,
	ChangeRegistry,
	sinon
) {
	"use strict";

	QUnit.module("Given a Button and its designtime metadata with undo functionality are created...", {
		before: function () {
			var oMockedAppComponent = {
				getLocalId: function () {},
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
			this.oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);
		},
		after: function () {
			this.oGetAppComponentForControlStub.restore();
		},
		beforeEach: function () {
			this.oButton = new Button("mockButton", {
				text : "Label"
			});

			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button": {
					rename : {
						applyChange: this.fnApplyChangeSpy,
						completeChangeContent: this.fnCompleteChangeContentSpy,
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oButtonDesignTimeMetadata = new DesignTimeMetadata({
					data : {
						actions : {
							rename : {
								changeType : "rename"
							}
						}
					}
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oButton.destroy();
		}
	}, function () {
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

			.then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
