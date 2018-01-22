/*!
 * ${copyright}
 */

/*global performance */

/**
 * Creates an Analyzer that asynchronously runs tasks added by addTask function. Analysis can be started, stopped, restarted, paused and continued.
 * runs tasks added by addTask function. Analysis can be started, stopped, restarted, paused and continued.
 * The analyzer can be used to update the UI with the current progress of a task while it's running.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/supportRules/IssueManager","sap/ui/support/supportRules/Constants"],
	function (jQuery, IssueManager, Constants) {
		"use strict";

		/**
		 * @classdesc
		 * <h3>Overview</h3>
		 * Analyzer class that runs tasks. A Task runs a function for every entry in its object array.
		 * The Analyzer counts the task objects and calculates the percentages.
		 * <h3>Usage</h3>
		 * With the start, restart, stop and pause methods the analyzer can be controlled.
		 * While running it asynchronously, it selects objects from the list of each task and completes them.
		 * @private
		 * @class sap.ui.support.Analyzer
		 */
		var Analyzer = function () {
			this.dStartedAt = null;
			this.dFinishedAt = null;
			this.iElapsedTime = 0;
			this._iAllowedTimeout = 10000; //ms
			this.reset();
		};

		/**
		 * Resets the analyzer and clears all tasks.
		 *
		 * @private
		 * @returns {void}
		 */
		Analyzer.prototype.reset = function () {
			this._iTotalProgress = 0;
			this._iCompletedRules = 0;
			this._iTotalRules = 0;
			this._bRunning = false;
			this._aRulePromices = [];
		};

		/**
		 * Returns whether the Analyzer is currently running.
		 *
		 * @public
		 * @returns {boolean} Check if the Analyzer is still running
		 */
		Analyzer.prototype.running = function () {
			return this._bRunning;
		};

		/**
		 * Starts the analyzer to run all rules.
		 *
		 * @public
		 * @param {array} aRules Selected rules for execution
		 * @param {object} oCoreFacade Metadata, Models, UI areas and Components of the Core object
		 * @param {object} oExecutionScope selected execution scope from user in UI
		 * @returns {Promise} When all rules are analyzed
		 */
		Analyzer.prototype.start = function (aRules, oCoreFacade, oExecutionScope) {
			var oIssueManagerFacade,
				that = this;

			this.dStartedAt = new Date();
			this._iTotalRules = aRules.length;
			this._bRunning = true;

			aRules.forEach(function (oRule) {
				that._aRulePromices.push(new Promise(function (fnResolve) {
					try {
						oIssueManagerFacade = IssueManager.createIssueManagerFacade(oRule);
						if (oRule.async) {
							that._runAsyncRule(oIssueManagerFacade, oCoreFacade, oExecutionScope, oRule, fnResolve);
						} else {
							oRule.check(oIssueManagerFacade, oCoreFacade, oExecutionScope);
							fnResolve();
							that._updateProgress();
						}

					} catch (eRuleExecException) {
						that._handleException(eRuleExecException, oRule.id, fnResolve);
					}
				}));
			});

			return Promise.all(this._aRulePromices).then(function () {
				that.reset();
				that.dFinishedAt = new Date();
				that.iElapsedTime = that.dFinishedAt.getTime() - that.dStartedAt.getTime(); // In milliseconds
			});
		};

		/**
		 * Handles exceptions in async/sync rule executions.
		 *
		 * @private
		 * @param {(object|string)} eRuleException The exception object
		 * @param {string} sRuleId The ID of the rule
		 * @param {function} fnResolve the resolve function of the promise
		 */
		Analyzer.prototype._handleException = function (eRuleException, sRuleId, fnResolve) {
			var sText = eRuleException.message || eRuleException;
			var sMessage = "[" + Constants.SUPPORT_ASSISTANT_NAME + "] Error while execution rule \"" + sRuleId +
				"\": " + sText;
			jQuery.sap.log.error(sMessage);
			fnResolve();
			this._updateProgress();
		};

		/**
		 * Updates ProgressBar in Main panel of Support Assistant.
		 *
		 * @private
		 */
		Analyzer.prototype._updateProgress = function () {
			this._iCompletedRules++;
			this._iTotalProgress = Math.ceil( this._iCompletedRules / this._iTotalRules * 100 );

			if (this.onNotifyProgress) {
				this.onNotifyProgress(this._iTotalProgress);
			}
		};

		/**
		 * Analyzes async rules.
		 *
		 * @param {object} oIssueManagerFacade instance of the IssueManagerFacade
		 * @param {object} oCoreFacade Metadata, Models, UI areas and Components of the Core object
		 * @param {object} oExecutionScope selected execution scope from user in UI
		 * @param {object} oRule support rule to be analyzed
		 * @param {object} fnResolve inner resolve for async rules
		 * @private
		 */
		Analyzer.prototype._runAsyncRule = function (oIssueManagerFacade, oCoreFacade, oExecutionScope, oRule, fnResolve) {
			var that = this,
				bTimedOut = false;

			var iTimeout = setTimeout(function () {
				bTimedOut = true;
				that._handleException("Check function timed out", oRule.id, fnResolve);
			}, this._iAllowedTimeout);

			new Promise(function (fnRuleResolve) {
				oRule.check(oIssueManagerFacade, oCoreFacade, oExecutionScope, fnRuleResolve);
			}).then(function () {
				if (!bTimedOut) {
					clearTimeout(iTimeout);
					fnResolve();
					that._updateProgress();
				}
			}).catch(function (eRuleExecException) {
				if (!bTimedOut) {
					clearTimeout(iTimeout);
					that._handleException(eRuleExecException, oRule.id, fnResolve);
				}
			});
		};

		/**
		 * Get the elapsed time in the form of a string.
		 *
		 * @public
		 * @returns {string} Returns the total elapsed time since the Analyzer has started
		 */
		Analyzer.prototype.getElapsedTimeString = function () {
			if (!this.iElapsedTime) {
				return "";
			}

			var oDate = new Date(null);
			oDate.setHours(0, 0, 0, 0);
			oDate.setMilliseconds(this.iElapsedTime);
			var aBuffer = [
				(oDate.getHours() < 10 ? "0" : "") + oDate.getHours(),
				(oDate.getMinutes() < 10 ? "0" : "") + oDate.getMinutes(),
				(oDate.getSeconds() < 10 ? "0" : "") + oDate.getSeconds(),
				oDate.getMilliseconds()
			];

			return aBuffer.join(":");
		};

		return Analyzer;
	}, false);
