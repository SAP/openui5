/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableExtension.
sap.ui.define([
"sap/ui/base/Object", "./TableUtils"
], function(BaseObject, TableUtils) {
	"use strict";

	/**
	 * Base class of extensions for sap.ui.table tables.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library is
	 * strictly prohibited!</b>
	 *
	 * @class Base class of extensions for sap.ui.table tables.
	 * @abstract
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableExtension
	 */
	var TableExtension = BaseObject.extend("sap.ui.table.TableExtension", /** @lends sap.ui.table.TableExtension.prototype */ {
		/**
		 * Instance of the table this extension is applied to.
		 *
		 * @type {sap.ui.table.Table}
		 * @protected
		 */
		_table: null,

		/**
		 * The type of the table this extension is applied to.
		 *
		 * @type {sap.ui.table.TableExtension.TABLETYPES}
		 * @protected
		 */
		_type: null,

		/**
		 * The settings this extension instance has been initialized with.
		 *
		 * @type {Object}
		 * @protected
		 */
		_settings: null,

		constructor: function(oTable, mSettings) {
			BaseObject.call(this);

			this._table = oTable;
			this._settings = mSettings || {};

			this._type = TableExtension.TABLETYPES.STANDARD;
			if (oTable.isA("sap.ui.table.TreeTable")) {
				this._type = TableExtension.TABLETYPES.TREE;
			} else if (oTable.isA("sap.ui.table.AnalyticalTable")) {
				this._type = TableExtension.TABLETYPES.ANALYTICAL;
			}

			var sExtensionName = this._init(this._table, this._type, this._settings);

			// Attach a getter to the table to get the instance of this extension.
			if (sExtensionName) {
				var that = this;
				oTable["_get" + sExtensionName] = function() { return that; };
			}
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			this._table = null;
			this._type = null;
			this.bIsDestroyed = true;
			BaseObject.prototype.destroy.apply(this, arguments);
		},

		/*
		 * @override
		 * @inheritDoc
		 */
		getInterface: function() { return this; }
	});

	/**
	 * Type of the table.
	 *
	 * @type {{TREE: string, ANALYTICAL: string, STANDARD: string}}
	 * @public
	 * @static
	 */
	TableExtension.TABLETYPES = {
		TREE: "TREE",
		ANALYTICAL: "ANALYTICAL",
		STANDARD: "STANDARD"
	};

	/**
	 * Returns the related table control.
	 *
	 * @returns {sap.ui.table.Table|null} The table control or <code>null</code>, if this extension is not yet initialized.
	 * @see sap.ui.table.TableExtension#_init
	 * @public
	 */
	TableExtension.prototype.getTable = function() {
		return this._table;
	};

	/**
	 * Initialize the extension.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.TableExtension.TABLETYPES} sTableType The type of the table.
	 * @param {Object} [mSettings] Additional settings.
	 * @returns {string|null} Derived classes should return the name of the extension.
	 * @abstract
	 * @protected
	 */
	TableExtension.prototype._init = function(oTable, sTableType, mSettings) { return null; };

	/**
	 * Hook which allows the extension to attach for additional native event listeners after the rendering of the table control.
	 *
	 * @abstract
	 * @see sap.ui.table.Table#_attachEvents
	 * @protected
	 */
	TableExtension.prototype._attachEvents = function() {};

	/**
	 * Hook which allows the extension to detach previously attached native event listeners.
	 *
	 * @abstract
	 * @see sap.ui.table.Table#_detachEvents
	 * @protected
	 */
	TableExtension.prototype._detachEvents = function() {};

	/**
	 * Informs all registered extensions of the table to attach their native event listeners.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @see sap.ui.table.TableExtension#_attachEvents
	 * @public
	 * @static
	 */
	TableExtension.attachEvents = function(oTable) {
		if (!oTable._aExtensions) {
			return;
		}

		for (var i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i]._attachEvents();
		}
	};

	/**
	 * Informs all registered extensions of the given table to detach their previously attached native event listeners.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @see sap.ui.table.TableExtension#_detachEvents
	 * @public
	 * @static
	 */
	TableExtension.detachEvents = function(oTable) {
		if (!oTable._aExtensions) {
			return;
		}
		for (var i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i]._detachEvents();
		}
	};

	/**
	 * Initializes an extension and attaches it to the given Table control.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.TableExtension} ExtensionClass The class of the extension to instantiate.
	 * @param {Object} mSettings Additional settings used during initialization of the extension.
	 * @returns {sap.ui.table.TableExtension} Returns the created extension instance.
	 * @public
	 * @static
	 */
	TableExtension.enrich = function(oTable, ExtensionClass, mSettings) {
		if (!ExtensionClass || !(ExtensionClass.prototype instanceof TableExtension)) {
			return null;
		}

		var oExtension = new ExtensionClass(oTable, mSettings);
		if (!oTable._aExtensions) {
			oTable._aExtensions = [];
		}
		oTable._aExtensions.push(oExtension);
		return oExtension;
	};

	/**
	 * Detaches and destroy all registered extensions of the table.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @public
	 * @static
	 */
	TableExtension.cleanup = function(oTable) {
		if (!oTable._bExtensionsInitialized || !oTable._aExtensions) {
			return;
		}
		for (var i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i].destroy();
		}
		delete oTable._aExtensions;
		delete oTable._bExtensionsInitialized;
	};

	return TableExtension;
});