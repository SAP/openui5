/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.ExtensionBase.
sap.ui.define([
	"sap/ui/base/Object"
], function(BaseObject) {
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
	 * @alias sap.ui.table.extensions.ExtensionBase
	 */
	const ExtensionBase = BaseObject.extend("sap.ui.table.extensions.ExtensionBase", /** @lends sap.ui.table.extensions.ExtensionBase.prototype */ {
		/**
		 * Instance of the table this extension is applied to.
		 *
		 * @type {sap.ui.table.Table}
		 * @protected
		 */
		_table: null,

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

			const sExtensionName = this._init(this._table, this._settings);

			// Attach a getter to the table to get the instance of this extension.
			if (sExtensionName) {
				const that = this;
				oTable["_get" + sExtensionName] = function() { return that; };
			}
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			this._table = null;
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
	 * Returns the related table control.
	 *
	 * @returns {sap.ui.table.Table|null} The table control or <code>null</code>, if this extension is not yet initialized.
	 * @see sap.ui.table.extensions.ExtensionBase#_init
	 * @public
	 */
	ExtensionBase.prototype.getTable = function() {
		return this._table;
	};

	/**
	 * Initialize the extension.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {Object} [mSettings] Additional settings.
	 * @returns {string|null} Derived classes should return the name of the extension.
	 * @abstract
	 * @protected
	 */
	ExtensionBase.prototype._init = function(oTable, mSettings) { return null; };

	/**
	 * Hook which allows the extension to attach for additional native event listeners after the rendering of the table control.
	 *
	 * @abstract
	 * @see sap.ui.table.Table#_attachEvents
	 * @protected
	 */
	ExtensionBase.prototype._attachEvents = function() {};

	/**
	 * Hook which allows the extension to detach previously attached native event listeners.
	 *
	 * @abstract
	 * @see sap.ui.table.Table#_detachEvents
	 * @protected
	 */
	ExtensionBase.prototype._detachEvents = function() {};

	/**
	 * Informs all registered extensions of the table to attach their native event listeners.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @see sap.ui.table.extensions.ExtensionBase#_attachEvents
	 * @public
	 * @static
	 */
	ExtensionBase.attachEvents = function(oTable) {
		if (!oTable._aExtensions) {
			return;
		}

		for (let i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i]._attachEvents();
		}
	};

	/**
	 * Informs all registered extensions of the given table to detach their previously attached native event listeners.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @see sap.ui.table.extensions.ExtensionBase#_detachEvents
	 * @public
	 * @static
	 */
	ExtensionBase.detachEvents = function(oTable) {
		if (!oTable._aExtensions) {
			return;
		}
		for (let i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i]._detachEvents();
		}
	};

	/**
	 * Initializes an extension and attaches it to the given Table control.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.extensions.ExtensionBase} ExtensionClass The class of the extension to instantiate.
	 * @param {Object} mSettings Additional settings used during initialization of the extension.
	 * @returns {sap.ui.table.extensions.ExtensionBase} Returns the created extension instance.
	 * @public
	 * @static
	 */
	ExtensionBase.enrich = function(oTable, ExtensionClass, mSettings) {
		if (!ExtensionClass || !(ExtensionClass.prototype instanceof ExtensionBase)) {
			return null;
		}

		const oExtension = new ExtensionClass(oTable, mSettings);
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
	ExtensionBase.cleanup = function(oTable) {
		if (!oTable._bExtensionsInitialized || !oTable._aExtensions) {
			return;
		}
		for (let i = 0; i < oTable._aExtensions.length; i++) {
			oTable._aExtensions[i].destroy();
		}
		delete oTable._aExtensions;
		delete oTable._bExtensionsInitialized;
	};

	/**
	 * Checks whether a table is enriched with a certain extension.
	 *
	 * @param {sap.ui.table.Table} oTable The table instance.
	 * @param {string} sExtensionFullName The fully qualified name of the extension.
	 * @returns {boolean} Whether the table is enriched with the specified extension.
	 * @static
	 */
	ExtensionBase.isEnrichedWith = function(oTable, sExtensionFullName) {
		if (!oTable || !oTable._aExtensions) {
			return false;
		}

		for (let i = 0; i < oTable._aExtensions.length; i++) {
			if (oTable._aExtensions[i].getMetadata().getName() === sExtensionFullName) {
				return true;
			}
		}

		return false;
	};

	return ExtensionBase;
});