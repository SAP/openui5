/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/semantic/SemanticControl", "sap/m/Label", "sap/ui/base/ManagedObject"], function(SemanticControl, Label, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new DraftIndicator.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A semantic draft indicator is {@link sap.m.Label},
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticControl
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.m.semantic.DraftIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var DraftIndicator = SemanticControl.extend("sap.m.semantic.DraftIndicator", /** @lends sap.m.semantic.DraftIndicator.prototype */ {
		metadata : {

			properties : {
				/**
				 * Minimum time in milliseconds for showing the draft indicator
				 */
				minDisplayTime : {
					type: "int",
					group: "Behavior",
					defaultValue: 1500
				}
			}
		}
	});
	
	var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	DraftIndicator._oSTATES = {
			Saving: 1,
			Saved: 2,
			Clear: 3
	};
	DraftIndicator._oTEXTS = {};
	DraftIndicator._oTEXTS[DraftIndicator._oSTATES.Saving] = oBundle.getText("SEMANTIC_CONTROL_SAVING_DRAFT");
	DraftIndicator._oTEXTS[DraftIndicator._oSTATES.Saved] = oBundle.getText("SEMANTIC_CONTROL_DRAFT_SAVED");
	DraftIndicator._oTEXTS[DraftIndicator._oSTATES.Clear] = "";
	
	DraftIndicator.prototype.init = function() {
		this.aQueue = [];
		this.bOngoing = false;
	};
	

	/**
	 * @Overwrites
	 */
	DraftIndicator.prototype.setProperty = function(key, value) {
		if (key == "minDisplayTime") {
			ManagedObject.prototype.setProperty.call(this, key, value, true);
			return;
		}
		SemanticControl.prototype.setProperty.call(this, key, value, true);
	};
	
	DraftIndicator.prototype._getControl = function() {
		var oControl = this.getAggregation('_control');
		if (!oControl) {

			var oNewInstance = this._createInstance();

			oNewInstance.applySettings(this._getConfiguration().getSettings());

			this.setAggregation('_control', oNewInstance, true);

			oControl = this.getAggregation('_control');
		}

		return oControl;
	};
	
	DraftIndicator.prototype._createInstance = function() {
		return new sap.m.Label({
				id: this.getId() + "-label"
			});
	};

	/**
	 * Sets the indicator in "Saving..." state
	 *
	 * @public
	 */
	DraftIndicator.prototype.showDraftSaving = function() {
		this._addToQueue(DraftIndicator._oSTATES.Saving);
	};
	
	/**
	 * Sets the indicator in "Saved" state
	 *
	 * @public
	 */
	DraftIndicator.prototype.showDraftSaved = function() {
		this._addToQueue(DraftIndicator._oSTATES.Saved);
		this._addToQueue(DraftIndicator._oSTATES.Clear);
	};
	
	/**
	 * Clears the indicator state
	 *
	 * @public
	 */
	DraftIndicator.prototype.clearDraftState = function() {
		this._addToQueue(DraftIndicator._oSTATES.Clear);
	};
	
	
	/**
	 * Adds states to the queue
	 *
	 * @private
	 */
	DraftIndicator.prototype._addToQueue = function(iState) {
		this.aQueue.push(iState);
		this._processQueue();
	};
	
	/**
	 * Process the states in the aQueue array
	 *
	 * @private
	 */
	DraftIndicator.prototype._processQueue = function() {
		if (this.bOngoing) {
			return;
		}
		
		var iNextState = this.aQueue.shift();
		var iTimeOut = this.getMinDisplayTime();
		
		if (!iNextState) {
			return;
		}
		
		this._applyState(iNextState);
		
		if (iNextState === DraftIndicator._oSTATES.Clear) {
			iTimeOut = 0;
		}
		this.bOngoing = jQuery.sap.delayedCall(iTimeOut, this, this._resetDraftTimer);
		jQuery.sap.delayedCall(iTimeOut, this, this._processQueue);
	};
	
	/**
	 * Sets the text of the indicator depending of the state
	 *
	 * @private
	 */
	DraftIndicator.prototype._applyState = function(iState) {
		this._getControl().setText(DraftIndicator._oTEXTS[iState]);
	};
	
	/**
	 * Resets the timer
	 *
	 * @private
	 */
	DraftIndicator.prototype._resetDraftTimer = function() {
		jQuery.sap.clearDelayedCall(this.bOngoing);
		this.bOngoing = null;
	};

	return DraftIndicator;
}, /* bExport= */ true);