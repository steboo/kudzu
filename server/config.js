var path = require('path'),
    cjson = require('cjson');

var paths = [
    path.join(__dirname, '../config/default.json')
];

if (process.env.NODE_ENV == 'production') {
    paths.push(
        path.join(__dirname, '../config/production.json')
    );
}

var config = cjson.load(paths, {
    freeze: true,
    merge: true
});

module.exports = config;
