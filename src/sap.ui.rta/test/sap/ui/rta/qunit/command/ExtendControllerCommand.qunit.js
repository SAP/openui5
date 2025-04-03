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
				async: true
			});
		});
	}

	QUnit.module("Given an extend controller command with a valid entry in the change registry,", {
		async beforeEach() {
			this.sViewId = "testView";
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.oButton = new Button(this.oComponent.createId("myButton"));
			this.oView = await createAsyncView(this.sViewId, this.oComponent);
			this.oView.placeAt("qunit-fixture");
			this.oCommandFactory = new CommandFactory({
				flexSettings: {
					layer: Layer.CUSTOMER_BASE,
					namespace: "test.namespace"
				}
			});
		},
		afterEach() {
			this.oComponent.destroy();
			this.oButton.destroy();
			this.oView.destroy();
			this.oCommandFactory.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting an extend controller command for the change ...", async function(assert) {
			sandbox.stub(this.oView, "getControllerModuleName").returns("test.controller.TestController");

			const oExtendControllerCommand = await this.oCommandFactory.getCommandFor(
				this.oButton,
				"codeExt",
				{
					codeRef: "TestCodeRef",
					viewId: this.sViewId
				}
			);

			assert.ok(oExtendControllerCommand, "then command is available");
			assert.strictEqual(oExtendControllerCommand.getCodeRef(), "TestCodeRef", "then the codeRef is set correctly");
			assert.strictEqual(oExtendControllerCommand.getViewId(), this.sViewId, "then the view id is set correctly");
			assert.strictEqual(oExtendControllerCommand.getChangeType(), "codeExt", "then the change type is set correctly");
			assert.deepEqual(oExtendControllerCommand.getAppComponent(), this.oComponent, "then the app component is set correctly");

			const oPreparedChange = oExtendControllerCommand.getPreparedChange();
			assert.ok(oPreparedChange, "then the change is prepared");
			assert.strictEqual(oPreparedChange.getChangeType(), "codeExt", "then the change type is set correctly");
			assert.strictEqual(oPreparedChange.getLayer(), Layer.CUSTOMER_BASE, "then the layer is set correctly");
			assert.strictEqual(oPreparedChange.getContent().codeRef, "TestCodeRef", "then the codeRef is set correctly");
			assert.strictEqual(
				oPreparedChange.getControllerName(),
				"module:test.controller.TestController",
				"then the controller name is set correctly"
			);
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

		QUnit.test("when getting an extend controller command for the change with legacy controller notation on the view...", async function(assert) {
			sandbox.stub(this.oView, "getControllerModuleName").returns(undefined);
			sandbox.stub(this.oView, "getController").returns({
				getMetadata() {
					return {
						getName() {
							return "test.controller.TestController";
						}
					};
				}
			});

			const oExtendControllerCommand = await this.oCommandFactory.getCommandFor(
				this.oButton,
				"codeExt",
				{
					codeRef: "TestCodeRef",
					viewId: this.sViewId
				}
			);

			const oPreparedChange = oExtendControllerCommand.getPreparedChange();
			assert.strictEqual(
				oPreparedChange.getControllerName(),
				"test.controller.TestController",
				"then the controller name is set correctly"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});