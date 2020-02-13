/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/RecordReplay"
], function (BaseObject, RecordReplay) {
	"use strict";

	/**
	 * @class generates a control selector
	 */
	var ControlSelectorGenerator = BaseObject.extend("sap.ui.testrecorder.controlSelectors.ControlSelectorGenerator", {});

	/**
	 * generates a UIVeri5 selector for a control
	 *
	 * @param {object} mData data of the control for which to find a selector. Must contain either domElementId or controlId.
	 * @param {string} mData.domElementId ID of a DOM element that is part of the control DOM tree
	 * @param {string} mData.controlId ID of the control
	 * @param {object} mData.settings preferences for the selector
	 * @param {boolean} mData.settings.preferViewId true if selectors with view ID should have higher priority than selectors with global ID. Default value is false.
	 * @returns {Promise<string>} Promise for a control selector or error
	 */
	ControlSelectorGenerator.prototype.getSelector = function (mData) {
		var oDomElement = _getDomElement(mData);
		return RecordReplay.findControlSelectorByDOMElement({
				domElement: oDomElement,
				settings: mData.settings
			}).then(function (mSelector) {
				return mSelector;
			});
	};

	function _getDomElement(mData) {
		if (mData.domElementId && typeof mData.domElementId === "string") {
			// mData would contain DOM element ID: when control is selected by clicking on the page
			return document.getElementById(mData.domElementId);
		} else if (mData.controlId) {
			// mDat would contain control ID: when control is selected from the recorder control tree
			return sap.ui.getCore().byId(mData.controlId).getFocusDomRef();
		}
	}

	return new ControlSelectorGenerator();
});
