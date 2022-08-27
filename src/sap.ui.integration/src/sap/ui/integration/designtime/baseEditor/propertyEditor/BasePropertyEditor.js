/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"./../util/isTemplate",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_omit",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/isPlainObject",
	"sap/base/util/values",
	"sap/base/util/each",
	"sap/ui/integration/designtime/baseEditor/validator/ValidatorRegistry",
	"sap/ui/integration/designtime/baseEditor/util/BaseDefaultValidatorModules",
	"sap/ui/integration/designtime/baseEditor/util/cleanupDesigntimeMetadata"
], function (
	Control,
	isTemplate,
	JSONModel,
	Label,
	Fragment,
	_omit,
	ManagedObjectObserver,
	PropertyEditorFactory,
	createPromise,
	CancelablePromise,
	deepClone,
	deepEqual,
	isPlainObject,
	values,
	each,
	ValidatorRegistry,
	BaseDefaultValidatorModules,
	cleanupDesigntimeMetadata
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
			library: "sap.ui.integration",
			interfaces: ["sap.ui.core.IFormContent"],
			properties: {
				"renderLabel": {
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
				 * Fires when designtime metadata is changed
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
				 * Fires when fragment is changed
				 */
				fragmentChange: {
					parameters: {
						previousFragment: {
							type: "string"
						},
						fragment: {
							type: "string"
						}
					}
				},

				/**
				 * Fired when the editor fragment was loaded and the <code>asyncInit</code> method was executed
				 */
				ready: {},

				/**
				 * Fires when init is finished
				 */
				init: {},

				/**
				 * Fires when the error state of the editor changes
				 */
				validationErrorChange: {
					parameters: {
						/**
						 * Whether there is an error in the editor
						 * @since 1.96.0
						 */
						hasError: { type: "boolean" }
					}
				}
			}
		},
		/**
		 * Path to the fragment xml that should be loaded for an editor
		 */
		xmlFragment: null,
		_currentXmlFragment: null,
		_bFragmentReady: false,

		constructor: function () {
			this._iExpectedWrapperCount = 0;
			this._currentXmlFragment = this.xmlFragment;

			Control.prototype.constructor.apply(this, arguments);

			// Helper model for accessing internal properties/data from XML and/or in bindigs
			this._oDefaultModel = new JSONModel({
				value: this.getValue(),
				config: this.getConfig(),
				displayValue: this._formatValue(this.getValue())
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
						value: vValue,
						displayValue: this._formatValue(vValue)
					})
				);

				this._checkReadyState();
			}, this);

			this.attachConfigChange(function (oEvent) {
				var oPreviousConfig = oEvent.getParameter("previousConfig");
				var oConfig = oEvent.getParameter("config");

				// If validators have changed, reevaluate current value
				if (
					oPreviousConfig
					&& oConfig
					&& !deepEqual(oPreviousConfig.validators, oConfig.validators)
				) {
					this._validate(this.getValue());
				}

				this._oDefaultModel.setData(
					Object.assign({}, this._oDefaultModel.getData(), {
						config: oConfig
					})
				);
			}, this);

			this.asyncInit().then(function () {
				this._bInitFinished = true;
				this.fireInit();

				// When the expected wrapper count was already set, initialization finished after the editor
				// value was set and the ready check might already have been executed and failed
				// Therefore execute the check again
				this._checkReadyState();
			}.bind(this));

			if (this.getFragment()) {
				this._initFragment(this.getFragment());
			}
		},

		renderer: {
			apiVersion: 2,
			render: function (oRm, oPropertyEditor) {
				oRm.openStart("div", oPropertyEditor);
				oRm.style("display", "inline-block");
				oRm.style("width", "100%");
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
		}
	});

	BasePropertyEditor.prototype.init = function () {
		this.attachFragmentChange(function (oEvent) {
			if (this.getContent()) {
				this.getContent().destroy();
			}
			var sFragmentName = oEvent.getParameter("fragment");
			this._initFragment(sFragmentName);
		}, this);
	};

	/**
	 * Override to execute async logic before init() event is executed.
	 */
	BasePropertyEditor.prototype.asyncInit = function () {
		return Promise.resolve();
	};

	/**
	 * Hook which is called when fragment is ready on initial start or when it's exchanged.
	 */
	BasePropertyEditor.prototype.onFragmentReady = function () { };

	/**
	 * Sets the editor value. If no value is provided, the default value provided
	 * in the config will be used instead. This method triggers the ready check,
	 * therefore it should also be called when overridden in complex editors.
	 *
	 * @param {*} vValue - Editor value that was already processed by a custom setValue implementation
	 * @param {boolean} bSuppressValidation - Whether to set the value regardless of the validation result, false by default
	 * @public
	 */
	BasePropertyEditor.prototype.setValue = function (vValue, bSuppressValidation) {
		var vCurrentValue = this.getValue();
		var oConfig = this.getConfig() || {};
		var vNextValue = vValue;
		if (oConfig.type === "integer" && Number.isInteger(Number(vValue))) {
			vNextValue = parseInt(vValue);
		}

		// If the editor is not visible, don't allow setting new values
		// to avoid unwanted updates and side effects like validation failures
		if (oConfig.visible === false) {
			return;
		}

		if (typeof vNextValue === "undefined" && typeof oConfig.defaultValue !== "undefined") {
			vNextValue = deepClone(oConfig.defaultValue);
		}

		this._validate(vNextValue, function (bResult) {
			if ((bResult || bSuppressValidation) && !deepEqual(vNextValue, vCurrentValue)) {
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
			this.setHasOwnError(!bResult);
		}.bind(this));
	};

	BasePropertyEditor.prototype.setDesigntimeMetadata = function (oValue) {
		var oCurrentMetadata = this.getDesigntimeMetadata();
		var oNextMetadata = oValue;
		cleanupDesigntimeMetadata(oNextMetadata);
		var oConfig = this.getConfig();

		if (!deepEqual(oCurrentMetadata, oNextMetadata)) {
			this.fireDesigntimeMetadataChange({
				path: oConfig.path,
				previousValue: oCurrentMetadata,
				value: oNextMetadata
			});
		}
	};

	BasePropertyEditor.prototype.getDesigntimeMetadata = function () {
		return (this.getConfig() || {}).designtime || {};
	};

	BasePropertyEditor.prototype.setDesigntimeMetadataValue = function (oValue) {
		this.setDesigntimeMetadata(
			Object.assign(
				{},
				this.getConfig().designtime,
				{
					__value: oValue
				}
			)
		);
	};

	BasePropertyEditor.prototype.getNestedDesigntimeMetadata = function (sKey) {
		var oDesigntimeMetadata = (this.getConfig() || {}).designtime || {};
		return oDesigntimeMetadata[sKey];
	};

	BasePropertyEditor.prototype.getNestedDesigntimeMetadataValue = function (sKey) {
		return (this.getNestedDesigntimeMetadata(sKey) || {}).__value || {};
	};

	BasePropertyEditor.prototype.getDesigntimeMetadataValue = function () {
		var oDesigntimeMetadata = (this.getConfig() || {}).designtime || {};
		return oDesigntimeMetadata.__value || {};
	};


	BasePropertyEditor.prototype._getValidators = function () {
		var oPropertyValidators = this.getConfig().validators || {};
		return values(Object.assign(
			{},
			this.getDefaultValidators(),
			oPropertyValidators
		)).filter(function (oValidator) {
			return oValidator.isEnabled !== false;
		});
	};

	/**
	 * @typedef {object} ValidatorErrorMessage
	 * @property {string} message - Custom error message i18n key with placeholders
	 * @property {function} placeholders - Resolves placeholders for the <code>message</code>. Invoked with validator configuration as a single argument.

	 * @typedef {object} ValidatorDefinition
	 * @property {string} type - Validator type, must be defined by <code>getDefaultValidatorModules</code>
	 * @property {string|ValidatorErrorMessage} errorMessage - Custom error message i18n key
	 * @property {Object<string, any>} config - Type-specific configuration
	 * @property {boolean} isEnabled - Whether the validator should run
	 */

	/**
	 * Returns the default validators which should run when a value is set.
	 * Can be overridden to specify default validators of custom editors.
	 * If validators with the same key are defined on the property level, they will
	 * override default validators.
	 *
	 * @returns {Object<string, ValidatorDefinition>} Map of validator keys and definitions
	 */
	BasePropertyEditor.prototype.getDefaultValidators = function () {
		return {};
	};

	BasePropertyEditor.prototype._validate = function (vValue, onValidationResult) {
		var aErrors = [];
		var aValidators = this._getValidators();

		aValidators = aValidators.map(function (mValidatorDefinition) {
			// Use custom validators if they were registered,
			// otherwise try to get a default validator
			var oValidator = ValidatorRegistry.hasValidator(mValidatorDefinition.type)
				? ValidatorRegistry.getValidator(mValidatorDefinition.type)
				: this.getDefaultValidatorModules()[mValidatorDefinition.type];

			if (!oValidator) {
				throw new Error("Unknown validator: " + mValidatorDefinition.type);
			}

			var oValidatorConfig = {};

			var vErrorMessage = mValidatorDefinition.errorMessage || oValidator.errorMessage;
			var aPlaceholders = [];
			var sErrorMessage = vErrorMessage;

			if (isPlainObject(vErrorMessage)) {
				aPlaceholders = vErrorMessage.placeholders(mValidatorDefinition.config);
				sErrorMessage = vErrorMessage.message;
			}

			Object.keys(mValidatorDefinition.config || {}).forEach(function (sConfigKey) {
				var vConfigValue = mValidatorDefinition.config[sConfigKey];
				if (typeof vConfigValue === "function") {
					vConfigValue = vConfigValue(this);
				}
				oValidatorConfig[sConfigKey] = vConfigValue;
			}.bind(this));

			return {
				validator: oValidator,
				config: oValidatorConfig,
				errorMessage: this.getI18nProperty(sErrorMessage, aPlaceholders),
				type: mValidatorDefinition.type
			};
		}.bind(this));

		var fnEvaluateResults = function () {
			var bResultIsValid = aErrors.length === 0;

			// Open task: Display all errors
			this.setInputState(!bResultIsValid, aErrors[0]);

			if (typeof onValidationResult === "function") {
				onValidationResult(bResultIsValid);
			}
		}.bind(this);

		aValidators.forEach(function (oValidator) {
			if (!oValidator.validator.validate(vValue, oValidator.config)) {
				aErrors.push(oValidator.errorMessage);
			}
		});
		fnEvaluateResults();
	};

	/**
	 * Sets the input state of the property editor control.
	 * Can be overridden to handle error messages differently inside custom editors.
	 *
	 * @param {boolean} bHasError - Whether an error should be displayed
	 * @param {string} sErrorMessage - Error message
	 */
	BasePropertyEditor.prototype.setInputState = function (bHasError, sErrorMessage) {
		this._sErrorMessage = bHasError && sErrorMessage;
		if (this.isReady()) {
			this._setInputState();
		}
	};

	BasePropertyEditor.prototype._setInputState = function () {
		var oInput = this.getContent();
		if (!oInput || !oInput.setValueState) {
			return;
		}

		var sErrorMessage = this._sErrorMessage;
		if (sErrorMessage) {
			oInput.setValueState("Error");
			oInput.setValueStateText(sErrorMessage);
		} else {
			oInput.setValueState("None");
		}
	};

	/**
	 * Returns the map of validator module paths which are required by the editor.
	 * Can be overridden in custom editors to require custom validators.
	 *
	 * @returns {Object<string, string>} Map of validator names and module paths
	 */
	BasePropertyEditor.prototype.getDefaultValidatorModules = function () {
		return BaseDefaultValidatorModules;
	};

	BasePropertyEditor.prototype._formatValue = function (vValue) {
		return this.formatValue(deepClone(vValue));
	};

	/**
	 * Hook which is called on value change. Can be overriden to format the editor value for displaying.
	 * The formatted value is set on the editor model as the display value.
	 *
	 * @param {*} vValue - Original editor value
	 * @returns {*} Formatted value
	 */
	BasePropertyEditor.prototype.formatValue = function (vValue) {
		return vValue;
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
		if (!this._bFragmentReady) {
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
		if (!this._oWrapperObserver) {
			this._oWrapperObserver = new ManagedObjectObserver(function (mutation) {
				var oObservedWrapper = mutation.object;
				switch (mutation.type) {
					case 'destroy':
						// Observe wrappers which are registered on the complex editor
						// to remove them from the ready check list when they are destroyed
						this._aEditorWrappers = this._aEditorWrappers.filter(function (oEditorWrapper) {
							return oEditorWrapper !== oObservedWrapper;
						});
						this._checkReadyState();
						this._checkForError();
						break;
					case 'parent':
						// Observed elements might contain nested wrappers
						findNestedWrappers(oObservedWrapper).forEach(function (oWrapper) {
							if (!isTemplate(oWrapper, this)) {
								this._registerWrapper(oWrapper);
							} else {
								observeRootParent(this._oWrapperObserver, oWrapper);
							}
						}.bind(this));
						this._oWrapperObserver.unobserve(oObservedWrapper);
						break;
					default:
						return;
				}
			}.bind(this));
		}

		var oWrapper = oEvent.getSource();
		if (isTemplate(oWrapper, this)) {
			// The element was not cloned from an aggregation template, therefore it is
			// not registered immediately
			// If the element is the aggregation template it must be ignored
			// Otherwise, if the element is not part of an aggregation inside its fragment
			// it should be registered as a wrapper nevertheless
			// In such a case, observing the parent change of the root element ensures that
			// the wrapper is properly registered when the fragment content is added to the
			// content aggregation of the parent BasePropertyEditor

			observeRootParent(this._oWrapperObserver, oWrapper);
			return;
		}

		this._registerWrapper(oWrapper);
	};

	function observeRootParent(oWrapperObserver, oWrapper) {
		var oRootElement = getRootParent(oWrapper);
		if (
			!oWrapperObserver.isObserved(oRootElement, {
				parent: true
			})
		) {
			oWrapperObserver.observe(oRootElement, {
				parent: true
			});
		}
	}

	function getRootParent(oElement) {
		var oParent = oElement.getParent();
		return oParent ? getRootParent(oParent) : oElement;
	}

	function findNestedWrappers(oElement) {
		return isWrapper(oElement)
			? [oElement]
			: oElement.findAggregatedObjects(true, function (oElement) {
				return isWrapper(oElement);
			});
	}

	function isWrapper(oElement) {
		return oElement.isA("sap.ui.integration.designtime.baseEditor.PropertyEditors")
			|| oElement.isA("sap.ui.integration.designtime.baseEditor.PropertyEditor");
	}

	BasePropertyEditor.prototype._registerWrapper = function (oWrapper) {
		this._aEditorWrappers.push(oWrapper);
		oWrapper.attachReady(function (oEvent) {
			// If a nested editor got unready without a value change on the parent editor
			// the ready state needs to be explicitly reevaluated to fire ready from the parent again
			this._setReady(false);
			this._checkReadyState();
		}.bind(this));

		oWrapper.attachValidationErrorChange(this._checkForError.bind(this));

		if (oWrapper.isA("sap.ui.integration.designtime.baseEditor.PropertyEditor")) {
			oWrapper.attachPropertyEditorChange(function (oEvent) {
				var oPropertyEditor = oEvent.getParameter("propertyEditor");
				if (!oPropertyEditor) {
					this._setReady(false);
				}
			}, this);
		}

		this._oWrapperObserver.observe(oWrapper, {
			destroy: true
		});
		// A new nested editor wrapper was registered, therefore the ready state must be reevaluated
		this._checkReadyState();
	};

	BasePropertyEditor.prototype._setReady = function (bReadyState) {
		var bPreviousReadyState = this._bIsReady;
		this._bIsReady = bReadyState;
		if (bPreviousReadyState !== true && bReadyState === true) {
			// If the editor was not ready before, fire the ready event
			this.fireReady();
		}
	};

	BasePropertyEditor.prototype.isReady = function () {
		return !!this._bIsReady;
	};

	BasePropertyEditor.prototype.setHasOwnError = function (bHasError) {
		this._bHasOwnError = bHasError;
		this._checkForError();
	};

	BasePropertyEditor.prototype._checkForError = function () {
		var bHasError = this.hasError();
		// If the error state switches, fire the event
		if (bHasError !== this._bHasError) {
			this._bHasError = bHasError;
			this.fireValidationErrorChange({
				hasError: bHasError
			});
		}
	};

	BasePropertyEditor.prototype.hasError = function () {
		return !!this._bHasOwnError || this._aEditorWrappers.some(function(oWrapper) {
			return oWrapper.hasError();
		});
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

	BasePropertyEditor.prototype.setFragment = function (sFragmentName, fnGetExpectedWrapperCount) {
		if (this._currentXmlFragment !== sFragmentName) {
			var sPreviousFragmentName = this._currentXmlFragment;
			this._currentXmlFragment = sFragmentName;
			if (typeof fnGetExpectedWrapperCount === 'function') {
				this.getExpectedWrapperCount = fnGetExpectedWrapperCount;
			}
			this.fireFragmentChange({
				previousFragment: sPreviousFragmentName,
				fragment: sFragmentName
			});
		}
	};

	BasePropertyEditor.prototype.getFragment = function () {
		return this._currentXmlFragment;
	};

	BasePropertyEditor.prototype._initFragment = function (sFragmentName) {
		this._setReady(false);
		this._bFragmentReady = false;

		if (this._oFragmentPromise) {
			this._oFragmentPromise.cancel();
		}

		var oFragmentPromise = new CancelablePromise(function (fnResolve, fnReject, onCancel) {
			onCancel.shouldReject = false;

			this._loadFragment(sFragmentName).then(fnResolve, fnReject);
		}.bind(this));
		this._oFragmentPromise = oFragmentPromise;

		return oFragmentPromise
			.then(function (oFragment) {
				if (oFragmentPromise.isCanceled) {
					oFragment.destroy();
					return;
				}

				this._bFragmentReady = true;
				this.setContent(oFragment);
				this.onFragmentReady();
				this._setInputState();
				// When the expected wrapper count was already set, initialization finished after the editor
				// value was set and the ready check might already have been executed and failed
				// Therefore execute the check again
				this._checkReadyState();
			}.bind(this));
	};

	BasePropertyEditor.prototype._loadFragment = function (sFragmentName) {
		return Fragment.load({
			name: sFragmentName,
			controller: this
		});
	};

	BasePropertyEditor.prototype.clone = function () {
		// as content is a public aggregation (to simplify creation of the property editors), we ensure it is not cloned
		// otherwise if PropertyEditor is used as template for the list binding,
		// constructor will be called once for the template and once for the cloned instance
		this.destroyContent();
		return Control.prototype.clone.apply(this, arguments);
	};

	BasePropertyEditor.prototype.exit = function () {
		this._oDefaultModel.destroy();

		if (this._oConfigBinding) {
			this._oConfigBinding.destroy();
		}

		if (this._oWrapperObserver) {
			this._oWrapperObserver.destroy();
		}

		if (this._oFragmentPromise) {
			this._oFragmentPromise.cancel();
		}
	};

	/**
	 * @typedef {object} EditorDefaultConfiguration
	 * @property {any} defaultValue - The default value
	 */

	BasePropertyEditor.configMetadata = {
		visible: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.FALLBACK_TYPE"
		}
	};

	BasePropertyEditor.prototype.setConfig = function (oConfig) {
		var oPreviousConfig = this.getConfig();

		var oDefaultConfig = {};
		var oConfigMetadata = PropertyEditorFactory.getByClassName(this.getMetadata().getName()).configMetadata;
		each(oConfigMetadata, function (sConfigKey, mConfigValue) {
			oDefaultConfig[sConfigKey] = mConfigValue.defaultValue;
		});

		var oNextConfig = Object.assign(
			{},
			oDefaultConfig,
			oConfig
		);

		oNextConfig = this.onBeforeConfigChange(oNextConfig);

		if (!deepEqual(oPreviousConfig, oNextConfig)) {
			this.setProperty("config", oNextConfig);
			this.fireConfigChange({
				previousConfig: oPreviousConfig,
				config: oNextConfig
			});
		}
	};

	/**
	 * Hook which is called with the config, merged from editor default config and the property config.
	 * Can be used to react on the final config or modify it.
	 *
	 * @param {object} oConfig - Original config
	 * @returns {object} Modified config
	 */
	BasePropertyEditor.prototype.onBeforeConfigChange = function (oConfig) {
		return oConfig;
	};

	BasePropertyEditor.prototype.getI18nProperty = function (sName, aPlaceholders) {
		if (this.getModel("i18n")) {
			return this.getModel("i18n").getResourceBundle().getText(sName, aPlaceholders);
		}
		return sName;
	};

	BasePropertyEditor.prototype.getLabel = function () {
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

	BasePropertyEditor.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		var oParent = this.getParent();

		if (oParent && oParent.enhanceAccessibilityState) {
			// use Field as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}
	};

	BasePropertyEditor.prototype.getFocusDomRef = function () {
		var oControl = this.getContent();

		if (oControl && oControl.isA("sap.ui.core.IFormContent")) {
			return oControl.getFocusDomRef();
		}
	};

	BasePropertyEditor.prototype.getIdForLabel = function () {
		var oControl = this.getContent();

		if (oControl && oControl.isA("sap.ui.core.IFormContent")) {
			return oControl.getIdForLabel();
		}
	};

	return BasePropertyEditor;
});
