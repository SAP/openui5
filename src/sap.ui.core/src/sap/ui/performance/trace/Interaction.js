/*!
 * ${copyright}
 */

/*global HTMLScriptElement */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/ui/performance/Measurement",
	"sap/ui/performance/XHRInterceptor",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/now",
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/ui/thirdparty/URI"
], function(Measurement, XHRInterceptor, LoaderExtensions, now, uid, Log, URI) {

	"use strict";


	var HOST = window.location.host, // static per session
		INTERACTION = "INTERACTION",
		aInteractions = [],
		oPendingInteraction = createMeasurement();

	function isCORSRequest(sUrl) {
		var sHost = new URI(sUrl).host();
		// url is relative or with same host
		return sHost && sHost !== HOST;
	}

	function hexToAscii(sValue) {
		var hex = sValue.toString();
		var str = '';
		for (var n = 0; n < hex.length; n += 2) {
			str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
		}
		return str.trim();
	}

	function createMeasurement(iTime) {
		return {
			event: "startup", // event which triggered interaction - default is startup interaction
			trigger: "undetermined", // control which triggered interaction
			component: "undetermined", // component or app identifier
			appVersion: "undetermined", // application version as from app descriptor
			start: iTime || window.performance.timing.fetchStart, // interaction start - page fetchstart if initial
			end: 0, // interaction end
			navigation: 0, // sum over all navigation times
			roundtrip: 0, // time from first request sent to last received response end - without gaps and ignored overlap
			processing: 0, // client processing time
			duration: 0, // interaction duration
			requests: [], // Performance API requests during interaction
			measurements: [], // Measurements
			sapStatistics: [], // SAP Statistics for OData
			requestTime: 0, // summ over all requests in the interaction (oPendingInteraction.requests[0].responseEnd-oPendingInteraction.requests[0].requestStart)
			networkTime: 0, // request time minus server time from the header
			bytesSent: 0, // sum over all requests bytes
			bytesReceived: 0, // sum over all response bytes
			requestCompression: undefined, // true if all responses have been sent gzipped
			busyDuration: 0, // summed GlobalBusyIndicator duration during this interaction
			id: uid(), //Interaction id
			passportAction: "undetermined_startup_0" //default PassportAction for startup
		};
	}

	function isCompleteMeasurement(oMeasurement) {
		if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
			return oMeasurement;
		}
	}

	/**
	 * Check if request is initiated by XHR
	 *
	 * @param {object} oRequestTiming
	 * @private
	 */
	function isXHR(oRequestTiming) {
		// if the request has been completed it has complete timing figures)
		var bComplete = oRequestTiming.startTime > 0 &&
			oRequestTiming.startTime <= oRequestTiming.requestStart &&
			oRequestTiming.requestStart <= oRequestTiming.responseEnd;

		return bComplete && oRequestTiming.initiatorType === "xmlhttprequest";
	}

	function aggregateRequestTiming(oRequest) {
		// aggregate navigation and roundtrip with respect to requests overlapping and times w/o requests (gaps)
		this.end = oRequest.responseEnd > this.end ? oRequest.responseEnd : this.end;
		// sum up request time as a grand total over all requests
		oPendingInteraction.requestTime += (oRequest.responseEnd - oRequest.startTime);

		// if there is a gap between requests we add the times to the aggrgate and shift the lower limits
		if (this.roundtripHigherLimit <= oRequest.startTime) {
			oPendingInteraction.navigation += (this.navigationHigherLimit - this.navigationLowerLimit);
			oPendingInteraction.roundtrip += (this.roundtripHigherLimit - this.roundtripLowerLimit);
			this.navigationLowerLimit = oRequest.startTime;
			this.roundtripLowerLimit = oRequest.startTime;
		}

		// shift the limits if this request was completed later than the earlier requests
		if (oRequest.responseEnd > this.roundtripHigherLimit) {
			this.roundtripHigherLimit = oRequest.responseEnd;
		}
		if (oRequest.requestStart > this.navigationHigherLimit) {
			this.navigationHigherLimit = oRequest.requestStart;
		}
	}

	function aggregateRequestTimings(aRequests) {
		var oTimings = {
			start: aRequests[0].startTime,
			end: aRequests[0].responseEnd,
			navigationLowerLimit: aRequests[0].startTime,
			navigationHigherLimit: aRequests[0].requestStart,
			roundtripLowerLimit: aRequests[0].startTime,
			roundtripHigherLimit: aRequests[0].responseEnd
		};

		// aggregate all timings by operating on the oTimings object
		aRequests.forEach(aggregateRequestTiming, oTimings);
		oPendingInteraction.navigation += (oTimings.navigationHigherLimit - oTimings.navigationLowerLimit);
		oPendingInteraction.roundtrip += (oTimings.roundtripHigherLimit - oTimings.roundtripLowerLimit);

		// calculate average network time per request
		if (oPendingInteraction.networkTime) {
			var iTotalNetworkTime = oPendingInteraction.requestTime - oPendingInteraction.networkTime;
			oPendingInteraction.networkTime = iTotalNetworkTime / aRequests.length;
		} else {
			oPendingInteraction.networkTime = 0;
		}

		// in case processing is not determined, which means no re-rendering occured, take start to end
		if (oPendingInteraction.processing === 0) {
			var iRelativeStart = oPendingInteraction.start - window.performance.timing.fetchStart;
			oPendingInteraction.duration = oTimings.end - iRelativeStart;
			// calculate processing time of before requests start
			oPendingInteraction.processing = oTimings.start - iRelativeStart;
		}

	}

	function finalizeInteraction(iTime) {
		if (oPendingInteraction) {
			var aAllRequestTimings = window.performance.getEntriesByType("resource");
			oPendingInteraction.end = iTime;
			oPendingInteraction.duration = oPendingInteraction.processing;
			oPendingInteraction.requests = aAllRequestTimings.filter(isXHR);
			oPendingInteraction.completeRoundtrips = 0;
			oPendingInteraction.measurements = Measurement.filterMeasurements(isCompleteMeasurement, true);
			if (oPendingInteraction.requests.length > 0) {
				aggregateRequestTimings(oPendingInteraction.requests);
			}
			oPendingInteraction.completeRoundtrips = oPendingInteraction.requests.length;

			// calculate real processing time if any processing took place
			// cannot be negative as then requests took longer than processing
			var iProcessing = oPendingInteraction.processing - oPendingInteraction.navigation - oPendingInteraction.roundtrip;
			oPendingInteraction.processing = iProcessing > -1 ? iProcessing : 0;

			oPendingInteraction.completed = true;
			Object.freeze(oPendingInteraction);
			aInteractions.push(oPendingInteraction);
			var oFinshedInteraction = aInteractions[aInteractions.length - 1];
			if (Interaction.onInteractionFinished && oFinshedInteraction) {
				Interaction.onInteractionFinished(oFinshedInteraction);
			}
			Log.info("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "Interaction.js");
			oPendingInteraction = null;
		}
	}

	// component determination - heuristic
	function createOwnerComponentInfo(oSrcElement) {
		var sId, sVersion;
		if (oSrcElement) {
			var Component, oComponent;
			Component = sap.ui.require("sap/ui/core/Component");
			while (Component && oSrcElement && oSrcElement.getParent) {
				oComponent = Component.getOwnerComponentFor(oSrcElement);
				if (oComponent || oSrcElement instanceof Component) {
					oComponent = oComponent || oSrcElement;
					var oApp = oComponent.getManifestEntry("sap.app");
					// get app id or module name for FESR
					sId = oApp && oApp.id || oComponent.getMetadata().getName();
					sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
				}
				oSrcElement = oSrcElement.getParent();
			}
		}
		return {
			id: sId ? sId : "undetermined",
			version: sVersion ? sVersion : ""
		};
	}

	var bInteractionActive = false,
		bInteractionProcessed = false,
		oCurrentBrowserEvent,
		iInteractionStepTimer,
		bIdle = false,
		bSuspended = false,
		iInteractionCounter = 0,
		iScrollEventDelayId = 0,
		descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");

	/* As UI5 resources gets also loaded via script tags we need to
	 * intercept this kind of loading as well. We assume that changing the
	 * 'src' property indicates a resource loading via a script tag. In some cases
	 * the src property will be updated multiple times, so we should intercept
	 * the same script tag only once (dataset.sapUiCoreInteractionHandled)
	 */
	function interceptScripts() {
		Object.defineProperty(HTMLScriptElement.prototype, "src", {
			set: function(val) {
				var fnDone;

				if (!this.dataset.sapUiCoreInteractionHandled) {
					fnDone = Interaction.notifyAsyncStep();
					this.addEventListener("load", function() {
						fnDone();
					});
					this.addEventListener("error" , function() {
						fnDone();
					});
					this.dataset.sapUiCoreInteractionHandled = "true";
				}
				descScriptSrc.set.call(this, val);
			},
			get: descScriptSrc.get
		});
	}

	function registerXHROverrides() {
		// store the byte size of the body
		XHRInterceptor.register(INTERACTION, "send" ,function() {
			if (this.pendingInteraction) {
				// double string length for byte length as in js characters are stored as 16 bit ints
				this.pendingInteraction.bytesSent += arguments[0] ? arguments[0].length : 0;
			}
		});

		// store request header size
		XHRInterceptor.register(INTERACTION, "setRequestHeader", function(sHeader, sValue) {
			// count request header length consistent to what getAllResponseHeaders().length would return
			if (!this.requestHeaderLength) {
				this.requestHeaderLength = 0;
			}
			// assume request header byte size
			this.requestHeaderLength += (sHeader + "").length + (sValue + "").length;

		});

		// register the response handler for data collection
		XHRInterceptor.register(INTERACTION, "open", function () {
			var sEpp,
				sAction,
				sRootContextID;

			function handleInteraction(fnDone) {
				if (this.readyState === 4) {
					fnDone();
				}
			}
			// we only need to take care of requests when we have a running interaction
			if (oPendingInteraction) {
				// only use Interaction for non CORS requests
				if (!isCORSRequest(arguments[1])) {
					//only track if FESR.clientID == EPP.Action && FESR.rootContextID == EPP.rootContextID
					sEpp = Interaction.passportHeader.get(this);
					if (sEpp && sEpp.length >= 370) {
						sAction = hexToAscii(sEpp.substring(150, 230));
						if (parseInt(sEpp.substring(8, 10), 16) > 2) { // version number > 2 --> extended passport
							sRootContextID = sEpp.substring(372, 404);
						}
					}
					if (!sEpp || sAction && sRootContextID && oPendingInteraction.passportAction.endsWith(sAction)) {
						this.addEventListener("readystatechange", handleResponse.bind(this,  oPendingInteraction.id));
					}
				}
				this.addEventListener("readystatechange", handleInteraction.bind(this, Interaction.notifyAsyncStep()));
				// assign the current interaction to the xhr for later response header retrieval.
				this.pendingInteraction = oPendingInteraction;
			}
		});

	}

	// response handler which uses the custom properties we added to the xhr to retrieve information from the response headers
	function handleResponse(sId) {
		if (this.readyState === 4) {
			if (this.pendingInteraction && !this.pendingInteraction.completed && oPendingInteraction.id === sId) {
				// enrich interaction with information
				var sContentLength = this.getResponseHeader("content-length"),
					bCompressed = this.getResponseHeader("content-encoding") === "gzip",
					sFesrec = this.getResponseHeader("sap-perf-fesrec");
				this.pendingInteraction.bytesReceived += sContentLength ? parseInt(sContentLength) : 0;
				this.pendingInteraction.bytesReceived += this.getAllResponseHeaders().length;
				this.pendingInteraction.bytesSent += this.requestHeaderLength || 0;
				// this should be true only if all responses are compressed
				this.pendingInteraction.requestCompression = bCompressed && (this.pendingInteraction.requestCompression !== false);
				// sap-perf-fesrec header contains milliseconds
				this.pendingInteraction.networkTime += sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
				var sSapStatistics = this.getResponseHeader("sap-statistics");
				if (sSapStatistics) {
					var aTimings = window.performance.getEntriesByType("resource");
					this.pendingInteraction.sapStatistics.push({
						// add response url for mapping purposes
						url: this.responseURL,
						statistics: sSapStatistics,
						timing: aTimings ? aTimings[aTimings.length - 1] : undefined
					});
				}
				delete this.requestHeaderLength;
				delete this.pendingInteraction;
			}
		}
	}


	/**
	 * Provides base functionality for interaction detection heuristics & API.

	 * Interaction detection works through the detection of relevant events and tracking of rendering activities.<br>
	 * An example:<br>
	 * The user clicks on a button<br>
	 * <ul>
	 *  <li>"click" event gets detected via notification (<code>var notifyEventStart</code>)</li>
	 *  <li>a click handler is registered on the button, so this is an interaction start (<code>var notifyStepStart</code>)</li>
	 *  <li>some requests are made and rendering has finished (<code>var notifyStepEnd</code>)</li>
	 * </ul>
	 * All measurement takes place in {@link module:sap/ui/performance/Measurement}.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/performance/trace/Interaction
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var Interaction = {

		/**
	 	 * Gets all interaction measurements.
		 *
		 * @param {boolean} bFinalize finalize the current pending interaction so that it is contained in the returned array
		 * @return {object[]} all interaction measurements
		 * @static
		 * @private
		 */
		getAll : function(bFinalize) {
			if (bFinalize) {
				// force the finalization of the currently pending interaction
				Interaction.end(true);
			}
			return aInteractions;
		},

		/**
		 * Gets all interaction measurements for which a provided filter function returns a truthy value.
		 *
		 * To filter for certain categories of measurements a fnFilter can be implemented like this
		 * <code>
		 * function(InteractionMeasurement) {
		 *     return InteractionMeasurement.duration > 0
		 * }</code>
		 * @param {function} fnFilter a filter function that returns true if the passed measurement should be added to the result
		 * @return {object[]} all interaction measurements passing the filter function successfully
		 * @static
		 * @private
		 */
		filter : function(fnFilter) {
			var aFilteredInteractions = [];
			if (fnFilter) {
				for (var i = 0, l = aInteractions.length; i < l; i++) {
					if (fnFilter(aInteractions[i])) {
						aFilteredInteractions.push(aInteractions[i]);
					}
				}
			}
			return aFilteredInteractions;
		},
		/**
		 * Gets the incomplete pending interaction.
		 *
		 * @return {object} interaction measurement
		 * @static
		 * @private
		 */
		getPending : function() {
			return oPendingInteraction;
		},

		/**
		 * Clears all interaction measurements.
		 *
		 * @private
		 */
		clear : function() {
			aInteractions = [];
		},

		/**
		 * Start an interaction measurements.
		 *
		 * @param {string} sType type of the event which triggered the interaction
		 * @param {object} oSrcElement the control on which the interaction was triggered
		 * @static
		 * @private
		 */
		start : function(sType, oSrcElement) {
			var iTime = now();

			if (oPendingInteraction) {
				finalizeInteraction(iTime);
			}

			//reset async counter/timer
			if (iInteractionStepTimer) {
				clearTimeout(iInteractionStepTimer);
			}
			iInteractionCounter = 0;

			// clear request timings for new interaction
			if (window.performance.clearResourceTimings) {
				window.performance.clearResourceTimings();
			}

			var oComponentInfo = createOwnerComponentInfo(oSrcElement);

			// setup new pending interaction
			oPendingInteraction = createMeasurement(iTime);
			oPendingInteraction.event = sType;
			oPendingInteraction.component = oComponentInfo.id;
			oPendingInteraction.appVersion = oComponentInfo.version;
			oPendingInteraction.start = iTime;
			if (oSrcElement && oSrcElement.getId) {
				oPendingInteraction.trigger = oSrcElement.getId();
			}
			/*eslint-disable no-console */
			if (Log.isLoggable(null, "sap.ui.Performance")) {
				console.time("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
			}
			/*eslint-enable no-console */
			Log.info("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "Interaction.js");
		},

		/**
		 * End an interaction measurements.
		 *
		 * @param {boolean} bForce forces end of interaction now and ignores further re-renderings
		 * @static
		 * @private
		 */
		end : function(bForce) {
			if (oPendingInteraction) {
				if (bForce) {
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance")) {
						console.timeEnd("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
					}
					/*eslint-enable no-console */
					finalizeInteraction(oPendingInteraction.preliminaryEnd || now());
					Log.info("Interaction ended...");
				} else {
					// set provisionary processing time from start to end and calculate later
					oPendingInteraction.preliminaryEnd = now();
					oPendingInteraction.processing = oPendingInteraction.preliminaryEnd - oPendingInteraction.start;
				}
			}
		},

		/**
		 * Returns true if the interaction detection was enabled explicitly, or implicitly along with fesr.
		 *
		 * @return {boolean} bActive State of the interaction detection
		 * @static
		 * @private
		 */
		getActive : function() {
			return bInteractionActive;
		},

		/**
		 * Enables the interaction tracking.
		 *
		 * @param {boolean} bActive State of the interaction detection
		 * @static
		 * @private
		 */
		setActive : function(bActive) {
			if (bActive && !bInteractionActive) {
				registerXHROverrides();
				interceptScripts();
				//intercept resource loading from preloads
				LoaderExtensions.notifyResourceLoading = Interaction.notifyAsyncStep;
			}
			bInteractionActive = bActive;
		},

		/**
		 * Start tracking busy time for a Control
		 * @param {sap.ui.core.Control} oControl
		 * @private
		 */
		notifyShowBusyIndicator : function(oControl) {
			oControl._sapui_fesr_fDelayedStartTime = now() + oControl.getBusyIndicatorDelay();
		},

		/**
		 * End tracking busy time for a Control
		 * @param {sap.ui.core.Control} oControl
		 * @private
		 */
		notifyHideBusyIndicator : function(oControl) {
			if (oControl._sapui_fesr_fDelayedStartTime) {
				// The busy indicator shown duration d is calculated with:
				// d = "time busy indicator was hidden" - "time busy indicator was requested" - "busy indicator delay"
				var fBusyIndicatorShownDuration = now() - oControl._sapui_fesr_fDelayedStartTime;
				Interaction.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
				delete oControl._sapui_fesr_fDelayedStartTime;
			}
		},

		/**
		 * This method starts the actual interaction measurement when all criteria are met. As it is the starting point
		 * for the new interaction, the creation of the FESR headers for the last interaction is triggered here, so that
		 * the headers can be sent with the first request of the current interaction.<br>
		 *
		 * @param {sap.ui.core.Element} oElement Element on which the interaction has been triggered
		 * @param {boolean} bForce Forces the interaction to start independently from a currently active browser event
		 * @static
		 * @private
		 */
		notifyStepStart : function(oElement, bForce) {
			if (bInteractionActive) {
				if ((!oPendingInteraction && oCurrentBrowserEvent && !bInteractionProcessed) || bForce) {
					var sType;
					if (bForce) {
						sType = "startup";
					} else if (oCurrentBrowserEvent.originalEvent) {
						sType = oCurrentBrowserEvent.originalEvent.type;
					} else {
						sType = oCurrentBrowserEvent.type;
					}

					Interaction.start(sType, oElement);
					oPendingInteraction = Interaction.getPending();

					// update pending interaction infos
					if (oPendingInteraction && !oPendingInteraction.completed && Interaction.onInteractionStarted) {
						oPendingInteraction.passportAction = Interaction.onInteractionStarted(oPendingInteraction, bForce);
					}
					oCurrentBrowserEvent = null;
					//only handle the first browser event within a call stack. Ignore virtual/harmonization events.
					bInteractionProcessed = true;
					setTimeout(function() {
						//cleanup internal registry after actual call stack.
						oCurrentBrowserEvent = null;
						bInteractionProcessed = false;
					}, 0);
				}
			}
		},

		/**
		 * Register async operation, that is relevant for a running interaction.
		 * Invoking the returned handle stops the async operation.
		 *
		 * @params {string} sStepName a step name
		 * @returns {function} The async handle
		 * @private
		 */
		notifyAsyncStep : function(sStepName) {
			if (oPendingInteraction) {
				/*eslint-disable no-console */
				if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
					console.time(sStepName);
				}
				/*eslint-enable no-console */
				var sInteractionId = oPendingInteraction.id;
				Interaction.notifyAsyncStepStart();
				return function() {
					Interaction.notifyAsyncStepEnd(sInteractionId);
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
						console.timeEnd(sStepName);
					}
					/*eslint-enable no-console */
				};
			} else {
				return function() {};
			}
		},

		/**
		 * This methods resets the idle time check. Counts a running interaction relevant step.
		 *
		 * @private
		*/
		notifyAsyncStepStart : function() {
			if (oPendingInteraction) {
				iInteractionCounter++;
				clearTimeout(iInteractionStepTimer);
				bIdle = false;
				Log.info("Interaction relevant step started - Number of pending steps: " + iInteractionCounter);
			}
		},

		/**
		 * Ends a running interaction relevant step by decreasing the internal count.
		 *
		 * @private
		*/
		notifyAsyncStepEnd : function(sId) {
			if (oPendingInteraction && sId === oPendingInteraction.id) {
				iInteractionCounter--;
				Interaction.notifyStepEnd(true);
				Log.info("Interaction relevant step stopped - Number of pending steps: " + iInteractionCounter);
			}
		},

		/**
		 * This method ends the started interaction measurement.
		 *
		 * @static
		 * @private
		 */
		notifyStepEnd : function(bCheckIdle) {
			if (bInteractionActive && !bSuspended) {
				if (iInteractionCounter === 0 || !bCheckIdle) {
					if (bIdle || !bCheckIdle) {
						Interaction.end(true);
						Log.info("Interaction stopped");
						bIdle = false;
					} else {
						Interaction.end(); //set preliminary end time
						bIdle = true;
						if (iInteractionStepTimer) {
							clearTimeout(iInteractionStepTimer);
						}
						iInteractionStepTimer = setTimeout(Interaction.notifyStepEnd, 250);
						Log.info("Interaction check for idle time - Number of pending steps: " + iInteractionCounter);
					}
				}
			}
		},

		/**
		 * This method notifies if a relevant event has been triggered.
		 *
		 * @param {Event} oEvent Event whose processing has started
		 * @static
		 * @private
		 */
		notifyEventStart : function(oEvent) {
			oCurrentBrowserEvent = bInteractionActive ? oEvent : null;
		},

		/**
		 * This method notifies if a scroll event has been triggered. Some controls require this special treatment,
		 * as the generic detection process via notifyEventStart is not sufficient.
		 *
		 * @param {Event} oEvent Scroll event whose processing has started
		 * @static
		 * @private
		 */
		notifyScrollEvent : function(oEvent) {
			if (bInteractionActive) {
				// notify for a newly started interaction, but not more often than every 250ms.
				if (!iScrollEventDelayId) {
					Interaction.notifyEventStart(oEvent);
				} else {
					clearTimeout(iScrollEventDelayId);
				}
				iScrollEventDelayId = setTimeout(function(){
					Interaction.notifyStepStart(oEvent.sourceElement);
					iScrollEventDelayId = 0;
					Interaction.notifyStepEnd();
				}, 250);
			}
		},

		/**
		 * This method notifies if a relevant event has ended by detecting another interaction.
		 *
		 * @static
		 * @private
		 */
		notifyEventEnd : function() {
			if (oCurrentBrowserEvent) {
				// End interaction when a new potential interaction starts
				if (oCurrentBrowserEvent.type.match(/^(mousedown|touchstart|keydown)$/)) {
					Interaction.end(/*bForce*/true);
				}
			}
		},

		/**
		 * A hook which is called when an interaction is started.
		 *
		 * @param {object} oInteraction The pending interaction
		 * @private
		 */
		onInteractionStarted: null,

		/**
		 * A hook which is called when an interaction is finished.
		 *
		 * @param {object} oFinishedInteraction The finished interaction
		 * @private
		 */
		onInteractionFinished: null,

		/**
		 * This method sets the component name for an interaction once. This respects the case, where a new
		 * component is created in an interaction step while for example navigating to a new page. Differs
		 * from the actual owner component of the trigger control, which is still the previous component.
		 *
		 * @static
		 * @private
		 */
		setStepComponent : function(sComponentName) {
			if (bInteractionActive && oPendingInteraction && sComponentName && !oPendingInteraction.stepComponent) {
				oPendingInteraction.stepComponent = sComponentName;
			}
		},

		/**
		 * @param {float} iDuration Increase busy duration of pending interaction by this value
		 * @static
		 * @private
		 */
		addBusyDuration : function (iDuration) {
			if (bInteractionActive && oPendingInteraction) {
				if (!oPendingInteraction.busyDuration) {
					oPendingInteraction.busyDuration = 0;
				}
				oPendingInteraction.busyDuration += iDuration;
			}
		}
	};

	return Interaction;
});
