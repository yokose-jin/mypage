---
layout: ../../../layouts/MarkdownPostsLayout.astro
title: "型で数を作る(自然数編)"
lastUpdatedDate: 2025-10-13
description: "Haskellの型システムを用いて自然数を構成します。"
tags: ["数","型","Haskell"]
---
```Nat```型を次のように定める：
```haskell
data Nat = Zero | Succ Nat deriving (Show)
```
つまり`Nat`型とは、`Zero`か`Succ Nat`の形をしたものの集まりである。例えば、`Succ Zero`や`Succ (Succ Zero)`などは`Nat`型の値になる。

次に、`Nat`型に等しさの概念を導入しよう。これはすなわち、`Nat`を`Eq`型クラスのインスタンスにするということである。

$A$を可換環、$(X,\mathcal{O}_{X})$を$A$から定まるアフィンスキームとする。