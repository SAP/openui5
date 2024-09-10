/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"../metadata/JSONPropertyInfo",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Image",
	"sap/m/Link",
	"sap/ui/core/Icon",
	"sap/ui/core/mvc/View",
	"sap/m/Button",
	"../templateHelper"
], function (
	Element, TableDelegate, Column, Text, JSONPropertyInfo, HBox, VBox, Image, Link, Icon, View, Button, Helper) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.name !== "$search");

	const _getFileNameColumnTemplate = () => {
		// image control
		const oImage = new Image({
			src: {
				path: "documents>imageUrl"
			},
			visible: {
				path: "documents>imageUrl",
				formatter: function (sImageUrl) {
					return !!sImageUrl;
				}
			}
		});
		oImage.addStyleClass("sapMUSTItemImage");
		oImage.addStyleClass("sapMUSTItemIcon");

		const oIcon = new Icon({
			src: {
				parts: ["documents>mediaType", "documents>fileName"],
				formatter: Helper?.UploadSetwithTableControllerInstance?.getIconSrc?.bind(Helper.UploadSetwithTableControllerInstance)
			},
			visible: {
				path: "documents>imageUrl",
				formatter: function (sImageUrl) {
					return !sImageUrl;
				}
			}
		});
		oIcon.addStyleClass("sapMUSTItemImage");
		oIcon.addStyleClass("sapMUSTItemIcon");

		const oLink = new Link({
			text: {
				path: "documents>fileName"
			},
			press: Helper?.UploadSetwithTableControllerInstance?.openPreview?.bind(Helper.UploadSetwithTableControllerInstance)
		});
		oLink.addStyleClass("sapUiTinyMarginBottom");

		const oText = new Text({
			text: {
				path: "documents>documentType"
			}
		});

		const oVBox = new VBox({
			items: [oLink, oText]
		});
		oVBox.addStyleClass("sapUiMarginBegin");
		oVBox.addStyleClass("sapUiTinyMargin");

		const oHBox =  new HBox({
			items: [oImage, oIcon, oVBox]
		});
		return oHBox;

	};

	const _getIdColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "documents>id"
			}
		});
		return oText;
	};

	const _getStatusColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "documents>status"
			}
		});
		return oText;
	};

	const _getRevisionColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "documents>revision"
			}
		});
		return oText;
	};

	const _getFileSizeColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "documents>fileSize",
				formatter: Helper?.UploadSetwithTableControllerInstance?.getFileSizeWithUnits?.bind(Helper.UploadSetwithTableControllerInstance)
			}
		});
		return oText;
	};

	const _getLastModifiedColumnTemplate = () => {

		const oModifiedText = new Text({
			text: {
				path: "documents>lastModifiedBy"
			}
		});

		const oModifiedDesc = new Text({
			text: {
				path: "documents>lastmodified"
			}
		});
		oModifiedDesc.addStyleClass("sapUiTinyMarginTop");

		const oBox = new VBox({
			items: [oModifiedText, oModifiedDesc]
		});

		return oBox;
	};

	const _getRemoveActionColumnTemplate = () => {

		const oButton = new Button({
			type: "Transparent",
			icon: "sap-icon://decline",
			press: Helper?.UploadSetwithTableControllerInstance?.onRemoveHandler?.bind(Helper.UploadSetwithTableControllerInstance)
		});
		oButton.addStyleClass("sapUiTinyMarginBegin");

		return oButton;
	};

	const _createColumnTemplate = (oPropertyInfo) => {
		const sPropertyName = oPropertyInfo.key;
		let oTemplate;
		switch (sPropertyName) {
			case "fileName":
				oTemplate = _getFileNameColumnTemplate();
				 break;
			case "id":
				oTemplate = _getIdColumnTemplate();
				break;
			case "status":
				oTemplate = _getStatusColumnTemplate();
				break;
			case "revision":
				oTemplate = _getRevisionColumnTemplate();
				break;
			case "fileSize":
				oTemplate = _getFileSizeColumnTemplate();
				break;
			case "lastModified":
				oTemplate = _getLastModifiedColumnTemplate();
				break;
			case "removeAction":
				oTemplate = _getRemoveActionColumnTemplate();
				break;
			default:
				oTemplate = new Text({
					text: {
						path: sPropertyName
					}
				});
				break;
		}
		return new Column({
			propertyKey: oPropertyInfo.key,
			header: oPropertyInfo?.key === "removeAction" ? "" : oPropertyInfo.label,
			template: oTemplate
		});

	};

	const _createColumn = (sId, oPropertyInfo) => {
		return _createColumnTemplate(oPropertyInfo);
	};

	JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oTable.getId() + "---col-" + sPropertyName;
		return Element.getElementById(sId) ?? (await _createColumn(sId, oPropertyInfo));
	};

	JSONTableDelegate.removeItem = async (oTable, oColumn) => {
		oColumn.destroy();
		return true; // allow default handling
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
		oBindingInfo.templateShareable = true;
	};

	return JSONTableDelegate;
});