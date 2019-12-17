/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/dt/TaskManager",
	"sap/ui/dt/Util",
	"sap/base/Log"
],
function(
	TaskManager,
	DtUtil,
	BaseLog
) {
	"use strict";

	/**
	 * Constructor for a new TaskRunner.
	 *
	 * @param {object} mParam - initial settings for the new object
	 * @param {object} mParam.taskManager - TaskManager to be observed
	 *
	 * TaskRunner run tasks defined in sap.ui.dt.TaskManager.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.69
	 * @alias sap.ui.dt.TaskManager
	 * @experimental Since 1.69. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var TaskRunner = function (mParam) {
		if (!mParam || !mParam.taskManager || !(mParam.taskManager instanceof TaskManager)) {
			throw DtUtil.createError("TaskRunner#constructor", "sap.ui.dt.TaskRunner: TaskManager required");
		}
		this._oTaskManager = mParam.taskManager;
		this._sInitialTaskType = mParam.taskType;
		this._sObservedTaskType = mParam.taskType;
		this._iRequestId = undefined;
		this.bIsStopped = true;
		this._oTaskPromise = Promise.resolve();
	};

	TaskRunner.prototype._shouldObserveBreak = function () {
		if (
			this.bIsStopped
			|| !this._oTaskManager
			|| this._oTaskManager.bIsDestroyed
		) {
			this.bIsStopped = true;
			return true;
		}
		return false;
	};

	TaskRunner.prototype._observe = function (oEvent) {
		this._oTaskPromise = this._oTaskPromise.then(function() {
			if (this._shouldObserveBreak()) {
				return this.stop();
			}
			this._runTasksFromManager(oEvent);
		}.bind(this));
	};

	TaskRunner.prototype._runTasksFromManager = function () {
		var aTasks = this._oTaskManager.getList(this._sObservedTaskType);
		if (aTasks.length) {
			this._runTasks(aTasks);
		}
	};

	TaskRunner.prototype._runTasks = function (aTasks) {
		for (var i = 0, n = aTasks.length; i < n; i++) {
			if (aTasks[i].callbackFn) {
				try {
					aTasks[i].callbackFn();
				} catch (vError) {
					BaseLog.error(DtUtil.errorToString(vError));
				}
			}
			this._oTaskManager.complete(aTasks[i].id);
		}
	};

	TaskRunner.prototype.run = function (sTaskType) {
		this._sObservedTaskType = sTaskType || this._sInitialTaskType;
		this.bIsStopped = false;
		this._oTaskManager.attachAdd(this._observe, this);
		this._observe();
	};

	TaskRunner.prototype.stop = function () {
		this.bIsStopped = true;
		this._oTaskManager.detachAdd(this._observe, this);
	};

	return TaskRunner;
});