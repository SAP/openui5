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
	 * @since 1.40
	 * @alias sap.ui.dt.command.BaseCommand
	 * @experimental Since 1.40. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var BaseCommand = ManagedObject.extend("sap.ui.dt.command.BaseCommand", {
		metadata : {
			library : "sap.ui.dt",
			properties : {
				element : {
					type : "sap.ui.core.Element"
				},
				elementId : {
					type : "string"
				},
				name : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	BaseCommand.ERROR_UNKNOWN_ID = "no element for id: ";

	/**
	 * @protected Template Method to implement execute logic, with ensure precondition Element is available
	 */
	BaseCommand.prototype._executeWithElement = function(oElement) {
	};

	BaseCommand.prototype.execute = function() {
		this._withElement(this._executeWithElement.bind(this));
	};

	/**
	 * @protected Template Method to implement undo logic, with ensure precondition Element is available
	 */
	BaseCommand.prototype._undoWithElement = function(oElement) {
	};

	BaseCommand.prototype.undo = function() {
		this._withElement(this._undoWithElement.bind(this));
	};

	BaseCommand.prototype._withElement = function(fn) {
		var oElement = this._getElement();
		if (oElement) {
			fn(oElement);
		} else {
			jQuery.sap.log.error(this.getMetadata().getName(), BaseCommand.ERROR_UNKNOWN_ID + this.getElementId());
		}
	};

	BaseCommand.prototype.serialize = function() {
	};

	BaseCommand.prototype.isEnabled = function() {
		return true;
	};

	BaseCommand.prototype._getElement = function() {
		// Check if Element could be complete virtual property (always created by id)
		var oElement = this.getElement();
		if (!oElement) {
			oElement = sap.ui.getCore().byId(this.getElementId());
			this.setElement(oElement);
		}
		return oElement;
	};

	return BaseCommand;

}, /* bExport= */true);
