/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log"],
	function (ManagedObject, Log) {
		"use strict";

		var ActionEnablement = {};

		function _attachActions(mItem, oControl) {
			if (!mItem.actions) {
				return;
			}

			// For now we allow for only one action of type navigation.
			var oAction = mItem.actions[0];
			if (oAction.type === "Navigation") {
				this._attachNavigationAction(mItem, oControl || this);
			}
		}

		// List card specific
		function _setItemTypeFormatter(oAction) {
			var that = this;

			var oBindingInfo = ManagedObject.bindingParser("{path:''}");
			// Async formatter to set ListItem type depending if the list item context is a correct navigation target (decided by the navigation service).
			oBindingInfo.formatter = function (vValue) {

				var oBindingContext = this.getBindingContext();

				if (vValue.__resolved) {
					if (vValue.__enabled) {
						return "Navigation";
					} else {
						return "Inactive";
					}
				}

				if (!vValue.__promise) {
					vValue.__promise = true;
					that._oServiceManager.getService("sap.ui.integration.services.Navigation").then(function (oNavigationService) {
						if (oNavigationService) {
							oNavigationService
								.enabled({
									parameters: _resolveBinding(oAction.parameters, oBindingContext)
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
				mParameters = oAction.parameters;

			if (oBindingContext) {
				mParameters = _resolveBinding(oAction.parameters, oBindingContext);
			}

			return new Promise(function (resolve) {
				this._oServiceManager.getService("sap.ui.integration.services.Navigation")
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

		// List card specific
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
			this.addStyleClass("sapFCardHeaderClickable");
		}

		function _resolveBinding(mParams, oContext) {
			var mResolvedParams = {};

			if (!oContext) {
				return mParams;
			}

			for (var sProp in mParams) {
				var vProp = mParams[sProp];

				if (vProp) {
					if (typeof vProp === "string") {
						mResolvedParams[sProp] = vProp;
						var oBindingInfo = ManagedObject.bindingParser(vProp);
						if (oBindingInfo) {
							mResolvedParams[sProp] = oContext.getProperty(oBindingInfo.path);
						}
					} else if (typeof vProp === "object") {
						mResolvedParams[sProp] = {};

						// Keep it simple for now and just traverse one more level of object nesting.
						// Improve the processing as a next step.
						for (var sSubProp in vProp) {
							mResolvedParams[sProp][sSubProp] = vProp[sSubProp];
							var oBindingInfo1 = ManagedObject.bindingParser(vProp[sSubProp]);
							if (oBindingInfo1) {
								mResolvedParams[sProp][sSubProp] = oContext.getProperty(oBindingInfo1.path);
							}
						}
					}
				}
			}

			return mResolvedParams;
		}

		function _attachNavigationAction(mItem, oControl) {
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
					var oSource = oEvent.getSource();
					var oBindingContext = oSource && oSource.getBindingContext();

					this._oServiceManager.getService("sap.ui.integration.services.Navigation")
						.then(function (oNavigationService) {
							if (oNavigationService) {
								oNavigationService.navigate({
									parameters: _resolveBinding(oAction.parameters, oBindingContext)
								});
							}
						})
						.catch(function (e) {
							Log.error("Navigation service unavailable", e);
						});
				};

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
						var oBindingInfo = ManagedObject.bindingParser(oAction.url);
						var sUrl = oAction.url;

						if (oBindingInfo) {
							sUrl = oEvent.getSource().getBindingContext().getProperty(oBindingInfo.path);
						}

						window.open(sUrl, oAction.target || "_blank");
					};
				} else {
					fnHandler = function (oEvent) {
						var oSource = oEvent.getSource();
						var oBindingContext = oSource.getBindingContext();

						this.fireEvent("onAction", {
							type: "Navigation",
							manifestParameters: _resolveBinding(oAction.parameters, oBindingContext)
						});
					};
				}
			}

			if (oControl.isA("sap.f.cards.IHeader") && oAction.service) {
				this._setHeaderActionEnabledState(mItem).then(function (bEnabled) {
					if (bEnabled) {
						attachPress();
					}
				});
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
			}
		}

		ActionEnablement.enrich = function (Control) {
			Control.prototype._attachActions = _attachActions;
			Control.prototype._attachNavigationAction = _attachNavigationAction;

			// For simplicity do type checking for now.
			if (Control.prototype.isA("sap.f.cards.ListContent")) {
				Control.prototype._setItemTypeFormatter = _setItemTypeFormatter;
				Control.prototype._setActionEnabledState = _setActionEnabledState;
			}
			if (Control.prototype.isA("sap.f.cards.IHeader")) {
				Control.prototype._addHeaderClasses = _addHeaderClasses;
				Control.prototype._setHeaderActionEnabledState = _setHeaderActionEnabledState;
			}
		};

	return ActionEnablement;
});
