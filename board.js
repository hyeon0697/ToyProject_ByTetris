class Board {
  constructor(ctx, ctxNext) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.init();
  }

  init() {
    // Calculate size of canvas from constants.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    // Scale so we don't need to give size on every draw.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

    
    // 새 게임이 시작되면 보드를 초기화한다.
    reset() {
      this.grid = this.getEmptyBoard();
      this.piece = new Piece(this.ctx);
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
    
    // 0으로 채워진 행렬을 얻는다.
    getEmptyBoard() {
      return Array.from(
        {length: ROWS}, () => Array(COLS).fill(0)
      );
    }

    getNewPiece() {
      const { width, height } = this.ctxNext.canvas;
      this.next = new Piece(this.ctxNext);
      this.ctxNext.clearRect(0, 0, width, height);
      this.next.draw();
    }

    draw() {
      this.piece.draw();
      this.drawBoard();
    }

    //떨어지는것을 제어함. freeze함수가 호출되기 전까지 한칸씩 블럭을 내려보냄. 블럭이 가로막히면 else문의 프리즈와 클리어 라인함수가 작동함.

    drop() {
      let p = moves[KEY.DOWN](this.piece);
      if (this.valid(p)) {
        this.piece.move(p);
      } else {
        this.freeze();
        this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        this.piece = this.next;
        this.piece.ctx = this.ctx;
        this.piece.setStartingPosition();
        this.getNewPiece();
      }
      return true;
    }

    clearLines() {
      let lines = 0;
  
      this.grid.forEach((row, y) => {
        // If every value is greater than zero then we have a full row.
        if (row.every((value) => value > 0)) {
          lines++;
  
          // Remove the row.
          this.grid.splice(y, 1);
  
          // Add zero filled row at the top.
          this.grid.unshift(Array(COLS).fill(0));
        }
      });
  
      if (lines > 0) {
        // Calculate points from cleared lines and level.
  
        account.score += this.getLinesClearedPoints(lines);
        account.lines += lines;
  
        // If we have reached the lines for next level
        if (account.lines >= LINES_PER_LEVEL) {
          // Goto next level
          account.level++;
  
          // Remove lines so we start working for the next level
          account.lines -= LINES_PER_LEVEL;
  
          // Increase speed of game
          time.level = LEVEL[account.level];
        }
      }
    }

    freeze() {
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.grid[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
    }

    valid(p) {
      return p.shape.every((row, dy) => {
        return row.every((value, dx) => {
          let x = p.x + dx;
          let y = p.y + dy;
          return value === 0 || (this.isInsideWalls(x, y) && this.notOccupied(x, y));
        });
      });
    }

    drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = COLORS[value];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }

    // COL과 ROW의 길이보다 작을 때만 움직일 수 있도록 처리해놓음.
    // 레이싱게임과 같이 운ㄴ용하려면, Y축 올라가는것에 대한 예외처리도 해야할것.
    isInsideWalls(x, y) {
      return x >= 0 && x < COLS && y <= ROWS;
    }
    
    //비어있음을 감지하는 함수
    notOccupied(x, y) {
      return this.grid[y] && this.grid[y][x] === 0;
    }

    rotate(piece, direction) {
      // Clone with JSON for immutability.
      let p = JSON.parse(JSON.stringify(piece));
      if (!piece.hardDropped) {
        // Transpose matrix
        for (let y = 0; y < p.shape.length; ++y) {
          for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
          }
        }
        // Reverse the order of the columns.
        if (direction === ROTATION.RIGHT) {
          p.shape.forEach((row) => row.reverse());
        } else if (direction === ROTATION.LEFT) {
          p.shape.reverse();
        }
      }
  
      return p;
    }

    getLinesClearedPoints(lines, level) {
      const lineClearPoints =
        lines === 1
          ? POINTS.SINGLE
          : lines === 2
          ? POINTS.DOUBLE
          : lines === 3
          ? POINTS.TRIPLE
          : lines === 4
          ? POINTS.TETRIS
          : 0;
      return (account.level + 1) * lineClearPoints;
    }

  }