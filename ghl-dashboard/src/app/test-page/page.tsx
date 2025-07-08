export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the app is running.</p>
      <p>Build time: {new Date().toISOString()}</p>
    </div>
  );
}