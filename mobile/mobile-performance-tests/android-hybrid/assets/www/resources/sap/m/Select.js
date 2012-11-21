/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Select.
jQuery.sap.declare("sap.m.Select");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Select.
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
 * <li>{@link #getName name} : string (default: "")</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: "auto")</li>
 * <li>{@link #getMaxWidth maxWidth} : sap.ui.core.CSSSize (default: "100%")</li>
 * <li>{@link #getTitle title} : string (default: "")</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getItems items} : sap.ui.core.Item[]</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getSelectedItem selectedItem} : string | sap.ui.core.Item</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Select#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The select control is built on a native html select element; it provides a list of predefined items that allows end users to choose options.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Select
 */
sap.ui.core.Control.extend("sap.m.Select", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"name" : {type : "string", group : "Misc", defaultValue : ""},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "auto"},
		"maxWidth" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},
		"title" : {type : "string", group : "Misc", defaultValue : ""}
	},
	aggregations : {
    	"items" : {type : "sap.ui.core.Item", multiple : true, singularName : "item"}
	},
	associations : {
		"selectedItem" : {type : "sap.ui.core.Item", multiple : false}
	},
	events : {
		"change" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Select with name <code>sClassName</code> 
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
 * @name sap.m.Select.extend
 * @function
 */

sap.m.Select.M_EVENTS = {'change':'change'};


/**
 * Getter for property <code>name</code>.
 * The name to be used in the HTML code (e.g. for HTML forms that send data to the server via submit).
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.m.Select#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setName
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Determines whether the control is visible or not.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Select#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setVisible
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Determines whether the user can change the selected value.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.Select#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setEnabled
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Defines the width of the select control. This value can be provided in %, em, px… and all possible CSS measures.
 *
 * Default value is <code>"auto"</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Select#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>"auto"</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setWidth
 * @function
 */

/**
 * Getter for property <code>maxWidth</code>.
 * Defines the maximum width of the select control. This value can be provided in %, em, px… and all possible CSS measures.
 *
 * Default value is <code>"100%"</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>maxWidth</code>
 * @public
 * @name sap.m.Select#getMaxWidth
 * @function
 */


/**
 * Setter for property <code>maxWidth</code>.
 *
 * Default value is <code>"100%"</code> 
 *
 * @param {sap.ui.core.CSSSize} sMaxWidth  new value for property <code>maxWidth</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setMaxWidth
 * @function
 */

/**
 * Getter for property <code>title</code>.
 * Represents advisory information for the element, such as would be appropriate for a tooltip.
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.m.Select#getTitle
 * @function
 */


/**
 * Setter for property <code>title</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setTitle
 * @function
 */
	
/**
 * Getter for aggregation <code>items</code>.<br/>
 * Items of the Item control.
 * 
 * @return {sap.ui.core.Item[]}
 * @public
 * @name sap.m.Select#getItems
 * @function
 */

/**
 * Inserts a item into the aggregation named <code>items</code>.
 *
 * @param {sap.ui.core.Item}
 *          oItem the item to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the item should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the item is inserted at 
 *             the last position        
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#insertItem
 * @function
 */


/**
 * Adds some item <code>oItem</code> 
 * to the aggregation named <code>items</code>.
 *
 * @param {sap.ui.core.Item}
 *            oItem the item to add; if empty, nothing is inserted
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#addItem
 * @function
 */


/**
 * Removes an item from the aggregation named <code>items</code>.
 *
 * @param {int | string | sap.ui.core.Item} vItem the item to remove or its index or id
 * @return {sap.ui.core.Item} the removed item or null
 * @public
 * @name sap.m.Select#removeItem
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>items</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Item[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.Select#removeAllItems
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Item</code> in the aggregation named <code>items</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Item}
 *            oItem the item whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.Select#indexOfItem
 * @function
 */


/**
 * Destroys all the items in the aggregation 
 * named <code>items</code>.
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#destroyItems
 * @function
 */

/**
 * The selected item.
 *
 * @return {string} Id of the element which is the current target of the <code>selectedItem</code> association, or null
 * @public
 * @name sap.m.Select#getSelectedItem
 * @function
 */


/**
 * The selected item.
 *
 * @param {string | sap.ui.core.Item} vSelectedItem 
 *    Id of an element which becomes the new target of this <code>selectedItem</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#setSelectedItem
 * @function
 */

/**
 * This event will be triggered when the user changes the selected item. 
 *
 * @name sap.m.Select#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Item} oControlEvent.getParameters.selectedItem The selected item.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.Select</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Select</code>.<br/> itself. 
 *  
 * This event will be triggered when the user changes the selected item. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Select</code>.<br/> itself.
 *
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.Select</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Select#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selectedItem' of type <code>sap.ui.core.Item</code> The selected item.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Select} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Select#fireChange
 * @function
 */

// Start of sap\m\Select.js
/* =========================================================== */
/*                   begin: lifecycle methods                  */
/* =========================================================== */

/**
 * Required adaptations before rendering.
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.Select.prototype.onBeforeRendering = function(oEvent) {
	if (this.getAssociation("selectedItem") === null) {

		//  suppress re-rendering
		this.setAssociation("selectedItem", this.getItems()[0].getId(), true);
	}

	if (this._$SltNative instanceof jQuery) {
		this._$SltNative.unbind("change.select", this._handleChange);
	}
};

/**
 * Required adaptations after rendering.
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.Select.prototype.onAfterRendering = function() {

	// jQuery DOM reference to the select control root
	this._$SltCont = this.$();

	// jQuery DOM reference to the native select using inside the control
	this._$SltNative = this._$SltCont.children("select");

	// jQuery DOM collection with all select options
	this._$SltOptions = this._$SltNative.children("option");

	// jQuery DOM reference with the selected option
	this._$SeletedItem = this._$SltOptions.filter(":selected");

	// jQuery DOM reference to the span using to show the text from the current selected item
	this._$SltText = this._$SltCont.children("span.sapMSltText");

	// register a listener to the select change event
	this._$SltNative.bind("change.select", jQuery.proxy(this._handleChange, this));

	this._$SltNative.css("font", this._$SltText.css("font"));

	if (this.getWidth() === "auto") {
		this._$SltCont.width(this._$SltNative.width() + parseFloat(this._$SltText.css("padding-right"), 10) + parseFloat(this._$SltText.css("padding-left"), 10));
	}

	this._$SltNative.width("100%");
};

/* =========================================================== */
/*                   end: lifecycle methods                    */
/* =========================================================== */


/* =========================================================== */
/*                      begin: event handlers                  */
/* =========================================================== */
/**
 * Handle the touch start event happening on the select.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Select.prototype.ontouchstart = function(oEvent) {

	//	for control who need to know if they should handle events from the select control
	oEvent.originalEvent._sapui_handledByControl = true;
	
	// add active state
	this._$SltCont.addClass("sapMSltPressed");
};

/**
 * Handle the touch end event on the select.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Select.prototype.ontouchend = function() {

	// remove active state
	this._$SltCont.removeClass("sapMSltPressed");
};

/**
 * Handle the change event on the select.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Select.prototype._handleChange = function() {
	var $NewSeletedItem = this._$SltOptions.filter(":selected"),
		sItemId	= $NewSeletedItem.attr("id"),
		oItem = sap.ui.getCore().byId(sItemId);

	// remove the old attribute selected
	this._$SeletedItem.removeAttr("selected");	//  for screen readers

	// add the new attribute selected
	$NewSeletedItem.attr("selected", "selected");	//  for screen readers

	// update the selected item
	this._$SeletedItem = $NewSeletedItem;

	// update the association
	this.setAssociation("selectedItem", sItemId, true);

	this._$SltText.text(oItem.getText());

	this.fireChange({ selectedItem : oItem });
};

/* ============================================================ */
/*                      end: event handlers                  	*/
/* ============================================================ */


/* =========================================================== */
/*                   begin: API method                         */
/* =========================================================== */

sap.m.Select.prototype.getSelectedItem = function() {
	return sap.ui.getCore().byId(this.getAssociation("selectedItem"));
};

/* =========================================================== */
/*                     end: API method                         */
/* =========================================================== */