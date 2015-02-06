/*!
 * ${copyright}
 */

/////////////////////
//// OPA - One Page Acceptance testing
//// Currently this is distributed with UI5 but it does not have dependencies to it.
//// The only dependency is jQuery. As i plan to get this into a separate repository, i did not use the UI5 naming conventions
/////////////////////
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'], function ($, Device) {
	///////////////////////////////
	/// Privates
	///////////////////////////////
	var queue = [],
		context = {};

	function internalWait (fnCallback, oOptions, oDeferred) {
		
		// Increase the wait timeout in debug mode, to allow debugging the waitFor without getting timeouts
		if (window["sap-ui-debug"]){
			oOptions.timeout = 300; 
		}

		var startTime = new Date(),
			sId = setInterval(function () {

				var oResult = fnCallback();

				if (oResult.result) {
					clearInterval(sId);
					internalEmpty(oDeferred, sId);
				}

				var timeDiff = new Date() - startTime;

				// strip the milliseconds
				timeDiff /= 1000;

				var iPassedSeconds = Math.round(timeDiff % 60);

				if (oOptions.timeout > iPassedSeconds) {
					// timeout not yet reached
					return;
				}

				clearInterval(sId);

				if (oOptions.error) {
					try {
						oOptions.error(oOptions, oResult.arguments);
					} finally {
						oDeferred.reject(oOptions, oResult.arguments);
					}
					return;
				}

				oDeferred.reject(oOptions);
			}, oOptions.pollingInterval);
	}

	function internalEmpty(deferred, sId) {
		if (queue.length === 0) {
			deferred.resolve();
			return true;
		}

		var queueElement = queue.shift();

		internalWait(queueElement.callback, queueElement.options, deferred);
	}

	function ensureNewlyAddedWaitForStatementsPrepended(iPreviousQueueLength, nestedInOptions){
		var iNewWaitForsCount = queue.length - iPreviousQueueLength;
		if (iNewWaitForsCount) {
			var aNewWaitFors = queue.splice(iPreviousQueueLength, iNewWaitForsCount);
			aNewWaitFors.forEach(function(queueElement) {
				queueElement.options._nestedIn = nestedInOptions;
			});
			queue = aNewWaitFors.concat(queue);
		}
	}

	function createStack(iDropCount) {
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
			} catch(oError2){
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
	///////////////////////////////
	/// Public
	///////////////////////////////


	/**
	 * @class One Page Acceptance testing.
	 * This class will help you write acceptance tests in one page or single page applications.
	 * You can wait for certain conditions to be met.
	 * 
	 * @public
	 * @alias sap.ui.test.Opa
	 * @author SAP SE
	 * @since 1.22
	 * 
	 * @param extensionObject An object containing properties and functions. The newly created Opa will be extended by these properties and functions - see jQuery.extend.
	 */
	var Opa = function(extensionObject) {

		this.and = this;
		$.extend(this, extensionObject);

	};

	Opa.prototype = {

		/**
		 * Gives access to a singleton object you can save values in.
		 *
		 * @returns {object} the context object
		 * @public
		 */
		getContext : function () {
			return context;
		},

		/**
		 * Waits for a check condition to return true. Then a success function will be called.
		 * If check does not return true until timeout is reached, an error function will be called.
		 *
		 * @public
		 * @param {object} options containing check, success and error function;
		 * properties:
		 * <ul>
		 * 	<li>timeout: default 15 (seconds) specifies how long the waitFor function polls before it fails</li>
		 * 	<li>pollingInterval: default 400 (milliseconds) specifies how often the waitFor function polls</li>
		 * 	<li>check: function will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop</li>
		 * 	<li>success: function will get invoked after the check function returns true. If there is no check function defined, it will be directly invoked. waitFor statements added in the success handler will be executed before previously added waitFor statements</li>
		 * 	<li>error: function will get invoked, when the timeout is reached and check did never return a true.</li>
		 * </ul>
		 * @returns {jQuery.promise} a promise that gets resolved on success.
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
				callback : jQuery.proxy(function () {
					var bResult = true;
					
					//no check - all ok
					if (options.check) {
						bResult = options.check.apply(this, arguments);
					}

					if (bResult) {
						if (options.success) {
							try {
								var iCurrentQueueLength = queue.length;
								options.success.apply(this, arguments);
							} finally {
								ensureNewlyAddedWaitForStatementsPrepended(iCurrentQueueLength, options);
								deferred.resolve();
							}
						} else {
							deferred.resolve();
						}

						return { result : true, arguments : arguments };
					}
	
					return {result : false, arguments : arguments };
				}, this),
				options : options
			});

			return this;
		},
		
		/**
		 * Calls the static extendConfig function in the Opa namespace
		 * @returns
		 * @public
		 */
		extendConfig : function() {
			return Opa.extendConfig.apply(this, arguments);
		},

		/**
		 * Calls the static emptyQueue function in the Opa namespace
		 * @returns
		 * @public
		 */
		emptyQueue : function() {
			return Opa.emptyQueue.apply(this, arguments);
		}
	};

	/**
	 * Extends and overwrites default values of the Opa.config
	 *
	 * @param {object} options the values to be added to the existion config
	 * @public
	 */
	Opa.extendConfig = function (options) {
		Opa.config = jQuery.extend(Opa.config, options);
	};

	/**
	 * Reset Opa.config to its default values
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
	 * Waits until all waitFor calls are done
	 *
	 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
	 * @public
	 */
	Opa.emptyQueue = function emptyQueue () {
		function addStacks(oOptions) {
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
		
		var deferred = $.Deferred();

		internalEmpty(deferred);
		
		return deferred.promise().fail(function(oOptions){
			oOptions.errorMessage = oOptions.errorMessage || "Failed to wait for check";
			oOptions.errorMessage += addStacks(oOptions);
			jQuery.sap.log.error(oOptions.errorMessage);
		});
	};

	/**
	 * the global configuration of Opa.
	 * All of the global values can be overwritten in an individual waitFor call.
	 * defaults are :
	 * <ul>
	 * 		<li>timeout : 15 seconds, is increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true</li>
	 * 		<li>pollingIntervall: 400 milliseconds</li>
	 * </ul>
	 * @public
	 */
	//create the default config
	Opa.resetConfig();

	return Opa;
},  /* export= */ true);
