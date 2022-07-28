/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function (
	Base,
	JsControlTreeModifier
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
		return aContent.reduce(function(oPreviousPromise, oContent){
			return oPreviousPromise
				.then(function(bReturnValue){
					if (bReturnValue !== undefined) {
						return bReturnValue;
					}
					var sType = oModifier.getControlType(oContent);
					if (aStopToken.indexOf(sType) === -1) {
						return Promise.resolve()
							.then(oModifier.getVisible.bind(oModifier, oContent))
							.then(function(bVisible){
								return bVisible || undefined;
							});
					} else {
						return false;
					}
				});
		}, Promise.resolve());

	};

	var fnMapGroupIndexToContentAggregationIndex = function(oModifier, aStopToken, aContent, iGroupIndex) {
		var oResult;
		var iCurrentGroupIndex = -1;

		// Empty simpleform case, when there are no elements inside the single formContainer
		if (iGroupIndex === 0) {
			return iGroupIndex;
		}
		return fnFirstGroupWithoutTitle(oModifier, aStopToken, aContent)
			.then(function(bFirstGroupWithoutName){
				if (bFirstGroupWithoutName) {
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
			});
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
	 * @return {Promise} Promise resolving when change is applied successfully
	 * @public
	 */
	AddSimpleFormGroup.applyChange = function (oChangeWrapper, oForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var iInsertIndex;

		var oTexts = oChangeWrapper.getTexts();
		var oContent = oChangeWrapper.getContent();
		if (
			oTexts && oTexts.groupLabel && oTexts.groupLabel.value
			&& oContent && oContent.group &&
			(oContent.group.selector || oContent.group.id)
		) {
			var oGroupSelector = oContent.group.selector;
			var sGroupId;
			if (oGroupSelector) {
				if (oGroupSelector.idIsLocal) {
					sGroupId = oAppComponent.createId(oGroupSelector.id);
				} else {
					sGroupId = oGroupSelector.id;
				}
			} else {
				sGroupId = oContent.group.id;
			}
			oChangeWrapper.setRevertData({groupId: sGroupId});
			var sLabelText = oTexts.groupLabel.value;
			var iRelativeIndex;
			return Promise.resolve()
				.then(function(){
					return oModifier.getAggregation(oForm, AddSimpleFormGroup.CONTENT_AGGREGATION);
				})
				.then(function(aContent){
					if (typeof oContent.group.index === "number") {
						// The old code support
						return oContent.group.index;
					} else {
						iRelativeIndex = oContent.group.relativeIndex;
						return fnMapGroupIndexToContentAggregationIndex(oModifier,
							["sap.ui.core.Title", "sap.m.Title", "sap.m.Toolbar", "sap.m.OverflowToolbar"],
							aContent, iRelativeIndex);
					}
				})
				.then(function(iReturnedInsertIndex) {
					iInsertIndex = iReturnedInsertIndex;
					// Check if the change is applicable
					if (oModifier.bySelector(sGroupId, oAppComponent)) {
						return Base.markAsNotApplicable("Control to be created already exists:" + sGroupId);
					}
					return oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, sGroupId);
				})
				.then(function(oTitle) {
					oModifier.setProperty(oTitle, "text", sLabelText);
					return oModifier.insertAggregation(oForm, "content", oTitle, iInsertIndex, oView);
				});
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @public
	 */
	AddSimpleFormGroup.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oContent = {
			group: {}
		};

		if (oSpecificChangeInfo.newLabel) {
			oChange.setText("groupLabel", oSpecificChangeInfo.newLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.newLabel attribute required");
		}
		if (oSpecificChangeInfo.newControlId) {
			oContent.group.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}

		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oContent.group.relativeIndex = oSpecificChangeInfo.index;
		}

		oChange.setContent(oContent);
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

		if (oChange && oChange.getContent()) {
			sControlId = oChange.getContent().group.id;
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
	 * @return {Promise} Promise resolving when change is successfully reverted
	 * @public
	 */
	AddSimpleFormGroup.revertChange = function (oChangeWrapper, oForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var sGroupId = oChangeWrapper.getRevertData().groupId;

		var oGroupSelector = oModifier.getSelector(sGroupId, oAppComponent);
		var oGroup = oModifier.bySelector(oGroupSelector, oAppComponent, oView);
		return Promise.resolve()
			.then(function() {
				return oModifier.removeAggregation(oForm, AddSimpleFormGroup.CONTENT_AGGREGATION, oGroup);
			})
			.then(function() {
				oModifier.destroy(oGroup);
				oChangeWrapper.resetRevertData();
			});
	};

	AddSimpleFormGroup.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oSelector = oChange.getContent().group.selector;
		var oAffectedGroup = JsControlTreeModifier.bySelector(oSelector, oAppComponent).getParent().getId();
		return {
			affectedControls: [oAffectedGroup]
		};
	};

	return AddSimpleFormGroup;
}, /* bExport= */true);
