---
title: OCamlチュートリアルを進めた話(その４)
date: 2017-07-07T12:00:00+09:00
path: /2017/07/07/ocaml-tutorial-4/
tags: ML, OCaml
description: Maps、Sets、Hash Tablesについて。
---


[最新コンパイラ構成技法](http://www.cs.princeton.edu/~appel/modern/ml/)を読むためにMLの勉強。

本ではSMLだけどOCamlやる。

[OCamlチュートリアル - OCaml](https://ocaml.org/learn/tutorials/index.ja.html)を進めてく。

内容は上のサイトそのまんまです。あくまで備忘録。

今回は[データ型とパターンマッチング](https://ocaml.org/learn/tutorials/data_types_and_matching.ja.html)の1ページのみ。



## 連結リスト、タプル
```
[1; 2; 3]
1 :: [2; 3] 
1 :: 2 :: 3 :: []
```
- Lispでおなじみな感じ
- 型は```'a list```みたいになる
- ```(3, "hello", x)```で型は```int * string * char```
- タプルは数学的に言うと関係になる?



## レコード、ヴァリアント
```
type pair_of_ints = { a : int; b : int }

let p = { a=; b=5 }
```
- レコード
- ```{a=3}```はエラー、レコードのフィールドを未定義のままにはできない
```
type foo =
  | Nothing
  | Int of int
  | Pair of int * int
  | String of string

type sign = Positive | Zero | Negative
```
```
Nothing
Int 3
Pair (4, 5)
String "hello"
```
- これがヴァリアント?らしい
- 見ている限り```|```を使ってるレコードをヴァリアントと呼ぶっぽい
- レコードとヴァリアントと合わせてHaskellのレコードと同じような使い勝手
```
type binary_tree =
  | Leaf of int
  | Tree of binary_tree * binary_tree;;
```
```
Leaf 3
Tree (Leaf 3, Leaf 4)
Tree (Tree (Leaf 3, Leaf 4), Leaf 5)
```
- 再帰ヴァリアントというらしい
```
type 'a binary_tree =
  | Leaf of 'a
  | Tree of 'a binary_tree * 'a binary_tree
```
```
Leaf "hello"
Leaf 3.0
```
- 多相ヴァリアント(パラメータ付きヴァリアント)というらしい
```
type 'a equiv_list =
  | Nil
  | Cons of 'a * 'a equiv_list

Nil
Cons(1, Nil)
Cons(1, Cons(2, Nil))
```
- リストの定義の一例



## パターンマッチング
```
type expr =
    | Plus of expr * expr
    | Minus of expr * expr
    | Times of expr * expr
    | Divide of expr * expr
    | Value of string

let rec to_string e =
  match e with
  | Plus (left, right) ->
     "(" ^ to_string left ^ " + " ^ to_string right ^ ")"
  | Minus (left, right) ->
     "(" ^ to_string left ^ " - " ^ to_string right ^ ")"
  | Times (left, right) ->
     "(" ^ to_string left ^ " * " ^ to_string right ^ ")"
  | Divide (left, right) ->
     "(" ^ to_string left ^ " / " ^ to_string right ^ ")"
  | Value v -> v;;
```
- 式の定義と文字列化関数の実装
- Haskellでも思ったけどパターンマッチング便利すぎる
```
let rec multiply_out e =
  match e with
  | Times (e1, Plus (e2, e3)) ->
    Plus (Times (multiply_out e1, multiply_out e2),
    Times (multiply_out e1, multiply_out e3))
  | Times (Plus (e1, e2), e3) ->
    Plus (Times (multiply_out e1, multiply_out e3),
    Times (multiply_out e2, multiply_out e3))
  | Plus (left, right) ->
    Plus (multiply_out left, multiply_out right)
  | Minus (left, right) ->
    Minus (multiply_out left, multiply_out right)
  | Times (left, right) ->
    Times (multiply_out left, multiply_out right)
  | Divide (left, right) ->
    Divide (multiply_out left, multiply_out right)
  | Value v -> Value v
```
- 式の展開の実装
```
let rec factorize e =
  match e with
  | Plus (Times (e1, e2), Times (e3, e4)) when e1 = e3 ->
          Times (factorize e1, Plus (factorize e2,factorize  e4))
  | Plus (Times (e1, e2), Times (e3, e4)) when e2 = e4 ->
          Times (Plus (factorize e1, factorize e3), factorize e4)
  | e -> e
```
- 式の因数分解の実装
- ```when```の部分をガードという
```
match value with
| pattern  [ when condition ] ->  result
| pattern  [ when condition ] ->  result
```
- というわけでパターンマッチングの一般形
- ちなみにコンパイル時に全てのパターンが網羅されているかチェックが入る

