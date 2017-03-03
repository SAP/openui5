/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetailsItem.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Element", "sap/m/ListItemBase", "./library"],
	function(jQuery, Element, ListItemBase, library) {
	"use strict";

	/**
	 * @private
	 */
	var SelectionDetailsListItem = ListItemBase.extend("sap.m.SelectionDetailsListItem");

	SelectionDetailsListItem.prototype.onBeforeRendering = function() {
		var sType;
		if (this._getData().getEnableNav()) {
			sType = library.ListType.Navigation;
		} else {
			sType = library.ListType.Inactive;
		}
		this.setProperty("type", sType, true);
	};


	/**
	 * Constructor for a new SelectionDetailsItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This Element provides an item for {@link sap.m.SelectionDetails} that is shown inside a list.
	 * The item includes SelectionDetailsItemLine as its lines that are displayed in one block above the optional actions.
	 * It is intended to be used only in the sap.m.SelectionDetails control.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.m.SelectionDetailsItem
	 * @experimental Since 1.48 This control is still under development and might change at any point in time.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDetailsItem = Element.extend("sap.m.SelectionDetailsItem", /** @lends sap.m.SelectionDetailsItem.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * Determines whether or not the item is active and a navigation event is triggered on press.
				 */
				enableNav: { type: "boolean", defaultValue: false, group: "Behavior" }
			},
			aggregations: {
				/**
				 * Contains a record of information about, for example, measures and dimensions.
				 * These entries are usually obtained via selection in chart controls.
				 */
				lines: { type: "sap.m.SelectionDetailsItemLine", multiple: true, bindable: "bindable" },

				/**
				 * Contains custom actions shown below the main content of the item.
				 */
				actions: { type: "sap.ui.core.Item", multiple: true }
			}
		}
	});

	/**
	 * Builds or changes a SelectionDetailsListItem and returns it.
	 * @returns {sap.m.SelectionDetailsListItem} The item that has been created or changed
	 * @private
	 */
	SelectionDetailsItem.prototype._getListItem = function() {
		if (!this._oListItem) {
			this._oListItem = new SelectionDetailsListItem();
			this._oListItem._getData = jQuery.sap.getter(this);

			this.addDependent(this._oListItem);
		}

		return this._oListItem;
	};

	return SelectionDetailsItem;
});
