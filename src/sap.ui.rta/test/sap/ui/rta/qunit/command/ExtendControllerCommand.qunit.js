/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/Layer",
	"sap/m/Button",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	XMLView,
	CommandFactory,
	Layer,
	Button,
	RtaQunitUtils,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const sXmlString =
	'<mvc:View xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
	"</mvc:View>";

	function createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function() {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				controllerName: "test.namespace.TestController",
				async: true
			});
		});
	}

	QUnit.module("Given an extend controller command with a valid entry in the change registry,", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.oButton = new Button(this.oComponent.createId("myButton"));
		},
		afterEach() {
			this.oComponent.destroy();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an extend controller command for the change ...", async function(assert) {
			const sViewId = "testView";
			const oView = await createAsyncView(sViewId, this.oComponent);
			oView.placeAt("qunit-fixture");
			var oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.CUSTOMER_BASE,
					namespace: "test.namespace"
				}
			});

			const oExtendControllerCommand = await oCommandFactory.getCommandFor(
				this.oButton,
				"codeExt",
				{
					codeRef: "TestCodeRef",
					viewId: sViewId
				}
			);

			assert.ok(oExtendControllerCommand, "then command is available");
			assert.strictEqual(oExtendControllerCommand.getCodeRef(), "TestCodeRef", "then the codeRef is set correctly");
			assert.strictEqual(oExtendControllerCommand.getViewId(), sViewId, "then the view id is set correctly");
			assert.strictEqual(oExtendControllerCommand.getChangeType(), "codeExt", "then the change type is set correctly");
			assert.deepEqual(oExtendControllerCommand.getAppComponent(), this.oComponent, "then the app component is set correctly");

			const oPreparedChange = oExtendControllerCommand.getPreparedChange();
			assert.ok(oPreparedChange, "then the change is prepared");
			assert.strictEqual(oPreparedChange.getChangeType(), "codeExt", "then the change type is set correctly");
			assert.strictEqual(oPreparedChange.getContent().codeRef, "TestCodeRef", "then the codeRef is set correctly");
			assert.strictEqual(
				oPreparedChange.getFlexObjectMetadata().moduleName,
				"someName/changes/TestCodeRef",
				"then the module name is set correctly"
			);
			assert.strictEqual(
				oPreparedChange.getFlexObjectMetadata().namespace,
				"apps/someName/changes/",
				"then the namespace is set correctly"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});