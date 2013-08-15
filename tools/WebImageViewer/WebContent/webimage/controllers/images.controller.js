sap.ui.controller('webimage.controllers.images', {

	onInit: function() {
		this.byId('fileUpload').oBrowse.setStyle('Emph');
		//dataset binding
		DS = this.ds = this.byId('images_ds');
		this._bindItems('nodes', this.onFolderSelected);
		//tree binding
		this.tree = this.byId('images_tree');
		var template = new sap.ui.commons.TreeNode({
			text: "{name}"
		});
		this.tree.bindNodes('/root', template);

		var height = $(window).height() * 0.8;
		this.byId('imageMainCont').setHeight(height + 'px');
		jQuery(window).bind("resize", function(ctrl) {
			return function() {
				var height = $(window).height() * 0.8;
				ctrl.byId('imageMainCont').setHeight(height + 'px');
			};
		}(this));
	},

	onBeforeRendering: function() {
		//fetch directory structure
		var ctrl = this;
		utils.storage.loadDir(function() {
			ctrl.tree.collapseAll();
			if (ctrl.currentImagePath) {
				ctrl._expandTree(ctrl.currentImagePath);
			}
		});

	},

	selectAllHandle: function(evt) {
		var checked = evt.getParameter('checked');
		var items = this.ds.getItems();
		$.each(items, function(i, item) {
			item.setChecked(checked);
		});

	},

	deleteImageHandle: function() {
		var names = [],
			items = this.ds.getItems();
		$.each(items, function(i, item) {
			if (item.getChecked()) {
				names.push(item.getBindingContext().getObject().name);
			}
		});

		if (names.length > 0) {
			var path = this.currentImagePath,
				ctrl = this;
			sap.ui.commons.MessageBox.show("Delete " + names.length + " image(s) from this folder?", sap.ui.commons.MessageBox.Icon.QUESTION, "Delete", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
				if (r === "YES") {
					utils.storage.deleteFolderImages(path, names, function() {
						ctrl._showImages(path);
					});

				}
			}, sap.ui.commons.MessageBox.Action.YES);
		} else {
			sap.ui.commons.MessageBox.show("No Images Selected !", sap.ui.commons.MessageBox.Icon.WARNING, "Warning", [sap.ui.commons.MessageBox.Action.OK]);
		}
	},

	uploadImageHandle: function() {
		var names = [],
			currentImages = this.ds.getModel().getData().images,
			uploader = this.byId('fileUpload');
		var v = uploader.getValue(),
			hasImg = false;
		if (v) {
			//verify image
			if (/[^\s]+\.(jpg|gif|png|bmp)/i.test(v)) {
				//check if already has this image
				if (currentImages && currentImages.length > 0) {
					$.each(currentImages, function(i, image) {
						if (image.name === v) {
							hasImg = true;
							return false;
						}
					});

				}
				if (!hasImg) {
					utils.storage.uploadImage(this.currentImagePath, uploader);
				} else {
					var path = this.currentImagePath;
					sap.ui.commons.MessageBox.show("This image already exsits, replace it?", sap.ui.commons.MessageBox.Icon.QUESTION, "Confirm", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
						if (r === "YES") {
							utils.storage.uploadImage(path, uploader);
						}
					});

				}
			} else {
				sap.ui.commons.MessageBox.show("Only support image uploading !", sap.ui.commons.MessageBox.Icon.WARNING, "Warning", [sap.ui.commons.MessageBox.Action.OK]);
				this.byId('fileUpload').setValue(null);
				this.byId('fileUpload').$().find('input').val('');
			}
		} else {
			sap.ui.commons.MessageBox.show("No Images Selected !", sap.ui.commons.MessageBox.Icon.WARNING, "Warning", [sap.ui.commons.MessageBox.Action.OK]);
		}
	},

	uploadCompleteHandle: function(oEvent) {
		var sResponse = oEvent.getParameter("response");
		if (sResponse) {
			try {
				if (JSON.parse(sResponse).isSuccess) {
					this._showImages();
					sap.ui.commons.MessageBox.show("Upload Success", sap.ui.commons.MessageBox.Icon.SUCCESS, "SUCCESS", [sap.ui.commons.MessageBox.Action.OK]);
					this.byId('fileUpload').setValue(null);
					this.byId('fileUpload').$().find('input').val('');
				} else {
					sap.ui.commons.MessageBox.show("Upload Failed", sap.ui.commons.MessageBox.Icon.ERROR, "Failed", [sap.ui.commons.MessageBox.Action.OK]);
				}
			} catch (e) {
				console.log("Upload failed " + sResponse);
				sap.ui.commons.MessageBox.show("Upload failed " + sResponse, sap.ui.commons.MessageBox.Icon.ERROR, "Failed", [sap.ui.commons.MessageBox.Action.OK]);
				this.byId('fileUpload').setValue(null);
				this.byId('fileUpload').$().find('input').val('');
			}
		}
	},

	onFolderSelected: function(evt) {
		var ctt = evt.getSource().getBindingContext();
		this._naviToItem(ctt);
		this._expandTree(ctt.getPath());
	},

	onNodeSelected: function(evt) {
		var ctt = evt.getParameter('nodeContext');
		this._naviToItem(ctt);
	},

	_naviToItem: function(ctt) {
		var bShowImage = !ctt.getObject().children;
		this.currentImagePath = ctt.getPath();
		//tool bar
		this.ds.setShowToolbar(bShowImage);
		if (bShowImage) {
			this.byId('selectAll').setChecked(false);
			this._showImages(ctt.getPath());
		} else {
			this._bindItems('nodes', this.onFolderSelected);
			this.ds.setBindingContext(ctt);
		}
	},

	_expandTree: function(path) {
		var indices = path.match(/\d/g);
		var i = 0;
		var node = this.tree;
		while (i < indices.length) {
			if (!node.getNodes()[indices[i]].getExpanded()) {
				node.getNodes()[indices[i]].expand();
			}
			node = node.getNodes()[indices[i]];
			i++;
		}
		node.select && node.select();
	},

	_showOverlay: function(evt) {
		var source = evt.getSource();

		var oOverlayContainer = new notepad.OverlayImage({
			openButtonVisible: false,
			closeButtonVisible: true,
			src: source.$().find('img').attr('src'),
		});
		oOverlayContainer.open();
	},

	_showImages: function(path) {
		var ctrl = this;
		path = path || this.currentImagePath;
		utils.storage.loadImages(path, function() {
			ctrl._bindItems('/images', ctrl._showOverlay);
		});

	},

	_bindItems: function(path, selectHandle) {
		var tp = new notepad.ImageItem({
			text: "{name}",
			checkable: {
				path: "src",
				formatter: function(src) {
					return src ? true : false;
				},

			},
			width: {
				path: "src",
				formatter: function(src) {
					return src ? "250px" : null;
				}

			},
			height: {
				path: "src",
				formatter: function(src) {
					return src ? "180px" : null;
				}

			},
			src: {
				path: "src",
				formatter: function(src) {
					return src ? src + "?templeId=" + new Date().getTime() : "img/folder.jpg";
				}

			}
		});
		if (selectHandle) {
			tp.attachSelect(selectHandle, this);
		}
		this.ds.bindItems(path, tp);
	},

});