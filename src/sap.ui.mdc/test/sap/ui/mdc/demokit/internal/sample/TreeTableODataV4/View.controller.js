sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/m/MessageBox",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/thirdparty/jquery"
], function(
	Controller,
	Table,
	Column,
	TreeTableType,
	FilterBar,
	FilterField,
	ODataModel,
	HBox,
	Text,
	MessageBox,
	VariantManagement,
	jQuery
) {
	"use strict";

	const sLocalStorageKey = "TreeTableODataV4.settings";

	function isLocalhost() {
		return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
	}

	return Controller.extend("sap.ui.mdc.sample.TreeTableODataV4.View", {
		onInit: function() {
			if (isLocalhost()) {
				const mSettings = JSON.parse(window.localStorage.getItem(sLocalStorageKey));

				if (mSettings) {
					this.byId("serviceUrl").setValue(mSettings.serviceUrl);
					this.byId("collectionName").setValue(mSettings.collectionName);
					this.byId("hierarchyQualifier").setValue(mSettings.hierarchyQualifier);
					this.byId("initiallyVisibleProperties").setValue(mSettings.initiallyVisibleProperties);
				}
			}
		},

		onRefresh: function() {
			const sServiceUrl = this.byId("serviceUrl").getValue().trim();
			const sCollectionName = this.byId("collectionName").getValue().trim();
			const sHierarchyQualifier = this.byId("hierarchyQualifier").getValue().trim();
			const sInitiallyVisibleProperties = this.byId("initiallyVisibleProperties").getValue().trim();
			const oVBox = this.byId("content");

			if (!sServiceUrl || !sCollectionName || !sHierarchyQualifier) {
				MessageBox.error("Please provide the required service URL, collection name, and hierarchy qualifier");
				return;
			}

			oVBox.destroyItems();

			if (isLocalhost()) {
				window.localStorage.setItem(sLocalStorageKey, JSON.stringify({
					serviceUrl: sServiceUrl,
					collectionName: sCollectionName,
					hierarchyQualifier: sHierarchyQualifier,
					initiallyVisibleProperties: sInitiallyVisibleProperties
				}));
			}

			const sProxyServiceUrl = "./proxy/" + sServiceUrl.replace("://", "/");
			const aInitiallyVisibleProperties = sInitiallyVisibleProperties.split(",").map(function(sProperty) {
				return sProperty.trim();
			}).filter(Boolean);
			const sUsername = this.byId("username").getValue();
			const sPassword = this.byId("password").getValue();

			oVBox.setModel(new ODataModel({
				serviceUrl: sProxyServiceUrl,
				operationMode: "Server",
				autoExpandSelect: true
			}));

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
						that.createContentControls(sProxyServiceUrl, sCollectionName, sHierarchyQualifier, aInitiallyVisibleProperties).forEach(function(oControl) {
							oVBox.addItem(oControl);
						});
					}
				});
			} else {
				this.createContentControls(sProxyServiceUrl, sCollectionName, sHierarchyQualifier, aInitiallyVisibleProperties).forEach(function(oControl) {
					oVBox.addItem(oControl);
				});
			}
		},

		createContentControls: function(sProxyServiceUrl, sCollectionName, sHierarchyQualifier, aInitiallyVisibleProperties) {
			return [
				this.createVariantManagement(),
				this.createFilterBar(sProxyServiceUrl, sCollectionName),
				this.createTable(sProxyServiceUrl, sCollectionName, sHierarchyQualifier, aInitiallyVisibleProperties)
			];
		},

		createVariantManagement: function() {
			return new VariantManagement("variant", {
				"for": ["mdcTable", "mdcFilterBar"]
			});
		},

		createTable: function(sProxyServiceUrl, sCollectionName, sHierarchyQualifier, aInitiallyVisibleProperties) {
			const oTable = new Table("mdcTable", {
				type: new TreeTableType(),
				header: "TreeTable",
				enableExport: true,
				selectionMode: "Multi",
				enableAutoColumnWidth: true,
				showRowCount: false,
				p13nMode: ["Column", "Filter", "Sort", "Group", "Aggregate"],
				delegate: {
					name: "sap/ui/mdc/sample/TreeTableODataV4/TableDelegate",
					payload: {
						collectionName: sCollectionName,
						hierarchyQualifier: sHierarchyQualifier
					}
				},
				autoBindOnInit: false,
				filter: "mdcFilterBar"
			});

			oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
				aInitiallyVisibleProperties.forEach(function(sPropertyName) {
					const oProperty = oPropertyHelper.getProperty(sPropertyName);
					const oUnitProperty = oProperty.unitProperty;
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
		},

		createFilterBar: function(sProxyServiceUrl, sCollectionName) {
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
					propertyKey: "$search",
					maxConditions: 1,
					width: "100%"
				}),
				p13nMode: ["Item"]
			});
		}
	});
});