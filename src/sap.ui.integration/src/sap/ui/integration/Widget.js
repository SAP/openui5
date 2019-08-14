/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/util/Manifest",
	"sap/base/Log",
	"sap/f/cards/BaseContent",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/integration/WidgetRenderer",
	"sap/f/library",
	"sap/ui/integration/library",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/base/util/LoaderExtensions"
], function (
	jQuery,
	Core,
	Control,
	WidgetManifest,
	Log,
	BaseContent,
	JSONModel,
	ResourceModel,
	WidgetRenderer,
	fLibrary,
	library,
	HBox,
	VBox,
	Icon,
	Text,
	LoaderExtensions
) {
	"use strict";

	var MANIFEST_PATHS = {
		APP_TYPE: "/sap.app/type",
		PARAMS: "/sap.widget/configuration/parameters"
	};

	/**
	 * Constructor for a new <code>Widget</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a container for the component of the widget
	 *
	 * <h3>Overview</h3>
	 * Widgets are reuasable, self-contained user interface elements. They are configured via an app descriptor manifest.json file.
	 * Internally the widget is a @see{sap.ui.core.UIComponent}. It used the sap.app/type:widget in the manifest settings.
	 * Besides the settings of a manifest.json for a UI Component it also allows default configuration for a component instance, as well as design-time
	 * configuration.
	 *
	 * The role of the Widget developer is to describe the Widget in a manifest.json file and define:
	 * <ul>
	 * <li>Content</li>
	 * </ul>
	 *
	 * The role of the app developer is to integrate the Widget into the app and define:
	 * <ul>
	 * <li>The dimensions of the Widget inside a layout of choice, using the <code>width</code> and <code>height</code> properties</li>
	 * <li>The behavior for the actions described in the manifest.json file, using the action event</li>
	 * </ul>
	 *
	* <strong>You can learn more about integration Widgets in the <a href="test-resources/sap/ui/integration/demokit/WidgetExplorer/index.html">Widget Explorer</a></strong>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>When you want to reuse the Widget across apps.</li>
	 * <li>When you need easy integration and configuration.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>When you need more header and content flexibility.</li>
	 * <li>When you have to achieve simple Widget visualization. For such cases, use: {@link sap.f.Widget Widget}.</li>
	 * <li>When you have to use an application model. For such cases, use: {@link sap.f.Widget Widget}.</li>
	 * <li>When you need complex behavior. For such cases, use: {@link sap.f.Widget Widget}.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @constructor
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Widgets}
	 * @since 1.62
	 * @alias sap.ui.integration.widgets.Widget
	 *
	 * @experimental
	 *
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Widget = Control.extend("sap.ui.integration.Widget", /** @lends sap.ui.integration.widgets.Widget.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {

				/**
				 * The URL of the manifest or an object.
				 */
				manifest: {
					type: "any",
					defaultValue: ""
				},

				/**
				 * The parameters used in the manifest.
				 * @experimental Since 1.65. This property might be changed in future.
				 */
				parameters: {
					type: "object",
					defaultValue: null
				},
				/**
				 * The configuration used in the manifest within the sap.widget section
				 * This data will bbe merged on to of an already given manifest
				 * @experimental Since 1.65. This property might be changed in future.
				 */
				configuration: {
					type: "object"
				},

				/**
				 * Defines the width of the Widget.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "100%"
				},

				/**
				 * Defines the height of the Widget.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "auto"
				}
			},
			aggregations: {

				/**
				 * Defines the content of the Widget.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility : "hidden"
				}
			},
			events: {

				/**
				 * Fired when an action is triggered on the Widget.
				 * @experimental since 1.64
				 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				action: {
					parameters: {

						/**
						 * The action source.
						 */
						actionSource: {
							type: "sap.ui.core.Control"
						},

						/**
						 * The manifest parameters related to the triggered action.
						*/
						manifestParameters: {
							type: "object"
						},

						/**
						 * The type of the action.
						 */
						type: {
							type: "sap.ui.integration.WidgetActionType"
						}
					}
				}
			},
			associations: {

				/**
				 * The ID of the host configuration.
				 */
				hostConfigurationId: {}
			}
		},
		renderer: WidgetRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Widget.prototype.init = function () {
		this.setModel(new JSONModel(), "parameters");
		this._initReadyState();
		this.setBusyIndicatorDelay(0);
	};

	/**
	 * Inits the ready state of the Widget by waiting for the required events.
	 *
	 * @private
	 */
	Widget.prototype._initReadyState = function () {
		this._aReadyPromises = [];

		this._awaitEvent("_headerReady");
		this._awaitEvent("_contentReady");
		this._awaitEvent("_WidgetReady");

		this._oReadyPromise = Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));
	};

	/**
	 * Clears the ready state of the Widget.
	 *
	 * @private
	 */
	Widget.prototype._clearReadyState = function () {
		this._bReady = false;
		this._aReadyPromises = [];
		this._oReadyPromise = null;
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	Widget.prototype.onBeforeRendering = function () {
		var sConfig = this.getHostConfigurationId(),
			oParameters = this.getParameters();

		if (sConfig) {
			this.addStyleClass(sConfig.replace(/-/g, "_"));
		}

		if (this._oWidgetManifest && this._bApplyManifest) {
			this._oWidgetManifest.processParameters(oParameters);
			this._applyManifestSettings();
			this._bApplyManifest = false;
		}
	};

	/**
	 * Await for an event which controls the overall "ready" state of the Widget.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	Widget.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	/**
	 * @public
	 * @experimental Since 1.65. The API might change.
	 * @returns {boolean} If the Widget is ready or not.
	 */
	Widget.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Refreshes the Widget by re-applying the manifest settings and triggering all data requests.
	 *
	 * @public
	 * @experimental Since 1.65. The API might change.
	 */
	Widget.prototype.refresh = function () {
		if (this._oWidgetManifest) {
			this._clearReadyState();
			this._initReadyState();
			this._bApplyManifest = true;
			this.invalidate();
		}
	};

	/**
	 * Called on destroying the control
	 * @private
	 */
	Widget.prototype.exit = function () {
		if (this._oWidgetManifest) {
			this._oWidgetManifest.destroy();
			this._oWidgetManifest = null;
		}
		if (this._oServiceManager) {
			this._oServiceManager.destroy();
			this._oServiceManager = null;
		}

		// destroying the factory would also destroy the data provider
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
			this._oDataProviderFactory = null;
			this._oDataProvider = null;
		}

		if (this._oTemporaryContent) {
			this._oTemporaryContent.destroy();
			this._oTemporaryContent = null;
		}
		this._aReadyPromises = null;
	};

	/**
	 * Overwrites setter for Widget manifest.
	 *
	 * @public
	 * @param {string|Object} vValue The manifest object or its URL.
	 * @returns {sap.ui.integration.widgets.Widget} Pointer to the control instance to allow method chaining.
	 */
	Widget.prototype.setManifest = function (vValue) {
		this.setBusy(true);
		this.setProperty("manifest", vValue);

		if (typeof vValue === "string" && vValue !== "") {
			this._oWidgetManifest = new WidgetManifest("sap.widget");
			this._oWidgetManifest.load({ manifestUrl: vValue }).then(function () {
				if (this._oWidgetManifest && this._oWidgetManifest.getResourceBundle()) {
					var oResourceModel = new ResourceModel({
						bundle: this._oWidgetManifest.getResourceBundle()
					});
					oResourceModel.enhance(Core.getLibraryResourceBundle("sap.ui.integration"));
					this.setModel(oResourceModel, "i18n");
				}
				this._bApplyManifest = true;
				this.invalidate();
			}.bind(this));
		} else if (typeof vValue === "object" && !jQuery.isEmptyObject(vValue)) {
			this._bApplyManifest = true;
			this._oWidgetManifest = new WidgetManifest("sap.widget", vValue);
		}

		return this;
	};

	/**
	 * Overwrites getter for Widget manifest.
	 *
	 * @public
	 * @returns {string|Object} Cloned of the parameters.
	 */
	Widget.prototype.getManifest = function () {
		var vValue = this.getProperty("manifest");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Overwrites setter for Widget params.
	 *
	 * @public
	 * @param {Object} vValue oParameters Parameters set in the Widget trough parameters property.
	 * @returns {sap.ui.integration.widgets.Widget} Pointer to the control instance to allow method chaining.
	 */
	Widget.prototype.setParameters = function (vValue) {
		this._bApplyManifest = true;
		this.setBusy(true);
		this.setProperty("parameters", vValue);

		return this;
	};

	/**
	 * Overwrites setter for Widget settings.
	 *
	 * @public
	 * @param {Object} vValue Settings to set in the Widget trough parameters property.
	 * @returns {sap.ui.integration.widgets.Widget} Pointer to the control instance to allow method chaining.
	 */
	Widget.prototype.setConfiguration = function (vValue) {
		this._bApplyManifest = true;
		this.setBusy(true);
		this.setProperty("configuration", vValue);
		return this;
	};

	/**
	 * Overwrites getter for Widget parameters.
	 *
	 * @public
	 * @returns {Object} A Clone of the parameters.
	 */
	Widget.prototype.getParameters = function () {
		var vValue = this.getProperty("parameters");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready.
	 * This includes service registration, header and content creation, data requests.
	 *
	 * @private
	 */
	Widget.prototype._applyManifestSettings = function () {
		var sAppType = this._oWidgetManifest.get(MANIFEST_PATHS.APP_TYPE);
		if (sAppType && sAppType !== "widget") {
			Log.error("sap.app/type entry in manifest is not 'widget'");
		}
		this._applyContentManifestSettings();
	};

	/**
	 * Implements sap.f.IWidget interface.
	 *
	 * @returns {sap.ui.core.Control} The content of the Widget
	 * @protected
	 */
	Widget.prototype.getWidgetContent = function () {
		return this.getAggregation("_content");
	};

	/**
	 * Lazily load and create a specific type of Widget content based on sap.Widget/content part of the manifest
	 *
	 * @private
	 */
	Widget.prototype._applyContentManifestSettings = function () {
		//register module path

		this._setTemporaryContent();

		//in case the manifest is passed as url we need to register the module path
		var sPath = this.getManifest();
		if (typeof sPath === "string" && this._oWidgetManifest.oJson) {
			var sAppId = this._oWidgetManifest.oJson["sap.app"].id;
			LoaderExtensions.registerResourcePath(sAppId.replace(/\./g, "/"), sPath.substring(0,sPath.lastIndexOf("/")));
		}
		var oConfiguration = this.getConfiguration();
		this._oWidgetManifest.mergeConfiguration(oConfiguration);
		this.preferedStyle = this._oWidgetManifest.get("/sap.widget/preferedStyle");
		BaseContent
			.create("component", this._oWidgetManifest.getJson())
			.then(function (oContent) {
				this._setWidgetContent(oContent);
			}.bind(this))
			.catch(function (sError) {
				this._handleError(sError);
			}.bind(this))
			.finally(function () {
				this.setBusy(false);
			}.bind(this));
	};

	/**
	 * Fires a ready event for the Widget when header or content are ready.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oControl The header or content of the Widget.
	 * @param {string} sReadyEventName The name of the event to fire when the control is ready.
	 */
	Widget.prototype._fireReady = function (oControl, sReadyEventName) {
		if (oControl.isReady()) {
			this.fireEvent(sReadyEventName);
		} else {
			oControl.attachEvent("_ready", function () {
				this.fireEvent(sReadyEventName);
				this.setBusy(false);
			}.bind(this));
		}
	};

	/**
	 * Sets a Widget content.
	 *
	 * @private
	 * @param {sap.f.Widgets.BaseContent} oContent The Widget content instance to be configured.
	 */
	Widget.prototype._setWidgetContent = function (oContent) {
		oContent.attachEvent("action", function (oEvent) {
			this.fireEvent("action", {
				actionSource: oEvent.getParameter("actionSource"),
				manifestParameters: oEvent.getParameter("manifestParameters"),
				type: oEvent.getParameter("type")
			});
		}.bind(this));

		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("logMessage"), oEvent.getParameter("displayMessage"));
		}.bind(this));

		oContent.setBusyIndicatorDelay(0);

		var oPreviousContent = this.getAggregation("_content");

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== this._oTemporaryContent) {
			oPreviousContent.destroy();
		}

		// TO DO: decide if we want to set the content only on _updated event.
		// This will help to avoid appearance of empty table before its data comes,
		// but prevent ObjectContent to render its template, which might be useful
		this.setAggregation("_content", oContent);

		if (oContent.isReady()) {
			this.fireEvent("_contentReady");
		} else {
			oContent.attachEvent("_ready", function () {
				this.fireEvent("_contentReady");
			}.bind(this));
		}
	};

	/**
	 * Sets a temporary content that will show a busy indicator while the actual content is loading.
	 */
	Widget.prototype._setTemporaryContent = function () {

		var oTemporaryContent = this._getTemporaryContent(),
			oPreviousContent = this.getAggregation("_content");

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== oTemporaryContent) {
			oPreviousContent.destroy();
		}

		this.setAggregation("_content", oTemporaryContent);
	};

	/**
	 * Handler for error states
	 *
	 * @param {string} sLogMessage Message that will be logged.
	 * @param {string} [sDisplayMessage] Message that will be displayed in the Widget's content. If not provided, a default message is displayed.
	 * @private
	 */
	Widget.prototype._handleError = function (sLogMessage, sDisplayMessage) {
		Log.error(sLogMessage);
		this.setBusy(false);

		this.fireEvent("_error", {message:sLogMessage});

		var sDefaultDisplayMessage = "Unable to load the data.",
			sErrorMessage = sDisplayMessage || sDefaultDisplayMessage,
			oTemporaryContent = this._getTemporaryContent(),
			oPreviousContent = this.getAggregation("_content");

		var oError = new VBox({
			justifyContent: "Center",
			alignItems: "Center",
			items: [
				new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
				new Text({ text: sErrorMessage })
			]
		});

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== oTemporaryContent) {
			oPreviousContent.destroy();
			this.fireEvent("_contentReady"); // content won't show up so mark it as ready
		}

		oTemporaryContent.setBusy(false);
		oTemporaryContent.addItem(oError);

		this.setAggregation("_content", oTemporaryContent);
	};

	Widget.prototype._getTemporaryContent = function () {

		if (!this._oTemporaryContent) {
			this._oTemporaryContent = new HBox({
				height: "100%",
				justifyContent: "Center",
				busyIndicatorDelay: 0,
				busy: true
			});

			this._oTemporaryContent.addStyleClass("sapFWidgetContentBusy");

			this._oTemporaryContent.addEventDelegate({
				onAfterRendering: function () {
					if (!this._oWidgetManifest) {
						return;
					}

					var sType = "ComponentContent",
						sHeight = BaseContent.getMinHeight(sType);

					if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
						this._oTemporaryContent.$().css({ "min-height": sHeight });
					}
				}
			}, this);
		}

		this._oTemporaryContent.destroyItems();

		return this._oTemporaryContent;
	};

	return Widget;
});