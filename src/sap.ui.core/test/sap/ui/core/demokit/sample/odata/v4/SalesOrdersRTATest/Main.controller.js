/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text"
], function (jQuery, Button, Column, Label, Text) {
	"use strict";

	return sap.ui.controller("sap.ui.core.sample.odata.v4.SalesOrdersRTATest.Main", {

		onInit : function () {
			var oView = this.getView(),
				oAdaptSalesOrdersButton = new Button({
					icon : "sap-icon://settings",
					id : oView.createId("AdaptUISalesOrdersTable"),
					press : this.onAdaptSalesOrders.bind(this),
					tooltip : "Adapt Sales Orders Table"
				});

			this.iIdCounter = 0;
			oAdaptSalesOrdersButton.addDependent(sap.ui.xmlfragment(oView.getId(),
				"sap.ui.core.sample.odata.v4.SalesOrdersRTATest.AdaptDialog", this));
			this.byId("salesOrderListToolbar").addContent(oAdaptSalesOrdersButton);

			this.byId("salesOrderDetailsToolbar").addContent(new Button({
				icon : "sap-icon://settings",
				id : oView.createId("AdaptUISalesOrdersDetails"),
				press : this.onAdaptSODetails.bind(this),
				tooltip : "Adapt Sales Order Details"
			}));
			this.byId("SO_2_BP::detail").addContent(new Button({
				icon : "sap-icon://settings",
				id : oView.createId("AdaptUIBusinessPartner"),
				press : this.onAdaptBusinessPartner.bind(this),
				tooltip : "Adapt Business Partner Table"
			}));
			this.byId("lineItemsToolbar").addContent(new Button({
				icon : "sap-icon://settings",
				id : oView.createId("AdaptUISalesOrderLineItems"),
				press : this.onAdaptSalesOrderItems.bind(this),
				tooltip : "Adapt Sales Order Line Items Table"
			}));
		},


		/**
		 * Adapt the given container control like table or form
		 *
		 * @param {oControl} [oControl]
		 *   The Container control
		 * @param {number} [iStart]
		 *   Index in the "items" or "content" aggregation of the container control: controls can be
		 *   added or removed starting at this index
		 * @param {number} [iEnd]
		 *   Index in the "items" or "content" aggregation of the container control: controls can be
		 *   added or removed if having an index less than iEnd. If not given, defaults to
		 *   aggregation length.
		 * @param {string} [sEntityMetaPath]
		 *   The meta path of the entity type to be adapted; defaults to the meta path of the
		 *   binding path of the container control
		 */
		adaptControl : function (oControl, iStart, iEnd, sEntityMetaPath) {
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
				oRootBinding = oBinding.getRootBinding(),
				that = this;

			oModel = oBinding.getModel();
			sMetaPath = sEntityMetaPath || oModel.getMetaModel().getMetaPath(
				oModel.resolve(oBinding.getPath(), oBinding.getContext()));
			oEntityType = oModel.getMetaModel().getObject(sMetaPath + "/");
			if (oItemsBinding) {
				aContainedControls = oControl.getBindingInfo("items").template.getCells();
			} else {
				this.iStart = iStart || 0;
				this.iEnd = iEnd || oControl.getContent().length;
				aContainedControls = oControl.getContent().slice(iStart, iEnd);
			}
			this.sNavigationProperty = "";
			this.aDisplayedProperties = aContainedControls.reduce(
				function (aNames, oCell) {
					var oBindingInfo = oCell.getBindingInfo("text")
							? oCell.getBindingInfo("text")
							: oCell.getBindingInfo("value"),
						aSegments = [];

					if (oBindingInfo && oBindingInfo.parts.length === 1) {
						aSegments = oBindingInfo.parts[0].path.split("/");
						if (aSegments.length === 1) {
							aNames.push(aSegments[0]);
						} else if (aSegments.length === 2 && aSegments[0].includes("_2_")
								&& !oItemsBinding) {
							// two segments, first one is navigation property, only for form
							// container in which also navigation properties can be adapted
							that.sNavigationProperty = aSegments[0];
							aNames.push(aSegments[1]);
						} else {
							aNames.push(oBindingInfo.parts[0].path);
						}
					} else if (!(oCell instanceof Label)){
						aNames.push("<Not a Text or Input control or composite binding>");
					}
					return aNames;
				}, []
			);
			this.aDisplayedProperties.forEach(function (sPropertyName) {
				aProperties.push({
					name : sPropertyName,
					displayed : true,
					// properties in complex type property cannot be adapted
					enabled : !sPropertyName.includes("/") && !sPropertyName.startsWith("<Not")
				});
			});
			for (sPropertyName in oEntityType) {
				if (oEntityType[sPropertyName].$kind === "Property"
						&& oEntityType[sPropertyName].$Type.startsWith("Edm.")) {
					if (this.aDisplayedProperties.indexOf(sPropertyName) < 0) {
						aProperties.push({
							name: sPropertyName,
							displayed: false,
							enabled: true
						});
					}
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
			oView.byId("AdaptDialog").open();
		},

		onAdaptBusinessPartner : function () {
			var oControl = this.byId("SalesOrderList::detail"),
				iStart = oControl.getContent().indexOf(this.byId("SO_2_BP::detail")) + 1;

			this.adaptControl(oControl, iStart, undefined, "/BusinessPartnerList");
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
				if (oControl === that.byId("SalesOrderList")) {
					that.byId("salesOrderListTitle").setBindingContext(
						oControl.getBinding("items").getHeaderContext());
				}
			}

			function addHandler(sPropertyPath) {
				var sBindingPath = that.sNavigationProperty
						? that.sNavigationProperty + "/" + sPropertyPath
						: sPropertyPath,
					iIndex,
					sTextId = "RTA_" + sPropertyPath + that.iIdCounter,
					oText = new Text({
						id : sTextId,
						text : "{" + sBindingPath + "}"
					});

				that.iIdCounter += 1;
				if (oItemsBinding) {
					//TODO clarify: How to access template in change handler, there is no API?
					oControl.getBindingInfo("items").template.addCell(oText);
					oControl.addColumn((new Column()).setHeader(new Text({text : sPropertyPath})));
					recreateBinding();
				} else {
					iIndex = that.iStart + that.aDisplayedProperties.length * 2;
					oControl.insertContent(oText, iIndex);
					oControl.insertContent(new Label({labelFor : sTextId, text : sPropertyPath}),
						iIndex);
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
					oControl.removeContent(that.iStart + iIndex * 2); // remove label
					// remove text or input, note: index updated by previous removal
					oControl.removeContent(that.iStart + iIndex * 2);
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
			this.adaptControl(this.byId("SalesOrderList"));
			this.getView().getModel("ui").setProperty("/bSalesOrderSelected", false);
		},

		onAdaptSalesOrderItems : function () {
			this.adaptControl(this.byId("SO_2_SOITEM"));
		},

		onAdaptSODetails : function () {
			var oControl = this.byId("SalesOrderList::detail"),
				iEnd = oControl.getContent().indexOf(this.byId("SO_2_BP::detail"));

			this.adaptControl(oControl, 1, iEnd);
		},

		onApplyChanges : function () {
			var oControl = this.oAdaptationControl,
				oBinding = oControl.getBinding("items") // list binding
					|| oControl.getObjectBinding() // context binding
					|| oControl.getBindingContext().getBinding(), // parent binding
				oRootBinding = oBinding.getRootBinding(),
				oView = this.getView();

			if (oRootBinding.isSuspended()) {
				oRootBinding.resume();
			}
			oView.byId("AdaptDialog").close();
		}
	});
});
