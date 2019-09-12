/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Label"
], function (
	Control,
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

		getEditor: function() {
			return sap.ui.getCore().byId(this.getAssociation("editor"));
		},

		getPropertyInfo: function() {
			var oBindingContext = this.getBindingContext();
			if (oBindingContext) {
				return oBindingContext.getObject();
			} else {
				return {};
			}
		},

		getI18nProperty: function(sName) {
			return	this.getModel("i18n").getProperty(sName);
		},

		getLabel: function() {
			var oLabel = this.getAggregation("_label");
			if (!oLabel) {
				oLabel = new Label({
					text: this.getPropertyInfo().label,
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
				path: this.getPropertyInfo().path,
				value: vValue
			});
		}
	});

	return PropertyEditor;
});
