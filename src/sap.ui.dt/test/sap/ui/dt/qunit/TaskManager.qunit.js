/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/TaskManager',
	'sap/ui/dt/Util'
], function(
	TaskManager,
	Util
) {
	"use strict";

	QUnit.start();

	QUnit.module("Public API - add()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must return task ID", function (assert) {
			assert.ok(
				Util.isInteger(
					this.oTaskManager.add({
						type: 'foo'
					})
				),
				'function returned integer ID of added task'
			);
		});
		QUnit.test("must trigger 'add' event", function (assert) {
			var iTaskId;

			this.oTaskManager.attachEventOnce("add", function (oEvent) {
				iTaskId = oEvent.getParameter('taskId');
				assert.ok(true, 'event is called');
			});

			assert.strictEqual(
				this.oTaskManager.add({
					type: 'foo'
				}),
				iTaskId,
				'then event is called with same task ID'
			);
		});
		QUnit.test("must provide unique IDs for different tasks", function (assert) {
			var iTaskId1 = this.oTaskManager.add({ type: 'foo' });
			var iTaskId2 = this.oTaskManager.add({ type: 'bar' });

			assert.notStrictEqual(iTaskId1, iTaskId2, 'provided IDs are unique');
		});
		QUnit.test("must fail when non-object parameter is specified", function (assert) {
			assert.throws(
				function () {
					this.oTaskManager.add('task');
				},
				/.*/,
				'error was thrown with some message'
			);
		});
		QUnit.test("must fail when object has no 'type' property", function (assert) {
			assert.throws(
				function () {
					this.oTaskManager.add({
						foo: 'bar'
					});
				},
				/.*/,
				'error was thrown with some message'
			);
		});
	});

	QUnit.module("Public API - complete()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must remove task from the list", function (assert) {
			var iTaskId = this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.complete(iTaskId);
			assert.notOk(
				this.oTaskManager.getList().some(function (oTask) {
					return oTask.id === iTaskId;
				}),
				'function task was removed properly'
			);
		});
		QUnit.test("must trigger 'complete' event", function (assert) {
			var iTaskId = this.oTaskManager.add({ type: 'foo' });
			var iTaskIdInEvent;

			this.oTaskManager.attachEventOnce("complete", function (oEvent) {
				iTaskIdInEvent = oEvent.getParameter('taskId');
				assert.ok(true, 'event is called');
			});
			this.oTaskManager.complete(iTaskId);

			assert.strictEqual(iTaskId, iTaskIdInEvent, 'then event is called with same task ID');
		});
	});

	QUnit.module("Public API - count()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must return amount of tasks", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.add({ type: 'bar' });
			assert.strictEqual(this.oTaskManager.count(), 2, 'function returns correct number of tasks');
		});
	});

	QUnit.module("Public API - isEmpty()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must be empty initially", function (assert) {
			assert.strictEqual(this.oTaskManager.isEmpty(), true, 'function returns correct value');
		});
		QUnit.test("must not be empty after adding new task", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			assert.strictEqual(this.oTaskManager.isEmpty(), false, 'function returns correct value');
		});
		QUnit.test("must be empty after adding new task and then completing it", function (assert) {
			var iTaskId = this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.complete(iTaskId);
			assert.strictEqual(this.oTaskManager.isEmpty(), true, 'function returns correct value');
		});
	});

	QUnit.module("Public API - getList()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must return unique arrays each time it's called", function (assert) {
			assert.notStrictEqual(this.oTaskManager.getList(), this.oTaskManager.getList(), 'function returns unique arrays');
		});
		QUnit.test("must return unique arrays but with same content", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			assert.deepEqual(this.oTaskManager.getList(), this.oTaskManager.getList(), 'function returns same content');
		});
	});

	QUnit.module("Public API - 'suppressEvents' property", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("'add' and 'complete' events must not be called with property is 'true'", function (assert) {
			this.oTaskManager.setSuppressEvents(true);

			this.oTaskManager.attachEventOnce("add", function () {
				assert.ok(false, 'this must not be called');
			});
			this.oTaskManager.attachEventOnce("complete", function () {
				assert.ok(false, 'this must not be called');
			});

			this.oTaskManager.complete(
				this.oTaskManager.add({ type: 'foo' })
			);

			assert.ok(true, 'events were not called');
		});
	});

});
