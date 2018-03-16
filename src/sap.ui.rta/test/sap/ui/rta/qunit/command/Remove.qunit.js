/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Remove",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/core/Popup",
	"sap/ui/fl/Utils",
	"sap/m/Link",
	"sap/ui/fl/registry/ChangeRegistry"
], function (
	CommandFactory,
	Remove,
	DesignTimeMetadata,
	Popup,
	Utils,
	Link,
	ChangeRegistry
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
			var oCommand = CommandFactory.getCommandFor(this.oPopup, "Remove", {
				removedElement : this.oPopup
			}, this.oPopupDesignTimeMetadata);

			assert.notOk(oCommand, "no remove command for popup exists");
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
			assert.throws(
				function() {
					CommandFactory.getCommandFor(this.oLink, "Remove", {
						removedElement : {}
					}, this.oLinkDesignTimeMetadata);
				},
			 "No valid 'removedElement' found"
		 );
		});

		QUnit.test("when getting a remove command without removedElement parameter ...", function(assert) {
			var done = assert.async();

			var oCommand = CommandFactory.getCommandFor(this.oLink, "Remove", undefined,
				this.oLinkDesignTimeMetadata);

			var sChangeType = this.oLinkDesignTimeMetadata.getAction("remove", this.oLink).changeType;

			assert.ok(oCommand, "remove command for Link exists");
			assert.equal(oCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");

			oCommand.execute().then( function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
				done();
			}.bind(this));
		});

		QUnit.test("when getting a remove command for a Link...", function(assert) {
			var done = assert.async();

			var oCommand = CommandFactory.getCommandFor(this.oLink, "Remove", {
				removedElement : this.oLink
			}, this.oLinkDesignTimeMetadata);

			var sChangeType = this.oLinkDesignTimeMetadata.getAction("remove", this.oLink).changeType;

			assert.ok(oCommand, "remove command for Link exists");
			assert.equal(oCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");

			oCommand.execute().then( function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
				done();
			}.bind(this));
		});
});
