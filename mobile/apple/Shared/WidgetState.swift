import Foundation
import WidgetKit
import AppIntents

enum WidgetState {
    static let store = UserDefaults(suiteName: "group.com.arpitagarwala.widgets")!
    static var deadline: Double { store.double(forKey: "deadline") }
    static var remaining: Double {
        if deadline > 0 { return max(0, deadline - Date().timeIntervalSince1970) }
        return store.object(forKey: "remaining") as? Double ?? 1500
    }
    static func refresh() { WidgetCenter.shared.reloadAllTimelines() }
    static var board: [String] { store.stringArray(forKey: "board") ?? Array(repeating: "", count: 9) }
    static var winner: String {
        let cells = board
        for line in [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] {
            if !cells[line[0]].isEmpty && cells[line[0]] == cells[line[1]] && cells[line[0]] == cells[line[2]] { return cells[line[0]] }
        }
        return cells.allSatisfy { !$0.isEmpty } ? "Draw" : ""
    }
}

struct ToggleFocus: AppIntent {
    static var title: LocalizedStringResource = "Start or pause focus"
    func perform() async throws -> some IntentResult {
        let remaining = WidgetState.remaining
        if WidgetState.deadline > Date().timeIntervalSince1970 {
            WidgetState.store.set(remaining, forKey: "remaining")
            WidgetState.store.set(0.0, forKey: "deadline")
        } else {
            WidgetState.store.set(Date().timeIntervalSince1970 + (remaining > 0 ? remaining : 1500), forKey: "deadline")
        }
        WidgetState.refresh()
        return .result()
    }
}
struct ResetFocus: AppIntent {
    static var title: LocalizedStringResource = "Reset focus"
    func perform() async throws -> some IntentResult {
        WidgetState.store.set(1500.0, forKey: "remaining")
        WidgetState.store.set(0.0, forKey: "deadline")
        WidgetState.refresh()
        return .result()
    }
}
struct PlaySquare: AppIntent {
    static var title: LocalizedStringResource = "Play a square"
    @Parameter(title: "Square") var index: Int
    init() {}
    init(_ index: Int) { self.index = index }
    func perform() async throws -> some IntentResult {
        var board = WidgetState.board
        guard (0..<9).contains(index), board[index].isEmpty, WidgetState.winner.isEmpty else { return .result() }
        let turn = WidgetState.store.string(forKey: "turn") ?? "X"
        board[index] = turn
        WidgetState.store.set(board, forKey: "board")
        WidgetState.store.set(turn == "X" ? "O" : "X", forKey: "turn")
        WidgetState.refresh()
        return .result()
    }
}
struct NewRound: AppIntent {
    static var title: LocalizedStringResource = "Start a new round"
    func perform() async throws -> some IntentResult {
        WidgetState.store.set(Array(repeating: "", count: 9), forKey: "board")
        WidgetState.store.set("X", forKey: "turn")
        WidgetState.refresh()
        return .result()
    }
}
struct CalculatorKey: AppIntent {
    static var title: LocalizedStringResource = "Calculator key"
    @Parameter(title: "Key") var key: String
    init() {}
    init(_ key: String) { self.key = key }
    func perform() async throws -> some IntentResult {
        var expression = WidgetState.store.string(forKey: "calculation") ?? ""
        if key == "C" { expression = "" }
        else if key == "=" {
            expression = Arithmetic.evaluate(expression) ?? "Error"
        } else if key.count == 1 && "0123456789.+-*/".contains(key) {
            if expression == "Error" { expression = "" }
            if expression.count < 60 { expression += key }
        }
        WidgetState.store.set(expression, forKey: "calculation")
        WidgetState.refresh()
        return .result()
    }
}
enum Arithmetic {
    static func evaluate(_ expression: String) -> String? {
        // Scan the keypad's numeric operands and apply multiplication before addition.
        var numbers: [Double] = []
        var operators: [Character] = []
        let chars = Array(expression)
        var token = ""
        var expectingNumber = true
        for char in chars {
            if char.isNumber || char == "." || char == "-" && expectingNumber && token.isEmpty {
                token.append(char)
                expectingNumber = false
            } else if "+-*/".contains(char) {
                guard let number = Double(token) else { return nil }
                numbers.append(number); operators.append(char); token = ""; expectingNumber = true
            } else { return nil }
        }
        guard let last = Double(token) else { return nil }
        numbers.append(last)
        var index = 0
        while index < operators.count {
            let op = operators[index]
            if op == "*" || op == "/" {
                if op == "/" && numbers[index + 1] == 0 { return nil }
                numbers[index] = op == "*" ? numbers[index] * numbers[index + 1] : numbers[index] / numbers[index + 1]
                numbers.remove(at: index + 1); operators.remove(at: index)
            } else { index += 1 }
        }
        guard var value = numbers.first else { return nil }
        for (index, op) in operators.enumerated() { value = op == "+" ? value + numbers[index + 1] : value - numbers[index + 1] }
        return value.isFinite ? String(format: "%.12g", value) : nil
    }
}
