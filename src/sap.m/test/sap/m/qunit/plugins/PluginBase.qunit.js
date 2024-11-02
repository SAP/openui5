sap.ui.define([
	"sap/m/plugins/PluginBase",
	"sap/ui/core/Control",
	"sap/ui/core/Element"
], function(PluginBase, Control, Element) {
	"use strict";
	/*global QUnit */

	var TestPlugin = PluginBase.extend("sap.m.plugins.test.Test");
	var DummyTablePlugin = Element.extend("sap.ui.table.plugins.PluginBase");
	var TestControl = Control.extend("sap.m.plugins.test.Control", {
		metadata: {
			aggregations: {
				content: {type : "sap.ui.core.Element", multiple : true, singularName : "content"}
			}
		},

		// no rendering required for the scenarios in this module
		renderer: null
	});
	var TestElement = Element.extend("sap.m.plugins.test.Element");

	PluginBase.setControlConfig(TestControl, {
		key1: "value1",
		key2: function (p1, p2) {
			return p1 + p2 + this.key1;
		}
	}, TestPlugin);

	QUnit.module("Activation & Deactivation", {
		beforeEach: function(assert) {
			this.oPlugin = new TestPlugin();
			this.oPlugin.onActivate = function() {
				assert.ok(this.isActive(), "In onActivate hook, isActive method returns true");
			};
			this.oPlugin.onDeactivate = function() {
				assert.notOk(this.isActive(), "In onDeactivate hook, isActive method returns false");
			};
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
		assert.equal(PluginBase.getPlugin(this.oControl, TestPlugin), this.oPlugin, "Plugin found");

		assert.ok(this.oPlugin.isActive(), "Active");
	});

	QUnit.test("Add to control when disabled", function(assert) {
		this.oPlugin.setEnabled(false);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").never();

		this.oControl.addDependent(this.oPlugin);
		assert.equal(PluginBase.getPlugin(this.oControl), this.oPlugin, "Plugin found");

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Add to the same control again", function(assert) {
		this.oControl.addDependent(new TestElement());
		this.oControl.addDependent(this.oPlugin);

		var oOnDeactivate = this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oControl);
		var oOnActivate = this.oPluginMock.expects("onActivate").once().withExactArgs(this.oControl);

		this.oControl.insertDependent(this.oPlugin, 0);
		assert.equal(PluginBase.getPlugin(this.oControl, TestPlugin), this.oPlugin, "Plugin found");

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

	QUnit.test("Config", function(assert) {
		this.oControl.addDependent(this.oPlugin);

		assert.equal(this.oPlugin.getConfig("key1"), "value1", "Config read correct");
		assert.equal(this.oPlugin.getConfig("key2", "X", 1), "X1value1", "Config method executed correct");

		this.oControl.removeDependent(this.oPlugin);
		assert.equal(this.oPlugin.getConfig("key1"), undefined, "Config could not found since plugin is removed");

	});

	QUnit.test("Logical Owner", function(assert) {
		var done = assert.async();
		var fnResolve, oPromise = new Promise(function(resolve) {
			fnResolve = resolve;
		});

		var oNewTestControl = new TestControl();
		var oLogicalOwnerStub = this.stub();
        oLogicalOwnerStub.onCall(0).returns(oPromise);
        oLogicalOwnerStub.onCall(1).returns(oNewTestControl);
        oLogicalOwnerStub.returns(oNewTestControl);

		this.oControl.getTestPluginOwner = oLogicalOwnerStub;

		this.oControl.addDependent(this.oPlugin);
		fnResolve();

		setTimeout(function() {
			assert.equal(this.oPlugin.getParent(), this.oControl, "Logical paernt is set");
			assert.equal(this.oPlugin.getControl(), oNewTestControl, "Logical plugin owner is defined");
			oNewTestControl.destroy();
			done();
		}.bind(this));
	});

	QUnit.module("Static getPlugin", {
		beforeEach: function (assert) {
			this.oControl = new TestControl();
		},
		afterEach: function () {
			this.oControl.destroy();
		}
	});

	QUnit.test("Parameters", function (assert) {
		assert.ok(PluginBase.getPlugin() === undefined, "no parameters");
		assert.ok(PluginBase.getPlugin(null, "sap.m.plugins.test.Test") === undefined, "no control");
		assert.ok(PluginBase.getPlugin(this.oControl, {}) === undefined, "no correct plugin type");
	});

	QUnit.test("Find plugins in different aggregations", function (assert) {
		var mPlugins = {
			"sap.m.plugins.PluginBase": new TestPlugin(),
			"sap.ui.table.plugins.PluginBase": new DummyTablePlugin()
		};

		for (var sType in mPlugins) {
			this.oControl.addDependent(mPlugins[sType]);
			assert.ok(PluginBase.getPlugin(this.oControl, sType) === mPlugins[sType], "Plugin of type " + sType + " found in dependents aggregation");
			assert.ok(PluginBase.getPlugin(this.oControl, mPlugins[sType].getMetadata().getClass()) === mPlugins[sType], "Plugin of type " + sType + " Class found in dependents aggregation");
			this.oControl.removeAllDependents();
			this.oControl.addContent(mPlugins[sType]);
			assert.ok(PluginBase.getPlugin(this.oControl, sType) === mPlugins[sType], "Plugin of type " + sType + " found in content aggregation");
			assert.ok(PluginBase.getPlugin(this.oControl, mPlugins[sType].getMetadata().getClass()) === mPlugins[sType], "Plugin of type " + sType + " Class found in content aggregation");
			this.oControl.removeAllContent();
			mPlugins[sType].destroy();
		}
	});

});