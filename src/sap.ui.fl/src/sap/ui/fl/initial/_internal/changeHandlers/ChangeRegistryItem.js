/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	Log,
	requireAsync,
	Utils
) {
	"use strict";

	/**
	 * Object to define a change on a specific control type with it's permissions
	 * @constructor
	 * @param {object} mParam - Parameter description below
	 * @param {object} mParam.changeTypeMetadata - Change type metadata this registry item is describing
	 * @param {string} mParam.changeTypeMetadata.name - Semantic name to identify the change type
	 * @param {string} mParam.changeTypeMetadata.changeHandler - Full qualified name of the function which is executed when a change for this change type is merged or applied
	 * @param {sap.ui.fl.Layer[]} mParam.changeTypeMetadata.layers - Layer permissions
	 * @param {string} mParam.controlType - Control type this registry item is assigned to
	 * @alias sap.ui.fl.registry.ChangeRegistryItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 *
	 */
	var ChangeRegistryItem = function(mParam) {
		// TODO: remove whole file
		if (!mParam.changeHandler) {
			Log.error("sap.ui.fl.registry.ChangeRegistryItem: changeHandler required");
		}
		if (!mParam.changeType) {
			Log.error("sap.ui.fl.registry.ChangeRegistryItem: changeType required");
		}
		if (!mParam.layers) {
			Log.error("sap.ui.fl.registry.ChangeRegistryItem: layers required");
		}
		if (!mParam.controlType) {
			Log.error("sap.ui.fl.registry.ChangeRegistryItem: ControlType required");
		}
		this._controlType = mParam.controlType;
		this._changeType = mParam.changeType;
		this._changeHandler = mParam.changeHandler;
		this._layers = mParam.layers;
	};

	/**
	 * Get the name of a change type
	 *
	 * @returns {string} Returns the name of the change type of the item
	 */
	ChangeRegistryItem.prototype.getChangeTypeName = function() {
		return this._changeType;
	};

	/**
	 * Get the control type
	 *
	 * @returns {string} Returns the control type the item is assigned to
	 */
	ChangeRegistryItem.prototype.getControlType = function() {
		return this._controlType;
	};

	/**
	 * Get the control type
	 *
	 * @returns {string} Returns the control type the item is assigned to
	 */
	ChangeRegistryItem.prototype.getLayers = function() {
		return this._layers;
	};

	/**
	 * Get the change handler object.
	 *
	 * @returns {Promise<object>} Full qualified name of the change handler object wrapped into a Promise/FakePromise
	 */
	ChangeRegistryItem.prototype.getChangeHandler = function() {
		var oPromise = new Utils.FakePromise();
		if (typeof this._changeHandler === "string") {
			// load the module asynchronously
			oPromise = requireAsync(this._changeHandler.replace(/\./g, "/"))
				.then(function (oChangeHandlerImpl) {
					this._changeHandler = oChangeHandlerImpl;
				}.bind(this));
		}

		return oPromise.then(function () {
			if (
				!this._changeHandler
				|| typeof this._changeHandler.completeChangeContent !== "function"
				|| typeof this._changeHandler.applyChange !== "function"
				|| typeof this._changeHandler.revertChange !== "function"
			) {
				// FakePromise catch is not compatible to Promise catch.
				// When FakePromise is called in a Promise scope then Async reject is required.
				return Promise.reject(
					new Error("The ChangeHandler is either not available or does not have all required functions")
				);
			}
			return this._changeHandler;
		}.bind(this));
	};

	return ChangeRegistryItem;
});