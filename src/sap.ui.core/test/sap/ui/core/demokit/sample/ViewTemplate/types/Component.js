/*!
 * ${copyright}
 */
/**
 * @fileOverview Application component to test bindings using OData types.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.types.Component");

jQuery.sap.require("sap.ui.model.odata.type.Decimal");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
	metadata: "json",
	createContent: function () {
		var sUri = "/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/types/data/",
			oModel = new sap.ui.model.json.JSONModel(sUri + "model.json"),
			oView;

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

		oView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.types.Types",
			models: oModel
		});

		oView.attachFormatError(setErrorState);
		oView.attachParseError(setErrorState);
		oView.attachValidationError(setErrorState);
		oView.attachValidationSuccess(function (oEvent) {
			setState(sap.ui.core.ValueState.Success, oEvent);
		});

		return oView;
	}
});
