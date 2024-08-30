/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/cards/actions/CustomAction",
	"sap/ui/integration/cards/actions/DateChangeAction",
	"sap/ui/integration/cards/actions/MonthChangeAction",
	"sap/ui/integration/cards/actions/SubmitAction",
	"sap/ui/integration/cards/actions/NavigationAction",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/strings/capitalize",
	"sap/base/util/deepClone",
	"sap/ui/integration/cards/actions/ShowCardAction",
	"sap/ui/integration/cards/actions/HideCardAction"
], function (
	library,
	Log,
	ManagedObject,
	CustomAction,
	DateChangeAction,
	MonthChangeAction,
	SubmitAction,
	NavigationAction,
	BindingHelper,
	BindingResolver,
	capitalize,
	deepClone,
	ShowCardAction,
	HideCardAction
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
	 * @alias sap.ui.integration.cards.actions.CardActions
	 */
	var CardActions = ManagedObject.extend("sap.ui.integration.cards.actions.CardActions", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				card: {
					type: "object"
				},

				/**
				 * Set this function if specific binding path is needed.
				 * By default getBindingContext().getPath() is used.
				 */
				bindingPathResolver: {
					type: "function"
				}
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
	 * @param {string} [oConfig.eventName=press] Name of the event to attach to
	 */
	CardActions.prototype.attach = function (oConfig) {
		var oControl = oConfig.control,
			sActionArea = oConfig.area;

		oConfig.actionControl = oConfig.actionControl || oConfig.control;
		oConfig.enabledPropertyValue = oConfig.enabledPropertyValue !== undefined ? oConfig.enabledPropertyValue : true;
		oConfig.disabledPropertyValue = oConfig.disabledPropertyValue || false;
		oConfig.eventName = oConfig.eventName || "press";

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
			sEnabledPropertyName = oConfig.enabledPropertyName,
			bCheckEnabledState = true,
			bSingleAction = this._isSingleAction(sActionArea),
			bActionEnabled = true;

		if (sEnabledPropertyName) {
			bCheckEnabledState = false;

			if (oAction.service && !bSingleAction) {
				// When there is a service let it handle the "enabled" state.
				this._setControlEnabledStateUsingService(oConfig);
			} else {
				// Or when there is a list item template, handle the "enabled" state with bindProperty + formatter
				this._setControlEnabledState(oConfig);
			}
		}

		if (oAction.service && bSingleAction) {
			this._getSingleActionEnabledState(oAction, oAreaControl).then(function (bEnabled) {
				if (bEnabled) {
					this._attachEventListener(oConfig);
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
			this._attachEventListener(oConfig);
		}

		this._fireActionReady(oAreaControl, sActionArea);
	};

	CardActions.prototype._setControlEnabledStateUsingService = function (oConfig) {
		var oAction = oConfig.action,
			oAreaControl = oConfig.control,
			oActionControl = oConfig.actionControl,
			sEnabledPropertyName = oConfig.enabledPropertyName,
			vEnabled = oConfig.enabledPropertyValue,
			vDisabled = oConfig.disabledPropertyValue,
			oBindingInfo = ManagedObject.bindingParser("{path:''}");

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

		oActionControl.bindProperty(sEnabledPropertyName, oBindingInfo);
	};

	/**
	 * Binds property to the control using a formatter.
	 * @param {object} oConfig Object containing configuration for the action
	 * @param {object} oConfig.action The action object which contains binding infos.
	 * @param {sap.ui.core.Control} oConfig.actionControl The control instance.
	 * @param {string} oConfig.enabledPropertyName The property name of the control to be bound.
	 * @param {*} oConfig.enabledPropertyValue The value to be set if the property should be enabled.
	 * @param {*} oConfig.disabledPropertyValue The value to be set if the property should be disabled.
	 */
	CardActions.prototype._setControlEnabledState = function (oConfig) {
		var oAction = oConfig.action,
			oActionControl = oConfig.actionControl,
			sEnabledPropertyName = oConfig.enabledPropertyName,
			vEnabled = oConfig.enabledPropertyValue,
			vDisabled = oConfig.disabledPropertyValue,
			oBindingInfo,
			bVal;

		if (typeof oAction.enabled === "object") {
			oBindingInfo = BindingHelper.formattedProperty(oAction.enabled, function (vValue) {
				if (!vValue || vValue === "false") {
					return vDisabled;
				}

				return vEnabled;
			});
		}

		if (oBindingInfo) {
			oActionControl.bindProperty(sEnabledPropertyName, oBindingInfo);
		} else {
			bVal = (oAction.enabled === false || oAction.enabled === "false") ? vDisabled : vEnabled;
			oActionControl.setProperty(sEnabledPropertyName, bVal);
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

	CardActions.prototype._resolveBindingPath = function (oEvent) {
		var oBindingContext = oEvent.getSource().getBindingContext(),
			sPath;

		if (this.getBindingPathResolver()) {
			sPath = this.getBindingPathResolver()(oEvent);
		} else if (oBindingContext) {
			sPath = oBindingContext.getPath();
		}

		return sPath;
	};

	CardActions.prototype._handleServiceAction = function (oEvent, oAction, oAreaControl) {
		var oSource = oEvent.getSource();
		var sPath = this._resolveBindingPath(oEvent);

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

	CardActions.prototype._attachEventListener = function (oConfig) {
		var oAction = oConfig.action;

		oConfig.actionControl["attach" + capitalize(oConfig.eventName)](function (oEvent) {
			var oSource = oEvent.getSource();

			if (oAction.service) {
				this._handleServiceAction(oEvent, oAction, oConfig.control);
			} else {
				this._processAction(oSource, oAction, this._resolveBindingPath(oEvent));
			}
		}.bind(this));
	};

	CardActions.prototype._processAction = function (oSource, oAction, sPath) {
		var oHost = this._getHostInstance(),
			oCard = this.getCard();

		CardActions.fireAction({
			card: oCard,
			host: oHost,
			action: oAction,
			parameters: BindingResolver.resolveValue(oAction.parameters, oSource, sPath),
			source: oSource
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
		CardActions.fireAction({
			card: this.getCard(),
			host: this._getHostInstance(),
			action: {
				type: sType
			},
			parameters: mParameters,
			source: oSource
		});
	};

	// TODO: make this method private and allow usage only through an instance, i.e. new CardActions(...).fireAction(...)
	CardActions.fireAction = function (mConfig) {
		var oHost = mConfig.host,
			oCard = mConfig.card,
			oExtension = oCard.getAggregation("_extension"),
			sType = mConfig.action.type,
			mParameters = deepClone(mConfig.parameters, 100) || {},
			mEventParams = {
				type: sType,
				card: oCard,
				actionSource: mConfig.source
			},
			mEventParamsLegacy,
			bActionResult = true;

		if (sType === CardActionType.Submit || sType === CardActionType.Custom) {
			mEventParams.formData = oCard.getModel("form").getData();
		}

		if (sType === CardActionType.Submit) {
			mParameters.data = mParameters.data ?? oCard.getModel("form").getData(); // deprecated since 1.129
		}

		mEventParams.parameters = mParameters;

		mEventParamsLegacy = Object.assign({}, mEventParams, {
			manifestParameters: mParameters // for backward compatibility
		});

		if (oExtension) {
			bActionResult = oExtension.fireAction(mEventParams);
		}

		if (!bActionResult) {
			return false;
		}

		bActionResult = oCard.fireAction(mEventParamsLegacy);

		if (!bActionResult) {
			return false;
		}

		if (oHost) {
			bActionResult = oHost.fireAction(mEventParams);
		}

		if (!bActionResult) {
			return false;
		}

		var oHandler = CardActions._createHandler(mConfig);

		if (oHandler) {
			oHandler.execute();
			oHandler.destroy();
		}

		return true;
	};

	/**
	 * @param {sap.ui.integration.CardActionArea} sActionArea The area that describes what the action will be attached to
	 * @returns {boolean} If the action is configured for the header, content, or a detail of an item in the content of the card
	 */
	CardActions.prototype._isSingleAction = function (sActionArea) {
		return [ActionArea.Header,
			ActionArea.Content,
			ActionArea.ContentItemDetail,
			ActionArea.ActionsStrip].indexOf(sActionArea) > -1;
	};

	CardActions._createHandler = function (mConfig) {
		var _ActionClass = null;
		switch (mConfig.action.type) {
			case CardActionType.Custom:
				_ActionClass = CustomAction; break;
			case CardActionType.DateChange:
				_ActionClass = DateChangeAction; break;
			case CardActionType.HideCard:
				_ActionClass = HideCardAction; break;
			case CardActionType.MonthChange:
				_ActionClass = MonthChangeAction; break;
			case CardActionType.Navigation:
				_ActionClass = NavigationAction; break;
			case CardActionType.ShowCard:
				_ActionClass = ShowCardAction; break;
			case CardActionType.Submit:
				_ActionClass = SubmitAction; break;
			default:
				Log.error(
					"Unknown action type '" + mConfig.action.type + "'. Expected one of " + Object.values(CardActionType).join(", "),
					null,
					"sap.ui.integration.widgets.Card"
				);
		}

		if (_ActionClass) {
			return new _ActionClass({
				config: mConfig.action,
				parameters: mConfig.parameters,
				actionHandler: mConfig.card.getManifestEntry("/sap.card/configuration/actionHandlers/" + mConfig.action.type.toLowerCase()),
				card: mConfig.card,
				source: mConfig.source
			});
		}

		return null;
	};

	return CardActions;
});
