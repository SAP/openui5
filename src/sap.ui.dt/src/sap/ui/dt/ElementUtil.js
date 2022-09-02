/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.ElementUtil.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object",
	"sap/ui/dt/Util",
	"sap/ui/dt/DOMUtil",
	"sap/ui/core/Element",
	"sap/ui/core/Component",
	"sap/base/util/isPlainObject",
	"sap/ui/core/UIArea"
], function(
	jQuery,
	BaseObject,
	Util,
	DOMUtil,
	Element,
	Component,
	isPlainObject,
	UIArea
) {
	"use strict";

	/**
	 * Utility functionality to work with UI5 elements, e.g. iterate through aggregations, find parents, ...
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ElementUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API
	 *               might be changed in future.
	 */

	var ElementUtil = {};

	ElementUtil.iterateOverAllPublicAggregations = function(oElement, fnCallback) {
		var mAggregations = oElement.getMetadata().getAllAggregations();
		var aAggregationNames = Object.keys(mAggregations);

		aAggregationNames.forEach(function(sAggregationName) {
			var oAggregation = mAggregations[sAggregationName];
			var vAggregationValue = this.getAggregation(oElement, sAggregationName);

			fnCallback(oAggregation, vAggregationValue);
		}, this);
	};

	ElementUtil.getElementInstance = function(vElement) {
		if (typeof vElement === "string") {
			var oElement = sap.ui.getCore().byId(vElement);
			return oElement || Component.get(vElement);
		}
		return vElement;
	};

	ElementUtil.hasAncestor = function(oElement, oAncestor) {
		oAncestor = this.fixComponentContainerElement(oAncestor);
		var oFixedParent;

		while (oElement && oElement !== oAncestor) {
			oFixedParent = this.fixComponentParent(oElement);
			// fixComponentParent already returns the parent
			if (oElement === oFixedParent) {
				oElement = oElement.getParent();
			} else {
				oElement = oFixedParent;
			}
		}

		return !!oElement;
	};

	ElementUtil.getClosestElementForNode = function(oNode) {
		var $ClosestElement = jQuery(oNode).closest("[data-sap-ui]");
		return $ClosestElement.length ? sap.ui.getCore().byId($ClosestElement.attr("data-sap-ui")) : undefined;
	};

	ElementUtil.fixComponentParent = function(oElement) {
		if (BaseObject.isA(oElement, "sap.ui.core.UIComponent")) {
			var oComponentContainer = oElement.oContainer;
			if (oComponentContainer) {
				return oComponentContainer.getParent();
			}
		} else {
			return oElement;
		}
	};

	ElementUtil.fixComponentContainerElement = function(oElement) {
		if (BaseObject.isA(oElement, "sap.ui.core.ComponentContainer")) {
			// This happens when the compontentContainer has not been rendered yet
			if (!oElement.getComponentInstance()) {
				return undefined;
			}
			return oElement.getComponentInstance().getRootControl();
		}
		return oElement;
	};

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

	ElementUtil.findAllSiblingsInContainer = function(oElement, oContainer) {
		var oParent = oElement && oElement.getParent();
		if (!oParent) {
			return [];
		}

		if (oParent !== oContainer) {
			var aParents = ElementUtil.findAllSiblingsInContainer(oParent, oContainer);
			return aParents.map(function(oParent) {
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
				get: sGetter,
				add: oAggregationMetadata._sMutator,
				remove: oAggregationMetadata._sRemoveMutator,
				insert: oAggregationMetadata._sInsertMutator,
				removeAll: oAggregationMetadata._sRemoveAllMutator
			};
		}
		return {};
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
		// under some unknown circumstances the return oValue looks like an Array but Array.isArray() returned
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

	ElementUtil.removeAggregation = function(oParent, sAggregationName, oElement, bSuppressInvalidate) {
		var sAggregationRemoveMutator = this.getAggregationAccessors(oParent, sAggregationName).remove;
		if (sAggregationRemoveMutator) {
			oParent[sAggregationRemoveMutator](oElement, bSuppressInvalidate);
		} else {
			oParent.removeAggregation(sAggregationName, oElement, bSuppressInvalidate);
		}
	};

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
			return BaseObject.isA(oElement, sTypeOrInterface) || this.hasInterface(oElement, sTypeOrInterface);
		}
	};

	ElementUtil.getAssociationAccessors = function(oElement, sAggregationName) {
		var oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		var oAssociationMetadata = oMetadata.getAssociation(sAggregationName);
		if (oAssociationMetadata) {
			return {
				get: oAssociationMetadata._sGetter,
				add: oAssociationMetadata._sMutator,
				remove: oAssociationMetadata._sRemoveMutator,
				insert: oAssociationMetadata._sInsertMutator,
				removeAll: oAssociationMetadata._sRemoveAllMutator
			};
		}
		return {};
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

	ElementUtil.hasInterface = function(oElement, sInterface) {
		var aInterfaces = oElement.getMetadata().getInterfaces();
		return aInterfaces.indexOf(sInterface) !== -1;
	};

	/**
	 * Checks whether specified Element is in a binding template, if so it checks if template has a valid control representation.
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @returns {boolean} <code>true</code> if object is not in bound aggregation or has a valid template representation
	 */
	ElementUtil.isElementInTemplate = function (oObject) {
		var mLocationInTemplate = ElementUtil.getAggregationInformation(oObject);

		if (mLocationInTemplate.templateId) {
			var sTemplateId = ElementUtil.extractTemplateId(mLocationInTemplate);

			if (!sTemplateId) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Checks whether specified Element is a direct template clone (e.g. the list items of a sap.m.ListItem)
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @returns {boolean} <code>true</code> if object is a direct clone of the template
	 */
	 ElementUtil.isElementDirectTemplateChild = function (oObject) {
		var mLocationInTemplate = ElementUtil.getAggregationInformation(oObject);

		if (mLocationInTemplate.templateId) {
			var sTemplateId = ElementUtil.extractTemplateId(mLocationInTemplate);

			// If the stack only has one element, this element is a direct child of the template aggregation
			if (sTemplateId && mLocationInTemplate.stack.length === 1) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Checks whether specified Element is a valid ManagedObject. The allowed objects must be
	 * descendants of sap.ui.core.Element or sap.ui.core.Component classes.
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @returns {boolean} <code>true</code> if object is supported
	 */
	ElementUtil.isElementValid = function (oObject) {
		var bValid = (
			(
				oObject instanceof Element
				|| oObject instanceof Component
			)
			&& !oObject.bIsDestroyed
			&& ElementUtil.isElementInTemplate(oObject)
		);

		return bValid;
	};

	ElementUtil.getParent = function (oElement) {
		return BaseObject.isA(oElement, 'sap.ui.core.Component')
			? oElement.oContainer
			: oElement.getParent();
	};

	/**
	 * Extract potential label part from the passed managed object instance
	 *
	 * @param {sap.ui.base.ManagedObject} oElement - managed object class instance for which label has to be extracted
	 * @param {function} [fnFunction] - custom function for retrieving label
	 * @return {string|undefined} label string or undefined when no label can be extracted
	 */
	ElementUtil.getLabelForElement = function(oElement, fnFunction) {
		if (!ElementUtil.isElementValid(oElement)) {
			throw Util.createError("ElementUtil#getLabelForElement", "A valid managed object instance should be passed as parameter", "sap.ui.dt");
		}
		// if there is a function, only the function is executed
		if (typeof fnFunction === "function") {
			return fnFunction(oElement);
		}

		function calculateLabel(oElement) {
			var vFieldLabel = (
				typeof oElement.getText === "function" && oElement.getText()
				|| typeof oElement.getLabelText === "function" && oElement.getLabelText()
				|| typeof oElement.getLabel === "function" && oElement.getLabel()
				|| typeof oElement.getTitle === "function" && oElement.getTitle()
				|| typeof oElement.getHeading === "function" && oElement.getHeading()
				|| typeof oElement.getDataSourceLabel === "function" && oElement.getDataSourceLabel()
			);

			if (ElementUtil.isElementValid(vFieldLabel)) {
				return calculateLabel(vFieldLabel);
			}
			return vFieldLabel;
		}

		var vCalculatedLabel = calculateLabel(oElement);
		return typeof vCalculatedLabel !== "string" ? oElement.getId() : vCalculatedLabel;
	};

	/**
	 * Returns for a given element the corresponding element id of the element inside of a binding template
	 * This function uses the information gathered in the output of ElementUtil.getAggregationInformation
	 * The check is done recursively
	 * @param  {sap.ui.dt.OverlayUtil.AggregationBindingStack}  mBoundControl {@link sap.ui.dt.ElementUtil.AggregationBindingStack}
	 * @return {string}                                         Returns the element id of the corresponding element inside of a template
	 */
	ElementUtil.extractTemplateId = function(mBoundControl) {
		if (isPlainObject(mBoundControl) && mBoundControl.templateId) {
			if (mBoundControl.stack.length > 1) {
				var oResultControl;
				var oAggregatedControl = sap.ui.getCore().byId(mBoundControl.templateId);
				var sAggregation;
				var iIndex;
				for (var i = mBoundControl.stack.length - 2; i >= 0; i--) {
					sAggregation = mBoundControl.stack[i].aggregation;
					iIndex = mBoundControl.stack[i].index;
					oResultControl = ElementUtil.getAggregation(oAggregatedControl, sAggregation)[iIndex];
					if (!oResultControl) {
						return undefined;
					}
					oAggregatedControl = oResultControl;
				}
				return oAggregatedControl.getId();
			} else if (mBoundControl.stack.length === 1) {
				return mBoundControl.templateId;
			}
		} else {
			return undefined;
		}
	};

	/**
	 * The AggregationBindingStack contains element id and aggregation name of the bound control together with a stack containing
	 * information about the traversed elements for an Overlay which is part of an aggregation binding.
	 * @typedef {object} sap.ui.dt.ElementUtil.AggregationBindingStack
	 * @property {string} elementId - id of the bound control.
	 * @property {string} aggregation - name of the bound aggregation.
	 * @property {string} templateId - id of the binding template.
	 * @property {Object[]} stack - array of objects containing element, element type, aggregation name and index of the element in
	 *                              the aggregation for each traversed aggregation.
	 * @property {string} stack.element - element id
	 * @property {string} stack.type - element type
	 * @property {string} stack.aggregation - aggregation name
	 * @property {number} stack.index - index of the element in parent aggregation
	 */

	/**
	 * Returns the element ID and the aggregation name of the bound control for an element which is part of an aggregation binding.
	 * The check is done recursively.
	 * @param  {sap.ui.core.Element} oElement - Element being checked
	 * @return {AggregationBindingStack} {@link sap.ui.dt.ElementUtil.AggregationBindingStack} object
	 */
	ElementUtil.getAggregationInformation = function(oElement) {
		var aStack = [];
		return this._evaluateBinding(oElement, aStack);
	};

	ElementUtil._evaluateBinding = function(oElement, aStack) {
		var sAggregationName;
		var iIndex;
		var oParent;
		var bBindingFound;

		// If the binding is found on an API parent (with a forwarded aggregation),
		// the templateId is directly retrieved from it (the stack only has the element itself)
		var aAPIParentInfos = oElement.aAPIParentInfos;
		if (aAPIParentInfos && aAPIParentInfos.length > 0) {
			bBindingFound = aAPIParentInfos.some(function(mParentInfo) {
				oParent = mParentInfo.parent;
				sAggregationName = mParentInfo.aggregationName;
				iIndex = ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
				return oParent.getBinding(sAggregationName);
			});
		}
		if (!bBindingFound) {
			oParent = oElement.getParent();
			if (oParent) {
				sAggregationName = oElement.sParentAggregationName;
				iIndex = ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
			} else {
				iIndex = -1;
			}
		}

		aStack.push({
			element: oElement.getId(),
			type: oElement.getMetadata().getName(),
			aggregation: sAggregationName,
			index: iIndex
		});

		if (sAggregationName && oParent.getBinding(sAggregationName)) {
			var oBinding = oParent.getBindingInfo(sAggregationName);
			var oTemplate = oBinding && oBinding.template;

			return {
				elementId: oParent.getId(),
				aggregation: sAggregationName,
				templateId: oTemplate ? oTemplate.getId() : undefined,
				stack: aStack
			};
		}

		return !oParent || oParent instanceof UIArea
			? {
				elementId: undefined,
				aggregation: undefined,
				templateId: undefined,
				stack: aStack
			}
			: (
				this._evaluateBinding(
					oParent,
					aStack
				)
			);
	};

	/**
	 * Getter for binding template if available.
	 * @param {sap.ui.base.ManagedObject} oElement - Element to be checked for binding info with template attached
	 * @param {string} sAggregationName - Aggregation name required to check binding info for this one aggregation
	 * @returns {sap.ui.base.ManagedObject} Aggregation binding template for the given element and aggregation name
	 */
	ElementUtil.getAggregationBindingTemplate = function (oElement, sAggregationName) {
		var oBinding = oElement && oElement.getBindingInfo(sAggregationName);
		return oBinding && oBinding.template;
	};

	/**
	 * Decrements passed index value by 1, if the source and target overlays for move belong to the same container and source index is less than the target index.
	 * To compensate the fact that the lower source index is also removed during move.
	 * @param {object} oSourceContainer - Source container
	 * @param {object} oTargetContainer - Target container
	 * @param {int} iSourceIndex - Source index
	 * @param {int} iTargetIndex - Target index
	 * @returns {int} - Index for move
	 */
	ElementUtil.adjustIndexForMove = function(oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex) {
		if (oSourceContainer === oTargetContainer && iSourceIndex < iTargetIndex && iSourceIndex > -1) {
			return iTargetIndex - 1;
		}
		return iTargetIndex;
	};

	/**
	 * Checks if an aggregation is valid for an element being moved
	 *
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay - Aggregation overlay to be checked for target zone
	 * @param {sap.ui.dt.ElementOverlay} oMovedOverlay - Overlay being moved
	 * @param {boolean} bOverlayNotInDom - Flag defining if overlay is not in DOM
	 * @returns {Promise.<boolean>} Resolved promise with <code>true</code> if the aggregation overlay is a valid target zone for the overlay
	 */
	 ElementUtil.checkTargetZone = function(oAggregationOverlay, oMovedOverlay, bOverlayNotInDom) {
		var oGeometry = oAggregationOverlay.getGeometry();
		var bGeometryVisible = oGeometry && oGeometry.size.height > 0 && oGeometry.size.width > 0;
		var oParentElement = oAggregationOverlay.getElement();

		var oMovedElement = oMovedOverlay.getElement();
		var sAggregationName = oAggregationOverlay.getAggregationName();
		if (!oMovedElement || !ElementUtil.isValidForAggregation(oParentElement, sAggregationName, oMovedElement)) {
			return Promise.resolve(false);
		}

		// checks related to visibility
		function fnCheckAggregationOverlayVisibility(oAggregationOverlay, oParentElement) {
			// this function can get called on overlay registration, when there are no overlays in dom yet. In this case, DOMUtil.isVisible is always false.
			var oAggregationOverlayDomRef = oAggregationOverlay.getDomRef();
			var bAggregationOverlayVisibility = DOMUtil.isVisible(oAggregationOverlayDomRef);

			// if there is no aggregation overlay domRef available the further check for domRef of the corresponding element is not required
			if (!oAggregationOverlayDomRef) {
				return bAggregationOverlayVisibility;
			}
			// additional check for corresponding element DomRef visibiltiy required for target zone checks during navigation mode.
			// during navigation mode the domRef of valid overlays is given and the offsetWidth is 0. Therefor we need to check the visibility of the corresponding element additionally
			var oParentElementDomRef = oParentElement && oParentElement.getDomRef && oParentElement.getDomRef();
			var bAggregationElementVisibility = oParentElementDomRef ? DOMUtil.isVisible(oParentElementDomRef) : true;
			return bAggregationOverlayVisibility || bAggregationElementVisibility;
		}

		if (
			(bOverlayNotInDom && !bGeometryVisible)
			|| !bOverlayNotInDom && !fnCheckAggregationOverlayVisibility(oAggregationOverlay, oParentElement)
			|| !(oParentElement && oParentElement.getVisible && oParentElement.getVisible())
			// an aggregation can still have visible = true even if it has been removed from its parent
			|| !oParentElement.getParent()
		) {
			return Promise.resolve(false);
		}

		return Promise.resolve(true);
	};

	return ElementUtil;
}, /* bExport= */true);