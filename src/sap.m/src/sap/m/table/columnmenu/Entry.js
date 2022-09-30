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
	 * Constructor for a new <code>Entry</code>.
	 *
	 * @param {string} [sId] ID for the new <code>Entry</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>Entry</code>
	 *
	 * @class
	 * The <code>Entry</code> class is used as a base class for elements residing inside the <code>sap.m.table.columnmenu.Menu</code>.
	 * This faceless class can be used to specify control- and application-specific menu items and quick actions.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.Entry
	 */
	var Entry = Element.extend("sap.m.table.columnmenu.Entry", {

		metadata: {
			"abstract": true,
			library: "sap.m",
			properties: {
				/**
				 * Determines whether the entry is visible.
				 */
				visible: {type: "boolean", defaultValue: true}
			}
		}
	});

	/**
	 * Retrieves the <code>Menu</code> in which the entry resides.
	 *
	 * If an entry is internally creating entries that use {@link #getMenu} or {@link #getParent},
	 * and returns them in {@link #getEffectiveItems} or {@link #getEffectiveQuickActions}, they
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
	 * Retrieves the label of an entry.
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
	 * Retrieves the content of an entry.
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