/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.NavContainer.
jQuery.sap.declare("sap.m.NavContainer");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new NavContainer.
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
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getDefaultTransitionName defaultTransitionName} : string (default: "slide")</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getPages pages} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getInitialPage initialPage} : string | sap.ui.core.Control</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.NavContainer#event:navigate navigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.NavContainer#event:afterNavigate afterNavigate} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The NavContainer control handles hierarchic navigation between Pages or other fullscreen controls.
 * 
 * All children of this control will receive navigation events like {@link sap.m.NavContainerChild#beforeShow beforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.NavContainer
 */
sap.ui.core.Control.extend("sap.m.NavContainer", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"to", "back", "backToPage", "backToTop", "getPage", "getCurrentPage", "getPreviousPage", "addCustomTransition"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"defaultTransitionName" : {type : "string", group : "Appearance", defaultValue : "slide"}
	},
	defaultAggregation : "pages",
	aggregations : {
    	"pages" : {type : "sap.ui.core.Control", multiple : true, singularName : "page"}
	},
	associations : {
		"initialPage" : {type : "sap.ui.core.Control", multiple : false}
	},
	events : {
		"navigate" : {allowPreventDefault : true}, 
		"afterNavigate" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.NavContainer with name <code>sClassName</code> 
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
 * @name sap.m.NavContainer.extend
 * @function
 */

sap.m.NavContainer.M_EVENTS = {'navigate':'navigate','afterNavigate':'afterNavigate'};


/**
 * Getter for property <code>height</code>.
 * The height of the NavContainer. Can be changed when the NavContainer should not cover the whole available area.
 *
 * Default value is <code>'100%'</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.m.NavContainer#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>'100%'</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#setHeight
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * The width of the NavContainer. Can be changed when the NavContainer should not cover the whole available area.
 *
 * Default value is <code>'100%'</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.NavContainer#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>'100%'</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#setWidth
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Whether the NavContainer is visible.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.NavContainer#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#setVisible
 * @function
 */

/**
 * Getter for property <code>defaultTransitionName</code>.
 * The type of the transition/animation to apply when "to()" is called without defining the transition to use. The default is "slide", other options are: "fade" and "show" and the names of any registered custom transitions.
 *
 * Default value is <code>"slide"</code>
 *
 * @return {string} the value of property <code>defaultTransitionName</code>
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#getDefaultTransitionName
 * @function
 */


/**
 * Setter for property <code>defaultTransitionName</code>.
 *
 * Default value is <code>"slide"</code> 
 *
 * @param {string} sDefaultTransitionName  new value for property <code>defaultTransitionName</code>
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#setDefaultTransitionName
 * @function
 */
	
/**
 * Getter for aggregation <code>pages</code>.<br/>
 * The content entities between which this NavContainer navigates. These can be of type sap.m.Page, sap.m.Carousel or any other control with fullscreen/page semantics.
 * 
 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#beforeShow beforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}
 * 
 * 
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.NavContainer#getPages
 * @function
 */

/**
 * Inserts a page into the aggregation named <code>pages</code>.
 *
 * @param {sap.ui.core.Control}
 *          oPage the page to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the page should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the page is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the page is inserted at 
 *             the last position        
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#insertPage
 * @function
 */


/**
 * Adds some page <code>oPage</code> 
 * to the aggregation named <code>pages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oPage the page to add; if empty, nothing is inserted
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#addPage
 * @function
 */


/**
 * Removes an page from the aggregation named <code>pages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vPage the page to remove or its index or id
 * @return {sap.ui.core.Control} the removed page or null
 * @public
 * @name sap.m.NavContainer#removePage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>pages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.NavContainer#removeAllPages
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>pages</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oPage the page whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.NavContainer#indexOfPage
 * @function
 */


/**
 * Destroys all the pages in the aggregation 
 * named <code>pages</code>.
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#destroyPages
 * @function
 */

/**
 * This association can be used to define which page is displayed initially. If the given page does not exist or no page is given, the first page which has been added is considered as initial page.
 * This value should be set initially and not set/modified while the application is running.
 * 
 * This could be used not only for the initial display, but also if the user wants to navigate "up to top", so this page serves as a sort of "home/root page".
 *
 * @return {string} Id of the element which is the current target of the <code>initialPage</code> association, or null
 * @public
 * @name sap.m.NavContainer#getInitialPage
 * @function
 */


/**
 * This association can be used to define which page is displayed initially. If the given page does not exist or no page is given, the first page which has been added is considered as initial page.
 * This value should be set initially and not set/modified while the application is running.
 * 
 * This could be used not only for the initial display, but also if the user wants to navigate "up to top", so this page serves as a sort of "home/root page".
 *
 * @param {string | sap.ui.core.Control} vInitialPage 
 *    Id of an element which becomes the new target of this <code>initialPage</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.NavContainer#setInitialPage
 * @function
 */

/**
 * The event is fired when navigation between two pages has been triggered. The transition (if any) to the new page has not started yet.
 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation. 
 *
 * @name sap.m.NavContainer#navigate
 * @event
 * @since 1.7.1
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.from The page which was shown before the current navigation.
 * @param {string} oControlEvent.getParameters.fromId The ID of the page which was shown before the current navigation.
 * @param {sap.ui.core.Control} oControlEvent.getParameters.to The page which will be shown after the current navigation.
 * @param {string} oControlEvent.getParameters.toId The ID of the page which will be shown after the current navigation.
 * @param {boolean} oControlEvent.getParameters.firstTime Whether the "to" page (more precisely: a control with the ID of the page which is currently navigated to) has not been shown/navigated to before.
 * @param {boolean} oControlEvent.getParameters.isTo Whether this is a forward navigation, triggered by "to()".
 * @param {boolean} oControlEvent.getParameters.isBack Whether this is a back navigation, triggered by "back()".
 * @param {boolean} oControlEvent.getParameters.isBackToTop Whether this is a navigation to the root page, triggered by "backToTop()".
 * @param {boolean} oControlEvent.getParameters.isBackToPage Whether this was a navigation to the root page, triggered by "backToTop()".
 * @param {string} oControlEvent.getParameters.direction How the navigation was triggered, possible values are "to", "back", and "backToTop".
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'navigate' event of this <code>sap.m.NavContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.NavContainer</code>.<br/> itself. 
 *  
 * The event is fired when navigation between two pages has been triggered. The transition (if any) to the new page has not started yet.
 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.NavContainer</code>.<br/> itself.
 *
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#attachNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'navigate' event of this <code>sap.m.NavContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#detachNavigate
 * @function
 */


/**
 * Fire event navigate to attached listeners.
 *
 * Listeners may prevent the default action of this event using the preventDefault-method on the event object.
 * * 
 * Expects following event parameters:
 * <ul>
 * <li>'from' of type <code>sap.ui.core.Control</code> The page which was shown before the current navigation.</li>
 * <li>'fromId' of type <code>string</code> The ID of the page which was shown before the current navigation.</li>
 * <li>'to' of type <code>sap.ui.core.Control</code> The page which will be shown after the current navigation.</li>
 * <li>'toId' of type <code>string</code> The ID of the page which will be shown after the current navigation.</li>
 * <li>'firstTime' of type <code>boolean</code> Whether the "to" page (more precisely: a control with the ID of the page which is currently navigated to) has not been shown/navigated to before.</li>
 * <li>'isTo' of type <code>boolean</code> Whether this is a forward navigation, triggered by "to()".</li>
 * <li>'isBack' of type <code>boolean</code> Whether this is a back navigation, triggered by "back()".</li>
 * <li>'isBackToTop' of type <code>boolean</code> Whether this is a navigation to the root page, triggered by "backToTop()".</li>
 * <li>'isBackToPage' of type <code>boolean</code> Whether this was a navigation to the root page, triggered by "backToTop()".</li>
 * <li>'direction' of type <code>string</code> How the navigation was triggered, possible values are "to", "back", and "backToTop".</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {boolean} whether to prevent the default action
 * @protected
 * @since 1.7.1
 * @name sap.m.NavContainer#fireNavigate
 * @function
 */

/**
 * The event is fired when navigation between two pages has completed. In case of animated transitions this event is fired with some delay after the "navigate" event. 
 *
 * @name sap.m.NavContainer#afterNavigate
 * @event
 * @since 1.7.1
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.from The page which had been shown before navigation.
 * @param {string} oControlEvent.getParameters.fromId The ID of the page which had been shown before navigation.
 * @param {sap.ui.core.Control} oControlEvent.getParameters.to The page which is now shown after navigation.
 * @param {string} oControlEvent.getParameters.toId The ID of the page which is now shown after navigation.
 * @param {boolean} oControlEvent.getParameters.firstTime Whether the "to" page (more precisely: a control with the ID of the page which has been navigated to) had not been shown/navigated to before.
 * @param {boolean} oControlEvent.getParameters.isTo Whether was a forward navigation, triggered by "to()".
 * @param {boolean} oControlEvent.getParameters.isBack Whether this was a back navigation, triggered by "back()".
 * @param {boolean} oControlEvent.getParameters.isBackToTop Whether this was a navigation to the root page, triggered by "backToTop()".
 * @param {boolean} oControlEvent.getParameters.isBackToPage Whether this was a navigation to the root page, triggered by "backToTop()".
 * @param {string} oControlEvent.getParameters.direction How the navigation was triggered, possible values are "to", "back", and "backToTop".
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterNavigate' event of this <code>sap.m.NavContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.NavContainer</code>.<br/> itself. 
 *  
 * The event is fired when navigation between two pages has completed. In case of animated transitions this event is fired with some delay after the "navigate" event. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.NavContainer</code>.<br/> itself.
 *
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#attachAfterNavigate
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterNavigate' event of this <code>sap.m.NavContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @public
 * @since 1.7.1
 * @name sap.m.NavContainer#detachAfterNavigate
 * @function
 */


/**
 * Fire event afterNavigate to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'from' of type <code>sap.ui.core.Control</code> The page which had been shown before navigation.</li>
 * <li>'fromId' of type <code>string</code> The ID of the page which had been shown before navigation.</li>
 * <li>'to' of type <code>sap.ui.core.Control</code> The page which is now shown after navigation.</li>
 * <li>'toId' of type <code>string</code> The ID of the page which is now shown after navigation.</li>
 * <li>'firstTime' of type <code>boolean</code> Whether the "to" page (more precisely: a control with the ID of the page which has been navigated to) had not been shown/navigated to before.</li>
 * <li>'isTo' of type <code>boolean</code> Whether was a forward navigation, triggered by "to()".</li>
 * <li>'isBack' of type <code>boolean</code> Whether this was a back navigation, triggered by "back()".</li>
 * <li>'isBackToTop' of type <code>boolean</code> Whether this was a navigation to the root page, triggered by "backToTop()".</li>
 * <li>'isBackToPage' of type <code>boolean</code> Whether this was a navigation to the root page, triggered by "backToTop()".</li>
 * <li>'direction' of type <code>string</code> How the navigation was triggered, possible values are "to", "back", and "backToTop".</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.NavContainer} <code>this</code> to allow method chaining
 * @protected
 * @since 1.7.1
 * @name sap.m.NavContainer#fireAfterNavigate
 * @function
 */

/**
 * Navigates to the next page (with drill-down semantic) with the given (or default) animation. This creates a new history item inside the NavContainer and allows going back.
 * 
 * Available transitions currently include "slide" (default), "fade", "flip", and "show". None of these is currently making use of any given transitionParameters.
 * 
 * Calling this navigation method triggers first the (cancelable) "navigate" event on the NavContainer, then the "beforeHide" pseudo event on the source page and "beforeFirstShow" (if applicable) and"beforeShow" on the target page. Later - after the transition has completed - the "afterShow" pseudo event is triggered on the target page and "afterHide" on the page which has been left. The given data object is available in the "beforeFirstShow", "beforeShow" and "afterShow" event object as "data" property.
 *
 * @name sap.m.NavContainer.prototype.to
 * @function
 * @param {string} 
 *         sPageId
 *         The screen to which drilldown should happen. The ID or the control itself can be given.
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

 * @type sap.m.NavContainer
 * @public
 */


/**
 * Navigates back one level. If already on the initial page and there is no place to go back, nothing happens.
 * 
 * Calling this navigation method triggers first the (cancelable) "navigate" event on the NavContainer, then the "beforeHide" pseudo event on the source page and "beforeFirstShow" (if applicable) and"beforeShow" on the target page. Later - after the transition has completed - the "afterShow" pseudo event is triggered on the target page and "afterHide" on the page which has been left. The given backData object is available in the "beforeFirstShow", "beforeShow" and "afterShow" event object as "data" property. The original "data" object from the "to" navigation is also available in these event objects.
 *
 * @name sap.m.NavContainer.prototype.back
 * @function
 * @param {object} 
 *         oBackData

 * @since 1.7.1 *         This optional object can carry any payload data which should be made available to the target page of the back navigation. The event on the target page will contain this data object as "backData" property. (The original data from the "to()" navigation will still be available as "data" property.)
 * 
 * In scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
 * For back navigation this can be used e.g. when returning from a detail page to transfer any settings done there.
 * 
 * When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
 * @param {object} 
 *         oTransitionParameters

 * @since 1.7.1 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
 * The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
 * 
 * In order to use the "transitionParameters" property, the "data" property must be used (at least "null" must be given) for a proper parameter order.
 * 
 * NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.

 * @type sap.m.NavContainer
 * @public
 */


/**
 * Navigates back to the nearest previous page in the NavContainer history with the given ID. If there is no such page among the previous pages, nothing happens.
 * The transition effect which had been used to get to the current page is inverted and used for this navigation.
 * 
 * Calling this navigation method triggers first the (cancelable) "navigate" event on the NavContainer, then the "beforeHide" pseudo event on the source page and "beforeFirstShow" (if applicable) and"beforeShow" on the target page. Later - after the transition has completed - the "afterShow" pseudo event is triggered on the target page and "afterHide" on the page which has been left. The given backData object is available in the "beforeFirstShow", "beforeShow" and "afterShow" event object as "data" property. The original "data" object from the "to" navigation is also available in these event objects.
 *
 * @name sap.m.NavContainer.prototype.backToPage
 * @function
 * @param {string} 
 *         sPageId
 *         The ID of the screen to which back navigation should happen. The nearest page with this ID among the previous pages in the history stack will be used.
 * @param {object} 
 *         oBackData
 *         This optional object can carry any payload data which should be made available to the target page of the "backToPage" navigation. The event on the target page will contain this data object as "backData" property.
 * 
 * When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
 * @param {object} 
 *         oTransitionParameters
 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
 * The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
 * 
 * In order to use the "transitionParameters" property, the "data" property must be used (at least "null" must be given) for a proper parameter order.
 * 
 * NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.

 * @type sap.m.NavContainer
 * @public
 * @since 1.7.2
 */


/**
 * Navigates back to the initial/top level (this is the element aggregated as "initialPage", or the first added element). If already on the initial page, nothing happens.
 * The transition effect which had been used to get to the current page is inverted and used for this navigation.
 * 
 * Calling this navigation method triggers first the (cancelable) "navigate" event on the NavContainer, then the "beforeHide" pseudo event on the source page and "beforeFirstShow" (if applicable) and"beforeShow" on the target page. Later - after the transition has completed - the "afterShow" pseudo event is triggered on the target page and "afterHide" on the page which has been left. The given backData object is available in the "beforeFirstShow", "beforeShow" and "afterShow" event object as "data" property.
 *
 * @name sap.m.NavContainer.prototype.backToTop
 * @function
 * @param {object} 
 *         oBackData
 *         This optional object can carry any payload data which should be made available to the target page of the "backToTop" navigation. The event on the target page will contain this data object as "backData" property.
 * 
 * When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
 * @param {object} 
 *         oTransitionParameters
 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
 * The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
 * 
 * In order to use the "transitionParameters" property, the "data" property must be used (at least "null" must be given) for a proper parameter order.
 * 
 * NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.

 * @type sap.m.NavContainer
 * @public
 * @since 1.7.1
 */


/**
 * Returns the control with the given ID from the "pages" aggregation (if available).
 *
 * @name sap.m.NavContainer.prototype.getPage
 * @function
 * @param {string} 
 *         sId
 *         The ID of the aggregated control to find.

 * @type sap.ui.core.Control
 * @public
 */


/**
 * Returns the currently displayed page-level control.
 *
 * @name sap.m.NavContainer.prototype.getCurrentPage
 * @function

 * @type sap.ui.core.Control
 * @public
 */


/**
 * Returns the previous page (the page from which the user drilled down to the current page with "to()").
 * Note: this is not the page which the user has seen before, but the page which is the target of the next "back()" navigation.
 * If there is no previous page, "undefined" is returned.
 *
 * @name sap.m.NavContainer.prototype.getPreviousPage
 * @function

 * @type sap.ui.core.Control
 * @public
 * @since 1.7.1
 */


/**
 * Adds a custom transition to the NavContainer type (not to a particular instance!). The transition is identified by a "name". Make sure to only use names that will not collide with transitions which may be added to the NavContainer later. A suggestion is to use the prefix "c_" or "_" for your custom transitions to ensure this.
 * 
 * "to" and "back" are the transition functions for the forward and backward navigation.
 * Both will be called with the following parameters:
 * - oFromPage: the Control which is currently being displayed by the NavContainer
 * - oToPage: the Control which should be displayed by the NavContainer after the transition
 * - fCallback: a function which MUST be called when the transition has completed
 * - oTransitionParameters: a data object that can be given by application code when triggering the transition by calling to() or back(); this object could give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration
 * 
 * The contract for "to" and "back" is that they may do an animation of their choice, but it should not take "too long". At the beginning of the transition the target page "oToPage" does have the CSS class "sapMNavItemHidden" which initially hides the target page (visibility:hidden). The transition can do any preparation (e.g. move that page out of the screen or make it transparent) and then should remove this CSS class.
 * After the animation the target page "oToPage" should cover the entire screen and the source page "oFromPage" should not be visible anymore. This page should then have the CSS class "sapMNavItemHidden".
 * For adding/removing this or other CSS classes, the transition can use the addStyleClass/removeStyleClass method:
 * oFromPage.addStyleClass("sapMNavItemHidden");
 * When the transition is complete, it MUST call the given fCallback method to inform the NavContainer that navigation has finished!
 * 
 * Hint: if the target page of your transition stays black on iPhone, try wrapping the animation start into a
 * setTimeout(..., 0)
 * block (delayed, but without waiting).
 * 
 * This method can be called on any NavContainer instance or statically on the sap.m.NavContainer type. However, the transition will always be registered for the type (and ALL instances), not for the single instance on which this method was invoked.
 * 
 * Returns the sap.m.NavContainer type if called statically, or "this" (to allow method chaining) if called on a particular NavContainer instance.
 *
 * @name sap.m.NavContainer.prototype.addCustomTransition
 * @function
 * @param {string} 
 *         sName
 *         The name of the transition. This name can be used by the application to choose this transition when navigating "to()" or "back()": the "transitionName" parameter of "NavContainer.to()" corresponds to this name, the back() navigation will automatically use the same transition.
 * 
 * Make sure to only use names that will not collide with transitions which may be added to the NavContainer later. A suggestion is to use the prefix "c_" or "_" for your custom transitions to ensure this.
 * @param {object} 
 *         oTo
 *         The function which will be called by the NavContainer when the application navigates "to()", using this animation's name.
 * 
 * See the documentation of NavContainer.addCustomTransitions for more details about this function.
 * @param {object} 
 *         oBack
 *         The function which will be called by the NavContainer when the application navigates "back()" from a page where it had navigated to using this animation's name.
 * 
 * See the documentation of NavContainer.addCustomTransitions for more details about this function.

 * @type sap.m.NavContainer
 * @public
 */


// Start of sap\m\NavContainer.js
sap.m.NavContainer.prototype.init = function() {
	this._pageStack = [];
	this._mVisitedPages = {};
	this._iTransitionsCompleted = 0; // to track proper callback at the end of transitions
	this._bNeverRendered = true;
};


sap.m.NavContainer.prototype.onBeforeRendering = function() {
	// for the very first rendering
	if (this._bNeverRendered) { // will be set to false after rendering
		
		// special handling for the page which is the first one which is rendered in this NavContainer
		var pageToRenderFirst = this.getCurrentPage();
		var pageId = pageToRenderFirst.getId();
		
		if (!this._mVisitedPages[pageId]) { // events could already be fired by initial "to()" call 
			this._mVisitedPages[pageId] = true;
			
			var oNavInfo = {
					from:null,
					fromId:null,
					to:pageToRenderFirst,
					toId:pageId,
					firstTime:true,
					isTo:false,
					isBack:false,
					isBackToPage:false,
					isBackToTop:false,
					direction:"initial"
			};
			
			var oEvent = jQuery.Event("BeforeFirstShow", oNavInfo);
			oEvent.srcControl = this;
			oEvent.data = {};
			oEvent.backData = {};
			pageToRenderFirst._handleEvent(oEvent);
			
			oEvent = jQuery.Event("BeforeShow", oNavInfo);
			oEvent.srcControl = this;
			oEvent.data = {};
			oEvent.backData = {};
			pageToRenderFirst._handleEvent(oEvent);
		}
	}
};

sap.m.NavContainer.prototype.onAfterRendering = function() {
	// for the very first rendering
	if (this._bNeverRendered) {
		this._bNeverRendered = false;
		delete this._bNeverRendered;
		
		// special handling for the page which is the first one which is rendered in this NavContainer
		var pageToRenderFirst = this.getCurrentPage();
		var pageId = pageToRenderFirst.getId();
		
		var oNavInfo = {
				from:null,
				fromId:null,
				to:pageToRenderFirst,
				toId:pageId,
				firstTime:true,
				isTo:false,
				isBack:false,
				isBackToTop:false,
				isBackToPage:false,
				direction:"initial"
		};
		
		var oEvent = jQuery.Event("AfterShow", oNavInfo);
		oEvent.srcControl = this;
		oEvent.data = {};
		oEvent.backData = {};
		pageToRenderFirst._handleEvent(oEvent);
	}
};

/**
 * Returns the page that should act as initial page - either the one designated as such, or, if it does not exist,
 * the first page (index 0 in the aggregation). Returns null if no page is aggregated.
 *
 * @private
 */
sap.m.NavContainer.prototype._getActualInitialPage = function() {
	var pageId = this.getInitialPage();
	if (pageId) {
		var page = sap.ui.getCore().byId(pageId);
		if (page) {
			return page;
		} else {
			jQuery.sap.log.error("NavContainer: control with ID '" + pageId + "' was set as 'initialPage' but was not found as a DIRECT child of this NavContainer (number of current children: " + this.getPages().length + ").");
		}
	}
	var pages = this.getPages();
	return (pages.length > 0 ? pages[0] : null);
};


//*** API methods ***

sap.m.NavContainer.prototype.getPage = function(pageId) {
	var aPages = this.getPages();
	for (var i = 0; i < aPages.length; i++) {
		if (aPages[i] && (aPages[i].getId() == pageId)) {
			return aPages[i];
		}
	}
	return null;
};


sap.m.NavContainer.prototype._ensurePageStackInitialized = function() {
	if (this._pageStack.length === 0) {
		var page = this._getActualInitialPage(); // TODO: with bookmarking / deep linking this is the initial, but not the "home"/root page
		this._pageStack.push({id:page.getId(), mode:"initial", data:{}});
	}
	return this._pageStack;
};

sap.m.NavContainer.prototype.getCurrentPage = function() {
	var stack = this._ensurePageStackInitialized();

	return this.getPage(stack[stack.length-1].id);
};

sap.m.NavContainer.prototype.getPreviousPage = function() {
	var stack = this._ensurePageStackInitialized();
	
	if (stack.length > 1) {
		return this.getPage(stack[stack.length-2].id);
		
	} else if (stack.length == 1) { // the current one is the only page on the stack
		return undefined;
		
	} else {
		jQuery.sap.log.error("page stack is empty but should have been initialized");
	}
};


sap.m.NavContainer.prototype._afterTransitionCallback = function(oNavInfo, oData, oBackData) {
	var oEvent = jQuery.Event("AfterShow", oNavInfo);
	oEvent.data = oData || {};
	oEvent.backData = oBackData || {};
	oEvent.srcControl = this; // store the element on the event (aligned with jQuery syntax)
	oNavInfo.to._handleEvent(oEvent);
	
	oEvent = jQuery.Event("AfterHide", oNavInfo);
	oEvent.srcControl = this; // store the element on the event (aligned with jQuery syntax)
	oNavInfo.from._handleEvent(oEvent);
	
	this._iTransitionsCompleted++;
	this._bNavigating = false;
	
	this.fireAfterNavigate(oNavInfo);
	// TODO: destroy HTML? Remember to destroy ALL HTML of several pages when backToTop has been called
};


sap.m.NavContainer.prototype.to = function(pageId, transitionName, data, oTransitionParameters) {
	if (pageId instanceof sap.ui.core.Control) {
		pageId = pageId.getId();
	}

	// fix parameters
	if (typeof(transitionName) !== "string") {
		// transitionName is omitted, shift parameters
		oTransitionParameters = data;
		data = transitionName;
	}
	transitionName = transitionName || this.getDefaultTransitionName();
	oTransitionParameters = oTransitionParameters || {};
	data = data || {};

	// make sure the initial page is on the stack
	this._ensurePageStackInitialized();

	var oFromPage = this.getCurrentPage();
	if (oFromPage && (oFromPage.getId() === pageId)) { // cannot navigate to the page that is already current
		jQuery.sap.log.warning(this.toString() + ": Cannot navigate to page " + pageId + " because this is the current page.");
		return this;
	}
	if (this._bNavigating) {
		jQuery.sap.log.warning(this.toString() + ": Cannot navigate to page " + pageId + " because another navigation is already in progress.");
		return this;
	}
	var oToPage = this.getPage(pageId);

	if (oToPage) {
		
		var oNavInfo = {
				from:oFromPage,
				fromId:oFromPage.getId(),
				to:oToPage,
				toId:pageId,
				firstTime:!this._mVisitedPages[pageId],
				isTo:true,
				isBack:false,
				isBackToTop:false,
				isBackToPage:false,
				direction:"to"
		};
		var bContinue = this.fireNavigate(oNavInfo);
		if (bContinue) { // ok, let's do the navigation
		
			// TODO: let one of the pages also cancel navigation?
			var oEvent = jQuery.Event("BeforeHide", oNavInfo);
			oEvent.srcControl = this; // store the element on the event (aligned with jQuery syntax)
			// no data needed for hiding
			oFromPage._handleEvent(oEvent);
			
			if (!this._mVisitedPages[pageId]) { // if this page has not been shown before
				oEvent = jQuery.Event("BeforeFirstShow", oNavInfo);
				oEvent.srcControl = this;
				oEvent.data = data || {};
				oEvent.backData = {};
				oToPage._handleEvent(oEvent);
			}
			
			oEvent = jQuery.Event("BeforeShow", oNavInfo);
			oEvent.srcControl = this;
			oEvent.data = data || {};
			oEvent.backData = {};
			oToPage._handleEvent(oEvent);

			
			this._pageStack.push({id:pageId,mode:transitionName,data:data}); // this actually causes/is the navigation
			this._mVisitedPages[pageId] = true;
	
			if (!this.getDomRef()) { // the wanted animation has been recorded, but when the NavContainer is not rendered, we cannot animate, so just return
				jQuery.sap.log.info("'Hidden' 'to' navigation in not-rendered NavContainer " + this.toString());
				return this;
			}
	
			// render the page that should get visible
			var oToPageDomRef;
			if (!(oToPageDomRef = oToPage.getDomRef()) || sap.ui.core.RenderManager.isPreservedContent(oToPageDomRef)) {
				oToPage.addStyleClass("sapMNavItemRendering");
				jQuery.sap.log.debug("Rendering 'to' page '" + oToPage.toString() + "' for 'to' navigation");
				var rm = sap.ui.getCore().createRenderManager();
				rm.render(oToPage, this.getDomRef());
				rm.destroy();
				oToPage.addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemRendering");
			}
	
			var oTransition = sap.m.NavContainer.transitions[transitionName] || sap.m.NavContainer.transitions["slide"];
	
			// Track proper invocation of the callback  TODO: only do this during development?
			var iCompleted = this._iTransitionsCompleted;
			var that = this;
			window.setTimeout(function(){
				if (that && (that._iTransitionsCompleted < iCompleted + 1)) {
					jQuery.sap.log.warning("Transition '" + transitionName + "' 'to' was triggered five seconds ago, but has not yet invoked the end-of-transition callback.");
				}
			}, 5000);
	
			this._bNavigating = true;
			oTransition.to(oFromPage, oToPage, jQuery.proxy(function(){this._afterTransitionCallback(oNavInfo, data);}, this), oTransitionParameters); // trigger the transition
			
		} else {
			jQuery.sap.log.info("Navigation to page with ID '" + pageId + "' has been aborted by the application");
		}

	} else {
		jQuery.sap.log.warning("Navigation triggered to page with ID '" + pageId + "', but this page is not known/aggregated by " + this);
	}
	return this;
};

// TODO: track and queue invalidations occurring during the animation


sap.m.NavContainer.prototype.back = function(backData, oTransitionParameters) {
	this._backTo("back", backData, oTransitionParameters);
	return this;
};

sap.m.NavContainer.prototype.backToPage = function(pageId, backData, oTransitionParameters) {
	this._backTo("backToPage", backData, oTransitionParameters, pageId);
	return this;
};

sap.m.NavContainer.prototype.backToTop = function(backData, oTransitionParameters) {
	this._backTo("backToTop", backData, oTransitionParameters);
	return this;
};


sap.m.NavContainer.prototype._backTo = function(sType, backData, oTransitionParameters, sRequestedPageId) {
	if (this._pageStack.length <= 1) {
		// there is no place to go back

		// but then the assumption is that the only page on the stack is the initial one and has not been navigated to. Check this:
		if (this._pageStack.length === 1 && this._pageStack[0].mode != "initial") {
			throw new Error("Initial page not found on the stack. How did this happen?");
		}
		return this;

	} else { // normal back navigation
		if (this._bNavigating) {
			jQuery.sap.log.warning(this.toString() + ": Cannot navigate back because another navigation is already in progress.");
			return this;
		}
		
		var oFromPageInfo = this._pageStack[this._pageStack.length-1];
		var mode = oFromPageInfo.mode;
		var oFromPage = this.getPage(oFromPageInfo.id);
		var oToPage;
		var oToPageData;
		
		if (sType === "backToTop") {
			oToPage = this._getActualInitialPage();
			oToPageData = null;
			
		} else if (sType === "backToPage") {
			var info = this._findClosestPreviousPageInfo(sRequestedPageId);
			if (!info) {
				jQuery.sap.log.error(this.toString() + ": Cannot navigate backToPage('" + sRequestedPageId + "') because target page was not found among the previous pages.");
				return this;
			}
			oToPage = sap.ui.getCore().byId(info.id);
			if (!oToPage) {
				jQuery.sap.log.error(this.toString() + ": Cannot navigate backToPage('" + sRequestedPageId + "') because target page does not exist anymore.");
				return this;
			}
			oToPageData = info.data;
			
		} else { // normal "back"
			oToPage = this.getPreviousPage();
			oToPageData = this._pageStack[this._pageStack.length-2].data;
		}
		
		if(!oToPage) {
			jQuery.sap.log.error("NavContainer back navigation: target page is not defined or not aggregated by this NavContainer. Aborting navigation.");
			return;
		}

		var oToPageId = oToPage.getId();
		backData = backData || {};
		oTransitionParameters = oTransitionParameters || {};
		
		var oNavInfo = {
			from:oFromPage,
			fromId:oFromPage.getId(),
			to:oToPage,
			toId:oToPageId,
			firstTime:!this._mVisitedPages[oToPageId],
			isTo:false,
			isBack:(sType === "back"),
			isBackToPage:(sType === "backToPage"),
			isBackToTop:(sType === "backToTop"),
			direction:sType
		};
		var bContinue = this.fireNavigate(oNavInfo);
		if (bContinue) { // ok, let's do the navigation
			
			var oEvent = jQuery.Event("BeforeHide", oNavInfo);
			oEvent.srcControl = this; // store the element on the event (aligned with jQuery syntax)
			// no data needed for hiding
			oFromPage._handleEvent(oEvent);
			
			if (!this._mVisitedPages[oToPageId]) { // if this page has not been shown before
				oEvent = jQuery.Event("BeforeFirstShow", oNavInfo);
				oEvent.srcControl = this;
				oEvent.backData = backData || {};
				// the old data from the forward navigation should not exist because there was never a forward navigation
				oEvent.data = {};
				oToPage._handleEvent(oEvent);
			}
			
			oEvent = jQuery.Event("BeforeShow", oNavInfo);
			oEvent.srcControl = this;
			oEvent.backData = backData || {};
			oEvent.data =  oToPageData || {}; // the old data from the forward navigation
			oToPage._handleEvent(oEvent);

			this._pageStack.pop(); // this actually causes/is the navigation
			this._mVisitedPages[oToPageId] = true;
			
			if (sType === "backToTop") { // if we should navigate to top, just clean up the whole stack
				this._pageStack = [];
				this.getCurrentPage(); // this properly restores the initial page on the stack
				
			} else if (sType === "backToPage") {
				while (this._pageStack[this._pageStack.length-1].id !== sRequestedPageId) { // by now it is guaranteed that we will find it
					this._pageStack.pop();
				}
			}

			if (!this.getDomRef()) { // the wanted animation has been recorded, but when the NavContainer is not rendered, we cannot animate, so just return
				jQuery.sap.log.info("'Hidden' back navigation in not-rendered NavContainer " + this.toString());
				return this;
			}
	
			var oTransition = sap.m.NavContainer.transitions[mode] || sap.m.NavContainer.transitions["slide"];
	
			// Track proper invocation of the callback  TODO: only do this during development?
			var iCompleted = this._iTransitionsCompleted;
			var that = this;
			window.setTimeout(function(){
				if (that && (that._iTransitionsCompleted < iCompleted + 1)) {
					jQuery.sap.log.warning("Transition '" + mode + "' 'back' was triggered five seconds ago, but has not yet invoked the end-of-transition callback.");
				}
			}, 5000);
			
			this._bNavigating = true;
			
			// make sure the to-page is rendered
			var oToPageDomRef;
			if (!(oToPageDomRef = oToPage.getDomRef()) || sap.ui.core.RenderManager.isPreservedContent(oToPageDomRef)) {
				oToPage.addStyleClass("sapMNavItemRendering");
				jQuery.sap.log.debug("Rendering 'to' page '" + oToPage.toString() + "' for back navigation");
				var rm = sap.ui.getCore().createRenderManager();
				var childPos = this.$().children().index(oFromPage.getDomRef());
				rm.renderControl(oToPage);
				rm.flush(this.getDomRef(), false, childPos);
				rm.destroy();
				oToPage.addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemRendering");
			}
			
			// trigger the transition
			oTransition.back(oFromPage, oToPage, jQuery.proxy(function(){this._afterTransitionCallback(oNavInfo, oToPageData, backData);}, this), oTransitionParameters); // trigger the transition
		}
	}
	return this;
};

sap.m.NavContainer.prototype._findClosestPreviousPageInfo = function(sRequestedPreviousPageId) {
	for (var i = this._pageStack.length-2; i >= 0; i--) {
		var info = this._pageStack[i];
		if (info.id === sRequestedPreviousPageId) {
			return info;
		}
	}
	return null;
};


sap.m.NavContainer.transitions = sap.m.NavContainer.transitions || {}; // make sure the object exists


//*** SHOW Transition ***

sap.m.NavContainer.transitions["show"] = {
	to: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		oToPage.removeStyleClass("sapMNavItemHidden"); // remove the "hidden" class which has been added by the NavContainer before the transition was called
		oFromPage.addStyleClass("sapMNavItemHidden");
		fCallback();
	},
	
	back: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		oToPage.removeStyleClass("sapMNavItemHidden");
		oFromPage.addStyleClass("sapMNavItemHidden"); // instantly hide the previous page
		fCallback();
	}
};


