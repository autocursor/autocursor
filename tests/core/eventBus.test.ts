import { EventBus, EventType } from '../../src/core/eventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  test('should emit and receive events', (done) => {
    const payload = {
      timestamp: Date.now(),
      message: 'test',
    };

    eventBus.on(EventType.USER_MESSAGE, (received) => {
      expect(received).toEqual(payload);
      done();
    });

    eventBus.emit(EventType.USER_MESSAGE, payload);
  });

  test('should store event history', () => {
    const payload = {
      timestamp: Date.now(),
      message: 'test',
    };

    eventBus.emit(EventType.USER_MESSAGE, payload);

    const history = eventBus.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].event).toBe(EventType.USER_MESSAGE);
  });

  test('should handle once listeners', (done) => {
    let callCount = 0;

    eventBus.once(EventType.USER_MESSAGE, () => {
      callCount++;
    });

    eventBus.emit(EventType.USER_MESSAGE, { timestamp: Date.now() });
    eventBus.emit(EventType.USER_MESSAGE, { timestamp: Date.now() });

    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 100);
  });
});

