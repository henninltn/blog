---
title: Python3でマルバツゲームを作った話 (その１)
date: 2017-01-30T02:00:00+09:00
path: /2017/01/27/created-tic-tac-toe-in-python3-1/
tags: Python3 
description: Python3のライブラリを色々と調べた。ついでにユニットテストも入門してみた。
---

長くなったのでその１。

うちのサークルの会長さんがPythonの課題でマルバツゲーム作ってたんですよ。

それがね、めっちゃ面白そうだったんですよ。

というわけで作ってみました。

Python楽しいっすね。



## マルバツゲームをなつかしんでみた
- 小学校の頃はよくやった
- 4本の線引いて、じゃんけんして勝った方からマル書いていって
- あれ何が面白かったんだろう..
- 3×3マス
- 先攻がマル、後攻がバツ
- vsコンピューター(最強)
- やる気残ってればvs人
- 今回はこんな感じでいく



## 型を定義した
- Python3.5からType Hintsが入ったらしい
- [26.1. typing — 型ヒントのサポート &#8212; Python 3.5.2 ドキュメント](http://docs.python.jp/3/library/typing.html)
- とうわけでがちがちに型書いてみた
- もうそれPythonで書く意味なくねとか言わない
```python
from enum import Enum
from typing import Dict, List, NamedTuple, NewType


# Types
Player = Enum('Player', 'first second')

Pos = NamedTuple('Pos', [('row', int), ('line', int)])
State = Enum('State', 'empty circle cross')
Board = NewType('Board', Dict[Pos, State])

Move = Pos
Moves = NewType('Moves', List[Move])

GameTree = NamedTuple('GameTree',
                      [('board', Board), ('player', Player), ('moves', Moves)])

Rating = Enum('Rating', 'win, none, single duoble triple')
Ratings = NewType('Ratings', Dict[Pos, Rating])
```
- [8.13. enum — 列挙型のサポート &#8212; Python 3.5.2 ドキュメント](http://docs.python.jp/3/library/enum.html)
- ```Enum```は```class Player(Enum):```みたいな感じで継承してフィールド書いてく感じでも書ける
- 今回は```Enum('型名', 'フィールド列挙(スペース区切り)')```っていうAPI使った
- ```Foo = Bar```は型```Foo```を```Bar```と全く同一のものとして扱う
- ```Foo = NewType('Foo', Bar)```は```Foo```を```Bar```のサブタイプとして扱う
- 詳しくは上のドキュメントの26.1.2、『NewType』
- ```NamedTuple```はそのまんま名前付きのタプル
- 同じく上のドキュメントの26.1.7、『クラス、関数、およびデコレータ』を参照
- ```Player```は先攻か後攻か
- ```Pos```は位置で、二次元ベクトルで表す(```(0, 0)``` ~ ```(2, 2)```)
- ```State```は空白、マル、バツの３種類
- ```Move```はただの```Pos```のエイリアス
- ```GameTree```はボードの状態と現在のプレーヤー、そしてそのプレーヤーの可能な手を表す
- ```GameTree```を中心に処理を組み立てていく
- まあ書いてる途中で変更していくかも



## 実装方針を決めた
- [http://landoflisp.com/](http://landoflisp.com/)
- ほとんどLand of Lispのダイス・オブ・ドゥームのパクリです
```python
def accessible_moves(board: Board) -> Moves:


def handle_human(tree: GameTree) -> GameTree:


def handle_computer(tree) -> GameTree:


def game_tree(tree: GameTree, player: Player) -> GameTree:


def play_vs_computer(tree, player) -> None:
    # print_tree(tree)
    # cond winner
    # if   play_vs_computer(handle_human(tree))
    # else play_vs_computer(handle_computer(tree))
```
- ```accessible_moves```は可能な手(つまり空いているマス)のリストを返す
- ```handle-human```、```handle_computer```はそれぞれプレーヤー、コンピューターに手を選ばせる関数
- ```game_tree```の中で```accessible_moves```が呼び出され、ボードの状態、現在のプレーヤー、可能な手の情報を含む```GameTree```が返される
- ```play_vs_computer```からプログラムが始まる
- ```play_vs_human```とかも後で作れそう
- 基本的には```play_vs_human```と```handle_human```、```handle_computer```が副作用を請け負う設計
- 他の関数はできるだけ純粋に
- 大体はこのくらいだけど、適宜必要な関数を足していく



## hundle_humanまで実装を進めてみた
- まずは```handle_human```を実装するのに必要な実装から行っていく
```python
from copy import deepcopy
from enum import Enum
from itertools import repeat
from sys import stdin
from typing import Dict, List, NamedTuple, NewType


# Types
'''
省略
'''


def next(player: Player) -> Player:
    if player is Player.first:
        return Player.second
    elif player is Player.second:
        return Player.first
    else:
        raise Exception('the function \'next\' excepts the type Player')


def print_moves(moves: Moves) -> None:
    for (i, move) in zip(range(len(moves)), moves):
        print('%d -> (%d, %d)' % (i, move.row, move.line))


def accessible_moves(board: Board) -> Moves:
    return Moves(sorted([pos for (pos, state) in deepcopy(board).items() if state is State.empty]))


def init_board() -> Board:
    return Board({pos: state for (pos, state) in zip(sum([[Pos(i, j) for i in range(3)] for j in range(3)], []),
                                                     repeat(State.empty, 9))})


def init_game_tree() -> GameTree:
    board = init_board()
    return GameTree(board, Player.first, sorted(board.keys()))


def game_tree(tree: GameTree, move: Move) -> GameTree:
    nxt_board = deepcopy(tree.board)
    nxt_board[deepcopy(move)] = State.circle if tree.player == Player.first else State.cross

    nxt_player = next(tree.player)
    nxt_moves = accessible_moves(nxt_board)

    return GameTree(nxt_board, nxt_player, nxt_moves)


def handle_human(tree: GameTree) -> GameTree:
    print('chose your move:')
    print_moves(tree.moves)
    while True:
        try:
            choice = int(stdin.readline())
            if choice not in range(len(tree.moves)):
                raise Exception()
        except:
            print('\ninvalid input!!\nplease choice number 1 ~ ' + str(len(tree.moves)) + '.\n\n')
            continue
        break
        return game_tree(tree, tree.moves[choice])
```
- はい、いっぱい関数増えました
- ```next```は次のプレーヤーを返すだけ
- ```print_moves```は型```Move```のリスト```Moves```を受取り、それを順に表示する
- ```Moves```はソートされてる前提
- インデックスを取得するために```zip```と```range```を使った
- ```for```は変数宣言のとこでパターンマッチが使える便利
- ```accessible_moves```はボードの状態から可能な手(つまり空きマスの位置)のリストを返す
- Pythonは引数がオブジェクトだと参照になっているみたいなので一応```board```を```deepcopy```しておく
- ```init_board```は初期状態の３×３マスのボードを返す
- ```Pos```は```(0, 0)``` ~ ```(2, 2)```、```State```は```State.empty```
- ```init_game_tree```は初期状態のボード、```Player.first```、初期状態での可能な手(つまり全てのマスの位置)のリストをもった```GameTree```を返す
- ```game_tree```は中心となる処理で、前の```GameTree```と選択した手を受取り次の```GameTree```を返す
- ```handle_human```は主に副作用を請け負う関数
- 可能な手と割り振られたインデックスを全て表示し、標準入力からそのインデックスを受け取る
- 入力が不正な場合繰り返し入力待ち状態に入る
- 入力された手と引数から次の```GameTree```を求めて返す



## ユニットテストも書いてみた
- Pythonのunittestでユニットテスト入門
- [Pythonでテスト 連載(2) ユニットテストの書き方 | UNITED アドテクブログ](http://adtech-blog.united.jp/archives/173)
```python
import unittest
import tictactoe
import sys
from io import StringIO
from unittest.mock import patch


class TestTictactoe(unittest.TestCase):
    captor = None

    def setUp(self):
        self.captor = StringIO()
        sys.stdout = self.captor
        sys.stdin = StringIO()

    def tearDown(self):
        sys.stdout = sys.__stdout__
        sys.stdin = sys.__stdin__

    def test_next(self):
        self.assertEqual(tictactoe.next(tictactoe.Player.first), tictactoe.Player.second)
        self.assertEqual(tictactoe.next(tictactoe.Player.second), tictactoe.Player.first)

    def test_print_moves(self):
        move1 = tictactoe.Move(0, 0)
        move2 = tictactoe.Move(0, 1)
        move3 = tictactoe.Move(0, 2)
        moves = tictactoe.Moves([move1, move2, move3])
        tictactoe.print_moves(moves)
        self.assertEqual(self.captor.getvalue(), '0 -> (0, 0)\n1 -> (0, 1)\n2 -> (0, 2)\n')

    def test_accessible_moves(self):
        board = tictactoe.Board({
        tictactoe.Pos(0, 0): tictactoe.State.empty,
        tictactoe.Pos(0, 1): tictactoe.State.empty,
        tictactotictactoe2): tictactotictactoeircle})
        self.assertEqual(sorted(tictactoe.accessible_moves(board)),
                         [tictactoe.Pos(0, 0), tictactoe.Pos(0, 1)])

    def test_init_board(self):
        board = tictactoe.Board({})
        for row in range(3):
            for line in range(3):
                board[tictactoe.Pos(row, line)] = tictactoe.State.empty
        self.assertEqual(tictactoe.init_board(), board)

    def test_init_game_tree(self):
        board = tictactoe.init_board()
        player = tictactoe.Player.first
        moves = tictactoe.accessible_moves(board)
        self.assertEqual(tictactoe.init_game_tree(), tictactoe.GameTree(board, player, moves))

    def test_game_tree(self):
        tree = tictactoe.init_game_tree()
        move = tictactoe.Move(0, 2)
        nxt_tree = tictactoe.game_tree(tree, move)

        tpl_board = tree.board.items()
        tpl_nxt_board = nxt_tree.board.items()
        self.assertEqual(list(filter(lambda tuple: tuple not in tpl_board, tpl_nxt_board)),
                         [(move, tictactoe.State.circle)])
        self.assertEqual(tictactoe.next(tree.player), nxt_tree.player)
        self.assertEqual(list(filter(lambda tuple: tuple not in nxt_tree.moves, tree.moves)), [move])

    @patch.object(sys.stdin, 'readline', lambda: 3)
    def test_handle_human(self):
        tree = tictactoe.init_game_tree()
        move = tree.moves[3]
        nxt_tree = tictactoe.game_tree(tree, move)
        self.assertEqual(tictactoe.handle_human(tree), nxt_tree)

    @patch.object(sys.stdin, 'readline', lambda: 0)
    def test_handle_human(self):
        tree = tictactoe.init_game_tree()
        move = tree.moves[0]
        nxt_tree = tictactoe.game_tree(tree, move)
        self.assertEqual(tictactoe.handle_human(tree), nxt_tree)

    @patch.object(sys.stdin, 'readline', lambda: 8)
    def test_handle_human(self):
        tree = tictactoe.init_game_tree()
        move = tree.moves[8]
        nxt_tree = tictactoe.game_tree(tree, move)
        self.assertEqual(tictactoe.handle_human(tree), nxt_tree)


if __name__ == "__main__":
    unittest.main()
```
- ```unittest.TestCase```を継承したクラスを作るのが基本
- メソッド１つ１つがテストケースになる
- 基本的には```self.assertEqual```で関数の返り値のチェックを行う
- ```assertTupleEqual```とか```assertTrue```とか他にも色々なメソッドがある
- ```setUp```、```tearDrop```はそれぞれ全てのテストケースが実行される前と後に実行される
- ```unittest.main()```でテスト開始
- 標準出力のテストどうするのという素朴な疑問
- [Python の unittest で標準出力に表示される内容のテストをする - Qiita](http://qiita.com/utgwkk/items/2a5d0d75a36949e1dddc)
- ```io.StringIO```でストリーム作成して、標準出力先をそこに設定しといて後で取り出すって感じみたい
- 標準入力のテストは、入力の受取に```sys.stdin.readline```を使って、```unittest.mock.object(sys.stdin, 'readline', lambda: 3)```でモックを作った
- モックというのは外部コンポーネント(つまりインポートした関数やオブジェクトなど)の代わりのこと
- その外部コンポーネントが完成していないときなどに便利



## handle_computerまで実装を進めた
- ここからは次回で
