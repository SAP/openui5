/*
 * ! ${copyright}
 */
sap.ui.define([
	'../json/JSONModel', '../json/JSONPropertyBinding', '../json/JSONListBinding', 'sap/ui/base/ManagedObject', 'sap/ui/base/ManagedObjectObserver', '../Context', '../ChangeReason', "sap/base/util/uid", "sap/base/Log", "sap/base/util/isPlainObject", "sap/base/util/deepClone"
], function (JSONModel, JSONPropertyBinding, JSONListBinding, ManagedObject, ManagedObjectObserver, Context, ChangeReason, uid, Log, isPlainObject, deepClone) {
	"use strict";

	var CUSTOMDATAKEY = "@custom", ID_DELIMITER = "--";/**
	 * Adapt the observation of child controls in order to be able to react when e.g. the value
	 * of a select inside a list changed. Currently the MOM is not updated then
	 *
	 * @param {object} the caller, here the managed object model
	 * @param {control} the control which shall be (un)observed
	 * @param {object} the observed aggregation
	 * @param {boolean} <code>true</code> for observing and <code>false</code> for unobserving
	 *
	 * @private
	 */
	function _adaptDeepChildObservation(caller, oControl, oAggregation, bObserve) {
		var aChildren = oAggregation.get(oControl) || [], oChild, bRecord;

		for (var i = 0; i < aChildren.length; i++) {
			oChild = aChildren[i];
			if (!(oChild instanceof ManagedObject)) {
				continue;
			}
			bRecord = true;

			if (bObserve) {
				caller._oObserver.observe(oChild, {
					properties: true,
					aggregations: true
				});
			} else {
				caller._oObserver.unobserve(oChild, {
					properties: true,
					aggregations: true
				});
			}

			var mAggregations = oChild.getMetadata().getAllAggregations();

			for (var sKey in mAggregations) {
				_adaptDeepChildObservation(caller, oChild, mAggregations[sKey], bObserve);
			}
		}

		if (bRecord) {
			var sKey = oControl.getId() + "/@" + oAggregation.name;

			if (bObserve) {
				if (!caller._mObservedCount.aggregations[sKey]) {
					caller._mObservedCount.aggregations[sKey] = 0;
				}
				caller._mObservedCount.aggregations[sKey]++;
			} else {
				delete caller._mObservedCount.aggregations[sKey];
			}
		}
	}

	/**
	 * Traverse in the recorded node stack of an object retrievel to tha last used
	 * managed object in oder to be able to get the value/binding to use this
	 * for further retrietment
	 * @param aNodeStack
	 * @returns {array} an array containing:
	 * <ul>
	 *     <li>the last managed object</li>
	 *     <li>a map with the value of the last direct child and its path</li>
	 *     <li>an array of the remaining parts in the traversal</li>
	 *     <li>a string that represents the reimaining path from the last managed object to the value</li>
	 *  </ul>
	 *
	 */
	function _traverseToLastManagedObject(aNodeStack) {
		//Determine last managed object via node stack of getProperty
		var sMember, i = aNodeStack.length - 1, aParts = [];
		while (!(aNodeStack[i].node instanceof ManagedObject)) {
			if (sMember) {
				aParts.splice(0, 0, sMember);
			}
			sMember = aNodeStack[i].path;
			i--;
		}

		return [aNodeStack[i].node, aNodeStack[i + 1], aParts, sMember];
	}

	/**
	 * Serialize the object to a string to support change detection
	 *
	 * @param vObject
	 * @returns {string} a serialization of the object to a string
	 * @private
	 */
	function _stringify(vObject) {
		var sData = "", sProp;
		var type = typeof vObject;

		if (vObject == null || (type != "object" && type != "function")) {
			sData = vObject;
		} else if (isPlainObject(vObject)) {
			sData = JSON.stringify(vObject);
		} else if (vObject instanceof ManagedObject) {
			sData = vObject.getId();//add the id
			for (sProp in vObject.mProperties) {
				sData = sData + "$" + _stringify(vObject.mProperties[sProp]);
			}
		} else if (Array.isArray(vObject)) {
			for (var i = 0; vObject.length; i++) {
				sData = sData + "$" + _stringify(vObject);
			}
	    } else {
			Log.warning("Could not stringify object " + vObject);
			sData = "$";
		}

		return sData;
	}

	var ManagedObjectModelAggregationBinding = JSONListBinding.extend("sap.ui.model.base.ManagedObjectModelAggregationBinding", {
		constructor: function() {
			JSONListBinding.apply(this, arguments);
			this._getOriginOfManagedObjectModelBinding();
		},
		/**
		 * Checks if this list binding might by affected by changes inside the given control.
		 * This means the control is inside the subtree spanned by the managed object whose
		 * aggregation or property represents this list binding.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl The possible descendant
		 * @returns {boolean}
		 *    <code>true</code> if the list binding might be affected by changes inside the given
		 *    control, <code>false</code> otherwise
		 * @private
		 */
		_mightBeAffectedByChangesInside : function(oControl) {
			while ( oControl ) {
				if ( oControl.getParent() === this._oOriginMO ) {
					// Note: No check for _sParentAggregation because of possible aggregation
					// forwarding.
					return true;
				}
				// Note: For aggregation forwarding the parent is hopefully contained in the
				// origin managed object otherwise this binding is not refreshed correct
				oControl = oControl.getParent();
			}

			return false;
		},
		/**
		 * Use the id of the ManagedObject instance as the unique key to identify
		 * the entry in the extended change detection. The default implementation
		 * in the parent class which uses JSON.stringify to serialize the instance
		 * doesn't fit here because none of the ManagedObject instance can be
		 * Serialized.
		 *
		 * @param {sap.ui.model.Context} oContext the binding context object
		 * @return {string} The identifier used for diff comparison
		 * @see sap.ui.model.ListBinding.prototype.getEntryData
		 *
		 */
		getEntryKey: function(oContext) {
			// use the id of the ManagedObject instance as the identifier
			// for the extended change detection
			var oObject = oContext.getObject();
			if (oObject instanceof  ManagedObject) {
				return oObject.getId();
			}

			return JSONListBinding.prototype.getEntryKey.apply(this, arguments);
		},
		getEntryData: function(oContext) {
			// use the id of the ManagedObject instance as the identifier
			// for the extended change detection
			var oObject = oContext.getObject();
			if (oObject instanceof  ManagedObject) {
				return _stringify(oObject);
			}

			return JSONListBinding.prototype.getEntryData.apply(this, arguments);
		},
		/**
		 * In order to be able to page from an outer control an inner aggregation binding
		 * must be forced to page also
		 *
		 * @override
		 */
		_getContexts: function(iStartIndex, iLength) {
			var iSizeLimit;
			if (this._oAggregation) {
				var oInnerListBinding = this._oOriginMO.getBinding(this._sMember);

				//check if the binding is a list binding
				if (oInnerListBinding) {
					var oModel = oInnerListBinding.getModel();
					iSizeLimit = oModel.iSizeLimit;
				}

				var oBindingInfo = this._oOriginMO.getBindingInfo(this._sMember);

				//sanity check for paging exceeds model size limit
				if (oBindingInfo && iStartIndex >= 0 && iLength &&
					iSizeLimit && iLength > iSizeLimit) {
					var bUpdate = false;

					if (iStartIndex != oBindingInfo.startIndex) {
						oBindingInfo.startIndex = iStartIndex;
						bUpdate = true;
					}

					if (iLength != oBindingInfo.length) {
						oBindingInfo.length = iLength;
						bUpdate = true;
					}

					if (bUpdate) {
						this._oAggregation.update(this._oOriginMO, "change");
					}
				}
			}

			return JSONListBinding.prototype._getContexts.apply(this, arguments);
		},
		/**
		 * Determines the managed object that is responsible resp. triggering the list binding.
		 * There are two different cases: A binding of the form
		 * <ul>
		 *     <li>{../table/items}, with the aggregation 'items' here the origin is the table</li>
		 *     <li>{../field/conditions/0/value}, with the array property 'conditions' here the origin is the field</li>
		 * </ul>
		 *
		 * For identifying this object we need to traverse through the complete binding using the record functionality
		 * of the _getObject method.
		 *
		 * @private
		 */
		_getOriginOfManagedObjectModelBinding: function() {
			if (!this._oOriginMO) {
				var oMOM = this.oModel, aNodeStack = [];
				oMOM._getObject(this.sPath, this.oContext, aNodeStack);

				var aValueAndMO = _traverseToLastManagedObject(aNodeStack);

				this._oOriginMO = aValueAndMO[0];
				this._aPartsInJSON = aValueAndMO[2];
				this._sMember = aValueAndMO[3];
				this._oAggregation = this._oOriginMO.getMetadata().getAggregation(this._sMember);
			}
		},
		getLength: function() {
			if (this._aPartsInJSON.length == 0) {
				//this is only valid if the binding points directly to the member of the Managed Object
				var oInnerListBinding = this._oOriginMO.getBinding(this._sMember);

				//check if the binding is a list binding
				if (oInnerListBinding && oInnerListBinding.isA("sap.ui.model.ListBinding")) {
					return oInnerListBinding.getLength();
				}
			}

			return JSONListBinding.prototype.getLength.apply(this, arguments);
		},
		isLengthFinal: function() {
			if (this._aPartsInJSON.length == 0) {
				//this is only valid if the binding points directly to the member of the Managed Object
				var oInnerListBinding = this._oOriginMO.getBinding(this._sMember);

				if (oInnerListBinding && oInnerListBinding.isA("sap.ui.model.ListBinding")) {
					return oInnerListBinding.isLengthFinal();
				}
			}

			return true;
		}
	});

	var ManagedObjectModelPropertyBinding = JSONPropertyBinding.extend("sap.ui.model.base.ManagedObjectModelPropertyBinding");
	/**
	 * The ManagedObjectModel class allows you to bind to properties and aggregations of managed objects.
	 *
	 * @class The ManagedObjectModel class can be used for data binding of properties and aggregations for managed objects.
	 *
	 * Provides model access to a given {@link sap.ui.base.ManagedObject}. Such access allows to bind to properties and aggregations of
	 * this object.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject the managed object models root object
	 * @param {object} oData an object for custom data
	 * @alias sap.ui.model.base.ManagedObjectModel
	 * @extends sap.ui.model.json.JSONModel
	 * @public
	 * @experimental since 1.58
	 */
	var ManagedObjectModel = JSONModel.extend("sap.ui.model.base.ManagedObjectModel", /** @lends sap.ui.mdc.model.base.ManagedObjectModel.prototype */
		{
			constructor: function (oObject, oData) {
				if (!oData && typeof oData != "object") {
					oData = {};
				}
				oData[CUSTOMDATAKEY] = {};
				this._oObject = oObject;
				this._mObservedCount = {
					properties: {},
					aggregations: {}
				};
				this.mListBinding = {};
				JSONModel.apply(this, [
					oData
				]);

				this._oObserver = new ManagedObjectObserver(this.observerChanges.bind(this));
			}
		});

	/**
	 * The purpose of the getProperty is to retrieve properties or aggregations from the root managed object.
	 *
	 * Depending on the requesting path the result could be one of the following:
	 * <ul>
	 * <li> The value of a property, for example,  <code>oTextModel.getProperty("/text")</code>
	 * <li> A managed object as a result from a non-multiple aggregation, for example, <code>oColumn.getProperty("/label")</code>
	 * <li> A list of managed objects for multiple aggregations, for example, <code>oTable.getProperty("/columns")</code>.
	 * </ul>
	 *
	 * In addition a deep dive into the aggregations is also possible.
	 *
	 * To retrieve special settings or custom data from the managed object model, there is a special syntax for the selector parts:
	 * <ul>
	 * <li> A part starting with <code>@</code> can be used to access special settings like for example, the <code>id</code>
	 * <li> A path starting with <code>/@custom</code> is used to access the user-defined custom data.
	 * <li> A part containing <code>#</code> can be used to access controls by their <code>id</code>. This is currently used for the managed object model of the view.
	 * </ul>
	 * @param {string} sPath The path or name of a property of the root managed object
	 * @param {object} [oContext=null] The context with which the path can be resolved
	 * @returns {any} The value of the property, an array, or a managed object
	 * @public
	 * @name ManagedObjectModel.prototype.getProperty
	 */

	/**
	 * Convenience functionality to distinguish the goal of the access to the managed object.
	 *
	 * For example, it is more intuitive to say <code>oTableModel.getAggregation("/columns")</code>
	 * than <code>oTableModel.getProperty("/columns")</code> as the columns are an aggregation and not a property.
	 *
	 * @see ManagedObjectModel.prototype#getProperty
	 * @param {string} sPath The path or name of a property of the root managed object
	 * @param {object} [oContext=null] The context with which the path can be resolved
	 * @returns {any} The value of the property, an array, or a managed object
	 * @private
	 */
	ManagedObjectModel.prototype.getAggregation = JSONModel.prototype.getProperty;

	/**
	 * Inserts the user-defined custom data into the model.
	 *
	 * @param {object} oData The data as JSON object to be set on the model
	 * @param {boolean} [bMerge=false] If set to <code>true</code>, the data is merged instead of replaced
	 * @public
	 */
	ManagedObjectModel.prototype.setData = function (oData, bMerge) {
		var _oData = {};
		_oData[CUSTOMDATAKEY] = oData;

		JSONModel.prototype.setData.apply(this, [
			_oData, bMerge
		]);
	};

	/**
	 * Serializes the current custom JSON data of the model into a string.
	 *
	 * @return {string} sJSON The JSON data serialized as string
	 * @private
	 */
	ManagedObjectModel.prototype.getJSON = function () {
		return JSON.stringify(this.oData[CUSTOMDATAKEY]);
	};

	/**
	 * Modifies the property of a child control for a given path and context.
	 *
	 * Example:
	 * <code>oTableModel.setProperty("/columns/0/visible", false)</code> hides the first column of the table
	 *
	 * @param {string} sPath The path to the property of the corresponding managed object, for example, <code>/text</code> for the text property of the root object
	 * @returns {boolean} <code>true</code> if the property was set, <code>false</code> otherwise
	 * @private
	 * @experimental This is only restricted to properties not to aggregations. This means it is not possible to add an aggregation within the managed object model.
	 */
	ManagedObjectModel.prototype.setProperty = function (sPath, oValue, oContext, bAsyncUpdate) {
		var sResolvedPath = this.resolve(sPath, oContext), iLastSlash, sObjectPath, sProperty;

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
		var aNodeStack = [], oObject = this._getObject(sObjectPath, null, aNodeStack);
		if (oObject) {
			if (oObject instanceof ManagedObject) {
				var oProperty = oObject.getMetadata().getManagedProperty(sProperty);
				if (oProperty) {
					if (oProperty.get(oObject) !== oValue) {
						oProperty.set(oObject, oValue);
						//update only property and sub properties
						var fnFilter = function (oBinding) {
							var sPath = this.resolve(oBinding.sPath, oBinding.oContext);
							return sPath ? sPath.startsWith(sResolvedPath) : false;
						}.bind(this);
						this.checkUpdate(false, bAsyncUpdate, fnFilter);
						return true;
					}
				} else {
					Log.warning("The setProperty method only supports properties, the path " + sResolvedPath + " does not point to a property", null, "sap.ui.model.base.ManagedObjectModel");
				}
			} else if (oObject[sProperty] !== oValue) {
				// get get an update of a property that was bound on a target
				// control but which is only a data structure

				var aValueAndMO = _traverseToLastManagedObject(aNodeStack);

				//change the value of the property with structure
				//to obtain a change we need to clone the property value
				//as we will retrigger a setting of the complete property via API
				var oMOMValue = deepClone(aValueAndMO[1].node), aParts = aValueAndMO[2];
				var oPointer = oMOMValue;
				for (var i = 0; i < aParts.length; i++) {
					oPointer = oPointer[aParts[i]];
				}
				oPointer[sProperty] = oValue;

				//determine the path of the property that is now to be changed
				//aParts.join("/") + "/" + sProperty is the complete update path inside the propety
				var sPathInsideProperty = "/" + sProperty;
				if (aParts.length > 0) {
					sPathInsideProperty = "/" + aParts.join("/") + sPathInsideProperty;
				}
				var iDelimiter = sResolvedPath.lastIndexOf(sPathInsideProperty);
				var sPathUpToProperty = sResolvedPath.substr(0, iDelimiter);

				//re-invoke now instead of:
				// -> array case /objectArray/0/value/0 directly to /objectArray
				// -> object case /objectValue/value directly to /objectValue
				return this.setProperty(sPathUpToProperty, oMOMValue, oContext);
			}
		}
		return false;
	};

	/**
	 * Adds the binding to the model.
	 */
	ManagedObjectModel.prototype.addBinding = function (oBinding) {
		JSONModel.prototype.addBinding.apply(this, arguments);
		if (oBinding instanceof ManagedObjectModelAggregationBinding) {
			var sAggregationName = oBinding.sPath.replace("/", "");
			this.mListBinding[sAggregationName] = oBinding;
		}
		oBinding.checkUpdate(false);
	};

	ManagedObjectModel.prototype.removeBinding = function (oBinding) {
		JSONModel.prototype.removeBinding.apply(this, arguments);
		if (oBinding instanceof ManagedObjectModelAggregationBinding) {
			var sAggregationName = oBinding.sPath.replace("/", "");
			delete this.mListBinding[sAggregationName];
		}
		this._observeBeforeEvaluating(oBinding, false);
	};

	/**
	 * Overwrites the default property change event and enriches its parameters with the resolved path for convenience.
	 *
	 * @see sap.ui.model.Model.prototype.firePropertChange
	 *
	 * @private
	 */
	ManagedObjectModel.prototype.firePropertyChange = function (oParameters) {
		if (oParameters.reason === ChangeReason.Binding) {
			oParameters.resolvedPath = this.resolve(oParameters.path, oParameters.context);
		}
		JSONModel.prototype.firePropertyChange.call(this, oParameters);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindAggregation = function (sPath, oContext, mParameters) {
		return JSONModel.prototype.bindProperty.apply(this, arguments);
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ManagedObjectModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		var oBinding = new ManagedObjectModelPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindList
	 */
	ManagedObjectModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new ManagedObjectModelAggregationBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/**
	 * Returns the object for a given path and/or context, if exists.
	 *
	 * @type sap.ui.base.ManagedObject
	 * @param {string} sPath the path
	 * @param {string} [oContext] the context
	 * @returns The object for a given path and/or context, if exists, <code>null</code> otherwise.
	 * @private Might become public later
	 */
	ManagedObjectModel.prototype.getManagedObject = function (sPath, oContext) {
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

	/**
	 * Returns the managed object that is the basis for this model.
	 *
	 * @type sap.ui.base.ManagedObject
	 * @returns The managed object that is basis for the model
	 * @private
	 */
	ManagedObjectModel.prototype.getRootObject = function () {
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
	ManagedObjectModel.prototype._observePropertyChange = function (oObject, oProperty) {
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
	ManagedObjectModel.prototype._unobservePropertyChange = function (oObject, oProperty) {
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
	ManagedObjectModel.prototype._observeAggregationChange = function (oObject, oAggregation) {
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

			//also observe already present children
			//note BCP 1870551736 where there where children present
			//and the MOM did not realize changes on them
			_adaptDeepChildObservation(this, oObject, oAggregation, true);
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
	ManagedObjectModel.prototype._unobserveAggregationChange = function (oObject, oAggregation) {
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
	ManagedObjectModel.prototype._createId = function (sId) {
		var oObject = this._oObject;

		if (typeof oObject.createId === "function") {
			return oObject.createId(sId);
		}

		if (!sId) {
			return oObject.getId() + ID_DELIMITER + uid();
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
	ManagedObjectModel.prototype._getSpecialNode = function (oNode, sSpecial, oParentNode, sParentPart) {
		if (oNode instanceof ManagedObject) {
			if (sSpecial === "className") {
				if (oNode.getMetadata) {
					return oNode.getMetadata().getName();
				} else {
					return typeof oNode;
				}
			} else if (sSpecial === "id") {
				return oNode.getId();
			} else if (sSpecial === "metadataContexts") {
				return oNode._oProviderData;
			}
		} else if (sSpecial === "binding" && oParentNode && sParentPart) {
			return oParentNode.getBinding(sParentPart);
		} else if (sSpecial === "bound" && oParentNode && sParentPart) {
			return oParentNode.isBound(sParentPart);
		} else if (sSpecial === "bindingInfo" && oParentNode && sParentPart) {
			return oParentNode.getBindingInfo(sParentPart);
		} else if (Array.isArray(oNode)) {
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
	ManagedObjectModel.prototype._getObject = function (sPath, oContext, aNodeStack) {
		var oNode = this._oObject, sResolvedPath = "", that = this;

		if (aNodeStack) {
			aNodeStack.push({path: "/", node: oNode}); // remember first node
		}

		this.aBindings.forEach(function (oBinding) {
			if (!oBinding._bAttached) {
				that._observeBeforeEvaluating(oBinding, true);
			}
		});

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
				return JSONModel.prototype._getObject.apply(this, [
					sPath, oContext
				]);
			}
		} else {
			oNode = oContext;
			sResolvedPath = sPath;
		}

		if (!oNode) {
			return null;
		}

		var aParts = sResolvedPath.split("/"), iIndex = 0;

		if (!aParts[0]) {
			// absolute path starting with slash
			iIndex++;
		}
		var oParentNode = null, sParentPart = null, sPart;
		while (oNode !== null && aParts[iIndex]) {
			sPart = aParts[iIndex];
			if (sPart == "id") {
				//Managed Object Model should accept also /id as path to be used for templating
				sPart = "@id";
			}

			if (sPart.indexOf("@") === 0) {
				// special properties
				oNode = this._getSpecialNode(oNode, sPart.substring(1), oParentNode, sParentPart);
			} else if (oNode instanceof ManagedObject) {
				var oNodeMetadata = oNode.getMetadata();

				// look for the marker interface
				if (oNodeMetadata.isInstanceOf("sap.ui.core.IDScope") && sPart.indexOf("#") === 0) {
					oNode = oNode.byId(sPart.substring(1));
				} else {
					oParentNode = oNode;
					sParentPart = sPart;
					var oProperty = oNodeMetadata.getManagedProperty(sPart);
					if (oProperty) {
						oNode = oProperty.get(oNode);
					} else {
						var oAggregation = oNodeMetadata.getManagedAggregation(sPart);
						if (oAggregation) {
							oNode = oAggregation.get(oNode);
						} else {
							if (oNode && oNode[sPart] && typeof oNode[sPart] === "function") {
								oNode = oNode[sPart]();
							} else {
								oNode = null;
							}
						}
					}
				}
			} else if (Array.isArray(oNode) || isPlainObject(oNode)) {
				oNode = oNode[sPart];
			} else {
				if (oNode && oNode[sPart] && typeof oNode[sPart] === "function") {
					oNode = oNode[sPart]();
				} else {
					oNode = null;
				}
			}

			if (aNodeStack) {
				aNodeStack.push({path: sPart, node: oNode});
			}
			iIndex++;
		}
		return oNode;
	};

	/**
	 * @see sap.ui.model.Model.prototype.firePropertChange
	 */
	ManagedObjectModel.prototype.destroy = function () {
		for (var n in this._mAggregationObjects) {
			var o = this._mAggregationObjects[n];
			// o.object._detachModifyAggregation(o.aggregationName, this._handleAggregationChange, this);
			if (o.object.invalidate.fn) {
				o.object.invalidate = o.object.invalidate.fn;
			}
		}
		JSONModel.prototype.destroy.apply(this, arguments);
	};

	ManagedObjectModel.prototype._observeBeforeEvaluating = function (oBinding, bObserve) {
		if (!oBinding.isResolved()) {
			return;
		}

		var sPath = oBinding.getPath();
		var oContext = oBinding.getContext(), oNode = this._oObject, sResolvedPath;

		if (oContext instanceof ManagedObject) {
			oNode = oContext;
			sResolvedPath = sPath;
		} else if (!oContext || oContext instanceof Context) {
			sResolvedPath = this.resolve(sPath, oContext);
			if (!sResolvedPath) {
				return;
			}
			// handling custom data stored in the original this.oData object of the JSONModel
			if (sResolvedPath.indexOf("/" + CUSTOMDATAKEY) === 0) {
				return;
			}
		} else {
			return;
		}

		var aParts = sResolvedPath.split("/");

		if (!aParts[0]) {
			// absolute path starting with slash
			aParts.shift();
		}

		var sPart = aParts[0];

		//handling of # for byId case of view
		if (oNode.getMetadata().isInstanceOf("sap.ui.core.IDScope") && sPart.indexOf("#") === 0) {
			oNode = oNode.byId(sPart.substring(1));
			sPart = aParts[1];
		}
		if (oNode instanceof ManagedObject) {
			var oNodeMetadata = oNode.getMetadata(), oProperty = oNodeMetadata.getManagedProperty(sPart);
			if (oProperty) {
				if (bObserve === true) {
					this._observePropertyChange(oNode, oProperty);
				} else if (bObserve === false) {
					this._unobservePropertyChange(oNode, oProperty);
				}
			} else {
				var oAggregation = oNodeMetadata.getAggregation(sPart) || oNodeMetadata.getAllPrivateAggregations()[sPart];
				if (oAggregation) {
					if (bObserve === true) {
						this._observeAggregationChange(oNode, oAggregation);
					} else if (bObserve === false) {
						this._unobserveAggregationChange(oNode, oAggregation);
					}
				}
			}

			oBinding._bAttached = bObserve;
		}
	};

	ManagedObjectModel.prototype.observerChanges = function (oChange) {
		if (oChange.type == "aggregation") {
			var mAggregations = {};
			if (oChange.child instanceof ManagedObject) {
				mAggregations = oChange.child.getMetadata().getAllAggregations();
			}

			if (oChange.mutation == "insert") {
				// listen to inner changes only in case there is no alternative type used
				if (oChange.child instanceof ManagedObject) {
					this._oObserver.observe(oChange.child, {
						properties: true,
						aggregations: true
					});
				}

				for (var sKey in mAggregations) {
					_adaptDeepChildObservation(this, oChange.child, mAggregations[sKey], true);
				}

				if (this.mListBinding[oChange.name]) {
					var oListBinding = this._oObject.getBinding(oChange.name);
					var oAggregation = this._oObject.getAggregation(oChange.name);

					//in case of paging wait till the last length is available, else take the length
					if (oListBinding && oListBinding.getCurrentContexts().length != oAggregation.length) {
						return;
					}
				}
			} else {
				// stop listening inner changes
				if (oChange.child instanceof ManagedObject) {
					this._oObserver.unobserve(oChange.child, {
						properties: true,
						aggregations: true
					});
				}

				for (var sKey in mAggregations) {
					_adaptDeepChildObservation(this, oChange.child, mAggregations[sKey], false);
				}
			}
		} else if (oChange.type === "property") {
			// list bindings can be affected
			this.aBindings.forEach(function (oBinding) {
				if (oBinding._mightBeAffectedByChangesInside
					&& oBinding._mightBeAffectedByChangesInside(oChange.object)) {
					oBinding.checkUpdate(true/*bForceUpdate*/);
				}
			});
		}

		this.checkUpdate();
	};

	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for update
	 * @param {boolean} bForceUpdate
	 * @param {boolean} bAsync
	 * @param {function} fnFilter an optional test function to filter the binding
	 * @protected
	 */
	ManagedObjectModel.prototype.checkUpdate = function (bForceUpdate, bAsync, fnFilter) {
		if (bAsync) {
			if (!this.sUpdateTimer) {
				this.sUpdateTimer = setTimeout(function () {
					this.checkUpdate(bForceUpdate, false, fnFilter);
				}.bind(this), 0);
			}
			return;
		}

		if (this.sUpdateTimer) {
			clearTimeout(this.sUpdateTimer);
			this.sUpdateTimer = null;
		}
		var aBindings = this.aBindings.slice(0);
		aBindings.forEach(function (oBinding) {
			if (!fnFilter || fnFilter(oBinding)) {
				oBinding.checkUpdate(bForceUpdate);
			}
		});
	};

	return ManagedObjectModel;

});
