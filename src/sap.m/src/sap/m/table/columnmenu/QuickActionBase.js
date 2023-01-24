/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/Entry",
	"sap/m/library"
], function(
	Entry,
	library
) {
	"use strict";

	/**
	 * Constructor for a new <code>QuickActionBase</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickActionBase</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickActionBase</code>
	 *
	 * @class
	 * The <code>QuickActionBase</code> class is used as a base class for quick actions for the <code>sap.m.table.columnmenu.Menu</code>.
	 * This faceless class can be used to specify control- and application-specific quick actions.
	 *
	 * @extends sap.m.table.columnmenu.Entry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.QuickActionBase
	 */
	var QuickActionBase = Entry.extend("sap.m.table.columnmenu.QuickActionBase", {

		metadata: {
			"abstract": true,
			library: "sap.m"
		}
	});

	/**
	 * Retrieves the effective quick actions.
	 *
	 * Subclasses can implement this method, if there are compositions of other quick actions.
	 * @returns {sap.m.table.columnmenu.QuickActionBase[]} The effective quick actions
	 *
	 * @virtual
	 * @public
	 */
	QuickActionBase.prototype.getEffectiveQuickActions = function() {
		return this.getVisible() ? [this] : [];
	};

	QuickActionBase.prototype.setVisible = function (bVisible) {
		if (this.getVisible() == bVisible) {
			return this;
		}

		this.setProperty("visible", bVisible);
		this.getMenu() && this.getMenu()._initQuickActionContainer();
		return this;
	};

	/**
	 * Gets the category of this quick action.
	 *
	 * @returns {sap.m.table.columnmenu.Category} The category
	 * @virtual
	 */
	QuickActionBase.prototype.getCategory = function() {
		if (this.getMetadata().hasProperty("category")) {
			return this.getProperty("category");
		}
		return library.table.columnmenu.Category.Generic;
	};

	return QuickActionBase;
});