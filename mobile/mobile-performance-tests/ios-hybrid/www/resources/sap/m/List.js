/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.List.
jQuery.sap.declare("sap.m.List");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new List.
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
 * <li>{@link #getInset inset} : boolean (default: false)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getHeaderText headerText} : string</li>
 * <li>{@link #getFooterText footerText} : string</li>
 * <li>{@link #getMode mode} : sap.m.ListMode (default: sap.m.ListMode.None)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getIncludeItemInSelection includeItemInSelection} : boolean (default: false)</li>
 * <li>{@link #getShowUnread showUnread} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getItems items} : sap.m.ListItemBase[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.List#event:select select} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.List#event:delete delete} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * sap.m.List Control is the container for all list items. Selection, deletion, unread states and inset style are also maintained here.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.List
 */
sap.ui.core.Control.extend("sap.m.List", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"getSelectedItem", "setSelectedItem", "getSelectedItems", "setSelectedItemById", "removeSelections"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"inset" : {type : "boolean", group : "Misc", defaultValue : false},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"headerText" : {type : "string", group : "Misc", defaultValue : null},
		"footerText" : {type : "string", group : "Misc", defaultValue : null},
		"mode" : {type : "sap.m.ListMode", group : "Appearance", defaultValue : sap.m.ListMode.None},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"includeItemInSelection" : {type : "boolean", group : "Misc", defaultValue : false},
		"showUnread" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	defaultAggregation : "items",
	aggregations : {
    	"items" : {type : "sap.m.ListItemBase", multiple : true, singularName : "item", bindable : "bindable"}
	},
	events : {
		"select" : {}, 
		"delete" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.List with name <code>sClassName</code> 
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
 * @name sap.m.List.extend
 * @function
 */

sap.m.List.M_EVENTS = {'select':'select','delete':'delete'};


/**
 * Getter for property <code>inset</code>.
 * inset style false/true
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>inset</code>
 * @public
 * @name sap.m.List#getInset
 * @function
 */


/**
 * Setter for property <code>inset</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bInset  new value for property <code>inset</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setInset
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible lists are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.List#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setVisible
 * @function
 */

/**
 * Getter for property <code>headerText</code>.
 * Header Text
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>headerText</code>
 * @public
 * @name sap.m.List#getHeaderText
 * @function
 */


/**
 * Setter for property <code>headerText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sHeaderText  new value for property <code>headerText</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setHeaderText
 * @function
 */

/**
 * Getter for property <code>footerText</code>.
 * Footer Text
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>footerText</code>
 * @public
 * @name sap.m.List#getFooterText
 * @function
 */


/**
 * Setter for property <code>footerText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sFooterText  new value for property <code>footerText</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setFooterText
 * @function
 */

/**
 * Getter for property <code>mode</code>.
 * Mode of a list (e.g. None, SingleSelect, EditMultiSelect, ViewMultiSelect, etc.)
 *
 * Default value is <code>None</code>
 *
 * @return {sap.m.ListMode} the value of property <code>mode</code>
 * @public
 * @name sap.m.List#getMode
 * @function
 */


/**
 * Setter for property <code>mode</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.m.ListMode} oMode  new value for property <code>mode</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setMode
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Sets the width of the list
 *
 * Default value is <code>'100%'</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.List#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>'100%'</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setWidth
 * @function
 */

/**
 * Getter for property <code>includeItemInSelection</code>.
 * This property decides if the list item interacts with the selection. If it is 'true', a tap on the item will set the selection control in front of the list item.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>includeItemInSelection</code>
 * @public
 * @name sap.m.List#getIncludeItemInSelection
 * @function
 */


/**
 * Setter for property <code>includeItemInSelection</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIncludeItemInSelection  new value for property <code>includeItemInSelection</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setIncludeItemInSelection
 * @function
 */

/**
 * Getter for property <code>showUnread</code>.
 * Activates the unread feature for all list items.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showUnread</code>
 * @public
 * @name sap.m.List#getShowUnread
 * @function
 */


/**
 * Setter for property <code>showUnread</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowUnread  new value for property <code>showUnread</code>
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#setShowUnread
 * @function
 */
	
/**
 * Getter for aggregation <code>items</code>.<br/>
 * The items of this list
 * 
 * @return {sap.m.ListItemBase[]}
 * @public
 * @name sap.m.List#getItems
 * @function
 */

/**
 * Inserts a item into the aggregation named <code>items</code>.
 *
 * @param {sap.m.ListItemBase}
 *          oItem the item to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the item should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the item is inserted at 
 *             the last position        
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#insertItem
 * @function
 */


/**
 * Adds some item <code>oItem</code> 
 * to the aggregation named <code>items</code>.
 *
 * @param {sap.m.ListItemBase}
 *            oItem the item to add; if empty, nothing is inserted
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#addItem
 * @function
 */


/**
 * Removes an item from the aggregation named <code>items</code>.
 *
 * @param {int | string | sap.m.ListItemBase} vItem the item to remove or its index or id
 * @return {sap.m.ListItemBase} the removed item or null
 * @public
 * @name sap.m.List#removeItem
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>items</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.m.ListItemBase[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.List#removeAllItems
 * @function
 */


/**
 * Checks for the provided <code>sap.m.ListItemBase</code> in the aggregation named <code>items</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.m.ListItemBase}
 *            oItem the item whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.List#indexOfItem
 * @function
 */


/**
 * Destroys all the items in the aggregation 
 * named <code>items</code>.
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#destroyItems
 * @function
 */

/**
 * Binder for aggregation <code>items</code>.
 *
 * @param {string} sPath path to a list in the model 
 * @param {sap.ui.core.Element} oTemplate the control template for this aggregation
 * @param {sap.ui.model.Sorter} oSorter the initial sort order (optional)
 * @param {array} aFilters the predefined filters for this aggregation (optional)
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#bindItems
 * @function
 */


/**
 * Unbinder for aggregation <code>items</code>.
 *
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#unbindItems
 * @function
 */

/**
 * Event is fired when selection is changed by user interaction. 
 *
 * @name sap.m.List#select
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.m.ListItemBase} oControlEvent.getParameters.listItem the listitem which fired the select
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'select' event of this <code>sap.m.List</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.List</code>.<br/> itself. 
 *  
 * Event is fired when selection is changed by user interaction. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.List</code>.<br/> itself.
 *
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#attachSelect
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'select' event of this <code>sap.m.List</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#detachSelect
 * @function
 */


/**
 * Fire event select to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'listItem' of type <code>sap.m.ListItemBase</code> the listitem which fired the select</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.List#fireSelect
 * @function
 */

/**
 * Event is fired when delete icon is pressed by user. 
 *
 * @name sap.m.List#delete
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.m.ListItemBase} oControlEvent.getParameters.listItem the listitem which fired the delete
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'delete' event of this <code>sap.m.List</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.List</code>.<br/> itself. 
 *  
 * Event is fired when delete icon is pressed by user. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.List</code>.<br/> itself.
 *
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#attachDelete
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'delete' event of this <code>sap.m.List</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.List#detachDelete
 * @function
 */


/**
 * Fire event delete to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'listItem' of type <code>sap.m.ListItemBase</code> the listitem which fired the delete</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.List} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.List#fireDelete
 * @function
 */

/**
 * Returns selected list item. When no item is selected, "null" is returned. When multi-selection is enabled and multiple items are selected, only the first selected item is returned.
 *
 * @name sap.m.List.prototype.getSelectedItem
 * @function

 * @type sap.m.ListItemBase
 * @public
 */


/**
 * Sets a list item to be selected. In single mode the method removes the previous selection.
 *
 * @name sap.m.List.prototype.setSelectedItem
 * @function
 * @param {sap.m.ListItemBase} 
 *         oItem
 *         The list item to be selected
 * 
 * @param {boolean} 
 *         bSelect
 *         sets the listitem to true/false

 * @type sap.m.List
 * @public
 */


/**
 * Returns an array containing the selected list items. In the case of no selection, an empty array is returned.
 *
 * @name sap.m.List.prototype.getSelectedItems
 * @function

 * @type sap.m.ListItemBase[]
 * @public
 */


/**
 * Sets a list item to be selected by id. In single mode the method removes the previous selection.
 *
 * @name sap.m.List.prototype.setSelectedItemById
 * @function
 * @param {string} 
 *         sId
 *         The id of the list item to be selected
 * 
 * @param {boolean} 
 *         bSelect
 *         sets the listitem to true/false

 * @type sap.m.List
 * @public
 */


/**
 * Removes all selections of the current selection mode. Applies to the modes "SingleSelect", "MultiSelect" and "Delete".
 *
 * @name sap.m.List.prototype.removeSelections
 * @function

 * @type sap.m.List
 * @public
 */


// Start of sap\m\List.js
/**
* // * This file defines behavior for the control,
*/
sap.m.List.prototype.init = function(){
	// do something for initialization...
	this._mode = this.getMode();
	this._includeItemInSelection = this.getIncludeItemInSelection();
};


sap.m.List.prototype.setIncludeItemInSelection = function(include) {
	this.setProperty("includeItemInSelection", include, true);
	var aItems = this.getItems();
	for ( var i = 0; i < aItems.length; i++) {
				aItems[i]._includeItemInSelection = include;
			}	
	return this;
};

sap.m.List.prototype.setInset = function(inset) {
	if(inset === this.getInset()){
		return;
	}
	this.setProperty("inset", inset, true);
	if(this.getDomRef())
	{
		if(inset){
			this.addStyleClass('sapMListInsetBG');
			var oUL = jQuery.sap.byId( this.getId() + "-listUl").addClass('sapMListInset');
			if (this.getHeaderText()){
				jQuery.sap.byId( this.getId() + "-listHeader").removeClass('sapMListHdr').addClass('sapMListHdrInset');
				oUL.addClass('sapMListInsetHdr');
			}
			if (this.getFooterText()) {
				oUL.addClass('sapMListInsetFtr');
				jQuery.sap.byId( this.getId() + "-listFooter").removeClass('sapMListFtr').addClass('sapMListFtrInset');
			}
		}
		else
		{
			this.removeStyleClass('sapMListInsetBG');
			var oUL = jQuery.sap.byId( this.getId() + "-listUl").removeClass('sapMListInset');
			if (this.getHeaderText()){
				jQuery.sap.byId( this.getId() + "-listHeader").removeClass('sapMListHdrInset').addClass('sapMListHdr');
				oUL.removeClass('sapMListInsetHdr');
			}
			if (this.getFooterText()) {
				oUL.removeClass('sapMListInsetFtr');
				jQuery.sap.byId( this.getId() + "-listFooter").removeClass('sapMListFtrInset').addClass('sapMListFtr');
			}
		}
	}
	return this;
};

sap.m.List.prototype.setWidth = function(width) {
	if(this.getDomRef()){
		this.$().width(width);
	}
	return this;
};
/**
 * // * Returns selected item. When no item is selected, "null" is returned. // *
 * When multi-selection is enabled and multiple items are selected, only the
 * first selected item is returned.
 */
sap.m.List.prototype.getSelectedItem = function() {
	var oResult;	
		var aItems = this.getItems();
		for ( var i = 0; i < aItems.length; i++) {
			if (aItems[i].getSelected()) {
				oResult = aItems[i];
				break;
			}
		}
	return oResult;
};


/**
 * // * Sets a list item to be selected. In single mode the method removes the
 * previous selection.
 */
sap.m.List.prototype.setSelectedItem = function(oListItem, select) {
	switch (oListItem._mode) {
	case sap.m.ListMode.SingleSelect:
		oListItem._radioButton.setSelected(select);
		oListItem.setSelected(select, true);
		oListItem.$().toggleClass('sapMLIBSelected', select);
		break;
	case sap.m.ListMode.MultiSelect:
		oListItem._checkBox.setSelected(select);
		oListItem.setSelected(select, true);
		oListItem.$().toggleClass('sapMLIBSelected', select);
		break;
	case sap.m.ListMode.SingleSelectMaster:
		oListItem._active = select;
		oListItem._radioButton.setSelected(select);
		oListItem.setSelected(select, true);
		oListItem._activeHandling();
		if(select){
			oListItem._activeHandlingNav();
			oListItem._activeHandlingInheritor();
		}
		else{
			oListItem._inactiveHandlingNav();
			oListItem._inactiveHandlingInheritor();
		}
	break;
	case sap.m.ListMode.None:
	}
	return this;
};


/**
 * // * Returns an array containing the selected list items. In the case of no
 * selection, an empty array is returned.
 */
sap.m.List.prototype.getSelectedItems = function() {
	var aResult = [];
		var aItems = this.getItems();
		for ( var i = 0; i < aItems.length; i++) {
			if (aItems[i].getSelected()) {
				aResult.push(aItems[i]);
			}
		}
	return aResult;
};


/**
 * // * Sets a list item to be selected by id. In single mode the method removes
 * the previous selection. .
 */
sap.m.List.prototype.setSelectedItemById = function(id, select) {
	switch (this.getMode()) {
	case sap.m.ListMode.SingleSelect:
		var oListItem = sap.ui.getCore().byId(id);
		if (oListItem) {
			oListItem._radioButton.setSelected(select);
			oListItem.setSelected(select, true);
			oListItem.$().toggleClass('sapMLIBSelected', select);
		}
		break;
	case sap.m.ListMode.MultiSelect:
		var oListItem = sap.ui.getCore().byId(id);
		if (oListItem) {
			oListItem._checkBox.setSelected(select);
			oListItem.setSelected(select, true);
			oListItem.$().toggleClass('sapMLIBSelected', select);
		}
		break;
	case sap.m.ListMode.SingleSelectMaster:
		var oListItem = sap.ui.getCore().byId(id);
			oListItem._active = select;
			oListItem._radioButton.setSelected(select);
			oListItem.setSelected(select, true);
			oListItem._activeHandling();
		if(select){
			oListItem._activeHandlingNav();
			oListItem._activeHandlingInheritor();
		}
		else{
			oListItem._inactiveHandlingNav();
			oListItem._inactiveHandlingInheritor();
		}
		break;
	case sap.m.ListMode.None:
		break;
	}
	return this;
};


/**
 * // * Removes all selections of the current selection mode. Applies to the modes "SingleSelect", "MultiSelect" and "Delete".
 */
sap.m.List.prototype.removeSelections = function() {
	this._removeCurrentSelection();
};


/**
 * // * List fires select event caused by checkbox/radiobutton
 */
sap.m.List.prototype._select = function(oEvent) {
	var oListItem = sap.ui.getCore().byId(this.oParent.getId());
	var oList = sap.ui.getCore().byId(oListItem._listId);
	
	//if includeItemInSelection true and select control pressed, we don't have to fire the select event
	var select = oEvent.getParameter("selected");
	oListItem.setSelected(select, true);
	
	if(oList.getMode() === sap.m.ListMode.SingleSelectMaster){
		oListItem._active = select;
		oListItem._activeHandling();
		if(select){
			oListItem._activeHandlingNav();
			oListItem._activeHandlingInheritor();
		}
		else{
			oListItem._inactiveHandlingNav();
			oListItem._inactiveHandlingInheritor();
		}
	}
	else{
		oListItem.$().toggleClass('sapMLIBSelected', select);
	}
	if (!oList.getIncludeItemInSelection()) {
		oList.fireSelect({listItem:oListItem});
	}
};

/**
 * // * List fires select event caused by the list item
 */
sap.m.List.prototype._selectTapped = function(oListItem) {
	this.fireSelect({listItem:oListItem});
};

/**
 * // * List fires delete event caused by the delete image
 */
sap.m.List.prototype._delete = function(oEvent) {
	var oListItem = sap.ui.getCore().byId(this.oParent.getId());
	var oList = sap.ui.getCore().byId(oListItem._listId);
	oList.fireDelete({listItem:oListItem});
};

/**
 * // * removes all selections of the current mode if selection mode is changed
*/
sap.m.List.prototype._removeCurrentSelection = function() {
	switch (this.getMode()) {
		case sap.m.ListMode.SingleSelect:
			var aItems = this.getItems();
			for ( var i = 0; i < aItems.length; i++) {
				if(aItems[i]._radioButton){
					aItems[i]._radioButton.setSelected(false);
				}
				aItems[i].setSelected(false, true);
				aItems[i].$().toggleClass('sapMLIBSelected', false);
			}	
			break;
		case sap.m.ListMode.MultiSelect:
			var aItems = this.getItems();
			for ( var i = 0; i < aItems.length; i++) {
				if(aItems[i]._checkBox){
					aItems[i]._checkBox.setSelected(false);
				}
				aItems[i].setSelected(false, true);
				aItems[i].$().toggleClass('sapMLIBSelected', false);
			}
			break;
		case sap.m.ListMode.SingleSelectMaster:
			var aItems = this.getItems();
			for ( var i = 0; i < aItems.length; i++) {
				if(aItems[i]._radioButton){
					aItems[i]._radioButton.setSelected(false);
				}
				aItems[i].setSelected(false, true);
				aItems[i]._active = false;
				aItems[i]._activeHandling();
				aItems[i]._inactiveHandlingNav();
				aItems[i]._inactiveHandlingInheritor();
			}
			break;
		case sap.m.ListMode.None:
			break;
	}	
};
