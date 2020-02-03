/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"./../util/ObjectBinding",
	"./../util/isAggregationTemplate",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_merge",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/base/util/ObjectPath"
], function (
	Control,
	ObjectBinding,
	isAggregationTemplate,
	JSONModel,
	Label,
	Fragment,
	_merge,
	ManagedObjectObserver,
	createPromise,
	ObjectPath
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
				"config": {
					type: "any"
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
				 * Fired when the property of the editor has changed
				 */
				valueChange: {
					parameters: {
						/**
						 * Path in the context object where the change should happen
						 */
						path: {type: "string"},
						value: {type: "any"}
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
			Control.prototype.constructor.apply(this, arguments);
			this._oConfigModel = new JSONModel(this.getConfig());
			this._oConfigModel.setDefaultBindingMode("OneWay");
			this.setModel(this._oConfigModel);
			this.setBindingContext(this._oConfigModel.getContext("/"));
			this._setReady(false); // Ready state of the editor, will be evaluated when a value is set
			this._aEditorWrappers = [];

			this._bInitFinished = false; // Set to true after the fragment was loaded and asyncInit was executed
			this._loadFragment()
				.then(this.asyncInit.bind(this))
				.then(function () {
					this._bInitFinished = true;
					// When the expected wrapper count was already set, initialization finished after the editor
					// value was set and the ready check might already have been executed and failed
					// Therefore execute the check again
					if (typeof this._iExpectedWrapperCount !== "undefined") {
						this._checkReadyState();
					}
				}.bind(this));
		},

		/**
		 * Sets the editor value. If no value is provided, the default value provided
		 * in the config will be used instead. This method triggers the ready check,
		 * therefore it should also be called when overridden in complex editors.
		 *
		 * @param {*} [vValue] - Editor value that was already processed by a custom setValue implementation
		 */
		setValue: function (vValue) {
			// FIXME: do not mutate existing JS object! Prefer this.getModel().getData() / this.getModel().setData()
			var oConfig = this.getConfig();

			if (typeof vValue === "undefined" && typeof oConfig.defaultValue !== "undefined") {
				vValue = oConfig.defaultValue;
			}

			this._oConfigModel.setData(Object.assign(
				{},
				oConfig,
				{
					value: vValue
				}
			));
			oConfig.value = vValue; // backward compatibility

			this._iExpectedWrapperCount = this.getExpectedWrapperCount(vValue);
			// If the value of the editor changes, its nested editors might have changed as well
			// Therefore it must reevaluate the ready state
			this._setReady(false);
			this._checkReadyState();
		},

		/**
		 * Returns the number of wrappers that a complex editor should wait for.
		 * Should be overridden by all complex editors which depend on children.
		 * If the method is not overridden, it returns 0 which means that the editor is ready.
		 * @param {*} vValue - Value of the editor
		 * @returns {number} Number of wrappers to wait for, default is 0
		 */
		getExpectedWrapperCount: function (vValue) {
			return 0;
		},

		_checkReadyState: function () {
			if (this._mWrapperReadyCheck) {
				// Cancel the old ready check as the nested wrappers have changed
				this._mWrapperReadyCheck.cancel();
			}
			if (!this._bInitFinished) {
				// The editor itself is not ready yet, no need to check nested editors
				return;
			}
			if (typeof this._iExpectedWrapperCount === "undefined") {
				// Ready check was not initialized
				// If the expected wrapper count is not set then BasePropertyEditor.setValue was not correctly
				// called or the getExpectedWrapperCount calculation returns an invalid value
				throw new Error("Ready check was executed before setting the number of expected wrappers. Did you call BasePropertyEditor.prototype.setValue from your editor?");
			} else if (this._iExpectedWrapperCount === 0) {
				// If the editor is not complex and no nested editors are expected
				// the ready check resolves immediately
				this._setReady(true);
				return;
			}

			// Wait for the expected number of wrappers to report to the editor via _wrapperInit
			// If all wrappers are initialized, execute the ready check
			if (this._iExpectedWrapperCount === this._aEditorWrappers.length) {
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
		},

		/**
		 * Method to be passed to the nested editor wrapper as a callback for the ready event.
		 * Registers the source of the <code>oEvent</code> on the editor as an element to consider
		 * for the ready check.
		 *
		 * @param {object} oEvent - Init event of the nested editor
		 */
		wrapperInit: function (oEvent) {
			var oWrapper = oEvent.getSource();
			if (isAggregationTemplate(oWrapper)) {
				// The element is part of the template of the aggregation binding
				// and not a real wrapper
				return;
			}
			this._aEditorWrappers.push(oWrapper);
			// If the editor contains nested editors and setValue is called for the first time
			// an observer is created to handle the destruction of nested wrappers
			if (!this._oWrapperObserver) {
				// Observe wrappers which are registered on the complex editor
				// to remove them from the ready check list when they are destroyed
				this._oWrapperObserver = new ManagedObjectObserver(function (mutation) {
					this._aEditorWrappers.pop(mutation.object);
				}.bind(this));
			}
			this._oWrapperObserver.observe(oWrapper, {
				destroy: true
			});
			// A new nested editor wrapper was registered, therefore the ready state must be reevaluated
			this._checkReadyState();
		},

		_setReady: function (readyState) {
			var bPreviousReadyState = this._bIsReady;
			this._bIsReady = readyState;
			if (bPreviousReadyState !== true && readyState === true) {
				// If the editor was not ready before, fire the ready event
				this.fireReady();
			}
		},

		isReady: function () {
			return !!this._bIsReady;
		},

		/**
		 * Wait for the editor to be ready.
		 * @returns {Promise} Promise which will resolve once the editor is ready. Resolves immediately if the editor is currently ready.
		 */
		ready: function () {
			return new Promise(function (resolve) {
				if (this.isReady()) {
					// The editor is already ready, resolve immediately
					resolve();
				} else {
					this.attachEventOnce("ready", resolve);
				}
			}.bind(this));
		},

		_loadFragment: function () {
			if (!this.xmlFragment) {
				return Promise.resolve();
			}
			return Fragment.load({
				name: this.xmlFragment,
				controller: this
			}).then(function(oEditorControl) {
				this.setContent(oEditorControl);
			}.bind(this));
		},

		/**
		 * Override to execute logic after the editor fragment was loaded
		 */
		asyncInit: function () {
			return Promise.resolve();
		},

		clone: function() {
			// as content is a public aggregation (to simplify creation of the property editors), we ensure it is not cloned
			// otherwise if PropertyEditor is used as template for the list binding,
			// constructor will be called once for the template and once for the cloned instance
			this.destroyContent();
			return Control.prototype.clone.apply(this, arguments);
		},

		exit: function() {
			this._oConfigModel.destroy();
			if (this._oConfigBinding) {
				this._oConfigBinding.destroy();
			}
		},

		setConfig: function(oConfig) {
			var vReturn = this.setProperty("config", _merge({}, oConfig));
			this._initialize();
			return vReturn;
		},

		setModel: function(oModel, sName) {
			var vReturn = Control.prototype.setModel.apply(this, arguments);
			this._initialize();
			return vReturn;
		},

		getValue: function () {
			return this.getConfig().value;
		},

		_initialize: function() {
			var oConfig = this.getConfig();
			var oJsonModel = this.getModel("_context");
			if (oJsonModel && oConfig) {
				if (oConfig.path && !oConfig.value) {
					oConfig = Object.assign(
						{},
						oConfig,
						{
							value: "{context>" + oConfig.path + "}"
						}
					);
					// backward compatibility
					this.getConfig().value = oConfig.value;
				} else {
					this.setValue(oConfig.value); // backwards compatibility
				}
				// resolve binding strings
				if (!this._oConfigBinding) {
					this._oConfigBinding = new ObjectBinding();
					this._oConfigBinding.setModel(this.getModel("i18n"), "i18n");
					this._oConfigBinding.setModel(oJsonModel, "context");
					this._oConfigBinding.setBindingContext(oJsonModel.getContext("/"), "context");
					this.bindProperty("visible", "visible");
					this._oConfigBinding.attachChange(function(oEvent) {
						this._oConfigModel.checkUpdate();
						if (oEvent.getParameter("path") === "value") {
							this.setValue(oEvent.getParameter("value"));
						} else {
							// backward compatibility
							ObjectPath.set(
								oEvent.getParameter("path").split("/"),
								oEvent.getParameter("value"),
								this.getConfig()
							);
						}
					}.bind(this));
				}

				this._oConfigBinding.setObject(oConfig);
			}
		},

		getI18nProperty: function(sName) {
			return this.getModel("i18n").getProperty(sName);
		},

		getLabel: function() {
			var oLabel = this.getAggregation("_label");
			if (!oLabel) {
				oLabel = new Label({
					text: "{label}",
					design: "Bold"
				});
				this.setAggregation("_label", oLabel);
			}

			return oLabel;
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
		},

		fireValueChange: function(vValue) {
			this.fireEvent("valueChange", {
				path: this.getConfig().path,
				value: vValue
			});
		}
	});

	return BasePropertyEditor;
});
