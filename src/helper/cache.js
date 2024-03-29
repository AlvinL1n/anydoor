const {cache} = require('../config/defaultConfig');
function refreshRes(stats, res) {
    const {maxAge, expires, cacheControl, lastModified, etag} = cache;
    console.log('cache=>', cache);
    if (expires) {
        res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString());
    }

    if (cacheControl) {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }

    if (lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString());
    }

    if (etag) {
        res.setHeader('Etag', `${stats.size}-${stats.mtime}`);
    }
    //console.log('headers', res);
}

module.exports = function isFresh(stats, req, res) {
    refreshRes(stats, res);

    const lastModified = req.headers['if-modified-since'];
    const etag = req.headers['if-none-match'];
    console.log('lastModified', lastModified);
    console.log('etag', etag);
    if (lastModified && !etag) {
        return false;
    }

    if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
        return false;
    }

    if (etag && etag !== res.getHeader('Etag')) {
        return false;
    }

    return true;
}