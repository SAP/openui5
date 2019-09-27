/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/ui/base/BindingParser"
], function (
	ManagedObject,
	deepClone,
	ObjectPath,
	BindingParser
) {
	"use strict";

	/**
	 * This class allows to resolve bindings stings in JSON.
	 * Only one-way binding is supported.
	 * @private
	 * @experimental
	 */
	return ManagedObject.extend("sap.ui.integration.designtime.baseEditor.util.ObjectBinding", {
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
						path: {type: "string"},
						value: {type: "any"}
					}
				}
			}
		},
		exit: function() {
			this._cleanup();
		},
		setObject: function (oObject) {
			var vReturn = this.setProperty("object", oObject);
			this._originalObject = deepClone(oObject);
			this._init();
			return vReturn;
		},
		setModel: function () {
			var vReturn = ManagedObject.prototype.setModel.apply(this, arguments);
			this._init();
			return vReturn;
		},
		setBindingContext: function () {
			var vReturn = ManagedObject.prototype.setBindingContext.apply(this, arguments);
			this._init();
			return vReturn;
		},
		_init: function() {
			this._cleanup();
			var oObject = this.getObject();
			if (oObject) {
				// restore original binding strings
				Object.keys(oObject).forEach(function(sKey) {
					oObject[sKey] = deepClone(this._originalObject[sKey]);
				}.bind(this));
				this._createPropertyBindings(oObject);
			}
		},
		_cleanup: function() {
			if (this._mSimpleBindings) {
				Object.keys(this._mSimpleBindings).forEach(function(sKey) {
					var oBinding = this._mSimpleBindings[sKey];
					// destroy is not removing binding from the model's list of bindings
					oBinding.getModel().removeBinding(oBinding);
					oBinding.destroy();
				}.bind(this));
			}
			this._mSimpleBindings = {};
		},
		_createPropertyBindings: function(oObject, sPath) {
			Object.keys(oObject).forEach(function(sKey) {
				var sCurPath = sPath ? sPath + "/" + sKey : sKey;
				if (typeof oObject[sKey] === "string") {
					var oBindingInfo = BindingParser.complexParser(oObject[sKey]);
					if (oBindingInfo) {
						if (oBindingInfo.parts) {
							// first check that all models for all parts are available
							if (!oBindingInfo.parts.find(
									function(oPart) {
										return !this.getModel(oPart.model);
									}.bind(this))
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
						this._updateValue(sCurPath, oBindingInfo);
					}
				} else if (oObject[sKey] && typeof oObject[sKey] === "object") {
					this._createPropertyBindings(oObject[sKey], sCurPath);
				}
			}.bind(this));
		},
		_updateValue: function(sPath, oBindingInfo) {
			var oObject = this.getObject();
			var aParts = sPath.split("/");
			var sKey = aParts.pop();
			if (aParts.length) {
				oObject = ObjectPath.get(aParts, oObject);
			}
			this.bindProperty("_value", oBindingInfo);
			// to avoid changes influencing the model, if oValue is an object (since it is one-way only binding)
			var oValue = deepClone(this.getProperty("_value"));
			this.unbindProperty("_value");
			if (oValue !== oObject[sKey]) {
				oObject[sKey] = oValue;
				this.fireChange({
					path: sPath,
					value: oValue
				});
			}
		},
		_createSimpleBinding: function(oSimpleBindingInfo, sCurPath, oBindingInfo) {
			var oContext = this.getBindingContext(oSimpleBindingInfo.model);
			var sHash = oSimpleBindingInfo.model + ">" + oSimpleBindingInfo.path;
			var oBinding = this._mSimpleBindings[sHash];
			if (!oBinding) {
				oBinding = this.getModel(oSimpleBindingInfo.model).bindProperty(oSimpleBindingInfo.path, oContext);
				this._mSimpleBindings[sHash] = oBinding;
			}
			oBinding.attachChange(function(oEvent) {
				this._updateValue(sCurPath, oBindingInfo);
			}.bind(this));
			return oBinding;
		}
	});
});
