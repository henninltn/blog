---
title: OCamlチュートリアルを進めた話(その２)
date: 2017-07-05T13:40:00+09:00
path: /2017/07/05/ocaml-tutorial-2/
tags: ML, OCaml
description: モジュールの話。
---


[最新コンパイラ構成技法](http://www.cs.princeton.edu/~appel/modern/ml/)を読むためにMLの勉強。

本ではSMLだけどOCamlやる。

[OCamlチュートリアル - OCaml](https://ocaml.org/learn/tutorials/index.ja.html)を進めてく。

内容は上のサイトそのまんまです。あくまで備忘録。

今回は[モジュール](https://ocaml.org/learn/tutorials/modules.ja.html)を進めてく(たぶん以降は1ページ1記事スタイル)。



## モジュール
- モジュールはファイルシステムに似てて、サブモジュールとか作れる
- つまり、モジュールは関数、型、サブモジュールなどを提供する
- ```amodule.ml```は自動的に```Amodule```モジュールとして定義される
- コンパイルはファイルごとに行ったあとリンク(?)する
```
ocamlopt -c amodule.ml
ocamlopt -c bmodule.ml
ocamlopt -o hello amodule.cmx bmodule.cmx
```
- どうでもいいが```;;```はさけられる傾向にあるらしい
```
open Amodule;;
hello ();;
```
- が
```
open Amodule
let () =
  hello ()
```
- と書かれる
- あともういっこ例がありました
```
open Printf
let my_data = [ "a"; "beautiful"; "day" ]
let () = List.iter (fun s -> printf "%s\n") my_data;;
```
- ラムダ式```fun arg1 arg2 ... argn -> expression```なんすね



## インターフェースとシグネチャ
- ```.mli```ファイルを使ってモジュールインターフェース(シグネチャ)を定義する
- 例えば、```hello.ml```で
```
let message = "Hello"
let hello () = print_endline message
```
- で、```hello.mli```で
```
val hello : unit -> unit
(** Displays a greeting message. *)
```
- みたいな。
- ```.mli```ファイルのドキュメントは[ocamldoc](http://caml.inria.fr/pub/docs/manual-ocaml/ocamldoc.html)がサポートしてるフォーマットで書くといいらしい
 


## 抽象型
- ```type date = { day : int; month : int; year : int }```を```.mli```ファイルに書き出す方法は4つ
  - 1. そもそもシグネチャに書かない
  - 2. 型定義をそのままコピペ
  - 3. 型を抽象化して名前だけ与える: ```type date```
  - 4. レコードを読み出し専用にする: ```type date = private { ... }```
- 3.、4.のときはフィールドに直接アクセスできないので
- 例があるよ！
```
type date
val create : ?days:int -> ?months:int -> ?years:int -> unit -> date
val sub : date -> date -> date
val years : date -> float
```
- 何書いてるか分からないけどね。
- まず```?days:int```が分からないし、レコード作成して返す関数なら素直に```int -> int -> int -> date```ってなるんじゃね？って思った
- あれか、型エイリアスとかか？```month```は```int```だけど```1 ~ 12```だからみたいな。
- まああとで分かるでしょ。飛ばそ。



## サブモジュール
- 以下```example.ml```
```
module Hello = struct
  let message = "Hello"
  let hello () = print_endline message
end
let goodbye () = print_endline "Goodbye"
let hello_goodbye () =
  Hello.hello ();
  goodbye ()
```
- 以下別ファイルからのアクセス
```
let () =
  Example.Hello.hello ();
  Example.goodbye ()
```
- 以上。
- サブモジュールのインターフェースの制限にはモジュール型を使う
```
module Hello : sig
 val hello : unit -> unit
end = 
struct
  let message = "Hello"
  let hello () = print_endline message
end
       
(* これで、Hello.message はどこからもアクセスできない *)
let goodbye () = print_endline "Goodbye"
let hello_goodbye () =
  Hello.hello ();
  goodbye ()
```
- 一緒くたに書いたけど、普通分けて書くらしい
```
module type Hello_type = sig
 val hello : unit -> unit
end
   
module Hello : Hello_type = struct
  ...
end
```
- 名前付きモジュール型である```Hello_type```を定義してからサブモジュール定義に利用してる形
- なんかこのあとのファンクタで役立つらしいよ



## ファンクタ
- 取り敢えず既存のファンクタの使い方見る
```
module Int_set = Set.Make (struct
                             type t = int
                             let compare = compare
                           end);;
```
```
module String_set = Set.Make (String);;
```
- ジェネリクスとかテンプレートみたいなもん？
- まあ返ってくんのはモジュールだけど
- モジュールがJavaとかC++でいうクラスの役割もしてるんだしまあ当然っちゃ当然
- つまりファンクタは受け取った型に応じたモジュールを返すもの？
```
module F (X : X_type) = struct
 ...
end
 ```
- と型を引数に取って定義すること以外モジュールと同じ
```
module F (X : X_type) : Y_type =
struct
  ...
end
```
- とシグネチャを付けてインターフェースを制限することもできる
- ```.mli```ファイルに```module F (X : X_type) : Y_type```を書き込む方法でもいい
- 標準ライブラリの```set.ml```とか```map.ml```とかがいい例らしい



## 既存モジュールの拡張
```
module List = struct
  include List
  let rec optmap f = function
    | [] -> []
    | hd :: tl ->
       match f hd with
       | None -> optmap f tl
       | Some x -> x :: optmap f tl
end;;
```
- 特に言うこともない
- 他のモジュールからインポートする際は、そのまま読み込めば標準のListモジュールをオーバーライドできる

