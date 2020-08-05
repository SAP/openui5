sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/rta/util/UrlParser"
], function (
	UIComponent,
	FlexControllerFactory,
	ChangePersistenceFactory,
	FakeLrepConnectorLocalStorage,
	ControlPersonalizationAPI,
	UrlParser
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
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// app specific setup
			this._createFakeLrep();

			this.oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this);
			this.oFlexController = FlexControllerFactory.createForControl(this);

			this.updateChangesModel();
		},

		updateChangesModel: function () {
			this.oChangePersistence.getChangesForComponent()//{includeCtrlVariants: true})
				.then(function (oChanges) {
					this.getModel().setProperty("/changes", oChanges);
				}.bind(this)
			);
		},

		createChangesAndSave: function (mChangeData, oControl) {
			ControlPersonalizationAPI.addPersonalizationChanges(
				{
					controlChanges: [
						{
							changeSpecificData: mChangeData,
							selectorControl: oControl
						}
					]
				}
			)
				.then(this.oFlexController.saveAll.bind(this.oFlexController, false))
				.then(this.updateChangesModel.bind(this));
		},

		resetPersonalization: function(aControls) {
			ControlPersonalizationAPI.resetChanges(aControls)
				.then(this.updateChangesModel.bind(this));
		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep: function () {
			if (UrlParser.getParam('sap-rta-mock-lrep') !== false) {
				FakeLrepConnectorLocalStorage.enableFakeConnector();
			}
		}
	});
});