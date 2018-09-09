/* global QUnit */

sap.ui.define([
	'sap/ui/fl/Utils',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/ui/thirdparty/sinon-4'
],
function (
	FlUtils,
	ChangeRegistry,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	Button,
	Panel,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given two controls with designtime metadata for combine ...", {
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

			this.oFlUtilsStub = sinon.stub(FlUtils, "_getAppComponentForComponent").returns(oMockedAppComponent);
		},
		after: function () {
			this.oFlUtilsStub.restore();
		},
		beforeEach: function() {

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
		afterEach: function() {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for combine ...", function(assert) {
			var oOverlay = new ElementOverlay({ element: this.oButton1 });
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getRelevantContainer").returns(this.oPanel);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						combine : {
							changeType: "combineStuff",
							changeOnRelevantContainer : true,
							isEnabled : true
						}
					},
					getRelevantContainer: function() {
						return this.oPanel;
					}.bind(this)
				}
			});

			return CommandFactory.getCommandFor(this.oButton1, "combine", {
				source : this.oButton1,
				combineFields : [
					this.oButton1,
					this.oButton2
				]
			}, oDesignTimeMetadata)

			.then(function(oCombineCommand) {
				assert.ok(oCombineCommand, "combine command exists for element");
				return oCombineCommand.execute();
			})

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
