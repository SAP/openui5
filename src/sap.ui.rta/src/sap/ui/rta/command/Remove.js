/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"], function(FlexCommand) {
	"use strict";

	/**
	 * Remove a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.42
	 * @alias sap.ui.rta.command.Remove
	 * @experimental Since 1.42. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Remove = FlexCommand.extend("sap.ui.rta.command.Remove", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				removedElement : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	Remove.prototype._getChangeSpecificData = function() {
		var oElement = this.getRemovedElement() || this.getElement();

		var mSpecificInfo = {
			changeType : this.getChangeType(),
			removedElement : {
				id : oElement.getId()
			}
		};
		return mSpecificInfo;
	};

	return Remove;
});
