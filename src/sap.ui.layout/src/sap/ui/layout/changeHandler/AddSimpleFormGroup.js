/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/base/Log"
], function (
	Base,
	JsControlTreeModifier,
	Log
) {
	"use strict";

	/*
		* Change handler for adding a simple form group.
		* @alias sap.ui.layout.changeHandler.AddSimpleFormGroup
		* @author SAP SE
		* @version ${version}
		* @experimental Since 1.27.0
		*/
	var AddSimpleFormGroup = {};

	AddSimpleFormGroup.CONTENT_AGGREGATION = "content";

	var fnFirstGroupWithoutTitle = function(oModifier, aStopToken, aContent) {
		for (var i = 0; i < aContent.length; i++) {
			var sType = oModifier.getControlType(aContent[i]);
			if (aStopToken.indexOf(sType) === -1) {
				if (oModifier.getVisible(aContent[i])) {
					return true;
				}
			} else {
				return false;
			}
		}
	};

	var fnMapGroupIndexToContentAggregationIndex = function(oModifier, aStopToken, aContent, iGroupIndex) {
		var oResult;
		var iCurrentGroupIndex = -1;

		// Empty simpleform case, when there are no elements inside the single formContainer
		if (iGroupIndex === 0) {
			return iGroupIndex;
		}

		if (fnFirstGroupWithoutTitle(oModifier, aStopToken, aContent)) {
			iCurrentGroupIndex++;
		}

		for (var i = 0; i < aContent.length; i++) {
			var sType = oModifier.getControlType(aContent[i]);
			if (aStopToken.indexOf(sType) > -1) {
				iCurrentGroupIndex++;
				if (iCurrentGroupIndex === iGroupIndex) {
					oResult = aContent[i];
					return aContent.indexOf(oResult);
				}
			}
		}
		return aContent.length;
	};

	/**
	 * Adds a smart form group
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change wrapper object with instructions to be applied to the control map
	 * @param {sap.ui.layout.SimpleForm} oForm Smart form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddSimpleFormGroup.applyChange = function (oChangeWrapper, oForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent,
			oTitle;

		var oChange = oChangeWrapper.getDefinition();
		if (oChange.texts && oChange.texts.groupLabel && oChange.texts.groupLabel.value &&
			oChange.content && oChange.content.group &&
			(oChange.content.group.selector || oChange.content.group.id)) {
			var oGroupSelector = oChange.content.group.selector;
			var sGroupId;
			if (oGroupSelector) {
				if (oGroupSelector.idIsLocal) {
					sGroupId = oAppComponent.createId(oGroupSelector.id);
				} else {
					sGroupId = oGroupSelector.id;
				}
			} else {
				sGroupId = oChange.content.group.id;
			}
			oChangeWrapper.setRevertData({groupId: sGroupId});
			var sLabelText = oChange.texts.groupLabel.value;

			var aContent = oModifier.getAggregation(oForm, AddSimpleFormGroup.CONTENT_AGGREGATION);

			var iInsertIndex;
			var iRelativeIndex;

			if (typeof oChange.content.group.index === "number") {
				// The old code support
				iInsertIndex = oChange.content.group.index;
			} else {
				iRelativeIndex = oChange.content.group.relativeIndex;
				iInsertIndex = fnMapGroupIndexToContentAggregationIndex(oModifier,
					["sap.ui.core.Title", "sap.m.Title", "sap.m.Toolbar", "sap.m.OverflowToolbar"],
					aContent, iRelativeIndex);
			}

			// Check if the change is applicable
			if (oModifier.bySelector(sGroupId, oAppComponent)) {
				return Base.markAsNotApplicable("Control to be created already exists:" + sGroupId);
			}
			oTitle = oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, sGroupId);

			oModifier.setProperty(oTitle, "text", sLabelText);
			oModifier.insertAggregation(oForm, "content", oTitle, iInsertIndex, oView);

		} else {
			Log.error("Change does not contain sufficient information to be applied: [" + oChange.layer + "]" + oChange.namespace + "/" + oChange.fileName + "." + oChange.fileType);
			//however subsequent changes should be applied
		}

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @public
	 */
	AddSimpleFormGroup.completeChangeContent = function (oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChange = oChangeWrapper.getDefinition();
		var oAppComponent = mPropertyBag.appComponent;

		if (oSpecificChangeInfo.newLabel) {
			Base.setTextInChange(oChange, "groupLabel", oSpecificChangeInfo.newLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.newLabel attribute required");
		}
		if (!oChange.content) {
			oChange.content = {};
		}
		if (!oChange.content.group) {
			oChange.content.group = {};
		}
		if (oSpecificChangeInfo.newControlId) {
			oChange.content.group.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}

		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oChange.content.group.relativeIndex = oSpecificChangeInfo.index;
		}
	};

	/**
	 * Gets the id from the group to be added.
	 *
	 * @param {sap.ui.fl.Change} oChange - addSimpleFormGroup change, which contains the group id within the content
	 * @returns {string} groupId
	 * @public
	 */
	AddSimpleFormGroup.getControlIdFromChangeContent = function (oChange) {
		var sControlId;

		if (oChange && oChange._oDefinition) {
			sControlId = oChange._oDefinition.content.group.id;
		}

		return sControlId;
	};

	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change wrapper object with instructions to be applied to the control map
	 * @param {sap.ui.layout.SimpleForm} oForm Smart form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddSimpleFormGroup.revertChange = function (oChangeWrapper, oForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var sGroupId = oChangeWrapper.getRevertData().groupId;

		var oGroupSelector = oModifier.getSelector(sGroupId, oAppComponent);
		var oGroup = oModifier.bySelector(oGroupSelector, oAppComponent, oView);
		oModifier.removeAggregation(oForm, AddSimpleFormGroup.CONTENT_AGGREGATION, oGroup);
		oModifier.destroy(oGroup);
		oChangeWrapper.resetRevertData();

		return true;
	};

	return AddSimpleFormGroup;
}, /* bExport= */true);
