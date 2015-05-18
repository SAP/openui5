/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.Utils.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	/**
	 * Class for Utils.
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
	 * @alias sap.ui.dt.Utils
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Utils = {};

	Utils.getAggregationFilter = function() {
		return [ "tooltip", "customData", "layoutData" ];
	};

	Utils.getControlFilter = function() {
		return [ "sap.m.SplitApp", "sap.m.App", "sap.ui.layout.form.FormLayout"  ];
	};

	Utils.getSupportedControlBlocks = function() {
		return {
			"sap.ui.comp.smartform.SmartForm" : {}, 
			"sap.ui.comp.smartform.Group" : {}, 
			"sap.m.ObjectHeader" : {}
		};
	};
	Utils.iterateOverAllPublicAggregations = function(oControl, fnCallback, fnBreakCondition, aFilter) {
		var aPromises = [],
			oRes;
		var mAggregations = oControl.getMetadata().getAllAggregations();
		if (!mAggregations) {
			oRes = fnCallback();
			// TODO Remove the Q instance
			if (window.Q && window.Q.isPromise(oRes)) {
				return oRes;
			}
		}
		for ( var sName in mAggregations) {
			if (aFilter && aFilter.indexOf(sName) !== -1) {
				continue;
			}
			var oAggregation = mAggregations[sName];
			if (!oAggregation._sGetter && !oControl.__calledJSONKeys) {
				oControl.getMetadata().getJSONKeys();
				// Performance optimization
				oControl.__calledJSONKeys = true;
			}
			if (oAggregation._sGetter) {
				var oValue = oControl[oAggregation._sGetter]();

				//ATTENTION:
				//under some unknown circumstances the return oValue looks like an Array but jQuery.isArray() returned undefined => false
				//that is why we use array ducktyping with a null check!
				//In Watt reproducible with Windows and Chrome (currently 35), when creating a project and opening WYSIWYG editor afterwards on any file
				//sap.m.Panel.prototype.getHeaderToolbar() returns a single object but an array
				/*eslint-disable no-nested-ternary */
				oValue = oValue && oValue.splice ? oValue : (oValue ? [oValue] : []);
				/*eslint-enable no-nested-ternary */
				oRes = fnCallback(oAggregation, oValue);
				if (window.Q && window.Q.isPromise(oRes)) {
					aPromises.push(oRes);
				}
				if (fnBreakCondition && fnBreakCondition(oAggregation, oValue)) {
					break;
				}
			}
		}

		if (window.Q && aPromises.length) {
			return window.Q.all(aPromises);
		}
	};

	Utils.getWYSIWYGParent = function(oControl) {
		var oParent = oControl.getParent();
		if (oParent && !oParent.__widget) {
			return this.getWYSIWYGParent(oParent);
		}

		// Control is filtered!
		if (oParent && oParent.__widget && oParent.__widget.isFiltered()) {
			return this.getWYSIWYGParent(oParent);
		}

		return oParent;
	};

	Utils.findAllPublicControls = function(oControl, oCore) {
		var aFoundControls = [];
		var that = this;

		function internalFind(oControl) {
			if (oControl.getMetadata().getClass() === oCore.UIArea) {
				var aContent = oControl.getContent();
				for (var i = 0; i < aContent.length; i++) {
					internalFind(aContent[i]);
				}
			} else if (oControl.getMetadata().getClass() === oCore.ComponentContainer) {
				internalFind(oControl.getComponentInstance().getAggregation("rootControl"));
			} else {
				oControl.__publicControl = true;
				aFoundControls.push(oControl);
				that.iterateOverAllPublicAggregations(oControl, function(oAggregation, aControls) {
					if (aControls && aControls.length) { // TODO: ARRAY CHECK
						for (var k = 0; k < aControls.length; k++) {
							var oObj = aControls[k];
							if (oObj instanceof oCore.Element) {
								internalFind(oObj);
							}
						}
					} else if (aControls instanceof oCore.Element) {
						internalFind(aControls);
					}
				}, null, sap.ui.dt.Utils.getAggregationFilter());
			}
		}
		internalFind(oControl);

		return aFoundControls;

	};

	Utils.findParentWYSIWYGAggregation = function(oControl, fnCallback) {
		var oParentControl = sap.ui.dt.Utils.getWYSIWYGParent(oControl);
		if (!oParentControl) {
			return false;
		}
		var bBreak = false;
		sap.ui.dt.Utils.iterateOverAllPublicAggregations(oParentControl, function(oAggregation, aControls) {
			if (bBreak) {
				return;
			}
			if (jQuery.inArray(oControl, aControls) !== -1) {
				bBreak = true;
				fnCallback(oAggregation, oParentControl, aControls);
			}
		}, function() {
			return bBreak;
		}, sap.ui.dt.Utils.getAggregationFilter());
	};

	Utils.isControlPublic = function(oControl, oCore) {
		var that = this;

		function internalCheck(oObject) {
			if (oObject.__publicControl) {
				return true;
			}
			if (!oObject) {
				return false;
			}
			var oParent = oObject.getParent();
			if (!oParent) {
				return false;
			}
			if (oParent.__publicControl) {
				var aList = that.findAllPublicControls(oParent, oCore).filter(function(oSingleControl) {
					return oSingleControl.getId() === oControl.getId();
				});
				return aList.length > 0;
			}
			return internalCheck(oParent);
		}
		return internalCheck(oControl);
	};

	Utils.isControlFiltered = function(oControl, aType) {
		aType = aType || this.getControlFilter();
		
		var oControlContentMetaData = oControl.getContent && oControl.getContent() ? oControl.getContent()[0] : undefined;
		oControlContentMetaData = oControlContentMetaData ? oControlContentMetaData.getMetadata() : undefined;

		return ((oControl.getMetadata()._sClassName === "sap.ui.core.UIArea")
				|| (oControlContentMetaData && oControlContentMetaData._sClassName === "sap.m.Page") ? true
				: this.isTypeOf(oControl.getMetadata(), aType));
	};
	
	Utils.isTypeOf = function(oMetadata, aType) {
		if (aType.indexOf(oMetadata.getName()) !== -1) {
			return true;
		} else if (oMetadata.getParent().getName() !== "sap.ui.base.Object") {
			return this.isTypeOf(oMetadata.getParent(), aType);
		} else {
			return false;
		}
	};

	Utils.setDesignTimeLayoutdata = function(oControl, oParent) {
		//No parent -> Nothing
		if (!oParent) {
			return;
		}
		var oLayoutData = oControl.getLayoutData && oControl.getLayoutData();
		var bParentIsWYSIWYGControl = !!oParent.__widget;
		var oParentLayoutDataFactory = bParentIsWYSIWYGControl && oParent.__widget.getLayoutDataFactory(oControl.sParentAggregationName);

		//No layoutdata, no parent layoutdata -> Nothing
		if (!oLayoutData && !oParentLayoutDataFactory) {
			return;
		}

		var bSameLayoutDataType = !!(oParentLayoutDataFactory && oLayoutData && (oLayoutData.getMetadata().getName() === oParent.__widget
				.getDesignTimeProperty("aggregations")[oControl.sParentAggregationName]._layoutDataName));
		// Layoutdata ; parent layout is the same type -> Nothing
		if (oLayoutData && bSameLayoutDataType) {
			return;
		}

		var oParentLayoutData = oParentLayoutDataFactory && oParentLayoutDataFactory();
		var bDefaultParentLayoutData = !!(oParentLayoutDataFactory && oParent.__widget.getDesignTimeProperty("aggregations")[oControl.sParentAggregationName]._defaultLayoutData);

		switchLayout(oControl, oLayoutData, oParentLayoutData, bDefaultParentLayoutData, bSameLayoutDataType);
	};

	Utils.findNextParentBlockElement = function(oControl) {
		var mSupportedBlockControls = Utils.getSupportedControlBlocks();

		if (!oControl) {
			return;
		}

		if (!mSupportedBlockControls[oControl.getMetadata().getName()]) {
			return Utils.findNextParentBlockElement(oControl.getParent());
		} else {
			return oControl;
		}
	};

	function switchLayout(oControl, oLayoutData, oParentLayoutData, bDefaultParentLayoutData, bSameLayoutDataType) {
		rememberLayoutData(oControl, oLayoutData);
		var newLayoutData = getHiddenExpectedLayoutData(oControl, oParentLayoutData);
		if (!newLayoutData && !bSameLayoutDataType) {
			newLayoutData = bDefaultParentLayoutData ? null : oParentLayoutData;
		}
		oControl.setLayoutData(newLayoutData);
	}

	/**
	 * Remembers the layoutdata in the hidden DesignTime property _layoutdata
	 * @param  {Control} oControl
	 * @param  {LayoutData} oLayoutData
	 */

	function rememberLayoutData(oControl, oLayoutData) {
		if (oLayoutData) {
			getHiddenLayoutData(oControl)[oLayoutData.getMetadata().getName()] = oLayoutData;
		}
	}

	/**
	 * Returns the hidden layout data of a control and creates if needed
	 * @param  {oControl} oControl
	 * @return {Object}   the hidden layout data of a control
	 */

	function getHiddenLayoutData(oControl) {
		if (!oControl._layoutData) {
			oControl._layoutData = {};
		}
		return oControl._layoutData;
	}

	function getHiddenExpectedLayoutData(oControl, oExpectedLayoutData) {
		if (oExpectedLayoutData) {
			return getHiddenLayoutData(oControl)[oExpectedLayoutData.getMetadata().getName()];
		}
	}
		

	return Utils;
}, /* bExport= */ true);