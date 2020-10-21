/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/table/Column"
], function(TableQUnitUtils, TableUtils, Row, Column) {
	"use strict";

	var Hook = TableUtils.Hook;
	var oHookWithArguments = {
		key: "Table.UpdateRows",
		validCall: function(oScope) {
			TableUtils.Hook.call(oScope, this.key, TableUtils.RowsUpdateReason.Change);
		},
		invalidCall: function(oScope) {
			TableUtils.Hook.call(oScope, this.key, TableUtils.RowsUpdateReason.Change, "invalidArgument");
		},
		assertArguments: function(assert, _arguments) {
			assert.deepEqual(Array.prototype.slice.call(_arguments), [TableUtils.RowsUpdateReason.Change], "Arguments are correct");
		}
	};
	var oHookWithoutArguments = {
		key: "Table.RowsUnbound",
		validCall: function(oScope) {
			TableUtils.Hook.call(oScope, this.key);
		},
		invalidCall: function(oScope) {
			TableUtils.Hook.call(oScope, this.key, "invalidArgument");
		},
		assertArguments: function(assert, _arguments) {
			assert.deepEqual(Array.prototype.slice.call(_arguments), [], "Arguments are correct");
		}
	};

	QUnit.module("Misc");

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Hook, "Hook namespace available");
		assert.ok(TableUtils.Hook.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Calling", {
		beforeEach: function() {
			this.oFakeTable = {fakeTable: true};
			this.oTableUtilsIsAStub = sinon.stub(TableUtils, "isA");
			this.oTableUtilsIsAStub.callThrough();
			this.oTableUtilsIsAStub.withArgs(this.oFakeTable, "sap.ui.table.Table").returns(true);
		},
		afterEach: function() {
			this.oTableUtilsIsAStub.restore();
		}
	});

	QUnit.test("No hooks registered or installed", function(assert) {
		oHookWithArguments.validCall(this.oFakeTable);
		assert.ok(true, "Calling a hook does not cause an error");
	});

	QUnit.test("Invalid key", function(assert) {
		var oTable = this.oFakeTable;
		var sCustomHookKey = "My.Custom.HookKey";
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {};

		oObject[sCustomHookKey] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, sCustomHookKey, oRegistrationSpy);
		Hook.call(oTable, sCustomHookKey);

		assert.ok(oInstallationSpy.notCalled, "Custom hooks are not called in installations");
		assert.ok(oRegistrationSpy.notCalled, "Custom hooks are not called in registrations");
	});

	QUnit.test("Invalid scope", function(assert) {
		var oTable = this.oFakeTable;
		var oInvalidScope = {};
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {};

		oObject[oHookWithArguments.key] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, oHookWithArguments.key, oRegistrationSpy);

		oTable._bIsBeingDestroyed = true;
		oHookWithArguments.validCall(oTable);
		assert.ok(oInstallationSpy.notCalled, "Hooks are not called in installations for tables that are currently being destroyed");
		assert.ok(oRegistrationSpy.notCalled, "Hooks are not called in registrations for tables that are currently being destroyed");
		delete oTable._bIsBeingDestroyed;

		oTable.bIsDestroyed = true;
		oHookWithArguments.validCall(oTable);
		assert.ok(oInstallationSpy.notCalled, "Hooks are not called in installations for tables that are destroyed");
		assert.ok(oRegistrationSpy.notCalled, "Hooks are not called in registrations for tables that are destroyed");
		delete oTable.bIsDestroyed;

		Hook.uninstall(oTable, oObject);
		Hook.deregister(oTable, oHookWithArguments.key, oRegistrationSpy);
		Hook.install(oInvalidScope, oObject);
		Hook.register(oInvalidScope, oHookWithArguments.key, oRegistrationSpy);
		oHookWithArguments.validCall(oInvalidScope);
		oHookWithArguments.validCall(oTable);
		assert.ok(oInstallationSpy.notCalled, "Hooks are not called in installations for an unsupported scope type");
		assert.ok(oRegistrationSpy.notCalled, "Hooks are not called in registrations for an unsupported scope type");
	});

	QUnit.test("Foreign scope", function(assert) {
		var oTable = this.oFakeTable;
		var oOtherTable = {fakeTable: true};
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {};

		this.oTableUtilsIsAStub.withArgs(oOtherTable, "sap.ui.table.Table").returns(true);

		oObject[oHookWithArguments.key] = oInstallationSpy;
		Hook.install(oOtherTable, oObject);
		Hook.register(oOtherTable, oHookWithArguments.key, oRegistrationSpy);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.notCalled, "Hooks are not called in installations for a foreign scope");
		assert.ok(oRegistrationSpy.notCalled, "Hooks are not called in registrations for a foreign scope");
	});

	QUnit.test("Arguments", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};

		oObject[oHookWithArguments.key] = function() {
			oHookWithArguments.assertArguments(assert, arguments);
		};
		oObject[oHookWithoutArguments.key] = function() {
			oHookWithoutArguments.assertArguments(assert, arguments);
		};

		Hook.register(oTable, oHookWithArguments.key, function() {
			oHookWithArguments.assertArguments(assert, arguments);
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			oHookWithoutArguments.assertArguments(assert, arguments);
		});
		Hook.install(oTable, oObject);

		oHookWithArguments.validCall(oTable);
		oHookWithoutArguments.validCall(oTable);
	});

	QUnit.test("Invalid arguments", function(assert) {
		var oTable = this.oFakeTable;

		oHookWithArguments.invalidCall(oTable);
		oHookWithoutArguments.invalidCall(oTable);

		assert.ok(true, "Calling hooks with invalid arguments does not throw an error if no hooks are registered");

		Hook.register(oTable, oHookWithArguments.key, function() {
			oHookWithArguments.assertArguments(assert, arguments);
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			oHookWithoutArguments.assertArguments(assert, arguments);
		});

		assert.throws(function() {
			oHookWithArguments.invalidCall(oTable);
		}, "Calling a hook that expects arguments with invalid arguments throws an error");

		assert.throws(function() {
			oHookWithoutArguments.invalidCall(oTable);
		}, "Calling a hook that does not expect arguments with arguments throws an error");
	});

	// There are currently no hooks with optional arguments that could be used for testing.
	QUnit.skip("Optional arguments", function(assert) {
		var oRow = new Row();
		var oHookWithOptionalArguments = {
			key: "Row.ToggleOpenState",
			validCalls: [
				function(oScope) {
					TableUtils.Hook.call(oScope, oHookWithOptionalArguments.key, oRow);
				},
				function(oScope) {
					TableUtils.Hook.call(oScope, oHookWithOptionalArguments.key, oRow, null);
				},
				function(oScope) {
					TableUtils.Hook.call(oScope, oHookWithOptionalArguments.key, oRow, true);
				}
			],
			invalidCall: function(oScope) {
				TableUtils.Hook.call(oScope, this.key, new Row(), 1);
			},
			assertArguments: [
				function(assert, _arguments) {
					assert.deepEqual(Array.prototype.slice.call(_arguments), [oRow], "Arguments are correct");
				},
				function(assert, _arguments) {
					assert.deepEqual(Array.prototype.slice.call(_arguments), [oRow], "Arguments are correct");
				},
				function(assert, _arguments) {
					assert.deepEqual(Array.prototype.slice.call(_arguments), [oRow, true], "Arguments are correct");
				}
			]
		};
		var oTable = this.oFakeTable;

		for (var i = 0; i < oHookWithOptionalArguments.validCalls.length; i++) {
			var handler = function() { //eslint-disable-line no-loop-func
				oHookWithOptionalArguments.assertArguments[this](assert, arguments);
			}.bind(i);
			Hook.register(oTable, oHookWithOptionalArguments.key, handler);
			oHookWithOptionalArguments.validCalls[i](oTable);
			Hook.deregister(oTable, oHookWithOptionalArguments.key, handler);
		}

		assert.throws(function() {
			var handler = function() {};
			Hook.register(oTable, oHookWithOptionalArguments.key, handler);
			oHookWithOptionalArguments.invalidCall(oTable);
			Hook.deregister(oTable, oHookWithOptionalArguments.key, handler);
		}, "Calling a hook with an invalid optional argument throws an error");

		oRow.destroy();
	});

	QUnit.test("Call order", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};

		oObject[oHookWithArguments.key] = function() {
			assert.step("Hook with arguments: Installation");
		};
		oObject[oHookWithoutArguments.key] = function() {
			assert.step("Hook without arguments: Installation");
		};

		Hook.register(oTable, oHookWithArguments.key, function() {
			assert.step("Hook with arguments: Registration 1");
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			assert.step("Hook without arguments: Registration 1");
		});
		Hook.install(oTable, oObject);
		Hook.register(oTable, oHookWithArguments.key, function() {
			assert.step("Hook with arguments: Registration 2");
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			assert.step("Hook without arguments: Registration 2");
		});

		oHookWithArguments.validCall(oTable);
		oHookWithoutArguments.validCall(oTable);

		assert.verifySteps([
			"Hook with arguments: Registration 1",
			"Hook with arguments: Installation",
			"Hook with arguments: Registration 2",
			"Hook without arguments: Registration 1",
			"Hook without arguments: Installation",
			"Hook without arguments: Registration 2"
		], "Hooks were called in the correct order");
	});

	QUnit.test("Context", function(assert) {
		var oTable = this.oFakeTable;
		var oInstallationSpy = sinon.spy();
		var oRegistrationSpy = sinon.spy();
		var oObject = {};
		var oContext = {context: "My Context"};

		oObject[oHookWithArguments.key] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, oHookWithArguments.key, oRegistrationSpy);
		Hook.register(oTable, oHookWithArguments.key, oRegistrationSpy, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installed hook called with the correct context");
		assert.ok(oRegistrationSpy.firstCall.calledOn(undefined), "Hook that was registered without context was called without context");
		assert.ok(oRegistrationSpy.secondCall.calledOn(oContext), "Hook that was registered with context was called with that context");

		// Try to change the context of an installation.
		oInstallationSpy.reset();
		Hook.install(oTable, oObject, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installing the same hook with another context does not change the context");

		// Uninstall and install with a context.
		oInstallationSpy.reset();
		Hook.uninstall(oTable, oObject);
		Hook.install(oTable, oObject, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oContext), "After uninstall and install with a context, the hook was called with the correct context");
	});

	QUnit.test("Return value", function(assert) {
		var oColumn = new Column();
		var oHookWithReturnValue = {
			key: "Column.MenuItemNotification",
			validCall: function(oScope) {
				return TableUtils.Hook.call(oScope, this.key, oColumn);
			},
			validReturnValue: true,
			invalidReturnValue: 1
		};
		var oTable = this.oFakeTable;
		var oObjectA = {};
		var oObjectB = {};
		var oObjectC = {};

		assert.deepEqual(oHookWithReturnValue.validCall(oTable), [], "Return values for valid call if nothing returned");

		oObjectA[oHookWithReturnValue.key] = function() {
			return oHookWithReturnValue.validReturnValue;
		};
		oObjectB[oHookWithReturnValue.key] = function() {
			return oHookWithReturnValue.invalidReturnValue;
		};
		oObjectC[oHookWithReturnValue.key] = function() {};

		Hook.register(oTable, oHookWithReturnValue.key, function() {
			return oHookWithReturnValue.validReturnValue;
		});
		Hook.register(oTable, oHookWithReturnValue.key, function() {
			return oHookWithReturnValue.invalidReturnValue;
		});
		Hook.register(oTable, oHookWithReturnValue.key, function() {});
		Hook.install(oTable, oObjectA);
		Hook.install(oTable, oObjectB);
		Hook.install(oTable, oObjectC);

		assert.deepEqual(oHookWithReturnValue.validCall(oTable), [
			oHookWithReturnValue.validReturnValue,
			oHookWithReturnValue.validReturnValue
		], "Return values for valid call");

		oColumn.destroy();
	});

	QUnit.module("Registration", {
		beforeEach: function() {
			this.oFakeTable = {fakeTable: true};
			this.oTableUtilsIsAStub = sinon.stub(TableUtils, "isA");
			this.oTableUtilsIsAStub.withArgs(this.oFakeTable, "sap.ui.table.Table").returns(true);
		},
		afterEach: function() {
			this.oTableUtilsIsAStub.restore();
		}
	});

	QUnit.test("Register and deregister", function(assert) {
		var oTable = this.oFakeTable;
		var oSpy = sinon.spy();

		Hook.register(oTable, oHookWithArguments.key, oSpy);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.calledOnce, "Registered");
		oSpy.reset();

		Hook.deregister(oTable, oHookWithArguments.key, oSpy);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.notCalled, "Deregistered");
	});

	QUnit.test("Multiple registrations", function(assert) {
		var oTable = this.oFakeTable;
		var oContext = {};
		var oSpy1 = sinon.spy();
		var oSpy2 = sinon.spy();
		var oSpy3 = sinon.spy();
		var oSpy4 = sinon.spy();
		var oSpy5 = sinon.spy();

		Hook.register(oTable, oHookWithArguments.key, oSpy1);
		Hook.register(oTable, oHookWithArguments.key, oSpy1);
		Hook.register(oTable, oHookWithArguments.key, oSpy1, oContext);
		Hook.register(oTable, oHookWithArguments.key, oSpy1, oContext);
		Hook.register(oTable, oHookWithArguments.key, oSpy2);
		Hook.deregister(oTable, oHookWithArguments.key, oSpy2);
		Hook.register(oTable, oHookWithArguments.key, oSpy3, oContext);
		Hook.deregister(oTable, oHookWithArguments.key, oSpy3, oContext);
		Hook.register(oTable, oHookWithArguments.key, oSpy4);
		Hook.deregister(oTable, oHookWithArguments.key, oSpy4, oContext);
		Hook.register(oTable, oHookWithArguments.key, oSpy5, oContext);
		Hook.deregister(oTable, oHookWithArguments.key, oSpy5, {});
		Hook.deregister(oTable, oHookWithArguments.key, oSpy5);
		oHookWithArguments.validCall(oTable);

		assert.equal(oSpy1.callCount, 4, "Hook that is registered twice with and twice without context is called four times");
		assert.ok(oSpy2.notCalled, "Hook that was deregistered it not called (without context)");
		assert.ok(oSpy3.notCalled, "Hook that was deregistered it not called (with context)");
		assert.ok(oSpy4.calledOnce, "Hook that was registered without context cannot be deregistered with context");
		assert.ok(oSpy5.calledOnce, "Hook that was registered with context cannot be deregistered with another context");
	});

	QUnit.module("Installation", {
		beforeEach: function() {
			this.oFakeTable = {fakeTable: true};
			this.oTableUtilsIsAStub = sinon.stub(TableUtils, "isA");
			this.oTableUtilsIsAStub.withArgs(this.oFakeTable, "sap.ui.table.Table").returns(true);
		},
		afterEach: function() {
			this.oTableUtilsIsAStub.restore();
		}
	});

	QUnit.test("Install and uninstall", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};
		var oSpy = sinon.spy();

		oObject[oHookWithArguments.key] = oSpy;
		Hook.install(oTable, oObject);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.calledOnce, "Installed");
		oSpy.reset();

		Hook.uninstall(oTable, oObject);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.notCalled, "Uninstalled");
	});

	QUnit.test("Install but not implement hooks", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};

		Hook.install(oTable, oObject);
		oHookWithArguments.validCall(oTable);

		assert.ok(true, "Calling a hook for an incomplete installation does not cause an error");
	});

	QUnit.test("Install and implement hooks afterwards", function(assert) {
		var oTable = this.oFakeTable;
		var oObject = {};

		Hook.install(oTable, oObject);
		oObject[oHookWithArguments.key] = sinon.spy();
		oHookWithArguments.validCall(oTable);

		assert.ok(oObject[oHookWithArguments.key].calledOnce, "Successfully called a hook that was implemented after installation");
	});

	QUnit.test("Multiple installations", function(assert) {
		var oTable = this.oFakeTable;
		var oObject1 = {};
		var oObject2 = {};
		var oObject3 = {};
		var oContext = {};
		var oSpy1 = sinon.spy();
		var oSpy2 = sinon.spy();
		var oSpy3 = sinon.spy();

		oObject1[oHookWithArguments.key] = oSpy1;
		oObject2[oHookWithArguments.key] = oSpy2;
		oObject3[oHookWithArguments.key] = oSpy3;

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

		oHookWithArguments.validCall(oTable);

		if (oSpy1.callCount === 2) {
			assert.ok(oSpy1.calledTwice, "1. Installation: Called twice");
			assert.ok(oSpy1.firstCall.calledOn(oObject1), "1. Installation: First call with the default context");
			assert.ok(oSpy1.secondCall.calledOn(oContext), "1. Installation: Second call with a custom context");
		} else {
			assert.ok(false, "1. Installation: Should have been called twice");
		}

		assert.ok(oSpy2.calledOnce, "2. Installation: Called once");
		assert.ok(oSpy2.calledOn(oContext), "2. Installation: Called with the correct context");

		assert.ok(oSpy3.calledOnce, "3. Installation: Called once");
		assert.ok(oSpy3.calledOn(oObject3), "3. Installation: Called with the correct context");
	});
});