---
title: 純粋関数型Common Lispをつくった話
date: 2017-02-10T21:20:00+09:00
path: /2017/02/10/created-purely-functional-cl/
tags: CommonLisp
description: 関数型での副作用の扱いについて。
---


[純粋関数型JavaScriptのつくりかた - Qiita](http://qiita.com/hiruberuto/items/810ecdff0c1674d1a74e)

この記事前に読んだことあったんだけど、もう一度読んでみた。

前回はさっぱり理解できなかったけど、今読んでみると結構理解できた。



## 取り敢えず書いてみた
```lisp
(in-package :cl-user)


; Core libraries
(defvar pure (lambda (a) (lambda () a)))

(defvar bind (lambda (m) (lambda (f) (lambda () (funcall (funcall f (funcall m)))))))

(defvar exec (lambda (m) (funcall m)))

; Helper funtion
(defvar wrap (lambda (f) (lambda (a) (lambda () (funcall f a)))))

(defparameter main (lambda ()))

(defun run-pure-cl ()
  (funcall exec main))
```
- [上のリンク先](http://qiita.com/hiruberuto/items/810ecdff0c1674d1a74e)の通り、```pure```、```bind```、```exec```を定義、これがCommon Lispを純粋関数型言語として実行するためのライブラリ
- ```pure```は値を包んでモナド作る関数
- ```bind```は普通の関数をモナドに適用するための関数
- モナドと関数受け取って、モナドから取り出した値に関数を適用して、その結果をまたモナドに包んで返す
- ```exec```はたった一度だけ副作用を起こすための関数
- 完全に副作用がない＝外部との接点がない、つまりプログラムがただのブラックボックスになる
- というわけで純粋関数型言語にも副作用を起こす仕組みは必要
- ```exec```は必要、でもライブラリとしては使っちゃだめ
- ユーザが気にしないところで実行されるべき
- と思ったけどどうすればいいか分からないので、```run-pure-cl```関数で包んで、この関数を最後に実行するってことにしといた
- ```exec```によって変数```main```にバインドされたラムダ式が実行される
- ちなみに```defparameter```は再宣言すると値を上書きする、```defvar```はしない
- ```wrap```はあれば便利くらいのヘルパー関数で、副作用を起こす関数をラップしてアクションにするための関数
- 取り敢えず関数でラップすることで、それをアクションということにしてるみたい
- Common LispはLisp-2なので、関数の名前空間と変数の名前空間が別々に存在し、```defun```で定義した関数と変数にバインドした関数とでは呼び出し方が異なるので注意が必要
- ```(funcall foo args...)```で変数としてバインドされた関数を取り出せる
- 変数としてバインドされた関数というのは、```defvar```や```defparameter```などで変数にバインドされたラムダ式のこと
- ```(defvar foo (lambda (args) ...))```みたいな
- ```(funcall (function foo) args ...)```は普通の関数呼び出し```(foo args)```と同じ
- ```function```は```#'```でもいい
- 変数の```quote```と```'```の関係に似てる



## 使ってみた
- 先程のライブラリを使って純粋関数型Common Lispをやる
```lisp
; define actions
(defvar put (funcall wrap #'print))

(defvar get-line (funcall wrap #'read-line))

(defparameter main (funcall (funcall bind (funcall get-line *standard-input*)) (lambda (x) (funcall put x))))

; execute
(run-pure-cl)
```
- ```wrap```を使って、入出力関数をラップしてアクションにする
- まあやってることはただただラムダ式で包むだけ
- そして```main```にラムダ式(アクション)をセットする
- ```run-pure-cl```によってそのアクションが実行されるまで副作用のある関数は実行されず、ラムダ式に包まれたり、また取り出されたりしてるだけなので、参照透明が守られている
- ```run-pure-cl```の中で```exec```が```main```にバインドされたアクションを実行した瞬間、他の副作用のある関数もアクションから芋づる式に取り出されて実行されていく
- なので```main```以前の処理は、処理を進めているというよりは処理を組み立てている感じ
- そして組み立てられた処理(アクション)が```main```にバインドされる
- 純粋な関数からアクションは呼び出せないので、必然的に処理の始まりはアクションになる
- その頂点となるアクションが```main```
- あと```wrap```の仕様として必ず関数と値を渡す必要がある
- ```get-line```作るときに「read-line引数ないからいいか」とか思って```(funcall get-line)```として痛い目見た
- しかもこれ、```get-line```の呼び出し時に起こるエラーだけど原因は```get-line```定義時の```wrap```の中で発生するので、めっちゃ混乱した
- 関数の実行、遅延させてるからね..
- というわけで省略可能な第一引数に標準入力のストリーム渡しといた



## まとめた
- 純粋関数型の言語での副作用の扱い方の１つであるアクションについての理解が深まった
- 副作用のある関数自体を値として受け渡しする分には参照透明保てるよ、みたいな
- あと処理(アクション)を組み立てて```main```にバインドし、最後に組み立てた処理(アクション)を実行していくというイメージを持てたのもよかったかも
- あとちょっとだけど久々にCommon Lisp書けて楽しかった
- 以下ソースコード全文
```lisp
(in-package :cl-user)


; Core libraries
(defvar pure (lambda (a) (lambda () a)))

(defvar bind (lambda (m) (lambda (f) (lambda () (funcall (funcall f (funcall m)))))))

(defvar exec (lambda (m) (funcall m)))

; Helper funtion
(defvar wrap (lambda (f) (lambda (a) (lambda () (funcall f a)))))

(defparameter main (lambda ()))

(defun run-pure-cl ()
  (funcall exec main))


; usage

; define actions
(defvar put (funcall wrap #'print))

(defvar get-line (funcall wrap #'read-line))

(defparameter main (funcall (funcall bind (funcall get-line *standard-input*)) (lambda (x) (funcall put x))))

; execute
(run-pure-cl)
```

