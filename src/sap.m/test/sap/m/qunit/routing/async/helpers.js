sap.ui.define([
	"sap/ui/core/mvc/View"
], function (View) {
		"use strict";
		var _mViewDelays;

		function createViewAndController (sName) {
			var oView = View.create({viewName: "m.test.views." + sName, type: "XML"});

			return oView;
		}

		function createViewMock (oViewOptions) {
			var oView;

			return {
				loaded: function() {
					oView = View.create({viewName: oViewOptions.name, type: "XML"});
					return new Promise(function(resolve) {
						setTimeout(function() {
							resolve(oView);
						}, _mViewDelays && _mViewDelays[oViewOptions.name] || 0);
					});
				},
				destroy: function() {
					oView.destroy();
				},
				isA: function(sClass) {
					return sClass === "sap.ui.core.mvc.View";
				}
			};
		}

		return {
			createViewAndController: createViewAndController,
			createViewMock: createViewMock,
			setViewDelays: function(mViewDelays) {
				_mViewDelays = mViewDelays;
			}
		};

	});
