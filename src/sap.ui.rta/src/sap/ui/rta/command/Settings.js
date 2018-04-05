/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'], function(FlexCommand) {
	"use strict";

	/**
	 * Basic implementation for the command pattern.
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Settings = FlexCommand.extend("sap.ui.rta.command.Settings", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				content : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});


	Settings.prototype._getChangeSpecificData = function(bForward) {

		var mSpecificInfo = {
				changeType : this.getChangeType(),
				content : this.getContent()
		};

		return mSpecificInfo;
	};


	/**
	 * @override
	 */
	Settings.prototype.execute = function() {
		if (this.getElement()) {
			return FlexCommand.prototype.execute.apply(this, arguments);
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * @override
	 */
	Settings.prototype.undo = function() {
		if (this.getElement()) {
			return FlexCommand.prototype.undo.apply(this, arguments);
		} else {
			return Promise.resolve();
		}
	};

	return Settings;

}, /* bExport= */true);
