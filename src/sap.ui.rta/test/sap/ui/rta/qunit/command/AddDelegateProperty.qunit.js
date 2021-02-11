/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function(
	CommandFactory,
	ChangeRegistry,
	ElementDesignTimeMetadata,
	Utils,
	Button,
	sinon
) {
	"use strict";

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
				"sap.app": {
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};
	var oGetAppComponentForControlStub = sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	QUnit.module("Given an AddDelegateProperty change with a valid entry in the change registry,", {
		beforeEach: function () {
			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button": {
					addFields: {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy,
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oButton = new Button("button");

				this.oDesignTimeMetadata = new ElementDesignTimeMetadata({
					data: {
						actions: {
							add: {
								delegate: {
									changeType: "addFields"
								}
							}
						}
					}
				});
			}.bind(this));
		}
	});

	var ADD_PROPERTY_SPECIAL_SETTINGS_KEYS = ["changeType", "index", "newControlId", "bindingPath", "parentId", "modelType", "relevantContainerId", "oDataServiceVersion", "oDataInformation", "layer", "developerMode", "jsOnly", "command", "generator", "selector", "reference", "packageName"];

	QUnit.test("when getting a AddDelegateProperty command for the change ...", function(assert) {
		return CommandFactory.getCommandFor(
			this.oButton,
			"addDelegateProperty",
			{
				changeType: "addFields",
				index: 1,
				newControlId: "newControlId",
				bindingString: "{bindingPath}",
				oDataServiceUri: "serviceUri",
				propertyName: "propertyName"
			},
			this.oDesignTimeMetadata
		)

		.then(function(oCommand) {
			assert.ok(oCommand, "the addDelegateProperty command exists");

			assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
			var mActualSpecialSettings = this.fnCompleteChangeContentSpy.getCall(0).args[1];
			assert.deepEqual(Object.keys(mActualSpecialSettings), ADD_PROPERTY_SPECIAL_SETTINGS_KEYS, "then all properties are passed to the change handler");

			return oCommand.execute();
		}.bind(this))
		.then(function() {
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
		}.bind(this));
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
