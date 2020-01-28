/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"./../util/ObjectBinding",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_merge"
], function (
	Control,
	ObjectBinding,
	JSONModel,
	Label,
	Fragment,
	_merge
) {
	"use strict";

	/**
	 * @class
	 * Base class for property editor implementations.
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @ui5-restricted
	 */
	var BasePropertyEditor = Control.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor", {
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
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * Fired when the property of the editor has changed
				 */
				valueChange: {
					parameters: {
						/**
						 * Path in the context object where the change should happen
						 */
						path: {type: "string"},
						value: {type: "any"}
					}
				},
				/**
				 * Fired when the editor fragment was loaded and the <code>asyncInit</code> method was executed
				 */
				ready: {}
			}
		},
		/**
		 * Path to the fragment xml that should be loaded for an editor
		*/
		xmlFragment: null,

		constructor: function() {
			Control.prototype.constructor.apply(this, arguments);
			this._oConfigModel = new JSONModel(this.getConfig());
			this._oConfigModel.setDefaultBindingMode("OneWay");
			this.setModel(this._oConfigModel);
			this.setBindingContext(this._oConfigModel.getContext("/"));

			this._loadFragment()
				.then(this.asyncInit.bind(this))
				.then(this.fireReady.bind(this));
		},

		_loadFragment: function () {
			if (!this.xmlFragment) {
				return Promise.resolve();
			}
			return Fragment.load({
				name: this.xmlFragment,
				controller: this
			}).then(function(oEditorControl) {
				this.setContent(oEditorControl);
			}.bind(this));
		},

		/**
		 * Override to execute logic after the editor fragment was loaded
		 */
		asyncInit: function () {
			return Promise.resolve();
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
			var vReturn = this.setProperty("config", _merge({}, oConfig));
			this._initialize();
			return vReturn;
		},

		setModel: function(oModel, sName) {
			var vReturn = Control.prototype.setModel.apply(this, arguments);
			this._initialize();
			return vReturn;
		},

		onValueChange: function(vValue) {
			// FIXME: do not mutate existing JS object! Prefer this.getModel().getData() / this.getModel().setData()
			var oConfig = this.getConfig();
			if (typeof oConfig.value === "undefined" && oConfig.defaultValue) {
				oConfig.value = oConfig.defaultValue;
				this._oConfigModel.checkUpdate();
			}
		},

		getValue: function () {
			return this.getConfig().value;
		},

		_initialize: function() {
			var oConfig = this.getConfig();
			var oJsonModel = this.getModel("_context");
			if (oJsonModel && oConfig) {
				if (oConfig.path && !oConfig.value) {
					oConfig.value = "{context>" + oConfig.path + "}";
				}
				// resolve binding strings
				if (!this._oConfigBinding) {
					this._oConfigBinding = new ObjectBinding();
					this._oConfigBinding.setModel(this.getModel("i18n"), "i18n");
					this._oConfigBinding.setModel(oJsonModel, "context");
					this._oConfigBinding.setBindingContext(oJsonModel.getContext("/"), "context");
					this.bindProperty("visible", "visible");
					this._oConfigBinding.attachChange(function(oEvent) {
						this._oConfigModel.checkUpdate();
						if (oEvent.getParameter("path") === "value") {
							this.onValueChange(oEvent.getParameter("value"));
						}
					}.bind(this));
				}

				this._oConfigBinding.setObject(oConfig);
				//
				this._oConfigModel.setData(oConfig);
				// this._oConfigModel.checkUpdate();
				this.onValueChange(oConfig.value);
			}
		},

		getI18nProperty: function(sName) {
			return this.getModel("i18n").getProperty(sName);
		},

		getLabel: function() {
			var oLabel = this.getAggregation("_label");
			if (!oLabel) {
				oLabel = new Label({
					text: "{label}",
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
				oRm.openStart("div");
				oRm.openEnd();
				oRm.renderControl(oPropertyEditor.getLabel());
				oRm.close("div");
			}
			oRm.renderControl(oPropertyEditor.getContent());
			oRm.close("div");
		},

		fireValueChange: function(vValue) {
			this.fireEvent("valueChange", {
				path: this.getConfig().path,
				value: vValue
			});
		}
	});

	return BasePropertyEditor;
});
