---
layout: ../../../layouts/MarkdownPostsLayout.astro
title: "型で数を作る(自然数編)"
lastUpdatedDate: 2025-10-13
description: "Haskellの型システムを用いて自然数を構成します。"
tags: ["数","型","Haskell"]
---
この記事の目標は、Haskellの型システムを使って自然数を型レベルで構成することである。
その為、プログラムの意味が伝わることを意識し、形式的で厳密な議論は避けた部分がある。その詳細についてはいつか(自分が生きている間とは限らない)記事にしようと思う。
なお、この記事では、Haskellの基本的な文法は仮定した。
### Peanoの公理
自然数を構成する前に、自然数とは何かをはっきりさせておく必要がある。
数学に於いて何かを定義する際に重要となるのは、その定義が、定義する対象の本質的な性質を捉えているかどうかということである。自然数とは何かということを考えたとき、自然数の持つ豊かな構造と性質&mdash;順序、加法、乗法、数学的帰納法など&mdash;を思い浮かべるだろう。
しかし、本質的に重要な性質のみを整理するのは、そう簡単なことではない。

自然数を自然数たらしめる本質的な性質を見事に捉え、公理化したのが次に述べるPeanoの公理である。

__$\blacktriangleright$定義. (Peano系)__

集合$N$に対し、三つ組($N,s,0$)が以下の条件を満たすとき、これをPeano系という。

>(P1). $0\in N$である。
  
>(P2). $s$は$N$から$N$への写像である。

>(P3). $s$は単射である。

>(P4). 全ての$n\in N$に対し、$s(n)\neq 0$である。

>(P5). $N$の部分集合$S$が $0\in S\wedge (x\in S \Rightarrow s(n)\in S)$を満たすとき、$S=N$となる。

この(P1)から(P5)の条件をPeanoの公理という。

例えば、我々がよく知っている自然数全体の集合$\mathbb{N}$に対し、写像$s:\mathbb{N}\to \mathbb{N}$を$s(n)=n+1$と定めれば、三つ組$(\mathbb{N},s,0)$はPeano系である。
ただし、自然数を定義しようという流れの中では、まだ$\mathbb{N}$を使うことはできないので、これは実際にはPeano系を構成しているわけではないことに注意する。

この記事ではPeano系についての詳細は述べないが、とりあえずこの5つの条件でもって自然数を特徴付けるのだということを頭に入れておこう。

### Peano系を型で実装する
#### ・`Nat`型を定義する
では、ここから(P1)から(P5)の条件を満たすような型を実装していく。

気持ちとしては、`Nat`型は、まず`Zero`を含んでおり、その他の元は再帰的に`Succ Nat`のような形をしていて欲しい。したがって、`Nat`型を次のように定めることにする：
```haskell
data Nat = Zero | Succ Nat deriving (Show)
```
つまり`Nat`型とは、`Zero`か`Succ Nat`の形をしたものの集まりである。例えば、`Succ Zero`や`Succ (Succ Zero)`などは`Nat`型の値になる。この段階で、`Succ`という`Nat`から`Nat`への関数が定まっており、`Nat`の元として`Zero`を定義している。つまり、三つ組`(Nat,Succ,Zero)`はPeano公理系の(P1)と(P2)そして(P5)を満たしている。実際、(P1)と(P2)に関してはそのままで、`Nat`の定義から、`Zero`を含み`m`が`S`の値であれば`Succ m`も`S`の値となるような`S`は、当然`Zero,Succ (Zero), Succ (Succ Zero),...`も全て含むことになり、これは`Nat`に他ならない。
#### ・等号を定める
しかし、このままでは(P3)と(P4)の条件以前に、そもそも`Nat`に於いての等しさが定義されていない。では、`Nat`型に等しさの概念を導入しよう。すなわちこれは、`Nat`を`Eq`型クラスのインスタンスにするということである。

Haskellで定義した型を型クラスのインスタンスにするには、再帰的な定義を用いる。再帰的な定義の基本となるのは、その定義のスタート地点である。`Nat`型のスタート地点は`Zero`であり、まずはこれに関する定義から記述してみる：
```haskell
instance Eq Nat where
    Zero == Zero = True
    (Succ _) == Zero = False
    Zero == (Succ _) = False
```
しかし、これだけでは`Zero == Zero`と`Zero == (Succ _)`の場合にしか定義できておらず、一般的な`(Succ m) == (Succ n)`という形の場合には対応できていない。そこで、一般的な形の定義式を追加することで、晴れて`Nat`を`Eq`型クラスのインスタンスにすることができる。
```haskell
instance Eq Nat where
    Zero == Zero = True
    (Succ _) == Zero = False
    Zero == (Succ _) = False
    Succ m == Succ n = m == n --これを追加した
```
これで`Nat`に等号が定義できたことを確認されたい。最後に追加した`(Succ m) == (Succ n) = m == n`の部分は、数学的には後者関数$s$に対し、$s(m)=s(n)$を$m=n$として定める。ということであるが、そもそも`Nat`の定義を思い返すと、`Nat`の値は必ず`Zero`か`Succ Nat`の形をしているので、`Succ m`を`m`に置き換えることで、`Succ m`の一つ前の値`m`を評価するということになり、これを繰り返すといづれ`Zero`を含む場合の等号に話が置き換わるのである。

例えば次のような挙動をする：

