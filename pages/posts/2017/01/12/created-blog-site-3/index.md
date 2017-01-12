---
title: ブログサイトを作った話 (その３)
date: 2017-01-12T22:50:00+09:00
path: /2017/01/12/create-blog-site-3/
tags: JavaScript, ES6, React
description: Gatybyでブログサイトを作るのに作成したコンポーネントについて。
---

その３。たぶん今回で終わり。

## ヘッダーコンポーネントを作った
- components/Header
- react-routerのLinkと、gatsby-helperのprefixLinkの使い方が分かった
- prefixLinkの中身は```/```で始めると絶対パス、それ以外だと現在のパスからの相対パスになる
- それ以外特に言うこともない
- SCSSの調整がんばった
- まあでもこれといった気づきとかはなかった


## 記事を表示するコンポーネントを作った
- components/Post
- HTML5だよ
```html
<header>
    <time>datetime</time>
    <h1>title</h1>
    <TagList/>
    <div>description</div>
    <div>body</div>
    <footer/>
</header>
```
- 大体こんな構造
- 特に言うこともない
- propsのheaderOnlyでbody部分の表示・非表示を切り替えられる


## 記事を一覧表示するコンポーネントを作った
- 少し複雑
- propsでタグの配列を受け取る
- ちなみにタグも自分で実装する必要がある(つらい)
```javascript
pages.filter(page => ! conditions.ifExists(tags) || tags.length === 0 ? true
  : tags.some(tag => page.data.tags.includes(tag)))
```
- タグがなければそのまま、confit.tomlで定義されたタグがあれば表示するページを制限する
- conditionsはあれ、投稿はpages/posts/以下、固定ページはpages/pages/以下のファイルしか認めてないけど、それのフィルタリングのための条件関数とかが定義されている
- 次が特に読みにくい
```javascript
pages.filter(page => page.requirePath.match(
  new RegExp('^posts/'
    + [day, month, year].reduce((accum, i) => conditions.ifExists(i) && i !== "" ? `${i}/${accum}` : '.*', '.*')
    + '/index.md$')))
```

## めんどくさくなった
- 面倒になったのであとは書きません
- 次からはちゃんと作業しながら書こう..
