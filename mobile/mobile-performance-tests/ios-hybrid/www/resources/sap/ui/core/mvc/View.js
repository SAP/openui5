/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.mvc.View.
jQuery.sap.declare("sap.ui.core.mvc.View");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new mvc/View.
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
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize</li>
 * <li>{@link #getViewName viewName} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ui.core.mvc.View#event:afterInit afterInit} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ui.core.mvc.View#event:beforeExit beforeExit} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ui.core.mvc.View#event:afterRendering afterRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ui.core.mvc.View#event:beforeRendering beforeRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * View
 * @extends sap.ui.core.Control
 *
 * @author  
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.mvc.View
 */
sap.ui.core.Control.extend("sap.ui.core.mvc.View", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"getController"
	],

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
		"viewName" : {type : "string", group : "Misc", defaultValue : null}
	},
	aggregations : {
    	"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
	},
	events : {
		"afterInit" : {}, 
		"beforeExit" : {}, 
		"afterRendering" : {}, 
		"beforeRendering" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.mvc.View with name <code>sClassName</code> 
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
 * @name sap.ui.core.mvc.View.extend
 * @function
 */

sap.ui.core.mvc.View.M_EVENTS = {'afterInit':'afterInit','beforeExit':'beforeExit','afterRendering':'afterRendering','beforeRendering':'beforeRendering'};


/**
 * Getter for property <code>width</code>.
 * The width
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.ui.core.mvc.View#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#setWidth
 * @function
 */

/**
 * Getter for property <code>height</code>.
 * The height
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.ui.core.mvc.View#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#setHeight
 * @function
 */

/**
 * Getter for property <code>viewName</code>.
 * Name of the View
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>viewName</code>
 * @public
 * @name sap.ui.core.mvc.View#getViewName
 * @function
 */


/**
 * Setter for property <code>viewName</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sViewName  new value for property <code>viewName</code>
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#setViewName
 * @function
 */
	
/**
 * Getter for aggregation <code>content</code>.<br/>
 * Child Controls of the view
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ui.core.mvc.View#getContent
 * @function
 */

/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the content should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the content is inserted at 
 *             the last position        
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#insertContent
 * @function
 */


/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#addContent
 * @function
 */


/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.ui.core.Control} vContent the content to remove or its index or id
 * @return {sap.ui.core.Control} the removed content or null
 * @public
 * @name sap.ui.core.mvc.View#removeContent
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ui.core.mvc.View#removeAllContent
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>content</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ui.core.mvc.View#indexOfContent
 * @function
 */


/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#destroyContent
 * @function
 */

/**
 * Fired when the View has parsed the UI description and instantiated the contained controls (/control tree). 
 *
 * @name sap.ui.core.mvc.View#afterInit
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterInit' event of this <code>sap.ui.core.mvc.View</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ui.core.mvc.View</code>.<br/> itself. 
 *  
 * Fired when the View has parsed the UI description and instantiated the contained controls (/control tree). 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ui.core.mvc.View</code>.<br/> itself.
 *
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#attachAfterInit
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterInit' event of this <code>sap.ui.core.mvc.View</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#detachAfterInit
 * @function
 */


/**
 * Fire event afterInit to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ui.core.mvc.View#fireAfterInit
 * @function
 */

/**
 * Fired when the view has received the request to destroy itself, but before it has destroyed anything. 
 *
 * @name sap.ui.core.mvc.View#beforeExit
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeExit' event of this <code>sap.ui.core.mvc.View</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ui.core.mvc.View</code>.<br/> itself. 
 *  
 * Fired when the view has received the request to destroy itself, but before it has destroyed anything. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ui.core.mvc.View</code>.<br/> itself.
 *
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#attachBeforeExit
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'beforeExit' event of this <code>sap.ui.core.mvc.View</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#detachBeforeExit
 * @function
 */


/**
 * Fire event beforeExit to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ui.core.mvc.View#fireBeforeExit
 * @function
 */

/**
 * Fired when the View has been (re-)rendered and its HTML is present in the DOM. 
 *
 * @name sap.ui.core.mvc.View#afterRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterRendering' event of this <code>sap.ui.core.mvc.View</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ui.core.mvc.View</code>.<br/> itself. 
 *  
 * Fired when the View has been (re-)rendered and its HTML is present in the DOM. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ui.core.mvc.View</code>.<br/> itself.
 *
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#attachAfterRendering
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterRendering' event of this <code>sap.ui.core.mvc.View</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#detachAfterRendering
 * @function
 */


/**
 * Fire event afterRendering to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ui.core.mvc.View#fireAfterRendering
 * @function
 */

/**
 * Fired before this View is re-rendered. Us to unbind event handlers from HTML elements etc. 
 *
 * @name sap.ui.core.mvc.View#beforeRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeRendering' event of this <code>sap.ui.core.mvc.View</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ui.core.mvc.View</code>.<br/> itself. 
 *  
 * Fired before this View is re-rendered. Us to unbind event handlers from HTML elements etc. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ui.core.mvc.View</code>.<br/> itself.
 *
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#attachBeforeRendering
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'beforeRendering' event of this <code>sap.ui.core.mvc.View</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.mvc.View#detachBeforeRendering
 * @function
 */


/**
 * Fire event beforeRendering to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.mvc.View} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ui.core.mvc.View#fireBeforeRendering
 * @function
 */

/**
 * Returns the view's Controller instance (if any)
 *
 * @name sap.ui.core.mvc.View.prototype.getController
 * @function

 * @type object
 * @public
 */


