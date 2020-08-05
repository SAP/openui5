sap.ui.define(
	[],
	function () {
		"use strict";

		var _mViewDelays;

		function createViewAndController(sName) {
			sap.ui.controller(sName, {});
			sap.ui.jsview(sName, {
				createContent: function () {
				},
				getController: function () {
					return sap.ui.controller(sName);
				}
			});

			// return sap.ui.jsview(sName, sName);
		}

		function createViewAndControllerAsync(sName) {
			return createViewMock({name: sName});
		}

		function createViewMock(oViewOptions) {
			var oView;
			createViewAndController(oViewOptions.name);
			return {
				loaded: function() {
					oView = sap.ui.jsview(oViewOptions.name, oViewOptions.name);
					return new Promise(function(resolve) {
						setTimeout(function() {
							resolve(oView);
						}, _mViewDelays[oViewOptions.name]);
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
			createViewMock: createViewMock,
			createViewAndController: createViewAndController,
			createViewAndControllerAsync: createViewAndControllerAsync,
			setViewDelays: function(mViewDelays) {
				_mViewDelays = mViewDelays;
			}
		};

	});