//*** SLIDE Transition ***

sap.m.NavContainer.transitions["slide"] = {

	to: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		oFromPage.addStyleClass("sapMNavItemCenter");
		window.setTimeout(function(){ // iPhone seems to need a zero timeout here, otherwise the to page is black (and may suddenly become visible when the DOM is touched)
		
			// set the style classes that represent the initial state
			oToPage.addStyleClass("sapMNavItemRight");     // the page to navigate to should be placed just right of the visible area
			oToPage.removeStyleClass("sapMNavItemHidden"); // remove the "hidden" class now which has been added by the NavContainer before the animation was called
			
	
			// iPhone needs some time... there is no animation without waiting
			window.setTimeout(function(){
				
				var bOneTransitionFinished = false;
				var fAfterTransition = null; // make Eclipse aware that this variable is defined
				fAfterTransition = function() {
					if (!bOneTransitionFinished) {
						// the first one of both transitions finished
						bOneTransitionFinished = true;
					} else {
						// the second transition now also finished => clean up
						oFromPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
						oToPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
						
						// clean up the style classes
						oToPage.removeStyleClass("sapMNavItemSliding").removeStyleClass("sapMNavItemCenter");
						oFromPage.removeStyleClass("sapMNavItemSliding").addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemLeft");
	
						// notify the NavContainer that the animation is complete
						fCallback();
					}
				};
				
				oFromPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				oToPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				
				// set the new style classes that represent the end state (and thus start the transition)
				oToPage.addStyleClass("sapMNavItemSliding").addStyleClass("sapMNavItemCenter").removeStyleClass("sapMNavItemRight");
				oFromPage.addStyleClass("sapMNavItemSliding").removeStyleClass("sapMNavItemCenter").addStyleClass("sapMNavItemLeft");
	
			}, 60); // this value has been found by testing on actual devices; with "10" there are frequent "no-animation" issues, with "100" there are none, with "50" there are very few
		
		},0); // iPhone seems to need a zero timeout here, otherwise the to page is black (and may suddenly become visible when the DOM is touched)
	},

	back: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		// set the style classes that represent the initial state
		oToPage.addStyleClass("sapMNavItemLeft");     // the page to navigate back to should be placed just left of the visible area
		oToPage.removeStyleClass("sapMNavItemHidden"); // remove the "hidden" class now which has been added by the NavContainer before the animation was called
		oFromPage.addStyleClass("sapMNavItemCenter");

		// iPhone needs some time... there is no animation without waiting
		window.setTimeout(function() {
			
			var bOneTransitionFinished = false;
			var fAfterTransition = null; // make Eclipse aware that this variable is defined
			fAfterTransition = function() {
				if (!bOneTransitionFinished) {
					// the first one of both transitions finished
					bOneTransitionFinished = true;
				} else {
					// the second transition now also finished => clean up
					oFromPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					oToPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					
					// clean up the style classes
					oToPage.removeStyleClass("sapMNavItemSliding").removeStyleClass("sapMNavItemCenter");
					oFromPage.removeStyleClass("sapMNavItemSliding").addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemRight");

					// notify the NavContainer that the animation is complete
					fCallback();
				}
			};
			
			oFromPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
			oToPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
			
			// set the new style classes that represent the end state (and thus start the transition)
			oToPage.addStyleClass("sapMNavItemSliding").addStyleClass("sapMNavItemCenter").removeStyleClass("sapMNavItemLeft"); // transition from left position to normal/center position starts now
			oFromPage.addStyleClass("sapMNavItemSliding").removeStyleClass("sapMNavItemCenter").addStyleClass("sapMNavItemRight"); // transition from normal position to right position starts now

		}, 100); // this value has been found by testing on actual devices; with "10" there are frequent "no-animation" issues, with "100" there are none, with "50" there are very few
	}
};


