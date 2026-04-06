import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "swift")
                    .font(.system(size: 80))
                    .foregroundStyle(.orange)
                
                Text("Welcome to Your iOS App")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Built with Swift & SwiftUI")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                
                Button("Get Started") {
                    // Add your action here
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding()
            .navigationTitle("Home")
        }
    }
}

#Preview {
    ContentView()
}
