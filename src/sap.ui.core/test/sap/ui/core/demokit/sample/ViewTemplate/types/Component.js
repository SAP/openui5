/*!
 * ${copyright}
 */
/**
 * @fileOverview Application component to test bindings using OData types.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.types.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
	metadata: "json",
	createContent: function () {
		var sUri = "/sap/opu/odata/sap/ZKTH_TEA_TEST_APPLICATION/",
			oLayout = new sap.m.HBox(),
			sMockServerBaseUri =
				"test-resources/sap/ui/core/demokit/sample/ViewTemplate/types/data/",
			oMockServer,
			oModel,
			oView;

		if (jQuery.sap.getUriParameters().get("realOData") !== "true") {
			jQuery.sap.require("sap.ui.core.util.MockServer");

			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri});
			oMockServer.simulate(sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl: sMockServerBaseUri
			});
			oMockServer.start();
		} else if (location.hostname === "localhost") { //for local testing prefix with proxy
			sUri = "proxy" + sUri;
		}

		oModel = new sap.ui.model.odata.v2.ODataModel(
				sUri, {defaultBindingMode: sap.ui.model.BindingMode.TwoWay, useBatch: false});

		/**
		 * Sets the value state of the control if possible.
		 * @param {sap.ui.core.ValueState} sState state for the InputBase control
		 * @param {sap.ui.base.Event} oEvent the event to get the control
		 */
		function setState(sState, oEvent) {
			var oControl = oEvent.getSource(),
				oException;

			if (oControl && oControl.setValueState) {
				oControl.setValueState(sState);
				oException = oEvent.getParameter("exception");
				if (oException) {
					oControl.setValueStateText(oException.name + ": " + oException.message);
				}
			}
		}

		/**
		 * Sets the value state of the control to error if possible.
		 * @param {sap.ui.base.Event} oEvent the event to get the control
		 */
		function setErrorState(oEvent) {
			setState(sap.ui.core.ValueState.Error, oEvent);
		}

		function createView() {
			var oView = sap.ui.view({
				models: oModel,
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.types.Types"
			});
			//TODO check why list binding does not work
//			var oListBinding = oModel.bindList("/EdmTypesCollection");
//
//			oListBinding.attachDataReceived(function () {
//				oView.bindElement(oListBinding.getContexts()[0].getPath(), {models: oModel});
//			});
//			oListBinding.initialize();
//			oListBinding.refresh(true); //needed?
			var oContext = oModel.createBindingContext(
					"/EdmTypesCollection(ID='%20%201',DateTime=datetime'2014-03-25T00%3A00%3A00')",
					function(oContext) {
						oView.setBindingContext(oContext);
					});
			oView.attachFormatError(setErrorState);
			oView.attachParseError(setErrorState);
			oView.attachValidationError(setErrorState);
			oView.attachValidationSuccess(function (oEvent) {
				setState(sap.ui.core.ValueState.Success, oEvent);
			});

			oLayout.addItem(oView);
		}

		// _after_ meta data is loaded, create and add view
		//TODO Investigate with UI5 why we need to wait for loaded metadata if these are loaded async
		if (oModel.getServiceMetadata()) {
			createView();
		} else {
			oModel.attachMetadataLoaded(createView);
		}
		return oLayout;
	}
});
