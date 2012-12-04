/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.App.
jQuery.sap.declare("sap.m.App");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.m.NavContainer");

/**
 * Constructor for a new App.
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
 * <ul>
 * <li>{@link #getHomeIcon homeIcon} : any</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.App#event:orientationChange orientationChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.NavContainer#constructor sap.m.NavContainer}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * App is the root element of a UI5 mobile application. It inherits from NavContainer and thus provides its navigation capabilities.
 * It also adds certain header tags to the HTML page which are considered useful for mobile apps.
 * @extends sap.m.NavContainer
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.App
 */
sap.m.NavContainer.extend("sap.m.App", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"homeIcon" : {type : "any", group : "Misc", defaultValue : null}
	},
	events : {
		"orientationChange" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.App with name <code>sClassName</code> 
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
 * @name sap.m.App.extend
 * @function
 */

sap.m.App.M_EVENTS = {'orientationChange':'orientationChange'};


/**
 * Getter for property <code>homeIcon</code>.
 * The icon to be displayed on the home screen of iOS devices after the user does "add to home screen".
 * This icon must be in PNG format. The property can either hold the URL of one single icon which is used for all devices (and possibly scaled, which looks not perfect), or an object holding icon URLs for the different required sizes; one example is:
 * 
 * app.setHomeIcon({
 * 'phone':'phone-icon.png',
 * 'phone@2':'phone-retina.png',
 * 'tablet':'tablet-icon.png',
 * 'tablet@2':'tablet-retina.png'
 * });
 * 
 * The respective image sizes are 57/114 px for the phone and 72/144 px for the tablet.
 * If an object is given but the required size is missing from the object, the largest given URL will be used.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>homeIcon</code>
 * @public
 * @name sap.m.App#getHomeIcon
 * @function
 */


/**
 * Setter for property <code>homeIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oHomeIcon  new value for property <code>homeIcon</code>
 * @return {sap.m.App} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.App#setHomeIcon
 * @function
 */

/**
 * Fired when the orientation (portrait/landscape) of the device is changed. 
 *
 * @name sap.m.App#orientationChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {boolean} oControlEvent.getParameters.landscape Whether the device is in landscape orientation.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'orientationChange' event of this <code>sap.m.App</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.App</code>.<br/> itself. 
 *  
 * Fired when the orientation (portrait/landscape) of the device is changed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.App</code>.<br/> itself.
 *
 * @return {sap.m.App} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.App#attachOrientationChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'orientationChange' event of this <code>sap.m.App</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.App} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.App#detachOrientationChange
 * @function
 */


/**
 * Fire event orientationChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'landscape' of type <code>boolean</code> Whether the device is in landscape orientation.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.App} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.App#fireOrientationChange
 * @function
 */

// Start of sap\m\App.js
sap.m.App.prototype.init = function() {
	sap.m.NavContainer.prototype.init.apply(this, arguments);

	this.addStyleClass("sapMApp");

	jQuery(jQuery.proxy(function(){
		jQuery.sap.initMobile({
			viewport: !this._debugZoomAndScroll,
			statusBar: "default",
			hideBrowser: true,
			preventScroll: !this._debugZoomAndScroll,
			homeIcon: this.getHomeIcon(),
			rootId: this.getId()
		});
		jQuery(window).bind("resize", jQuery.proxy(this._handleOrientationChange, this));
	},this));
};


sap.m.App.prototype.onAfterRendering = function() {
	if (!this._bParentHeightSet) { // set all parent elements to 100% height this *should* be done by the application in CSS, but people tend to forget it...
		var ref = this.getDomRef().parentNode;
		while (ref && ref !== document.documentElement) {
			if (!ref.style.height) ref.style.height = "100%";
			ref = ref.parentNode;
		}
		this._bParentHeightSet = true;
	}
};


/**
 * Termination of the App control
 * @private
 */
sap.m.App.prototype.exit = function() {
	jQuery(window).unbind("resize", this._handleOrientationChange);
	
	if (this._sInitTimer) {
		jQuery.sap.clearDelayedCall(this._sInitTimer);
	}
};

sap.m.App.prototype._handleOrientationChange = function() {
	var $window = jQuery(window);
	var isLandscape = $window.width() > $window.height();
	if (this._oldIsLandscape !== isLandscape) {
		this.fireOrientationChange({landscape: isLandscape});
		this._oldIsLandscape = isLandscape;
	}
};

// TODO: later, introduce tabs as a kind of separation between histories

