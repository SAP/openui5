/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/ui/base/ManagedObjectObserver", "sap/ui/core/Lib", "sap/ui/core/Messaging"],
	function(PluginBase, ManagedObjectObserver, Library, Messaging) {
	"use strict";

	/**
	 * Constructor for a new DataStateIndicator plugin.
	 *
	 * @param {string} [sId] ID for the new <code>DataStateIndicator</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>DataStateIndicator</code>
	 *
	 * @class
	 * This plugin implements a message strip used to show binding-related messages.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.73
	 * @alias sap.m.plugins.DataStateIndicator
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	var DataStateIndicator = PluginBase.extend("sap.m.plugins.DataStateIndicator", /** @lends sap.m.plugins.DataStateIndicator.prototype */ { metadata: {
		library: "sap.m",
		properties: {
			/**
			 * Defines a predicate to test each message of the data state.
			 *
			 * This callback gets called using the {@link sap.ui.core.message.Message message} and {@link sap.ui.core.Control related control} parameters.
			 * Return <code>true</code> to keep the message, <code>false</code> otherwise.
			 */
			filter: {type: "function", invalidate: false},

			/**
			 * Enables filtering for data state messages if this property is set to <code>true</code>. A link is provided to the user that allows them to filter.
			 * After the binding-related messages have been filtered by the user, all the existing filters are only taken into account once the message filter has been cleared again.
			 *
			 * <b>Note:</b> This feature must be enabled for OData models only.
			 * @since 1.89
			 */
			enableFiltering: { type: "boolean", defaultValue: false, invalidate: false }
		},
		events: {
			/**
			 * This event is fired when the {@link sap.ui.model.DataState data state} of the plugin parent is changed.
			 */
			dataStateChange: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * The data state object.
					 */
					dataState: {type: "sap.ui.model.DataState"},
					/**
					 * The messages ({@link sap.ui.core.message.Message}) from the current <code>dataState</code> object filtered by the given <code>filter</code> function.
					 */
					filteredMessages: {type: "object[]"}
				}
			},

			/**
			 * This event is fired when the user filters data state messages and if the <code>enableFiltering</code> property is set to <code>true</code>.
			 *
			 * @since 1.89
			 */
			applyFilter: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * The filter object representing the entries with messages.
					 */
					filter: {type: "sap.ui.model.Filter"}
				}
			},

			/**
			 * This event is fired when the user clears the data state message filter and if the <code>enableFiltering</code> property is set to <code>true</code>.
			 *
			 * @since 1.89
			 */
			clearFilter: {
				allowPreventDefault: true
			},

			/**
			 * This event is fired when the user presses the <code>Close</code> button of the <code>MessageStrip</code> control which is managed by this plugin.
			 *
			 * @since 1.103
			 */
			close: {}
		}
	}});

	DataStateIndicator.findOn = PluginBase.findOn;

	DataStateIndicator.prototype.init = function() {
		this._fnOnAggregatedDataStateChange = this._onAggregatedDataStateChange.bind(this);
	};

	DataStateIndicator.prototype.onActivate = function(oControl) {
		this._bFiltering = false;
		var sBindingName = this._getBindingName();
		var oBinding = oControl.getBinding(sBindingName);

		if (oBinding) {
			oBinding.attachAggregatedDataStateChange(this._fnOnAggregatedDataStateChange);
			this._processDataState(oBinding.getDataState());
		}

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._oObserver.observe(oControl, { bindings: [sBindingName] });
	};

	DataStateIndicator.prototype.onDeactivate = function(oControl) {
		var sBindingName = this._getBindingName();
		var oBinding = oControl.getBinding(sBindingName);

		if (oBinding) {
			oBinding.detachAggregatedDataStateChange(this._fnOnAggregatedDataStateChange);
			oBinding.getDataState().getMessages().forEach(function(oMessage) {
				oMessage.removeControlId(oControl.getId());
			});
		}

		if (this._bFiltering) {
			this._clearFilter();
		}

		if (this._oMessageStrip) {
			oControl.removeAriaLabelledBy(this._oMessageStrip);
			this._oMessageStrip.destroy();
			this._oMessageStrip = null;
		}

		if (this._oLink) {
			this._oLink.destroy();
			this._oLink = null;
		}

		if (this._oInfoToolbar) {
			this._oInfoToolbar.destroy();
			this._oInfoToolbar = this._oInfoText = null;
		}

		this._oObserver.unobserve(oControl, { bindings: [sBindingName] });
		this._oObserver.destroy();
		this._oObserver = null;
	};

	DataStateIndicator.prototype._setLinkText = function(sLinkText) {
		this._sLinkText = sLinkText;
		this._updateLinkControl();
	};

	DataStateIndicator.prototype.setEnableFiltering = function(bEnableFiltering) {
		if ((bEnableFiltering = !!bEnableFiltering) == this.getEnableFiltering()) {
			return this;
		}

		this.setProperty("enableFiltering", bEnableFiltering, true);
		if (this.isActive()) {
			if (bEnableFiltering) {
				this.refresh();
			} else {
				this._clearFilter(true);
			}
		}
	};

	/**
	 * Shows a message.
	 *
	 * @param {string} [sText] The message text, if empty, the message is hidden
	 * @param {sap.ui.core.ValueState} [sType] The message type
	 * @public
	 */
	DataStateIndicator.prototype.showMessage = function(sText, sType) {
		if (!this.getEnabled() || !this.getControl() || (!sText && !this._oMessageStrip)) {
			return;
		}

		if (this._oMessageStrip) {
			this._oMessageStrip.setText(sText).setType(sType).setVisible(!!sText);
			this.getControl().removeAriaLabelledBy(this._oMessageStrip);
			if (sText) {
				this.getControl().addAriaLabelledBy(this._oMessageStrip);
			}
		} else {
			sap.ui.require(["sap/m/MessageStrip"], function(MessageStrip) {
				var oControl = this.getControl();
				this._oMessageStrip = new MessageStrip({
					showCloseButton: true,
					showIcon: true,
					close: function() {
						oControl.focus();
						oControl.removeAriaLabelledBy(this._oMessageStrip);
						this.fireClose();
					}.bind(this)
				}).addStyleClass("sapUiTinyMargin");

				oControl.setAggregation("_messageStrip", this._oMessageStrip);
				oControl.addAriaLabelledBy(this._oMessageStrip);
				this._updateLinkControl();
				this.showMessage(sText, sType);
			}.bind(this));
		}
	};

	/**
	 * Return whether message filtering is active or not.
	 *
	 * @public
	 * @since 1.89
	 * @returns {boolean} Whether message filtering is active or not
	 */
	DataStateIndicator.prototype.isFiltering = function() {
		return !!this._bFiltering;
	};

	/**
	 * Refreshes the messages displayed for the current data state.
	 * The current data state is evaluated again, and the filters are applied.
	 *
	 * @public
	 */
	DataStateIndicator.prototype.refresh = function() {
		if (this.isActive()) {
			var oBinding = this.getControl().getBinding(this._getBindingName());
			if (oBinding) {
				this._processDataState(oBinding.getDataState(), true);
				if (oBinding.requestFilterForMessages && this._bFiltering) {
					this._applyFilter();
				}
			}
		}
	};

	/**
	 * Creates or updates the link control of the message strip.
	 * @private
	 */
	DataStateIndicator.prototype._updateLinkControl = function() {
		if (!this._oMessageStrip) {
			return;
		}

		if (!this._sLinkText) {
			this._oMessageStrip.setLink(null);
		} else if (this._oLink) {
			this._oLink.setText(this._sLinkText);
			this._oMessageStrip.setLink(this._oLink);
		} else {
			sap.ui.require(["sap/m/Link"], function(Link) {
				this._oLink = new Link({
					press: [this._onLinkPress, this]
				});
				this._updateLinkControl();
			}.bind(this));
		}
	};

	DataStateIndicator.prototype._getBindingName = function() {
		return this.getConfig("defaultBindingName");
	};

	DataStateIndicator.prototype._processDataState = function(oDataState, bIgnoreChanges) {
		if (!oDataState) {
			return;
		}

		if (!bIgnoreChanges && !oDataState.getChanges().messages) {
			return;
		}

		var oParent = this.getParent();
		var oControl = this.getControl();
		var oBinding = oControl && oControl.getBinding(this._getBindingName());
		if (oBinding && oBinding.bIsBeingDestroyed) {
			oDataState.getAllMessages().forEach(function(oMessage) {
				oMessage.removeControlId(oControl.getId());
			});
			return;
		}

		var aMessages = oDataState.getMessages();
		var fnFilter = this.getFilter();
		if (fnFilter) {
			aMessages = aMessages.filter(function(oMessage) {
				return fnFilter(oMessage, oParent);
			});
		}

		if (!this.fireDataStateChange({ dataState: oDataState, filteredMessages: aMessages})) {
			return;
		}

		if (aMessages.length) {
			var sMessage = "";
			var bUpdateMessageModel = false;
			var oFirstMessage = aMessages[0];

			aMessages.forEach(function(oMessage) {
				if (oMessage.getControlIds().indexOf(oControl.getId()) == -1) {
					oMessage.addControlId(oControl.getId());
					bUpdateMessageModel = true;
				}
			});

			this._sCombinedType = this._getCombinedType(aMessages);
			if (aMessages.length == 1 && isMessageRelatedToPath(oFirstMessage, oBinding.getPath())) {
				sMessage = oFirstMessage.getMessage();
			} else {
				sMessage = this._translate(this._sCombinedType.toUpperCase());
			}

			this.showMessage(sMessage, oFirstMessage.getType());
			if (!this._bFiltering && oBinding.requestFilterForMessages && this.getEnableFiltering()) {
				var fnFilter = this.getFilter();
				var fnMessageFilter = fnFilter && function(oMessage) {
					return fnFilter(oMessage, oParent);
				};

				oBinding.requestFilterForMessages(fnMessageFilter).then(function(oFilter) {
					this._setLinkText(oFilter ? this._translate("FILTER_ITEMS") : "");
				}.bind(this));
			}

			if (bUpdateMessageModel) {
				Messaging.getMessageModel().checkUpdate(true, true);
			}
		} else {
			this.showMessage("");
			if (this._bFiltering) {
				this._clearFilter(true);
			}
		}
	};

	DataStateIndicator.prototype._onLinkPress = function() {
		if (this._bFiltering) {
			this._clearFilter();
		} else {
			this._applyFilter();
		}
	};

	DataStateIndicator.prototype._clearFilter = function(bClearLink) {
		if (this._bFiltering) {
			this._bFiltering = false;
			this._hideFilterInfo(bClearLink);
			if (this.fireClearFilter() && this._fnLastFilter) {
				this._fnLastFilter("Application");
				delete this.getControl().getBinding(this._getBindingName()).filter;
			}
		}
	};

	DataStateIndicator.prototype._applyFilter = function() {
		var fnFilter = this.getFilter();
		var oControl = this.getControl();
		var oParent = this.getParent();
		var oBinding = oControl.getBinding(this._getBindingName());
		var fnMessageFilter = fnFilter && function(oMessage) {
			return fnFilter(oMessage, oParent);
		};

		oBinding.requestFilterForMessages(fnMessageFilter).then(function(oFilter) {
			if (!oFilter) {
				return this._setLinkText("");
			}

			var bRefresh = this._bFiltering;
			if (!bRefresh) {
				this._bFiltering = true;
				this._showFilterInfo();
			}

			if (!this.fireApplyFilter({ filter : oFilter, revert : this._clearFilter.bind(this) })) {
				return;
			}

			if (!bRefresh) {
				this._fnLastFilter = oBinding.filter.bind(oBinding, oBinding.aApplicationFilters);
				this._fnBindingFilter = oBinding.filter;
			} else {
				delete oBinding.filter;
			}

			oBinding.filter(oFilter, "Application");
			oBinding.filter = function(aFilters, sFilterType) {
				if (sFilterType == "Application") {
					this._fnLastFilter = this._fnBindingFilter.bind(oBinding, aFilters);
					return oBinding;
				}
				return this._fnBindingFilter.apply(oBinding, arguments);
			}.bind(this);
		}.bind(this));
	};

	DataStateIndicator.prototype._hideFilterInfo = function(bClearLink) {
		this._oMessageStrip.setShowCloseButton(true);
		this._setLinkText(bClearLink ? "" : this._translate("FILTER_ITEMS"));
		this.getConfig("hideInfoToolbar", this.getControl());
	};

	DataStateIndicator.prototype._showFilterInfo = function() {
		if (this._oInfoText) {
			this._oMessageStrip.setShowCloseButton(false);
			this._setLinkText(this._translate("CLEAR_FILTER"));
			this._oInfoText.setText(this._translate("FILTERED_BY_" + this._sCombinedType.toUpperCase()));
			if (!this._oInfoToolbar.getParent()) {
				this.getConfig("showInfoToolbar", this.getControl(), this._oInfoToolbar);
			}
		} else {
			sap.ui.require(["sap/m/Text", "sap/m/Toolbar"], function(Text, Toolbar) {
				this._oInfoText = new Text();
				this._oInfoToolbar = new Toolbar({
					design: "Info",
					content: this._oInfoText,
					active: this.hasListeners("filterInfoPress"),
					press: this.fireEvent.bind(this, "filterInfoPress")
				});
				this._showFilterInfo();
			}.bind(this));
		}
	};

	DataStateIndicator.prototype._getCombinedType = function(aMessages) {
		if (aMessages && aMessages.length) {
			var mTypes = {None: 0, Information: 1, Success: 2, Warning: 4, Error: 8};
			var iSeverity = 0;

			aMessages.forEach(function(oMessage) {
				iSeverity |= mTypes[oMessage.getType()];
			});

			if (iSeverity & mTypes.Error && iSeverity & mTypes.Warning) {
				return "Issue";
			}
			if (iSeverity & mTypes.Error) {
				return "Error";
			}
			if (iSeverity & mTypes.Warning) {
				return "Warning";
			}
			if (iSeverity & mTypes.Success || iSeverity & mTypes.Information) {
				return "Notification";
			}
		}

		return "";
	};

	DataStateIndicator.prototype._onAggregatedDataStateChange = function(oEvent) {
		this._processDataState(oEvent.getParameter("dataState"));
	};

	DataStateIndicator.prototype._observeChanges = function(mChange) {
		const oBindingInfo = mChange.bindingInfo;
		const oBinding = oBindingInfo.binding;

		if (oBinding) {
			oBinding.detachAggregatedDataStateChange(this._fnOnAggregatedDataStateChange);
			if (mChange.mutation == "ready") {
				oBinding.attachAggregatedDataStateChange(this._fnOnAggregatedDataStateChange);
			}
		} else if (mChange.mutation == "prepare") {
			oBindingInfo.events ??= {};
			oBindingInfo.events.aggregatedDataStateChange ??= this._fnOnAggregatedDataStateChange;
		}
	};

	DataStateIndicator.prototype._translate = function(sBundleKey) {
		var sBundleText = "DATASTATE_" + sBundleKey;
		var oMetadata = this.getControl().getMetadata();
		var sLibraryName = oMetadata.getLibraryName();
		var sControlName = oMetadata.getName().split(".").pop().toUpperCase();
		var oResourceBundle = Library.getResourceBundleFor(sLibraryName);
		var sControlBundleText = sControlName + "_" + sBundleText;

		if (oResourceBundle.hasText(sControlBundleText)) {
			return oResourceBundle.getText(sControlBundleText);
		}

		if (sLibraryName == "sap.m") {
			return oResourceBundle.getText(sBundleText);
		}

		return Library.getResourceBundleFor("sap.m").getText(sBundleText);
	};

	/**
	 * Checks whether the given message is related to the given binding path.
	 * @param {sap.ui.core.message.Message} oMessage
	 * @param {string} sPath
	 * @returns {boolean} Whether the message is related to the path
	 * @private
	 */
	function isMessageRelatedToPath(oMessage, sPath) {
		return oMessage.getTargets().some(function(sTarget) {
			return sTarget.endsWith(sPath);
		});
	}

	/**
	 * Plugin-specific control configurations
	 */
	PluginBase.setConfigs({
		"sap.m.ListBase": {
			defaultBindingName: "items",
			useInfoToolbar: function(oParent) {
				return oParent && oParent.getUseInfoToolbar && oParent.getUseInfoToolbar() == "Off" ? false : true;
			},
			showInfoToolbar: function(oControl, oInfoToolbar) {
				if (this.useInfoToolbar(oControl.getParent())) {
					this._oOldInfoToolbar = oControl.getInfoToolbar();
					this._oNewInfoToolbar = oInfoToolbar;
					oControl.setInfoToolbar(oInfoToolbar);
				}
			},
			hideInfoToolbar: function(oControl) {
				if (this._oNewInfoToolbar) {
					oControl.setInfoToolbar(this._oOldInfoToolbar);
					this._oNewInfoToolbar = this._oOldInfoToolbar = null;
				}
			},
			onDeactivate: function(oControl) {
				this.hideInfoToolbar(oControl);
			}
		},
		"sap.ui.table.Table": {
			defaultBindingName: "rows",
			useInfoToolbar: function(oParent) {
				return oParent && oParent.getUseInfoToolbar && oParent.getUseInfoToolbar() == "Off" ? false : true;
			},
			showInfoToolbar: function(oControl, oInfoToolbar) {
				if (this.useInfoToolbar(oControl.getParent())) {
					this._oInfoToolbar = oInfoToolbar;
					oControl.addExtension(oInfoToolbar);
				}
			},
			hideInfoToolbar: function(oControl) {
				if (this._oInfoToolbar) {
					oControl.removeExtension(this._oInfoToolbar);
					this._oInfoToolbar = null;
				}
			},
			onDeactivate: function(oControl) {
				this.hideInfoToolbar(oControl);
			}
		}
	}, DataStateIndicator);

	return DataStateIndicator;

});