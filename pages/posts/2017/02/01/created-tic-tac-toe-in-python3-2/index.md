---
title: Python3でマルバツゲームを作った話 (その２)
date: 2017-02-01T23:50:00+09:00
path: /2017/02/01/created-tic-tac-toe-in-python3-2/
tags: Python3 
description: ジェネレータとか触った。
---


その２。

前回は```handle_human```まで実装を進めた。



## handle_computerまで実装を進めた
- コンピュータは人間と違い入力がないので、手を決めるためにはどの手が最善かというレーティングが必要になる
- レーティングのためにリーチや勝利を判定する関数も必要
- まずはリーチ及び勝利判定関数から実装する、つもりだったけど..
```python
'''
省略
'''

# Rating = Enum('Rating', 'none single double checked win')
# Ratings = NewType('BoardRatings', Dict[Pos, Rating])
Ratings = NewType('BoardRatings', Dict[Pos, int])

'''
省略
'''

def get_ratings(tree: GameTree, pos: Pos) -> Ratings:
    tpl_board = tree.board.items()
    rows = [[(pos, state) for (pos, state) in tpl_board if pos.row == i] for i in range(3)]
    columns = [[(pos, state) for (pos, state) in tpl_board if pos.column == i] for i in range(3)]
    rising = [(pos, state) for (pos, state) in tpl_board if pos.row + pos.column == 2]
    falling = [state for (pos, state) in tpl_board if pos.row == pos.column]

    all_lines = [line for line in rows + columns + [rising, falling]
                 if State.empty in [state for (pos, state) in line]]

    state = State.circle if tree.player == Player.second else State.cross
    ratings = init_ratings()

   for line in all_lines:
       # 条件分岐でレーティング

       return ratings
```
- 先に言うけどこのコード動作確認できてない、途中で諦めたから
- ```Ratings```の定義変えた
- リーチ判定するのに１つのマスごとやってると非効率な気がしたので縦、横、斜めのラインを切り出した
- その中からまだ```empty```のマスがあるラインだけ持ってくる
- ここからレーティングしていこうと思ったんだけど..
- レーティングのアルゴリズム考える必要がある
- パターン紙に書いて必死に考えた..
- そして気付いてしまう、「あれこれ全パターン計算すればよくね？」
- 重かったら重かったで遅延させるなりジェネレータにするなりすればいい
- というわけで、まずは全パターンを計算する関数を書く


### 全パターンの計算
- 再帰且つ遅延でやろうとした
```python
# next_boardを追加して、ちょっと書き換えた
def init_board() -> Board:
    return Board({pos: state for (pos, state) in zip(sum([[Pos(i, j) for i in range(3)] for j in range(3)], []),
                                                     repeat(State.empty, 9))})


def next_board(board: Board, move: Move, player: Player) -> Board:
    nxt_board = deepcopy(board)
    nxt_board[deepcopy(move)] = State.circle if player is Player.first else State.cross
    return nxt_board


def init_game_tree() -> GameTree:
    board = init_board()
    return GameTree(board, Player.first, sorted(board.keys()))


def next_game_tree(tree: GameTree, move: Move) -> GameTree:
    nxt_board = next_board(tree.board, move, tree.player)

    nxt_player = next(tree.player)
    nxt_moves = accessible_moves(nxt_board)

    return GameTree(nxt_board, nxt_player, nxt_moves)


# 以下のコードは誤り
def moves_gen():
    def _moves_gen(tree: GameTree):
        return {move: lambda: _moves_gen(next_game_tree(tree, move)) for move in tree.moves}\
            if len(tree.moves) != 0 else None
    return _moves_gen(init_game_tree())
```
- これじゃだめなんだよなあ
- 動かすと分かる
```python
# 動きが分かりやすいようちょっと改変
def moves_gen():
    def _moves_gen(tree: GameTree):
        return {move: lambda: move for move in tree.moves}\
            if len(tree.moves) != 0 else None
    return _moves_gen(init_game_tree())

moves = moves_gen()
print(moves[Move(0, 0)]())  # => Pos(2, 2)
print(moves[Move(0, 1)]())  # => Pos(2, 2)
print(moves[Move(2, 1)]())  # => Pos(2, 2)
```
- これ、```lamda: move```はクロージャなんで、引数以外の変数の評価は実行時の環境ではなく定義時の環境で行われる
- つまり、定義時の環境が保存されて、```lambda: move```内の変数はその環境で評価される
- かつ、```lambda: move```の実行時には、その環境に保存されたリスト内包表記のカウンタ```move```は```tree.moves```の最後の値になってる
- つまり、```lambda: move```の```move```は全部```Pos(2, 2)```になってる
- 処理を追いながらまとめると、
  - ```lambda: move```は引数以外の変数```move```を参照するのでクロージャとなる
  - ```lambda: move```はクロージャなのでその定義時の環境を保存する
  - 保存された環境の中には変数```move```がある
  - 内包表記のループが終わった時点で、保存された環境の```move```の値は```tree.moves```の最後の値である```Pos(2, 2)```となっている
  - ```lambda: move```が実行されるとき、保存された環境の変数```move```の値はすでに```Pos(2, 2)```となっている
- そりゃあ全部```Pos(2, 2)```が返るわけだよ..
- こんな初歩的なことに気づくのにめちゃくちゃ時間かかった
- あとクロージャの説明ってめっちゃ難しい
- これはあれだ、Pythonで無理に再帰とか遅延とか使おうとした罰だ..
- というわけで、こういうときのためにちゃんと用意されたジェネレータを使う
- 言語に即した書き方って大切だ..
- あと、そもそも```Moves```だけ取得できても意味なくね？```Board```も返すべきかも
- [ジェネレータの使い方 - Qiita](http://qiita.com/Kodaira_/items/32b1ef860f59df80eedb)
```python
def _init_game_tree_gen(tree: GameTree):
    while True:
        move = yield tree
        tree = next_game_tree(tree, move) if move is not None else tree


def init_game_tree_gen(tree: GameTree):
    tree_gen = _init_game_tree_gen(tree)
    tree_gen.__next__()
    return tree_gen
```
- 作ってから「俺は何がしたかったんだ」ってなりました
- まずジェネレータの書き方は合ってるけど使い方間違ってる
- しかもPython相互再帰できない、Land of Lispの再現は無理そう
- Type Hints使った再帰的な型も定義できない、クラスで書くしかなさそう
- クラスのフィールドに型ヒント付けられないっぽい..



## 飽きた
- 飽きました、もう辛いので途中でやめる
- たまにじゃないけどこんなこともある



## 成果っぽいものをまとめてみた
- ユニットテストにチャレンジできた
- ジェネレータにもチャレンジできた
- クロージャの初歩的な罠に引っかかった
- Python普通に楽しかった

