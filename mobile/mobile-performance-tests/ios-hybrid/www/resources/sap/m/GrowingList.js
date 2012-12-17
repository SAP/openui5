/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.GrowingList.
jQuery.sap.declare("sap.m.GrowingList");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.m.List");

/**
 * Constructor for a new GrowingList.
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
 * <li>{@link #getThreshold threshold} : int (default: 20)</li>
 * <li>{@link #getTriggerText triggerText} : string</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.m.List#constructor sap.m.List}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * sap.m.GrowingList control is the container for all list items and inherits from sap.m.List control. Everything like the selection, deletion, unread states and inset style are also maintained here. In addition the control provides a loading mechanism to request data from the model and append the list items to the list. The request is started manually by tapping on the trigger at the end of the list.
 * @extends sap.m.List
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.m.GrowingList
 */
sap.m.List.extend("sap.m.GrowingList", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"threshold" : {type : "int", group : "Misc", defaultValue : 20},
		"triggerText" : {type : "string", group : "Appearance", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.m.GrowingList with name <code>sClassName</code> 
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
 * @name sap.m.GrowingList.extend
 * @function
 */


/**
 * Getter for property <code>threshold</code>.
 * Number of list items requested from the server and added to the list.
 *
 * Default value is <code>20</code>
 *
 * @return {int} the value of property <code>threshold</code>
 * @public
 * @name sap.m.GrowingList#getThreshold
 * @function
 */


/**
 * Setter for property <code>threshold</code>.
 *
 * Default value is <code>20</code> 
 *
 * @param {int} iThreshold  new value for property <code>threshold</code>
 * @return {sap.m.GrowingList} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.GrowingList#setThreshold
 * @function
 */

/**
 * Getter for property <code>triggerText</code>.
 * Text which is displayed on the trigger at the end of the list. The default is a translated text ("Load more data") coming from the messagebundle properties.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>triggerText</code>
 * @public
 * @name sap.m.GrowingList#getTriggerText
 * @function
 */


/**
 * Setter for property <code>triggerText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTriggerText  new value for property <code>triggerText</code>
 * @return {sap.m.GrowingList} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.GrowingList#setTriggerText
 * @function
 */

// Start of sap\m\GrowingList.js


/**
 * Function is called to define the behavior for the control.
 */
sap.m.GrowingList.prototype.init = function() {
	if (sap.m.List.prototype.init) {
		sap.m.List.prototype.init.apply(this, arguments);
	}
	
	this._iCurrentNumberOfItems = 0;
	this._sLastListItemId = "";
	this.updateItems = this._updateItems;
};


/**
 * Function is called after rendering the control.
 * 
 * @private
 */
sap.m.GrowingList.prototype.onAfterRendering = function() {
	if (sap.m.List.prototype.onAfterRendering) {
		sap.m.List.prototype.onAfterRendering.apply(this, arguments);
	}
	
	// check binding info to detect the model type
	// - JSON: then call "_updateItems" manually the first time
	// - oData: "updateItems" is called automatically
	var oBindingInfo = this.getBindingInfo("items"),
		fnFactory = oBindingInfo.factory,
		oBinding = oBindingInfo.binding,	
		iCurrentNumberOfItems = this._iCurrentNumberOfItems,
		iListItemCount = this._getListItemCount(),
		iNewListItemCount = Math.min(iListItemCount, this.getThreshold()),
		iThreshold = this.getThreshold(),
		aContexts = oBinding ? oBinding.getContexts(iCurrentNumberOfItems, iNewListItemCount, iThreshold) : [];
	if (iCurrentNumberOfItems !== oBinding.iLength) {
		if ( (aContexts.length > 0) && (document.getElementsByTagName("ul")[0] != undefined) ) {
			this._updateItems();
		}
	}
};


/**
 * Function is called when exiting the control.
 *
 * @private
*/
 sap.m.GrowingList.prototype.exit = function() {
	if (sap.m.List.prototype.exit) {	
		sap.m.List.prototype.exit.apply(this, arguments);
	}

	if (this._busyIndicator) {
		this._busyIndicator.destroy();
	}	
	if (this._trigger) {
		this._trigger.destroy();
	}	
};


/**
 * Function is called to create or return the trigger control.
 *
 * @private
*/
sap.m.GrowingList.prototype._getTrigger = function(oId) {
	var that = this;
	// set default text, check and set custom text
	var sTriggerText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LOAD_MORE_DATA");
	if (this.getTriggerText()) {
		sTriggerText = this.getTriggerText();
	}
	var _trigger = this._trigger || new sap.m.CustomListItem({
		id:oId, 
		content: new sap.ui.core.HTML({
			content: { path: "dummy",
			formatter: function() {
				return "<div class='sapMSLIDiv sapMGrowingListTrigger'>" +
							"<div class='sapMGrowingListBusyIndicator' id='" + oId + "-busyIndicator'></div>" +
							"<div class='sapMSLITitleDiv sapMGrowingListTitel'>" +
								"<h1 class='sapMSLITitle'>" +
								sTriggerText +
								"</h1>" +
							"</div>" +
							"<div class='sapMGrowingListDescription'>" +
								"<p class='sapMSLIDescription' id='" + oId + "-itemInfo'>" +
								that._getListItemInfo() +
								"</p>" +
							"</div>" +
						"</div>";
			}},
			afterRendering : function(e) {
				var oBusyIndicator = that._getBusyIndicator();
				var rm = sap.ui.getCore().createRenderManager();
				rm.render(oBusyIndicator, this.getDomRef().firstChild);
				rm.destroy();
			}
		}),
		type: sap.m.ListType.Active
	}).setParent(this, null, true).attachTap(this._tap);
	return this._trigger = _trigger;
};


/**
 * Function is called to create or return the busy indicator control.
 *
 * @private
*/
sap.m.GrowingList.prototype._getBusyIndicator = function() {
	var _busyIndicator = this._busyIndicator || new sap.m.BusyIndicator({
		size:'2.0em'
	});
	return this._busyIndicator = _busyIndicator;
};


/**
 * Returns the information about the list items.
 * -> how many items are displayed 
 * -> maximum items to be displayed
 *
 * @private
*/
sap.m.GrowingList.prototype._getListItemInfo = function() {
	return ("[ " + this._iCurrentNumberOfItems + " / " + this._getListItemCount() + " ]");
};


/**
 * Calls the  method "_updateItems" of the list to append the loaded list items when trigger is tapped
 *
 * @private
*/
sap.m.GrowingList.prototype._tap = function(oEvent) {
	var that = this;
	// show busy indicator	
	jQuery.sap.byId(this.getId()+'-busyIndicator').toggleClass('sapMGrowingListBusyIndicatorVisible', true);
	// update items - add new rows 
	that.oParent._updateItems();
};


/**
 * Function is called to add single list item to the existing list.
 * 
 * @private
 */
sap.m.List.prototype.addListItem = function(oItem) {
	oItem._mode = this.getMode();
	oItem._includeItemInSelection = this.getIncludeItemInSelection();
	oItem._select = this._select;
	oItem._delete = this._delete;
	oItem._listId = this.getId();
	oItem._showUnread = this.getShowUnread();
	this.addAggregation("items", oItem, true);
	var rm = sap.ui.getCore().createRenderManager();
	var sListId = this.getId() + "-listUl";
	rm.render(oItem, jQuery.sap.domById(sListId));
	rm.destroy();
	return this;
};


/**
 * Returns the row count. If aggregation rows is bound the count will be the length of the binding,
 * otherwise the count of the rows aggregation will be returned.
 *
 * @private
*/
sap.m.GrowingList.prototype._getListItemCount = function() {
	var oBinding = this.getBinding("items");
	if (oBinding) {
		return oBinding.getLength();
	} else {
		return 0;
	}
};


/**
 * Returns the row count. Calculate the data needs to be pulled depending on the "threshold" and "append" properties.
 * If aggregation rows is bound the count will be the length of the binding otherwise the count of the rows aggregation will be returned 
 *
 * @private
*/
sap.m.GrowingList.prototype._updateItems =  function() {
	var that = this;
	// collect the relevant informations
	var oBindingInfo = this.getBindingInfo("items"),
		fnFactory = oBindingInfo.factory,
		oBinding = oBindingInfo.binding,	
		iCurrentNumberOfItems = this._iCurrentNumberOfItems,
		iListItemCount = this._getListItemCount(),
		iNewListItemCount = Math.min(iListItemCount, this.getThreshold()),
		iThreshold = this.getThreshold(),
		aContexts = oBinding ? oBinding.getContexts(iCurrentNumberOfItems, iNewListItemCount, iThreshold) : [];
	if (iCurrentNumberOfItems !== oBinding.iLength) {
		var sListId = this.getId() + "-listUl";
		if ( (aContexts.length > 0) && (jQuery.sap.domById(sListId) != undefined) ) {
			for ( var i = 0, l = aContexts.length; i < l; i++) {
				var sId = this.getId() + "-id" + (iCurrentNumberOfItems + i), oClone = fnFactory(sId, aContexts[i]);
				oClone.setBindingContext(aContexts[i]);
				this.addListItem(oClone);
			}
			this._iCurrentNumberOfItems = (iCurrentNumberOfItems + iThreshold);
			if (this._iCurrentNumberOfItems > iListItemCount) {
				this._iCurrentNumberOfItems = iListItemCount;
			}
			// refresh scroller and scroll last list item to top
			if (this.oParent._oScroller._scroller && this._sLastListItemId) {
				this.oParent._oScroller._scroller.refresh();
				this.oParent._oScroller._scroller.scrollToElement(jQuery.sap.domById(this._sLastListItemId), 1000);
			}
			// remember last list item id
			this._sLastListItemId = oClone.sId;
		}
	}
	// hide busy indicator and update item information
	window.setTimeout(function() {
		jQuery.sap.byId(that.getId()+'-trigger-busyIndicator').toggleClass('sapMGrowingListBusyIndicatorVisible', false);
		jQuery.sap.domById(that.getId()+'-trigger-itemInfo').innerHTML = that._getListItemInfo();
	}, 100);	
};
