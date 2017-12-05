/* global QUnit sinon */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/fl/Utils',
	'sap/m/Button',
	'sap/ui/fl/changeHandler/AddXML',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function (
	CommandFactory,
	ChangeRegistry,
	ElementDesignTimeMetadata,
	Utils,
	Button,
	AddXML
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
		getModel: function () {},
		createId : function(sId) {
			return 'testcomponent---' + sId;
		}
	};
	var sandbox = sinon.sandbox.create();
	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.module("Given an AddXML change with a valid entry in the change registry,", {
		beforeEach : function(assert) {
			sandbox.stub(Utils, "getCurrentLayer").returns("VENDOR");
			this.oButton = new Button(oMockedAppComponent.createId("myButton"));
		},
		afterEach : function(assert) {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an AddXML command for the change ...", function(assert) {
			var fnApplyChangeStub = sandbox.stub(AddXML, "applyChange");
			var fnCompleteChangeContentStub = sandbox.stub(AddXML, "completeChangeContent");

			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: "VENDOR"
				}
			});
			var oCommand = oCommandFactory.getCommandFor(this.oButton, "addXML", {
				fragment : "pathToFragment",
				targetAggregation : "targetAggregation",
				index: 0
			});
			assert.ok(oCommand, "then command without flex settings is available");
			assert.strictEqual(oCommand.getTargetAggregation(), "targetAggregation", "and its settings are merged correctly");
			assert.strictEqual(oCommand.getFragment(), "pathToFragment", "and its settings are merged correctly");
			assert.strictEqual(oCommand.getIndex(), 0, "and its settings are merged correctly");

			oCommandFactory.setFlexSettings({
				layer: "VENDOR",
				developerMode: true
			});
			var oCommand2 = oCommandFactory.getCommandFor(this.oButton, "addXML", {
				fragment : "pathToFragment",
				targetAggregation : "targetAggregation",
				index: 0
			});
			assert.ok(oCommand2, "then command with flex settings is available");
			assert.strictEqual(oCommand.getTargetAggregation(), "targetAggregation", "and its settings are merged correctly");
			assert.strictEqual(oCommand.getFragment(), "pathToFragment", "and its settings are merged correctly");
			assert.strictEqual(oCommand.getIndex(), 0, "and its settings are merged correctly");

			oCommandFactory.setFlexSettings({
				layer: "VENDOR",
				developerMode: false
			});

			return oCommand.execute().then(function() {
				assert.equal(fnCompleteChangeContentStub.callCount, 2, "then completeChangeContent is called twice");
				assert.equal(fnApplyChangeStub.callCount, 1, "then applyChange is called once");
			});
		});
	});
});
