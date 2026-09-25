"""A simple command-line calculator."""

import operator

OPERATIONS = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
    "%": operator.mod,
    "**": operator.pow,
}


def calculate(a, op, b):
    """Apply operator `op` to numbers `a` and `b`."""
    if op not in OPERATIONS:
        raise ValueError(f"Unsupported operator: {op}")
    if op in ("/", "%") and b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return OPERATIONS[op](a, b)


def read_number(prompt):
    """Prompt until a number is entered; return None if the user types 'q'."""
    while True:
        text = input(prompt).strip()
        if text.lower() == "q":
            return None
        try:
            return float(text)
        except ValueError:
            print("Please enter a valid number.")


def main():
    print("Simple Calculator")
    print(f"Operators: {' '.join(OPERATIONS)}  (type 'q' to quit)")
    while True:
        a = read_number("First number: ")
        if a is None:
            break
        op = input("Operator: ").strip()
        if op.lower() == "q":
            break
        b = read_number("Second number: ")
        if b is None:
            break
        try:
            result = calculate(a, op, b)
        except (ValueError, ZeroDivisionError) as e:
            print(f"Error: {e}")
            continue
        print(f"Result: {a:g} {op} {b:g} = {result:g}\n")
    print("Goodbye!")


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!")
