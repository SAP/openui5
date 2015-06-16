/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Performance
sap.ui.define(['jquery.sap.global', 'sap/ui/core/support/Plugin'],
	function(jQuery, Plugin) {
	"use strict";


	
	
	
		/**
		 * Creates an instance of sap.ui.core.support.plugins.Performance.
		 * @class This class represents the plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * With this plugIn the performance measurements are displayed
		 *
		 * @abstract
		 * @extends sap.ui.base.Object
		 * @version ${version}
		 * @constructor
		 * @private
		 * @alias sap.ui.core.support.plugins.Performance
		 */
		var Performance = Plugin.extend("sap.ui.core.support.plugins.Performance", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportPerf", "Performance", oSupportStub]);
	
				this._oStub = oSupportStub;
	
				if (this.isToolPlugin()) {
	
					this._aEventIds = [this.getId() + "SetMeasurements",
									   this.getId() + "SetActive"];
					jQuery.sap.require("sap.ui.core.format.DateFormat");
					this._oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm:ss '+' SSS"});
	
				} else {
	
					this._aEventIds = [this.getId() + "Refresh",
									   this.getId() + "Clear",
									   this.getId() + "Start",
									   this.getId() + "Stop",
									   this.getId() + "Activate"];
	
				}
	
			}
		});
	
		Performance.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);
			if (this.isToolPlugin()) {
				initInTools.call(this, oSupportStub);
			} else {
				initInApps.call(this, oSupportStub);
			}
		};
	
		Performance.prototype.exit = function(oSupportStub){
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
			rm.write("</div><div class=\"sapUiSupportPerfCntnt\">");
			rm.write("<table id=\"" + this.getId() + "-tab\" width=\"100%\">");
			rm.write("<colgroup><col><col><col><col><col><col></colgroup>");
			rm.write("<thead style=\"text-align:left;\"><tr>");
			rm.write("<th>ID</th>");
			rm.write("<th>Info</th>");
			rm.write("<th>Start</th>");
			rm.write("<th>End</th>");
			rm.write("<th>Time</th>");
			rm.write("<th>Duration</th>");
			rm.write("</tr></thead>");
			rm.write("<tbody id=\"" + this.getId() + "-tabBody\"></tbody>");
			rm.write("</table></div>");
			rm.flush(this.$().get(0));
			rm.destroy();
	
			this.$("refresh").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Refresh");
			}, this));
			this.$("clear").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Clear");
			}, this));
	/*		jQuery.sap.byId(this.getId() + "-start").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "Start");
			}, this));
			jQuery.sap.byId(this.getId() + "-end").click(jQuery.proxy(function(oEvent) {
				this._oStub.sendEvent(this.getId() + "End");
			}, this));
	*/
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
			var bActive = jQuery.sap.measure.getActive();
			var aMeasurements = [];
	
			if (bActive) {
				aMeasurements = jQuery.sap.measure.getAllMeasurements();
			}
			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements": aMeasurements});
			this._oStub.sendEvent(this.getId() + "SetActive", {"active": bActive});
		}
	
		/**
		 * Handler for sapUiSupportPerfSetMeasurements event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfSetMeasurements = function(oEvent) {
	
			var aMeasurements = oEvent.getParameter("measurements");
			var oTableBody = this.$("tabBody");
			var rm = sap.ui.getCore().createRenderManager();
	
			for ( var i = 0; i < aMeasurements.length; i++) {
				var oMeasurement = aMeasurements[i];
				rm.write("<tr>");
				rm.write("<td>" + oMeasurement.id + "</td>");
				rm.write("<td>" + oMeasurement.info + "</td>");
				rm.write("<td>" + this._oDateFormat.format(new Date(oMeasurement.start)) + "</td>");
				rm.write("<td>" + this._oDateFormat.format(new Date(oMeasurement.end)) + "</td>");
				rm.write("<td>" + oMeasurement.time + "</td>");
				rm.write("<td>" + oMeasurement.duration + "</td>");
				rm.write("</tr>");
			}
			rm.flush(oTableBody[0]);
			rm.destroy();
	
		};
	
		/**
		 * Handler for sapUiSupportPerfSetActive event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfSetActive = function(oEvent) {
	
			var bActive = oEvent.getParameter("active");
			var oCheckBox = this.$("active");
	
			if (bActive) {
				oCheckBox.attr("checked", "checked");
			} else {
				oCheckBox.removeAttr("checked");
			}
	
		};
	
		/**
		 * Handler for sapUiSupportPerfRefresh event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfRefresh = function(oEvent) {
	
			getPerformanceData.call(this);
	
		};
	
		/**
		 * Handler for sapUiSupportPerfClear event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfClear = function(oEvent) {
	
			jQuery.sap.measure.clear();
			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements":[]});
	
		};
	
		/**
		 * Handler for sapUiSupportPerfStart event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfStart = function(oEvent) {
	
			jQuery.sap.measure.start(this.getId() + "-perf","Measurement by support tool");
	
		};
	
		/**
		 * Handler for sapUiSupportPerfEnd event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfEnd = function(oEvent) {
	
			jQuery.sap.measure.end(this.getId() + "-perf");
	
		};
	
		/**
		 * Handler for sapUiSupportPerfActivate event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfActivate = function(oEvent) {
	
			var bActive = oEvent.getParameter("active");
	
			if (jQuery.sap.measure.getActive() != bActive) {
				jQuery.sap.measure.setActive(bActive);
			}
	
		};
	
	

	return Performance;

});
