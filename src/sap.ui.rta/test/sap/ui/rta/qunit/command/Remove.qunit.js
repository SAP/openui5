/* global QUnit */

QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Remove",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/core/Popup",
	"sap/ui/fl/Utils",
	"sap/m/Link",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon-4"
], function (
	CommandFactory,
	Remove,
	DesignTimeMetadata,
	Popup,
	Utils,
	Link,
	ChangeRegistry,
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
		sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

		QUnit.module("Given a popup with empty designtime metadata is created...", {
			beforeEach : function(assert) {
				this.oPopup = new Popup();

				this.oPopupDesignTimeMetadata = new DesignTimeMetadata();

			},
			afterEach : function(assert) {
				this.oPopup.destroy();
			}
		});

		QUnit.test("when getting a remove command for popup ...", function(assert) {
			return CommandFactory.getCommandFor(this.oPopup, "Remove", {
				removedElement : this.oPopup
			}, this.oPopupDesignTimeMetadata)

			.then(function(oCommand) {
				assert.notOk(oCommand, "no remove command for popup exists");
			})

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.module("Given a Link and its designtime metadata with undo functionality are created...", {
			beforeEach : function(assert) {
				this.oLink = new Link({
					text : "Label"
				});

				var oChangeRegistry = ChangeRegistry.getInstance();
				this.fnApplyChangeSpy = sinon.spy();
				this.fnCompleteChangeContentSpy = sinon.spy();

				oChangeRegistry.registerControlsForChanges({
					"sap.m.Link": {
						"hideControl" : {
							applyChange: this.fnApplyChangeSpy,
							completeChangeContent: this.fnCompleteChangeContentSpy
						}
					}
				});

				this.oLinkDesignTimeMetadata = new DesignTimeMetadata({
					data : {
						actions : {
							remove : {
								changeType : "hideControl"
							}
						}
					}
				});

			},
			afterEach : function(assert) {
				this.oLink.destroy();
			}
		});

		QUnit.test("when getting a remove command with an invalid removedElement ...", function (assert) {
			return CommandFactory.getCommandFor(this.oLink, "Remove", {
				removedElement : {}
			}, this.oLinkDesignTimeMetadata)

			.then(function() {
				assert.notOk(true, "Exception is expected but no exception was thrown");
			}, function(oMessage) {
				assert.ok(true, "No valid 'removedElement' found");
			});
		});

		QUnit.test("when getting a remove command without removedElement parameter ...", function(assert) {
			return CommandFactory.getCommandFor(this.oLink, "Remove", {}, this.oLinkDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				var sChangeType = this.oLinkDesignTimeMetadata.getAction("remove", this.oLink).changeType;
				assert.ok(oRemoveCommand, "remove command for Link exists");
				assert.equal(oRemoveCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");
				return oRemoveCommand.execute();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when getting a remove command for a Link...", function(assert) {
			return CommandFactory.getCommandFor(this.oLink, "Remove", {
				removedElement : this.oLink
			}, this.oLinkDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				var sChangeType = this.oLinkDesignTimeMetadata.getAction("remove", this.oLink).changeType;

				assert.ok(oRemoveCommand, "remove command for Link exists");
				assert.equal(oRemoveCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");
				return oRemoveCommand.execute();
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
