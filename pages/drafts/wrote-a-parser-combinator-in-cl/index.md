---
title: Common Lispでパーサコンビネータを書いた話
date: 2017-02-03T01:40:00+09:00
path: /2017/02/03/wrote-a-parser-combinator-in-cl/
tags: Lisp, CommonLisp
description: プロジェクトやモジュールについても調べながらパーサコンビネータのライブラリを作った。
---


何となくCommon Lispで何か書きたくなった。

一度実装に挑戦したことがある字句解析をやりたい。

ライブラリから作る。



## プロジェクトの作り方を調べた
- 標準の機能としてはパッケージ(名前空間的なもの)と、ファイルの読み込みに関する```require```、```provide```がある


### パッケージ
```
* (in-package :common-lisp-user)
#<PACKAGE "COMMON-LISP-USER">

* (defvar *hoge* "hoge")
*HOGE*

* *hoge*
"hoge"

* (defpackage :foobar
    (:nicknames :foo :bar)
    (:use cl))
#<PACKAGE "FOOBAR">

* (in-package :foo)
#<PACKAGE "FOOBAR">

* (defvar *hoge* "hogehoge")


```
- Common Lispでは宣言したシンボルは現在のパッケージに属する
- パッケージはデフォルトでは```common-lisp-user```
- パッケージの切り替えは```in-package```


## Common Lispのモジュールシステムについて調べた
- まずはプロジェクトの作り方を知るため、モジュールシステムについて調べる
- [require, ASDF, quicklispを正しく使う | κeenのHappy Hacκing Blog](http://keens.github.io/blog/2014/11/30/quicklisp/)


### Common Lisp標準の機能
- ```require```と```provide```
- ```(require 'filename)```でファイルを読み込む
- ```(provide 'filename)```はセーフガード
- ただ```require```がどこのファイルを読みに行くかが実装依存なので普通使わない


### ASDF 3
- CLのデファクトスタンダードっぽい
- Another System Definition Facility
- 現在は3系、2系とは結構違うらしい
- ```.asd```ファイルでシステムを定義、それを```require```する
```cl
;; project-template.asd

(in-package :cl-user)
(defpackage project-template-asd
  (:use :cl :asdf))
(in-package :project-template-asd)

(defsystem project-template
  :version "0.1"
  :licence "MIT"
  :description ""
  :author "hennin <hennin.ltn@gmail.com>"
  :depends-on (:alexandria)
  :components ((:module "src"
                :serial t
                :components
                  ((:file "package")
                   (:file "main" :depends-on ("package"))))))
  :long-description
  #.(with-open-file 
    (when stream
      (let ((seq (make-array (file-length stream)
                                          :element-type 'character
                                          :fill-pointer t)))
        (setf (fill-pointer seq) (read-sequence seq stream))
        seq))))
```
- [clack/clack.asd at master · fukamachi/clack](https://github.com/fukamachi/clack/blob/master/clack.asd)
- システム用のパッケージ```project-template-asd```は別に作らなくてもいい
- 複数システムを定義するのにシステムごとのパッケージ作ってる？
- 一回```cl-user```パッケージに入ってるのも同じような理由っぽい
- ```long-description```はプロジェクトルートの```README.md```の中身を読みに行く
- ```depends-on```は依存パッケージで、このシステムを実行する環境にあらかじめパスを通しておく必要のあるもの(たぶん)
- ```components```はプロジェクトのファイルとかディレクトリの関係を記述してるっぽい
- ```:module```でディレクトリ、```:file```、```static-file```でファイルを指定
- ファイル名は拡張子```.lisp```を除いたもの
- ```:file```は```:depends-on```キーワードで先に読み込んでコンパイルするべきファイルをリストで指定できる
- 
