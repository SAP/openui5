/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Performance
sap.ui.define([
	'sap/ui/core/Configuration',
	'sap/ui/core/support/Plugin',
	'sap/ui/core/support/controls/InteractionSlider',
	'sap/ui/core/support/controls/InteractionTree',
	'sap/ui/core/support/controls/TimelineOverview',
	'sap/m/MessageToast',
	'sap/ui/thirdparty/jszip',
	'sap/ui/core/util/File',
	"sap/ui/performance/trace/Interaction",
	"sap/ui/performance/Measurement",
	"sap/ui/core/date/UI5Date"
	],
	function(
		Configuration,
		Plugin,
		InteractionSlider,
		InteractionTree,
		TimelineOverview,
		MessageToast,
		JSZip,
		File,
		TraceInteraction,
		Measurement,
		UI5Date
	) {
		"use strict";

		/**
		 * Creates an instance of sap.ui.core.support.plugins.Interaction.
		 * @class This class represents the plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * With this plugIn the performance measurements are displayed
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.Interaction
		 */
		var Interaction = Plugin.extend("sap.ui.core.support.plugins.Interaction", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportInteraction", "Interaction", oSupportStub]);

				this._oStub = oSupportStub;

				if (this.runsAsToolPlugin()) {

					this._aEventIds = [this.getId() + "SetMeasurements",
						this.getId() + "SetActive",
						this.getId() + "Export",
						this.getId() + "Import",
						this.getId() + "SetQueryString"
					];
					var pad0 = function(i, w) {
						return ("000" + String(i)).slice(-w);
					};
					this._fnFormatTime = function(fNow) {
						var oNow =  UI5Date.getInstance(fNow),
							iMicroSeconds = Math.floor((fNow - Math.floor(fNow)) * 1000);
						return pad0(oNow.getHours(),2) + ":" + pad0(oNow.getMinutes(),2) + ":" + pad0(oNow.getSeconds(),2) + "." + pad0(oNow.getMilliseconds(),3) + pad0(iMicroSeconds,3);
					};

					this._oInteractionSlider = new InteractionSlider();
					this._oInteractionTree = new InteractionTree({});
					this._oTimelineOverview = new TimelineOverview();

				} else {

					this._aEventIds = [this.getId() + "Refresh",
						this.getId() + "Clear",
						this.getId() + "Start",
						this.getId() + "Stop",
						this.getId() + "Activate",
						this.getId() + "Export",
						this.getId() + "Import",
						this.getId() + "SetQueryString"
					];

				}

			}
		});

		Interaction.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);

			if (this.runsAsToolPlugin()) {
				initInTools.call(this, oSupportStub);
			} else {
				initInApps.call(this, oSupportStub);
			}
		};

		Interaction.prototype.exit = function(oSupportStub){
			Plugin.prototype.exit.apply(this, arguments);
		};


		function initInTools(oSupportStub) {

			var rm = sap.ui.getCore().createRenderManager();
			rm.openStart("div").class("sapUiSupportToolbar").openEnd();
				rm.openStart("button", this.getId() + "-record").class("sapUiSupportIntToggleRecordingBtn").openEnd().close("button");
				rm.openStart("label").class("sapUiSupportIntODataLbl").openEnd();
					rm.voidStart("input", this.getId() + "-odata").attr("type", "checkbox").voidEnd();
					rm.text("Enable OData Statistics");
				rm.close("label");
				rm.openStart("div").class("sapUiSupportIntFupInputMask").openEnd();
					rm.voidStart("input", this.getId() + "-fileImport").attr("tabindex", "-1").attr("size", "1").attr("accept", "application/zip").attr("type", "file").voidEnd();
				rm.close("div");
				rm.openStart("button", this.getId() + "-import").class("sapUiSupportIntImportExportBtn").class("sapUiSupportIntImportBtn").class("sapUiSupportRoundedButton").openEnd().text("Import").close("button");
				rm.openStart("button", this.getId() + "-export").class("sapUiSupportIntImportExportBtn").class("sapUiSupportIntExportBtn").class("sapUiSupportRoundedButton").class("sapUiSupportIntHidden").openEnd().text("Export").close("button");
				rm.openStart("span", this.getId() + "-info").class("sapUiSupportIntRecordingInfo").openEnd().close("span");
			rm.close("div");

			rm.openStart("div").class("sapUiSupportInteractionCntnt").openEnd();
			rm.close("div");

			rm.openStart("div").class("sapUiPerformanceStatsDiv").class("sapUiSupportIntHidden").openEnd();
				rm.openStart("div").class("sapUiPerformanceTimeline").openEnd().close("div");
				rm.openStart("div").class("sapUiPerformanceTop").openEnd();
				rm.close("div");

				rm.openStart("div").class("sapUiPerformanceBottom").openEnd();
				rm.close("div");

			rm.close("div");

			rm.flush(this.dom());
			rm.destroy();

			// render timeline
			rm = sap.ui.getCore().createRenderManager();
			this._oTimelineOverview.render(rm);
			rm.flush(this.dom('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline'));
			rm.destroy();

			// render interaction slider
			rm = sap.ui.getCore().createRenderManager();
			this._oInteractionSlider.render(rm);
			rm.flush(this.dom('.sapUiPerformanceStatsDiv .sapUiPerformanceTop'));
			rm.destroy();
			this._oInteractionSlider._registerEventListeners();
			this.$().find(".sapUiPerformanceTop").on("InteractionSliderChange", {}, function( event, arg1, arg2 ) {
				this._oInteractionTree.setRange(arg1, arg2);
			}.bind(this));

			this.dom("export").addEventListener("click", function(oEvent) {
				//this._oStub.sendEvent(this.getId() + "Export");
				this.onsapUiSupportInteractionExport();
			}.bind(this));
			this.dom("fileImport").addEventListener("change", function(oEvent) {
				this.onsapUiSupportInteractionImport();
				//this._oStub.sendEvent(this.getId() + "Import");
			}.bind(this));
			this.dom("odata").checked = this._bODATA_Stats_On;
			this.dom("odata").addEventListener("click", function(oEvent) {
				this._bODATA_Stats_On = !this._bODATA_Stats_On;
				this.confirmReload("sap-statistics", this._bODATA_Stats_On);
			}.bind(this));


			this.dom('record').dataset.state = (!this._bFesrActive) ? 'Start recording' : 'Stop recording';
			this.dom('record').addEventListener("click", function(oEvent) {
				var oRecordButton = this.dom('record');
				if (oRecordButton.dataset.state === 'Stop recording') {
					this._oStub.sendEvent(this.getId() + "Refresh");
					this._oStub.sendEvent(this.getId() + "Activate", {"active": false});
					oRecordButton.dataset.state = 'Start recording';
					this._showPerfData();
				} else if (this.dom('record').dataset.state === 'Start recording') {
					this._hidePerfData();
					this._oStub.sendEvent(this.getId() + "Clear");
					this._oStub.sendEvent(this.getId() + "Activate", {"active": true});
					oRecordButton.dataset.state = 'Stop recording';
				}
			}.bind(this));

		}

		function initInApps(oSupportStub) {
			var _bFesrActive = /sap-ui-xx-fesr=(true|x|X)/.test(window.location.search);
			var _bODATA_Stats_On = Configuration.getStatisticsEnabled();

			this._oStub.sendEvent(this.getId() + "SetQueryString", {"queryString": { bFesrActive: _bFesrActive,
				bODATA_Stats_On: _bODATA_Stats_On}});
			getPerformanceData.call(this);
		}

		function getPerformanceData(oSupportStub, jsonData) {
			var bActive = TraceInteraction.getActive() || this._bFesrActive;
			var aMeasurements = [];

			if (bActive || jsonData) {
				aMeasurements = jsonData || TraceInteraction.getAll(/*bFinalize=*/true);

				var fetchStart = window.performance.timing.fetchStart;

				for (var i = 0; i < aMeasurements.length; i++) {
					var measurement = aMeasurements[i];

					for (var j = 0; j < measurement.requests.length; j++) {

						var request = measurement.requests[j];

						measurement.requests[j] = {
							connectEnd: request.connectEnd,
							connectStart: request.connectStart,
							domainLookupEnd: request.domainLookupEnd,
							domainLookupStart: request.domainLookupStart,
							duration: request.duration,
							entryType: request.entryType,
							fetchStart: request.fetchStart,
							initiatorType: request.initiatorType,
							name: request.name,
							redirectEnd: request.redirectEnd,
							redirectStart: request.redirectStart,
							requestStart: request.requestStart,
							responseEnd: request.responseEnd,
							responseStart: request.responseStart,
							secureConnectionStart: request.secureConnectionStart,
							startTime: request.startTime,
							workerStart: request.workerStart,
							fetchStartOffset: fetchStart
						};

					}
				}

			}

			//this._oStub.dom('record').dataset.state = (bActive) ? 'Stop recording' : 'Start recording';
			this._oStub.sendEvent(this.getId() + "SetMeasurements", { "measurements": aMeasurements });
			this._oStub.sendEvent(this.getId() + "SetActive", {"active": bActive});
		}

		/**
		 * Handler for sapUiSupportInteractionSetQueryString event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionSetQueryString = function(oEvent) {

			var oParam = oEvent.getParameter("queryString");
			this._bFesrActive = oParam.bFesrActive;
			this._bODATA_Stats_On = oParam.bODATA_Stats_On;
			this.dom("odata").checked = this._bODATA_Stats_On;
			this.dom('record').dataset.state = (!this._bFesrActive) ? 'Start recording' : 'Stop recording';
		};

		/**
		 * Handler for sapUiSupportInteractionSetMeasurements event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionSetMeasurements = function(oEvent) {

			this._setMeasurementsData(oEvent.getParameter("measurements"));
		};

		/**
		 * Handler for sapUiSupportInteractionSetActive event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionSetActive = function(oEvent) {

		};

		/**
		 * Handler for sapUiSupportInteractionRefresh event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionRefresh = function(oEvent) {

			getPerformanceData.call(this);

		};

		/**
		 * Handler for sapUiSupportInteractionClear event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionClear = function(oEvent) {

			TraceInteraction.clear();
			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements":[]});

		};

		/**
		 * Handler for sapUiSupportInteractionStart event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionStart = function(oEvent) {

			Measurement.start(this.getId() + "-perf", "Measurement by support tool");

		};

		/**
		 * Handler for sapUiSupportInteractionEnd event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionEnd = function(oEvent) {

			//jQuery.sap.measure.end(this.getId() + "-perf");
			Interaction.end(/* bForce= */true);
		};

		/**
		 * Handler for sapUiSupportInteractionActivate event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionActivate = function(oEvent) {

			var bActive = oEvent.getParameter("active");

			if (TraceInteraction.getActive() != bActive) {
				TraceInteraction.setActive(bActive);
			}

		};

		/**
		 * Handler for sapUiSupportInteractionExport event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionExport = function(oEvent) {

			var aMeasurements = this.measurements || [];
			if (aMeasurements.length > 0) {

				var oZipFile = new JSZip();

				oZipFile.file("InteractionsSteps.json", JSON.stringify(aMeasurements).replace(/,"isExpanded":true/g, ''));
				var oContent = oZipFile.generate({type:"blob"});

				this._openGeneratedFile(oContent);
			}

		};

		/**
		 * Handler for sapUiSupportInteractionImport event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionImport = function(oEvent) {
			var aFiles = this.dom("fileImport").files;

			if (aFiles.length === 0) {
				MessageToast.show('Select a file for import first!', {
					autoClose: true,
					duration: 3000
				});
				return;
			}
			if (!window.FileReader) {
				MessageToast.show('Use a modern browser which supports FileReader!', {
					autoClose: true,
					duration: 3000
				});
				return;
			}

			var reader = new window.FileReader(),
				f = aFiles[0],
				that = this;

			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
					var oZipFile = new JSZip(e.target.result);
					var jsonData = oZipFile.files["InteractionsSteps.json"] && oZipFile.files["InteractionsSteps.json"].asText();
					if (jsonData) {
						//that._oStub.sendEvent(that.getId() + "SetMeasurements", { "measurements": JSON.parse(jsonData) });
						that._setMeasurementsData(JSON.parse(jsonData.replace(/,"isExpanded":true/g, '')));
					} else {
						MessageToast.show('Imported data does not contain interaction measures', {
							autoClose: true,
							duration: 3000
						});
					}
				};
			})(f);

			reader.readAsArrayBuffer(f);

		};

		Interaction.prototype._openGeneratedFile = function(oContent) {
			File.save(oContent, "InteractionSteps", "zip", "application/zip");
		};

		Interaction.prototype._setMeasurementsData = function(aMeasurements) {
			var requestsCount = 0,
				margin = 100,
				fnFixRequestSequence = function(aData) {
					var fnFindRequestPosition = function(aRequests, requestToInsert) {
						var pos = 0;
						if (aRequests.length === 0) {
							return pos;
						}
						for (var i = aRequests.length - 1; i >= 0; i--) {
							if (aRequests[i].startTime < requestToInsert.startTime) {
								pos = i + 1;
								break;
							}
						}
						return pos;
					},
					fnFindODataTrace = function(aODataTraces, startTime) {
						return aODataTraces.filter(function(ODataTrace) {
							return ODataTrace.timing.startTime === startTime;
						});
					},
					fnFindMeasurePosition = function(aMeasures, requestToMove) {
						var pos = 0;
						if (aMeasures.length === 0) {
							return pos;
						}
						for (var i = aMeasures.length - 1; i >= 0; i--) {
							if (aMeasures[i].start < (requestToMove.fetchStartOffset + requestToMove.startTime)) {
								pos = i ;
								break;
							}
						}
						return pos;
					},
					insertToPos = 0;

					aData.forEach(function(measurement, measurementIndex, measurements) {
						var requests = measurement.requests;

						for (var i = requests.length - 1; i >= 0; i--) {
							var request = requests[i];
							// move requests which are started before the interaction, to the right interaction
							if (measurementIndex > 0 && measurement.start - margin > (request.fetchStartOffset + request.startTime)) {
								var insertInMeasurement = fnFindMeasurePosition(measurements, request);
								var prevMeasureRequests = measurements[insertInMeasurement].requests;
								// copy the request to the right measurement
								insertToPos = fnFindRequestPosition(prevMeasureRequests, request);
								prevMeasureRequests.splice(insertToPos, 0, request);
								// remove the request from the current measurement
								requests.splice(i, 1);
								//move OData statistics if exists
								var aODataTrace = fnFindODataTrace(measurement.sapStatistics, request.startTime);
								if (aODataTrace.length > 0) {
									measurements[insertInMeasurement].sapStatistics = measurements[insertInMeasurement].sapStatistics.concat(aODataTrace);
								}
							}
						}

					});
				};

			fnFixRequestSequence(aMeasurements);

			this.measurements = aMeasurements;
			for (var i = 0; i < aMeasurements.length; i++) {
				requestsCount += aMeasurements[i].requests.length;
			}

			if (aMeasurements.length > 0) {
				this._showPerfData();
				this.dom('info').textContent = "Total " + requestsCount + " Requests in " + aMeasurements.length + " Interactions";
			} else {
				this._hidePerfData();
				this.dom('info').textContent = "";
			}

			var oTimelineDiv = this.dom('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline');
			var rm = sap.ui.getCore().createRenderManager();
			this._oTimelineOverview.setInteractions(aMeasurements);
			this._oTimelineOverview.render(rm);
			rm.flush(oTimelineDiv);
			rm.destroy();

			this._oInteractionSlider._initSlider();
			this._oInteractionSlider.setDuration(aMeasurements);
			//
			var oStatsDiv = this.dom('.sapUiPerformanceStatsDiv .sapUiPerformanceBottom');
			this._oInteractionTree.setInteractions(aMeasurements);
			this._oInteractionTree.renderAt(oStatsDiv);
		};

		Interaction.prototype._showPerfData = function() {
			this.dom(".sapUiPerformanceStatsDiv").classList.remove("sapUiSupportIntHidden");
			this.dom("export").classList.remove("sapUiSupportIntHidden");
		};

		Interaction.prototype._hidePerfData = function() {
			this.dom(".sapUiPerformanceStatsDiv").classList.add("sapUiSupportIntHidden");
			this.dom("export").classList.add("sapUiSupportIntHidden");
		};

		return Interaction;
	});