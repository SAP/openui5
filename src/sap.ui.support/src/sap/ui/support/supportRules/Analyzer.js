/*!
 * ${copyright}
 */

/*global performance */

/**
 * Creates an Analyser that async runs tasks added by addTask function. Analysis can be started, stopped, restarted, paused and continued.
 * THe analyser can be used to update the UI while a task is running with the current progress
 */
sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"],
	function (jQuery, BaseObject) {
		"use strict";

		/**
		 * Analyzer class that runs tasks. A Task runs a function for every entry in its object array.
		 * The Analyzer counts the task objects and calculates the percentages.
		 * With the start, restart, stop and pause methods the analyzer can be controlled.
		 * While started it walks async through the list of object for each task and completes them.
		 *
		 *
		 * @private
		 */
		var Analyzer = function () {
			this.reset();
		};

		/**
		 * Returns the total progress for all tasks with all their objects.
		 * @returns {int} total progress for all tasks with all their objects.
		 *
		 * @private
		 * @experimental
		 */
		Analyzer.prototype.getProgress = function () {
			return this._iTotalProgress;
		};

		/**
		 * Adds a task to with a name to the analyzer.
		 * The fnTaskProcessor function is called if the task is run for every object in aObjects.
		 *
		 * @param {string} sTaskName
		 * @param {function} fnTaskProcessor
		 * @param aObjects
		 */
		Analyzer.prototype.addTask = function (sTaskName, fnTaskProcessor, aObjects) {
			var oTask = {
				name: sTaskName,
				handler: fnTaskProcessor,
				objects: jQuery.extend(true, {arr: aObjects},{}).arr,
				progress: 0
			};
			this._aTasks.push(oTask);
			this._iTotalSteps = this._iTotalSteps + oTask.objects.length;
		};

		/**
		 * Resets the analyzer and clears all tasks
		 * @private
		 */
		Analyzer.prototype.reset = function () {
			this._iTotalProgress = 0;
			this._iTotalCompletedSteps = 0;
			this._iTotalSteps = 0;
			this._aTasks = [];
			this._oCurrent = {};
			this._bRunning = false;
			this._iStartTS = 0;
			this.startedAt = null;
			this.finishedAt = null;
			this.elapsedTime = null;
		};

		/**
		 * Returns whether the Analyzer is currently running
		 * @returns
		 */
		Analyzer.prototype.running = function () {
			return this._bRunning;
		};

		/**
		 * Starts the analyzer to run all tasks
		 * @private
		 */
		Analyzer.prototype.start = function (resolveFn) {
			var that = this;
			// resolve() is called when the analyzer finishes all tasks.
			// It is called inside _done function.
			that.resolve = resolveFn;
			that.startedAt = new Date();
			var progressPromise = new Promise(
				function (resolve, reject) {
					that._iStartTS = performance.now();
					that._start(undefined, resolve);
				}
			);

			return progressPromise;
		};

		/**
		 * Internal method to start the next run on the next object.
		 * @param {boolean} bContinue true if called via timer
		 * @param {function} fnResolve resolve function
		 *
		 * @private
		 * @experimental
		 */
		Analyzer.prototype._start = function (bContinue, fnResolve) {
			if (this._bRunning && !bContinue) {
				return;
			}

			if (this._oCurrent.task) {
				if (bContinue) {
					this._next(fnResolve);
				}

				return;
			}

			for (var i = 0; i < this._aTasks.length; i++) {
				if (this._aTasks[i].progress < 100) {
					this._oCurrent = {
						task: this._aTasks[i],
						index: -1
					};

					this._bRunning = true;
					jQuery.sap.delayedCall(1, this, "_next", [fnResolve]);
					break;
				} else {
					this._bRunning = false;
				}
			}
		};

		/**
		 * Processes the next object in the current task
		 *
		 * @param {function} fnResolve resolves promise to notify of finished state
		 */
		Analyzer.prototype._next = function (fnResolve) {
			if (!this._bRunning) {
				return;
			}

			var oCurrent = this._oCurrent;

			if (oCurrent.task) {

				oCurrent.index++;
				if (oCurrent.task.objects[oCurrent.index]) {
					this._iTotalCompletedSteps++;
					this._iTotalProgress = Math.min(Math.ceil((this._iTotalCompletedSteps / this._iTotalSteps) * 100), 100);
					oCurrent.task.handler(oCurrent.task.objects[oCurrent.index]);
					oCurrent.task.progress = Math.min(Math.ceil((oCurrent.index / oCurrent.task.objects.length) * 100), 100);
				} else {
					//finished
					oCurrent.task.progress = 100;
					this._iTotalCompletedSteps = this._iTotalCompletedSteps + (oCurrent.task.objects.length - oCurrent.index);
					this._iTotalProgress = Math.min(Math.ceil((this._iTotalCompletedSteps / this._iTotalSteps) * 100), 100);
					this._oCurrent = {};
					this.finishedAt = new Date();
					this.elapsedTime = this.finishedAt.getTime() - this.startedAt.getTime(); // In milliseconds
					// _bRunning needs to be set to false in order to have
					// results ready for reading in promise of fnResolve
					this._bRunning = false;
					fnResolve();
				}
				if (performance.now() - this._iStartTS  > 100) {
					jQuery.sap.delayedCall(5, this, "_start", [true, fnResolve]);
					this._iStartTS = performance.now();
				} else {
					jQuery.sap.delayedCall(0, this, "_start", [true, fnResolve]);
				}
			}
		};

		Analyzer.prototype.getElapsedTimeString = function () {
			if (!this.elapsedTime) {
				return;
			}

			var oDate = new Date(null);
			oDate.setHours(0, 0, 0, 0);
			oDate.setMilliseconds(this.elapsedTime);
			var oBuffer = [
				(oDate.getHours() < 10 ? "0" : "") + oDate.getHours(),
				(oDate.getMinutes() < 10 ? "0" : "") + oDate.getMinutes(),
				(oDate.getSeconds() < 10 ? "0" : "") + oDate.getSeconds(),
				oDate.getMilliseconds()
			];

			return oBuffer.join(":");
		};

		return Analyzer;
	}, false);
