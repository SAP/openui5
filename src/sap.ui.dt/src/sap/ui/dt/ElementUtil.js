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
	 * Utility functionality to work with controls, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.ElementUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var ElementUtil = {};

	ElementUtil.getAggregationFilter = function() {
		return [ "tooltip", "customData", "dependents", "layoutData", "layout" ];
	};

	ElementUtil.getControlFilter = function() {
		return [ "sap.m.SplitApp", "sap.m.App", "sap.ui.layout.form.FormLayout" ];
	};

	ElementUtil.iterateOverAllPublicAggregations = function(oElement, fnCallback, fnBreakCondition, aFilter) {
		var mAggregations = oElement.getMetadata().getAllAggregations();
		if (!mAggregations) {
			fnCallback();
		}
		for ( var sName in mAggregations) {
			if (aFilter && aFilter.indexOf(sName) !== -1) {
				continue;
			}
			var oAggregation = mAggregations[sName];
			var oValue = this.getAggregation(oElement, sName);

			fnCallback(oAggregation, oValue);
			if (fnBreakCondition && fnBreakCondition(oAggregation, oValue)) {
				break;
			}
			
		}
	};

	ElementUtil.getElementInstance = function(vElement) {
		if (typeof vElement === "string") {
			return sap.ui.getCore().byId(vElement);
		} else {
			return vElement;
		}
	};

	ElementUtil.hasAncestor = function(oElement, oAncestor) {
		var oParent = oElement;
		while (oParent && oParent !== oAncestor) {
			oParent = oParent.getParent();
		}

		return !!oParent;
	};

	ElementUtil.findAllPublicElements = function(oElement) {
		var aFoundElements = [];
		var that = this;
		var oCore = sap.ui.core;

		function internalFind(oElement) {
			if (!(oElement instanceof oCore.Element) || that.isElementFiltered(oElement)) {
				return;
			}

			//check if needed
			if (oElement.getMetadata().getClass() === oCore.UIArea) {
				var aContent = oElement.getContent();
				for (var i = 0; i < aContent.length; i++) {
					internalFind(aContent[i]);
				}
			} else if (oElement.getMetadata().getClass() === oCore.ComponentContainer) {
				internalFind(oElement.getComponentInstance().getAggregation("rootControl"));
			} else {
				aFoundElements.push(oElement);
				that.iterateOverAllPublicAggregations(oElement, function(oAggregation, vElements) {
					if (vElements && vElements.length) {
						for (var k = 0; k < vElements.length; k++) {
							var oObj = vElements[k];
							internalFind(oObj);
						}
					} else if (vElements instanceof oCore.Element) {
						internalFind(vElements);
					}
				}, null, sap.ui.dt.ElementUtil.getAggregationFilter());
			}
		}
		internalFind(oElement);

		return aFoundElements;

	};

	ElementUtil.findAllPublicChildren = function(oElement) {
		var aFoundElements = this.findAllPublicElements(oElement);
		var iIndex = aFoundElements.indexOf(oElement);
		if (iIndex > -1) {
			aFoundElements.splice(iIndex, 1);
		}
		return aFoundElements;

	};

	ElementUtil.isElementFiltered = function(oControl, aType) {
		var that = this;

		aType = aType || this.getControlFilter();
		var bFiltered = false;

		aType.forEach(function(sType) {
			bFiltered = that.isInstance(oControl, sType);
			if (bFiltered) {
				return false;
			}
		});

		return bFiltered;
	};

	ElementUtil.getAggregationMutators = function(oElement, sAggregationName) {
		var oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		var oAggregationMetadata = oMetadata.getAggregation(sAggregationName);
		return {
			get : oAggregationMetadata._sGetter,
			add : oAggregationMetadata._sMutator,
			remove : oAggregationMetadata._sRemoveMutator,
			insert : oAggregationMetadata._sInsertMutator
		};
	};

	ElementUtil.getAggregation = function(oElement, sAggregationName) {
		var sGetMutator = this.getAggregationMutators(oElement, sAggregationName).get;
		var oValue = oElement[sGetMutator]();
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
	
	ElementUtil.addAggregation = function(oParent, sAggregationName, oElement) {
		var sAggregationAddMutator = this.getAggregationMutators(oParent, sAggregationName).add;
		oParent[sAggregationAddMutator](oElement);
	};
	
	ElementUtil.removeAggregation = function(oParent, sAggregationName, oElement) {
		var sAggregationRemoveMutator = this.getAggregationMutators(oParent, sAggregationName).remove;
		oParent[sAggregationRemoveMutator](oElement);
	};

	ElementUtil.insertAggregation = function(oParent, sAggregationName, oElement, iIndex) {
		if (this.getAggregation(oParent, sAggregationName).indexOf(oElement) !== -1) {
			// ManagedObject.insertAggregation won't reposition element, if it's already inside of same aggregation
			// therefore we need to remove the element and then insert it again. To prevent ManagedObjectObserver from firing
			// setParent event with parent null, private flag is set.
			oElement.__bSapUiDtSupressParentChangeEvent = true;
			try {
				this.removeAggregation(oParent, sAggregationName, oElement);
			} finally {
				delete oElement.__bSapUiDtSupressParentChangeEvent;
			}
		}
		var sAggregationInsertMutator = this.getAggregationMutators(oParent, sAggregationName).insert;
		oParent[sAggregationInsertMutator](oElement, iIndex);
	};

	ElementUtil.isValidForAggregation = function(oParent, sAggregationName, oElement) {
		var oAggregationMetadata = oParent.getMetadata().getAggregation(sAggregationName);

		// TODO : test altTypes
		return this.isInstance(oElement, oAggregationMetadata.type);
	};

	ElementUtil.isInstance = function(oElement, sType) {
		var oInstance = jQuery.sap.getObject(sType);
		if (typeof oInstance === "function") {
			return oElement instanceof oInstance;
		} else {
			return false;
		}
	};		

	return ElementUtil;
}, /* bExport= */ true);
