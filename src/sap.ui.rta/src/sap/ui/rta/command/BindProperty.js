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
	 * The BindProperty command take an element and the name of a property
	 * (propertyName) together with a complex binding string (newBinding).
	 * When executed, the binding is set on the property. The binding string
	 * has to comply with the same rules that apply to bindings passed to properties
	 * in the constructor of SAPUI5 ManagedObjects.
	 *
	 * Setting the oldValue or oldBinding is optional if you are running in the
	 * designMode (see unit test page).
	 * If set these take precedence over the actual value of the control.
	 * You should not set both properties.
	 *
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.rta.command.BindProperty
	 */
	var BindProperty = FlexCommand.extend("sap.ui.rta.command.BindProperty", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				propertyName: {
					type: "string"
				},
				newBinding: {
					type: "string"
				},
				changeType: {
					type: "string",
					defaultValue: "propertyBindingChange"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Overridden to suppress the binding strings to be used as binding.
	 * @override
	 */
	BindProperty.prototype.bindProperty = function(...aArgs) {
		const [sName, oBindingInfo] = aArgs;
		if (sName === "newBinding") {
			return this.setNewBinding(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, aArgs);
	};

	BindProperty.prototype._getChangeSpecificData = function() {
		var oElement = this.getElement();
		// general format
		var mSpecificChangeInfo = {
			changeType: this.getChangeType(),
			selector: {
				id: oElement.getId(),
				type: oElement.getMetadata().getName()
			},
			content: {
				property: this.getPropertyName(),
				newBinding: this.getNewBinding()
			}
		};

		return mSpecificChangeInfo;
	};

	return BindProperty;
});
