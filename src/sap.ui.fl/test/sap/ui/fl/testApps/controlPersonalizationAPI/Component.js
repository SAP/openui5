sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
], function(
	UriParameters,
	UIComponent,
	FlexControllerFactory,
	ChangePersistenceFactory,
	FakeLrepConnectorLocalStorage,
	ControlPersonalizationWriteAPI
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

		updateChangesModel() {
			this.oChangePersistence.getChangesForComponent()// {includeCtrlVariants: true})
			.then(function(oChanges) {
				this.getModel().setProperty("/changes", oChanges);
			}.bind(this));
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
			if (UriParameters.fromQuery(window.location.search).get("sap-rta-mock-lrep") !== false) {
				FakeLrepConnectorLocalStorage.enableFakeConnector();
			}
		}
	});
});