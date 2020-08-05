/*
 * ! ${copyright}
 */
sap.ui.define([], function() {
	"use strict";
	/**
	 * Abstract Adapter Factory The adapter factory is used to determine depending on a binding path an adapter that uses internal knowledge on the
	 * structure of the model. There are currently three kinds of adapters:
	 *<ul>
	 * <li>the property adapter is used for bindings that result corresponds to a property of a certain object/entity, like /Products/Name
	 * <li>the object adapters is used for bindings that result corresponds to a certain object/entity, like /Products{key}
	 * <li>the list adapters is used for bindings that corresponds to a certain list/collection, like /Products
	 *</ul>
	 * @experimental Since version 1.58
	 * @abstract
	 */

	var AdapterFactory = function() {
	};

	/**
	 * Runs asynchronuosly and delivers a promise to an adapter
	 *
	 * @param {object} mMetadataContext a map containing meta data context
	 * @param {sap.ui.model} mMetadataContext.model the current model
	 * @param {string} mMetadataContext.path the absolute binding path without key information
	 * @param {string} mMetadataContext.metaPath the path inside the meta model pointing to the binding
	 * @param {string} mMetadataContext.modelName the name of the model
	 * @param {string} mMetadataContext.contextName the name of the context
	 * @return {Promise} A promise which is resolved with the requested adapter
	 */
	AdapterFactory.requestAdapter = function(mMetadataContext) {
		return null;
	};

	/**
	 * The synchronuos version of request adapter
	 *
	 * @param {object} mMetadataContext a map containing meta data context
	 * @param {sap.ui.model} mMetadataContext.model the current model
	 * @param {string} mMetadataContext.path the absolute binding path without key information
	 * @param {string} mMetadataContext.metaPath the path inside the meta model pointing to the binding
	 * @param {string} mMetadataContext.modelName the name of the model
	 * @param {string} mMetadataContext.contextName the name of the context
	 * @return {sap.ui.model.meta.BaseAdapter} an instance of a context specific adapter
	 *
	 * @see #requestAdapter
	 */
	AdapterFactory.getAdapter = function(mMetadataContext) {
		return null;
	};

	return AdapterFactory;
});