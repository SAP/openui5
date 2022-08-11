/*!
 * ${copyright}
 */

// Provides control sap.m.CustomListItem.
sap.ui.define(['./ListItemBase', './library', './CustomListItemRenderer'],
	function(ListItemBase, library, CustomListItemRenderer) {
	"use strict";



	/**
	 * Constructor for a new CustomListItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control with a content aggregation can be used to customize standard list items that we don't provide. List mode and ListItem type are applied to CustomListItems as well.
	 * <b>Note:</b> Even though the content aggregation allows any control, complex responsive layout controls (e.g. <code>Table, Form</code>) should not be aggregated as content.
	 *
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.CustomListItem
	 */
	var CustomListItem = ListItemBase.extend("sap.m.CustomListItem", /** @lends sap.m.CustomListItem.prototype */ { metadata : {

		library : "sap.m",
		defaultAggregation : "content",
		properties: {
			/**
			 * Defines the custom accessibility announcement.
			 *
			 * <b>Note:</b> If defined, then only the provided custom accessibility description is announced when there is a focus on the list item.
			 * @since 1.84
			 */
			accDescription: {tpye: "string", group: "Behavior"}
		},
		aggregations : {

			/**
			 * The content of this list item
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content", bindable : "bindable"}
		},
		designtime: "sap/m/designtime/CustomListItem.designtime"
	}});

	CustomListItem.prototype.setAccDescription = function(sAccDescription) {
		this.setProperty("accDescription", sAccDescription, true);
		return this;
	};

	CustomListItem.prototype.getContentAnnouncement = function() {
		var sAccDescription = this.getAccDescription();

		if (sAccDescription) {
			return sAccDescription;
		}

		return this.getContent().map(function(oContent) {
			return ListItemBase.getAccessibilityText(oContent);
		}).join(" ").trim();
	};

	return CustomListItem;

});
