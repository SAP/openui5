/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.support.plugins.TechInfo (TechInfo support plugin)
jQuery.sap.declare("sap.ui.core.support.plugins.TechInfo");

jQuery.sap.require("sap.ui.core.support.Plugin");
jQuery.sap.require("jquery.sap.encoder");
jQuery.sap.require("jquery.sap.script");

(function() {

	/**
	 * Creates an instance of sap.ui.core.support.plugins.TechInfo.
	 * @class This class represents the technical info plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
	 *
	 * @abstract
	 * @extends sap.ui.base.Object
	 * @version 1.9.0-SNAPSHOT
	 * @constructor
	 * @private
	 * @name sap.ui.core.support.plugins.TechInfo
	 */
	sap.ui.core.support.Plugin.extend("sap.ui.core.support.plugins.TechInfo", {
		constructor : function(oSupportStub) {
			sap.ui.core.support.Plugin.apply(this, ["sapUiSupportTechInfo", "Technical Information", oSupportStub]);
			this._aEventIds = this.isToolPlugin() ? [this.getId()+"Data"] : [this.getId()+"ToggleDebug", this.getId()+"Refresh"];
		}
	});
	
	
	/**
	 * Handler for sapUiSupportTechInfoData event
	 * 
	 * @param {sap.ui.base.Event} oEvent the event
	 * @private
	 */
	sap.ui.core.support.plugins.TechInfo.prototype.onsapUiSupportTechInfoData = function(oEvent){
		var that = this;
		var oData = oEvent.getParameter("data");
		oData.modules.sort();
		var html = ["<div class='sapUiSupportToolbar'>",
		            "<a href='javascript:void(0);' id='", that.getId(), "-Refresh' class='sapUiSupportLink'>Refresh</a>",
		            "<div><div class='sapUiSupportTechInfoCntnt'>",
		            "<table border='0' cellpadding='3'>"];
		line(html, true, true, "SAPUI5 Version", function(buffer){
			buffer.push(oData.version, " (build at ", oData.build, ", last change ", oData.change, ")");
		});
		line(html, true, true, "User Agent", function(buffer){
			buffer.push(oData.useragent, (oData.docmode ? ", Document Mode '" + oData.docmode + "'" : ""));
		});
		line(html, true, true, "Debug Sources", function(buffer){
			buffer.push((oData.debug ? "ON" : "OFF"), "<a href='javascript:void(0);' id='", that.getId(), "-tggleDbgSrc' class='sapUiSupportLink'>Toggle</a>");
		});
		line(html, true, true, "Application", oData.appurl);
		multiline(html, true, true, "Configuration (bootstrap)", oData.bootconfig);
		multiline(html, true, true, "Configuration (computed)", oData.config);
		line(html, true, true, "Loaded Modules", function(buffer){
			jQuery.each(oData.modules, function(i,v){
				if(v.indexOf("sap.ui.core.support") < 0){
					buffer.push("<span>", v, "</span>");
					if(i < oData.modules.length-1){
						buffer.push(", ");
					}
				}
			});
		});
		multiline(html, true, true, "URI Parameters", oData.uriparams);
		html.push("</table></div>");
		this.$().html(html.join(""));
		
		jQuery.sap.byId(this.getId()+"-tggleDbgSrc").bind("click", function(){
			sap.ui.core.support.Support.getStub().sendEvent(that.getId()+"ToggleDebug", {});
		});
		jQuery.sap.byId(this.getId()+"-Refresh").bind("click", function(){
			sap.ui.core.support.Support.getStub().sendEvent(that.getId()+"Refresh", {});
		});
	};
	
	
	/**
	 * Handler for sapUiSupportTechInfoToggleDebug event
	 * 
	 * @param {sap.ui.base.Event} oEvent the event
	 * @private
	 */
	sap.ui.core.support.plugins.TechInfo.prototype.onsapUiSupportTechInfoToggleDebug = function(oEvent){
		jQuery.sap.debug(!!!jQuery.sap.debug());
		sendData(this);
	};
	
	
	/**
	 * Handler for sapUiSupportTechInfoRefresh event
	 * 
	 * @param {sap.ui.base.Event} oEvent the event
	 * @private
	 */
	sap.ui.core.support.plugins.TechInfo.prototype.onsapUiSupportTechInfoRefresh = function(oEvent){
		sendData(this);
	};
	
	
	sap.ui.core.support.plugins.TechInfo.prototype.init = function(oSupportStub){
		sap.ui.core.support.Plugin.prototype.init.apply(this, arguments);
		if(!this.isToolPlugin()){
			sendData(this);
			return;
		}
		
		this.$().html("No Information available");
	};
	
	
	function sendData(oPlugin){
		var oCfg = sap.ui.getCore().getConfiguration();
		var oConfig = {
			"theme": oCfg.getTheme(),
			"language": oCfg.getLanguage(),
			"formatLocale": oCfg.getFormatLocale(),
			"accessibility": ""+oCfg.getAccessibility(),
			"animation": ""+oCfg.getAnimation(),
			"rtl": ""+oCfg.getRTL(),
			"debug": ""+oCfg.getDebug(),
			"inspect": ""+oCfg.getInspect(),
			"originInfo": ""+oCfg.getOriginInfo(),
			"noDuplicateIds": ""+oCfg.getNoDuplicateIds()
		};
		
		sap.ui.core.support.Support.getStub().sendEvent(oPlugin.getId()+"Data", {data: {
			"version": sap.ui.version,
			"build": sap.ui.buildinfo.buildtime,
			"change": sap.ui.buildinfo.lastchange,
			"useragent": navigator.userAgent,
			"docmode": document.documentMode ? document.documentMode : "",
			"debug": jQuery.sap.debug(),
			"bootconfig": window["sap-ui-config"] ? window["sap-ui-config"] : {},
			"config": oConfig,
			"modules": jQuery.sap.getAllDeclaredModules(),
			"uriparams": jQuery.sap.getUriParameters().mParams,
			"appurl": window.location.href
		}});
	};
	
	
	function line(buffer, right, border, label, content){
		buffer.push("<tr><td ", right ? "align='right' " : "", "valign='top'>", "<label class='sapUiSupportLabel'>", jQuery.sap.escapeHTML(label), "</label></td><td",
				border ? " class='sapUiSupportTechInfoBorder'" : "", ">");
		var ctnt = content;
		if(jQuery.isFunction(content)){
			ctnt = content(buffer) || "";
		}
		buffer.push(jQuery.sap.escapeHTML(ctnt));
		buffer.push("</td></tr>");
	};
	
	
	function multiline(buffer, right, border, label, content){
		line(buffer, right, border, label, function(buffer){
			buffer.push("<table border='0' cellspacing='0' cellpadding='3'>");
			jQuery.each(content, function(i,v){
				var val = "";
				if(v){
					if(typeof(v) === "string" || typeof(v) === "string" || typeof(v) === "boolean"){
						val = v;
					}else if((jQuery.isArray(v) || jQuery.isPlainObject(v)) && window.JSON){
						val = window.JSON.stringify(v);
					}
				}
				line(buffer, false, false, i, ""+val);
			});
			buffer.push("</table>");
		});
	};
	

}());