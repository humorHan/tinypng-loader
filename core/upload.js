/*eslint-disable */
const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto')
const ora = require('ora');
const chalk = require('chalk');
const log = require('./log');
const mkdirsSync = require('./mkdirsSync');

let noMatchExt = {};
let loading = ora(`compressing img`)

module.exports = async (options) => {
  let { ext, key, resourcePath, cachePath, proxy, source } = options;
  let file = {
    resourcePath,
    name: path.basename(resourcePath),
    origin: {
      buffer: source
    },
    compress: {
      success: false,
      buffer: null,
      fromCache: false,
      errorStack: null
    }
  };
  tinify.key = key;
  tinify.proxy = proxy;
  if (!new RegExp(ext.join('|')).test(resourcePath)) {
    if (!noMatchExt[file.resourcePath]) {
      log.warn(`${file.resourcePath} is not compressed, please check suffix`)
    }
    noMatchExt[file.resourcePath] = 'exit';
    return file.origin.buffer;
  }
  let filePath = getFileHashPath(getHash(file.origin.buffer), cachePath, resourcePath);

  if (fs.existsSync(filePath)) {
    let cacheBuffer = fs.readFileSync(filePath);
    Object.assign(file.compress, {
      fromCache: true,
      success: true,
      buffer: cacheBuffer
    });
    stdoutLog(loading, file);
    return cacheBuffer;
  }
  loading.start();
  await tinify.fromBuffer(file.origin.buffer).toBuffer().then(compressedBuffer => {
    loading.stop();
    Object.assign(file.compress, {
      buffer: compressedBuffer,
      success: true
    });
    mkdirsSync(cachePath, '0777');
    const compressedFilePath = getFileHashPath(getHash(file.compress.buffer), cachePath, resourcePath)
    fs.writeFileSync(resourcePath, file.compress.buffer);
    fs.writeFileSync(filePath, file.compress.buffer);
    fs.writeFileSync(compressedFilePath, file.compress.buffer);
  }).catch((err) => {
    loading.stop();
    file.compress.errorStack = err;
    if (err instanceof tinify.AccountError || err instanceof tinify.ConnectionError) {
      loading.fail(chalk.red('compress error! verify your API key and account limit'));
      // TODO 
      // throw err;
    }
  });

  stdoutLog(loading, file);

  return file.compress.success ? file.compress.buffer : file.origin.buffer;
}

function stdoutLog(loading, file) {
  if (file.compress.success) {
    let originLength = (file.origin.buffer.length / 1024).toFixed(1);
    let compressLength = (file.compress.buffer && file.compress.buffer.length / 1024).toFixed(1);
    let compressedPercent = parseInt(((originLength - compressLength) / originLength) * 100) + '%';
    let str = `${file.resourcePath} has been compressed `;
    str += file.compress.fromCache ? '【from cache】' : `${originLength}kb -> ${compressLength}kb【save ${compressedPercent}】`;
    loading.succeed(chalk.green(str));
  } else {
    loading.fail(chalk.red(`compress ${file.resourcePath} error! 详情如下：`));
    log.error(`${file.compress.errorStack}`);
  }
}

function getHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function getFileHashPath(fileHash, cachePath, resourcePath) {
  return path.resolve(cachePath, `${fileHash}${path.extname(resourcePath)}`);
}
