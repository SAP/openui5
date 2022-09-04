/*!
 * ${copyright}
 */

// Provides
sap.ui.define([
	"sap/base/util/each",
	"sap/ui/commons/Label",
	"sap/ui/commons/Link",
	"sap/ui/commons/TextView",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/commons/layout/MatrixLayoutCell",
	"sap/ui/commons/layout/MatrixLayoutRow",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/ux3/QuickView"
],
	function(each, Label, Link, TextView, MatrixLayout, MatrixLayoutCell, MatrixLayoutRow, Control, Element, ODataModel, QuickView) {
	"use strict";

	/**
	 * Create a Quickview Instance. This Method is only working with the UI2 QuickView service.
	 *
	 * @param {string} sServiceUrl
	 * @param {string} sConfigName
	 * @param {string} sThingKey
	 * @returns {sap.ui.ux3.QuickView}
	 */

	var QuickViewUtils = {
		/* create a QV instance with content */
		createQuickView: function(sServiceUrl,sConfigName,sThingKey,mFormatter) {
			var oModel = new ODataModel(sServiceUrl,false);

			var oQV = new QuickView({
				firstTitle: "{title}",
				firstTitleHref: "{titleLinkURL}",
				type:"{Thing/text}",
				icon:"{imageURL}"
			});
			oQV.setModel(oModel);
			oQV.bindObject("/QuickviewConfigs(name='" + sConfigName + "',thingKey='" + sThingKey + "')",{expand:"Thing,QVAttributes/Attribute,QVActions/Action"});

			var oMQVC = new QvContent();
			oMQVC.bindAggregation("items",{path:"QVAttributes",factory: function(sId, oContext) {
				var oQVItem = new QvItem(sId, {label:"{Attribute/label}",link: "{valueLinkURL}",order:"{order}"});
				oQVItem.bindProperty("value","value",mFormatter && mFormatter[oContext.getProperty("Attribute/name")]);
				return oQVItem;
			}});
			oQV.addContent(oMQVC);
			return oQV;
		},
		/* add content to an existing QV */
		createQuickViewData: function(oQV,sServiceUrl,sConfigName,sThingKey,mFormatter) {
			var oModel = new ODataModel(sServiceUrl,false);
			oQV.removeAllContent();
			oQV.setModel(oModel);
			oQV.bindProperty("firstTitle", "title");
			oQV.bindProperty("firstTitleHref", "titleLinkURL");
			oQV.bindProperty("type", "Thing/text");
			oQV.bindProperty("icon", "imageURL");
			oQV.bindObject("/QuickviewConfigs(name='" + sConfigName + "',thingKey='" + sThingKey + "')",{expand:"Thing,QVAttributes/Attribute,QVActions/Action"});

			var oMQVC = new QvContent();
			oMQVC.bindAggregation("items",{path:"QVAttributes",factory: function(sId, oContext) {
				var oQVItem = new QvItem(sId, {label:"{Attribute/label}",link: "{valueLinkURL}",order:"{order}"});
				oQVItem.bindProperty("value","value",mFormatter && mFormatter[oContext.getProperty("Attribute/name")]);
				return oQVItem;
			}});
			oQV.addContent(oMQVC);
		},
		/* create a QV instance with dataset content */
		createDataSetQuickView: function(sServiceUrl, sCollection, sType, mProperties, iSizeLimit) {
			var oModel = new ODataModel(sServiceUrl,false);
			if (iSizeLimit) {
				oModel.setSizeLimit(iSizeLimit);
			}
			var oQV = new QuickView({type:sType, showActionBar:false});
			oQV.setModel(oModel);
			oQV.addContent(this._createDSContent(oQV,sCollection,mProperties));
			return oQV;
		},
		/* add dataset content to an existing QV */
		createDataSetQuickViewData: function(oQV,sServiceUrl, sCollection, sType, mProperties, iSizeLimit) {
			var oModel = new ODataModel(sServiceUrl,false);
			if (iSizeLimit) {
				oModel.setSizeLimit(iSizeLimit);
			}
			oQV.removeAllContent();
			oQV.setType(sType);
			oQV.setShowActionBar(false);
			oQV.setModel(oModel);
			oQV.addContent(this._createDSContent(oQV, sCollection, mProperties));
		},

		_createDSContent: function(oQV, sCollection, mProperties) {
			var oContent = new MatrixLayout();
			var oRow = new MatrixLayoutRow();
			each(mProperties, function(i, oProperty) {
				var oControl;
				if (oProperty.href) {
					oControl = new Link({text : oProperty.value, href: oProperty.href});
				} else {
					oControl = new TextView({text : oProperty.value});
				}
				var oCell = new MatrixLayoutCell({content:[oControl]});
				oCell.addStyleClass("quickViewDS");
				oRow.addCell(oCell);
			});
			oContent.bindAggregation("rows", sCollection, oRow);
			return oContent;
		}
	};

	var QvItem = Element.extend("sap.ui.suite.hcm.QvItem", {
		metadata : {
			library: "sap.ui.suite",
			properties: {
				label: "string",
				value: "string",
				link: "string",
				order: "string",
				type : "string"
			}
		}
	});

	var QvContent = Control.extend("sap.ui.suite.hcm.QvContent", {
		metadata : {
			library: "sap.ui.suite",
			aggregations: {
				   "items" : {type : "sap.ui.suite.hcm.QvItem", multiple : true}
			}
		},
		init: function() {
			this._sorted = false;
		},
		exit: function() {
			if (this._oML) {
				this._oML.destroy();
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {      // the part creating the HTML
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.renderControl(oControl._createQVContent(oControl));
				oRm.close("div");
			}
		},
		_createQVContent: function(oControl) {
			var oML = new MatrixLayout({widths:["75px"]}),
				aItems = oControl.getItems(),
				oMLRow, oMLCell, oLabel, oTxtView, oLink;

			if (this._oML) {
				this._oML.destroy();
			}
			oControl._sortItems(oControl);
			for ( var i = 0; i < aItems.length; i++) {
				oMLRow = new MatrixLayoutRow();
				oMLCell = new MatrixLayoutCell({vAlign:'Top'});
				oLabel  = new Label({text:aItems[i].getLabel() + ':'});
				oMLCell.addContent(oLabel);
				oMLRow.addCell(oMLCell);
				oMLCell = new MatrixLayoutCell();
				if (aItems[i].getLink()) {
					oLink = new Link({text:aItems[i].getValue(), href:aItems[i].getLink()});
					oMLCell.addContent(oLink);
				} else {
					oTxtView = new TextView({text:aItems[i].getValue()});
					oMLCell.addContent(oTxtView);
				}
				oMLRow.addCell(oMLCell);
				oML.addRow(oMLRow);
			}
			this._oML = oML;
			return oML;
		},
		_sortItems: function(oControl) {
			if (!oControl._sorted) {
				var aItems = oControl.removeAllAggregation("items", true);
				aItems.sort(function(a, b) {
					return (parseInt(a.getOrder()) - parseInt(b.getOrder()));
				});
				aItems.forEach(function(oItem) {
					oControl.addAggregation("items", oItem, false);
				});
				oControl._sorted = true;
			}
		}
	});

	return QuickViewUtils;

}, /* bExport= */ true);