//*** FADE Transition ***

sap.m.NavContainer.transitions["fade"] = {

		to: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
			// set the style classes that represent the initial state
			oToPage.addStyleClass("sapMNavItemTransparent");
			oToPage.removeStyleClass("sapMNavItemHidden");

			// iPhone needs some time for rendering, there is no animation without waiting
			window.setTimeout(function(){
				
				// the code to be executed after the new page has completed fading in
				var fAfterTransition = null; // make Eclipse aware that this variable is defined
				fAfterTransition = function() {
					oToPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					
					// clean up the style classes
					oFromPage.addStyleClass("sapMNavItemHidden");
					oToPage.removeStyleClass("sapMNavItemFading").removeStyleClass("sapMNavItemOpaque");

					// notify the NavContainer that the animation is complete
					fCallback();
				};
				
				oToPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				
				// set the new style classes that represent the end state (and thus start the transition)
				oToPage.addStyleClass("sapMNavItemFading").removeStyleClass("sapMNavItemTransparent").addStyleClass("sapMNavItemOpaque");
				
			}, 10);
		},

		back: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
			// set the style classes that represent the initial state
			oFromPage.addStyleClass("sapMNavItemOpaque");
			oToPage.removeStyleClass("sapMNavItemHidden");

			// iPhone needs some time for rendering, there is no animation without waiting
			window.setTimeout(function() {
				
				// the code to be executed after the new page has completed fading in
				var fAfterTransition = null; // make Eclipse aware that this variable is defined
				fAfterTransition = function() {
					oFromPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					
					// clean up the style classes
					oFromPage.removeStyleClass("sapMNavItemFading").addStyleClass("sapMNavItemHidden"); // TODO: destroy HTML?
					oFromPage.removeStyleClass("sapMNavItemTransparent");

					// notify the NavContainer that the animation is complete
					fCallback();
				};
				
				oFromPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				
				// set the new style classes that represent the end state (and thus start the transition)
				oFromPage.addStyleClass("sapMNavItemFading").removeStyleClass("sapMNavItemOpaque");
				oFromPage.addStyleClass("sapMNavItemTransparent");

			}, 10);
		}
};


