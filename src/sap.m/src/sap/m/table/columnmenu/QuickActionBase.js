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
	 * Constructor for a new QuickActionBase.
	 *
	 * @param {string} [sId] ID for the new QuickActionBase, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickActionBase
	 *
	 * @class
	 * The QuickActionBase serves as a base class for quick actions.
	 * This base class is faceless and should be inherited by elements which intend to serve as quick actions for the sap.m.table.columnmenu.Menu.
	 *
	 * @extends sap.m.table.columnmenu.Entry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
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
	 * This method can be used to retrieve the effective quick actions.
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
		this.getMenu() && this.getMenu()._createQuickActionGrids();
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