/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/base/util/restricted/_intersection",
	"sap/base/util/restricted/_omit"
], function (
	Control,
	findClosestInstance,
	createPromise,
	_intersection,
	_omit
) {
	"use strict";

	var CREATED_BY_CONFIG = "config";
	var CREATED_BY_TAGS = "tags";
	var STATUS_CREATED = "created"; // Initial state: wrapper was just created, initialization was not executed yet
	var STATUS_SYNCING = "syncing"; // Initialization in progress
	var STATUS_READY = "ready"; // Initialization completed

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
					type: "string"
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
					type: "sap.ui.integration.designtime.baseEditor.PropertyEditor",
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
							type: "sap.ui.integration.designtime.baseEditor.PropertyEditor"
						},
						propertyEditors: {
							type: "sap.ui.integration.designtime.baseEditor.PropertyEditor"
						}
					}
				},

				/**
				 * Fires when the wrapper is initialized.
				 */
				init: {},

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
				},

				/**
				 * Fires when the nested editors are ready
				 */
				ready: {}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config
		_sState: STATUS_CREATED,

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
					|| aPreviousConfig.some(function (oPreviousConfig, iIdx) {
						return oPreviousConfig.type !== aConfig[iIdx].type;
					})
				) {
					this._removePropertyEditors();
					this._initPropertyEditors();
				} else if (this._sCreatedBy) {
					var aPropertyEditors = this.getAggregation("propertyEditors");
					if (aPropertyEditors && aPropertyEditors.length > 0) {
						aConfig.forEach(function (mConfig, iIndex) {
							// workaround until PropertyEditor supports smart rendering
							aPropertyEditors[iIndex].setConfig(_omit(mConfig, "value"));
							if (!mConfig.path.startsWith("/")) {
								aPropertyEditors[iIndex].setValue(mConfig.value);
							}
						});
					}
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

	PropertyEditors.prototype.init = function () {
		Promise.resolve().then(function () {
			this.fireInit();
		}.bind(this));
	};

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
		if (this._fnCancelInit) {
			this._fnCancelInit().then(this._removeEditorsInCreation.bind(this));
		}
		this._removePropertyEditors();
		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditors.prototype._removeEditorsInCreation = function (aEditors) {
		if (this._sCreatedBy === CREATED_BY_CONFIG) {
			aEditors.forEach(function (oEditorInCreation) {
				oEditorInCreation.destroy();
			});
		}
	};

	PropertyEditors.prototype._removePropertyEditors = function () {
		var aPropertyEditors = this.removeAllAggregation("propertyEditors");

		if (aPropertyEditors.length) {
			aPropertyEditors.forEach(function (oPropertyEditor) {
				oPropertyEditor.detachReady(this._onPropertyEditorReady, this);
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

	PropertyEditors.prototype.isReady = function () {
		// The wrapper is ready when the initialization was executed and all nested editors are ready
		return (
			this._sState === STATUS_READY
			&& (this.getAggregation("propertyEditors") || []).every(function (oNestedEditor) {
				return oNestedEditor.isReady();
			})
		);
	};

	PropertyEditors.prototype._onPropertyEditorReady = function () {
		if (this.isReady()) {
			this.fireReady();
		}
	};

	/**
	 * Wait for the wrapper and its nested editors to be ready.
	 * @returns {Promise} Promise which will resolve once all nested editors are ready. Resolves immediately if all nested editors are currently ready.
	 */
	PropertyEditors.prototype.ready = function () {
		return new Promise(function (resolve) {
			var fnCheckPropertyEditorsReady = function () {
				Promise.all((this.getAggregation("propertyEditors") || []).map(function (oPropertyEditor) {
					return oPropertyEditor.ready();
				})).then(function () {
					resolve();
				});
			}.bind(this);

			if (this._sState !== STATUS_READY) {
				// Wait for initialization of nested editors before checking their ready states
				this.attachEventOnce("propertyEditorsChange", function () {
					fnCheckPropertyEditorsReady();
				});
			} else {
				fnCheckPropertyEditorsReady();
			}
		}.bind(this));
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
			this._sState = STATUS_SYNCING;
			var oEditor = this.getEditor();
			// Cancel previous async process if any
			if (this._fnCancelInit) {
				this._fnCancelInit().then(this._removeEditorsInCreation.bind(this));
				delete this._fnCancelInit;
			}

			var mPromise = createPromise(function (fnResolve, fnReject) {
				if (this.getConfig()) {
					Promise.all(this.getConfig().map(function (mItemConfig) {
						var oPropertyEditor = oEditor._createPropertyEditor(mItemConfig);
						return oPropertyEditor;
					})).then(fnResolve).catch(fnReject);
					this._sCreatedBy = CREATED_BY_CONFIG;
				} else {
					var aTags = this.getTags().split(",");
					oEditor.getPropertyEditorsByTag(aTags).then(fnResolve).catch(fnReject);
					this._sCreatedBy = CREATED_BY_TAGS;
				}
			}.bind(this));
			this._fnCancelInit = mPromise.cancel;

			mPromise.promise.then(function (aPropertyEditors) {
				var bRenderLabels = this.getRenderLabels();
				if (bRenderLabels !== undefined) {
					aPropertyEditors.forEach(function (oPropertyEditor) {
						oPropertyEditor.setRenderLabel(bRenderLabels);
					});
				}

				var aPreviousPropertyEditors = (this.getAggregation("propertyEditors") || []).slice();

				aPropertyEditors.forEach(function (oPropertyEditor) {
					this.addAggregation("propertyEditors", oPropertyEditor);
					oPropertyEditor.attachReady(this._onPropertyEditorReady, this);
				}, this);

				this._sState = STATUS_READY;
				if (this.isReady()) {
					this.fireReady();
				}

				this.firePropertyEditorsChange({
					previousPropertyEditors: aPreviousPropertyEditors,
					propertyEditors: (this.getAggregation("propertyEditors") || []).slice()
				});
				delete this._fnCancelInit;
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