//*** FLIP Transition ***

sap.m.NavContainer.transitions["flip"] = {

	to: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		window.setTimeout(function(){ // iPhone seems to need a zero timeout here, otherwise the to page is black (and may suddenly become visible when the DOM is touched)
		
			// set the style classes that represent the initial state
			oToPage.addStyleClass("sapMNavItemFlipNext");     // the page to navigate to should be placed just right of the visible area
			oToPage.removeStyleClass("sapMNavItemHidden"); // remove the "hidden" class now which has been added by the NavContainer before the animation was called
	
			// iPhone needs some time... there is no animation without waiting
			window.setTimeout(function(){
				
				var bOneTransitionFinished = false;
				var fAfterTransition = null; // make Eclipse aware that this variable is defined
				fAfterTransition = function() {
					if (!bOneTransitionFinished) {
						// the first one of both transitions finished
						bOneTransitionFinished = true;
					} else {
						// the second transition now also finished => clean up
						oFromPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
						oToPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
						
						// clean up the style classes
						oToPage.removeStyleClass("sapMNavItemFlipping");
						oFromPage.removeStyleClass("sapMNavItemFlipping").addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemFlipPrevious");
	
						// notify the NavContainer that the animation is complete
						fCallback();
					}
				};
				
				oFromPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				oToPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
				
				// set the new style classes that represent the end state (and thus start the transition)
				oToPage.addStyleClass("sapMNavItemFlipping").removeStyleClass("sapMNavItemFlipNext");
				oFromPage.addStyleClass("sapMNavItemFlipping").addStyleClass("sapMNavItemFlipPrevious");
	
			}, 60); // this value has been found by testing on actual devices; with "10" there are frequent "no-animation" issues, with "100" there are none, with "50" there are very few#
		}, 0);
	},

	back: function(oFromPage, oToPage, fCallback /*, oTransitionParameters is unused */) {
		// set the style classes that represent the initial state
		oToPage.addStyleClass("sapMNavItemFlipPrevious");     // the page to navigate back to should be placed just left of the visible area
		oToPage.removeStyleClass("sapMNavItemHidden"); // remove the "hidden" class now which has been added by the NavContainer before the animation was called

		// iPhone needs some time... there is no animation without waiting
		window.setTimeout(function() {
			
			var bOneTransitionFinished = false;
			var fAfterTransition = null; // make Eclipse aware that this variable is defined
			fAfterTransition = function() {
				if (!bOneTransitionFinished) {
					// the first one of both transitions finished
					bOneTransitionFinished = true;
				} else {
					// the second transition now also finished => clean up
					oFromPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					oToPage.detachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
					
					// clean up the style classes
					oToPage.removeStyleClass("sapMNavItemFlipping");
					oFromPage.removeStyleClass("sapMNavItemFlipping").addStyleClass("sapMNavItemHidden").removeStyleClass("sapMNavItemFlipNext");

					// notify the NavContainer that the animation is complete
					fCallback();
				}
			};
			
			oFromPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
			oToPage.attachBrowserEvent("webkitTransitionEnd transitionend msTransitionEnd", fAfterTransition);
			
			// set the new style classes that represent the end state (and thus start the transition)
			oToPage.addStyleClass("sapMNavItemFlipping").removeStyleClass("sapMNavItemFlipPrevious"); // transition from left position to normal/center position starts now
			oFromPage.addStyleClass("sapMNavItemFlipping").addStyleClass("sapMNavItemFlipNext"); // transition from normal position to right position starts now

		}, 60); // this value has been found by testing on actual devices; with "10" there are frequent "no-animation" issues, with "100" there are none, with "50" there are very few
	}
};


