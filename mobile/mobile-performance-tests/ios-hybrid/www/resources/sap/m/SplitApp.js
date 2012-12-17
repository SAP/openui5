/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.SplitApp.
jQuery.sap.declare("sap.m.SplitApp");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new SplitApp.
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
 * <li>{@link #getHomeIcon homeIcon} : any</li>
 * <li>{@link #getDefaultTransitionNameDetail defaultTransitionNameDetail} : string (default: "slide")</li>
 * <li>{@link #getDefaultTransitionNameMaster defaultTransitionNameMaster} : string (default: "slide")</li>
 * <li>{@link #getMode mode} : sap.m.SplitAppMode (default: sap.m.SplitAppMode.ShowHideMode)</li>
 * <li>{@link #getMasterButtonText masterButtonText} : string (default: "Navigation")</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getMasterPages masterPages} : sap.ui.core.Control[]</li>
 * <li>{@link #getDetailPages detailPages} : sap.ui.core.Control[]</li>
 * <li>{@link #getMasterAppContainer masterAppContainer} : sap.ui.core.Control</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getInitialDetail initialDetail} : string | sap.ui.core.Control</li>
 * <li>{@link #getInitialMaster initialMaster} : string | sap.ui.core.Control</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.SplitApp#event:orientationChange orientationChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.SplitApp#event:navigate navigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.SplitApp#event:afterNavigate afterNavigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.SplitApp#event:masterButton masterButton} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * SplitApp.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.SplitApp
 */
sap.ui.core.Control.extend("sap.m.SplitApp", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"toMaster", "toDetail", "backMaster", "backDetail", "showMaster", "hideMaster", "getCurrentMasterPage", "getCurrentDetailPage"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"homeIcon" : {type : "any", group : "Misc", defaultValue : null},
		"defaultTransitionNameDetail" : {type : "string", group : "Appearance", defaultValue : "slide"},
		"defaultTransitionNameMaster" : {type : "string", group : "Appearance", defaultValue : "slide"},
		"mode" : {type : "sap.m.SplitAppMode", group : "Appearance", defaultValue : sap.m.SplitAppMode.ShowHideMode},
		"masterButtonText" : {type : "string", group : "Appearance", defaultValue : "Navigation"}
	},
	aggregations : {
    	"masterPages" : {type : "sap.ui.core.Control", multiple : true, singularName : "masterPage"}, 
    	"detailPages" : {type : "sap.ui.core.Control", multiple : true, singularName : "detailPage"}, 
    	"masterAppContainer" : {type : "sap.ui.core.Control", multiple : false}
	},
	associations : {
		"initialDetail" : {type : "sap.ui.core.Control", multiple : false}, 
		"initialMaster" : {type : "sap.ui.core.Control", multiple : false}
	},
	events : {
		"orientationChange" : {}, 
		"navigate" : {}, 
		"afterNavigate" : {}, 
		"masterButton" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.SplitApp with name <code>sClassName</code> 
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
 * @name sap.m.SplitApp.extend
 * @function
 */

sap.m.SplitApp.M_EVENTS = {'orientationChange':'orientationChange','navigate':'navigate','afterNavigate':'afterNavigate','masterButton':'masterButton'};


/**
 * Getter for property <code>homeIcon</code>.
 * The icon to be displayed on the home screen of iOS devices after the user does "add to home screen".
 * This icon must be in PNG format. The property can either hold the URL of one single icon which is used for all devices (and possibly scaled, which looks not perfect), or an object holding icon URLs for the different required sizes; one example is:
 * 
 * SplitApp.setHomeIcon({
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
 * @name sap.m.SplitApp#getHomeIcon
 * @function
 */


/**
 * Setter for property <code>homeIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oHomeIcon  new value for property <code>homeIcon</code>
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setHomeIcon
 * @function
 */

/**
 * Getter for property <code>defaultTransitionNameDetail</code>.
 * The type of the transition/animation to apply when "to()" is called without defining the transition to use. The default is "slide", other options are: "fade" and "show" and the names of any registered custom transitions.
 *
 * Default value is <code>"slide"</code>
 *
 * @return {string} the value of property <code>defaultTransitionNameDetail</code>
 * @public
 * @name sap.m.SplitApp#getDefaultTransitionNameDetail
 * @function
 */


/**
 * Setter for property <code>defaultTransitionNameDetail</code>.
 *
 * Default value is <code>"slide"</code> 
 *
 * @param {string} sDefaultTransitionNameDetail  new value for property <code>defaultTransitionNameDetail</code>
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setDefaultTransitionNameDetail
 * @function
 */

/**
 * Getter for property <code>defaultTransitionNameMaster</code>.
 * The type of the transition/animation to apply when "to()" is called without defining the transition to use. The default is "slide", other options are: "fade" and "show" and the names of any registered custom transitions.
 *
 * Default value is <code>"slide"</code>
 *
 * @return {string} the value of property <code>defaultTransitionNameMaster</code>
 * @public
 * @name sap.m.SplitApp#getDefaultTransitionNameMaster
 * @function
 */


/**
 * Setter for property <code>defaultTransitionNameMaster</code>.
 *
 * Default value is <code>"slide"</code> 
 *
 * @param {string} sDefaultTransitionNameMaster  new value for property <code>defaultTransitionNameMaster</code>
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setDefaultTransitionNameMaster
 * @function
 */

/**
 * Getter for property <code>mode</code>.
 * This mode defines whether the master page will always be shown (in portrait and in landscape)[StretchCompressMode], or if it should be hidden when in protrait mode [ShowHideMode]. Default is ShowHideMode
 *
 * Default value is <code>ShowHideMode</code>
 *
 * @return {sap.m.SplitAppMode} the value of property <code>mode</code>
 * @public
 * @name sap.m.SplitApp#getMode
 * @function
 */


/**
 * Setter for property <code>mode</code>.
 *
 * Default value is <code>ShowHideMode</code> 
 *
 * @param {sap.m.SplitAppMode} oMode  new value for property <code>mode</code>
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setMode
 * @function
 */

/**
 * Getter for property <code>masterButtonText</code>.
 * The Master Button is used to make the master page appear when tablet is in portrait and mode is set to ShowHideMode.
 *
 * Default value is <code>"Navigation"</code>
 *
 * @return {string} the value of property <code>masterButtonText</code>
 * @public
 * @name sap.m.SplitApp#getMasterButtonText
 * @function
 */


/**
 * Setter for property <code>masterButtonText</code>.
 *
 * Default value is <code>"Navigation"</code> 
 *
 * @param {string} sMasterButtonText  new value for property <code>masterButtonText</code>
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setMasterButtonText
 * @function
 */
	
/**
 * Getter for aggregation <code>masterPages</code>.<br/>
 * Aggregation for master pages.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.SplitApp#getMasterPages
 * @function
 */

/**
 * Inserts a masterPage into the aggregation named <code>masterPages</code>.
 *
 * @param {sap.ui.core.Control}
 *          oMasterPage the masterPage to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the masterPage should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the masterPage is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the masterPage is inserted at 
 *             the last position        
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#insertMasterPage
 * @function
 */


/**
 * Adds some masterPage <code>oMasterPage</code> 
 * to the aggregation named <code>masterPages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oMasterPage the masterPage to add; if empty, nothing is inserted
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#addMasterPage
 * @function
 */


/**
 * Removes an masterPage from the aggregation named <code>masterPages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vMasterPage the masterPage to remove or its index or id
 * @return {sap.ui.core.Control} the removed masterPage or null
 * @public
 * @name sap.m.SplitApp#removeMasterPage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>masterPages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.SplitApp#removeAllMasterPages
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>masterPages</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oMasterPage the masterPage whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.SplitApp#indexOfMasterPage
 * @function
 */


/**
 * Destroys all the masterPages in the aggregation 
 * named <code>masterPages</code>.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#destroyMasterPages
 * @function
 */
	
/**
 * Getter for aggregation <code>detailPages</code>.<br/>
 * Aggregation for detail pages
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.SplitApp#getDetailPages
 * @function
 */

/**
 * Inserts a detailPage into the aggregation named <code>detailPages</code>.
 *
 * @param {sap.ui.core.Control}
 *          oDetailPage the detailPage to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the detailPage should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the detailPage is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the detailPage is inserted at 
 *             the last position        
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#insertDetailPage
 * @function
 */


/**
 * Adds some detailPage <code>oDetailPage</code> 
 * to the aggregation named <code>detailPages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oDetailPage the detailPage to add; if empty, nothing is inserted
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#addDetailPage
 * @function
 */


/**
 * Removes an detailPage from the aggregation named <code>detailPages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vDetailPage the detailPage to remove or its index or id
 * @return {sap.ui.core.Control} the removed detailPage or null
 * @public
 * @name sap.m.SplitApp#removeDetailPage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>detailPages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.SplitApp#removeAllDetailPages
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>detailPages</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oDetailPage the detailPage whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.SplitApp#indexOfDetailPage
 * @function
 */


/**
 * Destroys all the detailPages in the aggregation 
 * named <code>detailPages</code>.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#destroyDetailPages
 * @function
 */
	
/**
 * Getter for aggregation <code>masterAppContainer</code>.<br/>
 * Container for the master pages
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.m.SplitApp#getMasterAppContainer
 * @function
 */

/**
 * Setter for the aggregated <code>masterAppContainer</code>.
 * @param oMasterAppContainer {sap.ui.core.Control}
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setMasterAppContainer
 * @function
 */


/**
 * Destroys the masterAppContainer in the aggregation 
 * named <code>masterAppContainer</code>.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#destroyMasterAppContainer
 * @function
 */

/**
 * Sets the initial detail page, which is shown on application launch.
 *
 * @return {string} Id of the element which is the current target of the <code>initialDetail</code> association, or null
 * @public
 * @name sap.m.SplitApp#getInitialDetail
 * @function
 */


/**
 * Sets the initial detail page, which is shown on application launch.
 *
 * @param {string | sap.ui.core.Control} vInitialDetail 
 *    Id of an element which becomes the new target of this <code>initialDetail</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setInitialDetail
 * @function
 */

/**
 * Sets the initial master page, which is shown on application launch.
 *
 * @return {string} Id of the element which is the current target of the <code>initialMaster</code> association, or null
 * @public
 * @name sap.m.SplitApp#getInitialMaster
 * @function
 */


/**
 * Sets the initial master page, which is shown on application launch.
 *
 * @param {string | sap.ui.core.Control} vInitialMaster 
 *    Id of an element which becomes the new target of this <code>initialMaster</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#setInitialMaster
 * @function
 */

/**
 * orientationChange 
 *
 * @name sap.m.SplitApp#orientationChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {boolean} oControlEvent.getParameters.landscape Returns true if the device is in landscape.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'orientationChange' event of this <code>sap.m.SplitApp</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitApp</code>.<br/> itself. 
 *  
 * orientationChange 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitApp</code>.<br/> itself.
 *
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#attachOrientationChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'orientationChange' event of this <code>sap.m.SplitApp</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#detachOrientationChange
 * @function
 */


/**
 * Fire event orientationChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'landscape' of type <code>boolean</code> Returns true if the device is in landscape.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitApp#fireOrientationChange
 * @function
 */

/**
 * navigate 
 *
 * @name sap.m.SplitApp#navigate
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'navigate' event of this <code>sap.m.SplitApp</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitApp</code>.<br/> itself. 
 *  
 * navigate 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitApp</code>.<br/> itself.
 *
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#attachNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'navigate' event of this <code>sap.m.SplitApp</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#detachNavigate
 * @function
 */


/**
 * Fire event navigate to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitApp#fireNavigate
 * @function
 */

/**
 * afterNavigate 
 *
 * @name sap.m.SplitApp#afterNavigate
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterNavigate' event of this <code>sap.m.SplitApp</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitApp</code>.<br/> itself. 
 *  
 * afterNavigate 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitApp</code>.<br/> itself.
 *
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#attachAfterNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterNavigate' event of this <code>sap.m.SplitApp</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#detachAfterNavigate
 * @function
 */


/**
 * Fire event afterNavigate to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitApp#fireAfterNavigate
 * @function
 */

/**
 * Event gets triggered when a Master Button needs to be shown or hidden. This is necessary for custom headers when the SplitApp control does not handle the placement of the master button automatically. 
 *
 * @name sap.m.SplitApp#masterButton
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'masterButton' event of this <code>sap.m.SplitApp</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitApp</code>.<br/> itself. 
 *  
 * Event gets triggered when a Master Button needs to be shown or hidden. This is necessary for custom headers when the SplitApp control does not handle the placement of the master button automatically. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitApp</code>.<br/> itself.
 *
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#attachMasterButton
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'masterButton' event of this <code>sap.m.SplitApp</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitApp#detachMasterButton
 * @function
 */


/**
 * Fire event masterButton to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitApp} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitApp#fireMasterButton
 * @function
 */

/**
 * navigate to given master page
 *
 * @name sap.m.SplitApp.prototype.toMaster
 * @function
 * @param {string} 
 *         sPageId
 *         The ID or the control of the master Page.
 * @param {string} 
 *         sTransitionName
 *         The type of the transition/animation to apply. This parameter can be omitted; then the default is "slide" (horizontal movement from the right).
 * Other options are: "fade", "flip", and "show" and the names of any registered custom transitions.
 * 
 * None of the standard transitions is currently making use of any given transition parameters.
 * @param {object} 
 *         oData

 * @since 1.7.1 *         This optional object can carry any payload data which should be made available to the target page. The "beforeShow" event on the target page will contain this data object as "data" property.
 * 
 * Use case: in scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
 * 
 * When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
 * @param {object} 
 *         oTransitionParameters

 * @since 1.7.1 *         This optional object can contain additional information for the transition function, like the DOM element which triggered the transition or the desired transition duration.
 * 
 * For a proper parameter order, the "data" parameter must be given when the "transitionParameters" parameter is used. (it can be given as "null")
 * 
 * NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
 * The "show", "slide" and "fade" transitions do not use any parameter.

 * @type sap.m.SplitApp
 * @public
 */


/**
 * navigate to given detail page
 *
 * @name sap.m.SplitApp.prototype.toDetail
 * @function

 * @type sap.m.SplitApp
 * @public
 */


/**
 * navigate back within MasterView
 *
 * @name sap.m.SplitApp.prototype.backMaster
 * @function

 * @type sap.m.SplitApp
 * @public
 */


/**
 * navigate back within DetailView
 *
 * @name sap.m.SplitApp.prototype.backDetail
 * @function

 * @type sap.m.SplitApp
 * @public
 */


/**
 * When in ShowHideMode and the device is in portrait mode, this function can be used to make the master page visible.
 *
 * @name sap.m.SplitApp.prototype.showMaster
 * @function

 * @type sap.m.SplitApp
 * @public
 */


/**
 * When in ShowHideMode and the device is in portrait mode, this function can be used to hide the master page.
 *
 * @name sap.m.SplitApp.prototype.hideMaster
 * @function

 * @type sap.m.SplitApp
 * @public
 */


/**
 * Returns the current shown master page
 *
 * @name sap.m.SplitApp.prototype.getCurrentMasterPage
 * @function

 * @type sap.m.Page
 * @public
 */


/**
 * Returns the current shown detail page
 *
 * @name sap.m.SplitApp.prototype.getCurrentDetailPage
 * @function

 * @type sap.m.Page
 * @public
 */


// Start of sap\m\SplitApp.js
//TODO: provide own invalidate() check

sap.m.SplitApp.prototype.init = function() {
	if(jQuery.device.is.tablet) {
		this._oMasterNav = new sap.m.NavContainer(this.getId() + "-Master", {width: ""}).setParent(this, "NavMaster", true);
		this._oDetailNav = new sap.m.NavContainer(this.getId() + "-Detail", {width: ""}).setParent(this, "NavDetail", true);
		this._oShowMasterBtn = new sap.m.Button(this.getId() + "-MasterBtn",{text: "Navigation"}).addStyleClass("sapMSplitAppMasterBtn"); 
		this._oPopOver = new sap.m.Popover(this.getId() + "-Popover", {placement: sap.m.PlacementType.Bottom,
		showHeader: false, contentWidth: "320px", contentHeight: "600px"}).setParent(this, "NavPopover", true);;
	}else {
		this._oMasterNav = this._oDetailNav =  new sap.m.NavContainer().setParent(this, null, true);
	}
	
	var $window = jQuery(window);
	this._oldIsLandscape = $window.width() > $window.height();
	//if master page is open when device is in portrait and show/hide mode
	this._bMasterisOpen = false; 

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

sap.m.SplitApp.prototype.onAfterRendering = function() {
	if (!this._bParentHeightSet) { // set all parent elements to 100% height this *should* be done by the application in CSS, but people tend to forget it...
		var ref = this.getDomRef().parentNode;
		while (ref && ref !== document.documentElement) {
			if (!ref.style.height) ref.style.height = "100%";
			ref = ref.parentNode;
		}
		this._bParentHeightSet = true;
	}
	var _currentPage = this._oDetailNav.getCurrentPage();
	if(jQuery.device.is.tablet) {
		if(this._oPopOver.oPopup.isOpen()){
			//Wait for the popover to be closed properly
			this._oPopOver.close();
		}
		if(this._portraitHide()) {
			this._setMasterButton(_currentPage);
		}else if(this._portraitPopover()) {
			this._setMasterButton(_currentPage);
		}else {
			this._removeMasterButton(_currentPage);
		}
	}
};

sap.m.SplitApp.prototype._handleOrientationChange = function() {
	var $window = jQuery(window);
	var isLandscape = $window.width() > $window.height();
	var _currentPage = this._oDetailNav.getCurrentPage();
	if(this._oldIsLandscape !== isLandscape) {
		this.fireOrientationChange({landscape: isLandscape});
		this._oldIsLandscape = isLandscape;	
		if (jQuery.device.is.tablet) {
			if(this.getMode() == "ShowHideMode" || this.getMode() == "PopoverMode") {
				if(isLandscape) {
					this._oMasterNav.$().toggleClass("sapMSplitAppMasterVisible", false);
					this._oMasterNav.$().toggleClass("sapMSplitAppMasterHidden", false);
				}
				this._bMasterisOpen = false; 
			}
			this.$().toggleClass("sapMSplitAppPortrait", !isLandscape);
			if(this.getMode() == "PopoverMode") {
				if(this._oPopOver.oPopup.isOpen()){
				//Wait for the popover to be closed properly
					this._oPopOver.attachAfterClose(this._handlePopClose, this);
					this._oPopOver.close();
				} else {
					this._handlePopClose();
				}
			}
			if(!this._oldIsLandscape && this.getMode() != "StretchCompressMode") {
				this._setMasterButton(_currentPage);
			}else {
				this._removeMasterButton(_currentPage);
			}
		}
	}
};

sap.m.SplitApp.prototype._handlePopClose = function(oEvent) {
this._oPopOver.detachAfterClose(this._handlePopClose, this);
	if(this._oldIsLandscape) {
		this._updateMasterPosition("landscape");
	}else {
		this._updateMasterPosition("popover");
	}
};

/**************************************************************
* Touch Event Handlers
**************************************************************/
sap.m.SplitApp.prototype.onswiperight = function(oEvent) {
	if(jQuery.device.is.tablet) {
		if(this._portraitHide())
			if(jQuery.os.android) {
				this._removeMasterButton(oEvent.srcControl);
			}
		this.showMaster();
	}
};

//handles closing of master navContainer and navigation inside it
sap.m.SplitApp.prototype.ontap = function(oEvent) {
	if(jQuery.device.is.tablet) {
		var _bIsNavigate = false;
		var _bButtonIsBack = false;
	
		if(oEvent.srcControl instanceof sap.m.ListItemBase) {
			_bIsNavigate =  oEvent.srcControl.getType() === "Navigation";
		}
		if(oEvent.srcControl instanceof sap.m.Button) {
			_bButtonIsBack =  oEvent.srcControl.getType() === "Back" ;
		}
		//if no navigation in list or page navigation back, master will be hidden when in portrait mode
		if(!this._oldIsLandscape && oEvent.srcControl.getParent().getId() !== "sapMSplitAppMaster" && !_bIsNavigate && !_bButtonIsBack) {
			if(this.getMode() == "ShowHideMode") {
				this.hideMaster();
				this._setMasterButton(this._oDetailNav.getCurrentPage());
			}
		}
		if(!this._oldIsLandscape && oEvent.srcControl.getId() === this._oShowMasterBtn.getId()) {
			if(this.getMode() == "PopoverMode") {
				if(!this._oPopOver.oPopup.isOpen()){
					this._oPopOver.openBy(this._oShowMasterBtn);
				}else {
					this._oPopOver.close();
				}
			} else {
				this._removeMasterButton(this._oDetailNav.getCurrentPage());
				this.showMaster();
			}
		}
	}
};

sap.m.SplitApp.prototype.onswipeleft = function(oEvent) {
	if(this._portraitHide() && jQuery.device.is.tablet) {
		this.hideMaster();
		this._setMasterButton(this._oDetailNav.getCurrentPage());
	}
};

/**************************************************************
* NavContainer methods
**************************************************************/
sap.m.SplitApp.prototype.toMaster = function(pageId, transitionName, data, oTransitionParameters) {
	this._oMasterNav.to(pageId, transitionName, data, oTransitionParameters);
};

sap.m.SplitApp.prototype.backMaster = function(backData, oTransitionParameters) {
	this._oMasterNav.back(backData, oTransitionParameters);
};

sap.m.SplitApp.prototype.toDetail = function(pageId, transitionName, data, oTransitionParameters) {
	var self = this;
	var oPage = this._oDetailNav.getPage(pageId);
	this._oDetailNav.to(pageId, transitionName, data, oTransitionParameters);
	if(jQuery.device.is.tablet) {
		if(this._portraitHide() || this._portraitPopover()) {
			this._setMasterButton(oPage);
		}
//	}else {
//		if(oPage) {
//			oPage.setShowNavButton(true);
//			oPage.attachNavButtonTap(function() {
//			self._oDetailNav.back();
//			});
//		}
//	this._oDetailNav.to(pageId, transitionName, data, oTransitionParameters);
	}
};

sap.m.SplitApp.prototype.backDetail = function(backData, oTransitionParameters) {
	this._oDetailNav.back(backData, oTransitionParameters);
};

/*************************************************************
 * Setters/Getters of the SplitApp control
**************************************************************/
sap.m.SplitApp.prototype.addMasterPage = function(oPage) {
	this._oMasterNav.addPage(oPage);
	return this;
};

sap.m.SplitApp.prototype.addDetailPage = function(oPage) {
	this._oDetailNav.addPage(oPage);
	return this;
};

sap.m.SplitApp.prototype.setInitialMaster = function(sPage) {
	this._oMasterNav.setInitialPage(sPage);
	this.setAssociation('initialMaster', sPage, true);
	return this;
};

sap.m.SplitApp.prototype.setInitialDetail = function(sPage) {
	if(jQuery.device.is.tablet) {
		this._oDetailNav.setInitialPage(sPage);
	}
	this.setAssociation('initialDetail', sPage, true);
	return this;
};

sap.m.SplitApp.prototype.setDefaultTransitionNameDetail = function(sTransition) {
	this._oDetailNav.setDefaultTransitionName(sTransition);
	return this;
};

sap.m.SplitApp.prototype.setDefaultTransitionNameMaster = function(sTransition) {
	this._oMasterNav.setDefaultTransitionName(sTransition);
	return this;
};

sap.m.SplitApp.prototype.showMaster = function() {
	var _this$ = this._oMasterNav.$();
	if(this._portraitHide() && !this._bMasterisOpen) {
		_this$.toggleClass("sapMSplitAppMasterVisible", true);
		_this$.toggleClass("sapMSplitAppMasterHidden", false);
		
		this._bMasterisOpen = true;
	}
	return this;
};

sap.m.SplitApp.prototype.hideMaster = function() {
	var _this$ = this._oMasterNav.$();
	if(this._portraitHide() && this._bMasterisOpen) {
		_this$.toggleClass("sapMSplitAppMasterVisible" , false);
		_this$.toggleClass("sapMSplitAppMasterHidden" , true);

		this._bMasterisOpen = false;
	}
	return this;
};

sap.m.SplitApp.prototype.setMasterButtonText = function(sText) {
	this.setProperty("masterButtonText", sText, true);
	if(sText == "") {
		this._oShowMasterBtn.setText("Navigation");
	}else {
		this._oShowMasterBtn.setText(sText);
	}
};

sap.m.SplitApp.prototype.getCurrentMasterPage = function() {
	return this._oMasterNav.getCurrentPage();
};

sap.m.SplitApp.prototype.getCurrentDetailPage = function() {
	return this._oDetailNav.getCurrentPage();
};

sap.m.SplitApp.prototype.setMode = function(sMode) {
	this.setProperty("mode", sMode, true);

	if(sMode !== "PopoverMode" && this._oPopOver.getContent().length > 0) {
		this._updateMasterPosition("landscape");

	}else if(sMode == "PopoverMode" && !this._oldIsLandscape && this._oPopOver.getContent().length == 0){
		this._updateMasterPosition("popover");
		this.$().toggleClass("sapMSplitAppShowHide", true);
		this.$().toggleClass("sapMSplitAppStretchCompress", false);
	}
	if(sMode == "StretchCompressMode") {
		this.$().toggleClass("sapMSplitAppShowHide", false);
		this.$().toggleClass("sapMSplitAppStretchCompress", true);
		this._removeMasterButton(this._oDetailNav.getCurrentPage());
	}
	if(sMode == "ShowHideMode") {
		this.$().toggleClass("sapMSplitAppShowHide", true);
		this.$().toggleClass("sapMSplitAppStretchCompress", false);
	}
	return this;
};

/**************************************************************
 * Helper for the SplitApp control
 * @private
 **************************************************************/
 //updates the dom position of the Master NavContainer (inside popover or left next to the Detail NavContainer)
sap.m.SplitApp.prototype._updateMasterPosition = function(sPos) {
	if(sPos == "popover") {
		//remove the NavContainer dom from the left side without rerendering the whole app
		this._oMasterNav.setParent(null, "NavPopover", true);
		jQuery.sap.byId(this._oMasterNav.getId()).remove();
		this._oPopOver.addContent(this._oMasterNav);
	}
	if(sPos == "landscape") {
		this._oPopOver.removeAggregation("content", this._oMasterNav.getId(), false);
		//sap.ui.getCore().applyChanges();
		this._oMasterNav.setParent(this, "NavPopover", true);
		//render only the master navContainer, to prevent the whole app from rerendering
		var $master = jQuery.sap.byId(this.getId());
		if ($master) {
			var rm = sap.ui.getCore().createRenderManager();
			rm.renderControl(this._oMasterNav.addStyleClass("sapMSplitAppMaster"));
			rm.flush($master[0], false, 0);
			rm.destroy();
		}
	}

};
//Portrait - Tablet - ShowHideMode
sap.m.SplitApp.prototype._portraitHide = function() {
	if(!this._oldIsLandscape && jQuery.device.is.tablet && this.getMode() === "ShowHideMode") {
		return true;
	} else {
		return false;
	}
};
//Portrait - Tablet - PopoverMode
sap.m.SplitApp.prototype._portraitPopover = function() {
	if(!this._oldIsLandscape && jQuery.device.is.tablet && this.getMode() === "PopoverMode") {
		return true;
	} else {
		return false;
	}
};

//if the page uses a custom header, we will not set the master button. The app dev has to do this by him/herself
sap.m.SplitApp.prototype._setMasterButton = function(oPage) {
		this.fireMasterButton({show: true});
		var sClassName = oPage.getMetadata()._sClassName;
		if(sClassName == "sap.ui.core.mvc.JSView" || sClassName == "sap.ui.core.mvc.XMLView") {
			if(oPage.getContent().length == 1)
				oPage = oPage.getContent()[0];
		}
		if(oPage._internalHeader && !this._checkCustomHeader(oPage)) {
			var oContentLeft = oPage._internalHeader.getContentLeft();
			var bIsSet = false;
			for(var i=0; i<oContentLeft.length; i++) {
				if(oContentLeft[i] === this._oShowMasterBtn) {
					bIsSet = true;
				}
			}
			if(!bIsSet) {
				oPage._updateHeaderContent(this._oShowMasterBtn, 'left', 0);
				setTimeout(function() {
					oPage._internalHeader.invalidate();
				},0);
			} else {
				this._oShowMasterBtn.$().parent().toggleClass("sapMSplitAppMasterBtnHide", false);	
				this._oShowMasterBtn.$().toggleClass("sapMSplitAppMasterBtnHidden", false);	
				this._oShowMasterBtn.$().parent().toggleClass("sapMSplitAppMasterBtnShow", true);		
			}	
		}
};
//if the page uses a custom header, we will not remove the master button. The app dev has to do this by him/herself		
sap.m.SplitApp.prototype._removeMasterButton = function(oPage) {
	this.fireMasterButton({show: false});
	if(!this._oShowMasterBtn.$().is(":hidden")) {
		var sClassName = oPage.getMetadata()._sClassName;
		if(sClassName == "sap.ui.core.mvc.JSView" || sClassName == "sap.ui.core.mvc.XMLView") {
			if(oPage.getContent().length == 1)
				oPage = oPage.getContent()[0];
		}
		if(oPage._internalHeader && !this._checkCustomHeader(oPage)) {
			var oContentLeft = oPage._internalHeader.getContentLeft();
			var o$MasterBtn = this._oShowMasterBtn;
			for(var i=0; i<oContentLeft.length; i++) {
				if(oContentLeft[i] === this._oShowMasterBtn) {
					this._oShowMasterBtn.$().parent().toggleClass("sapMSplitAppMasterBtnShow", false);
					this._oShowMasterBtn.$().parent().toggleClass("sapMSplitAppMasterBtnHide", true);
					this._oShowMasterBtn.$().parent().one("webkitAnimationEnd", function(){
						o$MasterBtn.$().toggleClass("sapMSplitAppMasterBtnHidden", true);
					});	
				}
			}
		}
	}
};

sap.m.SplitApp.prototype._checkCustomHeader = function(oPage) {
	var oCustomHeader = oPage.getCustomHeader();
	if (oCustomHeader) {
		return true;
	} else {
		return false;
	}
};
/**************************************************************
 * Termination of the SplitApp control
 * @private
 **************************************************************/
sap.m.SplitApp.prototype.exit = function() {
	jQuery(window).unbind("resize", this._handleOrientationChange);
	
	if(this._oMasterNav) {
		this._oMasterNav.destroy();
	}
	if(this._oDetailNav) {
		this._oDetailNav.destroy();
	}
	if(this._oShowMasterBtn) {
		this._oShowMasterBtn.destroy();
	}
	if(this._oPopOver) {
		this._oPopOver.detachAfterClose(this._handlePopClose, this);
		this._oPopOver.destroy();
	}
};