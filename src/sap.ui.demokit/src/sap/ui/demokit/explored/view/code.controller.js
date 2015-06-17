/*!
 * @copyright@
 */

/*global JSZip *///declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.code", {

		_aMockFiles : ["products.json", "supplier.json", "img.json"],

		onInit : function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this._viewData = sap.ui.getCore().byId("app").getViewData();
			this._viewData.component.codeCache = {};
		},

		onRouteMatched : function (oEvt) {

			// get params
			if (oEvt.getParameter("name") !== "code" && oEvt.getParameter("name") !== "code_file") {
				return;
			}

			this._sId = oEvt.getParameter("arguments").id;
			var sFileName = oEvt.getParameter("arguments").fileName;

			// retrieve sample object
			var oSample = sap.ui.demokit.explored.data.samples[this._sId];
			if (!oSample) {
				this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound", "XML", false, { path: this._sId });
				return;
			}

			// cache the data to be reused
			if (!this._oData || oSample.id !== this._oData.id) {

				// get component and data when sample is changed or nothing exists so far
				var sCompId = 'sampleComp-' + this._sId;
				var sCompName = this._sId;
				var oComp = sap.ui.component(sCompId);
				if (!oComp) {
					oComp = sap.ui.getCore().createComponent({
						id : sCompId,
						name : sCompName
					});
				}

				// create data object
				var oMetadata = oComp.getMetadata();
				var oConfig = (oMetadata) ? oMetadata.getConfig() : null;
				this._oData = {
					id : oSample.id,
					title : "Code: " + oSample.name,
					name : oSample.name,
					stretch : oConfig.sample ? oConfig.sample.stretch : false,
					files : [],
					iframe : oConfig.sample.iframe,
					fileName: sFileName
				};

				// retrieve files
				// (via the 'Orcish maneuver': Use XHR to retrieve and cache code)
				if (oConfig && oConfig.sample && oConfig.sample.files) {
					var sRef = jQuery.sap.getModulePath(oSample.id);
					for (var i = 0 ; i < oConfig.sample.files.length ; i++) {
						var sFile = oConfig.sample.files[i];
						var sContent = this.fetchSourceFile(sRef, sFile);

						this._oData.files.push({
							name : sFile,
							raw : sContent,
							code : this._convertCodeToHtml(sContent)
						});
					}
				}
			} else {
				this._oData.fileName = sFileName;
			}
			// set model
			this.getView().setModel(new sap.ui.model.json.JSONModel(this._oData));

			// show file content if it is set already
			this._setFileContent(sFileName);

			// scroll to top of page
			var page = this.getView().byId("page");
			page.scrollTo(0);
		},

		_setFileContent: function(sFileName) {
			var oFileViewer = this.getView().byId("fileContent");

			if (!sFileName) {
				oFileViewer.setContent("");
				return;
			}

			var aFiles = this._oData.files,
				iPossInArray = -1,
				bResult = aFiles.some(function(element, index) {
					if (element.name === sFileName) {
						iPossInArray = index;
						return true;
					}
				});
			if (bResult) {
				oFileViewer.setContent(aFiles[iPossInArray].code);
			}
		},

		fetchSourceFile : function (sRef, sFile) {
			var that = this;
			var sUrl = sRef + "/" + sFile;

			var fnSuccess = function (result) {
				that._viewData.component.codeCache[sUrl] = result;
			};
			var fnError = function (result) {
				that._viewData.component.codeCache[sUrl] = "not found: '" + sUrl + "'";
			};

			if (!(sUrl in this._viewData.component.codeCache)) {
				this._viewData.component.codeCache[sUrl] = "";
				jQuery.ajax(sUrl, {
					async: false,
					dataType: "text",
					success: fnSuccess,
					error: fnError
				});
			}

			return that._viewData.component.codeCache[sUrl];
		},

		onDownload : function (evt) {

			jQuery.sap.require("sap.ui.thirdparty.jszip");
			var oZipFile = new JSZip();

			// zip files
			var oData = this.getView().getModel().getData();
			for (var i = 0 ; i < oData.files.length ; i++) {
				var oFile = oData.files[i],
					sRawFileContent = oFile.raw;

				if (oFile.name === oData.iframe) {
					sRawFileContent = this._changeIframeBootstrapToCloud(sRawFileContent);
				}

				oZipFile.file(oFile.name, sRawFileContent);

				// mock files
				for (var j = 0; j < this._aMockFiles.length; j++) {
					var sMockFile = this._aMockFiles[j];
					if (oFile.raw.indexOf(sMockFile) > -1){
						oZipFile.file("mockdata/" + sMockFile, this.downloadMockFile(sMockFile));
					}
				}
			}

			var sRef = jQuery.sap.getModulePath(this._sId);
			oZipFile.file("Component.js", this.fetchSourceFile(sRef, "Component.js"));

			if (!oData.iframe) {
				oZipFile.file("index.html", this.createIndexFile(oData));
			}

			var oContent = oZipFile.generate();

			this._openGeneratedFile(oContent);
		},

		_openGeneratedFile : function (oContent) {
			location.href = "data:application/zip;base64," + oContent;
		},

		createIndexFile : function(oData) {

			var sHeight,
				bScrolling;

			var sRef = jQuery.sap.getModulePath("sap.ui.demokit.explored.tmpl");
			var sIndexFile = this.fetchSourceFile(sRef, "index.html.tmpl");

			sIndexFile = sIndexFile.replace(/{{TITLE}}/g, oData.name);
			sIndexFile = sIndexFile.replace(/{{SAMPLE_ID}}/g, oData.id);

			sHeight = oData.stretch ? 'height : "100%", ' : "";
			sIndexFile = sIndexFile.replace(/{{HEIGHT}}/g, sHeight);

			bScrolling = !oData.stretch;
			sIndexFile = sIndexFile.replace(/{{SCROLLING}}/g, bScrolling);

			return sIndexFile;
		},

		downloadMockFile : function(sFile) {

			var sRef = jQuery.sap.getModulePath("sap.ui.demo.mock");
			var sWrongPath = "test-resources/sap/ui/demokit/explored/img/";
			var sCorrectPath = "https://openui5.hana.ondemand.com/test-resources/sap/ui/demokit/explored/img/";
			var oRegExp = new RegExp(sWrongPath,"g");
			var sMockData = this.fetchSourceFile(sRef, sFile);

			if (sMockData) {
				sMockData = sMockData.replace(oRegExp, sCorrectPath);
			}

			return sMockData;
		},

		onNavBack : function () {
			this.router.navTo("sample", { id : this._sId }, true);
		},

		/**
		 *
		 */
		_convertCodeToHtml : function (code) {

			jQuery.sap.require("jquery.sap.encoder");

			code = code.toString();

			// Get rid of function around code
			code = code.replace(/^function.+{/, "");

			//code = code.replace(/return \[[\s\S]*/, "");
			code = code.replace(/}[!}]*$/, "");

			// Get rid of unwanted code if CODESNIP tags are used
			code = code.replace(/^[\n\s\S]*\/\/\s*CODESNIP_START\n/, "");
			code = code.replace(/\/\/\s*CODESNIP_END[\n\s\S]*$/, "");

			// Improve indentation for display
			code = code.replace(/\t/g, "  ");

			return '<pre><code>' + jQuery.sap.encodeHTML(code) + '</code></pre>';
		},

		_changeIframeBootstrapToCloud : function (sRawIndexFileHtml) {
			var rReplaceIndex = /src=["|']([^"|^']*sap-ui-core\.js)["|']/;
			return sRawIndexFileHtml.replace(rReplaceIndex, 'src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"');
		},

		getButtonIconFormatter: function(sFileName) {
			var fileIcon = "sap-icon://";
			switch (sFileName.substr(sFileName.lastIndexOf('.') + 1)) {
				case "js":
					fileIcon += "display";
					break;
				case "xml":
					fileIcon += "attachment-html";
					break;
				default:
					fileIcon += "attachment-text-file";
			}

			return fileIcon;
		},

		getButtonTypeFormatter: function(sSelectedFileName, sFileName) {
			return (sSelectedFileName === sFileName) ? sap.m.ButtonType.Accept : sap.m.ButtonType.Default;
		},

		onViewCodePress: function(oEvent) {
			var sFileName = oEvent.getSource().getText();
			this.router.navTo("code_file", {
				id : this._sId,
				fileName: sFileName
			}, false);
		}


	});

}, /* export= */true);
