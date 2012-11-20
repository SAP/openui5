/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.SplitView.
jQuery.sap.declare("sap.m.SplitView");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new SplitView.
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
 * <li>{@link #getDisplayMaster displayMaster} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getMasterPages masterPages} : sap.ui.core.Control[]</li>
 * <li>{@link #getDetailPages detailPages} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getInitialDetail initialDetail} : string | sap.ui.core.Control</li>
 * <li>{@link #getInitialMaster initialMaster} : string | sap.ui.core.Control</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.SplitView#event:orientationChange orientationChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.SplitView#event:navigate navigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.SplitView#event:afterNavigate afterNavigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * SplitView.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.SplitView
 */
sap.ui.core.Control.extend("sap.m.SplitView", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"toMaster", "toDetail", "backMaster", "backDetail"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"displayMaster" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {
    	"masterPages" : {type : "sap.ui.core.Control", multiple : true, singularName : "masterPage"}, 
    	"detailPages" : {type : "sap.ui.core.Control", multiple : true, singularName : "detailPage"}
	},
	associations : {
		"initialDetail" : {type : "sap.ui.core.Control", multiple : false}, 
		"initialMaster" : {type : "sap.ui.core.Control", multiple : false}
	},
	events : {
		"orientationChange" : {}, 
		"navigate" : {}, 
		"afterNavigate" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.SplitView with name <code>sClassName</code> 
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
 * @name sap.m.SplitView.extend
 * @function
 */

sap.m.SplitView.M_EVENTS = {'orientationChange':'orientationChange','navigate':'navigate','afterNavigate':'afterNavigate'};


/**
 * Getter for property <code>displayMaster</code>.
 * this flag is to force the master view to be shown always
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>displayMaster</code>
 * @public
 * @name sap.m.SplitView#getDisplayMaster
 * @function
 */


/**
 * Setter for property <code>displayMaster</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDisplayMaster  new value for property <code>displayMaster</code>
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#setDisplayMaster
 * @function
 */
	
/**
 * Getter for aggregation <code>masterPages</code>.<br/>
 * master page
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.SplitView#getMasterPages
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
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#insertMasterPage
 * @function
 */


/**
 * Adds some masterPage <code>oMasterPage</code> 
 * to the aggregation named <code>masterPages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oMasterPage the masterPage to add; if empty, nothing is inserted
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#addMasterPage
 * @function
 */


/**
 * Removes an masterPage from the aggregation named <code>masterPages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vMasterPage the masterPage to remove or its index or id
 * @return {sap.ui.core.Control} the removed masterPage or null
 * @public
 * @name sap.m.SplitView#removeMasterPage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>masterPages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.SplitView#removeAllMasterPages
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
 * @name sap.m.SplitView#indexOfMasterPage
 * @function
 */


/**
 * Destroys all the masterPages in the aggregation 
 * named <code>masterPages</code>.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#destroyMasterPages
 * @function
 */
	
/**
 * Getter for aggregation <code>detailPages</code>.<br/>
 * Detail Page
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.SplitView#getDetailPages
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
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#insertDetailPage
 * @function
 */


/**
 * Adds some detailPage <code>oDetailPage</code> 
 * to the aggregation named <code>detailPages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oDetailPage the detailPage to add; if empty, nothing is inserted
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#addDetailPage
 * @function
 */


/**
 * Removes an detailPage from the aggregation named <code>detailPages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vDetailPage the detailPage to remove or its index or id
 * @return {sap.ui.core.Control} the removed detailPage or null
 * @public
 * @name sap.m.SplitView#removeDetailPage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>detailPages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.SplitView#removeAllDetailPages
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
 * @name sap.m.SplitView#indexOfDetailPage
 * @function
 */


/**
 * Destroys all the detailPages in the aggregation 
 * named <code>detailPages</code>.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#destroyDetailPages
 * @function
 */

/**
 * default Detail page
 *
 * @return {string} Id of the element which is the current target of the <code>initialDetail</code> association, or null
 * @public
 * @name sap.m.SplitView#getInitialDetail
 * @function
 */


/**
 * default Detail page
 *
 * @param {string | sap.ui.core.Control} vInitialDetail 
 *    Id of an element which becomes the new target of this <code>initialDetail</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#setInitialDetail
 * @function
 */

/**
 * default master page
 *
 * @return {string} Id of the element which is the current target of the <code>initialMaster</code> association, or null
 * @public
 * @name sap.m.SplitView#getInitialMaster
 * @function
 */


/**
 * default master page
 *
 * @param {string | sap.ui.core.Control} vInitialMaster 
 *    Id of an element which becomes the new target of this <code>initialMaster</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#setInitialMaster
 * @function
 */

/**
 * orientationChange 
 *
 * @name sap.m.SplitView#orientationChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'orientationChange' event of this <code>sap.m.SplitView</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitView</code>.<br/> itself. 
 *  
 * orientationChange 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitView</code>.<br/> itself.
 *
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#attachOrientationChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'orientationChange' event of this <code>sap.m.SplitView</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#detachOrientationChange
 * @function
 */


/**
 * Fire event orientationChange to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitView#fireOrientationChange
 * @function
 */

/**
 * navigate 
 *
 * @name sap.m.SplitView#navigate
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'navigate' event of this <code>sap.m.SplitView</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitView</code>.<br/> itself. 
 *  
 * navigate 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitView</code>.<br/> itself.
 *
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#attachNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'navigate' event of this <code>sap.m.SplitView</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#detachNavigate
 * @function
 */


/**
 * Fire event navigate to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitView#fireNavigate
 * @function
 */

/**
 * afterNavigate 
 *
 * @name sap.m.SplitView#afterNavigate
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterNavigate' event of this <code>sap.m.SplitView</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SplitView</code>.<br/> itself. 
 *  
 * afterNavigate 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SplitView</code>.<br/> itself.
 *
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#attachAfterNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterNavigate' event of this <code>sap.m.SplitView</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SplitView#detachAfterNavigate
 * @function
 */


/**
 * Fire event afterNavigate to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SplitView} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SplitView#fireAfterNavigate
 * @function
 */

/**
 * navigate to given master page
 *
 * @name sap.m.SplitView.prototype.toMaster
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

 * @type sap.m.SplitView
 * @public
 */


/**
 * navigate to given detail page
 *
 * @name sap.m.SplitView.prototype.toDetail
 * @function

 * @type sap.m.SplitView
 * @public
 */


/**
 * navigate back within MasterView
 *
 * @name sap.m.SplitView.prototype.backMaster
 * @function

 * @type sap.m.SplitView
 * @public
 */


/**
 * navigate back within DetailView
 *
 * @name sap.m.SplitView.prototype.backDetail
 * @function

 * @type sap.m.SplitView
 * @public
 */


// Start of sap\m\SplitView.js
