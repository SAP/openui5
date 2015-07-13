/*!
 * ${copyright}
 */

// Provides control sap.m.ColumnListItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";



	/**
	 * Constructor for a new ColumnListItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.ColumnListItem</code> can be used with the <code>cells</code> aggregation to create rows for the <code>sap.m.Table</code> control.
	 * The <code>columns</code> aggregation of the <code>sap.m.Table</code> should match with the cells aggregation.
	 *
	 * <b>Note:</b> This control should only be used within the <code>sap.m.Table</code> control.
	 * The inherited <code>counter</code> property of <code>sap.m.ListItemBase</code> is not supported.
	 *
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ColumnListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnListItem = ListItemBase.extend("sap.m.ColumnListItem", /** @lends sap.m.ColumnListItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Sets the vertical alignment of all the cells within the table row (including selection and navigation).
			 * <b>Note:</b> <code>vAlign</code> property of <code>sap.m.Column</code> overrides the property for cell vertical alignment if both are set.
			 * @since 1.20
			 */
			vAlign : {type : "sap.ui.core.VerticalAlign", group : "Appearance", defaultValue : sap.ui.core.VerticalAlign.Inherit}
		},
		defaultAggregation : "cells",
		aggregations : {

			/**
			 * Every <code>control</code> inside the <code>cells</code> aggregation defines one cell of the row.
			 * <b>Note:</b> The order of the <code>cells</code> aggregation must match the order of the <code>columns</code> aggregation of <code>sap.m.Table</code>.
			 */
			cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell", bindable : "bindable"}
		}
	}});


	// prototype lookup for pop-in id
	ColumnListItem.prototype._popinId = "";

	// initialization hook
	ColumnListItem.prototype.init = function() {
		sap.m.ListItemBase.prototype.init.call(this);
		this._bNeedsTypeColumn = false;
		this._aClonedHeaders = [];
	};

	ColumnListItem.prototype.onAfterRendering = function() {
		sap.m.ListItemBase.prototype.onAfterRendering.call(this);
		this._checkTypeColumn();
	};

	// informs the table when item's type column requirement is changed
	ColumnListItem.prototype._checkTypeColumn = function(bNeedsTypeColumn) {
		if (bNeedsTypeColumn == undefined) {
			bNeedsTypeColumn = this.needsTypeColumn();
		}

		if (this._bNeedsTypeColumn != bNeedsTypeColumn) {
			this._bNeedsTypeColumn = bNeedsTypeColumn;
			this.informList("TypeColumnChange", bNeedsTypeColumn);
		}
	};
	
	// determines whether type column for this item is necessary or not
	ColumnListItem.prototype.needsTypeColumn = function() {
		var sType = this.getType(),
			mType = sap.m.ListType;
			
		return	this.getVisible() && (
					sType == mType.Detail ||
					sType == mType.Navigation ||
					sType == mType.DetailAndActive
				);
	};
	
	// returns responsible table control for the item
	ColumnListItem.prototype.getTable = function() {
		var oParent = this.getParent();
		if (oParent instanceof sap.m.Table) {
			return oParent;
		}
		
		// support old list with columns aggregation
		if (oParent && oParent.getMetadata().getName() == "sap.m.Table") {
			return oParent;
		}
	};
	
	/**
	 * Returns pop-in DOMRef as a jQuery Object
	 *
	 * @protected
	 * @since 1.26
	 */
	ColumnListItem.prototype.$Popin = function() {
		return jQuery.sap.byId(this._popinId);
	};
	
	/**
	 * Pemove pop-in from DOM
	 * @protected
	 */
	ColumnListItem.prototype.removePopin = function() {
		this.$Popin().remove();
		this._popinId = "";
	};
	
	/**
	 * Determines whether control has pop-in or not
	 * @protected
	 */
	ColumnListItem.prototype.hasPopin = function() {
		return !!(this._popinId);
	};
	
	// Adds cloned header to the local collection
	sap.m.ColumnListItem.prototype.addClonedHeader = function(oHeader) {
		return this._aClonedHeaders.push(oHeader);
	};

	// Destroys cloned headers that are generated for popin
	sap.m.ColumnListItem.prototype.destroyClonedHeaders = function() {
		this._aClonedHeaders.forEach(function(oClone) {
			oClone.destroy(true);
		});

		this._aClonedHeaders.length = 0;
	};
	
	/*
	 * Remove pop-in from DOM when setVisible false is called
	 * @overwite
	 */
	ColumnListItem.prototype.setVisible = function(bVisible) {
		ListItemBase.prototype.setVisible.call(this, bVisible);
		if (!bVisible) {
			this.removePopin();
		}
		
		return this;
	};
	
	// update the aria-selected for the cells
	ColumnListItem.prototype.updateSelectedDOM = function(bSelected, $LI) {
		ListItemBase.prototype.updateSelectedDOM.apply(this, arguments);
		$LI.children().attr("aria-selected", bSelected);
		
		// update popin selected and cell as well
		var $Popin = $LI.next(".sapMListTblSubRow");
		$Popin.add("td", $Popin).attr("aria-selected", bSelected);
	};
	
	// remove pop-in on destroy
	ColumnListItem.prototype.exit = function() {
		ListItemBase.prototype.exit.call(this);
		this._checkTypeColumn(false);
		this.destroyClonedHeaders();
		this.removePopin();
	};
	
	// active feedback for pop-in
	ColumnListItem.prototype._activeHandlingInheritor = function() {
		this._toggleActiveClass(true);
	};
	
	// inactive feedback for pop-in
	ColumnListItem.prototype._inactiveHandlingInheritor = function() {
		this._toggleActiveClass(false);
	};
	
	/*
	 * Common code for the two methods _inactiveHandlingInheritor,_activeHandlingInheritor
	 *
	 * @param {boolean} bSwitch Determine whether the class should be added or removed.
	 */
	ColumnListItem.prototype._toggleActiveClass = function(bSwitch){
		this.$Popin().toggleClass("sapMLIBActive", bSwitch);
	};
	
	/**
	 * Handles event delegation for pop-ins
	 *
	 * @static
	 * @protected
	 *
	 * @param {jQuery.Event} oEvent jQuery event object
	 * @param {HTMLElement} oContainerDomRef max parent element to search in DOM to find pop-in
	 * @returns {sap.m.ColumnListItem|undefined} returns related list item when event handler is called
	 */
	ColumnListItem.handleEvents = function(oEvent, oContainerDomRef) {
		var oColumnLI = this.getItemByPopinEvent(oEvent, oContainerDomRef);
		if (oColumnLI) {
			// try to find scrControl from event
			oEvent.srcControl = jQuery(oEvent.target).control(0) || oColumnLI;
	
			// call the related event handler
			if (oColumnLI["on" + oEvent.type]) {
	
				// 2nd parameter is introduced to inform popin event
				oColumnLI["on" + oEvent.type](oEvent, true);
	
				// return ListItem
				return oColumnLI;
			}
		}
	};
	
	/**
	 * Returns related list item from event which is coming from pop-in
	 *
	 * @static
	 * @protected
	 * @since 1.26
	 *
	 * @param {jQuery.Event} oEvent jQuery event object
	 * @param {HTMLElement} oContainerDomRef max parent element to search in DOM to find pop-in
	 * @returns {sap.m.ColumnListItem|undefined}
	 */
	ColumnListItem.getItemByPopinEvent = function(oEvent, oContainerDomRef) {
		var $Popin = jQuery(oEvent.target).closest(".sapMListTblSubRow", oContainerDomRef);
		if ($Popin.length) {
			return sap.ui.getCore().byId($Popin.prev().attr("id"));
		}
	};
	
	/**
	 * Checks whether popin is focused or not
	 *
	 * @static
	 * @protected
	 *
	 * @param {jQuery.Event} oEvent jQuery event object
	 */
	ColumnListItem.isPopinFocused = function(oEvent) {
		return jQuery(document.activeElement).hasClass("sapMListTblSubRow");
	};
	
	/**
	 * Returns the tabbable DOM elements as a jQuery collection
	 * When popin is available this separated dom should also be included
	 *
	 * @returns {jQuery} jQuery object
	 * @protected
	 * @since 1.26
	 */
	ColumnListItem.prototype.getTabbables = function() {
		return this.$().add(this.$Popin()).find(":sapTabbable");
	};

	return ColumnListItem;

}, /* bExport= */ true);