sap.m.NavContainer.prototype.addCustomTransition = function(sName, fTo, fBack) {
	if (sap.m.NavContainer.transitions[sName]) {
		jQuery.sap.log.warning("Transition with name " + sName + " already exists in " + this + ". It is now being replaced by custom transition.");
	}
	
	sap.m.NavContainer.transitions[sName] = {to:fTo, back:fBack};
	return this;
};
sap.m.NavContainer.addCustomTransition = sap.m.NavContainer.prototype.addCustomTransition;



// ----------------- code for tracking and avoiding invalidation --------------------------

/**
 * Forces invalidation and rerendering (.invalidate() is disabled)
 * @private
 */
sap.m.NavContainer.prototype.forceInvalidation = sap.m.NavContainer.prototype.invalidate;

sap.m.NavContainer.prototype.invalidate = function(oSource) {

	if (oSource == this) {
		// does not happen because the source is only given when propagating to a parent

	} else if (!oSource) {
		// direct invalidation of the NavContainer; this means a property has been modified
		this.forceInvalidation(); // let invalidation occur

	} else if (oSource instanceof sap.ui.core.Control) {
		// an aggregated control is invalidated
		var bIsInPages = false,
			aPages = this.getPages(),
			l = aPages.length;
			
		for (var i = 0; i < l; i++) {
			if (aPages[i] === oSource) {
				bIsInPages = true;
				break;
			}
		}
		
		if (bIsInPages && !(oSource.getId() === this.getCurrentPage())) {
			// the invalidation source is a non-current page, so do not rerender anything
		} else {
			// TODO: there will be more cases where invalidation is not required...
			this.forceInvalidation();
		}
		
	} else { 
		// TODO: which cases are ending up here?
		this.forceInvalidation();
		
	}
};

