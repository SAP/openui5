sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "exit-full-screen";
	const pathData = "M319.13 159.068V18.889q0-16.9 15.907-17.895 5.965.994 10.936 5.468t4.97 11.433v117.313L482.176 4.97Q487.145 0 494.105 0t11.93 3.977Q512 9.942 512 15.907t-5.965 11.93L371.821 160.062h122.284q13.918 0 15.907 13.919 0 16.9-15.907 17.895H350.944q-13.919 0-22.866-9.445t-8.948-23.363zM64.621 255.503H32.808V64.62q0-13.918 9.444-22.866t22.37-8.947h190.88V64.62H64.623v190.882zm381.763 190.881V255.503h31.814v190.881q0 12.925-8.948 22.37t-22.866 9.444H255.503v-31.814h190.881zM5.965 482.174l133.22-131.23H16.9q-13.918 0-15.907-13.919 0-16.9 15.907-17.895h143.161q13.919 0 22.866 9.445t8.948 23.363v140.179q0 16.9-15.907 17.895-5.965-.995-10.936-5.468t-4.97-11.433V375.798L29.824 505.041q-4.97 4.97-11.93 4.97t-11.93-3.976Q0 500.07 0 494.105t5.965-11.93z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXIT_FULL_SCREEN;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var exitFullScreen = "exit-full-screen";

	exports.accData = accData;
	exports.default = exitFullScreen;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
