sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI"
], function(
	UIComponent,
	FlexObjectManager,
	ControlPersonalizationWriteAPI,
	PersistenceWriteAPI
) {
	"use strict";

	return UIComponent.extend("test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.Component", {
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init(...aArgs) {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, aArgs);

			// app specific setup
			this._createFakeLrep();

			this.updateChangesModel();
		},

		async updateChangesModel() {
			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this,
				includeCtrlVariants: true
			});
			this.getModel().setProperty("/changes", aFlexObjects);
		},

		async createChangesAndSave(mChangeData, oControl) {
			await ControlPersonalizationWriteAPI.add(
				{
					changes: [
						{
							changeSpecificData: mChangeData,
							selectorElement: oControl
						}
					]
				}
			);
			await PersistenceWriteAPI.save({ selector: this });
			await this.updateChangesModel.bind(this);
		},

		resetPersonalization(aControls) {
			ControlPersonalizationWriteAPI.reset({selectors: aControls})
			.then(this.updateChangesModel.bind(this));
		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep() {
			if (new URLSearchParams(window.location.search).get("sap-rta-mock-lrep") !== false) {
				undefined/*FakeLrepConnectorLocalStorage*/.enableFakeConnector();
			}
		}
	});
});