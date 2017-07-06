---
title: OCamlチュートリアルを進めた話(その３)
date: 2017-07-07T01:40:00+09:00
path: /2017/07/07/ocaml-tutorial-3/
tags: ML, OCaml
description: Maps、Sets、Hash Tablesについて。
---


[最新コンパイラ構成技法](http://www.cs.princeton.edu/~appel/modern/ml/)を読むためにMLの勉強。

本ではSMLだけどOCamlやる。

[OCamlチュートリアル - OCaml](https://ocaml.org/learn/tutorials/index.ja.html)を進めてく。

内容は上のサイトそのまんまです。あくまで備忘録。

前回1ページ1記事で進めていくと言ったな。あれは嘘だ。

臨機応変って大切だよね。



## [Maps](https://ocaml.org/learn/tutorials/map.ja.html)
```
module MyUsers = Map.Make(String)

let m = MyUsers.empty
let m = MyUsers.add "fred" "sugarplums" m
let m = MyUsers.add "tom"  "ilovelucy"  m

let print_users key password =
    print_string(key ^ " " ^ password ^ "\n")

MyUsers.iter print_users m

MyUsers.find "fred" m
```
- 特に言うことなし。
- あえて言うなら文字列の結合関数```^```なんすね
- シグネチャは以下
```
module MyUsers :
  sig
    type key = String.t
    type 'a t = 'a Map.Make(String).t
    val empty : 'a t
    val is_empty : 'a t -> bool
    val mem : key -> 'a t -> bool
    val add : key -> 'a -> 'a t -> 'a t
    val singleton : key -> 'a -> 'a t
    val remove : key -> 'a t -> 'a t
    val merge :
      (key -> 'a option -> 'b option -> 'c option) -> 'a t -> 'b t -> 'c t
    val compare : ('a -> 'a -> int) -> 'a t -> 'a t -> int
    val equal : ('a -> 'a -> bool) -> 'a t -> 'a t -> bool
    val iter : (key -> 'a -> unit) -> 'a t -> unit
    val fold : (key -> 'a -> 'b -> 'b) -> 'a t -> 'b -> 'b
    val for_all : (key -> 'a -> bool) -> 'a t -> bool
    val exists : (key -> 'a -> bool) -> 'a t -> bool
    val filter : (key -> 'a -> bool) -> 'a t -> 'a t
    val partition : (key -> 'a -> bool) -> 'a t -> 'a t * 'a t
    val cardinal : 'a t -> int
    val bindings : 'a t -> (key * 'a) list
    val min_binding : 'a t -> key * 'a
    val max_binding : 'a t -> key * 'a
    val choose : 'a t -> key * 'a
    val split : key -> 'a t -> 'a t * 'a option * 'a t
    val find : key -> 'a t -> 'a
    val map : ('a -> 'b) -> 'a t -> 'b t
    val mapi : (key -> 'a -> 'b) -> 'a t -> 'b t
end
```



## [Sets](https://ocaml.org/learn/tutorials/set.ja.html)
```
module SS = Set.Make(String)

let s = SS.empty
let s = SS.singleton "hello"

let s =
  List.fold_right SS.add ["hello"; "world"; "community"; "manager";
                          "stuff"; "blue"; "green"] s

let s2 = SS.filter (fun str -> String.length str <= 5) s

let () =
  SS.iter print_endline s;
  SS.iter print_endline s2;

  SS.mem "hello" s2

  SS.iter print_endline (SS.diff s s2)
```
- こちらも特に言うことなし
- 以下シグネチャ
```
module SS :
  sig
    type elt = String.t
    type t = Set.Make(String).t
    val empty : t
    val is_empty : t -> bool
    val mem : elt -> t -> bool
    val add : elt -> t -> t
    val singleton : elt -> t
    val remove : elt -> t -> t
    val union : t -> t -> t
    val inter : t -> t -> t
    val diff : t -> t -> t
    val compare : t -> t -> int
    val equal : t -> t -> bool
    val subset : t -> t -> bool
    val iter : (elt -> unit) -> t -> unit
    val fold : (elt -> 'a -> 'a) -> t -> 'a -> 'a
    val for_all : (elt -> bool) -> t -> bool
    val exists : (elt -> bool) -> t -> bool
    val filter : (elt -> bool) -> t -> t
    val partition : (elt -> bool) -> t -> t * t
    val cardinal : t -> int
    val elements : t -> elt list
    val min_elt : t -> elt
    val max_elt : t -> elt
    val choose : t -> elt
    val split : elt -> t -> t * bool * t
    val find : elt -> t -> elt
    val of_list : elt list -> t
end
```



## [Hash Tables](https://ocaml.org/learn/tutorials/hashtbl.ja.html)
```
let my_hash = Hashtbl.create 123456

let _ =
  Hashtbl.add my_hash "h" "hello";
  Hashtbl.add my_hash "h" "hi";
  Hashtbl.add my_hash "h" "hug";
  Hashtbl.add my_hash "h" "hard";
  Hashtbl.add my_hash "w" "wimp";
  Hashtbl.add my_hash "w" "world";
  Hashtbl.add my_hash "w" "wine";

  Hashtbl.find my_hash "h"
  Hashtbl.find_all my_hash "h"
  Hashtbl.mem my_hash "h"
```
- まずこいつはファンクタじゃないみたい
- ```Hashtbl.create```にはサイズを指定
- まあもし足りなくなれば自動で確保してくれるそう
- [Maps](https://ocaml.org/learn/tutorials/map.ja.html)、[Sets](https://ocaml.org/learn/tutorials/set.ja.html)と違って純粋な感じじゃない
- ```Hashtbl.find```、```Hashtbl.find_all```は指定文字列から始まる要素を検索する
- ```Hashtbl.mem```はキーが存在すれば```true```、存在しなければ```false```を返す



## [標準コンテナの比較](https://ocaml.org/learn/tutorials/comparison_of_standard_containers.ja.html)
- データ構造の性能比較だけど覚えてられないので必要になったら調べるくらいでよくね？
- というわけで飛ばす。

