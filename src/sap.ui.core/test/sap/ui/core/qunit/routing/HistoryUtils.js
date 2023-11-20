/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/routing/History",
	"sap/base/Log"
], function (Device, History, Log) {
	"use strict";

	var mPushStateRateLimit = {};

	/*
	 Safari:
	 - restriction that the pushState/replaceState API can't be used more than 100 times in 30 seconds
	*/
	mPushStateRateLimit[Device.browser.BROWSER.SAFARI] = {
		timeout: 30000,
		limit: 100
	};

	/*
	 Firefox:
	 - restriction that the pushState/replaceState API can't be used more than 80 times in 10 seconds
	 - decrease the limit to be safe
	*/
	mPushStateRateLimit[Device.browser.BROWSER.FIREFOX] = {
		timeout: 10000,
		limit: 80
	};

	/*
	 Chrome:
	 - restriction that the pushState/replaceState API can't be used more than 140 times in 10 seconds
	 - decrease the limit to be safe
	*/
	mPushStateRateLimit[Device.browser.BROWSER.CHROME] = {
		timeout: 10000,
		limit: 140
	};

	/**
	 * The counter
	 *
	 * @private
	 * @class
	 * @param {int} iValue The counter value
	 * @param {int} iTimestamp The timestamp
	 */
	var Counter = function (iValue, iTimestamp) {
		return {
			value: parseInt(iValue) || 0,
			timestamp: parseInt(iTimestamp) || Date.now()
		};
	};

	/**
	 * Determines the counter object out of the session storage
	 *
	 * @returns {object} The counter
	 */
	var fnGetCounter = function () {
		try {
			return new Counter(
				sessionStorage.getItem('iReplaceStateCounter'),
				sessionStorage.getItem('iReplaceStateCounterTimestamp')
			);
		} catch (e) {
			return new Counter();
		}
	};

	/**
	 * Sets the counter to the given <code>iReplaceStateCounter</code> value in the session storage
	 *
	 * @param {int} iReplaceStateCounter The counter value
	 */
	var fnSetCounter = function (iReplaceStateCounter) {
		try {
			sessionStorage.setItem('iReplaceStateCounter', iReplaceStateCounter);
			sessionStorage.setItem('iReplaceStateCounterTimestamp', Date.now());
		} catch (e) {
			Log.info("SessionStorage not supported.");
		}
	};

	var fnOriginalReplaceState = window.history.replaceState;
	var fnOriginalPushState = window.history.pushState;

	/**
	 * @class A module providing a delay mechanism when the browser pushState/replaceState rate limit is reached,
	 * so the number of calls does not go ahead the rate limit
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @namespace sap.ui.core.qunit.routing.HistoryUtils
	 * @since 1.88
	 */
	var HistoryUtils = {};

	/**
	 * Overrides the history APIs <code>replaceState</code> and <code>pushState</code>
	 * with wrapper functions to count the executions on them
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	HistoryUtils.init = function () {
		if (HistoryUtils._isOriginalReplaceStateFunctionActive() && History._bUsePushState) {
			// Override history replaceState API
			window.history.replaceState = function () {
				fnSetCounter(fnGetCounter().value + 1);
				return fnOriginalReplaceState.apply(window.history, arguments);
			};

			// Override history pushState API
			window.history.pushState = function () {
				fnSetCounter(fnGetCounter().value + 1);
				return fnOriginalPushState.apply(window.history, arguments);
			};
		}
	};

	/**
	 * Performs a check to ensure that the history API related rate limits are met before the test(s) is(are) executed
	 *
	 * If no parameter is the given the test scope is passed to function
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @param {object | int} vTolerance The tolerance
	 * @returns {Promise} the waiting promise
	 */
	HistoryUtils.check = function (vTolerance) {
		if (!History._bUsePushState) {
			return Promise.resolve();
		}
		var iTolerance = parseInt(vTolerance) || 50;
		return HistoryUtils._waitForHistoryAPIReset(iTolerance);
	};

	/**
	 * Resets the original window pushState/replaceState API
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	HistoryUtils.exit = function () {
		if (History._bUsePushState) {
			HistoryUtils._resetCounterAfterTimeOut().then(function () {
				if (!HistoryUtils._isOriginalReplaceStateFunctionActive() && History._bUsePushState) {
					window.history.replaceState = fnOriginalReplaceState;
					window.history.pushState = fnOriginalPushState;
				}
			});
		}
	};

	/**
	 * Determines if and how long the test should wait before proceed
	 *
	 * @private
	 * @param {int} iTolerance The tolerance
	 * @returns {Promise} the waiting promise
	 */
	HistoryUtils._waitForHistoryAPIReset = function (iTolerance) {
		var iPushStateRateLimit = mPushStateRateLimit[Device.browser.name].limit;
		var iTimeOut = mPushStateRateLimit[Device.browser.name].timeout;

		return new Promise(function (resolve) {
			if (fnGetCounter().value < (iPushStateRateLimit - iTolerance)) {
				resolve();
			} else {
				setTimeout(function () {
					fnSetCounter(0);
					resolve();
				}, iTimeOut);
			}
		});
	};

	/**
	 * Resets the counter when no further calls reached the pushState/replaceState API after the browser specific timout is reached
	 *
	 * @private
	 * @returns {Promise} The promise which is resolved when the timout is reached
	 */
	HistoryUtils._resetCounterAfterTimeOut = function () {
		var iTimeOut = mPushStateRateLimit[Device.browser.name].timeout;
		return new Promise(function (resolve) {
			setTimeout(function () {
				if (fnGetCounter().timestamp + iTimeOut <= Date.now() && fnGetCounter().value > 0) {
					fnSetCounter(0);
					resolve();
				}
				resolve();
			}, /* Add some more tolerance, so the timeout takes a bit longer as defined */ iTimeOut + 300);
		});
	};

	/**
	 * Determines if the original replaceState function implementation is available on window.history.replaceState
	 *
	 * @private
	 * @returns {boolean} if yes <code>true</code>, if not <code>false</code>
	 */
	HistoryUtils._isOriginalReplaceStateFunctionActive = function () {
		return window.history.replaceState === fnOriginalReplaceState;
	};

	return HistoryUtils;
});