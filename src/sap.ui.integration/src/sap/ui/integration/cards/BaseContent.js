/*!
 * ${copyright}
 */

/* global Set */

sap.ui.define([
	"./BaseContentRenderer",
	"sap/m/MessageStrip",
	"sap/m/VBox",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/library",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/util/merge"
], function (
	BaseContentRenderer,
	MessageStrip,
	VBox,
	mLibrary,
	Core,
	Control,
	InvisibleMessage,
	coreLibrary,
	ObservableModel,
	ManagedObjectObserver,
	LoadingProvider,
	BindingHelper,
	BindingResolver,
	merge
) {
	"use strict";

	// shortcut for sap.ui.core.InvisibleMessageMode
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	/**
	 * Constructor for a new <code>BaseContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A base control for all card contents.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.63
	 * @alias sap.ui.integration.cards.BaseContent
	 */
	var BaseContent = Control.extend("sap.ui.integration.cards.BaseContent", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {

				/**
				 * Defines the content of the control.
				 */
				_content: {
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the internally used LoadingProvider.
				 */
				_loadingProvider: {
					type: "sap.ui.core.Element",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the internally used LoadingProvider.
				 */
				_loadingPlaceholder: {
					type: "sap.ui.core.Element",
					multiple: false,
					visibility: "hidden"
				},

				_messageContainer: {
					type: "sap.m.VBox",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Associates a card to the content
				 */
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				}
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {},

				/**
				 * Fires after all internally awaited events are fired.
				 */
				ready: {}
			}
		},
		renderer: BaseContentRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	BaseContent.prototype.init = function () {
		this._oAwaitedEvents = new Set();
		this._bReady = false;
		this._mObservers = {};

		this.setAggregation("_loadingProvider", new LoadingProvider());
	};

	/**
	 * Handles tap event.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	BaseContent.prototype.ontap = function (oEvent) {
		if (!oEvent.isMarked()) {
			this.firePress({
				/* no parameters */
			});
		}
	};

	BaseContent.prototype.exit = function () {
		this._oAwaitedEvents = null;

		if (this._mObservers) {
			Object.keys(this._mObservers).forEach(function (sKey) {
				this._mObservers[sKey].disconnect();
				delete this._mObservers[sKey];
			}, this);
		}

		this._oServiceManager = null;
		this._oDataProviderFactory = null;
		this._oIconFormatter = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oActions) {
			this._oActions.destroy();
			this._oActions = null;
		}

		this._sContentBindingPath = null;
	};

	/**
	 * Can be used in subclasses to load lazy dependencies.
	 * @param {sap.ui.integration.util.Manifest} oCardManifest The card manifest.
	 * @returns {Promise} A promise that would be resolved in case of successful loading or rejected with error message.
	 */
	BaseContent.prototype.loadDependencies = function (oCardManifest) {
		return Promise.resolve();
	};

	BaseContent.prototype.getActions = function () {
		return this._oActions;
	};

	BaseContent.prototype.setActions = function (oActions) {
		this._oActions = oActions;
	};

	/**
	 * Await for an event which controls the overall "ready" state of the content.
	 * When there is at least 1 event awaited, loading placeholders are shown.
	 * After all awaited events happen loading placeholders are hidden and "ready" event is fired.
	 *
	 * @protected
	 * @param {string} sEvent The name of the event
	 */
	BaseContent.prototype.awaitEvent = function (sEvent) {
		if (this._oAwaitedEvents.has(sEvent)) {
			return;
		}

		this._bReady = false;
		this._oAwaitedEvents.add(sEvent);
		this.showLoadingPlaceholders();
		this.attachEventOnce(sEvent, function () {
			this._oAwaitedEvents.delete(sEvent);

			if (this._oAwaitedEvents.size === 0) {
				this._bReady = true;
				this.hideLoadingPlaceholders();
				this.fireReady();
			}
		}.bind(this));
	};

	/**
	 * @public
	 * @param {object} oConfiguration Content configuration from the manifest
	 * @param {string} sType The type of the content
	 * @returns {this} Pointer to the control instance to allow method chaining
	 */
	BaseContent.prototype.setConfiguration = function (oConfiguration, sType) {
		this._oConfiguration = oConfiguration;
		this.awaitEvent("_dataReady");
		this.awaitEvent("_actionContentReady");

		if (!oConfiguration) {
			return this;
		}

		var oLoadingPlaceholder = this.getAggregation("_loadingProvider").createContentPlaceholder(oConfiguration, sType, this.getCardInstance());
		this.setAggregation("_loadingPlaceholder", oLoadingPlaceholder);
		this._setDataConfiguration(oConfiguration.data);

		return this;
	};

	BaseContent.prototype.getConfiguration = function () {
		return this._oConfiguration;
	};

	/**
	 * Parses the configuration. As binding infos are modified when used once,
	 * new object is returned every time.
	 * @protected
	 * @returns {object} Parsed configuration - with binding infos
	 */
	BaseContent.prototype.getParsedConfiguration = function () {
		var oResult = merge({}, this._oConfiguration),
			oDataSettings = oResult.data;

		// do not create binding info for data
		delete oResult.data;
		oResult = BindingHelper.createBindingInfos(oResult, this.getCardInstance().getBindingNamespaces());

		if (oDataSettings) {
			oResult.data = oDataSettings;
		}

		return oResult;
	};

	/**
	 * @protected
	 * @returns {object} Content configuration with static items
	 */
	BaseContent.prototype.getStaticConfiguration = function () {
		return this.getConfiguration();
	};

	/**
	 * Displays a message strip above the content.
	 *
	 * @param {string} sMessage The message.
	 * @param {sap.ui.core.MessageType} sType Type of the message.
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.showMessage = function (sMessage, sType) {
		var oMessagePopup = this._getMessageContainer();
		var oMessage = new MessageStrip({
			text: BindingHelper.createBindingInfos(sMessage, this.getCardInstance().getBindingNamespaces()),
			type: sType,
			showCloseButton: true,
			showIcon: true,
			close: function () {
				this._getMessageContainer().destroy();
			}.bind(this)
		}).addStyleClass("sapFCardContentMessage");

		oMessagePopup.destroyItems();
		oMessagePopup.addItem(oMessage);

		if (this.getDomRef().contains(document.activeElement)) {
			InvisibleMessage.getInstance().announce(sMessage, InvisibleMessageMode.Assertive);
		} else {
			InvisibleMessage.getInstance().announce(sMessage, InvisibleMessageMode.Polite);
		}
	};

	/**
	 * Requests data and bind it to the item template.
	 *
	 * @private
	 * @param {Object} oDataSettings The data part of the configuration object
	 */
	BaseContent.prototype._setDataConfiguration = function (oDataSettings) {
		var oCard = this.getCardInstance(),
			oModel;

		if (!oDataSettings) {
			this._sContentBindingPath = null;
			this.fireEvent("_dataReady");
			return;
		}

		this._sContentBindingPath = BindingResolver.resolveValue(oDataSettings.path || "/", this.getCardInstance());
		this.bindObject(this._sContentBindingPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);
		this.getAggregation("_loadingProvider").setDataProvider(this._oDataProvider);

		if (oDataSettings.name) {
			oModel = oCard.getModel(oDataSettings.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			this.setModel(oModel);
		}

		if (!oModel) {
			this.fireEvent("_dataReady");
			return;
		}

		oModel.attachEvent("change", function () {
			// It is possible to receive change event after the content is destroyed
			// TO DO: unsubscribe from all events upon exit and remove this check
			if (!this.isDestroyed()) {
				this.onDataChanged();
				this.onDataRequestComplete();
			}
		}.bind(this));

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this.onDataRequested();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				oModel.setData(oEvent.getParameter("data"));
			});

			this._oDataProvider.attachError(function (oEvent) {
				this.handleError(oEvent.getParameter("message"));
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_dataReady");
		}
	};

	/**
	 * @protected
	 */
	BaseContent.prototype.onDataRequested = function () {
		this.awaitEvent("_dataReady");
	};

	/**
	 * @protected
	 */
	BaseContent.prototype.onDataRequestComplete = function () {
		var oCard = this.getCardInstance();

		this.fireEvent("_dataReady");

		if (oCard) {
			oCard._fireContentDataChange();
		}
	};

	/**
	 * @ui5-restricted
	 */
	BaseContent.prototype.refreshData = function () {
		if (this._oDataProvider) {
			this._oDataProvider.triggerDataUpdate();
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.showLoadingPlaceholders = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider");
		if (oLoadingProvider) {
			oLoadingProvider.setLoading(true);
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.hideLoadingPlaceholders = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider");
		if (oLoadingProvider) {
			oLoadingProvider.setLoading(false);
		}
	};

	/**
	 * Called when the data for the content was changed either by the content or by the card.
	 * Override when special behaviour has to be implemented when data is changed.
	 * @virtual
	 */
	BaseContent.prototype.onDataChanged = function () { };

	/**
	 * Binds an aggregation to the binding path of the BaseContent.
	 * Observes the aggregation to update parameters>/visibleItems.
	 *
	 * NOTE:
	 * For now items will always be bound to the content's binding context path.
	 * Later on this can be changed so that the content and items can have different binding context paths.
	 *
	 * Used for Card Content types which support aggregation binding (List, Table, Timeline).
	 *
	 * @protected
	 * @param {string} sAggregation The name of the aggregation to bind.
	 * @param {sap.ui.core.Control} oControl The control which aggregation is going to be bound.
	 * @param {Object} oBindingInfo The binding info.
	 */
	BaseContent.prototype._bindAggregationToControl = function (sAggregation, oControl, oBindingInfo) {
		var oCardBindingContext;

		if (!oBindingInfo) {
			return;
		}

		if (!oBindingInfo.path) {
			oBindingInfo.path = this._sContentBindingPath;
		}

		if (!oBindingInfo.path) {
			// path is given only on card level, so take it from there
			oCardBindingContext = this.getCardInstance().getBindingContext();
			oBindingInfo.path = oCardBindingContext && oCardBindingContext.getPath();
		}

		if (!oBindingInfo.path) {
			return;
		}

		oControl.bindAggregation(sAggregation, oBindingInfo);

		this._observeAggregation(sAggregation, oControl);
	};

	/**
	 * Observes the specified aggregation for changes and updates parameters>/visibleItems.
	 * @param {string} sAggregation The name of the aggregation to bind.
	 * @param {sap.ui.core.Control} oControl The control which aggregation is going to be bound.
	 */
	BaseContent.prototype._observeAggregation = function (sAggregation, oControl) {
		var oParamsModel = this.getCardInstance().getModel("parameters"),
			oObserver;

		if (this._mObservers[sAggregation]) {
			// already observed
			return;
		}

		oObserver = new ManagedObjectObserver(function (oChanges) {
			var oAggregation;

			if (oChanges.name !== sAggregation) {
				return;
			}

			if (!(oChanges.mutation === "insert" || oChanges.mutation === "remove")) {
				return;
			}

			// Use high level getter for aggregation - getItems(), getContent(), ...
			// Some controls like ListBase override the getter and it should be used.
			oAggregation = oControl.getMetadata().getAggregation(sAggregation).get(oControl);
			oParamsModel.setProperty("/visibleItems", oAggregation.length);
		});

		oObserver.observe(oControl, {
			aggregations: [sAggregation]
		});

		this._mObservers[sAggregation] = oObserver;
	};

	/**
	 * @returns {boolean} If the content is ready or not.
	 */
	BaseContent.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * @protected
	 * @param {string} sLogMessage Message that will be logged.
	 */
	BaseContent.prototype.handleError = function (sLogMessage) {
		this.fireEvent("_error", {
			logMessage: sLogMessage
		});
	};

	BaseContent.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	BaseContent.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	BaseContent.prototype.setIconFormatter = function (oIconFormatter) {
		this._oIconFormatter = oIconFormatter;
		return this;
	};

	BaseContent.prototype.isLoading = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider"),
			oCard = this.getCardInstance();

		return !oLoadingProvider.isDataProviderJson() && (oLoadingProvider.getLoading() || (oCard && oCard.isLoading()));
	};

	BaseContent.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	BaseContent.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	/**
	 * Callback prior the Submit Action
	 *
	 * It's called before the request is sent.
	 *
	 * @param {object} oFormData Parameters
	 */
	BaseContent.prototype.onActionSubmitStart = function (oFormData) {
	};

	/**
	 * Callback after Submit Action
	 *
	 * It's called when the request completes - either successfully or not.
	 *
	 * @param {object} oResponse The response from the server
	 * @param {object} oError The error object
	 */
	BaseContent.prototype.onActionSubmitEnd = function (oResponse, oError) {
	};

	/**
	* @private
	* @ui5-restricted
 	*/
	BaseContent.prototype.validateControls = function () { };

	BaseContent.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	BaseContent.prototype.isSkeleton = function () {
		var oCard = this.getCardInstance();
		return oCard && oCard.isSkeleton();
	};

	BaseContent.prototype.sliceData = function (iStartIndex, iEndIndex) { };

	BaseContent.prototype.getDataLength = function () {
		return 0;
	};

	BaseContent.prototype._getMessageContainer = function () {
		var oMessageContainer = this.getAggregation("_messageContainer");

		if (!oMessageContainer) {
			oMessageContainer = new VBox({
				renderType: mLibrary.FlexRendertype.Bare,
				alignItems: mLibrary.FlexAlignItems.Center
			}).addStyleClass("sapFCardContentMessageContainer");
			this.setAggregation("_messageContainer", oMessageContainer);
		}

		return oMessageContainer;
	};

	return BaseContent;
});
