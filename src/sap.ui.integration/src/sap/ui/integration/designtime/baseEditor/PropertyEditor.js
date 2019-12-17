/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/integration/designtime/baseEditor/util/escapeParameter",
	"sap/base/util/isPlainObject"
], function (
	Control,
	findClosestInstance,
	createPromise,
	escapeParameter,
	isPlainObject
) {
	"use strict";

	var CREATED_BY_CONFIG = "config";
	var CREATED_BY_PROPERTY_NAME = "propertyName";

	/**
	 * @class
	 * Renders one of the {@link sap.ui.integration.designtime.baseEditor.propertyEditor property editors} based on a specified <code>propertyName</code> or custom <code>config</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.baseEditor.PropertyEditor
	 * @author SAP SE
	 * @since 1.73.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.73.0
	 * @ui5-restricted
	 */
	var PropertyEditor = Control.extend("sap.ui.integration.designtime.baseEditor.PropertyEditor", {
		metadata: {
			properties: {
				/**
				 * Property name for which the configuration should be retrieved. The configuration for a specified name will be taken from the {@link sap.ui.integration.designtime.baseEditor.BaseEditor BaseEditor} directly.
				 */
				propertyName: {
					type: "string"
				},

				/**
				 * Indicates whether the embedded <code>BasePropertyEditor</code> should render its label.
				 */
				renderLabel: {
					type: "boolean"
				},

				/**
				 * Custom configuration object. If set, it has priority over <code>propertyName</code>.
				 * Example:
				 * <pre>
				 * {
				 *     "label": "My property",
				 *     "type": "string",
				 *     "path": "header/status/text"
				 * }
				 * </pre>
				 * Where:
				 * <ul>
				 *     <li><b>label</b> = text string for the property editor label</li>
				 *     <li><b>type</b> = one of the registered property editor types in {@link sap.ui.integration.designtime.baseEditor.BaseEditor BaseEditor configuration} (see <code>propertyEditors</code> section)</li>
				 *     <li><b>path</b> = a binding path to get data from</li>
				 * </ul>
				 */
				config: {
					type: "object"
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
				editor: {
					type: "sap.ui.integration.designtime.baseEditor.BaseEditor",
					multiple: false
				}
			},
			events: {
				/**
				 * Fires when the new editor changes.
				 */
				editorChange: {
					parameters: {
						previousEditor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						},
						editor: {
							type: "sap.ui.integration.designtime.baseEditor.BaseEditor"
						}
					}
				},

				/**
				 * Fires when the internal property editor changes, e.g. called after the initial initialization or
				 * after changing the <code>propertyName</code> or <code>config</code> properties.
				 */
				propertyEditorChange: {
					parameters: {
						previousPropertyEditor: {
							type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"
						},
						propertyEditor: {
							type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"
						}
					}
				},

				/**
				 * Fires when <code>config</code> changes.
				 */
				configChange: {
					parameters: {
						previousConfig: {
							type: "object"
						},
						config: {
							type: "object"
						}
					}
				},

				/**
				 * Fires when <code>propertyName</code> changes.
				 */
				propertyNameChange: {
					parameters: {
						previousPropertyName: {
							type: "string"
						},
						propertyName: {
							type: "string"
						}
					}
				}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config

		constructor: function() {
			Control.prototype.constructor.apply(this, escapeParameter(arguments, "config"));

			if (!this.getEditor()) {
				// FIXME: if set later manually => this detection should be disabled
				// if editor is not set explicitly via constructor, we're going to try to find it
				this._bEditorAutoDetect = true;
			}

			this._propagationListener = this._propagationListener.bind(this);

			this.attachEditorChange(function () {
				if (this._sCreatedBy) {
					this._removePropertyEditor();
				}
				this._initPropertyEditor();
			});

			this.attachConfigChange(function (oEvent) {
				if (this._sCreatedBy) {
					this._removePropertyEditor();
				}
				this._initPropertyEditor();
			});

			this.attachPropertyNameChange(function () {
				if (this._sCreatedBy === CREATED_BY_PROPERTY_NAME) {
					this._removePropertyEditor();
				}
				if (this._sCreatedBy !== CREATED_BY_CONFIG) {
					this._initPropertyEditor();
				}
			});

			// init
			this._initPropertyEditor();
		},

		renderer: function (oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.openEnd();

			oRm.renderControl(oControl.getAggregation("propertyEditor"));

			oRm.close("div");
		}
	});

	PropertyEditor.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation("editor"));
	};

	PropertyEditor.prototype.setConfig = function (mConfig) {
		var mPreviousConfig = this.getConfig();
		if (
			mPreviousConfig !== mConfig
			&& (
				!isPlainObject(mPreviousConfig)
				|| !isPlainObject(mConfig)
				|| JSON.stringify(mPreviousConfig) !== JSON.stringify(mConfig)
			)
		) {
			this.setProperty("config", mConfig);
			this.fireConfigChange({
				previousConfig: mPreviousConfig,
				config: mConfig
			});
		}
	};

	PropertyEditor.prototype.setPropertyName = function (sPropertyName) {
		var sPreviousPropertyName = this.getPropertyName();
		if (sPreviousPropertyName !== sPropertyName) {
			this.setProperty("propertyName", sPropertyName);
			this.firePropertyNameChange({
				previousPropertyName: sPreviousPropertyName,
				propertyName: sPropertyName
			});
		}
	};

	PropertyEditor.prototype.setEditor = function (vEditor) {
		var oPreviousEditor = this.getEditor();
		var oEditor = typeof vEditor === "string" ? sap.ui.getCore().byId(vEditor) : vEditor;
		if (oPreviousEditor !== oEditor) {
			this.setAssociation("editor", vEditor);
			var oEditor = this.getEditor();
			this.fireEditorChange({
				previousEditor: oPreviousEditor,
				editor: oEditor
			});
		}
	};

	PropertyEditor.prototype.destroy = function () {
		this._removePropertyEditor();
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditor.prototype._removePropertyEditor = function () {
		var oPropertyEditor = this.getAggregation("propertyEditor");

		if (oPropertyEditor) {
			this.setAggregation("propertyEditor", null);
			switch (this._sCreatedBy) {
				case CREATED_BY_CONFIG:
					oPropertyEditor.destroy();
					break;
				case CREATED_BY_PROPERTY_NAME:
					// Need to manually as there is a bug in removeAllAggregation()
					// when aggregation marked as "multiple: false"
					oPropertyEditor.setParent(null);
					break;
			}
			this._sCreatedBy = null;
			this.firePropertyEditorChange({
				propertyEditor: null
			});
		}
	};

	PropertyEditor.prototype._initPropertyEditor = function () {
		if (
			this.getEditor()
			&& (
				this.getConfig()
				|| (
					!this.getBindingInfo("config") // If there is a binding on config property the value might not arrived yet
					&& this.getPropertyName()
				)
			)
		) {
			var oEditor = this.getEditor();
			// Cancel previous async process if any
			if (this._fnCancelInit) {
				this._fnCancelInit();
				delete this._fnCancelInit;
			}

			var mPromise = createPromise(function (fnResolve, fnReject) {
				var oPromise;
				var sCreatedBy;

				if (this.getConfig()) {
					oPromise = oEditor.createPropertyEditor(this.getConfig());
					sCreatedBy = CREATED_BY_CONFIG;
				} else {
					oPromise = oEditor.getPropertyEditor(this.getPropertyName());
					sCreatedBy = CREATED_BY_PROPERTY_NAME;
				}

				oPromise
					.then(function (oPropertyEditor) {
						var bRenderLabel = this.getRenderLabel();
						if (bRenderLabel !== undefined) {
							oPropertyEditor.setRenderLabel(bRenderLabel);
						}
						this._sCreatedBy = sCreatedBy;
						delete this._fnCancelInit;
						fnResolve(oPropertyEditor);
					}.bind(this))
					.catch(fnReject);
			}.bind(this));

			this._fnCancelInit = mPromise.cancel;

			mPromise.promise.then(function (oPropertyEditor) {
				this.setAggregation("propertyEditor", oPropertyEditor);
				this.firePropertyEditorChange({
					propertyEditor: oPropertyEditor
				});
			}.bind(this));
		}
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
