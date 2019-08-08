/*global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function(
	FlUtils,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	ChangeRegistry,
	Panel,
	Button,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given two controls with designtime metadata for split ...", {
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

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Panel": {
					splitStuff : {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy,
						revertChange: function() {}
					}
				}
			});
		},
		afterEach: function () {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for split ...", function(assert) {
			var done = assert.async();
			var oOverlay = new ElementOverlay({ element: this.oButton1 });
			sinon.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sinon.stub(oOverlay, "getRelevantContainer").returns(this.oPanel);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						split : {
							changeType: "splitStuff",
							changeOnRelevantContainer : true,
							isEnabled : true
						}
					},
					getRelevantContainer: function () {
						return this.oPanel;
					}.bind(this)
				}
			});

			return CommandFactory.getCommandFor(this.oButton1, "split", {
				newElementIds : ["dummy-1", "dummy-2"],
				source : this.oButton1,
				parentElement : this.oPanel
			}, oDesignTimeMetadata)
			.then(function(oSplitCommand) {
				assert.ok(oSplitCommand, "split command exists for element");
				return oSplitCommand.execute();
			})
			.then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
				done();
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
