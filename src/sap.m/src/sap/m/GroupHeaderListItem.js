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
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.GroupHeaderListItem</code> is used to display the title of a group and act as separator between groups in <code>sap.m.List</code> and <code>sap.m.Table</code>.
	 * <b>Note:</b> The inherited properties <code>unread</code>, <code>selected</code>, <code>counter</code> and <code>press</code> event from <code>sap.m.ListItemBase</code> are not supported.
	 *
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
			 * Defines the title of the group header.
			 */
			title : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Defines the count of items in the group, but it could also be an amount which represents the sum of all amounts in the group.
			 * <b>Note:</b> Will not be displayed if not set.
			 */
			count : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Allows to uppercase the group title.
			 * @since 1.13.2
			 * @deprecated Since version 1.40.10
			 */
			upperCase : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the title text directionality with enumerated options. By default, the control inherits text direction from the DOM.
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

			// defines the tag name
			this.TagName = "tr";
		}
	};

	GroupHeaderListItem.prototype.getAccessibilityType = function(oBundle) {
		var sType = this.getTable() ? "ROW" : "OPTION";
		return oBundle.getText("LIST_ITEM_GROUP_HEADER") + " " + oBundle.getText("ACC_CTR_TYPE_" + sType);
	};

	GroupHeaderListItem.prototype.getContentAnnouncement = function() {
		return this.getTitle();
	};

	return GroupHeaderListItem;

}, /* bExport= */ true);
