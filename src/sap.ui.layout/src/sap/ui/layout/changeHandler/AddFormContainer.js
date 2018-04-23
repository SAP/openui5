/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/core/util/reflection/JsControlTreeModifier"
	], function(FlexUtils, jQuery, Base, JsControlTreeModifier) {
		"use strict";

		/*
		 * Change handler for adding a form group.
		 * @alias sap.ui.layout.changeHandler.AddFormContainer
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.48.0
		 */
		var AddGroup = { };

		/**
		 * Adds a form group.
		 *
		 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
		 * @param {sap.ui.layout.form.Form} oForm Form control that matches the change selector for applying the change
		 * @param {object} mPropertyBag
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 * @public
		 */
		AddGroup.applyChange = function(oChange, oForm, mPropertyBag) {
			var oModifier = mPropertyBag.modifier,
				oAppComponent = mPropertyBag.appComponent,
				oView = mPropertyBag.view,
				oChangeDefinition = oChange.getDefinition();

			if (oChangeDefinition.texts && oChangeDefinition.texts.groupLabel && oChangeDefinition.texts.groupLabel.value && oChangeDefinition.content && oChangeDefinition.content.group && (oChangeDefinition.content.group.selector || oChangeDefinition.content.group.id)) {
				var sTitleText = oChangeDefinition.texts.groupLabel.value,
					iInsertIndex = oChangeDefinition.content.group.index,
					mNewGroupSelector = oChangeDefinition.content.group.selector || { id : oChangeDefinition.content.group.id },
					mNewTitleSelector = jQuery.extend({}, mNewGroupSelector);

				mNewTitleSelector.id = mNewTitleSelector.id + "--title"; //same as FormRenderer does it

				var oTitle = oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, mNewTitleSelector),
					oGroup = oModifier.createControl("sap.ui.layout.form.FormContainer", oAppComponent, oView, mNewGroupSelector);

				oModifier.setProperty(oTitle, "text", sTitleText);
				oModifier.insertAggregation(oGroup, "title", oTitle, 0, oView);
				oModifier.insertAggregation(oForm, "formContainers", oGroup, iInsertIndex, oView);

			} else {
				FlexUtils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
				//however subsequent changes should be applied
			}
		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
		 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
		 * @param {object} mPropertyBag
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent Component in which the change should be applied
		 * @public
		 */
		AddGroup.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
			var oChangeDefinition = oChange.getDefinition(),
				oAppComponent = mPropertyBag.appComponent;

			if (oSpecificChangeInfo.newLabel) {
				Base.setTextInChange(oChangeDefinition, "groupLabel", oSpecificChangeInfo.newLabel, "XFLD");
			} else {
				throw new Error("Cannot create a new group: oSpecificChangeInfo.groupLabel attribute required");
			}
			if (!oChangeDefinition.content) {
				oChangeDefinition.content = {};
			}
			if (!oChangeDefinition.content.group) {
				oChangeDefinition.content.group = {};
			}

			if (oSpecificChangeInfo.index === undefined) {
				throw new Error("Cannot create a new group: oSpecificChangeInfo.index attribute required");
			} else {
				oChangeDefinition.content.group.index = oSpecificChangeInfo.index;
			}

			if ( oSpecificChangeInfo.newControlId ){
				oChangeDefinition.content.group.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
			} else {
				throw new Error("Cannot create a new group: oSpecificChangeInfo.newControlId attribute required");
			}
		};

		return AddGroup;
	},
	/* bExport= */true);
