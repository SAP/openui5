/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	Component,
	ChangePersistenceFactory,
	FlexCustomData,
	extractChangeDependencies,
	Utils
) {
	"use strict";

	/**
	 * Provides an object with the changes for the current application as well as
	 * further information. I.e. if the changes were applied and their dependencies.
	 *
	 * @namespace sap.ui.fl.support._internal.getChangeDependencies
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	return function () {
		return Utils.getUShellService("AppLifeCycle").then(function (oAppLifeCycleService) {
			var oCurrentAppContainerObject;

			if (oAppLifeCycleService) {
				oCurrentAppContainerObject = oAppLifeCycleService.getCurrentApplication().componentInstance;
			} else {
				var aApplications = Component.registry.filter(function (oComponent) {
					return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
				});

				if (aApplications.length === 1) {
					oCurrentAppContainerObject = aApplications[0];
				}
			}

			if (oCurrentAppContainerObject) {
				var oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);

				return extractChangeDependencies(oChangePersistence);
			}

			return {};
		});
	};
});
