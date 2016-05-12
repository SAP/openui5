/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableExtension.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './TableUtils'],
	function(jQuery, BaseObject, TableUtils) {
	"use strict";

	/*
	 * Checks whether the given object is of the given type (given in AMD module syntax)
	 * without the need of loading the types module.
	 */
	var _isInstanceOf = function(oControl, sType) {
		var oType = sap.ui.require(sType);
		return oType && (oControl instanceof oType);
	};


	/**
	 * Base class of extensions for sap.ui.table.Table, ...
	 *
	 * @class Base class of extensions for sap.ui.table.Table, ...
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableExtension
	 */
	var TableExtension = BaseObject.extend("sap.ui.table.TableExtension", /* @lends sap.ui.table.TableExtension */ {

		constructor : function(oTable, mSettings) {
			BaseObject.call(this);
			this._table = oTable;
			this._settings = mSettings || {};

			this._type = TableExtension.TABLETYPES.STANDARD;
			if (_isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
				this._type = TableExtension.TABLETYPES.TREE;
			} else if (_isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
				this._type = TableExtension.TABLETYPES.ANALYTICAL;
			}

			var sName = this._init(this._table, this._type, this._settings);

			//Attaching a getter to the related table control
			if (sName) {
				var that = this;
				oTable["_get" + sName] = function(){ return that; };
			}
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			this._table = null;
			this._type = null;
			BaseObject.prototype.destroy.apply(this, arguments);
		},

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface : function() { return this; }

	});

	TableExtension.TABLETYPES = {
		TREE: "TREE",
		ANALYTICAL: "ANALYTICAL",
		STANDARD: "STANDARD"
	};

	/*
	 * Returns the related table control.
	 * @public (Part of the API for Table control only!)
	 */
	TableExtension.prototype.getTable = function() {
		return this._table;
	};

	/*
	 * Init function may be overridden by the subclasses
	 */
	TableExtension.prototype._init = function(oTable, sTableType, mSettings) { return null; };


	/*
	 * Initializes the Extension with the given type and attaches it to the given Table control.
	 * @public (Part of the API for Table control only!)
	 */
	TableExtension.enrich = function(oTable, oExtensionClass, mSettings) {
		if (!oExtensionClass || !(oExtensionClass.prototype instanceof TableExtension)) {
			return null;
		}

		var oExtension = new oExtensionClass(oTable, mSettings);
		return oExtension;
	};

	return TableExtension;

}, /* bExport= */ true);