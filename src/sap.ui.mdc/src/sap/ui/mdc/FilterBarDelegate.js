/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(["sap/ui/mdc/AggregationBaseDelegate", "sap/ui/mdc/enums/FilterBarValidationStatus"], function(AggregationBaseDelegate, FilterBarValidationStatus) {
	"use strict";
	/**
	 * @class Base Delegate for {@link sap.ui.mdc.FilterBar FilterBar}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.FilterBar FilterBar}.
	 * This class provides method calls, which are called by the <code>FilterBar</code> at specific operations and allows to overwrite an internal behaviour..
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBarDelegate
	 */
	var FilterBarDelegate = Object.assign({}, AggregationBaseDelegate);

	/**
	 * Creates an instance of a filter field control.
	 * <b>Note:</b> The <code>addItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method might be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {string} sPropertyName The name of the property info object/JSON
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility change API
	 *
	 * @returns {Promise<sap.ui.mdc.FilterField>} <code>Promise</code> that resolves with an instance of the implementing {@link sap.ui.mdc.FilterField Control}.
	 * <b>Note:</b>
	 * This method always requires a return value once it has been called. If an item for a given property <code>sPropertyName</code>
	 * has already been created, it must to either return the existing instance or create a new instance.
	 *
	 */
	FilterBarDelegate.addItem = function(oFilterBar, sPropertyName, mPropertyBag) {
		return AggregationBaseDelegate.addItem(oFilterBar, sPropertyName, mPropertyBag);
	};

	/**
	 * Triggers any necessary follow-up steps that need to be taken after the removal of created items via <code>removeItem</code>.
	 * The returned Boolean value inside the <code>Promise</code> can be used to prevent the default follow-up behavior of the SAPUI5 flexibility handling.
	 *
	 * <b>Note:</b>The <code>removeItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method can be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {sap.ui.mdc.FilterField} oFilterField The filter field instance that was removed
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility
	 *
	 * @returns {Promise<boolean>} <code>Promise</code> that resolved with <code>true</code>, <code>false</code> to allow/prevent default behavior of the change
	 */
	FilterBarDelegate.removeItem = function(oFilterBar, oFilterField, mPropertyBag) {
		// return true within the Promise for default behavior
		return AggregationBaseDelegate.removeItem(oFilterBar, oFilterField, mPropertyBag);
	};

	/**
	 * This method is called during the appliance of the add condition change.
	 * The intention is to update the {@link sap.ui.mdc.FilterBarBase#setPropertyInfo propertyInfo} property.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {string} sPropertyName The name of a property
	 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility change API
	 * @returns {Promise} <code>Promise</code> that is resolved once the propertyInfo property has been updated
	 */
	FilterBarDelegate.addCondition = function(oFilterBar, sPropertyName, mPropertyBag) {
		return Promise.resolve();
    };

	/** propertyInfo
	 * This method is called during the appliance of the remove condition change.
	 * The intention is to update the {@link sap.ui.mdc.FilterBarBase#setPropertyInfo propertyInfo} property.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {string} sPropertyName The name of a property
	 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility change API
	 * @returns {Promise} <code>Promise</code> that is resolved once the propertyInfo property has been updated
	 */
	FilterBarDelegate.removeCondition = function(oFilterBar, sPropertyName, mPropertyBag) {
		return Promise.resolve();
    };


	/**
	 * Retrieves the relevant metadata for a given payload and returns the property info array.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @returns {Promise<sap.ui.mdc.filterbar.PropertyInfo[]>} Once resolved, an array of property info objects is returned
	 */
	FilterBarDelegate.fetchProperties = function(oFilterBar) {
		return AggregationBaseDelegate.fetchProperties(oFilterBar);
	};

	/**
	 * This method is called when the Clear button is pressed.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @returns {Promise} <code>Promise</code> that is resolved once the action has been completed
	 */
	FilterBarDelegate.clearFilters = function(oFilterBar) {
		return Promise.resolve();
    };

	/**
	 * A validator to evaluate the filter bar state.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {map} [mValidation] Object describing the validation result. This object is only provided when called from the {@link sap.ui.mdc.FilterBar FilterBar}
	 * @param {string} [mValidation.status] Status of the validation {@link sap.ui.mdc.enums.FilterBarValidationStatus}
	 * @returns {sap.ui.mdc.enums.FilterBarValidationStatus} The inner filter bar state
	 */
    FilterBarDelegate.determineValidationState = function(oFilterBar) {
		 return oFilterBar.checkFilters();
	};

	/**
	 * Visualizes the filter bar validation state.
	 *
	 * @public
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of the filter bar
	 * @param {map} mValidation Describes the validation result. This object is only provided when called from the {@link sap.ui.mdc.FilterBar FilterBar}
	 * @param {sap.ui.mdc.enums.FilterBarValidationStatus} mValidation.status Status of the validation as returned via {@link sap.ui.mdc.filterbar.FilterBarBase#checkValidationState checkValidationState}
	 */
    FilterBarDelegate.visualizeValidationState = function(oFilterBar, mValidation) {
		 var sErrorMessage;

		 if (mValidation.status === FilterBarValidationStatus.NoError) {
			 return;
		 }

		 if (mValidation.status === FilterBarValidationStatus.RequiredHasNoValue) {
			 sErrorMessage = oFilterBar.getText("filterbar.REQUIRED_CONDITION_MISSING");
		 } else if (mValidation.status === FilterBarValidationStatus.FieldInErrorState ) {
			 sErrorMessage = oFilterBar.getText("filterbar.VALIDATION_ERROR");
		 }

		 if (oFilterBar.getShowMessages() && !oFilterBar._isLiveMode() && !oFilterBar._hasOpenMessageBox) {

			 sap.ui.require(["sap/m/MessageBox", "sap/base/Log"], function (MessageBox, Log) {
				 try {

					 if (oFilterBar._bIsBeingDestroyed) {
						 return;
					 }
					 oFilterBar._hasOpenMessageBox = true;
					 MessageBox.error(sErrorMessage, {
						 styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : "",
						 onClose: function() {
							 delete oFilterBar._hasOpenMessageBox;
							 oFilterBar.setFocusOnFirstErroneousField();
						 }
					 });
				 } catch (x) {
					 Log.error(x.message);
				 }
			 });
		 }
	};


	return FilterBarDelegate;
});
