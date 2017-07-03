---
title: OCamlチュートリアルを進めた話
date: 2017-02-19T21:20:00+09:00
path: /2017/06/28/ocaml-tutorial-1/
tags: VCS, Git
description: 公式サイトでOCamlの勉強を始めた。
---


[最新コンパイラ構成技法](http://www.cs.princeton.edu/~appel/modern/ml/)を読むためにMLの勉強。

本ではSMLだけどOCamlやる。

[OCamlチュートリアル - OCaml](https://ocaml.org/learn/tutorials/index.ja.html)を進めてく。

内容は上のサイトそのまんまです。あくまで備忘録。



## はじめの一歩

###  コメント
```ml
(* コメント *)
(*
  (* ネスト出来る *)
*)
```


### 型
- 基本の型
```
int      31bitまたは63bit
float    IEEE倍精度浮動小数点数
bool     trueとfalse
char     8bit文字
string
unit     ()
```
- ```int```は1bitをガベージコレクションに使う(```nativeint```は32bitまたは64bit)
- ```char```ではUnicode、UTF対応してないので[comprehensive Unicode libraries](http://camomile.sourceforge.net/)を使う、らしい
- 暗黙の型変換は存在しない、必ず明示的に```int_of_float```(int to float)などの関数を使う
- ```float_of_int```関数はよく使うので別名として```float```が用意されている
- 小数の演算には```+.```、```-.```、```*.```、```/.```などを使う


### 関数
- 関数呼び出しはHaskell風
- 関数定義は```let```いるけどHaskellと同じ感じ
- 再帰関数の定義は```let rec```を使う
- 関数はカリー化される
- 関数の型は```f : arg1 -> arg2 -> ... -> argn -> rettype```と表示される
- 多相関数ある
- 多相関数の型は```f : 'a -> arg2 -> rettype```みたいに、多相な型がアポストロフィ+文字になる
- もちろん型推論ある




## OCamlプログラムの構造

### 束縛と変数
- ローカル変数は```let name = expression in```、```;;```までがコードブロック(スコープ?)
- ちなみに```let```から```;;```までが1つの式、```in```のあと改行してもインデントしない
- まあ本当は変数じゃなくてただの式、代入とかできないし
- グローバル変数も変数じゃなくてただの式
- ```let```使うのをlet束縛をする、というらしい
- 変数(つまり参照)は```ref```使う
- ```ref 0```みたいに参照を使えるけど、普通は```let name = ref expression```みたいに名前を付ける
- 代入は```name := expression```
- 変数の中身取り出すのは```!```を使う


### モジュール
- OCamlではライブラリとかをモジュールで表現する
- 例えばGraphicsモジュールをインストールすると以下のファイルがインストールされる
```
/usr/lib/ocaml/graphics.a
/usr/lib/ocaml/graphics.cma
/usr/lib/ocaml/graphics.cmi
/usr/lib/ocaml/graphics.cmx
/usr/lib/ocaml/graphics.cmxa
/usr/lib/ocaml/graphics.cmxs
/usr/lib/ocaml/graphics.mli
```
- ディレクトリはUnixの場合
- ファイル名は全てスモールケースで、モジュール名はファイル名の先頭を大文字にしたもの
- ```open Modulename;;```でモジュールで定義された全ての名前を読み込む
- まあ普通は```module M = Modulename```みたいにエイリアス掛ける
- Pervasivesモジュールだけはデフォルトで読み込まれてる
- ```.mli```ファイルでモジュールの定義をするっぽいけどきっと後の方で説明あるでしょ


### ```;```と```;;```の使いどころのコツ
- 意外と(?)使うべきところ、使うべきでないところが分かりにくいらしい
- ルール1: トップレベルの文を区切るときは```;;```、関数定義の中や他の文のときはいらない
  - 以下例
```
Random.self_init ();;
Graphics.open_graph " 640x480";;

let rec iterate r x_init i =
  if i = 1 then x_init
  else
    let x = iterate r x_init (i-1) in
    r *. x *. (1.0 -. x);;
```
- ルール2: 次の場合は```;;```を削ってもいい。別に削らなくてもいい。
  - ```let```の前
  - ```open```の前
  - ```type```の前
  - ファイルの最後
  - OCamlが次に新しい文の始まりがくることや今の文が続かないと推測できるとき。まああんまりないらしいけど。
  - 以下例 
```
open Random                   (* ;; *)
open Graphics;;

self_init ();;
open_graph " 640x480"         (* ;; *)

let rec iterate r x_init i =
  if i = 1 then x_init
  else
    let x = iterate r x_init (i-1) in
    r *. x *. (1.0 -. x);;

for x = 0 to 639 do
  let r = 4.0 *. (float_of_int x) /. 640.0 in
  for i = 0 to 39 do
    let x_init = Random.float 1.0 in
    let x_final = iterate r x_init 500 in
    let y = int_of_float (x_final *. 480.) in
    Graphics.plot x y
  done
done;;

read_line ()                  (* ;; *)
```
- ルール3: ```let ... in```は文と思って、後ろに```;```は置かない
- ルール4: コードブロック内にある他の全ての文は```;```を付ける、最後はいらない
  - さっきの例の内側の```for```がいい例らしい
  - この例では唯一```Graphics.plot x y```のあとだけ```;```が使える、いらなけど。
```
for i = 0 to 39 do
  let x_init = Random.float 1.0 in
  let x_final = iterate r x_init 500 in
  let y = int_of_float (x_final *. 480.) in
  Graphics.plot x y
done
```
- ```;```の型は```unit -> 'b -> 'b```で、２番目の返り値を返す、らしい
- ってかOCamlは```if```も```for```も```let```も式なら、何を文と読んでるの？それとも文も全部式なの？便宜上文って言葉使ってるだけ？


### 実例
```
(* First snippet *)
open StdLabels
open GMain

let file_dialog ~title ~callback ?filename () =
  let sel =
    GWindow.file_selection ~title ~modal:true ?filename () in
  sel#cancel_button#connect#clicked ~callback:sel#destroy;
  sel#ok_button#connect#clicked ~callback:do_ok;
  sel#show ()
```
- 例その1。
- ```#```はメソッド呼び出し
```
(* Second snippet *)
let window = GWindow.window ~width:500 ~height:300 ~title:"editor" ()
let vbox = GPack.vbox ~packing:window#add ()

let menubar = GMenu.menu_bar ~packing:vbox#pack ()
let factory = new GMenu.factory menubar
let accel_group = factory#accel_group
let file_menu = factory#add_submenu "File"
let edit_menu = factory#add_submenu "Edit"

let hbox = GPack.hbox ~packing:vbox#add ()
let editor = new editor ~packing:hbox#add ()
let scrollbar = GRange.scrollbar `VERTICAL ~packing:hbox#pack ()
```
- 例その2。
- ```;```の削り方とか見どころらしい
```
(* Third snippet *)
open GdkKeysyms

let () =
  window#connect#destroy ~callback:Main.quit;
  let factory = new GMenu.factory file_menu ~accel_group in
  factory#add_item "Open..." ~key:_O ~callback:editor#open_file;
  factory#add_item "Save" ~key:_S ~callback:editor#save_file;
  factory#add_item "Save as..." ~callback:editor#save_dialog;
  factory#add_separator ();
  factory#add_item "Quit" ~key:_Q ~callback:window#destroy;
  let factory = new GMenu.factory edit_menu ~accel_group in
  factory#add_item "Copy" ~key:_C ~callback:editor#text#copy_clipboard;
  factory#add_item "Cut" ~key:_X ~callback:editor#text#cut_clipboard;
  factory#add_item "Paste" ~key:_V ~callback:editor#text#paste_clipboard;
  factory#add_separator ();
  factory#add_check_item "Word wrap" ~active:false
    ~callback:editor#text#set_word_wrap;
  factory#add_check_item "Read only" ~active:false
    ~callback:(fun b -> editor#text#set_editable (not b));
  window#add_accel_group accel_group;
  editor#text#event#connect#button_press
    ~callback:(fun ev ->
      let button = GdkEvent.Button.button ev in
      if button = 3 then begin
        file_menu#popup ~button ~time:(GdkEvent.Button.time ev); true
      end else false);
  editor#text#set_vadjustment scrollbar#adjustment;
  window#show ();
  Main.main ()
```
- 例その3。
- え、上の例に```let _ = expression```とかないんですけど...
- まあ返り値捨てて計算だけして、副作用起こすためのものっていうのは見れば分かる
- あとは何行ってるかあんまり分かんなかったけどじっくり読み解くのだるいので飛ばすよ...

