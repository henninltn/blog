---
title: ブログサイトを作った話 (その１)
date: 2017-01-01T04:20:28+09:00
path: /2017/01/01/create-blog-site-1/
tags: JavaScript, ES6, React
description: Gatsbyでブログサイト作ろうとしたときの懊悩とか苦悶とか。
---

長くなりそうなのでその１。

## ちょっとHexoを触ってみた
- 静的サイトジェネレータって何者
- 有名どころ触って感触掴みたい
- [公式サイト](https://hexo.io/)おしゃれ

### ブログの作り方
- 簡単に作れる
```
$ npm i -g hexo-cli
$ hexo init <folder>
$ cd <folder>
$ npm i
```

### ディレクトリ構成
```
.
├── _config.yml   // 設定ファイル
├── package.json
├── scaffolds     // なんだこれ
├── source
|   ├── _drafts   // 草稿
|   └── _posts    // ブログポスト
└── themes
```

### テーマ
- [公式テーマ](https://hexo.io/themes/)色々ある
- GitHubで公開されてるものも使えるみたい

### ブログポストの作り方 
- これも簡単
- layoutはpost、page、draft (記事、固定ページ、草稿)
```
# 記事生成
$ hexo new [layout] <title>
# mdファイル編集しながら確認...
$ hexo server
# 記事のページ生成 (md -> HTMLの変換？)
$ hexo generate
# デプロイ
$ hexo deploy
```

### 設定ファイル
- _config.yml
- 簡単で書きやすい
- ```new_post_name: :year/:month/:day/:title.md```で
  ```_posts/year/month/day/title.md```を生成とか
- とにかく書きやすい


## Gatybyに決めた
- Hexoで静的サイトジェネレータの雰囲気がつかめた
- のでもっかい調べる [StaticGen](https://www.staticgen.com/)
- Ctrl(Command)+F JavaScript
- Templates: Reactとかある..
- でもHexoとかより圧倒的に星少ない..
- そういえば最近O'REILLYの[入門 React](https://www.oreilly.co.jp/books/9784873117195/)買った
- やるしかない (絶対茨の道)
- Ctrl(Command)+F React
- GatsbyとPhenomicの2つ
- 星多いしGatsbyにしよう


## Gatsbyを触ってみた
- まずはGithubの[README](https://github.com/gatsbyjs/gatsby)を読む
- ファッツ
- 取り敢えずGetting started
```
$ npm i -g gatsby
$ gatsby new my-site
$ cd my-site
$ gatsby develop # サーバー起動

Server started successfully!

Listening at:

   http://0.0.0.0:8000
```
- ```http://localhost:8000```見に行く
- やったね！サイトできてる！
- ..で？
- しょぼい
- ```gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog```で公式？のテンプレートをもとにサイト作れる
- それでもしょぼい
- READMEだけじゃ無理ぽよなのでGatybeに関するブログとか探す


## Gatsbyについて調べた
- 「Gatsby 静的サイトジェネレータ」
- MOONGIFT貴様いつも役に立たないな (
冗談ダヨ)
- てかすっくね..
- [React.js製の静的サイトジェネレーターGatsbyに移行した](http://qiita.com/jaxx2104/items/5f28915355a85d36e38a)
- めっちゃ参考になる.. (というかほぼ丸パクリ)
- 薄々感じてたけどGatsbyはテーマとか少なそう(というかほぼない)なので自分で全部作ることになりそう..


## 方針が決まった
- [README](https://github.com/gatsbyjs/gatsby)
- [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) 
- [React.js製の静的サイトジェネレーターGatsbyに移行した](http://qiita.com/jaxx2104/items/5f28915355a85d36e38a)
- [Gatstrap](https://github.com/jaxx2104/gatsby-starter-bootstrap)
- 上記4つを回し見しながら頑張るしかない..
- というかまずReact勉強しないと読めないし話にならない
- [入門 React](https://www.oreilly.co.jp/books/9784873117195/)読もう..
