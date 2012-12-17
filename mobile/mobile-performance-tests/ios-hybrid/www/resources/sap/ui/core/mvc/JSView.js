/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.mvc.JSView.
jQuery.sap.declare("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.mvc.View");

/**
 * Constructor for a new mvc/JSView.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.ui.core.mvc.View#constructor sap.ui.core.mvc.View}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A View defined/constructed by JavaScript code.
 * @extends sap.ui.core.mvc.View
 *
 * @author  
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.mvc.JSView
 */
sap.ui.core.mvc.View.extend("sap.ui.core.mvc.JSView", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.ui.core"
}});


/**
 * Creates a new subclass of class sap.ui.core.mvc.JSView with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.core.mvc.JSView.extend
 * @function
 */


// Start of sap\ui\core\mvc\JSView.js
(function(){
	var mRegistry = {};
	/**
	 * Defines or creates an instance of a JavaScript view.
	 *
	 * The behavior of this method depends on the signature of the call and on the current context.
	 *
	 * <ul>
	 * <li>View Definition <code>sap.ui.jsview(sId, vView)</code>: Defines a view of the given name with the given
	 * implementation. sId must be the views name, vView must be an object and can contain
	 * implementations for any of the hooks provided by JSView</li>
	 * <li>View Instantiation <code>sap.ui.jsview(sId?, vView)</code>: Creates an instance of the view with the given name (and id).
	 * If no view implementation has been defined for that view name, a JavaScript module with the same name and with suffix "view.js" will be loaded
	 * and executed. The module should contain a view definition (1st. variant above). </li>
	 * </ul>
	 *
	 * Any other call signature will lead to a runtime error. If the id is omitted in the second variant, an id will
	 * be created automatically.
	 *
	 * @param {string} [sId] id of the newly created view, only allowed for instance creation
	 * @param {string | object} vView name or implementation of the view.
	 * @public
	 * @static
	 */
	sap.ui.jsview = function(sId, vView) {
		var mSettings = {};

		if (vView && typeof (vView) == "string") { // instantiation sap.ui.jsview("id","name")
			mSettings.viewName = vView;
			mSettings.controller = arguments[2];
			var oView = new sap.ui.core.mvc.JSView(sId, mSettings);
			return oView;

		} else if (vView && typeof (vView) == "object"){ // definition sap.ui.jsview("name",definitionObject)
			// sId is not given, but contains the desired value of sViewName
			mRegistry[sId] = vView;
			jQuery.sap.declare({modName:sId,type:"view"}, false);

		} else if (arguments.length == 1 && typeof(arguments[0]) == "string") { // instantiation sap.ui.jsview("name")
			mSettings.viewName = sId;
			mSettings.controller = arguments[1];
			/*** STEP 1: create View ***/
			var oView = mSettings.id ? new sap.ui.core.mvc.JSView(mSettings.id,mSettings): new sap.ui.core.mvc.JSView(mSettings);
			/*** Step 3B and 4B (create and connect controller) happen in View ***/
			return oView;
		} else {
			throw new Error("Wrong arguments! Either call sap.ui.jsview([sId,] sViewName) to instantiate a View or sap.ui.jsview(sViewName, oViewImpl) to define a View type.");
		}
	};

	sap.ui.core.mvc.JSView.prototype.initViewSettings = function (mSettings) {
		/*** require view definition if not yet done... ***/
		if (!mRegistry[mSettings.viewName]) {
			jQuery.sap.require({modName: mSettings.viewName, type: "view"});
		}
		/*** Step 2: extend() ***/
		jQuery.extend(this, mRegistry[mSettings.viewName]);
	};

	sap.ui.core.mvc.JSView.prototype.onControllerConnected = function(oController) {
		var that=this;
		// unset any preprocessors (e.g. from an enclosing JSON view)
		sap.ui.base.ManagedObject.runWithPreprocessors(function() { 
			that.applySettings({ content : that.createContent(oController) });
		});
	};

}());