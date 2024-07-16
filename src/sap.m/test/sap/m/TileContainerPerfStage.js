sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/model/json/JSONModel",
  "sap/m/TileContainer",
  "sap/m/CustomTile",
  "sap/m/ObjectHeader",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/Controller"
], async function(XMLView, JSONModel, TileContainer, CustomTile, ObjectHeader, jQuery) {
  "use strict";
  // Note: the HTML page 'TileContainerPerfStage.html' loads this module via data-sap-ui-on-init

  // define a new (simple) Controller type
  var oView = null,
		  oTC,
		  oRenderTime,
		  oTilesCount,
		  oUpdatePager,
		  oInsertTileTime,
		  oStatusLabel,
		  iStart, iEnd, iCount = 0,
		  oModel, oModelData = {},
		  oModelSizeLimit;

  sap.ui.controller("my.own.controller", {
	  onInit: function () {
		  oView = this.getView();
		  oTC = oView.byId("usersTileContainer");
		  oRenderTime = oView.byId("renderTime");
		  oTilesCount = oView.byId("tilesCount");
		  oUpdatePager = oView.byId("updatePager"),
		  oModelSizeLimit = oView.byId("modelSizeLimit"),
		  oInsertTileTime = oView.byId("insertTileTime"),
		  oStatusLabel = oView.byId("status");

		  iCount = 0;

		  oTC.addTile = function () {
			  var iStart = new Date().getTime();
			  TileContainer.prototype.addTile.apply(this, arguments);
			  var iEnd = new Date().getTime();
			  var iDuration = iEnd - iStart;
			  if (window.addTile == undefined) {
				  window.addTile = 0;
			  }
			  window.addTile = window.addTile + iDuration;
		  };

		  oTC.addEventDelegate({
			  onBeforeRendering: function () {
				  oRenderTime.setBusy(true);
				  iStart = new Date().getTime();
			  }
		  });

		  oTC.addEventDelegate({
			  onAfterRendering: function () {
				  iEnd = new Date().getTime();
				  iCount++;
				  oRenderTime.setBusy(false);
				  oRenderTime.setText((iEnd - iStart) + "/" + iCount);
				  oTilesCount.setText(oTC.getTiles().length);
			  }
		  });

		  oTC._updatePager = function () {
			  var iStart = new Date().getTime(),
				  iEnd = 0;
			  TileContainer.prototype._updatePager.call(this, arguments);
			  iEnd = new Date().getTime();
			  if (window.updatePager == undefined) {
				  window.updatePager = {count: 0, time: 0};
			  }
			  window.updatePager.count++;
			  window.updatePager.time += (iEnd - iStart);
		  }
	  },

	  onModelSizeLimitChange: function (oEvent) {
		  oStatusLabel.setText("Working...");
		  var sValue = oEvent.getParameter("value");

		  setTimeout(function(){
			  oModel.setSizeLimit(parseInt(sValue));
			  oModel.setData({});
			  oModel.setData(oModelData);
			  this._updateStat();

			  oStatusLabel.setText("Idle");
		  }.bind(this), 0);
	  },

	  setModelData: function () {
		  window.addTile = 0;
		  window.updatePager = undefined;
		  oStatusLabel.setText("Working...");

		  setTimeout(function(){
			  //Act
			  oModel.setData(oModelData);
			  oStatusLabel.setText("Idle");
			  this._updateStat();
		  }.bind(this), 0);
	  },

	  deleteModelData: function () {
		  oModel.setData({});
	  },

	  onAdd: function () {
		  var oTC = this.getView().byId("usersTileContainer"),
				  oTile = this._createTile(oTC.getTiles().length),
				  oTilesCount = oView.byId("tilesCount"),
				  oInsertTileTime = oView.byId("insertTileTime");
		  window.addTile = 0;
		  window.updatePager = undefined;
		  oTC.addTile(oTile);
		  oTilesCount.setText(oTC.getTiles().length);
		  oInsertTileTime.setText(window.addTile);
		  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
	  },

	  onInsert: function () {
		  var iPosition = parseInt(this.getView().byId("insertPosition").getValue(), 10),
				  oTile = this._createTile(iPosition),
				  oTilesCount = oView.byId("tilesCount");
		  window.updatePager = undefined;
		  oTC.insertTile(oTile, iPosition);
		  oTilesCount.setText(oTC.getTiles().length);
		  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
	  },

	  onInsertInvisible: function () {
		  var iPosition = parseInt(this.getView().byId("insertPosition").getValue(), 10),
				  oTile = this._createTile(iPosition),
				  oTilesCount = oView.byId("tilesCount");
		  oTile.setVisible(false);
		  window.updatePager = undefined;
		  oTC.insertTile(oTile, iPosition);
		  oTilesCount.setText(oTC.getTiles().length);
		  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
	  },

	  onRemove: function () {
		  var iPosition = parseInt(this.getView().byId("removePosition").getValue(), 10),
				  oTile = oTC.getTiles()[iPosition],
				  oTilesCount = oView.byId("tilesCount");
		  this.getView().byId("usersTileContainer").removeTile(oTile);
		  oTilesCount.setText(oTC.getTiles().length);
		  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
	  },

	  onShowHide: function () {
		  var iPosition = parseInt(this.getView().byId("showHidePosition").getValue(), 10),
				  oTC = this.getView().byId("usersTileContainer"),
				  oTile = oTC.getTiles()[iPosition];
		  oTile.setVisible(!oTile.getVisible());
		  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
	  },

	  onUpdateStats: function () {
		  this._updateStat();
	  },
	  onShowHideTC: function(oEvent) {
		  oTC.setVisible(oEvent.getParameter("state"));
	  },

	  _updateStat: function () {
		  oTilesCount.setText(oTC.getTiles().length);
		  if (window.updatePager != undefined) {
			  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
		  }
		  oInsertTileTime.setText(window.addTile);
	  },

	  _createTile: function (iNumber) {
		  return new CustomTile({
			  content: [
				  new ObjectHeader({
					  title: "Custom Tile",
					  number: iNumber != undefined ? iNumber : new Date().getSeconds(),
					  intro: "Custom tile at " + new Date().toLocaleString()
				  })
			  ]
		  });
	  }

  });


  /*** THIS IS THE "APPLICATION" CODE ***/

  // create some dummy JSON data
  var aTilesCollection = [];
  for (var i = 0; i < 2000; i++) {
	  aTilesCollection.push({icon: "sap-icon://hint", title: "Tile #" + i});
  }
  oModelData.TileCollection = aTilesCollection;

  // instantiate the View
  var myView = await XMLView.create({definition: jQuery('#view1').html()}); // accessing the HTML inside the script tag above

  // create a Model and assign it to the View
  // put the View onto the screen
  myView.placeAt('content');
  oStatusLabel.setText("Working");

  oModel = new JSONModel();
  oModel.setSizeLimit(parseInt(oModelSizeLimit.getValue()));
  myView.setModel(oModel, "tilesModel");

  oStatusLabel.setText("Idle");

  //Act
  oModel.setData(oModelData);
  oInsertTileTime.setText(window.addTile);
  if (window.updatePager) {
	  oUpdatePager.setText(window.updatePager.time + "/" + window.updatePager.count);
  } else {
	  oUpdatePager.setText("N/A");
  }

  oModelData = jQuery.extend({}, oModel.getData());
});