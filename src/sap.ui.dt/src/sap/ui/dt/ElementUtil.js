/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.ElementUtil.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject'
],
function(
	jQuery,
	ManagedObject
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

	ElementUtil.sACTION_MOVE = 'move';
	ElementUtil.sACTION_CUT = 'cut';
	ElementUtil.sACTION_PASTE = 'paste';
	ElementUtil.sREORDER_AGGREGATION = 'reorder_aggregation';

	/**
	 *
	 */
	ElementUtil.iterateOverElements = function(vElement, fnCallback) {
		if (vElement && vElement.length) {
			for (var i = 0; i < vElement.length; i++) {
				var oElement = vElement[i];
				if (oElement instanceof sap.ui.base.ManagedObject) {
					fnCallback(oElement);
				}
			}
		} else if (vElement instanceof sap.ui.base.ManagedObject) {
			fnCallback(vElement);
		}
	};

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
	 * ! Please, use this method only if OverlayUtil.getClosestOverlayForType is not available in your case ! find the
	 * closest element of the given type
	 *
	 * @param {sap.ui.core.Element}
	 *          oSourceElement to start search for
	 * @param {string}
	 *          sType to check instance of
	 * @return {sap.ui.core.Element} element of the given type, if found
	 */
	ElementUtil.getClosestElementOfType = function(oSourceElement, sType) {
		var oElement = oSourceElement;

		while (oElement && !this.isInstanceOf(oElement, sType)) {
			oElement = oElement.getParent();
		}

		return oElement;
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
	ElementUtil.findAllPublicElements = function(oElement) {
		var aFoundElements = [];

		var internalFind = function (oElement) {
			oElement = this.fixComponentContainerElement(oElement);
			if (oElement) {
				aFoundElements.push(oElement);
				this.iterateOverAllPublicAggregations(oElement, function(oAggregation, vElements) {
					this.iterateOverElements(vElements, internalFind);
				}.bind(this));
			}
		}.bind(this);

		internalFind(oElement);

		return aFoundElements;
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
	ElementUtil.findAllPublicChildren = function(oElement) {
		var aFoundElements = this.findAllPublicElements(oElement);
		var iIndex = aFoundElements.indexOf(oElement);
		if (iIndex > -1) {
			aFoundElements.splice(iIndex, 1);
		}
		return aFoundElements;

	};

	/**
	 *
	 */
	ElementUtil.isElementFiltered = function(oControl, aType) {
		// TODO: Is this method still needed?
		aType = aType || this.getControlFilter();
		var bFiltered = false;

		aType.forEach(function(sType) {
			bFiltered = this.isInstanceOf(oControl, sType);
			if (bFiltered) {
				return false;
			}
		}, this);

		return bFiltered;
	};

	/**
	 *
	 */
	ElementUtil.findClosestControlInDom = function(oNode) {
		// TODO: Is this method still needed?
		if (oNode && oNode.getAttribute("data-sap-ui")) {
			return sap.ui.getCore().byId(oNode.getAttribute("data-sap-ui"));
		} else if (oNode.parentNode) {
			this.findClosestControlInDom(oNode.parentNode);
		} else {
			return null;
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
		var vValue = this.getAssociation(oElement, sAssociationName);

		if (!Array.isArray(vValue)) {
			vValue = vValue ? [vValue] : [];
		}

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
	 * .* Executes an array of actions. An action is a JSON object having the following structure: .* .* <action> = { .*
	 * 'element' : <ui5 id of element to be moved>, .* 'source' : { .* 'index': <source index>, .* 'parent' : <ui5 id
	 * of element actual parent>, .* 'aggregation' : <name of aggregation> .* }, .* 'target' : { .* 'index': <target
	 * index>, .* 'parent' : <ui5 id of element future parent>, .* 'aggregation' : <name of aggregation> .* }, .*
	 * 'changeType' : <name of change type e.g "Move" .* })
	 */
	ElementUtil.executeActions = function(aActions) {
		var oTargetParent, oMovedElement;

		for (var i = 0; i < aActions.length; i++) {
			var oAction = aActions[i];
			switch (oAction.changeType) {
				case ElementUtil.sACTION_MOVE :
					oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
					oMovedElement = sap.ui.getCore().byId(oAction.element);
					ElementUtil.insertAggregation(oTargetParent, oAction.target.aggregation, oMovedElement,
							oAction.target.index);
					break;
				case ElementUtil.sACTION_CUT :
					oTargetParent = sap.ui.getCore().byId(oAction.source.parent);
					oMovedElement = sap.ui.getCore().byId(oAction.element);
					ElementUtil.removeAggregation(oTargetParent, oAction.source.aggregation, oMovedElement);
					break;
				case ElementUtil.sACTION_PASTE :
					oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
					oMovedElement = sap.ui.getCore().byId(oAction.element);
					ElementUtil.insertAggregation(oTargetParent, oAction.target.aggregation, oMovedElement,
							oAction.target.index);
					break;
				case ElementUtil.sREORDER_AGGREGATION :
					oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
					var sAggregationRemoveAllMutator = this
							.getAggregationAccessors(oTargetParent, oAction.target.aggregation).removeAll;
					oTargetParent[sAggregationRemoveAllMutator]();
					var sAggregationAddMutator = this.getAggregationAccessors(oTargetParent, oAction.target.aggregation).add;
					for (var j = 0; j < oAction.source.elements.length; j++) {
						var oElement = sap.ui.getCore().byId(oAction.source.elements[j]);
						oTargetParent[sAggregationAddMutator](oElement);
					}
					break;
				default :
			}
		}

	};

	/**
	 * Checks if the Element is in the dom (jQuery.is(":visible")) and if it is not hidden / opacity > 0.
	 *
	 * @param {jQuery} $Element jQuery object
	 * @returns {boolean} Returns true if any of the jQuery objects is jQuery-visible, bot hidden and opacity > 0
	 */
	ElementUtil.isVisible = function($Element) {
		var bVisible = false;
		var $CurrentElement;
		// check every jQuery object for itself
		for (var i = 0, n = $Element.length; i < n; i++) {
			$CurrentElement = $Element.eq(i);
			// $().is("visible") returns true even if opacity = 0 or visibility = hidden,
			// so we need to check it seperately
			var bFilterOpacity = $CurrentElement.css("filter").match(/opacity\(([^)]*)\)/);
			bVisible = $CurrentElement.is(":visible")
				&& $CurrentElement.css("visibility") !== "hidden"
				&& $CurrentElement.css("opacity") > 0
				&& (bFilterOpacity ? parseFloat(bFilterOpacity[1]) > 0 : true);
			if (bVisible) {
				break;
			}
		}
		return bVisible;
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

	return ElementUtil;
}, /* bExport= */true);
