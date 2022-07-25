/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle an ABAP extension variant. Serves also as base class and dummy implementation.
	 *
	 * @class
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant
	 * @since 1.87
	 * @version ${version}
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 */
	var ABAPExtensibilityVariant = BaseObject.extend("sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant", {
		_sServiceUri: null,
		_mBindingInfo: null,
		_mServiceInfo: null,

		/**
		 * Constructor
		 *
		 * @public
		 * @param {string} sServiceUri - URI to an OData service document
		 * @param {map} mServiceInfo - map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
		 * @param {map} mBindingInfo - map containing <code>entitySetName</code> and <code>entityTypeName</code>
		 */
		constructor: function(sServiceUri, mServiceInfo, mBindingInfo) {
			this._sServiceUri = sServiceUri;
			this._mBindingInfo = mBindingInfo;
			this._mServiceInfo = mServiceInfo;

			this._oExtensionDataPromise = this._determineExtensionData();
		},

		/**
		 * Get extension data
		 *
		 * @public
		 * @returns {Promise<map>} Promise to deliver a map containing extension data
		 */
		getExtensionData: function() {
			return Promise.resolve(null);
		},

		/**
		 * Returns the metadata for the class that this object belongs to.
		 *
		 * @public
		 * @returns {sap.ui.base.Metadata} metadata for the class of the object
		 */
		getMetadata: function() {
			return this.getMetadata();
		},

		/**
		 * Get URI for navigation
		 *
		 * @public
		 * @returns {Promise<string>} Promise to deliver a navigation URI
		 */
		getNavigationUri: function() {
			return Promise.resolve(null);
		},

		/**
		 * Get UI texts
		 *
		 * @public
		 * @returns {Promise<map>} Promise to deliver a map of UI texts
		 */
		getTexts: function() {
			return Promise.resolve(null);
		},

		/**
		 * Is active
		 *
		 * @public
		 * @returns {Promise<boolean>} Promise to determine whether variant is active
		 */
		isActive: function() {
			return Promise.resolve(true);
		}
	});

	/**
	 * Determine extension data from backend
	 *
	 * @protected
	 * @returns {Promise<any>} Resolves with determined extension data from backend
	 */
	ABAPExtensibilityVariant.prototype._determineExtensionData = function() {
		return Promise.resolve(null);
	};

	return ABAPExtensibilityVariant;
});