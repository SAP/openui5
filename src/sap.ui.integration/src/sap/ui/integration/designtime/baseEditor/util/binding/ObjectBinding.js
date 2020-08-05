/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/ui/base/BindingParser",
	"sap/base/util/includes",
	"sap/base/util/deepEqual"
], function (
	ManagedObject,
	deepClone,
	ObjectPath,
	isPlainObject,
	BindingParser,
	includes,
	deepEqual
) {
	"use strict";

	/**
	 * @class
	 * This class allows to resolve bindings strings in JSON.
	 * Only one-way binding is supported.
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.integration.designtime.baseEditor.util.ObjectBinding
	 * @author SAP SE
	 * @since 1.70.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.70.0
	 */
	var ObjectBinding = ManagedObject.extend("sap.ui.integration.designtime.baseEditor.util.ObjectBinding", {
		metadata: {
			properties: {
				object: {
					type: "object"
				},
				_value: {
					type: "any",
					hidden: true
				}
			},
			events: {
				change: {
					parameters: {
						path: {
							type: "string"
						},
						value: {
							type: "any"
						}
					}
				}
			}
		},

		/**
		 * Original JSON object supplied for resolving
		 * @type {object}
		 */
		_originalObject: null
	});

	ObjectBinding.prototype.init = function () {
		this._aIgnoreList = [];
		this._oModelMap = {};
	};

	ObjectBinding.prototype.exit = function () {
		this._cleanup();
	};

	ObjectBinding.prototype.setObject = function (oObject) {
		this._setOriginalObject(oObject);
		this._init();
		return this;
	};

	ObjectBinding.prototype._setObject = function (oObject) {
		var oClonedObject = deepClone(oObject, 50);
		return this.setProperty("object", oClonedObject);
	};

	ObjectBinding.prototype._setOriginalObject = function (oObject) {
		this._originalObject = deepClone(oObject, 50);
	};

	ObjectBinding.prototype._getOriginalObject = function () {
		return this._originalObject;
	};

	ObjectBinding.prototype.setModel = function (oModel, sName) {
		// If the same model is registered under different names
		// with different context paths, track this relation
		// in order to only track changes on one of these models

		// Track explicitly since undefined is a valid model name
		var bModelAlreadyRegistered = false;

		var sExistingModelName = Object.keys(this.oModels || {})
			.find(function (sModelName) {
				if (this.oModels[sModelName] === oModel) {
					bModelAlreadyRegistered = true;
					return true;
				}
				return false;
			}.bind(this));
		this._oModelMap[sName] = bModelAlreadyRegistered
			// Use name from model map in case the first found model
			// refers to a different model name itself
			? this._oModelMap[sExistingModelName]
			: sName;

		var vReturn = ManagedObject.prototype.setModel.apply(this, arguments);
		this._init();
		return vReturn;
	};

	ObjectBinding.prototype.setBindingContext = function () {
		var vReturn = ManagedObject.prototype.setBindingContext.apply(this, arguments);
		this._init();
		return vReturn;
	};

	ObjectBinding.prototype._init = function() {
		this._cleanup();
		var oObject = this._getOriginalObject();
		if (oObject) {
			this._setObject(oObject);
			this._createPropertyBindings(oObject);
		}
	};

	ObjectBinding.prototype._cleanup = function () {
		if (this._mSimpleBindings) {
			Object.keys(this._mSimpleBindings).forEach(function(sKey) {
				var oBinding = this._mSimpleBindings[sKey].binding;
				// destroy is not removing binding from the model's list of bindings
				oBinding.getModel().removeBinding(oBinding);
				oBinding.destroy();
			}.bind(this));
		}
		this._mSimpleBindings = {};
	};

	ObjectBinding.prototype._createPropertyBindings = function (oObject, sPath) {
		Object.keys(oObject)
			.filter(function (sKey) {
				return !this.isIgnored(sKey);
			}, this)
			.forEach(function(sKey) {
				var sCurPath = sPath ? sPath + "/" + sKey : sKey;
				if (typeof oObject[sKey] === "string") {
					var oBindingInfo = BindingParser.complexParser(oObject[sKey]);
					if (oBindingInfo) {
						if (oBindingInfo.parts) {
							// first check that all models for all parts are available
							if (
								!oBindingInfo.parts.find(
									function(oPart) {
										return !this.getModel(oPart.model);
									}.bind(this)
								)
							) {
								oBindingInfo.parts.forEach(function(oPart) {
									this._createSimpleBinding(oPart, sCurPath, oBindingInfo);
								}.bind(this));
							} else {
								return;
							}
						} else if (this.getModel(oBindingInfo.model)) {
							this._createSimpleBinding(oBindingInfo, sCurPath, oBindingInfo);
						} else {
							return;
						}
						this._updateValue([{
							path: sCurPath,
							bindingInfo: oBindingInfo
						}]);
					}
				} else if (
					oObject[sKey]
					&& (
						isPlainObject(oObject[sKey])
						|| Array.isArray(oObject[sKey])
					)
				) {
					this._createPropertyBindings(oObject[sKey], sCurPath);
				}
			}, this);
	};

	ObjectBinding.prototype._updateValue = function (aValueUpdates) {
		var aChanges = [];

		aValueUpdates.forEach(function (oUpdate) {
			var oObject = this.getObject();
			var aParts = oUpdate.path.split("/");
			var sKey = aParts.pop();
			if (aParts.length) {
				oObject = ObjectPath.get(aParts, oObject);
			}
			this.bindProperty("_value", deepClone(oUpdate.bindingInfo));
			// to avoid changes influencing the model, if oValue is an object (since it is one-way only binding)
			var oValue = deepClone(this.getProperty("_value"));
			this.unbindProperty("_value");

			if (
				oValue !== oObject[sKey]
				&& (sKey !== "value" || !(oObject.value === undefined && deepEqual(oValue, oObject.defaultValue)))
			) {
				oObject[sKey] = oValue;
				aChanges.push({
					path: oUpdate.path,
					value: oValue
				});
			}
		}.bind(this));

		if (aChanges.length) {
			this.fireChange({ changes: aChanges });
		}
	};

	ObjectBinding.prototype._createSimpleBinding = function(oSimpleBindingInfo, sCurPath, oBindingInfo) {
		var oContext = this.getBindingContext(oSimpleBindingInfo.model);
		var sModelName = this._oModelMap[oSimpleBindingInfo.model];
		var oOriginalModel = this.oModels[oSimpleBindingInfo.model];
		var sAbsolutePath = oOriginalModel.resolve(oSimpleBindingInfo.path, oContext);
		var sHash = sModelName + ">" + sAbsolutePath;
		var oBinding = this._mSimpleBindings[sHash];

		if (!oBinding) {
			oBinding = this.getModel(oSimpleBindingInfo.model).bindProperty(oSimpleBindingInfo.path, oContext);
			this._mSimpleBindings[sHash] = {
				binding: oBinding,
				properties: []
			};

			oBinding.attachChange(function () {
				this._updateValue(this._mSimpleBindings[sHash].properties);
			}.bind(this));
		}
		this._mSimpleBindings[sHash].properties.push({
			path: sCurPath,
			bindingInfo: oBindingInfo
		});
		return oBinding;
	};

	/**
	 * Adds ignore key to the list
	 * @param {string} sKey - Key to ignore
	 */
	ObjectBinding.prototype.addToIgnore = function (sKey) {
		this._aIgnoreList = this._aIgnoreList.concat(sKey);
		this._init();
	};

	/**
	 * Removes ignore key from the list
	 * @param {string} sKey - Key to restore
	 */
	ObjectBinding.prototype.removeFromIgnore = function (sKey) {
		this._aIgnoreList = this._aIgnoreList.filter(function (sIgnoreKey) {
			return sIgnoreKey !== sKey;
		});
		this._init();
	};

	/**
	 * Checks if a key is in the ignore list
	 * @param {string} sKey - Key to check
	 * @return {boolean} - `true` if specified key is in the ignore list
	 */
	ObjectBinding.prototype.isIgnored = function (sKey) {
		return includes(this._aIgnoreList, sKey);
	};

	return ObjectBinding;
});
