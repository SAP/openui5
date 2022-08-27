/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/base/util/merge"
], function (
	Control, SegmentedButton, SegmentedButtonItem, merge
) {
	"use strict";

	/**
	 * @class Visualization Base Control
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.fields.viz.VizBase
	 * @author SAP SE
	 * @since 1.105.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.105.0
	 * @ui5-restricted
	 */
	var VizBase = Control.extend("sap.ui.integration.editor.fields.viz.VizBase", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				value: {
					type: "string",
					defaultValue: ""
				},
				editable: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				_control: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			/*
			 * Custom subclasses typically reuse the VizBase renderer 'as is', but still might use
			 * legacy rendering APIs in their applyStyle method. Therefore, the apiVersion cannot
			 * be switched to '2'.
			 */
			apiVersion: 1, // @todo-semantic-rendering for backward compatibility
			render: function (oRm, oVizControl) {
				var oControl = oVizControl.getAggregation("_control");
				oRm.openStart("div", oVizControl);
				oVizControl.applyStyle(oRm);
				oRm.openEnd();
				oRm.renderControl(oControl);
				oRm.close("div");
			}
		}
	});

	VizBase.prototype.init = function () {
		this.onInit();
		this.setAggregation("_control", this._oControl);
	};

	VizBase.prototype.bindProperty = function (sProperty, oBindingInfo) {
		Control.prototype.bindProperty.apply(this, arguments);
		this.bindPropertyToControl(sProperty, oBindingInfo);
		return this;
	};

	// create this._oControl and set up it
	VizBase.prototype.onInit = function () {
	};

	// add style class to the render manager
	VizBase.prototype.applyStyle = function (oRm) {
	};

	// bind propety to this._oControl
	VizBase.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
		if (sProperty === "value") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("value", oControlBindingInfo);
		}
		if (sProperty === "editable") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("editable", oControlBindingInfo);
		}
	};

	return VizBase;
});