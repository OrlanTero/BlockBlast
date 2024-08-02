
const GAMEMODE = {
    EASY: 1,
    HARD: 2,
    EXPERT: 3
}

export default class BlockBlast {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.size = { width, height };
        this.blockLists = this.getBlockLists();
        this.grid = new Grid(this);
        this.blockManager = new BlockManager(this);
        this.currentObject = null;
        this.scoreboard = new ScoreBoard(this);
    }

    getBlockLists() {
        return [
            {
                name: "I-block-horizontal",
                color: 0,
                structure: [
                    [1, 1, 1, 1],
                ]
            },
            {
                name: "I-block-vertical",
                color: 0,
                structure: [
                    [1],
                    [1],
                    [1],
                    [1],
                ]
            },
            {
                name: "L-block",
                color: 1,
                structure: [
                    [1, 0, 0],
                    [1, 1, 1],
                ]
            },
            {
                name: "J-block",
                color: 1,
                structure: [
                    [0, 0, 1],
                    [1, 1, 1],
                ]
            },
            {
                name: "O-block",
                color: 2,
                structure: [
                    [1, 1],
                    [1, 1],
                ]
            },
            {
                name: "S-block",
                color: 3,
                structure: [
                    [0, 1, 1],
                    [1, 1, 0],
                ]
            },
            {
                name: "Z-block",
                color: 3,
                structure: [
                    [1, 1, 0],
                    [0, 1, 1],
                ]
            },
            {
                name: "T-block",
                color: 4,
                structure: [
                    [0, 1, 0],
                    [1, 1, 1],
                ]
            },
            {
                name: "L-block-extended",
                color: 5,
                structure: [
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 1, 1, 1],
                ]
            },
            {
                name: "J-block-extended",
                color: 6,
                structure: [
                    [0, 0, 0, 1],
                    [0, 0, 0, 1],
                    [0, 0, 0, 1],
                    [1, 1, 1, 1],
                ]
            },
            {
                name: "L-baliktad-block",
                color: 7,
                structure: [
                    [1, 1],
                    [0, 1],
                    [0, 1],
                ]
            },
            {
                name: "L-baliktad-block",
                color: 7,
                structure: [
                    [1, 1],
                    [1, 0],
                    [1, 0],
                ]
            },
        ];
    }

    draw(ctx) {
        this.scoreboard.draw(ctx);
        this.blockManager.draw(ctx);
        this.grid.draw(ctx);

        if (this.currentObject != null) {
            this.currentObject.draw(ctx);
        }
    }

    update() {
        // this.blockManager.update();

        // if (this.grid.isGameOver()) {
        //     console.log("GAMEOVER");
        // }
    }

    listen() {
        const offsetX = canvas.getBoundingClientRect().left;
        const offsetY = canvas.getBoundingClientRect().top;

        const obj = this;
    
        canvas.addEventListener("mousedown", function(event) {
            const mouseX = parseInt(event.clientX - offsetX);
            const mouseY = parseInt(event.clientY - offsetY);

            for (const slot of obj.blockManager.data.currentSlots) {
                // console.log({position: slot.position}, {mouseX, mouseY})
                if (obj.insidePosition(new Position(mouseY, mouseX), slot.position, slot.size, slot.size)) {
                    if (slot.block != null) {
                        obj.currentObject = slot.block;
                        slot.block.drawingToSlot = false;
                        obj.currentObject.position = new Position(mouseY - (obj.currentObject.size.height / 2), mouseX - (obj.currentObject.size.width / 2));
                    }
                } 
            }
        });

        canvas.addEventListener("mousemove", function(event) {
            const mouseX = parseInt(event.clientX - offsetX);
            const mouseY = parseInt(event.clientY - offsetY);

            if (obj.currentObject != null) {
                obj.currentObject.position = new Position(mouseY - (obj.currentObject.size.height / 2), mouseX - (obj.currentObject.size.width / 2));

                if (obj.insidePosition(new Position(mouseY, mouseX), obj.grid.position, obj.grid.gridSize, obj.grid.gridSize)) {
                    obj.grid.checkFit(obj.currentObject);
                } else {
                    obj.grid.previewBlock = null;
                }
            }
        });

        canvas.addEventListener("mouseup", function(event) {
            if (obj.currentObject != null) {
                if (obj.grid.previewBlock != null) {
                    obj.grid.placePreview();
                }

                obj.currentObject.drawingToSlot = true;
                obj.currentObject = null;
            } 

            obj.grid.previewBlock = null;
        });
    }

    insidePosition(position, position2, width, height) {
        return position.x >= position2.x && position.x <= position2.x + width && position.y >= position2.y && position.y <= position2.y + height;
    }
}



