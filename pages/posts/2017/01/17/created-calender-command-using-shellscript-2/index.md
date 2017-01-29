---
title: シェルスクリプトでcalenderコマンドを作った話 (その２)
date: 2017-01-17T01:40:00+09:00
path: /2017/01/17/created-calender-command-using-shellscript-2/
tags: ShellScript
description: シェルスクリプトでコマンドを作成した過程。
---

前回はcalenderコマンド作ってるときに調べた内容をまとめた。

今回はその作成過程を書いてく。

様々なつらみがあった..


## calenderコマンドを作った
- まずは結果から

![カレンダー](00-result.png)
- あるだろうとは思ってたけど```cal```コマンドの存在を後で知った
- まあシェルスクリプトの練習なので別にいいことにしとく



## dateコマンドのBSD系とGNU系での違いにはまった
- めっちゃ時間取られたマジふざけんな
- まあ自業自得


### オプションの違いについて
- よくわからないけどGNU系とかBSD系とか色々あるらしい
- POSIXの仕様にない実装があるからっぽい？
- だからPOSIX原理主義者とかいるのかな..
- [FreeBSDとLinuxでの、dateコマンドの日付を指定したepoch扱い · GitHub](https://gist.github.com/ozuma/7961472)
- 曜日を取得したかったので```+%w```
- ちなみにフォーマット指定は```+```から始まって```%Y```とか```%m```とか使える
- GNU系 ```date -d "2017-01-15" "+%w" ```
- BSD系 ```date -j -f "%Y-%m-%d" "2017-01-15" "+%w"```
- 日付設定しない```-j```オプションと、日付フォーマット指定の```-f```オプション


### OSの判定について
- [シェルスクリプトでOSを判別する - Qiita](http://qiita.com/UmedaTakefumi/items/fe02d17264de6c78443d)
- ~~ここによると判定には```$(uname)```が使えるそうな~~
- ```uname```ってコマンドだった
- OSごとにdateを書き換えた
- ~~ここで関数を使いたかったが、上記のように関数って使いにくそう~~
- ~~文字列でゆく~~
- あとから思えば全然関数で良かった気もする
```bash
if [ "$(uname)" == "Darwin" ]; then
  strdate="date -j -f "'"%Y-%m-%d" '
else
  strdate="date -d "
fi

date='"2017-01-15"'
echo `$strdate$date "+%Y-%m-%d"`
```



## calenderコマンドの仕様を考えた
- 仕様のまとめ方未だに分からない
- なので適当に書く
```
$ calender
# => 今月のカレンダー
$ calender <year>
# => 指定年のカレンダー
$ calender <year> <month>
# => 指定月のカレンダー
$ calender <year> <month> <day>
# => 指定付きのカレンダー、日付をハイライト
```
- 曜日表示させたい
- あとそれぞれのカレンダーの上に何月かも表示させたい



## とりあえずカレンダーの原型作った
```bash
#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
  strdate="date -j -f "'"%Y-%m-%d" '
else
  strdate="date -d "
fi

year="$1"
month="$2"
date="$3"

if [ "$year" = "" ]; then       # $ calender
  date='"'`date "+%Y-%m-%d"`'"'
  year=`$strdate$date "+%Y"`
  month=`$strdate$date "+%m"`
  date=`$strdate$date "+%d"`
  from=$month
  to=$month
elif [ "$month" = "" ]; then     # $ calender <year>
  from=1
  to=12
elif [ "$date" = "" ]; then      # $ calender <year> <month>
  from=$month
  to=$month
fi

# 何月か
seq $from $to | while read month; do
  firstdate='"'"$year-$month-01"'"'
  firstday=`$strdate$firstdate "+%w"`
  # 第何週か
  seq 0 4 | while read n; do
    offset=$((n * 7 - firstday))
    echo $(seq $((1 + offset)) $((7 + offset)));
  done
done

```
- 何回も動作確認しながら作った
- ~~そのとき調べたことをまとめたのが上に書いたやつ~~
- 前の記事に書いたやつです、切り分けたので

![カレンダー](01-prototype.png)
- ずれてるので桁そろえたい



## 桁をそろえた
- ```seq```のオプションで桁そろえられるらしい
```bash
# 第何週か
seq 0 4 | while read n; do
  offset=$((n * 7 - firstday))
  echo $(seq -f %02g $((1 + offset)) $((7 + offset)));
done
```
- これは後で気付いたけど、0埋めすると計算に使ったとき8進数と解釈されてエラー吐く
- ```value too great for base error token is 08```みたいなエラー
- まあ取り敢えず進む

![カレンダー](02-padding.png)



## 色を付けようとしてechoの罠にはまった
- さっきのdateと同じでPOSIXから外れた拡張実装の違いではまったよ
- 2度あったことなので3度目ありそう
- 次からオプションとかでエラー出たらPOSIX標準か独自拡張かちゃんと調べよ..


### echoでの色付けについて
- [シェル - echoで文字に色をつける その1 - Miuran Business Systems ](http://www.m-bsys.com/linux/echo-color-1)
```bash
hoge=hoge
echo -e "\e[31m${hoge}\e[m"
# => -e "\e[31m${hoge}\e[m"
```
- ファッツ
- なんでオプションごと```echo```されとんねん
- ```/bin/echo```って指定するといけるよって言ってるサイトもあったけど
- 散々調べた結果、BSD系の```echo```に```-e```なんていうオプションはないことが判明
- [CentOS7とOS X Mavericksのechoコマンドの違いについて - はらへり日記](http://sota1235.hatenablog.com/entry/2015/08/07/235824)
- ここにたどり着いた
- まあよくわからないけど、```printf```で同じことできるしGNU系とBSD系で動作も同じらしい
- そして```printf```を使うことになったのでした..
```bash
COLOR_OFF="\033[0m"
COLOR_RED="\033[31m"
COLOR_BLUE="\033[34m"
COLOR_WHITE="\033[37m"

seq $from $to | while read month; do
  firstdate='"'"$year-$month-01"'"'
  firstday=`$strdate$firstdate "+%w"`
  seq 0 4 | while read n; do
    offset=$((n * 7 - firstday))
    echo $(seq $((1 + offset)) $((7 + offset)) | while read date; do
      day=$((date - offset))
      if [ "$day" = 1 ]; then
        printf "$COLOR_RED";
      elif [ "$day" = 7 ]; then
        printf "$COLOR_BLUE";
      else
        printf "$COLOR_WHITE";
      fi
       printf %2d $date;
       printf "$COLOR_OFF\n";
    done);
  done
done

```
- 文字色を土曜日は青色に、日曜日は赤色にした
- ついでに0埋めを空白埋めにした

![カレンダー](03-coloring.png)



## 曜日を表示させた
```bash
seq $from $to | while read month; do
  firstdate='"'"$year-$month-01"'"'
  firstday=`$strdate$firstdate +%w`
  days=$(seq 1 7 | while read i; do
    date='"'"$year-$month-$((i - firstday + 7))"'"'
    echo `$strdate$date +%a`;
  done)
  echo $days
  seq 0 4 | while read n; do
    offset=$((n * 7 - firstday))
    echo $(seq $((1 + offset)) $((7 + offset)) | while read date; do
      day=$((date - offset))
      if [ "$day" = 1 ]; then
        printf "$COLOR_RED";
      elif [ "$day" = 7 ]; then
        printf "$COLOR_BLUE";
      else
        printf "$COLOR_WHITE";
      fi
       printf %2d $date;
       printf "$COLOR_OFF\n";
    done);
  done
  echo ""
done
```
- まあ、曜日のシーケンス作って表示しただけ
- 特に書くこともない
- あとで曜日も日付と同じに色付けしたい

![カレンダー](04-days.png)



## マイナスとか31日超えた日付をどうにかした
- 今マイナスの日付とか、32日とかある
- 僕の夏休みかよ..
- dateコマンドでなんとか過不足の日付を先月、来月の日付にできないだろうか..
- ついでに文字色も灰色とかにしときたいよね


### dateの使い方について
- 過不足の日付をどうにかするため、基準日から足し引きしたい
```bash
# GNU系
date -d "2017-01-15 +15days" +%Y-%m-%d
# => 2017-01-29

date -d "2017-01-15 +20days" +%Y-%m-%d
# => 2017-02-04

date -d "2017-01-15" -14days" +%Y-%m-%do
# => 2017-01-01

date -d "2017-01-15" -15days" +%Y-%m-%do
# => 2016-12-31

date -d "2017-01-15" -20days" +%Y-%m-%do
# => 2016-12-26
```
- いやー完璧ですね、これはいける
```bash
# BSD系
date -j -v-20d -f %Y-%m-%d "2017-01-15" +%Y-%m-%d
# => 2016-12-26

date -j -v+20d -f %Y-%m-%d "2017-01-15" +%Y-%m-%d
# => 2017-02-04
```
- これは勝った、もう```mydate```関数自作まったなし
- mydate関数作るのに結構つまづいたから次の章にいく


### mydate関数について
#### 仕様
- ```date```が使いづらいので関数つくる
- 共通化もしたい
```
$ mydate
2017-01-15
$ mydate 2017-01-01
2017-01-01
$ mydate 2017-01-15 20
2017-02-04
$ mydate 2017-01-15 -20
2016-12-26
```

#### 引数
- 引数のチェックやった
- 第１引数```$1```が```$date```、第２引数```$2```が```$days```
```bash
#!/bin/bash
set -eu

mydate() {
  local readonly f=%Y-%m-%d
  local readonly ifD=`[ "$(uname)" = "Darwin" ]`
  local opts=`$ifD && echo "-j -f $f"` || echo "-d"
  set +eu
  date $opts "$1" >/dev/null 2>&1
  local date=`[ $? != 0 ] && echo $(date +$f) || echo $1`
  expr 1 + "$2" >/dev/null 2>&1
  local days=`[ $? -ge 2 ] && echo 0 || echo $2`
  set -eu

  echo $date
  echo $days
}
```
- [シェルスクリプトで変数が数値かどうかチェック - 計算物理屋の研究備忘録](http://keisanbutsuriya.hateblo.jp/entry/2015/01/18/192435)
- [シェルスクリプト数字判定 - eTuts+ Server Tutorial](http://server.etutsplus.com/sh-is-numric/)
- ```set +eu```でオプションを一時的に解除
- ```set -e```があると未定義で```$n```を使った時にエラーが出る
- 今回は未定義でもコマンドが実行できなければ困るので解除
- ```$ calender```とか
- ```set -u```があるとエラーが出たとき処理を中断する
- 今回はわざとエラーを吐かせて引数のチェックを行っているので解除
- ```date $opts "$1" >/dev/null 2>&2```について
- どんな処理でも```/dev/null```にリダイレクトするとエラーを握りつぶせる
- これを利用して、```$?```で返り値を取得し、処理の成否で引数が正しいか判定する
- ```date```に`第１引数を渡すことで、正しい形式か判定する
- ```date```は成功したときは0、失敗したときは1を返す
- ```expr```は算術演算(```$(())```と同じ)、これで数値かどうか判定する
- 具体的には計算を行ってエラーが出たなら数値ではな、出なければ数値
- 今回の場合```$(())```を使うと何故かエラーが出た
- あと```expr```は引数の式中の演算子の両端にスペース入れないとおかしな動きした
- ```expr "$2"+1```ってすると2が返るべきなのに0が返ってくる
- ```expr "$2" + 1```ってスペース入れるとちゃんと2が返るのに..
- ```expr```は答えが0以外のとき1、0のとき1、そもそも計算に失敗したとき2または3を返す
- ```"$2" + 1```ってすると、```$2```が未定義か空文字列のとき```+ 1```ってなってエラーが出てくれないので、```1 + "$2"```とした
- 今思えば```""```で囲まなければ自動的にエラー吐いてくれるのでそれで良かったのでは..?
- まあ面倒なので確かめません
- ここにたどり着くまでめっちゃ時間かかった..
- ここからいよいよ```date```コマンドを組み立てる

#### dateコマンドの組み立て
- どうでもいいけど今15日から16日になった
```bash
mydate() {
  local readonly f=%Y-%m-%d
  local readonly ifD=`[ "$(uname)" = "Darwin" ]`
  local opts=`$ifD && echo "-j -f $f"` || echo "-d"
  set +eu
  date $opts "$1" >/dev/null 2>&1
  local date=`[ $? != 0 ] && echo $(date +$f) || echo $1`
  expr 1 + "$2">/dev/null 2>&1
  local days=`[ $? -ge 2 ] && echo 0 || echo $2`
  set -eu

  local days=`[ 0 -le $days ] && echo +$days || echo $days`
  local opts=`$ifD && echo "-j -v${days}d -f $f $date +$f" || echo "-d $date${days}days +$f"`
  echo `date $opts`
}

mydate
# => 2017-01-16

mydate 2017-01-01
# => 2017-01-01

mydate 2017------
# => 2017-01-16

mydate 2017-01-16 20
# => 2017-02-05

mydate 2017------ -20
# => 2016-12-27

mydate "" 20
# => 2017-02-05

mydate 2017-01-16 +20
# => 2017-01-16
```
- いい感じ
- でも最後のだけおしいな..
- ```mydate 2017-01-16 +20```みたいに```+```ついてても動いてほしい
- そういえばフォーマットの指定を失念していたぜ
- 第三引数でフォーマットを指定できるようにする
```bash
mydate() {
  local readonly inf=%Y-%m-%d
  local readonly ifD=`[ "$(uname)" = "Darwin" ]`
  local opts=`$ifD && echo "-j -f $inf"` || echo "-d"
  set +eu
  date $opts $1>/dev/null 2>&1
  local date=`[ $? != 0 ] && echo $(date +$inf) || echo $1`
  expr 1 + $2>/dev/null 2>&1
  local days=`[ $? -ge 2 ] && echo 0 || echo $2`
  date $opts $date +$3>/dev/null 2>&1
  local outf=`[[ $? != 0 || $3 = "" ]] && echo $inf || echo $3`
  set -eu

  echo 'outf: '$outf

  local days=`[ 0 -le $days ] && echo +$days || echo $days`
  local opts=`$ifD && echo "-j -v${days}d -f $inf $date +$outf" || echo "-d $date${days}days +$outf"`
  echo `date $opts`
}

mydate 2017-01-16 0 %w
# => 0

mydate 2017-01-16 0 %y
# => 17
```
- さっきと同じように引数をチェック
- ```f```を```inf```(input format)と```outf```(output format)に分けた
- ```[ $? != 0 -o $3 = "" ]```ってするとなぜか```[: too many arguments```と言われた
- ので```[[ ]]```と```||```使った
- この関数を使うんだけど、他のとこも大幅に書き直したので次の章にいく



## いっきに書き換えた
- シーケンス周りをリファクタリング
- 曜日も色付けした
- さっき作った```mydate```関数使っておかしな日付をもどした
```bash
#!/bin/bash
set -eu

mydate() {
  local readonly inf=%Y-%m-%d
  local readonly ifD=`[ "$(uname)" = "Darwin" ]`
  local opts=`$ifD && echo "-j -f $inf"` || echo "-d"
  set +eu
  date $opts $1>/dev/null 2>&1
  local date=`[ $? != 0 ] && echo $(date +$inf) || echo $1`
  expr 1 + $2>/dev/null 2>&1
  local days=`[ $? -ge 2 ] && echo 0 || echo $2`
  date $opts $date +$3>/dev/null 2>&1
  local outf=`[[ $? != 0 || $3 = "" ]] && echo $inf || echo $3`
  set -eu

  local days=`[ 0 -le $days ] && echo +$days || echo $days`
  local opts=`$ifD && echo "-j -v${days}d -f $inf $date +$outf" || echo "-d $date${days}days +$outf"`
  echo `date $opts`
}

# 定数
readonly OFF="\033[0m"
readonly RED="\033[31m"
readonly BLUE="\033[34m"
readonly WHITE="\033[37m"
readonly now=`date +%Y-%m-%d`

# 引数チェック
set +u;
y="$1"
m="$2"
d="$3"
set -u
if [ "$y" = "" ]; then
  y=${now:0:4}
  m=${now:5:2}
  d=${now:8:2}
  from=$m;to=$m
elif [ "$m" = "" ]; then from=1;to=12
else from=$m;to=$m
fi

# カレンダー本体
seq $from $to|while read month;do
  day1=`mydate $y-$m-01 0 %w`
  seq 0 5|while read n;do echo $(seq 1 7|while read d;do
    if [ $d = 1 ];then
      printf "$RED";
    elif [ $d = 7 ];then
      printf "$BLUE";
    else
      printf "$WHITE";
    fi
    [ $n = 0 ] && echo `mydate $y-$m-$(($d-day1+7)) 0 %a` ||
      printf "%2d\n" `mydate $y-$m-00 $((d+(n-1)*7-day1)) %e` # $((d+(n-1)*7-day1))
    printf "$OFF";
  done);done
done

```
- ```date```に```%e```とかいう便利なフォーマットがあった
- ```%d```は日にちを01~31で表示するけど、```%e```は 1~31(スペース含む2桁)で表示する
- めっちゃリファクタしたらめっちゃシンプルになった
- やっぱりリスト(シーケンス)処理って気持ちいい

![カレンダー](05-refactoring.png)



## 何月か表示させた
```bash
echo "      "`mydate $y-$m-01 0 %B%Y`
```
- これはさんだ



## その月以外の日付の色を変えようとして結局非表示にした
- その月以外の日付を灰色とか目立たない色にしたい
- Black、Red、Green、Yellow、Blue、Magenta、Cyan、Whiteしかない
- 無理ぽよ..
- もう非表示でいいかな
- 今このコマンドめっちゃ重いし、非表示にするなら不正な日付を```mydate```で戻さなくていいし軽くなるかも
```bash
seq $from $to|while read m;do
  day1=`mydate $y-$m-01 0 %w`
  lastd=`mydate $y-$((m%12+1))-00 0 %d`
  echo "      "`mydate $y-$m-01 0 %B%Y`
  seq 0 6|while read n;do echo "$(seq 1 7|while read day;do
    d=$((day+(n-1)*7-day1))
    if [ $day = 1 ];  then printf $RED
    elif [ $day = 7 ];then printf $BLUE
    else                   printf $WHITE; fi
    if [ $n = 0 ];then
      printf "%s " `mydate $y-$m-$(($day-day1+7)) 0 %a`
    elif [ 0 -lt $d -a $d -le $lastd ]; then
      printf "%2d " $d
    else
      printf "   "
    fi
    printf $OFF;
  done)";done
  echo
done
```
- どうせ不正な日付は非表示にするので```mydate```を使わないようにした
- 月初めの曜日と最終日の算出、何月かの表示には```mydate```を使っている
- ```[ 0 -lt $d -a $d -le $lastd ]```で不正な日付を判定
- あと空白が無視されたので、この行の入れ子のシーケンスを```""```でかこった
```bash
seq 0 6|while read n;do echo "$(seq 1 7|while read day;do
```
- それにともなって```printf```のフォーマットも変更
- まあ実はこの空白無視問題でどこに```""```入れるかとか```echo```と```printf```どっち使うかとか試すのに結構時間食われた

![カレンダー](06-hiding.png)
- 空行がばらばらなの気になる..
- 5週の月もあれば６週の月もあるけど、全部おなじリスト(シーケンス)から作っていらない部分非表示にしてるせい
- そのうち月と月の間の空行を１行に統一したい



## 指定日の色を変えた
- ```calender <year> <month> <date>```とした時の挙動
- 第３引数で指定した日付の背景色と文字色を反転表示
- ついでに変数名ややこしかったので変えた
```bash
readonly REVERSE_WHITE="\033[37;7m"

# ~中略~

seq $from $to|while read cur_m;do
  day1=`mydate $y-$cur_m-01 0 %w`
  lastd=`mydate $y-$((cur_m%12+1))-00 0 %d`
  echo "      "`mydate $y-$cur_m-01 0 %B%Y`
  seq 0 6|while read n;do echo "$(seq 1 7|while read day;do
    cur_d=$((day+(n-1)*7-day1))
    if [ $cur_m = "$m" -a $cur_d = "$d" ];then printf $REVERSE_WHITE
    elif [ $day = 1 ];   then printf $RED
    elif [ $day = 7 ];   then printf $BLUE
    else                      printf $WHITE; fi
    if [ $n = 0 ];then
      printf "%s " `mydate $y-$cur_m-$(($day-day1+7)) 0 %a`
    elif [ 0 -lt $cur_d -a $cur_d -le $lastd ]; then
      printf "%2d " $cur_d
    else
      printf "   "
    fi
    printf $OFF;
  done)";done
  echo
done
```
- 色指定の条件式(真ん中らへんの```if```)に背景色と文字色反転するやつ追加しただけ
- ```\033[37;7m```の```;7```はオプションで、背景色と文字色を反転させるという意味
- 他にも```;1```でbold、```;4```でunderlineとか
- オプション詳細は以下のリンクで
- [シェル - echoで文字に色をつける その1 - Miuran Business Systems ](http://www.m-bsys.com/linux/echo-color-1)

![カレンダー](07-highlight-date.png)
- 終わった！これで完成！
- と思った矢先、バグが見つかるのでした..もう寝たい..



## 引数の処理を修正した
- ```calender```の第２，第３引数に0付きの数字を指定すると、```calender <year> <month> <date>```で指定日の色が変わらない
- おそらく色指定の条件式のとこで```$cur_m = "$m"```と```$cur_d = "$d"```が```"02" = "2"```みたいな比較になってるせい
- コマンド自体の引数の0を消したい
- [ bash で 0埋めされた数値文字列の不要な0を削除する（または0で始まる文字列を10進数として扱う） - Qiita](http://qiita.com/ma2saka/items/c9d599020353de2b47d2)
```bash
set +u;
y="$1"
m="$2"
d="$3"
set -u
if [ "$y" = "" ]; then
  y=${now:0:4}
  m=$((10#${now:5:2}))
  d=$((10#${now:8:2}))
  from=$m;to=$m
elif [ "$m" = "" ]; then
  from=1;to=12
else
  from=$m;to=$m
  m=$((10#$m))
  if [ "$d" != "" ]; then
    d=$((10#$d))
  fi
fi
```
- ```$((10#${STR}))```で10進数として扱える
- ```10#```は続く数字を「10進数に変換する」のではなく、あくまで「10進数として扱う」
- つまり```012```は```10```ではなく```12```になる(```0```を付けると8進数)
- あと```10#```の形式は算術処理を行う```$(())```(もしくは```expr```)の中でしか解釈されない

![カレンダー](08-modify-args.png)
- たぶんこれで大丈夫かな..



## 取り敢えず完成した
- 細かいとこで気になるとこはまだある
- でももう寝たいので終わる
- 16日中に終わらなかった..
- 以下現時点でのコード
```bash
#!/bin/bash
set -eu

mydate() {
  local readonly inf=%Y-%m-%d
  local readonly ifD=`[ "$(uname)" = "Darwin" ]`
  local opts=`$ifD && echo "-j -f $inf"` || echo "-d"
  set +eu
  date $opts $1>/dev/null 2>&1
  local date=`[ $? != 0 ] && echo $(date +$inf) || echo $1`
  expr 1 + $2>/dev/null 2>&1
  local days=`[ $? -ge 2 ] && echo 0 || echo $2`
  date $opts $date +$3>/dev/null 2>&1
  local outf=`[[ $? != 0 || $3 = "" ]] && echo $inf || echo $3`
  set -eu

  local days=`[ 0 -le $days ] && echo +$days || echo $days`
  local opts=`$ifD && echo "-j -v${days}d -f $inf $date +$outf" || echo "-d $date${days}days +$outf"`
  echo `date $opts`
}

readonly OFF="\033[0m"
readonly BLUE="\033[34m"
readonly GRAY="\033[37;1m"
readonly RED="\033[31m"
readonly WHITE="\033[37m"
readonly REVERSE_WHITE="\033[37;7m"
readonly now=`date +%Y-%m-%d`

set +u;
y="$1"
m="$2"
d="$3"
set -u
if [ "$y" = "" ]; then
  y=${now:0:4}
  m=$((10#${now:5:2}))
  d=$((10#${now:8:2}))
  from=$m;to=$m
elif [ "$m" = "" ]; then
  from=1;to=12
else
  from=$m;to=$m
  m=$((10#$m))
  if [ "$d" != "" ]; then
    d=$((10#$d))
  fi
fi

seq $from $to|while read cur_m;do
  day1=`mydate $y-$cur_m-01 0 %w`
  lastd=`mydate $y-$((cur_m%12+1))-00 0 %d`
  echo "      "`mydate $y-$cur_m-01 0 %B%Y`
  seq 0 6|while read n;do echo "$(seq 1 7|while read day;do
    cur_d=$((day+(n-1)*7-day1))
    if [ $cur_m = "$m" -a $cur_d = "$d" ];then printf $REVERSE_WHITE
    elif [ $day = 1 ];   then printf $RED
    elif [ $day = 7 ];   then printf $BLUE
    else                      printf $WHITE; fi
    if [ $n = 0 ];then
      printf "%s " `mydate $y-$cur_m-$(($day-day1+7)) 0 %a`
    elif [ 0 -lt $cur_d -a $cur_d -le $lastd ]; then
      printf "%2d " $cur_d
    else
      printf "   "
    fi
    printf $OFF;
  done)";done
  echo
done

```



## TODO
気が向いたら進めます
- ```mydate```の第2引数で```+20```など+付きの数字を許容する
- くそ重い、特に```calender <year>```のときやばい
- awk、sed、grep使ってみる
- 月と月の間の空行を１行に統一
- 引数名考えるか```readonly```にしないと上書きしそうで怖い
- マップ処理の```$cur_m```を引数と同じ```$m```にしててはまったりしたし..
