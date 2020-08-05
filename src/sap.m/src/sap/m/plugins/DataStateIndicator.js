/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/ui/core/Core", "sap/ui/base/ManagedObjectObserver"],
	function(PluginBase, Core, ManagedObjectObserver) {
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DataStateIndicator = PluginBase.extend("sap.m.plugins.DataStateIndicator", /** @lends sap.m.plugins.DataStateIndicator.prototype */ { metadata: {
		library: "sap.m",
		properties: {
			/**
			 * Defines a predicate to test each message of the data state.
			 *
			 * This callback gets called using the {@link sap.ui.core.message.Message message} and {@link sap.ui.core.Control related control} parameters.
			 * Returns <code>true</code> to keep the message, <code>false</code> otherwise.
			 */
			filter: {type: "function", invalidate: false},

			/**
			 * Defines the text for the link in the message strip.
			 * @since 1.79
			 */
			messageLinkText: {type: "string", visibility: "hidden"},

			/**
			 * Defines the visibility of the link control in the message strip.
			 * @since 1.79
			 */
			messageLinkVisible: {type: "boolean", defaultValue: true, visibility: "hidden"}
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
					dataState: {type: "sap.ui.model.DataState"}
				}
			}
		}
	}});

	/**
	 * Defines the text to be shown for the link control of the message strip.
	 * @param {string} [sLinkText] The text for the link control
	 * @returns {sap.m.plugins.DataStateIndicator} The control instance
	 * @since 1.79
	 * @private
	 */
	DataStateIndicator.prototype.setMessageLinkText = function(sLinkText) {
		this.setProperty("messageLinkText", sLinkText, true);
		// update the link aggregation of the message strip
		this._updateMessageLinkControl();
		return this;
	};

	/**
	 * Returns the message link text.
	 * @returns {string} message link text
	 * @since 1.79
	 * @private
	 */
	DataStateIndicator.prototype.getMessageLinkText = function() {
		return this.getProperty("messageLinkText");
	};

	/**
	 * Defines the visibility of the link control in the message strip.
	 * @param {boolean} [bVisible] Visibility of the link control
	 * @return {sap.m.plugins.DataStateIndicator} The control instance
	 * @since 1.79
	 * @private
	 */
	DataStateIndicator.prototype.setMessageLinkVisible = function(bVisible) {
		this.setProperty("messageLinkVisible", bVisible, true);

		if (this._oLink) {
			this._oLink.setVisible(bVisible);
		}

		return this;
	};

	/**
	 * Returns the property value of <code>messageLinkVisible</code>.
	 * @returns {boolean} The <code>messageLinkVisible</code> property value
	 * @since 1.79
	 * @private
	 */
	DataStateIndicator.prototype.getMessageLinkVisible = function() {
		return this.getProperty("messageLinkVisible");
	};

	DataStateIndicator.prototype.isApplicable = function(oControl) {
		if (!oControl.addAriaLabelledBy ||
			!PluginBase.prototype.isApplicable.apply(this, arguments) ||
			!oControl.getMetadata().getAllPrivateAggregations()["_messageStrip"] ||
			!this._getBindingName()) {
			return false;
		}

		return true;
	};

	DataStateIndicator.prototype.onActivate = function(oControl) {
		var sBindingName = this._getBindingName();
		var oBinding = oControl.getBinding(sBindingName);

		if (oBinding) {
			oBinding.attachAggregatedDataStateChange(this._onAggregatedDataStateChange, this);
			this._processDataState(oBinding.getDataState());
		}

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._oObserver.observe(oControl, { bindings: [sBindingName] });
	};

	DataStateIndicator.prototype.onDeactivate = function(oControl) {
		var sBindingName = this._getBindingName();
		var oBinding = oControl.getBinding(sBindingName);

		if (oBinding) {
			oBinding.detachAggregatedDataStateChange(this._onAggregatedDataStateChange, this);
			oBinding.getDataState().getMessages().forEach(function(oMessage) {
				oMessage.removeControlId(oControl.getId());
			});
		}

		if (this._oMessageStrip) {
			this._oMessageStrip.destroy();
			this._oMessageStrip = null;
		}

		if (this._oLink) {
			this._oLink.destroy();
			this._oLink = null;
		}

		this._oObserver.unobserve(oControl, { bindings: [sBindingName] });
		this._oObserver.destroy();
		this._oObserver = null;
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
			return;
		}

		sap.ui.require(["sap/m/MessageStrip"], function(MessageStrip) {
			var oControl = this.getControl();
			this._oMessageStrip = new MessageStrip({
				showCloseButton: true,
				showIcon: true
			}).addStyleClass("sapUiTinyMargin");

			// update the link aggregation of the message strip
			this._updateMessageLinkControl();

			oControl.setAggregation("_messageStrip", this._oMessageStrip);
			oControl.addAriaLabelledBy(this._oMessageStrip);
			this.showMessage(sText, sType);
		}.bind(this));
	};

	/**
	 * Creates or updates the link control of the message strip.
	 * @since 1.79
	 * @private
	 */
	DataStateIndicator.prototype._updateMessageLinkControl = function() {
		if (!this._oMessageStrip) {
			return;
		}

		var sMessageLinkText = this.getMessageLinkText();
		if (!sMessageLinkText) {
			this._oMessageStrip.setLink(null);
			return;
		} else if (this._oLink) {
			this._oLink.setText(sMessageLinkText);
			this._oMessageStrip.setLink(this._oLink);
		}

		if (!this._oLink) {
			sap.ui.require(["sap/m/Link"], function(Link) {
				this._oLink = new Link({
					text: sMessageLinkText,
					visible: this.getMessageLinkVisible(),
					press: [function() {
						// private event fired when the link is pressed
						this.fireEvent("messageLinkPressed");
					}, this]
				});
				this._oMessageStrip.setLink(this._oLink);
			}.bind(this));
		}
	};

	/**
	 * Refreshes the messages displayed for the current data state.
	 *
	 * The current data state is evaluated again, and the filters are applied.
	 *
	 * @public
	 */
	DataStateIndicator.prototype.refresh = function() {
		if (this.isActive()) {
			var sBindingName = this._getBindingName();
			var oBinding = this.getControl().getBinding(sBindingName);
			if (oBinding) {
				this._processDataState(oBinding.getDataState());
			}
		}
	};


	DataStateIndicator.prototype._getBindingName = function() {
		return this.getControlPluginConfig("defaultBindingName");
	};

	DataStateIndicator.prototype._translate = function(sBundleKey) {
		var sBundleText = "DATASTATE_" + sBundleKey;
		var oMetadata = this.getControl().getMetadata();
		var sLibraryName = oMetadata.getLibraryName();
		var sControlName = oMetadata.getName().split(".").pop().toUpperCase();
		var oResourceBundle = Core.getLibraryResourceBundle(sLibraryName);
		var sControlBundleText = sControlName + "_" + sBundleText;

		if (oResourceBundle.hasText(sControlBundleText)){
			return oResourceBundle.getText(sControlBundleText);
		}

		if (sLibraryName == "sap.m") {
			return oResourceBundle.getText(sBundleText);
		}

		return Core.getLibraryResourceBundle("sap.m").getText(sBundleText);
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
			} else if (iSeverity & mTypes.Error) {
				return "Error";
			} else if (iSeverity & mTypes.Warning) {
				return "Warning";
			} else if (iSeverity & mTypes.Success || iSeverity & mTypes.Information) {
				return "Notification";
			}
		}

		return "";
	};

	DataStateIndicator.prototype._processDataState = function(oDataState) {
		if (!oDataState || !oDataState.getChanges().messages) {
			return;
		}

		var aMessages = oDataState.getMessages();
		var oControl = this.getControl();
		var fnFilter = this.getFilter();
		if (fnFilter) {
			aMessages = aMessages.filter(function(oMessage) {
				return fnFilter(oMessage, oControl);
			});
		}

		if (!this.fireDataStateChange({ dataState: oDataState, filteredMessages: aMessages})) {
			return;
		}

		if (aMessages.length) {
			var oFirstMessage = aMessages[0];
			var sBindingName = this._getBindingName();
			var sBindingPath = oControl.getBinding(sBindingName).getPath();
			var bUpdateMessageModel = false;
			var sBundleKey = "";
			var sMessage = "";

			aMessages.forEach(function(oMessage) {
				if (oMessage.getControlIds().indexOf(oControl.getId()) == -1) {
					oMessage.addControlId(oControl.getId());
					bUpdateMessageModel = true;
				}
			});

			if (aMessages.length == 1 && oFirstMessage.getTarget() && oFirstMessage.getTarget().endsWith(sBindingPath)) {
				sMessage = oFirstMessage.getMessage();
			} else {
				sBundleKey = this._getCombinedType(aMessages);

				if (sBundleKey) {
					sMessage = this._translate(sBundleKey.toUpperCase());
				}
			}

			this.showMessage(sMessage, oFirstMessage.getType());

			if (bUpdateMessageModel) {
				Core.getMessageManager().getMessageModel().checkUpdate(false, true);
			}
		} else {
			this.showMessage("");
		}
	};

	DataStateIndicator.prototype._onAggregatedDataStateChange = function(oEvent) {
		this._processDataState(oEvent.getParameter("dataState"));
	};

	DataStateIndicator.prototype._observeChanges = function(mChange) {
		var oBinding = mChange.bindingInfo.binding;
		if (oBinding) {
			var sOperation = (mChange.mutation == "ready") ? "attach" : "detach";
			oBinding[sOperation + "AggregatedDataStateChange"](this._onAggregatedDataStateChange, this);
		}
	};

	/**
	 * Plugin-specific control configurations
	 */
	PluginBase.setConfig({
		"sap.m.ListBase": {
			defaultBindingName: "items"
		},
		"sap.ui.table.Table": {
			defaultBindingName: "rows"
		}
	}, DataStateIndicator);


	return DataStateIndicator;

});