sap.m.NavContainer.prototype.addPage = function(oPage) {
	oPage.addStyleClass("sapMNavItem");
	this.addAggregation("pages", oPage, true);
	return this;
};

sap.m.NavContainer.prototype.insertPage = function(oPage, iIndex) {
	oPage.addStyleClass("sapMNavItem");
	this.insertAggregation("pages", oPage, true);
	return this;
};



// documentation of the pseudo events (beforeShow, afterShow, beforeHide etc.)

/**
 * sap.m.NavContainerChild is an artificial interface with the only purpose to bear the documentation of 
 * pseudo events triggered by sap.m.NavContainer on its child controls when navigation occurs and child controls are displayed/hidden.
 * 
 * Interested parties outside the child control can listen to one or more of these events by registering a Delegate:
 * <pre>
 * page1.addEventDelegate({
 *    onBeforeShow: function(evt) {
 *       // page1 is about to be shown; act accordingly - if required you can read event information from the evt object
 *    },
 *    onAfterHide: function(evt) {
 *       // ...
 *    }
 * });
 * </pre>
 * 
 * @name sap.m.NavContainerChild
 * @interface 
 * @public
*/


/**
 * This event is fired before the NavContainer shows this child control for the first time.
 * @event
 * @param {sap.ui.core.Control} oEvent.srcControl the NavContainer firing the event
 * @param {object} oEvent.data the data object which has been passed with the "to" navigation, or an empty object
 * @param {object} oEvent.backData the data object which has been passed with the back navigation, or an empty object
 * @name sap.m.NavContainerChild.prototype.BeforeFirstShow
 * @public
*/

