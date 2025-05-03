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
		const oHookSpy = sinon.spy();

		Hook.register(oTable, sCustomHookKey, oHookSpy);
		Hook.call(oTable, sCustomHookKey);

		assert.ok(oHookSpy.notCalled, "Custom hooks are not called in registrations");
	});

	QUnit.test("Invalid scope", function(assert) {
		const oTable = this.oFakeTable;
		const oInvalidScope = {};
		const oHookSpy = sinon.spy();

		Hook.register(oTable, oHookWithArguments.key, oHookSpy);

		oTable._bIsBeingDestroyed = true;
		oHookWithArguments.validCall(oTable);
		assert.ok(oHookSpy.notCalled, "Hooks are not called in registrations for tables that are currently being destroyed");
		delete oTable._bIsBeingDestroyed;

		oTable.bIsDestroyed = true;
		oHookWithArguments.validCall(oTable);
		assert.ok(oHookSpy.notCalled, "Hooks are not called in registrations for tables that are destroyed");
		delete oTable.bIsDestroyed;

		Hook.deregister(oTable, oHookWithArguments.key, oHookSpy);
		Hook.register(oInvalidScope, oHookWithArguments.key, oHookSpy);
		oHookWithArguments.validCall(oInvalidScope);
		oHookWithArguments.validCall(oTable);
		assert.ok(oHookSpy.notCalled, "Hooks are not called in registrations for an unsupported scope type");
	});

	QUnit.test("Foreign scope", function(assert) {
		const oTable = this.oFakeTable;
		const oOtherTable = {fakeTable: true};
		const oHookSpy = sinon.spy();

		Hook.register(oOtherTable, oHookWithArguments.key, oHookSpy);
		oHookWithArguments.validCall(oTable);
		assert.ok(oHookSpy.notCalled, "Hooks are not called in registrations for a foreign scope");
	});

	QUnit.test("Arguments", function(assert) {
		const oTable = this.oFakeTable;

		Hook.register(oTable, oHookWithArguments.key, function() {
			oHookWithArguments.assertArguments(assert, arguments);
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			oHookWithoutArguments.assertArguments(assert, arguments);
		});

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

		Hook.register(oTable, oHookWithArguments.key, function() {
			assert.step("Hook with arguments: Registration 1");
		});
		Hook.register(oTable, oHookWithoutArguments.key, function() {
			assert.step("Hook without arguments: Registration 1");
		});
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
			"Hook with arguments: Registration 2",
			"Hook without arguments: Registration 1",
			"Hook without arguments: Registration 2"
		], "Hooks were called in the correct order");
	});

	QUnit.test("Context", function(assert) {
		const oTable = this.oFakeTable;
		const oHookSpy = sinon.spy();
		const oContext = {context: "My Context"};

		Hook.register(oTable, oHookWithArguments.key, oHookSpy);
		Hook.register(oTable, oHookWithArguments.key, oHookSpy, oContext);
		oHookWithArguments.validCall(oTable);

		assert.ok(oHookSpy.firstCall.calledOn(undefined), "Hook that was registered without context was called without context");
		assert.ok(oHookSpy.secondCall.calledOn(oContext), "Hook that was registered with context was called with that context");
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
});