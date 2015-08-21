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
			return createViewMock({viewName: sName});
		}

		function createViewMock(oViewOptions) {
			var oView;
			createViewAndController(oViewOptions.viewName);
			return {
				loaded: function() {
					oView = sap.ui.jsview(oViewOptions.viewName, oViewOptions.viewName);
					return new Promise(function(resolve) {
						setTimeout(function() {
							resolve(oView);
						}, _mViewDelays[oViewOptions.viewName]);
					});
				},
				destroy: function() {
					oView.destroy();
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
