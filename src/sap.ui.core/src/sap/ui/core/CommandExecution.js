/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/base/Log',
	'sap/base/util/isEmptyObject',
	'sap/ui/core/Component',
	'sap/ui/core/Element',
	'sap/ui/core/Shortcut'
], function (
	Log,
	isEmptyObject,
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
	 * owner components manifest (<code>/sap.ui5/commands/&lt;command&gt;</code>).
	 *
	 * You can use a CommandExecution instead of an event handler in XMLViews by
	 * using <code>cmd:</code> plus the command name.
	 *
	 * Example for <code>sap.m.Button</code>:
	 *
	 * <pre>
	 * &lt;Button press="cmd:MyCommand" /&gt;
	 * </pre>
	 *
	 * When the press event is fired, the CommandExecution will be triggered and
	 * the <code>execute</code> event is fired.
	 *
	 * When using commands, the component will create a model named <code>$cmd</code>.
	 * The model data provides the enabled state of all CommandExecution.
	 * When binding a button's enabled state to this model, it follows the
	 * enabled state of the CommandExecution. The binding path must be relative
	 * like <code>myCommand/enabled</code>:
	 *
	 * <pre>
	 * &lt;Button press="cmd:MyCommand" enabled="$cmd&gt;MyCommand/enabled" /&gt;
	 * </pre>
	 *
	 * <b>Note: The usage of the <code>$cmd</code> model is restricted to <code>sap.suite.ui.generic</code></b>
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
				 * The command's name, that has to be defined in the manifest.
				 * This property can only be applied initially.
				 */
				command: { type: "string" },
				/**
				 * Whether the CommandExecution is enabled or not. By default, it is enabled
				 */
				enabled: { type: "boolean" , defaultValue: true}
			},
			events: {
				 /**
				 * Execute will be fired when the CommandExecution will be triggered.
				 */
				execute: {}
			}
		},

		/**
		 * Fires the execute event and triggers the attached handler.
		 * If the CommandExecution is disabled, the handler will not be triggered.
		 * @public
		 */
		trigger: function () {
			if (this.getEnabled()) {
				this.fireExecute({});
			}
		},

		/**
		 * Sets a new value for property {@link #setting:command command}.
		 *
		 * The commands name, that has to be defined in the manifest.
		 * This property can only be applied initially.
		 *
		 * @param {string} sCommand New value for property <code>command</code>
		 * @return {sap.ui.core.CommandExecution} Reference to <code>this</code> in order to allow method chaining
		 * @private
		 */
		setCommand: function(sCommand) {
			if (!this.getCommand()) {
				this.setProperty("command", sCommand, true);
			} else {
				Log.error("The 'command' property can only be applied initially!");
			}
			return this;
		},

		/**
		 * Returns the Command info defined in the owner component's manifest
		 * (<code>/sap.ui5/commands/&lt;command&gt;</code>).
		 *
		 * In case no owner component is available or the command is not defined in the manifest
		 * <code>null</code> is returned.
		 *
		 * @returns {object} The command information from the manifest or <code>null</code>
		 * @private
		 */
		_getCommandInfo: function () {
			var oCommand = {},
				oControl = this.getParent(),
				oComponent = Component.getOwnerComponentFor(this);

			//if no owner found check the parent chain to find the next owner component...
			while (!oComponent && oControl && oControl.getParent()) {
				oComponent = Component.getOwnerComponentFor(oControl);
				oControl = oControl.getParent();
			}

			if (oComponent) {
				oCommand = oComponent.getCommand(this.getCommand());
			} else {
				Log.error("No owner component. CommandInfo for command - " + this.getCommand() + " not found");
			}
			return oCommand ? Object.assign({}, oCommand) : null;
		},

		/**
		 * Creates command data in <code>$cmd</code> model.
		 *
		 * @param {object} [oParentData] An optional parent object to chain if necessary
		 *
		 * @private
		 */
		_createCommandData: function(oParentData) {
			var oParent = this.getParent(),
				oParentContext = oParent.getBindingContext("$cmd"),
				oModel = oParent.getModel("$cmd"),
				oData = oModel.getData(),
				oContainerData = oData[oParent.getId()];

			if (!oContainerData) {
				oParentData = oParentContext ? oParentContext.getObject() : null;
				oContainerData = Object.create(oParentData);
			} else if (oParentData && oParentData !== Object.getPrototypeOf(oContainerData)) {
				oContainerData = Object.create(oParentData);
			} else if (oContainerData[this.getCommand()]) {
				return;
			}

			oContainerData[this.getCommand()] = {};
			oContainerData[this.getCommand()].enabled = this.getEnabled();
			oModel.setProperty("/" + oParent.getId(), oContainerData);
			this.bindProperty("enabled", {
				path: "$cmd>" + this.getCommand() + "/enabled"
			});
			oParent.bindElement("$cmd>/" + oParent.getId());
		},

		/** @inheritdoc */
		setParent: function (oParent) {
			var that = this,
				oCommand,
				oOldParent = this.getParent(),
				sShortcut,
				bIsRegistered;

			Element.prototype.setParent.apply(this, arguments);

			oCommand = this._getCommandInfo();

			function fnModelChange() {
				if (oParent.getModel("$cmd")) {
					this._createCommandData();
					this.getParent().detachModelContextChange(fnModelChange);
				}
			}

			if (oCommand) {
				if (oParent && oParent !== oOldParent) {
					//register Shortcut
					sShortcut = oCommand.shortcut;
					bIsRegistered = Shortcut.isRegistered(this.getParent(), sShortcut);
					if (!bIsRegistered && this.getEnabled()) {
						Shortcut.register(oParent, sShortcut, this.trigger.bind(this));
					}
					if (oParent.getModel("$cmd")) {
						this._createCommandData();
					} else {
						oParent.attachModelContextChange(fnModelChange.bind(this));
					}
					var fnOriginalPropagate = oParent._propagateProperties;
					oParent._propagateProperties = function() {
						var oProperties = oParent.oPropagatedProperties; /* we need to check the map directly as the passed oProperties does not contain the parent information anymore */
						var oParentContext = oProperties.oBindingContexts["$cmd"];
						var oContext = that.getBindingContext("$cmd");
						if (oParentContext && oContext && oParentContext !== oContext) {
							that._createCommandData(oParentContext.getObject());
						}
						fnOriginalPropagate.apply(oParent, arguments);
					};
					oParent._propagateProperties._sapui_fnOrig = fnOriginalPropagate;
				}
				if (oOldParent && oOldParent != oParent) {
					//unregister shortcut
					sShortcut = oCommand.shortcut;
					bIsRegistered = Shortcut.isRegistered(oOldParent, sShortcut);
					if (bIsRegistered) {
						Shortcut.unregister(oOldParent, oCommand.shortcut);
					}
					oOldParent._propagateProperties = oOldParent._propagateProperties._sapui_fnOrig;
				}
			}
			return this;
		},

		/** @inheritdoc */
		destroy: function () {
			var oParent = this.getParent();
			if (oParent) {
				var oCommand = this._getCommandInfo();
				Shortcut.unregister(this.getParent(), oCommand.shortcut);
				if (oParent.getBindingContext("$cmd")) {
					var oCommandData = oParent.getBindingContext("$cmd").getObject();
					if (oCommandData) {
						delete oCommandData[this.getCommand()];
					}
					if (isEmptyObject(oCommandData)) {
						oParent.unbindElement("$cmd");
					}
				}
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

