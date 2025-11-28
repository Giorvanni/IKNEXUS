import '@testing-library/jest-dom';
import React from 'react';
// Basic mock for next/link to simplify component rendering in Jest without JSX parsing issues
jest.mock('next/link', () => {
	function MockNextLink({ children, href, ...rest }: any) {
		const safeHref = typeof href === 'string' ? href : '#';
		return React.createElement('a', { href: safeHref, ...rest }, children);
	}
	return MockNextLink;
});

// Quiet noisy NextAuth JWT decryption logs during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
	try {
		const first = args[0];
		if (typeof first === 'string' && first.includes('[next-auth][error][JWT_SESSION_ERROR]')) {
			return; // suppress specific noisy error in tests
		}
	} catch {}
	return (originalConsoleError as any).apply(console, args as any);
};
