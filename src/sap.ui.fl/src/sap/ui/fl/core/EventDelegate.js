/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/Utils",
	"sap/ui/base/EventProvider",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/core/FlexVisualizer",
	"sap/base/Log"
], function (
	jQuery,
	Utils,
	EventProvider,
	ChangeRegistry,
	FlexVisualizer,
	Log
) {
	"use strict";

	/**
	 *
	 * @constructor
	 * @param {sap.ui.core.Control} oControl Control reference of the control which is currently in focus
	 * @param {Object} oSupportedRegistryItems Object with supported changes as registry items. Structure matches the returnvalue of @see sap.ui.fl.registry.ChangeRegistry#getRegistryItems	 *
	 * @alias sap.ui.fl.core.EventDelegate
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 * @private
	 *
	 */
	var EventDelegate = function (oControl, oSupportedRegistryItems) {
		if (!oControl) {
			Log.error("sap.ui.fl.core.EventDelegate: Control required");
		}
		if (!oSupportedRegistryItems) {
			Log.error("sap.ui.fl.core.EventDelegate: Supported registry items required");
		}

		EventProvider.apply(this);

		this._oControl = oControl;
		this._oSupportedRegistryItems = oSupportedRegistryItems;
	};

	EventDelegate.prototype = Object.create(EventProvider.prototype || null);

	/**
	 * Register a control for using flexibility
	 * @param {sap.ui.core.Control} oControl Control which should be registered
	 *
	 * @public
	 */
	EventDelegate.registerControl = function (oControl) {
		if (oControl) {
			// check if the control is already registered
			var i = 0;
			if (oControl.aDelegates) {
				for (i = 0; i < oControl.aDelegates.length; i++) {
					var sType = "";
					if (oControl.aDelegates[i].oDelegate && oControl.aDelegates[i].oDelegate.getType) {
						sType = (oControl.aDelegates[i].oDelegate.getType());
					}
					if (sType === "Flexibility") {
						return; // already added
					}
				}
			}
			EventDelegate.registerExplicitChanges(oControl);
		}
	};

	/**
	 * Register a control for explicit changes - changes which use a dialog or similar to do the change and can only be activated in a certain mode
	 * @param {sap.ui.core.Control} oControl Control which should be registered
	 *
	 * @public
	 */
	EventDelegate.registerExplicitChanges = function (oControl) {
		var oRegistry = ChangeRegistry.getInstance();
		var mParam = {
			controlType: Utils.getControlType(oControl)
		};
		var oSupportedRegistryItems = oRegistry.getRegistryItems(mParam);

		// check if the control will be handled by personalization
		if (Object.keys(oSupportedRegistryItems).length > 0) {
			oControl.addEventDelegate(new EventDelegate(oControl, oSupportedRegistryItems));
		}
	};

	/**
	 * Unregister the control which was registered before
	 *
	 * @public
	 */
	EventDelegate.unregisterControl = function () {

	};

	/**
	 * Function which is called on mouse-over on the registered control to trigger the flexibility framework
	 * @param {jQuery.Event} oEvent Event parameters
	 *
	 * @public
	 */
	EventDelegate.prototype.onmouseover = function (oEvent) {
		oEvent.stopPropagation();
		// stopPropagation unfortunately kills column resize of table
		// therefore custom property on the event
		if (oEvent.handled) {
			return;
		}

		oEvent.handled = true;

		//TODO: Get from FlexController, once checked-in
		if (FlexVisualizer.isPersonalizationMode()) {
			if (this._oControl && !jQuery(this._oControl.getDomRef()).hasClass("sapuiflex-highlight")) {
				FlexVisualizer.showDialog(this._oControl);
			}
		}
	};

	/**
	 * Function which is called on mouse-out on the registered control to notify that the control is not in scope anymore for flexibility
	 * @param {jQuery.Event} oEvent Event parameters
	 *
	 * @public
	 */
	EventDelegate.prototype.onmouseout = function () {
		//TODO: Get from FlexController, once checked-in
		if (FlexVisualizer.isPersonalizationMode()) {
			if (this._oControl) {
				FlexVisualizer.closeDialog();
			}
		}
	};

	return EventDelegate;
}, true);