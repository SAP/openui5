/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/CustomData'
], function(CustomData) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldHelpCustomData</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @param {string} [mSettings.key="sap-ui-DocumentationRef"] the key set by default with value
	 * "sap-ui-DocumentationRef"
	 * @param {any} [mSettings.value] the value
	 *
	 * @class
	 * This class inherits from <code>sap.ui.core.CustomData</code> and trigger update of field help when
	 * <code>key</code> is set to "sap-ui-DocumentationRef" and <code>value</code> is set with an array of
	 * strings. It also updates field help once such an instance of this class is destroyed.
	 *
	 * @extends sap.ui.core.CustomData
	 * @since 1.130
	 *
	 * @hideconstructor
	 * @private
	 * @ui5-restricted sap.ui.comp.filterbar, sap.fe.templates.ListReport
	 * @alias sap.ui.core.fieldhelp.FieldHelpCustomData
	 */
	const FieldHelpCustomData = CustomData.extend("sap.ui.core.fieldhelp.FieldHelpCustomData", {
		metadata: {
			library: "sap.ui.core"
		}
	});

	FieldHelpCustomData.DOCUMENTATION_REF_KEY = "sap-ui-DocumentationRef";

	function updateFieldHelpOnParent(oCustomData) {
		const oParent = oCustomData.getParent();
		if (oParent
			&& oCustomData.getKey() === FieldHelpCustomData.DOCUMENTATION_REF_KEY
			&& Array.isArray(oCustomData.getValue())) {
			oParent.updateFieldHelp?.();
		}
	}

	FieldHelpCustomData.prototype.init = function() {
		// set default key
		this.setKey(FieldHelpCustomData.DOCUMENTATION_REF_KEY);
	};

	FieldHelpCustomData.prototype.setParent = function(oParent) {
		const oRes = CustomData.prototype.setParent.apply(this, arguments);
		updateFieldHelpOnParent(this);

		return oRes;
	};

	FieldHelpCustomData.prototype.destroy = function() {
		const oParent = this.getParent();
		const oRes = CustomData.prototype.destroy.apply(this, arguments);

		if (oParent && this.getKey() === FieldHelpCustomData.DOCUMENTATION_REF_KEY) {
			oParent.updateFieldHelp?.();
		}

		return oRes;
	};

	FieldHelpCustomData.prototype.setKey = function(sKey) {
		if (sKey !== FieldHelpCustomData.DOCUMENTATION_REF_KEY) {
			throw new Error(`Unsupported key "${sKey}" for sap.ui.core.fieldhelp.FieldHelpCustomData`);
		}
		return CustomData.prototype.setKey.apply(this, arguments);
	};

	FieldHelpCustomData.prototype.setValue = function(vValue) {
		const oRes = CustomData.prototype.setValue.apply(this, arguments);
		updateFieldHelpOnParent(this);
		return oRes;
	};

	return FieldHelpCustomData;
});