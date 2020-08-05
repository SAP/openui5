/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global XMLHttpRequest, document, location, window */
sap.ui.define(['sap/base/Log', 'sap/ui/thirdparty/URI', 'sap/base/util/now'
], function(Log, URI, now) {

	"use strict";

	var URI = window.URI;

	/**
	 * Performance Measurement API.
	 *
	 * @namespace
	 * @since 1.58
	 * @name module:sap/ui/performance/Measurement
	 * @public
	 */
	function PerfMeasurement() {

		/**
		 * Single Measurement Entry.
		 *
		 * @public
		 * @typedef {object} module:sap/ui/performance/Measurement.Entry
		 * @property {string} sId ID of the measurement
		 * @property {string} sInfo Info for the measurement
		 * @property {int} iStart Start time
		 * @property {int} iEnd End time
		 * @property {string | string[]} [aCategories="javascript"] An optional list of categories for the measure
		 */
		function Measurement(sId, sInfo, iStart, iEnd, aCategories) {
			this.id = sId;
			this.info = sInfo;
			this.start = iStart;
			this.end = iEnd;
			this.pause = 0;
			this.resume = 0;
			this.duration = 0; // used time
			this.time = 0; // time from start to end
			this.categories = aCategories;
			this.average = false; //average duration enabled
			this.count = 0; //average count
			this.completeDuration = 0; //complete duration
		}

		function matchCategories(aCategories) {
			if (!aRestrictedCategories) {
				return true;
			}
			if (!aCategories) {
				return aRestrictedCategories === null;
			}
			//check whether active categories and current categories match
			for (var i = 0; i < aRestrictedCategories.length; i++) {
				if (aCategories.indexOf(aRestrictedCategories[i]) > -1) {
					return true;
				}
			}
			return false;
		}

		function checkCategories(aCategories) {
			if (!aCategories) {
				aCategories = ["javascript"];
			}
			aCategories = typeof aCategories === "string" ? aCategories.split(",") : aCategories;
			if (!matchCategories(aCategories)) {
				return null;
			}
			return aCategories;
		}

		function hasCategory(oMeasurement, aCategories) {
			for (var i = 0; i < aCategories.length; i++) {
				if (oMeasurement.categories.indexOf(aCategories[i]) > -1) {
					return true;
				}
			}
			return aCategories.length === 0;
		}

		var bActive = false,
			fnXHR = XMLHttpRequest,
			aRestrictedCategories = null,
			aAverageMethods = [],
			aOriginalMethods = [],
			mMethods = {},
			mMeasurements = {};

		/**
		 * Gets the current state of the performance measurement functionality.
		 *
		 * @return {boolean} current state of the performance measurement functionality
		 * @public
		 * @name module:sap/ui/performance/Measurement.getActive
		 * @function
		 */
		this.getActive = function() {
			return bActive;
		};

		/**
		 * Activates or deactivates the performance measure functionality.
		 *
		 * Optionally a category or list of categories can be passed to restrict measurements to certain categories
		 * like "javascript", "require", "xmlhttprequest", "render"
		 * @param {boolean} bOn - state of the performance measurement functionality to set
		 * @param {string | string[]} aCategories - An optional list of categories that should be measured
		 * @return {boolean} current state of the performance measurement functionality
		 * @public
		 * @name module:sap/ui/performance/Measurement.setActive
		 * @function
		 */
		this.setActive = function(bOn, aCategories) {
			var fnEnd,
				fnStart;

			//set restricted categories
			if (!aCategories) {
				aCategories = null;
			} else if (typeof aCategories === "string") {
				aCategories = aCategories.split(",");
			}
			aRestrictedCategories = aCategories;

			if (bActive === bOn) {
				return;
			}
			bActive = bOn;
			if (bActive) {

				//activate method implementations once
				for (var sName in mMethods) {
					this[sName] = mMethods[sName].bind(this);
				}
				mMethods = {};
				fnEnd = this.end;
				fnStart = this.start;

				// wrap and instrument XHR
				/* eslint-disable no-native-reassign, no-undef*/
				XMLHttpRequest = function() {
				/* eslint-enable no-native-reassign, no-undef*/
					var oXHR = new fnXHR(),
						fnOpen = oXHR.open,
						sMeasureId;

					oXHR.open = function() {
						sMeasureId = new URI(arguments[1], new URI(document.baseURI).search("")).href();
						fnStart(sMeasureId, "Request for " + sMeasureId, "xmlhttprequest");
						oXHR.addEventListener("loadend", fnEnd.bind(null, sMeasureId));

						fnOpen.apply(this, arguments);
					};

					return oXHR;
				};
			} else {
				/* eslint-disable no-native-reassign, no-undef*/
				XMLHttpRequest = fnXHR;
				/* eslint-enable no-native-reassign, no-undef*/
			}

			return bActive;
		};

		/**
		 * Starts a performance measure.
		 *
		 * Optionally a category or list of categories can be passed to allow filtering of measurements.
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {string | string[]} [aCategories="javascript"] An optional list of categories for the measure
		 * @return {object} current measurement containing id, info and start-timestamp (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.start
		 * @function
		 */
		mMethods["start"] = function(sId, sInfo, aCategories) {
			if (!bActive) {
				return;
			}

			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return;
			}

			var iTime = now(),
				oMeasurement = new Measurement(sId, sInfo, iTime, 0, aCategories);

			// create timeline entries if available
			/*eslint-disable no-console */
			if (Log.getLevel("sap.ui.Performance") >= 4 && window.console && console.time) {
				console.time(sInfo + " - " + sId);
			}
			/*eslint-enable no-console */
			Log.info("Performance measurement start: " + sId + " on " + iTime);

			if (oMeasurement) {
				mMeasurements[sId] = oMeasurement;
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Pauses a performance measure.
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, pause-timestamp (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.pause
		 * @function
		 */
		mMethods["pause"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = now();
			var oMeasurement = mMeasurements[sId];
			if (oMeasurement && oMeasurement.end > 0) {
				// already ended -> no pause possible
				return false;
			}

			if (oMeasurement && oMeasurement.pause == 0) {
				// not already paused
				oMeasurement.pause = iTime;
				if (oMeasurement.pause >= oMeasurement.resume && oMeasurement.resume > 0) {
					oMeasurement.duration = oMeasurement.duration + oMeasurement.pause - oMeasurement.resume;
					oMeasurement.resume = 0;
				} else if (oMeasurement.pause >= oMeasurement.start) {
					oMeasurement.duration = oMeasurement.pause - oMeasurement.start;
				}
			}

			if (oMeasurement) {
				Log.info("Performance measurement pause: " + sId + " on " + iTime + " duration: " + oMeasurement.duration);
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Resumes a performance measure.
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, resume-timestamp (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.resume
		 * @function
		 */
		mMethods["resume"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = now();
			var oMeasurement = mMeasurements[sId];

			if (oMeasurement && oMeasurement.pause > 0) {
				// already paused
				oMeasurement.pause = 0;
				oMeasurement.resume = iTime;
			}

			if (oMeasurement) {
				Log.info("Performance measurement resume: " + sId + " on " + iTime + " duration: " + oMeasurement.duration);
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Ends a performance measure.
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.end
		 * @function
		 */
		mMethods["end"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = now();

			var oMeasurement = mMeasurements[sId];

			if (oMeasurement && !oMeasurement.end) {
				Log.info("Performance measurement end: " + sId + " on " + iTime);
				oMeasurement.end = iTime;
				if (oMeasurement.end >= oMeasurement.resume && oMeasurement.resume > 0) {
					oMeasurement.duration = oMeasurement.duration + oMeasurement.end - oMeasurement.resume;
					oMeasurement.resume = 0;
				} else if (oMeasurement.pause > 0) {
					// duration already calculated
					oMeasurement.pause = 0;
				} else if (oMeasurement.end >= oMeasurement.start) {
					if (oMeasurement.average) {
						oMeasurement.completeDuration += (oMeasurement.end - oMeasurement.start);
						oMeasurement.count++;
						oMeasurement.duration = oMeasurement.completeDuration / oMeasurement.count;
						oMeasurement.start = iTime;
					} else {
						oMeasurement.duration = oMeasurement.end - oMeasurement.start;
					}
				}
				if (oMeasurement.end >= oMeasurement.start) {
					oMeasurement.time = oMeasurement.end - oMeasurement.start;
				}
			}

			if (oMeasurement) {
				// end timeline entry
				/*eslint-disable no-console */
				if (Log.getLevel("sap.ui.Performance") >= 4 && window.console && console.timeEnd) {
					console.timeEnd(oMeasurement.info + " - " + sId);
				}
				/*eslint-enable no-console */
				return this.getMeasurement(sId);
			} else {
				return false;
			}
		};

		/**
		 * Clears all performance measurements.
		 *
		 * @public
		 * @name module:sap/ui/performance/Measurement.clear
		 * @function
		 */
		mMethods["clear"] = function() {
			mMeasurements = {};
		};

		/**
		 * Removes a performance measure.
		 *
		 * @param {string} sId ID of the measurement
		 * @public
		 * @name module:sap/ui/performance/Measurement.remove
		 * @function
		 */
		mMethods["remove"] = function(sId) {
			delete mMeasurements[sId];
		};
		/**
		 * Adds a performance measurement with all data.
		 *
		 * This is useful to add external measurements (e.g. from a backend) to the common measurement UI
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {int} iStart start timestamp
		 * @param {int} iEnd end timestamp
		 * @param {int} iTime time in milliseconds
		 * @param {int} iDuration effective time in milliseconds
		 * @param {string | string[]} [aCategories="javascript"] An optional list of categories for the measure
		 * @return {object} [] current measurement containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.add
		 * @function
		 */
		mMethods["add"] = function(sId, sInfo, iStart, iEnd, iTime, iDuration, aCategories) {
			if (!bActive) {
				return;
			}
			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return false;
			}
			var oMeasurement = new Measurement( sId, sInfo, iStart, iEnd, aCategories);
			oMeasurement.time = iTime;
			oMeasurement.duration = iDuration;

			if (oMeasurement) {
				mMeasurements[sId] = oMeasurement;
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Starts an average performance measure.
		 *
		 * The duration of this measure is an avarage of durations measured for each call.
		 * Optionally a category or list of categories can be passed to allow filtering of measurements.
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {string | string[]} [aCategories="javascript"] An optional list of categories for the measure
		 * @return {object} current measurement containing id, info and start-timestamp (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.average
		 * @function
		 */
		mMethods["average"] = function(sId, sInfo, aCategories) {
			if (!bActive) {
				return;
			}
			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return;
			}

			var oMeasurement = mMeasurements[sId],
				iTime = now();
			if (!oMeasurement || !oMeasurement.average) {
				this.start(sId, sInfo, aCategories);
				oMeasurement = mMeasurements[sId];
				oMeasurement.average = true;
			} else {
				if (!oMeasurement.end) {
					oMeasurement.completeDuration += (iTime - oMeasurement.start);
					oMeasurement.count++;
				}
				oMeasurement.start = iTime;
				oMeasurement.end = 0;
			}
			return this.getMeasurement(oMeasurement.id);
		};

		/**
		 * Gets a performance measure.
		 *
		 * @param {string} sId ID of the measurement
		 * @return {module:sap/ui/performance/Measurement.Entry} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.getMeasurement
		 * @function
		 */
		this.getMeasurement = function(sId) {

			var oMeasurement = mMeasurements[sId];

			if (oMeasurement) {
				// create a flat copy
				var oCopy = {};
				for (var sProp in oMeasurement) {
					oCopy[sProp] = oMeasurement[sProp];
				}
				return oCopy;
			} else {
				return false;
			}
		};

		/**
		 * Gets all performance measurements.
		 *
		 * @param {boolean} [bCompleted] Whether only completed measurements should be returned, if explicitly set to false only incomplete measurements are returned
		 * @return {module:sap/ui/performance/Measurement.Entry} current array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories
		 * @public
		 * @name module:sap/ui/performance/Measurement.getAllMeasurements
		 * @function
		 */
		this.getAllMeasurements = function(bCompleted) {
			return this.filterMeasurements(function(oMeasurement) {
				return oMeasurement;
			}, bCompleted);
		};

		/**
		 * Gets all performance measurements where a provided filter function returns a truthy value.
		 *
		 * If neither a filter function nor a category is provided an empty array is returned.
		 * To filter for certain properties of measurements a fnFilter can be implemented like this
		 * <code>
		 * function(oMeasurement) {
		 *     return oMeasurement.duration > 50;
		 * }</code>
		 *
		 * @param {function} [fnFilter] a filter function that returns true if the passed measurement should be added to the result
		 * @param {boolean|undefined} [bCompleted] Optional parameter to determine if either completed or incomplete measurements should be returned (both if not set or undefined)
		 * @param {string[]} [aCategories] The function returns only measurements which match these specified categories
		 *
		 * @return {module:sap/ui/performance/Measurement.Entry[]} filtered array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
		 * @public
		 * @name module:sap/ui/performance/Measurement.filterMeasurements
		 * @function
		 */
		this.filterMeasurements = function() {
			var oMeasurement, bValid,
				i = 0,
				aMeasurements = [],
				fnFilter = typeof arguments[i] === "function" ? arguments[i++] : undefined,
				bCompleted = typeof arguments[i] === "boolean" ? arguments[i++] : undefined,
				aCategories = Array.isArray(arguments[i]) ? arguments[i] : [];

			for (var sId in mMeasurements) {
				oMeasurement = this.getMeasurement(sId);
				bValid = (bCompleted === false && oMeasurement.end === 0) || (bCompleted !== false && (!bCompleted || oMeasurement.end));
				if (bValid && hasCategory(oMeasurement, aCategories) && (!fnFilter || fnFilter(oMeasurement))) {
					aMeasurements.push(oMeasurement);
				}
			}

			return aMeasurements;
		};

		/**
		 * Registers an average measurement for a given objects method.
		 *
		 * @param {string} sId the id of the measurement
		 * @param {object} oObject the object of the method
		 * @param {string} sMethod the name of the method
		 * @param {string[]} [aCategories=["javascript"]] An optional categories list for the measurement
		 * @returns {boolean} true if the registration was successful
		 * @public
		 * @name module:sap/ui/performance/Measurement.registerMethod
		 * @function
		 */
		this.registerMethod = function(sId, oObject, sMethod, aCategories) {
			var fnMethod = oObject[sMethod];
			if (fnMethod && typeof fnMethod === "function") {
				var bFound = aAverageMethods.indexOf(fnMethod) > -1;
				if (!bFound) {
					aOriginalMethods.push({func : fnMethod, obj: oObject, method: sMethod, id: sId});
					var that = this;
					oObject[sMethod] = function() {
						that.average(sId, sId + " method average", aCategories);
						var result = fnMethod.apply(this, arguments);
						that.end(sId);
						return result;
					};
					aAverageMethods.push(oObject[sMethod]);
					return true;
				}
			} else {
				Log.debug(sMethod + " in not a function. Measurement.register failed");
			}
			return false;
		};

		/**
		 * Unregisters an average measurement for a given objects method.
		 *
		 * @param {string} sId the id of the measurement
		 * @param {object} oObject the object of the method
		 * @param {string} sMethod the name of the method
		 * @returns {boolean} true if the unregistration was successful
		 * @public
		 * @name module:sap/ui/performance/Measurement.unregisterMethod
		 * @function
		 */
		this.unregisterMethod = function(sId, oObject, sMethod) {
			var fnFunction = oObject[sMethod],
				iIndex = aAverageMethods.indexOf(fnFunction);
			if (fnFunction && iIndex > -1) {
				oObject[sMethod] = aOriginalMethods[iIndex].func;
				aAverageMethods.splice(iIndex, 1);
				aOriginalMethods.splice(iIndex, 1);
				return true;
			}
			return false;
		};

		/**
		 * Unregisters all average measurements.
		 *
		 * @public
		 * @name module:sap/ui/performance/Measurement.unregisterAllMethods
		 * @function
		 */
		this.unregisterAllMethods = function() {
			while (aOriginalMethods.length > 0) {
				var oOrig = aOriginalMethods[0];
				this.unregisterMethod(oOrig.id, oOrig.obj, oOrig.method);
			}
		};

		var aMatch = location.search.match(/sap-ui-measure=([^\&]*)/);
		if (aMatch && aMatch[1]) {
			if (aMatch[1] === "true" || aMatch[1] === "x" || aMatch[1] === "X") {
				this.setActive(true);
			} else {
				this.setActive(true, aMatch[1]);
			}
		} else {
			var fnInactive = function() {
				//measure not active
				return null;
			};
			//deactivate methods implementations
			for (var sName in mMethods) {
				this[sName] = fnInactive;
			}
		}
	}

	return new PerfMeasurement();
});
