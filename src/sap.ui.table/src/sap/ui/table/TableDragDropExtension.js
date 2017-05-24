/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableDragDropExtension.
sap.ui.define([
	'jquery.sap.global', './TableExtension'
], function(jQuery, TableExtension) {
	"use strict";

	/*
	 * Provides utility functions used by this extension.
	 */
	var ExtensionHelper = {
	};

	var ExtensionDelegate = {
	};

	/**
	 * Extension for sap.ui.table.Table which handles drag and drop.
	 *
	 * @class Extension for sap.ui.table.Table which handles drag and drop.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableDragDropExtension
	 */
	var TableDragDropExtension = TableExtension.extend("sap.ui.table.TableDragDropExtension", /* @lends sap.ui.table.TableDragDropExtension */ {
		/*
		 * @see sap.ui.table.TableExtension#_init
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;

			// Register the delegate.
			oTable.addEventDelegate(this._delegate, oTable);

			return "DragDropExtension";
		},

		/*
		 * @see sap.ui.table.TableExtension#_attachEvents
		 */
		_attachEvents: function() {
		},

		/*
		 * @see sap.ui.table.TableExtension#_detachEvents
		 */
		_detachEvents: function() {
		},

		/*
		 * Enables debugging for the extension.
		 */
		_debug: function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ExtensionDelegate = ExtensionDelegate;
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy: function() {
			// Deregister the delegate.
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}

		// "Public" functions which allow the table to communicate with this extension should go here.
	});

	return TableDragDropExtension;

}, /* bExport= */ true);