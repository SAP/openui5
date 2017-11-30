/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/changeHandler/Base"
], function(
	jQuery,
	Base
) {
	"use strict";

	/**
	 * Change handler for adding XML
	 *
	 * @alias sap.ui.fl.changeHandler.AddXML
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.54
	 * @private
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddXML = {};

	/**
	 * Adds the content of the XML fragment to the given aggregation of the control, if valid.
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.view Root view
	 * @param {object} mPropertyBag.appComponent App component
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXML#applyChange
	 */
	AddXML.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sAggregationName = oChangeDefinition.content.aggregation;
		var oFragment = oChangeDefinition.content.fragment;
		var iIndex = oChangeDefinition.content.index || 0;
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;

		var oNewControl;
		try {
			if (oView) {
				oNewControl = sap.ui.xmlfragment(oModifier.getId(oView), oFragment);
			} else {
				oNewControl = sap.ui.xmlfragment(oFragment);
			}
		} catch (oError) {
			throw new Error("The XML Fragment could not be instantiated");
		}

		var oAggregationDefinition = oModifier.findAggregation(oControl, sAggregationName);
		if (!oAggregationDefinition) {
			throw new Error("The given Aggregation is not available in the given control.");
		}

		if (!oModifier.validateType(oNewControl, oAggregationDefinition, oControl)) {
			throw new Error("The Control does not match the type of the aggregation.");
		}

		oModifier.addXML(oControl, sAggregationName, iIndex, oNewControl, oView, oComponent);
		oChange.setRevertData(oNewControl.getId());
	};

	/**
	 * Restores the previous state of the control, removing the content of the fragment
	 * from the aggregation
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {boolean} Returns true if change has been reverted successfully
	 * @public
	 */
	AddXML.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sAggregationName = oChangeDefinition.content.aggregation;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		oModifier.removeAggregation(oControl, sAggregationName, oModifier.bySelector(oChange.getRevertData(), oAppComponent, oView));

		oChange.resetRevertData();
		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXML#completeChangeContent
	 */
	AddXML.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		var oChangeDefinition = oChange.getDefinition();

		var _throwError = function(sAttribute) {
			throw new Error("Attribute missing from the change specific content'" + sAttribute + "'");
		};

		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}

		if (oSpecificChangeInfo.fragment) {
			oChangeDefinition.content.fragment = oSpecificChangeInfo.fragment;
		} else {
			_throwError("fragmemt");
		}

		if (oSpecificChangeInfo.aggregation) {
			oChangeDefinition.content.aggregation = oSpecificChangeInfo.aggregation;
		} else {
			_throwError("aggregation");
		}

		if (oSpecificChangeInfo.index) {
			oChangeDefinition.content.index = oSpecificChangeInfo.index;
		}
	};

	return AddXML;
}, /* bExport= */true);
