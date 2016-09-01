/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableScrollExtension.
sap.ui.define(['jquery.sap.global', './TableExtension', './TableUtils'],
	function(jQuery, TableExtension, TableUtils) {
	"use strict";

	/*
	 * Provides utility functions used this extension
	 */
	//var ExtensionHelper = {
	//    private functions should go here
	//};


	/*
	 * Event handling for scrolling.
	 * "this" in the function context is the table instance.
	 */
	var ExtensionDelegate = {
		// TBD: Event handlers like ontouchstart should go here
	};


	/**
	 * Extension for sap.ui.table.Table which handles scrolling.
	 *
	 * @class Extension for sap.ui.table.Table which handles scrolling.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableScrollExtension
	 */
	var TableScrollExtension = TableExtension.extend("sap.ui.table.TableScrollExtension", /* @lends sap.ui.table.TableScrollExtension */ {

		/*
		 * @see TableExtension._init
		 */
		_init : function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;

			// Register the delegate
			oTable.addEventDelegate(this._delegate, oTable);

			return "ScrollExtension";
		},

		/*
		 * @see TableExtension._attachEvents
		 */
		_attachEvents : function() {
			// TBD: Registration for scrolling related events (see Table#_attachEvents) should go here
		},

		/*
		 * @see TableExtension._detachEvents
		 */
		_detachEvents : function() {
			// TBD: Deregistration for scrolling related events (see Table#_detachEvents) should go here
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			// Deregister the delegates
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}

		// "Public" functions which allow the table to communicate with this extension should go here

	});

	return TableScrollExtension;

}, /* bExport= */ true);