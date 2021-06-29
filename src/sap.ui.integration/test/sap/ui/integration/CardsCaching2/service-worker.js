/* eslint-disable */

//timeout, when to start revalidation
var revalidateTimeout = 5000;

//current cache instance
var currentcache = caches.open("cards");

//which origins to cache
var cacheorigins = [self.location.origin];

//schedule map to avoid request after page reloads within <revalidateTimeout> sec
//as the sw is an own thread it would request the same data multiple times
var scheduled = {};
var revalidator = setInterval(function () {
	currentcache.then(function (cache) {
		var keys = Object.keys(scheduled);
		if (keys.length > 0) {
            var key = keys[0],
                event = scheduled[key];
			setTimeout(function (cache, event) {
				networkFetch(event, cache);
			}.bind(self, cache, event), revalidateTimeout);
			if (scheduled[key]) {
				delete scheduled[key];
			}
		}
	});
}, 150)

//network response put in cache if given
function networkFetch(event, cache) {
    var request = event.request;
	return fetch(request).then(function (networkResponse) {
		if (cache) {
            cache.put(request, networkResponse.clone());
            console.log("[CARDS CACHE] " + request.url + " revalidated - broadcast to card");

            postMessage(event, {
                type: "ui-integration-card-update",
                url: request.url
            });
		}
		return networkResponse;
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
        console.log("[CARDS CACHE] looking for cache " + event.request.url);
		event.respondWith(
			currentcache.then(function (cache) {
                //add network update only if not already scheduled for the same request.url

				return cache.match(event.request).then(function (cachedResponse) {
					if (!cachedResponse) {
                        console.log("[CARDS CACHE] no cache for " + event.request.url);
						return networkFetch(event, cache);
					}

					console.log("[CARDS CACHE] cache for " + event.request.url);

					if (!cacheControl.isStale(cachedResponse)) {
						return cachedResponse;
					}

					if (!cacheControl.staleWhileRevalidate) {
						return networkFetch(event);
					}

					// If stale and not scheduled - schedule revalidate
					if (!scheduled[event.request.url]) {
						console.log("[CARDS CACHE] cache is stale so revalidate for " + event.request.url);
						scheduled[event.request.url] = event;
					}

					return cachedResponse;
				});
			})
		);
	}
});

// @todo clear cache when full