sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/thirdparty/jquery"
], function(
	Controller,
	MessageBox,
	ODataModel,
	Table,
	Column,
	HBox,
	Text,
	VariantManagement,
	FilterBar,
	FilterField,
	jQuery
) {
	"use strict";

	function isLocalhost() {
		return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
	}

	return Controller.extend("sap.ui.mdc.sample.TableODataV4Analytics.View", {
		onInit: function() {
			if (isLocalhost()) {
				var mSettings = JSON.parse(window.localStorage.getItem("settings"));

				if (mSettings) {
					this.byId("serviceUrl").setValue(mSettings.serviceUrl);
					this.byId("collectionName").setValue(mSettings.collectionName);
					this.byId("initiallyVisibleProperties").setValue(mSettings.initiallyVisibleProperties);
				}
			}
		},

		onRefresh: function() {
			var sServiceUrl = this.byId("serviceUrl").getValue().trim();
			var sCollectionName = this.byId("collectionName").getValue().trim();
			var sInitiallyVisibleProperties = this.byId("initiallyVisibleProperties").getValue().trim();
			var oVBox = this.byId("content");

			if (!sServiceUrl || !sCollectionName) {
				MessageBox.error("Please provide the required service URL and collection name");
				return;
			}

			oVBox.destroyItems();

			if (isLocalhost()) {
				window.localStorage.setItem("settings", JSON.stringify({
					serviceUrl: sServiceUrl,
					collectionName: sCollectionName,
					initiallyVisibleProperties: sInitiallyVisibleProperties
				}));
			}

			var sProxyServiceUrl = "./proxy/" + sServiceUrl.replace("://", "/");
			var aInitiallyVisibleProperties = sInitiallyVisibleProperties.split(",").map(function(sProperty) {
				return sProperty.trim();
			}).filter(Boolean);
			var sUsername = this.byId("username").getValue();
			var sPassword = this.byId("password").getValue();

			if (sUsername && sPassword) {
				var sEncodedCredentials = btoa(sUsername + ":" + sPassword);
				var that = this;

				jQuery.ajax({
					url: sProxyServiceUrl + sCollectionName,
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "Basic " + sEncodedCredentials);
						xhr.setRequestHeader("accept", "*/*");
					},
					complete: function() {
						that.createContentControls(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties).forEach(function(oControl) {
							oVBox.addItem(oControl);
						});
					}
				});
			} else {
				this.createContentControls(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties).forEach(function(oControl) {
					oVBox.addItem(oControl);
				});
			}
		},

		createContentControls: function(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties) {
			return [
				this.createVariantManagement(),
				this.createFilterBar(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties),
				this.createTable(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties)
			];
		},

		createVariantManagement: function() {
			return new VariantManagement("variant", {
				"for": ["mdcTable", "mdcFilterBar"]
			});
		},

		createTable: function(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties) {
			var oTable = new Table("mdcTable", {
				header: "Table with analytical capabilities",
				enableExport: true,
				selectionMode: "Multi",
				p13nMode: ["Column", "Filter", "Sort", "Group", "Aggregate"],
				delegate: {
					name: "delegates/odata/v4/TableDelegate",
					payload: {
						collectionName: sCollectionName
					}
				},
				autoBindOnInit: false,
				models: new ODataModel({
					serviceUrl: sProxyServiceUrl,
					synchronizationMode: "None",
					operationMode: "Server"
				}),
				filter: "mdcFilterBar"
			});

			oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
				aInitiallyVisibleProperties.forEach(function(sPropertyName) {
					var oProperty = oPropertyHelper.getProperty(sPropertyName);
					var oUnitProperty = oProperty.unitProperty;
					if (!oProperty.isComplex() && oProperty && oUnitProperty) {
						this.createColumnWithUnitTemplate(oTable, oProperty, oUnitProperty);
					} else if (!oProperty.isComplex() && oProperty && !oUnitProperty) {
						this.createSimpleColumn(oTable, oProperty);
					} else if (oProperty.isComplex() && oProperty) {
						this.createComplexColumn(oTable, oProperty, oPropertyHelper);
					}
				}, this);

				oTable.rebind();
			}.bind(this));

			return oTable;
		},

		createColumnWithUnitTemplate: function(oTable, oProperty, oUnitProperty) {
			var oColumn = new Column({
				id: "id" + oProperty.name,
				dataProperty: oProperty.name,
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
			var oColumn = new Column({
				id: "id" + oProperty.name,
				dataProperty: oProperty.name,
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
			var aProperties = oProperty.getSimpleProperties();
			var oHBox = new HBox({
				renderType: "Bare"
			});

			aProperties.forEach(function(oProperty) {
				var oText = new Text({
					text: {
						path: oProperty.path,
						formatter: function(sValue) {
							return sValue + '\u2007';
						}
					}
				});
				oHBox.addItem(oText);
			});

			var oColumn = new Column({
				header: oProperty.label,
				dataProperty: oProperty.name,
				template: oHBox
			});

			oTable.addColumn(oColumn);
		},

		createFilterBar: function(sProxyServiceUrl, sCollectionName, aInitiallyVisibleProperties) {
			return new FilterBar("mdcFilterBar", {
				liveMode: false,
				delegate: {
					name: "delegates/odata/v4/FilterBarDelegate",
					payload: {
						collectionName: sCollectionName
					}
				},
				basicSearchField: new FilterField({
					delegate: {
						name: "delegates/odata/v4/FieldBaseDelegate"
					},
					dataType: "Edm.String",
					placeholder: "Search",
					conditions: "{$filters>/conditions/$search}",
					maxConditions: 1,
					width: "100%"
				}),
				p13nMode: ["Item"]
			});
		}
	});
});