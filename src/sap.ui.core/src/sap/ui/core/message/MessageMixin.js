/*!
 * ${copyright}
 */

// sap.ui.core.message.MessageMixin
sap.ui.define(["sap/ui/core/library", "sap/base/Log"], function(library, Log) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;

	/**
	 * Applying the MessageMixin to a Control's prototype augments the refreshDataState function to support Label-texts.
	 * For all messages, the additionalText property of the message will be set based on the associated Label-texts for the control instances.
	 *
	 * Please be aware, that only controls supporting a value state should apply this mixin to their prototype.
	 *
	 * @protected
	 * @alias sap.ui.core.message.MessageMixin
	 * @mixin
	 * @since 1.44.0
	 */
	var MessageMixin = function () {
		this.refreshDataState = refreshDataState;
		this.fnDestroy = this.destroy;
		this.destroy = destroy;
	};

	/**
	 * If messages are present:
	 * - Adds an additional text to the message from the label(s) of the corresponding control instance
	 * - Adds the control ID to the messages
	 * - Propagates the value state
	 */
	function refreshDataState (sName, oDataState) {
		if (oDataState.getChanges().messages && this.getBinding(sName) && this.getBinding(sName).isA("sap.ui.model.PropertyBinding")) {
			var aMessages = oDataState.getMessages();
			var aLabels = sap.ui.core.LabelEnablement.getReferencingLabels(this);
			var sLabelId = aLabels[0];
			var bForceUpdate = false;

			aMessages.forEach(function(oMessage) {
				if (aLabels && aLabels.length > 0) {
				// we simply take the first label text and ignore all others
					var oLabel = sap.ui.getCore().byId(sLabelId);
					if (oLabel.getMetadata().isInstanceOf("sap.ui.core.Label") && oLabel.getText && oMessage.getAdditionalText() !== oLabel.getText()) {
						oMessage.setAdditionalText(oLabel.getText());
						bForceUpdate = true;
					} else {
						Log.warning(
							"sap.ui.core.message.Message: Can't create labelText." +
							"Label with id " + sLabelId + " is no valid sap.ui.core.Label.",
							this
						);

					}
				}
				if (oMessage.getControlId() !== this.getId()){
					oMessage.addControlId(this.getId());
					bForceUpdate = true;
				}
			}.bind(this));
			// Update the model to apply the changes
			var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
			oMessageModel.checkUpdate(bForceUpdate, true);

			// propagate messages
			if (aMessages && aMessages.length > 0) {
				var oMessage = aMessages[0];
				// check if the message type is a valid sap.ui.core.ValueState
				if (ValueState[oMessage.type]) {
					this.setValueState(oMessage.type);
					this.setValueStateText(oMessage.message);
				}
			} else {
				this.setValueState(ValueState.None);
				this.setValueStateText('');
			}
		}
	}

	function destroy() {
		//Remove control id from messages
		var sControlId = this.getId();
		function removeControlID(oMessage) {
			oMessage.removeControlId(sControlId);
		}
		for (var sName in this.mBindingInfos) {
			var oBindingInfo = this.mBindingInfos[sName];
			if (oBindingInfo.binding) {
				var oDataState = oBindingInfo.binding.getDataState();
				var aMessages = oDataState.getMessages();
				aMessages.forEach(removeControlID);
			}
		}
		this.fnDestroy.apply(this, arguments);
	}

	return MessageMixin;
}, /* bExport= */ true);