{
//========================Helper==============================
    let red = Symbol("red");
    let blue = Symbol("blue");

//一个位置是不是河
    function isRiver(i, j) {
        return i >= 1 && i <= 5 && i !== 3 && 3 <= j && j <= 5;
    }

//TODO 这个规则可能还要改：能否从岸上跳到桥上？
//一个走法是不是恰好过河
    function crossRiver(x1, y1, x2, y2) {
        if (x1 !== x2 && y1 !== y2) return false;
        if (y1 === 2 && y2 === 6 && (x1 === 1 || x1 === 2 || x1 === 4 || x1 === 5)) return true;
        if (y2 === 2 && y1 === 6 && (x1 === 1 || x1 === 2 || x1 === 4 || x1 === 5)) return true;
        return false;
    }

//======================数据模型部分==========================
// 棋子类
    function Chess(x, y, color, type) {
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
    }

// 棋子：比较函数
    Chess.prototype.compareTo = function (chess) {
        if (chess.type === 8 && this.type === 1) return -1;
        if (chess.type === 1 && this.type === 8) return 1;
        return chess.type - this.type;
    };
// 棋子：转到文字
    Chess.prototype.toChar = function () {
        return ["人", "象", "狮", "虎", "豹", "狼", "狗", "猫", "鼠"][this.type];
    };

//模型类。对所有数据的一个封装。M。
    function GameModel() {
        this.chesses = [ //所有的棋子
            new Chess(0, 0, blue, 3),
            new Chess(6, 0, blue, 2),
            new Chess(1, 1, blue, 6),
            new Chess(5, 1, blue, 7),
            new Chess(0, 2, blue, 1),
            new Chess(2, 2, blue, 5),
            new Chess(4, 2, blue, 4),
            new Chess(6, 2, blue, 8),

            new Chess(6, 8, red, 3),
            new Chess(0, 8, red, 2),
            new Chess(5, 7, red, 6),
            new Chess(1, 7, red, 7),
            new Chess(6, 6, red, 1),
            new Chess(4, 6, red, 5),
            new Chess(2, 6, red, 4),
            new Chess(0, 6, red, 8),
        ];
        this.selectedChessIndex = -1; // 被选中的棋子
        this.player = red;
    }

//========================视图部分===========================
//视图类
    function View(table, callback, reverseLink) {
        this.table = table;
        this.cells = [];
        this.chessCand = [];
        this.callback = callback || function (i, j) {
        };
        this.reverseLink = reverseLink;
        for (let i = 0; i < 7; i++) {
            let row = document.createElement("tr");
            this.cells[i] = [];
            this.chessCand[i] = [];
            for (let j = 0; j < 9; j++) {
                let c = document.createElement("td");
                let d = document.createElement("div"); //棋子
                d.onclick = () => this.callback(i, j);
                c.classList.add((i + j) % 2 ? "block-lighter" : "block-darker"); //色块。
                d.classList.add("chess");
                row.append(c);
                c.append(d);
                this.cells[i][j] = c;
                this.chessCand[i][j] = d;
            }
            this.table.append(row);
        }

        //兽穴
        this.cells[3][0].classList.add("block-home");
        this.cells[3][8].classList.add("block-home");

        //陷阱
        this.cells[3][1].classList.add("block-trap");
        this.cells[4][0].classList.add("block-trap");
        this.cells[2][8].classList.add("block-trap");
        this.cells[2][0].classList.add("block-trap");
        this.cells[3][7].classList.add("block-trap");
        this.cells[4][8].classList.add("block-trap");

        for (let i = 1; i < 6; i++) {
            if (i !== 3) for (let j = 3; j < 6; j++) {
                this.cells[i][j].classList.add("block-river");
            }
        }

    }

//Update View
    View.prototype.updateView = function (model) {
        //chess-selected chess-red chess-blue
        for (let _ of this.chessCand) {
            for (let chessView of _) {
                chessView.innerText = "";
                chessView.classList.remove("chess-selected", "chess-red", "chess-blue");
                for (let type = 1; type <= 8; type++) {
                    chessView.classList.remove("chess-type-" + type);
                }
            }
        }
        //put chess
        for (let chess of model.chesses) {
            this.chessCand[chess.x][chess.y].classList.add("chess-" + (chess.color === red ? "red" : "blue"));
            this.chessCand[chess.x][chess.y].classList.add("chess-type-" + chess.type);
            this.chessCand[chess.x][chess.y].innerText = chess.toChar();
        }
        //selected chess
        if (this.reverseLink.model.selectedChessIndex >= 0) {
            let chess = model.chesses[this.reverseLink.model.selectedChessIndex];
            this.chessCand[chess.x][chess.y].classList.add("chess-selected");
        }
    };

//========================控制器部分=========================
//控制器类.callback为回调函数，返回胜利方/平局
    function GameController(callback,playerChanged,path) {
        let ele = document.getElementById("animal-chess");
        let table = document.createElement("table"); // 由于后期加入这个，所以别的地方还是用ID找到这个表格
        ele.append(table);
        this.model = new GameModel();
        this.view = new View(table, this.eventHandler, this);
        this.view.updateView(this.model);
        this.playerChangedCallback = playerChanged || function(color){};
        this.callback = callback || function (msg) {};
        if(path){
            let head = document.getElementsByTagName('head')[0];
            let link = document.createElement('link');
            link.href = path;
            link.id = "game-style";
            link.rel = 'stylesheet';
            head.appendChild(link);
        }
    }

//检查某位置有没有棋子，若有，返回索引，否则返回null
    GameController.prototype.chessExist = function (x, y) {
        for (let i = 0; i < this.model.chesses.length; i++) {
            let chess = this.model.chesses[i];
            if (chess.x === x && chess.y === y) {
                return i;
            }
        }
        return -1;
    };
//检查是否会因为有老鼠而不能过河。//assert crossRiver(x1,y1,x2,y2)
    GameController.prototype.noMice = function (i1, j1, i2, j2) {
        for (let j = 3; j <= 5; j++) {
            if (this.chessExist(i1, j) >= 0) return false; //由于是河里，有动物就必定是老鼠
        }
        return true;
    };
//切换玩家
    GameController.prototype.switchPlayer = function () {
        if (this.model.player === red) this.model.player = blue;
        else this.model.player = red;
        this.playerChangedCallback(this.model.player===red ? "red" : "blue");
    };
//是否在敌方陷阱内
    GameController.prototype.inTrap = function (chess) {
        let x = chess.x, y = chess.y;
        return ((chess.color === red) && ((x === 2 && y === 0) || (x === 3 && y === 1) || (x === 4 && y === 0)))
            || ((chess.color === blue) && ((x === 2 && y === 8) || (x === 3 && y === 7) || (x === 4 && y === 8)));
    };
//用于处理View发回的事件。是回调函数。
    GameController.prototype.eventHandler = function (i, j) {
        //注意model.selectedChessIndex是之前选择的，selectedChessIndex是当前事件选上的。
        let controller = this.reverseLink;
        let model = controller.model;
        let selectedChessIndex = controller.chessExist(i, j);
        if (selectedChessIndex >= 0 && model.chesses[selectedChessIndex].color === model.player) { //选择一枚棋子
            model.selectedChessIndex = selectedChessIndex;
        } else if (model.selectedChessIndex >= 0) {
            let previousSelected = model.chesses[model.selectedChessIndex];
            //可以走：在棋盘内  && 不是自家老巢 && (是老鼠 || 不是河) && (相邻||(过河 && 狮子老虎过河 && 没有老鼠挡着))
            if ((!(previousSelected.color === red && i === 3 && j === 8
                || previousSelected.color === blue && i === 3 && j === 0))//不是老巢
                && ((previousSelected.type === 8) || !isRiver(i, j))//(是老鼠 || 不是河)
                && ((Math.abs(i - previousSelected.x) + Math.abs(j - previousSelected.y) <= 1) || //相邻
                    ((crossRiver(previousSelected.x, previousSelected.y, i, j))//过河
                        && (previousSelected.type === 2 || previousSelected.type === 3) // 狮子老虎过河
                        && (controller.noMice(previousSelected.x, previousSelected.y, i, j))))//没有老鼠挡着
            ) {
                if (selectedChessIndex < 0) {//随意跳:  空着。可以判赢
                    previousSelected.x = i;
                    previousSelected.y = j;
                    model.selectedChessIndex = -1;
                    if ((model.player === blue && i === 3 && j === 8
                        || model.player === red && i === 3 && j === 0)) {
                        controller.callback(model.player===red?"red":"blue");
                    }
                    controller.switchPlayer();
                } else if (selectedChessIndex >= 0 && model.chesses[selectedChessIndex].color !== previousSelected.constructor) {//有敌人
                    let nowSelected = model.chesses[selectedChessIndex];
                    let result = previousSelected.compareTo(nowSelected);
                    if (result > 0 || controller.inTrap(nowSelected)) { //吃子（更大或者被困在陷阱）
                        previousSelected.x = i;
                        previousSelected.y = j;
                        model.chesses.splice(selectedChessIndex, 1);
                        controller.switchPlayer();
                        model.selectedChessIndex = -1;
                    } else if (result === 0) { //一样
                        model.chesses.splice(selectedChessIndex > model.selectedChessIndex ? selectedChessIndex : model.selectedChessIndex, 1);
                        model.chesses.splice(selectedChessIndex < model.selectedChessIndex ? selectedChessIndex : model.selectedChessIndex, 1);
                        controller.switchPlayer();
                        model.selectedChessIndex = -1;
                    }//else result < 0 do nothing
                }
            }
        }//no else. left here
        this.updateView(this.reverseLink.model);
    };
    
    document.GameController = GameController;
    document.Chess = Chess;
    document.View = View;
    document.GameModel = GameModel;
}
/**
 * 注释：
 * 采用类似于MVC的架构。
 * 其中，逻辑上，M和V分离，C对M和V进行控制
 * 实现上，View接受Model为参数对图像进行绘制
 * 另外View中有一个指向Controller的反向链接。这个反向链接仅仅为了数据访问的方便。
 * （因为在Controller中为View设置回调函数，该函数的this指向了View对象）
 *
 * 所有的参数x,y都可以理解为i,j，i行j列，从0开始
 */


