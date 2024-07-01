/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/table/Column"
], function(TableUtils, Row, Column) {
	"use strict";

	const Hook = TableUtils.Hook;
	const oHookWithArguments = {
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
	const oHookWithoutArguments = {
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
		const oTable = this.oFakeTable;
		const sCustomHookKey = "My.Custom.HookKey";
		const oInstallationSpy = sinon.spy();
		const oRegistrationSpy = sinon.spy();
		const oObject = {};

		oObject[sCustomHookKey] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, sCustomHookKey, oRegistrationSpy);
		Hook.call(oTable, sCustomHookKey);

		assert.ok(oInstallationSpy.notCalled, "Custom hooks are not called in installations");
		assert.ok(oRegistrationSpy.notCalled, "Custom hooks are not called in registrations");
	});

	QUnit.test("Invalid scope", function(assert) {
		const oTable = this.oFakeTable;
		const oInvalidScope = {};
		const oInstallationSpy = sinon.spy();
		const oRegistrationSpy = sinon.spy();
		const oObject = {};

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
		const oTable = this.oFakeTable;
		const oOtherTable = {fakeTable: true};
		const oInstallationSpy = sinon.spy();
		const oRegistrationSpy = sinon.spy();
		const oObject = {};

		this.oTableUtilsIsAStub.withArgs(oOtherTable, "sap.ui.table.Table").returns(true);

		oObject[oHookWithArguments.key] = oInstallationSpy;
		Hook.install(oOtherTable, oObject);
		Hook.register(oOtherTable, oHookWithArguments.key, oRegistrationSpy);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.notCalled, "Hooks are not called in installations for a foreign scope");
		assert.ok(oRegistrationSpy.notCalled, "Hooks are not called in registrations for a foreign scope");
	});

	QUnit.test("Arguments", function(assert) {
		const oTable = this.oFakeTable;
		const oObject = {};

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
		const oTable = this.oFakeTable;

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
		const oRow = new Row();
		const oHookWithOptionalArguments = {
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
		const oTable = this.oFakeTable;

		for (let i = 0; i < oHookWithOptionalArguments.validCalls.length; i++) {
			const handler = function() {
				oHookWithOptionalArguments.assertArguments[this](assert, arguments);
			}.bind(i);
			Hook.register(oTable, oHookWithOptionalArguments.key, handler);
			oHookWithOptionalArguments.validCalls[i](oTable);
			Hook.deregister(oTable, oHookWithOptionalArguments.key, handler);
		}

		assert.throws(function() {
			const handler = function() {};
			Hook.register(oTable, oHookWithOptionalArguments.key, handler);
			oHookWithOptionalArguments.invalidCall(oTable);
			Hook.deregister(oTable, oHookWithOptionalArguments.key, handler);
		}, "Calling a hook with an invalid optional argument throws an error");

		oRow.destroy();
	});

	QUnit.test("Call order", function(assert) {
		const oTable = this.oFakeTable;
		const oObject = {};

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
		const oTable = this.oFakeTable;
		const oInstallationSpy = sinon.spy();
		const oRegistrationSpy = sinon.spy();
		const oObject = {};
		const oContext = {context: "My Context"};

		oObject[oHookWithArguments.key] = oInstallationSpy;

		Hook.install(oTable, oObject);
		Hook.register(oTable, oHookWithArguments.key, oRegistrationSpy);
		Hook.register(oTable, oHookWithArguments.key, oRegistrationSpy, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installed hook called with the correct context");
		assert.ok(oRegistrationSpy.firstCall.calledOn(undefined), "Hook that was registered without context was called without context");
		assert.ok(oRegistrationSpy.secondCall.calledOn(oContext), "Hook that was registered with context was called with that context");

		// Try to change the context of an installation.
		oInstallationSpy.resetHistory();
		Hook.install(oTable, oObject, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oObject), "Installing the same hook with another context does not change the context");

		// Uninstall and install with a context.
		oInstallationSpy.resetHistory();
		Hook.uninstall(oTable, oObject);
		Hook.install(oTable, oObject, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oInstallationSpy.calledOn(oContext), "After uninstall and install with a context, the hook was called with the correct context");
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
		const oTable = this.oFakeTable;
		const oSpy = sinon.spy();

		Hook.register(oTable, oHookWithArguments.key, oSpy);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.calledOnce, "Registered");
		oSpy.resetHistory();

		Hook.deregister(oTable, oHookWithArguments.key, oSpy);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.notCalled, "Deregistered");
	});

	QUnit.test("Multiple registrations", function(assert) {
		const oTable = this.oFakeTable;
		const oContext = {};
		const oSpy1 = sinon.spy();
		const oSpy2 = sinon.spy();
		const oSpy3 = sinon.spy();
		const oSpy4 = sinon.spy();
		const oSpy5 = sinon.spy();

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
		const oTable = this.oFakeTable;
		const oObject = {};
		const oSpy = sinon.spy();

		oObject[oHookWithArguments.key] = oSpy;
		Hook.install(oTable, oObject);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.calledOnce, "Installed");
		oSpy.resetHistory();

		Hook.uninstall(oTable, oObject);
		oHookWithArguments.validCall(oTable);
		assert.ok(oSpy.notCalled, "Uninstalled");
	});

	QUnit.test("Install but not implement hooks", function(assert) {
		const oTable = this.oFakeTable;
		const oObject = {};

		Hook.install(oTable, oObject);
		oHookWithArguments.validCall(oTable);

		assert.ok(true, "Calling a hook for an incomplete installation does not cause an error");
	});

	QUnit.test("Install and implement hooks afterwards", function(assert) {
		const oTable = this.oFakeTable;
		const oObject = {};

		Hook.install(oTable, oObject);
		oObject[oHookWithArguments.key] = sinon.spy();
		oHookWithArguments.validCall(oTable);

		assert.ok(oObject[oHookWithArguments.key].calledOnce, "Successfully called a hook that was implemented after installation");
	});

	QUnit.test("Multiple installations", function(assert) {
		const oTable = this.oFakeTable;
		const oObject1 = {};
		const oObject2 = {};
		const oObject3 = {};
		const oContext = {};
		const oSpy1 = sinon.spy();
		const oSpy2 = sinon.spy();
		const oSpy3 = sinon.spy();

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