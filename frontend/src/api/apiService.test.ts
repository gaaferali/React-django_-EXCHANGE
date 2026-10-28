import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStore } from './apiService';

describe('tokenStore', () => {
  beforeEach(() => sessionStorage.clear());

  it('keeps JWTs in tab-scoped session storage and clears both tokens', () => {
    tokenStore.set('access-token', 'refresh-token');
    expect(tokenStore.access()).toBe('access-token');
    expect(tokenStore.refresh()).toBe('refresh-token');
    expect(localStorage.length).toBe(0);
    tokenStore.clear();
    expect(tokenStore.access()).toBeNull();
    expect(tokenStore.refresh()).toBeNull();
  });
});
