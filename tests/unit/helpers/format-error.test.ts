import { formatError } from '../../../src/helpers/format-error';

describe('formatError', () => {
  it('should format Error instances', () => {
    const error = new Error('Something went wrong');
    expect(formatError(error)).toBe('Error: Something went wrong');
  });

  it('should format string errors', () => {
    expect(formatError('A string error')).toBe('Error: A string error');
  });

  it('should format unknown error types', () => {
    const unknownError = { code: 500, message: 'Server error' };
    expect(formatError(unknownError)).toBe(
      'Unknown error: An unexpected error occurred'
    );
  });

  it('should handle null errors', () => {
    expect(formatError(null)).toBe('Unknown error: null');
  });

  it('should handle undefined errors', () => {
    expect(formatError(undefined)).toBe('Unknown error: undefined');
  });

  it('should handle number errors', () => {
    expect(formatError(404)).toBe('Unknown error: 404');
  });

  it('includes a direct Intuit trace ID without exposing the rest of the error object', () => {
    expect(formatError({ intuit_tid: 'tid-direct', sensitive: 'not included in suffix' }))
      .toBe('Unknown error: An unexpected error occurred [intuit_tid: tid-direct]');
  });

  it('finds an Intuit trace ID in nested response headers', () => {
    const error = Object.assign(new Error('Request failed'), {
      response: { headers: { 'intuit-tid': 'tid-header' } },
    });
    expect(formatError(error)).toBe('Error: Request failed [intuit_tid: tid-header]');
  });

  it('finds the underscore form of an Intuit trace ID in headers', () => {
    const error = Object.assign(new Error('Request failed'), {
      authResponse: { headers: { intuit_tid: 'tid-header-underscore' } },
    });
    expect(formatError(error)).toBe('Error: Request failed [intuit_tid: tid-header-underscore]');
  });

  it('ignores a blank Intuit trace ID in headers', () => {
    const error = Object.assign(new Error('Blank header'), {
      response: { headers: { intuit_tid: '   ' } },
    });
    expect(formatError(error)).toBe('Error: Blank header');
  });

  it('ignores blank trace IDs and safely handles cyclic causes', () => {
    const error = Object.assign(new Error('Cyclic'), { intuit_tid: '   ' }) as Error & { cause?: unknown };
    error.cause = error;
    expect(formatError(error)).toBe('Error: Cyclic');
  });
});
