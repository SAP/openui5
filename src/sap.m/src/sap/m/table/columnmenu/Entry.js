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
	 * Constructor for a new Entry.
	 *
	 * @param {string} [sId] ID for the new Entry, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new Entry
	 *
	 * @class
	 * The Entry serves as a base class for elements residing inside the sap.m.table.columnmenu.Menu.
	 * This base class is faceless and should be inherited to implement Menu items and quick actions.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.Entry
	 */
	var Entry = Element.extend("sap.m.table.columnmenu.Entry", {
		metadata: {
			"abstract": true,
			library: "sap.m",
			properties: {
				visible: {type: "boolean", defaultValue: true}
			}
		}
	});

	/**
	 * This method can be used to retrieve the Menu, in which the entry resides in.
	 *
	 * If an entry is internally creating entries that use #getMenu or #getParent,
	 * and returns them in #getEffectiveItems or #getEffectiveQuickActions, they
	 * must be its children in the control tree.
	 *
	 * @returns {sap.m.table.columnmenu.Menu} The menu of the entry
	 * @public
	 */
	Entry.prototype.getMenu = function () {
		var oElement = this.getParent();
		while (oElement) {
			if (oElement.isA("sap.m.table.columnmenu.Menu")) {
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
	Entry.prototype.getLabel = function () {
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
	Entry.prototype.getContent = function () {
		if (this.getMetadata().hasAggregation("content")) {
			return this.getAggregation("content");
		}
		throw new Error(this + " does not implement #getContent");
	};

	return Entry;
});