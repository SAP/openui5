/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/LocalResetAPI"
], function(
	BaseCommand,
	FlUtils,
	LocalResetAPI
) {
	"use strict";

	/**
	 * Local reset command
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.90
	 * @alias sap.ui.rta.command.LocalReset
	 */
	var LocalReset = BaseCommand.extend("sap.ui.rta.command.LocalReset", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				currentVariant: {
					type: "string"
				},
				changeType: {
					type: "string"
				},
				jsOnly: {
					type: "boolean"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	LocalReset.prototype.prepare = function(mFlexSettings) {
		var oContainerControl = this.getElement();
		this._oAppComponent = FlUtils.getAppComponentForControl(oContainerControl);
		this._aAffectedChanges = LocalResetAPI.getNestedUIChangesForControl(
			oContainerControl,
			{
				layer: mFlexSettings.layer,
				currentVariant: this.getCurrentVariant()
			}
		);
		return Promise.resolve(true);
	};

	/**
	 * Triggers the local reset of a container.
	 * @public
	 * @returns {Promise} Promise that resolves after execution
	 */
	LocalReset.prototype.execute = function() {
		return LocalResetAPI.resetChanges(this._aAffectedChanges, this._oAppComponent);
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Promise that resolves after undo
	 */
	LocalReset.prototype.undo = function() {
		return LocalResetAPI.restoreChanges(this._aAffectedChanges, this._oAppComponent);
	};

	return LocalReset;
});
