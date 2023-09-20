sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI"
], function(
	Controller,
	MessageBox,
	ODataModel,
	Table,
	Column,
	HBox,
	Text,
	VariantManagement,
	jQuery,
	URI
) {
	"use strict";

	function isLocalhost() {
		return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
	}

	return Controller.extend("sap.ui.mdc.sample.TableODataV4PDFExport.View", {
		onInit: function() {
			if (isLocalhost()) {
				const sUrl = new URI(window.location.href);
				if (!sUrl.hasSearch("sap-ui-xx-enablePDFExport")) {
					window.location.href = sUrl.addSearch("sap-ui-xx-enablePDFExport", true);
				}
				const mSettings = JSON.parse(window.localStorage.getItem("settings"));

				if (mSettings) {
					this.byId("serviceUrl").setValue(mSettings.serviceUrl);
					this.byId("collectionName").setValue(mSettings.collectionName);
					this.byId("initiallyVisibleProperties").setValue(mSettings.initiallyVisibleProperties);
				}
			}
		},

		onRefresh: function() {

			// remove and destroy the existing mdc.Table
			const oVBox = this.byId("tableContainer");
			if (oVBox.getItems().length) {
				const oOldTable = oVBox.getItems()[0];
				oVBox.removeItem(oOldTable);
				oOldTable.destroy();
			}

			const sServiceUrl = this.byId("serviceUrl").getValue().trim(),
				sCollectionName = this.byId("collectionName").getValue().trim(),
				sInitiallyVisibleProperties = this.byId("initiallyVisibleProperties").getValue().trim();

			if (!sServiceUrl || !sCollectionName) {
				MessageBox.error("Please provide the required service URL and collection name");
				return;
			}

			if (isLocalhost()) {
				window.localStorage.setItem("settings", JSON.stringify({
					serviceUrl: sServiceUrl,
					collectionName: sCollectionName,
					initiallyVisibleProperties: sInitiallyVisibleProperties
				}));
			}

			const sProxyServiceUrl = "./proxy/" + sServiceUrl.replace("://", "/");
			const aInitiallyVisibleProperties = sInitiallyVisibleProperties.split(",").map(function(sProperty) {
				return sProperty.trim();
			}).filter(Boolean);

			const sUsername = this.byId("username").getValue();
			const sPassword = this.byId("password").getValue();

			if (sUsername && sPassword) {
				const sEncodedCredentials = btoa(sUsername + ":" + sPassword);
				const that = this;

				jQuery.ajax({
					url: sProxyServiceUrl + sCollectionName,
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "Basic " + sEncodedCredentials);
						xhr.setRequestHeader("accept", "*/*");
					},
					complete: function() {
						that.createTable(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties).then(function(oTable) {
							oVBox.addItem(oTable);
						});
					}
				});
			} else {
				this.createTable(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties).then(function(oTable) {
					oVBox.addItem(oTable);
				});
			}
		},

		createTable: function(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties) {
			const oTable = new Table({
				header: "Table header",
				enableExport: true,
				selectionMode: "Multi",
				p13nMode: ["Column"],
				noData: "This text is shown when no data is present in the table",
				delegate: {
					name: "delegates/odata/v4/TableDelegate",
					payload: {
						collectionName: sCollectionName
					}
				}
			});

			const oVariant = new VariantManagement();
			oVariant.addFor(oTable);
			oTable.setVariant(oVariant);
			oTable.setModel(new ODataModel({
				serviceUrl: sProxyServiceUrl,
				operationMode: "Server"
			}));

			return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
				aInitiallyVisibleProperties.forEach(function(sPropertyName) {
					const oProperty = oPropertyHelper.getProperty(sPropertyName);
					if (!oProperty.isComplex() && oProperty && oProperty.unitProperty) {
						this.createColumnWithUnitTemplate(oTable, oProperty, oProperty.unitProperty);
					} else if (!oProperty.isComplex() && oProperty && !oProperty.unitProperty) {
						this.createSimpleColumn(oTable, oProperty);
					} else if (oProperty.isComplex() && oProperty) {
						this.createComplexColumn(oTable, oProperty, oPropertyHelper);
					}
				}, this);

				oTable.rebind();
				return oTable;
			}.bind(this));
		},

		createColumnWithUnitTemplate: function(oTable, oProperty, oUnitProperty) {
			const oColumn = new Column({
				id: "id" + oProperty.name,
				propertyKey: oProperty.name,
				header: oProperty.label,
				hAlign: "End",
				template: new Text({
					text: {
						parts: [{
							path: oProperty.path
						}, {
							path: oUnitProperty.path
						}],
						formatter: function(sProperty, sUnit) {
							return sProperty + '\u2007' + sUnit;
						}
					}
				})
			});

			oTable.addColumn(oColumn);
		},

		createSimpleColumn: function(oTable, oProperty) {
			const oColumn = new Column({
				id: "id" + oProperty.name,
				propertyKey: oProperty.name,
				header: oProperty.label,
				template: new Text({
					text: {
						path: oProperty.path
					}
				})
			});

			oTable.addColumn(oColumn);
		},

		createComplexColumn: function(oTable, oProperty) {
			const aProperties = oProperty.getSimpleProperties();
			const oHBox = new HBox({
				renderType: "Bare"
			});

			aProperties.forEach(function(oProperty) {
				const oText = new Text({
					text: {
						path: oProperty.path,
						formatter: function(sValue) {
							return sValue + '\u2007';
						}
					}
				});
				oHBox.addItem(oText);
			});

			const oColumn = new Column({
				header: oProperty.label,
				propertyKey: oProperty.name,
				template: oHBox
			});

			oTable.addColumn(oColumn);
		}

	});
});