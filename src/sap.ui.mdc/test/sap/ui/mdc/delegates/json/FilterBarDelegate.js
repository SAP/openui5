/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	'sap/base/util/merge',
	'sap/ui/mdc/util/IdentifierUtil',
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	"sap/ui/fl/Utils"
], function(Element, FilterBarDelegate, merge, IdentifierUtil, JsControlTreeModifier, FlUtils) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * @author SAP SE
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.json.FilterBarDelegate
	 */
	var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);


	JSONFilterBarDelegate._createFilterField = function(oFilterBar, oProperty, mPropertyBag) {
		var oModifier = mPropertyBag ? mPropertyBag.modifier : JsControlTreeModifier;
		var oAppComponent = mPropertyBag ? mPropertyBag.appComponent : FlUtils.getAppComponentForControl(oFilterBar);
		var oView = (mPropertyBag && mPropertyBag.view ) ? mPropertyBag.view : FlUtils.getViewForControl(oFilterBar);
		var sViewId = mPropertyBag ? mPropertyBag.viewId : null;
		var sName = oProperty.path || oProperty.name;
		var oSelector = {};

		if (oFilterBar.getId) {
			oSelector.id = oFilterBar.getId();
		} else {
			oSelector.id = oFilterBar.id;
		}
		var sSelectorId = oModifier.getControlIdBySelector(oSelector, oAppComponent);
		var sId = sSelectorId +  "--filter--" + IdentifierUtil.replace(sName);
		var oFilterField;

		var oExistingFilterField = Element.getElementById(sId);

		if (oExistingFilterField) {
			return Promise.resolve(oExistingFilterField);
		}

		return oModifier.createControl("sap.ui.mdc.FilterField", oAppComponent, oView, sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sName + '}',
			propertyKey: sName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		}, true)
		.then(function(oCreatedFilterField) {
			oFilterField = oCreatedFilterField;
			if (oProperty.fieldHelp) {
				var sFieldHelp = oProperty.fieldHelp;
				if (!sViewId) { // viewId is only set during xmlTree processing
					sFieldHelp = oView.createId(oProperty.fieldHelp);
				} else {
					sFieldHelp = sViewId + "--" + oProperty.fieldHelp;
				}
				oModifier.setAssociation(oFilterField, "valueHelp", sFieldHelp);
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

	JSONFilterBarDelegate.addItem = function(oFilterBar, sPropertyName, mPropertyBag) {
		return JSONFilterBarDelegate.fetchProperties().then(function(aProperties) {

			var oProperty = null;
			aProperties.some(function(oPropertyInfo) {
				if (sPropertyName === IdentifierUtil.getPropertyKey(oPropertyInfo)) {
					oProperty = oPropertyInfo;
				}

				return oProperty !== null;
			});

			if (oProperty) {
				return JSONFilterBarDelegate._createFilterField(oFilterBar, oProperty, mPropertyBag);
			}
		});
	};


	JSONFilterBarDelegate.removeItem =  function(oFilterBar, sPropertyName, mPropertyBag) {
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
