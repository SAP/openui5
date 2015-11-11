/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/URI'],
	function(jQuery, URI) {
		"use strict";

		(function() {

			var bFesrActive = /sap-ui-xx-fesr=(true|x|X)/.test(location.search),
				bTraceActive = /sap-ui-xx-e2e-trace=(true|x|X)/.test(location.search),
				ROOT_ID = createGUID(), // static per session
				CLIENT_ID = createGUID().substr(-8, 8) + ROOT_ID, // static per session
				HOST = new URI(window.location).host(), // static per session
				iE2eTraceLevel,
				sTransactionId,
				sFESRTransactionId,
				oPendingInteraction = {
					component: "initial",
					trigger: "initial"
				},
				iStepCounter = 0,
				iInteractionStepTimer,
				oCurrentBrowserEvent,
				sFESR,
				sFESRopt,
				fnXHRopen = window.XMLHttpRequest.prototype.open,
				fnXHRsend = window.XMLHttpRequest.prototype.send;

			if (bFesrActive) {
				// inject function in window.XMLHttpRequest.open for FESR and E2eTraceLib
				window.XMLHttpRequest.prototype.open = function() {
					fnXHRopen.apply(this, arguments);
					var sHost = new URI(arguments[1]).host();

					// only use passport & FESR for non CORS requests (relative or with same host)
					if (!sHost || sHost === HOST) {
						this.addEventListener("readystatechange", handleResponse);
						this.pendingInteraction = oPendingInteraction;

						sTransactionId = createGUID();
						iStepCounter++;

						// set passport with Root Context ID, Transaction ID, Component Name, Action
						this.setRequestHeader("SAP-PASSPORT", passportHeader(iE2eTraceLevel, ROOT_ID, sTransactionId, oPendingInteraction.component, oPendingInteraction.trigger + "_" + iStepCounter));

						// set FESR
						if (sFESR) {
							this.setRequestHeader("SAP-Perf-FESRec", sFESR);
							this.setRequestHeader("SAP-Perf-FESRec-opt", sFESRopt);
							sFESR = null;
							sFESRopt = null;
							iStepCounter = 0;
							sFESRTransactionId = sTransactionId;
						} else if (!sFESRTransactionId) {
							// initial request should set the FESR Transaction Id
							sFESRTransactionId = sTransactionId;
						}
					} else {
						sTransactionId = createGUID();
						// set passport with Root Context ID, Transaction ID, Component Name, Action
						this.setRequestHeader("SAP-PASSPORT", passportHeader(iE2eTraceLevel, ROOT_ID, sTransactionId));
					}
				};

				// inject function in window.XMLHttpRequest.send
				window.XMLHttpRequest.prototype.send = function() {
					fnXHRsend.apply(this, arguments);
					if (this.pendingInteraction) {
						this.pendingInteraction.bytesSent += arguments[0] ? arguments[0].length : 0;
					}
				};

			}

			function handleResponse() {
				if (this.readyState === 4 && this.pendingInteraction) {
					// enrich interaction with information
					var sContentLength = this.getResponseHeader("content-length"),
						sFesrec = this.getResponseHeader("sap-perf-fesrec");
					this.pendingInteraction.bytesReceived += sContentLength ? parseInt(sContentLength, 10) : 0;
					this.pendingInteraction.networkTime += sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
					var sSapStatistics = this.getResponseHeader("sap-statistics");
					if (sSapStatistics) {
						this.pendingInteraction.sapStatistics.push({
							url: this.responseURL,
							statistics: sSapStatistics
						});
					}
				}
			}

			// creates mandatory FESR header string
			function createFESR(oInteraction) {
				return [
					format(ROOT_ID, "SAP_CHAR", 32), // root_context_id
					format(sFESRTransactionId, "SAP_CHAR", 32), // transaction_id
					format(oInteraction.navigation, "SAP_INT", 4), // client_navigation_time
					format(oInteraction.roundtrip, "SAP_INT", 4), // client_round_trip_time
					format(oInteraction.navigation + oInteraction.roundtrip + oInteraction.processing, "SAP_INT", 4), // end_to_end_time
					format(oInteraction.requests.length, "SAP_INT", 2), // network_round_trips
					format(CLIENT_ID, "SAP_CHAR", 40), // client_id
					format(oInteraction.networkTime, "SAP_INT", 4), // network_time
					format(oInteraction.requestTime, "SAP_INT", 4), // request_time
					"", // empty field
					format("SAP_UI5", "SAP_CHAR", 10) // client_type
				].join(",");
			}

			// creates optional FESR header string
			function createFESRopt(oInteraction) {
				return [
					format(oInteraction.component, "SAP_CHAR", 20), // application_name
					format(oInteraction.trigger, "SAP_CHAR", 20), // step_name
					"", "", // 2 empty fields
					format(oInteraction.bytesSent, "SAP_INT", 4), // client_data_sent
					format(oInteraction.bytesReceived, "SAP_INT", 4), // client_data_received
					"", "", // 2 empty fields
					format(oInteraction.processing, "SAP_INT", 4), // client_processing_time
					"", // compressed - blank if not compressed
					"", "", "", "", "", "", "", "", "" // 9 empty fields
				].join(",");
			}

			// pad zeros / blanks and cut from front to designated length
			function format(vField, sType, iLength) {
				if (!vField) {
					vField = "0000";
				} else if (sType === "SAP_INT") {
					vField = Math.round(vField).toString();
				}
				return vField.substr(-iLength, iLength);
			}


			// ***** Interaction detection heuristics & API ***** //
			jQuery.sap.interaction = {};

			/**
			 * @private
			 */
			jQuery.sap.interaction.notifyStepStart = function(oControl, bInitial) {
				if (oCurrentBrowserEvent || bInitial) {
					jQuery.sap.measure.startInteraction(bInitial ? "startup" : oCurrentBrowserEvent.type, oControl);

					var aInteraction = jQuery.sap.measure.getAllInteractionMeasurements();
					var oFinshedInteraction = aInteraction[aInteraction.length - 1];
					var oPI = jQuery.sap.measure.getPendingInteractionMeasurement();

					// update pending interaction infos
					oPendingInteraction = oPI ? oPI : oPendingInteraction;
					if (oFinshedInteraction && oFinshedInteraction.requests.length > 0) {
						// create FESR from completed interaction
						sFESR = createFESR(oFinshedInteraction);
						sFESRopt = createFESRopt(oFinshedInteraction);
					}
					oCurrentBrowserEvent = null;
				}
			};

			/**
			 * @private
			 */
			jQuery.sap.interaction.notifyStepEnd = function() {
				if (iInteractionStepTimer) {
					jQuery.sap.clearDelayedCall(iInteractionStepTimer);
				}
				iInteractionStepTimer = jQuery.sap.delayedCall(1, jQuery.sap.measure, "endInteraction");
			};

			/**
			 * @private
			 */
			jQuery.sap.interaction.notifyEventStart = function(oEvent, oElement) {
				oCurrentBrowserEvent = oEvent;
			};

			/**
			 * @private
			 */
			jQuery.sap.interaction.notifyEventEnd = function(oEvent, oElement) {
				if (oCurrentBrowserEvent) {
					// End interaction when a new potential interaction starts
					if (oCurrentBrowserEvent.type.match(/^(mousedown|touchstart|keydown)$/)) {
						jQuery.sap.measure.endInteraction(/*bForce*/true);
					}
				}
				oCurrentBrowserEvent = null;
			};

			// ***** FESR API, consumed by E2eTraceLib instead of former EppLib.js ***** //
			jQuery.sap.fesr = {};

			/**
			 * @private
			 */
			jQuery.sap.fesr.getCurrentTransactionId = function() {
				return sTransactionId;
			};

			/**
			 * @private
			 */
			jQuery.sap.fesr.getRootId = function() {
				return ROOT_ID;
			};


			// ***** Passport implementation, former EppLib.js ***** //
			jQuery.sap.passport = {};

			/**
			 * @private
			 */
			jQuery.sap.passport.startTracing = function() {
				bTraceActive = true;

				if (!bFesrActive) {
					fnXHRopen = window.XMLHttpRequest.prototype.open;
					// inject function in window.XMLHttpRequest.open for E2eTraceLib
					window.XMLHttpRequest.prototype.open = function() {
						fnXHRopen.apply(this, arguments);
						sTransactionId = createGUID();
						// set passport with Root Context ID, Transaction ID
						this.setRequestHeader("SAP-PASSPORT", passportHeader(iE2eTraceLevel, ROOT_ID, sTransactionId));
					};
				}
			};

			// old methods
			function getBytesFromString(s) {
				var bytes = [];
				for (var i = 0; i < s.length; ++i) {
					bytes.push(s.charCodeAt(i));
				}
				return bytes;
			}

			function createHexString(arr) {
				var result = "";

				for (var i = 0; i < arr.length; i++) {
					var str = arr[i].toString(16);
					str = Array(2 - str.length + 1).join("0") + str;
					result += str;
				}

				return result;
			}

			function passportHeader(trcLvl, RootID, TransID, component, action) {
				var SAPEPPTemplateLow = [
					0x2A, 0x54, 0x48, 0x2A, 0x03, 0x01, 0x30, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67,
					0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45,
					0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x55, 0x73, 0x65, 0x72, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
					0x20, 0x20, 0x20, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x20, 0x20, 0x20,
					0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x05, 0x53, 0x41, 0x50,
					0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67, 0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
					0x20, 0x20, 0x20, 0x20, 0x20, 0x34, 0x36, 0x33, 0x35, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x31, 0x31, 0x45, 0x45, 0x30, 0x41, 0x35, 0x44,
					0x32, 0x35, 0x30, 0x39, 0x39, 0x39, 0x43, 0x33, 0x39, 0x32, 0x42, 0x36, 0x38, 0x20, 0x20, 0x20, 0x00, 0x07, 0x46, 0x35, 0x00, 0x00, 0x00, 0x31,
					0x1E, 0xE0, 0xA5, 0xD2, 0x4E, 0xDB, 0xB2, 0xE4, 0x4B, 0x68, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xE2, 0x2A, 0x54, 0x48, 0x2A, 0x01, 0x00, 0x27, 0x00, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02,
					0x00, 0x01, 0x04, 0x00, 0x08, 0x58, 0x00, 0x02, 0x00, 0x02, 0x04, 0x00, 0x08, 0x30, 0x00, 0x02, 0x00, 0x03, 0x02, 0x00, 0x0B, 0x00, 0x00, 0x00,
					0x00, 0x2A, 0x54, 0x48, 0x2A, 0x01, 0x00, 0x23, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x01, 0x03, 0x00, 0x17, 0x00, 0xAB, 0xCD, 0xEF,
					0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0x2A, 0x54, 0x48, 0x2A
				];

				var RootIDPosLen = [
					372, 32
				];

				var TransIDPosLen = [
					149, 32
				];

				var CompNamePosLEn = [
					9, 32
				];

				var PreCompNamePosLEn = [
					117, 32
				];

				var actionOffset = [
					75, 40
				];

				var traceFlgsOffset = [
					7, 2
				];

				var prefix = getBytesFromString("SAP_E2E_TA_UI5LIB");
				prefix = prefix.concat(getBytesFromString(new Array(32 + 1 - prefix.length).join(' ')));

				if (component) {
					component = getBytesFromString(component.substr(-32,32));
					component = component.concat(getBytesFromString(new Array(32 + 1 - component.length).join(' ')));
					SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(component));
				} else {
					SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(prefix));
				}

				SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(prefix));
				SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, TransIDPosLen.concat(getBytesFromString(TransID)));
				SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, traceFlgsOffset.concat(trcLvl));

				if (action) {
					action = getBytesFromString(action.substr(-40,40));
					action = action.concat(getBytesFromString(new Array(40 + 1 - action.length).join(' ')));
					SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, actionOffset.concat(action));
				}

				var retVal = createHexString(SAPEPPTemplateLow).toUpperCase();

				return retVal.substring(0, RootIDPosLen[0]).concat(RootID) + retVal.substring(RootIDPosLen[0] + RootIDPosLen[1]);
			}

			/**
			 * @private
			 */
			jQuery.sap.passport.traceFlags = function(lvl) {
				switch (lvl) {
					case 'low':
						iE2eTraceLevel = [0x00, 0x00];
						break;
					case 'medium':
						iE2eTraceLevel = [0x89, 0x0A];
						break;
					case 'high':
						iE2eTraceLevel = [0x9F, 0x0D];
						break;
					default:
						iE2eTraceLevel = [];
						iE2eTraceLevel.push((parseInt(lvl, 16) & 0xFF00) / 256);
						iE2eTraceLevel.push((parseInt(lvl, 16) & 0xFF));
				}
				return iE2eTraceLevel;
			};

			function createGUID() {
				var S4 = function() {
					var temp = Math.floor(Math.random() * 0x10000 /* 65536 */ );
					return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
				};

				var S5 = function() {
					var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */ ) & 0x0fff) + 0x4000;
					return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
				};

				var S6 = function() {
					var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */ ) & 0x3fff) + 0x8000;
					return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
				};

				var retVal = (S4() + S4() + //"-" +
					S4() + //"-" +
					S5() + //"-" +
					S6() + //"-" +
					S4() + S4() + S4());

				return retVal.toUpperCase();
			}

			// set initial trace level (default)
			iE2eTraceLevel = jQuery.sap.passport.traceFlags();

			// start initial interaction
			jQuery.sap.interaction.notifyStepStart(jQuery, true);

			// *********** Include E2E-Trace Scripts *************
			if (bTraceActive) {
				jQuery.sap.require("sap.ui.core.support.trace.E2eTraceLib");
			}

		}());

		return jQuery;

	});
