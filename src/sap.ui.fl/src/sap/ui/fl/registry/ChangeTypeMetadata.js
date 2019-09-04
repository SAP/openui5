/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/Utils"
], function(
	Log,
	Utils
) {
	"use strict";

	/**
	 * Object to define a change type with it's handlers and visual appearance options
	 * @constructor
	 * @param {Object} mParam Parameter description below
	 * @param {String} mParam.name Semantic name to identify the change type
	 * @param {String} mParam.changeHandler Full qualified name of the function which is executed when a change for this change type is merged or applied
	 * @param {String} [mParam.labelKey] Key of the translatable label
	 * @param {String} [mParam.tooltipKey] Key of the translatable tooltip
	 * @param {String} [mParam.iconKey] Key of the icon which should be displayed
	 * @param {Object} [mParam.sortIndex] Index to sort the change type on the visualization. (0 = default, lowest priority)
	 * @alias sap.ui.fl.registry.ChangeTypeMetadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 *
	 */
	var ChangeTypeMetadata = function(mParam) {
		if (!mParam.name) {
			Log.error("sap.ui.fl.registry.ChangeType: Name required");
		}
		if (!mParam.changeHandler) {
			Log.error("sap.ui.fl.registry.ChangeType: ChangeHandler required");
		}

		this._name = mParam.name;
		this._changeHandler = mParam.changeHandler;
		this._layers = mParam.layers;

		if (mParam.labelKey) {
			this._labelKey = mParam.labelKey;
		}
		if (mParam.tooltipKey) {
			this._tooltipKey = mParam.tooltipKey;
		}
		if (mParam.iconKey) {
			this._iconKey = mParam.iconKey;
		}
		if (mParam.sortIndex) {
			this._sortIndex = mParam.sortIndex;
		}
	};

	ChangeTypeMetadata.prototype._name = "";
	ChangeTypeMetadata.prototype._changeHandler = "";
	ChangeTypeMetadata.prototype._layers = [];
	ChangeTypeMetadata.prototype._sortIndex = 0;
	ChangeTypeMetadata.prototype._labelKey = "";
	ChangeTypeMetadata.prototype._tooltipKey = "";
	ChangeTypeMetadata.prototype._iconKey = "";

	/**
	 * Get the semantical name of the change type
	 * @returns {String} Returns the semantical name of the change type
	 * @public
	 */
	ChangeTypeMetadata.prototype.getName = function() {
		return this._name;
	};

	/**
	 * Get the change handler object.
	 * @returns {Promise<object>} Full qualified name of the change handler object wrapped into a Promise/FakePromise
	 * @public
	 */
	ChangeTypeMetadata.prototype.getChangeHandler = function() {
		var oPromise = new Utils.FakePromise();
		if (typeof this._changeHandler === "string") {
			// load the module asynchronously
			oPromise = Utils.requireAsync(this._changeHandler.replace(/\./g, "/"))
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
					new Error("The ChangeHandler is either not available or does not fulfill all needed requirements")
				);
			}
			return this._changeHandler;
		}.bind(this));
	};

	/**
	 * Gets the list of layers and the information whether or not they are enabled
	 * @returns {Object} Returns the list of layers
	 * @public
	 */
	ChangeTypeMetadata.prototype.getLayers = function() {
		return this._layers;
	};

	/**
	 * Get the translated label text for this type of change
	 * @returns {String} Returns the translated label text for this type of change
	 * @public
	 */
	ChangeTypeMetadata.prototype.getLabel = function() {
		return this._labelKey; //TODO: Add call with translation
	};

	/**
	 * Get the translated tooltip text for this type of change
	 * @returns {String} Returns the translated tooltip text for this type of change
	 * @public
	 */
	ChangeTypeMetadata.prototype.getTooltip = function() {
		//TODO: Add call with translation
		return this._tooltipKey;
	};

	/**
	 * Get the path to the icon which should be displayed for this type of change
	 * @returns {String} Returns the path to the icon which should be displayed for this type of change
	 * @public
	 */
	ChangeTypeMetadata.prototype.getIcon = function() {
		return this._iconKey; //TODO: Add call to get icon path
	};

	/**
	 * Get the sort index of this type of change
	 * @returns {String} Returns the sort index of this type of change
	 * @public
	 */
	ChangeTypeMetadata.prototype.getSortIndex = function() {
		return this._sortIndex;
	};

	return ChangeTypeMetadata;
}, true);