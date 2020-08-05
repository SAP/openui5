/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseAddViaDelegate"
], function(
	BaseAddViaDelegate
) {
	"use strict";

	var sTypeTitle = "sap.ui.core.Title";
	var sTypeToolBar = "sap.m.Toolbar";
	var sTypeLabel = "sap.m.Label";
	var sTypeSmartLabel = "sap.ui.comp.smartfield.SmartLabel";

	function getIndex(aContent, mPropertyBag) {
		var oChange = mPropertyBag.change;
		var oModifier = mPropertyBag.modifier;
		var mChangeContent = oChange.getContent();
		var insertIndex = mChangeContent.newFieldIndex;

		var oTargetContainerHeader = oChange.getDependentControl("targetContainerHeader", mPropertyBag);

		var iIndexOfHeader = aContent.indexOf(oTargetContainerHeader);
		var iNewIndex = 0;
		var iFormElementIndex = 0;
		// This logic is for insertIndex being a desired index of a form element inside a container
		// However we cannot allow that new fields are added inside other FormElements, therefore
		// we must find the end of the FormElement to add the new FormElement there
		if (aContent.length === 1 || aContent.length === iIndexOfHeader + 1){
			// Empty container (only header or toolbar)
			iNewIndex = aContent.length;
		} else {
			var j = 0;
			for (j = iIndexOfHeader + 1; j < aContent.length; j++){
				var sControlType = oModifier.getControlType(aContent[j]);
				// When the next control is a label (= end of FormElement)
				if (sControlType === sTypeLabel || sControlType === sTypeSmartLabel ){
					if (iFormElementIndex == insertIndex){
						iNewIndex = j;
						break;
					}
					iFormElementIndex++;
				}
				// Next control is a title or toolbar (= end of container)
				if (sControlType === sTypeTitle || sControlType === sTypeToolBar){
					iNewIndex = j;
					break;
				}

				// If there are no more titles, toolbars or labels (= this is the last FormElement) -> insert at end
				if (j === (aContent.length - 1)){
					iNewIndex = aContent.length;
				}
			}
		}
		return iNewIndex;
	}

	function insertLabelAndField(aContent, iNewIndex, mInnerControls) {
		var aContentClone = aContent.slice();
		aContentClone.splice(iNewIndex, 0, mInnerControls.label, mInnerControls.control);
		return aContentClone;
	}

	function recreateContentAggregation(oSimpleForm, aContentClone, oModifier, mPropertyBag) {
		oModifier.removeAllAggregation(oSimpleForm, "content");
			for (var i = 0; i < aContentClone.length; ++i) {
				oModifier.insertAggregation(oSimpleForm,
					"content",
					aContentClone[i],
					i,
					mPropertyBag.view
				);
			}
	}

	/**
	 * Change handler for adding a SmartField or Something from a Delegate to a SimpleForm
	 *
	 * @constructor
	 *
	 * @alias sap.ui.layout.changeHandler.AddSimpleFormField
	 *
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.49.0 This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddSimpleFormField = BaseAddViaDelegate.createAddViaDelegateChangeHandler({
		addProperty : function(mPropertyBag) {
			var oSimpleForm = mPropertyBag.control;

			var mInnerControls = mPropertyBag.innerControls;
			var oModifier = mPropertyBag.modifier;
			var oAppComponent = mPropertyBag.appComponent;

			var oChange = mPropertyBag.change;
			// as the label is stored independent of the field and will not be destroyed by destroying the field, is needs to be remembered
			var oRevertData = oChange.getRevertData();
			oRevertData.labelSelector = oModifier.getSelector(mInnerControls.label, oAppComponent);

			var aContent = oModifier.getAggregation(oSimpleForm, "content");
			var iNewIndex = getIndex(aContent, mPropertyBag);
			var aContentClone = insertLabelAndField(aContent, iNewIndex, mInnerControls);

			recreateContentAggregation(oSimpleForm, aContentClone, oModifier, mPropertyBag);

			if (mInnerControls.valueHelp) {
				oModifier.insertAggregation(
					oSimpleForm,
					"dependents",
					mInnerControls.valueHelp,
					0,
					mPropertyBag.view
				);
			}
		},
		revertAdditionalControls : function(mPropertyBag) {
			var oSimpleForm = mPropertyBag.control;
			var oChange = mPropertyBag.change;
			var oModifier = mPropertyBag.modifier;
			var oAppComponent = mPropertyBag.appComponent;

			var mLabelSelector = oChange.getRevertData().labelSelector;
			if (mLabelSelector) {
				var oLabel = oModifier.bySelector(mLabelSelector, oAppComponent);
				oModifier.removeAggregation(oSimpleForm, "content", oLabel);
				oModifier.destroy(oLabel);
			}
		},
		aggregationName: "content",
		mapParentIdIntoChange: function (oChange, mSpecificChangeInfo, mPropertyBag) {
			var oAppComponent = mPropertyBag.appComponent;
			var oView = mPropertyBag.view;
			var oFormContainer = mPropertyBag.modifier.bySelector(
				mSpecificChangeInfo.parentId,
				oAppComponent,
				oView
			);
			var oTitleOrToolbar = oFormContainer.getTitle() || oFormContainer.getToolbar();
			if (oTitleOrToolbar) {
				oChange.addDependentControl(oTitleOrToolbar.getId(), "targetContainerHeader", mPropertyBag);
			}
		},
		parentAlias: "_", //ensure to take the fallback
		fieldSuffix: "", //no suffix needed
		skipCreateLayout: true, //simple form needs field and label separately
		supportsDefault: true
	});

	return AddSimpleFormField;
},
/* bExport= */true);