```haskell
Succ (Succ (Succ Zero)) == Succ (Succ Zero)
```
を判定したかったとする。このとき、`==`の定義から、これは両辺から外側の`Succ`を省いた`Succ (Succ Zero) == Succ Zero`と同値である。また同様に、これは`Succ Zero == Zero`と同値になる。これは`False`であると定義したので、元の式`Succ (Succ (Succ Zero)) == Succ (Succ Zero)`も`False`になる。

もうこの段階で、`(Nat,Succ,Zero)`が(P3)と(P4)の条件を満たし、したがってこれがPeano系になることが示せる。実際、(P3)は等号の定義`(Succ _) == Zero = False Zero == (Succ _) = False`から示せるし、また、(P4)は等号の定義`(Succ m) == (Succ n) = m == n`から示せる。
#### ・順序を入れる
さて、次は`Nat`に順序を入れる、即ち`Nat`を`Ord`型クラスのインスタンスにしよう。`Ord`型クラスのインスタンスにするには、`Nat`に対して`compare`関数を定めればよい。`Nat`上の順序は、二つの`Nat`の値`Succ (Succ (Succ ...))`と`Succ (Succ (Succ ...))`があったとき、外側の`Succ`の個数が多ければそちらが値として大きいと考えるのが自然である。では、これも等号の時と同じように`Zero`を含む式から始めて実装する。
```haskell
instance Ord Nat where
    compare Zero Zero = EQ
    compare Zero (Succ _) = LT
    compare (Succ _) Zero = GT
```
もちろん`Zero`は`Nat`の中で最も小さいものとしたいので、`Zero`と`(Succ _)`では必ず`(Succ _)`の方が大きいとした。最後に一般的な形について定義し、順序が完成する：
```haskell
instance Ord Nat where
    compare Zero Zero = EQ
    compare Zero (Succ _) = LT
    compare (Succ _) Zero = GT
    compare (Succ m) (Succ n) = compare m n --これを追加した
```
ghciで試してみると、次のようにきちんと動作することがわかる：
```haskell
ghci> Zero > Succ (Succ Zero)
False

ghci> Zero < Succ (Succ Zero)
True

ghci> Succ Zero < Succ (Succ Zero)
True

ghci> Succ (Succ Zero) > Succ (Succ (Succ (Succ Zero)))
False
```
#### ・加法と乗法を定める
最後に、`Nat`に加法と乗法を定義して終わりにしよう。

まず加法についてだが、`Zero`は何と足しても値が変わらないようにし、通常の自然数では$m+(n+1)=(m+n)+1$つまり$m+s(n)=s(m+n)$が成り立つことを用いて再帰的に定義する。したがって、プログラムは次のようになる：
```haskell
(.+.) :: Nat -> Nat -> Nat
m .+. Zero = m
Zero .+. n = n
m .+. Succ n = Succ (m .+. n)
```
例えば、ghciで実験してみると、次のような出力が得られる：
```haskell
ghci> Zero .+. Succ (Succ Zero)
Succ (Succ Zero)

ghci> Succ Zero .+. Succ (Succ Zero)
Succ (Succ (Succ Zero))

ghci> Succ (Succ (Succ (Succ Zero))) .+. Succ (Succ (Succ(Zero)))
Succ (Succ (Succ (Succ (Succ (Succ (Succ Zero))))))
```
次に乗法を定めよう。こちらも加法の時と同じ様に定めれば良い。まずは`Zero`に何をかけても`Zero`となるようにし、通常の自然数においては$m\times (n+1)=m\times n + m$即ち$m\times s(n)=m\times n+m$が成り立つことを用いると、プログラムは次の様になる：
```haskell
(.*.) :: Nat -> Nat -> Nat
m .*. Zero = Zero
Zero .*. n = Zero
m .*. Succ n = (m.*.n) .+. m
```
ghciで実験してみると、
```haskell
ghci> Zero .*. Succ (Succ Zero)
Zero

ghci> Succ Zero .*. Succ (Succ Zero)
Succ (Succ Zero)

ghci> Succ (Succ (Succ (Succ Zero))) .*. Succ (Succ (Succ(Zero)))
Succ (Succ (Succ (Succ (Succ (Succ (Succ (Succ (Succ (Succ (Succ (Succ Zero)))))))))))
```
となり、確かに欲しい結果が得られた。
### 最後に
以上でHaskellの型システムを用いて自然数を定義することができた。プログラムの全体は以下に記す：
```haskell
data Nat = Zero | Succ Nat deriving(Show)

instance Eq Nat where
  Zero == Zero = True
  (Succ _) == Zero = False
  Zero == (Succ _) = False
  (Succ n) == (Succ m) = n == m

instance Ord Nat where
  compare Zero Zero = EQ
  compare Zero (Succ _) = LT
  compare (Succ _) Zero = GT
  compare (Succ m) (Succ n) = compare m n

(.+.) :: Nat -> Nat -> Nat
m .+. Zero = m
Zero .+. n = n
m .+. (Succ n) = Succ (m .+. n)

(.*.) :: Nat -> Nat -> Nat
m .*. Zero = Zero
Zero .*. n = Zero
m .*. Succ n = (m.*.n) .+. m
```
この記事で解説を省いたもの&mdash;再帰定理やPeano算術、そして自然数全体の一意など&mdash;は<span style="color:#9f4561;">[wikipedia](https://ja.wikipedia.org/wiki/ペアノの公理)</span>や<span style="color:#9f4561;">[web上のpdf](https://www.math.is.tohoku.ac.jp/~obata/student/subject/TaikeiBook/Taikei-Book_15.pdf)</span>などを適宜参照されたい。