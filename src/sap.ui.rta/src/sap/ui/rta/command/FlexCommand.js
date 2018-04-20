/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/rta/ControlTreeModifier",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/JsControlTreeModifier"
], function(
	BaseCommand,
	FlexControllerFactory,
	RtaControlTreeModifier,
	Utils,
	JsControlTreeModifier
) {
	"use strict";

	/**
	 * Basic implementation for the flexibility commands, that use a flex change handler.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.FlexCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var FlexCommand = BaseCommand.extend("sap.ui.rta.command.FlexCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeType : {
					type : "string"
				},
				/**
				 * selector object containing id, appComponent and controlType to create a command for an element, which is not instantiated
				 */
				selector : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * Retrives id of element or selector
	 *
	 * @returns {string} id value
	 * @public
	 */
	FlexCommand.prototype.getElementId = function() {
		var oElement = this.getElement();
		return oElement ? oElement.getId() : this.getSelector().id;
	};

	/**
	 * Retrives app component of element or selector
	 *
	 * @returns {sap.ui.core.UIComponent} component
	 * @private
	 */
	FlexCommand.prototype.getAppComponent = function() {
		if (!this._oControlAppComponent) {
			var oElement = this.getElement();
			this._oControlAppComponent = oElement ? Utils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
		}
		return this._oControlAppComponent;
	};

	/**
	 * Prepares and stores change to be applied later
	 * (in some cases element of a command is unstable, so change needs to be created and stored upfront)
	 * @override
	 */
	FlexCommand.prototype.prepare = function(mFlexSettings, sVariantManagementReference) {
		if (
			!this.getSelector()
			&& this.getElement()
		) {
			var oSelector = {
				id: this.getElement().getId(),
				appComponent: this.getAppComponent(),
				controlType: Utils.getControlType(this.getElement())
			};
			this.setSelector(oSelector);
		}
		try {
			this._oPreparedChange = this._createChange(mFlexSettings, sVariantManagementReference);
		} catch (oError) {
			jQuery.sap.log.error(oError.message || oError.name);
			return false;
		}
		return true;
	};

	/**
	 * Returns a prepared change
	 * @returns {object} prepared change object
	 * @public
	 */
	FlexCommand.prototype.getPreparedChange = function() {
		if (!this._oPreparedChange) {
			this.prepare();
		}
		return this._oPreparedChange;
	};

	/**
	 * @override
	 * @returns {Promise} empty promise after finishing execution
	 */
	FlexCommand.prototype.execute = function() {
		var vChange = this.getPreparedChange();
		return this._applyChange(vChange);
	};

	/**
	 * This method converts command constructor parameters into change specific data.
	 * Default implementation of this method below is for commands, which do not have specific constructor parameters
	 * @return {object} Returns the <code>SpecificChangeInfo</code> for change handler
	 * @protected
	 */
	FlexCommand.prototype._getChangeSpecificData = function() {
		return {
			changeType : this.getChangeType(),
			selector : {
				id : this.getElementId()
			}
		};
	};

	/**
	 * Creates a change.
	 * @param {object} mFlexSettings Map containing the flexibility settings
	 * @param {string} sVariantManagementReference Reference to the variant management
	 * @returns {object} Returns the change object
	 * @private
	 */
	FlexCommand.prototype._createChange = function(mFlexSettings, sVariantManagementReference) {
		return this._createChangeFromData(this._getChangeSpecificData(), mFlexSettings, sVariantManagementReference);
	};

	/**
	 * Create a Flex change from a given Change Specific Data.
	 * (This method can be reused to retrieve an Undo Change)
	 *
	 * @param {object} mChangeSpecificData Map containing change specific data
	 * @param {object} mFlexSettings Map containing flex settings
	 * @param {string} sVariantManagementReference Reference to the variant management
	 * @returns {object} Returns the change object
	 * @private
	 */
	FlexCommand.prototype._createChangeFromData = function(mChangeSpecificData, mFlexSettings, sVariantManagementReference) {
		if (mFlexSettings) {
			jQuery.extend(mChangeSpecificData, mFlexSettings);
		}
		var oModel = this.getAppComponent().getModel("$FlexVariants");
		var sVariantReference;
		if (oModel && sVariantManagementReference) {
			sVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);
		}
		var oFlexController = FlexControllerFactory.createForControl(this.getAppComponent());
		var mVariantObj = {
			"variantManagementReference": sVariantManagementReference,
			"variantReference": sVariantReference
		};
		if (sVariantReference) {
			jQuery.extend(mChangeSpecificData, mVariantObj);
		}
		return oFlexController.createChange(mChangeSpecificData, this.getElement() || this.getSelector());
	};

	/**
	 * @override
	 */
	FlexCommand.prototype.undo = function() {
		return Promise.resolve()
			.then(function() {
				var oControl = this.getElement() || this.getSelector();
				var oChange = this.getPreparedChange();

				if (oChange.getRevertData()) {
					var oFlexController = FlexControllerFactory.createForControl(this.getAppComponent());
					var bRevertible = oFlexController.isChangeHandlerRevertible(oChange, oControl);
					if (!bRevertible) {
						jQuery.sap.log.error("No revert change function available to handle revert data for " + oControl);
						return;
					}
					var oAppComponent = this.getAppComponent();
					return oFlexController.revertChangesOnControl([oChange], oAppComponent);
				} else if (this._aRecordedUndo) {
					RtaControlTreeModifier.performUndo(this._aRecordedUndo);
				} else {
					jQuery.sap.log.warning("Undo is not available for " + oControl);
				}
			}.bind(this));
	};

	/**
	 * @private
	 * @param {sap.ui.fl.Change|Object} vChange Change object or map containing the change object
	 * @param {boolean} [bNotMarkAsAppliedChange] Apply the change without marking them as applied changes in the custom Data
	 * @returns {Promise} Returns an empty promise
	 */
	FlexCommand.prototype._applyChange = function(vChange, bNotMarkAsAppliedChange) {
		//TODO: remove the following compatibility code when concept is implemented
		var oChange = vChange.change || vChange;

		var oAppComponent = this.getAppComponent();
		var oSelectorElement = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
		var oFlexController = FlexControllerFactory.createForControl(this.getAppComponent());
		var bRevertible = oFlexController.isChangeHandlerRevertible(oChange, oSelectorElement);

		if (!bRevertible) {
			RtaControlTreeModifier.startRecordingUndo();
		}

		return Promise.resolve(oFlexController.checkTargetAndApplyChange(oChange, oSelectorElement, {modifier: RtaControlTreeModifier, appComponent: oAppComponent}))

		.then(function(bSuccess) {
			if (bSuccess) {
				if (bNotMarkAsAppliedChange) {
					oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oSelectorElement);
				}
			}
			return bSuccess;
		})

		.then(function(bSuccess) {
			if (!bRevertible){
				if (!oChange.getUndoOperations()) {
					this._aRecordedUndo = RtaControlTreeModifier.stopRecordingUndo();
				} else {
					this._aRecordedUndo = oChange.getUndoOperations();
					oChange.resetUndoOperations();
				}
			}
			if (!bSuccess) {
				return Promise.reject();
			}
		}.bind(this));
	};

	return FlexCommand;

}, /* bExport= */true);
