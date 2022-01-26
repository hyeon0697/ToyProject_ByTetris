class Board {
    grid;
    
    // 새 게임이 시작되면 보드를 초기화한다.
    reset() {
      this.grid = this.getEmptyBoard();
    }
    
    // 0으로 채워진 행렬을 얻는다.
    getEmptyBoard() {
      return Array.from(
        {length: ROWS}, () => Array(COLS).fill(0)
      );
    }

    valid(p) {
      return p.shape.every((row, dy) => {
        return row.every((value, dx) => {
          let x = p.x + dx;
          let y = p.y + dy;
          return ( this.isEmpty(value) || (this.insideWalls(x) && this.aboveFloor(y)) );
        });
      });
    }
  }