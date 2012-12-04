/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.support.Plugin
jQuery.sap.declare("sap.ui.core.support.Plugin");

jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("jquery.sap.script");
jQuery.sap.require("jquery.sap.dom");

/**
 * Creates an instance of sap.ui.core.support.Plugin.
 * @class This class represents a plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
 *
 * @abstract
 * @extends sap.ui.base.Object
 * @version 1.9.1-SNAPSHOT
 * @constructor
 * @private
 * @name sap.ui.core.support.Plugin
 */
sap.ui.base.Object.extend("sap.ui.core.support.Plugin", {
	constructor : function(sId, sTitle, oStub) {
		sap.ui.base.Object.apply(this);
		this._id = sId ? sId : jQuery.sap.uid();
		this._title = sTitle ? sTitle : "";
		this._bActive = false;
		this._aEventIds = [];
		this._bIsToolPlugin = oStub.getType() === sap.ui.core.support.Support.StubType.TOOL;
	}
});


/**
 * Inititalization function called each time the support mode is started
 * (support popup is opened).
 * 
 * @param {sap.ui.core.support.Support} oSupportStub the support stub
 * @private
 */
sap.ui.core.support.Plugin.prototype.init = function(oSupportStub){
	for(var i=0; i<this._aEventIds.length; i++){
		var fHandler = this["on"+this._aEventIds[i]];
		if(fHandler && jQuery.isFunction(fHandler)){
			oSupportStub.attachEvent(this._aEventIds[i], fHandler, this);
		}
	}
	this._bActive = true;
};


/**
 * Finalization function called each time the support mode is ended
 * (support popup is closed).
 * 
 * @param {sap.ui.core.support.Support} oSupportStub the support stub
 * @private
 */
sap.ui.core.support.Plugin.prototype.exit = function(oSupportStub){
	for(var i=0; i<this._aEventIds.length; i++){
		var fHandler = this["on"+this._aEventIds[i]];
		if(fHandler && jQuery.isFunction(fHandler)){
			oSupportStub.detachEvent(this._aEventIds[i], fHandler, this);
		}
	}
	this._bActive = false;
};


/**
 * Returns the id of this plugin instance.
 * 
 * @return {string} the id
 * @private
 */
sap.ui.core.support.Plugin.prototype.getId = function(){
	return this._id;
};


/**
 * Returns the title of this plugin instance.
 * 
 * @return {string} the title
 * @private
 */
sap.ui.core.support.Plugin.prototype.getTitle = function(){
	return this._title;
};


/**
 * Returns <code>true</code> when this plugin instance runs in the support tool, <code>false</code> otherwise.
 * 
 * @see sap.ui.core.support.Support.StubType.TOOL
 * @return {boolean} whether this plugin instance runs in the support tool
 * @private
 */
sap.ui.core.support.Plugin.prototype.isToolPlugin = function(){
	return this._bIsToolPlugin;
}


/**
 * Returns the DOM node that represents this plugin wrapped as jQuery object.
 * 
 * @return {jQuery} The jQuery wrapped plugin's DOM reference
 * @private
 */
sap.ui.core.support.Plugin.prototype.$ = function(){
	var jRef = jQuery.sap.byId(this.getId());
	if(jRef.length == 0){
		jRef = jQuery("<DIV/>", {id:this.getId()});
		jRef.appendTo(jQuery(".sapUiSupportCntnt"));
	}
	return jRef;
};


/**
 * Returns whether the plugin is currently active or not.
 * 
 * @return {boolean} whether the plugin is currently active or not
 * @private
 */
sap.ui.core.support.Plugin.prototype.isActive = function(){
	return this._bActive;
};