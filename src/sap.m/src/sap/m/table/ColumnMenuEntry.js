/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function (
	Element
) {
	"use strict";

	/**
	 * Constructor for a new ColumnMenuEntry.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as a base class for elements residing inside the sap.m.table.ColumnMenu.
	 * This base class is faceless and should be inherited to implement ColumnMenu items and quick actions.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.ColumnMenuEntry
	 */
	var ColumnMenuEntry = Element.extend("sap.m.table.ColumnMenuEntry", {
		metadata: {
			"abstract": true,
			library: "sap.m",
			properties: {
				visible: {type: "boolean", defaultValue: true}
			}
		}
	});

	/**
	 * This method can be used to retrieve the ColumnMenu, in which the entry resides in.
	 *
	 * If an entry is internally creating entries that use #getMenu or #getParent,
	 * and returns them in #getEffectiveItems or #getEffectiveQuickActions, they
	 * must be its children in the control tree.
	 *
	 * @returns {sap.m.ColumnMenu} The menu of the entry
	 * @public
	 */
	ColumnMenuEntry.prototype.getMenu = function () {
		var oElement = this.getParent();
		while (oElement) {
			if (oElement.isA("sap.m.table.ColumnMenu")) {
				return oElement;
			}
			oElement = oElement.getMenu();
		}
		return undefined;
	};

	/**
	 * This method can be used to retrieve the label of an entry.
	 *
	 * @returns {string} The label property specified in the control
	 * @abstract
	 */
	ColumnMenuEntry.prototype.getLabel = function () {
		if (this.getMetadata().hasProperty("label")) {
			return this.getProperty("label");
		}
		throw new Error(this + " does not implement #getLabel");
	};

	/**
	 * This method can be used to retrieve the content of an entry.
	 *
	 * @returns {sap.ui.core.Control} The control specified in the content aggregation
	 * @abstract
	 */
	ColumnMenuEntry.prototype.getContent = function () {
		if (this.getMetadata().hasAggregation("content")) {
			return this.getAggregation("content");
		}
		throw new Error(this + " does not implement #getContent");
	};

	ColumnMenuEntry.prototype.setVisible = function (bVisible) {
		if (this.getVisible() == bVisible) {
			return this;
		}

		this.setProperty("visible", bVisible);
		this.getMenu() && this.getMenu()._setItemVisibility(this, bVisible);
		return this;
	};

	return ColumnMenuEntry;
});