/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance"
], function (
	Control,
	findClosestInstance
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var PropertyEditor = Control.extend("sap.ui.integration.designtime.baseEditor.PropertyEditor", {
		metadata: {
			properties: {
				propertyName: {
					type: "string"
				}
			},
			aggregations: {
				propertyEditor: {
					type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				"editor": {
					type: "sap.ui.integration.designtime.baseEditor.BaseEditor",
					multiple: false
				}
			},
			events: {
				editorChange: {
					parameters: {
						editor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						},
						nextEditor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						}
					}
				}
			}
		},

		_bEditorAutoDetect: false,

		constructor: function() {
			Control.prototype.constructor.apply(this, arguments);

			if (this.getEditor()) {
				this._initPropertyEditor(this.getEditor());
			} else {
				// if editor is not set explicitly via constructor, we're going to try to find it
				this._bEditorAutoDetect = true;
			}

			this.setPropertyName = function () {
				throw new Error("Property `propertyName` cannot be changed after initialisation");
			};

			this._propagationListener = this._propagationListener.bind(this);
			this.attachEditorChange(this._onEditorChange, this);
		},

		renderer: function (oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("propertyEditor"));
		}
	});

	PropertyEditor.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation('editor'));
	};

	PropertyEditor.prototype.setEditor = function (vEditor) {
		var oEditor = this.getEditor();
		this.setAssociation('editor', vEditor);
		var oNextEditor = this.getEditor();
		this.fireEditorChange({
			editor: oEditor,
			nextEditor: oNextEditor
		});
	};

	PropertyEditor.prototype._onEditorChange = function (oEvent) {
		var oNextEditor = oEvent.getParameter('nextEditor');
		if (oNextEditor) {
			this._initPropertyEditor(oNextEditor);
		}
	};

	PropertyEditor.prototype._initPropertyEditor = function (oEditor) {
		oEditor.getPropertyEditor(this.getPropertyName()).then(function (oPropertyEditor) {
			if (this.getEditor() === oEditor) { // Just in case editor changes faster than promise is resolved
				this.setAggregation("propertyEditor", oPropertyEditor);
			}
		}.bind(this));
	};

	PropertyEditor.prototype._propagationListener = function () {
		var oEditor = findClosestInstance(this.getParent(), "sap.ui.integration.designtime.baseEditor.BaseEditor");
		if (oEditor) {
			this.setEditor(oEditor);
			this.removePropagationListener(this._propagationListener);
		}
	};

	PropertyEditor.prototype.setParent = function (oParent) {
		Control.prototype.setParent.apply(this, arguments);

		if (this._bEditorAutoDetect) {
			var oEditor = findClosestInstance(oParent, "sap.ui.integration.designtime.baseEditor.BaseEditor");

			if (oEditor) {
				this.setEditor(oEditor);
			} else {
				this.addPropagationListener(this._propagationListener);
			}
		}
	};

	return PropertyEditor;
});
