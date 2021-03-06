---
title: シェルスクリプトでcalenderコマンドを作った話 (その１)
date: 2017-01-16T03:50:00+09:00
path: /2017/01/16/created-calender-command-using-shellscript-1/
tags: ShellScript
description: シェルスクリプトにふわっと入門した。
---

今回はcalenderコマンドを作りながら調べたことを入門チックにまとめた。

長くなったのでコマンドの作成過程は次回の記事で。

シェルスクリプト楽しいよ。関数型もあるよ。みんなも書こうよ。



## シェルスクリプトの基本について調べた
- [UNIX &amp; Linux コマンド・シェルスクリプト リファレンス](http://shellscript.sunone.me/)
- ここ最強


### シバン(シェバン)について
- シェルスクリプトのファイルの先頭の```#!/bin/sh```のこと
- shell-bang、hash-bang、sharp-bangとも
- shell-bangを縮めたshebangが一般的
- ```#!/bin/sh```とか、```#!/bin/bash```とか
- shがもっとも基本的だけど、Linuxは大抵bashだし、bashで開発することが多いからbashでいい(らしい)
- というわけで以降```#!/bin/bash```でいきます
- まあzsh使ってるんですけどね
- あとコマンドがbashのビルトインコマンドなのかとかいちいち調べません
- 取り敢えず動いたらそのままいきます
- そういうの調べるのはもうちょっと慣れてからでいい気がする
- ちなみに```#!```は以降の文字列をそのまま```exec```に渡すらしい
- このシバンってどこでも使われてる割には仕様がふわふわらしい


### 変数について
```bash
hoge=hoge
foo="foo"
hogefoo=$hogefoo
bar="$1"
echo $hoge$foo
echo "$hoge$foo"
echo "${hoge}111"
echo $bar
```
- 宣言時はダラー```$```なし、呼び出しのときはあり
- 変数名と```=```、```=```と値の間にスペース入れるとエラー
- 値があるか分からない変数(```$n```とか)を代入するときは注意
- ```$n```については下の関数と引数の話で出てくる
- ```hoge=$1```とすると、```$1```が未定義のとき```hoge=```となりエラーが出る
- ```hoge="$1"```としておくと安心
- ローカル変数は```local foo=foo```
- 関数の中とかで使えますね
- 定数は```readonly```
- ローカル定数は```local readonly```


### 文字列について
- ```""```と```''```がある
- ```""```は変数展開するけど```''```はしない
- 連結の演算子とか関数とかはない、並べるだけ
```bash
hoge="hoge"
echo "$hoge"
# => hoge
echo '$hoge'
# => $hoge
```


### 数式処理について
```bash
num=3
echo $(($num + 5))
echo $((num + 5))
# => 8
```
- 計算式は```$(())```で囲む必要がある
- 中で変数使うときダラー```$```あってもなくても動いた
- ```expr```コマンドでも同じようなことできるけど遅い
- ただ```$(())```はshにはないので、sh使うときは```expr```しかない
- ```$(())```では整数しか処理できないらしい


### 関数、引数について
- 関数は```foo() {}``` などと定義
- 引数は特に指定せず、```$n```で受け取る
- nはCと同じで1から
- シェルスクリプト自体の引数も同じく
- 関数の中では関数の引数が優先的に```$n```に代入される
- しかし```$0```だけは関数の中でもそのシェルスクリプトのファイル名になる
- ```return```は値を返さず、関数をただ終了するだけ
- 代わりに```echo```で値を返す
- というかもう標準出力にだしちゃう
- ~~めっちゃ不便..~~
- ~~リダイレクトすればいい話だった~~
- ~~リダイレクトとかパイプで処理を繋げていく感じ~~
- さらに訂正、リダイレクトじゃなくてパイプ```|```だった..
- 関数の合成に似てる
- [プログラマーの君！ 騙されるな！ シェルスクリプトはそう書いちゃ駄目だ！！ という話 - Qiita](http://qiita.com/piroor/items/77233173707a0baa6360)
- まあシェルスクリプトの書き方としてあまり関数は使わないほうがよさそう？


### リダイレクション、パイプについて
- リダイレクション```>```、```>>```は標準出力をファイルに流す
- ```>```は上書き、```>>```は追記
- パイプ```|```は標準出力をコマンドに流す
```bash
echo hogehoge > hoge.txt
# hoge.txt => hogehoge
echo fugafuga > hoge.txt
# hoge.txt => hogehoge
#             fugafuta
echo foofoo > hoge.txt
# hoge.txt => foofoo

seq 1 9 | head -n 2
# => 1
# => 2
```


### ifについて
- ```elif```だけ注意
```bash
foo="foo"
[ "$foo" = "foo" ] && echo $foo || echo "no foo"

if [ "$foo" = "foo" ]; then
  echo $foo;
elif [ "$foo" = "bar" ]; then
  echo "it's bar";
else
  echo "else";
fi
```
- ```[ ```の右と``` ]```の左はスペースないとエラーになる
- ```[```も```]```もコマンドだから
- というかシェルスクリプトは(ほぼ)全部コマンドからできてるらしい


### testについて
- ```test```は与えられた条件式によって0または1を返す
- ```[```と```]```は```test```のエイリアス
```bash
test "" = ""; echo $?
# => 0
test "" != ""; echo $?
# => 1
```
- ちなみに```[```と```]```はbashとかzshとかのビルトインコマンド
- なのでshにはない(たぶん)


### ifとかで何もしたくないときについて
- nullコマンド```:```が使える
```bash
cond=`test "" == ""`
if [ $cond ]; then
  :
else
  echo "if not";
fi
```
- まあ```! $cond```でもいいんだけど、覚えておくと使い道あるかも


### =について
- ```=```しか使えなかったけど、今は```==```も使えるらしい
- ```test```コマンド中だとオプションの```-eq```や```-ne```、```-lt```なども使える


### while、forについて
```bash
while test "" = ""
do
  echo "one time"
  break
done

cond=1
while [ "$cond" ]; do
  echo "two times"
  if [ "$cond" = "1" ]; then
    cond=0
    continue
  else
    break;
  fi
done
```
- ```while```と```do```を1行で書くのに```;```で繋いでるのよく見る
- 別に```test```コマンド使わなくてもいい
```bash
for var in hoge fuga foo bar
do
  echo $va
done

for i in $(seq 0 4); do
  echo $i
done

foo=foo
bar=bar
for val in "$foo" "$bar"; do
  echo $val
done
```
- 配列(?)を回す
- ```seq```使う時は```$()```で囲む必要あるみたい(バッククォート``` `` ```でも可)
- 変数使う時は```""```で囲まないと変数中のスペースが無視される


### コマンド結果の変数への代入について
- ~~バッククォート``` `` ```使う~~
- バッククォート``` `` ```は入れ子にできないし```$()```の方使うべきらしい
- まあbashの機能だからshにはないけど
```bash
# firstday=`date -d "2017-01-15" "+%w"`
firstday=$(date -d 2017-01-15 +%w)
echo $firstday
# => 0 (日曜日)
```
- 下で書くけど```date```の書き方、これはGNU系の話..
- Macだとエラーを吐く
- BSD系はオプションが異なる


### 色々あるダラー```$```の使い方について
- [bashの変数($,ダラー,ドル)まとめ - nori3tsu&#39;s blog](http://nori3tsu.hatenablog.com/entry/2013/12/29/165617)
- 算術演算 ```$((1+2))```
- 変数fooが未定義のときbarを使う ```${foo-bar}```
- 変数fooが未定義または空文字列のときbarを使う ```${foo:-bar}```
- 変数fooが未定義のときbarをfooに代入して使う ```${foo=bar}```
- 変数fooが未定義または空文字列のときbarをfooに代入して使う ```${foo:=bar}```
- 色々と便利そうなのある


### かっこ類について
- [Bashにおける括弧類の意味 - Qiita](http://qiita.com/yohm/items/3527d517768402efbcb6)

#### bracket [ ]
- ```test```コマンドのエイリアス

#### double bracket [[ ]]
- ```[ ]```の強化版
- 中で```&&```、```||```、Pattern matching、正規表現などが使える
- 逆に```[ ]```の中で使えないんですね..

#### Parentheses ()
- subshellを起動してコマンドを実行
- かっこ類の中でこれだけ両端にスペースがいらない
```bash
(cd /tmp; pwd)
# => /tmp
```

#### Braces { }
- 「変数の展開」または「一連のコマンドをカレントシェルで実行」
```bash
# 変数の展開
foo=foo
foobar=${foo}bar

# 一連のコマンドをまとめて実行
{ time -p { sleep 1; sleep 2; echo "finished"; }; }
```


### その他
- プログラムの最後は改行で終わること
- 「改行するまでが１つのコード」的なことが何かで決められてるらしいので、最終行も改行しないとたまにちゃんと動かない
- 何でどう決められてたか忘れてしまった..



## シェルスクリプトで関数型チックなことができた
- みんなもLet's関数型
- 宣言的に書いて気持ちよくなりたい
- そもそもシェルスクリプトやろうと思ったのがmapっぽいのとかfilterっぽいのとかあったからというのが大きい
- さすがステートレスな処理が得意というだけある
- [本を読む 関数型言語shの基礎文法最速マスター](http://emasaka.blog65.fc2.com/blog-entry-708.html)
- [シェル芸とHaskellの対応を考える &#8211; 上田ブログ](https://blog.ueda.asia/?p=2644#more-2644)


### シーケンス
- ```seq```コマンドを使う
- Pythonの```range```みたいな感じ
```bash
seq 1 3
# => 1
# => 2
# => 3

seq 1 3 | head -n 1
# => 1

seq 1 3|tail -n2|head -n1
# => 2
```


### map
- これめっちゃ使った
```bash
seq 0 3|while read i;do
  echo $((i*2))
done
# => 0
# => 2
# => 4
# => 6
```


### 内包表記
- 使わなかった
- 大抵mapでどうにかなる
```bash
for i in $(seq 0 3);do
  echo $((i * 2))
done | head -n 2
# => 0
# => 2
```



## コマンドを作った
- コマンドの作成過程は次回の記事で
- 今回の実装もつらみがたくさんあった
- でもがんばった分シェルスクリプトが好きになれた気がする
- あと、上記の記述は全部初心者理解なのであしからず
- [UNIX & Linux コマンド・シェルスクリプト リファレンス](http://shellscript.sunone.me/)
- 時間あるときにここ読んでいこう
- 気が向いたら書籍も買いたい

