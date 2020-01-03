/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject"], function(ManagedObject) {
	"use strict";

	/**
	 * Basic implementation for the command pattern.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var BaseCommand = ManagedObject.extend("sap.ui.rta.command.BaseCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				name : {
					type : "string"
				},
				runtimeOnly : {
					type : "boolean"
				}
			},
			associations : {
				element : {
					type : "sap.ui.core.Element"
				}
			},
			events : {}
		}
	});


	/**
	 * Returns element instance instead of ID.
	 * @override
	 */
	BaseCommand.prototype.getElement = function() {
		var sId = this.getAssociation("element");
		return sap.ui.getCore().byId(sId);
	};

	/**
	 * Template Method called by the command factory when all data is provided to the change.
	 *
	 * @return {boolean} Returns true if the preparation was successful
	 * @public
	 */
	BaseCommand.prototype.prepare = function() {
		return true;
	};

	/**
	 * Template method to implement execute logic. You have to ensure that the
	 * element property is available.
	 *
	 * @return {Promise} Returns a resolving Promise
	 * @public
	 */
	BaseCommand.prototype.execute = function() {
		return Promise.resolve();
	};

	BaseCommand.prototype.getVariantChange = function() {
		return this._oVariantChange;
	};

	/**
	 * Template method to implement undo logic.
	 *
	 * @return {Promise} Returns a resolving Promise
	 * @public
	 */
	BaseCommand.prototype.undo = function() {
		return Promise.resolve();
	};

	/**
	 * Template method to check if the command is enabled.
	 *
	 * @return {boolean} Returns enabled boolean state
	 * @public
	 */
	BaseCommand.prototype.isEnabled = function() {
		return true;
	};

	return BaseCommand;
});