class Grid {
    constructor(game) {
        this.game = game;

        this.margin = 20;
        this.gridSize = game.size.width - (this.margin * 2);
        this.blockSize = this.gridSize / 8;
        this.position = new Position(100, this.margin);

        this.squares = [];
        this.blocks = [];
        this.previewBlock = null;

        this.createGrid();
    }

    isGameOver() {
        const slots = this.game.blockManager.data.currentSlots;

        for (const square of this.squares) {    
            for (const slot of slots) {
                if (slot.block) {
                    const max = s.getMax();
                    const squaresByStructure = this.getSquaresFromThisSquareByStruct(square, max);
                    const isCorrectSpot = this.inCorrectSpot(squaresByStructure, slot.block.info.structure);
                    
                    if (isCorrectSpot) {
                        return false;
                    } 
                }
            }    
        }   

        return true;
    }

    createGrid() {
        this.squares = [];
        
        for (let y = 0; y < 8; y++) {
            const sq = [];

            for (let x = 0; x < 8; x++) {
                sq.push(new Square(this, new Position(y, x)));
            }

            this.squares.push(sq);
        }
    }

    draw(ctx) {
        const layoutMargin = 5;
        ctx.fillStyle = "#314578";
        ctx.fillRect(this.position.x - layoutMargin, this.position.y - layoutMargin, this.gridSize + (layoutMargin * 2), this.gridSize + (layoutMargin * 2));
        ctx.fill();

        this.squares.flat(1).forEach(sq => sq.draw(ctx));

        this.blocks.filter(b => b).forEach(b => b.draw(ctx));
        
        if (this.previewBlock != null) {
            this.previewBlock.draw(ctx, true);
        }
    }

    getSquaresFromThisSquareByStruct(square, index) {
        const structure = [];

        for (let y = 0; y < index.y; y++) {
            const sqs = [];

            for (let x = 0; x < index.x; x++) {
                try {
                    if (square.index.y + y >= this.squares.length || square.index.x + x >= this.squares.length) {
                        return null;
                    } 

                    const sq = this.squares[square.index.y + y][square.index.x + x];

                    sqs.push(sq);
                } catch (error) {
                    this.previewBlock = null;
                }
            }

            structure.push(sqs);
        }

        return structure;
    }

    inCorrectSpot(squares, structure) {
        // square na merong blocks hindi sia mag kakaroon ng field na structure ng block

        if (!squares || !structure) {
            return;
        }

        for (let y = 0; y < squares.length; y++) {
            for (let x = 0; x < squares[y].length; x++) {
                if (squares[y][x].block && structure[y][x] == 1) {
                    return false;
                }
            }
        }

        return true;
    }

    filledSquareAsBlock(squares, structure, block) {
        for (let y = 0; y < squares.length; y++) {
            for (let x = 0; x < squares[y].length; x++) {
                if (!squares[y][x].block && structure[y][x] == 1) {
                    squares[y][x].block = true;
                    squares[y][x].blockElement = block;
                    squares[y][x].blockIndex = new Position(y, x);
                    squares[y][x].blockColor = block.info.color;
                }
            }
        }
    }

