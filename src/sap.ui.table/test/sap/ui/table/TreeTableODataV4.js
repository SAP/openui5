// Note: the HTML page 'TreeTableODataV4.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/m/HBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/Input",
	"sap/m/Toolbar",
	"sap/m/VBox",
	"sap/m/FlexItemData"
], function(Element, ODataV4Selection, ODataModel, TreeTable, Column, HBox, Icon, Text, OverflowToolbar, Title, Input, Toolbar, VBox, FlexItemData) {
	"use strict";
	var oTable = new TreeTable({
		columns: [
			new Column({
				label: "Name",
				sortProperty: "Name",
				filterProperty: "Name",
				template: new HBox({
					items: [
						new Icon({
							src: {
								path: "FileType",
								formatter: function(sFileType) {
									return sFileType === "D" ? "sap-icon://folder-blank" : "sap-icon://document";
								}
							},
							size: "0.8rem"
						}).addStyleClass("sapUiTinyMarginEnd"),
						new Text({text: "{Name}", wrapping: false})
					]
				})
			}),
			new Column({
				label: "File Type",
				sortProperty: "FileType",
				filterProperty: "FileType",
				template: new Text({text: "{FileType}", wrapping: false})
			}),
			new Column({
				label: "File Size",
				sortProperty: "FileSize",
				filterProperty: "FileSize",
				template: new Text({text: "{FileSize}", wrapping: false})
			}),
			new Column({
				label: "Created At",
				sortProperty: "createdAt",
				filterProperty: "createdAt",
				template: new Text({text: "{createdAt}", wrapping: false})
			}),
			new Column({
				label: "Changed At",
				sortProperty: "changedAt",
				filterProperty: "changedAt",
				template: new Text({text: "{changedAt}", wrapping: false})
			})
		],
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Title of the Table ({headerContext>$count})"})
				]
			})
		],
		plugins: new ODataV4Selection({
			enableNotification: true
		}),
		visibleRowCountMode: "Auto"
	});
	oTable._oProxy._bEnableV4 = true;
	window.oTable = oTable;

	TABLESETTINGS.addServiceSettings(oTable, "TreeTableODataV4ServiceSettings", function(mServiceSettings) {
		mServiceSettings.hierarchyQualifier = Element.getElementById("TableSettings_HierarchyQualifier").getValue();
		mServiceSettings.expandToLevel = Element.getElementById("TableSettings_ExpandToLevel").getValue();

		oTable.setModel(new ODataModel({
			serviceUrl: mServiceSettings.defaultProxyUrl,
			operationMode: "Server",
			autoExpandSelect: true
		}));

		oTable.bindRows({
			path: "/" + mServiceSettings.collection,
			parameters: {
				$count: true,
				$$aggregation: {
					hierarchyQualifier: mServiceSettings.hierarchyQualifier,
					expandTo: mServiceSettings.expandToLevel
				}
			}
		});

		oTable.setModel(oTable.getModel(), "headerContext");
		oTable.getExtension()[0].setBindingContext(oTable.getBinding().getHeaderContext(), "headerContext");
	}, function(oToolbar, mServiceSettings) {
		oToolbar.addContent(new Input("TableSettings_HierarchyQualifier", {
			value: mServiceSettings.hierarchyQualifier,
			tooltip: "Hierarchy Qualifier",
			placeholder: "Enter Hierarchy Qualifier"
		}));
		oToolbar.addContent(new Input("TableSettings_ExpandToLevel", {
			value: mServiceSettings.expandToLevel || 1,
			tooltip: "Expand To Level",
			placeholder: "Enter Level To Expand To"
		}));
	});

	TABLESETTINGS.init(oTable, function(oButton) {
		var oToolbar = oTable.getExtension()[0];

		if (!oToolbar) {
			oToolbar = new Toolbar();
			oTable.addExtension(oToolbar);
		}

		oToolbar.addContent(oButton);
	});

	oTable.getBindingInfo("rows");

	new VBox({
		width: "100%",
		items: [
			oTable.setLayoutData(new FlexItemData({growFactor: 1}))
		]
	}).placeAt("content");
});