/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/util/LoadingProvider"
], function (
	BaseContentRenderer,
	Core,
	Control,
	ObservableModel,
	ManagedObjectObserver,
	LoadingProvider
) {
	"use strict";

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
				press: {}
			}
		},
		renderer: BaseContentRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	BaseContent.prototype.init = function () {
		this._iWaitingEventsCount = 0;
		this._bReady = false;
		this._mObservers = {};

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");
		this._awaitEvent("_actionContentReady");

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
		this._iWaitingEventsCount = 0;

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

		if (this._oLoadingPlaceholder) {
			this._oLoadingPlaceholder.destroy();
			this._oLoadingPlaceholder = null;
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
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	BaseContent.prototype._awaitEvent = function (sEvent) {
		this._iWaitingEventsCount ++;
		this.attachEventOnce(sEvent, function () {
			this._iWaitingEventsCount --;

			if (this._iWaitingEventsCount === 0) {
				this._bReady = true;
				this.fireEvent("_ready");
			}
		}.bind(this));
	};


	BaseContent.prototype.setConfiguration = function (oConfiguration, sType) {

		this._oConfiguration = oConfiguration;

		if (!oConfiguration) {
			return this;
		}

		this._oLoadingPlaceholder = this.getAggregation("_loadingProvider").createContentPlaceholder(oConfiguration, sType);

		this._setDataConfiguration(oConfiguration.data);

		return this;
	};

	BaseContent.prototype.getConfiguration = function () {
		return this._oConfiguration;
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

		this._sContentBindingPath = oDataSettings.path || "/";
		this.bindObject(this._sContentBindingPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}
		if (this._oDataProviderFactory) {
			this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);
		}

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
			this.onDataChanged();

			this.onDataRequestComplete();
		}.bind(this));

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this.onDataRequested();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				oModel.setData(oEvent.getParameter("data"));
			});

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
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
		this.showLoadingPlaceholders();
	};

	/**
	 * @protected
	 */
	BaseContent.prototype.onDataRequestComplete = function () {
		this.fireEvent("_dataReady");
		this.hideLoadingPlaceholders();
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

		this.hideContent();
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

		this.showContent();
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.hideContent = function () {
		var oContent = this.getAggregation("_content");

		if (oContent) {
			oContent.addStyleClass("sapFCardContentHidden");
		}
	};

	/**
	 * @private
	 * @ui5-restricted
	 */
	BaseContent.prototype.showContent = function () {
		var oContent = this.getAggregation("_content");

		if (oContent) {
			// restore tab chain
			oContent.removeStyleClass("sapFCardContentHidden");
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

			oAggregation = oControl.getAggregation(sAggregation);
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

	BaseContent.prototype._handleError = function (sLogMessage) {
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

	BaseContent.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	return BaseContent;
});
