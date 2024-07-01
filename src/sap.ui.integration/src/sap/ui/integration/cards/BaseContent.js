/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer",
	"sap/f/cards/loading/GenericPlaceholder",
	"sap/m/MessageStrip",
	"sap/m/VBox",
	"sap/m/library",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/library",
	"sap/ui/integration/controls/BlockingMessage",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/util/merge",
	"sap/ui/integration/library"
], function (
	BaseContentRenderer,
	GenericPlaceholder,
	MessageStrip,
	VBox,
	mLibrary,
	IllustratedMessageType,
	IllustratedMessageSize,
	Control,
	Element,
	InvisibleMessage,
	coreLibrary,
	BlockingMessage,
	ObservableModel,
	ManagedObjectObserver,
	LoadingProvider,
	BindingHelper,
	BindingResolver,
	merge,
	library
) {
	"use strict";

	// shortcut for sap.ui.core.InvisibleMessageMode
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	// shortcut for sap.ui.integration.CardDesign
	var CardDesign = library.CardDesign;
	// shortcut for sap.ui.integration.CardBlockingMessageType
	var CardBlockingMessageType = library.CardBlockingMessageType;

	var CardPreviewMode = library.CardPreviewMode;

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
			properties: {
				/**
				 * Defines the design of the content.
				 * @experimental Since 1.109
				 * @since 1.109
				 */
				design: {
					type: "sap.ui.integration.CardDesign",
					group: "Appearance",
					defaultValue: CardDesign.Solid
				},

				/**
				 * Content configuration from the manifest
				 */
				configuration: {
					type: "object"
				},

				/**
				 * No data configuration from the manifest
				 */
				noDataConfiguration: {
					type: "object"
				}
			},
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
				 * Defines the internally used LoadingPlaceholder.
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
				},

				_blockingMessage: {
					type: "sap.ui.integration.controls.BlockingMessage",
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
		this.awaitEvent("_dataReady");
		this.awaitEvent("_actionContentReady");
	};

	BaseContent.prototype.onBeforeRendering = function () {
		const oCard = this.getCardInstance();

		if (!oCard) {
			return;
		}

		const oConfiguration = this.getParsedConfiguration();
		let oLoadingPlaceholder = this.getAggregation("_loadingPlaceholder");

		if (!oLoadingPlaceholder && oConfiguration) {
			this.setAggregation("_loadingPlaceholder", this.createLoadingPlaceholder(oConfiguration));
			oLoadingPlaceholder = this.getAggregation("_loadingPlaceholder");
		}

		if (oLoadingPlaceholder) {
			oLoadingPlaceholder.setRenderTooltip(oCard.getPreviewMode() !== CardPreviewMode.Abstract);

			if (typeof this._getTable === "function") {
				oLoadingPlaceholder.setHasContent((this._getTable().getColumns().length > 0));
			}
		}
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
		this.hideLoadingPlaceholders();
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
	 * @private
	 * @param {object} oConfiguration the content configuration
	 * @returns {sap.f.cards.loading.BasePlaceholder} placeholder instance
	 */
	BaseContent.prototype.createLoadingPlaceholder = function (oConfiguration) {
		return new GenericPlaceholder();
	};

	/**
	 * Can be used in subclasses to load lazy dependencies.
	 * @param {sap.ui.integration.util.Manifest} oCardManifest The card manifest.
	 * @returns {Promise} A promise that would be resolved in case of successful loading or rejected with error message.
	 */
	BaseContent.prototype.loadDependencies = function (oCardManifest) {
		return Promise.resolve();
	};

	/**
	 * Called after the dependencies are loaded and it's safe to apply the configuration.
	 * To be implemented by subclasses.
	 * @abstract
	 */
	BaseContent.prototype.applyConfiguration = function () { };

	BaseContent.prototype.setLoadDependenciesPromise = function (oPromise) {
		this._pLoadDependencies = oPromise;
		this.awaitEvent("_loadDependencies");

		this._pLoadDependencies.then(function () {
			this.fireEvent("_loadDependencies");
		}.bind(this));
	};

	BaseContent.prototype.getLoadDependenciesPromise = function () {
		return this._pLoadDependencies;
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
		this.showLoadingPlaceholders(true);
		this.attachEventOnce(sEvent, function () {
			this._oAwaitedEvents.delete(sEvent);

			if (this._oAwaitedEvents.size === 0) {
				this._bReady = true;
				this.hideLoadingPlaceholders();
				this.fireReady();
			}
		}.bind(this));
	};

	BaseContent.prototype._forceCompleteAwaitedEvents = function () {
		this._oAwaitedEvents.forEach(function (sEvent) {
			this.fireEvent(sEvent);
		}.bind(this));
	};

	/**
	 * Parses the configuration. As binding infos are modified when used once,
	 * new object is returned every time.
	 * @protected
	 * @returns {object} Parsed configuration - with binding infos
	 */
	BaseContent.prototype.getParsedConfiguration = function () {
		var oResult = merge({}, this.getConfiguration()),
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
	 * @ui5-restricted sap.ui.integration
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
		var oDomRef = this.getDomRef();

		oMessagePopup.destroyItems();
		oMessagePopup.addItem(oMessage);

		if (oDomRef && oDomRef.contains(document.activeElement)) {
			InvisibleMessage.getInstance().announce(sMessage, InvisibleMessageMode.Assertive);
		} else {
			InvisibleMessage.getInstance().announce(sMessage, InvisibleMessageMode.Polite);
		}
	};

	/**
	 * Hides the message previously shown by showMessage.
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	BaseContent.prototype.hideMessage = function () {
		var oMessagePopup = this._getMessageContainer();
		oMessagePopup.destroyItems();
	};

	BaseContent.prototype.showBlockingMessage = function (mSettings) {
		this.destroyAggregation("_blockingMessage");
		this.setAggregation("_blockingMessage", BlockingMessage.create(mSettings, this.getCardInstance()));
		this._forceCompleteAwaitedEvents();
	};

	BaseContent.prototype.hideBlockingMessage = function () {
		this.destroyAggregation("_blockingMessage");
	};

	BaseContent.prototype.getBlockingMessage = function () {
		var oBlockingMessage = this.getAggregation("_blockingMessage");

		if (oBlockingMessage) {
			return {
				type: oBlockingMessage.getType(),
				illustrationType: oBlockingMessage.getIllustrationType(),
				illustrationSize: oBlockingMessage.getIllustrationSize(),
				title: oBlockingMessage.getTitle(),
				description: oBlockingMessage.getDescription(),
				imageSrc: oBlockingMessage.getImageSrc(),
				httpResponse: oBlockingMessage.getHttpResponse(),
				additionalContent: oBlockingMessage.getAdditionalContent()
			};
		}

		return null;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {Object} The static configuration for the blocking message
	 */
	BaseContent.prototype.getBlockingMessageStaticConfiguration = function () {
		return this.getAggregation("_blockingMessage")?.getStaticConfiguration();
	};

	/**
	 * Show 'No Data' blocking message in the content. If there is configuration in the manifest, it will be applied.
	 * @protected
	 * @param {object} oSettings 'No Data' settings
	 * @param {sap.m.IllustratedMessageType|string} oSettings.illustrationType Illustration type
	 * @param {sap.m.IllustratedMessageSize} [oSettings.illustrationSize=sap.m.IllustratedMessageSize.Auto] Illustration size
	 * @param {string} oSettings.title Title
	 * @param {string} [oSettings.description] Description
	 */
	BaseContent.prototype.showNoDataMessage = function (oSettings) {
		var oNoDataConfiguration = this.getNoDataConfiguration() || {};

		oNoDataConfiguration = BindingResolver.resolveValue(oNoDataConfiguration, this.getCardInstance());

		var oMessageSettings = {
			type: CardBlockingMessageType.NoData,
			illustrationType: IllustratedMessageType[oNoDataConfiguration.type] || oNoDataConfiguration.type || oSettings.illustrationType,
			illustrationSize: IllustratedMessageSize[oNoDataConfiguration.size] || oSettings.illustrationSize,
			title: oNoDataConfiguration.title || oSettings.title,
			description: oNoDataConfiguration.description || oSettings.description
		};

		this.showBlockingMessage(oMessageSettings);
	};

	BaseContent.prototype.hideNoDataMessage = function () {
		this.hideBlockingMessage();
	};

	/**
	 * Requests data and bind it to the item template.
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration.util.ContentFactory
	 * @param {Object} oDataSettings The data part of the configuration object
	 */
	BaseContent.prototype.setDataConfiguration = function (oDataSettings) {
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

		if (oDataSettings.name) {
			oModel = oCard.getModel(oDataSettings.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			oModel.setSizeLimit(oCard.getModelSizeLimit());
			this.setModel(oModel);
		}

		if (!oModel) {
			this.fireEvent("_dataReady");
			return;
		}

		oModel.attachEvent("change", function () {
			// It is possible to receive change event after the content is destroyed
			this.getLoadDependenciesPromise().then(function (bLoadSuccessful){
				if (bLoadSuccessful && !this.isDestroyed()) {
					this.onDataChanged();
					this.onDataRequestComplete();
				}
			}.bind(this));
		}.bind(this));

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this.onDataRequested();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				var oData = oEvent.getParameter("data");

				this.getLoadDependenciesPromise().then(function (bLoadSuccessful){
					if (bLoadSuccessful && !this.isDestroyed()) {
						oModel.setData(oData);
					}
				}.bind(this));
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this.handleError({
					requestErrorParams: oEvent.getParameters(),
					requestSettings: this._oDataProvider.getSettings()
				});
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
	 * @param {boolean} [bForce] Show the loading placeholders regardless of the data provider type
	 * @ui5-restricted
	 */
	BaseContent.prototype.showLoadingPlaceholders = function (bForce) {
		if (!bForce && this._isDataProviderJson()) {
			return;
		}

		var oLoadingProvider = this.getAggregation("_loadingProvider"),
			oCard = this.getCardInstance();

		oLoadingProvider.setLoading(true);

		if (oCard) {
			oCard.addActiveLoadingProvider(oLoadingProvider);
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.hideLoadingPlaceholders = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider"),
			oCard = this.getCardInstance();

		if (!oLoadingProvider.getLoading()) {
			return;
		}

		oLoadingProvider.setLoading(false);

		if (oCard) {
			oCard.removeActiveLoadingProvider(oLoadingProvider);
		}
	};

	/**
	 * Called when the data for the content was changed either by the content or by the card.
	 * Override when special behaviour has to be implemented when data is changed.
	 * @virtual
	 */
	BaseContent.prototype.onDataChanged = function () { };

	BaseContent.prototype.onCardDataChanged = function () {
		this.getLoadDependenciesPromise().then(function (bLoadSuccessful){
			if (bLoadSuccessful && !this.isDestroyed()) {
				this.onDataChanged();
			}
		}.bind(this));
	};

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

		this._observeAggregation(sAggregation, oControl);
		oControl.bindAggregation(sAggregation, oBindingInfo);
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

			var sVisibleItemsCount = oAggregation.length;
			oAggregation.forEach(function (oItem) {
				if (oItem.isA("sap.m.GroupHeaderListItem")){
					sVisibleItemsCount -= 1;
				}
			});

			oParamsModel.setProperty("/visibleItems", sVisibleItemsCount);
		});

		oParamsModel.setProperty("/visibleItems", 0);
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

	/*
	* @protected
	@ param {object} mErrorInfo The error information object.
	*/
	BaseContent.prototype.handleError = function (mErrorInfo) {
		this.fireEvent("_error", { errorInfo: mErrorInfo });
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

	BaseContent.prototype.isLoading  = function () {
		if (!this.isReady()) {
			return true;
		}

		if (this._oDataProvider) {
			return this.getAggregation("_loadingProvider").getLoading();
		}

		var oCard = this.getCardInstance();

		return oCard && oCard.isLoading();
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
	* @ui5-restricted sap.ui.integration
	* @param {boolean} bShowValueState Defines if the input controls should display their value state
	* @param {boolean} bSkipFiringStateChangedEvent Defines if the firing of stateChanged event should not happen
	 */
	BaseContent.prototype.validateControls = function (bShowValueState, bSkipFiringStateChangedEvent) { };

	BaseContent.prototype.getCardInstance = function () {
		return Element.getElementById(this.getCard());
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

	BaseContent.prototype._isDataProviderJson = function () {
		return this._oDataProvider && this._oDataProvider.getSettings() && this._oDataProvider.getSettings()["json"];
	};

	/*
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	BaseContent.prototype.getHeaderTitleId = function () {
		var oCard = this.getCardInstance();

		if (!oCard) {
			return undefined;
		}

		return oCard.getId() + "-header-title-inner";
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} Whether the card has attached actions that are defined at content level
	 */
	BaseContent.prototype.isInteractive = function () {
		return this.hasListeners("press");
	};

	return BaseContent;
});
