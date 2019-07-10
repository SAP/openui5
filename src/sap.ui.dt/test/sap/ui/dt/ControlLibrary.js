(function() {
	"use strict";

	if (document.location.search.indexOf("library=") === -1) {
		var sChar = "&";
		if (document.location.href.endsWith("?")) {
			sChar = "";
		} else if (document.location.search.length === 0) {
			sChar = "?";
		}
		document.location.href = document.location.href + sChar + "library=sap.m";
	}

	var sTestLibrary = document.location.search.substring(document.location.search.indexOf("library=") + 8);
	if (sTestLibrary.indexOf("&") > 0) {
		sTestLibrary = sTestLibrary.substring(0, sTestLibrary.indexOf("&"));
	}

//gather all control that have designtime for this lib
	window.document.title = "Designtime Test for " + sTestLibrary;
	var mBundles = {};
	var oDTElementModel;
	var	mDTInterfaces = {};
	var oPool;
	function loadVirtualDTControls(oLibrary) {
		return new Promise(function(fnResolve) {
			if (oLibrary.designtime) {
				sap.ui.require([oLibrary.designtime], function(oDTLib) {
				//process the library file and resolve
					fnResolve(oDTLib);
				});
			} else {
				fnResolve(null);
			}
		});
	}

	sap.ui.getCore().attachInit(function() {
		sap.ui.require(["sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel", "sap/ui/core/IconPool"], function (JSONModel, ResourceModel, IconPool) {
			oPool = IconPool;
			sap.ui.getCore().loadLibraries([sTestLibrary, "sap.m", "sap.ui.codeeditor"]).then(
			function() {
				var oLibrary = sap.ui.getCore().getLoadedLibraries()[sTestLibrary];
				var aElements = [].concat(oLibrary.controls.concat(oLibrary.elements));
				oDTElementModel = new JSONModel();
				oDTElementModel.iSizeLimit = 10000;
				createUI();
				try {
					var oRuntimeResourceModel = new ResourceModel({bundleUrl: sap.ui.resource(sTestLibrary, "messagebundle.properties"), bundleLocale:"en"});
					var oDesigntimeResourceModel = new ResourceModel({bundleUrl: sap.ui.resource(sTestLibrary + ".designtime", "messagebundle.properties"), bundleLocale:"en"});
					oLibrary.dependencies.forEach(function(sDependantLib) {
						oRuntimeResourceModel.enhance({bundleUrl: sap.ui.resource(sDependantLib, "messagebundle.properties"), bundleLocale:"en"});
						oDesigntimeResourceModel.enhance({bundleUrl: sap.ui.resource(sDependantLib + ".designtime", "messagebundle.properties"), bundleLocale:"en"});
					});
					mBundles.runtime = oRuntimeResourceModel.getResourceBundle();
					mBundles.designtime = oDesigntimeResourceModel.getResourceBundle();
				} catch (e) {
					/*eslint-disable no-empty*/
				}

				sap.ui.require(aElements.map(function(s) {
					return jQuery.sap.getResourceName(s, "");
				}), function() {
					var aDesigntimePromises = [];
					var aControlMetadata = [];
					for (var i = 0; i < arguments.length; i++) {
						aDesigntimePromises.push(arguments[i].getMetadata().loadDesignTime());
						var oMetadata = arguments[i].getMetadata();
						var aInterfaces = oMetadata.getInterfaces();
						if (aInterfaces && aInterfaces.length > 0) {
							for (var j = 0; j < aInterfaces.length; j++) {
								var s = aInterfaces[j];
								if (!mDTInterfaces[s]) {
									mDTInterfaces[s] = {};
								}
								mDTInterfaces[s][oMetadata.getName()] = oMetadata;
							}
						}
						aControlMetadata.push(oMetadata);
					}
					Promise.all(aDesigntimePromises).then(function (aDTElements) {
						if (oLibrary.designtime) {
							aElements.push(oLibrary.designtime);
						}

						var oFlex = {};
						if (oLibrary.extensions && oLibrary.extensions.flChangeHandlers) {
							oFlex = oLibrary.extensions.flChangeHandlers;
						}
						var aFlexHandlers = [];
						var aFlexName = [];
						for (var n in oFlex) {
							if (typeof oFlex[n] === "string") {
								aFlexHandlers.push(oFlex[n] + ".flexibility");
								aFlexName.push(n);
							}
						}
						sap.ui.require(aFlexHandlers, function() {
							var aArgs = arguments;
							for (var i = 0; i < aFlexHandlers.length; i++) {
								oFlex[aFlexName[i]] = aArgs[i];
								oFlex[aFlexName[i]]._filename = aFlexHandlers[i];
							}
							for (var j = 0; j < aDTElements.length; j++) {
								var oDTElement = aDTElements[j];
								oDTElement._members = aControlMetadata[j].getJSONKeys();
								oDTElement._metadata = aControlMetadata[j];
								oDTElement._name = aControlMetadata[j].getName();
								oDTElement._flexhandler = oFlex[aControlMetadata[j].getName()];
							}
							var oData = {
								elements: aDTElements.filter(function() {
									return true; // initially this was done for not abstract classes, but there are change handlers for those as well.
								})
							};

							//handle virtual dt controls here
							loadVirtualDTControls(oLibrary).then(function (oDTLibrary) {
								var aDTElements = oDTLibrary.controls || [];
								var oVDTElement;
								function processBase(oBaseElement) {
									var oMetadata = oBaseElement.getMetadata();
									oBaseElement.getMetadata().loadDesignTime().then(function(oBaseDT) {
										var oDTElement = Object.assign({}, oBaseDT, oVDTElement);
										oDTElement._members = oMetadata.getJSONKeys();
										oDTElement._metadata = oMetadata;
										oDTElement._name = oVDTElement.className;
										oDTElement._flexhandler = oFlex[oMetadata.getName()];
										oData.elements.push(oDTElement);
										oDTElementModel.checkUpdate(true);
									});
								}
								for (var i = 0; i < aDTElements.length; i++) {
									oVDTElement = aDTElements[i];
									if (oVDTElement.is) {
										sap.ui.require([oVDTElement.is], processBase);
									}
								}
								oDTElementModel.setData(oData);
							});
						});
					});
				});
			}
		);
		});
	});

	var sDomRefCode = [
		"//add this line to the elements metadata of {member}",
		"...",
		"\t\tselector:\"{value}\""
	].join("\n");

	function createUI() {
		var oTable = new sap.m.Table();
		oTable.addColumn(new sap.m.Column({width: "30px", header: new sap.m.Label({text: "Icon"})}));
		oTable.addColumn(new sap.m.Column({header: new sap.m.Label({text: "Element Name"})}));
		oTable.addColumn(new sap.m.Column({width: "30px", header: new sap.m.Label({text: "File"})}));
		oTable.setMode("SingleSelectLeft");
		oTable.bindItems({
			path : "/elements",
			sorter: [new sap.ui.model.Sorter("_name", false)],
			factory: function(sId, oBindingContext) {
				var bValid = true;
				var oDTContext = oBindingContext.getProperty("");
				var aDTContext = flattenData(oDTContext);
				for (var i = 0; i < aDTContext.length; i++) {
					var n = aDTContext[i].path;
					var sCheckPath = n;
					if (n.indexOf("aggregations/") === 0) {
						sCheckPath = "aggregations/";
					}
					if (n.indexOf("properties/") === 0) {
						sCheckPath = "properties/";
					}
					if (n.indexOf("associations/") === 0) {
						sCheckPath = "associations/";
					}
					var oContextData = oBindingContext.getProperty(n);
					if (oContextData && mPathChecks[sCheckPath] && mPathChecks[sCheckPath].validate) {
						bValid = bValid && mPathChecks[sCheckPath].validate(oContextData, n, oDTContext).indexOf("valid") === 0;
					}
				}
				var oIcon = new sap.ui.core.Icon({src: {path:"designtimeModule", formatter: function(sModule) {
					return sModule ? "sap-icon://accept" : "";
				}}});
				if (bValid) {
					oIcon.addStyleClass("valid");
				} else {
					oIcon.addStyleClass("invalid");
				}
				var oControlIcon;
				if (oBindingContext.getProperty("palette/icons/svg")) {
					oControlIcon = new sap.m.Image({src: {path:"palette/icons/svg", formatter: function(sIcon) {
						if (sIcon) {
							return sap.ui.require.toUrl(sIcon, "");
						}
						return "";
					}}});
				} else if (oBindingContext.getProperty("palette/icons/font/name")) {
					oControlIcon = oPool.createControlByURI(oPool.getIconInfo(oBindingContext.getProperty("palette/icons/font/name")).uri);
				} else {
					oControlIcon = new sap.m.Image();
				}
				return new sap.m.ColumnListItem({
					cells: [
						oControlIcon,
						new sap.m.Text({text: {path:"_name"}, wrapping: false, tooltip: {path:"_name"}}),
						oIcon

					]
				});
			}
		});
		oTable.setModel(oDTElementModel);
		oTable.placeAt("list");
		oTable.attachSelectionChange(function(oEvent) {
			var oContext = oEvent.mParameters.listItem.getBindingContext();
			var sDesigntimeFile = oContext.getProperty("designtimeModule");
			if (sDesigntimeFile) {
				jQuery.ajax({
					url: sap.ui.require.toUrl(sDesigntimeFile, ".js"),
					dataType: "text",
					complete: function(oData) {
						oCodeEditor.setValue(oData.responseText);
						oCodeEditor.setVisible(true);
						oCodeEditor.rerender();
					}
				});
				var oFlattenedModel = new sap.ui.model.json.JSONModel();
				oFlattenedModel.iSizeLimit = 10000;
				oFlattenedModel.setData({entries: flattenData(oContext.getProperty(""))});
				oPanel.setModel(oFlattenedModel, "entries");
				oPanel.setModel(oDTElementModel);
				oPanel.setBindingContext(oContext);
				oPanel.setVisible(true);
			} else {
				oCodeEditor.setVisible(false);
				oCodeEditor.rerender();
				oPanel.setVisible(false);
			}
		});

		var oCodeEditor = new sap.ui.codeeditor.CodeEditor();
		oCodeEditor.setHeight("100%");
		oCodeEditor.setWidth("100%");
		oCodeEditor.setVisible(false);
		oCodeEditor.placeAt("code");

		var DTValueDisplay = sap.ui.core.Control.extend("DTValueDisplay", {
			metadata:{
				properties: {
					value: {
						type: "any"
					},
					path: {
						type: "string"
					}
				},
				aggregation: {
					content: {
						type: "sap.ui.core.Control",
						multiple: false,
						visiblity: "hidden"
					}
				}
			},
			renderer: function(oRm, oControl) {
				oRm.renderControl(oControl.getContent());
				if (oControl.sValid) {
					oRm.write("<span class=\"" + oControl.sValid + "\">(" + oControl.sValid + ")</span>");
				}
			},
			getContent : function() {
				var oContext = this.getBindingContext();
				var oContextData = oContext.getProperty("");
				this.sValid = "unchecked";
				var sPath = this.getPath();
				var vValue = this.getValue();
				var sCheckPath = sPath;
				if (sPath.indexOf("aggregations/") === 0) {
					sCheckPath = "aggregations/";
				}
				if (sPath.indexOf("properties/") === 0) {
					sCheckPath = "properties/";
				}
				if (sPath.indexOf("associations/") === 0) {
					sCheckPath = "associations/";
				}
				if (sCheckPath in mPathChecks) {
					if (vValue) {
						if (mPathChecks[sCheckPath].validate) {
							this.sValid = mPathChecks[sCheckPath].validate(vValue, sPath, oContextData);
						}
						var sDisplayValue = vValue;
						if (mPathChecks[sCheckPath].value) {
							sDisplayValue = mPathChecks[sCheckPath].value(vValue, sPath, oContextData);
						}
						if (mPathChecks[sCheckPath].display) {
							var oControl = mPathChecks[sCheckPath].display(vValue, sPath, oContextData);
							return oControl;
						}
						return new sap.m.Text({ text: sDisplayValue});
					}
				}
				return new sap.m.Text({ text: vValue});
			}
		});

		var oPanel = new sap.m.Panel({
			headerText: {path: "_name"},
			width: "100%",
			height: "100%",
			content: [
				new sap.m.Table({
					mode:"SingleSelectLeft",
					columns: [
						new sap.m.Column({header: new sap.m.Label({text: "Entry"}), width:"300px"}),
						new sap.m.Column({header: new sap.m.Label({text: "Value"}), width:"400px"}),
						new sap.m.Column({header: new sap.m.Label({text: "Validity"}), width:"400px"})
					],
					items: {
						path: "entries>/entries",
						template: new sap.m.ColumnListItem({
							cells : [
								new sap.m.Label({text: {path: "entries>path"}}),
								new sap.m.Label({text: {path: "entries>value"}}),
								new DTValueDisplay({value: {path: "entries>value"}, path: {path: "entries>path"}})
							]
						})
					},
					selectionChange: function (oEvent) {
						var oDataContext = oEvent.mParameters.listItem.getBindingContext("entries").getProperty("");
						if (oDataContext.path.endsWith("/domRef")) {
							var sValue = oDataContext.value;
							var sCode = sDomRefCode.replace(/\{value\}/g, sValue.replace(":sap-domref", "#{id}"));
							sCode = sCode.replace("{member}", oDataContext.path.replace("/domRef", ""));
							oCodeEditor.setValue(sCode);
						}
					}
				})
			]
		});
		oPanel.setVisible(false);
		oPanel.placeAt("details");
	}

	function flattenData (oObject) {
		var aData = [];
		function flatten(oObject, vMember, sPath) {
			if (vMember.indexOf("_") === 0) {
				return;
			}
			var vValue = oObject[vMember];
			if (typeof vValue === "object") {
				for (var n in vValue) {
					flatten(vValue, n, sPath + "/" + n);
				}
			} else {
				aData.push({path:sPath, value: vValue});
			}
		}
		for (var n in oObject) {
			flatten(oObject, n, n);
		}
		return aData;
	}
	var mPathChecks = {
		designtimeModule : {
			mandatory: true,
			type: "string",
			validate: function(vValue) {
			//mandatory
				if (!vValue || typeof vValue !== "string") {
					return "invalid";
				}
				var sValid = "invalid";
				jQuery.ajax({
					url: sap.ui.require.toUrl(vValue, ".js"),
					async: false,
					dataType: "text",
					complete: function() {
						sValid = "valid";
					}
				});
				return sValid;
			}
		},
		className : {
			validate: function(vValue) {
				return typeof vValue === "string" && vValue.indexOf(".designtime.") > -1 ? "valid" : "invalid";
			},
			value: function(vValue) {
				return getText(vValue);
			}
		},
		"name/singular" : {
			validate: function(vValue) {
				return validateText(vValue);
			},
			value: function(vValue) {
				return getText(vValue);
			}
		},
		"name/plural" : {
			validate: function(vValue) {
				return validateText(vValue);
			},
			value: function(vValue) {
				return getText(vValue);
			}
		},
		"displayName/singular" : {
			validate: function(vValue) {
				return validateText(vValue);
			},
			value: function(vValue) {
				return getText(vValue);
			}
		},
		"displayName/plural" : {
			validate: function(vValue) {
				return validateText(vValue);
			},
			value: function(vValue) {
				return getText(vValue);
			}
		},
		is : {
			validate: function(vValue) {
				try {
					sap.ui.requireSync("sap/base/util/ObjectPath");
					return sap.base.util.ObjectPath.create(vValue.replace(/\//gi, ".")).getMetadata()._oDesignTime ? "valid" : "invalid";
				} catch (ex) {
					return "invalid";
				}
			},
			value: function(vValue) {
				vValue;
			}
		},
		"palette/group" : {
			mandatory: false,
			values: ["ACTION", "DISPLAY", "LAYOUT", "LIST", "INPUT", "CONTAINER", "CHART", "TILE", "DIALOG"],
			validate: function(vValue) {
				return mPathChecks["palette/group"].values.indexOf(vValue) === -1 ? "invalid" : "valid";
			}
		},
		"palette/icons/svg" : {
			mandatory: false,
			validate: function(vValue) {
				return typeof vValue === "string" ? "valid" : "invalid";
			},
			display: function(vValue) {
				if (vValue) {
					return new sap.m.Image({src: sap.ui.require.toUrl(vValue, "")});
				}
				return null;
			}
		},
		"palette/icons/font/char" : {
			mandatory: false,
			validate: function(vValue, sPath, oContextData) {
				try {
					var sName = oContextData.palette.icons.font.name;
					var oInfo = oPool.getIconInfo(sName);
					return typeof vValue === "number" && vValue === parseInt(oInfo.content.charCodeAt(0).toString(16), 16) ? "valid" : "invalid (char needs to match name)";
				} catch (ex) {
					return "invalid";
				}
			},
			display: function(vValue) {
				return new sap.m.Text({text: "0x" + vValue.toString(16)});
			},
			value: function(vValue) {
				return vValue.toString(16);
			}
		},
		"palette/icons/font/name" : {
			mandatory: false,
			validate: function(vValue, sPath, oContextData) {
				try {
					var iChar = oContextData.palette.icons.font.char;
					var oInfo = oPool.getIconInfo(vValue);
					return typeof oPool.getIconInfo(vValue) === "object" && iChar === parseInt(oInfo.content.charCodeAt(0).toString(16), 16) ? "valid" : "invalid (char needs to match name)";
				} catch (ex) {
					return "invalid";
				}
			},
			display: function(vValue) {
				if (oPool.getIconInfo(vValue).uri) {
					return oPool.createControlByURI(oPool.getIconInfo(vValue).uri);
				}
				return null;
			}
		},
		"templates/create" : {
			mandatory: false,
			validate: function(vValue) {
				return typeof vValue === "string" ? "valid" : "invalid";
			},
			display: function(vValue) {
				if (vValue) {
					var oData = jQuery.sap.sjax({url: sap.ui.require.toUrl(vValue, "")});
					return sap.ui.xmlfragment({
						fragmentContent: oData.data.documentElement,
						oController: this
					});
				}
				return null;
			}
		},
		"aggregations/" : {
			mandatory: false,
			validate: function(vValue, sPath, oDataContext) {
				var aParts = sPath.split("/");
				var sAggregationName = aParts[1];
				var sEntry = aParts[2];
				if (oDataContext._members[sAggregationName]._iKind === 2 ||
					oDataContext._members[sAggregationName]._iKind === 1) {
				//validateAggregationSettings(vValue, sPath, oDataContext);
					if (sEntry === "domRef") {
						return "valid - move to control setting selector";
					}
					if (sEntry === "actions") {
						if (aParts[3] === "move") {
							return "valid";
						}
					}
					return "valid";
				}
				return "invalid";
			}
		},
		"actions/combine/changeType" : {
			validate: function(vValue, sPath, oContext) {
				var sValid = validateChangeType("combine", vValue, oContext);
				if (sValid === "invalid" && oContext.actions.combine.changeOnRelevantContainer === true) {
					sValid = "valid";
				}
				return sValid;
			},
			value: function(vValue, sPath, oContext) {
				return getFlexHandlerText(vValue, oContext);
			}
		},
		"actions/combine/changeOnRelevantContainer" : {
			mandatory: false,
			validate: function(vValue) {
				return typeof vValue === "boolean" ? "valid" : "invalid";
			},
			value: function(vValue, sPath, oContext) {
				return getFlexHandlerText(vValue, oContext);
			}
		},
		"actions/combine/isEnabled" : {
			mandatory: false,
			validate: function(vValue) {
				return typeof vValue === "boolean" ? "valid" : "invalid";
			}
		},
		"actions/remove" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("hideControl", vValue, oContext);
			}
		},
		"actions/remove/changeType" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("hideControl", vValue, oContext);
			},
			value: function(vValue, sPath, oContext) {
				return getFlexHandlerText(vValue, oContext);
			}
		},
		"actions/rename" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("rename", vValue, oContext);
			}
		},
		"actions/rename/changeType" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("rename", vValue, oContext);
			},
			value: function(vValue, sPath, oContext) {
				return getFlexHandlerText(vValue, oContext);
			}
		},
		"actions/rename/domRef" : {
			validate: function() {
				return "valid (move to control setting)";
			},
			display: function(vValue) {
				return new sap.m.Text({text: vValue});
			}
		},
		"actions/reveal" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("unhideControl", vValue, oContext);
			}
		},
		"actions/reveal/changeType" : {
			validate: function(vValue, sPath, oContext) {
				return validateChangeType("unhideControl", vValue, oContext);
			},
			value: function(vValue, sPath, oContext) {
				return getFlexHandlerText(vValue, oContext);
			}
		}



	};

	function getText(sKey) {
		return mBundles.designtime.getText(sKey);
	}
	function validateText(vValue) {
		var bDTFound = false;

	//special handling for old function definitions
		if (typeof vValue === "function") {
			return "unchecked";
		}

	//proceed normally with a translation key
		if (vValue.toUpperCase() !== vValue) {
		//TODO:this should be enabled before a release of the new design time data
			return "unchecked";
		}
	//name/singular
		if (mBundles.designtime) {
			bDTFound = hasText(vValue, mBundles.designtime);
			return "valid";
		}
		if (mBundles.runtime) {
			if (bDTFound) {
				return "invalid";
			}
			return "valid (consider to move to designtime)";
		}
	}

	function getFlexHandlerText(vValue, oContext, sParentName) {
		if (!oContext) {
			return "";
		}
		sParentName = sParentName || "";
		var oFlex = oContext._flexhandler;
		if (!oFlex) {
		//baseclass
			var oParent = oContext._metadata.getParent();
			sParentName = oParent.getName();
			var aData = oDTElementModel.getProperty("/elements");
			while (sParentName !== "sap.ui.core.Element") {
				for (var i = 0; i < aData.length; i++) {
					if (aData[i]._name === sParentName) {
						return getFlexHandlerText(vValue, aData[i], sParentName);
					}
				}
				oParent = oParent.getParent();
				sParentName = oParent.getName();
			}
			return "invalid";
		}
		var oFlexItem = oFlex[vValue];
		if (oFlex._filename) {
			if (typeof oFlexItem === "string") {
				return oFlexItem + " " + sParentName + "(" + oFlex._filename + ".js)";
			}
			if (typeof oFlexItem === "object") {
				return Object.keys(oFlexItem).join() + "\n" + sParentName + "(" + oFlex._filename + ".js)";
			}
		} else {
			if (typeof oFlexItem === "string") {
				return oFlexItem + " " + sParentName + "(library.js)";
			}
			if (typeof oFlexItem === "object") {
				return Object.keys(oFlexItem).join() + "\n " + sParentName + "(" + oFlex._filename + ".js)";
			}
		}
	}

	function validateChangeType(sType, vValue, oContext) {
		if (typeof vValue === "string" && vValue === sType) {
			if (oContext._flexhandler && oContext._flexhandler[sType]) {
				if (oContext._flexhandler[sType].changeHandler === "default") {
					return "valid";
				}
				if (typeof oContext._flexhandler[sType].applyChange === "function" &&
					typeof oContext._flexhandler[sType].revertChange === "function") {
					return "valid";
				}
			}
			if (!oContext._flexhandler) {
				return "valid";
			}
			if (oContext._flexhandler[sType] === "default") {
				return "valid";
			}
			return "invalid";
		}
		if (typeof vValue === "function") {
			return "valid";
		}
		return "invalid";
	}
	function hasText(sKey, oBundle) {
		return oBundle.hasText(sKey) || oBundle.getText(sKey, [], true) !== undefined;
	}
})();
