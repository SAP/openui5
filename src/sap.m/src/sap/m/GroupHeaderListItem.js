/*!
 * ${copyright}
 */

// Provides control sap.m.GroupHeaderListItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";


	
	/**
	 * Constructor for a new GroupHeaderListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The group header list item is used to display the title of a group and act as separator between groups in Lists.
	 * 
	 * There are several API parts inherited from ListItemBase which do not apply here:
	 * The properties "type", "unread", "selected" and "counter" are currently ignored.
	 * Tap events will not be fired.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.GroupHeaderListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupHeaderListItem = ListItemBase.extend("sap.m.GroupHeaderListItem", /** @lends sap.m.GroupHeaderListItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * The title of the group header.
			 */
			title : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * A text to be displayed in the group header in brackets next to the group title. Usually the count of items in the group, but it could also be an amount which represents the sum of all amounts in the group.
			 * Will not be displayed if not set.
			 */
			count : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * Title will be put to capital letters by default, otherwise set this property to 'false'
			 * @since 1.13.2
			 */
			upperCase : {type : "boolean", group : "Appearance", defaultValue : true},
			
			/**
			 * This property specifies the title text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
		}
	}});
	
	// GroupHeaderListItem does not respect the list mode
	GroupHeaderListItem.prototype.getMode = function() {
		return sap.m.ListMode.None;
	};
	
	GroupHeaderListItem.prototype.shouldClearLastValue = function() {
		return true;
	};
	
	// returns responsible table control for the item
	GroupHeaderListItem.prototype.getTable = function() {
		var oParent = this.getParent();
		if (oParent instanceof sap.m.Table) {
			return oParent;
		}
		
		// support old list with columns aggregation
		if (oParent && oParent.getMetadata().getName() == "sap.m.Table") {
			return oParent;
		}
	};
	
	GroupHeaderListItem.prototype.onBeforeRendering = function() {
		var oParent = this.getParent();
		if (oParent && sap.m.Table && oParent instanceof sap.m.Table) {
			// clear column last value to reset cell merging
			oParent.getColumns().forEach(function(oColumn) {
				oColumn.clearLastValue();
			});
		}
	};

	return GroupHeaderListItem;

}, /* bExport= */ true);
