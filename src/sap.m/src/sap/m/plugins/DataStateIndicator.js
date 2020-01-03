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
			 * Defines a predicate to test each data state of the messages.
			 *
			 * This callback gets called via the {@link sap.ui.model.DataState data state} parameter.
			 * Return <code>true</code> to keep the data state, <code>false</code> otherwise.
			 */
			filter: {type: "function", invalidate: false}
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

			oControl.setAggregation("_messageStrip", this._oMessageStrip);
			oControl.addAriaLabelledBy(this._oMessageStrip);
			this.showMessage(sText, sType);
		}.bind(this));
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

	DataStateIndicator.prototype._processDataState = function(oDataState) {
		if (!oDataState || !oDataState.getChanges().messages || !this.fireDataStateChange({ dataState: oDataState }, true)) {
			return;
		}

		var aMessages = oDataState.getMessages();
		var fnFilter = this.getFilter();
		if (fnFilter) {
			aMessages = aMessages.filter(fnFilter);
		}

		if (aMessages.length) {
			var oControl = this.getControl();
			var oFirstMessage = aMessages[0];
			var sBindingName = this._getBindingName();
			var sBindingPath = oControl.getBinding(sBindingName).getPath();
			var mTypes = {None: 0, Information: 1, Success: 2, Warning: 4, Error: 8};
			var bUpdateMessageModel = false;
			var sBundleKey = "";
			var iSeverity = 0;
			var sMessage = "";

			aMessages.forEach(function(oMessage) {
				if (oMessage.getControlIds().indexOf(oControl.getId()) == -1) {
					oMessage.addControlId(oControl.getId());
					bUpdateMessageModel = true;
				}
				iSeverity |= mTypes[oMessage.getType()];
			});

			if (aMessages.length == 1 && oFirstMessage.getTarget() && oFirstMessage.getTarget().endsWith(sBindingPath)) {
				sMessage = oFirstMessage.getMessage();
			} else {
				if (iSeverity & mTypes.Error && iSeverity & mTypes.Warning) {
					sBundleKey = "ISSUE";
				} else if (iSeverity & mTypes.Error) {
					sBundleKey = "ERROR";
				} else if (iSeverity & mTypes.Warning) {
					sBundleKey = "WARNING";
				} else if (iSeverity & mTypes.Success || iSeverity & mTypes.Information) {
					sBundleKey = "NOTIFICATION";
				}
				if (sBundleKey) {
					sMessage = this._translate(sBundleKey);
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
