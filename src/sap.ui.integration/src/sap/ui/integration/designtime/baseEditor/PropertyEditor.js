/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/integration/designtime/baseEditor/util/escapeParameter",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/deepEqual"
], function (
	Control,
	findClosestInstance,
	createPromise,
	escapeParameter,
	PropertyEditorFactory,
	_merge,
	_omit,
	deepEqual
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
			library: "sap.ui.integration",
			interfaces : ["sap.ui.core.IFormContent"],
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
				 * Nested editor value
				 */
				value: {
					type: "any"
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
				},

				/**
				 * Fires when nested property editor is ready.
				 */
				ready: {},

				/**
				 * Fires when the error state of the nested property editor changes
				 */
				 validationErrorChange: {
					parameters: {
						/**
						 * Whether there is an error in the nested editor
						 * @since 1.96.0
						 */
						hasError: { type: "boolean" }
					}
				},

				/**
				 * Fires before the value of the nested property editor changes
				 */
				beforeValueChange: {
					parameters: {
						path: {
							type: "string"
						},
						value: {
							type: "any"
						},
						nextValue: {
							type: "any"
						}
					}
				},

				/**
				 * Fires when the value of the nested property editor changes
				 */
				valueChange: {
					parameters: {
						path: {
							type: "string"
						},
						value: {
							type: "any"
						},
						previousValue: {
							type: "any"
						}
					}
				},

				/**
				 * Fires when the designtime metadata of the nested property editor changes
				 */
				designtimeMetadataChange: {
					parameters: {
						path: {
							type: "string"
						},
						value: {
							type: "any"
						},
						previousValue: {
							type: "any"
						}
					}
				},

				/**
				 * Fires when the wrapper is initialized.
				 */
				init: {}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config

		constructor: function () {
			Control.prototype.constructor.apply(
				this,
				escapeParameter(arguments, function (oValue, sPropertyName) {
					return (
						sPropertyName === "config"
						&& PropertyEditorFactory.hasType(oValue.type)
					);
				})
			);

			if (!this.getEditor()) {
				// FIXME: if set later manually => this detection should be disabled
				// if editor is not set explicitly via constructor, we're going to try to find it
				this._bEditorAutoDetect = true;
			}

			this._propagationListener = this._propagationListener.bind(this);

			this.attachEditorChange(function (oEvent) {
				// FIXME: As soon as the context model is not used inside the wrapper anymore,
				// we should only update the property editor if it was created via a property name
				// and the config has changed

				if (this._sCreatedBy) {
					this._removePropertyEditor(oEvent.getParameter("previousEditor"));
				}
				this._initPropertyEditor();
			});

			this.attachConfigChange(function (oEvent) {
				var oPreviousConfig = oEvent.getParameter("previousConfig");
				var oConfig = oEvent.getParameter("config");
				var oNestedEditor = this.getAggregation("propertyEditor");

				// Recreate the editor if the old editor cannot handle the config change internally
				if (
					this._fnCancelInit
					|| !oNestedEditor
					|| !oPreviousConfig
					|| !oConfig
					|| oPreviousConfig.type !== oConfig.type
					|| oPreviousConfig.path !== oConfig.path
				) {
					this._removePropertyEditor(this.getEditor());
					this._initPropertyEditor();
				} else {
					oNestedEditor.setConfig(oConfig);
					if (oConfig.visible !== false && oPreviousConfig.visible === false) {
						// If editor just got activated, make sure the value is up-to-date
						oNestedEditor.setValue(this.getValue());
					}
				}
			});

			this.attachPropertyNameChange(function () {
				if (this._sCreatedBy === CREATED_BY_PROPERTY_NAME) {
					this._removePropertyEditor(this.getEditor());
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
			oRm.addStyle("display", "inline-block");
			oRm.addStyle("width", "100%");
			oRm.openEnd();

			oRm.renderControl(oControl.getAggregation("propertyEditor"));

			oRm.close("div");
		}
	});

	PropertyEditor.prototype.init = function () {
		Promise.resolve().then(function () {
			this.fireInit();
		}.bind(this));
	};

	PropertyEditor.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation("editor"));
	};

	PropertyEditor.prototype._prepareConfig = function(oConfig) {
		var oBaseEditor = this.getEditor();
		var oEditorConfig = (oConfig.type && oBaseEditor)
			? (oBaseEditor.getConfig().propertyEditorConfigs || {})[oConfig.type]
			: {};
		return _merge({}, oEditorConfig, oConfig);
	};

	PropertyEditor.prototype.setConfig = function (mConfig) {
		var mPreviousConfig = this.getConfig();
		var mNextConfig = mConfig && _merge(
			{},
			// Default for non-managed editors with absolute path to avoid
			// unnecessary config changes after registration
			{
				designtime: undefined
			},
			this._prepareConfig(mConfig)
		);

		if (!deepEqual(mPreviousConfig, mNextConfig)) {
			this.setProperty("config", mNextConfig);
			this.fireConfigChange({
				previousConfig: mPreviousConfig,
				config: mNextConfig
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
			// Make sure to refresh config as the editor defaults might have changed
			this.setConfig(this.getConfig());
		}
	};

	PropertyEditor.prototype.destroy = function () {
		this._removePropertyEditor(this.getEditor());
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditor.prototype._cleanupCancelledInit = function (oPropertyEditor) {
		oPropertyEditor.destroy();
	};

	PropertyEditor.prototype._removePropertyEditor = function (oEditor) {
		var oPropertyEditor = this.getAggregation("propertyEditor");

		if (this._fnCancelInit) {
			this._fnCancelInit().then(this._cleanupCancelledInit);
			delete this._fnCancelInit;
		}

		if (oPropertyEditor) {
			this.setAggregation("propertyEditor", null);
			oPropertyEditor.detachReady(this._onPropertyEditorReady, this);
			oPropertyEditor.detachValidationErrorChange(this._onPropertyEditorError, this);
			oPropertyEditor.destroy();
			this._sCreatedBy = null;
			this.firePropertyEditorChange({
				propertyEditor: null
			});
		}

		// Editor can be undefined only in case of BaseEditor destroy before PropertyEditor destroy
		if (oEditor && this._mConfig && this._isAbsolutePath(this._mConfig.path)) {
			oEditor.deregisterPropertyEditor(this, this._mConfig.__propertyName);
		}
	};

	PropertyEditor.prototype.isReady = function () {
		var oNestedEditor = this.getAggregation("propertyEditor");
		return oNestedEditor && oNestedEditor.isReady() || false;
	};

	PropertyEditor.prototype.hasError = function () {
		var oNestedEditor = this.getAggregation("propertyEditor");
		return oNestedEditor && oNestedEditor.hasError();
	};

	PropertyEditor.prototype.ready = function () {
		return new Promise(function (resolve) {
			var fnCheckPropertyEditorReady = function (oNestedEditor) {
				oNestedEditor.ready().then(resolve);
			};
			var oNestedEditor = this.getAggregation("propertyEditor");
			if (oNestedEditor) {
				fnCheckPropertyEditorReady(oNestedEditor);
			} else {
				var fnWaitForNestedEditor = function (oEvent) {
					var oNestedEditor = oEvent.getParameter("propertyEditor");
					if (oNestedEditor) {
						this.detachPropertyEditorChange(fnWaitForNestedEditor, this);
						fnCheckPropertyEditorReady(oNestedEditor);
					}
				};
				this.attachPropertyEditorChange(fnWaitForNestedEditor, this);
			}
		}.bind(this));
	};

	PropertyEditor.prototype._onPropertyEditorReady = function () {
		this.fireReady();
	};

	PropertyEditor.prototype._onPropertyEditorError = function (oEvent) {
		this.fireValidationErrorChange({
			hasError: oEvent.getParameter("hasError")
		});
	};

	PropertyEditor.prototype._initPropertyEditor = function () {
		// FIXME: A reference to the BaseEditor is still required in the current solution
		// in order to set the models on the BasePropertyEditor
		// Remove once the config is resolved before passing it to the editor
		if (!this.getEditor()) {
			return;
		}

		if (
			this.getConfig()
			|| (
				!this.getBindingInfo("config") // If there is a binding on config property the value might not arrived yet
				&& this.getPropertyName()
				&& this.getEditor()
			)
		) {
			// Cancel previous async process if any
			if (this._fnCancelInit) {
				this._fnCancelInit().then(this._cleanupCancelledInit);
				delete this._fnCancelInit;
			}

			this._mConfig = this.getConfig() || this.getEditor().getPropertyConfigByName(this.getPropertyName());
			var sCreatedBy = this.getConfig() ? CREATED_BY_CONFIG : CREATED_BY_PROPERTY_NAME;

			var mPromise = createPromise(function (fnResolve, fnReject) {
				PropertyEditorFactory.create(this._mConfig.type).then(fnResolve).catch(fnReject);
			}.bind(this));

			this._fnCancelInit = mPromise.cancel;

			if (this._isAbsolutePath(this._mConfig.path)) {
				this.getEditor().registerPropertyEditor(this, this._mConfig.__propertyName);
			}

			mPromise.promise.then(function (oPropertyEditor) {
				oPropertyEditor.setModel(this.getEditor().getModel("i18n"), "i18n");
				oPropertyEditor.setConfig(_omit(_merge({}, this._mConfig), "__propertyName")); // deep clone to avoid editor modifications to influence the outer config

				oPropertyEditor.attachBeforeValueChange(function (oEvent) {
					this.fireBeforeValueChange(_omit(oEvent.getParameters(), "id"));
				}, this);

				oPropertyEditor.attachValueChange(function (oEvent) {
					this.setValue(oEvent.getParameter("value"));
					this.fireValueChange(_omit(oEvent.getParameters(), "id"));
				}, this);

				oPropertyEditor.attachDesigntimeMetadataChange(function (oEvent) {
					this.fireDesigntimeMetadataChange(_omit(oEvent.getParameters(), "id"));
				}, this);

				oPropertyEditor.setValue(this.getValue(), true);

				this._sCreatedBy = sCreatedBy;

				this.setAggregation("propertyEditor", oPropertyEditor);
				var bRenderLabel = this.getRenderLabel();
				if (bRenderLabel !== undefined) {
					oPropertyEditor.setRenderLabel(bRenderLabel);
				}
				oPropertyEditor.attachReady(this._onPropertyEditorReady, this);
				if (oPropertyEditor.isReady()) { // in case it's already ready
					this.fireReady();
				}

				oPropertyEditor.attachValidationErrorChange(this._onPropertyEditorError, this);
				if (oPropertyEditor.hasError()) {
					this.fireValidationErrorChange({
						hasError: true
					});
				}

				this.firePropertyEditorChange({
					propertyEditor: oPropertyEditor
				});
				delete this._fnCancelInit;
			}.bind(this));
		}
	};

	PropertyEditor.prototype._isAbsolutePath = function (sPath) {
		return sPath && sPath.startsWith("/");
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

	PropertyEditor.prototype.setRenderLabel = function (bRenderLabel) {
		this.setProperty("renderLabel", bRenderLabel);
		var oNestedEditor = this.getAggregation("propertyEditor");
		if (oNestedEditor) {
			oNestedEditor.setRenderLabel(bRenderLabel);
		}
	};

	PropertyEditor.prototype.getContent = function () {
		var oNestedEditor = this.getAggregation("propertyEditor");
		return oNestedEditor && oNestedEditor.getContent();
	};

	PropertyEditor.prototype.setValue = function (vValue) {
		this.setProperty("value", vValue);

		var oNestedEditor = this.getAggregation("propertyEditor");
		if (oNestedEditor) {
			oNestedEditor.setValue(vValue, true);
		}
	};

	PropertyEditor.prototype.getRuntimeConfig = function () {
		return this._mConfig;
	};

	PropertyEditor.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		var oParent = this.getParent();

		if (oParent && oParent.enhanceAccessibilityState) {
			// use Field as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}
	};

	PropertyEditor.prototype.getFocusDomRef = function() {
		var oNestedEditor = this.getAggregation("propertyEditor");

		if (oNestedEditor) {
			return oNestedEditor.getFocusDomRef();
		}
	};

	PropertyEditor.prototype.getIdForLabel = function() {
		var oNestedEditor = this.getAggregation("propertyEditor");

		if (oNestedEditor) {
			return oNestedEditor.getIdForLabel();
		}
	};

	return PropertyEditor;
});
