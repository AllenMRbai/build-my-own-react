# 创建自己的 react

来自 Rodrigo Pombo 的文章。

https://pomb.us/build-your-own-react/

## TODO

- [done] use an object for the style prop
- [done] flatten children arrays
- useEffect hook
- reconciliation by key

## diving TODO

- In Didact, we are walking the whole tree during the render phase. React instead follows some hints and heuristics to skip entire sub-trees where nothing changed.
- We are also walking the whole tree in the commit phase. React keeps a linked list with just the fibers that have effects and only visit those fibers.
- Every time we build a new work in progress tree, we create new objects for each fiber. React recycles the fibers from the previous trees.
- When Didact receives a new update during the render phase, it throws away the work in progress tree and starts again from the root. React tags each update with an expiration timestamp and uses it to decide which update has a higher priority.
