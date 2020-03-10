sap.ui.define([
	"sap/m/plugins/PluginBase",
	"sap/ui/core/Control",
	"sap/ui/core/Element"
], function(PluginBase, Control, Element) {
	"use strict";
	/*global QUnit */

	var TestPlugin = PluginBase.extend("sap.m.plugins.test.Plugin");
	var TestControl = Control.extend("sap.m.plugins.test.Control");
	var TestElement = Element.extend("sap.m.plugins.test.Element");

	QUnit.module("Activation & Deactivation", {
		beforeEach: function() {
			this.oPlugin = new TestPlugin();
			this.oPluginMock = this.mock(this.oPlugin);
			this.oControl = new TestControl();
		},
		afterEach: function() {
			this.oPluginMock.restore();
			this.oPlugin.destroy();
			this.oControl.destroy();
		}
	});

	QUnit.test("Init", function(assert) {
		var oPluginPrototypeMock = this.mock(TestPlugin.prototype);

		oPluginPrototypeMock.expects("onActivate").never();
		oPluginPrototypeMock.expects("onDeactivate").never();

		var oPlugin = new TestPlugin();

		assert.notOk(this.oPlugin.isActive(), "Not active");

		oPlugin.destroy();
	});

	QUnit.test("Not applicable", function(assert) {
		var oElement = new TestElement();

		assert.throws(
			function() {
				oElement.addDependent(this.oPlugin);
			}.bind(this),
			new Error(this.oPlugin + " is not applicable to " + oElement),
			"By default, applying a plugin to a non-control throws an error"
		);

		this.stub(this.oPlugin, "isApplicable").returns(false);

		assert.throws(
			function() {
				this.oControl.addDependent(this.oPlugin);
			}.bind(this),
			new Error(this.oPlugin + " is not applicable to " + this.oControl),
			"If #isApplicable returns false, an error is thrown"
		);

		oElement.destroy();
	});

	QUnit.test("Add to control", function(assert) {
		this.oPluginMock.expects("onActivate").once().withExactArgs(this.oControl);
		this.oPluginMock.expects("onDeactivate").never();

		this.oControl.addDependent(this.oPlugin);

		assert.ok(this.oPlugin.isActive(), "Active");
	});

	QUnit.test("Add to control when disabled", function(assert) {
		this.oPlugin.setEnabled(false);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").never();

		this.oControl.addDependent(this.oPlugin);

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Add to the same control again", function(assert) {
		this.oControl.addDependent(new TestElement());
		this.oControl.addDependent(this.oPlugin);

		var oOnDeactivate = this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);
		var oOnActivate = this.oPluginMock.expects("onActivate").once().withExactArgs(this.oControl);

		this.oControl.insertDependent(this.oPlugin, 0);

		assert.ok(this.oPlugin.isActive(), "Active");
		assert.ok(oOnActivate.calledAfter(oOnDeactivate), "First deactivate, then activate");
	});

	QUnit.test("Move to another control", function(assert) {
		var oOtherControl = new TestControl();

		this.oControl.addDependent(this.oPlugin);

		var oOnDeactivate = this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);
		var oOnActivate = this.oPluginMock.expects("onActivate").once().withExactArgs(oOtherControl);

		oOtherControl.addDependent(this.oPlugin);

		assert.ok(this.oPlugin.isActive(), "Active");
		assert.ok(oOnActivate.calledAfter(oOnDeactivate),  "First deactivate, then activate");

		oOtherControl.destroy();
	});

	QUnit.test("Remove from control", function(assert) {
		this.oControl.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);

		this.oControl.removeDependent(this.oPlugin);

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Destroy", function(assert) {
		this.oControl.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);

		this.oPlugin.destroy();

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Enable", function(assert) {
		this.oPlugin.setEnabled(false);
		this.oControl.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").once().withExactArgs(this.oControl);
		this.oPluginMock.expects("onDeactivate").never();

		this.oPlugin.setEnabled(true);

		assert.ok(this.oPlugin.isActive(), "Active");
	});

	QUnit.test("Disable", function(assert) {
		this.oControl.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);

		this.oPlugin.setEnabled(false);

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});
});