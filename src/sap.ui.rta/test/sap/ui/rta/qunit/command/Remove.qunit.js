/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/core/Popup",
	"sap/ui/fl/Utils",
	"sap/m/Link",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon-4"
], function (
	CommandFactory,
	DesignTimeMetadata,
	Popup,
	FlUtils,
	Link,
	ChangeRegistry,
	sinon
) {
	"use strict";

	QUnit.module("Given a popup with empty designtime metadata is created...", {
		beforeEach: function () {
			this.oPopup = new Popup();
			this.oPopupDesignTimeMetadata = new DesignTimeMetadata();
		},
		afterEach: function () {
			this.oPopup.destroy();
		}
	}, function () {
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
	});

	QUnit.module("Given a Link and its designtime metadata with undo functionality are created...", {
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
			this.oLink = new Link("mockLink", {
				text : "Label"
			});

			var oChangeRegistry = ChangeRegistry.getInstance();
			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Link": {
					hideControl : {
						applyChange: this.fnApplyChangeSpy,
						completeChangeContent: this.fnCompleteChangeContentSpy,
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oLinkDesignTimeMetadata = new DesignTimeMetadata({
					data : {
						actions : {
							remove : {
								changeType : "hideControl"
							}
						}
					}
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oLink.destroy();
		}
	}, function () {
		QUnit.test("when getting a remove command with an invalid removedElement ...", function (assert) {
			return CommandFactory.getCommandFor(this.oLink, "Remove", {
				removedElement : {}
			}, this.oLinkDesignTimeMetadata)
			.then(function() {
				assert.notOk(true, "Exception is expected but no exception was thrown");
			}, function () {
				assert.ok(true, "No valid 'removedElement' found");
			});
		});

		QUnit.test("when getting a remove command without removedElement parameter ...", function (assert) {
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

		QUnit.test("when getting a remove command for a Link...", function (assert) {
			return CommandFactory.getCommandFor(this.oLink, "Remove", {
				removedElement : this.oLink
			}, this.oLinkDesignTimeMetadata)
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
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
