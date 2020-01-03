/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(
	FlexCommand
) {
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
	 * @since 1.34
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Property = FlexCommand.extend("sap.ui.rta.command.Property", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				propertyName : {
					type : "string"
				},
				newValue : {
					type : "any"
				},
				semanticMeaning : {
					type : "string"
				},
				changeType : {
					type : "string",
					defaultValue : "propertyChange"
				}
			},
			associations : {},
			events : {}
		}
	});

	Property.prototype._getChangeSpecificData = function() {
		var oElement = this.getElement();
		// general format
		return {
			changeType : this.getChangeType(),
			selector : {
				id : oElement.getId(),
				type : oElement.getMetadata().getName()
			},
			content : {
				property : this.getPropertyName(),
				newValue : this.getNewValue(),
				semantic : this.getSemanticMeaning()
			}
		};
	};

	return Property;
});
