/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.ElementUtil.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/Element',
	'sap/ui/dt/Util'
],
function(
	jQuery,
	ManagedObject,
	Element,
	Util
) {
	"use strict";

	/**
	 * Class for ElementUtil.
	 *
	 * @class Utility functionality to work with elements, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.ElementUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API
	 *               might be changed in future.
	 */

	var ElementUtil = {};

	/**
	 *
	 */
	ElementUtil.iterateOverAllPublicAggregations = function(oElement, fnCallback) {
		var mAggregations = oElement.getMetadata().getAllAggregations();
		var aAggregationNames = Object.keys(mAggregations);

		aAggregationNames.forEach(function(sAggregationName) {
			var oAggregation = mAggregations[sAggregationName];
			var vAggregationValue = this.getAggregation(oElement, sAggregationName);

			fnCallback(oAggregation, vAggregationValue);
		}, this);
	};

	/**
	 *
	 */
	ElementUtil.getElementInstance = function(vElement) {
		if (typeof vElement === "string") {
			var oElement = sap.ui.getCore().byId(vElement);
			return oElement || sap.ui.getCore().getComponent(vElement);
		} else {
			return vElement;
		}
	};

	/**
	 *
	 */
	ElementUtil.hasAncestor = function(oElement, oAncestor) {
		oAncestor = this.fixComponentContainerElement(oAncestor);

		var oParent = this.fixComponentParent(oElement);
		while (oParent && oParent !== oAncestor) {
			oParent = oParent.getParent();
			oParent = this.fixComponentParent(oParent);
		}

		return !!oParent;
	};

	/**
	 *
	 */
	ElementUtil.getClosestElementForNode = function(oNode) {
		var $ClosestElement = jQuery(oNode).closest("[data-sap-ui]");
		return $ClosestElement.length ? sap.ui.getCore().byId($ClosestElement.data("sap-ui")) : undefined;
	};

	/**
	 *
	 */
	ElementUtil.fixComponentParent = function(oElement) {
		if (this.isInstanceOf(oElement, "sap.ui.core.UIComponent")) {
			var oComponentContainer = oElement.oContainer;
			if (oComponentContainer) {
				return oComponentContainer.getParent();
			}
		} else {
			return oElement;
		}
	};

	/**
	 *
	 */
	ElementUtil.fixComponentContainerElement = function(oElement) {
		if (this.isInstanceOf(oElement, "sap.ui.core.ComponentContainer")) {
			// This happens when the compontentContainer has not been rendered yet
			if (!oElement.getComponentInstance()) {
				return;
			}
			return oElement.getComponentInstance().getRootControl();
		} else {
			return oElement;
		}
	};

	/**
	 *
	 */
	ElementUtil.getDomRef = function(oElement) {
		if (oElement) {
			var oDomRef;
			if (oElement.getDomRef) {
				oDomRef = oElement.getDomRef();
			}
			if (!oDomRef && oElement.getRenderedDomRef) {
				oDomRef = oElement.getRenderedDomRef();
			}
			return oDomRef;
		}
	};

	/**
	 *
	 */
	ElementUtil.findAllSiblingsInContainer = function(oElement, oContainer) {
		var oParent = oElement.getParent();
		if (!oParent) {
			return [];
		}

		if (oParent !== oContainer){
			var aParents = ElementUtil.findAllSiblingsInContainer(oParent, oContainer);
			return aParents.map(function(oParent){
				return ElementUtil.getAggregation(oParent, oElement.sParentAggregationName);
			}).reduce(function(a, b) {
				return a.concat(b);
			}, []);
		}

		return ElementUtil.getAggregation(oParent, oElement.sParentAggregationName);
	};

	ElementUtil.getAggregationAccessors = function(oElement, sAggregationName) {
		var oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		var oAggregationMetadata = oMetadata.getAggregation(sAggregationName);
		if (oAggregationMetadata) {
			var sGetter = oAggregationMetadata._sGetter;

			// altType getter returns not element (TODO: clarify if getAggregationNameControl getter is a convention)
			if (oAggregationMetadata.altTypes && oAggregationMetadata.altTypes.length
					&& oElement[oAggregationMetadata._sGetter + "Control"]) {
				sGetter = oAggregationMetadata._sGetter + "Control";
			}

			return {
				get : sGetter,
				add : oAggregationMetadata._sMutator,
				remove : oAggregationMetadata._sRemoveMutator,
				insert : oAggregationMetadata._sInsertMutator,
				removeAll : oAggregationMetadata._sRemoveAllMutator
			};
		} else {
			return {};
		}
	};

	ElementUtil.getAggregation = function(oElement, sAggregationName) {
		var oValue;

		var sGetter = this.getAggregationAccessors(oElement, sAggregationName).get;
		if (sGetter) {
			oValue = oElement[sGetter]();
		} else {
			oValue = oElement.getAggregation(sAggregationName);
		}
		// ATTENTION:
		// under some unknown circumstances the return oValue looks like an Array but jQuery.isArray() returned
		// undefined => false
		// that is why we use array ducktyping with a null check!
		// reproducible with Windows and Chrome (currently 35), when creating a project and opening WYSIWYG editor
		// afterwards on any file
		// sap.m.Panel.prototype.getHeaderToolbar() returns a single object but an array
		/* eslint-disable no-nested-ternary */
		oValue = oValue && oValue.splice ? oValue : (oValue ? [oValue] : []);
		/* eslint-enable no-nested-ternary */
		return oValue;
	};

	ElementUtil.getIndexInAggregation = function(oElement, oParent, sAggregationName) {
		return this.getAggregation(oParent, sAggregationName).indexOf(oElement);
	};

	/**
	 *
	 */
	ElementUtil.addAggregation = function(oParent, sAggregationName, oElement) {
		if (this.hasAncestor(oParent, oElement)) {
			throw new Error("Trying to add an element to itself or its successors");
		}
		var sAggregationAddMutator = this.getAggregationAccessors(oParent, sAggregationName).add;
		if (sAggregationAddMutator) {
			oParent[sAggregationAddMutator](oElement);
		} else {
			oParent.addAggregation(sAggregationName, oElement);
		}

	};

	/**
	 *
	 */
	ElementUtil.removeAggregation = function(oParent, sAggregationName, oElement, bSuppressInvalidate) {
		var sAggregationRemoveMutator = this.getAggregationAccessors(oParent, sAggregationName).remove;
		if (sAggregationRemoveMutator) {
			oParent[sAggregationRemoveMutator](oElement, bSuppressInvalidate);
		} else {
			oParent.removeAggregation(sAggregationName, oElement, bSuppressInvalidate);
		}
	};

	/**
	 *
	 */
	ElementUtil.insertAggregation = function(oParent, sAggregationName, oElement, iIndex) {
		if (this.hasAncestor(oParent, oElement)) {
			throw new Error("Trying to add an element to itself or its successors");
		}
		if (this.getIndexInAggregation(oElement, oParent, sAggregationName) !== -1) {
			// ManagedObject.insertAggregation won't reposition element, if it's already inside of same aggregation
			// therefore we need to remove the element and then insert it again. To prevent ManagedObjectObserver from
			// firing
			// setParent event with parent null, private flag is set.
			oElement.__bSapUiDtSupressParentChangeEvent = true;
			try {
				this.removeAggregation(oParent, sAggregationName, oElement, true);
			} finally {
				delete oElement.__bSapUiDtSupressParentChangeEvent;
			}
		}
		var sAggregationInsertMutator = this.getAggregationAccessors(oParent, sAggregationName).insert;
		if (sAggregationInsertMutator) {
			oParent[sAggregationInsertMutator](oElement, iIndex);
		} else {
			oParent.insertAggregation(sAggregationName, oElement, iIndex);
		}
	};

	/**
	 *
	 */
	ElementUtil.isValidForAggregation = function(oParent, sAggregationName, oElement) {
		var oAggregationMetadata = oParent.getMetadata().getAggregation(sAggregationName);

		// Make sure that the parent is not inside of the element, or is not the element itself,
		// e.g. insert a layout inside it's content aggregation.
		// This check needed as UI5 will have a maximum call stack error otherwise.
		if (this.hasAncestor(oParent, oElement)) {
			return false;
		}

		// only for public aggregations
		if (oAggregationMetadata) {
			// TODO : test altTypes
			var sTypeOrInterface = oAggregationMetadata.type;

			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (oAggregationMetadata.multiple === false && this.getAggregation(oParent, sAggregationName) &&
					this.getAggregation(oParent, sAggregationName).length > 0) {
				return false;
			}
			return this.isInstanceOf(oElement, sTypeOrInterface) || this.hasInterface(oElement, sTypeOrInterface);
		}

	};

	ElementUtil.getAssociationAccessors = function(oElement, sAggregationName) {
		var oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		var oAssociationMetadata = oMetadata.getAssociation(sAggregationName);
		if (oAssociationMetadata) {
			return {
				get : oAssociationMetadata._sGetter,
				add : oAssociationMetadata._sMutator,
				remove : oAssociationMetadata._sRemoveMutator,
				insert : oAssociationMetadata._sInsertMutator,
				removeAll : oAssociationMetadata._sRemoveAllMutator
			};
		} else {
			return {};
		}
	};

	ElementUtil.getAssociation = function(oElement, sAssociationName) {
		var oValue;
		var sGetter = this.getAssociationAccessors(oElement, sAssociationName).get;
		if (sGetter) {
			oValue = oElement[sGetter]();
		}
		return oValue;
	};

	ElementUtil.getIndexInAssociation = function(oElement, oParent, sAssociationName) {
		return this.getAssociationInstances(oParent, sAssociationName).indexOf(oElement);
	};

	ElementUtil.getAssociationInstances = function(oElement, sAssociationName) {
		var vValue = Util.castArray(this.getAssociation(oElement, sAssociationName));
		return vValue
			.map(function (sId) {
				return this.getElementInstance(sId);
			}, this);
	};

	/**
	 *
	 */
	ElementUtil.hasInterface = function(oElement, sInterface) {
		var aInterfaces = oElement.getMetadata().getInterfaces();
		return aInterfaces.indexOf(sInterface) !== -1;
	};

	/**
	 *
	 */
	ElementUtil.isInstanceOf = function(oElement, sType) {
		var oInstance = jQuery.sap.getObject(sType);
		if (typeof oInstance === "function") {
			return oElement instanceof oInstance;
		} else {
			return false;
		}
	};

	/**
	 * Checks whether specified Element is a ManagedObject
	 * @param oElement
	 * @param sElementType
	 * @param sAggregationName
	 * @returns {boolean}
	 */
	ElementUtil.isElementValid = function (oElement, sElementType, sAggregationName) {
		var bIsManagedObject = oElement instanceof ManagedObject && !oElement.bIsDestroyed;
		if (!bIsManagedObject && sElementType && sAggregationName) {
			jQuery.sap.log.error([
				"sap.ui.dt.DesignTime: child element in aggregation " + sAggregationName + " of '" + sElementType,
				"' should be a descendant of 'sap.ui.base.ManagedObject' and it is a '" + typeof oElement + "'. ",
				"Please ignore the aggregation '" + sAggregationName + "' in the .designtime configuration"
			].join(''));
		}
		return bIsManagedObject;
	};

	ElementUtil.getParent = function (oElement) {
		return this.isInstanceOf(oElement, 'sap.ui.core.Component')
			? oElement.oContainer
			: oElement.getParent();
	};

	/**
	 * Extract potential label part from the passed managed object instance
	 *
	 * @param {sap.ui.base.ManagedObject} oElement - managed object class instance for which label has to be extracted
	 * @param {Function} [fnFunction] - custom function for retrieving label
	 * @return {String|undefined} label string or undefined when no label can be extracted
	 */
	ElementUtil.getLabelForElement = function(oElement, fnFunction) {
		if (!ElementUtil.isElementValid(oElement)) {
			throw Util.createError("ElementUtil#getLabelForElement", "A valid managed object instance should be passed as parameter", "sap.ui.dt");
		}
		// if there is a function, only the function is executed
		if (typeof fnFunction === "function") {
			return fnFunction(oElement);
		} else {

			var vFieldLabel = (
				typeof oElement.getText === "function" && oElement.getText()
				|| typeof oElement.getLabelText === "function" && oElement.getLabelText()
				|| typeof oElement.getLabel === "function" && oElement.getLabel()
				|| typeof oElement.getTitle === "function" && oElement.getTitle()
				|| typeof oElement.getId === "function" && oElement.getId()
				);

			// to check getLabel().getText()
			if (vFieldLabel instanceof Element && typeof vFieldLabel.getText === "function") {
				return vFieldLabel.getText();
			} else {
				return vFieldLabel;
			}
		}
	};

	return ElementUtil;
}, /* bExport= */true);
