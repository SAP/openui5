/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'], function ($, Device) {
	"use strict";

	///////////////////////////////
	/// Privates
	///////////////////////////////
	var queue = [],
		context = {},
		timeout = -1,
		isStopped,
		oDeferred;

	function internalWait (fnCallback, oOptions, oDeferred) {

		// Increase the wait timeout in debug mode, to allow debugging the waitFor without getting timeouts
		if (window["sap-ui-debug"]){
			oOptions.timeout = 300;
		}

		var startTime = new Date();
		fnCheck();

		function fnCheck () {
			try {
				var oResult = fnCallback();
			} catch (err) {
				oDeferred.reject(oOptions);
				throw err;
			}

			if (oResult.result) {
				internalEmpty(oDeferred);
				return;
			}

			var timeDiff = new Date() - startTime;

			// strip the milliseconds
			timeDiff /= 1000;

			var iPassedSeconds = Math.round(timeDiff % 60);

			if (oOptions.timeout > iPassedSeconds) {
				timeout = setTimeout(fnCheck, oOptions.pollingInterval);
				// timeout not yet reached
				return;
			}

			if (oOptions.error) {
				try {
					oOptions.error(oOptions, oResult.arguments);
				} finally {
					oDeferred.reject(oOptions, oResult.arguments);
				}
				return;
			}

			oDeferred.reject(oOptions);
		}

	}

	function internalEmpty (deferred) {
		var iInitialDelay = Device.browser.msie ? 50 : 0;
		if (queue.length === 0) {
			deferred.resolve();
			return true;
		}

		var queueElement = queue.shift();

		// TODO: this only affects IE with the IFrame startup without the frame the timeout can probably be 0 but this need to be evaluated as soon as we have an alternative startup
		// This has to be here for IFrame with IE - if there is no timeout 50, there is a window with all properties undefined.
		// Therefore the core code throws exceptions, when functions like setTimeout are called.
		// I don't have a proper explanation for this.
		timeout = setTimeout(function () {
			internalWait(queueElement.callback, queueElement.options, deferred);
		}, iInitialDelay);
	}

	function ensureNewlyAddedWaitForStatementsPrepended (iPreviousQueueLength, nestedInOptions){
		var iNewWaitForsCount = queue.length - iPreviousQueueLength;
		if (iNewWaitForsCount) {
			var aNewWaitFors = queue.splice(iPreviousQueueLength, iNewWaitForsCount);
			aNewWaitFors.forEach(function(queueElement) {
				queueElement.options._nestedIn = nestedInOptions;
			});
			queue = aNewWaitFors.concat(queue);
		}
	}

	function createStack (iDropCount) {
		iDropCount = (iDropCount || 0) + 2;

		if (Device.browser.mozilla) {
			//firefox needs one less in the string
			iDropCount = iDropCount - 1;
		}

		var oError = new Error(),
			stack = oError.stack;

		if (!stack){
			//In IE an error has to be thrown first to get a stack
			try {
				throw oError();
			} catch (oError2) {
				stack = oError2.stack;
			}
		}

		// IE <= 9 this will not work
		if (!stack) {
			return "";
		}

		stack = stack.split("\n");
		stack.splice(0, iDropCount);
		return stack.join("\n");
	}

	function addStacks (oOptions) {
		var sResult = "\nCallstack:\n";
		if (oOptions._stack) {
			sResult += oOptions._stack;
			delete oOptions._stack;
		} else {
			sResult += "Unknown";
		}
		if (oOptions._nestedIn) {
			sResult += addStacks(oOptions._nestedIn);
			delete oOptions._nestedIn;
		}
		return sResult;
	}
	///////////////////////////////
	/// Public
	///////////////////////////////


	/**
	 * This class will help you write acceptance tests in one page or single page applications.
	 * You can wait for certain conditions to be met.
	 *
	 * @class One Page Acceptance testing.
	 * @public
	 * @alias sap.ui.test.Opa
	 * @author SAP SE
	 * @since 1.22
	 *
	 * @param {object} [extensionObject] An object containing properties and functions. The newly created Opa will be extended by these properties and functions using jQuery.extend.
	 */
	var Opa = function(extensionObject) {
		this.and = this;
		$.extend(this, extensionObject);
	};


	/**
	 * the global configuration of Opa.
	 * All of the global values can be overwritten in an individual waitFor call.
	 * The default values are:
	 * <ul>
	 * 		<li>arrangements: A new Opa instance</li>
	 * 		<li>actions: A new Opa instance</li>
	 * 		<li>assertions: A new Opa instance</li>
	 * 		<li>timeout : 15 seconds, is increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true</li>
	 * 		<li>pollingInterval: 400 milliseconds</li>
	 * </ul>
	 * You can either directly manipulate the config, or extend it using {@link sap.ui.test.Opa#.extendConfig}
	 * @public
	 */
	Opa.config = {};

	/**
	 * Extends and overwrites default values of the Opa.config
	 *
	 * @param {object} options The values to be added to the existing config
	 * @public
	 */
	Opa.extendConfig = function (options) {
		Opa.config = $.extend(Opa.config, options);
	};

	/**
	 * Reset Opa.config to its default values.
	 * All of the global values can be overwritten in an individual waitFor call.
	 *
	 * The default values are:
	 * <ul>
	 * 		<li>arrangements: A new Opa instance</li>
	 * 		<li>actions: A new Opa instance</li>
	 * 		<li>assertions: A new Opa instance</li>
	 * 		<li>timeout : 15 seconds, is increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true</li>
	 * 		<li>pollingInterval: 400 milliseconds</li>
	 * </ul>
	 *
	 * @public
	 * @since 1.25
	 */
	Opa.resetConfig = function () {
		Opa.config = {
			arrangements : new Opa(),
			actions : new Opa(),
			assertions : new Opa(),
			timeout : 15,
			pollingInterval : 400,
			_stackDropCount : 0 //Internal use. Specify numbers of additional stack frames to remove for logging
		};
	};

	/**
	 * Gives access to a singleton object you can save values in.
	 * Same as {@link sap.ui.test.Opa#getContext}
	 * @since 1.29.0
	 * @returns {object} the context object
	 * @public
	 * @function
	 */
	Opa.getContext = function () {
		return context;
	};

	/**
	 * Waits until all waitFor calls are done.
	 *
	 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
	 * @public
	 */
	Opa.emptyQueue = function emptyQueue () {
		oDeferred = $.Deferred();
		isStopped = false;

		internalEmpty(oDeferred);

		return oDeferred.promise().fail(function(oOptions){
			queue = [];

			if (isStopped) {
				oOptions.errorMessage = "Queue was stopped manually";
				oOptions.errorMessage += addStacks({ _stack : createStack(1) });
			} else {
				oOptions.errorMessage = oOptions.errorMessage || "Failed to wait for check";
				oOptions.errorMessage += addStacks(oOptions);
			}
			$.sap.log.error(oOptions.errorMessage, "Opa");
		}).always(function () {
			timeout = -1;
			oDeferred = null;
		});
	};

	/**
	 * Clears the queue and stops running tests so that new tests can be run.
	 * This means all waitFor statements registered by {@link sap.ui.test.Opa#waitFor} will not be invoked anymore and
	 * the promise returned by {@link sap.ui.test.Opa#.emptyQueue} will be rejected.
	 * When its called inside of a check in {@link sap.ui.test.Opa#waitFor}
	 * the success function of this waitFor will not be called.
	 * @public
	 */
	Opa.stopQueue = function stopQueue () {
		// clear queue
		queue = [];

		// clear running tests
		if (!oDeferred) {
			$.sap.log.warning("stopQueue was called before emptyQueue, queued tests have never been executed", "Opa");
		} else {
			if (timeout !== -1) {
				clearTimeout(timeout);
			}

			isStopped = true;

			oDeferred.reject({});
		}
	};

	//create the default config
	Opa.resetConfig();

	Opa.prototype = {

		/**
		 * Gives access to a singleton object you can save values in.
		 * This object will only be created once and it will never be destroyed.
		 * That means you can use it to save values you need in multiple separated tests.
		 *
		 * @returns {object} the context object
		 * @public
		 * @function
		 */
		getContext : Opa.getContext,

		/**
		 * Queues up a waitFor command for Opa.
		 * The Queue will not be emptied until {@link sap.ui.test.Opa#.emptyQueue} is called.
		 * If you are using {@link sap.ui.test.opaQunit}, emptyQueue will be called by the wrapped tests.
		 *
		 * If you are using Opa5, waitFor takes additional parameters.
		 * They can be found here: {@link sap.ui.test.Opa5#waitFor}.
		 * Waits for a check condition to return true, in which case a success function will be called.
		 * If the timeout is reached before the check returns true, an error function will be called.
		 *
		 *
		 * @public
		 * @param {object} options These contain check, success and error functions
		 * @param {int} [oOptions.timeout] default: 15 - (seconds) Specifies how long the waitFor function polls before it fails.
		 * @param {int} [oOptions.pollingInterval] default: 400 - (milliseconds) Specifies how often the waitFor function polls.
		 * @param {function} [oOptions.check] Will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop.
		 * The first parameter passed into the function is the same value that gets passed to the success function.
		 * Returning something other than boolean in the check will not change the first parameter of success.
		 * @param {function} [oOptions.success] Will get invoked after the check function returns true. If there is no check function defined,
		 * it will be directly invoked. waitFor statements added in the success handler will be executed before previously added waitFor statements
		 * @param {string} [oOptions.errorMessage] Will be displayed as an errorMessage depending on your unit test framework.
		 * Currently the only adapter for Opa is QUnit.
		 * This message is displayed there if Opa has reached its timeout but QUnit has not yet reached it.
		 * @returns {jQuery.promise} A promise that gets resolved on success
		 */
		waitFor : function (options) {
			var deferred = $.Deferred();
				options = $.extend({},
				Opa.config,
				options);

			options._stack = createStack(1 + options._stackDropCount);
			delete options._stackDropCount;

			deferred.promise(this);

			queue.push({
				callback : function () {
					var bResult = true;

					//no check - all ok
					if (options.check) {
						try {
							bResult = options.check.apply(this, arguments);
						} catch (err) {
							$.sap.log.error(err.stack, "OPA encountered an error");
							deferred.reject(options);
							throw err;
						}
					}

					if (isStopped) {
						// skip executing success and don't add new things
						return { result: true, arguments: arguments };
					}

					if (bResult) {
						if (options.success) {
							var iCurrentQueueLength = queue.length;
							try {
								options.success.apply(this, arguments);
							} catch (err) {
								$.sap.log.error(err.stack, "OPA encountered an error");
								deferred.reject(options);
								throw err;
							} finally {
								ensureNewlyAddedWaitForStatementsPrepended(iCurrentQueueLength, options);
							}
						}
						deferred.resolve();
						return { result : true, arguments : arguments };
					}
					return {result : false, arguments : arguments };
				}.bind(this),
				options : options
			});
			return this;
		},

		/**
		 * Calls the static extendConfig function in the Opa namespace {@link sap.ui.test.Opa#.extendConfig}
		 * @public
		 * @function
		 */
		extendConfig : Opa.extendConfig,

		/**
		 * Calls the static emptyQueue function in the Opa namespace {@link sap.ui.test.Opa#.emptyQueue}
		 * @public
		 * @function
		 */
		emptyQueue : Opa.emptyQueue
	};


	return Opa;
},  /* export= */ true);
