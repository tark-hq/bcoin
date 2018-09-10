/*!
 * blocktimestampindexer.js - outpoint indexer
 * Copyright (c) 2018, tark (MIT License).
 * https://github.com/tark-hq/bcoin
 */

'use strict';

const bdb = require('bdb');
const {BufferSet} = require('buffer-map');
const layout = require('./layout');
const Indexer = require('./indexer');

/*
 * BlockTimestampIndexer Database Layout:
 *  b[timestamp][blockHash] -> dummy (block by timestamp)
*/

Object.assign(layout, {
  b: bdb.key('b', ['uint32', 'hash256'])
});

/**
 * BlockTimestampIndexer
 * @alias module:indexer.BlockTimestampIndexer
 * @extends Indexer
 */

class BlockTimestampIndexer extends Indexer {
  /**
   * Create a indexer
   * @constructor
   * @param {Object} options
   */

  constructor(options) {
    super('blocktimestamp', options);

    this.db = bdb.create(this.options);
  }

  /**
   * Index blocks by timestamps.
   * @private
   * @param {ChainEntry} entry
   * @param {Block} block
   * @param {CoinView} view
   */

  async indexBlock(entry, block, view) {
    const b = this.db.batch();

    const blockHash = block.hash();
    const blockTimestamp = block.time;

    b.put(layout.b.encode(blockTimestamp, blockHash), null);

    return b.write();
  }

  /**
   * Remove blocks from index.
   * @private
   * @param {ChainEntry} entry
   * @param {Block} block
   * @param {CoinView} view
   */

  async unindexBlock(entry, block, view) {
    const b = this.db.batch();

    const blockHash = block.hash();
    const blockTimestamp = block.time;

    b.del(layout.b.encode(blockTimestamp, blockHash));

    return b.write();
  }

  /**
   * Retrieve blocks by timestamps.
   * @param startTimestamp {number}
   * @param endTimestamp {number}
   * @returns {Promise} - Returns {@link Hash}[].
   */

  async getBlockHashesByTimestamp(startTimestamp, endTimestamp) {
    const from = startTimestamp;
    const to = endTimestamp || startTimestamp;

    const set = new BufferSet();

    await this.db.keys({
      lte: layout.b.min(to),
      gte: layout.b.max(from),
      parse: (key) => {
        const [, blockHash] = layout.b.decode(key);
        set.add(blockHash);
      }
    });

    return set.toArray();
  }
}

module.exports = BlockTimestampIndexer;
