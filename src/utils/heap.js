export class MaxHeap {
  constructor(compareFn = (a, b) => a.count - b.count) {
    this.heap = [];
    this.compare = compareFn;
  }

  push(item) {
    this.heap.push(item);
    this._up(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._down(0);
    return top;
  }

  peek() {
    return this.heap[0] || null;
  }

  size() {
    return this.heap.length;
  }

  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.compare(this.heap[i], this.heap[p]) <= 0) break;
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  _down(i) {
    const n = this.heap.length;
    while (true) {
      let l = 2 * i + 1, r = 2 * i + 2, largest = i;
      if (l < n && this.compare(this.heap[l], this.heap[largest]) > 0) largest = l;
      if (r < n && this.compare(this.heap[r], this.heap[largest]) > 0) largest = r;
      if (largest === i) break;
      [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
      i = largest;
    }
  }

  toSortedArray(limit = 10) {
    const arr = [...this.heap];
    arr.sort((a, b) => this.compare(b, a));
    return arr.slice(0, limit);
  }
}