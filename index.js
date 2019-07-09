/*eslint-disable */
const loaderUtils = require('loader-utils');
const upload = require('./core/upload');

/**
 * 自定义loader
 * @param {*} source 匹配到文件的内容
 * @return str 返回匹配到文件经过该loader处理后的内容
 */
module.exports = async function(source) {
  const done = this.async();
  let options = Object.assign({
    source,
    ext: ['png', 'jpeg', 'jpg'],
    cachePath: './node_modules/.tinypng',
    enable: true,
    resourcePath: this.resourcePath
  }, loaderUtils.getOptions(this));
  if (!options.enable) {
    return done(null, source);
  }
  if (!options.key || typeof options.key !== 'string') {
    throw new Error('tinyPNG key not available or empty');
  }
  let reg = new RegExp(options.ext.join('|'));
  if (!options.ext.every(item => {
    return reg.test(item);
  })) {
    throw new Error('仅支持【jpg, jpeg, png】类型图片的压缩，请检查配置')
  }
  // compress
  let buffer = await upload(options);
  return done(null, buffer);
}

module.exports.raw = true;
