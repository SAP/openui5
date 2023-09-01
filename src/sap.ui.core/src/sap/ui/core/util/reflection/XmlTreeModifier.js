// valid-jsdoc disabled because this check is validating just the params and return statement and those are all inherited from BaseTreeModifier.
/* eslint-disable valid-jsdoc */
/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseTreeModifier",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/DataType",
	"sap/base/util/merge",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/mvc/EventHandlerResolver",
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/ui/core/Fragment"
], function(
	BaseTreeModifier,
	ManagedObject,
	DataType,
	merge,
	XMLHelper,
	EventHandlerResolver,
	ObjectPath,
	isPlainObject,
	Fragment
) {

	"use strict";

	var CUSTOM_DATA_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";

	async function insertAggregation(oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex, oFoundAggregationNode) {
		let oAggregationNode;
		if (!oFoundAggregationNode) {
			// named aggregation must have the same namespace as the parent
			const sNamespaceURI = oParent.namespaceURI;
			// no ids for aggregation nodes => no need to pass id or component
			oAggregationNode = await this.createControl(sNamespaceURI + "." + sName, undefined, oView);
			oParent.appendChild(oAggregationNode);
		} else {
			oAggregationNode = oFoundAggregationNode;
		}
		if (!bSkipAdjustIndex) {
			const aChildren = oAggregationNode.children;
			let iOffset = 0;
			const iStopIndex = (iIndex < aChildren.length) ? iIndex : aChildren.length;
			for (let i = 0; i < iStopIndex; i++) {
				if (aChildren[i].namespaceURI === "sap.ui.core" && aChildren[i].tagName.includes("ExtensionPoint")) {
					iOffset = iOffset + 1 - aChildren[i].children.length;
				}
			}
			iIndex = iIndex + iOffset;
		}

		if (iIndex >= oAggregationNode.childElementCount) {
			oAggregationNode.appendChild(oObject);
		} else {
			const aReferenceNodes = await this._getControlsInAggregation(oParent, oAggregationNode);
			oAggregationNode.insertBefore(oObject, aReferenceNodes[iIndex]);
		}
		return undefined;
	}

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
	var XmlTreeModifier = merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		/** @lends sap.ui.core.util.reflection.XmlTreeModifier */{

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
			return XmlTreeModifier.getProperty(oControl, "visible");
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
			XmlTreeModifier.setVisible(oControl, !bStashed);
		},

		/**
		 * @inheritDoc
		 */
		getStashed: function (oControl) {
			return Promise.all([
				XmlTreeModifier.getProperty(oControl, "stashed"),
				XmlTreeModifier.getProperty(oControl, "visible")
			]).then(function (aProperties) {
				return !!aProperties[0] || !aProperties[1];
			});
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

		_setProperty: function (oControl, sPropertyName, vPropertyValue, bEscapeBindingStrings) {
			var sValue = XmlTreeModifier._getSerializedValue(vPropertyValue);
			if (bEscapeBindingStrings) {
				sValue = XmlTreeModifier._escapeCurlyBracketsInString(sValue);
			}
			oControl.setAttribute(sPropertyName, sValue);
		},

		/**
		 * @inheritDoc
		 */
		setProperty: function (oControl, sPropertyName, vPropertyValue) {
			// binding strings in properties needs always to be escaped, triggered by the last parameter.
			// It is required to be complient with setProperty functionality in JS case. There could be
			// properties provided as settings with existing bindings. Use the applySettings function in this case.
			XmlTreeModifier._setProperty(oControl, sPropertyName, vPropertyValue, true);
		},

		/**
		 * @inheritDoc
		 */
		getProperty: function (oControl, sPropertyName) {
			var oPropertyInfo;
			var oType;
			var vPropertyValue = oControl.getAttribute(sPropertyName);
			return XmlTreeModifier.getControlMetadata(oControl)
				.then(function (oMetadata) {
					oPropertyInfo = oMetadata.getProperty(sPropertyName);
					if (oPropertyInfo) { //not a property like aggregation
						oType = oPropertyInfo.getType();
						if (
							sPropertyName === "value"
							&& XmlTreeModifier.getControlType(oControl) === "sap.ui.core.CustomData"
						) {
							return XmlTreeModifier.getProperty(oControl, "key")
								.then(function (oKeyProperty) {
									if (oKeyProperty  === "sap-ui-custom-settings") {
										oType = DataType.getType("object");
									}
								});
						}
					}
					return undefined;
				})
				.then(function () {
					if (oPropertyInfo) {
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
				});
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
			return undefined;
		},

		/**
		 * @inheritDoc
		 */
		createAndAddCustomData: function(oControl, sCustomDataKey, sValue) {
			oControl.setAttributeNS(CUSTOM_DATA_NS, "custom.data.via.modifier:" + sCustomDataKey, XmlTreeModifier._escapeCurlyBracketsInString(sValue));
			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		getCustomDataInfo: function(oControl, sCustomDataKey) {
			var oCustomData = oControl.attributes["custom.data.via.modifier:" + sCustomDataKey];
			if (oCustomData) {
				return {
					customData: oCustomData,
					customDataValue: oCustomData.value
				};
			} else {
				return {};
			}
		},

		/**
		 * @inheritDoc
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {
			var sId, sLocalName, oError;
			if (!XmlTreeModifier.bySelector(oSelector, oAppComponent, oView)) {
				var aClassNameParts = sClassName.split('.');
				var sNamespaceURI = "";
				if (aClassNameParts.length > 1) {
					sLocalName = aClassNameParts.pop();
					sNamespaceURI = aClassNameParts.join('.');
				}

				var oNewElementNode = oView.ownerDocument.createElementNS(sNamespaceURI, sLocalName);

				sId = XmlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
				if (sId) {
					oNewElementNode.setAttribute("id", sId);
				}
				return Promise.resolve()
					.then(function () {
						if (mSettings) {
							return XmlTreeModifier.applySettings(oNewElementNode, mSettings);
						}
						return undefined;
					})
					.then(function () {
						return Promise.resolve(oNewElementNode);
					});
			} else {
				oError = new Error("Can't create a control with duplicated ID " + sId);
				return Promise.reject(oError);
			}
		},

		/**
		 * @inheritDoc
		 */
		applySettings: function(oControl, mSettings) {
			return XmlTreeModifier.getControlMetadata(oControl)
				.then(function (oMetadata) {
					var mMetadata = oMetadata.getJSONKeys();
					Object.keys(mSettings).forEach(function(sKey) {
						var oKeyInfo = mMetadata[sKey];
						var vValue = mSettings[sKey];
						switch (oKeyInfo._iKind) {
							case 0: // PROPERTY
								// Settings provided as property could have some bindings that needs to be resolved by the core
								// and therefore they shouldn't be escaped by setProperty function. In opposite to the common
								// setProperty functionality!
								XmlTreeModifier._setProperty(oControl, sKey, vValue, false);
								break;
							// case 1: // SINGLE_AGGREGATION
							// 	XmlTreeModifier.insertAggregation(oControl, sKey, vValue);
							case 3: // SINGLE_ASSOCIATION
								XmlTreeModifier.setAssociation(oControl, sKey, vValue);
								break;
							default:
								throw new Error("Unsupported in applySettings on XMLTreeModifier: " + sKey);
						}
					});
				});
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
				}
				return oView.querySelector("[id='" + sId + "']");
			}
			return undefined;
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
			if (oParent && !XmlTreeModifier.getId(oParent) && !XmlTreeModifier._isExtensionPoint(oParent)) {
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
			return XmlTreeModifier._getControlTypeInXml(oControl);
		},

		/**
		 * @inheritDoc
		 */
		setAssociation: function (vParent, sName, sId) {
			if (typeof sId !== "string"){
				sId = XmlTreeModifier.getId(sId);
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
			return XmlTreeModifier.getControlMetadata(oControl)
				.then(function (oControlMetadata) {
					return oControlMetadata.getAllAggregations();
				});
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: function (oParent, sName) {
			var aChildren = [];
			var bSingleValueAggregation;
			return XmlTreeModifier._isSingleValueAggregation(oParent, sName)
				.then(function (bSingleValueAggregationReturn) {
					bSingleValueAggregation = bSingleValueAggregationReturn;
					return XmlTreeModifier._findAggregationNode(oParent, sName);
				})
				.then(function (oAggregationNode) {
					if (oAggregationNode) {
						return XmlTreeModifier._getControlsInAggregation(oParent, oAggregationNode)
							.then(function (aChildrenLocal) {
								aChildren = aChildrenLocal;
							});
					}
					return XmlTreeModifier._isAltTypeAggregation(oParent, sName)
						.then(function (isAltTypeAggregation) {
							if (isAltTypeAggregation && bSingleValueAggregation) {
								return XmlTreeModifier.getProperty(oParent, sName)
									.then(function (oChild) {
										aChildren.push(oChild);
									});
							}
							return undefined;
						});
				})
				.then(function () {
					if (sName === "customData") {
						//check namespaced attributes:
						var mCustomSettings;
						var aNewCustomData = Array.prototype.slice.call(oParent.attributes).reduce(function(aNamespacedCustomData, oAttribute) {
							var sLocalName = XmlTreeModifier._getLocalName(oAttribute);
							if (oAttribute.namespaceURI === CUSTOM_DATA_NS) {
								var oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core","CustomData");
								oNewCustomData.setAttribute("key", sLocalName);
								oNewCustomData.setAttribute("value", oAttribute.value);
								aNamespacedCustomData.push(oNewCustomData);
							} else if (oAttribute.namespaceURI && oAttribute.name.indexOf("xmlns:") !== 0 ) { // other, unknown namespace and not an xml namespace alias definition
								if (!mCustomSettings) {
									mCustomSettings = {};
								}
								if (!mCustomSettings.hasOwnProperty(oAttribute.namespaceURI)) {
									mCustomSettings[oAttribute.namespaceURI] = {};
								}
								mCustomSettings[oAttribute.namespaceURI][sLocalName] = oAttribute.nodeValue;
							}
							return aNamespacedCustomData;
						}, []);
						aChildren = aChildren.concat(aNewCustomData);
						//add custom settings as custom data "sap-ui-custom-settings"
						if (mCustomSettings) {
							var oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core","CustomData");
							oNewCustomData.setAttribute("key", "sap-ui-custom-settings");
							XmlTreeModifier.setProperty(oNewCustomData, "value", mCustomSettings);
							aChildren.push(oNewCustomData);
						}
					}
					return bSingleValueAggregation ? aChildren[0] : aChildren;
				});
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: async function (oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex) {
			const oFoundAggregationNode = await XmlTreeModifier._findAggregationNode(oParent, sName);
			return insertAggregation.call(this, oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex, oFoundAggregationNode);
		},

		/**
		 * @inheritDoc
		 */
		removeAggregation: async function (oParent, sName, oObject) {
			const oAggregationNode = await XmlTreeModifier._findAggregationNode(oParent, sName);
			oAggregationNode.removeChild(oObject);
		},

		/**
		 * @inheritDoc
		 */
		moveAggregation: async function(oSourceParent, sSourceAggregationName, oTargetParent, sTargetAggregationName, oObject, iIndex, oView, bSkipAdjustIndex) {
			const oSourceAggregationNode = await XmlTreeModifier._findAggregationNode(oSourceParent, sSourceAggregationName);
			const oTargetAggregationNode = await XmlTreeModifier._findAggregationNode(oTargetParent, sTargetAggregationName);

			oSourceAggregationNode.removeChild(oObject);
			await insertAggregation.call(this, oTargetParent, sTargetAggregationName, oObject, iIndex, oView, bSkipAdjustIndex, oTargetAggregationNode);
		},

		/**
		 * @inheritDoc
		 */
		removeAllAggregation: function (oControl, sName) {
			return XmlTreeModifier._findAggregationNode(oControl, sName)
				.then(function (oAggregationNode) {
					if (oControl === oAggregationNode) {
						return XmlTreeModifier._getControlsInAggregation(oControl, oControl)
							.then(function (aChildControls) {
								aChildControls.forEach(function(oChildControl) {
									oControl.removeChild(oChildControl);
								});
							});
					}
					return oControl.removeChild(oAggregationNode);
				});
		},

		/**
		 * @private
		 */
		_findAggregationNode: function (oParent, sName) {
			var oAggregationNode;
			var aChildren = XmlTreeModifier._children(oParent);
			for (var i = 0; i < aChildren.length; i++) {
				var oNode = aChildren[i];
				if (oNode.localName === sName) {
					oAggregationNode = oNode;
					break;
				}
			}
			var oPromise = Promise.resolve(oAggregationNode);
			if (!oAggregationNode) {
				oPromise = oPromise
					.then(XmlTreeModifier._isDefaultAggregation.bind(XmlTreeModifier, oParent, sName))
					.then(function (bIsDefaultAggregation) {
						if (bIsDefaultAggregation) {
							return oParent;
						}
						return oAggregationNode;
					});
			}
			return oPromise;
		},

		/**
		 * @private
		 */
		_isDefaultAggregation: function(oParent, sAggregationName) {
			return XmlTreeModifier.getControlMetadata(oParent)
				.then(function (oControlMetadata) {
					var oDefaultAggregation = oControlMetadata.getDefaultAggregation();
					return oDefaultAggregation && sAggregationName === oDefaultAggregation.name;
				});
		},

		/**
		 * @private
		 */
		_isNotNamedAggregationNode: function(oParent, oChildNode) {
			return XmlTreeModifier.getAllAggregations(oParent)
				.then(function (mAllAggregatiosnMetadata) {
					var oAggregation = mAllAggregatiosnMetadata[oChildNode.localName];
					return oParent.namespaceURI !== oChildNode.namespaceURI || !oAggregation; //same check as in XMLTemplateProcessor (handleChild)
				});
		},

		/**
		 * @private
		 */
		_isSingleValueAggregation: function(oParent, sAggregationName) {
			return XmlTreeModifier.getAllAggregations(oParent)
				.then(function (mAllAggregatiosnMetadata) {
					var oAggregationMetadata = mAllAggregatiosnMetadata[sAggregationName];
					return !oAggregationMetadata.multiple;
				});
		},

		/**
		 * @private
		 */
		_isAltTypeAggregation: function(oParent, sAggregationName) {
			return XmlTreeModifier.getControlMetadata(oParent)
				.then(function (oControlMetadata) {
					return oControlMetadata.getAllAggregations()[sAggregationName];
				})
				.then(function (oAggregationMetadata) {
					return !!oAggregationMetadata.altTypes;
				});
		},

		/**
		 * @private
		 */
		_isExtensionPoint: function (oControl) {
			return XmlTreeModifier._getControlTypeInXml(oControl) === "sap.ui.core.ExtensionPoint";
		},

		/**
		 * @inheritDoc
		 */
		getControlMetadata: function(oControl) {
			return XmlTreeModifier._getControlMetadataInXml(oControl);
		},

		/**
		 * @private
		 */
		_getControlsInAggregation: function(oParent, oAggregationNode) {
			//convert NodeList to Array
			var aChildren = Array.prototype.slice.call(XmlTreeModifier._children(oAggregationNode));
			return Promise.all(aChildren.map(function (oChild) {
				return XmlTreeModifier._isNotNamedAggregationNode(oParent, oChild)
					.then(function (bIsNotNamedAggregationNode) {
						return bIsNotNamedAggregationNode ? oChild : undefined;
					});
			}))
			.then(function (aChildren) {
				return aChildren.filter(function (oChild) { return !!oChild; });
			});
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
			return XmlTreeModifier._findAggregationNode(oControl, sAggregationName)
				.then(function (oAggregationNode) {
					if (oAggregationNode) {
						var aChildren = XmlTreeModifier._children(oAggregationNode);
						if (aChildren.length === 1){
							return aChildren[0];
						}
					}
					return undefined;
				});
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
			// find the parent
			var oParent = XmlTreeModifier.getParent(oControl);

			if (!oParent) {
				return Promise.resolve(-1);
			}

			// we need the aggregation name in order to find all control nodes in the parent
			// which are relevant to this aggregation and skip all other possible nodes
			return XmlTreeModifier.getParentAggregationName(oControl, oParent)
				.then(function (sAggregationName) {
					// get the relevant controls from the aggregation node
					return XmlTreeModifier.getAggregation(oParent, sAggregationName);
				})
				.then(function (aControlsInAggregation) {
					// if the result from the above is array:
					if (Array.isArray(aControlsInAggregation)) {
						// to harmonize behavior with JSControlTree, where stashed controls are not added to the parent aggregation
						var aPromises = aControlsInAggregation.map(function (oControl) {
							return Promise.resolve()
								.then(function () {
									if (XmlTreeModifier._isExtensionPoint(oControl)) {
										return oControl;
									}
									return XmlTreeModifier.getProperty(oControl, "stashed")
										.then(function (oProperty) {
											return !oProperty ? oControl : undefined;
										});
								});
						});
						return Promise.all(aPromises)
							.then(function (aControlsInAggregation) {
								// find and return the correct index
								return aControlsInAggregation.filter(function (oControl) {
									return !!oControl;
								}).indexOf(oControl);
							});
					} else {
						// if aControlsInAggregation is not an array, then the aggregation is
						// of type 0..1 and aControlsInAggregation is the oControl provided
						// to the function initially, so its index is 0
						return 0;
					}
				});
		},

		/**
		 * @inheritDoc
		 */
		getParentAggregationName: function (oControl, oParent) {
			return Promise.resolve()
				.then(function () {
					// check if the control is in named aggregatio node
					if (!oParent.isSameNode(oControl.parentNode)) {
						// the control is in named aggregation
						return false;
					} else {
						// again check just in case
						return XmlTreeModifier._isNotNamedAggregationNode(oParent, oControl);
					}
				})
				.then(function (bNotNamedAggregation) {
							// check if the the control is in default aggregation
					// and get the name of the aggregation
					if (bNotNamedAggregation) {
						// the control is in the default aggregation of the parent
						return XmlTreeModifier.getControlMetadata(oParent)
							.then(function (oMetadata) {
								return oMetadata.getDefaultAggregationName();
							});
					} else {
						// the agregation name is provided and we can simply take it from the xml node
						return XmlTreeModifier._getLocalName(oControl.parentNode);
					}
				});
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: function(oControl, sAggregationName) {
			return XmlTreeModifier.getControlMetadata(oControl)
				.then(function (oMetadata) {
					return oMetadata.getAllAggregations();
				})
				.then(function (oAggregations) {
					if (oAggregations) {
						return oAggregations[sAggregationName];
					}
					return undefined;
				});
		},

		/**
		 * @inheritDoc
		 */
		validateType: function(oControl, mAggregationMetadata, oParent, sFragment, iIndex) {
			var sTypeOrInterface = mAggregationMetadata.type;

			return XmlTreeModifier.getAggregation(oParent, mAggregationMetadata.name)
				.then(function (oAggregation) {
					// if aggregation is not multiple and already has element inside, then it is not valid for element
					if (mAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
						return false;
					}
					return Fragment.load({
						definition: sFragment
					});
				}).then(function(aControls) {
					if (!Array.isArray(aControls)) {
						aControls = [aControls];
					}
					var bReturn = aControls[iIndex].isA(sTypeOrInterface);
					aControls.forEach(function(oFragmentControl) {
						oFragmentControl.destroy();
					});
					return bReturn;
				});
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {
			var oFragment = XMLHelper.parse(sFragment);
			return XmlTreeModifier._checkAndPrefixIdsInFragment(oFragment, sNamespace)
				.then(function (oFragment) {
					var aControls;

					if (oFragment.localName === "FragmentDefinition") {
						aControls = XmlTreeModifier._getElementNodeChildren(oFragment);
					} else {
						aControls = [oFragment];
					}

					// check if there is already a field with the same ID and throw error if so
					aControls.forEach(function(oNode) {
						if (XmlTreeModifier._byId(oNode.getAttribute("id"), oView)) {
							throw Error("The following ID is already in the view: " + oNode.getAttribute("id"));
						}
					});

					return aControls;
				});
		},

		/**
		 * @inheritDoc
		 */
		templateControlFragment: function(sFragmentName, mPreprocessorSettings) {
			return BaseTreeModifier._templateFragment(
				sFragmentName,
				mPreprocessorSettings
			).then(function(oFragment) {
				return XmlTreeModifier._children(oFragment);
			});
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

		_getFlexCustomData: function(oControl, sType) {
			if (!oControl){
				return undefined;
			}
			return oControl.getAttributeNS("sap.ui.fl", sType);
		},

		/**
		 * @inheritDoc
		 */
		attachEvent: function(oNode, sEventName, sFunctionPath, vData) {
			if (typeof ObjectPath.get(sFunctionPath) !== "function") {
				return Promise.reject(new Error("Can't attach event because the event handler function is not found or not a function."));
			}
			return XmlTreeModifier.getProperty(oNode, sEventName)
				.then(function (sValue) {
					sValue = sValue || "";
					var aEventHandlers = EventHandlerResolver.parse(sValue);
					var sEventHandler = sFunctionPath;
					var aParams = ["$event"];

					if (vData) {
						aParams.push(JSON.stringify(vData));
					}

					sEventHandler += "(" + aParams.join(",") + ")";

					if (!aEventHandlers.includes(sEventHandler)) {
						aEventHandlers.push(sEventHandler);
					}

					oNode.setAttribute(sEventName, aEventHandlers.join(";"));
				});
		},

		/**
		 * @inheritDoc
		 */
		detachEvent: function(oNode, sEventName, sFunctionPath) {
			if (typeof ObjectPath.get(sFunctionPath) !== "function") {
				return Promise.reject(new Error("Can't attach event because the event handler function is not found or not a function."));
			}
			return XmlTreeModifier.getProperty(oNode, sEventName)
				.then(function (sValue) {
					sValue = sValue || "";
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
				});
		},

		/**
		 * @inheritDoc
		 */
		bindAggregation: function (oNode, sAggregationName, vBindingInfos, oView) {
			return Promise.resolve()
				.then(function () {
					XmlTreeModifier.bindProperty(oNode, sAggregationName, vBindingInfos.path);
					return XmlTreeModifier.insertAggregation(oNode, sAggregationName, vBindingInfos.template, 0, oView);
				});
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function (oNode, sAggregationName) {
			return Promise.resolve()
				.then(function () {
					if (oNode.hasAttribute(sAggregationName)) {
						oNode.removeAttribute(sAggregationName);
						return XmlTreeModifier.removeAllAggregation(oNode, sAggregationName);
					}
					return undefined;
				});
		},

		/**
		 * @inheritDoc
		 */
		getExtensionPointInfo: function(sExtensionPointName, oView) {
			return Promise.resolve()
				.then(function () {
					if (oView && sExtensionPointName) {
						var aExtensionPoints = Array.prototype.slice.call(oView.getElementsByTagNameNS("sap.ui.core", "ExtensionPoint"));
						var aFilteredExtensionPoints = aExtensionPoints.filter(function(oExtPoint) {
							return oExtPoint.getAttribute("name") === sExtensionPointName;
						});
						var oExtensionPoint = (aFilteredExtensionPoints.length === 1) ? aFilteredExtensionPoints[0] : undefined;
						if (oExtensionPoint) {
							var oParent = XmlTreeModifier.getParent(oExtensionPoint);

							return Promise.all([
								XmlTreeModifier.getParentAggregationName(oExtensionPoint, oParent),
								XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint)
							]).then(function (aProperties) {
								// increase the index by 1 to get the index behind the extension point for xml-case
								var oExtensionPointInfo = {
									parent: oParent,
									aggregationName: aProperties[0],
									index: aProperties[1] + 1,
									defaultContent: Array.prototype.slice.call(XmlTreeModifier._children(oExtensionPoint))
								};
								return oExtensionPointInfo;
							});
						}
					}
					return undefined;
				});
		}
	});

	return XmlTreeModifier;
},
/* bExport= */true);
