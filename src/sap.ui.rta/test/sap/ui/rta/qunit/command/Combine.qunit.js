/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	// internal:
	'sap/ui/fl/Utils',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/m/Button',
	'sap/m/Panel',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Utils,
	ChangeRegistry,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	Button,
	Panel
) {
	'use strict';

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

	QUnit.module("Given two controls with designtime metadata for combine ...", {
		beforeEach : function(assert) {

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");

			this.oPanel = new Panel("panel", {
				content : [this.oButton1, this.oButton2]
			});

			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					"combineStuff" : {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy
					}
				}
			});

		},
		afterEach : function(assert) {
			this.oPanel.destroy();
		}
	});

	QUnit.test("when calling command factory for combine ...", function(assert) {
		var done = assert.async();

		var oOverlay = new ElementOverlay({ element: this.oButton1 });
		sinon.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
		sinon.stub(oOverlay, "getRelevantContainer", function() {
			return this.oPanel;
		}.bind(this));

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({
			data : {
				actions : {
					combine : {
						changeType: "combineStuff",
						changeOnRelevantContainer : true,
						isEnabled : true
					}
				},
				getRelevantContainer: function(oGroupElement) {
					return this.oPanel;
				}.bind(this)
			}
		});

		var oCombineCommand = CommandFactory.getCommandFor(this.oButton1, "combine", {
			source : this.oButton1,
			combineFields : [
				this.oButton1,
				this.oButton2
			]
		}, oDesignTimeMetadata);

		assert.ok(oCombineCommand, "combine command exists for element");
		oCombineCommand.execute().then( function() {
			assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			done();
		}.bind(this));
	});


});
