## tinypng-loader

##### 基于tinyPng，作为url-loader处理图片资源时的前置处理器

### require

```
webpack4.x
```

### install
```
yarn add tinypng-loader
```

### config 
```js
{
  test: /\.(png|jpe?g|gif)$/,
  use: [{
    loader: 'url-loader',
    options: {
      limit: 4096,
      name: 'img/[name].[ext]?v=[hash:8]'
    }
  }, {
    loader: 'png-loader',
    options: {
      key: 'xxx',
      ext: ['png', 'jpeg', 'jpg'],
      proxy: '',
      enable: true,
      cachePath: './node_modules/.tinypng'
    }
  }]
}
```

### options

#### key
Type: `String`
在[tinyPng](https://tinypng.com/developers)申请key，免费版本每月限制压缩次数上限500

#### ext
type `Array`
需要处理的图片类型，目前支持png、 jpeg、 jpg三种类型

#### proxy
type `string`
代理

#### enable
type `Boolean`
上传开关

### cachePath
默认会缓存在./node_modules/.tinypng文件夹下
缓存压缩后的图片，用于减少不必要的压缩操作。注意该文件夹应该是每次部署都不会删除的文件夹，才能有效命中缓存


### issue 
有任何问题，请在[这里](https://github.com/humorHan/tinypng-loader/issues)留言