/**
 * This event is fired every time before the NavContainer shows this child control. In case of animated transitions this 
 * event is fired before the transition starts.
 * @event
 * @param {sap.ui.core.Control} oEvent.srcControl the NavContainer firing the event
 * @param {object} oEvent.data the data object which has been passed with the "to" navigation, or an empty object
 * @param {object} oEvent.backData the data object which has been passed with the back navigation, or an empty object
 * @name sap.m.NavContainerChild.prototype.BeforeShow
 * @public
*/

/**
 * This event is fired every time when the NavContainer has made this child control visible. In case of animated transitions this 
 * event is fired after the transition finishes. This control is now being displayed and not animated anymore.
 * @event
 * @param {sap.ui.core.Control} oEvent.srcControl the NavContainer firing the event
 * @param {object} oEvent.data the data object which has been passed with the "to" navigation, or an empty object
 * @param {object} oEvent.backData the data object which has been passed with the back navigation, or an empty object
 * @name sap.m.NavContainerChild.prototype.AfterShow
 * @public
*/

/**
 * This event is fired every time before the NavContainer hides this child control. In case of animated transitions this 
 * event is fired before the transition starts.
 * @event
 * @param {sap.ui.core.Control} oEvent.srcControl the NavContainer firing the event
 * @name sap.m.NavContainerChild.prototype.BeforeHide
 * @public
*/

/**
 * This event is fired every time when the NavContainer has made this child control invisible. In case of animated transitions this 
 * event is fired after the transition finishes. This control is now no longer being displayed and not animated anymore.
 * @event
 * @param {sap.ui.core.Control} oEvent.srcControl the NavContainer firing the event
 * @name sap.m.NavContainerChild.prototype.AfterHide
 * @public
*/
