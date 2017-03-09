/*
 * ! ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', '../Binding', '../json/JSONModel', '../json/JSONPropertyBinding', '../json/JSONListBinding', 'sap/ui/base/ManagedObject', '../Context', '../ChangeReason'],
	function(jQuery, Binding, JSONModel, JSONPropertyBinding, JSONListBinding, ManagedObject, Context, ChangeReason) {
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
			this._mAggregationObjects = {};
			this._aPropertyObjects = [];
			JSONModel.apply(this, [oData]);
		}
	});

	ManagedObjectModel.prototype.getAggregation = JSONModel.prototype.getProperty;

	/**
	 * Sets the JSON encoded custom data to the model.
	 *
	 * @param {object} oData the data to set on the model
	 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
	 * @private Might become public later
	 */
	ManagedObjectModel.prototype.setData = function(oData, bMerge){
		var _oData = {};
		_oData[CUSTOMDATAKEY] = oData;

		JSONModel.prototype.setData.apply(this, [_oData, bMerge]);
	};

	/**
	 * Serializes the current custom JSON data of the model into a string.
	 *
	 * @return {string} sJSON the JSON data serialized as string
	 * @private Might become public later
	 */
	ManagedObjectModel.prototype.getJSON = function(){
		return JSON.stringify(this.oData[CUSTOMDATAKEY]);
	};

	/**
	 * Sets a property of a control for a given path and context
	 * @param {string} sPath the path of the
	 * @returns {boolean} true if the property was set, else false
	 * @private Might become public later
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

		//handling custom data and store it in the original this.oData object of the JSONModel
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
				//get get an update of a property that was bound on a target
				//control but which is only a data structure
				oObject[sProperty] = oValue;
				this.checkUpdate(false, bAsyncUpdate);
				return true;
			}
		}
		return false;
	};

	/**
	 * Overwrites the default property change event and enriches its parameters with the resolved path for convenience.
	 *
	 * @see sap.ui.model.Model.prototype.firePropertChange
	 *
	 * @private
	 */
	ManagedObjectModel.prototype.firePropertyChange = function(mArguments){
		if (mArguments.reason === ChangeReason.Binding) {
			mArguments.resolvedPath = this.resolve(mArguments.path, mArguments.context);
		}
		JSONModel.prototype.firePropertyChange.call(this, mArguments);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindAggregation = function(sPath, oContext, mParameters) {
		return new ManagedObjectModelPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		return new ManagedObjectModelPropertyBinding(this, sPath, oContext, mParameters);
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

	/* ***************************************
	 * Private Helpers
	 * ***************************************/

	/**
	 * Registers to the _change event for a property on an object
	 * @private
	 */
	ManagedObjectModel.prototype._registerPropertyChange = function(oObject, sPropertyName) {
		var sKey = oObject.getId() + "/@" + sPropertyName;
		if (this._aPropertyObjects.length == 0) {
			oObject.attachEvent("_change", sKey, this._handlePropertyChange, this);
		}
		if (this._aPropertyObjects.indexOf(sKey) === -1) {
			this._aPropertyObjects.push(sKey);
		}
	};

	/**
	 * Handles property changes
	 * @private
	 */
	ManagedObjectModel.prototype._handlePropertyChange = function(oEvent, sKey) {
		if (this._aPropertyObjects.indexOf(sKey) > -1) {
			this.checkUpdate();
		}
	};

	/**
	 * Registers to the modifyAggregation event for a property on an object
	 * @private
	 */
	ManagedObjectModel.prototype._registerAggregationChange = function(oObject, sAggregationName) {
		var sKey = oObject.getId() + "/@" + sAggregationName;
		if (!this._mAggregationObjects.hasOwnProperty(sKey)) {
			oObject._attachModifyAggregation(sAggregationName, sKey, this._handleAggregationChange, this);
			this._mAggregationObjects[sKey] = {
				object : oObject,
				aggregationName : sAggregationName
			};
		}
	};

	/**
	 * Handles aggregation changes
	 * @private
	 */
	ManagedObjectModel.prototype._handleAggregationChange = function(oEvent, sKey) {
		if (this._mAggregationObjects.hasOwnProperty(sKey)) {
			if (oEvent.getParameter("type") === "insert") {
				this.checkUpdate(true);
			} else if (oEvent.getParameter("type") === "remove") {
				var oObject = oEvent.getParameter("object").getParent();
				if (oObject) {
					var aFound = this._oObject.findAggregatedObjects(true, function(oProcessObject) {
						if (oObject === oProcessObject) {
							return true;
						}
					});
					if (aFound.length === 0) {
						delete this._mAggregationObjects[sKey];
						oObject._detachModifyAggregation(sKey.split("/@")[1], this._handleAggregationChange, this);
					}
				}
				this.checkUpdate(true);
			}
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
					if (oNode[i].getId() === this._createId(sId) || oNode[i].getId() === sId) { //TBD: Or should be avoided
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
	ManagedObjectModel.prototype._getObject = function(sPath, oContext) {
		var oNode = this._oObject,
			sResolvedPath = "";

		if (typeof sPath === "string" && sPath.indexOf("/") != 0 && !oContext) {
			return null;
		}

		if (oContext instanceof ManagedObject) {
			oNode = oContext;
			sResolvedPath = sPath;
		} else if (!oContext || oContext instanceof Context){
			sResolvedPath = this.resolve(sPath, oContext);
			if (!sResolvedPath) {
				return oNode;
			}
			//handling custom data stored in the original this.oData object of the JSONModel
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
			if (sPart.indexOf("@") === 0 ) {
				// special properties
				oNode = this._getSpecialNode(oNode, sPart.substring(1), oParentNode, sParentPart);
			} else if (oNode instanceof ManagedObject) {
				oParentNode = oNode;
				sParentPart = sPart;
				var oNodeMetadata = oNode.getMetadata(),
					oProperty = oNodeMetadata.getProperty(sPart);

				if (oProperty) {
					this._registerPropertyChange(oNode, sPart);
					oNode = oNode[oProperty._sGetter]();
				} else {
					var oAggregation = oNodeMetadata.getAggregation(sPart) || oNodeMetadata.getAllPrivateAggregations()[sPart];
					if (oAggregation) {
						this._registerAggregationChange(oNode, sPart);
						//TBD: Only allow access to the private aggregations of this._oObject?
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
		for (var n in this._mAggregationObjects) {
			var o = this._mAggregationObjects[n];
			o.object._detachModifyAggregation(o.aggregationName, this._handleAggregationChange, this);
		}
		this._aPropertyObjects = [];

		this._oObject = null;
		this.oData = null;
		this.aBindings = [];
		this.mContexts = {};
		this.mSupportedBindingModes = {"OneWay": true, "TwoWay": true, "OneTime": true};
		this.bLegacySyntax = false;
		this.sUpdateTimer = null;
		JSONModel.prototype.destroy.apply(this, arguments);
	};

	return ManagedObjectModel;

});
