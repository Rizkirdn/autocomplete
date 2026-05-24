class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = null;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, data) {
    let node = this.root;
    for (let char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.data = data;
  }

  search(prefix) {
    let node = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this._collect(node);
  }

  _collect(node, results = []) {
    if (results.length >= 15) return results;
    if (node.isEndOfWord && node.data) results.push(node.data);
    for (let char in node.children) this._collect(node.children[char], results);
    return results;
  }

  delete(word) {
    this._deleteHelper(this.root, word.toLowerCase(), 0);
  }

  _deleteHelper(node, word, index) {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      node.data = null;
      return Object.keys(node.children).length === 0;
    }
    let char = word[index];
    let child = node.children[char];
    if (!child) return false;
    let shouldDelete = this._deleteHelper(child, word, index + 1);
    if (shouldDelete) {
      delete node.children[char];
      return Object.keys(node.children).length === 0 && !node.isEndOfWord;
    }
    return false;
  }

  getAll() {
    return this._collect(this.root);
  }
}