// Start of sap\ui\core\mvc\View.js
(function() {
	/**
	 * @namespace
	 * @name sap.ui.core.mvc
	 * @public
	 */

	/**
	 * initialize the View and connect (create if no instance is given) the Controller
	 *
	 * @private
	 */
	sap.ui.core.mvc.View.prototype._initCompositeSupport = function(mSettings) {

		// init View with constructor settings
		// (e.g. parse XML or identify default controller) ***/

		// make user specific data available during view instantiation
		this.oViewData = mSettings.viewData;

		if (this.initViewSettings) {
			this.initViewSettings(mSettings);
		}

		createAndConnectController(this, mSettings);

		// the controller is connected now => notify the view implementations
		if (this.onControllerConnected) {
			this.onControllerConnected(this.oController);
		}

		// notifies the listeners that the View is initialized
		this.fireAfterInit();

	};

	/**
	 * may return null for controller-less View
	 *
	 * @return Controller of the View
	 * @public
	 */
	sap.ui.core.mvc.View.prototype.getController = function() {
		return this.oController;
	};

	/**
	 * returns an Element by its id in the context of the View
	 *
	 * @return Element by its id
	 * @public
	 */
	sap.ui.core.mvc.View.prototype.byId = function(sId) {
		return sap.ui.getCore().byId(this.createId(sId));
	};

	/**
	 * creates an id for an Element prefixed with the view id
	 *
	 * @return prefixed id
	 * @public
	 */
	sap.ui.core.mvc.View.prototype.createId = function(sId) {
		return this.getId() + "--" + sId;
	};

	/**
	 * creates and connects the controller if the controller is not given in the
	 * mSettings
	 *
	 * @private
	 */
	var createAndConnectController = function(oThis, mSettings) {

		// only set when used internally
		var oController = mSettings.controller;

		// check for default controller
		if (!oController && oThis.getControllerName) {
			// get optional default controller name
			var defaultController = oThis.getControllerName();
			if (defaultController) {
				// create controller
				oController = sap.ui.controller(defaultController);
			}
		}

		if ( oController ) {
			oThis.oController = oController;
			// connect controller
			oController.connectToView(oThis);
		}
	};

	/**
	 * Returns user specific data object
	 *
	 * @return object viewData
	 * @public
	 */
	sap.ui.core.mvc.View.prototype.getViewData = function(){
		return this.oViewData;
	};

	/**
	 * exit hook
	 *
	 * @private
	 */
	sap.ui.core.mvc.View.prototype.exit = function() {
		this.fireBeforeExit();
		this.oController = null;
	};

	/**
	 * onAfterRendering hook
	 *
	 * @private
	 */
	sap.ui.core.mvc.View.prototype.onAfterRendering = function() {
		this.fireAfterRendering();
	};

	/**
	 * onBeforeRendering hook
	 *
	 * @private
	 */
	sap.ui.core.mvc.View.prototype.onBeforeRendering = function() {
		this.fireBeforeRendering();
	};
	/**	
	 * Ovverride clone method
	 *
	 * @param {String} [sIdSuffix] a suffix to be appended to the cloned element id
	 * @param {Array} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @return {sap.ui.core.Element} reference to the newly created clone
	 * @protected
	 */
	sap.ui.core.mvc.View.prototype.clone = function(sIdSuffix, aLocalIds) {
		var mSettings = {}, sKey, oClone;
		//Clone properties (only those with non-default value)
		for(sKey in this.mProperties  && !(this.isBound && this.isBound(sKey))) {
			if ( this.mProperties.hasOwnProperty(sKey) ) {
				mSettings[sKey] = this.mProperties[sKey];
			}
		}
		oClone = sap.ui.core.Element.prototype.clone.call(this, sIdSuffix, aLocalIds, {cloneChildren:false, cloneBindings: true});
		oClone.applySettings(mSettings);
		return oClone;
	}
	/**
	 * Creates a view of the given type, name and with the given id.
	 *
	 * The <code>oView</code> configuration object can have the following properties for the view
	 * instantiation:
	 * <ul>
	 * <li>The ID <code>oView.id</code> specifies an ID for the View instance. If no ID is given,
	 * an ID will be generated.</li>
	 * <li>The view name <code>oView.viewName</code> corresponds to an XML module that can be loaded
	 * via the module system (oView.viewName + suffix ".view.xml")</li>
	 * <li>The controller instance <code>oView.controller</code> must be a valid controller implementation.
	 * The given controller instance overrides the controller defined in the view definition</li>
	 * <li>The view type <code>oView.type</code> specifies what kind of view will be instantiated. All valid
	 * view types are listed in the enumeration sap.ui.core.mvc.ViewType.</li>
	 * <li>The view data <code>oView.viewData</code> can hold user specific data. This data is available
	 * during the whole lifecycle of the view and the controller</li>
	 * </ul>
	 *
	 * @param {object} [oView] view configuration Object
	 * @public
	 * @static
	 */
	sap.ui.view = function(oView) {
		var view = null;
		if (!oView.type) {
			throw new Error("No view type specified.");
		} else if (oView.type === sap.ui.core.mvc.ViewType.JS) {
			view = new sap.ui.core.mvc.JSView(oView);
		} else if (oView.type === sap.ui.core.mvc.ViewType.JSON) {
			view = new sap.ui.core.mvc.JSONView(oView);
		} else if (oView.type === sap.ui.core.mvc.ViewType.XML) {
			view = new sap.ui.core.mvc.XMLView(oView);
		} else { // unknown view type
			throw new Error("Unknown view type "+oView.type+" specified.");
		}
		return view;
	};

}());