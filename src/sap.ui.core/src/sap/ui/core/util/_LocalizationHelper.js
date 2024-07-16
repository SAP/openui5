/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Event",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/jquery"
], (
	BaseEvent,
	Log,
	Formatting,
	Localization,
	jQuery
) => {
	'use strict';

	const mRegistry = {};

	function getObjectsToUpdate() {
		let aObjectsToUpdate = [];
		for (const fnGetObjects of Object.values(mRegistry)) {
			aObjectsToUpdate = [...aObjectsToUpdate, ...Object.values(fnGetObjects())];
		}
		return aObjectsToUpdate;
	}

	function handleLocalizationChange(oEvent) {
		const sEventId = "LocalizationChanged";

		const mChanges = BaseEvent.getParameters(oEvent),
			oBrowserEvent = jQuery.Event(sEventId, {changes : mChanges}),
			aObjectsToUpdate = getObjectsToUpdate(),
			bRTLChanged = mChanges.rtl !== undefined,
			bLanguageChanged = mChanges.language !== undefined;

		Log.info("localization settings changed: " + Object.keys(mChanges).join(","), null, "sap/ui/core/util/LocalizationHelper");

		// special handling for changes of the RTL mode
		if (bRTLChanged) {
			// update the dir attribute of the document
			document.documentElement.setAttribute("dir", mChanges.rtl ? "rtl" : "ltr");
			Log.info("RTL mode " + mChanges.rtl ? "activated" : "deactivated");
		}

		// special handling for changes of the language
		if (bLanguageChanged) {
			// update the lang attribute of the document
			document.documentElement.setAttribute("lang", mChanges.language);
		}

		/*
		 * phase 1: update the models
		 */
		for (const oObject of aObjectsToUpdate) {
			for (const sName in oObject.oModels) {
				const oModel = oObject.oModels[sName];
				oModel?._handleLocalizationChange?.();
			}
		}

		/*
		 * phase 2: update bindings and types
		 */
		for (const oObject of aObjectsToUpdate) {
			for (const sName in oObject.mBindingInfos) {
				const oBindingInfo = oObject.mBindingInfos[sName];
				const aParts = oBindingInfo.parts;
				if (aParts) {
					// property or composite binding: visit all parts
					for (let i = 0; i < aParts.length; i++) {
						oBindingInfo.type?._handleLocalizationChange?.();
					}
					oBindingInfo.modelChangeHandler?.();
				}
			}
			// invalidate all UIAreas if RTL changed
			if (bRTLChanged && oObject.isA("sap.ui.core.UIArea")) {
				oObject.invalidate();
			}
			// notify Elements via a pseudo browser event (onLocalizationChanged)
			if (oObject.isA("sap.ui.core.Element")) {
				oBrowserEvent._bNoReturnValue = true; // localizationChanged handler aren't allowed to return any value, mark for future fatal throw.
				oObject._handleEvent(oBrowserEvent);
			}
		}
	}

	Formatting.attachChange(handleLocalizationChange);
	Localization.attachChange(handleLocalizationChange);

	/**
	 * Update all localization dependent objects that this managed object can reach,
	 * except for its aggregated children (which will be updated by the Core).
	 *
	 * To make the update work as smooth as possible, it happens in two phases:
	 * <ol>
	 *  <li>In phase 1 all known models are updated.</li>
	 *  <li>In phase 2 all bindings are updated.</li>
	 * </ol>
	 * This separation is necessary as the models for the bindings might be updated
	 * in some ManagedObject or in the Core and the order in which the objects are visited
	 * is not defined.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	const _LocalizationHelper = {
		init() {
			const sDir = Localization.getRTL() ? "rtl" : "ltr";

			// Set the document's dir property
			document.documentElement.setAttribute("dir", sDir); // webkit does not allow setting document.dir before the body exists
			Log.info("Content direction set to '" + sDir + "'", null, "sap/ui/core/util/_LocalizationHelper");
			// Set the document's lang property
			document.documentElement.setAttribute("lang", Localization.getLanguageTag().toString()); // webkit does not allow setting document.dir before the body exists
		},
		registerForUpdate(sType, fnGetObjects) {
			mRegistry[sType] = fnGetObjects;
		}
	};

	return _LocalizationHelper;
});
