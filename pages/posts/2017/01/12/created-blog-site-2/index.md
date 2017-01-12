---
title: ブログサイトを作った話 (その２)
date: 2017-01-12T22:50:00+09:00
path: /2017/01/12/create-blog-site-2/
tags: JavaScript, ES6, React
description: Gatsbyでブログサイトを実際に作ってるときの試行錯誤とか。
---

その２。やった手順とかもう覚えてないので、取り敢えず理解したことをまとめておく。

## ファイルの読み込まれる順番を考えてみた

### pages/_template.jsx
- 自分でいじれるファイルの中では最初に読み込まれるっぽい
- サイト自体のヘッダーとかメニューとかサイドバーとかフッターとか、常に表示されるものを配置する
- render()内の{children}にこの後読み込まれるファイルが表示されるみたい
- this.props.route.pagesはpages/以下の全てのページのオブジェクトの配列

### pages/index.jsx
- ルートにアクセスされた場合、_template.jsxの次に読み込まれるっぽい
- 通に記事の一覧とか表示すればいいんじゃないかな
- 人的な好みで記事はヘッダーと詳細だけの簡素なものを並べている

### wrappers/md.jsx
- ルート以外にアクセスされた場合、_template.jsxの次に読み込まれるっぽい
- リクエストURLのドメイン以下のパスを元に、pages/以下のファイルにアクセスするみたい
- そのアクセスしたファイルがMarkDownだとmd.jsxが呼び出されるみたい
- tomlファイルだとtoml.jsxだし、jsonだとjson.jsxが呼び出される
- this.props.route.pageは見つかったページのオブジェクト
- 見つかない場合(無効なURLの場合)、404.mdが読み込まれる
- 詳しい理由は[README](https://github.com/gatsbyjs/gatsby)に書いてあったと思う
- まあ取り敢えずこのファイルが表示されるので問題ないからいい

## SASSに対応させた
- ちょっと実装が進んでからやった
- 見よう見まねでgatsby-node.jsをいじった
- よく分からないが、CSS版のBabel的なPostCSSとAutoprefixerだけ使用した
- まねして色々書いたがエラーが出たので、それに従って消してたら結構シンプルになった

```javascript
const precss = require('precss')
const autoprefixer = require('autoprefixer')

exports.modifyWebpackConfig = function(config, env) {
  config.merge({
    postcss: [
      autoprefixer({
        browsers: ['IE 9', 'IE 10', 'IE 11', 'last 2 versions'],
        precss
      })
    ]
  })
  return config
}
```


## 全部ES6で書いた
- 全部説明するのだるい
- コード見て感じて
```javascript
import React, { PropTypes } from 'react'
import                           './style.scss'

class Collapse extends React.Component {
  constructor(props) {
    super(props)
    const isShown = this.props.isShown
    this.state = {
      isShown: typeof isShown === 'boolean' ? isShown : false
    }
    this.onClick = this.onClick.bind(this)
  }
  static propTypes() {
    return {
      className: PropTypes.string,
      label: PropTypes.any,
      children: PropTypes.any,
      isShown: PropTypes.bool
    }
  }
  onClick(event) {
    event.preventDefault()
    this.setState({ isShown: !this.state.isShown})
  }
  render() {
    const { className, label, children } = this.props
    const isShown = this.state.isShown

    return (
      <div className={`collapse-wrapper ${className}`}>
        <div className="collapse-header">
          <span className="collapse-clickable" onClick={this.onClick}>{ isShown ? '\u2228' : '>' }</span>
          <span className="collapse-label">{ label }</span>
        </div>
        <div className="collapse-children">
          { isShown ? children : []}
        </div>
      </div>
    )
  }
}

export default Collapse
```
- 一応まとめておくと、
- initialPropsの代わりにconstructor使うとか(initialStateはstatic付けるんだけ？)
- propTypesはstaticなメソッドにするとか
- 独自メソッドはconstructorでthisを明示的にバインドする必要があるとか
- まあそんなかんじ
- たぶん合ってる..一応動くけど..


## SASSを書いた
- resources/scss/以下

### vars.scss
- そのまんま、サイトで使う色の変数を定義した
```scss
$base-color: #eee;
$base-font-color: #888;

$content-color: white;
$content-font-color: black;

$decoration-color: #ccc;

$link-color: #258fb8;
$bg-link-color: #eaf0ff;

$shadow-color: #ddd;
```
- 割と分かりやすい変数名だと思う

### mixins.scss
- これはいくつかコンポーネントが完成してから、その共通部分を抜き出す感じで作った
```scss
@import 'vars';

@mixin content-box() {
  background-color: $content-color;
  box-shadow: 1px 2px 3px $shadow-color;
  padding: 20px;
  h1 {  font-size: 1.7rem;  }
  h2 {  font-size: 1.4rem;  border-bottom: 1px solid $decoration-color;  }
  h3 {  font-size: 1.2rem;  }
  h4 {  font-size: 1rem;  }
  h5 {  font-size: 0.9rem;  }
  h6 {  font-size: 0.8rem;  }
}

@mixin implicit-link($color) {
  color: $color;
  text-decoration: none;
  &:hover {
    color: $link-color;
    text-decoration: none;
  }
}

@mixin visible-link() {
  color: $link-color;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

@mixin row-ul() {
  list-style: none;
  display: flex;
  flex-direction: row;
  list-style: none;
}
```
- content-boxはサイトの中で白い四角で囲まれてるやつ
- ヘッダーの文字の大きさ変えてあるのは、そのままだとcontent-boxのh1とサイト自体のh1の文字サイズが同じになるから
- あとMarkDownで\#は使わず必ず\#\#から始めるとかいうしばりやりたくないし..
- implicit-linkはあれ、hoverすると色つくやつ
- visible-linkは元々色ついててhoverすると下線出るやつ
- row-ulはulで横向きに要素並べる場面が多かったため
- 継承使わないでmixinにしたのは、mixinの方が「部品」って感じがして個人的に好きだったから
- というか適切な継承関係考えるの難しくない？
- mixinは全部展開されるから継承よりコンパイル後のファイルサイズ大きくなるとか知らない

### base.scss
- 主に既存のタグについてのスタイル
```scss
@import '../../resources/scss/mixins';
@import '../../resources/scss/vars';

body {
  background-color: $base-color;
  margin: 0 30px 0 30px;
}

article {
  @include content-box();
}

a {
  @include visible-link();
}
```
- 特に書くこともない
