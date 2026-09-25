import { describe, expect, it } from 'vitest';
import { eventEnd, pickUpcoming } from './events';

const at = (iso: string) => new Date(iso);

describe('eventEnd', () => {
  it('uses the printed end time', () => {
    expect(
      eventEnd({ startISO: '2026-08-29T15:00:00-03:00', endISO: '2026-08-29T19:00:00-03:00' }),
    ).toEqual(at('2026-08-29T19:00:00-03:00'));
  });

  it('falls back to the end of the local day when the flyer gives only a start', () => {
    expect(eventEnd({ startISO: '2026-09-24T20:00:00-03:00' })).toEqual(
      at('2026-09-24T23:59:59-03:00'),
    );
  });
});

describe('pickUpcoming', () => {
  const later = { id: 'later', startISO: '2026-11-10T19:00:00-03:00' };
  const sooner = { id: 'sooner', startISO: '2026-10-05T19:00:00-03:00' };
  const past = {
    id: 'past',
    startISO: '2026-08-29T15:00:00-03:00',
    endISO: '2026-08-29T19:00:00-03:00',
  };

  it('picks the soonest future event even when the data lists newest first', () => {
    expect(pickUpcoming([later, sooner, past], at('2026-09-25T12:00:00-03:00'))?.id).toBe('sooner');
  });

  it('keeps an event that is under way', () => {
    expect(pickUpcoming([past], at('2026-08-29T17:00:00-03:00'))?.id).toBe('past');
  });

  it('keeps a start-only event until its day is over', () => {
    const tonight = { id: 'tonight', startISO: '2026-09-24T20:00:00-03:00' };
    expect(pickUpcoming([tonight], at('2026-09-24T23:30:00-03:00'))?.id).toBe('tonight');
    expect(pickUpcoming([tonight], at('2026-09-25T00:30:00-03:00'))).toBeNull();
  });

  it('returns null when everything has passed', () => {
    expect(pickUpcoming([past], at('2026-09-25T12:00:00-03:00'))).toBeNull();
  });
});
