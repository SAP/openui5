/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.TechInfo (TechInfo support plugin)
sap.ui.define([
	'sap/base/Log',
	'../Plugin',
	'../Support',
	'../ToolsAPI',
	"sap/base/security/encodeXML"
],
	function(Log, Plugin, Support, ToolsAPI, encodeXML) {
	"use strict";


		/**
		 * Creates an instance of sap.ui.core.support.plugins.TechInfo.
		 * @class This class represents the technical info plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.TechInfo
		 */
		var TechInfo = Plugin.extend("sap.ui.core.support.plugins.TechInfo", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportTechInfo", "Technical Information", oSupportStub]);
				this._aEventIds = this.runsAsToolPlugin() ? [
					this.getId() + "Data",
					this.getId() + "FinishedE2ETrace"
				] : [
					this.getId() + "ToggleDebug",
					this.getId() + "SetReboot",
					this.getId() + "Refresh",
					this.getId() + "StartE2ETrace",
					this.getId() + "ToggleStatistics"
				];

				if (this.runsAsToolPlugin()) {
					this.e2eLogLevel = "medium";
					this.e2eTraceStarted = false;
				}

			}
		});

		/**
		 * Handler for sapUiSupportTechInfoData event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoData = function(oEvent){
			var that = this;
			var oData = oEvent.getParameter("data");
			oData.modules.sort();
			this.e2eTraceStarted = oData["e2e-trace"].isStarted;
			var html = ["<div class='sapUiSupportToolbar'>",
						"<button id='", that.getId(), "-Refresh' class='sapUiSupportRoundedButton'>Refresh</button>",
						"<div><div class='sapUiSupportTechInfoCntnt'>",
						"<table border='0' cellpadding='3' class='infoTable'>"];

			// version information
			function formatBuildInfo(timestamp, scmRevision) {
				var info = [];
				if ( timestamp ) {
					var match = /^(\d{4})(\d{2})(\d{2})-?(\d{2})(\d{2})$/.exec(timestamp);
					if ( match ) {
						timestamp = match[1] + '-' + match[2] + '-' + match[3] + 'T' + match[4] + ":" + match[5];
					}
					info.push("built at " + encode(timestamp));
				}
				if ( scmRevision ) {
					info.push("last change " + encode(scmRevision));
				}
				return info.length === 0 ? "" : " (" + info.join(", ") + ")";
			}
			var sProductName = "SAPUI5";
			var sVersionInfoEncoded = "not available";
			try {
				var oVersionInfo = sap.ui.getVersionInfo();
				sProductName = oVersionInfo.name;
				sVersionInfoEncoded =
					"<a href='" + sap.ui.resource("", "sap-ui-version.json") + "' target='_blank' class='sapUiSupportLink' title='Open Version Info'>" + encode(oVersionInfo.version) + "</a>" +
					formatBuildInfo(oVersionInfo.buildTimestamp, oVersionInfo.scmRevision);
			} catch (ex) {
				// ignore
			}
			line(html, true, true, sProductName, function(buffer) {
				buffer.push(sVersionInfoEncoded);
			});
			if ( !/openui5/i.test(sProductName) ) {
				line(html, true, true, "OpenUI5 Version", function(buffer){
					buffer.push( encode(oData.version) + formatBuildInfo(oData.build, oData.change) );
				});
			}
			line(html, true, true, "Loaded jQuery Version", function(buffer){
				return oData.jquery;
			});
			line(html, true, true, "User Agent", function(buffer){
				return oData.useragent + (oData.docmode ? ", Document Mode '" + oData.docmode + "'" : "");
			});
			line(html, true, true, "Debug Sources", function(buffer){
				buffer.push((oData.debug ? "ON" : "OFF"), "<a href='#' id='", that.getId(), "-tggleDbgSrc' class='sapUiSupportLink'>Toggle</a>");
			});
			line(html, true, true, "Application", oData.appurl);
			multiline(html, true, true, "Configuration (bootstrap)", oData.bootconfig);
			multiline(html, true, true, "Configuration (computed)", oData.config);
			if (!jQuery.isEmptyObject(oData.libraries)) {
				multiline(html, true, true, "Libraries", oData.libraries);
			}
			multiline(html, true, true, "Loaded Libraries", oData.loadedLibraries);
			line(html, true, true, "Loaded Modules", function(buffer){
				jQuery.each(oData.modules, function(i,v){
					if (v.indexOf("sap.ui.core.support") < 0) {
						buffer.push("<span>", encode(v), "</span>");
						if (i < oData.modules.length - 1) {
							buffer.push(", ");
						}
					}
				});
			});
			multiline(html, true, true, "URI Parameters", oData.uriparams);

			line(html, true, true, "E2E Trace", function(buffer) {
				buffer.push("<label class='sapUiSupportLabel'>Trace Level:</label>",
					"<select id='", that.getId(), "-logLevelE2ETrace' class='sapUiSupportTxtFld sapUiSupportSelect'>",
						"<option value='low'" + (that.e2eLogLevel === 'low' ? " selected" : "") + ">LOW</option>",
						"<option value='medium'" + (that.e2eLogLevel === 'medium' ? " selected" : "") + ">MEDIUM</option>",
						"<option value='high'" + (that.e2eLogLevel === 'hight' ? " selected" : "") + ">HIGH</option>",
					"</select>"
				);
				buffer.push("<button id='" + that.getId() + "-startE2ETrace' class='sapUiSupportRoundedButton " +
						(oData["e2e-trace"].isStarted ? " active" : "") + "' style='margin-left: 10px;'>" + (oData["e2e-trace"].isStarted ? "Running..." : "Start") + "</button>");
				buffer.push("<div style='margin-top:5px'>");
				buffer.push("<label class='sapUiSupportLabel'>XML Output:</label>");
				buffer.push("<textarea id='" + that.getId() + "-outputE2ETrace' style='width:100%;height:50px;margin-top:5px;resize:none;box-sizing:border-box'></textarea>");
				buffer.push("</div>");
			});

			html.push("</table></div>");
			this.$().html(html.join(""));

			this.$("tggleDbgSrc").bind("click", function(oEvent) {
				oEvent.preventDefault();
				Support.getStub().sendEvent(that.getId() + "ToggleDebug", {});
			});
			this.$("Refresh").bind("click", function(oEvent) {
				oEvent.preventDefault();
				Support.getStub().sendEvent(that.getId() + "Refresh", {});
			});

			this.$("outputE2ETrace").bind("click", function() {
				this.focus();
				this.select();
			});

			this.$("startE2ETrace").bind("click", function() {
				if (!that.e2eTraceStarted) {
					that.e2eLogLevel = that.$("logLevelE2ETrace").val();
					that.$("startE2ETrace").addClass("active").text("Running...");
					that.$("outputE2ETrace").text("");
					Support.getStub().sendEvent(that.getId() + "StartE2ETrace", {
						level: that.e2eLogLevel
					});
					that.e2eTraceStarted = true;
				}
			});

			document.title = "UI5 Diagnostics - " + oData.title;
		};


		/**
		 * Handler for sapUiSupportTechInfoToggleDebug event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoToggleDebug = function(oEvent){
			jQuery.sap.debug(!jQuery.sap.debug());
			sendData(this);
		};

		/**
		 * Handler for sapUiSupportTechInfoSetReboot event, which sets the URL from which UI5 should be loaded on next restart of the application
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoSetReboot = function(oEvent) {
			jQuery.sap.setReboot(oEvent.getParameter("rebootUrl"));
		};

		/**
		 * Handler for sapUiSupportTechInfoStartE2ETrace event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoStartE2ETrace = function(oEvent) {

			var that = this,
				sLevel = oEvent.getParameter("level");

			sap.ui.require(['sap/ui/core/support/trace/E2eTraceLib'], function(E2eTraceLib) {
				E2eTraceLib.start(sLevel, function(traceXml) {
					Support.getStub().sendEvent(that.getId() + "FinishedE2ETrace", {
						trace: traceXml
					});
				});
			}, function (oError) {
				Log.error("Could not load module 'sap/ui/testrecorder/Bootstrap':", oError);
			});

		};

		/**
		 * Handler for sapUiSupportTechInfoFinishedE2ETrace event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoFinishedE2ETrace = function(oEvent) {
			this.$("startE2ETrace").removeClass("active").text("Start");
			this.$("outputE2ETrace").text(oEvent.getParameter("trace"));
			this.e2eTraceStarted = false;
		};

		/**
		 * Handler for sapUiSupportTechInfoRefresh event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoRefresh = function(oEvent){
			sendData(this);
		};

		/**
		 * Handler for sapUiSupportTechInfoToggleStatistics event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		TechInfo.prototype.onsapUiSupportTechInfoToggleStatistics = function(oEvent){
			jQuery.sap.statistics(!jQuery.sap.statistics());
			sendData(this);
		};

		TechInfo.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);
			if (!this.runsAsToolPlugin()) {
				sendData(this);
				return;
			}

			this.$().html("No Information available");
		};


		function sendData(oPlugin){
			var oCfg = ToolsAPI.getFrameworkInformation();
			var oData = {
				version: oCfg.commonInformation.version,
				build: oCfg.commonInformation.buildTime,
				change: oCfg.commonInformation.lastChange,
				jquery: oCfg.commonInformation.jquery,
				useragent: oCfg.commonInformation.userAgent,
				docmode: oCfg.commonInformation.documentMode,
				debug: oCfg.commonInformation.debugMode,
				bootconfig: oCfg.configurationBootstrap,
				config:  oCfg.configurationComputed,
				libraries: oCfg.libraries,
				loadedLibraries: oCfg.loadedLibraries,
				modules: oCfg.loadedModules,
				uriparams: oCfg.URLParameters,
				appurl: oCfg.commonInformation.applicationHREF,
				title: oCfg.commonInformation.documentTitle,
				statistics: oCfg.commonInformation.statistics
			};

			var E2eTraceLib = sap.ui.require('sap/ui/core/support/trace/E2eTraceLib');
			oData["e2e-trace"] = {
				isStarted: E2eTraceLib ? E2eTraceLib.isStarted() : false
			};

			Support.getStub().sendEvent(oPlugin.getId() + "Data", { data: oData });
		}


		function encode(any) {
			return any == null ? "" : encodeXML(String(any));
		}

		function line(buffer, right, border, label, content){
			buffer.push("<tr><td ", right ? "align='right' " : "", "valign='top'>", "<label class='sapUiSupportLabel'>", encode(label), "</label></td><td",
					border ? " class='sapUiSupportTechInfoBorder'" : "", ">");
			var ctnt = content;
			if ( typeof content === 'function' ) {
				ctnt = content(buffer);
			}
			buffer.push(encode(ctnt));
			buffer.push("</td></tr>");
		}


		function multiline(buffer, right, border, label, content){
			line(buffer, right, border, label, function(buffer){
				buffer.push("<table border='0' cellspacing='0' cellpadding='3' style='width: 100%'>");
				jQuery.each(content, function(i,v){
					var val = "";
					if (v) {
						if (typeof (v) === "string" || typeof (v) === "string" || typeof (v) === "boolean") {
							val = v;
						} else if ((Array.isArray(v) || jQuery.isPlainObject(v)) && window.JSON) {
							val = window.JSON.stringify(v);
						}
					}
					line(buffer, false, false, i, "" + val);
				});
				buffer.push("</table>");
			});
		}

	return TechInfo;

});