export default function AppShell({ children }) {
  return (
    <div style={{ border: "3px solid #00bcd4", padding: 20 }}>
      <h2>AppShell loaded</h2>
      {children}
    </div>
  );
}
