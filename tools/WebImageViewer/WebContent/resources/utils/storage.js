;
(function() {
	jQuery.sap.declare("utils.storage");
	var oModel = new sap.ui.model.json.JSONModel({});
	oModel.setSizeLimit(600);
	sap.ui.getCore().setModel(oModel);
	var conf = jQuery.sap.properties({
		url: "conf/config.properties"
	});
	var SERVICE_BASE_URL = conf.getProperty('app_service_url');
	var demo = conf.getProperty('app_is_demo') == "true";
	var title = conf.getProperty('app_title') + " " + conf.getProperty('app_version');
	oModel.getData().appTitle = title;
	//flag to reload data
	var needReload = {
		job: false,
		control: false,
		image: false,
		mCategory: false,
		mModules: false,
		mResults: false,
	};
	var beforeLoadData = function() {
		sap.ui.core.BusyIndicator.show(0);
	}

	var afterLoadData = function(data, status, jqxhr) {
		sap.ui.core.BusyIndicator.hide();
		jQuery.sap.log.info('Fetching data status:' + status);
		TRACE_RESULT = data;
	};


	utils.storage = {
		refresh: function() {
			for (var i in needReload) {
				needReload[i] = true;
			}
		},

		setImageStorePath: function(callback) {
			if (demo) {
				callback();
			} else {
				$.ajax({
					beforeSend: beforeLoadData,
					type: "GET",
					url: SERVICE_BASE_URL + "/imageStorePath" + document.location.search,
					success: function(result) {}
				}).success(callback).always(afterLoadData);
			}
		},

		applyStoreConfig: function(callback) {
			var data = oModel.getData().applyMapping,
				param = {}, f = true;
			$.each(data, function() {
				if (this.tokenName && this.imageStorePath) {
					param[this.tokenName] = this.imageStorePath;
				} else {
					sap.ui.commons.MessageBox.show("some token is not finish!", sap.ui.commons.MessageBox.Icon.WARNING, "WARN", [sap.ui.commons.MessageBox.Action.OK]);
					f = false;
					return f;
				}
			});
			if (f) {
				// console.log(param);return;
				sap.ui.commons.MessageBox.show("Apply Changes ?", sap.ui.commons.MessageBox.Icon.QUESTION, "APPLY", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
					if (r === "YES") {
						$.ajax({
							beforeSend: beforeLoadData,
							type: "PUT",
							url: SERVICE_BASE_URL + "/config",
							dataType: 'json',
							data: param
						}).success(callback).always(afterLoadData);
					}
				}, sap.ui.commons.MessageBox.Action.YES);

			}
		},

		/*
		 * images proflies
		 */
		loadConfigs: function(callback) {
			$.ajax({
				beforeSend: beforeLoadData,
				url: demo ? 'webimage/data/configs.json' : SERVICE_BASE_URL + "/config",
				dataType: 'json',
				success: function(result) {
					oModel.getData().storeMapping = result.data.slice();
					oModel.getData().applyMapping = result.data;
					oModel.getData().editable = true;
					oModel.updateBindings();
				},

			}).success(callback).always(afterLoadData);
		},

		/**
		 * JOB Result view
		 */
		loadJobData: function(callback) {
			if (!oModel.getData().jobData || needReload.job) {
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/jobdata.json' : SERVICE_BASE_URL + "/jobs",
					dataType: 'json',
					success: function(data) {
						needReload.job = false;
						oModel.getData().jobData = data.data;
						oModel.getData().jobCount = data.data.length;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		loadFailCtrls: function(context, callback) {
			if (!context.getObject().categorys || needReload.control) {
				var obj = context.getObject();
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/failCtrls.json' : SERVICE_BASE_URL + "/jobs/failedControllers",
					data: {
						path: obj.platform + "/" + obj.browser + "/" + obj.theme + "/" + obj.rtl,
					},
					dataType: 'json',
					success: function(data) {
						needReload.control = false;
						context.getObject().categorys = data.data;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		///Windows7_64/Chrome/goldrefection/Rtl_false/libarytests/commons/CheckBoxTest
		loadFailImages: function(context, callback) {
			if (!context.getObject().images || needReload.image) {
				var sParam = this._resolveFailedImagePath(context);
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/compareImages.json' : SERVICE_BASE_URL + "/jobs/failedImages",
					data: {
						path: sParam,
					},
					dataType: 'json',
					success: function(data) {
						needReload.image = false;
						context.getObject().images = data.data;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		//{platform}/{browser}/{theme}/{rtl}/{category}/{module}/{control}
		updateImages: function(context, images, callback) {
			var sParam = this._resolveFailedImagePath(context);
			$.ajax({
				beforeSend: beforeLoadData,
				type: "PUT",
				url: SERVICE_BASE_URL + "/jobs/failedImages",
				data: {
					imageNames: images.join(','),
					path: sParam,
				},
				dataType: 'json',
			}).success(callback).always(afterLoadData);
		},

		//{platform}/{browser}/{theme}/{rtl}/{category}/{module}/{control}
		deleteImages: function(context, images, callback) {
			var sParam = this._resolveFailedImagePath(context);
			$.ajax({
				beforeSend: beforeLoadData,
				type: "DELETE",
				url: SERVICE_BASE_URL + "/jobs/failedImages",
				data: {
					imageNames: images.join(','),
					path: sParam,
				},
				dataType: 'json',
			}).success(callback).always(afterLoadData);
		},

		_resolveFailedImagePath: function(context) {
			var obj, sParam;
			if (context.getObject().controlName) {
				sParam = context.getObject().controlName;
				sParam = context.getUpperObject(2).moduleName + "/" + sParam;
				sParam = context.getUpperObject(4).categoryName + "/" + sParam;
				obj = context.getUpperObject(6);
				sParam = obj.platform + "/" + obj.browser + "/" + obj.theme + "/" + obj.rtl + "/" + sParam;
			} else {
				obj = context.getObject();
				sParam = obj.platform + "/" + obj.browser + "/" + obj.theme + "/" + obj.rtl + "/" + context.getUpperObject(6).categoryName + "/" + context.getUpperObject(4).moduleName + "/" + context.getUpperObject(2).controlName;
			}
			console.log(sParam);
			jQuery.sap.log.info("#####resolve path>>>>>>>>>>>>>>>>>> /" + sParam);
			return sParam;
		},

		/**
		 * Module Result View
		 */
		loadCategoryData: function(callback) {
			if (!oModel.getData().categorys || needReload.mCategory) {
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/categorys.json' : SERVICE_BASE_URL + "/modules",
					dataType: 'json',
					success: function(data) {
						needReload.mCategory = false;
						oModel.getData().categorys = data.data;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		loadModuleData: function(ctt, callback) {
			if (!ctt.getObject().modules || needReload.mModules) {
				var categoryName = ctt.getObject().categoryName;
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/modules.json' : SERVICE_BASE_URL + '/modules/' + categoryName + "/failedControls",
					dataType: 'json',
					success: function(data) {
						needReload.mModules = false;
						ctt.getObject().modules = data.data;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		loadCtrlResults: function(context, callback) {
			if (!context.getObject().results || needReload.mResults) {
				var path = context.getPath(),
					sParam = context.getObject().controlName;
				path = path.substring(0, path.lastIndexOf('/'));
				path = path.substring(0, path.lastIndexOf('/'));
				sParam = oModel.getContext(path).getObject().moduleName + "/" + sParam;
				path = path.substring(0, path.lastIndexOf('/'));
				path = path.substring(0, path.lastIndexOf('/'));
				sParam = oModel.getContext(path).getObject().categoryName + "/" + sParam;
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/ctrlResults.json' : SERVICE_BASE_URL + "/modules/" + sParam,
					dataType: 'json',
					success: function(data) {
						needReload.mResults = false;
						context.getObject().results = data.data;
						context.getObject().count = data.data.length;
						oModel.updateBindings();
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		/**
		 * Images Management
		 */
		loadImages: function(path, callback) {
			var queryPath = this._resolveImagePath(path);
			$.ajax({
				beforeSend: beforeLoadData,
				url: demo ? 'webimage/data/images.json' : SERVICE_BASE_URL + "/images",
				data: {
					path: queryPath,
				},
				dataType: 'json',
				success: function(data) {
					oModel.getData().images = data.data;
				},

			}).success(callback).always(afterLoadData);
		},

		uploadImage: function(path, uploader) {
			var queryPath = this._resolveImagePath(path);
			var url = SERVICE_BASE_URL + "/images?path=" + queryPath;
			jQuery.sap.log.info('upload to folder:' + url);
			uploader.setUploadUrl(url);
			sap.ui.core.BusyIndicator.show(0);
			uploader.attachUploadComplete(function() {
				sap.ui.core.BusyIndicator.hide(0);
			});


			uploader.upload();
		},

		//{platform}/{browser}/{theme}/{rtl}/{category}/{module}/{control}
		deleteFolderImages: function(path, images, callback) {
			var sParam = this._resolveImagePath(path);
			$.ajax({
				beforeSend: beforeLoadData,
				type: "DELETE",
				url: SERVICE_BASE_URL + "/images",
				data: {
					imageNames: images.join(','),
					path: sParam,
				},
				dataType: 'json',
			}).success(callback).always(afterLoadData);
		},

		loadDir: function(callback) {
			if (!oModel.getData().root || this.reloadDir) {
				$.ajax({
					beforeSend: beforeLoadData,
					url: demo ? 'webimage/data/directory.json' : SERVICE_BASE_URL + "/images/folders",
					dataType: 'json',
					success: function(data) {
						oModel.getData().root = data.data;
						oModel.updateBindings();
						this.reloadDir = false;
					},

				}).success(callback).always(afterLoadData);
			} else {
				callback && callback();
			}
		},

		_resolveImagePath: function(sPath) {
			var sParam = "/" + oModel.getContext(sPath).getObject().name;
			while (sPath.lastIndexOf("nodes") > 0) {
				sPath = sPath.substring(0, sPath.lastIndexOf("nodes"));
				sParam = "/" + oModel.getContext(sPath).getObject().name + sParam;
			}
			jQuery.sap.log.info("#####" + sParam);
			return sParam;
		}

	};
	$(document).ajaxError(function(event, jqxhr, settings, exception) {
		if (sap.ui.getCore().isInitialized()) {
			jQuery.sap.log.error("ajax failed");
			TRACE_RESULT = jqxhr;
			try {
				var rst = JSON.parse(jqxhr.responseText);
				sap.ui.commons.MessageBox.show("Sorry, Load Data failed! \n" + rst.message, sap.ui.commons.MessageBox.Icon.ERROR, "Error", [sap.ui.commons.MessageBox.Action.OK]);
			} catch (e) {
				console.log(jqxhr.responseText);
			}
			// window.location.href = "error.html?code=" + jqxhr.status + "&msg=" + jqxhr.responseText;
		}
	});

})();