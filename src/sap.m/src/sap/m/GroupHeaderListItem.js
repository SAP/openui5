/*!
 * ${copyright}
 */

// Provides control sap.m.GroupHeaderListItem.
sap.ui.define(["sap/ui/core/library", "./library", "./ListItemBase", "./GroupHeaderListItemRenderer"],
	function(coreLibrary, library, ListItemBase, GroupHeaderListItemRenderer) {
	"use strict";


	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


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
	 * @implements sap.m.ITableItem

	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.GroupHeaderListItem
	 */
	var GroupHeaderListItem = ListItemBase.extend("sap.m.GroupHeaderListItem", /** @lends sap.m.GroupHeaderListItem.prototype */ {
		metadata : {
			interfaces : [
				"sap.m.ITableItem"
			],
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
				upperCase : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true},

				/**
				 * Defines the title text directionality with enumerated options. By default, the control inherits text direction from the DOM.
				 * @since 1.28.0
				 */
				titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
			}
		},

		renderer: GroupHeaderListItemRenderer
	});

	// GroupHeaderListItem does not respect the list mode
	GroupHeaderListItem.prototype.getMode = function() {
		return ListMode.None;
	};

	GroupHeaderListItem.prototype.shouldClearLastValue = function() {
		return true;
	};

	// returns responsible table control for the item
	GroupHeaderListItem.prototype.getTable = function() {
		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.m.Table")) {
			return oParent;
		}
	};

	GroupHeaderListItem.prototype.onBeforeRendering = function() {
		var oTable = this.getTable();
		if (oTable) {
			// clear column last value to reset cell merging
			oTable.getColumns().forEach(function(oColumn) {
				oColumn.clearLastValue();
			});

			// defines the tag name
			this.TagName = "tr";
			this.aAriaOwns = [];
		}
	};

	GroupHeaderListItem.prototype.getAccessibilityType = function(oBundle) {
	};

	GroupHeaderListItem.prototype.getContentAnnouncement = function() {
		return this.getTitle();
	};

	// group header has no group announcement
	GroupHeaderListItem.prototype.getGroupAnnouncement = function() {};

	return GroupHeaderListItem;

});
