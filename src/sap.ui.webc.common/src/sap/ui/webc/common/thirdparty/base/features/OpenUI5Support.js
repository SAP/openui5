sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Theming",
	"sap/ui/core/date/CalendarUtils",
	"../FeaturesRegistry",
	"../config/Theme",
	"../util/PopupUtils"
], function (
	Formatting,
	Localization,
	ControlBehavior,
	Theming,
	CalendarUtils,
	_FeaturesRegistry,
	_Theme,
	_PopupUtils
) {
	"use strict";

	const getCore = () => {
		return sap.ui.require("sap/ui/core/Core") ||
			(sap && sap.ui && typeof sap.ui.getCore === "function" && sap.ui.getCore());
	};
	const isLoaded = () => {
		return !!getCore();
	};
	const init = () => {
		const core = getCore();
		if (!core) {
			return Promise.resolve();
		}
		return new Promise(resolve => {
			core.ready(() => {
				window.sap.ui.require(["sap/ui/core/LocaleData", "sap/ui/core/Popup"], (LocaleData, Popup) => {
					Popup.setInitialZIndex((0, _PopupUtils.getCurrentZIndex)());
					resolve();
				});
			});
		});
	};
	const getConfigurationSettingsObject = () => {
		return {
			animationMode: ControlBehavior.getAnimationMode(),
			language: Localization.getLanguage(),
			theme: Theming.getTheme(),
			rtl: Localization.getRTL(),
			calendarType: Formatting.getCalendarType(),
			formatSettings: {
				firstDayOfWeek: CalendarUtils.getWeekConfigurationValues().firstDayOfWeek,
				legacyDateCalendarCustomizing: Formatting.getLegacyDateCalendarCustomizing()
			}
		};
	};
	const getLocaleDataObject = () => {
		const LocaleData = window.sap.ui.require("sap/ui/core/LocaleData");
		return LocaleData.getInstance(Localization.getLanguageTag())._get();
	};
	const listenForThemeChange = () => {
		Theming.attachApplied(async () => {
			await (0, _Theme.setTheme)(Theming.getTheme());
		});
	};
	const attachListeners = () => {
		listenForThemeChange();
	};
	const cssVariablesLoaded = () => {
		const core = getCore();
		if (!core) {
			return;
		}
		const link = [...document.head.children].find(el => el.id === "sap-ui-theme-sap.ui.core"); // more reliable than querySelector early
		if (!link) {
			return;
		}
		return !!link.href.match(/\/css(-|_)variables\.css/);
	};
	const getNextZIndex = () => {
		const core = getCore();
		if (!core) {
			return;
		}
		const Popup = window.sap.ui.require("sap/ui/core/Popup");
		return Popup.getNextZIndex();
	};
	const setInitialZIndex = () => {
		const core = getCore();
		if (!core) {
			return;
		}
		const Popup = window.sap.ui.require("sap/ui/core/Popup");
		Popup.setInitialZIndex((0, _PopupUtils.getCurrentZIndex)());
	};
	const OpenUI5Support = {
		isLoaded,
		init,
		getConfigurationSettingsObject,
		getLocaleDataObject,
		attachListeners,
		cssVariablesLoaded,
		getNextZIndex,
		setInitialZIndex
	};
	(0, _FeaturesRegistry.registerFeature)("OpenUI5Support", OpenUI5Support);
});