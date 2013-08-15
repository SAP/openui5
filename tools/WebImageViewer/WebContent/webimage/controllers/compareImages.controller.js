sap.ui.controller('webimage.controllers.compareImages', {

	onInit : function() {
		this.table = this.byId('imageTable');
	},

	onBeforeRendering : function() {
		var ctt = this.ctt = this.getView().data('context');
		if(ctt) {
			this.getView().setBindingContext(ctt);
			utils.storage.loadFailImages(ctt);

			this._links = this.getView().data('brdPath');
			this.byId('brd_thd').setItems(this._links);
		}
	},

	dbHandler : function(evt) {
		var src = evt.getSource().$().find('img').attr('src');
		if(src !== "img/no-image.png") {
			var oOverlayContainer = new notepad.OverlayImage({
				openButtonVisible : false,
				closeButtonVisible : true,
				src : src
			});
			oOverlayContainer.open();
		}
	},

	handlePressBack : function(evt) {
		var bus = sap.ui.getCore().getEventBus();
		bus.publish('nav', 'to', {
			name : evt.mParameters.key,
		});
	},

	_reload : function() {
		utils.storage.refresh();
		var tb = this.byId('imageTable');
		tb.removeSelectionInterval(0, tb.getRows().length * 10);
		utils.storage.loadFailImages(this.getView().data('context'), function() {
			tb.removeSelectionInterval(0, tb.getRows().length * 10);
		});

	},

	updateImage : function(oEvent) {
		var ctrl = this, indices = this.table.getSelectedIndices(), rows = this.table.getRows(), object = this.getView().data('context').getObject(), names = [];
		if(indices.length > 0) {
			sap.ui.commons.MessageBox.show("Update " + indices.length + " image(s) to expect?", sap.ui.commons.MessageBox.Icon.QUESTION, "Update", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
				if(r === "YES") {
					for(var i = 0; i < indices.length; i++) {
						names.push(object.images[indices[i]].verify.name);
					}
					utils.storage.updateImages(ctrl.getView().data('context'), names, function() {
						ctrl._reload();
					});

				}
			}, sap.ui.commons.MessageBox.Action.YES);
		} else {
			sap.ui.commons.MessageBox.show("No Images Selected!", sap.ui.commons.MessageBox.Icon.WARNING, "Warning", [sap.ui.commons.MessageBox.Action.OK]);
		}
	},

	abandonImage : function() {
		var ctrl = this, indices = this.table.getSelectedIndices(), rows = this.table.getRows(), object = this.getView().data('context').getObject(), names = [];
		if(indices.length > 0) {
			sap.ui.commons.MessageBox.show("Delete " + indices.length + " image(s)?", sap.ui.commons.MessageBox.Icon.QUESTION, "Abandon", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
				if(r === "YES") {
					for(var i = 0; i < indices.length; i++) {
						names.push(object.images[indices[i]].verify.name);
					}
					utils.storage.deleteImages(ctrl.getView().data('context'), names, function() {
						ctrl._reload();
					});

				}
			}, sap.ui.commons.MessageBox.Action.YES);
		} else {
			sap.ui.commons.MessageBox.show("No Images Selected!", sap.ui.commons.MessageBox.Icon.WARNING, "Warning", [sap.ui.commons.MessageBox.Action.OK]);
		}
	},

	formatterWidth : function(wdith, src) {
		if(!wdith || !src) {
			return;
		}
		if(wdith > 320) {
			wdith = 320;
		}
		return wdith + 'px';
	},

	formatterHeight : function(height, src) {
		if(!height || !src) {
			return;
		}
		if(height > 120) {
			height = 120;
		}
		return height + 'px';
	},

	formatSrc : function(src) {
		return src ? src : "img/no-image.png";
	},

	formatEnable : function(src) {
		return src ? true : false;
	},

	formatName : function(width, height, imageName) {
		return imageName ? imageName + "(" + width + "x" + height + ")" : "No Image";
	},

	colHandle : function(evt) {
		var col = evt.getParameter('column');
		col.toggleSort();
	}

});
