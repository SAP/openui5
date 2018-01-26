/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/ManagedObject'
],
function(
	ManagedObject
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
						taskId: "int"
					}
				}
			}
		},
		constructor: function () {
			ManagedObject.apply(this, arguments);

			this._aList = [];
		},
		/**
		 * IDs counter
		 * @type {number}
		 * @private
		 */
		_iNextId: 0
	});

	/**
	 * Adds new task into the list
	 * @param mTask
	 * @return {number} - returns task ID
	 */
	TaskManager.prototype.add = function (mTask) {
		if (!jQuery.isPlainObject(mTask) || !mTask.type) {
			throw new Error('Invalid task specified');
		}

		var iTaskId = this._iNextId++;

		this._aList.push(jQuery.extend({}, mTask, {
			id: iTaskId
		}));

		if (!this.getSuppressEvents()) {
			this.fireAdd({
				taskId: iTaskId
			});
		}

		return iTaskId;
	};

	/**
	 * Completes the task by its ID
	 * @param {number} iTaskId - Task ID
	 */
	TaskManager.prototype.complete = function (iTaskId) {
		this._aList = this._aList.filter(function (mTask) {
			return mTask.id !== iTaskId;
		});

		if (!this.getSuppressEvents()) {
			this.fireComplete({
				taskId: iTaskId
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
	 * @return {boolean} - returns true if there is no pending task
	 */
	TaskManager.prototype.isEmpty = function () {
		return this.count() === 0;
	};

	/**
	 * Returns amount of the tasks in the queue
	 */
	TaskManager.prototype.count = function () {
		return this._aList.length;
	};

	/**
	 * Returns list of pending tasks
	 */
	TaskManager.prototype.getList = function () {
		return this._aList.slice(0);
	};
	/**
	 * Returns list of pending tasks
	 */
	TaskManager.prototype.getList = function () {
		return this._aList.slice(0);
	};

	/**
	 * @override
	 */
	TaskManager.prototype.destroy = function () {
		this.setSuppressEvents(true);
		this.getList().forEach(function (oTask) {
			this.cancel(oTask.id);
		}, this);
	};

	return TaskManager;
});
