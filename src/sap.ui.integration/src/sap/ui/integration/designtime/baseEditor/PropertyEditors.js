/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/integration/designtime/baseEditor/util/isTemplate",
	"sap/ui/integration/designtime/baseEditor/util/StylesheetManager",
	"sap/base/util/restricted/_intersection",
	"sap/base/util/restricted/_omit",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Element"
], function(
	Control,
	findClosestInstance,
	createPromise,
	isTemplate,
	StylesheetManager,
	_intersection,
	_omit,
	deepEqual,
	deepClone,
	Fragment,
	JSONModel,
	ManagedObjectObserver,
	Element
) {
	"use strict";

	var CREATED_BY_CONFIG = "config";
	var CREATED_BY_TAGS = "tags";

	var mLayouts = {
		"list": {
			module: "sap/ui/integration/designtime/baseEditor/layout/Form",
			defaultConfig: {
				responsiveGridLayout: {
					labelSpanXL: 12,
					labelSpanL: 12,
					labelSpanM: 12,
					labelSpanS: 12,
					adjustLabelSpan: false,
					columnsXL: 1,
					columnsL: 1,
					columnsM: 1,
					singleContainerFullSize: false
				}
			}
		},
		"form": {
			module: "sap/ui/integration/designtime/baseEditor/layout/Form",
			defaultConfig: {}
		}
	};


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
			library: "sap.ui.integration",
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
				},

				/**
				 *
				 */
				layout: {
					type: "string",
					defaultValue: "list"
				},

				layoutConfig: {
					type: "object"
				}
			},
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			associations: {
				editor: {
					type: "sap.ui.integration.designtime.baseEditor.BaseEditor",
					multiple: false
				},
				propertyEditors: {
					type: "sap.ui.integration.designtime.baseEditor.PropertyEditor",
					visibility: "hidden"
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
				ready: {},

				/**
				 * Fires when the error state of one of the nested property editors changes
				 */
				 validationErrorChange: {
					parameters: {
						/**
						 * Whether there is an error in one of the nested editors
						 * @since 1.96.0
						 */
						hasError: { type: "boolean" }
					}
				},

				/**
				 * Fires when <code>layout</code> changes.
				 */
				layoutChange: {
					parameters: {
						previousLayout: {
							type: "string"
						},
						layout: {
							type: "string"
						}
					}
				},

				/**
				 * Fires when <code>layoutConfig</code> changes.
				 */
				layoutConfigChange: {
					parameters: {
						previousLayoutConfig: {
							type: "object"
						},
						layoutConfig: {
							type: "object"
						}
					}
				}
			}
		},

		_bEditorAutoDetect: false,
		_sCreatedBy: null, // possible values: null | propertyName | config
		_bLayoutReady: false,

		constructor: function () {
			this._iExpectedWrapperCount = 0;

			// Ready state of the editor, will be evaluated when a value is set
			this._setReady(false);

			// List of dependencies
			this._aEditorWrappers = [];
			this._bInitFinished = false;

			Control.prototype.constructor.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

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
				var aPreviousConfigs = oEvent.getParameter("previousConfig");
				var aConfigs = oEvent.getParameter("config");

				if (
					this._fnCancelInit
					|| this._sCreatedBy === CREATED_BY_TAGS
					|| !Array.isArray(aPreviousConfigs)
					|| !Array.isArray(aConfigs)
					|| aPreviousConfigs.length !== aConfigs.length
				) {
					this._removePropertyEditors();
					this._initPropertyEditors();
				} else if (this._sCreatedBy) {
					this._evaluateViewRecreation(aPreviousConfigs, aConfigs);
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

			if (this.getMetadata().getProperty("layout").getDefaultValue() === this.getLayout()) {
				this._initLayout(this.getLayout());
			}
		},

		renderer: function (oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.openEnd();
			oRm.renderControl(oControl.getContent());
			oRm.close("div");
		}
	});

	PropertyEditors.prototype.init = function () {
		this.attachLayoutChange(function (oEvent) {
			// Remove CSS file from previous layout
			var sPreviousLayout = oEvent.getParameter("previousLayout");
			this._removeStylesheet(this._getLayoutPath(sPreviousLayout));

			var sLayout = oEvent.getParameter("layout");
			this._initLayout(sLayout);
		}, this);

		this.attachLayoutConfigChange(function () {
			if (this._sCreatedBy) {
				this._removePropertyEditors();
			}
			this._initPropertyEditors();
		}, this);

		Promise.resolve().then(function () {
			this._bInitFinished = true;
			this.fireInit();
		}.bind(this));
	};

	PropertyEditors.prototype.destroy = function () {
		this._bInitFinished = false;
		this._setReady(false);

		if (this._fnCancelLayoutLoading) {
			this._fnCancelLayoutLoading();
		}

		this._removeStylesheet(this._getLayoutPath(this.getLayout()));

		Control.prototype.destroy.apply(this, arguments);
	};

	PropertyEditors.prototype._loadFragment = function (sFilePath) {
		return Fragment.load({
			name: sFilePath,
			controller: this
		});
	};

	PropertyEditors.prototype._loadModule = function (sFilePath) {
		return new Promise(function (fnResolve, fnReject) {
			sap.ui.require(
				[sFilePath],
				fnResolve,
				fnReject
			);
		});
	};

	PropertyEditors.prototype._loadStylesheet = function (sFilePath) {
		this._bCssRequested = true;
		return StylesheetManager.add(sFilePath);
	};

	PropertyEditors.prototype._removeStylesheet = function (sFilePath) {
		if (this._bCssRequested) {
			StylesheetManager.remove(sFilePath);
			delete this._bCssRequested;
		}
	};

	PropertyEditors.prototype.getEditor = function () {
		return Element.registry.get(this.getAssociation("editor"));
	};

	PropertyEditors.prototype.setConfig = function (mConfig) {
		var mPreviousConfig = this.getConfig();
		if (
			!Array.isArray(mPreviousConfig)
			|| !Array.isArray(mConfig)
			|| JSON.stringify(mPreviousConfig) !== JSON.stringify(mConfig)
		) {
			var mNextConfig = deepClone(mConfig);
			this.setProperty("config", mNextConfig);
			this.fireConfigChange({
				previousConfig: mPreviousConfig,
				config: mNextConfig
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
		var oEditor = typeof vEditor === "string" ? Element.registry.get(vEditor) : vEditor;
		if (oPreviousEditor !== oEditor) {
			this.setAssociation("editor", vEditor);
			var oEditor = this.getEditor();
			this.fireEditorChange({
				previousEditor: oPreviousEditor,
				editor: oEditor
			});
		}
	};

	PropertyEditors.prototype._removePropertyEditors = function () {
		var aPropertyEditors = this.removeAllAssociation("propertyEditors").map(function (sPropertyEditorId) {
			return Element.registry.get(sPropertyEditorId);
		});

		this._iExpectedWrapperCount = 0;
		this.getModel().setData({});
		this._sCreatedBy = null;

		if (aPropertyEditors.length) {
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
			&& this._bLayoutReady
		) {
			var oEditor = this.getEditor();
			var aConfigs;

			if (this.getConfig()) {
				aConfigs = this.getConfig();
				this._sCreatedBy = CREATED_BY_CONFIG;
			} else {
				var aTags = this.getTags().split(",");
				aConfigs = oEditor.getConfigsByTag(aTags);
				this._sCreatedBy = CREATED_BY_TAGS;
			}

			var aPreviousPropertyEditors = (this._getPropertyEditors() || []).slice();
			this._updateViewModel(aConfigs);

			this.ready().then(function () {
				this.firePropertyEditorsChange({
					previousPropertyEditors: aPreviousPropertyEditors,
					propertyEditors: (this._getPropertyEditors() || []).slice()
				});
			}.bind(this));
		}

		this._checkReadyState();
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

	PropertyEditors.prototype.setLayout = function (sLayout) {
		var sPreviousLayout = this.getLayout();

		if (sPreviousLayout !== sLayout) {
			this.setProperty("layout", sLayout);
			this.fireLayoutChange({
				previousLayout: sPreviousLayout,
				layout: sLayout
			});
		}
	};

	PropertyEditors.prototype.setLayoutConfig = function (mLayoutConfig) {
		var sPreviousLayoutConfig = this.getLayoutConfig();

		if (!deepEqual(sPreviousLayoutConfig, mLayoutConfig)) {
			this.setProperty("layoutConfig", mLayoutConfig);
			this.fireLayoutConfigChange({
				previousLayoutConfig: sPreviousLayoutConfig,
				layoutConfig: mLayoutConfig
			});
		}
	};

	PropertyEditors.prototype._getLayoutConfig = function () {
		var oLayoutConfig = this.getLayoutConfig();

		var bRenderLabels = this.getRenderLabels();
		var mRenderLabels;
		if (typeof bRenderLabels === "boolean") {
			mRenderLabels = {
				renderLabels: bRenderLabels
			};
		}

		var mDefaultConfig = mLayouts[this.getLayout()] && mLayouts[this.getLayout()].defaultConfig || {};

		// Prioritization (bottom wins):
		// - default config
		// - custom layout config
		// - renderLabels property (if set)
		return Object.assign({}, mDefaultConfig, oLayoutConfig, mRenderLabels);
	};

	PropertyEditors.prototype._getLayoutPath = function (sLayout) {
		return mLayouts.hasOwnProperty(sLayout) ? mLayouts[sLayout].module : sLayout;
	};

	PropertyEditors.prototype._initLayout = function (sLayout) {
		// Destory old layout
		this.destroyContent();

		var sPath = this._getLayoutPath(sLayout);

		this._bLayoutReady = false;

		if (this._sCreatedBy) {
			this._removePropertyEditors();
		}

		if (this._fnCancelLayoutLoading) {
			this._fnCancelLayoutLoading();
		}

		var mPromise = createPromise(function (fnResolve, fnReject) {
			this._loadStylesheet(sPath); // out of Promise.all as it's optional
			Promise.all([
				this._loadFragment(sPath),
				this._loadModule(sPath)
			]).then(fnResolve, fnReject);
		}.bind(this));

		mPromise.promise.then(function (aResult) {
			delete this._fnCancelLayoutLoading;

			var oLayout = aResult[0];
			var oLayoutModule = aResult[1];

			this._prepareData = oLayoutModule.prepareData;
			this._aUpdateDependencies = oLayoutModule.updateDependencies || [];
			this.setContent(oLayout);
			this._bLayoutReady = true;
			this._initPropertyEditors();
		}.bind(this));

		this._fnCancelLayoutLoading = mPromise.cancel;
	};

	PropertyEditors.prototype._evaluateViewRecreation = function (aPreviousConfigs, aConfigs) {
		var aRegisteredEditors = this._getPropertyEditors() || [];
		// Only recreate the layout if a config option which is relevant
		// for the calculation and might change the output of the preparation
		// function was modified
		if (
			aPreviousConfigs.length !== aConfigs.length
			|| aConfigs.length !== aRegisteredEditors.length
			|| aConfigs.some(function (oConfig, iIndex) {
				return this._aUpdateDependencies.some(function (sDependency) {
					return aPreviousConfigs[iIndex][sDependency] !== oConfig[sDependency];
				});
			}.bind(this))
		) {
			this._updateViewModel(aConfigs);
		} else {
			aRegisteredEditors.map(function (oProperyEditor, iIndex) {
				var oConfig = aConfigs[iIndex];
				oProperyEditor.setConfig(_omit(deepClone(oConfig), "value"));
				if (oConfig.hasOwnProperty("value")) {
					oProperyEditor.setValue(oConfig.value);
				}
			});
		}
	};

	PropertyEditors.prototype._updateViewModel = function (aConfigs) {
		var mData = this._prepareData(aConfigs, this._getLayoutConfig());
		this._iExpectedWrapperCount = mData.count;
		if (this._iExpectedWrapperCount > 0) {
			this._checkReadyState();
		}
		this.getModel().setData(mData);
	};

	PropertyEditors.prototype.ready = function () {
		return new Promise(function (resolve) {
			if (this.isReady()) {
				// The editor is already ready, resolve immediately
				resolve();
			} else {
				this.attachEventOnce("ready", resolve);
			}
		}.bind(this));
	};

	PropertyEditors.prototype.isReady = function () {
		return !!this._bIsReady;
	};

	PropertyEditors.prototype.hasError = function () {
		return this._aEditorWrappers.some(function (oWrapper) {
			return oWrapper.hasError();
		});
	};

	PropertyEditors.prototype._setReady = function (readyState) {
		var bPreviousReadyState = this._bIsReady;
		this._bIsReady = readyState;
		if (bPreviousReadyState !== true && readyState === true) {
			// If the editor was not ready before, fire the ready event
			this.fireReady();
		}
	};

	PropertyEditors.prototype._checkReadyState = function () {
		if (this._mWrapperReadyCheck) {
			// Cancel the old ready check as the nested wrappers have changed
			this._mWrapperReadyCheck.cancel();
		}
		if (!this._bInitFinished) {
			// The editor itself is not ready yet, no need to check nested editors
			this._setReady(false);
			return;
		}
		if (!this._bLayoutReady) {
			// Layout is not ready, therefore expected wrapper count is unknown
			this._setReady(false);
			return;
		}
		if (this._iExpectedWrapperCount === 0) {
			// If no nested editors are expected the ready check resolves immediately
			this._setReady(true);
			return;
		}

		// Wait for the expected number of wrappers to report to the editor via _wrapperInit
		// If all wrappers are initialized, execute the ready check
		if (this._iExpectedWrapperCount === this._aEditorWrappers.length) {
			if (
				this._aEditorWrappers.every(function (oWrapper) {
					return oWrapper.isReady();
				})
			) {
				// Editors haven't changed and are still ready
				this._setReady(true);
			} else {
				this._setReady(false);
				this._mWrapperReadyCheck = createPromise(function (resolve) {
					Promise.all(this._aEditorWrappers.map(function (oWrapper) {
						return oWrapper.ready(); // Check the ready state of each nested editor
					})).then(resolve);
				}.bind(this));
				this._mWrapperReadyCheck.promise.then(function () {
					// All nested editors are ready
					this._setReady(true);
					delete this._mWrapperReadyCheck;
				}.bind(this));
			}
		} else {
			this._setReady(false);
		}
	};

	/**
	 * Method to be passed to the nested editor wrapper as a callback for the ready event.
	 * Registers the source of the <code>oEvent</code> on the editor as an element to consider
	 * for the ready check.
	 *
	 * @param {sap.ui.base.Event} oEvent - Init event of the nested editor
	 */
	PropertyEditors.prototype.wrapperInit = function (oEvent) {
		var oWrapper = oEvent.getSource();
		if (isTemplate(oWrapper, this)) {
			// The element is part of the template of the aggregation binding
			// and not a real wrapper
			return;
		}
		if (!oWrapper.getEditor()) {
			oWrapper.setEditor(this.getEditor());
		}
		this._aEditorWrappers.push(oWrapper);
		this.addAssociation("propertyEditors", oWrapper);
		oWrapper.attachReady(function () {
			// If a nested editor got unready without a value change on the parent editor
			// the ready state needs to be explicitly reevaluated to fire ready from the parent again
			this._setReady(false);
			this._checkReadyState();
		}.bind(this));

		oWrapper.attachValidationErrorChange(function() {
			this.fireValidationErrorChange({
				hasError: this.hasError()
			});
		}.bind(this));

		// If the editor contains nested editors and setValue is called for the first time
		// an observer is created to handle the destruction of nested wrappers
		if (!this._oWrapperObserver) {
			// Observe wrappers which are registered on the complex editor
			// to remove them from the ready check list when they are destroyed
			this._oWrapperObserver = new ManagedObjectObserver(function (mutation) {
				this._aEditorWrappers = this._aEditorWrappers.filter(function (oEditorWrapper) {
					return oEditorWrapper !== mutation.object;
				});
				this.removeAssociation("propertyEditors", mutation.object);
			}.bind(this));
		}
		this._oWrapperObserver.observe(oWrapper, {
			destroy: true
		});
		// A new nested editor wrapper was registered, therefore the ready state must be reevaluated
		this._checkReadyState();
	};

	PropertyEditors.prototype._getPropertyEditors = function () {
		var aPropertyEditors = (this.getAssociation("propertyEditors") || []).map(function (sId) {
			return Element.registry.get(sId);
		});

		return aPropertyEditors.length && aPropertyEditors || null; // returning null when empty array — backwards compatibility
	};

	return PropertyEditors;
});