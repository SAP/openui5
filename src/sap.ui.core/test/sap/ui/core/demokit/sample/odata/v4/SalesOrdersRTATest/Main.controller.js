/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Button',
		'sap/m/Column',
		'sap/m/Label',
		'sap/m/Text',
		"sap/ui/test/TestUtils"
], function (Button, Column, Label, Text, TestUtils) {
	"use strict";

	return sap.ui.controller("sap.ui.core.sample.odata.v4.SalesOrdersRTATest.Main", {

		onInit : function () {
			var bRealOData = TestUtils.isRealOData(),
				oAdaptSalesOrdersButton = new Button({
					enabled : bRealOData,
					icon : "sap-icon://settings",
					press : this.onAdaptSalesOrders.bind(this)
				});

			oAdaptSalesOrdersButton.addDependent(sap.ui.xmlfragment(
				"sap.ui.core.sample.odata.v4.SalesOrdersRTATest.AdaptDialog", this));
			this.byId("SalesOrdersToolbar").addContent(oAdaptSalesOrdersButton);
			this.byId("SalesOrderDetailsToolbar").addContent(new Button({
				enabled : bRealOData,
				icon : "sap-icon://settings",
				press : this.onAdaptSODetails.bind(this)
			}));
			this.byId("BusinessPartnerToolbar").addContent(new Button({
				enabled : bRealOData,
				icon : "sap-icon://settings",
				press : this.onAdaptBusinessPartner.bind(this)
			}));
			this.byId("SalesOrderLineItemsTitleToolbar").addContent(new Button({
				enabled : bRealOData,
				icon : "sap-icon://settings",
				press : this.onAdaptSalesOrderItems.bind(this)
			}));
		},

		// adapt given container control like table or form
		adaptControl : function (oControl) {
			var aContainedControls,
				oEntityType,
				aProperties = [],
				sPropertyName,
				oView = this.getView(),
				oItemsBinding = oControl.getBinding("items"),
				oBinding = oItemsBinding // list binding
					|| oControl.getObjectBinding() // context binding
					|| oControl.getBindingContext().getBinding(), // parent binding
				sMetaPath,
				oModel,
				oRootBinding = oBinding.getRootBinding();

			oModel = oBinding.getModel();
			sMetaPath = oModel.getMetaModel().getMetaPath(
				oModel.resolve(oBinding.getPath(), oBinding.getContext()));
			oEntityType = oModel.getMetaModel().getObject(sMetaPath + "/");
			aContainedControls = oItemsBinding
				? oControl.getBindingInfo("items").template.getCells()
				: oControl.getContent();
			this.aDisplayedProperties = aContainedControls.reduce(
				function (aNames, oCell) {
					var oBindingInfo = oCell.getBindingInfo("text")
							? oCell.getBindingInfo("text")
							: oCell.getBindingInfo("value");

					// exclude cells not having text or value property or a composite binding
					if (oBindingInfo && oBindingInfo.parts.length === 1) {
						aNames.push(oBindingInfo.parts[0].path);
					}
					return aNames;
				}, []
			);
			for (sPropertyName in oEntityType) {
				if (oEntityType[sPropertyName].$kind === "Property") {
					aProperties.push({
						name : sPropertyName,
						displayed : this.aDisplayedProperties.indexOf(sPropertyName) >= 0
					});
				}
			}
			oView.getModel("ui").setProperty("/adaptationProperties", aProperties);
			this.oAdaptationControl = oControl;
			// number of removed (negative) or added (positive) controls: compute correct index
			//   of contained controls in container control aggregation (items or content)
			this.iControlDelta = 0;
			// absolute list bindings need to be recreated; for others their root needs to be
			// suspended if not yet done
			if ((!oItemsBinding || oItemsBinding !== oRootBinding) && !oRootBinding.isSuspended()) {
				oRootBinding.suspend();
			}
			sap.ui.getCore().byId("AdaptDialog").open();
		},

		onAdaptBusinessPartner : function () {
			this.adaptControl(this.byId("BusinessPartner"));
		},

		onAdaptColumnOrField : function (oEvent) {
			var oChangedProperty = this.getView().getModel("ui").getProperty(
					oEvent.getSource().getBinding("text").getContext().getPath()),
				oControl = this.oAdaptationControl,
				oItemsBinding = oControl.getBinding("items"),
				that = this;

			// It is not possible to modify the aggregation's template on an existing binding.
			// Hence, we have to re-create.
			function recreateBinding() {
				var oBindingInfo = oControl.getBindingInfo("items"),
					oTemplate = oBindingInfo.template;

				// ensure template is not shared between old and new binding
				delete oBindingInfo.template;
				oControl.bindItems(jQuery.extend({}, oBindingInfo, {
					// a root binding needs to be suspended initially
					suspended : oItemsBinding === oItemsBinding.getRootBinding(),
					template : oTemplate
				}));
				// Note: after re-creation of the binding, one has to set the new header context
				//   for the $count binding in the title
				if (oControl === that.byId("SalesOrders")) {
					that.byId("SalesOrdersTitle").setBindingContext(
						oControl.getBinding("items").getHeaderContext());
				}
			}

			function addHandler(sPropertyPath) {
				var oText = new Text({
						text : "{" + sPropertyPath + "}"
					});

				if (oItemsBinding) {
					//TODO clarify: How to access template in change handler, there is no API?
					oControl.getBindingInfo("items").template.addCell(oText);
					oControl.addColumn((new Column()).setHeader(new Text({text : sPropertyPath})));
					recreateBinding();
				} else {
					oControl.addContent(new Label({text : sPropertyPath}));
					oControl.addContent(oText);
				}
				that.aDisplayedProperties.push(sPropertyPath);
			}

			function removeHandler(sPropertyPath) {
				var iIndex = that.aDisplayedProperties.indexOf(sPropertyPath);

				if (iIndex < 0) {
					return;
				}
				if (oItemsBinding) {
					oControl.getBindingInfo("items").template.removeCell(iIndex);
					oControl.removeColumn(iIndex);
					recreateBinding();
				} else { // form: assume fields are represented as combi label with text or input
					oControl.removeContent(iIndex * 2); // remove label
					// remove text or input, note: index updated by previous removal
					oControl.removeContent(iIndex * 2);
				}
				that.aDisplayedProperties.splice(iIndex, 1);
			}

			if (oChangedProperty.displayed) {
				addHandler(oChangedProperty.name);
			} else {
				removeHandler(oChangedProperty.name);
			}
		},

		onAdaptSalesOrders : function () {
			this.adaptControl(this.byId("SalesOrders"));
			this.getView().getModel("ui").setProperty("/bSalesOrderSelected", false);
		},

		onAdaptSalesOrderItems : function () {
			this.adaptControl(this.byId("SalesOrderLineItems"));
		},

		onAdaptSODetails : function () {
			this.adaptControl(this.byId("SalesOrderDetails"));
		},

		onApplyChanges : function () {
			var oControl = this.oAdaptationControl,
				oBinding = oControl.getBinding("items") // list binding
					|| oControl.getObjectBinding() // context binding
					|| oControl.getBindingContext().getBinding(), // parent binding
				oRootBinding = oBinding.getRootBinding();

			if (oRootBinding.isSuspended()) {
				oRootBinding.resume();
			}
			sap.ui.getCore().byId("AdaptDialog").close();
		}
	});
});
