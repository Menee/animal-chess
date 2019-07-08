# animal-chess

Animal chess game “component” implemented using HTML, CSS and JS。 HTML斗兽棋组件。

Chrome、Firefox均可使用，IE似乎不能用。
打开 https://menee.github.io/animal-chess/demo.html 预览效果

## 使用方法

1. 下载game.js文件以及style文件夹，放置在HTML文件所在目录；
2. 声明页面采用UTF-8编码 `<meta charset="UTF-8">`；
3. 在head 中加入script标签：`<script src="./game.js"></script>`；
4. 在body的任何地方加入一个`div`，将其id设置为`animal-chess`；
5. 在body结束处加入一个`script`标签，并新建`document.GameController`对象，第一个参数为一方获胜的回调函数，可不填；第二个参数是样式表路径；

一个简单的例子如下

```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<script src="./game.js"></script>
</head>
<body>
	<div id="animal-chess" style="display:inline-block"></div>
    <script>
        new document.GameController(function(msg){
            alert(msg+" wins!")
        }, null,"./styles/plain/style.css");
    </script>
</body>
</html>
```
其中初始化document.GameController的方法的含义如下：
```javascript
let controller = new document.GameController(
	function(msg){/*游戏结束，某一方胜利的时候被调用的回调函数。msg表示胜利方颜色（red或者blue）*/},
    function(msg){/*游戏方切换时候的回调函数。msg表示接下来的玩家的颜色。可以用于在页面中写一个提示轮到谁下棋的标签。*/},
    "./styles/plain/style.css" /*样式文件，默认提供了plain和image-style两个（但image-style中的图片由于知识产权问题已经被我删除，因此实际上不可用）。可以使用自己的css文件作为style，详见"Hack"*/
);
```

一个更为完整的demo是demo.html，里面演示了第二个回调函数的使用和动态切换CSS样式的方法。

## 实现的功能

* 大吃小、老鼠吃大象的规则
* 大小相同，同归于尽
* 老虎和狮子可以在没有老鼠挡住跳过河（左右方向）；老鼠可以游过河；其他动物只能在陆地上一次行走一格
* 不可以走进己方兽穴
* 不可以和其他棋子在同一格
* 在敌方兽穴时可以被敌方任意棋子吃掉
* 进入地方兽穴时判断为胜利
* 游戏样式热切换：不需要重新开始游戏就可以切换棋盘样式
* 禁用了文字选择功能，鼠标指针均为箭头。

## Hack

游戏样式完全由CSS决定，JavaScript代码仅仅改变元素的class。

可用的CSS选择器如下：

* 棋盘
  * `#chess-animal table`：棋盘（整个）
  * `#chess-animal td`: 棋盘中的一格
  * `#chess-animal td.block-lighter`：棋盘中的一格。如果要深浅色排列交替的话，为浅色色块。
  * `#chess-animal td.block-lighter`：棋盘中的一格。如果要深浅色排列交替的话，为深色色块。
  * `#chess-animal td.block-home`：棋盘中的一格。是兽穴。
  * `#chess-animal td.block-trap`：棋盘中的一格。是陷阱。
  * `#chess-animal td.block-river`：棋盘中的一格。是小河。

* 棋子

  * `#chess-animal div.chess`：棋子或者棋子的占位符（每一个`td`内都有这样一个`div`）
  * `#chess-animal div.chess.chess-type-i `(i=1,2,...,8)：分别为象，狮，…，鼠棋子
  * `#chess-animal div.chess-red`：红方（先手方）棋子。虽然不一定要画成红色。
  * `#chess-animal div.chess-blue`：蓝方（后手方）棋子。虽然也不一定要画成蓝色。
  * `#chess-animal chess-selected`：当前被选中的棋子。

  

## JavaScript代码结构介绍

代码中主要存在三个类：`GameModel`、`View`、`GameController`，和一些实用函数。变量命名比较随意，比如直接将回调函数叫做`callback`（而非用语义命名），把棋子数组叫做`chesses`（但chess事实上是不可数名词），把棋盘中的格子的位置记作`x`和`y`（用`i`和`j`更合适）。有空再改吧。

 

`GameModel`类里面存储数据：

* chesses：棋盘上所有棋子的数组（`{x, y, type, color}`）；

* selectedChessIndex: 被选中的棋子在chesses数组中的下标。若没有，则-1。

 

`View` 是一个无状态的类，负责将`GameModel`对象绘制到网页中。`View`类主要有两个对外的接口：

* `updateView(model)`: 并将`model`中的数据绘制到网页中
* `callback(i, j)`:   回调函数。当`View`被点击的时候会被调用。

另外，`View`中还有指向`GameController`对象的`reverseLink`，目的是：便于回调函数被调用的时候访问`GameController`的数据和方法。

 

`GameController`是游戏控制类，也是唯一一个必须被外部调用的类。它要完成：

* 找到`id`为`animal-chess`的`div`，并且向里面放置用表格实现的棋盘。
* 创建`GameModel`对象
* 创建`View`对象
* 处理`View`对象发出的事件，进行处理，修改`GameModel`对象，最后调用`updateView`来更新网页。
* 有`callback(msg)`：用于在一方取胜的时候通知调用者。
* 有`playerChanged(msg)`：用于下棋方改变的时候通知调用者。 

该部分代码进行了封装，在外部可以直接作为类库调用。代码内部尽量解耦，可以单独修改游戏逻辑或游戏界面的代码而不影响另外一部分。
