/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/isPlainObject"
],
function(
	ManagedObject,
	isPlainObject
) {
	"use strict";
	/**
	 * Constructor for a new TaskManager.
	 *
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The TaskManager keeps list of task and allows to manage them via simple API.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.TaskManager
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var TaskManager = ManagedObject.extend("sap.ui.dt.TaskManager", {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				suppressEvents: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				add: {
					parameters: {
						taskId: "int"
					}
				},
				complete: {
					parameters: {
						taskId: "array"
					}
				}
			}
		},
		constructor: function () {
			ManagedObject.apply(this, arguments);
			this._mQueuedTasks = {};
			this._mPendingTasks = {};
		},
		/**
		 * IDs counter
		 * @type {number}
		 * @private
		 */
		_iNextId: 0,
		_iTaskCounter: 0
	});

	TaskManager.prototype._validateTask = function(mTask) {
		if (
			!isPlainObject(mTask)
			|| !mTask.type
			|| typeof mTask.type !== "string"
		) {
			throw new Error("Invalid task specified");
		}
	};

	TaskManager.prototype._removeOutdatedTasks = function(mTask, vDoubleIdentifier) {
		if (vDoubleIdentifier) {
			var fnDoubleIdentifier;
			if (typeof vDoubleIdentifier === "string") {
				fnDoubleIdentifier = function (mTask) { return mTask[vDoubleIdentifier]; };
			} else if (typeof vDoubleIdentifier === "function") {
				fnDoubleIdentifier = vDoubleIdentifier;
			} else {
				throw new Error("Validator needs to be a function or a string");
			}
			var aTaskList = this._mQueuedTasks[mTask.type];
			var sNewTaskIdentifier = fnDoubleIdentifier(mTask);
			if (
				aTaskList
				&& sNewTaskIdentifier
			) {
				this._mQueuedTasks[mTask.type] = aTaskList.filter(function (oTask) {
					if (fnDoubleIdentifier(oTask) === sNewTaskIdentifier) {
						this._iTaskCounter--;
						return false;
					}
					return true;
				}.bind(this));
			}
		}
	};

	TaskManager.prototype._addTask = function(mTask) {
		var iTaskId = this._iNextId++;
		this._mQueuedTasks[mTask.type] = this._mQueuedTasks[mTask.type] || [];
		this._mQueuedTasks[mTask.type].push(Object.assign({}, mTask, {
			id: iTaskId
		}));
		this._iTaskCounter++;
		if (!this.getSuppressEvents()) {
			this.fireAdd({
				taskId: iTaskId
			});
		}
		return iTaskId;
	};

	/**
	 * Adds new task into the list.
	 * @param {object} mTask - Task definition map
	 * @param {string} mTask.type - Task type
	 * @param {function|string} [vDoubleIdentifier] - Identifier for outdated tasks in <code>TaskManager</code>. The identifier is invoked for each element in task list to generate
	 * the criterion by which the existing tasks are compared with the new one. The existing tasks that are identified
	 * by <code>vDoubleIdentifier</code> are removed before adding the new task.
	 * @return {number} Task ID
	 */
	TaskManager.prototype.add = function (mTask, vDoubleIdentifier) {
		this._validateTask(mTask);
		this._removeOutdatedTasks(mTask, vDoubleIdentifier);
		return this._addTask(mTask);
	};

	TaskManager.prototype._removeTaskById = function (iTaskId, sListName) {
		Object.keys(this[sListName]).forEach(function (sTypeName) {
			this[sListName][sTypeName] = this[sListName][sTypeName].filter(function (mTask) {
				if (mTask.id === iTaskId) {
					this._iTaskCounter--;
					return false;
				}
				return true;
			}.bind(this));
		}, this);
	};

	/**
	 * Completes the task by its ID
	 * @param {number} iTaskId - Task ID
	 */
	TaskManager.prototype.complete = function (iTaskId) {
		// TODO: performance improvements?
		this._removeTaskById(iTaskId, "_mQueuedTasks");
		this._removeTaskById(iTaskId, "_mPendingTasks");
		if (!this.getSuppressEvents()) {
			this.fireComplete({
				taskId: [iTaskId]
			});
		}
	};

	/**
	 * Completes the tasks by the task definition. It is also possible to filter
	 * by parts of the existing task definitions.
	 * @param {object} mTask - Task definition map
	 * @param {object} mTask.type - Task type
	 */
	TaskManager.prototype.completeBy = function (mTask) {
		this._validateTask(mTask);
		var aCompledTaskIds = [];
		// TODO: get rid of filtering other task parameters then type for performance reasons
		var _removeTasksByDefinition = function (aTasks) {
			return (aTasks || []).filter(function (mLocalTask) {
				var bCompleteTask = Object.keys(mTask).every(function(sKey) {
					return mLocalTask[sKey] && mLocalTask[sKey] === mTask[sKey];
				});
				if (bCompleteTask) {
					this._iTaskCounter--;
					aCompledTaskIds.push(mLocalTask.id);
					return false;
				}
				return true;
			}.bind(this));
		}.bind(this);
		this._mQueuedTasks[mTask.type] = _removeTasksByDefinition(this._mQueuedTasks[mTask.type]);
		this._mPendingTasks[mTask.type] = _removeTasksByDefinition(this._mPendingTasks[mTask.type]);
		if (!this.getSuppressEvents()) {
			this.fireComplete({
				taskId: aCompledTaskIds
			});
		}
	};

	/**
	 * Cancels the task by its ID
	 * @param {number} iTaskId - Task ID
	 */
	TaskManager.prototype.cancel = function (iTaskId) {
		this.complete(iTaskId);
	};

	/**
	 * Checks if the queue is empty
	 * @return {boolean} <code>true</code> if there is no pending task
	 */
	TaskManager.prototype.isEmpty = function () {
		return this._iTaskCounter === 0;
	};

	/**
	 * Returns amount of the tasks in the queue
	 * @param {string} [sType] - type of pending tasks to be counted. When <code>undefined</code> the count will be returned for all tasks
	 * @return {number} Amount of tasks
	 */
	TaskManager.prototype.count = function (sType) {
		return this.getList(sType).length;
	};

	TaskManager.prototype._markAsPending = function (sType, aTasks) {
		this._mPendingTasks[sType] = (this._mPendingTasks[sType] || []).concat(aTasks);
		this._mQueuedTasks[sType] = [];
	};

	TaskManager.prototype._getTypedList = function (sTaskType, bMarkAsPending) {
		var aTasks = [];
		if (this._mQueuedTasks[sTaskType]) {
			aTasks = this._mQueuedTasks[sTaskType].slice(0);
		}
		if (bMarkAsPending) {
			this._markAsPending(sTaskType, aTasks);
		} else if (this._mPendingTasks[sTaskType]) {
			aTasks = aTasks.concat(this._mQueuedTasks[sTaskType].slice(0));
		}
		return aTasks;
	};

	TaskManager.prototype._getAllTasks = function (bMarkAsPending) {
		var aAllTasks = [];
		aAllTasks = Object.keys(this._mQueuedTasks).reduce(function(aResult, _sType) {
			aResult = aResult.concat(this._mQueuedTasks[_sType]);
			if (bMarkAsPending) {
				this._markAsPending(_sType, this._mQueuedTasks[_sType]);
			}
			return aResult;
		}.bind(this), []);
		if (!bMarkAsPending) {
			aAllTasks = aAllTasks.concat(
				Object.keys(this._mPendingTasks).reduce(function(aResult, _sType) {
					return aResult.concat(this._mPendingTasks[_sType]);
				}.bind(this), [])
			);
		}
		return aAllTasks;
	};

	/**
	 * Returns list of tasks.
	 * @param {string} [sType] - type of tasks to be returned. When <code>undefined</code> all tasks will be returned
	 * @return {array} List copy of pending tasks
	 */
	TaskManager.prototype.getList = function (sType) {
		if (sType) {
			return this._getTypedList(sType, false);
		}
		return this._getAllTasks(false);
	};

	/**
	 * Returns list of open (queued) tasks that are not pending yet and mark them as pending. Another call of this function
	 * would not longer return the tasks from the first call. Although they are not yet completed.
	 * @param {string} [sType] - type of tasks to be returned. When <code>undefined</code> all open (queued) tasks will be returned
	 * @return {array} List copy of open (queued) tasks
	 */
	TaskManager.prototype.getQueuedTasks = function (sType) {
		if (sType) {
			return this._getTypedList(sType, true);
		}
		return this._getAllTasks(true);
	};

	/**
	 * @override
	 */
	TaskManager.prototype.destroy = function () {
		this.setSuppressEvents(true);
		this.getList().forEach(function (oTask) {
			this.cancel(oTask.id);
		}, this);
		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	return TaskManager;
});