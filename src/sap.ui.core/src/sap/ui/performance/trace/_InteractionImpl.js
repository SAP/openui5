/*!
 * ${copyright}
 */

/*global HTMLScriptElement */
sap.ui.define([
	"sap/ui/performance/Measurement",
	"sap/ui/performance/XHRInterceptor",
	"sap/ui/performance/trace/FESRHelper",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/now",
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/ui/thirdparty/URI"
], function(Measurement, XHRInterceptor, FESRHelper, LoaderExtensions, now, uid, Log, URI) {

	"use strict";

	let bIsNavigation = false,
		iResetCurrentBrowserEventTimer = false,
		aInteractions = [],
		oPendingInteraction,
		oCurrentBrowserEvent,
		bPerfectMatch = false,
		bMatched = false,
		iInteractionStepTimer,
		iInteractionCounter = 0,
		bIdle = false,
		bInteractionActive = false,
		FESR;

	const mCompressedMimeTypes = {
			"application/zip": true,
			"application/vnd.rar": true,
			"application/gzip": true,
			"application/x-tar": true,
			"application/java-archive": true,
			"image/jpeg": true,
			"application/pdf": true
		},
		sCompressedExtensions = "zip,rar,arj,z,gz,tar,lzh,cab,hqx,ace,jar,ear,war,jpg,jpeg,pdf,gzip";

	function isCORSRequest(sUrl) {
		var sHost = new URI(sUrl.toString()).host();
		// url is relative or with same host
		return sHost && sHost !== window.location.host;
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
			start: iTime || performance.timeOrigin, // interaction start - page timeOrigin if initial
			end: 0, // interaction end
			navigation: 0, // sum over all navigation times
			roundtrip: 0, // time from first request sent to last received response end - without gaps and ignored overlap
			processing: 0, // client processing time
			duration: 0, // interaction duration
			requests: [], // Performance API requests during interaction
			measurements: [], // Measurements
			sapStatistics: [], // SAP Statistics for OData
			requestTime: 0, // sum over all requests in the interaction (oPendingInteraction.requests[0].responseEnd-oPendingInteraction.requests[0].requestStart)
			networkTime: 0, // request time minus server time from the header
			bytesSent: 0, // sum over all requests bytes
			bytesReceived: 0, // sum over all response bytes
			requestCompression: "X", // ok per default, if compression does not match SAP rules we report an empty string
			busyDuration: 0, // summed GlobalBusyIndicator duration during this interaction
			id: uid(), //Interaction ID
			passportAction: "undetermined_startup_0", //default PassportAction for startup
			rootId: undefined // root context ID
		};
	}

	/**
	 *
	 * @param {module:sap/ui/performance/Measurement} oMeasurement The Measurement to check for completeness.
	 * @returns {module:sap/ui/performance/Measurement | undefined} The checked Measurement if completed, otherwise undefined
	 */
	function isCompleteMeasurement(oMeasurement) {
		if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
			return oMeasurement;
		}
	}

	/**
	 * Check if request is initiated by XHR, comleted and timeframe of request is within timeframe of current interaction
	 *
	 * @param {object} oRequestTiming PerformanceResourceTiming as retrieved by performance.getEntryByType("resource")
	 * @return {boolean} true if the request is a completed XHR with started and ended within the current interaction
	 * @private
	 */
	function isValidInteractionXHR(oRequestTiming) {
		// if the request has been completed it has complete timing figures)
		var bComplete = oRequestTiming.startTime > 0 &&
			oRequestTiming.startTime <= oRequestTiming.requestStart &&
			oRequestTiming.requestStart <= oRequestTiming.responseEnd;

		var bPartOfInteraction = oPendingInteraction.start <= (performance.timeOrigin + oRequestTiming.requestStart) &&
			oPendingInteraction.end >= (performance.timeOrigin + oRequestTiming.responseEnd);

		return bPartOfInteraction && bComplete && oRequestTiming.initiatorType === "xmlhttprequest";
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
	}

	function finalizeInteraction(iTime) {
		if (oPendingInteraction) {
			var aAllRequestTimings = performance.getEntriesByType("resource");
			var oFinshedInteraction;
			oPendingInteraction.end = iTime;
			oPendingInteraction.processing = iTime - oPendingInteraction.start;
			oPendingInteraction.duration = oPendingInteraction.processing;
			oPendingInteraction.requests = aAllRequestTimings.filter(isValidInteractionXHR);
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

			// Duration threshold 2 in order to filter not performance relevant aInteractions such as liveChange
			if (oPendingInteraction.semanticStepName || oPendingInteraction.duration >= 2 || oPendingInteraction.requests.length > 0 || bIsNavigation) {
				aInteractions.push(oPendingInteraction);
				oFinshedInteraction = aInteractions[aInteractions.length - 1];
				if (Log.isLoggable()) {
					Log.debug("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "_InteractionImpl.js");
				}
			}
			// Execute onInteractionFinished always in case function exist to enable cleanup in FESR independent of filtering
			if (FESR?.onInteractionFinished) {
				FESR.onInteractionFinished(oFinshedInteraction);
			}
			Object.freeze(oPendingInteraction);
			oPendingInteraction = null;
			oCurrentBrowserEvent = null;
			bIsNavigation = false;
			bMatched = false;
			bPerfectMatch = false;
			clearTimeout(iResetCurrentBrowserEventTimer);
		}
	}

	// component determination - heuristic
	function createOwnerComponentInfo(oSrcElement) {
		var sId, sVersion;
		if (oSrcElement) {
			var Component, oComponent;
			Component = sap.ui.require("sap/ui/core/Component");
			if (Component) {
				while (oSrcElement && oSrcElement.getParent) {
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
		}
		return {
			id: sId ? sId : "undetermined",
			version: sVersion ? sVersion : ""
		};
	}

	/* As UI5 resources gets also loaded via script tags we need to
	 * intercept this kind of loading as well. We assume that changing the
	 * 'src' property indicates a resource loading via a script tag. In some cases
	 * the src property will be updated multiple times, so we should intercept
	 * the same script tag only once (dataset.sapUiCoreInteractionHandled)
	 */
	function interceptScripts() {
		const descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
		Object.defineProperty(HTMLScriptElement.prototype, "src", {
			set: function(val) {
				var fnDone;

				if (!this.dataset.sapUiCoreInteractionHandled) {
					fnDone = _InteractionImpl.notifyAsyncStep();
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
		XHRInterceptor.register("INTERACTION", "send" ,function() {
			if (this.oPendingInteraction) {
				// double string length for byte length as in js characters are stored as 16 bit ints
				this.oPendingInteraction.bytesSent += arguments[0] ? arguments[0].length : 0;
			}
		});

		// store request header size
		XHRInterceptor.register("INTERACTION", "setRequestHeader", function(sHeader, sValue) {
			// count request header length consistent to what getAllResponseHeaders().length would return
			if (!this.requestHeaderLength) {
				this.requestHeaderLength = 0;
			}
			// assume request header byte size
			this.requestHeaderLength += (sHeader + "").length + (sValue + "").length;

		});

		// register the response handler for data collection
		XHRInterceptor.register("INTERACTION", "open", function (sMethod, sUrl, bAsync) {
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
				var bIsNoCorsRequest = !isCORSRequest(sUrl);
				// only use Interaction for non CORS requests
				if (bIsNoCorsRequest) {
					//only track if FESR.clientID == EPP.Action && FESR.rootContextID == EPP.rootContextID
					sEpp = FESR?.passportHeader.get(this);
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
				// arguments at position 2 is indicatior whether request is async or not
				// readystatechange must not be used for sync CORS request since it does not work properly
				// this is especially necessary in case request was not started by LoaderExtension
				// bAsync is by default true, therefore we need to check eplicitly for value 'false'
				if (bIsNoCorsRequest || bAsync !== false) {
					// notify async step for all XHRs (even CORS requests)
					this.addEventListener("readystatechange", handleInteraction.bind(this, _InteractionImpl.notifyAsyncStep()));
				}
				// assign the current interaction to the xhr for later response header retrieval.
				this.oPendingInteraction = oPendingInteraction;
			}
		});

	}

	// check if SAP compression rules are fulfilled
	function checkCompression(sURL, sContentEncoding, sContentType, sContentLength) {
		//remove hashes and queries + find extension (last . segment)
		var fileExtension = sURL.split('.').pop().split(/\#|\?/)[0];

		if (sContentEncoding === 'gzip' ||
			sContentEncoding === 'br' ||
			sContentType in mCompressedMimeTypes ||
			(fileExtension && sCompressedExtensions.indexOf(fileExtension) !== -1) ||
			sContentLength < 1024) {
				return true;
		} else {
			return false;
		}
	}

	// response handler which uses the custom properties we added to the xhr to retrieve information from the response headers
	function handleResponse(sId) {
		if (this.readyState === 4) {
			if (this.oPendingInteraction && !this.oPendingInteraction.completed && oPendingInteraction.id === sId) {
				// enrich interaction with information
				var sContentLength = this.getResponseHeader("content-length"),
					bCompressed = checkCompression(this.responseURL, this.getResponseHeader("content-encoding"), this.getResponseHeader("content-type"), sContentLength),
					sFesrec = this.getResponseHeader("sap-perf-fesrec");
				this.oPendingInteraction.bytesReceived += sContentLength ? parseInt(sContentLength) : 0;
				this.oPendingInteraction.bytesReceived += this.getAllResponseHeaders().length;
				this.oPendingInteraction.bytesSent += this.requestHeaderLength || 0;
				// this should be true only if all responses are compressed
				this.oPendingInteraction.requestCompression = bCompressed && (this.oPendingInteraction.requestCompression !== false);
				// sap-perf-fesrec header contains milliseconds
				this.oPendingInteraction.networkTime += sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
				var sSapStatistics = this.getResponseHeader("sap-statistics");
				if (sSapStatistics) {
					var aTimings = performance.getEntriesByType("resource");
					this.oPendingInteraction.sapStatistics.push({
						// add response url for mapping purposes
						url: this.responseURL,
						statistics: sSapStatistics,
						timing: aTimings ? aTimings[aTimings.length - 1] : undefined
					});
				}
				delete this.requestHeaderLength;
				delete this.oPendingInteraction;
			}
		}
	}

	var _InteractionImpl = {
		getAll : function(bFinalize) {
			if (bFinalize) {
				// force the finalization of the currently pending interaction
				_InteractionImpl.end(true);
			}
			return aInteractions;
		},

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

		getPending : function() {
			return oPendingInteraction;
		},

		clear : function() {
			aInteractions = [];
		},

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
			if (performance.clearResourceTimings) {
				performance.clearResourceTimings();
			}

			var oComponentInfo = createOwnerComponentInfo(oSrcElement);

			// setup new pending interaction
			oPendingInteraction = createMeasurement(iTime);
			oPendingInteraction.event = sType;
			oPendingInteraction.component = oComponentInfo.id;
			oPendingInteraction.appVersion = oComponentInfo.version;
			if (oSrcElement && oSrcElement.getId) {
				oPendingInteraction.trigger = oSrcElement.getId();
				oPendingInteraction.semanticStepName = FESRHelper.getSemanticStepname(oSrcElement, sType);
			}
			/*eslint-disable no-console */
			if (Log.isLoggable(null, "sap.ui.Performance")) {
				console.time("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
			}
			/*eslint-enable no-console */
			if (Log.isLoggable()) {
				Log.debug("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "_InteractionImpl.js");
			}
		},

		end : function(bForce) {
			if (oPendingInteraction) {
				if (bForce) {
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance")) {
						console.timeEnd("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
					}
					/*eslint-enable no-console */
					finalizeInteraction(oPendingInteraction.preliminaryEnd || now());
					if (Log.isLoggable()) {
						Log.debug("Interaction ended...");
					}
				} else {
					// set provisionary processing time from start to end and calculate later
					oPendingInteraction.preliminaryEnd = now();
				}
			}
		},

		notifyNavigation: function() {
			bIsNavigation = true;
		},

		notifyShowBusyIndicator : function(oControl) {
			oControl._sapui_fesr_fDelayedStartTime = now() + oControl.getBusyIndicatorDelay();
		},

		notifyHideBusyIndicator : function(oControl) {
			if (oControl._sapui_fesr_fDelayedStartTime) {
				// The busy indicator shown duration d is calculated with:
				// d = "time busy indicator was hidden" - "time busy indicator was requested" - "busy indicator delay"
				var fBusyIndicatorShownDuration = now() - oControl._sapui_fesr_fDelayedStartTime;
				_InteractionImpl.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
				delete oControl._sapui_fesr_fDelayedStartTime;
			}
		},

		notifyStepStart : function(sEventId, oElement, bForce) {
			if (bInteractionActive) {
				let sType,
					elem,
					sClosestSemanticStepName,
					oBrowserElement;

				if ((!oPendingInteraction && oCurrentBrowserEvent) || bForce) {
					if (bForce) {
						sType = "startup";
					} else {
						sType = sEventId;
					}
					_InteractionImpl.start(sType, oElement);
					oPendingInteraction = _InteractionImpl.getPending();

					// update pending interaction infos
					if (oPendingInteraction && !oPendingInteraction.completed && FESR?.onInteractionStarted) {
						oPendingInteraction.passportAction = FESR.onInteractionStarted(oPendingInteraction, bForce);
					}
					// _InteractionImpl.start will delete oCurrentBrowserEvent in case there is an oPendingInteraction
					// (notifyStepStart is called with parameter bForce)
					// Conscious decision to not move the coding because this shouldn't be a productive scenario
					if (oCurrentBrowserEvent) {
						oBrowserElement = oCurrentBrowserEvent.srcControl;
					}
					// if browser event matches the first control event we take it for trigger/event determination (step name)
					sClosestSemanticStepName = FESRHelper.getSemanticStepname(oBrowserElement, sEventId);
					if (oElement && oElement.getId && oBrowserElement && oElement.getId() === oBrowserElement.getId()) {
						bPerfectMatch = true;
					} else if (sClosestSemanticStepName) {
						oPendingInteraction.trigger = oBrowserElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						bPerfectMatch = true;
					} else {
						elem = oBrowserElement;
						while (elem && elem.getParent()) {
							elem = elem.getParent();
							if (oElement.getId() === elem.getId()) {
								// Stop looking for better fitting control in case the current browser event source control
								// is already child of the control event which triggers the interaction because all other
								// control events most likely does not suit better.
								// Example: Click on image of an button will not pass the previous if
								// (oElement.getId() !== oBrowserElement.getId() ==> btn !== btn-img).
								// In case the button is part of an popover and the click on the button closes the popover,
								// the coding below overwrites the button control id with the popover control id in case we
								// don't stop here.
								// Only look for better fitting control in case browser and control event does not fit at all
								bMatched = true;
								break;
							}
						}
					}
					oCurrentBrowserEvent = null;
					bIsNavigation = false;
					iResetCurrentBrowserEventTimer = setTimeout(function() {
						//cleanup internal registry after actual call stack.
						oCurrentBrowserEvent = null;
					}, 0);
					bIdle = false;
					_InteractionImpl.notifyStepEnd(true); // Start timer to end Interaction in case there is no timing relevant action e.g. rendering, request
				} else if (oPendingInteraction && oBrowserElement && !bPerfectMatch) {
					// if browser event matches one of the next control events we take it for trigger/event determination (step name)
					elem = oBrowserElement;
					sClosestSemanticStepName = FESRHelper.getSemanticStepname(oBrowserElement, sEventId);
					if (elem && oElement.getId() === elem.getId()) {
						oPendingInteraction.trigger = oElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						oPendingInteraction.event = sEventId;
						bPerfectMatch = true;
					} else if (sClosestSemanticStepName) {
						oPendingInteraction.trigger = oBrowserElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						bPerfectMatch = true;
					} else if (!bMatched) {
						while (elem && elem.getParent()) {
							elem = elem.getParent();
							if (oElement.getId() === elem.getId()) {
								oPendingInteraction.trigger = oElement.getId();
								oPendingInteraction.semanticStepName = FESRHelper.getSemanticStepname(oElement, sEventId);
								oPendingInteraction.event = sEventId;
								//if we find no direct match we consider the last control event for the trigger/event (step name)
								break;
							}
						}
					}
				}
			}
		},

		notifyAsyncStep : function(sStepName) {
			if (oPendingInteraction) {
				/*eslint-disable no-console */
				if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
					console.time(sStepName);
				}
				/*eslint-enable no-console */
				var sInteractionId = oPendingInteraction.id;
				delete oPendingInteraction.preliminaryEnd; // Delete prelimanry end to force current timestamp of finalization
				_InteractionImpl.notifyAsyncStepStart();
				return function() {
					_InteractionImpl.notifyAsyncStepEnd(sInteractionId);
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

		notifyAsyncStepStart : function() {
			if (oPendingInteraction) {
				iInteractionCounter++;
				clearTimeout(iInteractionStepTimer);
				bIdle = false;
				if (Log.isLoggable()) {
					Log.debug("Interaction relevant step started - Number of pending steps: " + iInteractionCounter);
				}
			}
		},

		notifyAsyncStepEnd : function(sId) {
			if (oPendingInteraction && sId === oPendingInteraction.id) {
				iInteractionCounter--;
				_InteractionImpl.notifyStepEnd(true);
				if (Log.isLoggable()) {
					Log.debug("Interaction relevant step stopped - Number of pending steps: " + iInteractionCounter);
				}
			}
		},

		notifyStepEnd : function(bCheckIdle) {
			if (bInteractionActive) {
				if (iInteractionCounter === 0 || !bCheckIdle) {
					if (bIdle || !bCheckIdle) {
						_InteractionImpl.end(true);
						if (Log.isLoggable()) {
							Log.debug("Interaction stopped");
						}
						bIdle = false;
					} else {
						_InteractionImpl.end(); //set preliminary end time
						bIdle = true;
						if (iInteractionStepTimer) {
							clearTimeout(iInteractionStepTimer);
						}
						// There are control events using a debouncing mechanism for e.g. suggest event (see sap.m.Input)
						// A common debounce treshhold (also used by sap.m.Input) is 300ms therefore we use setTimeout
						// with 301ms to end the Interaction after execution of the debounced event
						iInteractionStepTimer = setTimeout(_InteractionImpl.notifyStepEnd, 301);
						if (Log.isLoggable()) {
							Log.debug("Interaction check for bIdle time - Number of pending steps: " + iInteractionCounter);
						}
					}
				}
			}
		},

		notifyEventStart : function(oEvent) {
			oCurrentBrowserEvent = bInteractionActive ? oEvent : null;
		},

		notifyScrollEvent : function(oEvent) {
			/* Scrolling is disabled as it does not work properly for non user triggered scrolling */
		},

		notifyEventEnd : function() {
			if (oCurrentBrowserEvent) {
				// End interaction when a new potential interaction starts
				if (oCurrentBrowserEvent.type.match(/^(mousedown|touchstart|keydown)$/)) {
					_InteractionImpl.end(/*bForce*/true);
				}
				// Clean up oCurrentBrowserEvent at the end to prevent dangling events
				// Since oCurrentBrowser event is prerequisite to start an event we need to
				// clean dangling browser events to avoid creating aInteractions based on these events
				// e.g. The user clicks first somewhere on the UI on a control without press handler.
				// After that the user scrolls in a table and triggers implicit requests via paging.
				// This combination will create an interaction based on the first browser event,
				// created and not cleaned up by the first click within the UI
				if (this.eventEndTimer) {
					clearTimeout(this.eventEndTimer);
				}
				this.eventEndTimer = setTimeout(function() {
					oCurrentBrowserEvent = null;
					delete this.eventEndTimer;
				// There are events fired within a timeout with delay. Cleanup after 10ms
				// to hopefully prevent cleaning up to early (before control event was fired)
				}.bind(this), 10);
			}
		},

		setStepComponent : function(sComponentName) {
			if (bInteractionActive && oPendingInteraction && sComponentName && !oPendingInteraction.stepComponent) {
				oPendingInteraction.stepComponent = sComponentName;
			}
		},

		addBusyDuration : function (iDuration) {
			if (bInteractionActive && oPendingInteraction) {
				if (!oPendingInteraction.busyDuration) {
					oPendingInteraction.busyDuration = 0;
				}
				oPendingInteraction.busyDuration += iDuration;
			}
		},

		_setActive: function(bActive) {
			bInteractionActive = bActive;
			if (bActive) {
				_InteractionImpl.notifyStepStart("startup", "startup", true);
			}
		},

		_setFESR: function(oFESR) {
			FESR = oFESR;
		}
	};

	registerXHROverrides();
	interceptScripts();

	LoaderExtensions.notifyResourceLoading = _InteractionImpl.notifyAsyncStep;

	return _InteractionImpl;
});
