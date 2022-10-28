/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/integration/util/Utils"
], function (
	JSONModel,
	Log,
	Utils
) {
	"use strict";

	/**
	 * Creates a new ContextModel object.
	 *
	 * @class
	 *
	 * Extends the JSONModel to allow properties which are fetched from a <code>sap.ui.integration.Host</code> instance asynchronous.
	 *
	 * @extends sap.ui.model.json.JSONModel
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.model.ContextModel
	 */
	var ContextModel = JSONModel.extend("sap.ui.integration.model.ContextModel", {
		constructor: function (oData, bObserve) {
			JSONModel.apply(this, arguments);

			this._aPendingPromises = [];
		}
	});

	/**
	 * Sets the host instance which will be used to resolve properties.
	 * @param {sap.ui.integration.Host} oHost The host instance.
	 */
	ContextModel.prototype.setHost = function (oHost) {
		this._oHost = oHost;
		this.resetHostProperties();
	};

	/**
	 * @inheritdoc
	 */
	ContextModel.prototype.getProperty = function (sPath, oContext) {
		if (sPath && !sPath.startsWith("/") && !oContext) {
			sPath = "/" + sPath;
		}
		var oHost = this._oHost,
			sAbsolutePath = this.resolve(sPath, oContext),
			pGetProperty,
			bHasHost = oHost && oHost.getContextValue;

		if (bHasHost) {
			this._mValues = this._mValues || {};
			if (this._mValues.hasOwnProperty(sAbsolutePath)) {
				return this._mValues[sAbsolutePath];
			}

			// ask the host and timeout if it does not respond
			pGetProperty = Utils.timeoutPromise(oHost.getContextValue(sAbsolutePath.substring(1)));

			pGetProperty = pGetProperty.then(function (vValue) {
					this._mValues[sAbsolutePath] = vValue;
					this.checkUpdate();
				}.bind(this))
				.catch(function (sReason) {
					this._mValues[sAbsolutePath] = null;
					this.checkUpdate();
					Log.error("Path " + sAbsolutePath + " could not be resolved. Reason: " + sReason);
				}.bind(this));

			this._aPendingPromises.push(pGetProperty);

			return null;
		} else {
			return JSONModel.prototype.getProperty.apply(this, arguments);
		}
	};

	/**
	 * Cleans any previously obtained host dependent properties.
	 */
	ContextModel.prototype.resetHostProperties = function () {
		this._mValues = {};
	};

	/**
	 * Wait for all pending promises for fetching properties.
	 * Will work only for properties which were requested prior to the function call.
	 *
	 * @return {Promise} A promise which resolves when all pending promises for fetching properties are resolved.
	 */
	ContextModel.prototype.waitForPendingProperties = function () {
		var pResult = Promise.all(this._aPendingPromises);

		this._aPendingPromises = [];

		return pResult;
	};

	return ContextModel;
});
