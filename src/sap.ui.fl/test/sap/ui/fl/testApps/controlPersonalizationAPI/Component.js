sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory"
], function(
	UIComponent,
	FlexObjectManager,
	ControlPersonalizationWriteAPI,
	ChangePersistenceFactory,
	FlexControllerFactory
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

			this.oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this);
			this.oFlexController = FlexControllerFactory.createForControl(this);

			this.updateChangesModel();
		},

		async updateChangesModel() {
			const aFlexObjects = await FlexObjectManager.getFlexObjects({
				selector: this,
				includeCtrlVariants: true
			});
			this.getModel().setProperty("/changes", aFlexObjects);
		},

		createChangesAndSave(mChangeData, oControl) {
			ControlPersonalizationWriteAPI.add(
				{
					changes: [
						{
							changeSpecificData: mChangeData,
							selectorElement: oControl
						}
					]
				}
			)
			.then(this.oFlexController.saveAll.bind(this.oFlexController, false))
			.then(this.updateChangesModel.bind(this));
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