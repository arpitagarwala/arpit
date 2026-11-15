import SwiftUI

@main
struct ArpitApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                List {
                    Section {
                        Text("Your everyday essentials.").font(.largeTitle)
                        Text("Add Clock, Focus, Calculator or Tic Tac Toe from your home screen’s widget gallery. Native widgets save on this phone.")
                    }
                    Section("Your website") {
                        Link("Open the whole website", destination: URL(string: "https://arpitagarwala.com")!)
                        Link("Open synced web widgets", destination: URL(string: "https://arpitagarwala.com/widgets")!)
                    }
                    Section("Support") {
                        Link("Email support", destination: URL(string: "mailto:connect@arpitagarwala.com")!)
                        Link("arpitagarwala.com", destination: URL(string: "https://arpitagarwala.com")!)
                    }
                }.navigationTitle("Arpit Agarwala")
            }.tint(.mint)
        }
    }
}
