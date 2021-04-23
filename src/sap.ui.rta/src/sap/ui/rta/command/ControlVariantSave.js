/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	BaseCommand,
	JsControlTreeModifier,
	flUtils
) {
	"use strict";

	/**
	 * Saves a control variant.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.86
	 * @alias sap.ui.rta.command.ControlVariantSave
	 */
	var ControlVariantSave = BaseCommand.extend("sap.ui.rta.command.ControlVariantSave", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				model: {
					type: "object"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantSave.prototype.prepare = function() {
		this.oAppComponent = flUtils.getAppComponentForControl(this.getElement());
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(this.getElement(), this.oAppComponent).id;
		return true;
	};

	/**
	 * Triggers the Save of a variant.
	 * @public
	 * @returns {Promise} Promise that resolves after execution
	 */
	ControlVariantSave.prototype.execute = function() {
		var sCurrentVariantReference = this.getModel().getCurrentVariantReference(this.sVariantManagementReference);
		this._aControlChanges = this.getModel().getVariant(sCurrentVariantReference, this.sVariantManagementReference).controlChanges;
		this._aDirtyChanges = this.getModel()._getDirtyChangesFromVariantChanges(this._aControlChanges);
		this._aDirtyChanges.forEach(function(oChange) {
			if (oChange.getFileType() === "change") {
				oChange.assignedToVariant = true;
			}
		});
		this.getModel().oData[this.sVariantManagementReference].modified = false;
		this.getModel().checkUpdate(true);
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSave.prototype.undo = function() {
		this._aDirtyChanges.forEach(function(oChange) {
			if (oChange.getFileType() === "change") {
				oChange.assignedToVariant = false;
			}
		});
		this.getModel().checkDirtyStateForControlModels([this.sVariantManagementReference]);
		return Promise.resolve();
	};

	return ControlVariantSave;
});