    placePreview() {
        if (!this.previewBlock) return; 

        // const allSquares = this.squares;
        
        const square = this.getSquareWithThisBlock(this.previewBlock);

        const max = this.previewBlock.getMax();

        const squaresByStructure = this.getSquaresFromThisSquareByStruct(square, max);

        if (!this.previewBlock) {
            return;
        }

        const isCorrectSpot = this.inCorrectSpot(squaresByStructure, this.previewBlock.info.structure);

        if (!isCorrectSpot) {
            return;
        } 

        this.filledSquareAsBlock(squaresByStructure, this.previewBlock.info.structure, this.previewBlock);

        this.blocks.push(this.previewBlock);

        this.checkClearLines();
        
        if (this.previewBlock != null) {
            this.game.blockManager.removeBlockFromSlot(this.previewBlock.slotID);
        }   
    }

    // getVerticalVersion() {
    //     const vertical = [];

    //     for (let y = 0; y < this.squares.length; y++) {
    //         const column = [];

    //         for (let x = 0; x < this.squares[y].length; x++) {

    //         }
    //     }
    // }

    checkClearLines() {
        const verticalVersion = [...new Array(8)].map((_, y) => {
            return [...new Array(8)].map((_,x) => this.squares[x][y]) ;
        });

        // console.table(this.squares.map(sqs => sqs.map(sq => sq.block ? "1" : "0")));
        // console.table(verticalVersion.map(sqs => sqs.map(sq => sq.block ? "1" : "0")));

        const lines = this.squares.filter((sqs) => sqs.filter(s => s.block).length == sqs.length);
        const vertLines = verticalVersion.filter((sqs) => sqs.filter(s => s.block).length == sqs.length);

        if (lines.length || vertLines.length) {
            for (const line of [...lines, ...vertLines]) {
                for (const square of line) {
                    square.clear();
                }

                this.game.scoreboard.parseMoveScore(line);
            }
        }
    }

    preview() {
          console.table(this.squares.map(sq => sq.map(s => s.block ? "1" : "0")));
    }

    update() {}

    isFit(block, square) {
        if (!block) return;
        const max = block.getMax();
        const squares = this.getSquaresFromThisSquareToThisIndex(square, max);

        // if (squares != null) {
        //     for (let y = 0; y < max.y; y++) {
        //         for (let x = 0; x < max.x; x++) {
        //             try {
        //                 if (square.index.y + y >= this.squares.length || square.index.x + x >= this.squares.length) {
        //                     return null;
        //                 } 
        
        //                 const sq = this.squares[square.index.y + y + 1][square.index.x + x + 1];

        //                 squares.push(sq);
        //             } catch (error) {
        //                 this.previewBlock = null;
        //             }
        //         }
        //     }
        // }
        
        return true;
    }

    checkFit(block) {
        const square = this.getSquareWithThisBlock(block);
        const max = block.getMax();
        const squares = this.getSquaresFromThisSquareToThisIndex(square, max);
        const squaresByStructure = this.getSquaresFromThisSquareByStruct(square, max);

        const isCorrectSpot = this.inCorrectSpot(squaresByStructure, block.info.structure);

        if (!isCorrectSpot) {
            this.previewBlock = null;
            return;
        } 

        if (squares != null && square) {
            const preview = new Block(this.game, block.info);

            preview.position = square.position;
            preview.size = this.blockSize * 0.9;
            preview.sticked = true;
            preview.slotID = block.slotID;
            
            this.previewBlock = preview;
        } else {
            this.previewBlock = null;
        }
    }

    getSquaresFromThisSquareToThisIndex(square, index) {
        const squares = [];

        for (let y = 0; y < index.y; y++) {
            for (let x = 0; x < index.x; x++) {
                try {
                    if (square.index.y + y >= this.squares.length || square.index.x + x >= this.squares.length) {
                        return null;
                    } 
                    const sq = this.squares[square.index.y + y][square.index.x + x];

                    squares.push(sq);
                } catch (error) {
                    this.previewBlock = null;
                }
            }
        }

        return squares;
    }

