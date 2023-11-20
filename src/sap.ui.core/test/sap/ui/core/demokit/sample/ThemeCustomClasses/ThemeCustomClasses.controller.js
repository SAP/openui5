sap.ui.define([
		'sap/ui/core/Theming',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Theming, Controller, JSONModel) {
	"use strict";

	var ThemeCustomClassesController = Controller.extend("sap.ui.core.sample.ThemeCustomClasses.ThemeCustomClasses", {

		// ###############################################
		//
		// whole code in controller is irrelevant for sapTheme prefixed classes!
		// only for sample display
		//
		// ###############################################
		onInit: function () {

			// subscribe to theme change event
			Theming.attachApplied(this._reloadSample.bind(this));

			var oThemeClasses = this._fetchClasses();

			var oModel = new JSONModel(oThemeClasses);
			this.getView().setModel(oModel);
		},

		onAfterRendering : function(){
			// special treatment for border styles
			var aData = this.oView.getModel().oData.Styles;
			aData.forEach(function(e,i){
				var elem = document.querySelectorAll('.sampling')[i];
				if (elem && e.border){
					elem.style.borderWidth = "1xp";
					elem.style.borderStyle = "solid";
				}
			});
		},

		_fetchClasses : function(){
			var sheets = document.styleSheets;
			var themeClasses = {"Styles" : []};
			for (var i in sheets){
				if (sheets[i].cssRules){
					var x = sheets[i].cssRules;
					for (var j in x){
						if (x[j].selectorText && x[j].selectorText.indexOf("sapTheme") > 0){
							var sCssRule = x[j].cssText.split('{')[1].split('}')[0];
							var bBorder = ( x[j].cssText.indexOf('border') > 0 ) ? true : false;
							var sStyles = "";
							if (x[j].selectorText.indexOf(',') > 0){
								var aStyles = x[j].selectorText.split(',');
								for (var k in aStyles){
									sStyles = aStyles[k].split('.')[1];
									if (sStyles.trim() === "sapContrast" || sStyles.trim() === "sapContrastPlus") { continue; }
									themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });
								}
							} else if (x[j].selectorText.split('.').length > 2){
								var aStyles = x[j].selectorText.split('.');
								for (var k in aStyles){
									sStyles += aStyles[k];
									sStyles += " ";
								}
								if (sStyles.trim() === "sapContrast" || sStyles.trim() === "sapContrastPlus") { continue; }
								themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });
							} else {
								sStyles = x[j].selectorText.split('.')[1];
								if (sStyles.trim() === "sapContrast" || sStyles.trim() === "sapContrastPlus") { continue; }
								themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });
							}
						}
					}
				}
			}
			return themeClasses;
		},

		_reloadSample : function(context){
			// wait until theme is changed
			setTimeout(function() {

				// load sapTheme classes
				var oThemeClasses = this._fetchClasses();

				// reload the view
				this.oView.setModel(new JSONModel(oThemeClasses));
				this.oView.invalidate();
			}.bind(this), 500);
		}
	});

	return ThemeCustomClassesController;

});
