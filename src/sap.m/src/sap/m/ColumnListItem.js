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
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ColumnListItem can be used to create rows for Table control.
	 * Note: This control should not be used without Column definition in parent control.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @name sap.m.ColumnListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnListItem = ListItemBase.extend("sap.m.ColumnListItem", /** @lends sap.m.ColumnListItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Sets the vertical alignment of the all cells in a table row(including selection and navigation). Possible values are "Inherit", "Top", "Middle", "Bottom"
			 * Note: Column's "vAlign" property is stronger than this one.
			 * @since 1.20
			 */
			vAlign : {type : "sap.ui.core.VerticalAlign", group : "Appearance", defaultValue : sap.ui.core.VerticalAlign.Inherit}
		},
		defaultAggregation : "cells",
		aggregations : {
	
			/**
			 * Every item inside the cells aggregation defines one column of the row.
			 */
			cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell", bindable : "bindable"}
		}
	}});
	
	
	// prototype lookup for pop-in id
	ColumnListItem.prototype._popinId = "";
	
	// initialization hook
	ColumnListItem.prototype.init = function() {
		sap.m.ListItemBase.prototype.init.call(this);
		this._aClonedHeaders = [];
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
	ColumnListItem.prototype.setVisible = function() {
		ListItemBase.prototype.setVisible.apply(this, arguments);
		if (!this.getVisible()) {
			this.removePopin();
		}
		return this;
	};
	
	// remove pop-in on destroy
	ColumnListItem.prototype.exit = function() {
		ListItemBase.prototype.exit.call(this);
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
