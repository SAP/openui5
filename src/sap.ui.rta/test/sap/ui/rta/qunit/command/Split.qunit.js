/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	//internal
	'sap/ui/fl/Utils',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/m/Panel',
	'sap/m/Button',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Utils,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	ChangeRegistry,
	Panel,
	Button
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

	QUnit.module("Given two controls with designtime metadata for split ...", {
		beforeEach : function(assert) {

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oPanel = new Panel("panel", {
				content : [
					this.oButton1,
					this.oButton2
				]
			});

			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnCompleteChangeContentSpy = sinon.spy();
			this.fnApplyChangeSpy = sinon.spy();

			oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					"splitStuff" : {
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

	QUnit.test("when calling command factory for split ...", function(assert) {
		var done = assert.async();
		var oOverlay = new ElementOverlay({ element: this.oButton1 });
		sinon.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
		sinon.stub(oOverlay, "getRelevantContainer", function() {
			return this.oPanel;
		}.bind(this));

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({
			data : {
				actions : {
					split : {
						changeType: "splitStuff",
						changeOnRelevantContainer : true,
						isEnabled : true
					}
				},
				getRelevantContainer: function(oGroupElement) {
					return this.oPanel;
				}.bind(this)
			}
		});

		var oSplitCommand = CommandFactory.getCommandFor(this.oButton1, "split", {
			newElementIds : ["dummy-1", "dummy-2"],
			source : this.oButton1,
			parentElement : this.oPanel
		}, oDesignTimeMetadata);

		assert.ok(oSplitCommand, "split command exists for element");
		oSplitCommand.execute()

		.then(function() {
			assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			done();
		}.bind(this));
	});


});
