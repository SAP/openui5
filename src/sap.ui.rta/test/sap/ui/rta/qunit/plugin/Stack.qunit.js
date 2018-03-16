/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/rta/command/LREPSerializer',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	'sap/m/Input',
	'sap/m/Panel',
	//should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	CommandFactory,
	DesignTimeMetadata,
	CommandSerializer,
	CommandStack,
	ChangeRegistry,
	FlUtils,
	Input,
	Panel
){
	"use strict";
	QUnit.start();

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata to simulate different cases...", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();

			this.oComponent = new sap.ui.core.UIComponent();
			this.sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oComponent);

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Input": {
					"hideControl" : {
						completeChangeContent: function() {},
						applyChange: function() {return Promise.resolve();}
					}
				}
			});

			// Create command stack with some commands
			this.oCommandStack = new CommandStack();
			this.oInput1 = new Input({id : "input1"});
			this.oInput2 = new Input({id : "input2"});
			this.oPanel = new Panel({
				id : "panel",
				content : [this.oInput1, this.oInput2]});

			this.oInputDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});

			// Create serializer instance
			this.oSerializer = new CommandSerializer({
				commandStack: this.oCommandStack,
				rootControl: this.oPanel
			});

		},
		afterEach : function(assert) {
			this.oCommandStack.destroy();
			this.oSerializer.destroy();
			this.oPanel.destroy();
		}
	});

	QUnit.test("when 2 Changes get executed at the same time", function(assert) {
		var done = assert.async();

		// Create commands
		this.oRemoveCommand1 = CommandFactory.getCommandFor(this.oInput1, "Remove", {
			removedElement : this.oInput1
		}, this.oInputDesignTimeMetadata);
		this.oRemoveCommand2 = CommandFactory.getCommandFor(this.oInput2, "Remove", {
			removedElement : this.oInput2
		}, this.oInputDesignTimeMetadata);

		var iCounter = 0;
		var aInputs = [this.oInput1, this.oInput2];
		this.oCommandStack.attachCommandExecuted(function(oEvent) {
			assert.deepEqual(oEvent.getParameter("command").getElement(), aInputs[iCounter], "then both commands get executed in the correct order");
			iCounter++;

			if (iCounter === 2) {
				done();
			}
		});

		this.oCommandStack.pushAndExecute(this.oRemoveCommand1);
		this.oCommandStack.pushAndExecute(this.oRemoveCommand2);
	});

});
