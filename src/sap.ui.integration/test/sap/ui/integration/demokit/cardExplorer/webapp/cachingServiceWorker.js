/* eslint-disable */

//current cache instance
var currentcache = caches.open("cards");

//network response put in cache if given
function networkFetch(event, cache, broadcast) {
	var request = event.request,
		cacheControl = readCacheHeader(request);

	return fetch(request)
		.then(function (networkResponse) {
			return randomize(networkResponse); // randomize the response for demonstration
		})
		.then(function (networkResponse) {
			if (networkResponse.ok && cache && cacheControl.isCacheEnabled()) {

				cache.put(request, networkResponse.clone());

				console.log("[CARDS CACHING SW] data revalidated - broadcast to card (" + request.url + ")");
				if (broadcast) {
					postMessage(event, {
						type: "ui-integration-card-update",
						url: request.url
					});
				}
			}

			return networkResponse;
		});
}

function delayedNetworkFetch(event, cache, broadcast) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			networkFetch(event, cache, broadcast).then(resolve, reject);
		}, 2000); // simulate response delay
	});
}

function randomize(response) {
	var clonedResponse = response.clone();

	return clonedResponse.json()
		.then(function (data) {
			if (!data.items) {
				return clonedResponse;
			}

			var items = data.items;

			items.sort(function () { return Math.random() - 0.5 });
			items = items.slice(Math.floor(Math.random() * items.length));

			data.items = items;

			return new Response(
				JSON.stringify(data),
				{
					status: clonedResponse.status,
					statusText: clonedResponse.statusText,
					headers: clonedResponse.headers
				}
			);
		});
}

function postMessage(event, message) {
	if (!event.clientId) {
		return;
	}

	clients.get(event.clientId)
		.then(function (client) {
			if (!client) {
				return;
			}

			client.postMessage(message);
		});
}

function parseHeaderList(value) {
	var parts = value.split(/\, */g),
		result = {};

	parts.forEach(function (part) {
		var pair = part.split("=");
		result[pair[0]] = pair[1] || true;
	});

	return result;
}

function readCacheHeader(request) {
	var cacheHeader = request.headers.get("cache-control"),
		parts,
		result = {};

	if (!cacheHeader) {
		return null;
	}

	parts = parseHeaderList(cacheHeader);

	if (parts["max-age"]) {
		result.maxAge = parseInt(parts["max-age"]);
	}

	if (parts["x-stale-while-revalidate"]) {
		result.staleWhileRevalidate = true;
	}

	if (parts["no-store"]) {
		result.noStore = true;
	}

	result.isCacheEnabled = function () {
		return !this.noStore;
	}

	result.isStale = function (response) {
		var date = readDateHeader(response),
			now = new Date(),
			maxAgeMs = this.maxAge * 1000;

		if (!date) {
			return true;
		}

		return (date.getTime() + maxAgeMs) < now.getTime();
	}

	return result;
}

function readDateHeader(response) {
	var dateHeader = response.headers.get("Date");

	if (!dateHeader) {
		return null;
	}

	return new Date(dateHeader);
}

//hook into all fetches
self.addEventListener('fetch', function (event) {
	var cardHeader = event.request.headers.get("x-sap-card");

	if (!cardHeader) {
		// intercept only for cards
		return;
	}

	var cacheControl = readCacheHeader(event.request)

	if (cacheControl && cacheControl.isCacheEnabled()) {
		console.log("[CARDS CACHING SW] looking for cache (" + event.request.url + ")");
		event.respondWith(
			currentcache.then(function (cache) {
				//add network update only if not already scheduled for the same request.url

				return cache.match(event.request).then(function (cachedResponse) {
					if (!cachedResponse) {
						console.log("[CARDS CACHING SW] no cache (" + event.request.url + ")");
						return delayedNetworkFetch(event, cache);
					}

					console.log("[CARDS CACHING SW] cache found (" + event.request.url + ")");

					if (!cacheControl.isStale(cachedResponse)) {
						return cachedResponse;
					}

					if (!cacheControl.staleWhileRevalidate) {
						return delayedNetworkFetch(event);
					}

					// If stale - revalidate
					console.log("[CARDS CACHING SW] cache is stale so revalidate (" + event.request.url + ")");
					delayedNetworkFetch(event, cache, true);
					return cachedResponse;
				});
			})
		);
	} else {
		console.log("[CARDS CACHING SW] cache is disabled - fetch data from server (" + event.request.url + ")");
		event.respondWith(delayedNetworkFetch(event));
	}
});

self.addEventListener('install', function () {
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	event.waitUntil(clients.claim());
});
