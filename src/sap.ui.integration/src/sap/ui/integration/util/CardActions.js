/*!
 * ${copyright}
 */
sap.ui.define([
	"./BindingResolver",
	"../library",
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/util/openWindow",
	"sap/ui/base/ManagedObject"
], function (
	BindingResolver,
	library,
	Log,
	mLibrary,
	openWindow,
	ManagedObject
) {
		"use strict";

		function _getServiceName(vService) {
			if (vService && typeof vService === "object") {
				return vService.name;
			}

			return vService;
		}

		var ActionArea = library.CardActionArea,
			CardActionType = library.CardActionType;

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
					card: {type: "object"}
				}
			}
		});

		/**
		 * Listens for a press event on the provided area control and triggers an action with the provided parameters from the item.
		 * @private
		 * @param {object} oConfig Object containing configuration for the action
		 * @param {sap.ui.integration.CardActionArea} oConfig.area The area that describes what the action will be attached to
		 * @param {object[]} oConfig.actions Configuration object for the actions on an item
		 * @param {sap.ui.core.Control} oConfig.control The control that the action will be attached on
		 * @param {sap.ui.core.Control} [oConfig.actionControl] Optional control that the action will be attached on. If supplied, <code>oConfig.control</code> will not receive the action.
		 * @param {string} [oConfig.enabledPropertyName] Property of the control that will be maintained, based on the configuration of the actions.
		 * @param {*} [oConfig.enabledPropertyValue=true] The value <code>oConfig.enabledPropertyName</code> will be set to if the action is enabled.
		 * @param {*} [oConfig.disabledPropertyValue=false] The value <code>oConfig.disabledPropertyValue</code> will be set to if the action is disabled.
		 */
		CardActions.prototype.attach = function (oConfig) {
			var oControl = oConfig.control,
				sActionArea = oConfig.area;

				oConfig.actionControl = oConfig.actionControl || oConfig.control;
				oConfig.enabledPropertyValue = oConfig.enabledPropertyValue || true;
				oConfig.disabledPropertyValue = oConfig.disabledPropertyValue || false;

			if (!oConfig.actions) {
				// For now firing the event here, after refactor need to think
				// of a way to sync async navigation setters
				this._fireActionReady(oControl, sActionArea);

				return;
			}

			// For now we allow for only one action of type navigation.
			var oAction = oConfig.actions[0];
			if (oAction && oAction.type) { // todo - check if the type is valid
				oConfig.action = oAction;
				this._attachAction(oConfig);

			} else {
				// For now firing the event here, after refactor need to think of a way to sync async navigation setters
				this._fireActionReady(oControl, sActionArea);
			}
		};

		CardActions.prototype._attachAction = function (oConfig) {
			var oAction = oConfig.action,
				sActionArea = oConfig.area,
				oAreaControl = oConfig.control,
				oActionControl = oConfig.actionControl,
				sEnabledPropertyName = oConfig.enabledPropertyName,
				vEnabled = oConfig.enabledPropertyValue,
				vDisabled = oConfig.disabledPropertyValue,
				bCheckEnabledState = true,
				bSingleAction = this._isSingleAction(sActionArea),
				bActionEnabled = true;

			if (sEnabledPropertyName) {
				bCheckEnabledState = false;

				if (oAction.service && !bSingleAction) {
					// When there is a service let it handle the "enabled" state.
					this._setControlEnabledStateUsingService(oAction, oAreaControl, oActionControl, sEnabledPropertyName, vEnabled, vDisabled);
				} else {
					// Or when there is a list item template, handle the "enabled" state with bindProperty + formatter
					this._setControlEnabledState(oAction, oActionControl, sEnabledPropertyName, vEnabled, vDisabled);
				}
			}

			if (oAction.service && bSingleAction) {

				this._getSingleActionEnabledState(oAction, oAreaControl).then(function (bEnabled) {
					if (bEnabled) {
						this._attachPressEvent(oActionControl, oAction, oAreaControl);
					}

					this._fireActionReady(oAreaControl, sActionArea);
				}.bind(this));

				return;
			}

			if (bCheckEnabledState) {
				// Handle the "enabled" state when there is no service and item template with formatter.
				bActionEnabled = oAction.enabled !== false && oAction.enabled !== "false";
			}

			if (bActionEnabled) {
				this._attachPressEvent(oActionControl, oAction, oAreaControl);
			}

			this._fireActionReady(oAreaControl, sActionArea);
		};

		CardActions.prototype._setControlEnabledStateUsingService = function (oAction, oAreaControl, oActionControl, sPropertyName, vEnabled, vDisabled) {
			var oBindingInfo = ManagedObject.bindingParser("{path:''}");

			// Async formatter to set oActionControl's property depending
			// if the list item context is a correct navigation target (decided by the navigation service).
			oBindingInfo.formatter = function (vValue) {

				var oBindingContext = this.getBindingContext(),
					sPath,
					mParameters;

				if (oBindingContext) {
					sPath = oBindingContext.getPath();
				}

				mParameters = BindingResolver.resolveValue(oAction.parameters, oAreaControl, sPath);

				if (vValue.__resolved) {
					if (!vValue.__enabled || vValue.__enabled === "false") {
						return vDisabled;
					}

					return vEnabled;
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

				return vDisabled;
			};

			oActionControl.bindProperty(sPropertyName, oBindingInfo);
		};

		/**
		 * Binds property to the control using a formatter.
		 * @param {object} oAction The action object which contains binding infos.
		 * @param {sap.ui.core.Control} oControl The control instance.
		 * @param {string} sPropertyName The property name of the control to be bound.
		 * @param {*} vEnabled The value to be set if the property should be enabled.
		 * @param {*} vDisabled The value to be set if the property should be disabled.
		 */
		CardActions.prototype._setControlEnabledState = function (oAction, oControl, sPropertyName, vEnabled, vDisabled) {
			var oBindingInfo,
				bVal;

			if (typeof oAction.enabled === "object") {
				oBindingInfo = oAction.enabled;
				oBindingInfo.formatter = function (vValue) {
					if (!vValue || vValue === "false") {
						return vDisabled;
					}

					return vEnabled;
				};
			}

			if (oBindingInfo) {
				oControl.bindProperty(sPropertyName, oBindingInfo);
			} else {
				bVal = (oAction.enabled === false || oAction.enabled === "false") ? vDisabled : vEnabled;
				oControl.setProperty(sPropertyName, bVal);
			}
		};

		CardActions.prototype._getSingleActionEnabledState = function (oAction, oAreaControl) {
			var oBindingContext = oAreaControl.getBindingContext(),
				mParameters,
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			mParameters = BindingResolver.resolveValue(oAction.parameters, oAreaControl, sPath);

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

		CardActions.prototype._fireActionReady = function (oAreaControl, sActionArea) {
			var bHeader = sActionArea === ActionArea.Header;
			var sEventName = bHeader ? "_actionHeaderReady" : "_actionContentReady";
			oAreaControl.fireEvent(sEventName);
		};

		CardActions.prototype._handleServiceAction = function (oSource, oAction, oAreaControl) {
			var oBindingContext = oSource.getBindingContext(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			oAreaControl._oServiceManager.getService(_getServiceName(oAction.service))
				.then(function (oService) {
					if (oService) {
						oService.navigate({ // only for navigation?
							parameters: BindingResolver.resolveValue(oAction.parameters, oSource, sPath)
						});
					}
				})
				.catch(function (e) {
					Log.error("Navigation service unavailable", e);
				}).finally(function () {
				this._processAction(oSource, oAction, sPath);
			}.bind(this));
		};

		CardActions.prototype._handleAction = function (oSource, oAction) {
			var oBindingContext = oSource.getBindingContext(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			this._processAction(oSource, oAction, sPath);
		};

		CardActions.prototype._attachPressEvent = function (oActionControl, oAction, oAreaControl) {

			oActionControl.attachPress(function (oEvent) {
				var oSource = oEvent.getSource();

				if (oAction.service) {
					this._handleServiceAction(oSource, oAction, oAreaControl);
				} else {
					this._handleAction(oSource, oAction);
				}
			}.bind(this));
		};

		CardActions.prototype._processAction = function (oSource, oAction, sPath) {

			var oHost = this._getHostInstance(),
				oCard = this.getCard(),
				sUrl = oAction.url;

			if (sUrl) {
				sUrl = BindingResolver.resolveValue(sUrl, oSource, sPath);
			}

			CardActions.fireAction({
				card: oCard,
				host: oHost,
				action: oAction,
				parameters: BindingResolver.resolveValue(oAction.parameters, oSource, sPath),
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
				oExtension = oCard.getAggregation("_extension"),
				oAction = mConfig.action,
				mParameters = mConfig.parameters || {},
				mActionParams = {
					type: oAction.type,
					card: oCard,
					actionSource: mConfig.source,
					parameters: mParameters
				},
				mActionParamsLegacy = Object.assign({}, mActionParams, {
					manifestParameters: mParameters // for backward compatibility
				}),
				bActionResult = oCard.fireAction(mActionParamsLegacy);

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
				sType = oAction.type,
				sUrl,
				sTarget,
				sParametersUrl,
				sParametersTarget;

			if (mParameters) {
				sParametersUrl = mParameters.url;
				sParametersTarget = mParameters.target;
			}

			switch (sType) {
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
					if (typeof oAction.action === "function") {
						oAction.action(mConfig.card, mConfig.source);
					}
					break;
				case CardActionType.Submit:
					if (mConfig.source && mConfig.source.isA("sap.ui.integration.cards.BaseContent")) {
						CardActions.handleSubmitAction(mConfig);
					}
					break;
				default: break;
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
			openWindow(sUrl, sTarget);
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

		/**
		 * @param {sap.ui.integration.CardActionArea} sActionArea The area that describes what the action will be attached to
		 * @returns {boolean} If the action is configured for the header, content, or a detail of an item in the content of the card
		 */
		CardActions.prototype._isSingleAction = function (sActionArea) {
			return [ActionArea.Header, ActionArea.Content, ActionArea.ContentItemDetail].indexOf(sActionArea) > -1;
		};

		return CardActions;
	});
