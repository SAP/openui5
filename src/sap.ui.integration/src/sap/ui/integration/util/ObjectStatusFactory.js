/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/controls/ObjectStatus"
], function (
	Utils,
	BindingHelper,
	ObjectStatus
) {
	"use strict";

	/**
	/**
	 * Utility class for creating objects.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.ObjectFactory
	 */
	var ObjectFactory = { };

	ObjectFactory._getVisible = function (oItem) {
		let vVisible = oItem.visible;

		if (typeof oItem.visible === "string") {
			vVisible = !Utils.hasFalsyValueAsString(vVisible);
		}

		return BindingHelper.reuse(vVisible);
	};

	ObjectFactory.createStatusItem = function (oItem) {
		return new ObjectStatus({
			text: oItem.value,
			visible: ObjectFactory._getVisible(oItem),
			state: oItem.state,
			showStateIcon: oItem.showStateIcon,
			customIcon: oItem.customStateIcon,
			inverted: oItem.inverted
		});
	};

	return ObjectFactory;
});