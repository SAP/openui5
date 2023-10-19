/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.valuehelp.content.FixedListItem.
sap.ui.define([
	'sap/ui/mdc/valuehelp/content/FixedListItem'
], function(
		FixedListItem) {
	"use strict";

	/**
	 * Constructor for a new ListFieldHelpItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An item that is used in the {@link sap.ui.mdc.valuehelp.content.FixedList FixedList}.
	 *
	 * @extends sap.ui.mdc.valuehelp.content.FixedListItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.86.0
	 * @deprecated as of 1.114.0, replaced by {@link sap.ui.mdc.valuehelp.content.FixedListItem FixedListItem}
	 * @alias sap.ui.mdc.field.ListFieldHelpItem
	 */
	const ListFieldHelpItem = FixedListItem.extend("sap.ui.mdc.field.ListFieldHelpItem", /** @lends sap.ui.mdc.field.ListFieldHelpItem.prototype */ { metadata : {
		library: "sap.ui.mdc"
	}});


	return ListFieldHelpItem;

});
