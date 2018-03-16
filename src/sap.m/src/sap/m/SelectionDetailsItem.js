/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetailsItem.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Element", "sap/m/ListItemBase", "./library", "sap/m/Button", "sap/m/OverflowToolbar", "sap/m/ToolbarSpacer", "sap/ui/base/Interface"],
	function(jQuery, Element, ListItemBase, library, Button, OverflowToolbar, ToolbarSpacer, Interface) {
	"use strict";

	/**
	 * @private
	 */
	var SelectionDetailsListItem = ListItemBase.extend("sap.m.SelectionDetailsListItem");

	SelectionDetailsListItem.prototype.onBeforeRendering = function() {
		var sType;
		if (this._getParentElement().getEnableNav()) {
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
	 * This protected element provides an item for {@link sap.m.SelectionDetails} that is shown inside a list.
	 * The item includes SelectionDetailsItemLine as its lines that are displayed in one block above the optional actions.
	 * <b><i>Note:</i></b>It is protected and should only be used within the framework itself.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @protected
	 * @alias sap.m.SelectionDetailsItem
	 * @since 1.48.0
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
				actions: { type: "sap.ui.core.Item", multiple: true },

				/**
				 * Shows custom action buttons below the main content of the item.
				 */
				_overflowToolbar: { type: "sap.m.OverflowToolbar", multiple: false, visibility : "hidden"}
			}
		}
	});

	SelectionDetailsItem.prototype.exit = function () {
		if (this._oListItem) {
			this._oListItem.destroy();
			this._oListItem = null;
		}
	};

	SelectionDetailsItem.prototype._aFacadeMethods = [
		"addCustomData", "getCustomData", "indexOfCustomData", "insertCustomData",
		"removeCustomData", "removeAllCustomData", "destroyCustomData",
		"data",
		"addEventDelegate", "removeEventDelegate",
		"setEnableNav", "getEnableNav",
		"addAction", "removeAction"
	];

	/**
	 * Returns the public facade of the SelectionDetailsItem for non inner framework usages.
	 * @returns {sap.ui.base.Interface} The reduced facade for outer framework usages.
	 * @protected
	 */
	SelectionDetailsItem.prototype.getFacade = function() {
		var oFacade = new Interface(this, SelectionDetailsItem.prototype._aFacadeMethods);
		this.getFacade = jQuery.sap.getter(oFacade);
		return oFacade;
	};

	/**
	 * Builds or changes a SelectionDetailsListItem and returns it.
	 * @returns {sap.m.SelectionDetailsListItem} The item that has been created or changed.
	 * @private
	 */
	SelectionDetailsItem.prototype._getListItem = function() {
		if (!this._oListItem) {
			this._oListItem = new SelectionDetailsListItem({
				press: [this._onSelectionDetailsListItemPress, this]
			});
			this._oListItem._getParentElement = jQuery.sap.getter(this);
			this._addOverflowToolbar();
		}

		return this._oListItem;
	};

	/**
	 * Handles the press on the SelectionDetailsListItem by triggering the navigate event.
	 * @private
	 */
	SelectionDetailsItem.prototype._onSelectionDetailsListItemPress = function() {
		this.fireEvent("_navigate");
	};

	/**
	 * Adds OverflowToolbar to display action buttons on the item level.
	 * @private
	 */
	SelectionDetailsItem.prototype._addOverflowToolbar = function() {
		var aListItemActions = this.getActions(),
			i,
			oButton;

		this.destroyAggregation("_overflowToolbar");

		if (aListItemActions.length === 0) {
			return;
		}

		var oToolbar = new OverflowToolbar(this.getId() + "-action-toolbar");
		this.setAggregation("_overflowToolbar", oToolbar, true);

		oToolbar.addAggregation("content", new ToolbarSpacer(), true);

		for (i = 0; i < aListItemActions.length; i++) {
			oButton = new Button(this.getId() + "-action-" + i, {
				text: aListItemActions[i].getText(),
				type : library.ButtonType.Transparent,
				enabled: aListItemActions[i].getEnabled(),
				press: [aListItemActions[i], this._onActionPress, this]
			});
			oToolbar.addAggregation("content", oButton, true);
		}
	};

	/**
	 * Handles the press on the action button by triggering a private press event on the instance of SelectionDetailsItem.
	 * @param {sap.ui.base.Event} oEvent of action press
	 * @param {sap.ui.core.Item} oAction The item that was used in the creation of the action button.
	 * @private
	 */
	SelectionDetailsItem.prototype._onActionPress = function(oEvent, oAction) {
		this.fireEvent("_actionPress", {
			action: oAction,
			items: [ this ],
			level: library.SelectionDetailsActionLevel.Item
		});
	};

	return SelectionDetailsItem;
});
