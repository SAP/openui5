/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"./../util/isAggregationTemplate",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_merge",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual"
], function (
	Control,
	isAggregationTemplate,
	JSONModel,
	Label,
	Fragment,
	_merge,
	ManagedObjectObserver,
	createPromise,
	deepClone,
	deepEqual
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
				"value": {
					type: "any"
				},
				"config": {
					type: "object"
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
				 * Fires before value is changed
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
				 * Fires when value is changed
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
				 * Fires when config is changed
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
			this._iExpectedWrapperCount = 0;

			Control.prototype.constructor.apply(this, arguments);

			// Helper model for accessing internal properties/data from XML and/or in bindigs
			this._oDefaultModel = new JSONModel({
				value: this.getValue(),
				config: this.getConfig()
			});
			this._oDefaultModel.setDefaultBindingMode("OneWay");
			this.setBindingContext(this._oDefaultModel.getContext("/"));
			this.setModel(this._oDefaultModel);

			// Control visibility via this.getConfig().visible property
			this.bindProperty("visible", "config/visible");

			// Ready state of the editor, will be evaluated when a value is set
			this._setReady(false);

			// List of dependencies
			this._aEditorWrappers = [];

			// Set to `true` after the fragment was loaded and asyncInit is resolved
			this._bInitFinished = false;

			this.attachBeforeValueChange(function (oEvent) {
				this._iExpectedWrapperCount = this.getExpectedWrapperCount(oEvent.getParameter("nextValue"));
			}, this);

			this.attachValueChange(function (oEvent) {
				var vValue = oEvent.getParameter("value");

				// Keep copy of the value in config for easy bindings
				this._oDefaultModel.setData(
					Object.assign({}, this._oDefaultModel.getData(), {
						value: vValue
					})
				);

				this._checkReadyState();
			}, this);

			this.attachConfigChange(function (oEvent) {
				this._oDefaultModel.setData(
					Object.assign({}, this._oDefaultModel.getData(), {
						config: oEvent.getParameter("config")
					})
				);
			}, this);

			// Start init process
			this._loadFragment()
				.then(this.asyncInit.bind(this))
				.then(function () {
					this._bInitFinished = true;
					// When the expected wrapper count was already set, initialization finished after the editor
					// value was set and the ready check might already have been executed and failed
					// Therefore execute the check again
					this._checkReadyState();
				}.bind(this));
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
		}
	});

	/**
	 * Sets the editor value. If no value is provided, the default value provided
	 * in the config will be used instead. This method triggers the ready check,
	 * therefore it should also be called when overridden in complex editors.
	 *
	 * @param {*} vValue - Editor value that was already processed by a custom setValue implementation
	 */
	BasePropertyEditor.prototype.setValue = function (vValue) {
		var vCurrentValue = this.getValue();
		var oConfig = this.getConfig() || {};
		var vNextValue = vValue;

		if (typeof vNextValue === "undefined" && typeof oConfig.defaultValue !== "undefined") {
			vNextValue = deepClone(oConfig.defaultValue);
		}

		if (!deepEqual(vNextValue, vCurrentValue)) {
			this.fireBeforeValueChange({
				path: oConfig.path,
				value: vCurrentValue,
				nextValue: vNextValue
			});
			this.setProperty("value", vNextValue);
			this.fireValueChange({
				path: oConfig.path,
				previousValue: vCurrentValue,
				value: vNextValue
			});
		}
	};

	/**
	 * Returns the number of wrappers that a complex editor should wait for.
	 * Should be overridden by all complex editors which depend on children.
	 * If the method is not overridden, it returns 0 which means that the editor is ready.
	 * @param {*} vValue - Value of the editor
	 * @returns {number} Number of wrappers to wait for, default is 0
	 */
	BasePropertyEditor.prototype.getExpectedWrapperCount = function () {
		return 0;
	};

	BasePropertyEditor.prototype._checkReadyState = function () {
		if (this._mWrapperReadyCheck) {
			// Cancel the old ready check as the nested wrappers have changed
			this._mWrapperReadyCheck.cancel();
		}
		if (!this._bInitFinished) {
			// The editor itself is not ready yet, no need to check nested editors
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
	BasePropertyEditor.prototype.wrapperInit = function (oEvent) {
		var oWrapper = oEvent.getSource();
		if (isAggregationTemplate(oWrapper)) {
			// The element is part of the template of the aggregation binding
			// and not a real wrapper
			return;
		}
		this._aEditorWrappers.push(oWrapper);
		oWrapper.attachReady(function () {
			// If a nested editor got unready without a value change on the parent editor
			// the ready state needs to be explicitly reevaluated to fire ready from the parent again
			this._setReady(false);
			this._checkReadyState();
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
			}.bind(this));
		}
		this._oWrapperObserver.observe(oWrapper, {
			destroy: true
		});
		// A new nested editor wrapper was registered, therefore the ready state must be reevaluated
		this._checkReadyState();
	};

	BasePropertyEditor.prototype._setReady = function (readyState) {
		var bPreviousReadyState = this._bIsReady;
		this._bIsReady = readyState;
		if (bPreviousReadyState !== true && readyState === true) {
			// If the editor was not ready before, fire the ready event
			this.fireReady();
		}
	};

	BasePropertyEditor.prototype.isReady = function () {
		return !!this._bIsReady;
	};

	/**
	 * Wait for the editor to be ready.
	 * @returns {Promise} Promise which will resolve once the editor is ready. Resolves immediately if the editor is currently ready.
	 */
	BasePropertyEditor.prototype.ready = function () {
		return new Promise(function (resolve) {
			if (this.isReady()) {
				// The editor is already ready, resolve immediately
				resolve();
			} else {
				this.attachEventOnce("ready", resolve);
			}
		}.bind(this));
	};

	BasePropertyEditor.prototype._loadFragment = function () {
		if (!this.xmlFragment) {
			return Promise.resolve();
		}
		return Fragment.load({
			name: this.xmlFragment,
			controller: this
		}).then(function(oEditorControl) {
			this.setContent(oEditorControl);
		}.bind(this));
	};

	/**
	 * Override to execute logic after the editor fragment was loaded
	 */
	BasePropertyEditor.prototype.asyncInit = function () {
		return Promise.resolve();
	};

	BasePropertyEditor.prototype.clone = function() {
		// as content is a public aggregation (to simplify creation of the property editors), we ensure it is not cloned
		// otherwise if PropertyEditor is used as template for the list binding,
		// constructor will be called once for the template and once for the cloned instance
		this.destroyContent();
		return Control.prototype.clone.apply(this, arguments);
	};

	BasePropertyEditor.prototype.exit = function() {
		this._oDefaultModel.destroy();

		if (this._oConfigBinding) {
			this._oConfigBinding.destroy();
		}

		if (this._oWrapperObserver) {
			this._oWrapperObserver.destroy();
		}
	};

	BasePropertyEditor.prototype.setConfig = function (oConfig) {
		var oPreviousConfig = this.getConfig();

		if (!deepEqual(oPreviousConfig, oConfig)) {
			var oNextConfig = _merge({}, oConfig);
			this.setProperty("config", oNextConfig);
			this.fireConfigChange({
				previousConfig: oPreviousConfig,
				config: oNextConfig
			});
		}
	};

	BasePropertyEditor.prototype.getI18nProperty = function(sName) {
		return this.getModel("i18n").getProperty(sName);
	};

	BasePropertyEditor.prototype.getLabel = function() {
		var oLabel = this.getAggregation("_label");
		if (!oLabel) {
			oLabel = new Label({
				text: "{config/label}",
				design: "Bold"
			});
			this.setAggregation("_label", oLabel);
		}

		return oLabel;
	};

	return BasePropertyEditor;
});
