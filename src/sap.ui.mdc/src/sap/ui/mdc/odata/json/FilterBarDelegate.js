/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate", 'sap/base/util/merge', 'sap/ui/mdc/util/IdentifierUtil'
	], function (FilterBarDelegate, merge, IdentifierUtil) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.json.FilterBarDelegate
	 */
	var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);


	JSONFilterBarDelegate._createFilterField = function(oProperty, oFilterBar, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sName = oProperty.path || oProperty.name;
		var oSelector = {};

		if (oFilterBar.getId) {
			oSelector.id = oFilterBar.getId();
		} else {
			oSelector.id = oFilterBar.id;
		}
		var sSelectorId = oModifier.getControlIdBySelector(oSelector, mPropertyBag.appComponent);
		var sId = sSelectorId +  "--filter--" + IdentifierUtil.replace(sName);
		var oFilterField;

		return oModifier.createControl("sap.ui.mdc.FilterField", mPropertyBag.appComponent, mPropertyBag.view, sId, {
			dataType: oProperty.typeConfig.className,
			conditions: "{$filters>/conditions/" + sName + '}',
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		}, true)
		.then(function(oCreatedFilterField) {
			oFilterField = oCreatedFilterField;
			if (oProperty.fieldHelp) {
				var sFieldHelp = oProperty.fieldHelp;
				if (mPropertyBag.view.getId) {
					sFieldHelp = mPropertyBag.view.getId() + "--" + oProperty.fieldHelp;
				} else {
					sFieldHelp = mPropertyBag.viewId + "--" + oProperty.fieldHelp;
				}
				oModifier.setAssociation(oFilterField, "fieldHelp", sFieldHelp);
			}
			if (oProperty.filterOperators) {
				if (oFilterBar.getId) {
					return oModifier.setProperty(oFilterField, "operators", oProperty.filterOperators);
				} else {
					return oModifier.setProperty(oFilterField, "operators", oProperty.filterOperators.join(','));
				}
			}
		})
		.then(function() {
			if (oProperty.tooltip) {
				oModifier.setProperty(oFilterField, "tooltip", oProperty.tooltip);
			}

			if (oProperty.constraints) {
				oModifier.setProperty(oFilterField, "dataTypeConstraints", oProperty.constraints);
			}

			if (oProperty.formatOptions) {
				oModifier.setProperty(oFilterField, "dataTypeFormatOptions", oProperty.formatOptions);
			}

			if (oProperty.display) {
				oModifier.setProperty(oFilterField, "display", oProperty.display);
			}

			return oFilterField;
		});
	};

	JSONFilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		return JSONFilterBarDelegate.fetchProperties().then(function(aProperties) {

			var oProperty = null;
			aProperties.some(function(oPropertyInfo) {
				if (sPropertyName === IdentifierUtil.getPropertyKey(oPropertyInfo)) {
					oProperty = oPropertyInfo;
				}

				return oProperty !== null;
			});

			if (oProperty) {
				return JSONFilterBarDelegate._createFilterField(oProperty, oFilterBar, mPropertyBag);
			}
		});
	};

	/**
	 * Can be used to trigger any necessary follow-up steps on removal of filter items. The returned boolean value inside the Promise can be used to
	 * prevent default follow-up behaviour of Flex.
	 *
	 * @param {sap.ui.mdc.FilterField} oFilterField The mdc.FilterField that was removed
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves with true/false to allow/prevent default behavour of the change
	 */
	JSONFilterBarDelegate.removeItem =  function(oFilterField, oFilterBar, mPropertyBag) {
		// return true within the Promise for default behaviour
		return Promise.resolve(true);
	};

	/**
	 * Fetches the relevant metadata for a given payload and returns property info array.
	 * @param {object} oFilterBar - the instance of filter bar
	 * @returns {Promise} once resolved an array of property info is returned
	 */
	JSONFilterBarDelegate.fetchProperties = function (oFilterBar) {

		return new Promise(function (resolve, reject) {
//			var oSampleProperty = {
//				path: "path",
//				name: 'name',
//				label: 'label',
//				tooltip: 'tooltip',
//				type: "String",
//				hiddenFilter: false,
//				constraints: null,
//				defaultFilterConditions: null,
//				baseType:  new sap.ui.model.type.String(),
//				group: "",
//				groupLabel: "",
//				required: false,
//				visible: true,
//				filterOperators: "EQ",
//				maxConditions: 1,
//				display: "Description"
//			};
			resolve([]);
		});
	};


	return JSONFilterBarDelegate;
});
