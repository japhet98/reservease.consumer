const Greeter = (name: string) => `Hello ${name}`;

test('My Greeter', () => {
    expect(Greeter('Carl')).toBe('Hello Carl');
  });
