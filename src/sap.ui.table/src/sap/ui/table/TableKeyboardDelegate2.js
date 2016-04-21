/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate2.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './TableExtension', './TableUtils'],
	function(jQuery, BaseObject, TableExtension, TableUtils) {
	"use strict";

	/**
	 * New Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @class Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardDelegate2
	 */
	var TableKeyboardDelegate = BaseObject.extend("sap.ui.table.TableKeyboardDelegate2", /* @lends sap.ui.table.TableKeyboardDelegate2 */ {

		constructor : function(sType) { BaseObject.call(this); },

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() { BaseObject.prototype.destroy.apply(this, arguments); },

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface : function() { return this; }

	});

	return TableKeyboardDelegate;

}, /* bExport= */ true);