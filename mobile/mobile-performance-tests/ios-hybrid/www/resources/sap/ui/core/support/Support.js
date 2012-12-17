/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the basic UI5 support functionality
jQuery.sap.declare("sap.ui.core.support.Support");

jQuery.sap.require("sap.ui.base.EventProvider");
jQuery.sap.require("sap.ui.core.support.Plugin");
jQuery.sap.require("jquery.sap.dom");
jQuery.sap.require("jquery.sap.script");
jQuery.sap.require("jquery.sap.encoder");

(function() {
	
	/**
	 * Constructor for sap.ui.core.support.Support - must not be used: To get the singleton instance, use
	 * sap.ui.core.support.Support.getStub.
	 * 
	 * @class This class provides the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @version 1.9.1-SNAPSHOT
	 * @constructor
	 * @private
	 * @name sap.ui.core.support.Support
	 */
	sap.ui.base.EventProvider.extend("sap.ui.core.support.Support", {
		constructor: function(sType) {
			if(!_bPrivate){
				throw Error();
			}
			sap.ui.base.EventProvider.apply(this);
			
			var that = this;
			
			this._sType = sType;
			this._sLocalOrigin = window.location.protocol + "//" + window.location.host;
			
			var fHandler = jQuery.proxy(this._receiveEvent, this);
			if(window.addEventListener){
				window.addEventListener("message", fHandler, false);
			}else{
				window.attachEvent("onmessage", fHandler);
			}
			
			switch(sType) {
				case mTypes.APPLICATION:
					this._isOpen = false;
					this.attachEvent(mEvents.TEAR_DOWN, function(oEvent){
						that._isOpen = false;
						if(jQuery.browser.msie){
							jQuery.sap.byId(ID_SUPPORT_AREA+"-frame").remove();
						}else{
							close(that._oRemoteWindow);
						}
						that._oRemoteWindow = null;
						exitPlugins(that, false);
					});
					this.attachEvent(mEvents.SETUP, function(oEvent){
						that._isOpen = true;
						initPlugins(that, false);
					});
					break;
				case mTypes.IFRAME:
					this._oRemoteWindow = window.parent;
					this._sRemoteOrigin = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");
					this.openSupportTool();
					jQuery(window).bind("unload", function(oEvent){
						close(that._oOpenedWindow);
					});
					break;
				case mTypes.TOOL:
					this._oRemoteWindow = window.opener;
					this._sRemoteOrigin = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");
					jQuery(window).bind("unload", function(oEvent){
						that.sendEvent(mEvents.TEAR_DOWN);
						exitPlugins(that, true);
					});
					jQuery(function(){
						initPlugins(that, true);
						that.sendEvent(mEvents.SETUP);
					});
					break;
			}
			
		}
	});
	
	
	var mTypes = {
		APPLICATION: "APPLICATION", //Application stub -> the "standard one"
		IFRAME: "IFRAME", //Used by the Internet Explorer iFrame bridge only
		TOOL: "TOOL" //Used by the support tool only
	};
	
	
	var mEvents = {
		SETUP: "sapUiSupportSetup", //Event when support tool is opened
		TEAR_DOWN: "sapUiSupportTeardown" //Event when support tool is closed
	};
	
	
	/**
	 * Enumeration providing the possible support stub types.
	 *
	 * @static
	 * @namespace
	 * @protected
	 */
	sap.ui.core.support.Support.StubType = mTypes;

	
	/**
	 * Enumeration providing the predefined support event ids.
	 *
	 * @static
	 * @namespace
	 * @protected
	 */
	sap.ui.core.support.Support.EventType = mEvents;
	
	/**
	 * Support plugin registration
	 * @private
	 */
	sap.ui.core.support.Support.TOOL_SIDE_PLUGINS = ["sap.ui.core.support.plugins.TechInfo", "sap.ui.core.support.plugins.ControlTree", "sap.ui.core.support.plugins.Trace", "sap.ui.core.support.plugins.Performance", "sap.ui.core.support.plugins.MessageTest"];
	sap.ui.core.support.Support.APP_SIDE_PLUGINS = ["sap.ui.core.support.plugins.TechInfo", "sap.ui.core.support.plugins.ControlTree", "sap.ui.core.support.plugins.Trace", "sap.ui.core.support.plugins.Performance", "sap.ui.core.support.plugins.Selector"];
		
	
	/**
	 * Returns the support stub instance. If an instance was not yet available a new one is
	 * with the given type is created.
	 * 
	 * This function is internal and must not be called by an application.
	 *
	 * @param {string} [sType=sap.ui.core.support.Support.EventType.APPLICATION] the type
	 * @return {sap.ui.core.support.Support} the support stub
	 * @static
	 * @protected
	 */
	sap.ui.core.support.Support.getStub = function(sType) {
		if(_oStubInstance){
			return _oStubInstance;
		}
		
		if(sType != mTypes.APPLICATION && sType != mTypes.IFRAME && sType != mTypes.TOOL){
			sType = mTypes.APPLICATION;
		}
		
		_bPrivate = true;
		_oStubInstance = new sap.ui.core.support.Support(sType);
		_bPrivate = false;
		
		return _oStubInstance;
	};
	
	
	/**
	 * Returns the type of this support stub.
	 * 
	 * @see sap.ui.core.support.Support.StubType
	 * @name sap.ui.core.support.Support.prototype.getType
	 * @function
	 * @return {string} the type of the support stub
	 * @protected
	 */
	sap.ui.core.support.Support.prototype.getType = function() {
		return this._sType;
	};	
	
	
	/**
	 * Receive event handler for postMessage communication.
	 * 
	 * @name sap.ui.core.support.Support.prototype._receiveEvent
	 * @function
	 * @param {object} oEvent the event
	 * @private
	 */
	sap.ui.core.support.Support.prototype._receiveEvent = function(oEvent) {
		if(jQuery("html").attr("data-sap-ui-browser") != "ie8"){
			if(oEvent.source != this._oRemoteWindow){
				return;
			}
		}
		
		this._oRemoteOrigin = oEvent.origin;
		
		if(this._sType === mTypes.IFRAME){
			var that = this;
			var data = oEvent.data;
			setTimeout(function(){
				that._oOpenedWindow.sap.ui.core.support.Support.getStub(mTypes.TOOL)._receiveEvent({source: window, data: data, origin: that._sLocalOrigin});
			}, 0);
		}else{
			var oData = window.JSON.parse(oEvent.data);
			var sEventId = oData.eventId;
			var mParams = oData.params;
			this.fireEvent(sEventId, mParams);
		}
	};
	
	
	/**
	 * Sends an event to the remote window.
	 * 
	 * @name sap.ui.core.support.Support.prototype.sendEvent
	 * @function
	 * @param {String} sEventId the event id
	 * @param {Object} [mParams] the parameter map (JSON)
	 * @protected
	 */
	sap.ui.core.support.Support.prototype.sendEvent = function(sEventId, mParams) {
		if(!this._oRemoteWindow){
			return;
		}
		
		mParams = mParams ? mParams : {};
		
		if(jQuery.browser.msie && this._sType === mTypes.TOOL){
			this._oRemoteWindow.sap.ui.core.support.Support.getStub(mTypes.IFRAME).sendEvent(sEventId, mParams);
		}else{
			var mParamsLocal = mParams;
			if(jQuery.browser.msie){
				//Attention mParams comes from an other window
				//-> (mParams instanceof Object == false)!
				mParamsLocal = {};
				jQuery.extend(true, mParamsLocal, mParams);
			}
			var oData = {"eventId": sEventId, "params": mParamsLocal};
			var sData = window.JSON.stringify(oData);
			this._oRemoteWindow.postMessage(sData, this._sRemoteOrigin);
		}
	};
	
	
	/**
	 * Opens the support tool in an external browser window.
	 * 
	 * @name sap.ui.core.support.Support.prototype.openSupportTool
	 * @function
	 * @protected
	 */
	sap.ui.core.support.Support.prototype.openSupportTool = function() {	
		var sToolUrl = jQuery.sap.getModulePath("sap.ui.core.support", "/support.html");
		var sOriginParam = "?sap-ui-xx-support-origin="+jQuery.sap.encodeURL(this._sLocalOrigin);
		
		function checkLocalUrl(sUrl){
			//TODO find a proper check
			return (sUrl.indexOf(".") == 0 || sUrl.indexOf("/") == 0 || sUrl.indexOf("://") < 0);
		};
		
		if(this._sType === mTypes.APPLICATION){
			if(!this._isOpen){
				if(jQuery.browser.msie){
					var sIFrameUrl = jQuery.sap.getModulePath("sap.ui.core.support", "/msiebridge.html");
					getSupportArea().html("").append("<iframe id=\""+ID_SUPPORT_AREA+"-frame\" src=\""+sIFrameUrl+sOriginParam+"\" onload=\"sap.ui.core.support.Support._onSupportIFrameLoaded();\"></iframe>");
					this._sRemoteOrigin = checkLocalUrl(sIFrameUrl) ? this._sLocalOrigin : sIFrameUrl;
				}else{
					this._oRemoteWindow = openWindow(sToolUrl + sOriginParam);
					this._sRemoteOrigin = checkLocalUrl(sToolUrl) ? this._sLocalOrigin : sToolUrl;
				}
			}
		}else if(this._sType === mTypes.IFRAME){
			this._oOpenedWindow = openWindow(sToolUrl + sOriginParam);
		}
	};
	
	
	/**
	 * Event Handler which is bound to the onload event of the Internet Explorer iFrame bridge.
	 * 
	 * @name sap.ui.core.support.Support._onSupportIFrameLoaded
	 * @function
	 * @static
	 * @private
	 */
	sap.ui.core.support.Support._onSupportIFrameLoaded = function(){
		_oStubInstance._oRemoteWindow = jQuery.sap.byId(ID_SUPPORT_AREA+"-frame")[0].contentWindow;
	};
	
	
	/**
	 * @see sap.ui.base.EventProvider.prototype.toString
	 * 
	 * @name sap.ui.core.support.Support.prototype.toString
	 * @function
	 * @protected
	 */
	sap.ui.core.support.Support.prototype.toString = function() {
		return "sap.ui.core.support.Support";
	};
	
	
	/**
	 * @see sap.ui.base.EventProvider.prototype.fireEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.fireEvent
	 * @function
	 * @param {String} sEventId the event id
	 * @param {Object} [mParameters] the parameter map (JSON)
	 * @return {sap.ui.core.support.Support} Returns <code>this</code> to allow method chaining
	 * @private
	 */
	
	
	/**
	 * @see sap.ui.base.EventProvider.prototype.detachEvent
	 * 
	 * @name sap.ui.core.support.Support.prototype.detachEvent
	 * @function
	 * @protected
	 */
	
	
	/**
	 * @see sap.ui.base.EventProvider.prototype.attachEvent
	 * 
	 * @name sap.ui.core.support.Support.prototype.attachEvent
	 * @function
	 * @protected
	 */

	
	//*************** PRIVATE **************
	
	var _bPrivate = false; //Ensures that the constructor can not be called from outside
	var _oStubInstance; //The stub instance
	
	var ID_SUPPORT_AREA = "sap-ui-support";
	
	
	function getSupportArea() {
		var $support = jQuery("#"+ID_SUPPORT_AREA);
		if ($support.length === 0){
			$support = jQuery("<DIV/>", {id:ID_SUPPORT_AREA}).
				addClass("sapUiHidden").
				appendTo(document.body);
		}
		return $support;
	};
	
	
	function openWindow(sUrl) {
		return window.open(sUrl,
			"sapUiSupportTool",
			"width=800,height=700,status=no,toolbar=no,menubar=no,resizable=yes,location=no,directories=no,scrollbars=yes"
		);
	};
	
	
	function close(oWindow) {
		if(!oWindow){
			return;
		}
		try{
			oWindow.close();
		}catch(e){}
	};
	
	
	function initPlugins(oStub, bTool) {
		var aPlugins = bTool ? sap.ui.core.support.Support.TOOL_SIDE_PLUGINS : sap.ui.core.support.Support.APP_SIDE_PLUGINS;
		
		for(var i=0; i<aPlugins.length; i++){
			if(typeof(aPlugins[i]) === "string"){
				jQuery.sap.require(aPlugins[i]);
				var fPluginConstructor = jQuery.sap.getObject(aPlugins[i]);
				aPlugins[i] = new fPluginConstructor(oStub);
				if(oStub.getType() === mTypes.TOOL){
					wrapPlugin(aPlugins[i]);
				}
				aPlugins[i].init(oStub);
			}else if(aPlugins[i] instanceof sap.ui.core.support.Plugin) {
				aPlugins[i].init(oStub);
			}
		}
		
		if(bTool){
			sap.ui.core.support.Support.TOOL_SIDE_PLUGINS = aPlugins;
		}else{
			sap.ui.core.support.Support.APP_SIDE_PLUGINS = aPlugins;
		}
	};
	
	
	function exitPlugins(oStub, bTool) {
		var aPlugins = bTool ? sap.ui.core.support.Support.TOOL_SIDE_PLUGINS : sap.ui.core.support.Support.APP_SIDE_PLUGINS;
		for(var i=0; i<aPlugins.length; i++){
			if(aPlugins[i] instanceof sap.ui.core.support.Plugin) {
				aPlugins[i].exit(oStub, bTool);
			}
		}
	};
	
	
	function wrapPlugin(oPlugin) {
		oPlugin.$().replaceWith("<div  id='"+oPlugin.getId()+"-Panel' class='sapUiSupportPnl'><h2 class='sapUiSupportPnlHdr'>"+
				oPlugin.getTitle()+"<div id='"+oPlugin.getId()+"-PanelHandle' class='sapUiSupportPnlHdrHdl sapUiSupportPnlHdrHdlClosed'></div></h2><div id='"+
				oPlugin.getId()+"-PanelContent' class='sapUiSupportPnlCntnt sapUiSupportHidden'><div id='"+
				oPlugin.getId()+"' class='sapUiSupportPlugin'></div></div></div>");
		
		jQuery.sap.byId(oPlugin.getId()+"-PanelHandle").click(function(){
			var jHandleRef = jQuery.sap.byId(oPlugin.getId()+"-PanelHandle");
			if(jHandleRef.hasClass("sapUiSupportPnlHdrHdlClosed")){
				jHandleRef.removeClass("sapUiSupportPnlHdrHdlClosed");
				jQuery.sap.byId(oPlugin.getId()+"-PanelContent").removeClass("sapUiSupportHidden");
			}else{
				jHandleRef.addClass("sapUiSupportPnlHdrHdlClosed");
				jQuery.sap.byId(oPlugin.getId()+"-PanelContent").addClass("sapUiSupportHidden");
			}
		});
	};
	
}());
