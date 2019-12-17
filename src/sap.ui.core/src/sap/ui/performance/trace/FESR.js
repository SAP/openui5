/*!
 * ${copyright}
 */

 /*global WeakMap */

sap.ui.define([
	'sap/ui/thirdparty/URI',
	'sap/ui/Device',
	'sap/ui/performance/trace/Passport',
	'sap/ui/performance/trace/Interaction',
	'sap/ui/performance/XHRInterceptor',
	'sap/ui/performance/BeaconRequest',
	'sap/base/util/Version'
], function (URI, Device, Passport, Interaction, XHRInterceptor, BeaconRequest, Version) {
	"use strict";

	// activation by meta tag or url parameter as fallback
	var bFesrActive = false,
		sBeaconURL,
		oBeaconRequest,
		iBeaconTimeoutID,
		ROOT_ID = Passport.getRootId(), // static per session
		HOST = window.location.host, // static per session
		CLIENT_OS = Device.os.name + "_" + Device.os.version,
		CLIENT_MODEL = Device.browser.name + "_" + Device.browser.version,
		CLIENT_DEVICE = setClientDevice(),
		sAppVersion = "", // shortened app version with fesr delimiter e.g. "@1.7.1"
		sAppVersionFull = "", // full app version e.g. 1.7.1-SNAPSHOT
		sFESRTransactionId, // first transaction id of an interaction step, serves as identifier for the fesr-header
		iStepCounter = 0, // counts FESR interaction steps
		sPassportComponentInfo = "undetermined",
		sPassportAction = "undetermined_startup_0",
		sFESR, // current header string
		sFESRopt,  // current header string
		wmPassportHeader = new WeakMap(); //a WeakMap to access passport header with a given XHR as key.

	function setClientDevice() {
		var iClientId = 0;
		if (Device.system.combi) {
			iClientId = 1;
		} else if (Device.system.desktop) {
			iClientId = 2;
		} else if (Device.system.tablet) {
			iClientId = 4;
		} else if (Device.system.phone) {
			iClientId = 3;
		}
		return iClientId;
	}

	function formatInteractionStartTimestamp(iTimeStamp) {
		var oDate = new Date(iTimeStamp);
		return oDate.toISOString().replace(/[^\d]/g, '');
	}

	function isCORSRequest(sUrl) {
		var sHost = new URI(sUrl).host();
		// url is relative or with same host
		return sHost && sHost !== HOST;
	}

	function passportHeaderOverride() {

		// only use Passport for non CORS requests
		if (!isCORSRequest(arguments[1])) {

			// use the first request of an interaction as FESR TransactionID
			if (!sFESRTransactionId) {
				sFESRTransactionId = Passport.getTransactionId();
			}

			var sPassportHeader = Passport.header(
				Passport.traceFlags(),
				ROOT_ID,
				Passport.getTransactionId(),
				sPassportComponentInfo,
				sPassportAction
			);

			// set passport with Root Context ID, Transaction ID, Component Info, Action
			this.setRequestHeader("SAP-PASSPORT", sPassportHeader);
			wmPassportHeader.set(this, sPassportHeader);
		}
	}

	/**
	 * Sends the FESR header when using the piggyback aproach
	 * @private
	 */
	function fesrHeaderOverride() {

		// only use FESR for non CORS requests
		if (!isCORSRequest(arguments[1])) {

			if (sFESR && sFESRopt) {
				this.setRequestHeader("SAP-Perf-FESRec", sFESR);
				this.setRequestHeader("SAP-Perf-FESRec-opt", sFESRopt);
				sFESR = null;
				sFESRopt = null;
				sFESRTransactionId = Passport.getTransactionId();
			}
		}
	}

	// creates mandatory FESR header string
	function createFESR(oInteraction, oFESRHandle) {
		return [
			format(ROOT_ID, 32), // root_context_id
			format(sFESRTransactionId, 32), // transaction_id
			format(oInteraction.navigation, 16), // client_navigation_time
			format(oInteraction.roundtrip, 16), // client_round_trip_time
			format(oFESRHandle.timeToInteractive, 16), // end_to_end_time
			format(oInteraction.completeRoundtrips, 8), // completed network_round_trips
			format(sPassportAction, 40, true), // passport_action
			format(oInteraction.networkTime, 16), // network_time
			format(oInteraction.requestTime, 16), // request_time
			format(CLIENT_OS, 20), // client_os
			"SAP_UI5" // client_type
		].join(",");
	}

	// creates optional FESR header string
	function createFESRopt(oInteraction, oFESRHandle) {
		return [
			format(oFESRHandle.appNameShort, 20, true), // application_name
			format(oFESRHandle.stepName, 20, true), // step_name
			"", // not assigned
			format(CLIENT_MODEL, 20), // client_model
			format(oInteraction.bytesSent, 16), // client_data_sent
			format(oInteraction.bytesReceived, 16), // client_data_received
			"", // network_protocol
			"", // network_provider
			format(oInteraction.processing, 16), // client_processing_time
			oInteraction.requestCompression ? "X" : "", // compressed - empty if not compressed
			"", // not assigned
			"", // persistency_accesses
			"", // persistency_time
			"", // persistency_data_transferred
			format(oInteraction.busyDuration, 16), // extension_1 - busy duration
			"", // extension_2
			format(CLIENT_DEVICE, 1), // extension_3 - client device
			"", // extension_4
			format(formatInteractionStartTimestamp(oInteraction.start), 20), // extension_5 - interaction start time
			format(oFESRHandle.appNameLong, 70, true) // application_name with 70 characters, trimmed from left
		].join(",");
	}

	// format string to fesr compliant string
	function format(vField, iLength, bCutFromFront) {
		if (!vField) {
			vField = vField === 0 ? "0" : "";
		} else if (typeof vField === "number") {
			var iField = vField;
			vField = Math.round(vField).toString();
			// Calculation of figures may be erroneous because incomplete performance entries lead to negative
			// numbers. In that case we set a -1, so the "dirty" record can be identified as such.
			if (vField.length > iLength || iField < 0) {
				vField = "-1";
			}
		} else {
			vField = bCutFromFront ? vField.substr(-iLength, iLength) : vField.substr(0, iLength);
		}
		return vField;
	}

	function formatVersion(sVersion) {
		var oVersion = new Version(sVersion);
		return "@" + oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch();
	}

	function createHeader(oFinishedInteraction, oFESRHandle) {
		// create FESR from completed interaction
		sFESR = createFESR(oFinishedInteraction, oFESRHandle);
		sFESRopt = createFESRopt(oFinishedInteraction, oFESRHandle);
	}

	function onInteractionStarted(oInteraction) {
		// increase the step count for Passport and FESR (initial loading starts with 0)
		iStepCounter++;

		// update Passport relevant fields
		sPassportComponentInfo = oInteraction ? oInteraction.component + sAppVersion : undefined;
		sPassportAction = oInteraction ? oInteraction.trigger + "_" + oInteraction.event + "_" + iStepCounter : undefined;
	}

	function onInteractionFinished(oFinishedInteraction) {
		var oFESRHandle = FESR.onBeforeCreated({
			stepName: oFinishedInteraction.trigger + "_" + oFinishedInteraction.event,
			appNameLong: oFinishedInteraction.stepComponent || oFinishedInteraction.component,
			appNameShort: oFinishedInteraction.stepComponent || oFinishedInteraction.component,
			timeToInteractive: oFinishedInteraction.duration
		}, oFinishedInteraction);

		// do not send UI-only FESR with piggyback approach
		if (oBeaconRequest || oFinishedInteraction.requests.length > 0) {
			createHeader(oFinishedInteraction, oFESRHandle);
			if (oBeaconRequest) {
				// reset the transactionId for Beacon approach
				sFESRTransactionId = null;
			}
		}

		// use the sendBeacon API instead of the piggyback approach
		if (oBeaconRequest && sFESR && sFESRopt) {
			oBeaconRequest.append("SAP-Perf-FESRec", sFESR + "SAP-Perf-FESRec-opt" + sFESRopt);
			// set a timeout to send in case of no Interactions
			clearTimeout(iBeaconTimeoutID);
			iBeaconTimeoutID = setTimeout(sendBeaconRequest, 60000);
		}

		if (sAppVersionFull != oFinishedInteraction.appVersion) {
			sAppVersionFull = oFinishedInteraction.appVersion;
			sAppVersion = sAppVersionFull ? formatVersion(sAppVersionFull) : "";
		}

		sPassportAction = "undefined";
	}

	function sendBeaconRequest() {
		oBeaconRequest.send();
		clearTimeout(iBeaconTimeoutID);
		iBeaconTimeoutID = setTimeout(sendBeaconRequest, 60000);
	}

	/**
	 * FESR API, consumed by E2eTraceLib instead of former EppLib.js.

	 * Provides functionality for creating the headers for the frontend-subrecords which will be sent with each
	 * first request of an interaction. The headers have a specific format, you may have a look at the createFESR
	 * methods.<br>

	 * There is a special order in which things are happening:
	 * <pre>
	 * 1. Interaction starts
	 * 1.1. Request 1.1 sent
	 * 1.2. Request 1.2 sent
	 * 2. Interaction starts
	 * 2.1 Creation of FESR for 1. interaction
	 * 2.2 Request 2.1 sent with FESR header for 1. interaction
	 * ...
	 * </pre>
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/performance/trace/FESR
	 * @static
	 * @public
	 */
	var FESR = {};

	FESR.getBeaconURL = function() {
		return sBeaconURL;
	};

	/**
	 * @param {boolean} bActive State of the FESR header creation
	 * @param {string} [sUrl] beacon url
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	FESR.setActive = function (bActive, sUrl) {
		if (bActive && !bFesrActive) {
			oBeaconRequest = sUrl ? BeaconRequest.isSupported() && new BeaconRequest({url: sUrl}) : null;
			sBeaconURL = sUrl;
			bFesrActive = true;
			Passport.setActive(true);
			Interaction.setActive(true);
			XHRInterceptor.register("PASSPORT_HEADER", "open", passportHeaderOverride);
			if (!oBeaconRequest) {
				XHRInterceptor.register("FESR", "open" , fesrHeaderOverride);
			}
			Interaction.onInteractionStarted = onInteractionStarted;
			Interaction.onInteractionFinished = onInteractionFinished;
			Interaction.passportHeader = wmPassportHeader;
		} else if (!bActive && bFesrActive) {
			bFesrActive = false;
			Interaction.setActive(false);
			XHRInterceptor.unregister("FESR", "open");
			// passport stays active so far
			if (XHRInterceptor.isRegistered("PASSPORT_HEADER", "open")) {
				XHRInterceptor.register("PASSPORT_HEADER", "open", function() {
					// set passport with Root Context ID, Transaction ID for Trace
					this.setRequestHeader("SAP-PASSPORT", Passport.header(Passport.traceFlags(), ROOT_ID, Passport.getTransactionId()));
				});
			}
			if (oBeaconRequest) {
				oBeaconRequest.send();
				clearTimeout(iBeaconTimeoutID);
				iBeaconTimeoutID = null;
				oBeaconRequest = null;
				sBeaconURL = null;
			}
			Interaction.onInteractionFinished = null;
			Interaction.onInteractionStarted = null;
		}
	};

	/**
	 * @return {boolean} State of the FESR header creation
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	FESR.getActive = function () {
		return bFesrActive;
	};

	/**
	 * Hook function that allows to override specific FESR header information.
	 * @param {object} oFESRHandle The header information that can be modified
	 * @param {string} oFESRHandle.stepName The step name with <Trigger>_<Event>
	 * @param {string} oFESRHandle.appNameLong The application name with max 70 chars
	 * @param {string} oFESRHandle.appNameShort The application name with max 20 chars
	 * @param {int} oFESRHandle.timeToInteractive The Time To Interactive (TTI) with max 16 digits
	 * @param  {object} oInteraction The corresponding interaction object, read-only
	 * @return {object} Modified header information
	 * @private
	 * @ui5-restricted sap.ui.core, sap.ushell
	 */
	FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
		return {
			stepName: oFESRHandle.stepName,
			appNameLong: oFESRHandle.appNameLong,
			appNameShort: oFESRHandle.appNameShort,
			timeToInteractive: oFESRHandle.timeToInteractive
		};
	};

	return FESR;
});
