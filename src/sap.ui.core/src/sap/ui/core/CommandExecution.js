/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/base/Log',
	'sap/ui/core/Component',
	'sap/ui/core/Element',
	'sap/ui/core/Shortcut'
], function (
	Log,
	Component,
	Element,
	Shortcut
) {
	"use strict";
	/**
	 * Creates and initializes a new CommandExecution.
	 *
	 * The CommandExecution registers a shortcut when it is added to the dependent
	 * aggregation of a control. The shortcut information is retrieved from the
	 * owner components manifest entry that matches the command.
	 *
	 * @class
	 * @alias sap.ui.core.CommandExecution
	 * @since 1.70
	 *
	 * @public
	 */
	var CommandExecution = Element.extend("sap.ui.core.CommandExecution", /** @lends sap.ui.core.CommandExecution.prototype */ {
		metadata: {
			library: "sap.ui.core",
			properties: {
				/**
				 * The commands name, that has to be defined in the manifest
				 */
				command: { type: "string" }
			},
			events: {
				 /**
				 * Execute will be fired when the CommandExecution will be triggered.
				 */
				execute: {}
			}
		},

		/**
		 * Fires the execute event and triggers the attached handler
		 *
		 * @public
		 */
		trigger: function () {
			this.fireExecute({});
		},

		/**
		 * Returns the Command info defined in the manifest
		 *
		 * @returns {object} The command information from the manifest
		 * @public
		 */
		getCommandInfo: function () {
			var oCommand = {},
				oComponent = Component.getOwnerComponentFor(this);

			if (oComponent) {
				oCommand = oComponent.getCommand(this.getCommand());
			} else {
				Log.error("No owner component. CommandInfo for command - " + this.getCommand() + " not found");
			}
			return Object.assign({}, oCommand);
		},

		/** @inheritdoc */
		setParent: function (oParent) {
			var oCommand = this.getCommandInfo();

			if (!oCommand) {
				Log.error("Command " + this.getCommand() + " not defined in manifest");
				return;
			}

			if (oParent) {
				//register Shortcut
				var sShortcut = oCommand.shortcut;
				Shortcut.register(oParent, sShortcut, this.trigger.bind(this));
			} else if (this.getParent()) {
				Shortcut.unregister(this.getParent(), oCommand.shortcut);
			}
			return Element.prototype.setParent.apply(this, arguments);
		},

		/** @inheritdoc */
		destroy: function () {
			if (this.getParent()) {
				var oCommand = this.getCommandInfo();

				Shortcut.unregister(this.getParent(), oCommand.shortcut);
			}
			Element.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Searches the control tree for a CommandExecution that matches the given command name.
	 *
	 * @param {sap.ui.core.Control} oControl the control/region the shortcut was triggered
	 * @param {string} sCommand Name of the command
	 *
	 * @returns {sap.ui.core.CommandExecution|undefined} The CommandExecution or undefined
	 * @static
	 * @private
	 */
	CommandExecution.find = function(oControl, sCommand) {
		var i, oCommandExecution, oAggregation;

		oAggregation = oControl.getDependents();
		if (oAggregation) {
			for (i = 0; i < oAggregation.length; i++) {
				if (oAggregation[i].isA("sap.ui.core.CommandExecution") && oAggregation[i].getCommand() === sCommand) {
					oCommandExecution = oAggregation[i];
				}
			}
		}
		if (!oCommandExecution && oControl.getParent()) {
			oCommandExecution = CommandExecution.find(oControl.getParent(), sCommand);
		}
		return oCommandExecution;
	};

	return CommandExecution;
});

