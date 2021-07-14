/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(
	Base,
	JsControlTreeModifier,
	Log,
	jQuery
) {
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
	 * Adds a form group
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied to the control map
	 * @param {sap.ui.layout.form.Form} oForm Form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @returns {Promise} Promise resolving when change is successfully applied
	 * @public
	 */
	AddGroup.applyChange = function(oChange, oForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oChangeDefinition = oChange.getDefinition();

		if (oChangeDefinition.texts
			&& oChangeDefinition.texts.groupLabel
			&& oChangeDefinition.texts.groupLabel.value
			&& oChangeDefinition.content
			&& oChangeDefinition.content.group
			&& (oChangeDefinition.content.group.selector || oChangeDefinition.content.group.id)) {
			var sTitleText = oChangeDefinition.texts.groupLabel.value;
			var iInsertIndex = oChangeDefinition.content.group.index;
			var mNewGroupSelector = oChangeDefinition.content.group.selector || { id : oChangeDefinition.content.group.id };
			var mNewTitleSelector = jQuery.extend({}, mNewGroupSelector);

			mNewTitleSelector.id = mNewTitleSelector.id + "--title"; //same as FormRenderer does it
			oChange.setRevertData({newGroupSelector: mNewGroupSelector});

			// Check if the change is applicable
			if (oModifier.bySelector(mNewTitleSelector, oAppComponent)) {
				return Base.markAsNotApplicable("Control to be created already exists:" + mNewTitleSelector);
			} else if (oModifier.bySelector(mNewGroupSelector, oAppComponent)) {
				return Base.markAsNotApplicable("Control to be created already exists:" + mNewGroupSelector);
			}

			return Promise.resolve()
				.then(function() {
					return Promise.all([
						oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, mNewTitleSelector),
						oModifier.createControl("sap.ui.layout.form.FormContainer", oAppComponent, oView, mNewGroupSelector)
					]);
				})
				.then(function(aControls) {
					var oTitle = aControls[0];
					var oGroup = aControls[1];
					oModifier.setProperty(oTitle, "text", sTitleText);
					return Promise.resolve()
						.then(oModifier.insertAggregation.bind(oModifier, oGroup, "title", oTitle, 0, oView))
						.then(oModifier.insertAggregation.bind(oModifier, oForm, "formContainers", oGroup, iInsertIndex, oView));
				});
		} else {
			Log.error("Change does not contain sufficient information to be applied: ["
				+ oChangeDefinition.layer + "]"
				+ oChangeDefinition.namespace + "/"
				+ oChangeDefinition.fileName + "."
				+ oChangeDefinition.fileType);
			//however subsequent changes should be applied
			return Promise.resolve();
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
	AddGroup.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var	oAppComponent = mPropertyBag.appComponent;

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

	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied to the control map
	 * @param {sap.ui.layout.form.Form} oForm Form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @returns {Promise} Promise resolving when change is successfully reverted
	 * @public
	 */
	AddGroup.revertChange = function (oChange, oForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var mNewGroupSelector = oChange.getRevertData().newGroupSelector;

		var oGroup = oModifier.bySelector(mNewGroupSelector, oAppComponent, oView);

		return Promise.resolve()
			.then(function() {
				return oModifier.removeAggregation(oForm, "formContainers", oGroup);
			})
			.then(function() {
				oModifier.destroy(oGroup);
				oChange.resetRevertData();
			});
	};

	return AddGroup;
},
/* bExport= */true);