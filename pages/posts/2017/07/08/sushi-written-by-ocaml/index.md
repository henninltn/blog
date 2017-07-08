---
title: OCamlでsushiった話
date: 2017-07-08T12:20:00+09:00
path: /2017/07/08/sushi-written-by-ocaml/
tags: ML, OCaml
description: OCamlで回転sushi書いた。
---


OCamlの[チュートリアル進めてたの](http://localhost:8000/2017/07/04/ocaml-tutorial-1/)が一段落したので何かしら作りたくなった。

で、以前書いた回転sushiが楽しかったのでOCamlでも書いてみた。



## 取り敢えず完成品
![回転sushi](sushi.gif)
- ターミナルでsushiの文字が回転するだけのプログラム
- 以下ソースコード全文
```
type pos_type = Top | Bottom | Left | Right

module PosMap = Map.Make(
  struct
    type t = int * int
    let compare (x0,y0) (x1,y1) =
    match Pervasives.compare x0 x1 with
      0 -> Pervasives.compare y0 y1
    | c -> c
  end
)

let default_belt = [ "+--------------------------------------+";
                     "|                                      |";
                     "| +----------------------------------+ |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| +----------------------------------+ |";
                     "|                                      |";
                     "+--------------------------------------+" ]

let where (r, c) =
  if r = 1 && 1 <= c && c < 38 then Top
  else if r = 9 && 1 < c && c <= 38 then Bottom
  else if c = 1 && 1 < r && r <= 9 then Left
  else if c = 38 && 1 <= r && r < 9 then Right
  else failwith "not on the belt"

let next (r, c) =
  match where (r, c) with
  | Top    -> (r, c + 1)
  | Bottom -> (r, c - 1)
  | Left   -> (r - 1, c)
  | Right  -> (r + 1, c)

let convey m =
  PosMap.fold (fun pos ch m -> m |> PosMap.add (next pos) ch)
              m
              PosMap.empty

let sort_by_row m =
  List.mapi (fun i _ -> PosMap.filter (fun (r, _) _ -> r = i) m)
            default_belt

let build_belt m =
  let l = sort_by_row m in
  default_belt |> List.mapi (fun r s -> s |> String.mapi (fun c ch ->
    let pos = (r, c)
    and m = List.nth l r in
    if PosMap.mem pos m then PosMap.find pos m else ch))

let print_belt belt =
  belt |> List.iter print_endline

let () =
  let rec loop m =
    let m = convey m
    and b = build_belt m in
    Unix.sleepf 0.05;
    Sys.command "clear";
    print_belt b;
    loop m in
  loop (PosMap.empty |> PosMap.add (1, 1) 's'
                     |> PosMap.add (1, 2) 'u'
                     |> PosMap.add (1, 3) 's'
                     |> PosMap.add (1, 4) 'h'
                     |> PosMap.add (1, 5) 'i')

```



## 実装方針
- ```sushi```の流れる向きについて、```sushi```が時計回りで運ばれるとき
  - 上のレーンの一番右以外 -> 右
  - 右のレーンの一番下以外 -> 下
  - 下のレーンの一番左以外 -> 左
  - 左のレーンの一番上以外 -> 上
- と流れる 
- これを元に実装していく
- あと今回度々出てくる```|>```だけどかなり便利
- 左の式の結果を右の関数に渡してるだけ
- だから```Lisp.map```とか```List.filter```とか最後の引数に```'a list```がくる



## ```sushi```の文字1つ1つの流れる向きの定義
```
type pos_type = Top | Bottom | Left | Right

let default_belt = [ "+--------------------------------------+";
                     "|                                      |";
                     "| +----------------------------------+ |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| +----------------------------------+ |";
                     "|                                      |";
                     "+--------------------------------------+" ]

let where (r, c) =
  if r = 1 && 1 <= c && c < 38 then Top
  else if r = 9 && 1 < c && c <= 38 then Bottom
  else if c = 1 && 1 < r && r <= 9 then Left
  else if c = 38 && 1 <= r && r < 9 then Right
  else failwith "not on the belt"

let next (r, c) =
  match where (r, c) with
  | Top    -> (r, c + 1)
  | Bottom -> (r, c - 1)
  | Left   -> (r - 1, c)
  | Right  -> (r + 1, c)
```
- 実装方針で説明したものをそのまま実装しただけ
- ```where```、```next```はどちらも行と列のタプルを受け取る
- ```where```の中の数字は```default_belt```での位置



## ```sushi```の文字1つ1つの位置管理
```
module PosMap = Map.Make(
  struct
    type t = int * int
    let compare (x0,y0) (x1,y1) =
    match Pervasives.compare x0 x1 with
      0 -> Pervasives.compare y0 y1
    | c -> c
  end
)

let default_belt = [ "+--------------------------------------+";
                     "|                                      |";
                     "| +----------------------------------+ |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| |                                  | |";
                     "| +----------------------------------+ |";
                     "|                                      |";
                     "+--------------------------------------+" ]

let convey m =
  PosMap.fold (fun pos ch m -> m |> PosMap.add (next pos) ch)
              m
              PosMap.empty
```
- 文字の位置はタプル```int * int```をキー、文字```char```を値としたマップ```PosMap```で表現
- ようは位置から文字への写像
- キーのデータ構造はファンクタに投げる
- 返ってきたモジュールで定義された型と関数は全て多相なので、キーについては生成する時とかに```char```型を指定すればいい
- ```belt```は回転sushiのレーンで、後に説明する```buit_belt```でこれに```sushi```を配置する
- ```convey```は```PosMap```受け取ってさっきの```next```使って新しい```PosMap```作ってるだけ
- ```PosMap.map```で作ろうとするとキーが固定になるので```fold```で作ってる



## レーンの生成
```
let sort_by_row m =
  List.mapi (fun i _ -> PosMap.filter (fun (r, _) _ -> r = i) m)
            default_belt

let build_belt m =
  let l = sort_by_row m in
  default_belt |> List.mapi (fun r s -> s |> String.mapi (fun c ch ->
    let pos = (r, c)
    and m = List.nth l r in
    if PosMap.mem pos m then PosMap.find pos m else ch))

let print_belt belt =
  belt |> List.iter print_endline
```
- ```build_belt```は引数の```PosMap```と```default_belt```を使って、```default_belt```に```sushi```を配置したものを作る
- それの補助として```sort_by_row```を使う
- 実現したい処理としては
  - ```default_belt```の行を```List.map```で回して```sushi```を配置していく
    - ```default_belt```のある1行を取得
    - ```PosMap```をその行数で```PosMap.filter```フィルタリング
    - ```PosMap```を```PosMap.map```で回して、その1行の文字を置換していく
- という感じ
- しかしこれだと```PosMap```を毎回フィルタリングしてて非効率な気がするので、```sort_by_row```で先に行数でフィルタリングしたもののリストを生成しておく
- で、最後に```print_belt```で出来上がったレーンを表示



## メインの処理
```
let () =
  let rec loop m =
    let m = convey m
    and b = build_belt m in
    Unix.sleepf 0.05;
    Sys.command "clear";
    print_belt b;
    loop m in
  loop (PosMap.empty |> PosMap.add (1, 1) 's'
                     |> PosMap.add (1, 2) 'u'
                     |> PosMap.add (1, 3) 's'
                     |> PosMap.add (1, 4) 'h'
                     |> PosMap.add (1, 5) 'i')

```
- OCamlの習慣として```;;```の使用を避けるため、トップに直接処理を書かないで```let () =```の中に書くらしい
- ```loop```は```sushi```を移動させては表示する関数
  - 新しい```PosMap```(変数```m```)の作成
  - レーンの生成
  - ちょっと待つ
  - ターミナルの表示をクリア
  - レーンの表示
- これを再帰的に繰り返す
- 最後に```loop```に```sushi```の最初の位置を表す```PosMap```を渡す




## まとめ的な
- 邪魔な```()```を省ける```|>```超便利、積極的に使ってこう
- ファンクタとか実際に触ってから理解できたみたいなところあるので実際に書いてみるの大事
- 一応純粋な関数と副作用のある関数を分けたけど、OCamlの書き方としてこんな感じでいいのかはあんまり分からない
- 回転sushi、新しい言語を試してみるのになかなか良さげ

