/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["./Measurement", "./ResourceTimings", "./XHRInterceptor", "sap/base/util/now", "sap/base/log", "sap/ui/thirdparty/URI"
], function(Measurement, ResourceTimings, XHRInterceptor, now, log, URI) {

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

	function createMeasurement(iTime) {
		return {
			event: "startup", // event which triggered interaction - default is startup interaction
			trigger: "undetermined", // control which triggered interaction
			component: "undetermined", // component or app identifier
			appVersion: "undetermined", // application version as from app descriptor
			start : iTime || window.performance.timing.fetchStart, // interaction start - page fetchstart if initial
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
			busyDuration : 0 // summed GlobalBusyIndicator duration during this interaction
		};
	}

	function isCompleteMeasurement(oMeasurement) {
		if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
			return oMeasurement;
		}
	}

	/**
	 * Valid timings are all timings which are completed, not empty and not responded from browser cache.
	 *
	 * Note: Currently only Chrome and FF support size related properties (body size and transfer size),
	 * hence the requests of others not supporting them are counted as complete (in dubio pro reo), as
	 * before.
	 *
	 * @param {object} oRequestTiming
	 * @private
	 */
	function isValidRoundtrip(oRequestTiming) {
		var bComplete, bEmpty, bCached;

		// if the request has been completed it has complete timing figures)
		bComplete = oRequestTiming.startTime > 0 &&
			oRequestTiming.startTime <= oRequestTiming.requestStart &&
			oRequestTiming.requestStart <= oRequestTiming.responseEnd;

		// encodedBodySize and transferSize info are not available in all browsers
		if (oRequestTiming.encodedBodySize !== undefined && oRequestTiming.transferSize !== undefined) {
			// if the body is empty a script tag responded from cache is assumed
			bEmpty = oRequestTiming.encodedBodySize ===  0;
			// if transfer size is smaller than body an xhr responded from cache is assumed
			bCached = oRequestTiming.transferSize < oRequestTiming.encodedBodySize;
		}

		return bComplete && !bEmpty && !bCached;
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
			oPendingInteraction.end = iTime;
			oPendingInteraction.duration = oPendingInteraction.processing;
			oPendingInteraction.requests = ResourceTimings.getRequestTimings();
			oPendingInteraction.completeRoundtrips = 0;
			oPendingInteraction.measurements = Measurement.filterMeasurements(isCompleteMeasurement, true);

			var aCompleteRoundtripTimings = oPendingInteraction.requests.filter(isValidRoundtrip);
			if (aCompleteRoundtripTimings.length > 0) {
				aggregateRequestTimings(aCompleteRoundtripTimings);
			}
			oPendingInteraction.completeRoundtrips = aCompleteRoundtripTimings.length;

			// calculate real processing time if any processing took place
			// cannot be negative as then requests took longer than processing
			var iProcessing = oPendingInteraction.processing - oPendingInteraction.navigation - oPendingInteraction.roundtrip;
			oPendingInteraction.processing = iProcessing > -1 ? iProcessing : 0;

			aInteractions.push(oPendingInteraction);
			log.info("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "Interaction.js");
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

	/**
	 * @namespace Provides base functionality for interaction detection heuristics & API<br>
	 * <p>
	 * Interaction detection works through the detection of relevant events and tracking of rendering activities.<br>
	 * An example:<br>
	 * The user clicks on a button<br>
	 * -> "click" event gets detected via notification (<code>var notifyEventStart</code>)<br>
	 * -> a click handler is registered on the button, so this is an interaction start (<code>var notifyStepStart</code>)<br>
	 * -> some requests are made and rendering has finished (<code>var notifyStepEnd</code>)<br>
	 * </p>
	 * All measurement takes place in {@link sap/ui/performance/Measurement}<br>.
	 *
	 * Namespace exists since 1.32 and became public API since 1.36.
	 *
	 * @name sap.ui.performance.Interaction
	 * @static
	 * @private
	 */

	var bInteractionActive = false,
		oCurrentBrowserEvent,
		iInteractionStepTimer,
		iScrollEventDelayId = 0;

	function registerXHROverrides() {

		// store the byte size of the body
		XHRInterceptor.register(INTERACTION, "send" ,function() {
			if (this.pendingInteraction) {
				// double string length for byte length as in js characters are stored as 16 bit ints
				this.pendingInteraction.bytesSent += arguments[0] ? arguments[0].length * 2 : 0;
			}
		});

		// store request header size
		XHRInterceptor.register(INTERACTION, "setRequestHeader", function(sHeader, sValue) {
			// count request header length consistent to what getAllResponseHeaders().length would return
			if (!this.requestHeaderLength) {
				this.requestHeaderLength = 0;
			}
			// double string length for byte length as in js characters are stored as 16 bit ints
			// sHeader + ": " + sValue + " "   --  means two blank and one colon === 3
			this.requestHeaderLength += (sHeader.length + sValue.length + 3) * 2;
		});

		// register the response handler for data collection
		XHRInterceptor.register(INTERACTION, "open", function () {
			// only use Interaction for non CORS requests
			if (!isCORSRequest(arguments[1])) {
				this.addEventListener("readystatechange", handleResponse);
			}
			// assign the current interaction to the xhr for later response header retrieval.
			this.pendingInteraction = oPendingInteraction;
		});

	}

	// response handler which uses the custom properties we added to the xhr to retrieve information from the response headers
	function handleResponse() {
		if (this.readyState === 4 && this.pendingInteraction && !this.pendingInteraction.completed) {
			// enrich interaction with information
			var sContentLength = this.getResponseHeader("content-length"),
				bCompressed = this.getResponseHeader("content-encoding") === "gzip",
				sFesrec = this.getResponseHeader("sap-perf-fesrec");
			this.pendingInteraction.bytesReceived += sContentLength ? parseInt(sContentLength, 10) : 0;
			// double string length for byte length as in js characters are stored as 16 bit ints
			this.pendingInteraction.bytesReceived += this.getAllResponseHeaders().length * 2;
			this.pendingInteraction.bytesSent += this.requestHeaderLength || 0;
			// this should be true only if all responses are compressed
			this.pendingInteraction.requestCompression = bCompressed && (this.pendingInteraction.requestCompression !== false);
			// sap-perf-fesrec header contains milliseconds
			this.pendingInteraction.networkTime += sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
			var sSapStatistics = this.getResponseHeader("sap-statistics");
			if (sSapStatistics) {
				var aTimings = ResourceTimings.getRequestTimings();
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


	var Interaction = {

		/**
	 	 * Gets all interaction measurements.
		 *
		 * @param {boolean} bFinalize finalize the current pending interaction so that it is contained in the returned array
		 * @return {object[]} all interaction measurements
		 * @name getAll
		 * @function
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
		 * @name filter
		 * @function
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
		 * @name getPending
		 * @function
		 * @private
		 */
		getPending : function() {
			return oPendingInteraction;
		},

		/**
		 * Clears all interaction measurements.
		 *
		 * @name clear
		 * @function
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
		 * @name start
		 * @function
		 * @private
		 */
		start : function(sType, oSrcElement) {
			var iTime = now();

			if (oPendingInteraction) {
				finalizeInteraction(iTime);
			}

			// clear request timings for new interaction
			ResourceTimings.clearRequestTimings();

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
			log.info("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "Interaction.js");
		},

		/**
		 * End an interaction measurements.
		 *
		 * @param {boolean} bForce forces end of interaction now and ignores further re-renderings
		 * @name end
		 * @function
		 * @private
		 */
		end : function(bForce) {
			if (oPendingInteraction) {
				// set provisionary processing time from start to end and calculate later
				if (!bForce) {
					oPendingInteraction.processing = now() - oPendingInteraction.start;
				} else {
					finalizeInteraction(now());
				}
			}
		},

		/**
		 * Returns true if the interaction detection was enabled explicitly, or implicitly along with fesr.
		 *
		 * @return {boolean} bActive State of the interaction detection
		 * @private
		 */
		getActive : function() {
			return bInteractionActive;
		},

		/**
		 * Enables the interaction tracking.
		 *
		 * @param {boolean} bActive State of the interaction detection
		 * @private
		 */
		setActive : function(bActive) {
			if (bActive && !bInteractionActive) {
				registerXHROverrides();
			}
			bInteractionActive = bActive;
		},

		/**
		 * This method starts the actual interaction measurement when all criteria are met. As it is the starting point
		 * for the new interaction, the creation of the FESR headers for the last interaction is triggered here, so that
		 * the headers can be sent with the first request of the current interaction.<br>
		 *
		 * @param {sap.ui.core.Element} oElement Element on which the interaction has been triggered
		 * @param {boolean} bForce Forces the interaction to start independently from a currently active browser event
		 * @private
		 */
		notifyStepStart : function(oElement, bForce) {
			if (bInteractionActive) {
				if (oCurrentBrowserEvent || bForce) {
					var sType;
					if (bForce) {
						sType = "startup";
					} else if (oCurrentBrowserEvent.originalEvent) {
						sType = oCurrentBrowserEvent.originalEvent.type;
					} else {
						sType = oCurrentBrowserEvent.type;
					}

					Interaction.start(sType, oElement);

					var aInteraction = Interaction.getAll();
					var oFinshedInteraction = aInteraction[aInteraction.length - 1];
					var oPI = Interaction.getPending();

					// update pending interaction infos
					oPendingInteraction = oPI ? oPI : oPendingInteraction;
					if (Interaction.onInteractionFinished && oFinshedInteraction) {
						Interaction.onInteractionFinished(oFinshedInteraction);
					}
					oCurrentBrowserEvent = null;
				}
			}
		},

		/**
		 * This method ends the started interaction measurement.
		 *
		 * @private
		 */
		notifyStepEnd : function() {
			if (bInteractionActive) {
				if (iInteractionStepTimer) {
					clearTimeout(iInteractionStepTimer);
				}
				iInteractionStepTimer = setTimeout(Interaction.end, 1);
			}
		},

		/**
		 * This method notifies if a relevant event has been triggered.
		 *
		 * @param {Event} oEvent Event whose processing has started
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
					Interaction.notifyStepStart();
					iScrollEventDelayId = 0;
				}, 250);
			}
		},

		/**
		 * This method notifies if a relevant event has ended by detecting another interaction.
		 *
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
		 * @private
		 */
		setStepComponent : function(sComponentName) {
			if (bInteractionActive && oPendingInteraction && sComponentName && !oPendingInteraction.stepComponent) {
				oPendingInteraction.stepComponent = sComponentName;
			}
		},

		/**
		 * @param {float} iDuration Increase busy duration of pending interaction by this value
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
