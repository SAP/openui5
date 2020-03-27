/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/qunit/TableQUnitUtils"
], function(TableUtils, TableQUnitUtils) {
	"use strict";

	var Hook = TableUtils.Hook;

	QUnit.module("Misc");

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Hook, "Hook namespace available");
		assert.ok(TableUtils.Hook.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Hooks", {
		before: function() {
			this.aHookKeys = (function() {
				function getKeys(mMap) {
					var aKeys = [];

					Object.keys(mMap).forEach(function(sKey) {
						if (typeof mMap[sKey] === "string") {
							aKeys.push(mMap[sKey]);
						} else {
							aKeys = aKeys.concat(getKeys(mMap[sKey]));
						}
					});

					return aKeys;
				}

				return getKeys(Hook.Keys);
			})();
		},
		beforeEach: function() {
			this.oFakeTable = {fakeTable: true};
			this.oTableUtilsIsAStub = sinon.stub(TableUtils, "isA");
			this.oTableUtilsIsAStub.withArgs(this.oFakeTable, "sap.ui.table.Table").returns(true);
		},
		afterEach: function() {
			this.oTableUtilsIsAStub.restore();
		}
	});

	QUnit.test("No hooks registered or installed", function(assert) {
		try {
			Hook.call(this.oFakeTable, this.aHookKeys[0]);
			assert.ok(true, "Calling a hook did not cause an error");
		} catch (e) {
			assert.ok(false, "Calling a hook should not cause an error");
		}
	});

	QUnit.test("Registration", function(assert) {
		var oTable = this.oFakeTable;
		var aSpies = [];

		this.aHookKeys.forEach(function(sHookKey) {
			var oSpy = sinon.spy();

			aSpies.push(oSpy);
			Hook.register(oTable, sHookKey, oSpy);
		});

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.call(oTable, sHookKey, "param", "param" + iIndex);
		});

		aSpies.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.calledOnceWithExactly("param", "param" + iIndex), "The hook was correctly called (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));
	});

	QUnit.test("Deregistration", function(assert) {
		var oTable = this.oFakeTable;
		var aSpies = [];

		this.aHookKeys.forEach(function(sHookKey) {
			var oSpy = sinon.spy();

			aSpies.push(oSpy);
			Hook.register(oTable, sHookKey, oSpy);
		});

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.deregister(oTable, sHookKey, aSpies[iIndex]);
		});

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.call(oTable, sHookKey, "param", "param" + iIndex);
		});

		aSpies.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.notCalled, "Deregistered hook was not called (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));
	});

	QUnit.test("Multiple registrations", function(assert) {
		var oTable = this.oFakeTable;
		var oContext = {};
		var oSpy1 = sinon.spy();
		var oSpy2 = sinon.spy();
		var oSpy3 = sinon.spy();
		var oSpy4 = sinon.spy();
		var oSpy5 = sinon.spy();
		var sHookKey = this.aHookKeys[0];

		Hook.register(oTable, sHookKey, oSpy1);
		Hook.register(oTable, sHookKey, oSpy1);
		Hook.register(oTable, sHookKey, oSpy1, oContext);
		Hook.register(oTable, sHookKey, oSpy1, oContext);
		Hook.register(oTable, sHookKey, oSpy2);
		Hook.deregister(oTable, sHookKey, oSpy2);
		Hook.register(oTable, sHookKey, oSpy3, oContext);
		Hook.deregister(oTable, sHookKey, oSpy3, oContext);
		Hook.register(oTable, sHookKey, oSpy4);
		Hook.deregister(oTable, sHookKey, oSpy4, oContext);
		Hook.register(oTable, sHookKey, oSpy5, oContext);
		Hook.deregister(oTable, sHookKey, oSpy5, {});
		Hook.deregister(oTable, sHookKey, oSpy5);
		Hook.call(oTable, sHookKey);

		assert.equal(oSpy1.callCount, 4, "Hook that is registered twice with and twice without context is called four times");
		assert.ok(oSpy2.notCalled, "Hook that was deregistered it not called (without context)");
		assert.ok(oSpy3.notCalled, "Hook that was deregistered it not called (with context)");
		assert.ok(oSpy4.calledOnce, "Hook that was registered without context cannot be deregistered with context");
		assert.ok(oSpy5.calledOnce, "Hook that was registered with context cannot be deregistered with another context");
	});

	QUnit.test("Installation", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {hooks: {}};
		var aSpies = [];

		this.aHookKeys.forEach(function(sHookKey) {
			var oSpy = sinon.spy();

			aSpies.push(oSpy);
			oObject.hooks[sHookKey] = oSpy;
		});

		Hook.install(oTable, oObject);

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.call(oTable, sHookKey, "param", "param" + iIndex);
		});

		aSpies.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.calledOnceWithExactly("param", "param" + iIndex), "The hook was correctly called (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));
	});

	QUnit.test("Installation but not implementing hooks", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};

		Hook.install(oTable, oObject);

		try {
			Hook.call(oTable, this.aHookKeys[0]);
			assert.ok(true, "Calling a hook for an incomplete installation did not cause an error");
		} catch (e) {
			assert.ok(false, "Calling a hook for an incomplete installation should not cause an error");
		}
	});

	QUnit.test("Installation and implementing hooks afterwards", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};
		var sHookKey = this.aHookKeys[0];

		Hook.install(oTable, oObject);
		oObject.hooks = {};
		oObject.hooks[sHookKey] = sinon.spy();
		Hook.call(oTable, sHookKey);

		assert.ok(oObject.hooks[sHookKey].calledOnce, "Successfully called a hook that was implemented after installation");
	});

	QUnit.test("Uninstallation", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {hooks: {}};
		var aSpies = [];

		this.aHookKeys.forEach(function(sHookKey) {
			var oSpy = sinon.spy();

			aSpies.push(oSpy);
			oObject.hooks[sHookKey] = oSpy;
		});

		Hook.install(oTable, oObject);
		Hook.uninstall(oTable, oObject);

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.call(oTable, sHookKey, "param", "param" + iIndex);
		});

		aSpies.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.notCalled, "Uninstalled hook was not called (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));
	});

	QUnit.test("Multiple installations", function(assert) {
		var oTable = this.oFakeTable;
		var oObject1 = {hooks: {}};
		var oObject2 = {hooks: {}};
		var oObject3 = {hooks: {}};
		var aSpies1 = [];
		var aSpies2 = [];
		var aSpies3 = [];
		var oContext = {};

		this.aHookKeys.forEach(function(sHookKey) {
			var oSpy1 = sinon.spy();
			aSpies1.push(oSpy1);
			oObject1.hooks[sHookKey] = oSpy1;

			var oSpy2 = sinon.spy();
			aSpies2.push(oSpy2);
			oObject2.hooks[sHookKey] = oSpy2;

			var oSpy3 = sinon.spy();
			aSpies3.push(oSpy3);
			oObject3.hooks[sHookKey] = oSpy3;
		});

		Hook.install(oTable, oObject1);
		Hook.install(oTable, oObject1);
		Hook.install(oTable, oObject1, oContext);
		Hook.install(oTable, oObject1, oContext);

		Hook.install(oTable, oObject2);
		Hook.install(oTable, oObject2, oContext);
		Hook.uninstall(oTable, oObject2);

		Hook.install(oTable, oObject3);
		Hook.install(oTable, oObject3, oContext);
		Hook.uninstall(oTable, oObject3, oContext);

		this.aHookKeys.forEach(function(sHookKey, iIndex) {
			Hook.call(oTable, sHookKey, "param", "param" + iIndex);
		});

		aSpies1.forEach(function(oSpy, iIndex) {
			if (oSpy.callCount === 2) {
				assert.ok(oSpy.firstCall.calledWithExactly("param", "param" + iIndex),
					"1. Installation: First hook was correctly called (" + this.aHookKeys[iIndex] + ")");
				assert.ok(oSpy.firstCall.calledOn(oObject1),
					"1. Installation: First hook was called with the default context (" + this.aHookKeys[iIndex] + ")");
				assert.ok(oSpy.secondCall.calledWithExactly("param", "param" + iIndex),
					"1. Installation: Second hook was correctly called (" + this.aHookKeys[iIndex] + ")");
				assert.ok(oSpy.secondCall.calledOn(oContext),
					"1. Installation: Second hook was called with a custom context (" + this.aHookKeys[iIndex] + ")");
			} else {
				assert.ok(false, "1. Installation: Hook should have been called twice (" + this.aHookKeys[iIndex] + ")");
			}
		}.bind(this));

		aSpies2.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.calledOnceWithExactly("param", "param" + iIndex),
				"2. Installation: Hook was correctly called (" + this.aHookKeys[iIndex] + ")");
			assert.ok(oSpy.calledOn(oContext), "2. Installation: Hook was called with the correct context (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));

		aSpies3.forEach(function(oSpy, iIndex) {
			assert.ok(oSpy.calledOnceWithExactly("param", "param" + iIndex),
				"3. Installation: Hook was correctly called (" + this.aHookKeys[iIndex] + ")");
			assert.ok(oSpy.calledOn(oObject3), "3. Installation: Hook was called with the correct context (" + this.aHookKeys[iIndex] + ")");
		}.bind(this));
	});

	QUnit.test("Processing arguments", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {hooks: {}};
		var sHookKey = this.aHookKeys[0];
		var aHookParam = [];

		oObject.hooks[sHookKey] = function(aParam) {
			aParam.push("Installation 1");
		};

		Hook.register(oTable, sHookKey, function(aParam) {
			aParam.push("Registration 1");
		});
		Hook.install(oTable, oObject);
		Hook.register(oTable, sHookKey, function(aParam) {
			aParam.push("Registration 2");
		});

		Hook.call(oTable, sHookKey, aHookParam);

		assert.deepEqual(aHookParam, ["Registration 1", "Installation 1", "Registration 2"]);
	});

	QUnit.test("Invalid key", function(assert) {
		var oTable = this.oFakeTable;
		var sCustomHookKey = "My.Custom.HookKey";
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {hooks: {"My.Custom.HookKey": oInstallationSpy}};

		Hook.install(oTable, oObject);
		Hook.register(oTable, sCustomHookKey, oRegistrationSpy);
		Hook.call(oTable, sCustomHookKey);

		assert.ok(oInstallationSpy.notCalled, "Custom hooks cannot be called in installations");
		assert.ok(oRegistrationSpy.notCalled, "Custom hooks cannot be called in registrations");
	});

	QUnit.test("Foreign scope", function(assert) {
		var oTable = this.oFakeTable;
		var oForeignScope = {};
		var sHookKey = this.aHookKeys[0];
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {hooks: {}};

		oObject.hooks[sHookKey] = oInstallationSpy;

		Hook.install(oForeignScope, oObject);
		Hook.register(oForeignScope, sHookKey, oRegistrationSpy);
		Hook.call(oTable, sHookKey);
		assert.ok(oInstallationSpy.notCalled, "Hooks cannot be called in installations for foreign scope");
		assert.ok(oRegistrationSpy.notCalled, "Hooks cannot be called in registrations for foreign scope");

		Hook.install(oTable, oObject);
		Hook.register(oTable, sHookKey, oRegistrationSpy);
		Hook.call(oForeignScope, sHookKey);
		assert.ok(oInstallationSpy.notCalled, "Hooks cannot be called for foreign scope in installations");
		assert.ok(oRegistrationSpy.notCalled, "Hooks cannot be called for foreign scope in registrations");
	});

	QUnit.test("Context", function(assert) {
		var oTable = this.oFakeTable;
		var sHookKey = this.aHookKeys[0];
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {hooks: {}};
		var oContext = {context: "My Context"};

		oObject.hooks[sHookKey] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, sHookKey, oRegistrationSpy);
		Hook.register(oTable, sHookKey, oRegistrationSpy, oContext);
		Hook.call(oTable, sHookKey);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installed hook called with the correct context");
		assert.ok(oRegistrationSpy.firstCall.calledOn(undefined), "Hook that was registered without context was called without context");
		assert.ok(oRegistrationSpy.secondCall.calledOn(oContext), "Hook that was registered with context was called with that context");

		// Try to change the context of an installation.
		oInstallationSpy.reset();
		Hook.install(oTable, oObject, oContext);
		Hook.call(oTable, sHookKey);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installing the same hook with another context does not change the context");

		// Uninstall and install with a context.
		oInstallationSpy.reset();
		Hook.uninstall(oTable, oObject);
		Hook.install(oTable, oObject, oContext);
		Hook.call(oTable, sHookKey);

		assert.ok(oInstallationSpy.calledOn(oContext), "After uninstall and install with a context, the hook was called with the correct context");
	});
});