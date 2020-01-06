/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/m/library",
		"sap/f/library",
		"sap/ui/base/ManagedObject",
		"sap/base/Log",
		"sap/f/cards/BindingResolver"],
	function (mLibrary,
			  library,
			  ManagedObject,
			  Log,
			  BindingResolver) {
		"use strict";

		function _getServiceName(vService) {
			if (vService && typeof vService === "object") {
				return vService.name;
			}

			return vService;
		}

		var AreaType = library.cards.AreaType,
			ActionType = library.cards.ActionType,
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
		 * @alias sap.f.cards.CardActions
		 */
		var CardActions = ManagedObject.extend("sap.f.cards.CardActions", {
			metadata: {
				properties: {
					card: {type: "object"},
					areaType: {type: "sap.f.cards.AreaType", defaultValue: AreaType.None}
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

		CardActions.prototype._addClickableClass = function () {
			this._oAreaControl.addStyleClass("sapFCardClickable");
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

			if (bSingleAction) {
				this._addClickableClass();
			}

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
				manifestParameters: BindingResolver.resolveValue(oAction.parameters, oModel, sPath),
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

		CardActions.fireAction = function (mConfig) {
			var oHost = mConfig.host,
				oCard = mConfig.card,
				oAction = mConfig.action,
				mActionParams = {
					type: oAction.type,
					card: oCard,
					actionSource: mConfig.source,
					manifestParameters: mConfig.manifestParameters || {}
				},
				bActionResult = oCard.fireAction(mActionParams);

			if (!bActionResult) {
				return false;
			}

			if (oHost) {
				bActionResult = oHost.fireOnAction(mActionParams);
			}

			if (bActionResult) {
				CardActions._doPredefinedAction(mConfig);
			}

			return bActionResult;
		};

		CardActions._doPredefinedAction = function (mConfig) {
			var oAction = mConfig.action,
				fnAction,
				sUrl;

			switch (oAction.type) {
				case ActionType.Navigation:
					sUrl = mConfig.url;
					if (sUrl) {
						window.open(sUrl, oAction.target || "_blank");
					}
					break;
				case ActionType.Custom:
					fnAction = oAction.action;
					if (fnAction && jQuery.isFunction(fnAction)) {
						fnAction(mConfig.card, mConfig.source);
					}
					break;
			}
		};

		return CardActions;
	});
