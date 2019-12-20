/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/TaskManager",
	"sap/ui/dt/Util"
], function (
	TaskManager,
	Util
) {
	"use strict";

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
		QUnit.test("must fail when object has wrong 'identifier' property", function (assert) {
			assert.throws(
				function () {
					this.oTaskManager.add({
						type: 'bar'
					}, ['string-instead-validator-function']);
				},
				/.*/,
				'error was thrown with some message'
			);
		});
		QUnit.test("must remove outdated and add new task when identifier parameter as function is provided (duplicate: same type & same identifier)", function (assert) {
			var fnDoublesIdentifier = function(mTask) {
				return mTask.identifier;
			};
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo'
			}, fnDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 1, "then first Task with 'foo' identifier is added");
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'bar'
			}, fnDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 2, "then second Task with 'bar' identifier is added");
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo' },
			fnDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 2, "then the queue contains just the first two tasks");
		});
		QUnit.test("must remove outdated and add new task when identifier paramter as string is provided (duplicate: same type & same identifier)", function (assert) {
			var sDoublesIdentifier = "identifier";
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo'
			}, sDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 1, "then first Task with 'foo' identifier is added");
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'bar'
			}, sDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 2, "then second Task with 'bar' identifier is added");
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo' },
			sDoublesIdentifier);
			assert.equal(this.oTaskManager.getList().length, 2, "then the queue contains just the first two tasks");
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
			var aTaskIdsInEvent;

			this.oTaskManager.attachEventOnce("complete", function (oEvent) {
				aTaskIdsInEvent = oEvent.getParameter('taskId');
				assert.ok(true, 'event is called');
			});
			this.oTaskManager.complete(iTaskId);

			assert.equal(iTaskId, aTaskIdsInEvent[0], 'then event is called with same task ID');
		});
		QUnit.test("must remove task from the pending list", function (assert) {
			var iTaskId = this.oTaskManager.add({ type: "foo" });
			this.oTaskManager.add({ type: "bar" });
			assert.strictEqual(this.oTaskManager.getQueuedTasks("foo").length, 1, "one task is added to the pending list");
			this.oTaskManager.complete(iTaskId);
			assert.strictEqual(this.oTaskManager.getList("foo").length, 0, "then function task was removed properly");
		});
	});

	QUnit.module("Public API - completeBy()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must remove task from the list", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.add({ type: 'bar' });
			this.oTaskManager.completeBy({ type: 'foo' });
			assert.notOk(
				this.oTaskManager.getList().some(function (oTask) {
					return oTask.type === "foo";
				}),
				"then 'foo' task was removed properly"
			);
			assert.equal(this.oTaskManager.getList().length, 1,
				"then second task from another type is still available");
		});
		QUnit.test("must remove task from the list with condition", function (assert) {
			var iTaskToBeRemovedId = this.oTaskManager.add({ type: "foo", someTaskParameter: "someCondition" });
			this.oTaskManager.add({ type: 'bar', someTaskParameter: "someCondition" });
			this.oTaskManager.add({ type: 'foo', someTaskParameter: "anotherCondition" });
			this.oTaskManager.completeBy({ type: 'foo', someTaskParameter: "someCondition" });
			assert.notOk(
				this.oTaskManager.getList().some(function (oTask) {
					return oTask.id === iTaskToBeRemovedId;
				}),
				"then 'foo' task was removed properly"
			);
			assert.equal(this.oTaskManager.getList().length, 2,
				"then other tasks from same type another condition and the task with another type are still available");
		});
		QUnit.test("must remove all tasks from the list", function (assert) {
			this.oTaskManager.add({ type: 'bar' });
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.completeBy({ type: 'foo' });
			assert.notOk(
				this.oTaskManager.getList().some(function (oTask) {
					return oTask.type === "foo";
				}),
				"then all foo tasks were removed properly"
			);
			assert.ok(
				this.oTaskManager.getList().some(function (oTask) {
					return oTask.type === "bar";
				}),
				"then task from another type is still available");
		});
		QUnit.test("must trigger 'complete' event", function (assert) {
			var iTaskId = this.oTaskManager.add({ type: 'foo' });
			var aTaskIdsInEvent;

			this.oTaskManager.attachEventOnce("complete", function (oEvent) {
				aTaskIdsInEvent = oEvent.getParameter('taskId');
				assert.ok(true, 'event is called');
			});
			this.oTaskManager.completeBy({ type: 'foo' });

			assert.strictEqual(iTaskId, aTaskIdsInEvent[0], 'then event is called with same task ID');
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
		QUnit.test("must return amount of tasks for explicit type", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.add({ type: 'bar' });
			assert.strictEqual(this.oTaskManager.count('foo'), 1, 'function returns correct number of tasks for the given type');
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
		QUnit.test("must be empty after adding new task and then completing it, including add of duplicate tasks (duplicate: same type & same identifier)", function (assert) {
			var sDoublesIdentifier = "identifier";
			this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo'
			}, sDoublesIdentifier);
			var iTaskId = this.oTaskManager.add({
				type: 'withValidator',
				identifier: 'foo'
			}, sDoublesIdentifier);
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
			assert.ok(Array.isArray(this.oTaskManager.getList()), 'function return an array value');
			assert.notStrictEqual(this.oTaskManager.getList(), this.oTaskManager.getList(), 'function returns unique instances (arrays)');
		});
		QUnit.test("must return unique arrays but with same content", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			assert.deepEqual(this.oTaskManager.getList(), this.oTaskManager.getList(), 'function returns same content');
		});
		QUnit.test("must return unique array with the complete taskList", function (assert) {
			this.oTaskManager.add({ type: 'foo' });
			this.oTaskManager.add({ type: 'bar' });
			var aTaskList = this.oTaskManager.getList();
			assert.strictEqual(aTaskList.length, 2, 'function returns the right amount of values');
			assert.strictEqual(aTaskList[0].type, 'foo', 'function returns the values in the correct order');
			assert.strictEqual(aTaskList[1].type, 'bar', 'function returns the values in the correct order');
		});
		QUnit.test("must return unique array with the taskList selected by given taskType", function (assert) {
			this.oTaskManager.add({ type: 'foo', order: 1 });
			this.oTaskManager.add({ type: 'foo', order: 2 });
			this.oTaskManager.add({ type: 'bar' });
			var aTaskList = this.oTaskManager.getList('foo');
			assert.ok(Array.isArray(aTaskList), 'function return an array value');
			assert.strictEqual(aTaskList.length, 2, 'function returns the right amount of values');
			assert.ok(aTaskList.every(function (mTask) {
				return mTask.type === 'foo';
			}), 'function returns the values with the right taskType');
			// there is no sorting. it tests only that the task adding order is the same as the task running order
			assert.ok(aTaskList[0].order < aTaskList[1].order, 'function returns the values with the same order as they are added');
		});
	});

	QUnit.module("Public API - getQueuedTasks()", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
		}
	}, function () {
		QUnit.test("must return unique arrays each time it's called", function (assert) {
			assert.ok(Array.isArray(this.oTaskManager.getQueuedTasks()), "function return an array value");
			assert.notStrictEqual(this.oTaskManager.getQueuedTasks(), this.oTaskManager.getQueuedTasks(), "function returns unique instances (arrays)");
		});
		QUnit.test("must return the task just once (once asked the task is marked pending and is removed from the queued list)", function (assert) {
			this.oTaskManager.add({ type: "foo" });
			assert.strictEqual(this.oTaskManager.getQueuedTasks()[0].type, "foo", "on first call function returns added task");
			assert.strictEqual(this.oTaskManager.getQueuedTasks().length, 0, "on second call function should not return the task again (not queued anymore)");
			assert.ok(!this.oTaskManager.isEmpty(), "after the get calls the task still exists in the task manager");
		});
		QUnit.test("must return unique array with the queued taskList", function (assert) {
			this.oTaskManager.add({ type: "foo" });
			this.oTaskManager.add({ type: "bar" });
			var aTaskList = this.oTaskManager.getQueuedTasks();
			assert.strictEqual(aTaskList.length, 2, "function returns the right amount of values");
			assert.strictEqual(aTaskList[0].type, "foo", "function returns the values in the correct order");
			assert.strictEqual(aTaskList[1].type, "bar", "function returns the values in the correct order");
		});
		QUnit.test("must return unique array with the taskList selected by given taskType", function (assert) {
			this.oTaskManager.add({ type: "foo", order: 1 });
			this.oTaskManager.add({ type: "foo", order: 2 });
			this.oTaskManager.add({ type: "bar" });
			var aTaskList = this.oTaskManager.getQueuedTasks("foo");
			assert.ok(Array.isArray(aTaskList), "function return an array value");
			assert.strictEqual(aTaskList.length, 2, "function returns the right amount of values");
			assert.ok(aTaskList.every(function (mTask) {
				return mTask.type === "foo";
			}), "function returns the values with the right taskType");
			// there is no sorting. it tests only that the task adding order is the same as the task running order
			assert.ok(aTaskList[0].order < aTaskList[1].order, "function returns the values with the same order as they are added");
			assert.strictEqual(this.oTaskManager.count(), 3, "task manager still contains 3 tasks");
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

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