    getSquareWithThisBlock(block) {
        const max = block.getMax();
        const grid = this;

        const squaresTop = this.squares.flat(1).filter(square => this.game.insidePosition( square.position,block.position, grid.blockSize, grid.blockSize));
        // const squaresBot = this.squares.flat(1).filter(square => this.game.insidePosition(new Position((block.position.y + (max.y * block.size.blockSize)) - 1, (block.position.x) - 1), square.position, this.blockSize, this.blockSize));

        const top = squaresTop.length ? squaresTop[0] : null;
        // const bot = squaresBot.length ? squaresBot[0] : null;
        
        return top;
    }
}

class BlockManager {
    constructor(game) {
        this.game = game;
        this.data = {
            currentSlots: [],
            currentMode: GAMEMODE.EASY,
            sprite: (() => {
                const img = document.createElement("img");

                img.src = "./assets/images/sprite-no-background.png";

                return img;
            }) ()
        };

        this.position = new Position(this.game.grid.position.y + this.game.grid.gridSize + 50, this.game.grid.position.x);

        this.createBlockSlots(3);
    }
    
    createBlockSlots(count) {
        this.data.currentSlots = [];

        for (let i = 0; i < count; i++) {
            this.data.currentSlots.push(new BlockSlot(this, i));
        }
    }

    draw(ctx) {
        ctx.fillStyle = "#314578";
        ctx.fillRect(this.position.x , this.position.y, this.game.grid.gridSize, this.game.grid.gridSize * 0.4);
        ctx.fill();

        this.data.currentSlots.forEach(s => s.draw(ctx));
    }

    update() {
        const isAvailable = this.checkIfAvailableToRefresh();

        if (isAvailable) {
            this.createBlockSlots(3);
        }
    }

    getSlot(id) {
        const result = this.data.currentSlots.filter((s) => s.uuid == id);

        return result.length > 0 ? result[0] : null;
    }

    removeBlockFromSlot(id) {
        const slot = this.getSlot(id);

        if (slot != null) {
            slot.block = null;
        }
    }

    checkIfAvailableToRefresh() {
        return this.data.currentSlots.filter(s => s.block).length == 0;
    }
}

class BlockSlot {
    constructor(blockManager, index) {
        this.uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
        this.blockManager = blockManager;
        this.index = index;
        this.block = this.pickBlock();;
        this.grid = 6;
        this.size = 0;
    }

    pickBlock() {
        const blockLists = this.blockManager.game.blockLists;

        return new Block(this.blockManager.game, blockLists[Math.floor(Math.random() * blockLists.length)], this.uuid);
    }

    draw(ctx) {
        const mainGridSize = this.blockManager.game.grid.gridSize;
        const containerHeight = mainGridSize * 0.4;
        const gridSize = mainGridSize / 3;
        const miniSize = gridSize / this.grid;
        const margin = 20;

        this.size = gridSize;

        const position = new Position(this.blockManager.position.y, (gridSize * this.index + margin));

        const yMargin = containerHeight / 2 - (gridSize / 2);

        this.position = new Position(position.y + yMargin, position.x);

        ctx.fillStyle = "transparent";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.1;
        
        ctx.fillRect( this.position.x, this.position.y , gridSize, gridSize);

        if (this.block != null) {
            this.block.drawToSlot(ctx,  miniSize, this);
        }
    }

    update() {}
}


class Square {
    constructor(grid, index) {
        this.grid = grid;
        this.index = index;
        this.position = new Position(0, 0);
        this.block = null;
        this.blockElement = null;
        this.blockIndex = new Position(0, 0);
        this.blockColor = null;
    }

