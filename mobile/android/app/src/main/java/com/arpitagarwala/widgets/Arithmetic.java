package com.arpitagarwala.widgets;

final class Arithmetic {
    private final String expression;
    private int position;
    private Arithmetic(String value) { expression = value; }
    static String calculate(String value) {
        Arithmetic parser = new Arithmetic(value);
        double result = parser.sum();
        if (parser.position != value.length() || !Double.isFinite(result)) throw new IllegalArgumentException();
        return java.math.BigDecimal.valueOf(result).stripTrailingZeros().toPlainString();
    }
    private double sum() {
        double value = product();
        while (position < expression.length() && (expression.charAt(position) == '+' || expression.charAt(position) == '-')) {
            char op = expression.charAt(position++);
            double next = product();
            value = op == '+' ? value + next : value - next;
        }
        return value;
    }
    private double product() {
        double value = factor();
        while (position < expression.length() && (expression.charAt(position) == '*' || expression.charAt(position) == '/')) {
            char op = expression.charAt(position++);
            double next = factor();
            if (op == '/' && next == 0) throw new IllegalArgumentException();
            value = op == '*' ? value * next : value / next;
        }
        return value;
    }
    private double factor() {
        if (position >= expression.length()) throw new IllegalArgumentException();
        if (expression.charAt(position) == '-') { position++; return -factor(); }
        int start = position;
        while (position < expression.length() && (Character.isDigit(expression.charAt(position)) || expression.charAt(position) == '.')) position++;
        if (start == position) throw new IllegalArgumentException();
        return Double.parseDouble(expression.substring(start,position));
    }
}
