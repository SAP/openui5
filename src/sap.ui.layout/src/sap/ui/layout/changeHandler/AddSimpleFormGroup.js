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
		 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
		 * @param {sap.ui.layout.SimpleForm} oForm smart form control that matches the change selector for applying the change
		 * @param {object} mPropertyBag
		 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
		 * @public
		 */
		AddGroup.applyChange = function (oChange, oForm, mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;

			var oChangeDefinition = oChange.getDefinition();
			if (oChangeDefinition.texts && oChangeDefinition.texts.groupLabel && oChangeDefinition.texts.groupLabel.value &&
				oChangeDefinition.content && oChangeDefinition.content.group &&
				(oChangeDefinition.content.group.selector || oChangeDefinition.content.group.id)) {
				var oGroupSelector = oChangeDefinition.content.group.selector;
				var sGroupId;
				if (oGroupSelector) {
					if (oGroupSelector.idIsLocal) {
						sGroupId = oAppComponent.createId(oGroupSelector.id);
					} else {
						sGroupId = oGroupSelector.id;
					}
				} else {
					sGroupId = oChangeDefinition.content.group.id;
				}
				var sLabelText = oChangeDefinition.texts.groupLabel.value;
				var insertIndex = oChangeDefinition.content.group.index;
				var oTitle = oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, sGroupId);

				oModifier.setProperty(oTitle, "text", sLabelText);
				oModifier.insertAggregation(oForm, "content", oTitle, insertIndex, oView);

			} else {
				Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]"
					+ oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
				//however subsequent changes should be applied
			}

			return true;
		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
		 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
		 * @param {object} mPropertyBag
		 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
		 * @public
		 */
		AddGroup.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
			var oChangeDefinition = oChange.getDefinition();
			var oAppComponent = mPropertyBag.appComponent;

			if (oSpecificChangeInfo.groupLabel) {
				Base.setTextInChange(oChangeDefinition, "groupLabel", oSpecificChangeInfo.groupLabel, "XFLD");
			} else {
				throw new Error("oSpecificChangeInfo.groupLabel attribute required");
			}
			if (!oChangeDefinition.content) {
				oChangeDefinition.content = {};
			}
			if (!oChangeDefinition.content.group) {
				oChangeDefinition.content.group = {};
			}
			if (oSpecificChangeInfo.newControlId) {
				oChangeDefinition.content.group.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
			} else {
				throw new Error("oSpecificChangeInfo.newControlId attribute required");
			}
			if (oSpecificChangeInfo.index === undefined) {
				throw new Error("oSpecificChangeInfo.index attribute required");
			} else {
				oChangeDefinition.content.group.index = oSpecificChangeInfo.index;
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
