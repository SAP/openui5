/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.ElementUtil.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	/**
	 * Class for ElementUtil.
	 *
	 * @class
	 * Utility functionality to work with élements, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.ElementUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var ElementUtil = {};

	/**
	 *
	 */
	ElementUtil.iterateOverAllPublicAggregations = function(oElement, fnCallback) {
		var that = this;

		var mAggregations = oElement.getMetadata().getAllAggregations();
		var aAggregationNames = Object.keys(mAggregations);

		aAggregationNames.forEach(function(sAggregationName) {
			var oAggregation = mAggregations[sAggregationName];
			var oValue = that.getAggregation(oElement, sAggregationName);

			fnCallback(oAggregation, oValue);
		});
	};

	/**
	 *
	 */
	ElementUtil.getElementInstance = function(vElement) {
		if (typeof vElement === "string") {
			return sap.ui.getCore().byId(vElement);
		} else {
			return vElement;
		}
	};

	/**
	 *
	 */
	ElementUtil.hasAncestor = function(oElement, oAncestor) {
		var oParent = oElement;
		while (oParent && oParent !== oAncestor) {
			oParent = oParent.getParent();
		}

		return !!oParent;
	};

	/**
	 *
	 */
	ElementUtil.ensureRootElement = function(oElement) {
		if (!(oElement instanceof sap.ui.core.Element)) {
			return;
		}

		if (oElement.getMetadata().getClass() === sap.ui.core.ComponentContainer) {
			//This happens when the compontentContainer has not been rendered yet
			if (!oElement.getComponentInstance()) {
				return;
			}
			return oElement.getComponentInstance().getAggregation("rootControl");
		} else {
			return oElement;
		}
	};

	/**
	 *
	 */
	ElementUtil.findAllPublicElements = function(oElement) {
		var that = this;
		var aFoundElements = [];

		function internalFind(oElement) {
			oElement = that.ensureRootElement(oElement);
			if (oElement) {
				aFoundElements.push(oElement);
				that.iterateOverAllPublicAggregations(oElement, function(oAggregation, vElements) {
					if (vElements && vElements.length) {
						for (var i = 0; i < vElements.length; i++) {
							var oObj = vElements[i];
							internalFind(oObj);
						}
					} else if (vElements instanceof sap.ui.core.Element) {
						internalFind(vElements);
					}
				});
			}
		}
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
		var that = this;

		aType = aType || this.getControlFilter();
		var bFiltered = false;

		aType.forEach(function(sType) {
			bFiltered = that.isInstanceOf(oControl, sType);
			if (bFiltered) {
				return false;
			}
		});

		return bFiltered;
	};

	/**
	 *
	 */
	ElementUtil.findClosestControlInDom = function(oNode) {
		// TODO: Is this method still needed?
		if (oNode && oNode.getAttribute("data-sap-ui")) {
			return sap.ui.getCore().byId(oNode.getAttribute("data-sap-ui"));
		} else {
			if (oNode.parentNode) {
				this.findClosestControlInDom(oNode.parentNode);
			} else {
				return null;
			}
		}
	};

	/**
	 *
	 */
	ElementUtil.getAggregationAccessors = function(oElement, sAggregationName) {
		var oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		var oAggregationMetadata = oMetadata.getAggregation(sAggregationName);
		if (oAggregationMetadata) {
			return {
				get : oAggregationMetadata._sGetter,
				add : oAggregationMetadata._sMutator,
				remove : oAggregationMetadata._sRemoveMutator,
				insert : oAggregationMetadata._sInsertMutator
			};
		} else {
			return {};
		}
	};

	/**
	 *
	 */
	ElementUtil.getAggregation = function(oElement, sAggregationName) {
		var oValue;

		var sGetter = this.getAggregationAccessors(oElement, sAggregationName).get;
		if (sGetter) {
			oValue = oElement[sGetter]();
		} else {
			oValue = oElement.getAggregation(sAggregationName);
		}
		//ATTENTION:
		//under some unknown circumstances the return oValue looks like an Array but jQuery.isArray() returned undefined => false
		//that is why we use array ducktyping with a null check!
		//reproducible with Windows and Chrome (currently 35), when creating a project and opening WYSIWYG editor afterwards on any file
		//sap.m.Panel.prototype.getHeaderToolbar() returns a single object but an array
		/*eslint-disable no-nested-ternary */
		oValue = oValue && oValue.splice ? oValue : (oValue ? [oValue] : []);
		/*eslint-enable no-nested-ternary */
		return oValue;
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
			oParent.addAggregation("sAggregationName", oElement);
		}

	};

	/**
	 *
	 */
	ElementUtil.removeAggregation = function(oParent, sAggregationName, oElement) {
		var sAggregationRemoveMutator = this.getAggregationAccessors(oParent, sAggregationName).remove;
		if (sAggregationRemoveMutator) {
			oParent[sAggregationRemoveMutator](oElement);
		} else {
			oParent.removeAggregation(sAggregationName, oElement);
		}
	};

	/**
	 *
	 */
	ElementUtil.insertAggregation = function(oParent, sAggregationName, oElement, iIndex) {
		if (this.hasAncestor(oParent, oElement)) {
			throw new Error("Trying to add an element to itself or its successors");
		}
		if (this.getAggregation(oParent, sAggregationName).indexOf(oElement) !== -1) {
			// ManagedObject.insertAggregation won't reposition element, if it's already inside of same aggregation
			// therefore we need to remove the element and then insert it again. To prevent ManagedObjectObserver from firing
			// setParent event with parent null, private flag is set.
			oElement.__bSapUiDtSupressParentChangeEvent = true;
			try {
				// invalidate should be supressed, because if the controls have some checks and sync on invalidate,
				// internal structure can be also removed (SimpleForm invalidate destroyed all content temporary)
				oParent.removeAggregation(sAggregationName, oElement, true);
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
			return this.isInstanceOf(oElement, oAggregationMetadata.type);
		}

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
	 *
	 */
	ElementUtil.getDesignTimeMetadata = function(oElement) {
		var oDTMetadata = oElement ? oElement.getMetadata().getDesignTime() : {};
		return oDTMetadata || {};
	};



	return ElementUtil;
}, /* bExport= */ true);
