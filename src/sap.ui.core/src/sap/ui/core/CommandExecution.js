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
				enabled: { type: "boolean" , defaultValue: true},
				/**
				 * Whether the CommandExecution is visible, or not. By default, it is visible.
				 * If not visible, the CommandExecution will not be triggered even if it is enabled.
				 */
				visible: { type: "boolean" , defaultValue: true}
			},
			events: {
				 /**
				 * Execute will be fired when the CommandExecution will be triggered.
				 */
				execute: {}
			}
		},

		bSkipUpdate:false,

		/**
		 * Fires the execute event and triggers the attached handler.
		 * If the CommandExecution is disabled, the handler will not be triggered.
		 * @public
		 */
		trigger: function () {
			if (this.getVisible() && this.getEnabled()) {
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
			var oCommand,
				oControl = this.getParent(),
				oComponent = Component.getOwnerComponentFor(this);

			//if no owner found check the parent chain to find the next owner component...
			while (!oComponent && oControl && oControl.getParent()) {
				oComponent = Component.getOwnerComponentFor(oControl);
				oControl = oControl.getParent();
			}

			if (oComponent) {
				oCommand = oComponent.getCommand(this.getCommand());
			}
			return oCommand ? Object.assign({}, oCommand) : null;
		},

		/**
		 * Update Context data
		 * @param {object} oCommandData The CommandData if it already exists
		 * @private
		 */
		_updateContextData: function(oCommandData) {
			var oParent = this.getParent();

			oCommandData[this.getCommand()] = {};
			oCommandData[this.getCommand()].enabled = this.getEnabled();
			oCommandData[this.getCommand()].id = this.getId();
			oCommandData[this.getCommand()].visible = this.getVisible();
			this.getModel("$cmd").setProperty("/" + oParent.getId(), oCommandData);
		},

		/**
		 * Creates command data in <code>$cmd</code> model.
		 *
		 * @param {object} [oParentData] An optional parent object to chain if necessary
		 *
		 * @private
		 */
		_createCommandData: function(oParentData) {
			if (!this.bSkipUpdate) {
				//prevent multiple updates due to model changes;
				this.bSkipUpdate = true;

				var oParent = this.getParent(),
				oModel = oParent.getModel("$cmd"),
				oData = oModel.getData(),
				oContainerData = oData[oParent.getId()];

				//no data yet
				if (!oContainerData) {
					oContainerData = Object.create(oParentData);
				//parent data changed
				} else if (oParentData !== Object.getPrototypeOf(oContainerData)) {
					oContainerData = Object.create(oParentData);
				}

				this._updateContextData(oContainerData);
				if (!oParent.getObjectBinding("$cmd")) {
					oParent.bindElement("$cmd>/" + oParent.getId());
				}
				this.bSkipUpdate = false;
			}
		},

		/** @inheritdoc */
		setParent: function (oParent) {
			var that = this,
				oCommand,
				oOldParent = this.getParent(),
				oParentData,
				sShortcut,
				bIsRegistered;

			function getParentData() {
				var oParentContext = oParent.oPropagatedProperties.oBindingContexts["$cmd"];
				return oParentContext ? oParentContext.getObject() : null;
			}

			function fnModelChange() {
				if (oParent.getModel("$cmd")) {
					var oParentData = getParentData();
					//detach listener first to avoid side effects
					that.getParent().detachModelContextChange(fnModelChange);
					that._createCommandData(oParentData);
				}
			}

			Element.prototype.setParent.apply(this, arguments);

			oCommand = this._getCommandInfo();

			if (oCommand && this.getVisible()) {
				if (oParent && oParent !== oOldParent) {
					//register Shortcut
					sShortcut = oCommand.shortcut;
					bIsRegistered = Shortcut.isRegistered(this.getParent(), sShortcut);
					if (!bIsRegistered) {
						Shortcut.register(oParent, sShortcut, this.trigger.bind(this));
					}

					if (oParent.getModel("$cmd")) {
						oParentData = getParentData();
						this._createCommandData(oParentData);
					} else {
						oParent.attachModelContextChange(fnModelChange);
					}

					if (!oParent._propagateProperties._sapui_fnOrig) {
						var fnOriginalPropagate = oParent._propagateProperties;
						oParent._propagateProperties = function(vName, oObject, oProperties, bUpdateAll, sName, bUpdateListener) {
							var oActualContext = oParent.getBindingContext("$cmd");
							if (oActualContext) {
								var oActualData = oActualContext.getObject();
								var oOldParentData = Object.getPrototypeOf(oActualData);
								oParentData = getParentData();
								if (oOldParentData !== oParentData) {
									//update all CommandExecutions if parent Context changed
									var aDependents = this.getDependents();
									aDependents.forEach(function(oDependent) {
										if (oDependent.isA("sap.ui.core.CommandExecution")) {
											that._createCommandData.apply(oDependent, [oParentData]);
										}
									});
								}
							}
							fnOriginalPropagate.apply(oParent, arguments);
						};
						oParent._propagateProperties._sapui_fnOrig = fnOriginalPropagate;
					}
				}
				if (oOldParent && oOldParent != oParent) {
					//unregister shortcut
					sShortcut = oCommand.shortcut;
					bIsRegistered = Shortcut.isRegistered(oOldParent, sShortcut);
					if (bIsRegistered) {
						Shortcut.unregister(oOldParent, oCommand.shortcut);
					}
					this._cleanupContext(oOldParent);
				}
			}
			return this;
		},

		/**
		 * Cleanup of command data, binding context and propagation wrapper
		 *
		 * @param {sap.ui.core.Control} oControl The Control to cleanup
		 * @private
		*/
		_cleanupContext: function(oControl) {
			if (oControl.getBindingContext("$cmd")) {
				var oCommandData = oControl.getBindingContext("$cmd").getObject();
				if (oCommandData) {
					delete oCommandData[this.getCommand()];
					if (isEmptyObject(Object.assign({}, oCommandData))) {
						//reset _propagateProperties if not yet done...
						if (oControl._propagateProperties._sapui_fnOrig) {
							oControl._propagateProperties = oControl._propagateProperties._sapui_fnOrig;
						}
						//unbindContext as no command execution data exists anymore (only if parent is not in destruction)
						if (!oControl._bIsBeingDestroyed) {
							oControl.unbindElement("$cmd");
						}
					}
				}
			}
		},

		/**
		 * Sets whether the <code>CommandExecution</code> is visible, or not. If set to
		 * false, the <code>CommandExecution</code> will unregister the shortcut. If not visible,
		 * the CommandExecution will not be triggered even if it is enabled.
		 *
		 * @param {boolean} bValue Whether the CommandExecution is visible, or not.
		 * @returns {sap.ui.core.Element} The CommandExecution
		 *
		 * @public
		 */
		setVisible: function(bValue) {
			var oParent = this.getParent(),
				oCmdModel = this.getModel("$cmd");

			this.setProperty("visible", bValue, true);

			//when null/undefined is passed the property internally gets converted to a default value
			bValue = this.getProperty("visible");

			if (oParent) {
				var oCommand = this._getCommandInfo(),
					sShortcut = oCommand.shortcut,
					bIsRegistered = Shortcut.isRegistered(oParent, sShortcut);

				if (bValue && !bIsRegistered) {
					Shortcut.register(oParent, sShortcut, this.trigger.bind(this));
				} else if (!bValue && bIsRegistered) {
					Shortcut.unregister(oParent, sShortcut);
				}
			}
			//update $cmd Model
			if (oCmdModel) {
				var oContext = this.getBindingContext("$cmd");
				oCmdModel.setProperty(this.getCommand() + "/visible", bValue, oContext);
			}
			return this;
		},

		/**
		 * Sets whether the <code>CommandExecution</code> is enabled, or not. If set to
		 * false, the <code>CommandExecution</code> will still register the shortcut.
		 * This will block the default behavior for that shortcut.
		 *
		 * @param {boolean} bValue Whether the CommandExecution is enabled, or not.
		 * @returns {sap.ui.core.Element} The CommandExecution
		 *
		 * @public
		 */
		setEnabled: function(bValue) {
			var oCmdModel = this.getModel("$cmd");

			this.setProperty("enabled", bValue, true);

			//update $cmd Model
			if (oCmdModel) {
				var oContext = this.getBindingContext("$cmd");
				oCmdModel.setProperty(this.getCommand() + "/enabled", this.getProperty("enabled"), oContext);
			}
			return this;
		},

		/** @inheritdoc */
		destroy: function () {
			var oParent = this.getParent();
			if (oParent) {
				var oCommand = this._getCommandInfo();
				Shortcut.unregister(this.getParent(), oCommand.shortcut);
				this._cleanupContext(oParent);
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
		for (i = 0; i < oAggregation.length; i++) {
			if (oAggregation[i].isA("sap.ui.core.CommandExecution") && oAggregation[i].getCommand() === sCommand) {
				oCommandExecution = oAggregation[i];
			}
		}
		if (!oCommandExecution && oControl.getParent()) {
			oCommandExecution = CommandExecution.find(oControl.getParent(), sCommand);
		}
		return oCommandExecution;
	};

	return CommandExecution;
});

