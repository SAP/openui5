/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/support/ToolsAPI",
	"sap/ui/test/_ControlFinder"
], function (BaseObject, ToolsAPI, _ControlFinder) {
	"use strict";

	var ControlAPI = BaseObject.extend("sap.ui.testrecorder.inspector.ControlAPI", {});
	var DEFAULT_MODEL = "default";
	var DEFAULT_PATH = "none";

	ControlAPI.prototype.getFrameworkData = function () {
		var frameworkInfo = ToolsAPI.getFrameworkInformation();
		return {
			framework: {
				name: frameworkInfo.commonInformation.frameworkName,
				version: frameworkInfo.commonInformation.version
			}
		};
	};

	ControlAPI.prototype.getAllControlData = function () {
		var renderedControls = ToolsAPI.getRenderedControlTree();
		return {
			renderedControls: renderedControls
		};
	};

	ControlAPI.prototype.getControlData = function (mData) {
		var sControlId;
		if (mData.controlId) {
			// would have control ID e.g. when control is selected from the inspector view control tree
			sControlId = mData.controlId;
		} else if (mData.domElementId) {
			// would have DOM element e.g. when control is selected by clicking on the page
			sControlId = _ControlFinder._getControlForElement(mData.domElementId).getId();
		}

		var aProperties = this._getFormattedProperties(sControlId);
		var aBindings = this._getFormattedBindings(sControlId);

		return {
			properties: aProperties,
			bindings: aBindings
		};
	};

	ControlAPI.prototype._getFormattedProperties = function (sControlId) {
		var aAllProperties = ToolsAPI.getControlProperties(sControlId);
		aAllProperties.own = [aAllProperties.own];
		var mFormattedProperties = {};
		["own", "inherited"].forEach(function (sType) {
			mFormattedProperties[sType] = [];
			aAllProperties[sType].forEach(function (mPropertiesContainer) {
				Object.keys(mPropertiesContainer.properties).forEach(function (sProperty) {
					var mProperty = mPropertiesContainer.properties[sProperty];
					mFormattedProperties[sType].push({
						inheritedFrom: mPropertiesContainer.meta.controlName,
						property: sProperty,
						value: mProperty.value === undefined ? "" : mProperty.value,
						type: mProperty.type
					});
				});
			});
		});

		return mFormattedProperties;
	};

	ControlAPI.prototype._getFormattedBindings = function (sControlId) {
		var aAllbindings = ToolsAPI.getControlBindings(sControlId);
		var sAbsolutePathPrefix = aAllbindings.contextPath ? aAllbindings.contextPath + "/" : "";
		var mSomeProperty = Object.keys(aAllbindings.properties)[0] && aAllbindings.properties[Object.keys(aAllbindings.properties)[0]];
		var sContextModel = mSomeProperty && mSomeProperty.model.names[0] || DEFAULT_MODEL;
		var aFormattedBindings = {
			context: [{
				path: aAllbindings.contextPath || DEFAULT_PATH,
				model: sContextModel
			}],
			properties: [],
			aggregations: []
		};
		Object.keys(aAllbindings.properties).forEach(function (sProperty) {
			var mProperty = aAllbindings.properties[sProperty];
			aFormattedBindings.properties.push({
				property: sProperty,
				relativePath: mProperty.path,
				absolutePath:  sAbsolutePathPrefix + mProperty.path,
				model: mProperty.model.names[0] || DEFAULT_MODEL
			});
		});
		Object.keys(aAllbindings.aggregations).forEach(function (sAggregation) {
			var mAggregationModel = aAllbindings.aggregations[sAggregation].model;
			aFormattedBindings.aggregations.push({
				aggregation: sAggregation,
				relativePath: mAggregationModel.path,
				absolutePath:  sAbsolutePathPrefix + mAggregationModel.path,
				model: mAggregationModel.names[0] || DEFAULT_MODEL
			});
		});

		return aFormattedBindings;
	};

	return new ControlAPI();

}, true);
