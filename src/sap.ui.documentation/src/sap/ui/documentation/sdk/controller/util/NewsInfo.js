/*!
 * ${copyright}
 */

// Provides reuse functionality for reading news from news RSS files
sap.ui.define([
		"sap/ui/core/Core",
		"sap/ui/thirdparty/jquery",
		"sap/ui/documentation/sdk/util/Resources",
		"sap/base/Log"
	],
	function(Core, jQuery, ResourcesUtil, Log) {
		"use strict";

		var _oNewsDataCache = {},
			_aNewNews = [],
			_aOldNews = [],
			_sPreparationFailureMessage = null,
			_bInitiallySplit = false,
			_sOldNewsLocalStorageKey = 'OLD_NEWS_IDS',
			_sLocalStorageNewsName,
			_oConfigUtilInstance;

		function prepareNewsData(oConfigUtilInstance) {

			if (_oNewsDataCache["newsRSS"]) {
				return Promise.resolve(_oNewsDataCache["newsRSS"]);
			}

			_oConfigUtilInstance = oConfigUtilInstance;
			_sLocalStorageNewsName = _oConfigUtilInstance.LOCAL_STORAGE_NAMES[_sOldNewsLocalStorageKey];

			return oConfigUtilInstance._requireConfigJSON()
					.then(_requireFeedXML)
					.then(_parseDateToLocaleString)
					.then(_splitNewAndOldItems)
					.catch(function (vReason) {
						_sPreparationFailureMessage = vReason.message;
						Log.error(_sPreparationFailureMessage);
					})
					.finally(_publishNewsChangedEvent);
		}

		function _splitNewAndOldItems() {

			if (_bInitiallySplit) {
				return Promise.resolve();
			}

			var aLocalStorageCachedIDs = _oConfigUtilInstance.getLocalStorageItem(_sLocalStorageNewsName);

			return new Promise(function (resolve) {

				var aItems = _oNewsDataCache["newsRSS"].items,
					oCurrItem;

				if (Array.isArray(aLocalStorageCachedIDs)) {
					for (var i = 0; i < aItems.length; i++) {
						oCurrItem = aItems[i];
						if (aLocalStorageCachedIDs.indexOf(oCurrItem.id) !== -1) {
							_aOldNews.push(oCurrItem);
						} else {
							_aNewNews.push(oCurrItem);
						}
					}
				} else {
					_aNewNews = aItems.slice();
				}
				_bInitiallySplit = true;
				resolve();
			});
		}

		function getPreparationFailureMessage() {
			return _sPreparationFailureMessage;
		}

		function getNewNewsArray() {
			return _aNewNews;
		}

		function getOldNewsArray() {
			return _aOldNews;
		}

		function moveNewItemToOld(oItem) {
			var iIndexInNewArr = _aNewNews.indexOf(oItem),
				aLocalStorageIDs = _oConfigUtilInstance.getLocalStorageItem(_sLocalStorageNewsName) || [];

			if (iIndexInNewArr > -1) {
				_aNewNews.splice(iIndexInNewArr, 1);
			}

			_aOldNews.push(oItem);
			aLocalStorageIDs.push(oItem.id);

			_oConfigUtilInstance.setLocalStorageItem(_sLocalStorageNewsName, aLocalStorageIDs);
			_publishNewsChangedEvent();
		}

		function moveAllNewItemsToOld() {
			var aLocalStorageIDs = _oConfigUtilInstance.getLocalStorageItem(_sLocalStorageNewsName) || [],
				oCurrItem;

			for (var i = 0; i < _aNewNews.length; i++) {
				oCurrItem = _aNewNews[i];
				_aOldNews.push(oCurrItem);
				aLocalStorageIDs.push(oCurrItem.id);
			}

			_aNewNews = [];
			_oConfigUtilInstance.setLocalStorageItem(_sLocalStorageNewsName, aLocalStorageIDs);

			_publishNewsChangedEvent();
		}

		function _parseDateToLocaleString() {
			var aItems = _oNewsDataCache["newsRSS"].items;

			aItems.forEach(function(oItem) {
				oItem.updated = new Date(oItem.updated).toLocaleString();
			});
		}

		function _publishNewsChangedEvent() {
			Core.getEventBus().publish("newsChanged", "onDemoKitNewsChanged");
		}

		function _requireFeedXML(oJSON) {
			return new Promise(function (resolve) {
				jQuery.ajax(ResourcesUtil.getResourceOriginPath(oJSON.feedPath), {
						type: "GET",
						dataType: "xml",
					success : function(oResult) {

						var items = [];
						jQuery('item', oResult).each( function() {
							var item = {};
							item.title = jQuery(this).find('title').eq(0).text();
							item.link = jQuery(this).find('link').eq(0).text();
							item.description = jQuery(this).find('description').eq(0).text();
							item.updated = jQuery(this).find('pubDate').eq(0).text();
							item.id = jQuery(this).find('guid').eq(0).text();
							items.push(item);
						});

						_oNewsDataCache["newsRSS"] = {"items" : items};
						resolve(
							_oNewsDataCache["newsRSS"]
						);
					},
					error : function () {
						Log.error("failed to load news rss");
						_oNewsDataCache["newsRSS"] = null;
						resolve();
					}
				});
			});
		}

		return {
			moveAllNewItemsToOld: moveAllNewItemsToOld,
			moveNewItemToOld: moveNewItemToOld,
			prepareNewsData: prepareNewsData,
			getPreparationFailureMessage: getPreparationFailureMessage,
			getNewNewsArray: getNewNewsArray,
			getOldNewsArray: getOldNewsArray
		};

	});