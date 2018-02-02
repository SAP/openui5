/*!
 * ${copyright}
 */

// Provides control sap.ui.dt.test.report.Statistic.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/model/json/JSONModel',
	'sap/ui/layout/form/SimpleForm',
	"sap/m/Label",
	"sap/m/Text",
	"./StatisticRenderer"
],
function(
	jQuery,
	Control,
	JSONModel,
	SimpleForm,
	Label,
	Text,
	StatisticRenderer
) {
"use strict";



	/**
	 * Constructor for a new Statistic report.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Statistic report can be used to visualize the design time tests.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.test.report.Statistic
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var oStatistic = Control.extend("sap.ui.dt.test.report.Statistic", /** @lends sap.ui.dt.test.report.Statistic.prototype */ { metadata : {
		properties : {
			data : {
				type : "object"
			}
		},
		aggregations : {
			"_form" : {
				type : "sap.ui.layout.form.SimpleForm",
				hidden : true,
				multiple : false
			}
		}
	},


	init : function() {
		this._oModel = null;
		this.setAggregation("_form", this._createForm());
	},

	/**
	 * Called when the Statistic is destroyed
	 * @protected
	 */
	exit : function() {
		this.setData(null);
	},

	setData : function(oData) {
		if (this._oModel) {
			this._oModel.destroy();
			delete this._oModel;
		}
		if (oData) {
			this._oModel = new JSONModel(oData);
			this._getForm().setModel(this._oModel);
		} else {
			this._getForm().setModel(null);
		}
		this.setProperty("data", oData);
	},


	_createForm : function() {
		var oForm = new sap.ui.layout.form.SimpleForm(this.getId() + "--form", {
			editable : false,
			title : "Statistics",
			content : [
				new Label(this.getId() + "--form-supported-label", {text: "Supported"}),
				new Text(this.getId() + "--form-supported-value", {text: "{/statistic/SUPPORTED}"}),
				new Label(this.getId() + "--form-partial-supported-label", {text: "Partial Supported"}),
				new Text(this.getId() + "--form-partial-supported-value", {text: "{/statistic/PARTIAL_SUPPORTED}"}),
				new Label(this.getId() + "--form-not-supported-label", {text: "Not Supported"}),
				new Text(this.getId() + "--form-not-supported-value", {text: "{/statistic/NOT_SUPPORTED}"}),
				new Label(this.getId() + "--form-unknown-label", {text: "Unknown"}),
				new Text(this.getId() + "--form-unknown-value", {text: "{/statistic/UNKNOWN}"}),
				new Label(this.getId() + "--form-error-label", {text: "Error"}),
				new Text(this.getId() + "--form-error-value", {text: "{/statistic/ERROR}"})
			]
		});
		return oForm;
	},

	_getForm : function() {
		return this.getAggregation("_form");
	}
});

	return oStatistic;

}, /* bExport= */ true);
