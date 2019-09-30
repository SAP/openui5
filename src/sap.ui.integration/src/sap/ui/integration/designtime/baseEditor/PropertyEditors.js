/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestEditor"
], function (
	Control,
	findClosestEditor
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var PropertyEditors = Control.extend("sap.ui.integration.designtime.baseEditor.PropertyEditors", {
		metadata: {
			properties: {
				tags: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				propertyEditors: {
					type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor",
					multiple: true,
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

			this.setTags = function () {
				throw new Error("Property `tags` cannot be changed after initialisation");
			};

			this._propagationListener = this._propagationListener.bind(this);
			this.attachEditorChange(this._onEditorChange, this);
		},

		renderer: function (oRm, oControl) {
			var aPropertyEditors = oControl.getAggregation("propertyEditors");
			if (Array.isArray(aPropertyEditors)) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					oRm.renderControl(oPropertyEditor);
				});
			}
		}
	});

	PropertyEditors.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation('editor'));
	};

	PropertyEditors.prototype.setEditor = function (vEditor) {
		var oEditor = this.getEditor();
		this.setAssociation('editor', vEditor);
		var oNextEditor = this.getEditor();
		this.fireEditorChange({
			editor: oEditor,
			nextEditor: oNextEditor
		});
	};

	PropertyEditors.prototype._onEditorChange = function (oEvent) {
		var oNextEditor = oEvent.getParameter('nextEditor');
		if (oNextEditor) {
			this._initPropertyEditors(oNextEditor);
		}
	};

	PropertyEditors.prototype._initPropertyEditors = function (oEditor) {
		var aTags = this.getTags().split(",");
		oEditor.getPropertyEditors(aTags).then(function (aPropertyEditors) {
			if (this.getEditor() === oEditor) { // Just in case editor changes faster than promise is resolved
				this.removeAllAggregation("propertyEditors");
				aPropertyEditors.forEach(function (oPropertyEditor) {
					this.addAggregation("propertyEditors", oPropertyEditor);
				}, this);
			}
		}.bind(this));
	};

	PropertyEditors.prototype._propagationListener = function () {
		var oEditor = findClosestEditor(this.getParent());
		if (oEditor) {
			this.setEditor(oEditor);
			this.removePropagationListener(this._propagationListener);
		}
	};

	PropertyEditors.prototype.setParent = function (oParent) {
		Control.prototype.setParent.apply(this, arguments);

		if (this._bEditorAutoDetect) {
			var oEditor = findClosestEditor(oParent);

			if (oEditor) {
				this.setEditor(oEditor);
			} else {
				this.addPropagationListener(this._propagationListener);
			}
		}
	};

	return PropertyEditors;
});
