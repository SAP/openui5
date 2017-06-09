/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/ManagedObject'], function(ManagedObject) {
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
	 * @override returns element instance instead of id
	 */
	BaseCommand.prototype.getElement = function() {
		var sId = this.getAssociation("element");
		return sap.ui.getCore().byId(sId);
	};

	/**
	 * @public Template Method will be called by the command factory when all data is provided to the change
	 */
	BaseCommand.prototype.prepare = function() {
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 */
	BaseCommand.prototype.execute = function() {
	};

	/**
	 * @public Template Method to implement undo logic
	 */
	BaseCommand.prototype.undo = function() {
	};

	/**
	 * Template Method to implement undo logic
	 *
	 * @returns {boolean} enabled boolean state
	 * @public
	 */
	BaseCommand.prototype.isEnabled = function() {
		return true;
	};

	return BaseCommand;

}, /* bExport= */true);
