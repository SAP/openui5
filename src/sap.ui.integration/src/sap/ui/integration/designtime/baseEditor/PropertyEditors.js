/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise"
], function (
	Control,
	findClosestInstance,
	createPromise
) {
	"use strict";

	var CREATED_BY_CONFIG = "config";
	var CREATED_BY_TAGS = "tags";

	/**
	 * @class
	 * Renders a group of {@link sap.ui.integration.designtime.baseEditor.propertyEditor property editors} based on specified <code>tags</code> or custom <code>config</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.baseEditor.PropertyEditors
	 * @author SAP SE
	 * @since 1.73.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.73.0
	 * @ui5-restricted
	 */
	var PropertyEditors = Control.extend("sap.ui.integration.designtime.baseEditor.PropertyEditors", {
		metadata: {
			properties: {
				/**
				 * List of tags to render, e.g. <code>"header,content"</code>. Only the properties that contain both tags will be rendered.
				 */
				tags: {
					type: "any"
				},

				/**
				 * Indicates whether the embedded <code>BasePropertyEditor</code> instances should render their labels.
				 */
				renderLabels: {
					type: "boolean"
				},

				/**
				 * An array of custom configuration objects. If set, it has priority over <code>tags</code>.
				 * Example:
				 * <pre>
				 * [
				 *     {
				 *         "label": "My property 1",
				 *         "type": "string",
				 *         "path": "path/to/my/property1"
				 *     },
				 *     {
				 *         "label": "My property 2",
				 *         "type": "string",
				 *         "path": "path/to/my/property2"
				 *     }
				 * ]
				 * </pre>
				 * Where:
				 * <ul>
				 *     <li><b>label</b> = text string for the property editor label</li>
				 *     <li><b>type</b> = one of the registered property editors types in {@link sap.ui.integration.designtime.baseEditor.BaseEditor BaseEditor configuration} (see <code>propertyEditors</code> section)</li>
				 *     <li><b>path</b> = a binding path to get data from</li>
				 * </ul>
				 */
				config: {
					type: "array"
				}
			},
			aggregations: {
				propertyEditors: {
					type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor",
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
				 * Fires when the internal <code>propertyEditors</code> aggregation changes, e.g. called after the initial initialization or
				 * after changing <code>tag</code> or <code>config</code> properties.
				 */
				propertyEditorsChange: {
					parameters: {
						previousPropertyEditors: {
							type: "sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"
						},
						propertyEditors: {
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
							type: "array"
						},
						config: {
							type: "array"
						}
					}
				},

				/**
				 * Fires when <code>tags</code> changes.
				 */
				tagsChange: {
					parameters: {
						previousTags: {
							type: "string"
						},
						tags: {
							type: "string"
						}
					}
				}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config

		constructor: function() {
			Control.prototype.constructor.apply(this, arguments);

			if (!this.getEditor()) {
				// FIXME: if set later manually => this detection should be disabled
				// if editor is not set explicitly via constructor, we're going to try to find it
				this._bEditorAutoDetect = true;
			}

			this._propagationListener = this._propagationListener.bind(this);

			this.attachEditorChange(function () {
				if (this._sCreatedBy) {
					this._removePropertyEditors();
				}
				this._initPropertyEditors();
			});

			this.attachConfigChange(function (oEvent) {
				var aPreviousConfig = oEvent.getParameter("previousConfig");
				var aConfig = oEvent.getParameter("config");

				if (
					this._fnCancelInit
					|| this._sCreatedBy === CREATED_BY_TAGS
					|| !Array.isArray(aPreviousConfig)
					|| !Array.isArray(aConfig)
					|| aPreviousConfig.length !== aConfig.length
				) {
					this._removePropertyEditors();
					this._initPropertyEditors();
				} else if (this._sCreatedBy) {
					var aPropertyEditors = this.getAggregation("propertyEditors");
					aConfig.forEach(function (mConfig, iIndex) {
						aPropertyEditors[iIndex].setConfig(mConfig);
					});
				}
			});

			this.attachTagsChange(function () {
				if (this._sCreatedBy === CREATED_BY_TAGS) {
					this._removePropertyEditors();
				}
				if (this._sCreatedBy !== CREATED_BY_CONFIG) {
					this._initPropertyEditors();
				}
			});

			// init
			this._initPropertyEditors();
		},

		renderer: function (oRm, oControl) {
			var aPropertyEditors = oControl.getAggregation("propertyEditors");
			oRm.openStart("div", oControl);
			oRm.openEnd();
			if (Array.isArray(aPropertyEditors)) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					oRm.renderControl(oPropertyEditor);
				});
			}
			oRm.close("div");
		}
	});

	PropertyEditors.prototype.getEditor = function () {
		return sap.ui.getCore().byId(this.getAssociation("editor"));
	};

	PropertyEditors.prototype.setConfig = function (mConfig) {
		var mPreviousConfig = this.getConfig();
		if (
			mPreviousConfig !== mConfig
			&& (
				!Array.isArray(mPreviousConfig)
				|| !Array.isArray(mConfig)
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

	PropertyEditors.prototype.setTags = function (vTags) {
		var sPreviousTags = this.getTags();
		var vResult = vTags;

		if (typeof vTags === "string") {
			vResult = vTags.split(",").sort().join(",");
		}

		if (sPreviousTags !== vResult) {
			this.setProperty("tags", vResult);
			this.fireTagsChange({
				previousTags: sPreviousTags,
				tags: vResult
			});
		}
	};

	PropertyEditors.prototype.setEditor = function (vEditor) {
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

	PropertyEditors.prototype.destroy = function () {
		this._removePropertyEditors();
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditors.prototype._removePropertyEditors = function () {
		var aPropertyEditors = this.removeAllAggregation("propertyEditors");

		if (aPropertyEditors.length) {
			aPropertyEditors.forEach(function (oPropertyEditor) {
				switch (this._sCreatedBy) {
					case CREATED_BY_CONFIG:
						oPropertyEditor.destroy();
						break;
					case CREATED_BY_TAGS:
						// Need to manually as there is a bug in removeAllAggregation()
						// when aggregation marked as "multiple: false"
						oPropertyEditor.setParent(null);
						break;
				}
			}, this);

			this._sCreatedBy = null;
			this.firePropertyEditorsChange({
				previousPropertyEditors: aPropertyEditors,
				propertyEditors: []
			});
		}
	};

	PropertyEditors.prototype._initPropertyEditors = function () {
		if (
			this.getEditor()
			&& (
				this.getConfig()
				|| (
					!this.getBindingInfo("config") // If there is a binding on config property the value might not arrived yet
					&& this.getTags()
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
					oPromise = Promise.all(
						this.getConfig().map(function (mItemConfig) {
							return oEditor.createPropertyEditor(mItemConfig);
						})
					);
					sCreatedBy = CREATED_BY_CONFIG;
				} else {
					var aTags = this.getTags().split(",");
					oPromise = oEditor.getPropertyEditors(aTags);
					sCreatedBy = CREATED_BY_TAGS;
				}

				oPromise
					.then(function (aPropertyEditors) {
						var bRenderLabels = this.getProperty("renderLabels");
						if (bRenderLabels !== undefined) {
							aPropertyEditors.forEach(function (propertyEditor) {
								propertyEditor.setProperty("renderLabel", bRenderLabels);
							});
						}
						this._sCreatedBy = sCreatedBy;
						this._sCreatedBy = sCreatedBy;
						delete this._fnCancelInit;
						fnResolve(aPropertyEditors);
					}.bind(this))
					.catch(fnReject);
			}.bind(this));

			this._fnCancelInit = mPromise.cancel;

			mPromise.promise.then(function (aPropertyEditors) {
				var aPreviousPropertyEditors = (this.getAggregation("propertyEditors") || []).slice();
				aPropertyEditors.forEach(function (oPropertyEditor) {
					this.addAggregation("propertyEditors", oPropertyEditor);
				}, this);
				this.firePropertyEditorsChange({
					previousPropertyEditors: aPreviousPropertyEditors,
					propertyEditors: (this.getAggregation("propertyEditors") || []).slice()
				});
			}.bind(this));
		}
	};

	PropertyEditors.prototype._propagationListener = function () {
		var oEditor = findClosestInstance(this.getParent(), "sap.ui.integration.designtime.baseEditor.BaseEditor");
		if (oEditor) {
			this.setEditor(oEditor);
			this.removePropagationListener(this._propagationListener);
		}
	};

	PropertyEditors.prototype.setParent = function (oParent) {
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

	return PropertyEditors;
});