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

			this.attachEditorChange(function (oEvent) {
				// FIXME: As soon as the context model is not used inside the wrapper anymore,
				// we should only update the property editor if it was created via a property name
				// and the config has changed

				if (this._sCreatedBy) {
					this._removePropertyEditor(oEvent.getParameter("previousEditor"));
				}
				this._initPropertyEditor();
			});

			this.attachConfigChange(function () {
				if (this._sCreatedBy) {
					this._removePropertyEditor(this.getEditor());
				}

				this._initPropertyEditor();
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
		if (!deepEqual(mPreviousConfig, mConfig)) {
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
		if (this._fnCancelInit) {
			this._fnCancelInit();
		}
		this._removePropertyEditor(this.getEditor());
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditor.prototype._removePropertyEditor = function (oEditor) {
		var oPropertyEditor = this.getAggregation("propertyEditor");


		if (oPropertyEditor) {
			this.setAggregation("propertyEditor", null);
			oPropertyEditor.detachReady(this._onPropertyEditorReady, this);

			// Editor can be undefined only in case of BaseEditor destroy before PropertyEditor destroy
			if (oEditor && this._isAbsolutePath(this._mConfig.path)) {
				oEditor.deregisterPropertyEditor(this, this._mConfig.__propertyName);
			}

			this.setValue(undefined);
			oPropertyEditor.destroy();
			this._sCreatedBy = null;
			this.firePropertyEditorChange({
				propertyEditor: null
			});
		}
	};

	PropertyEditor.prototype.isReady = function () {
		var oNestedEditor = this.getAggregation("propertyEditor");
		return oNestedEditor && oNestedEditor.isReady() || false;
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
				this._fnCancelInit();
				delete this._fnCancelInit;
			}

			this._mConfig = this.getConfig() || this.getEditor().getPropertyConfigByName(this.getPropertyName());
			var sCreatedBy = this.getConfig() ? CREATED_BY_CONFIG : CREATED_BY_PROPERTY_NAME;

			if (this._isAbsolutePath(this._mConfig.path)) {
				this.getEditor().registerPropertyEditor(this, this._mConfig.__propertyName);
			}

			var mPromise = createPromise(function (fnResolve, fnReject) {
				PropertyEditorFactory.create(this._mConfig.type)
					.then(function (oPropertyEditor) {
						oPropertyEditor.setModel(this.getEditor().getModel("i18n"), "i18n");
						oPropertyEditor.setConfig(_omit(_merge({}, this._mConfig), "__propertyName")); // deep clone to avoid editor modifications to influence the outer config
						oPropertyEditor.setValue(this.getValue());

						// TODO: remove after Form layout BLI
						oPropertyEditor.addStyleClass("sapUiTinyMargin");

						oPropertyEditor.attachBeforeValueChange(function (oEvent) {
							this.fireBeforeValueChange(_omit(oEvent.getParameters(), "id"));
						}, this);

						oPropertyEditor.attachValueChange(function (oEvent) {
							this.setValue(oEvent.getParameter("value"));
							this.fireValueChange(_omit(oEvent.getParameters(), "id"));
						}, this);

						this._sCreatedBy = sCreatedBy;
						delete this._fnCancelInit;

						return oPropertyEditor;
					}.bind(this))
					.then(fnResolve)
					.catch(fnReject);
			}.bind(this));

			this._fnCancelInit = mPromise.cancel;

			mPromise.promise.then(function (oPropertyEditor) {
				this.setAggregation("propertyEditor", oPropertyEditor);
				var bRenderLabel = this.getRenderLabel();
				if (bRenderLabel !== undefined) {
					oPropertyEditor.setRenderLabel(bRenderLabel);
				}
				oPropertyEditor.attachReady(this._onPropertyEditorReady, this);
				if (oPropertyEditor.isReady()) { // in case it's already ready
					this.fireReady();
				}

				this.firePropertyEditorChange({
					propertyEditor: oPropertyEditor
				});
			}.bind(this));
		}
	};

	PropertyEditor.prototype._isAbsolutePath = function (sPath) {
		return sPath.startsWith("/");
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
			oNestedEditor.setValue(vValue);
		}
	};

	return PropertyEditor;
});
