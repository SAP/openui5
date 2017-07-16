/*
 * ! ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', '../Binding', '../json/JSONModel', '../json/JSONPropertyBinding', '../json/JSONListBinding', 'sap/ui/base/ManagedObject', 'sap/ui/base/ManagedObjectObserver', '../Context', '../ChangeReason'
], function(jQuery, Binding, JSONModel, JSONPropertyBinding, JSONListBinding, ManagedObject, ManagedObjectObserver, Context, ChangeReason) {
	"use strict";

	var ManagedObjectModelAggregationBinding = JSONListBinding.extend("sap.ui.model.base.ManagedObjectModelAggregationBinding"),
		ManagedObjectModelPropertyBinding = JSONPropertyBinding.extend("sap.ui.model.base.ManagedObjectModelPropertyBinding"),
		CUSTOMDATAKEY = "@custom",
		ID_DELIMITER = "--";

	/**
	 * Managed Object model that allows to bind to properties and aggregations of objects.
	 *
	 * @class Managed Object model that allows to bind to properties and aggregations of objects.
	 *
	 * Provides model access to a given {@link sap.ui.base.ManagedObject}. Such access allows to bind to properties and aggregations of
	 * this object.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject the managed object models root object
	 * @param {object} oData an object for custom data
	 * @alias sap.ui.model.base.ManagedObjectModel
	 * @extends sap.ui.model.json.JSONModel
	 * @private
	 */
	var ManagedObjectModel = JSONModel.extend("sap.ui.model.base.ManagedObjectModel", /** @lends sap.ui.mdc.model.base.ManagedObjectModel.prototype */
	{
		constructor: function(oObject, oData) {
			if (!oData && typeof oData != "object") {
				oData = {};
			}
			oData[CUSTOMDATAKEY] = {};
			this._oObject = oObject;
			this._mObservedCount = {
				properties: {},
				aggregations: {}
			};
			JSONModel.apply(this, [oData]);

			this._oObserver = new ManagedObjectObserver(this.observerChanges.bind(this));
		}
	});

	ManagedObjectModel.prototype.getAggregation = JSONModel.prototype.getProperty;

	/**
	 * Sets the JSON encoded custom data to the model.
	 *
	 * @param {object} oData the data to set on the model
	 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
	 * @private
	 */
	ManagedObjectModel.prototype.setData = function(oData, bMerge) {
		var _oData = {};
		_oData[CUSTOMDATAKEY] = oData;

		JSONModel.prototype.setData.apply(this, [_oData, bMerge]);
	};

	/**
	 * Serializes the current custom JSON data of the model into a string.
	 *
	 * @return {string} sJSON the JSON data serialized as string
	 * @private
	 */
	ManagedObjectModel.prototype.getJSON = function() {
		return JSON.stringify(this.oData[CUSTOMDATAKEY]);
	};

	/**
	 * Sets a property of a control for a given path and context
	 *
	 * @param {string} sPath the path of the
	 * @returns {boolean} true if the property was set, else false
	 * @private
	 */
	ManagedObjectModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {
		var sResolvedPath = this.resolve(sPath, oContext),
			iLastSlash,
			sObjectPath,
			sProperty;

		// return if path / context is invalid
		if (!sResolvedPath) {
			return false;
		}

		// handling custom data and store it in the original this.oData object of the JSONModel
		if (sResolvedPath.indexOf("/" + CUSTOMDATAKEY) === 0) {
			return JSONModel.prototype.setProperty.apply(this, arguments);
		}

		iLastSlash = sResolvedPath.lastIndexOf("/");
		// In case there is only one slash at the beginning, sObjectPath must contain this slash
		sObjectPath = sResolvedPath.substring(0, iLastSlash || 1);
		sProperty = sResolvedPath.substr(iLastSlash + 1);

		var oObject = this._getObject(sObjectPath);
		if (oObject) {
			if (oObject instanceof ManagedObject) {
				var oProperty = oObject.getMetadata().getProperty(sProperty);
				if (oProperty) {
					var sSetter = oProperty._sMutator,
						sGetter = oProperty._sGetter;
					if (oObject[sGetter] !== oValue) {
						oObject[sSetter](oValue);
						this.checkUpdate(false, bAsyncUpdate);
						return true;
					}
				}
			} else if (oObject[sProperty] !== oValue) {
				// get get an update of a property that was bound on a target
				// control but which is only a data structure
				oObject[sProperty] = oValue;
				this.checkUpdate(false, bAsyncUpdate);
				return true;
			}
		}
		return false;
	};

	/**
	 * Adds the binding to the model.
	 */
	ManagedObjectModel.prototype.addBinding = function(oBinding) {
		JSONModel.prototype.addBinding.apply(this, arguments);
		this.checkUpdate();
	};

	ManagedObjectModel.prototype.removeBinding = function(oBinding) {
		JSONModel.prototype.removeBinding.apply(this, arguments);
		if (oBinding._bAttached) {
			oBinding._bAttached = false;
			this._getObject(oBinding.getPath(), oBinding.getContext(), false);
		}
	};

	/**
	 * Overwrites the default property change event and enriches its parameters with the resolved path for convenience.
	 *
	 * @see sap.ui.model.Model.prototype.firePropertChange
	 *
	 * @private
	 */
	ManagedObjectModel.prototype.firePropertyChange = function(mArguments) {
		if (mArguments.reason === ChangeReason.Binding) {
			mArguments.resolvedPath = this.resolve(mArguments.path, mArguments.context);
		}
		JSONModel.prototype.firePropertyChange.call(this, mArguments);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindAggregation = function(sPath, oContext, mParameters) {
		return JSONModel.prototype.bindProperty.apply(this, arguments);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new ManagedObjectModelPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindList
	 */
	ManagedObjectModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new ManagedObjectModelAggregationBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		oBinding.enableExtendedChangeDetection();
		return oBinding;
	};

	/**
	 * Returns the object for a given path and/or context, if exists.
	 *
	 * @param {string} sPath the path
	 * @param {string} [oContext] the context
	 * @returns The object for a given path and/or context, if exists, <code>null</code> otherwise.
	 * @private Might become public later
	 */
	ManagedObjectModel.prototype.getManagedObject = function(sPath, oContext) {
		if (sPath instanceof Context) {
			oContext = sPath;
			sPath = oContext.getPath();
		}
		var oObject = this.getProperty(sPath, oContext);
		if (oObject instanceof ManagedObject) {
			return oObject;
		}
		return null;
	};

	ManagedObjectModel.prototype.getRootObject = function() {
		return this._oObject;
	};

	/*************************************************************************************************************************************************
	 * Private Helpers
	 ************************************************************************************************************************************************/

	/**
	 * Registers to the _change event for a property on an object
	 * Each property has its own handler registered to the _change.
	 * @param {sap.ui.base.ManagedObject} oObject the object for the property
	 * @param {object} oProperty the property object from the metadata of the object
	 * @private
	 */
	ManagedObjectModel.prototype._observePropertyChange = function(oObject, oProperty) {
		if (!oObject || !oProperty) {
			return;
		}

		var sKey = oObject.getId() + "/@" + oProperty.name;

		// only register in case the property is not already observed
		if (!this._oObserver.isObserved(oObject, {
			properties: [
				oProperty.name
			]
		})) {
			this._oObserver.observe(oObject, {
				properties: [
					oProperty.name
				]
			});

			this._mObservedCount.properties[sKey] = 1;
		} else {
			this._mObservedCount.properties[sKey]++;
		}
	};

	/**
	 * Deregisters the handler from a property.
	 * Each property has its own handler to registered to the _change.
	 * @param {sap.ui.base.ManagedObject} oObject the object for the property
	 * @param {object} oProperty the property object from the metadata of the object
	 * @private
	 */
	ManagedObjectModel.prototype._unobservePropertyChange = function(oObject, oProperty) {
		if (!oObject || !oProperty) {
			return;
		}

		var sKey = oObject.getId() + "/@" + oProperty.name;

		this._mObservedCount.properties[sKey]--;

		if (this._mObservedCount.properties[sKey] == 0) {
			this._oObserver.unobserve(oObject, {
				properties: [
					oProperty.name
				]
			});

			delete this._mObservedCount.properties[sKey];
		}
	};

	/**
	 * Registers the handler for an aggregation.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject the object for the property
	 * @param {object} oAggregation the aggregation object from the metadata of the object
	 * @private
	 */
	ManagedObjectModel.prototype._observeAggregationChange = function(oObject, oAggregation) {
		if (!oObject || !oAggregation) {
			return;
		}

		var sKey = oObject.getId() + "/@" + oAggregation.name;

		// only register in case the aggregation is not already observed
		if (!this._oObserver.isObserved(oObject, {
			aggregations: [
				oAggregation.name
			]
		})) {
			this._oObserver.observe(oObject, {
				aggregations: [
					oAggregation.name
				]
			});

			this._mObservedCount.aggregations[sKey] = 1;
		} else {
			this._mObservedCount.aggregations[sKey]++;
		}
	};

	/**
	 * Deregisters the handler from an aggregation.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject the object for the property
	 * @param {object} oAggregation the aggregation object from the metadata of the object
	 * @private
	 */
	ManagedObjectModel.prototype._unobserveAggregationChange = function(oObject, oAggregation) {
		if (!oObject || !oAggregation) {
			return;
		}

		var sKey = oObject.getId() + "/@" + oAggregation.name;

		this._mObservedCount.aggregations[sKey]--;

		if (this._mObservedCount.aggregations[sKey] == 0) {
			this._oObserver.unobserve(oObject, {
				aggregations: [
					oAggregation.name
				]
			});

			delete this._mObservedCount.aggregations[sKey];
		}
	};

	/**
	 * Convert the given local object id to a globally unique id
	 * by prefixing it with the object id of this model.
	 *
	 * @param {string} sId local Id of the object
	 * @return {string} prefixed id
	 * @private
	 */
	ManagedObjectModel.prototype._createId = function(sId) {
		var oObject = this._oObject;

		if (typeof oObject.createId === "function") {
			return oObject.createId(sId);
		}

		if (!sId) {
			return oObject.getId() + ID_DELIMITER + jQuery.sap.uid();
		}

		if (sId.indexOf(oObject.getId() + ID_DELIMITER) != 0) { // ID not already prefixed
			return oObject.getId() + ID_DELIMITER + sId;
		}

		return sId;
	};

	/**
	 * Handles special paths that use the @ char and return the corresponding JSON structures
	 * @private
	 */
	ManagedObjectModel.prototype._getSpecialNode = function(oNode, sSpecial, oParentNode, sParentPart) {
		if (oNode instanceof ManagedObject) {
			if (sSpecial === "className") {
				if (oNode.getMetadata) {
					return oNode.getMetadata().getName();
				} else {
					return typeof oNode;
				}
			} else if (sSpecial === "id") {
				return oNode.getId();
			}
		} else if (sSpecial === "binding" && oParentNode && sParentPart) {
			return oParentNode.getBinding(sParentPart);
		} else if (sSpecial === "bound" && oParentNode && sParentPart) {
			return oParentNode.isBound(sParentPart);
		} else if (sSpecial === "bindingInfo" && oParentNode && sParentPart) {
			return oParentNode.getBindingInfo(sParentPart);
		} else if (jQuery.isArray(oNode)) {
			if (sSpecial === "length") {
				return oNode.length;
			} else if (sSpecial.indexOf("id=") === 0) {
				var sId = sSpecial.substring(3), oFoundNode = null;
				for (var i = 0; i < oNode.length; i++) {
					if (oNode[i].getId() === this._createId(sId) || oNode[i].getId() === sId) { // TBD: Or should be avoided
						oFoundNode = oNode[i];
						break;
					}
				}
				return oFoundNode;
			}
		}
		return null;
	};

	/**
	 * Returns the corresponding object for the given path and/or context.
	 * Supported selectors -> see _getSpecialNode
	 * @private
	 */
	ManagedObjectModel.prototype._getObject = function(sPath, oContext, bChangeHandlers) {
		var oNode = this._oObject,
			sResolvedPath = "";

		for (var i = 0; i < this.aBindings.length; i++) {
			var oBinding = this.aBindings[i],
				sResolved = this.resolve(oBinding.getPath(), oBinding.getContext());
			if (sResolved && !oBinding._bAttached) {
				oBinding._bAttached = true;
				this._getObject(oBinding.getPath(), oBinding.getContext(), true);
			}
		}

		if (typeof sPath === "string" && sPath.indexOf("/") != 0 && !oContext) {
			return null;
		}

		if (oContext instanceof ManagedObject) {
			oNode = oContext;
			sResolvedPath = sPath;
		} else if (!oContext || oContext instanceof Context) {
			sResolvedPath = this.resolve(sPath, oContext);
			if (!sResolvedPath) {
				return oNode;
			}
			// handling custom data stored in the original this.oData object of the JSONModel
			if (sResolvedPath.indexOf("/" + CUSTOMDATAKEY) === 0) {
				return JSONModel.prototype._getObject.apply(this, [sPath, oContext]);
			}
		} else {
			oNode = oContext;
			sResolvedPath = sPath;
		}

		if (!oNode) {
			return null;
		}

		var aParts = sResolvedPath.split("/"),
			iIndex = 0;

		if (!aParts[0]) {
			// absolute path starting with slash
			iIndex++;
		}
		var oParentNode = null,
			sParentPart = null;
		while (oNode !== null && aParts[iIndex]) {
			var sPart = aParts[iIndex];
			if (sPart.indexOf("@") === 0) {
				// special properties
				oNode = this._getSpecialNode(oNode, sPart.substring(1), oParentNode, sParentPart);
			} else if (oNode instanceof ManagedObject) {
				oParentNode = oNode;
				sParentPart = sPart;
				var oNodeMetadata = oNode.getMetadata(), oProperty = oNodeMetadata.getProperty(sPart);
				if (oProperty) {
					if (bChangeHandlers === true) {
						this._observePropertyChange(oNode, oProperty);
					} else if (bChangeHandlers === false) {
						this._unobservePropertyChange(oNode, oProperty);
					}
					oNode = oNode[oProperty._sGetter]();
				} else {
					var oAggregation = oNodeMetadata.getAggregation(sPart) || oNodeMetadata.getAllPrivateAggregations()[sPart];
					if (oAggregation) {
						if (bChangeHandlers === true) {
							this._observeAggregationChange(oNode, oAggregation);
						} else if (bChangeHandlers === false) {
							this._unobserveAggregationChange(oNode, oAggregation);
						}
						oNode = oNode[oAggregation._sGetter] ? oNode[oAggregation._sGetter]() : oNode.getAggregation(sPart);
					} else {
						if (oNode && oNode[sPart] && typeof oNode[sPart] === "function") {
							oNode = oNode[sPart]();
						} else {
							oNode = null;
						}
					}
				}
			} else if (jQuery.isArray(oNode) || jQuery.isPlainObject(oNode)) {
				oNode = oNode[sPart];
			} else {
				if (oNode && oNode[sPart] && typeof oNode[sPart] === "function") {
					oNode = oNode[sPart]();
				} else {
					oNode = null;
				}
			}

			iIndex++;
		}
		return oNode;
	};

	/**
	 * @see sap.ui.model.Model.prototype.firePropertChange
	 */
	ManagedObjectModel.prototype.destroy = function() {
		for ( var n in this._mAggregationObjects) {
			var o = this._mAggregationObjects[n];
			// o.object._detachModifyAggregation(o.aggregationName, this._handleAggregationChange, this);
			if (o.object.invalidate.fn) {
				o.object.invalidate = o.object.invalidate.fn;
			}
		}
		JSONModel.prototype.destroy.apply(this, arguments);
	};

	ManagedObjectModel.prototype.observerChanges = function(oChange) {
		this.checkUpdate();
	};

	return ManagedObjectModel;

});
