/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/f/cards/BindingResolver"],
	function (ManagedObject, Log, BindingResolver) {
		"use strict";

		var ActionEnablement = {};

		function _getServiceName(vService) {
			if (vService && typeof vService === "object") {
				return vService.name;
			}
			return vService;
		}

		function _attachActions(mItem, oControl) {
			if (!mItem.actions) {
				//For now firing the event here, after refactor need to think of a way to sync async navigation setters
				this._fireActionReady(oControl);

				return;
			}

			// For now we allow for only one action of type navigation.
			var oAction = mItem.actions[0];
			if (oAction && oAction.type === "Navigation") {
				this._attachNavigationAction(mItem, oControl || this);
			} else {
				//For now firing the event here, after refactor need to think of a way to sync async navigation setters
				this._fireActionReady(oControl);
			}
		}

		// List card specific
		function _setItemTypeFormatter(oAction) {
			var that = this;

			var oBindingInfo = ManagedObject.bindingParser("{path:''}");
			// Async formatter to set ListItem type depending if the list item context is a correct navigation target (decided by the navigation service).
			oBindingInfo.formatter = function (vValue) {

				var oBindingContext = this.getBindingContext(),
					oModel = this.getModel(),
					sPath;

				if (oBindingContext) {
					sPath = oBindingContext.getPath();
				}

				var mParameters = BindingResolver.resolveValue(oAction.parameters, oModel, sPath);

				if (vValue.__resolved) {
					if (vValue.__enabled) {
						return "Navigation";
					} else {
						return "Inactive";
					}
				}

				if (!vValue.__promise) {
					vValue.__promise = true;
					that._oServiceManager.getService(_getServiceName(oAction.service)).then(function (oNavigationService) {
						if (oNavigationService) {
							oNavigationService
								.enabled({
									parameters: mParameters
								})
								.then(function (bEnabled) {
									vValue.__resolved = true;
									vValue.__enabled = bEnabled;
									that.getModel().checkUpdate(true);
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
			this._oItemTemplate.bindProperty("type", oBindingInfo);
		}

		// Header specific
		function _setHeaderActionEnabledState(mItem) {
			var oAction = mItem.actions[0],
				oBindingContext = this.getBindingContext(),
				mParameters = oAction.parameters,
				oModel = this.getModel(),
				sPath;

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			mParameters = BindingResolver.resolveValue(oAction.parameters, oModel, sPath);

			return new Promise(function (resolve) {
				this._oServiceManager.getService(_getServiceName(oAction.service))
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
			}.bind(this));
		}

		// List and Table card specific
		function _setActionEnabledState(oAction) {

			var oBindingInfo;
			if (typeof oAction.enabled === "string") {
				oBindingInfo = ManagedObject.bindingParser(oAction.enabled);
				oBindingInfo.formatter = function (vValue) {
					if (vValue && (typeof vValue === "string")) {
						return "Navigation";
					} else {
						return "Inactive";
					}
				};
			}
			if (oBindingInfo) {
				this._oItemTemplate.bindProperty("type", oBindingInfo);
			} else {
				var bEnabled = oAction.enabled !== false ? true : false;
				var sType = bEnabled ? "Navigation" : "Inactive";
				this._oItemTemplate.setProperty("type", sType);
			}
		}

		// Header specific but could be generic
		function _addHeaderClasses() {
			this.addStyleClass("sapFCardClickable");
		}

		ActionEnablement._fireAction = function (oSource, oActionParams, oModel, sPath) {
			this.fireEvent("action", {
				type: "Navigation",
				actionSource: oSource,
				manifestParameters: BindingResolver.resolveValue(oActionParams, oModel, sPath)
			});
		};

		ActionEnablement.openUrl = function (sUrl, oAction) {
			window.open(sUrl, oAction.target || "_blank");
		};

		ActionEnablement._attachNavigationAction = function (mItem, oControl) {
			var oAction = mItem.actions[0];
			var fnHandler;
			var bCheckEnabledState = true;
			var attachPress = function () {
				oControl.attachPress(fnHandler.bind(this));
				if (this._addHeaderClasses) {
					this._addHeaderClasses();
				}
			}.bind(this);

			if (oAction.service) {
				if (this._setItemTypeFormatter) {
					this._setItemTypeFormatter(oAction);
				}

				fnHandler = function (oEvent) {
					var oSource = oEvent.getSource(),
						oBindingContext = oSource.getBindingContext(),
						oModel = oSource.getModel(),
						sPath;

					if (oBindingContext) {
						sPath = oBindingContext.getPath();
					}

					this._oServiceManager.getService(_getServiceName(oAction.service))
						.then(function (oNavigationService) {
							if (oNavigationService) {
								oNavigationService.navigate({
									parameters: BindingResolver.resolveValue(oAction.parameters, oModel, sPath)
								});
							}
						})
						.catch(function (e) {
							Log.error("Navigation service unavailable", e);
						}).finally( function () {
							ActionEnablement._fireAction.call(this, oEvent.getSource(), oAction.parameters, oModel, sPath);
						}.bind(this));
				}.bind(this);

				// When there is a service let it handle the "enabled" state.
				// attachPress();
				bCheckEnabledState = false;
			} else {
				// When there is a list item template handle the "enabled" state with bindProperty + formatter
				if (this._setActionEnabledState) {
					this._setActionEnabledState(oAction);
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
						//we are able to mock tests
						ActionEnablement.openUrl(sUrl, oAction);

						ActionEnablement._fireAction.call(this, oEvent.getSource(), oAction.parameters, oModel, sPath);
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

						ActionEnablement._fireAction.call(this, oEvent.getSource(), oAction.parameters, oModel, sPath);
					}.bind(this);
				}
			}

			if ((oControl.isA("sap.f.cards.IHeader") || oControl.isA("sap.f.cards.AnalyticalContent")) && oAction.service) {
				this._setHeaderActionEnabledState(mItem).then(function (bEnabled) {
					if (bEnabled) {
						attachPress();
					}
					this._fireActionReady(oControl);
				}.bind(this));
				return;
			} else {
				// Handle the "enabled" state when there is no service and item template with formatter.
				if (bCheckEnabledState) {
					if (oAction.enabled !== false) {
						attachPress();
					}
				} else {
					attachPress();
				}
				this._fireActionReady(oControl);
			}
		};

		function _fireActionReady (oControl) {
			if (oControl && oControl.isA("sap.f.cards.IHeader")) {
				this.fireEvent("_actionHeaderReady");
			} else {
				this.fireEvent("_actionContentReady");
			}
		}

		ActionEnablement.enrich = function (Control) {
			Control.prototype._attachActions = _attachActions;
			Control.prototype._attachNavigationAction = this._attachNavigationAction;
			Control.prototype._fireActionReady = _fireActionReady;

			// For simplicity do type checking for now.
			if (Control.prototype.isA("sap.f.cards.ListContent") || Control.prototype.isA("sap.f.cards.TableContent")) {
				Control.prototype._setItemTypeFormatter = _setItemTypeFormatter;
				Control.prototype._setActionEnabledState = _setActionEnabledState;
			}
			if (Control.prototype.isA("sap.f.cards.IHeader") || Control.prototype.isA("sap.f.cards.AnalyticalContent")) {
				Control.prototype._addHeaderClasses = _addHeaderClasses;
				//After refactor -> new name of function
				Control.prototype._setHeaderActionEnabledState = _setHeaderActionEnabledState;
			}
		};

	return ActionEnablement;
});
