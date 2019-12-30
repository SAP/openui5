/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/f/library",
		"sap/ui/base/ManagedObject",
		"sap/base/Log",
		"sap/f/cards/BindingResolver"],
	function (library,
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

		var AreaType = library.cards.AreaType;

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
			if (oAction && oAction.type === "Navigation") {
				this._attachNavigationAction(mItem);
			} else {
				//For now firing the event here, after refactor need to think of a way to sync async navigation setters
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
						return "Inactive";
					}

					return "Navigation";
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

				return "Inactive";
			};

			oItemTemplate.bindProperty("type", oBindingInfo);
		};

		CardActions.prototype._setSingleActionEnabledState = function (mItem) {
			var oAction = mItem.actions[0],
				oAreaControl = this._oAreaControl,
				oBindingContext = oAreaControl.getBindingContext(),
				mParameters = oAction.parameters,
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
						return "Inactive";
					}

					return "Navigation";
				};
			}

			if (oBindingInfo) {
				oItemTemplate.bindProperty("type", oBindingInfo);
			} else {
				sType = (oAction.enabled === false || oAction.enabled === "false") ? "Inactive" : "Navigation";
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

		CardActions.prototype._attachNavigationAction = function (mItem) {
			var oAction = mItem.actions[0],
				oActionControl = this.getAreaType() === AreaType.ContentItem ? this._oAreaControl._oItemTemplate : this._oAreaControl,
				fnHandler,
				bCheckEnabledState = true,
				sActionType = this.getAreaType(),
				bSingleAction = sActionType === AreaType.Header ||
					sActionType === AreaType.Content,
				bContentItemAction = sActionType === AreaType.ContentItem;

			var attachPress = function () {

				oActionControl.attachPress(fnHandler.bind(this));

				if (bSingleAction) {
					this._addClickableClass();
				}

			}.bind(this);

			if (oAction.service) {

				if (this.getAreaType() === AreaType.ContentItem) {
					this._setItemTemplateTypeFormatter(oAction);
				}

				fnHandler = function (oEvent) {
					var oSource = oEvent.getSource(),
						oBindingContext = oSource.getBindingContext(),
						oModel = oSource.getModel(),
						sPath;

					if (oBindingContext) {
						sPath = oBindingContext.getPath();
					}

					this._oAreaControl._oServiceManager.getService(_getServiceName(oAction.service))
						.then(function (oNavigationService) {
							if (oNavigationService) {
								oNavigationService.navigate({
									parameters: BindingResolver.resolveValue(oAction.parameters, oModel, sPath)
								});
							}
						})
						.catch(function (e) {
							Log.error("Navigation service unavailable", e);
						}).finally(function () {
						this._fireAction(oEvent.getSource(), oAction.parameters, oModel, sPath);
					}.bind(this));
				}.bind(this);

				// When there is a service let it handle the "enabled" state.
				// attachPress();
				bCheckEnabledState = false;
			} else {

				// When there is a list item template handle the "enabled" state with bindProperty + formatter
				if (bContentItemAction) {
					this._setItemTemplateEnabledState(oAction);
					bCheckEnabledState = false;
				}

				if (oAction.url) {
					fnHandler = function (oEvent) {
						var oSource = oEvent.getSource(),
							oBindingContext = oSource.getBindingContext(),
							oModel = oSource.getModel(),
							sPath,
							sUrl;

						if (oBindingContext) {
							sPath = oBindingContext.getPath();
						}
						sUrl = BindingResolver.resolveValue(oAction.url, oModel, sPath);

						// we are able to mock tests
						this.openUrl(sUrl, oAction);

						this._fireAction(oEvent.getSource(), oAction.parameters, oModel, sPath);
					}.bind(this);
				} else {
					fnHandler = function (oEvent) {
						var oSource = oEvent.getSource(),
							oBindingContext = oSource.getBindingContext(),
							oModel = oSource.getModel(),
							sPath;

						if (oBindingContext) {
							sPath = oBindingContext.getPath();
						}

						this._fireAction(oEvent.getSource(), oAction.parameters, oModel, sPath);
					}.bind(this);
				}
			}

			if (bSingleAction && oAction.service) {
				this._setSingleActionEnabledState(mItem).then(function (bEnabled) {
					if (bEnabled) {
						attachPress();
					}
					this._fireActionReady();
				}.bind(this));
			} else {
				// Handle the "enabled" state when there is no service and item template with formatter.
				if (bCheckEnabledState) {
					if (oAction.enabled !== false && oAction.enabled !== "false") {
						attachPress();
					}
				} else {
					attachPress();
				}

				this._fireActionReady();
			}
		};

		CardActions.prototype.openUrl = function (sUrl, oAction) {
			window.open(sUrl, oAction.target || "_blank");
		};

		CardActions.prototype._fireAction = function (oSource, oActionParams, oModel, sPath) {
			this._oAreaControl.fireEvent("action", {
				type: "Navigation",
				actionSource: oSource,
				manifestParameters: BindingResolver.resolveValue(oActionParams, oModel, sPath)
			});
		};

		return CardActions;
	});
