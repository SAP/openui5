/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseTreeModifier",
	"sap/ui/base/ManagedObject",
	"sap/base/util/merge",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/mvc/EventHandlerResolver",
	"sap/base/util/includes",
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	// needed to have sap.ui.xmlfragment
	"sap/ui/core/Fragment"
], function(
	BaseTreeModifier,
	ManagedObject,
	merge,
	XMLHelper,
	EventHandlerResolver,
	includes,
	ObjectPath,
	isPlainObject
) {

	"use strict";
	/**
	 * Static utility class to access XMLNodes like ManagedObjects,
	 * inside this classes oControl usually means XML node.
	 *
	 * @namespace sap.ui.core.util.reflection.XmlTreeModifier
	 * @extends sap.ui.core.util.reflection.BaseTreeModifier
	 * @private
	 * @ui5-restricted
	 * @since 1.56.0
	 */
	var XmlTreeModifier = /** @lends sap.ui.core.util.reflection.XmlTreeModifier */{

		targets: "xmlTree",

		/**
		 * @inheritDoc
		 */
		setVisible: function (oControl, bVisible) {
			if (bVisible) {
				oControl.removeAttribute("visible");
			} else {
				oControl.setAttribute("visible", bVisible);
			}
		},

		/**
		 * @inheritDoc
		 */
		getVisible: function (oControl) {
			return this.getProperty(oControl, "visible");
		},

		/**
		 * @inheritDoc
		 */
		setStashed: function (oControl, bStashed) {
			if (!bStashed) {
				oControl.removeAttribute("stashed");
			} else {
				oControl.setAttribute("stashed", bStashed);
			}
			this.setVisible(oControl, !bStashed);
		},

		/**
		 * @inheritDoc
		 */
		getStashed: function (oControl) {
			return this.getProperty(oControl, "stashed");
		},

		/**
		 * @inheritDoc
		 */
		bindProperty: function (oControl, sPropertyName, vBindingInfos) {
			oControl.setAttribute(sPropertyName, "{" + vBindingInfos + "}");
		},

		/**
		 * @inheritDoc
		 */
		unbindProperty: function (oControl, sPropertyName) {
			//reset the property
			oControl.removeAttribute(sPropertyName);
		},

		/**
		 * @inheritDoc
		 */
		setProperty: function (oControl, sPropertyName, vPropertyValue) {
			var sValue = this._getSerializedValue(vPropertyValue);
			oControl.setAttribute(sPropertyName, sValue);
		},

		/**
		 * @inheritDoc
		 */
		getProperty: function (oControl, sPropertyName) {
			var vPropertyValue = oControl.getAttribute(sPropertyName);

			var oPropertyInfo = this.getControlMetadata(oControl).getProperty(sPropertyName);
			if (oPropertyInfo) { //not a property like aggregation
				var oType = oPropertyInfo.getType();
				if (vPropertyValue === null) {
					vPropertyValue = oPropertyInfo.getDefaultValue() || oType.getDefaultValue();
				} else {
					// unescape binding like XMLTemplateProcessor
					var vUnescaped = ManagedObject.bindingParser(vPropertyValue, undefined, true);
					// if it is a binding, return undefined as it has to be handled differently
					if (isPlainObject(vUnescaped)) {
						if (vUnescaped.path || vUnescaped.parts) {
							vPropertyValue = undefined;
						} else {
							vPropertyValue = vUnescaped;
						}
					} else {
						vPropertyValue = oType.parseValue(vUnescaped || vPropertyValue);
					}
				}
			}
			return vPropertyValue;
		},

		/**
		 * @inheritDoc
		 */
		isPropertyInitial: function (oControl, sPropertyName) {
			var vPropertyValue = oControl.getAttribute(sPropertyName);
			return (vPropertyValue == null);
		},

		/**
		 * @inheritDoc
		 */
		setPropertyBinding: function (oControl, sPropertyName, sPropertyBinding) {
			if (typeof sPropertyBinding !== "string") {
				throw new Error("For XML, only strings are supported to be set as property binding.");
			}
			oControl.setAttribute(sPropertyName, sPropertyBinding);
		},

		/**
		 * @inheritDoc
		 */
		getPropertyBinding: function (oControl, sPropertyName) {
			var vPropertyValue = oControl.getAttribute(sPropertyName);
			if (vPropertyValue) {
				var vUnescaped = ManagedObject.bindingParser(vPropertyValue, undefined, true);
				if (vUnescaped && (vUnescaped.path || vUnescaped.parts)) {
					return vUnescaped;
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {
			var sId, sLocalName, oError;
			if (!this.bySelector(oSelector, oAppComponent, oView)) {
				var aClassNameParts = sClassName.split('.');
				var sNamespaceURI = "";
				if (aClassNameParts.length > 1) {
					sLocalName = aClassNameParts.pop();
					sNamespaceURI = aClassNameParts.join('.');
				}

				var oNewElementNode = oView.ownerDocument.createElementNS(sNamespaceURI, sLocalName);

				sId = this.getControlIdBySelector(oSelector, oAppComponent);
				if (sId) {
					oNewElementNode.setAttribute("id", sId);
				}
				if (mSettings) {
					this.applySettings(oNewElementNode, mSettings);
				}
				return bAsync ? Promise.resolve(oNewElementNode) : oNewElementNode;
			} else {
				oError = new Error("Can't create a control with duplicated ID " + sId);
				if (bAsync) {
					return Promise.reject(oError);
				}
				throw oError;
			}
		},

		/**
		 * @inheritDoc
		 */
		applySettings: function(oControl, mSettings) {
			var oMetadata = this.getControlMetadata(oControl);
			var mMetadata = oMetadata.getJSONKeys();
			Object.keys(mSettings).forEach(function(sKey) {
				var oKeyInfo = mMetadata[sKey];
				var vValue = mSettings[sKey];
				switch (oKeyInfo._iKind) {
					case 0: // PROPERTY
						this.setProperty(oControl, sKey, vValue);
						break;
					// case 1: // SINGLE_AGGREGATION
					// 	this.insertAggregation(oControl, sKey, vValue);
					case 3: // SINGLE_ASSOCIATION
						this.setAssociation(oControl, sKey, vValue);
						break;
					default:
						throw new Error("Unsupported in applySettings on XMLTreeModifier: " + sKey);
				}
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		_byId: function (sId, oView) {
			// If function defined and operational use getElementById(sId) of document or view to access control
			// ... Note: oView.ownerDocument.getElementById(sId) may fail under IE 11 indicating "permission denied"
			if (oView) {
				if (oView.ownerDocument && oView.ownerDocument.getElementById && oView.ownerDocument.getElementById(sId)) {
					return oView.ownerDocument.getElementById(sId);
				} else {
					return oView.querySelector("[id='" + sId + "']");
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		getId: function (oControl) {
			return oControl.getAttribute("id");
		},

		/**
		 * @inheritDoc
		 */
		getParent: function (oControl) {
			var oParent = oControl.parentNode;
			if (!this.getId(oParent)) {
				//go to the real control, jump over aggregation node
				oParent = oParent.parentNode;
			}

			return oParent;
		},

		/**
		 * @inheritDoc
		 */
		_getLocalName: function (xmlElement) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return xmlElement.localName || xmlElement.baseName || xmlElement.nodeName;
		},

		/**
		 * @inheritDoc
		 */
		getControlType: function (oControl) {
			return this._getControlTypeInXml(oControl);
		},

		/**
		 * @inheritDoc
		 */
		setAssociation: function (vParent, sName, sId) {
			if (typeof sId !== "string"){
				sId = this.getId(sId);
			}
			vParent.setAttribute(sName, sId);
		},

		/**
		 * @inheritDoc
		 */
		getAssociation: function (vParent, sName) {
			return vParent.getAttribute(sName);
		},

		/**
		 * @inheritDoc
		 */
		getAllAggregations: function (oControl) {
			var oControlMetadata = this.getControlMetadata(oControl);
			return oControlMetadata.getAllAggregations();
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: function (oParent, sName) {
			var oAggregationNode = this._findAggregationNode(oParent, sName);
			var bSingleValueAggregation = this._isSingleValueAggregation(oParent, sName);
			if (!oAggregationNode) {
				if (bSingleValueAggregation && this._isAltTypeAggregation(oParent, sName)) {
					return this.getProperty(oParent, sName);
				}
				return bSingleValueAggregation ? undefined : [];
			}
			var aChildren = this._getControlsInAggregation(oParent, oAggregationNode);
			if (bSingleValueAggregation) {
				return aChildren[0];
			}
			return aChildren;
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: function (oParent, sName, oObject, iIndex, oView) {
			var oAggregationNode = this._findAggregationNode(oParent, sName);

			if (!oAggregationNode) {
				// named aggregation must have the same namespace as the parent
				var sNamespaceURI = oParent.namespaceURI;
				// no ids for aggregation nodes => no need pass id or component
				oAggregationNode = this.createControl(sNamespaceURI + "." + sName, undefined, oView);
				oParent.appendChild(oAggregationNode);
			}

			if (iIndex >= oAggregationNode.childElementCount) {
				oAggregationNode.appendChild(oObject);
			} else {
				var oReferenceNode = this._getControlsInAggregation(oParent, oAggregationNode)[iIndex];
				oAggregationNode.insertBefore(oObject, oReferenceNode);
			}

		},

		/**
		 * @inheritDoc
		 */
		removeAggregation: function (oParent, sName, oObject) {
			var oAggregationNode = this._findAggregationNode(oParent, sName);
			oAggregationNode.removeChild(oObject);
		},

		/**
		 * @inheritDoc
		 */
		removeAllAggregation: function (oControl, sName) {
			var oAggregationNode = this._findAggregationNode(oControl, sName);
			if (oControl === oAggregationNode) {
				var aChildControls = this._getControlsInAggregation(oControl, oControl);
				aChildControls.forEach(function(oChildControl) {
					oControl.removeChild(oChildControl);
				});
			} else {
				oControl.removeChild(oAggregationNode);
			}
		},

		/**
		 * @private
		 */
		_findAggregationNode: function (oParent, sName) {
			var oAggregationNode;
			var aChildren = this._children(oParent);
			for (var i = 0; i < aChildren.length; i++) {
				var oNode = aChildren[i];
				if (oNode.localName === sName) {
					oAggregationNode = oNode;
					break;
				}
			}
			if (!oAggregationNode && this._isDefaultAggregation(oParent, sName)) {
				oAggregationNode = oParent;
			}
			return oAggregationNode;
		},

		/**
		 * @private
		 */
		_isDefaultAggregation: function(oParent, sAggregationName) {
			var oControlMetadata = this.getControlMetadata(oParent);
			var oDefaultAggregation = oControlMetadata.getDefaultAggregation();
			return oDefaultAggregation && sAggregationName === oDefaultAggregation.name;
		},

		/**
		 * @private
		 */
		_isNotNamedAggregationNode: function(oParent, oChildNode) {
			var mAllAggregatiosnMetadata = this.getAllAggregations(oParent);
			var oAggregation = mAllAggregatiosnMetadata[oChildNode.localName];
			return oParent.namespaceURI !== oChildNode.namespaceURI || !oAggregation; //same check as in XMLTemplateProcessor (handleChild)
		},

		/**
		 * @private
		 */
		_isSingleValueAggregation: function(oParent, sAggregationName) {
			var mAllAggregatiosnMetadata = this.getAllAggregations(oParent);
			var oAggregationMetadata = mAllAggregatiosnMetadata[sAggregationName];
			return !oAggregationMetadata.multiple;
		},

		/**
		 * @private
		 */
		_isAltTypeAggregation: function(oParent, sAggregationName) {
			var oControlMetadata = this.getControlMetadata(oParent);
			var oAggregationMetadata = oControlMetadata.getAllAggregations()[sAggregationName];
			return !!oAggregationMetadata.altTypes;
		},

		/**
		 * @inheritDoc
		 */
		getControlMetadata: function(oControl) {
			return this._getControlMetadataInXml(oControl);
		},

		/**
		 * @private
		 */
		_getControlsInAggregation: function(oParent, oAggregationNode) {
			//convert NodeList to Array
			var aChildren = Array.prototype.slice.call(this._children(oAggregationNode));
			return aChildren.filter(this._isNotNamedAggregationNode.bind(this, oParent));
		},

		/**
		 * @private
		 */
		_children: function (oParent) {
			if (oParent.children) {
				return oParent.children;
			} else {
				var aChildren = [];
				for (var i = 0; i < oParent.childNodes.length; i++) {
					var oNode = oParent.childNodes[i];
					if (oNode.nodeType === oNode.ELEMENT_NODE) {
						aChildren.push(oNode);
					}
				}
				return aChildren;
			}
		},

		/**
		 * @inheritDoc
		 */
		getBindingTemplate: function (oControl, sAggregationName) {
			var oAggregationNode = this._findAggregationNode(oControl, sAggregationName);
			if (oAggregationNode) {
				var aChildren = this._children(oAggregationNode);
				if (aChildren.length === 1){
					return aChildren[0];
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		updateAggregation: function (oControl, sAggregationName) {
			/*only needed in JS case to indicate binding (template) has changed, in XML case binding has not been created yet (see managed object)*/
		},

		/**
		 * @inheritDoc
		 */
		findIndexInParentAggregation: function (oControl) {
			var oParent,
				sAggregationName,
				aControlsInAggregation;

			// find the parent
			oParent = this.getParent(oControl);

			if (!oParent) {
				return -1;
			}

			// we need the aggregation name in order to find all control nodes in the parent
			// which are relevant to this aggregation and skip all other possible nodes
			sAggregationName = this.getParentAggregationName(oControl, oParent);

			// get the relevant controls from the aggregation node
			aControlsInAggregation = this.getAggregation(oParent, sAggregationName);

			// if the result from the above is array:
			if (Array.isArray(aControlsInAggregation)) {
				// to harmonize behavior with JSControlTree, where stashed controls are not added to the parent aggregation
				aControlsInAggregation = aControlsInAggregation.filter(function(oControl) {
					return !this.getProperty(oControl, "stashed");
				}.bind(this));

				// find and return the correct index
				return aControlsInAggregation.indexOf(oControl);
			} else {
				// if aControlsInAggregation is not an array, then the aggregation is
				// of type 0..1 and aControlsInAggregation is the oControl provided
				// to the function initially, so its index is 0
				return 0;
			}
		},

		/**
		 * @inheritDoc
		 */
		getParentAggregationName: function (oControl, oParent) {
			var bNotNamedAggregation,
				sAggregationName;

			// check if the control is in named aggregatio node
			if (!oParent.isSameNode(oControl.parentNode)) {
				// the control is in named aggregation
				bNotNamedAggregation = false;
			} else {
				// again check just in case
				bNotNamedAggregation = this._isNotNamedAggregationNode(oParent, oControl);
			}

			// check if the the control is in default aggregation
			// and get the name of the aggregation
			if (bNotNamedAggregation) {
				// the control is in the default aggregation of the parent
				sAggregationName = this.getControlMetadata(oParent).getDefaultAggregationName();
			} else {
				// the agregation name is provided and we can simply take it from the xml node
				sAggregationName = this._getLocalName(oControl.parentNode);
			}

			return sAggregationName;
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: function(oControl, sAggregationName) {
			var oMetadata = this.getControlMetadata(oControl);
			var oAggregations = oMetadata.getAllAggregations();
			if (oAggregations) {
				return oAggregations[sAggregationName];
			}
		},

		/**
		 * @inheritDoc
		 */
		validateType: function(oControl, mAggregationMetadata, oParent, sFragment, iIndex) {
			var sTypeOrInterface = mAggregationMetadata.type;

			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (mAggregationMetadata.multiple === false && this.getAggregation(oParent, mAggregationMetadata.name) &&
					this.getAggregation(oParent, mAggregationMetadata.name).length > 0) {
				return false;
			}
			var aControls = sap.ui.xmlfragment({fragmentContent: sFragment});
			if (!Array.isArray(aControls)) {
				aControls = [aControls];
			}
			var bReturn = this._isInstanceOf(aControls[iIndex], sTypeOrInterface) || this._hasInterface(aControls[iIndex], sTypeOrInterface);
			aControls.forEach(function(oFragmentControl) {
				oFragmentControl.destroy();
			});
			return bReturn;
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {
			var aControls;
			var oFragment = XMLHelper.parse(sFragment);
			oFragment = this._checkAndPrefixIdsInFragment(oFragment, sNamespace);

			if (oFragment.localName === "FragmentDefinition") {
				aControls = this._getElementNodeChildren(oFragment);
			} else {
				aControls = [oFragment];
			}

			// check if there is already a field with the same ID and throw error if so
			aControls.forEach(function(oNode) {
				if (this._byId(oNode.getAttribute("id"), oView)) {
					throw Error("The following ID is already in the view: " + oNode.getAttribute("id"));
				}
			}.bind(this));

			return aControls;
		},

		/**
		 * @inheritDoc
		 */
		destroy: function(oControl) {
			var oParent = oControl.parentNode;
			if (oParent) {
				oParent.removeChild(oControl);
			}
		},

		/**
		 * @inheritDoc
		 */
		getChangeHandlerModulePath: function(oControl) {
			if (!oControl){
				return undefined;
			}
			return oControl.getAttributeNS("sap.ui.fl", "flexibility");
		},

		/**
		 * @inheritDoc
		 */
		attachEvent: function(oNode, sEventName, sFunctionPath, vData) {
			if (typeof ObjectPath.get(sFunctionPath) !== "function") {
				throw new Error("Can't attach event because the event handler function is not found or not a function.");
			}

			var sValue = this.getProperty(oNode, sEventName) || "";
			var aEventHandlers = EventHandlerResolver.parse(sValue);
			var sEventHandler = sFunctionPath;
			var aParams = ["$event"];

			if (vData) {
				aParams.push(JSON.stringify(vData));
			}

			sEventHandler += "(" + aParams.join(",") + ")";

			if (!includes(aEventHandlers, sEventHandler)) {
				aEventHandlers.push(sEventHandler);
			}

			oNode.setAttribute(sEventName, aEventHandlers.join(";"));
		},

		/**
		 * @inheritDoc
		 */
		detachEvent: function(oNode, sEventName, sFunctionPath) {
			if (typeof ObjectPath.get(sFunctionPath) !== "function") {
				throw new Error("Can't attach event because the event handler function is not found or not a function.");
			}

			var sValue = this.getProperty(oNode, sEventName) || "";
			var aEventHandlers = EventHandlerResolver.parse(sValue);

			var iEventHandlerIndex =  aEventHandlers.findIndex(function (sEventHandler) {
				return sEventHandler.includes(sFunctionPath);
			});

			if (iEventHandlerIndex > -1) {
				aEventHandlers.splice(iEventHandlerIndex, 1);
			}

			if (aEventHandlers.length) {
				oNode.setAttribute(sEventName, aEventHandlers.join(";"));
			} else {
				oNode.removeAttribute(sEventName);
			}
		},

		/**
		 * @inheritDoc
		 */
		bindAggregation: function (oNode, sAggregationName, vBindingInfos, oView) {
			this.bindProperty(oNode, sAggregationName, vBindingInfos.path);
			this.insertAggregation(oNode, sAggregationName, vBindingInfos.template, 0, oView);
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function (oNode, sAggregationName) {
			if (oNode.hasAttribute(sAggregationName)) {
				oNode.removeAttribute(sAggregationName);
				this.removeAllAggregation(oNode, sAggregationName);
			}
		}
	};

	return merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		XmlTreeModifier
	);
},
/* bExport= */true);
