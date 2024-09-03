sap.ui.define([
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Image",
    "sap/ui/core/Icon",
    "sap/m/Link",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/HBox"
], function(Button, Label, Image, Icon, Link, Text, VBox, HBox) {
    'use strict';
    const _getFileNameColumnTemplate = function (fnIconSrcHandler = () => {}, fnPreviewHandler = () => {}) {
		// image control
		const oImage = new Image({
			src: {
				path: "imageUrl"
			},
			visible: {
				path: "imageUrl",
				formatter: function (sImageUrl) {
					return !!sImageUrl;
				}
			}
		});
		oImage.addStyleClass("sapMUSTItemImage");
		oImage.addStyleClass("sapMUSTItemIcon");

		const oIcon = new Icon({
			src: {
				parts: ["mediaType", "fileName"],
				formatter: fnIconSrcHandler
			},
			visible: {
				path: "imageUrl",
				formatter: function (sImageUrl) {
					return !sImageUrl;
				}
			}
		});
		oIcon.addStyleClass("sapMUSTItemImage");
		oIcon.addStyleClass("sapMUSTItemIcon");

		const oLink = new Link(  {
			text: {
				path: "fileName"
			},
			press: fnPreviewHandler
		});

		oLink.addStyleClass("sapUiTinyMarginBottom");

		const oText = new Text({
			text: {
				path: "documentType"
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
				path: "id"
			}
		});
		return oText;
	};

	const _getStatusColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "status"
			}
		});
		return oText;
	};

	const _getRevisionColumnTemplate = () => {
		const oText = new Text({
			text: {
				path: "revision"
			}
		});
		return oText;
	};

	const _getFileSizeColumnTemplate = (fnHandler = () => {}) => {
		const oText = new Text({
			text: {
				path: "fileSize",
				formatter: fnHandler
			}
		});
		return oText;
	};

	const _getLastModifiedColumnTemplate = () => {

		const oModifiedText = new Text({
			text: {
				path: "lastModifiedBy"
			}
		});

		const oModifiedDesc = new Text({
			text: {
				path: "lastmodified"
			}
		});
		oModifiedDesc.addStyleClass("sapUiTinyMarginTop");

		const oBox = new VBox({
			items: [oModifiedText, oModifiedDesc]
		});

		return oBox;
	};

	const _getRemoveActionColumnTemplate = (fnhandler = () => {}) => {

		const oButton = new Button({
			type: "Transparent",
			icon: "sap-icon://decline",
			press: fnhandler
		});
		oButton.addStyleClass("sapUiTinyMarginBegin");

		return oButton;
	};

    return {
        getFileNameColumnTemplate: _getFileNameColumnTemplate,
        getIdColumnTemplate: _getIdColumnTemplate,
        getStatusColumnTemplate: _getStatusColumnTemplate,
        getRevisionColumnTemplate: _getRevisionColumnTemplate,
        getFileSizeColumnTemplate: _getFileSizeColumnTemplate,
        getLastModifiedColumnTemplate: _getLastModifiedColumnTemplate,
        getRemoveActionColumnTemplate: _getRemoveActionColumnTemplate
    };
});