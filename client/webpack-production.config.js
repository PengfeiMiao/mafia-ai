const webpackBaseConfig = require('./webpack.config.js');

const prodWebpackConfig = Object.assign(webpackBaseConfig);

prodWebpackConfig.mode = 'production';
prodWebpackConfig.devServer.proxy = {};
module.exports = prodWebpackConfig;