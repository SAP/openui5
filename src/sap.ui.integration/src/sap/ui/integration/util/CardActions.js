/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/m/library",
		"sap/ui/integration/library",
		"sap/ui/base/ManagedObject",
		"sap/base/Log",
		"sap/ui/integration/util/BindingResolver",
		"sap/ui/integration/util/DataProviderFactory"],
	function (mLibrary,
			  library,
			  ManagedObject,
			  Log,
			  BindingResolver,
			  DataProviderFactory) {
		"use strict";

		function _getServiceName(vService) {
			if (vService && typeof vService === "object") {
				return vService.name;
			}

			return vService;
		}

		var AreaType = library.AreaType,
			CardActionType = library.CardActionType,
			ListType = mLibrary.ListType;

		/**
		 * Constructor for a new <code>CardActions</code>.
		 *
		 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new data provider.
		 *
		 * @class
		 *
		 *
		 * @extends sap.ui.base.ManagedObject
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.65
		 * @alias sap.ui.integration.util.CardActions
		 */
		var CardActions = ManagedObject.extend("sap.ui.integration.util.CardActions", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					card: {type: "object"},
					areaType: {type: "sap.ui.integration.AreaType", defaultValue: AreaType.None}
				}
			}
		});

		CardActions.prototype.exit = function () {
			this._oAreaControl = null;
		};

		CardActions.prototype.attach = function (mItem, oAreaControl) {
			this._oAreaControl = oAreaControl;

			if (!mItem.actions) {
				// For now firing the event here, after refactor need to think
				// of a way to sync async navigation setters
				this._fireActionReady();

				return;
			}

			// For now we allow for only one action of type navigation.
			var oAction = mItem.actions[0];
			if (oAction && oAction.type) { // todo - check if the type is valid
				this._attachAction(mItem, oAction);
			} else {
				// For now firing the event here, after refactor need to think of a way to sync async navigation setters
				this._fireActionReady();
			}
		};

		CardActions.prototype._setItemTemplateTypeFormatter = function (oAction) {
			var that = this,
				oAreaControl = that._oAreaControl,
				oItemTemplate = oAreaControl._oItemTemplate;

			var oBindingInfo = ManagedObject.bindingParser("{path:''}");

			// Async formatter to set ListItem type depending
			// if the list item context is a correct navigation target (decided by the navigation service).
			oBindingInfo.formatter = function (vValue) {

				var oBindingContext = this.getBindingContext(),
					oModel = this.getModel(),
					sPath,
					mParameters;

				if (oBindingContext) {
					sPath = oBindingContext.getPath();
				}

				mParameters = BindingResolver.resolveValue(oAction.parameters, oModel, sPath);

				if (vValue.__resolved) {
					if (!vValue.__enabled || vValue.__enabled === "false") {
						return ListType.Inactive;
					}

					return ListType.Navigation;
				}

				if (!vValue.__promise) {
					vValue.__promise = true;

					oAreaControl._oServiceManager.getService(_getServiceName(oAction.service))
						.then(function (oNavigationService) {
							if (oNavigationService) {
								oNavigationService
									.enabled({
										parameters: mParameters
									})
									.then(function (bEnabled) {
										vValue.__resolved = true;
										vValue.__enabled = bEnabled;
										oAreaControl.getModel().checkUpdate(true);
									})
									.catch(function () {
										vValue.__resolved = true;
										vValue.__enabled = false;
									});
							} else {
								vValue.__resolved = true;
								vValue.__enabled = false;
							}
						});
				}

				return ListType.Inactive;
			};

			oItemTemplate.bindProperty("type", oBindingInfo);
		};

		CardActions.prototype._setSingleActionEnabledState = function (mItem, oAction) {
			var oAreaControl = this._oAreaControl,
				oBindingContext = oAreaControl.getBindingContext(),
				mParameters,
				oModel = oAreaControl.getModel(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			mParameters = BindingResolver.resolveValue(oAction.parameters, oModel, sPath);

			return new Promise(function (resolve) {
				oAreaControl._oServiceManager.getService(_getServiceName(oAction.service))
					.then(function (oNavigationService) {
						if (oNavigationService) {
							oNavigationService
								.enabled({
									parameters: mParameters
								})
								.then(function (bEnabled) {
									resolve(bEnabled);
								})
								.catch(function () {
									resolve(false);
								});
						} else {
							resolve(false);
						}
					})
					.catch(function () {
						resolve(false);
					});
			});
		};

		/**
		 * Sets 'type' property of the list item template or binds it with a formatter.
		 *
		 * @param {object} oAction The action object which contains binding infos.
		 */
		CardActions.prototype._setItemTemplateEnabledState = function (oAction) {

			var oBindingInfo,
				sType,
				oItemTemplate = this._oAreaControl._oItemTemplate;

			if (typeof oAction.enabled === "object") {
				oBindingInfo = oAction.enabled;
				oBindingInfo.formatter = function (vValue) {
					if (!vValue || vValue === "false") {
						return ListType.Inactive;
					}

					return ListType.Navigation;
				};
			}

			if (oBindingInfo) {
				oItemTemplate.bindProperty("type", oBindingInfo);
			} else {
				sType = (oAction.enabled === false || oAction.enabled === "false") ? ListType.Inactive : ListType.Navigation;
				oItemTemplate.setProperty("type", sType);
			}
		};

		CardActions.prototype._fireActionReady = function () {
			var bHeader = this.getAreaType() === AreaType.Header;
			var sEventName = bHeader ? "_actionHeaderReady" : "_actionContentReady";
			this._oAreaControl.fireEvent(sEventName);
		};

		CardActions.prototype._handleServiceAction = function (oSource, oAction) {
			var oBindingContext = oSource.getBindingContext(),
				oModel = oSource.getModel(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			this._oAreaControl._oServiceManager.getService(_getServiceName(oAction.service))
				.then(function (oService) {
					if (oService) {
						oService.navigate({ // only for navigation?
							parameters: BindingResolver.resolveValue(oAction.parameters, oModel, sPath)
						});
					}
				})
				.catch(function (e) {
					Log.error("Navigation service unavailable", e);
				}).finally(function () {
				this._processAction(oSource, oAction, oModel, sPath);
			}.bind(this));
		};

		CardActions.prototype._handleAction = function (oSource, oAction) {
			var oBindingContext = oSource.getBindingContext(),
				oModel = oSource.getModel(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			this._processAction(oSource, oAction, oModel, sPath);
		};

		CardActions.prototype._attachPressEvent = function (oActionControl, oAction, bSingleAction) {

			oActionControl.attachPress(function (oEvent) {
				var oSource = oEvent.getSource();

				if (oAction.service) {
					this._handleServiceAction(oSource, oAction);
				} else {
					this._handleAction(oSource, oAction);
				}
			}.bind(this));
		};

		CardActions.prototype._attachAction = function (mItem, oAction) {
			var oActionControl = this.getAreaType() === AreaType.ContentItem ? this._oAreaControl._oItemTemplate : this._oAreaControl,
				bCheckEnabledState = true,
				sAreaType = this.getAreaType(),
				bSingleAction = sAreaType === AreaType.Header || sAreaType === AreaType.Content,
				bContentItemAction = sAreaType === AreaType.ContentItem,
				bActionEnabled = true;

			if (oAction.service) {

				if (this.getAreaType() === AreaType.ContentItem) {
					this._setItemTemplateTypeFormatter(oAction);
				}

				// When there is a service let it handle the "enabled" state.
				bCheckEnabledState = false;
			} else if (bContentItemAction) {

				this._setItemTemplateEnabledState(oAction);

				// When there is a list item template handle the "enabled" state with bindProperty + formatter
				bCheckEnabledState = false;
			}

			if (bSingleAction && oAction.service) {
				this._setSingleActionEnabledState(mItem, oAction).then(function (bEnabled) {
					if (bEnabled) {
						this._attachPressEvent(oActionControl, oAction, bSingleAction);
					}

					this._fireActionReady();
				}.bind(this));
			} else {
				if (bCheckEnabledState) {
					// Handle the "enabled" state when there is no service and item template with formatter.
					bActionEnabled = oAction.enabled !== false && oAction.enabled !== "false";
				}

				if (bActionEnabled) {
					this._attachPressEvent(oActionControl, oAction, bSingleAction);
				}

				this._fireActionReady();
			}
		};

		CardActions.prototype._processAction = function (oSource, oAction, oModel, sPath) {

			var oHost = this._getHostInstance(),
				oCard = this.getCard(),
				sUrl = oAction.url;

			if (sUrl) {
				sUrl = BindingResolver.resolveValue(sUrl, oModel, sPath);
			}

			CardActions.fireAction({
				card: oCard,
				host: oHost,
				action: oAction,
				parameters: BindingResolver.resolveValue(oAction.parameters, oModel, sPath),
				source: oSource,
				url: sUrl
			});
		};

		CardActions.prototype._getHostInstance = function () {
			var oCard = this.getCard();
			if (oCard) {
				return oCard.getHostInstance();
			}

			return null;
		};

		CardActions.prototype.fireAction = function (oSource, sType, mParameters) {
			var oHost = this._getHostInstance(),
				oCard = this.getCard(),
				oActionHandlingConfiguration = this._extractActionConfigurations(oCard, mParameters),
				oEventData = {
					card: oCard,
					host: oHost,
					action: {
						type: sType
					},
					parameters: oActionHandlingConfiguration,
					source: oSource
				};

			CardActions.fireAction(oEventData);
		};

		CardActions.fireAction = function (mConfig) {
			var oHost = mConfig.host,
				oCard = mConfig.card,
				oExtension = oCard._oExtension,
				oAction = mConfig.action,
				mParameters = mConfig.parameters || {},
				mActionParams = {
					type: oAction.type,
					card: oCard,
					actionSource: mConfig.source,
					manifestParameters: mParameters, // for backward compatibility
					parameters: mParameters
				},
				bActionResult = oCard.fireAction(mActionParams);

			if (!bActionResult) {
				return false;
			}

			if (oHost) {
				bActionResult = oHost.fireAction(mActionParams);
			}

			if (!bActionResult) {
				return false;
			}

			if (oExtension) {
				bActionResult = oExtension.fireAction(mActionParams);
			}

			if (bActionResult) {
				CardActions._doPredefinedAction(mConfig);
			}

			return bActionResult;
		};

		CardActions._doPredefinedAction = function (mConfig) {
			var oAction = mConfig.action,
				mParameters = mConfig.parameters,
				fnAction,
				sUrl,
				sTarget;

			if (mParameters) {
				var sParametersUrl = mParameters.url,
					sParametersTarget = mParameters.target;
			}

			switch (oAction.type) {
				case CardActionType.Navigation:
					if (oAction.service) {
						break;
					}

					sUrl = mConfig.url || sParametersUrl;
					sTarget = oAction.target || sParametersTarget || "_blank";
					if (sUrl) {
						CardActions.openUrl(sUrl, sTarget);
					}
					break;
				case CardActionType.Custom:
					fnAction = oAction.action;
					if (fnAction && jQuery.isFunction(fnAction)) {
						fnAction(mConfig.card, mConfig.source);
					}
					break;
				case CardActionType.Submit:
					if (mConfig.source && mConfig.source.isA("sap.ui.integration.cards.BaseContent")) {
						CardActions.handleSubmitAction(mConfig);
					}
					break;
			}
		};

		/**
		 * Navigates to url
		 *
		 * @param sUrl url to navigate to.
		 * @param sTarget target of the url
		 * @private
		 */
		CardActions.openUrl = function (sUrl, sTarget) {
			window.open(sUrl, sTarget);
		};

		/**
		 * Handles Submit action
		 *
		 * @param mConfig
		 * @private
		 * @static
		 */
		CardActions.handleSubmitAction = function (mConfig) {
			var oDataProvider,
				oCard = mConfig.card,
				oDataProviderFactory = oCard._oDataProviderFactory,
				oBaseContentInstance = mConfig.source,
				oActionParameters = mConfig.parameters;

			if (!oActionParameters.configuration) {
				return;
			}

			oBaseContentInstance.onActionSubmitStart(oActionParameters);

			oDataProvider = oDataProviderFactory.create({request: oActionParameters.configuration});

			oDataProvider.getData()
				.then(function (oResponse) {
					oBaseContentInstance.onActionSubmitEnd(oResponse, null);
				}, function (oError) {
					Log.error(oError);
					oBaseContentInstance.onActionSubmitEnd(null, {error: oError});
				})
				.finally(function () {
					// Cleanup the data provider
					oDataProviderFactory.remove(oDataProvider);
				});
		};

		/**
		 * Resolves manifest configurations for the Actions
		 *
		 * @param oCard {sap.ui.integration.widgets.Card}
		 * @param mParameters {Object}
		 * @returns {Object}
		 * @private
		 */
		CardActions.prototype._extractActionConfigurations = function (oCard, mParameters) {
			var oRequestConfig = oCard && oCard.getManifestEntry("/sap.card/configuration/actionHandlers/submit"),
				oData = mParameters.data || {};

			if (!oRequestConfig) {
				return mParameters;
			}

			return {
				data: oData,
				configuration: {
					"mode": oRequestConfig.mode || "cors",
					"url": oRequestConfig.url,
					"method": oRequestConfig.method || "POST",
					"parameters": Object.assign({}, oData, oRequestConfig.parameters),
					"headers": oRequestConfig.headers,
					"xhrFields": {
						"withCredentials": !!oRequestConfig.withCredentials
					}
				}
			};
		};

		return CardActions;
	});
