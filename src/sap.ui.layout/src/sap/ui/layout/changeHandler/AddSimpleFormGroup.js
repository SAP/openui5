/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base', "sap/ui/fl/changeHandler/JsControlTreeModifier"
	], function (Utils, jQuery, Base, JsControlTreeModifier) {
		"use strict";

		/*
		 * Change handler for adding a smart form group.
		 * @alias sap.ui.fl.changeHandler.AddGroup
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.27.0
		 */
		var AddGroup = {};

		/**
		 * Adds a smart form group.
		 *
		 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
		 * @param {sap.ui.layout.SimpleForm} oForm smart form control that matches the change selector for applying the change
         * @param {object} mPropertyBag
         * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
		 * @public
		 */
		AddGroup.applyChange = function (oChangeWrapper, oForm, mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
            var oAppComponent = mPropertyBag.appComponent;

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
				var sLabelText = oChange.texts.groupLabel.value;
				var insertIndex = oChange.content.group.index;
				var oTitle = oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, sGroupId);

				oModifier.setProperty(oTitle, "text", sLabelText);
				oModifier.insertAggregation(oForm, "content", oTitle, insertIndex, oView);

			} else {
				Utils.log.error("Change does not contain sufficient information to be applied: [" + oChange.layer + "]" + oChange.namespace + "/" + oChange.fileName + "." + oChange.fileType);
				//however subsequent changes should be applied
			}

			return true;
		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object to be completed
		 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
         * @param {object} mPropertyBag
         * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
		 * @public
		 */
		AddGroup.completeChangeContent = function (oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
			var oChange = oChangeWrapper.getDefinition();
			var oAppComponent = mPropertyBag.appComponent;

			if (oSpecificChangeInfo.groupLabel) {
				Base.setTextInChange(oChange, "groupLabel", oSpecificChangeInfo.groupLabel, "XFLD");
			} else {
				throw new Error("oSpecificChangeInfo.groupLabel attribute required");
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
				oChange.content.group.index = oSpecificChangeInfo.index;
			}
		};

		/**
		 * Gets the id from the group to be added.
		 *
		 * @param {sap.ui.fl.Change} oChange - addGroup change, which contains the group id within the content
		 * @returns {string} groupId
		 * @public
		 */
		AddGroup.getControlIdFromChangeContent = function (oChange) {
			var sControlId;

			if (oChange && oChange._oDefinition) {
				sControlId = oChange._oDefinition.content.group.id;
			}

			return sControlId;
		};

		return AddGroup;
	}, /* bExport= */true);
