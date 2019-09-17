/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"./../utils/ObjectBinding",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/ObjectPath",
	"sap/m/Label"
], function (
	Control,
	ObjectBinding,
	JSONModel,
	ObjectPath,
	Label
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var PropertyEditor = Control.extend("sap.ui.integration.designtime.controls.propertyEditors.BasePropertyEditor", {
		metadata: {
			properties: {
				"renderLabel" : {
					type: "boolean",
					defaultValue: true
				},
				"config": {
					type: "any"
				}
			},
			aggregations: {
				"_label": {
					type: "sap.m.Label",
					visibility: "hidden",
					multiple: false
				},
				"content": {
					type: "sap.ui.core.Control"
				}
			},
			associations: {
				"editor": {
					type: "sap.ui.integration.designtime.BaseEditor",
					multiple: false
				}
			},
			events: {
				propertyChanged: {
					parameters: {
						/**
						 * Path in context object where the change should happen
						 */
						path: {type: "string"},
						value: {type: "any"}
					}
				}
			}
		},

		constructor: function() {
			var vReturn = Control.prototype.constructor.apply(this, arguments);
			this._oConfigModel = new JSONModel({});
			this._oConfigModel.setDefaultBindingMode("OneWay");
			this.setModel(this._oConfigModel);
			this.setBindingContext(this._oConfigModel.getContext("/"));
			return vReturn;
		},

		clone: function() {
			// as content is a public aggregation (to simplify creation of the property editors), we ensure it is not cloned
			// otherwise if PropertyEditor is used as template for the list binding,
			// constructor will be called once for the template and once for the cloned instance
			this.destroyContent();
			return Control.prototype.clone.apply(this, arguments);
		},

		exit: function() {
			this._oConfigModel.destroy();
			if (this._oConfigBinding) {
				this._oConfigBinding.destroy();
			}
		},

		setConfig: function(oConfig) {
			var vReturn = this.setProperty("config", oConfig);
			this._oConfigModel.setData(this.getConfig());
			this._initialize();
			return vReturn;
		},

		setModel: function(oModel, sName) {
			var vReturn = Control.prototype.setModel.apply(this, arguments);
			this._initialize();
			return vReturn;
		},

		onValueChange: function(vValue) {
			var oConfig = this.getConfig();
			if (typeof oConfig.value === "undefined" && oConfig.defaultValue) {
				oConfig.value = oConfig.defaultValue;
				this._oConfigModel.checkUpdate();
			}
		},

		_initialize: function() {
			var oConfig = this.getConfig();
			var oJsonModel = this.getModel("_context");
			if (oJsonModel && oConfig) {
				if (oConfig.path && !oConfig.value) {
					oConfig.value = "{context>" + oConfig.path + "}";
				}
				this._oConfigBinding = new ObjectBinding();
				this._oConfigBinding.setObject(oConfig);
				this._oConfigBinding.setModel(oJsonModel, "context");
				this._oConfigBinding.setBindingContext(oJsonModel.getContext("/"), "context");
				this._oConfigModel.checkUpdate();
				this.onValueChange(oConfig.value);
				this.bindProperty("visible", "visible");
				this._oConfigBinding.attachChange(function(oEvent) {
					this._oConfigModel.checkUpdate();
					if (oEvent.getParameter("path") === "value") {
						this.onValueChange(oEvent.getParameter("value"));
					}
				}.bind(this));
			}
		},

		getEditor: function() {
			return sap.ui.getCore().byId(this.getAssociation("editor"));
		},

		getI18nProperty: function(sName) {
			return	this.getModel("i18n").getProperty(sName);
		},

		getLabel: function() {
			var oLabel = this.getAggregation("_label");
			if (!oLabel) {
				oLabel = new Label({
					text: this.getConfig().label,
					design: "Bold"
				});
				this.setAggregation("_label", oLabel);
			}

			return oLabel;
		},

		renderer: function (oRm, oPropertyEditor) {
			oRm.openStart("div", oPropertyEditor);
			oRm.openEnd();

			if (oPropertyEditor.getRenderLabel() && oPropertyEditor.getLabel()) {
				oRm.renderControl(oPropertyEditor.getLabel());
			}
			oPropertyEditor.getContent().forEach(function(oControl) {
				oRm.renderControl(oControl);
			});

			oRm.close("div");
		},

		firePropertyChanged: function(vValue) {
			this.fireEvent("propertyChanged", {
				path: this.getConfig().path,
				value: vValue
			});
		}
	});

	return PropertyEditor;
});
