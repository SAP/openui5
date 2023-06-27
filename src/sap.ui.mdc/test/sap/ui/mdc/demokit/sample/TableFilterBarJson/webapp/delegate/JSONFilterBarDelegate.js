sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/demokit/sample/TableFilterBarJson/webapp/model/metadata/JSONPropertyInfo",
	"sap/base/util/merge",
	"sap/ui/mdc/util/IdentifierUtil",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function (Core, FilterBarDelegate, JSONPropertyInfo, merge, IdentifierUtil, JsControlTreeModifier, FlUtils) {
	"use strict";

	var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate._createValueHelp = function(sName, oView, sViewId) {
		var sValueHelp = sName + "-vh";
		if (!sViewId) { // viewId is only set during xmlTree processing
			sValueHelp = oView.createId(sValueHelp);
		} else {
			sValueHelp = sViewId + "--" + sValueHelp;
		}
		return sValueHelp;
	};

	JSONFilterBarDelegate._createFilterField = function(oProperty, oFilterBar, mPropertyBag) {
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

		var oExistingFilterField = sap.ui.getCore().byId(sId);

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
			if (sName === "name" || sName === "range") {
				oModifier.setAssociation(oFilterField, "valueHelp", JSONFilterBarDelegate._createValueHelp(sName, oView, sViewId));
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
				return JSONFilterBarDelegate._createFilterField(oProperty, oFilterBar, mPropertyBag);
			}
		});
	};


	JSONFilterBarDelegate.removeItem =  function(oFilterBar, sPropertyName, mPropertyBag) {
		return Promise.resolve(true);
	};

	JSONFilterBarDelegate.fetchProperties = function (oFilterBar) {
		return Promise.resolve(JSONPropertyInfo);
	};

	return JSONFilterBarDelegate;
});