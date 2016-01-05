/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Performance
sap.ui.define(['jquery.sap.global', 'sap/ui/core/support/Plugin',
				'sap/ui/core/support/controls/InteractionSlider',
				'sap/ui/core/support/controls/InteractionTree',
				'sap/ui/core/support/controls/TimelineOverview',
				'sap/m/MessageToast',
				'sap/ui/thirdparty/jszip',
				'sap/ui/core/util/File'
				],
	function(jQuery, Plugin, InteractionSlider, InteractionTree, TimelineOverview, MessageToast, JSZip, File) {
	"use strict";





		/**
		 * Creates an instance of sap.ui.core.support.plugins.Interaction.
		 * @class This class represents the plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * With this plugIn the performance measurements are displayed
		 *
		 * @abstract
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @constructor
		 * @private
		 * @alias sap.ui.core.support.plugins.Interaction
		 */
		var Interaction = Plugin.extend("sap.ui.core.support.plugins.Interaction", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportInteraction", "Interaction", oSupportStub]);

				this._oStub = oSupportStub;

				if (this.isToolPlugin()) {

					this._aEventIds = [this.getId() + "SetMeasurements",
									   this.getId() + "SetActive",
									   this.getId() + "Export",
									   this.getId() + "Import"
									];
					jQuery.sap.require("sap.ui.core.format.DateFormat");
					var pad0 = function(i, w) {
						return ("000" + String(i)).slice(-w);
					};
					this._fnFormatTime = function(fNow) {
						var oNow = new Date(fNow),
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
									   this.getId() + "Import"
									];

				}

			}
		});

		Interaction.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);
			if (this.isToolPlugin()) {
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
			rm.write("<div class=\"sapUiSupportToolbar\">");
			rm.write("<button id=\"" + this.getId() + "-refresh\" class=\"sapUiSupportBtn\">Refresh</button>");
			rm.write("<button id=\"" + this.getId() + "-clear\" class=\"sapUiSupportBtn\">Clear</button>");
	//		rm.write("<button id=\"" + this.getId() + "-start\" class=\"sapUiSupportBtn\">Start</button>");
	//		rm.write("<button id=\"" + this.getId() + "-end\" class=\"sapUiSupportBtn\">End</button>");
			rm.write("<input type=\"checkbox\" id=\"" + this.getId() + "-active\" class=\"sapUiSupportChB\">");
			rm.write("<label for=\"" + this.getId() + "-active\" class=\"sapUiSupportLabel\">Active</label>");
			rm.write("<button id=\"" + this.getId() + "-export\" class=\"sapUiSupportBtn\">Export</button>");
			rm.write("<button id=\"" + this.getId() + "-import\" class=\"sapUiSupportBtn\">Import</button>");
			rm.write("</div><div class=\"sapUiSupportInteractionCntnt\">");
			//rm.write("<table id=\"" + this.getId() + "-tab\" width=\"100%\">");
			//rm.write("<colgroup><col><col><col><col><col><col></colgroup>");
			//rm.write("<thead style=\"text-align:left;\"><tr>");
			//rm.write("<th>Component</th>");
			//rm.write("<th>Trigger</th>");
			//rm.write("<th>Type</th>");
			//rm.write("<th>Start</th>");
			//rm.write("<th>End</th>");
			//rm.write("<th>Duration</th>");
			//rm.write("<th>Requests</th>");
			//rm.write("</tr></thead>");
			//rm.write("<tbody id=\"" + this.getId() + "-tabBody\"></tbody>");
			//rm.write("</table></div>");
			rm.write("</div>");


			rm.write('<div class="sapUiPerformanceStatsDiv">');
			rm.write('<div class="sapUiPerformanceTimeline" style="height: 50px;"></div>');
			rm.write('<div class="sapUiPerformanceTop" style="height: 50px;">');
			rm.write('</div>');

			rm.write('<div class="sapUiPerformanceBottom">');
			rm.write('</div>');

			rm.write('</div>');

			rm.flush(this.$().get(0));
			rm.destroy();

			// render timeline
			rm = sap.ui.getCore().createRenderManager();
			this._oTimelineOverview.render(rm);
			rm.flush(this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline').get(0));
			rm.destroy();

			// render interaction slider
			rm = sap.ui.getCore().createRenderManager();
			this._oInteractionSlider.render(rm);
			rm.flush(this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTop').get(0));
			rm.destroy();
			this._oInteractionSlider._registerEventListeners();
			var that = this;
			jQuery(".sapUiPerformanceTop").on("InteractionSliderChange", {
			}, function( event, arg1, arg2 ) {
				that._oInteractionTree.setRange(arg1, arg2);
			});

			this.$("refresh").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Refresh");
			}, this));
			this.$("clear").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Clear");
			}, this));
	/*		this.$("start").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Start");
			}, this));
			this.$("end").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "End");
			}, this));
	*/
			this.$("export").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Export");
			}, this));
			this.$("active").click(jQuery.proxy(function(oEvent) {
				var bActive = false;
				if (this.$("active").prop("checked")) {
					bActive = true;
				}
				this._oStub.sendEvent(this.getId() + "Activate", {"active": bActive});
			}, this));

		}

		function initInApps(oSupportStub) {
			getPerformanceData.call(this);
		}

		function getPerformanceData(oSupportStub) {
			var bActive = jQuery.sap.interaction.getActive();
			var aMeasurements = [];

			if (bActive) {
				aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements();

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

			this._oStub.sendEvent(this.getId() + "SetMeasurements", { "measurements": aMeasurements });
			this._oStub.sendEvent(this.getId() + "SetActive", {"active": bActive});
		}


		/**
		 * Handler for sapUiSupportInteractionSetMeasurements event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionSetMeasurements = function(oEvent) {

			var aMeasurements = oEvent.getParameter("measurements");


			var oTimelineDiv = this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline').get(0);
			var rm = sap.ui.getCore().createRenderManager();
			this._oTimelineOverview.setInteractions(aMeasurements);
			this._oTimelineOverview.render(rm);
			rm.flush(oTimelineDiv);
			rm.destroy();

			this._oInteractionSlider._initSlider();
			//
			var oStatsDiv = this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceBottom').get(0);
			this._oInteractionTree.setInteractions(aMeasurements);
			this._oInteractionTree.renderAt(oStatsDiv);
		};

		/**
		 * Handler for sapUiSupportInteractionSetActive event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionSetActive = function(oEvent) {

			var bActive = oEvent.getParameter("active");
			var oCheckBox = this.$("active");

			if (bActive) {
				oCheckBox.attr("checked", "checked");
			} else {
				oCheckBox.removeAttr("checked");
			}

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

			jQuery.sap.measure.clearInteractionMeasurements();
			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements":[]});

		};

		/**
		 * Handler for sapUiSupportInteractionStart event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionStart = function(oEvent) {

			jQuery.sap.measure.start(this.getId() + "-perf","Measurement by support tool");

		};

		/**
		 * Handler for sapUiSupportInteractionEnd event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionEnd = function(oEvent) {

			jQuery.sap.measure.end(this.getId() + "-perf");

		};

		/**
		 * Handler for sapUiSupportInteractionActivate event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionActivate = function(oEvent) {

			var bActive = oEvent.getParameter("active");

			if (jQuery.sap.interaction.getActive() != bActive) {
				jQuery.sap.interaction.setActive(bActive);
			}

		};

		/**
		 * Handler for sapUiSupportInteractionExport event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Interaction.prototype.onsapUiSupportInteractionExport = function(oEvent) {

			var aMeasurements = jQuery.sap.measure.getAllInteractionMeasurements();
			if (aMeasurements.length > 0) {
				if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10) {
					MessageToast.show('Download action is not supported in Internet Explorer 9', {
						autoClose: true,
						duration: 3000
					});
					return;
				}

				var oZipFile = new JSZip();
				oZipFile.file("InteractionsSteps.json", JSON.stringify(aMeasurements));
				var oContent = oZipFile.generate({type:"blob"});

				this._openGeneratedFile(oContent);
			}

		};

		Interaction.prototype._openGeneratedFile = function(oContent) {
			sap.ui.core.util.File.save(oContent, "InteractionSteps", "zip", "application/zip");
		};




	return Interaction;

});