    draw(ctx) {
        ctx.fillStyle = "#252F60";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.1;

        const xMargin = this.grid.position.x;
        const yMargin = this.grid.position.y;

        this.position.x = (this.index.x * this.grid.blockSize) + xMargin;
        this.position.y = (this.index.y * this.grid.blockSize) + yMargin;

        ctx.fillRect(this.position.x, this.position.y,  this.grid.blockSize, this.grid.blockSize);
        ctx.strokeRect(this.position.x, this.position.y,  this.grid.blockSize, this.grid.blockSize);
    }

    clear() {
        if (!this.blockElement) {
            return;
        }

        this.blockElement.info.structure[this.blockIndex.y][this.blockIndex.x] = 0;
        this.block = false;
        this.blockElement = null;
        this.blockIndex = new Position(0,0);
    }

    update() {}
}

class Block {
    constructor(game, info, slotID) {
        this.game = game;
        this.info = info;
        this.position = null;
        this.size = null;
        this.drawingToSlot = true;
        this.ctx = null;
        this.sticked = false;
        this.slotID = slotID;
    }


    drawToSlot(ctx, size, reference) {
        if (!this.drawingToSlot) return;

        this.ctx = ctx;
        
        let yMargin = reference.grid / 2 - this.info.structure.length / 2;
        let xMax = Math.max(...this.info.structure.map(i => i.length));
        let xMargin = reference.grid / 2 - xMax / 2;

        const img = this.game.blockManager.data.sprite;

        this.position = reference.position;
        this.size = {width: reference.size, height: reference.size, blockSize: size};

        for (let y = 0; y < this.info.structure.length ; y++) {
            for (let x = 0; x < this.info.structure[y].length ; x++) {
                if (this.info.structure[y][x] == 1) {
                    const position = new Position(this.position.y + ((y + yMargin) * size), this.position.x + ((x + xMargin) * size));

                    const imgSize = 75;
                    const xxM = 12;
                    const yyM = 13;
                    const i = this.info.color;

                    ctx.drawImage(img, (i * imgSize ) + xxM, yyM, imgSize, imgSize, position.x , position.y, size + 5, size + 5);
                }
            }
        }
    }

    getMax() {
        return new Position(this.info.structure.length, Math.max(...this.info.structure.map(i => i.length)));
    }

    draw(ctx, transparent) {
        const img = this.game.blockManager.data.sprite;
        const size = this.game.grid.blockSize;

        let xMax = Math.max(...this.info.structure.map(i => i.length));

        this.size = {width: xMax * size, height: size * this.info.structure.length, blockSize: size};
       
        if (transparent) {
            ctx.globalAlpha = 0.4;
        }

        for (let y = 0; y < this.info.structure.length ; y++) {
            for (let x = 0; x < this.info.structure[y].length ; x++) {
                if (this.info.structure[y][x] == 1) {
                    const position = new Position((this.position.y + (y  * size)) - (this.sticked ? 3 : 0), (this.position.x + (x * size)) - (this.sticked ? 3 : 0));

                    const imgSize = 75;
                    const xxM = 12;
                    const yyM = 13;
                    const i = this.info.color;

                    ctx.drawImage(img, (i * imgSize ) + xxM, yyM, imgSize, imgSize, position.x, position.y, size + (this.sticked ? 8 : 12), size +  (this.sticked ? 8 : 12));
                }
            }
        }

        if (transparent) {
            ctx.globalAlpha = 1;
        }
    }

    update() {}
}

class ScoreBoard {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.scoreGrid = [5, 10, 20, 30, 50, 60, 80, 100];
    }

    draw(ctx) {
        ctx.fillStyle = "#fff";
        ctx.font = "40px serif";
        ctx.fillText(this.score, 25, 60);
    }

    update() {}

    parseMoveScore(line) {
        const colors = line.map(sq => sq.blockColor);
        const scores = colors.map((color) => this.scoreGrid[color]);

        const finalScore = scores.reduce((a, b) => a + b);

        this.score += finalScore;

        console.log(finalScore);
    }
}

class Position {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }
}