/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Trace (Trace support plugin)
sap.ui.define([
	'sap/ui/core/support/Plugin',
	'sap/ui/core/format/DateFormat',
	"sap/base/Log",
	"sap/base/security/encodeXML"
],
	function(Plugin, DateFormat, Log, encodeXML) {
	"use strict";

		/**
		 * Creates an instance of sap.ui.core.support.plugins.Trace.
		 * @class This class represents the trace plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.Trace
		 */
		var Trace = Plugin.extend("sap.ui.core.support.plugins.Trace", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportTrace", "JavaScript Trace", oSupportStub]);

				this._aEventIds = this.runsAsToolPlugin() ? [this.getId() + "Entry"] : [];

				if (this.runsAsToolPlugin()) {
					this._aLogEntries = [];
					this._iLogLevel = Log.Level.ALL;
					this._oDateFormat = DateFormat.getDateTimeInstance();
				} else {
					var that = this;
					this._oldLogLevel = Log.getLevel();
					Log.setLevel(Log.Level.ALL);
					Log.addLogListener({
						onLogEntry: function(oLogEntry){
							if (that.isActive()) {
								oSupportStub.sendEvent(that.getId() + "Entry", {"entry": oLogEntry});
							}
						}
					});
				}
			}
		});

		/**
		 * Handler for sapUiSupportTraceEntry event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Trace.prototype.onsapUiSupportTraceEntry = function(oEvent){
			log(this, oEvent.getParameter("entry"));
		};


		Trace.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);
			if (!this.runsAsToolPlugin()) {
				return;
			}

			var that = this;

			var rm = sap.ui.getCore().createRenderManager();
			rm.openStart("div")
				.class("sapUiSupportToolbar")
				.openEnd();

			rm.openStart("button", this.getId() + "-clear")
				.class("sapUiSupportRoundedButton")
				.openEnd()
				.text("Clear")
				.close("button");

			rm.openStart("label")
				.class("sapUiSupportLabel")
				.openEnd()
				.text("Filter:")
				.close("label");

			rm.voidStart("input", this.getId() + "-filter")
				.class("sapUiSupportTxtFld")
				.attr("type", "text")
				.voidEnd();

			rm.openStart("label")
				.class("sapUiSupportLabel")
				.openEnd()
				.text("Log Level:")
				.close("label");

			rm.openStart("select", this.getId() + "-loglevel")
				.class("sapUiSupportTxtFld")
				.class("sapUiSupportSelect")
				.openEnd();

			rm.openStart("option")
				.attr("value", "0")
				.openEnd()
				.text("FATAL")
				.close("option");

			rm.openStart("option")
				.attr("value", "1")
				.openEnd()
				.text("ERROR")
				.close("option");

			rm.openStart("option")
				.attr("value", "2")
				.openEnd()
				.text("WARNING")
				.close("option");

			rm.openStart("option")
				.attr("value", "3")
				.openEnd()
				.text("INFO")
				.close("option");

			rm.openStart("option")
				.attr("value", "4")
				.openEnd()
				.text("DEBUG")
				.close("option");

			rm.openStart("option")
				.attr("value", "5")
				.openEnd()
				.text("TRACE")
				.close("option");

			rm.openStart("option")
				.attr("value", "6")
				.attr("selected", "")
				.openEnd()
				.text("ALL")
				.close("option");

			rm.close("select");
			rm.close("div");

			rm.openStart("div")
				.class("sapUiSupportTraceCntnt")
				.openEnd()
				.close("div");

			rm.flush(this.$().get(0));
			rm.destroy();

			this._fClearHandler = function(){
				log(that);
			};

			this._fLogLevelHandler = function(){
				that._iLogLevel = that.$("loglevel").val();
				var aResult = [];
				for (var i = 0; i < that._aLogEntries.length; i++) {
					if (applyFilter(that._filter, that._iLogLevel, that._aLogEntries[i])) {
						aResult.push(getEntryHTML(that, that._aLogEntries[i]));
					}
				}
				log(that, aResult.join(""));
			};

			this._fFilterHandler = function(){
				that._filter = that.$("filter").val();
				that._filter = that._filter ? that._filter.toLowerCase() : "";
				var aResult = [];
				for (var i = 0; i < that._aLogEntries.length; i++) {
					if (applyFilter(that._filter, that._iLogLevel, that._aLogEntries[i])) {
						aResult.push(getEntryHTML(that, that._aLogEntries[i]));
					}
				}
				log(that, aResult.join(""));
			};

			this.$("clear").on("click", this._fClearHandler);
			this.$("filter").on("change", this._fFilterHandler);
			this.$("loglevel").on("change", this._fLogLevelHandler);
		};

		Trace.prototype.exit = function(oSupportStub){
			if (this.runsAsToolPlugin()) {
				if (this._fClearHandler) {
					this.$("clear").off("click", this._fClearHandler);
					this._fClearHandler = null;
				}
				if (this._fFilterHandler) {
					this.$("filter").off("change", this._fFilterHandler);
					this._fFilterHandler = null;
				}
				if (this._fLogLevelHandler) {
					this.$("loglevel").off("change", this._fLogLevelHandler);
					this._fLogLevelHandler = null;
				}
			} else {
				Log.setLevel(this._oldLogLevel);
				this._oldLogLevel = null;
			}
			Plugin.prototype.exit.apply(this, arguments);
		};

		function log(oPlugin, oEntry){
			var oContentRef = oPlugin.$()[0].querySelector(".sapUiSupportTraceCntnt");
			if (!oEntry) {
				oContentRef.textContent = "";
				oPlugin._aLogEntries = [];
			} else if (typeof (oEntry) === "string") {
				oContentRef.textContent = encodeXML(oEntry);
				oContentRef.scrollTop = oContentRef.scrollHeight;
			} else {
				oEntry._levelInfo = getLevel(oEntry.level);
				if (applyFilter(oPlugin._filter, oPlugin._iLogLevel, oEntry)) {
					oContentRef.insertAdjacentHTML("beforeend", getEntryHTML(oPlugin, oEntry));
					oContentRef.scrollTop = oContentRef.scrollHeight;
				}
				oPlugin._aLogEntries.push(oEntry);
			}
		}

		function getEntryHTML(oPlugin, oEntry){
			var aLevelInfo = oEntry._levelInfo;
			var sResult = "<div class='sapUiSupportTraceEntry'><span class='sapUiSupportTraceEntryLevel sapUiSupportTraceEntryLevel_" + aLevelInfo[0] + "'>" + aLevelInfo[0] +
					"</span><span class='sapUiSupportTraceEntryTime'>" + oPlugin._oDateFormat.format(new Date(oEntry.timestamp)) +
					"</span><span class='sapUiSupportTraceEntryMessage'>" + encodeXML(oEntry.message || "") + "</div>";
			return sResult;
		}

		function applyFilter(sFilterValue, iLogLevel, oEntry){
			var aLevelInfo = oEntry._levelInfo;
			if (oEntry._levelInfo[1] <= iLogLevel) {
				if (sFilterValue) {
					var aParts = sFilterValue.split(" ");
					var bResult = true;
					for (var i = 0; i < aParts.length; i++) {
						bResult = bResult && oEntry.message.toLowerCase().indexOf(aParts[i]) >= 0 || aLevelInfo[0].toLowerCase().indexOf(aParts[i]) >= 0;
					}
					return bResult;
				}
				return true;
			}
			return false;
		}

		function getLevel(iLogLevel){
			switch (iLogLevel) {
				case Log.Level.FATAL:
					return ["FATAL", iLogLevel];
				case Log.Level.ERROR:
					return ["ERROR", iLogLevel];
				case Log.Level.WARNING:
					return ["WARNING", iLogLevel];
				case Log.Level.INFO:
					return ["INFO", iLogLevel];
				case Log.Level.DEBUG:
					return ["DEBUG", iLogLevel];
				case Log.Level.TRACE:
					return ["TRACE", iLogLevel];
				default:
					return ["unknown", iLogLevel];
			}
		}

	return Trace;

});