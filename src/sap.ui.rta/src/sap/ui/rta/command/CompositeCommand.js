/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/Utils"
], function(
	BaseCommand,
	FlUtils
) {
	"use strict";

	/**
	 * Composite command that can work on multiple simp
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
	 * @alias sap.ui.rta.command.CompositeCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CompositeCommand = BaseCommand.extend("sap.ui.rta.command.CompositeCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {},
			aggregations : {
				commands : {
					type : "sap.ui.rta.command.BaseCommand",
					multiple : true
				}
			},
			events : {}
		}
	});

	/**
	 * Execute this composite command
	 *
	 * @returns {Promise} empty resolved promise or rejected promise
	 */
	CompositeCommand.prototype.execute = function() {
		var aPromises = [];
		this._forEachCommand(function(oCommand) {
			aPromises.push(oCommand.execute.bind(oCommand));
		});
		return FlUtils.execPromiseQueueSequentially(aPromises, true)

		.catch(function(e) {
			var aCommands = this.getCommands();
			aCommands.forEach(function(oCommand) {
				if (oCommand instanceof sap.ui.rta.command.FlexCommand) {
					if (!oCommand._aRecordedUndo) {
						this.removeCommand(oCommand);
					}
				}
			}.bind(this));

			return this.undo()

			.then(function() {
				return Promise.reject(e);
			});
		}.bind(this));
	};

	CompositeCommand.prototype.undo = function() {
		var aPromises = [];
		this._forEachCommandInReverseOrder(function(oCommand) {
			aPromises.push(oCommand.undo.bind(oCommand));
		});
		return FlUtils.execPromiseQueueSequentially(aPromises);
	};

	CompositeCommand.prototype._forEachCommand = function(fnDo) {
		var aCommands = this.getCommands();
		aCommands.forEach(fnDo, this);
	};

	CompositeCommand.prototype._forEachCommandInReverseOrder = function(fnDo) {
		var aCommands = this.getCommands();
		for (var i = aCommands.length - 1; i >= 0; i--) {
			fnDo.call(this, aCommands[i]);
		}
	};

	CompositeCommand.prototype._addCompositeIdToChange = function(oCommand) {
		if (oCommand.getPreparedChange && oCommand.getPreparedChange()) {
			var oChangeDefinition = oCommand.getPreparedChange().getDefinition();
			if (!oChangeDefinition.support.compositeCommand) {
				if (!this._sCompositeId) {
					this._sCompositeId = FlUtils.createDefaultFileName("composite");
				}
				oChangeDefinition.support.compositeCommand = this._sCompositeId;
			}
		}
	};

	/**
	 * @override
	 * @param {object} oCommand The command to be added to the aggregation of the composite command
	 * @param {boolean} bSuppressInvalidate if true, this CompositeCommand as well as the added child are not marked as changed
	 * @returns {object} the composite command
	 */
	CompositeCommand.prototype.addCommand = function(oCommand, bSuppressInvalidate) {
		this._addCompositeIdToChange(oCommand);
		return this.addAggregation("commands", oCommand, bSuppressInvalidate);
	};

	/**
	 * @override
	 * @param {object} oCommand The command to be added to the aggregation of the composite command
	 * @param {int} iIndex the index the command should be inserted at
	 * @param {boolean} bSuppressInvalidate if true, this CompositeCommand as well as the added child are not marked as changed
	 * @returns {object} the composite command
	 */
	CompositeCommand.prototype.insertCommand = function(oCommand, iIndex, bSuppressInvalidate) {
		this._addCompositeIdToChange(oCommand);
		return this.insertAggregation("commands", oCommand, iIndex, bSuppressInvalidate);
	};

	return CompositeCommand;
});
