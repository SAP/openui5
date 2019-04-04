/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/integration/util/CardManifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/f/cards/DataProviderFactory",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/Header",
	"sap/f/cards/BaseContent",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	'sap/ui/model/json/JSONModel',
	"sap/f/CardRenderer"
], function (
	jQuery,
	Control,
	CardManifest,
	ServiceManager,
	Log,
	DataProviderFactory,
	NumericHeader,
	Header,
	BaseContent,
	HBox,
	VBox,
	Icon,
	Text,
	JSONModel,
	CardRenderer
) {
	"use strict";

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type",
		DATA: "/sap.card/data",
		HEADER: "/sap.card/header",
		CONTENT: "/sap.card/content",
		SERVICES: "/sap.ui5/services",
		APP_TYPE: "/sap.app/type",
		PARAMS: "/sap.card/configuration/parameters"
	};

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a container with a header and content.
	 *
	 * <h3>Overview</h3>
	 * Cards are small user interface elements which provide the most important information from an
	 * application, related to a specific role or task in a compact manner, allowing for actions to be executed.
	 * Cards can be described as small representations of an application which can be integrated in different systems.
	 *
	 * The integration card is defined in a declarative way, using a manifest.json to:
	 * <ul>
	 * <li>Be easily integrated in applications</li>
	 * <li>Be easily reused across various applications.</li>
	 * <li>Be understandable by other technologies.</li>
	 * <li>Be self-contained (without external configuration).</li>
	 * <li>Be easily reconfigured in application layers (including backend).</li>
	 * <li>Separate the roles of the card developer and the application developer.</li>
	 * </ul>
	 *
	 * The role of the card developer is to describe the card in a manifest.json and define:
	 * <ul>
	 * <li>Header</li>
	 * <li>Content</li>
	 * <li>Data source</li>
	 * <li>Possible actions</li>
	 * </ul>
	 *
	 * The role of the application developer is to integrate the card into an application and define:
	 * <ul>
	 * <li>The dimensions of the card inside a layout of choice, using the width and height properties.</li>
	 * <li>The behavior for the actions described in the manifest.json, using the action event.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * The "sap.app" type property of the manifest must be set to "card".
	 * The namespace used to define a card is "sap.card".
	 * Every card has a type which can be one of the following: List, Analytical, Timeline, Object.
	 *
	 * An example of a manifest.json:
	 *
	 * <pre>
	 * <code>
	 * {
	 *   "sap.app": {
	 *     "type": "card",
	 *     ...
	 *   },
	 *   "sap.ui5": {
	 *     ...
	 *   },
	 *   "sap.card": {
	 *     "type": "List",
	 *     "header": { ... },
	 *     "content": { ... }
	 *   }
	 * }
	 * </code>
	 * </pre>
	 *
	 * Examples of header sections:
	 *
	 * The default header type can contain a title, a subtitle, an icon and status.
	 *  <pre>
	 *  <code>
	 * {
	 *   ...
	 *   "sap.card": {
	 *     "header": {
	 *       "title": "An example title",
	 *       "subTitle": "Some subtitle",
	 *       "icon": {
	 *         "src": "sap-icon://business-objects-experience"
	 *       },
	 *       "status": {
	 *         "text": "5 of 20"
	 *       }
	 *     },
	 *     ...
	 *   }
	 * }
	 *  </code>
	 *  </pre>
	 *
	 * The numeric header type can contain a title, a subtitle, unitOfMeasurement, details, main indicator and side indicators.
	 *  <pre>
	 *  <code>
	 * {
	 *   ...
	 *   "sap.card": {
	 *     "header": {
	 *       "type": "Numeric",
	 *       "title": "Project Cloud Transformation",
	 *       "subTitle": "Revenue",
	 *       "unitOfMeasurement": "EUR",
	 *       "mainIndicator": {
	 *         "number": "44",
	 *         "unit": "%",
	 *         "trend": "Down",
	 *         "state": "Critical"
	 *       },
	 *       "details": "Some details",
	 *       "sideIndicators": [
	 *         {
	 *           "title": "Target",
	 *           "number": "17",
	 *           "unit": "%"
	 *         },
	 *         {
	 *           "title": "Deviation",
	 *           "number": "5",
	 *           "unit": "%"
	 *         }
	 *       ]
	 *     },
	 *     ...
	 *   }
	 * }
	 *  </code>
	 *  </pre>
	 *
	 * The content of the card is created, based on the card type. Possible card types:
	 * <ul>
	 * <li>List</li>
	 * <li>Object</li>
	 * <li>Timeline</li>
	 * <li>Analytical</li>
	 * </ul>
	 *
	 * List card contains a set of items. The "item" property defines the template for all the items of the list.
	 * "data" property provides the data.
	 * Example:
	 * <pre>
	 * {
     *   "sap.app": {
     *     "type": "card"
     *   },
     *   "sap.card": {
     *     "type": "List",
     *     "header": {
	 *       ...
     *     },
     *     "content": {
     *       "data": {
     *         "json": [{
     *             "Name": "Comfort Easy",
     *             "Description": "A 32 GB Digital Assistant with a high-resolution color screen",
     *             "Highlight": "Error"
     *           },
     *           {
     *             "Name": "ITelO Vault",
     *             "Description": "A Digital Organizer with state-of-the-art Storage Encryption",
     *             "Highlight": "Warning"
     *           },
     *           {
     *             "Name": "Notebook Professional 15",
     *             "Description": "Notebook Professional 15 description",
     *             "Highlight": "Success"
     *           }
     *         ]
     *       },
     *       "item": {
     *         "title": {
     *           "label": "{{title_label}}",
     *           "value": "{Name}"
     *         },
     *         "description": {
     *           "label": "{{description_label}}",
     *           "value": "{Description}"
     *         },
     *         "highlight": "{Highlight}"
     *       }
     *     }
     *   }
     * }
	 * </pre>
	 *
	 * Analytical card contains a chart visualization configuration. Supported chart types are Line, StackedBar, StackedColumn, Donut.
	 * Example:
	 * <pre>
	 * <code>
	 * {
     *   "sap.app": {
     *     "type": "card"
     *   },
     *   "sap.card": {
     *     "type": "Analytical",
     *     "header": {
	 *       ...
     *     },
     *     "content": {
     *       "chartType": "Line",
     *       "legend": {
     *         "visible": true,
     *         "position": "Bottom",
     *         "alignment": "Left"
     *       },
     *       "plotArea": {
     *         "dataLabel": {
     *           "visible": true
     *         },
     *         "categoryAxisText": {
     *           "visible": false
     *         },
     *         "valueAxisText": {
     *           "visible": false
     *         }
     *       },
     *       "title": {
     *         "text": "Line chart",
     *         "visible": true,
     *         "alignment": "Left"
     *       },
     *       "measureAxis": "valueAxis",
     *       "dimensionAxis": "categoryAxis",
     *       "data": {
     *         "json": {
     *           "list": [
     *             {
     *               "Week": "CW14",
     *               "Revenue": 431000.22,
     *               "Cost": 230000.00,
     *               "Cost1": 24800.63,
     *               "Cost2": 205199.37,
     *               "Cost3": 199999.37,
     *               "Target": 500000.00,
     *               "Budget": 210000.00
     *             },
     *             {
     *               "Week": "CW15",
     *               "Revenue": 494000.30,
     *               "Cost": 238000.00,
     *               "Cost1": 99200.39,
     *               "Cost2": 138799.61,
     *               "Cost3": 200199.37,
     *               "Target": 500000.00,
     *               "Budget": 224000.00
     *             }
     *           ]
     *         },
     *         "path": "/list"
     *       },
     *       "dimensions": [
	 *         {
     *           "label": "Weeks",
     *           "value": "{Week}"
     *         }
	 *       ],
     *       "measures": [
	 *         {
     *           "label": "Revenue",
     *           "value": "{Revenue}"
     *         },
     *         {
     *           "label": "Cost",
     *           "value": "{Cost}"
     *         }
     *       ]
     *     }
     *   }
     * }
	 * </code>
	 * </pre>
	 *
	 * Object card contains information about an object. It is structured in groups.
	 * Every group can have a title and items. The items contain display name (label) and value.
	 * Example:
	 * <pre>
	 * <code>
	 * {
     *   "sap.app": {
     *     "type": "card"
     *   },
     *   "sap.card": {
	 * 	    "type": "Object",
	 *      "header": {
	 *        ...
	 *      },
	 *      "content": {
	 *        "groups": [
	 *          {
	 *            "title": "Group title",
	 *            "items": [
	 *              {
	 *                "label": "Name",
	 *                "value": "Ivan"
	 *              },
	 *              {
	 *                "label": "Surname",
	 *                "value": "Petrov"
	 *              },
	 *              {
	 *                "label": "Phone",
	 *                "value": "+1 1234 1234555"
	 *              }
	 *            ]
	 *          },
	 *          {
	 *            "title": "Organization",
	 *            "items": [
	 *              {
	 *                "label": "Company Name",
	 *                "value": "Sap",
	 *                "icon": {
	 *                  "src": "../images/Woman_avatar_02.png"
	 *                }
	 *              }
	 *            ]
	 *          }
	 *        ]
	 *      }
	 *   }
	 * }
	 * </code>
	 * </pre>
	 *
	 * Timeline card contains a set of timeline items. The "item" property defines the template for all the items of the timeline.
	 * Example:
	 * <pre>
	 * <code>
	 * {
     *   "sap.app": {
     *     "type": "card"
     *   },
     *   "sap.card": {
     *     "type": "Timeline",
     *     "header": {
	 *       ...
     *     },
     *     "content": {
     *       "data": {
     *         "json": [
     *           {
     *             "Title": "Weekly sync: Marketplace / Design Stream",
     *             "Description": "MRR WDF18 C3.2(GLASSBOX)",
     *             "Icon": "sap-icon://appointment-2",
     *             "Time": "10:00 - 10:30"
     *           },
     *           {
     *             "Title": "Video Conference for FLP@SF, S4,Hybris",
     *             "Icon": "sap-icon://my-view",
     *             "Time": "14:00 - 15:30"
     *           },
     *           {
     *             "Title": "Call 'Project Nimbus'",
     *             "Icon": "sap-icon://outgoing-call",
     *             "Time": "16:00 - 16:30"
     *           }
     *         ]
	 *       },
     *       "item": {
     *         "dateTime": {
     *           "value": "{Time}"
     *         },
     *         "description" : {
     *           "value": "{Description}"
     *         },
     *         "title": {
     *           "value": "{Title}"
     *         },
     *         "icon": {
     *           "src": "{Icon}"
     *         }
     *       }
     *     }
     *   }
     * }
	 * </code>
	 * </pre>
	 *
	 * Item-based cards (Timeline and List) have an additional content property "maxItems" which defines the maximum number of items the card can have.
	 *
	 * <h3>Data handling</h3>
	 * To add data to the card, you can add a data section to the card, header or content. The card will automatically create an unnamed model
	 * which can be used to resolve binding syntaxes inside the card manifest.
	 *
	 * Static data:
	 * <pre>
	 * <code>
	 * {
	 *   ...
     *   "content": {
     *     "data": {
     *       "json": {
	 *         "items": [
     *           {
     *             "Title": "Weekly sync: Marketplace / Design Stream",
     *             "Description": "MRR WDF18 C3.2(GLASSBOX)",
     *             "Icon": "sap-icon://appointment-2",
     *             "Time": "10:00 - 10:30"
     *           },
     *           {
     *             "Title": "Video Conference for FLP@SF, S4,Hybris",
     *             "Icon": "sap-icon://my-view",
     *             "Time": "14:00 - 15:30"
     *           }
     *         ]
	 *       },
     *       "path": "/items"
     *     },
	 *     ...
	 *   }
     * }
	 * </code>
	 * </pre>
	 *
	 * Requesting data:
	 * <pre>
	 * <code>
	 * {
	 *   ...
     *   "content": {
     *     "data": {
	 *       "request": {
	 *         "url": "/path/to/data"
	 *       },
     *       "path": "/items"
     *     },
	 *     ...
	 *   }
     * }
	 * </code>
	 * </pre>
	 *
	 * <h3>Actions</h3>
	 * Actions add behavior to the card. To add a navigation action to the header and to the items, you can configure it inside the manifest.
	 * Actions have:
	 * <ul>
	 * <li>Type</li>
	 * <li>Parameters</li>
	 * <li>Enabled flag (true by default)</li>
	 * </ul>
	 *
	 * In the example below, navigation action is added both to the header and the list items:
	 * <pre>
	 * <code>
	 * {
     *   "sap.app": {
     *     "type": "card"
     *   },
     *   "sap.card": {
     *     "type": "List",
     *     "header": {
     *       "title": "Request list content Card",
     *       "subTitle": "Card Subtitle",
     *       "icon": {
     *         "src": "sap-icon://accept"
     *       },
     *       "status": "100 of 200",
     *       "actions": [
     *         {
     *           "type": "Navigation",
     *           "parameters": {
     *             "url": "/some/relative/path"
     *           }
     *         }
     *       ]
     *     },
     *     "content": {
     *       "data": {
     *         "request": {
     *           "url": "./cardcontent/someitems_services2.json"
     *         },
     *         "path": "/items"
     *       },
     *       "item": {
     *         "icon": {
     *           "src": "{icon}"
     *         },
     *         "title": {
     *           "value": "{Name}"
     *         },
     *         "description": {
     *           "value": "{Description}"
     *         },
     *         "actions": [
     *           {
     *             "type": "Navigation",
     *             "enabled": "{= ${url}}",
     *             "parameters": {
     *               "url": "{url}"
     *             }
     *           }
     *         ]
     *       }
     *     }
     *   }
     * }
	 * </code>
	 * </pre>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>When you want to reuse the card across applications.</li>
	 * <li>When you need easy integration and configuration.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>When you need more header and content flexibility.</li>
	 * <li>When you have to achieve simple card visualization. For such cases, use: {@link sap.f.Card Card}.</li>
	 * <li>When you have to use an application model.. For such cases, use: {@link sap.f.Card Card}.</li>
	 * <li>When you need complex behavior. For such cases, use: {@link sap.f.Card Card}.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @constructor
	 * @since 1.62
	 * @alias sap.ui.integration.widgets.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = Control.extend("sap.ui.integration.widgets.Card", /** @lends sap.ui.integration.widgets.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			interfaces: ["sap.f.ICard"],
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
				 * Defines the width of the card.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "100%"
				},

				/**
				 * Defines the height of the card.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "auto"
				}
			},
			aggregations: {

				/**
				 * Defines the header of the card.
				 */
				_header: {
					type: "sap.f.cards.IHeader",
					multiple: false,
					visibility : "hidden"
				},

				/**
				 * Defines the content of the card.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility : "hidden"
				}
			},
			events: {

				/**
				 * Fired when an action is triggered on the card.
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
							type: "sap.ui.integration.CardActionType"
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
		renderer: CardRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Card.prototype.init = function () {
		this._initReadyState();
		this.setBusyIndicatorDelay(0);
	};

	/**
	 * Inits the ready state of the card by waiting for the required events.
	 *
	 * @private
	 */
	Card.prototype._initReadyState = function () {
		this._aReadyPromises = [];
		this._bApplyManifest = true;

		this._awaitEvent("_headerReady");
		this._awaitEvent("_contentReady");
		this._awaitEvent("_cardReady");

		this._oReadyPromise = Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));
	};

	/**
	 * Clears the ready state of the card.
	 *
	 * @private
	 */
	Card.prototype._clearReadyState = function () {
		this._bReady = false;
		this._aReadyPromises = [];
		this._oReadyPromise = null;
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	Card.prototype.onBeforeRendering = function () {
		var sConfig = this.getHostConfigurationId(),
			oParameters = this.getParameters();

		if (sConfig) {
			this.addStyleClass(sConfig.replace(/-/g, "_"));
		}

		if (this._oCardManifest && this._bApplyManifest) {
			this._oCardManifest.processParameters(oParameters);
			this._applyManifestSettings();
			this._bApplyManifest = false;
		}
	};

	/**
	 * Await for an event which controls the overall "ready" state of the card.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	Card.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	/**
	 * @public
	 * @experimental Since 1.65. The API might change.
	 * @returns {boolean} If the card is ready or not.
	 */
	Card.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Refreshes the card by re-applying the manifest settings and triggering all data requests.
	 *
	 * @public
	 * @experimental Since 1.65. The API might change.
	 */
	Card.prototype.refresh = function () {
		if (this._oCardManifest && this.isReady()) {
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
	Card.prototype.exit = function () {
		if (this._oCardManifest) {
			this._oCardManifest.destroy();
			this._oCardManifest = null;
		}
		if (this._oServiceManager) {
			this._oServiceManager.destroy();
			this._oServiceManager = null;
		}
		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}
		this._aReadyPromises = null;
	};

	/**
	 * Overwrites setter for card manifest.
	 *
	 * @public
	 * @param {string|Object} vValue The manifest object or its URL.
	 * @returns {sap.ui.integration.widgets.Card} Pointer to the control instance to allow method chaining.
	 */
	Card.prototype.setManifest = function (vValue) {
		this.setBusy(true);
		this.setProperty("manifest", vValue, true);

		if (typeof vValue === "string" && vValue !== "") {
			this._oCardManifest = new CardManifest();
			this._oCardManifest.load({ manifestUrl: vValue }).then(function () {
				this._bApplyManifest = true;
				this.invalidate();
			}.bind(this));
		} else if (typeof vValue === "object" && !jQuery.isEmptyObject(vValue)) {
			this._bApplyManifest = true;
			this._oCardManifest = new CardManifest(vValue);
		}

		return this;
	};

	/**
	 * Overwrites getter for card manifest.
	 *
	 * @public
	 * @returns {string|Object} Cloned of the parameters.
	 */
	Card.prototype.getManifest = function () {
		var vValue = this.getProperty("manifest");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Overwrites setter for card params.
	 *
	 * @public
	 * @param {Object} vValue oParameters Parameters set in the card trough parameters property.
	 * @returns {sap.ui.integration.widgets.Card} Pointer to the control instance to allow method chaining.
	 */
	Card.prototype.setParameters = function (vValue) {
		this._bApplyManifest = true;
		this.setBusy(true);
		this.setProperty("parameters", vValue);

		return this;
	};

	/**
	 * Overwrites getter for card parameters.
	 *
	 * @public
	 * @returns {Object} A Clone of the parameters.
	 */
	Card.prototype.getParameters = function () {
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
	Card.prototype._applyManifestSettings = function () {
		var sAppType = this._oCardManifest.get(MANIFEST_PATHS.APP_TYPE);
		if (sAppType && sAppType !== "card") {
			Log.error("sap.app/type entry in manifest is not 'card'");
		}

		this._applyServiceManifestSettings();
		this._applyDataManifestSettings();
		this._applyHeaderManifestSettings();
		this._applyContentManifestSettings();
	};

	Card.prototype._applyDataManifestSettings = function () {
		var oDataSettings = this._oCardManifest.get(MANIFEST_PATHS.DATA);
		if (!oDataSettings) {
			this.fireEvent("_cardReady");
			return;
		}

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = DataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this.getModel().setData(oEvent.getParameter("data"));
			}.bind(this));
			this._oDataProvider.attachError(function (oEvent) {
				this._handleError("Data service unavailable. " + oEvent.getParameter("message"));
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_cardReady");
			}.bind(this));
		}
	};

	/**
	 * Register all required services in the ServiceManager based on the card manifest.
	 *
	 * @private
	 */
	Card.prototype._applyServiceManifestSettings = function () {
		var oServiceFactoryReferences = this._oCardManifest.get(MANIFEST_PATHS.SERVICES);
		if (!oServiceFactoryReferences) {
			return;
		}

		if (!this._oServiceManager) {
			this._oServiceManager = new ServiceManager(oServiceFactoryReferences, this);
		}
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.f.cards.IHeader} The header of the card
	 * @protected
	 */
	Card.prototype.getCardHeader = function () {
		return this.getAggregation("_header");
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.ui.core.Control} The content of the card
	 * @protected
	 */
	Card.prototype.getCardContent = function () {
		return this.getAggregation("_content");
	};

	/**
	 * Lazily load and create a specific type of card header based on sap.card/header part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyHeaderManifestSettings = function () {
		var oManifestHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER);

		if (!oManifestHeader) {
			this.fireEvent("_headerReady");
			return;
		}

		var oHeader = Header;

		if (oManifestHeader.type === "Numeric") {
			oHeader = NumericHeader;
		}

		this._setCardHeader(oHeader);
	};

	/**
	 * Lazily load and create a specific type of card content based on sap.card/content part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyContentManifestSettings = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			bIsComponent = sCardType && sCardType.toLowerCase() === "component",
			oManifestContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			bHasContent = !!oManifestContent;

		if (bHasContent && !sCardType) {
			Log.error("Card type property is mandatory!");
			this.fireEvent("_contentReady");
			return;
		}

		if (!bHasContent && !bIsComponent) {
			this.setBusy(false);
			this.fireEvent("_contentReady");
			return;
		}

		if (!oManifestContent && bIsComponent) {
			oManifestContent = this._oCardManifest.getJson();
		}

		this._setTemporaryContent();

		BaseContent
			.create(sCardType, oManifestContent, this._oServiceManager)
			.then(function (oContent) {
				this._setCardContent(oContent);
			}.bind(this))
			.catch(function (sError) {
				this._handleError(sError);
			}.bind(this))
			.finally(function () {
				this.setBusy(false);
			}.bind(this));
	};

	/**
	 * Creates a header based on sap.card/header part of the manifest
	 *
	 * @private
	 * @param {sap.f.cards.IHeader} CardHeader The header to be created
	 */
	Card.prototype._setCardHeader = function (CardHeader) {
		var oSettings = this._oCardManifest.get(MANIFEST_PATHS.HEADER),
			oHeader = CardHeader.create(oSettings, this._oServiceManager);

		oHeader.attachEvent("action", function (oEvent) {
			this.fireEvent("action", {
				manifestParameters: oEvent.getParameter("manifestParameters"),
				actionSource: oEvent.getParameter("actionSource"),
				type: oEvent.getParameter("type")
			});
		}.bind(this));

		if (Array.isArray(oSettings.actions) && oSettings.actions.length > 0) {
			//this._setCardHeaderActions(oHeader, oSettings.actions);
			oHeader._attachActions(oSettings);
		}

		this.setAggregation("_header", oHeader);
		this._fireReady(oHeader, "_headerReady");
	};

	/**
	 * Fires a ready event for the card when header or content are ready.
	 *
	 * @private
	 * @param {sap.ui.core.Control} oControl The header or content of the card.
	 * @param {string} sReadyEventName The name of the event to fire when the control is ready.
	 */
	Card.prototype._fireReady = function (oControl, sReadyEventName) {
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
	 * Called on after rendering of the control.
	 * @private
	 */
	Card.prototype.onAfterRendering = function () {
		var sCardType;
		if (this._oCardManifest && this._oCardManifest.get(MANIFEST_PATHS.TYPE)) {
			sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase();
		}

		if (sCardType === "analytical") {
			this.$().addClass("sapFCardStretchableContent");
		}
	};

	/**
	 * Sets a card content.
	 *
	 * @private
	 * @param {sap.f.cards.BaseContent} oContent The card content instance to be configured.
	 */
	Card.prototype._setCardContent = function (oContent) {
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

		// TO DO: decide if we want to set the content only on _updated event.
		// This will help to avoid appearance of empty table before its data comes,
		// but prevent ObjectContent to render its template, which might be useful
		this.setAggregation("_content", oContent);
		this._fireReady(oContent, "_contentReady");
	};

	/**
	 * Sets a temporary content that will show a busy indicator while the actual content is loading.
	 */
	Card.prototype._setTemporaryContent = function () {

		var oHBox = new HBox({ busy: true, busyIndicatorDelay: 0, height: "100%" });

		oHBox.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}

				var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
					oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					sHeight = BaseContent.getMinHeight(sType, oContent);

				if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
					oHBox.$().css({ "min-height": sHeight });
				}
			}
		}, this);

		this.setAggregation("_content", oHBox);
	};

	/**
	 * Handler for error states
	 *
	 * @param {string} sLogMessage Message that will be logged.
	 * @param {string} [sDisplayMessage] Message that will be displayed in the card's content. If not provided, a default message is displayed.
	 * @private
	 */
	Card.prototype._handleError = function (sLogMessage, sDisplayMessage) {
		Log.error(sLogMessage);
		this.setBusy(false);

		this.fireEvent("_error");

		var sDefaultDisplayMessage = "Unable to load the data.",
			sErrorMessage = sDisplayMessage || sDefaultDisplayMessage;

		var oError = new HBox({
			height: "100%",
			justifyContent: "Center",
			items: [
				new VBox({
					justifyContent: "Center",
					alignItems: "Center",
					items: [
						new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
						new Text({ text: sErrorMessage })
					]
				})
			]
		});

		oError.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}

				var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
					oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					sHeight = BaseContent.getMinHeight(sType, oContent);

				if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
					oError.$().css({ "min-height": sHeight });
				}
			}
		}, this);

		this.setAggregation("_content", oError);
	};

	return Card;
});