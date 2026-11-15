import SwiftUI
import WidgetKit
import AppIntents

struct Entry: TimelineEntry {
    let date: Date
    let deadline: Double
    let remaining: Double
    let board: [String]
    let winner: String
    let turn: String
    let calculation: String
}
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry { snapshot() }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) { completion(snapshot()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let now = Date()
        let nextMinute = Date(timeIntervalSince1970: floor(now.timeIntervalSince1970 / 60) * 60 + 60)
        var entries = [snapshot(at: now)]
        for minute in 0..<60 {
            entries.append(snapshot(at: nextMinute.addingTimeInterval(Double(minute) * 60)))
        }
        let deadline = WidgetState.deadline
        if deadline > now.timeIntervalSince1970 && deadline < nextMinute.addingTimeInterval(3600).timeIntervalSince1970 {
            entries.append(snapshot(at: Date(timeIntervalSince1970: deadline)))
            entries.sort { $0.date < $1.date }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
    private func snapshot(at date: Date = Date()) -> Entry {
        let deadline = WidgetState.deadline
        return Entry(date: date, deadline: deadline, remaining: deadline > 0 ? max(0, deadline - date.timeIntervalSince1970) : WidgetState.remaining,
              board: WidgetState.board, winner: WidgetState.winner,
              turn: WidgetState.store.string(forKey: "turn") ?? "X",
              calculation: WidgetState.store.string(forKey: "calculation") ?? "")
    }
}
struct ClockView: View {
    let entry: Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("CLOCK", systemImage: "clock").font(.caption)
            Text(entry.date, style: .time).font(.system(size: 34, weight: .medium)).minimumScaleFactor(0.6)
            Text(entry.date, format: .dateTime.weekday(.wide).month().day()).font(.caption)
        }.foregroundStyle(.white).containerBackground(Color(red:0.07,green:0.16,blue:0.12), for: .widget)
    }
}
struct FocusView: View {
    let entry: Entry
    var body: some View {
        VStack(spacing: 12) {
            Text("FOCUS · ON THIS PHONE").font(.caption2)
            if entry.deadline > entry.date.timeIntervalSince1970 {
                Text(timerInterval: entry.date...Date(timeIntervalSince1970: entry.deadline), countsDown: true)
                    .font(.system(size: 38, weight: .medium)).monospacedDigit()
            } else {
                Text(String(format: "%02d:%02d", Int(entry.remaining)/60, Int(entry.remaining)%60))
                    .font(.system(size: 38, weight: .medium)).monospacedDigit()
            }
            HStack {
                Button(entry.deadline > entry.date.timeIntervalSince1970 ? "Pause" : "Start", intent: ToggleFocus())
                Button("Reset", intent: ResetFocus())
            }.buttonStyle(.bordered)
        }.foregroundStyle(.white).tint(.mint).containerBackground(Color(red:0.1,green:0.14,blue:0.21), for: .widget)
    }
}
struct GameView: View {
    let entry: Entry
    var body: some View {
        VStack(spacing: 5) {
            Text(entry.winner.isEmpty ? entry.turn + " to play" : entry.winner == "Draw" ? "A thoughtful draw." : entry.winner + " wins").font(.caption)
            ForEach(0..<3, id: \.self) { row in
                HStack {
                    ForEach(0..<3, id: \.self) { col in
                        let index = row*3+col
                        Button(intent: PlaySquare(index)) {
                            Text(entry.board[index].isEmpty ? " " : entry.board[index]).font(.title2).frame(maxWidth:.infinity,maxHeight:.infinity)
                        }.disabled(!entry.board[index].isEmpty || !entry.winner.isEmpty)
                         .accessibilityLabel("Square " + String(index+1) + " " + (entry.board[index].isEmpty ? "empty" : entry.board[index]))
                    }
                }
            }
            Button("New round", intent: NewRound()).font(.caption)
        }.buttonStyle(.bordered).tint(.mint).foregroundStyle(.white)
         .containerBackground(Color(red:0.07,green:0.16,blue:0.12), for: .widget)
    }
}
struct CalculatorView: View {
    let entry: Entry
    let keys = [["7","8","9","/"],["4","5","6","*"],["1","2","3","-"],["0",".","C","+"]]
    var body: some View {
        VStack(spacing:4) {
            Text("CALCULATOR").font(.caption2)
            Text(entry.calculation.isEmpty ? "0" : entry.calculation).font(.title2).lineLimit(1).minimumScaleFactor(0.5).frame(maxWidth:.infinity,alignment:.trailing)
            ForEach(keys, id:\.self) { row in
                HStack(spacing:4) {
                    ForEach(row,id:\.self) { key in
                        Button(intent:CalculatorKey(key)) { Text(key).frame(maxWidth:.infinity,maxHeight:.infinity) }
                    }
                }
            }
            Button("=",intent:CalculatorKey("=")).frame(maxWidth:.infinity)
        }.buttonStyle(.bordered).tint(.mint).foregroundStyle(.white)
         .containerBackground(Color(red:0.07,green:0.16,blue:0.12), for: .widget)
    }
}
struct Clock: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind:"arpit-clock",provider:Provider()) { ClockView(entry:$0) }
            .configurationDisplayName("Clock").description("Your local time and date.").supportedFamilies([.systemSmall,.systemMedium])
    }
}
struct Focus: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind:"arpit-focus",provider:Provider()) { FocusView(entry:$0) }
            .configurationDisplayName("Focus timer").description("An offline timer on this phone.").supportedFamilies([.systemSmall,.systemMedium])
    }
}
struct Calculator: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind:"arpit-calculator",provider:Provider()) { CalculatorView(entry:$0) }
            .configurationDisplayName("Calculator").description("Calculate on your home screen.").supportedFamilies([.systemLarge])
    }
}
struct Game: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind:"arpit-game",provider:Provider()) { GameView(entry:$0) }
            .configurationDisplayName("Tic Tac Toe").description("Pass and play a short game.").supportedFamilies([.systemLarge])
    }
}
@main
struct ArpitWidgetBundle: WidgetBundle {
    var body: some Widget { Clock(); Focus(); Calculator(); Game() }
}
