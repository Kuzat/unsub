import { calculateNextRenewal, formatDate, formatCurrency } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('calculateNextRenewal', () => {
    // Mock current date to ensure consistent test results
    const mockCurrentDate = new Date('2023-06-15');
    
    test('should return start date if it is in the future', () => {
      const startDate = '2023-07-01';
      const result = calculateNextRenewal(startDate, 'monthly', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-07-01');
    });

    test('should calculate next weekly renewal correctly', () => {
      const startDate = '2023-06-01';
      const result = calculateNextRenewal(startDate, 'weekly', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-06-22');
    });

    test('should calculate next monthly renewal correctly', () => {
      const startDate = '2023-05-10';
      const result = calculateNextRenewal(startDate, 'monthly', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-07-10');
    });

    test('should calculate next quarterly renewal correctly', () => {
      const startDate = '2023-03-15';
      const result = calculateNextRenewal(startDate, 'quarterly', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-06-15');
    });

    test('should calculate next biannually renewal correctly', () => {
      const startDate = '2023-01-15';
      const result = calculateNextRenewal(startDate, 'biannually', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-07-15');
    });

    test('should calculate next annual renewal correctly', () => {
      const startDate = '2022-06-15';
      const result = calculateNextRenewal(startDate, 'annually', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-06-15');
    });

    test('should default to monthly if billing cycle is not recognized', () => {
      const startDate = '2023-05-15';
      // @ts-ignore - Testing invalid input
      const result = calculateNextRenewal(startDate, 'invalid', mockCurrentDate);
      expect(result.toISOString().split('T')[0]).toBe('2023-06-15');
    });
  });

  describe('formatDate', () => {
    test('should format date correctly', () => {
      expect(formatDate('2023-06-15')).toBe('Jun 15, 2023');
    });
  });

  describe('formatCurrency', () => {
    test('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
  });
});