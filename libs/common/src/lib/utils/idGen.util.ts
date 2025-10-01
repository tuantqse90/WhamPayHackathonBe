// Constants for Snowflake ID generation
const EPOCH = 1288834974657; // Twitter's epoch (2010-11-04 01:42:54.657)
const WORKER_ID_BITS = 10;
const SEQUENCE_BITS = 12;

// Maximum values
const MAX_WORKER_ID = -1 ^ (-1 << WORKER_ID_BITS);
const MAX_SEQUENCE = -1 ^ (-1 << SEQUENCE_BITS);

// Bit shifts
const WORKER_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

export class SnowflakeIdGenerator {
  private sequence = 0;
  private lastTimestamp = -1;
  private workerId: number;

  constructor(workerId: number) {
    if (workerId < 0 || workerId > MAX_WORKER_ID) {
      throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
    }
    this.workerId = workerId;
  }

  private getTimestamp(): number {
    return Date.now();
  }

  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.getTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getTimestamp();
    }
    return timestamp;
  }

  /**
   * Generate a unique ID
   * @returns The unique ID
   * @example
   * const id = generateId();
   */
  public generateId(): string {
    let timestamp = this.getTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate ID');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & MAX_SEQUENCE;
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - EPOCH) << TIMESTAMP_SHIFT) |
      (this.workerId << WORKER_ID_SHIFT) |
      this.sequence;

    return id.toString();
  }
}

// Create a default instance with worker ID 1
const defaultGenerator = new SnowflakeIdGenerator(1);

// Export a simple function that uses the default generator
export const generateId = (): string => {
  return defaultGenerator.generateId();
};
