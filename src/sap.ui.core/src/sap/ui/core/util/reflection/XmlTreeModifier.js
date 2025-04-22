// valid-jsdoc disabled because this check is validating just the params and return statement and those are all inherited from BaseTreeModifier.
/* eslint-disable valid-jsdoc */
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/ui/base/BindingInfo",
	"sap/ui/base/DataType",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/core/Fragment",
	"sap/ui/util/XMLHelper"
], function(
	isPlainObject,
	merge,
	BindingInfo,
	DataType,
	BaseTreeModifier,
	Fragment,
	XMLHelper
) {

	"use strict";

	const CUSTOM_DATA_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";

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
	const XmlTreeModifier = merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		/** @lends sap.ui.core.util.reflection.XmlTreeModifier */{

		targets: "xmlTree",

		/**
		 * @inheritDoc
		 */
		setVisible: function(oControl, bVisible) {
			if (bVisible) {
				oControl.removeAttribute("visible");
			} else {
				oControl.setAttribute("visible", bVisible);
			}
		},

		/**
		 * @inheritDoc
		 */
		getVisible: function(oControl) {
			return XmlTreeModifier.getProperty(oControl, "visible");
		},

		/**
		 * @inheritDoc
		 */
		setStashed: function(oControl, bStashed) {
			if (!bStashed) {
				oControl.removeAttribute("stashed");
			} else {
				oControl.setAttribute("stashed", bStashed);
			}
			XmlTreeModifier.setVisible(oControl, !bStashed);
			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		getStashed: function(oControl) {
			return Promise.all([
				XmlTreeModifier.getProperty(oControl, "stashed"),
				XmlTreeModifier.getProperty(oControl, "visible")
			]).then(function(aProperties) {
				return !!aProperties[0] || !aProperties[1];
			});
		},

		/**
		 * @inheritDoc
		 */
		bindProperty: function(oControl, sPropertyName, vBindingInfos) {
			oControl.setAttribute(sPropertyName, "{" + vBindingInfos + "}");
		},

		/**
		 * @inheritDoc
		 */
		unbindProperty: function(oControl, sPropertyName) {
			//reset the property
			oControl.removeAttribute(sPropertyName);
		},

		_setProperty: function(oControl, sPropertyName, vPropertyValue, bEscapeBindingStrings) {
			let sValue = XmlTreeModifier._getSerializedValue(vPropertyValue);
			if (bEscapeBindingStrings) {
				sValue = XmlTreeModifier._escapeCurlyBracketsInString(sValue);
			}
			oControl.setAttribute(sPropertyName, sValue);
		},

		/**
		 * @inheritDoc
		 */
		setProperty: function(oControl, sPropertyName, vPropertyValue) {
			// binding strings in properties needs always to be escaped, triggered by the last parameter.
			// It is required to be compliant with setProperty functionality in JS case. There could be
			// properties provided as settings with existing bindings. Use the applySettings function in this case.
			XmlTreeModifier._setProperty(oControl, sPropertyName, vPropertyValue, true);
		},

		/**
		 * @inheritDoc
		 */
		getProperty: async function(oControl, sPropertyName) {
			let oType;
			let vPropertyValue = oControl.getAttribute(sPropertyName);
			const oMetadata = await XmlTreeModifier.getControlMetadata(oControl);
			const oPropertyInfo = oMetadata.getProperty(sPropertyName);
			if (oPropertyInfo) { //not a property like aggregation
				oType = oPropertyInfo.getType();
				if (
					sPropertyName === "value"
					&& XmlTreeModifier.getControlType(oControl) === "sap.ui.core.CustomData"
				) {
					const oKeyProperty = await XmlTreeModifier.getProperty(oControl, "key");
					if (oKeyProperty  === "sap-ui-custom-settings") {
						oType = DataType.getType("object");
					}
				}

				if (vPropertyValue === null) {
					vPropertyValue = oPropertyInfo.getDefaultValue() || oType.getDefaultValue();
				} else {
					// unescape binding like XMLTemplateProcessor
					const vUnescaped = BindingInfo.parse(vPropertyValue, undefined, true);
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
		isPropertyInitial: function(oControl, sPropertyName) {
			const vPropertyValue = oControl.getAttribute(sPropertyName);
			return (vPropertyValue == null);
		},

		/**
		 * @inheritDoc
		 */
		setPropertyBinding: function(oControl, sPropertyName, sPropertyBinding) {
			if (typeof sPropertyBinding !== "string") {
				throw new Error("For XML, only strings are supported to be set as property binding.");
			}
			oControl.setAttribute(sPropertyName, sPropertyBinding);
		},

		/**
		 * @inheritDoc
		 */
		getPropertyBinding: function(oControl, sPropertyName) {
			const vPropertyValue = oControl.getAttribute(sPropertyName);
			if (vPropertyValue) {
				const vUnescaped = BindingInfo.parse(vPropertyValue, undefined, true);
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
			const oCustomData = oControl.attributes["custom.data.via.modifier:" + sCustomDataKey];
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
		createControl: async function(sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {
			const sId = XmlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
			if (!XmlTreeModifier.bySelector(oSelector, oAppComponent, oView)) {
				let sLocalName;
				const aClassNameParts = sClassName.split('.');
				let sNamespaceURI = "";
				if (aClassNameParts.length > 1) {
					sLocalName = aClassNameParts.pop();
					sNamespaceURI = aClassNameParts.join('.');
				}

				const oNewElementNode = oView.ownerDocument.createElementNS(sNamespaceURI, sLocalName);

				if (sId) {
					oNewElementNode.setAttribute("id", sId);
				}
				if (mSettings) {
					await XmlTreeModifier.applySettings(oNewElementNode, mSettings);
				}
				return oNewElementNode;
			} else {
				throw new Error("Can't create a control with duplicated ID " + sId);
			}
		},

		/**
		 * @inheritDoc
		 */
		applySettings: async function(oControl, mSettings) {
			const oMetadata = await XmlTreeModifier.getControlMetadata(oControl);
			const mMetadata = oMetadata.getJSONKeys();
			Object.keys(mSettings).forEach(function(sKey) {
				const oKeyInfo = mMetadata[sKey];
				const vValue = mSettings[sKey];
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
		},

		/**
		 * @inheritDoc
		 */
		_byId: function(sId, oView) {
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
		getId: function(oControl) {
			return oControl.getAttribute("id");
		},

		/**
		 * @inheritDoc
		 */
		getParent: function(oControl) {
			const oParent = oControl.parentNode;
			if (oParent && !XmlTreeModifier.getId(oParent) && !XmlTreeModifier._isExtensionPoint(oParent)) {
				//go to the real control, jump over aggregation node
				return oParent.parentNode;
			}

			return oParent;
		},

		/**
		 * @inheritDoc
		 */
		_getLocalName: function(xmlElement) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return xmlElement.localName || xmlElement.baseName || xmlElement.nodeName;
		},

		/**
		 * @inheritDoc
		 */
		getControlType: function(oControl) {
			return XmlTreeModifier._getControlTypeInXml(oControl);
		},

		/**
		 * @inheritDoc
		 */
		setAssociation: function(vParent, sName, sId) {
			if (typeof sId !== "string"){
				sId = XmlTreeModifier.getId(sId);
			}
			vParent.setAttribute(sName, sId);
		},

		/**
		 * @inheritDoc
		 */
		getAssociation: function(vParent, sName) {
			return vParent.getAttribute(sName);
		},

		/**
		 * @inheritDoc
		 */
		getAllAggregations: async function(oControl) {
			const oControlMetadata = await XmlTreeModifier.getControlMetadata(oControl);
			return oControlMetadata.getAllAggregations();
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: async function(oParent, sName) {
			let aChildren = [];
			const bSingleValueAggregation = await XmlTreeModifier._isSingleValueAggregation(oParent, sName);
			const oAggregationNode = await XmlTreeModifier._findAggregationNode(oParent, sName);
			if (oAggregationNode) {
				const aChildrenLocal = await XmlTreeModifier._getControlsInAggregation(oParent, oAggregationNode);
				aChildren = aChildrenLocal;
			} else {
				const bIsAltTypeAggregation = await XmlTreeModifier._isAltTypeAggregation(oParent, sName);
				if (bIsAltTypeAggregation && bSingleValueAggregation) {
					const oChild = await XmlTreeModifier.getProperty(oParent, sName);
					aChildren.push(oChild);
				}
			}


			if (sName === "customData") {
				//check namespaced attributes:
				let mCustomSettings;
				const aNewCustomData = Array.prototype.slice.call(oParent.attributes).reduce(function(aNamespacedCustomData, oAttribute) {
					const sLocalName = XmlTreeModifier._getLocalName(oAttribute);
					if (oAttribute.namespaceURI === CUSTOM_DATA_NS) {
						const oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core","CustomData");
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
					const oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core","CustomData");
					oNewCustomData.setAttribute("key", "sap-ui-custom-settings");
					XmlTreeModifier.setProperty(oNewCustomData, "value", mCustomSettings);
					aChildren.push(oNewCustomData);
				}
			}
			return bSingleValueAggregation ? aChildren[0] : aChildren;
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: async function(oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex) {
			const oFoundAggregationNode = await XmlTreeModifier._findAggregationNode(oParent, sName);
			return insertAggregation(oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex, oFoundAggregationNode);
		},

		/**
		 * @inheritDoc
		 */
		removeAggregation: async function(oParent, sName, oObject) {
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
			await insertAggregation(oTargetParent, sTargetAggregationName, oObject, iIndex, oView, bSkipAdjustIndex, oTargetAggregationNode);
		},

		/**
		 * @inheritDoc
		 */
		replaceAllAggregation: async function(oControl, sAggregationName, aNewControls) {
			const oAggregationNode = await XmlTreeModifier._findAggregationNode(oControl, sAggregationName);
			const aChildControls = await XmlTreeModifier._getControlsInAggregation(oControl, oAggregationNode);
			aChildControls.forEach(function(oChildControl) {
				oAggregationNode.removeChild(oChildControl);
			});
			aNewControls.forEach((oObject) => {
				oAggregationNode.appendChild(oObject);
			});
		},

		/**
		 * @inheritDoc
		 */
		removeAllAggregation: async function(oControl, sName) {
			const oAggregationNode = await XmlTreeModifier._findAggregationNode(oControl, sName);
			if (oControl === oAggregationNode) {
				const aChildControls = await XmlTreeModifier._getControlsInAggregation(oControl, oControl);
				aChildControls.forEach(function(oChildControl) {
					oControl.removeChild(oChildControl);
				});
			} else {
				return oControl.removeChild(oAggregationNode);
			}
		},

		/**
		 * @private
		 */
		_findAggregationNode: async function(oParent, sName) {
			let oAggregationNode;
			const aChildren = XmlTreeModifier._children(oParent);
			for (let i = 0; i < aChildren.length; i++) {
				const oNode = aChildren[i];
				if (oNode.localName === sName) {
					oAggregationNode = oNode;
					break;
				}
			}
			if (!oAggregationNode) {
				const bIsDefaultAggregation = await XmlTreeModifier._isDefaultAggregation(oParent, sName);
				if (bIsDefaultAggregation) {
					return oParent;
				}
			}
			return oAggregationNode;
		},

		/**
		 * @private
		 */
		_isDefaultAggregation: async function(oParent, sAggregationName) {
			const oControlMetadata = await XmlTreeModifier.getControlMetadata(oParent);
			const oDefaultAggregation = oControlMetadata.getDefaultAggregation();
			return oDefaultAggregation && sAggregationName === oDefaultAggregation.name;
		},

		/**
		 * @private
		 */
		_isNotNamedAggregationNode: async function(oParent, oChildNode) {
			const mAllAggregationsMetadata = await XmlTreeModifier.getAllAggregations(oParent);
			const oAggregation = mAllAggregationsMetadata[oChildNode.localName];
			return oParent.namespaceURI !== oChildNode.namespaceURI || !oAggregation; //same check as in XMLTemplateProcessor (handleChild)
		},

		/**
		 * @private
		 */
		_isSingleValueAggregation: async function(oParent, sAggregationName) {
			const mAllAggregationsMetadata = await XmlTreeModifier.getAllAggregations(oParent);
			const oAggregationMetadata = mAllAggregationsMetadata[sAggregationName];
			return !oAggregationMetadata.multiple;
		},

		/**
		 * @private
		 */
		_isAltTypeAggregation: async function(oParent, sAggregationName) {
			const oControlMetadata = await XmlTreeModifier.getControlMetadata(oParent);
			const oAggregationMetadata = oControlMetadata.getAllAggregations()[sAggregationName];
			return !!oAggregationMetadata.altTypes;
		},

		/**
		 * @private
		 */
		_isExtensionPoint: function(oControl) {
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
		_getControlsInAggregation: async function(oParent, oAggregationNode) {
			// //convert NodeList to Array
			const aXmlChildren = [].slice.call(XmlTreeModifier._children(oAggregationNode));
			const aChildren = await Promise.all(aXmlChildren.map(async (oChild) => {
				const bIsNotNamedAggregationNode = await XmlTreeModifier._isNotNamedAggregationNode(oParent, oChild);
				return bIsNotNamedAggregationNode ? oChild : undefined;
			}));
			return aChildren.filter((oChild) => !!oChild);
		},

		/**
		 * @private
		 */
		_children: function(oParent) {
			if (oParent.children) {
				return oParent.children;
			} else {
				const aChildren = [];
				for (let i = 0; i < oParent.childNodes.length; i++) {
					const oNode = oParent.childNodes[i];
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
		getBindingTemplate: async function(oControl, sAggregationName) {
			const oAggregationNode = await XmlTreeModifier._findAggregationNode(oControl, sAggregationName);
			if (oAggregationNode) {
				const aChildren = XmlTreeModifier._children(oAggregationNode);
				if (aChildren.length === 1){
					return aChildren[0];
				}
			}
			return undefined;
		},

		/**
		 * @inheritDoc
		 */
		updateAggregation: function(oControl, sAggregationName) {
			/*only needed in JS case to indicate binding (template) has changed, in XML case binding has not been created yet (see managed object)*/
		},

		/**
		 * @inheritDoc
		 */
		findIndexInParentAggregation: async function(oControl) {
			// find the parent
			const oParent = XmlTreeModifier.getParent(oControl);

			if (!oParent) {
				return -1;
			}

			// we need the aggregation name in order to find all control nodes in the parent
			// which are relevant to this aggregation and skip all other possible nodes
			const sAggregationName = await XmlTreeModifier.getParentAggregationName(oControl, oParent);
			// get the relevant controls from the aggregation node
			let aControlsInAggregation = await XmlTreeModifier.getAggregation(oParent, sAggregationName);
			// if the result from the above is array:
			if (Array.isArray(aControlsInAggregation)) {
				// to harmonize behavior with JSControlTree, where stashed controls are not added to the parent aggregation
				const aPromises = aControlsInAggregation.map(async (oControl) => {
					if (XmlTreeModifier._isExtensionPoint(oControl)) {
						return oControl;
					}
					const oProperty = await XmlTreeModifier.getProperty(oControl, "stashed");
					return !oProperty ? oControl : undefined;
				});
				aControlsInAggregation = await Promise.all(aPromises);
				// find and return the correct index
				return aControlsInAggregation.filter((oControl) => {
					return !!oControl;
				}).indexOf(oControl);
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
		getParentAggregationName: async function(oControl, oParent) {
			// check if the control is in named aggregation node
			// again check just in case
			const bSameAsParentNode = oParent.isSameNode(oControl.parentNode);
			const bNotNamedAggregation = await XmlTreeModifier._isNotNamedAggregationNode(oParent, oControl);
			// check if the the control is in default aggregation
			// and get the name of the aggregation
			if (bNotNamedAggregation && bSameAsParentNode) {
				// the control is in the default aggregation of the parent
				const oMetadata = await XmlTreeModifier.getControlMetadata(oParent);
				return oMetadata.getDefaultAggregationName();
			} else {
				// the aggregation name is provided and we can simply take it from the xml node
				return XmlTreeModifier._getLocalName(oControl.parentNode);
			}
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: async function(oControl, sAggregationName) {
			const oMetadata = await XmlTreeModifier.getControlMetadata(oControl);
			const oAggregations = await oMetadata.getAllAggregations();
			if (oAggregations) {
				return oAggregations[sAggregationName];
			}
			return undefined;
		},

		/**
		 * @inheritDoc
		 */
		validateType: async function(oControl, mAggregationMetadata, oParent, sFragment, iIndex) {
			const sTypeOrInterface = mAggregationMetadata.type;

			const oAggregation = await XmlTreeModifier.getAggregation(oParent, mAggregationMetadata.name);
			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (mAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
				return false;
			}
			const vControls =  await Fragment.load({
				definition: sFragment
			});
			const aControls = !Array.isArray(vControls) ? [vControls] : vControls;
			const bReturn = aControls[iIndex].isA(sTypeOrInterface);
			aControls.forEach(function(oFragmentControl) {
				oFragmentControl.destroy();
			});
			return bReturn;
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: async function(sFragment, sNamespace, oView) {
			const oInitialFragment = XMLHelper.parse(sFragment);
			const oFragment = await XmlTreeModifier._checkAndPrefixIdsInFragment(oInitialFragment, sNamespace);
			let aControls;

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
		},

		/**
		 * @inheritDoc
		 */
		templateControlFragment: async function(sFragmentName, mPreprocessorSettings) {
			const oFragment = await BaseTreeModifier._templateFragment(
				sFragmentName,
				mPreprocessorSettings
			);
			return XmlTreeModifier._children(oFragment);
		},

		/**
		 * @inheritDoc
		 */
		destroy: function(oControl) {
			const oParent = oControl.parentNode;
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
		bindAggregation: function(oNode, sAggregationName, vBindingInfos, oView) {
			XmlTreeModifier.bindProperty(oNode, sAggregationName, vBindingInfos.path);
			return XmlTreeModifier.insertAggregation(oNode, sAggregationName, vBindingInfos.template, 0, oView);
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function(oNode, sAggregationName) {
			if (oNode.hasAttribute(sAggregationName)) {
				oNode.removeAttribute(sAggregationName);
				return XmlTreeModifier.removeAllAggregation(oNode, sAggregationName);
			}
			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		getExtensionPointInfo: async function(sExtensionPointName, oView) {
			if (oView && sExtensionPointName) {
				const aExtensionPoints = Array.prototype.slice.call(oView.getElementsByTagNameNS("sap.ui.core", "ExtensionPoint"));
				const aFilteredExtensionPoints = aExtensionPoints.filter(function(oExtPoint) {
					return oExtPoint.getAttribute("name") === sExtensionPointName;
				});
				const oExtensionPoint = (aFilteredExtensionPoints.length === 1) ? aFilteredExtensionPoints[0] : undefined;
				if (oExtensionPoint) {
					const oParent = XmlTreeModifier.getParent(oExtensionPoint);

					const aProperties = await Promise.all([
						XmlTreeModifier.getParentAggregationName(oExtensionPoint, oParent),
						XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint)
					]);
					// increase the index by 1 to get the index behind the extension point for xml-case
					const oExtensionPointInfo = {
						parent: oParent,
						aggregationName: aProperties[0],
						index: aProperties[1] + 1,
						defaultContent: Array.prototype.slice.call(XmlTreeModifier._children(oExtensionPoint))
					};
					return oExtensionPointInfo;
				}
			}
			return undefined;
		}
	});

	async function insertAggregation(oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex, oFoundAggregationNode) {
		let oAggregationNode;
		if (!oFoundAggregationNode) {
			// named aggregation must have the same namespace as the parent
			const sNamespaceURI = oParent.namespaceURI;
			// no ids for aggregation nodes => no need to pass id or component
			oAggregationNode = await XmlTreeModifier.createControl(sNamespaceURI + "." + sName, undefined, oView);
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
			const aReferenceNodes = await XmlTreeModifier._getControlsInAggregation(oParent, oAggregationNode);
			oAggregationNode.insertBefore(oObject, aReferenceNodes[iIndex]);
		}
		return undefined;
	}


	return XmlTreeModifier;
},
/* bExport= */true);
